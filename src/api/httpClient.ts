import type { BrainClient } from './client'

// Stub for the real backend. Not exercised while VITE_USE_MOCK=true.
//
// TODO (backend team): implement against these endpoints —
//   GET  /building              -> Floor[]
//   POST /query                 -> QueryResponse          body: QueryRequest
//   POST /ingest                -> streamed IngestEvent[]  body: IngestRequest
//     (SSE or polling — this client currently assumes SSE via EventSource-style chunks)
const apiUrl = import.meta.env.VITE_API_URL ?? ''

export const httpClient: BrainClient = {
  async getBuilding() {
    const res = await fetch(`${apiUrl}/building`)
    if (!res.ok) throw new Error(`GET /building failed: ${res.status}`)
    return res.json()
  },

  async query(req) {
    const res = await fetch(`${apiUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(`POST /query failed: ${res.status}`)
    return res.json()
  },

  async ingest(req, onEvent) {
    // TODO (backend team): replace with real SSE/polling once /ingest exists.
    const res = await fetch(`${apiUrl}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetName: req.datasetName, sample: req.sample, role: req.role }),
    })
    if (!res.ok) throw new Error(`POST /ingest failed: ${res.status}`)
    const events = await res.json()
    for (const event of events) onEvent(event)
  },
}
