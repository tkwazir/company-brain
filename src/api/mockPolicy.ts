import type { AccessDecision, Floor, Role } from './types'

// Role × domain/sensitivity → access decision. Kept as a flat, readable
// table since walking through this file is part of the demo.
interface RolePolicy {
  public: AccessDecision
  internal: AccessDecision
  restricted: AccessDecision
  domainOverrides: Partial<Record<string, AccessDecision>>
}

const POLICY: Record<Role, RolePolicy> = {
  analyst: {
    public: 'granted',
    internal: 'granted',
    restricted: 'denied',
    domainOverrides: {},
  },
  vp_finance: {
    public: 'granted',
    internal: 'granted',
    restricted: 'denied',
    domainOverrides: {
      Finance: 'granted',
      Sales: 'granted',
      HR: 'denied',
    },
  },
  hr_director: {
    public: 'granted',
    internal: 'granted',
    restricted: 'denied',
    domainOverrides: {
      HR: 'granted',
      Finance: 'masked',
    },
  },
  // The CEO sits above the per-domain policy entirely — full access to
  // every floor, restricted vault included, no overrides needed.
  ceo: {
    public: 'granted',
    internal: 'granted',
    restricted: 'granted',
    domainOverrides: {},
  },
}

// One hand-tuned exception for the signature "salary by department" demo
// beat: Finance gets a masked (not fully denied) read on compensation,
// even though HR data is otherwise off-limits to that role.
const FLOOR_OVERRIDES: Partial<Record<Role, Record<string, AccessDecision>>> = {
  vp_finance: { 'hr-compensation': 'masked' },
}

export function decideAccess(role: Role, floor: Floor): AccessDecision {
  const floorOverride = FLOOR_OVERRIDES[role]?.[floor.id]
  if (floorOverride) return floorOverride

  const rolePolicy = POLICY[role]
  const domainOverride = rolePolicy.domainOverrides[floor.domain]
  if (domainOverride) return domainOverride

  return rolePolicy[floor.sensitivity]
}

export function reasonFor(floor: Floor, decision: AccessDecision): string | undefined {
  if (decision === 'granted') return undefined

  if (floor.id === 'hr-compensation' || floor.id === 'payroll') {
    return decision === 'masked' ? 'Salary masked' : 'HR role required'
  }
  if (floor.domain === 'HR') {
    return decision === 'masked' ? 'HR data masked' : 'HR role required'
  }
  if (floor.domain === 'Finance') {
    return decision === 'masked' ? 'Finance figures masked' : 'Finance role required'
  }
  return decision === 'masked' ? 'Partially masked for this role' : 'Restricted — requires a different role'
}
