import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, Modal, useToast } from './ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { scoreSkills } from '../lib/matching.js';
import { cx } from '../lib/utils.js';

/**
 * Lets a logged-in company contact a candidate about one of its requirements.
 * The message is validated, then stored locally as a contact request.
 */
export default function ContactRequestModal({ open, onClose, talent }) {
  const { currentUser, isCompany, sendRequest } = useApp();
  const { notify } = useToast();

  const requirements = useMemo(() => currentUser?.requirements ?? [], [currentUser]);
  const [requirementId, setRequirementId] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRequirementId(requirements[0]?.id ?? '');
    setMessage(
      talent
        ? `Hello ${talent.name.split(' ')[0]}, we came across your profile on herHunar and would like to discuss an opening with us. Are you available for a short call this week?`
        : '',
    );
    setErrors({});
  }, [open, requirements, talent]);

  const selected = requirements.find((requirement) => requirement.id === requirementId);
  const match = useMemo(
    () => (selected && talent ? scoreSkills(talent.skills, selected.skills) : null),
    [selected, talent],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!selected) nextErrors.requirement = 'Choose which role this request is for.';
    if (message.trim().length < 20) nextErrors.message = 'Please write at least 20 characters so the candidate has context.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const result = sendRequest({
      companyId: currentUser.id,
      talentId: talent.id,
      requirement: selected,
      message: message.trim(),
    });
    setSubmitting(false);

    if (!result.ok) {
      setErrors({ message: result.error });
      return;
    }
    notify(`Contact request sent to ${talent.name}. It is saved in the S menu.`);
    onClose();
  };

  if (!talent) return null;

  const notCompany = !isCompany;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Send a contact request to ${talent.name}`}
      description="Requests are stored in this browser only. The candidate sees them under the S tab when this browser is used."
      footer={
        notCompany ? null : (
          <>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" form="contact-request-form" className="btn-primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </>
        )
      }
    >
      {notCompany ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
          <p className="font-semibold">You are not signed in as a company.</p>
          <p className="mt-1 opacity-90">
            Only company accounts can send contact requests. Log in with a company account, or create one in a minute.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/login" className="btn-primary btn-sm" onClick={onClose}>
              Log in as company
            </Link>
            <Link to="/join?as=company" className="btn-outline btn-sm" onClick={onClose}>
              Create company account
            </Link>
          </div>
        </div>
      ) : (
        <form id="contact-request-form" onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <Field
            label="Which role is this about?"
            htmlFor="requirement"
            required
            error={errors.requirement}
            hint={
              selected
                ? `${selected.skills.length} skills needed · ${selected.workType}`
                : 'Add a hiring requirement to your company profile first.'
            }
          >
            {requirements.length ? (
              <select
                id="requirement"
                className={cx('input', errors.requirement && 'input-error')}
                value={requirementId}
                onChange={(event) => setRequirementId(event.target.value)}
              >
                {requirements.map((requirement) => (
                  <option key={requirement.id} value={requirement.id}>
                    {requirement.title}
                  </option>
                ))}
              </select>
            ) : (
              <Link to="/edit-profile" className="btn-outline w-full" onClick={onClose}>
                Add a hiring requirement
              </Link>
            )}
          </Field>

          {match && (
            <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-xs">
              <p className="font-semibold text-brand-800">
                Skill match for this role: {match.percent}%
              </p>
              {match.matched.length > 0 && (
                <p className="mt-1 text-emerald-700">Matched: {match.matched.join(', ')}</p>
              )}
              {match.missing.length > 0 && <p className="mt-1 text-ink-500">Missing: {match.missing.join(', ')}</p>}
            </div>
          )}

          <Field label="Message" htmlFor="message" required error={errors.message} hint={`${message.trim().length} characters`}>
            <textarea
              id="message"
              rows={5}
              className={cx('input resize-none', errors.message && 'input-error')}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Introduce your company briefly and explain what you need."
            />
          </Field>
        </form>
      )}
    </Modal>
  );
}
