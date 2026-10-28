#!/usr/bin/env node
/**
 * extract-slides.mjs
 * -------------------------------------------------------------------------
 * Converts a PowerPoint deck (.pptx) into `src/data/slides.json`, which the
 * React slide viewer renders inside the homepage presentation section.
 *
 * Why a converter instead of a runtime renderer?
 *   Browsers cannot open .pptx natively. Rather than shipping a heavy runtime
 *   renderer, this script reads the deck once at build time and emits plain
 *   shape data (position/size in points + text + colours). The viewer then
 *   draws it with normal DOM + CSS, which is small, fast and easy to style.
 *
 * Zero dependencies: the OOXML package is a ZIP archive, so we read it with
 * node:zlib and parse the DrawingML XML with small regex helpers.
 *
 * Usage
 *   npm run slides                              # reads public/herhunar.pptx
 *   node scripts/extract-slides.mjs deck.pptx   # or pass your own file
 * -------------------------------------------------------------------------
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const EMU_PER_POINT = 12700;
const DEFAULT_FONT = 'Aptos';
const DEFAULT_TEXT_COLOR = '#1C1836';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = resolve(process.argv[2] ?? resolve(root, 'public/herhunar.pptx'));
const outputPath = resolve(root, 'src/data/slides.json');

/* ------------------------------------------------------------------ ZIP -- */

function readZip(buffer) {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Not a ZIP archive (no end-of-central-directory record).');

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let cursor = buffer.readUInt32LE(eocd + 16);
  const files = new Map();

  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error('Corrupt ZIP central directory.');
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString('utf8', cursor + 46, cursor + 46 + nameLength);

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);

    files.set(name, method === 0 ? raw : inflateRawSync(raw));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

/* --------------------------------------------------------------- helpers -- */

const pt = (emu) => Math.round((Number(emu) / EMU_PER_POINT) * 100) / 100;

const attr = (xml, name) => {
  const m = xml.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
};

const block = (xml, tagName) => {
  const m = xml.match(new RegExp(`<${tagName}[\\s>][\\s\\S]*?<\\/${tagName}>`));
  return m ? m[0] : null;
};

const decodeEntities = (text) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&');

/** Pull size/bold/italic/colour/font out of an <a:defRPr> or <a:rPr> block. */
function parseRunProps(xml) {
  if (!xml) return {};
  const props = {};
  const size = attr(xml, 'sz');
  if (size) props.size = Number(size) / 100;
  const bold = attr(xml, 'b');
  if (bold !== null) props.bold = bold === '1';
  const italic = attr(xml, 'i');
  if (italic !== null) props.italic = italic === '1';
  const fill = xml.match(/<a:solidFill>\s*<a:srgbClr val="([0-9A-Fa-f]{6})"/);
  if (fill) props.color = `#${fill[1].toUpperCase()}`;
  const font = xml.match(/<a:latin typeface="([^"]*)"/);
  if (font && font[1].trim()) props.font = font[1].trim();
  return props;
}

/* ----------------------------------------------------------------- shapes -- */

/** Shape fill: an explicit solid colour, or null for transparent. */
function parseFill(spPr) {
  const withoutOutline = spPr.replace(/<a:ln[\s>][\s\S]*?<\/a:ln>/g, '').replace(/<a:ln\/>/g, '');
  const solid = withoutOutline.match(/<a:solidFill>\s*<a:srgbClr val="([0-9A-Fa-f]{6})"/);
  return solid ? `#${solid[1].toUpperCase()}` : null;
}

/** Outline: colour + width (in points) or null when there is no visible line. */
function parseOutline(spPr) {
  const line = spPr.match(/<a:ln[\s>][\s\S]*?<\/a:ln>/);
  if (!line) return null;
  if (/<a:noFill\s*\/>/.test(line[0])) return null;
  const color = line[0].match(/<a:solidFill>\s*<a:srgbClr val="([0-9A-Fa-f]{6})"/);
  if (!color) return null;
  const width = attr(line[0], 'w');
  return {
    color: `#${color[1].toUpperCase()}`,
    width: width ? pt(width) : 1,
  };
}

function parseParagraphs(txBody) {
  const paragraphs = [];
  const rawParagraphs = txBody.match(/<a:p>[\s\S]*?<\/a:p>/g) ?? [];

  for (const raw of rawParagraphs) {
    const pPr = block(raw, 'a:pPr') ?? '';
    const pPrProps = parseRunProps(block(pPr, 'a:defRPr') ?? '');
    const spaceAfter = pPr.match(/<a:spcAft>\s*<a:spcPts val="(\d+)"/);
    const lineSpacing = pPr.match(/<a:lnSpc>\s*<a:spcPct val="(\d+)"/);

    const runs = [];
    const runMatches = raw.match(/<a:(?:r|fld)>[\s\S]*?<\/a:(?:r|fld)>/g) ?? [];
    for (const run of runMatches) {
      const textMatch = run.match(/<a:t>([\s\S]*?)<\/a:t>/);
      if (!textMatch) continue;
      const overrides = parseRunProps(block(run, 'a:rPr'));
      runs.push({
        text: decodeEntities(textMatch[1]),
        size: overrides.size ?? pPrProps.size ?? 18,
        bold: overrides.bold ?? pPrProps.bold ?? false,
        italic: overrides.italic ?? pPrProps.italic ?? false,
        color: overrides.color ?? pPrProps.color ?? DEFAULT_TEXT_COLOR,
        font: overrides.font ?? pPrProps.font ?? DEFAULT_FONT,
      });
    }

    // Empty paragraphs are meaningful: they hold vertical spacing.
    if (!runs.length && !/<a:t>/.test(raw)) {
      paragraphs.push({ align: attr(pPr, 'algn') ?? 'l', spaceAfter: spaceAfter ? Number(spaceAfter[1]) / 100 : 0, size: pPrProps.size ?? 18, empty: true });
      continue;
    }
    if (!runs.length) continue;

    paragraphs.push({
      align: attr(pPr, 'algn') ?? 'l',
      spaceAfter: spaceAfter ? Number(spaceAfter[1]) / 100 : 0,
      lineHeight: lineSpacing ? Number(lineSpacing[1]) / 100000 : 1.2,
      runs,
    });
  }
  return paragraphs;
}

function parseShape(shapeXml, isConnector) {
  const spPr = block(shapeXml, 'p:spPr') ?? '';
  const xfrm = block(spPr, 'a:xfrm') ?? '';
  const off = xfrm.match(/<a:off x="(-?\d+)" y="(-?\d+)"/);
  const ext = xfrm.match(/<a:ext cx="(\d+)" cy="(\d+)"/);
  if (!off || !ext) return null;

  const geometry = attr(spPr, 'prst') ?? (spPr.match(/prstGeom prst="([^"]+)"/)?.[1] ?? 'rect');
  const bodyPr = block(shapeXml, 'a:bodyPr') ?? '';
  const txBody = block(shapeXml, 'p:txBody');
  const insets = {
    l: bodyPr.includes('lIns') ? pt(attr(bodyPr, 'lIns')) : pt(91440),
    t: bodyPr.includes('tIns') ? pt(attr(bodyPr, 'tIns')) : pt(45720),
    r: bodyPr.includes('rIns') ? pt(attr(bodyPr, 'rIns')) : pt(91440),
    b: bodyPr.includes('bIns') ? pt(attr(bodyPr, 'bIns')) : pt(45720),
  };

  return {
    name: attr(shapeXml, 'name') ?? '',
    geometry,
    connector: Boolean(isConnector),
    flipH: attr(xfrm, 'flipH') === '1',
    flipV: attr(xfrm, 'flipV') === '1',
    x: pt(off[1]),
    y: pt(off[2]),
    w: pt(ext[1]),
    h: pt(ext[2]),
    fill: isConnector ? null : parseFill(spPr),
    outline: parseOutline(spPr),
    anchor: attr(bodyPr, 'anchor') ?? 't',
    insets,
    paragraphs: txBody ? parseParagraphs(txBody) : [],
  };
}

/* ------------------------------------------------------------------ main -- */

function main() {
  if (!existsSync(inputPath)) {
    console.error(`\n[slides] Deck not found: ${inputPath}`);
    console.error('[slides] Put your .pptx in public/ (e.g. public/herhunar.pptx) and re-run: npm run slides\n');
    process.exit(1);
  }

  const zip = readZip(readFileSync(inputPath));

  const presentation = zip.get('ppt/presentation.xml')?.toString('utf8') ?? '';
  const rels = zip.get('ppt/_rels/presentation.xml.rels')?.toString('utf8') ?? '';
  const relMap = new Map(
    [...rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((m) => [m[1], m[2]]),
  );

  // Display order comes from sldIdLst, which is not always slide1.xml → slideN.xml.
  const orderedTargets = [...presentation.matchAll(/<p:sldId id="\d+" r:id="([^"]+)"\/>/g)]
    .map((m) => relMap.get(m[1]))
    .filter(Boolean);

  const slides = orderedTargets.map((target, index) => {
    const file = zip.get(`ppt/${target.replace(/^\/?ppt\//, '')}`);
    const xml = file ? file.toString('utf8') : '';
    const shapes = [];
    const shapeMatches = xml.match(/<p:(?:sp|cxnSp)>[\s\S]*?<\/p:(?:sp|cxnSp)>/g) ?? [];
    for (const shapeXml of shapeMatches) {
      const shape = parseShape(shapeXml, shapeXml.startsWith('<p:cxnSp'));
      if (shape) shapes.push(shape);
    }
    const title = shapes
      .flatMap((s) => s.paragraphs.flatMap((p) => (p.runs ?? []).map((r) => r.text)))
      .find((text) => text && text.trim().length > 2);
    return { n: index + 1, title: title ?? `Slide ${index + 1}`, shapes };
  });

  const slideSize = presentation.match(/<p:sldSz cx="(\d+)" cy="(\d+)"/);
  const width = slideSize ? pt(slideSize[1]) : 960;
  const height = slideSize ? pt(slideSize[2]) : 540;

  const payload = {
    meta: {
      source: basename(inputPath),
      width,
      height,
      count: slides.length,
      generatedFrom: 'scripts/extract-slides.mjs',
    },
    slides,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 1)}\n`);

  const shapeCount = slides.reduce((total, slide) => total + slide.shapes.length, 0);
  console.log(`[slides] ${slides.length} slides, ${shapeCount} shapes → ${outputPath}`);
  console.log(`[slides] canvas ${width} × ${height} pt (${(width / height).toFixed(3)} aspect)`);
}

main();
