export type Role = 'analyst' | 'vp_finance' | 'hr_director' | 'ceo'
export type Tower = 'left' | 'center' | 'right'
export type Sensitivity = 'public' | 'internal' | 'restricted'
export type AccessDecision = 'granted' | 'denied'

export interface Floor {
  id: string
  tower: Tower
  level: number
  name: string
  domain: string
  sensitivity: Sensitivity
  rowCount: number
}

export interface QueryRequest {
  question: string
  role: Role
}

export interface QueryResponse {
  answer: string
  sql: string
  columns: { name: string; masked: boolean }[]
  rows: (string | number | null)[][]
  sources: { floorId: string; decision: AccessDecision; reason?: string }[]
  audit: AuditEntry[]
}

export interface IngestRequest {
  file?: File
  sample?: boolean
  datasetName: string
  role: Role
}

export type IngestStage = 'extract' | 'validate' | 'clean' | 'transform' | 'load'

export type IngestEvent =
  | { stage: IngestStage; message: string; stats?: Record<string, number> }
  | { stage: 'done'; floor: Floor }

export interface AuditEntry {
  timestamp: string
  role: Role
  floorId: string
  decision: AccessDecision
}
