'use client'

import { FormEvent } from 'react'
import { CLIENT_STATUSES, labelClientStatus, type ClientInput, type ClientStatus } from '@/lib/clients/types'

const fieldClass = 'mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none'
const fieldStyle = { background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }

export function ClientEditor({
  title,
  form,
  onChange,
  saving,
  formError,
  onSubmit,
  onClose,
}: {
  title: string
  form: ClientInput
  onChange: (next: ClientInput) => void
  saving: boolean
  formError: string
  onSubmit: (event: FormEvent) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="client-editor-title">
      <button type="button" aria-label="Close editor" className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => { if (!saving) onClose() }} />
      <form onSubmit={onSubmit} className="relative w-full max-w-lg rounded-xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 id="client-editor-title" className="text-lg font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name" value={form.name} autoFocus onChange={value => onChange({ ...form, name: value })} required />
          <Field label="Email" type="email" value={form.email} onChange={value => onChange({ ...form, email: value })} required />
          <Field label="Phone" value={form.phone} onChange={value => onChange({ ...form, phone: value })} />
          <Field label="Company" value={form.company} onChange={value => onChange({ ...form, company: value })} />
          <label className="text-xs sm:col-span-2" style={{ color: '#888' }}>
            Address
            <input
              value={form.address}
              onChange={event => onChange({ ...form, address: event.target.value })}
              maxLength={300}
              className={fieldClass}
              style={fieldStyle}
            />
          </label>
          <label className="text-xs sm:col-span-2" style={{ color: '#888' }}>
            Status
            <select
              value={form.status}
              onChange={event => onChange({ ...form, status: event.target.value as ClientStatus })}
              className={fieldClass}
              style={fieldStyle}
            >
              {CLIENT_STATUSES.map(item => (
                <option key={item} value={item}>{labelClientStatus(item)}</option>
              ))}
            </select>
          </label>
          <label className="text-xs sm:col-span-2" style={{ color: '#888' }}>
            Notes
            <textarea
              value={form.notes}
              onChange={event => onChange({ ...form, notes: event.target.value })}
              rows={3}
              maxLength={2000}
              className={fieldClass}
              style={fieldStyle}
            />
          </label>
        </div>
        {formError ? <p className="text-sm mt-3" style={{ color: '#FF8A8A' }} role="alert">{formError}</p> : null}
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" disabled={saving} onClick={onClose} className="text-sm px-3 py-2 rounded-lg" style={{ color: '#AAA' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: '#886cff', color: '#FFF', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save client'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  autoFocus = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  autoFocus?: boolean
}) {
  return (
    <label className="text-xs" style={{ color: '#888' }}>
      {label}
      <input
        type={type}
        required={required}
        autoFocus={autoFocus}
        value={value}
        onChange={event => onChange(event.target.value)}
        className={fieldClass}
        style={fieldStyle}
      />
    </label>
  )
}
