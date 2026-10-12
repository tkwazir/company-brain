import { useEffect } from 'react'
import { BuildingScene } from './scene/BuildingScene'
import { RoleBadge } from './ui/RoleBadge'
import { Feed } from './ui/Feed'
import { InputBar } from './ui/InputBar'
import { SuggestedQuestions } from './ui/SuggestedQuestions'
import { useBrainStore } from './state/store'
import { brainClient } from './api/client'
import type { AccessDecision } from './api/types'

function summarizeGovernance(sources: { decision: AccessDecision }[]): string {
  const counts: Record<AccessDecision, number> = { granted: 0, masked: 0, denied: 0 }
  for (const source of sources) counts[source.decision] += 1

  const parts: string[] = []
  if (counts.granted) parts.push(`${counts.granted} granted`)
  if (counts.masked) parts.push(`${counts.masked} masked`)
  if (counts.denied) parts.push(`${counts.denied} denied`)
  return parts.join(' · ')
}

function App() {
  const addFeedMessage = useBrainStore((s) => s.addFeedMessage)
  const setFloors = useBrainStore((s) => s.setFloors)
  const role = useBrainStore((s) => s.role)

  useEffect(() => {
    brainClient.getBuilding().then(setFloors)
  }, [setFloors])

  // Step 4 replaces this with the full routing -> governance -> beam ->
  // answer-card sequence. For now it proves the data layer end-to-end.
  async function handleAsk(text: string) {
    addFeedMessage({
      id: crypto.randomUUID(),
      kind: 'question',
      text,
      timestamp: new Date().toISOString(),
    })

    const response = await brainClient.query({ question: text, role })

    addFeedMessage({
      id: crypto.randomUUID(),
      kind: 'answer',
      text: `${response.answer}\n\n${summarizeGovernance(response.sources)}`,
      response,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050711] text-slate-100">
      <BuildingScene />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <header className="pointer-events-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-200">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-300">
              ◆
            </span>
            Company Brain
          </div>
          <RoleBadge />
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex-1" />
          <div className="pointer-events-auto flex min-h-0 w-full max-w-[460px] flex-col gap-3 p-6 lg:w-[40%]">
            <Feed />
            <SuggestedQuestions onSelect={handleAsk} />
            <InputBar onSend={handleAsk} />
            <button
              type="button"
              disabled
              title="Ingest flow lands in the next build pass"
              className="self-start text-sm text-slate-500 opacity-60"
            >
              + Ingest data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
