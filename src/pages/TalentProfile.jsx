import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Avatar, CopyLinkButton, EmptyState, InfoNote, MatchBadge, MatchMeter, SkillBadge } from '../components/ui.jsx';
import ContactRequestModal from '../components/ContactRequestModal.jsx';
import { bestMatchForTalent, scoreSkills } from '../lib/matching.js';
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
  IconSearch,
  IconShield,
  IconSparkles,
  IconUser,
} from '../components/icons.jsx';

function ProfileUnavailable({ id }) {
  return (
    <div className="shell py-16">
      <EmptyState
        className="mx-auto max-w-2xl"
        icon={<IconUser size={24} />}
        title="This profile is not available in this browser"
        description={`No talent profile with the id “${id}” was found in this browser's local storage. Profiles created here are saved only on this device, so a shared link works only when the matching data is already present.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/discover" className="btn-primary">
              Browse talent
            </Link>
            <Link to="/join?as=talent" className="btn-outline">
              Create this profile
            </Link>
          </div>
        }
      />
      <InfoNote tone="warn" title="Why can a link be empty for someone else?" className="mx-auto mt-6 max-w-2xl">
        herHunar stores everything in the browser. Nothing is uploaded to a server, so a public link can only render the
        profile if that profile's data exists in the browser opening it.
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

export default function TalentProfile() {
  const { id } = useParams();
  const { getTalent, currentUser, isCompany } = useApp();
  const [contactOpen, setContactOpen] = useState(false);

  const talent = getTalent(id);
  if (!talent) return <ProfileUnavailable id={id} />;

  const isSelf = currentUser?.id === talent.id;
  const canContact = isCompany && !isSelf;
  const requirements = currentUser?.requirements ?? [];
  const bestMatch = canContact ? bestMatchForTalent(talent, currentUser) : null;
  const requirementMatches = canContact
    ? requirements
        .map((requirement) => ({ requirement, ...scoreSkills(talent.skills, requirement.skills) }))
        .sort((a, b) => b.percent - a.percent)
    : [];

  return (
    <div className="shell py-10 sm:py-14">
      <Link to="/discover" className="btn-ghost btn-sm -ml-2">
        Back to discovery
      </Link>

      <header className="card mt-4 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar name={talent.name} seed={talent.id} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{talent.name}</h1>
              {isSelf && <span className="badge-skill">This is you</span>}
            </div>
            <p className="mt-1 text-sm font-semibold text-brand-700">{talent.occupation}</p>
            {talent.headline && <p className="mt-2 text-sm leading-relaxed text-ink-500">{talent.headline}</p>}

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="badge-muted">
                <IconUser size={13} />
                Age {talent.age}
              </span>
              <span className="badge-muted">
                <IconMapPin size={13} />
                {talent.location}
              </span>
              <span className="badge-muted">{talent.experienceLevel}</span>
              <span className="badge-muted">{talent.category}</span>
              {talent.availability && <span className="badge-muted">{talent.availability}</span>}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <CopyLinkButton record={talent} />
              <button type="button" className="btn-outline" onClick={() => exportRecordAsMarkdown(talent)}>
                <IconDownload size={16} />
                Download .md
              </button>
              {canContact && (
                <button type="button" className="btn-primary" onClick={() => setContactOpen(true)}>
                  <IconMail size={16} />
                  Send contact request
                </button>
              )}
              {isSelf && (
                <Link to="/edit-profile" className="btn-primary">
                  Edit my profile
                </Link>
              )}
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-400">
              <IconLink size={13} />
              /talent/{talent.id}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          {canContact && (
            <section className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-ink-900">Skill match for your roles</h2>
                {bestMatch && <MatchBadge percent={bestMatch.percent} hasRequirement={bestMatch.hasRequirement} />}
              </div>

              {requirementMatches.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">
                  You have not added any hiring requirements yet.{' '}
                  <Link to="/edit-profile" className="link">
                    Add a requirement
                  </Link>{' '}
                  to see exact skill matches here.
                </p>
              ) : (
                <ul className="mt-4 grid gap-4">
                  {requirementMatches.map(({ requirement, percent, matched, partial, missing, hasRequirement }) => (
                    <li key={requirement.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-ink-900">{requirement.title}</p>
                        <MatchBadge percent={percent} hasRequirement={hasRequirement} />
                      </div>
                      <MatchMeter percent={percent} hasRequirement={hasRequirement} className="mt-3" />
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {matched.map((skill) => (
                          <SkillBadge key={skill} matched>
                            {skill}
                          </SkillBadge>
                        ))}
                        {partial.map((skill) => (
                          <SkillBadge key={skill}>{skill}</SkillBadge>
                        ))}
                        {missing.map((skill) => (
                          <SkillBadge key={skill} missing>
                            {skill}
                          </SkillBadge>
                        ))}
                      </div>
                      {partial.length > 0 && (
                        <p className="mt-2 text-[11px] text-ink-400">
                          Partly related skills count as a partial match, not a full one.
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="card p-6">
            <h2 className="text-lg font-bold text-ink-900">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {talent.skills?.length ? (
                talent.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)
              ) : (
                <p className="text-sm text-ink-400">No skills listed.</p>
              )}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-ink-900">Experience</h2>
            <p className="mt-1 text-xs font-semibold text-brand-700">{talent.experienceLevel}</p>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-600">{talent.experience}</p>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-ink-900">Education</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{talent.education}</p>
          </section>

          {talent.portfolio?.length > 0 && (
            <section className="card p-6">
              <h2 className="text-lg font-bold text-ink-900">Portfolio</h2>
              <ul className="mt-3 grid gap-2">
                {talent.portfolio.map((item, index) => (
                  <li key={`${item.url}-${index}`}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink-800">
                          {item.label || 'Portfolio link'}
                        </span>
                        <span className="block truncate text-xs text-ink-400">{item.url}</span>
                      </span>
                      <IconExternal size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {talent.bio && (
            <section className="card p-6">
              <h2 className="text-lg font-bold text-ink-900">About</h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-600">{talent.bio}</p>
            </section>
          )}
        </div>

        <aside className="grid h-fit gap-6">
          <section className="card p-6">
            <h2 className="text-base font-bold text-ink-900">Contact details</h2>
            <div className="mt-4 grid gap-4">
              <DetailRow icon={<IconMail size={15} />} label="Email" value={talent.email} href={`mailto:${talent.email}`} />
              <DetailRow icon={<IconPhone size={15} />} label="Phone" value={talent.phone} href={`tel:${talent.phone}`} />
              <DetailRow icon={<IconMapPin size={15} />} label="Location" value={talent.location} />
              <DetailRow icon={<IconSparkles size={15} />} label="Availability" value={talent.availability || 'Flexible'} />
              <DetailRow
                icon={<IconUser size={15} />}
                label="Languages"
                value={talent.languages?.join(', ') || '—'}
              />
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-ink-400">
              Profile created {formatDate(talent.createdAt)}
              {talent.updatedAt ? ` · updated ${formatDate(talent.updatedAt)}` : ''}
            </p>
          </section>

          {isSelf && (
            <section className="card p-6">
              <h2 className="inline-flex items-center gap-2 text-base font-bold text-ink-900">
                <IconBriefcase size={16} />
                Get hired
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Share your public link with companies. Contact requests they send appear under the S tab.
              </p>
              <div className="mt-4 grid gap-2">
                <CopyLinkButton record={talent} variant="primary" />
                <Link to="/discover" className="btn-outline">
                  See who is hiring
                  <IconArrowRight size={15} />
                </Link>
              </div>
            </section>
          )}

          <InfoNote tone="warn" title="Public link, local data">
            <p>
              This page is rendered from data saved in <strong>your</strong> browser. If you share the link, the other
              person sees the profile only when the same profile data exists in their browser too.
            </p>
            <p className="inline-flex items-center gap-1.5 font-semibold">
              <IconShield size={14} />
              No server, no cross-device sync.
            </p>
          </InfoNote>

          {!isSelf && !isCompany && (
            <section className="card p-6">
              <h2 className="inline-flex items-center gap-2 text-base font-bold text-ink-900">
                <IconSearch size={16} />
                Hiring for a role?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Create a company account to see exact skill matches and send contact requests.
              </p>
              <div className="mt-4 grid gap-2">
                <Link to="/join?as=company" className="btn-primary">
                  Create company account
                </Link>
                <Link to="/discover" className="btn-outline">
                  Browse more talent
                </Link>
              </div>
            </section>
          )}
        </aside>
      </div>

      {canContact && (
        <ContactRequestModal open={contactOpen} onClose={() => setContactOpen(false)} talent={talent} />
      )}
    </div>
  );
}
