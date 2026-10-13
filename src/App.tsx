import { useEffect } from 'react'
import { BuildingScene } from './scene/BuildingScene'
import { RoleBadge } from './ui/RoleBadge'
import { Feed } from './ui/Feed'
import { InputBar } from './ui/InputBar'
import { SuggestedQuestions } from './ui/SuggestedQuestions'
import { useBrainStore } from './state/store'
import { brainClient } from './api/client'
import { runQuery } from './state/queryOrchestrator'
import { runIngest } from './state/ingestOrchestrator'

function App() {
  const setFloors = useBrainStore((s) => s.setFloors)
  const isQuerying = useBrainStore((s) => s.activeQuery !== null)
  const isIngesting = useBrainStore((s) => s.ingesting)
  const isBusy = isQuerying || isIngesting

  useEffect(() => {
    brainClient.getBuilding().then(setFloors)
  }, [setFloors])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#eef0f2] text-slate-900">
      <BuildingScene />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <header className="pointer-events-auto grid grid-cols-3 items-center px-6 py-4">
          <div />
          <div className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-base text-white">
              ◆
            </span>
            Company Brain
          </div>
          <div className="flex justify-end">
            <RoleBadge disabled={isBusy} />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex-1" />
          <div className="pointer-events-auto flex min-h-0 w-full max-w-[460px] flex-col gap-3 p-6 lg:w-[40%]">
            <Feed />
            <SuggestedQuestions onSelect={runQuery} disabled={isBusy} />
            <InputBar onSend={runQuery} disabled={isBusy} />
            <button
              type="button"
              onClick={runIngest}
              disabled={isBusy}
              title="Ingest a sample document into the center tower"
              className="focus-ring self-end text-sm text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300"
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
