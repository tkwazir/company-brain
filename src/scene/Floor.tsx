import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { AccessDecision, Floor as FloorData } from '../api/types'
import type { ActiveQuery } from '../state/store'
import { useBrainStore } from '../state/store'
import { buildingDimensions, colors } from '../config/theme'
import { floorObjects } from './beamBridge'

interface FloorProps {
  floor: FloorData
  y: number
  size: number
}

const DECISION_COLOR: Record<AccessDecision, string> = {
  granted: colors.granted,
  masked: colors.masked,
  denied: colors.denied,
}

const DECISION_LABEL: Record<AccessDecision, string> = {
  granted: '✓ Granted',
  masked: '◐',
  denied: '✕',
}

interface FloorQueryStatus {
  inQuery: boolean
  isRouting: boolean
  decision?: AccessDecision
  reason?: string
  showLabel: boolean
}

function getFloorQueryStatus(floorId: string, activeQuery: ActiveQuery | null): FloorQueryStatus {
  if (!activeQuery || !activeQuery.floorIds.includes(floorId)) {
    return { inQuery: false, isRouting: false, showLabel: false }
  }
  const gov = activeQuery.governance[floorId]
  const isRouting = !gov && activeQuery.routedFloorIds.includes(floorId)
  return {
    inQuery: true,
    isRouting,
    decision: gov?.decision,
    reason: gov?.reason,
    showLabel: activeQuery.stage === 'governance' && Boolean(gov),
  }
}

export function Floor({ floor, y, size }: FloorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const ambientPhase = useMemo(() => Math.random() * Math.PI * 2, [])

  const hoveredFloorId = useBrainStore((s) => s.hoveredFloorId)
  const setHoveredFloorId = useBrainStore((s) => s.setHoveredFloorId)
  const highlightedFloorId = useBrainStore((s) => s.highlightedFloorId)
  const activeQuery = useBrainStore((s) => s.activeQuery)

  useEffect(() => {
    const obj = groupRef.current
    if (!obj) return
    floorObjects.set(floor.id, obj)
    return () => {
      floorObjects.delete(floor.id)
    }
  }, [floor.id])

  const isHovered = hoveredFloorId === floor.id
  const isHighlighted = highlightedFloorId === floor.id
  const status = getFloorQueryStatus(floor.id, activeQuery)

  useFrame((state, delta) => {
    const mat = matRef.current
    if (!mat) return

    let targetColor: string = colors.idle
    let targetIntensity = 0.05 + Math.sin(state.clock.elapsedTime * 0.6 + ambientPhase) * 0.02

    if (status.decision) {
      targetColor = DECISION_COLOR[status.decision]
      targetIntensity = 1.3
    } else if (status.isRouting) {
      targetColor = colors.active
      targetIntensity = 1.0 + Math.sin(state.clock.elapsedTime * 6) * 0.3
    } else if (isHovered || isHighlighted) {
      targetColor = colors.active
      targetIntensity = 1.1
    }

    const alpha = 1 - Math.exp(-6 * delta)
    mat.emissive.lerp(new THREE.Color(targetColor), alpha)
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, alpha)
  })

  const edgeColor = status.decision
    ? DECISION_COLOR[status.decision]
    : status.isRouting || isHovered || isHighlighted
      ? colors.active
      : colors.idle

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredFloorId(floor.id)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHoveredFloorId(null)
        }}
      >
        <boxGeometry args={[size, buildingDimensions.floorHeight, size]} />
        <meshStandardMaterial
          ref={matRef}
          color="#15110e"
          emissive={colors.idle}
          emissiveIntensity={0.05}
          roughness={0.28}
          metalness={0.6}
          transparent
          opacity={0.93}
          toneMapped={false}
        />
        <Edges color={edgeColor} />
      </mesh>

      {status.isRouting && <EdgeMarker tower={floor.tower} size={size} />}

      {(isHovered || isHighlighted) && !status.inQuery && (
        <Html position={[size / 2 + 0.25, 0, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-lg border border-cyan-400/30 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-lg shadow-black/40">
            <div className="font-semibold text-cyan-300">{floor.name}</div>
            <div className="mt-0.5 text-slate-400">
              {floor.rowCount.toLocaleString()} rows · {floor.sensitivity}
            </div>
          </div>
        </Html>
      )}

      {status.showLabel && status.decision && (
        <Html position={[size / 2 + 0.25, 0.3, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div
            className="whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-lg shadow-black/40"
            style={{
              borderColor: `${DECISION_COLOR[status.decision]}66`,
              backgroundColor: 'rgba(5,7,17,0.9)',
              color: DECISION_COLOR[status.decision],
            }}
          >
            {status.decision === 'granted' ? DECISION_LABEL.granted : `${DECISION_LABEL[status.decision]} ${status.reason ?? ''}`}
          </div>
        </Html>
      )}
    </group>
  )
}

function EdgeMarker({ tower, size }: { tower: FloorData['tower']; size: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const x = tower === 'left' ? -size / 2 - 0.15 : size / 2 + 0.15

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    mat.emissiveIntensity = Math.sin(state.clock.elapsedTime * 10) > 0 ? 3 : 0.4
  })

  return (
    <mesh position={[x, 0, 0]}>
      <sphereGeometry args={[0.08, 10, 10]} />
      <meshStandardMaterial
        ref={matRef}
        color={colors.active}
        emissive={colors.active}
        emissiveIntensity={1}
        toneMapped={false}
      />
    </mesh>
  )
}
