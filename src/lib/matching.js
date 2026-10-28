/**
 * Skill matching — a deliberately simple, explainable score.
 *
 * Every candidate's skill set is compared against the skills a hiring
 * requirement asks for:
 *   • exact (normalised) match .......... full credit
 *   • one contains the other ............ strong partial credit
 *   • shared significant words .......... small partial credit
 * The result is a percentage plus the lists that explain it, so the UI can
 * always show *why* someone scored the way they did.
 */

const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const significantWords = (value) => normalize(value).split(' ').filter((word) => word.length > 2);

function skillScore(candidateSkill, requiredSkill) {
  const a = normalize(candidateSkill);
  const b = normalize(requiredSkill);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.7;

  const aWords = significantWords(a);
  const bWords = significantWords(b);
  if (!aWords.length || !bWords.length) return 0;
  const overlap = bWords.filter((word) => aWords.includes(word)).length;
  if (!overlap) return 0;
  return Math.min(0.6, overlap / bWords.length);
}

/** Compares one talent's skills against one requirement's required skills. */
export function scoreSkills(talentSkills = [], requiredSkills = []) {
  const requirements = requiredSkills.filter(Boolean);
  if (!requirements.length) {
    return { percent: 0, matched: [], partial: [], missing: [], hasRequirement: false };
  }

  const matched = [];
  const partial = [];
  const missing = [];
  let total = 0;

  for (const requirement of requirements) {
    const best = talentSkills.reduce((acc, skill) => Math.max(acc, skillScore(skill, requirement)), 0);
    total += best;
    if (best >= 0.9) matched.push(requirement);
    else if (best >= 0.5) partial.push(requirement);
    else missing.push(requirement);
  }

  return {
    percent: Math.round((total / requirements.length) * 100),
    matched,
    partial,
    missing,
    hasRequirement: true,
  };
}

/** Best-fitting requirement for a talent, across all of a company's requirements. */
export function bestMatchForTalent(talent, company) {
  if (!talent || !company?.requirements?.length) return null;
  let best = null;
  for (const requirement of company.requirements) {
    const result = scoreSkills(talent.skills, requirement.skills);
    if (!best || result.percent > best.percent) best = { ...result, requirement };
  }
  return best;
}

/** Highest-scoring talent for one requirement. */
export function bestTalentsForRequirement(talents, requirement) {
  return talents
    .map((talent) => ({ talent, ...scoreSkills(talent.skills, requirement.skills) }))
    .sort((a, b) => b.percent - a.percent);
}

export function matchLabel(percent, hasRequirement = true) {
  if (!hasRequirement) return { text: 'No requirement set', tone: 'muted' };
  if (percent >= 75) return { text: 'Strong match', tone: 'strong' };
  if (percent >= 50) return { text: 'Good match', tone: 'good' };
  if (percent >= 25) return { text: 'Partial match', tone: 'partial' };
  return { text: 'Low match', tone: 'low' };
}

export const MATCH_TONES = {
  strong: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  good: 'border-brand-200 bg-brand-50 text-brand-700',
  partial: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-slate-200 bg-slate-50 text-ink-500',
  muted: 'border-slate-200 bg-slate-50 text-ink-400',
};

export const MATCH_BAR = {
  strong: 'bg-emerald-500',
  good: 'bg-brand-500',
  partial: 'bg-amber-500',
  low: 'bg-slate-300',
  muted: 'bg-slate-200',
};
