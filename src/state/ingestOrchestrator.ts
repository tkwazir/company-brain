import { brainClient } from '../api/client'
import { useBrainStore } from './store'

// Drives the ingest demo: the user picks a file via the browser's native
// file input (App.tsx), we read only its name — the File object itself is
// never attached to the request or kept anywhere — then run it through the
// pipeline and land a new floor on the center tower, growing it live, same
// pattern as the query orchestrator.
export async function runIngest(fileName: string) {
  const store = useBrainStore.getState()
  if (store.activeQuery || store.ingesting) return // one thing at a time — never break mid-demo

  store.setIngesting(true)
  store.setIsAnimating(false)

  store.addFeedMessage({
    id: crypto.randomUUID(),
    kind: 'question',
    text: `Ingest document: ${fileName}`,
    timestamp: new Date().toISOString(),
  })

  await brainClient.ingest({ sample: false, datasetName: fileName, role: store.role }, (event) => {
    const liveStore = useBrainStore.getState()

    if (event.stage === 'done') {
      liveStore.addFloor(event.floor)
      liveStore.setNewlyIngestedFloorId(event.floor.id)
      liveStore.addFeedMessage({
        id: crypto.randomUUID(),
        kind: 'answer',
        text: `New dataset \`${event.floor.name}\` added · Center · Floor ${event.floor.level + 1} · ${event.floor.rowCount.toLocaleString()} rows`,
        timestamp: new Date().toISOString(),
      })
      setTimeout(() => {
        if (useBrainStore.getState().newlyIngestedFloorId === event.floor.id) {
          useBrainStore.getState().setNewlyIngestedFloorId(null)
        }
      }, 4000)
      return
    }

    liveStore.addFeedMessage({
      id: crypto.randomUUID(),
      kind: 'answer',
      text: event.message,
      timestamp: new Date().toISOString(),
    })
  })

  store.setIngesting(false)
  store.setIsAnimating(true)
}
