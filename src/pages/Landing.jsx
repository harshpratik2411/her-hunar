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

  const heroCompany = companies[0];

  return (
    <>
      {/* ------------------------------------------------------------ hero -- */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-white px-5 pt-12 pb-20 text-center sm:px-6 sm:pt-20 sm:pb-32">
        {/* Network Mesh Background (Stylised SVG) */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.15]">
          <svg
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full max-w-6xl"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M200 100L400 300L600 150L800 400L1000 200" stroke="#0e8ce9" strokeWidth="1" />
            <path d="M100 400L300 600L500 450L700 700L900 500" stroke="#0e8ce9" strokeWidth="1" />
            <path d="M200 100L300 600" stroke="#0e8ce9" strokeWidth="1" />
            <path d="M400 300L500 450" stroke="#0e8ce9" strokeWidth="1" />
            <path d="M600 150L700 700" stroke="#0e8ce9" strokeWidth="1" />
            <path d="M800 400L900 500" stroke="#0e8ce9" strokeWidth="1" />
            <circle cx="200" cy="100" r="4" fill="#0e8ce9" />
            <circle cx="400" cy="300" r="4" fill="#0e8ce9" />
            <circle cx="600" cy="150" r="4" fill="#0e8ce9" />
            <circle cx="800" cy="400" r="4" fill="#0e8ce9" />
            <circle cx="1000" cy="200" r="4" fill="#0e8ce9" />
            <circle cx="100" cy="400" r="4" fill="#0e8ce9" />
            <circle cx="300" cy="600" r="4" fill="#0e8ce9" />
            <circle cx="500" cy="450" r="4" fill="#0e8ce9" />
            <circle cx="700" cy="700" r="4" fill="#0e8ce9" />
            <circle cx="900" cy="500" r="4" fill="#0e8ce9" />
          </svg>
        </div>

        <div className="shell relative z-10 flex flex-col items-center">
          <motion.h1
            className="max-w-4xl text-[2rem] leading-[1.15] font-extrabold tracking-tight text-ink-900 sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-7xl"
            {...fadeUp}
            transition={{ duration: 0.6 }}
          >
            Bridging Talent and <br className="hidden sm:block" />
            <span className="text-brand-500">Opportunity</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed text-ink-500 sm:mt-8 sm:text-lg md:text-xl"
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Empowering women with skills to connect with companies looking for their expertise.
            herHunar provides the network, you provide the talent.
          </motion.p>

          <motion.div
            className="mt-8 w-full sm:mt-10 sm:w-auto"
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/join" className="btn-primary w-full px-8 py-4 text-base sm:w-auto">
              Get Started
            </Link>
          </motion.div>

          {/* Trusted By Section */}
          <motion.div
            className="mt-20 w-full sm:mt-32"
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-[11px] font-bold tracking-[0.2em] text-ink-400 uppercase">Trusted by:</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 opacity-60 grayscale transition-all hover:grayscale-0 sm:mt-8 sm:gap-x-12">
              <span className="flex items-center gap-2 text-base font-bold text-ink-900 sm:text-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM2 12l10 5 10-5-10-5-10 5z"/></svg>
                Webflow
              </span>
              <span className="flex items-center gap-2 text-base font-bold text-ink-900 sm:text-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.53v-1.84c-3.03.66-3.67-1.46-3.67-1.46-.5-1.27-1.2-1.61-1.2-1.61-1-.68.07-.66.07-.66 1.1.07 1.68 1.13 1.68 1.13.98 1.68 2.58 1.2 3.2 0 .1-.7.38-1.2.69-1.5-2.42-.27-4.96-1.2-4.96-5.38 0-1.19.43-2.17 1.14-2.94-.12-.27-.49-1.38.11-2.9 0 0 .91-.3 3 1.1a10.4 10.4 0 015.5 0c2.1-1.4 3-1.1 3-1.1.6 1.52.23 2.63.11 2.9.71.77 1.14 1.75 1.14 2.94 0 4.19-2.54 5.1-4.97 5.37.39.34.73 1 .73 2v3c0 .29.18.63.74.52A11 11 0 0012 1.27z"/></svg>
                GitHub
              </span>
              <span className="flex items-center gap-2 text-base font-bold text-ink-900 sm:text-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0L2 12h5v12h10V12h5L12 0z"/></svg>
                Postman
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------- presentation (below hero) */}
      <Presentation />

      {/* -------------------------------------------------------- how it works */}
      <section id="how" className="shell py-12 sm:py-16 lg:py-20">
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
      <section className="border-y border-slate-100 bg-mist/50 py-12 sm:py-16 lg:py-20">
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
      <section id="companies" className="shell py-12 sm:py-16 lg:py-20">
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
      <section className="shell pb-12 sm:pb-16 lg:pb-20">
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
      <section className="shell pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-700 to-brand-900 px-5 py-12 text-center sm:px-12 sm:py-14">
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
