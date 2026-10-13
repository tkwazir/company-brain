import { brainClient } from '../api/client'
import { useBrainStore } from './store'

const SAMPLE_DATASET_NAME = 'Sample_Contract.pdf'

// Drives the (minimal, no-modal) ingest demo: click "+ Ingest data", a dummy
// document runs through the pipeline, and a new floor lands on the center
// tower — growing it live, same pattern as the query orchestrator.
export async function runIngest() {
  const store = useBrainStore.getState()
  if (store.activeQuery || store.ingesting) return // one thing at a time — never break mid-demo

  store.setIngesting(true)
  store.setIsAnimating(false)

  store.addFeedMessage({
    id: crypto.randomUUID(),
    kind: 'question',
    text: `Ingest sample document: ${SAMPLE_DATASET_NAME}`,
    timestamp: new Date().toISOString(),
  })

  await brainClient.ingest({ sample: true, datasetName: SAMPLE_DATASET_NAME, role: store.role }, (event) => {
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
