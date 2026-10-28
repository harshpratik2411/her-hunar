import { memo } from 'react';

/**
 * Renders a single extracted slide. Shape coordinates are in points, and the
 * stage is exactly `meta.width × meta.height` points, so 1 point === 1 CSS px
 * inside the stage. The parent scales the whole stage to fit its container,
 * which keeps the deck pixel-consistent at every screen size.
 */

const ALIGN = { l: 'left', ctr: 'center', r: 'right', just: 'justify' };

const JUSTIFY = { ctr: 'center', t: 'flex-start', b: 'flex-end' };

function shapeBoxStyle(shape) {
  const style = {
    left: `${shape.x}px`,
    top: `${shape.y}px`,
    width: `${shape.w}px`,
    height: `${shape.h}px`,
  };

  if (shape.geometry === 'ellipse') style.borderRadius = '50%';
  else if (shape.geometry === 'roundRect') style.borderRadius = `${Math.min(shape.w, shape.h) * 0.16667}px`;

  if (shape.fill) style.background = shape.fill;
  if (shape.outline) style.border = `${shape.outline.width}px solid ${shape.outline.color}`;
  return style;
}

function Connector({ shape }) {
  const stroke = shape.outline?.color ?? '#CBD5E1';
  const strokeWidth = shape.outline?.width ?? 1.25;

  let x1 = shape.flipH ? shape.w : 0;
  let y1 = 0;
  let x2 = shape.flipH ? 0 : shape.w;
  let y2 = shape.h;
  if (shape.flipV) [y1, y2] = [y2, y1];

  return (
    <svg
      className="slide-shape"
      style={shapeBoxStyle(shape)}
      width={shape.w}
      height={shape.h}
      viewBox={`0 0 ${Math.max(shape.w, 1)} ${Math.max(shape.h, 1)}`}
      aria-hidden="true"
    >
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

function TextBlock({ shape }) {
  return (
    <div
      className="slide-shape__text"
      style={{
        justifyContent: JUSTIFY[shape.anchor] ?? 'flex-start',
        paddingTop: shape.insets?.t ?? 0,
        paddingRight: shape.insets?.r ?? 0,
        paddingBottom: shape.insets?.b ?? 0,
        paddingLeft: shape.insets?.l ?? 0,
      }}
    >
      {shape.paragraphs.map((paragraph, paragraphIndex) => (
        <p
          key={paragraphIndex}
          style={{
            textAlign: ALIGN[paragraph.align] ?? 'left',
            marginBottom: paragraph.spaceAfter ? `${paragraph.spaceAfter}px` : 0,
            lineHeight: paragraph.lineHeight ?? 1.2,
            fontSize: `${paragraph.size ?? paragraph.runs?.[0]?.size ?? 18}px`,
            minHeight: paragraph.empty ? `${(paragraph.size ?? 18) * 1.2}px` : undefined,
          }}
        >
          {(paragraph.runs ?? []).map((run, runIndex) => (
            <span
              key={runIndex}
              style={{
                fontSize: `${run.size}px`,
                fontWeight: run.bold ? 700 : 400,
                fontStyle: run.italic ? 'italic' : 'normal',
                color: run.color,
                whiteSpace: 'pre-wrap',
              }}
            >
              {run.text}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function SlideRenderer({ slide }) {
  return (
    <div className="slide-stage absolute inset-0 bg-white" aria-label={`Slide ${slide.n}: ${slide.title}`}>
      {slide.shapes.map((shape, index) => {
        if (shape.w <= 0 || shape.h <= 0) return null;
        if (shape.connector) return <Connector key={index} shape={shape} />;
        const hasText = shape.paragraphs?.length > 0;
        return (
          <div key={index} className="slide-shape" style={shapeBoxStyle(shape)}>
            {hasText && <TextBlock shape={shape} />}
          </div>
        );
      })}
    </div>
  );
}

export default memo(SlideRenderer);
