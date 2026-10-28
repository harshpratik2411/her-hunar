import { Link } from 'react-router-dom';
import { Avatar, SkillBadge } from './ui.jsx';
import { cx } from '../lib/utils.js';
import { IconArrowRight, IconBriefcase, IconMapPin } from './icons.jsx';

export default function CompanyCard({ company, className = '' }) {
  const requirements = company.requirements ?? [];
  const skills = [...new Set(requirements.flatMap((requirement) => requirement.skills ?? []))].slice(0, 5);

  return (
    <article className={cx('card card-hover flex flex-col p-5', className)}>
      <div className="flex items-start gap-3.5">
        <Avatar name={company.companyName} seed={company.id} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-ink-900">{company.companyName}</h3>
          <p className="truncate text-sm font-medium text-brand-700">{company.industry}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
            <IconMapPin size={13} />
            <span className="truncate">{company.location}</span>
          </p>
        </div>
      </div>

      <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-ink-500">{company.about}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <SkillBadge key={skill}>{skill}</SkillBadge>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
        <span className="badge border border-brand-100 bg-brand-50 text-brand-700">
          <IconBriefcase size={13} />
          {requirements.length} open {requirements.length === 1 ? 'role' : 'roles'}
        </span>
        <span className="badge-muted">{company.teamSize}</span>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs text-ink-400">
          Contact: <span className="font-semibold text-ink-600">{company.contactPerson}</span>
          {company.role ? ` · ${company.role}` : ''}
        </p>
        <Link to={`/company/${company.id}`} className="btn-outline btn-sm mt-3">
          View company profile
          <IconArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
