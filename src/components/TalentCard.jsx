import { Link } from 'react-router-dom';
import { Avatar, MatchBadge, MatchMeter, SkillBadge } from './ui.jsx';
import { bestMatchForTalent } from '../lib/matching.js';
import { cx } from '../lib/utils.js';
import { IconArrowRight, IconMapPin, IconUser } from './icons.jsx';

export default function TalentCard({ talent, company, onContact, className = '' }) {
  const match = company ? bestMatchForTalent(talent, company) : null;
  const visibleSkills = talent.skills?.slice(0, 4) ?? [];
  const extraSkills = (talent.skills?.length ?? 0) - visibleSkills.length;

  return (
    <article className={cx('card card-hover flex flex-col p-5', className)}>
      <div className="flex items-start gap-3.5">
        <Avatar name={talent.name} seed={talent.id} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-ink-900">{talent.name}</h3>
          <p className="truncate text-sm font-medium text-brand-700">{talent.occupation}</p>
          <p className="mt-1 flex items-center gap-3 text-xs text-ink-400">
            <span className="inline-flex items-center gap-1">
              <IconUser size={13} />
              Age {talent.age}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <IconMapPin size={13} />
              <span className="truncate">{talent.location}</span>
            </span>
          </p>
        </div>
      </div>

      {talent.headline && <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-ink-500">{talent.headline}</p>}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {visibleSkills.map((skill) => (
          <SkillBadge
            key={skill}
            matched={Boolean(match?.matched?.some((item) => item.toLowerCase() === skill.toLowerCase()))}
          >
            {skill}
          </SkillBadge>
        ))}
        {extraSkills > 0 && <span className="badge-muted">+{extraSkills} more</span>}
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-ink-500">
        <span className="badge-muted">{talent.experienceLevel}</span>
        <span className="badge-muted">{talent.category}</span>
      </div>

      {company && match && (
        <div className="mt-5 rounded-xl border border-slate-100 bg-mist/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ink-600">Match for your roles</span>
            <MatchBadge percent={match.percent} hasRequirement={match.hasRequirement} />
          </div>
          <MatchMeter percent={match.percent} hasRequirement={match.hasRequirement} className="mt-2.5" />
          <p className="mt-2 truncate text-[11px] text-ink-400">Best role: {match.requirement?.title}</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link to={`/talent/${talent.id}`} className="btn-outline btn-sm">
          View profile
          <IconArrowRight size={14} />
        </Link>
        {company && onContact && (
          <button type="button" className="btn-primary btn-sm" onClick={() => onContact(talent)}>
            Send request
          </button>
        )}
      </div>
    </article>
  );
}
