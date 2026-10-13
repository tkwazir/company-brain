import type {
  AccessDecision,
  AuditEntry,
  Floor,
  IngestEvent,
  QueryRequest,
  QueryResponse,
  Role,
  Tower,
} from './types'
import type { BrainClient } from './client'
import { floors } from './mockData'
import { decideAccess, reasonFor } from './mockPolicy'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock "server-side" counter for where the next ingested floor lands on the
// center tower — starts right above the seeded center floors.
let nextIngestLevel = Math.max(...floors.filter((f) => f.tower === 'center').map((f) => f.level)) + 1

function floorById(id: string): Floor {
  const floor = floors.find((f) => f.id === id)
  if (!floor) throw new Error(`Unknown floor id: ${id}`)
  return floor
}

function buildSources(floorIds: string[], role: Role): QueryResponse['sources'] {
  return floorIds.map((floorId) => {
    const floor = floorById(floorId)
    const decision = decideAccess(role, floor)
    return { floorId, decision, reason: reasonFor(floor, decision) }
  })
}

function buildAudit(sources: QueryResponse['sources'], role: Role): AuditEntry[] {
  const timestamp = new Date().toISOString()
  return sources.map((s) => ({ timestamp, role, floorId: s.floorId, decision: s.decision }))
}

// Default per-tower "also check" floor used to round a query out so every
// prompt visibly touches all three towers, not just the one most relevant
// to the question — the demo beat is seeing beams reach the whole building.
const DEFAULT_TOWER_FLOOR: Record<Tower, string> = {
  left: 'raw-erp',
  center: 'customers',
  right: 'hr-employees',
}

function ensureAllTowers(floorIds: string[]): string[] {
  const present = new Set(floorIds.map((id) => floorById(id).tower))
  const missing = (['left', 'center', 'right'] as Tower[]).filter((t) => !present.has(t))
  return [...floorIds, ...missing.map((t) => DEFAULT_TOWER_FLOOR[t])]
}

interface ScriptedQuestion {
  match: (lowerQuestion: string) => boolean
  floorIds: string[]
  // The floor whose access decision gates whether this answer is shown at
  // all — granted shows the full table, denied withholds it entirely.
  governingFloorId: string
  answer: string
  sql: string
  columns: string[]
  rows: (string | number | null)[][]
}

const SCRIPTED: ScriptedQuestion[] = [
  {
    match: (q) => q.includes('revenue') && q.includes('region'),
    floorIds: ['raw-erp', 'revenue-monthly', 'sales-orders', 'payroll'],
    governingFloorId: 'revenue-monthly',
    answer:
      'Revenue last quarter was led by the West region at $4.2M, with the Northeast close behind at $3.8M.',
    sql: "SELECT region, SUM(amount) AS revenue\nFROM sales_orders\nJOIN revenue_monthly USING (region)\nWHERE quarter = 'Q3'\nGROUP BY region\nORDER BY revenue DESC;",
    columns: ['region', 'revenue'],
    rows: [
      ['West', 4_200_000],
      ['Northeast', 3_800_000],
      ['Midwest', 2_950_000],
      ['South', 2_410_000],
    ],
  },
  {
    match: (q) => q.includes('churn'),
    floorIds: ['raw-crm', 'customers', 'churn-signals', 'performance-reviews'],
    governingFloorId: 'churn-signals',
    answer: 'Fourteen customers churned in September; the highest-LTV loss was Brightline Logistics at $184K.',
    sql: "SELECT customer_name, ltv, churned_at\nFROM customers\nJOIN churn_signals USING (customer_id)\nWHERE churned_at BETWEEN '2026-09-01' AND '2026-09-30'\nORDER BY ltv DESC\nLIMIT 5;",
    columns: ['customer_name', 'ltv', 'churned_at'],
    rows: [
      ['Brightline Logistics', 184_200, '2026-09-11'],
      ['Nordway Retail', 96_400, '2026-09-04'],
      ['Alder & Finch', 71_900, '2026-09-22'],
      ['Caldera Foods', 52_300, '2026-09-18'],
      ['Pinehurst Clinics', 38_750, '2026-09-27'],
    ],
  },
  {
    match: (q) => q.includes('salary'),
    floorIds: ['raw-erp', 'finance-budgets', 'hr-employees', 'hr-compensation'],
    governingFloorId: 'hr-compensation',
    answer: 'Average salary by department ranges from $78K in Support to $146K in Engineering.',
    sql: 'SELECT department, AVG(salary) AS avg_salary\nFROM hr_compensation\nJOIN hr_employees USING (employee_id)\nGROUP BY department\nORDER BY avg_salary DESC;',
    columns: ['department', 'avg_salary'],
    rows: [
      ['Engineering', 146_000],
      ['Product', 128_500],
      ['Sales', 112_000],
      ['Marketing', 98_200],
      ['Support', 78_400],
    ],
  },
  {
    match: (q) => q.includes('margin') && q.includes('product'),
    floorIds: ['raw-inventory', 'margin-by-product', 'inventory', 'executive-equity'],
    governingFloorId: 'margin-by-product',
    answer:
      'Top margin product this year is the Atlas Pro bundle at 61% gross margin, followed by the Nimbus subscription tier at 57%.',
    sql: 'SELECT product_name, gross_margin_pct\nFROM margin_by_product\nORDER BY gross_margin_pct DESC\nLIMIT 5;',
    columns: ['product_name', 'gross_margin_pct'],
    rows: [
      ['Atlas Pro Bundle', 61],
      ['Nimbus Subscription', 57],
      ['Fieldwork Kit', 52],
      ['Horizon Add-on', 49],
      ['Baseline Plan', 41],
    ],
  },
]

const KEYWORD_FLOORS: [string[], string[]][] = [
  [['sale', 'order', 'revenue'], ['sales-orders', 'revenue-monthly']],
  [['customer', 'churn'], ['customers', 'churn-signals']],
  [['marketing', 'campaign', 'spend'], ['marketing-spend']],
  [['support', 'ticket'], ['support-tickets']],
  [['inventory', 'stock'], ['inventory']],
  [['hr', 'employee', 'headcount', 'salary', 'compensation', 'payroll'], ['hr-employees', 'hr-compensation']],
  [['vendor', 'contract'], ['vendor-contracts']],
  [['product', 'margin'], ['margin-by-product', 'product-catalog']],
]

function genericFallback(lowerQuestion: string): ScriptedQuestion {
  const hit = KEYWORD_FLOORS.find(([keywords]) => keywords.some((k) => lowerQuestion.includes(k)))
  const floorIds = hit?.[1] ?? ['customers', 'sales-orders']

  return {
    match: () => true,
    floorIds,
    governingFloorId: floorIds[floorIds.length - 1],
    answer:
      "That's a plausible read based on the datasets that matched your question — wire up the real backend to replace this with a live answer.",
    sql: `SELECT *\nFROM ${floorIds.join('_and_')}\nLIMIT 10;`,
    columns: ['metric', 'value'],
    rows: [['estimate', 'See sources below for the datasets used']],
  }
}

function resolveScripted(question: string): ScriptedQuestion {
  const lower = question.toLowerCase()
  return SCRIPTED.find((s) => s.match(lower)) ?? genericFallback(lower)
}

export const mockClient: BrainClient = {
  async getBuilding() {
    await delay(250)
    return floors
  },

  async query({ question, role }: QueryRequest): Promise<QueryResponse> {
    const scripted = resolveScripted(question)
    await delay(900)

    const floorIds = ensureAllTowers(scripted.floorIds)
    const sources = buildSources(floorIds, role)
    const audit = buildAudit(sources, role)

    const governingSource = sources.find((s) => s.floorId === scripted.governingFloorId)
    const governingDecision: AccessDecision = governingSource?.decision ?? 'denied'

    const columns = scripted.columns.map((name) => ({ name, masked: false }))

    let rows: (string | number | null)[][] = []
    let answer = scripted.answer

    if (governingDecision === 'denied') {
      const floor = floorById(scripted.governingFloorId)
      answer = `Access denied: this answer needs ${floor.name} (${floor.domain}), which your current role (${role.replace('_', ' ')}) can't see.`
      rows = []
    } else {
      rows = scripted.rows
    }

    return {
      answer,
      sql: scripted.sql,
      columns,
      rows,
      sources,
      audit,
    }
  },

  async ingest(req, onEvent: (event: IngestEvent) => void) {
    const datasetName = req.datasetName || 'Sample_Document'

    await delay(450)
    onEvent({ stage: 'extract', message: `Extracted 1,240 rows from ${datasetName}`, stats: { rows: 1240 } })

    await delay(550)
    onEvent({ stage: 'validate', message: 'Validated: 18 nulls found', stats: { nulls: 18 } })

    await delay(550)
    onEvent({
      stage: 'clean',
      message: 'Cleaned: 6 duplicates removed, 18 nulls imputed',
      stats: { duplicates: 6, imputed: 18 },
    })

    await delay(550)
    onEvent({ stage: 'transform', message: 'Transformed: 3 columns standardized', stats: { columns: 3 } })

    await delay(450)
    const level = nextIngestLevel
    nextIngestLevel += 1
    const floor: Floor = {
      id: `ingest-${level}`,
      tower: 'center',
      level,
      name: datasetName,
      domain: 'Ops',
      sensitivity: 'internal',
      rowCount: 1_240,
    }
    onEvent({ stage: 'load', message: `Loaded to Center · Floor ${level + 1}` })

    await delay(350)
    onEvent({ stage: 'done', floor })
  },
}
