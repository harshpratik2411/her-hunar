import { Field } from './ui.jsx';
import { IconClose } from './icons.jsx';
import { cx } from '../lib/utils.js';

const MAX_LINKS = 4;

/** Small repeater for portfolio links, shared by the join and edit-profile forms. */
export default function PortfolioFields({ items = [], onChange, error }) {
  const list = items.length ? items : [{ label: '', url: '' }];

  const updateItem = (index, patch) => onChange(list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const addItem = () => onChange([...list, { label: '', url: '' }]);
  const removeItem = (index) => onChange(list.filter((_, i) => i !== index));

  return (
    <Field
      label="Portfolio links"
      error={error}
      hint="Optional. Add work samples or a drive folder link. Leave a row empty to ignore it."
    >
      <div className="grid gap-2">
        {list.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row">
            <input
              className={cx('input sm:max-w-[38%]', error && 'input-error')}
              value={item.label}
              onChange={(event) => updateItem(index, { label: event.target.value })}
              placeholder="Label (e.g. Samples)"
              aria-label={`Portfolio link ${index + 1} label`}
            />
            <input
              className={cx('input flex-1', error && 'input-error')}
              value={item.url}
              onChange={(event) => updateItem(index, { url: event.target.value })}
              placeholder="https://example.com/my-work"
              aria-label={`Portfolio link ${index + 1} URL`}
            />
            {list.length > 1 && (
              <button
                type="button"
                className="btn-ghost btn-sm shrink-0"
                onClick={() => removeItem(index)}
                aria-label={`Remove portfolio link ${index + 1}`}
              >
                <IconClose size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      {list.length < MAX_LINKS && (
        <button type="button" className="btn-outline btn-sm mt-2" onClick={addItem}>
          Add another link
        </button>
      )}
    </Field>
  );
}
