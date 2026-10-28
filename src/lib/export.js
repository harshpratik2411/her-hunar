/**
 * Markdown export — turns a stored profile into a plain .md file that can be
 * shared over email, dropped into a college report, or kept as a backup.
 * Everything is generated locally in the browser; nothing is uploaded.
 */

import { downloadFile, formatDate, slugify, publicProfilePath } from './utils.js';

const link = (label, url) => `- [${label || url}](${url})`;

const bulletList = (items = [], fallback = '_Not provided_') =>
  items.length ? items.map((item) => `- ${item}`).join('\n') : fallback;

const joinUrl = (path) => (typeof window === 'undefined' ? path : `${window.location.origin}${path}`);

export function talentToMarkdown(talent) {
  const lines = [
    `# ${talent.name}`,
    '',
    `**${talent.headline || talent.occupation || 'Skilled professional'}**`,
    '',
    '## Quick facts',
    '',
    `| Field | Details |`,
    `| --- | --- |`,
    `| Profile ID | \`${talent.id}\` |`,
    `| Age | ${talent.age ?? '—'} |`,
    `| Occupation | ${talent.occupation || '—'} |`,
    `| Skill category | ${talent.category || '—'} |`,
    `| Experience | ${talent.experienceLevel || '—'} |`,
    `| Location | ${talent.location || '—'} |`,
    `| Availability | ${talent.availability || '—'} |`,
    `| Languages | ${(talent.languages ?? []).join(', ') || '—'} |`,
    `| Public profile | ${joinUrl(publicProfilePath(talent))} |`,
    '',
    '## Skills',
    '',
    bulletList(talent.skills),
    '',
    '## Experience',
    '',
    talent.experience || '_Not provided_',
    '',
    '## Education',
    '',
    talent.education || '_Not provided_',
    '',
    '## Portfolio',
    '',
    talent.portfolio?.length ? talent.portfolio.map((item) => link(item.label, item.url)).join('\n') : '_Not provided_',
    '',
    '## About',
    '',
    talent.bio || '_Not provided_',
    '',
    '## Contact',
    '',
    `- Email: ${talent.email || '—'}`,
    `- Phone: ${talent.phone || '—'}`,
    '',
    '---',
    '',
    `_Exported from herHunar on ${formatDate(new Date().toISOString())}. Data is stored only in the browser that created it — it is not shared automatically between devices._`,
    '',
  ];
  return lines.join('\n');
}

export function companyToMarkdown(company) {
  const requirementBlocks = (company.requirements ?? []).map((requirement, index) =>
    [
      `### ${index + 1}. ${requirement.title}`,
      '',
      `- **Skills needed:** ${(requirement.skills ?? []).join(', ') || '—'}`,
      `- **Experience:** ${requirement.experienceLevel || '—'}`,
      `- **Work type:** ${requirement.workType || '—'}`,
      `- **Budget:** ${requirement.budget || '—'}`,
      '',
      requirement.description || '_No extra description._',
      '',
    ].join('\n'),
  );

  const lines = [
    `# ${company.companyName}`,
    '',
    `**${company.industry || 'Company'} · ${company.teamSize || 'Team size not set'}**`,
    '',
    '## Quick facts',
    '',
    `| Field | Details |`,
    `| --- | --- |`,
    `| Company ID | \`${company.id}\` |`,
    `| Contact person | ${company.contactPerson || '—'}${company.role ? ` (${company.role})` : ''} |`,
    `| Age | ${company.age ?? '—'} |`,
    `| Location | ${company.location || '—'} |`,
    `| Website | ${company.website || '—'} |`,
    `| Public profile | ${joinUrl(publicProfilePath(company))} |`,
    '',
    '## About',
    '',
    company.about || '_Not provided_',
    '',
    '## Hiring requirements',
    '',
    requirementBlocks.length ? requirementBlocks.join('\n') : '_No open requirements._',
    '## Contact',
    '',
    `- Email: ${company.email || '—'}`,
    `- Phone: ${company.phone || '—'}`,
    '',
    '---',
    '',
    `_Exported from herHunar on ${formatDate(new Date().toISOString())}. Data is stored only in the browser that created it — it is not shared automatically between devices._`,
    '',
  ];
  return lines.join('\n');
}

export function exportRecordAsMarkdown(record) {
  const isCompany = record.kind === 'company';
  const content = isCompany ? companyToMarkdown(record) : talentToMarkdown(record);
  const name = isCompany ? record.companyName : record.name;
  downloadFile(`${slugify(name)}-herhunar.md`, content);
}

/** A single .md file containing every profile saved in this browser. */
export function exportAllAsMarkdown({ talents = [], companies = [] }) {
  const lines = [
    '# herHunar data export',
    '',
    `Generated on ${formatDate(new Date().toISOString())}.`,
    '',
    `- Talent profiles: **${talents.length}**`,
    `- Companies: **${companies.length}**`,
    '',
    '> This file was exported from the browser it was created in. Browser-local data is never shared automatically between people or devices.',
    '',
  ];

  if (talents.length) {
    lines.push('---', '', '# Talent profiles', '');
    lines.push(talents.map((talent) => talentToMarkdown(talent)).join('\n\n'));
  }
  if (companies.length) {
    lines.push('---', '', '# Companies', '');
    lines.push(companies.map((company) => companyToMarkdown(company)).join('\n\n'));
  }

  downloadFile(`herhunar-export-${new Date().toISOString().slice(0, 10)}.md`, lines.join('\n'));
}
