import { brainClient } from '../api/client'
import { useBrainStore } from './store'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Drives the full visible sequence for one question: thinking -> routing ->
// governance -> beaming -> answered -> cooldown -> idle. The scene (Floor,
// Beam), the feed, and the camera drift all read this single timeline from
// the store so they stay in sync.
export async function runQuery(question: string) {
  const store = useBrainStore.getState()
  if (store.activeQuery) return // one query at a time — never break mid-demo

  store.addFeedMessage({
    id: crypto.randomUUID(),
    kind: 'question',
    text: question,
    timestamp: new Date().toISOString(),
  })

  store.setIsAnimating(false)
  store.setActiveQuery({
    stage: 'thinking',
    question,
    floorIds: [],
    routedFloorIds: [],
    governance: {},
    beamingFloorIds: [],
  })

  const [, response] = await Promise.all([
    delay(800),
    brainClient.query({ question, role: store.role }),
  ])

  const floorIds = response.sources.map((s) => s.floorId)
  store.updateActiveQuery({ stage: 'routing', floorIds })

  for (const floorId of floorIds) {
    await delay(220)
    const current = useBrainStore.getState().activeQuery
    if (!current) return
    store.updateActiveQuery({ routedFloorIds: [...current.routedFloorIds, floorId] })
  }

  store.updateActiveQuery({ stage: 'governance' })
  for (const source of response.sources) {
    await delay(200)
    const current = useBrainStore.getState().activeQuery
    if (!current) return
    store.updateActiveQuery({
      governance: {
        ...current.governance,
        [source.floorId]: { decision: source.decision, reason: source.reason },
      },
    })
  }

  const beamingFloorIds = response.sources
    .filter((s) => s.decision !== 'denied')
    .map((s) => s.floorId)
  store.updateActiveQuery({ stage: 'beaming', beamingFloorIds })
  await delay(750)

  if (!useBrainStore.getState().activeQuery) return
  store.updateActiveQuery({ stage: 'answered' })
  store.addFeedMessage({
    id: crypto.randomUUID(),
    kind: 'answer',
    response,
    timestamp: new Date().toISOString(),
  })
  store.addAuditEntries(response.audit)

  await delay(3000)
  if (!useBrainStore.getState().activeQuery) return
  store.updateActiveQuery({ stage: 'cooldown' })
  await delay(600)
  store.setActiveQuery(null)
  store.setIsAnimating(true)
}
