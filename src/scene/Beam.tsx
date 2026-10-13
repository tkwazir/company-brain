import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useBrainStore } from '../state/store'
import type { ActiveQuery } from '../state/store'
import { colors } from '../config/theme'
import { floorObjects, floorScreenPositions, getFeedAnchorEl } from './beamBridge'

// Renders inside the <Canvas>. Every frame, projects each active floor's
// world position to screen space and stashes it in floorScreenPositions for
// the DOM overlay (below) to read.
export function BeamProjector() {
  const { camera, size } = useThree()
  const vec = useRef(new THREE.Vector3())

  useFrame(() => {
    if (floorObjects.size === 0) return
    floorObjects.forEach((obj, id) => {
      obj.getWorldPosition(vec.current)
      vec.current.project(camera)
      const x = (vec.current.x * 0.5 + 0.5) * size.width
      const y = (-vec.current.y * 0.5 + 0.5) * size.height
      floorScreenPositions.set(id, { x, y })
    })
  })

  return null
}

const DECISION_COLOR: Record<string, string> = {
  granted: colors.granted,
}

// Stable fallback references — a fresh [] / {} literal returned from a
// Zustand selector on every call makes useSyncExternalStore see a "changed"
// snapshot every time, which triggers React's "Maximum update depth
// exceeded" infinite-render-loop crash.
const EMPTY_FLOOR_IDS: string[] = []
const EMPTY_GOVERNANCE: NonNullable<ActiveQuery['governance']> = {}

// Lives outside the <Canvas>, absolutely positioned above it. Reads the
// screen positions written by BeamProjector plus the feed anchor's DOM rect
// on its own rAF loop and writes straight to SVG attributes — no React
// state in the hot path.
export function BeamOverlay() {
  const svgRef = useRef<SVGSVGElement>(null)
  const beamingFloorIds = useBrainStore((s) =>
    s.activeQuery?.stage === 'beaming' ? s.activeQuery.beamingFloorIds : EMPTY_FLOOR_IDS,
  )
  const governance = useBrainStore((s) => s.activeQuery?.governance ?? EMPTY_GOVERNANCE)

  useEffect(() => {
    let raf: number
    const tick = () => {
      const svg = svgRef.current
      const anchor = getFeedAnchorEl()
      if (svg && anchor) {
        const rect = anchor.getBoundingClientRect()
        const targetX = rect.left
        const targetY = rect.top + rect.height / 2
        beamingFloorIds.forEach((id) => {
          const pos = floorScreenPositions.get(id)
          const line = svg.querySelector<SVGLineElement>(`[data-beam="${id}"]`)
          if (pos && line) {
            line.setAttribute('x1', String(pos.x))
            line.setAttribute('y1', String(pos.y))
            line.setAttribute('x2', String(targetX))
            line.setAttribute('y2', String(targetY))
          }
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [beamingFloorIds])

  return (
    <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-[5] h-full w-full">
      {beamingFloorIds.map((id) => {
        const decision = governance[id]?.decision
        const color = decision ? DECISION_COLOR[decision] ?? colors.active : colors.active
        return (
          <line
            key={id}
            data-beam={id}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="7 7"
            opacity={0.75}
            className="beam-flow"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )
      })}
    </svg>
  )
}
