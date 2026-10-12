import { useBrainStore } from '../state/store'
import type { Role } from '../api/types'

const ROLE_LABELS: Record<Role, { name: string; title: string; initials: string }> = {
  analyst: { name: 'Jordan Lee', title: 'Analyst', initials: 'JL' },
  vp_finance: { name: 'Priya Shah', title: 'VP Finance', initials: 'PS' },
  hr_director: { name: 'Marcus Reed', title: 'HR Director', initials: 'MR' },
}

// Role switching logic lands with governance (step 5) — this renders the
// static badge for now.
export function RoleBadge() {
  const role = useBrainStore((s) => s.role)
  const info = ROLE_LABELS[role]

  return (
    <button
      type="button"
      disabled
      title="Role switching lands in the next build pass"
      className="focus-ring flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-200 shadow-lg shadow-black/30 backdrop-blur disabled:cursor-default"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-300">
        {info.initials}
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">{info.title}</span>
        <span className="font-medium">{info.name}</span>
      </span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="ml-1 text-slate-500">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
