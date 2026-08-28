import { useId, useState } from 'react'
import { AlertCircle, ChevronDown, Plus, X } from 'lucide-react'

const controlBase =
  'w-full rounded-lg border border-border bg-input text-foreground transition-colors ' +
  'placeholder:text-subtle-foreground hover:border-border-strong ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

/** Label + control + hint/error, wired together with a generated id. */
export function Field({ label, hint, error, required, children, className = '', htmlFor }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-critical" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-critical">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export function Input({ label, hint, error, required, className = '', ...props }) {
  const id = useId()
  const control = (
    <input
      id={id}
      aria-invalid={Boolean(error) || undefined}
      className={`${controlBase} h-10 px-3 text-sm ${error ? 'border-critical' : ''} ${className}`}
      {...props}
    />
  )
  if (!label && !hint && !error) return control
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id}>
      {control}
    </Field>
  )
}

export function Textarea({ label, hint, error, required, rows = 5, className = '', ...props }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        className={`${controlBase} resize-y px-3 py-2.5 text-sm leading-relaxed ${error ? 'border-critical' : ''} ${className}`}
        {...props}
      />
    </Field>
  )
}

export function Select({ label, hint, error, required, options = [], className = '', ...props }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id}>
      <div className="relative">
        <select
          id={id}
          className={`${controlBase} h-10 appearance-none pl-3 pr-9 text-sm ${error ? 'border-critical' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value
            const label_ = typeof opt === 'string' ? opt : opt.label
            return <option key={value} value={value}>{label_}</option>
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </Field>
  )
}

/** Accessible on/off control built on a real checkbox. */
export function Switch({ checked, onChange, label, description, disabled }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${
          checked ? 'border-primary bg-primary' : 'border-border-strong bg-muted'
        }`}
      >
        {/* Knob anchored with left/top rather than a transform, so it stays
            inside the 44px track instead of being laid out at its static
            position and then nudged past the edge. */}
        <span
          className="absolute rounded-full bg-surface shadow transition-[left] duration-150"
          style={{ height: 18, width: 18, top: 2, left: checked ? 22 : 2 }}
        />
      </button>
    </div>
  )
}

/** Chip editor for tags, tech stacks, requirement bullets and results lists. */
export function TagInput({ label, hint, value = [], onChange, placeholder = 'Add and press Enter' }) {
  const [draft, setDraft] = useState('')
  const id = useId()

  const add = () => {
    const next = draft.trim()
    if (!next || value.includes(next)) return setDraft('')
    onChange([...value, next])
    setDraft('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-input p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-foreground/8 py-1 pl-2.5 pr-1 text-xs text-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
        />
      </div>
    </Field>
  )
}

/** Ordered list editor — used for requirements and project results. */
export function ListEditor({ label, hint, value = [], onChange, placeholder = 'Add an item' }) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const next = draft.trim()
    if (!next) return
    onChange([...value, next])
    setDraft('')
  }

  return (
    <Field label={label} hint={hint}>
      <ul className="flex flex-col gap-2">
        {value.map((item, i) => (
          <li key={`${item}-${i}`} className="flex items-start gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <input
              value={item}
              onChange={(e) => {
                const next = [...value]
                next[i] = e.target.value
                onChange(next)
              }}
              className={`${controlBase} h-9 flex-1 px-3 text-sm`}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="mt-1 rounded-md p-1.5 text-muted-foreground hover:bg-foreground/8 hover:text-critical"
              aria-label={`Remove item ${i + 1}`}
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-1 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add() }
          }}
          placeholder={placeholder}
          className={`${controlBase} h-9 flex-1 px-3 text-sm`}
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-strong px-3 text-[0.8125rem] font-medium text-foreground hover:bg-foreground/5"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </Field>
  )
}

export default Field
