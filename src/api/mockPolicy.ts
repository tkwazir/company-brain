import type { AccessDecision, Floor, Role } from './types'

// Role × domain/sensitivity → access decision. Deliberately binary — every
// role either has access to a floor or doesn't, no partial/masked middle
// state — kept as a flat, readable table since walking through this file is
// part of the demo.
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
      Finance: 'denied',
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

export function decideAccess(role: Role, floor: Floor): AccessDecision {
  const rolePolicy = POLICY[role]
  const domainOverride = rolePolicy.domainOverrides[floor.domain]
  if (domainOverride) return domainOverride
  return rolePolicy[floor.sensitivity]
}

export function reasonFor(floor: Floor, decision: AccessDecision): string | undefined {
  if (decision === 'granted') return undefined
  if (floor.domain === 'HR') return 'HR role required'
  if (floor.domain === 'Finance') return 'Finance role required'
  return 'Restricted — requires a different role'
}
