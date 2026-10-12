import type { Floor, IngestEvent, IngestRequest, QueryRequest, QueryResponse } from './types'
import { mockClient } from './mockClient'
import { httpClient } from './httpClient'

export interface BrainClient {
  getBuilding(): Promise<Floor[]>
  query(req: QueryRequest): Promise<QueryResponse>
  ingest(req: IngestRequest, onEvent: (e: IngestEvent) => void): Promise<void>
}

// UI components never call fetch directly — only this. Flip VITE_USE_MOCK to
// swap in the real backend with no other code changes.
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

export const brainClient: BrainClient = useMock ? mockClient : httpClient
