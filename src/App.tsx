import { useEffect } from 'react'
import { BuildingScene } from './scene/BuildingScene'
import { RoleBadge } from './ui/RoleBadge'
import { Feed } from './ui/Feed'
import { InputBar } from './ui/InputBar'
import { SuggestedQuestions } from './ui/SuggestedQuestions'
import { useBrainStore } from './state/store'
import { brainClient } from './api/client'
import { runQuery } from './state/queryOrchestrator'

function App() {
  const setFloors = useBrainStore((s) => s.setFloors)
  const isBusy = useBrainStore((s) => s.activeQuery !== null)

  useEffect(() => {
    brainClient.getBuilding().then(setFloors)
  }, [setFloors])

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
            <SuggestedQuestions onSelect={runQuery} disabled={isBusy} />
            <InputBar onSend={runQuery} disabled={isBusy} />
            <button
              type="button"
              disabled
              title="Ingest flow lands in the next build pass"
              className="focus-ring self-start text-sm text-slate-500 opacity-60 disabled:cursor-default"
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
