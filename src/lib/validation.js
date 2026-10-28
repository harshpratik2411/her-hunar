import { isValidEmail, isValidPhone, isValidUrl } from './utils.js';

/** Shared form validation for the talent and company account flows. */

export function validateTalent(draft) {
  const errors = {};
  const age = Number(draft.age);

  if (!draft.name?.trim() || draft.name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  if (!draft.age) errors.age = 'Age is required.';
  else if (!Number.isFinite(age) || age < 16 || age > 75) errors.age = 'Enter an age between 16 and 75.';
  if (!draft.occupation?.trim()) errors.occupation = 'Tell us what you do, for example “Sewing & Tailoring”.';
  if (!draft.category) errors.category = 'Choose the closest skill category.';
  if (!draft.skills?.length) errors.skills = 'Add at least one skill so companies can find you.';
  if (!draft.experienceLevel) errors.experienceLevel = 'Select your experience level.';
  if (!draft.experience?.trim() || draft.experience.trim().length < 20)
    errors.experience = 'Describe your experience in at least 20 characters.';
  if (!draft.education?.trim()) errors.education = 'Add your education, or write “Not applicable”.';
  if (!draft.location?.trim()) errors.location = 'Add your city or service area.';
  if (!isValidEmail(draft.email)) errors.email = 'Enter a valid email address.';
  if (!isValidPhone(draft.phone)) errors.phone = 'Enter a phone number with at least 10 digits.';
  if (draft.portfolio?.length && draft.portfolio.some((item) => (item.url ?? '').trim() && !isValidUrl(item.url)))
    errors.portfolio = 'Portfolio links must be valid URLs, or leave them empty.';
  if (draft.password !== undefined && (!draft.password || draft.password.length < 6))
    errors.password = 'Use a password with at least 6 characters (demo only).';
  if (draft.confirmPassword !== undefined && draft.password !== draft.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export function validateCompany(draft) {
  const errors = {};
  const age = Number(draft.age);

  if (!draft.companyName?.trim() || draft.companyName.trim().length < 2)
    errors.companyName = 'Enter your company name (at least 2 characters).';
  if (!draft.contactPerson?.trim()) errors.contactPerson = 'Enter the name of the person hiring.';
  if (!draft.role?.trim()) errors.role = 'Add a role, for example “Hiring Manager”.';
  if (!draft.age) errors.age = 'Age is required.';
  else if (!Number.isFinite(age) || age < 18 || age > 80) errors.age = 'Enter an age between 18 and 80.';
  if (!draft.industry?.trim()) errors.industry = 'Add your industry or sector.';
  if (!draft.location?.trim()) errors.location = 'Add your city or “Remote”.';
  if ((draft.website ?? '').trim() && !isValidUrl(draft.website)) errors.website = 'Enter a valid website URL.';
  if (!draft.about?.trim() || draft.about.trim().length < 30)
    errors.about = 'Describe your company in at least 30 characters.';
  if (!isValidEmail(draft.email)) errors.email = 'Enter a valid email address.';
  if (!isValidPhone(draft.phone)) errors.phone = 'Enter a phone number with at least 10 digits.';
  if (draft.password !== undefined && (!draft.password || draft.password.length < 6))
    errors.password = 'Use a password with at least 6 characters (demo only).';
  if (draft.confirmPassword !== undefined && draft.password !== draft.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export function validateRequirement(requirement) {
  const errors = {};
  if (!requirement.title?.trim() || requirement.title.trim().length < 4)
    errors.title = 'Give the role a clear title (at least 4 characters).';
  if (!requirement.skills?.length) errors.skills = 'Add at least one required skill.';
  if (!requirement.experienceLevel) errors.experienceLevel = 'Select the experience level.';
  if (!requirement.workType?.trim()) errors.workType = 'Add the work type, for example “On-site · Delhi”.';
  if (!requirement.budget?.trim()) errors.budget = 'Add a budget or pay range.';
  if (!requirement.description?.trim() || requirement.description.trim().length < 20)
    errors.description = 'Describe the work in at least 20 characters.';
  return errors;
}

/** Normalises raw form values into the record shape saved in storage. */
export function toTalentRecord(draft) {
  return {
    name: draft.name.trim(),
    age: Number(draft.age),
    occupation: draft.occupation.trim(),
    category: draft.category,
    headline: draft.headline?.trim() || `${draft.occupation.trim()} based in ${draft.location.trim()}`,
    skills: draft.skills,
    experienceLevel: draft.experienceLevel,
    experience: draft.experience.trim(),
    education: draft.education.trim(),
    portfolio: (draft.portfolio ?? []).filter((item) => item.label?.trim() || item.url?.trim()),
    bio: draft.bio?.trim() ?? '',
    location: draft.location.trim(),
    availability: draft.availability?.trim() || 'Flexible',
    languages: draft.languages ?? [],
    email: draft.email.trim(),
    phone: draft.phone.trim(),
  };
}

export function toCompanyRecord(draft) {
  return {
    companyName: draft.companyName.trim(),
    contactPerson: draft.contactPerson.trim(),
    role: draft.role.trim(),
    age: Number(draft.age),
    industry: draft.industry.trim(),
    teamSize: draft.teamSize || '1-10 people',
    location: draft.location.trim(),
    website: draft.website?.trim() ?? '',
    about: draft.about.trim(),
    requirements: draft.requirements ?? [],
    email: draft.email.trim(),
    phone: draft.phone.trim(),
  };
}
