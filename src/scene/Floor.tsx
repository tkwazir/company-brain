import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Floor as FloorData } from '../api/types'
import { useBrainStore } from '../state/store'
import { buildingDimensions, colors } from '../config/theme'

interface FloorProps {
  floor: FloorData
  y: number
  size: number
}

export function Floor({ floor, y, size }: FloorProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const hoveredFloorId = useBrainStore((s) => s.hoveredFloorId)
  const setHoveredFloorId = useBrainStore((s) => s.setHoveredFloorId)
  const isHovered = hoveredFloorId === floor.id
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    const ambientPulse = 0.3 + Math.sin(state.clock.elapsedTime * 0.6 + phase) * 0.08
    mat.emissiveIntensity = isHovered ? 1.1 : ambientPulse
  })

  return (
    <group position={[0, y, 0]}>
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
          color="#0b1322"
          emissive={colors.idle}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.65}
          transparent
          opacity={0.93}
          toneMapped={false}
        />
        <Edges color={isHovered ? colors.active : colors.idle} />
      </mesh>
      {isHovered && (
        <Html position={[size / 2 + 0.25, 0, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-lg border border-cyan-400/30 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-lg shadow-black/40">
            <div className="font-semibold text-cyan-300">{floor.name}</div>
            <div className="mt-0.5 text-slate-400">
              {floor.rowCount.toLocaleString()} rows · {floor.sensitivity}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
