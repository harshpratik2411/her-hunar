import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import Presentation from '../components/Presentation.jsx';
import TalentCard from '../components/TalentCard.jsx';
import { Avatar, InfoNote, SkillBadge } from '../components/ui.jsx';
import { bestMatchForTalent } from '../lib/matching.js';
import { IconArrowRight, IconBriefcase, IconCheck, IconInfo, IconShield, IconSparkles, IconUser } from '../components/icons.jsx';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const STEPS = [
  {
    title: 'Build a skill profile',
    body: 'Add your name, age, occupation, skills, experience, education, portfolio links, and how you prefer to be contacted.',
  },
  {
    title: 'Get a public link',
    body: 'Every profile gets a shareable link like /talent/your-id that opens in any browser that has your data saved.',
  },
  {
    title: 'Companies find the fit',
    body: 'Hiring teams search by skill, filter by location and experience, and see a match score against their requirement.',
  },
  {
    title: 'Send a contact request',
    body: 'Companies send a short, specific request. Talent reviews it from the S tab and accepts or declines.',
  },
];

export default function Landing() {
  const { talents, companies, requests, isCompany, currentUser } = useApp();

  const requirementCount = useMemo(
    () => companies.reduce((total, company) => total + (company.requirements?.length ?? 0), 0),
    [companies],
  );

  const featured = useMemo(() => talents.slice(0, 3), [talents]);

  const heroTalent = featured[0];
  const heroCompany = companies[0];
  const heroMatch = useMemo(
    () => (heroTalent && heroCompany ? bestMatchForTalent(heroTalent, heroCompany) : null),
    [heroTalent, heroCompany],
  );

  return (
    <>
      {/* ------------------------------------------------------------ hero -- */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="grid-fade pointer-events-none absolute inset-0 opacity-[0.5]" />
        <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl" />

        <div className="shell relative grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <motion.span className="eyebrow" {...fadeUp} transition={{ duration: 0.5 }}>
              <IconSparkles size={14} />
              Skill-first hiring for women
            </motion.span>

            <motion.h1
              className="mt-5 text-4xl leading-[1.08] font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]"
              {...fadeUp}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              Her Skills.
              <br />
              Her Income.
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-900 bg-clip-text text-transparent">
                Her Independence.
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg"
              {...fadeUp}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              herHunar connects women who stitch, cook, craft, tutor, and create with companies hiring for exactly
              those skills. No CV maze — just clear profiles, real skills, and a simple match score.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              {...fadeUp}
              transition={{ duration: 0.55, delay: 0.18 }}
            >
              <Link to="/discover" className="btn-primary px-5 py-3">
                Explore talent
                <IconArrowRight size={16} />
              </Link>
              <Link to="/join?as=talent" className="btn-outline px-5 py-3">
                <IconUser size={16} />
                Create my profile
              </Link>
              <Link
                to="/join?as=company"
                className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
              >
                <IconBriefcase size={16} />
                I&apos;m hiring
              </Link>
            </motion.div>

            <motion.dl
              className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
              {...fadeUp}
              transition={{ duration: 0.55, delay: 0.24 }}
            >
              {[
                { label: 'Talent profiles', value: talents.length },
                { label: 'Companies', value: companies.length },
                { label: 'Open roles', value: requirementCount },
                { label: 'Requests sent', value: requests.length },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-medium tracking-wide text-ink-400 uppercase">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold text-ink-900">{stat.value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Hero preview card, built from the sample data in this browser. */}
          <motion.div
            className="relative mx-auto w-full max-w-md"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            {heroTalent && (
              <div className="card relative z-10 p-6">
                <div className="flex items-center gap-4">
                  <Avatar name={heroTalent.name} seed={heroTalent.id} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-ink-900">{heroTalent.name}</p>
                    <p className="truncate text-sm font-medium text-brand-700">{heroTalent.occupation}</p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      Age {heroTalent.age} · {heroTalent.location}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {(heroTalent.skills ?? []).slice(0, 5).map((skill) => (
                    <SkillBadge key={skill}>{skill}</SkillBadge>
                  ))}
                </div>

                {heroMatch && (
                  <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-800">
                      <span>Match with {heroCompany.companyName}</span>
                      <span>{heroMatch.percent}%</span>
                    </div>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-700"
                        style={{ width: `${Math.max(heroMatch.percent, 4)}%` }}
                      />
                    </div>
                    <p className="mt-2.5 text-[11px] leading-relaxed text-brand-800/80">
                      Best role: {heroMatch.requirement?.title} · matched {heroMatch.matched.length} of{' '}
                      {heroMatch.requirement?.skills.length} skills
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-ink-400">
                  <span className="inline-flex items-center gap-1.5">
                    <IconShield size={14} className="text-brand-500" />
                    Public link ready
                  </span>
                  <span>/talent/{heroTalent.id}</span>
                </div>
              </div>
            )}

            <div className="animate-float absolute -top-5 -right-3 z-20 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-card sm:block">
              <p className="text-[11px] font-medium tracking-wide text-ink-400 uppercase">Requests</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-ink-900">
                <IconCheck size={15} className="text-emerald-500" />
                {requests.length} saved locally
              </p>
            </div>

            <div className="absolute -bottom-6 -left-4 z-0 hidden h-40 w-40 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200/50 blur-[2px] sm:block" />
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------- presentation (below hero) */}
      <Presentation />

      {/* -------------------------------------------------------- how it works */}
      <section id="how" className="shell py-16 sm:py-20">
        <div className="max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title mt-4">Four steps from skill to opportunity</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
            herHunar keeps the process short. Profiles are written for real work, and companies reach out with a clear
            role instead of a generic message.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              className="card p-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------- featured talent */}
      <section className="border-y border-slate-100 bg-mist/50 py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="eyebrow">Featured talent</span>
              <h2 className="section-title mt-4">Sample profiles from this browser</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
                These are the demo profiles saved in your browser&apos;s storage. Open one to see its public page, or
                search the full list by skill.
              </p>
            </div>
            <Link to="/discover" className="btn-outline">
              View all talent
              <IconArrowRight size={16} />
            </Link>
          </div>

          {featured.length ? (
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((talent) => (
                <TalentCard
                  key={talent.id}
                  talent={talent}
                  company={isCompany ? currentUser : null}
                />
              ))}
            </div>
          ) : (
            <p className="mt-9 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-ink-400">
              No profiles saved yet. Create one to see it here.
            </p>
          )}
        </div>
      </section>

      {/* ----------------------------------------------------------- companies */}
      <section id="companies" className="shell py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow">For companies</span>
            <h2 className="section-title mt-4">Hire for the skill you actually need</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
              Publish your hiring requirements with the exact skills you need. herHunar scores every candidate against
              them and shows you why the match works — matched skills, missing skills, and experience level.
            </p>

            <ul className="mt-7 grid gap-3">
              {[
                'Create a company profile with a public page and shareable link.',
                'List multiple roles with required skills, experience, budget, and work type.',
                'Filter candidates by skill, category, location, and minimum match score.',
                'Send a contact request that the candidate can accept or decline.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <IconCheck size={13} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/join?as=company" className="btn-primary px-5 py-3">
                <IconBriefcase size={16} />
                Create a company profile
              </Link>
              <Link to="/discover" className="btn-outline px-5 py-3">
                Browse talent
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Example requirement</p>
            <h3 className="mt-2 text-lg font-bold text-ink-900">
              {heroCompany?.requirements?.[0]?.title ?? 'Tailor for our denim capsule line'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {heroCompany?.requirements?.[0]?.description ??
                'Stitch and finish around 120 denim pieces per month, including fittings and small alterations.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(heroCompany?.requirements?.[0]?.skills ?? ['Sewing', 'Tailoring', 'Pattern Making']).map((skill) => (
                <SkillBadge key={skill}>{skill}</SkillBadge>
              ))}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
              <div>
                <dt className="text-ink-400">Experience</dt>
                <dd className="mt-0.5 font-semibold text-ink-800">
                  {heroCompany?.requirements?.[0]?.experienceLevel ?? '1-3 years'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Work type</dt>
                <dd className="mt-0.5 font-semibold text-ink-800">
                  {heroCompany?.requirements?.[0]?.workType ?? 'On-site · Delhi'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Budget</dt>
                <dd className="mt-0.5 font-semibold text-ink-800">
                  {heroCompany?.requirements?.[0]?.budget ?? '₹18,000 – ₹24,000 / month'}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Posted by</dt>
                <dd className="mt-0.5 font-semibold text-ink-800">{heroCompany?.companyName ?? 'NovaCraft Studio'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- data note */}
      <section className="shell pb-16 sm:pb-20">
        <InfoNote title="This demo is browser-local — here is exactly what that means" tone="warn">
          <p>
            herHunar has no backend and no shared database. Profiles, requirements, and contact requests are saved in
            your browser&apos;s <strong>localStorage</strong>, so they survive a refresh but stay on this device and
            this browser profile.
          </p>
          <p>
            A public link such as <code className="rounded bg-white/70 px-1.5 py-0.5">/talent/tal-shagun</code> shows a
            profile only if that profile&apos;s data already exists in the browser opening the link. Opening the same
            link on another laptop or phone will not show your saved profile — that would require real hosting. Export
            a <code className="rounded bg-white/70 px-1.5 py-0.5">.md</code> file from the S tab to share your details
            manually.
          </p>
          <p className="flex items-start gap-2 pt-1">
            <IconInfo size={15} className="mt-0.5 shrink-0" />
            Look for the small <strong>S</strong> tab in the navbar — it holds your account, profile link, contact
            requests, and exports.
          </p>
        </InfoNote>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="shell pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-700 to-brand-900 px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
          <h2 className="relative text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Ready to make skills discoverable?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
            Create a free profile in a couple of minutes, get your public link, and start receiving contact requests
            from companies hiring for your skills.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/join?as=talent"
              className="btn bg-white px-5 py-3 text-brand-800 hover:bg-brand-50 active:translate-y-px"
            >
              <IconUser size={16} />
              Join as talent
            </Link>
            <Link
              to="/join?as=company"
              className="btn border border-white/30 bg-white/10 px-5 py-3 text-white backdrop-blur hover:bg-white/20"
            >
              <IconBriefcase size={16} />
              Join as company
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
