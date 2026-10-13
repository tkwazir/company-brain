import { create } from 'zustand'
import type { AccessDecision, AuditEntry, Floor, QueryResponse, Role } from '../api/types'
import { floors as seedFloors } from '../config/building'

export type QueryStage = 'thinking' | 'routing' | 'governance' | 'beaming' | 'answered' | 'cooldown'

export interface ActiveQuery {
  stage: QueryStage
  question: string
  // All floors this query touches, in a fixed order.
  floorIds: string[]
  // Floors revealed so far during the 'routing' stage (progressive reveal).
  routedFloorIds: string[]
  // Per-floor decisions revealed so far during the 'governance' stage.
  governance: Record<string, { decision: AccessDecision; reason?: string }>
  // Floors currently sending a beam to the feed (granted/masked only).
  beamingFloorIds: string[]
}

export interface FeedMessage {
  id: string
  kind: 'question' | 'answer'
  text?: string
  response?: QueryResponse
  timestamp: string
}

interface BrainState {
  floors: Floor[]
  setFloors: (floors: Floor[]) => void
  addFloor: (floor: Floor) => void

  role: Role
  setRole: (role: Role) => void

  ingesting: boolean
  setIngesting: (value: boolean) => void

  newlyIngestedFloorId: string | null
  setNewlyIngestedFloorId: (id: string | null) => void

  feed: FeedMessage[]
  addFeedMessage: (message: FeedMessage) => void

  activeQuery: ActiveQuery | null
  setActiveQuery: (q: ActiveQuery | null) => void
  updateActiveQuery: (patch: Partial<ActiveQuery>) => void

  hoveredFloorId: string | null
  setHoveredFloorId: (id: string | null) => void

  highlightedFloorId: string | null
  setHighlightedFloorId: (id: string | null) => void

  isAnimating: boolean
  setIsAnimating: (value: boolean) => void

  audit: AuditEntry[]
  addAuditEntries: (entries: AuditEntry[]) => void
}

export const useBrainStore = create<BrainState>((set) => ({
  // Seeded with the same list the mock API starts from, so the building
  // renders immediately instead of waiting on the first getBuilding() call.
  floors: seedFloors,
  setFloors: (floors) => set({ floors }),
  addFloor: (floor) => set((s) => ({ floors: [...s.floors, floor] })),

  role: 'analyst',
  setRole: (role) => set({ role }),

  ingesting: false,
  setIngesting: (ingesting) => set({ ingesting }),

  newlyIngestedFloorId: null,
  setNewlyIngestedFloorId: (newlyIngestedFloorId) => set({ newlyIngestedFloorId }),

  feed: [],
  addFeedMessage: (message) => set((s) => ({ feed: [...s.feed, message] })),

  activeQuery: null,
  setActiveQuery: (activeQuery) => set({ activeQuery }),
  updateActiveQuery: (patch) =>
    set((s) => ({ activeQuery: s.activeQuery ? { ...s.activeQuery, ...patch } : s.activeQuery })),

  hoveredFloorId: null,
  setHoveredFloorId: (hoveredFloorId) => set({ hoveredFloorId }),

  highlightedFloorId: null,
  setHighlightedFloorId: (highlightedFloorId) => set({ highlightedFloorId }),

  isAnimating: true,
  setIsAnimating: (isAnimating) => set({ isAnimating }),

  audit: [],
  addAuditEntries: (entries) => set((s) => ({ audit: [...s.audit, ...entries] })),
}))
