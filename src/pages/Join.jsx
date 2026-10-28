import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Field, InfoNote, SkillBadge, useToast } from '../components/ui.jsx';
import PortfolioFields from '../components/PortfolioFields.jsx';
import { EXPERIENCE_LEVELS, SKILL_CATEGORIES, TEAM_SIZES } from '../data/seed.js';
import { toCompanyRecord, toTalentRecord, validateCompany, validateTalent } from '../lib/validation.js';
import { cx, parseList, publicProfilePath } from '../lib/utils.js';
import { IconArrowRight, IconBriefcase, IconSparkles, IconUser } from '../components/icons.jsx';

const blankTalent = {
  name: '',
  age: '',
  occupation: '',
  category: '',
  headline: '',
  skillsInput: '',
  experienceLevel: '',
  experience: '',
  education: '',
  portfolio: [{ label: '', url: '' }],
  bio: '',
  location: '',
  availability: '',
  languagesInput: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const blankCompany = {
  companyName: '',
  contactPerson: '',
  role: '',
  age: '',
  industry: '',
  teamSize: '1-10 people',
  location: '',
  website: '',
  about: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const [accountType, setAccountType] = useState('talent');
  const [values, setValues] = useState(blankTalent);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { currentUser, isCompany: signedInAsCompany, registerTalent, registerCompany } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const requested = searchParams.get('as');
    if (requested === 'company' || requested === 'talent') setAccountType(requested);
  }, [searchParams]);

  const switchType = (type) => {
    setAccountType(type);
    setValues(type === 'company' ? blankCompany : blankTalent);
    setErrors({});
  };

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const parsedSkills = useMemo(() => parseList(values.skillsInput), [values.skillsInput]);

  const buildTalentDraft = () => ({
    ...values,
    skills: parseList(values.skillsInput),
    languages: parseList(values.languagesInput),
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const draft = accountType === 'company' ? values : buildTalentDraft();
    const nextErrors = accountType === 'company' ? validateCompany(draft) : validateTalent(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      notify('Please fix the highlighted fields before continuing.', 'error');
      return;
    }

    setSubmitting(true);
    const result =
      accountType === 'company'
        ? registerCompany({ ...toCompanyRecord(draft), password: draft.password })
        : registerTalent({ ...toTalentRecord(draft), password: draft.password });
    setSubmitting(false);

    if (!result.ok) {
      setErrors({ email: result.error });
      notify(result.error, 'error');
      return;
    }

    notify('Profile created. You are now signed in on this browser.');
    navigate(publicProfilePath(result.record));
  };

  if (currentUser) {
    return (
      <div className="shell py-16">
        <div className="card mx-auto max-w-xl p-8 text-center">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            {signedInAsCompany ? <IconBriefcase size={24} /> : <IconUser size={24} />}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink-900">You are already signed in</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            This browser is signed in as{' '}
            <strong className="text-ink-700">{signedInAsCompany ? currentUser.companyName : currentUser.name}</strong>.
            Log out from the S tab first if you want to create a second demo profile.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to={publicProfilePath(currentUser)} className="btn-primary">
              View my public profile
            </Link>
            <Link to="/edit-profile" className="btn-outline">
              Edit my profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-10 sm:py-14">
      <header className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">
          <IconSparkles size={14} />
          Create an account
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Join herHunar in under a minute
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
          Pick how you want to use the platform. Everything you enter is saved in this browser only — no server, no
          database, no sign-up email required.
        </p>
      </header>

      <div className="mx-auto mt-8 flex max-w-md rounded-xl bg-mist p-1">
        {[
          { value: 'talent', label: 'I offer skills', icon: <IconUser size={15} /> },
          { value: 'company', label: 'I am hiring', icon: <IconBriefcase size={15} /> },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => switchType(item.value)}
            className={cx(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition',
              accountType === item.value ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="card mx-auto mt-6 max-w-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-ink-900">
          {accountType === 'company' ? 'Company profile' : 'Talent profile'}
        </h2>
        <p className="mt-1 mb-6 text-sm text-ink-500">
          {accountType === 'company'
            ? 'Tell candidates who you are and what you are hiring for.'
            : 'Show what you can do — your skills are what companies search for.'}
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
          {accountType === 'talent' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="name" required error={errors.name}>
                  <input
                    id="name"
                    className={cx('input', errors.name && 'input-error')}
                    value={values.name}
                    onChange={(event) => setField('name', event.target.value)}
                    placeholder="e.g. Shagun Diwedi"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Age" htmlFor="age" required error={errors.age} hint="Between 16 and 75.">
                  <input
                    id="age"
                    type="number"
                    min="16"
                    max="75"
                    className={cx('input', errors.age && 'input-error')}
                    value={values.age}
                    onChange={(event) => setField('age', event.target.value)}
                    placeholder="e.g. 21"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="What do you do?" htmlFor="occupation" required error={errors.occupation}>
                  <input
                    id="occupation"
                    className={cx('input', errors.occupation && 'input-error')}
                    value={values.occupation}
                    onChange={(event) => setField('occupation', event.target.value)}
                    placeholder="e.g. Sewing & Tailoring"
                  />
                </Field>
                <Field label="Skill category" htmlFor="category" required error={errors.category}>
                  <select
                    id="category"
                    className={cx('input', errors.category && 'input-error')}
                    value={values.category}
                    onChange={(event) => setField('category', event.target.value)}
                  >
                    <option value="">Choose a category</option>
                    {SKILL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label="Short headline"
                htmlFor="headline"
                hint="Optional. Appears at the top of your public profile."
              >
                <input
                  id="headline"
                  className="input"
                  value={values.headline}
                  onChange={(event) => setField('headline', event.target.value)}
                  placeholder="e.g. Tailor and pattern maker for everyday and occasion wear"
                />
              </Field>

              <Field
                label="Skills"
                htmlFor="skills"
                required
                error={errors.skills}
                hint="Separate each skill with a comma — these are what companies match against."
              >
                <input
                  id="skills"
                  className={cx('input', errors.skills && 'input-error')}
                  value={values.skillsInput}
                  onChange={(event) => setField('skillsInput', event.target.value)}
                  placeholder="Sewing, Tailoring, Pattern Making"
                />
              </Field>

              {parsedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {parsedSkills.map((skill) => (
                    <SkillBadge key={skill}>{skill}</SkillBadge>
                  ))}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Experience level" htmlFor="experienceLevel" required error={errors.experienceLevel}>
                  <select
                    id="experienceLevel"
                    className={cx('input', errors.experienceLevel && 'input-error')}
                    value={values.experienceLevel}
                    onChange={(event) => setField('experienceLevel', event.target.value)}
                  >
                    <option value="">Select experience</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Availability" htmlFor="availability" hint="Optional.">
                  <input
                    id="availability"
                    className="input"
                    value={values.availability}
                    onChange={(event) => setField('availability', event.target.value)}
                    placeholder="e.g. Part-time · Flexible hours"
                  />
                </Field>
              </div>

              <Field
                label="Describe your experience"
                htmlFor="experience"
                required
                error={errors.experience}
                hint={`${values.experience.trim().length} of 20 characters minimum.`}
              >
                <textarea
                  id="experience"
                  rows={4}
                  className={cx('input resize-none', errors.experience && 'input-error')}
                  value={values.experience}
                  onChange={(event) => setField('experience', event.target.value)}
                  placeholder="What kind of work have you done, for how long, and what are you good at?"
                />
              </Field>

              <Field
                label="Education"
                htmlFor="education"
                required
                error={errors.education}
                hint="Write “Not applicable” if you learned on the job."
              >
                <input
                  id="education"
                  className={cx('input', errors.education && 'input-error')}
                  value={values.education}
                  onChange={(event) => setField('education', event.target.value)}
                  placeholder="e.g. Diploma in Fashion Design, ITI Lucknow"
                />
              </Field>

              <PortfolioFields
                items={values.portfolio}
                onChange={(items) => setField('portfolio', items)}
                error={errors.portfolio}
              />

              <Field label="About you" htmlFor="bio" hint="Optional. Two or three lines are enough.">
                <textarea
                  id="bio"
                  rows={3}
                  className="input resize-none"
                  value={values.bio}
                  onChange={(event) => setField('bio', event.target.value)}
                  placeholder="A short introduction in your own words."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City or service area" htmlFor="location" required error={errors.location}>
                  <input
                    id="location"
                    className={cx('input', errors.location && 'input-error')}
                    value={values.location}
                    onChange={(event) => setField('location', event.target.value)}
                    placeholder="e.g. Lucknow, Uttar Pradesh"
                  />
                </Field>
                <Field label="Languages" htmlFor="languages" hint="Comma separated. Optional.">
                  <input
                    id="languages"
                    className="input"
                    value={values.languagesInput}
                    onChange={(event) => setField('languagesInput', event.target.value)}
                    placeholder="Hindi, English"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" required error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    className={cx('input', errors.email && 'input-error')}
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" htmlFor="phone" required error={errors.phone}>
                  <input
                    id="phone"
                    className={cx('input', errors.phone && 'input-error')}
                    value={values.phone}
                    onChange={(event) => setField('phone', event.target.value)}
                    placeholder="+91 90000 00000"
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name" htmlFor="companyName" required error={errors.companyName}>
                  <input
                    id="companyName"
                    className={cx('input', errors.companyName && 'input-error')}
                    value={values.companyName}
                    onChange={(event) => setField('companyName', event.target.value)}
                    placeholder="e.g. NovaCraft Studio"
                  />
                </Field>
                <Field label="Industry" htmlFor="industry" required error={errors.industry}>
                  <input
                    id="industry"
                    className={cx('input', errors.industry && 'input-error')}
                    value={values.industry}
                    onChange={(event) => setField('industry', event.target.value)}
                    placeholder="e.g. Retail & Lifestyle"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Contact person" htmlFor="contactPerson" required error={errors.contactPerson}>
                  <input
                    id="contactPerson"
                    className={cx('input', errors.contactPerson && 'input-error')}
                    value={values.contactPerson}
                    onChange={(event) => setField('contactPerson', event.target.value)}
                    placeholder="e.g. Vidhan Mishra"
                  />
                </Field>
                <Field label="Their role" htmlFor="role" required error={errors.role}>
                  <input
                    id="role"
                    className={cx('input', errors.role && 'input-error')}
                    value={values.role}
                    onChange={(event) => setField('role', event.target.value)}
                    placeholder="e.g. Hiring Manager"
                  />
                </Field>
                <Field label="Age" htmlFor="age" required error={errors.age} hint="18 to 80.">
                  <input
                    id="age"
                    type="number"
                    min="18"
                    max="80"
                    className={cx('input', errors.age && 'input-error')}
                    value={values.age}
                    onChange={(event) => setField('age', event.target.value)}
                    placeholder="e.g. 24"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Team size" htmlFor="teamSize">
                  <select
                    id="teamSize"
                    className="input"
                    value={values.teamSize}
                    onChange={(event) => setField('teamSize', event.target.value)}
                  >
                    {TEAM_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Location" htmlFor="location" required error={errors.location}>
                  <input
                    id="location"
                    className={cx('input', errors.location && 'input-error')}
                    value={values.location}
                    onChange={(event) => setField('location', event.target.value)}
                    placeholder="City or “Remote”"
                  />
                </Field>
                <Field label="Website" htmlFor="website" error={errors.website} hint="Optional.">
                  <input
                    id="website"
                    className={cx('input', errors.website && 'input-error')}
                    value={values.website}
                    onChange={(event) => setField('website', event.target.value)}
                    placeholder="https://example.com"
                  />
                </Field>
              </div>

              <Field
                label="About the company"
                htmlFor="about"
                required
                error={errors.about}
                hint={`${values.about.trim().length} of 30 characters minimum.`}
              >
                <textarea
                  id="about"
                  rows={4}
                  className={cx('input resize-none', errors.about && 'input-error')}
                  value={values.about}
                  onChange={(event) => setField('about', event.target.value)}
                  placeholder="What does your company do, and what kind of people do you hire?"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" required error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    className={cx('input', errors.email && 'input-error')}
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    placeholder="hiring@example.com"
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" htmlFor="phone" required error={errors.phone}>
                  <input
                    id="phone"
                    className={cx('input', errors.phone && 'input-error')}
                    value={values.phone}
                    onChange={(event) => setField('phone', event.target.value)}
                    placeholder="+91 98110 00000"
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" htmlFor="password" required error={errors.password} hint="Demo only — at least 6 characters.">
              <input
                id="password"
                type="password"
                className={cx('input', errors.password && 'input-error')}
                value={values.password}
                onChange={(event) => setField('password', event.target.value)}
                placeholder="••••••"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
              <input
                id="confirmPassword"
                type="password"
                className={cx('input', errors.confirmPassword && 'input-error')}
                value={values.confirmPassword}
                onChange={(event) => setField('confirmPassword', event.target.value)}
                placeholder="••••••"
                autoComplete="new-password"
              />
            </Field>
          </div>

          <InfoNote tone="warn" title="Where this data is stored">
            Your profile is saved in this browser's localStorage. Nobody else can see it automatically, and it will not
            appear on another device or browser. Use the <strong>S</strong> tab to copy your public profile link or
            export a .md copy.
          </InfoNote>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create my profile'}
              {!submitting && <IconArrowRight size={16} />}
            </button>
            <Link to="/login" className="btn-ghost">
              I already have an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
