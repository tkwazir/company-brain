import { useState } from 'react'
import { useBrainStore } from '../state/store'
import type { Role } from '../api/types'

const ROLE_ORDER: Role[] = ['analyst', 'vp_finance', 'hr_director', 'ceo']

const ROLE_LABELS: Record<Role, { name: string; title: string; initials: string }> = {
  analyst: { name: 'Jordan Lee', title: 'Analyst', initials: 'JL' },
  vp_finance: { name: 'Priya Shah', title: 'VP Finance', initials: 'PS' },
  hr_director: { name: 'Marcus Reed', title: 'HR Director', initials: 'MR' },
  ceo: { name: 'Alex Rivera', title: 'CEO', initials: 'AR' },
}

interface RoleBadgeProps {
  disabled?: boolean
}

export function RoleBadge({ disabled }: RoleBadgeProps) {
  const role = useBrainStore((s) => s.role)
  const setRole = useBrainStore((s) => s.setRole)
  const [open, setOpen] = useState(false)
  const info = ROLE_LABELS[role]

  function handleSelect(nextRole: Role) {
    setRole(nextRole)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={disabled ? 'Finish the current query before switching roles' : 'Switch role'}
        className="focus-ring flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700">
          {info.initials}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">{info.title}</span>
          <span className="font-medium">{info.name}</span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className={`ml-1 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          {/* Full-screen invisible catcher so clicking anywhere outside closes the menu. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
          >
            {ROLE_ORDER.map((r) => {
              const roleInfo = ROLE_LABELS[r]
              const active = r === role
              return (
                <button
                  key={r}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(r)}
                  className={`focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                    {roleInfo.initials}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-medium">{roleInfo.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">{roleInfo.title}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
