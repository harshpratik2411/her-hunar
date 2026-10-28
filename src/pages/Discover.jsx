import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import TalentCard from '../components/TalentCard.jsx';
import CompanyCard from '../components/CompanyCard.jsx';
import ContactRequestModal from '../components/ContactRequestModal.jsx';
import { EmptyState, InfoNote, useToast } from '../components/ui.jsx';
import { bestMatchForTalent } from '../lib/matching.js';
import { cx } from '../lib/utils.js';
import { IconBriefcase, IconFilter, IconSearch, IconUser, IconClose } from '../components/icons.jsx';

const SORTS = [
  { value: 'match', label: 'Best match first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name (A–Z)' },
];

const textOf = (record) =>
  [
    record.name,
    record.occupation,
    record.headline,
    record.category,
    record.location,
    record.companyName,
    record.industry,
    record.contactPerson,
    ...(record.skills ?? []),
    ...(record.requirements ?? []).flatMap((requirement) => [requirement.title, ...(requirement.skills ?? [])]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export default function Discover() {
  const { talents, companies, isCompany, currentUser } = useApp();
  const { notify } = useToast();

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('view') === 'companies' ? 'companies' : 'talent');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All');
  const [experience, setExperience] = useState('All');
  const [category, setCategory] = useState('All');
  const [minMatch, setMinMatch] = useState(0);
  const [sort, setSort] = useState('match');
  const [contactTarget, setContactTarget] = useState(null);

  const hasRequirements = Boolean(currentUser?.requirements?.length);

  const locations = useMemo(
    () => ['All', ...new Set(talents.map((talent) => talent.location).filter(Boolean))],
    [talents],
  );

  const categories = useMemo(
    () => ['All', ...new Set(talents.map((talent) => talent.category).filter(Boolean))],
    [talents],
  );

  const experiences = useMemo(
    () => ['All', ...new Set(talents.map((talent) => talent.experienceLevel).filter(Boolean))],
    [talents],
  );

  const filteredTalents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const withMatch = talents.map((talent) => ({
      talent,
      match: isCompany ? bestMatchForTalent(talent, currentUser) : null,
    }));

    const result = withMatch.filter(({ talent, match }) => {
      if (needle && !textOf(talent).includes(needle)) return false;
      if (category !== 'All' && talent.category !== category) return false;
      if (location !== 'All' && talent.location !== location) return false;
      if (experience !== 'All' && talent.experienceLevel !== experience) return false;
      if (hasRequirements && minMatch > 0 && (match?.percent ?? 0) < minMatch) return false;
      return true;
    });

    const sorted = [...result];
    if (sort === 'match' && isCompany && hasRequirements) sorted.sort((a, b) => (b.match?.percent ?? 0) - (a.match?.percent ?? 0));
    else if (sort === 'newest') sorted.sort((a, b) => new Date(b.talent.createdAt ?? 0) - new Date(a.talent.createdAt ?? 0));
    else if (sort === 'name') sorted.sort((a, b) => a.talent.name.localeCompare(b.talent.name));

    return sorted;
  }, [talents, query, category, location, experience, sort, isCompany, currentUser, hasRequirements, minMatch]);

  const filteredCompanies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (needle && !textOf(company).includes(needle)) return false;
      if (location !== 'All' && company.location !== location) return false;
      return true;
    });
  }, [companies, query, location]);

  const activeFilters =
    (query ? 1 : 0) +
    (category !== 'All' ? 1 : 0) +
    (location !== 'All' ? 1 : 0) +
    (experience !== 'All' ? 1 : 0) +
    (minMatch > 0 ? 1 : 0);

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setLocation('All');
    setExperience('All');
    setMinMatch(0);
    setSort('match');
  };

  return (
    <div className="shell py-10 sm:py-14">
      <header className="max-w-3xl">
        <span className="eyebrow">
          <IconSearch size={14} />
          Discover
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Find talent by skill, not by paperwork
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
          Search across every profile saved in this browser. Filter by skill category, location, and experience — and
          if you are signed in as a company, sort candidates by how well they match your open roles.
        </p>
      </header>

      {!isCompany && (
        <InfoNote tone="neutral" className="mt-6">
          You are browsing as a guest. Match scores and contact requests are available on company accounts — log in or
          create a company profile to use them.
        </InfoNote>
      )}

      {/* Search + filters */}
      <div className="card mt-8 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300">
                <IconSearch size={18} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a skill, name, occupation, or company…"
                aria-label="Search talent and companies"
                className="input pl-11"
              />
            </div>

            <div className="flex rounded-xl bg-mist p-1">
              {[
                { value: 'talent', label: 'Talent', icon: <IconUser size={15} /> },
                { value: 'companies', label: 'Companies', icon: <IconBriefcase size={15} /> },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={cx(
                    'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none',
                    tab === item.value ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500 hover:text-ink-700',
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'talent' && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-semibold text-ink-500">
                Skill category
                <select className="input mt-1.5" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === 'All' ? 'All categories' : item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-ink-500">
                Location
                <select className="input mt-1.5" value={location} onChange={(event) => setLocation(event.target.value)}>
                  {locations.map((item) => (
                    <option key={item} value={item}>
                      {item === 'All' ? 'All locations' : item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-ink-500">
                Experience
                <select
                  className="input mt-1.5"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                >
                  {experiences.map((item) => (
                    <option key={item} value={item}>
                      {item === 'All' ? 'Any experience' : item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-ink-500">
                Sort by
                <select className="input mt-1.5" value={sort} onChange={(event) => setSort(event.target.value)}>
                  {SORTS.map((item) => (
                    <option key={item.value} value={item.value} disabled={item.value === 'match' && !hasRequirements}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {tab === 'talent' && isCompany && hasRequirements && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-brand-800">
                  Minimum skill match against your requirements
                </span>
                <span className="badge border border-brand-200 bg-white text-brand-700">{minMatch}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minMatch}
                onChange={(event) => setMinMatch(Number(event.target.value))}
                className="mt-3 w-full accent-brand-600"
                aria-label="Minimum match score"
              />
              <p className="mt-1 text-[11px] text-brand-800/70">
                Matching uses the exact skills your roles require, so scores stay explainable.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="inline-flex items-center gap-2 text-xs font-medium text-ink-500">
              <IconFilter size={15} />
              {tab === 'talent'
                ? `${filteredTalents.length} ${filteredTalents.length === 1 ? 'profile' : 'profiles'} found`
                : `${filteredCompanies.length} ${filteredCompanies.length === 1 ? 'company' : 'companies'} found`}
              {activeFilters > 0 && <span className="badge-muted">{activeFilters} active filters</span>}
            </p>
            {activeFilters > 0 && (
              <button type="button" className="btn-ghost btn-sm" onClick={clearFilters}>
                <IconClose size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {tab === 'talent' ? (
        filteredTalents.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredTalents.map(({ talent }) => (
              <TalentCard
                key={talent.id}
                talent={talent}
                company={isCompany ? currentUser : null}
                onContact={(target) => setContactTarget(target)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            icon={<IconSearch size={24} />}
            title="No profiles match these filters"
            description="Try clearing a filter, searching for a different skill, or removing the minimum match score."
            action={
              <button type="button" className="btn-primary" onClick={clearFilters}>
                Clear all filters
              </button>
            }
          />
        )
      ) : filteredCompanies.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<IconBriefcase size={24} />}
          title="No companies match this search"
          description="Try a different keyword or reset the location filter."
          action={
            <button type="button" className="btn-primary" onClick={clearFilters}>
              Clear all filters
            </button>
          }
        />
      )}

      {/* Create-profile nudge */}
      {tab === 'talent' && talents.length > 0 && (
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-ink-600">
            Not listed yet? Add your skills and get a public profile link you can share anywhere.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/join?as=talent" className="btn-primary btn-sm">
              Join as talent
            </Link>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => notify('Share a public profile link from the S tab once your profile is ready.')}
            >
              How public links work
            </button>
          </div>
        </div>
      )}

      <ContactRequestModal
        open={Boolean(contactTarget)}
        onClose={() => setContactTarget(null)}
        talent={contactTarget}
      />
    </div>
  );
}
