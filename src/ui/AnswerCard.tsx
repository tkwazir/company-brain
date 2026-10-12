import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AccessDecision, QueryResponse } from '../api/types'
import { floors } from '../config/building'
import { colors } from '../config/theme'
import { useBrainStore } from '../state/store'

const DECISION_COLOR: Record<AccessDecision, string> = {
  granted: colors.granted,
  masked: colors.masked,
  denied: colors.denied,
}

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'JOIN', 'WHERE', 'GROUP', 'BY', 'ORDER', 'LIMIT',
  'AS', 'USING', 'AND', 'BETWEEN', 'DESC', 'ASC', 'SUM', 'AVG', 'COUNT',
])

function highlightSql(sql: string): ReactNode[] {
  const tokens = sql.split(/\b([A-Za-z]+)\b/g)
  return tokens.map((token, i) =>
    SQL_KEYWORDS.has(token.toUpperCase()) ? (
      <span key={i} className="text-cyan-300">
        {token}
      </span>
    ) : (
      <span key={i}>{token}</span>
    ),
  )
}

function governanceSummary(sources: QueryResponse['sources']): string {
  const counts: Record<AccessDecision, number> = { granted: 0, masked: 0, denied: 0 }
  for (const source of sources) counts[source.decision] += 1

  const parts: string[] = []
  if (counts.granted) parts.push(`${counts.granted} granted`)
  if (counts.masked) parts.push(`${counts.masked} masked`)
  if (counts.denied) {
    const deniedFloor = sources.find((s) => s.decision === 'denied')
    const floor = deniedFloor ? floors.find((f) => f.id === deniedFloor.floorId) : undefined
    const detail = floor && deniedFloor?.reason ? ` (${floor.name}, ${deniedFloor.reason})` : ''
    parts.push(`${counts.denied} denied${detail}`)
  }
  return parts.join(' · ')
}

interface AnswerCardProps {
  response: QueryResponse
}

export function AnswerCard({ response }: AnswerCardProps) {
  const [sqlOpen, setSqlOpen] = useState(false)
  const setHighlightedFloorId = useBrainStore((s) => s.setHighlightedFloorId)

  function handleSourceClick(floorId: string) {
    setHighlightedFloorId(floorId)
    setTimeout(() => {
      if (useBrainStore.getState().highlightedFloorId === floorId) {
        setHighlightedFloorId(null)
      }
    }, 2500)
  }

  return (
    <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-700/60 bg-slate-900/80 p-4 text-sm text-slate-100 shadow-lg shadow-black/30">
      <p className="text-slate-100">{response.answer}</p>

      <button
        type="button"
        onClick={() => setSqlOpen((v) => !v)}
        aria-expanded={sqlOpen}
        className="focus-ring mt-3 flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-cyan-300"
      >
        <span className={`transition-transform ${sqlOpen ? 'rotate-90' : ''}`}>▸</span>
        Generated SQL
      </button>
      {sqlOpen && (
        <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80 p-3 font-mono text-[11px] leading-5 text-slate-300">
          {highlightSql(response.sql)}
        </pre>
      )}

      {response.rows.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                {response.columns.map((col) => (
                  <th key={col.name} className="px-3 py-1.5 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {col.name}
                      {col.masked && (
                        <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                          masked
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {response.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-800/60 last:border-0">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-3 py-1.5 ${typeof cell === 'number' ? 'tabular-nums' : ''} ${
                        response.columns[j]?.masked ? 'font-mono text-amber-300' : 'text-slate-200'
                      }`}
                    >
                      {typeof cell === 'number' ? cell.toLocaleString() : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {response.sources.map((source) => {
          const floor = floors.find((f) => f.id === source.floorId)
          if (!floor) return null
          const color = DECISION_COLOR[source.decision]
          return (
            <button
              key={source.floorId}
              type="button"
              onClick={() => handleSourceClick(source.floorId)}
              aria-label={`Highlight ${floor.name} in the building`}
              className="focus-ring rounded-full border px-2.5 py-1 text-[11px] transition hover:brightness-125"
              style={{ borderColor: `${color}55`, color, backgroundColor: `${color}14` }}
            >
              {floor.tower[0]?.toUpperCase()}
              {floor.tower.slice(1)} · Floor {floor.level + 1} · {floor.name}
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-[11px] text-slate-500">{governanceSummary(response.sources)}</p>
    </div>
  )
}
