import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Avatar, CopyLinkButton, EmptyState, InfoNote, MatchBadge, MatchMeter, SkillBadge } from '../components/ui.jsx';
import { scoreSkills } from '../lib/matching.js';
import { exportRecordAsMarkdown } from '../lib/export.js';
import { formatDate } from '../lib/utils.js';
import {
  IconArrowRight,
  IconBriefcase,
  IconDownload,
  IconExternal,
  IconLink,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShield,
  IconSparkles,
  IconUser,
} from '../components/icons.jsx';

function ProfileUnavailable({ id }) {
  return (
    <div className="shell py-16">
      <EmptyState
        className="mx-auto max-w-2xl"
        icon={<IconBriefcase size={24} />}
        title="This company is not available in this browser"
        description={`No company with the id “${id}” was found in this browser's local storage. Company profiles live only on the device that created them, so a shared link works only when the matching data is already present.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/discover" className="btn-primary">
              Browse companies
            </Link>
            <Link to="/join?as=company" className="btn-outline">
              Create this company
            </Link>
          </div>
        }
      />
      <InfoNote tone="warn" title="Why can a link be empty for someone else?" className="mx-auto mt-6 max-w-2xl">
        herHunar stores everything in the browser. Nothing is uploaded to a server, so a public link can only render the
        company if that company's data exists in the browser opening it.
      </InfoNote>
    </div>
  );
}

function DetailRow({ icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="link block truncate text-sm">
            {value}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-ink-700">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function CompanyProfile() {
  const { id } = useParams();
  const { getCompany, currentUser, isTalent } = useApp();

  const company = getCompany(id);
  if (!company) return <ProfileUnavailable id={id} />;

  const isSelf = currentUser?.id === company.id;
  const requirements = company.requirements ?? [];
  const viewerSkills = isTalent ? currentUser.skills ?? [] : [];

  return (
    <div className="shell py-10 sm:py-14">
      <Link to="/discover?view=companies" className="btn-ghost btn-sm -ml-2">
        Back to discovery
      </Link>

      <header className="card mt-4 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar name={company.companyName} seed={company.id} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{company.companyName}</h1>
              {isSelf && <span className="badge-skill">Your company</span>}
            </div>
            <p className="mt-1 text-sm font-semibold text-brand-700">{company.industry}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="badge-muted">
                <IconMapPin size={13} />
                {company.location}
              </span>
              <span className="badge-muted">{company.teamSize}</span>
              <span className="badge border border-brand-100 bg-brand-50 text-brand-700">
                <IconBriefcase size={13} />
                {requirements.length} open {requirements.length === 1 ? 'role' : 'roles'}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <CopyLinkButton record={company} />
              <button type="button" className="btn-outline" onClick={() => exportRecordAsMarkdown(company)}>
                <IconDownload size={16} />
                Download .md
              </button>
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="btn-outline">
                  <IconExternal size={16} />
                  Visit website
                </a>
              )}
              {isSelf && (
                <Link to="/edit-profile" className="btn-primary">
                  Edit company profile
                </Link>
              )}
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-400">
              <IconLink size={13} />
              /company/{company.id}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          <section className="card p-6">
            <h2 className="text-lg font-bold text-ink-900">About {company.companyName}</h2>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-600">{company.about}</p>
          </section>

          <section className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink-900">Open roles</h2>
              {isTalent && requirements.length > 0 && (
                <span className="badge-muted">Scores compare your skills to each role</span>
              )}
            </div>

            {requirements.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">
                This company has not listed any hiring requirement yet. Check back later.
              </p>
            ) : (
              <ul className="mt-4 grid gap-4">
                {requirements.map((requirement) => {
                  const match = isTalent ? scoreSkills(viewerSkills, requirement.skills) : null;
                  return (
                    <li key={requirement.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-base font-bold text-ink-900">{requirement.title}</p>
                          <p className="mt-0.5 text-xs text-ink-500">
                            {requirement.workType} · {requirement.experienceLevel} · {requirement.budget}
                          </p>
                        </div>
                        {match && <MatchBadge percent={match.percent} hasRequirement={match.hasRequirement} />}
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-ink-600">{requirement.description}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {requirement.skills.map((skill) => (
                          <SkillBadge
                            key={skill}
                            matched={Boolean(match?.matched?.some((item) => item.toLowerCase() === skill.toLowerCase()))}
                            missing={Boolean(match?.missing?.some((item) => item.toLowerCase() === skill.toLowerCase()))}
                          >
                            {skill}
                          </SkillBadge>
                        ))}
                      </div>

                      {match && (
                        <div className="mt-4 rounded-xl border border-slate-100 bg-mist/60 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-ink-600">Your skill match</span>
                            <span className="text-xs font-bold text-ink-800">{match.percent}%</span>
                          </div>
                          <MatchMeter percent={match.percent} hasRequirement={match.hasRequirement} className="mt-2" />
                          {match.missing.length > 0 && (
                            <p className="mt-2 text-[11px] text-ink-500">
                              Missing: {match.missing.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="grid h-fit gap-6">
          <section className="card p-6">
            <h2 className="text-base font-bold text-ink-900">Contact</h2>
            <p className="mt-2 text-sm text-ink-500">
              Handled by <span className="font-semibold text-ink-700">{company.contactPerson}</span>
              {company.role ? ` · ${company.role}` : ''}
              {company.age ? ` · Age ${company.age}` : ''}
            </p>
            <div className="mt-4 grid gap-4">
              <DetailRow icon={<IconMail size={15} />} label="Email" value={company.email} href={`mailto:${company.email}`} />
              <DetailRow icon={<IconPhone size={15} />} label="Phone" value={company.phone} href={`tel:${company.phone}`} />
              <DetailRow icon={<IconMapPin size={15} />} label="Location" value={company.location} />
              {company.website && (
                <DetailRow
                  icon={<IconExternal size={15} />}
                  label="Website"
                  value={company.website.replace(/^https?:\/\//, '')}
                  href={company.website}
                />
              )}
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-ink-400">
              Profile created {formatDate(company.createdAt)}
              {company.updatedAt ? ` · updated ${formatDate(company.updatedAt)}` : ''}
            </p>
          </section>

          {isSelf ? (
            <section className="card p-6">
              <h2 className="inline-flex items-center gap-2 text-base font-bold text-ink-900">
                <IconUser size={16} />
                Find candidates
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Browse talent and sort by how well they match your requirements, then send a contact request.
              </p>
              <Link to="/discover" className="btn-primary mt-4 w-full">
                Discover talent
                <IconArrowRight size={15} />
              </Link>
            </section>
          ) : (
            <section className="card p-6">
              <h2 className="inline-flex items-center gap-2 text-base font-bold text-ink-900">
                <IconSparkles size={16} />
                Want this kind of profile?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Anyone can list skills and get a public link to share with companies like this one.
              </p>
              <Link to="/join?as=talent" className="btn-primary mt-4 w-full">
                Join as talent
              </Link>
            </section>
          )}

          <InfoNote tone="warn" title="Public link, local data">
            <p>
              This page is rendered from data saved in <strong>your</strong> browser. If you share the link, the other
              person sees the company only when the same data exists in their browser too.
            </p>
            <p className="inline-flex items-center gap-1.5 font-semibold">
              <IconShield size={14} />
              No server, no cross-device sync.
            </p>
          </InfoNote>
        </aside>
      </div>
    </div>
  );
}
