import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Floor as FloorData } from '../api/types'
import type { TowerId } from '../config/theme'
import { buildingDimensions, colors } from '../config/theme'
import { floorsByTower } from '../config/building'
import { Floor } from './Floor'
import { CornerBeacons } from './Beacon'

interface FloorLayout {
  floor: FloorData
  y: number
  size: number
}

function computeLayout(floors: FloorData[], towerId: TowerId) {
  const { floorHeight, floorGap, baseSize, setbackEvery, setbackFactor } = buildingDimensions
  let y = 0
  const layout: FloorLayout[] = []
  floors.forEach((floor, i) => {
    const shrinkSteps = Math.floor(i / setbackEvery[towerId])
    const size = baseSize[towerId] * Math.pow(setbackFactor, shrinkSteps)
    layout.push({ floor, y: y + floorHeight / 2, size })
    y += floorHeight + floorGap
  })
  return { layout, totalHeight: y - floorGap }
}

const BEACON_PHASE: Record<TowerId, number> = { left: 0, center: 0.8, right: 1.6 }

export function Tower({ towerId }: { towerId: TowerId }) {
  const floors = useMemo(() => floorsByTower(towerId), [towerId])
  const { layout, totalHeight } = useMemo(() => computeLayout(floors, towerId), [floors, towerId])
  const x = buildingDimensions.towerSpacing[towerId]
  const topSize = layout[layout.length - 1]?.size ?? buildingDimensions.baseSize[towerId]

  return (
    <group position={[x, 0, 0]}>
      {layout.map(({ floor, y, size }) => (
        <Floor key={floor.id} floor={floor} y={y} size={size} />
      ))}
      <WindowField layout={layout} />
      <CornerBeacons y={totalHeight} size={topSize} phase={BEACON_PHASE[towerId]} />
      {towerId === 'center' && (
        <LightSweep totalHeight={totalHeight} width={buildingDimensions.baseSize.center} />
      )}
    </group>
  )
}

interface WindowInstance {
  x: number
  y: number
  z: number
  rotY: number
  seed: number
}

function buildInstances(layout: FloorLayout[]): WindowInstance[] {
  const { windowsPerFloorSide, windowRows, floorHeight } = buildingDimensions
  const list: WindowInstance[] = []
  layout.forEach(({ y, size }) => {
    const half = size / 2
    const rowHeight = floorHeight / (windowRows + 1)
    for (let row = 0; row < windowRows; row++) {
      const wy = y - floorHeight / 2 + rowHeight * (row + 1)
      for (let col = 0; col < windowsPerFloorSide; col++) {
        const t = (col + 0.5) / windowsPerFloorSide - 0.5
        const offset = t * size * 0.8
        list.push({ x: offset, y: wy, z: half + 0.01, rotY: 0, seed: Math.random() })
        list.push({ x: offset, y: wy, z: -half - 0.01, rotY: Math.PI, seed: Math.random() })
        list.push({ x: half + 0.01, y: wy, z: offset, rotY: Math.PI / 2, seed: Math.random() })
        list.push({ x: -half - 0.01, y: wy, z: offset, rotY: -Math.PI / 2, seed: Math.random() })
      }
    }
  })
  return list
}

// A single instanced mesh for every window on this tower. Lit/dim state is
// baked into the instance color buffer; a handful of instances flicker each
// frame by mutating that same buffer rather than touching React state.
function WindowField({ layout }: { layout: FloorLayout[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const instances = useMemo(() => buildInstances(layout), [layout])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    instances.forEach((inst, i) => {
      dummy.position.set(inst.x, inst.y, inst.z)
      dummy.rotation.set(0, inst.rotY, 0)
      dummy.scale.set(0.16, 0.14, 0.02)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      color.set(inst.seed > 0.4 ? colors.windowLit : colors.windowDim)
      mesh.setColorAt(i, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [instances])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || !mesh.instanceColor || instances.length === 0) return
    const t = state.clock.elapsedTime
    const color = new THREE.Color()
    const flickerCount = 6
    for (let k = 0; k < flickerCount; k++) {
      const idx = Math.floor((Math.sin(t * 0.3 + k * 13.7) * 0.5 + 0.5) * instances.length) % instances.length
      const inst = instances[idx]
      const on = Math.sin(t * 2 + inst.seed * 60) > 0
      color.set(on ? colors.windowLit : colors.windowDim)
      mesh.setColorAt(idx, color)
    }
    mesh.instanceColor.needsUpdate = true
  })

  if (instances.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, instances.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial toneMapped={false} />
    </instancedMesh>
  )
}

// A faint shimmer that travels up the center tower every ~8s.
function LightSweep({ totalHeight, width }: { totalHeight: number; width: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const mesh = meshRef.current
    const mat = matRef.current
    if (!mesh || !mat) return
    const period = 8
    const progress = (state.clock.elapsedTime % period) / period
    mesh.position.y = progress * totalHeight
    mat.opacity = Math.sin(progress * Math.PI) * 0.4
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width * 1.1, width * 1.1]} />
      <meshBasicMaterial ref={matRef} color={colors.active} transparent opacity={0} toneMapped={false} />
    </mesh>
  )
}
