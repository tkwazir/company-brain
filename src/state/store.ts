import { create } from 'zustand'
import type { AccessDecision, AuditEntry, Floor, QueryResponse, Role } from '../api/types'

export type QueryStage = 'idle' | 'thinking' | 'routing' | 'governance' | 'beaming' | 'answered' | 'cooldown'

export interface FloorRouting {
  floorId: string
  decision?: AccessDecision
  reason?: string
}

export interface ActiveQuery {
  stage: QueryStage
  question: string
  routing: FloorRouting[]
  response?: QueryResponse
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

  role: Role
  setRole: (role: Role) => void

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
  floors: [],
  setFloors: (floors) => set({ floors }),

  role: 'analyst',
  setRole: (role) => set({ role }),

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
