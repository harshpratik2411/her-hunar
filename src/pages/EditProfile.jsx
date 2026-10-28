import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { EmptyState, Field, InfoNote, SkillBadge, useToast } from '../components/ui.jsx';
import PortfolioFields from '../components/PortfolioFields.jsx';
import { EXPERIENCE_LEVELS, SKILL_CATEGORIES, TEAM_SIZES } from '../data/seed.js';
import { toCompanyRecord, toTalentRecord, validateCompany, validateRequirement, validateTalent } from '../lib/validation.js';
import { exportRecordAsMarkdown } from '../lib/export.js';
import { cx, parseList, publicProfilePath } from '../lib/utils.js';
import { IconBriefcase, IconClose, IconDownload, IconPlus, IconUser } from '../components/icons.jsx';

const blankRequirement = () => ({
  id: `req-${Math.random().toString(36).slice(2, 9)}`,
  title: '',
  skillsInput: '',
  experienceLevel: '0-2 years',
  workType: '',
  budget: '',
  description: '',
});

function RequirementCard({ requirement, index, errors, onChange, onRemove, canRemove }) {
  const key = (field) => `req-${index}-${field}`;
  const set = (field, value) => onChange(index, { [field]: value });

  return (
    <div className="rounded-2xl border border-slate-200 bg-mist/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink-900">Role {index + 1}</p>
        {canRemove && (
          <button type="button" className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50" onClick={() => onRemove(index)}>
            <IconClose size={14} />
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-4">
        <Field label="Role title" required error={errors[key('title')]}>
          <input
            className={cx('input', errors[key('title')] && 'input-error')}
            value={requirement.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="e.g. Tailor for our denim capsule line"
          />
        </Field>

        <Field
          label="Skills needed"
          required
          error={errors[key('skills')]}
          hint="Comma separated — used for the skill match score."
        >
          <input
            className={cx('input', errors[key('skills')] && 'input-error')}
            value={requirement.skillsInput}
            onChange={(event) => set('skillsInput', event.target.value)}
            placeholder="Sewing, Tailoring, Pattern Making"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Experience level" required error={errors[key('experienceLevel')]}>
            <select
              className={cx('input', errors[key('experienceLevel')] && 'input-error')}
              value={requirement.experienceLevel}
              onChange={(event) => set('experienceLevel', event.target.value)}
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Work type" required error={errors[key('workType')]}>
            <input
              className={cx('input', errors[key('workType')] && 'input-error')}
              value={requirement.workType}
              onChange={(event) => set('workType', event.target.value)}
              placeholder="e.g. On-site · Delhi"
            />
          </Field>
          <Field label="Budget / pay" required error={errors[key('budget')]}>
            <input
              className={cx('input', errors[key('budget')] && 'input-error')}
              value={requirement.budget}
              onChange={(event) => set('budget', event.target.value)}
              placeholder="e.g. ₹18,000 – ₹24,000 / month"
            />
          </Field>
        </div>

        <Field label="Describe the work" required error={errors[key('description')]}>
          <textarea
            rows={3}
            className={cx('input resize-none', errors[key('description')] && 'input-error')}
            value={requirement.description}
            onChange={(event) => set('description', event.target.value)}
            placeholder="What will the person do, how often, and what support do you provide?"
          />
        </Field>
      </div>
    </div>
  );
}

export default function EditProfile() {
  const { currentUser, isCompany, updateTalent, updateCompany } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();

  const userId = currentUser?.id;

  const [values, setValues] = useState({});
  const [requirements, setRequirements] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.kind === 'company') {
      setValues({
        companyName: currentUser.companyName ?? '',
        contactPerson: currentUser.contactPerson ?? '',
        role: currentUser.role ?? '',
        age: String(currentUser.age ?? ''),
        industry: currentUser.industry ?? '',
        teamSize: currentUser.teamSize ?? '1-10 people',
        location: currentUser.location ?? '',
        website: currentUser.website ?? '',
        about: currentUser.about ?? '',
        email: currentUser.email ?? '',
        phone: currentUser.phone ?? '',
      });
      setRequirements(
        (currentUser.requirements ?? []).map((requirement) => ({
          ...requirement,
          skillsInput: (requirement.skills ?? []).join(', '),
        })),
      );
    } else {
      setValues({
        name: currentUser.name ?? '',
        age: String(currentUser.age ?? ''),
        occupation: currentUser.occupation ?? '',
        category: currentUser.category ?? '',
        headline: currentUser.headline ?? '',
        skillsInput: (currentUser.skills ?? []).join(', '),
        experienceLevel: currentUser.experienceLevel ?? '',
        experience: currentUser.experience ?? '',
        education: currentUser.education ?? '',
        portfolio: currentUser.portfolio?.length ? currentUser.portfolio : [{ label: '', url: '' }],
        bio: currentUser.bio ?? '',
        location: currentUser.location ?? '',
        availability: currentUser.availability ?? '',
        languagesInput: (currentUser.languages ?? []).join(', '),
        email: currentUser.email ?? '',
        phone: currentUser.phone ?? '',
      });
      setRequirements([]);
    }
    setErrors({});
  }, [userId]);

  const parsedSkills = useMemo(() => parseList(values.skillsInput), [values.skillsInput]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const normalisedRequirements = () =>
    requirements.map(({ id, title, skillsInput, experienceLevel, workType, budget, description }) => ({
      id,
      title: title.trim(),
      skills: parseList(skillsInput),
      experienceLevel,
      workType: workType.trim(),
      budget: budget.trim(),
      description: description.trim(),
    }));

  const handleRequirementChange = (index, patch) =>
    setRequirements((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const handleSave = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (isCompany) {
      const draft = { ...values, requirements: normalisedRequirements() };
      Object.assign(nextErrors, validateCompany(draft));
      draft.requirements.forEach((requirement, index) => {
        Object.entries(validateRequirement(requirement)).forEach(([field, message]) => {
          nextErrors[`req-${index}-${field}`] = message;
        });
      });
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        notify('Please fix the highlighted fields before saving.', 'error');
        return;
      }

      setSaving(true);
      const result = updateCompany(userId, toCompanyRecord(draft));
      setSaving(false);
      if (!result.ok) {
        notify(result.error, 'error');
        return;
      }
      notify('Company profile updated.');
      navigate(publicProfilePath(result.record));
      return;
    }

    const draft = {
      ...values,
      skills: parseList(values.skillsInput),
      languages: parseList(values.languagesInput),
    };
    Object.assign(nextErrors, validateTalent(draft));
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify('Please fix the highlighted fields before saving.', 'error');
      return;
    }

    setSaving(true);
    const result = updateTalent(userId, toTalentRecord(draft));
    setSaving(false);
    if (!result.ok) {
      notify(result.error, 'error');
      return;
    }
    notify('Profile updated.');
    navigate(publicProfilePath(result.record));
  };

  if (!currentUser) {
    return (
      <div className="shell py-16">
        <EmptyState
          className="mx-auto max-w-xl"
          icon={<IconUser size={24} />}
          title="You are not signed in"
          description="Log in or create a profile first — you can only edit a profile that is saved in this browser."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/login" className="btn-primary">
                Log in
              </Link>
              <Link to="/join" className="btn-outline">
                Create a profile
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="shell py-10 sm:py-14">
      <header className="mx-auto max-w-3xl">
        <span className="eyebrow">{isCompany ? <IconBriefcase size={14} /> : <IconUser size={14} />}Edit profile</span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">
          {isCompany ? values.companyName || 'Your company' : values.name || 'Your profile'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Changes are saved in this browser immediately and are visible on your public profile link.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={publicProfilePath(currentUser)} className="btn-outline btn-sm">
            View public profile
          </Link>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => {
              exportRecordAsMarkdown(currentUser);
              notify('Profile exported as a .md file.');
            }}
          >
            <IconDownload size={14} />
            Export .md
          </button>
        </div>
      </header>

      <div className="card mx-auto mt-6 max-w-3xl p-6 sm:p-8">
        <form onSubmit={handleSave} className="grid gap-5" noValidate>
          {isCompany ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name" htmlFor="companyName" required error={errors.companyName}>
                  <input
                    id="companyName"
                    className={cx('input', errors.companyName && 'input-error')}
                    value={values.companyName ?? ''}
                    onChange={(event) => setField('companyName', event.target.value)}
                  />
                </Field>
                <Field label="Industry" htmlFor="industry" required error={errors.industry}>
                  <input
                    id="industry"
                    className={cx('input', errors.industry && 'input-error')}
                    value={values.industry ?? ''}
                    onChange={(event) => setField('industry', event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Contact person" htmlFor="contactPerson" required error={errors.contactPerson}>
                  <input
                    id="contactPerson"
                    className={cx('input', errors.contactPerson && 'input-error')}
                    value={values.contactPerson ?? ''}
                    onChange={(event) => setField('contactPerson', event.target.value)}
                  />
                </Field>
                <Field label="Their role" htmlFor="role" required error={errors.role}>
                  <input
                    id="role"
                    className={cx('input', errors.role && 'input-error')}
                    value={values.role ?? ''}
                    onChange={(event) => setField('role', event.target.value)}
                  />
                </Field>
                <Field label="Age" htmlFor="age" required error={errors.age}>
                  <input
                    id="age"
                    type="number"
                    min="18"
                    max="80"
                    className={cx('input', errors.age && 'input-error')}
                    value={values.age ?? ''}
                    onChange={(event) => setField('age', event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Team size" htmlFor="teamSize">
                  <select
                    id="teamSize"
                    className="input"
                    value={values.teamSize ?? '1-10 people'}
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
                    value={values.location ?? ''}
                    onChange={(event) => setField('location', event.target.value)}
                  />
                </Field>
                <Field label="Website" htmlFor="website" error={errors.website}>
                  <input
                    id="website"
                    className={cx('input', errors.website && 'input-error')}
                    value={values.website ?? ''}
                    onChange={(event) => setField('website', event.target.value)}
                  />
                </Field>
              </div>

              <Field label="About the company" htmlFor="about" required error={errors.about}>
                <textarea
                  id="about"
                  rows={4}
                  className={cx('input resize-none', errors.about && 'input-error')}
                  value={values.about ?? ''}
                  onChange={(event) => setField('about', event.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" hint="Your login ID in this demo — cannot be changed here.">
                  <input id="email" className="input bg-mist" value={values.email ?? ''} readOnly />
                </Field>
                <Field label="Phone" htmlFor="phone" required error={errors.phone}>
                  <input
                    id="phone"
                    className={cx('input', errors.phone && 'input-error')}
                    value={values.phone ?? ''}
                    onChange={(event) => setField('phone', event.target.value)}
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-brand-900">Hiring requirements</p>
                    <p className="text-xs text-brand-800/80">
                      These drive the skill match score and the contact requests you can send.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    onClick={() => setRequirements((current) => [...current, blankRequirement()])}
                  >
                    <IconPlus size={14} />
                    Add requirement
                  </button>
                </div>

                {requirements.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-brand-200 bg-white/70 px-4 py-6 text-center text-xs text-ink-500">
                    No requirements yet. Add one so candidates can be matched to your roles.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-4">
                    {requirements.map((requirement, index) => (
                      <RequirementCard
                        key={requirement.id}
                        requirement={requirement}
                        index={index}
                        errors={errors}
                        canRemove={requirements.length > 1}
                        onChange={handleRequirementChange}
                        onRemove={(target) =>
                          setRequirements((current) => current.filter((_, i) => i !== target))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="name" required error={errors.name}>
                  <input
                    id="name"
                    className={cx('input', errors.name && 'input-error')}
                    value={values.name ?? ''}
                    onChange={(event) => setField('name', event.target.value)}
                  />
                </Field>
                <Field label="Age" htmlFor="age" required error={errors.age} hint="Between 16 and 75.">
                  <input
                    id="age"
                    type="number"
                    min="16"
                    max="75"
                    className={cx('input', errors.age && 'input-error')}
                    value={values.age ?? ''}
                    onChange={(event) => setField('age', event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="What do you do?" htmlFor="occupation" required error={errors.occupation}>
                  <input
                    id="occupation"
                    className={cx('input', errors.occupation && 'input-error')}
                    value={values.occupation ?? ''}
                    onChange={(event) => setField('occupation', event.target.value)}
                  />
                </Field>
                <Field label="Skill category" htmlFor="category" required error={errors.category}>
                  <select
                    id="category"
                    className={cx('input', errors.category && 'input-error')}
                    value={values.category ?? ''}
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

              <Field label="Short headline" htmlFor="headline">
                <input
                  id="headline"
                  className="input"
                  value={values.headline ?? ''}
                  onChange={(event) => setField('headline', event.target.value)}
                />
              </Field>

              <Field label="Skills" htmlFor="skills" required error={errors.skills} hint="Comma separated.">
                <input
                  id="skills"
                  className={cx('input', errors.skills && 'input-error')}
                  value={values.skillsInput ?? ''}
                  onChange={(event) => setField('skillsInput', event.target.value)}
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
                    value={values.experienceLevel ?? ''}
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
                <Field label="Availability" htmlFor="availability">
                  <input
                    id="availability"
                    className="input"
                    value={values.availability ?? ''}
                    onChange={(event) => setField('availability', event.target.value)}
                  />
                </Field>
              </div>

              <Field
                label="Describe your experience"
                htmlFor="experience"
                required
                error={errors.experience}
                hint={`${(values.experience ?? '').trim().length} of 20 characters minimum.`}
              >
                <textarea
                  id="experience"
                  rows={4}
                  className={cx('input resize-none', errors.experience && 'input-error')}
                  value={values.experience ?? ''}
                  onChange={(event) => setField('experience', event.target.value)}
                />
              </Field>

              <Field label="Education" htmlFor="education" required error={errors.education}>
                <input
                  id="education"
                  className={cx('input', errors.education && 'input-error')}
                  value={values.education ?? ''}
                  onChange={(event) => setField('education', event.target.value)}
                />
              </Field>

              <PortfolioFields
                items={values.portfolio ?? []}
                onChange={(items) => setField('portfolio', items)}
                error={errors.portfolio}
              />

              <Field label="About you" htmlFor="bio">
                <textarea
                  id="bio"
                  rows={3}
                  className="input resize-none"
                  value={values.bio ?? ''}
                  onChange={(event) => setField('bio', event.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City or service area" htmlFor="location" required error={errors.location}>
                  <input
                    id="location"
                    className={cx('input', errors.location && 'input-error')}
                    value={values.location ?? ''}
                    onChange={(event) => setField('location', event.target.value)}
                  />
                </Field>
                <Field label="Languages" htmlFor="languages" hint="Comma separated.">
                  <input
                    id="languages"
                    className="input"
                    value={values.languagesInput ?? ''}
                    onChange={(event) => setField('languagesInput', event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" hint="Your login ID in this demo — cannot be changed here.">
                  <input id="email" className="input bg-mist" value={values.email ?? ''} readOnly />
                </Field>
                <Field label="Phone" htmlFor="phone" required error={errors.phone}>
                  <input
                    id="phone"
                    className={cx('input', errors.phone && 'input-error')}
                    value={values.phone ?? ''}
                    onChange={(event) => setField('phone', event.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          <InfoNote tone="warn" title="Remember">
            Saving only updates this browser. Anyone opening your public link on another device will not see this
            profile unless the same data exists there.
          </InfoNote>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <Link to={publicProfilePath(currentUser)} className="btn-ghost">
              Discard and view profile
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
