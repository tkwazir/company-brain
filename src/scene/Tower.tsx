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
        <>
          <LightSweep totalHeight={totalHeight} width={buildingDimensions.baseSize.center} />
          <AntennaSpires y={totalHeight} />
        </>
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

// A single instanced mesh for every window on this tower: a clean, mostly
// static cool-navy mullion grid (sleek, not a glowing night facade). A
// handful of instances get a very subtle sky-blue shimmer — like light
// catching the glass — for quiet ambient life rather than "lit windows".
function WindowField({ layout }: { layout: FloorLayout[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const instances = useMemo(() => buildInstances(layout), [layout])
  const baseColor = useMemo(() => new THREE.Color(colors.windowMullion), [])
  const shimmerColor = useMemo(() => new THREE.Color(colors.active), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    instances.forEach((inst, i) => {
      dummy.position.set(inst.x, inst.y, inst.z)
      dummy.rotation.set(0, inst.rotY, 0)
      dummy.scale.set(0.16, 0.14, 0.02)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, baseColor)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [instances, baseColor])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || !mesh.instanceColor || instances.length === 0) return
    const t = state.clock.elapsedTime
    const color = new THREE.Color()
    const shimmerCount = 5
    for (let k = 0; k < shimmerCount; k++) {
      const idx = Math.floor((Math.sin(t * 0.25 + k * 13.7) * 0.5 + 0.5) * instances.length) % instances.length
      const inst = instances[idx]
      const glow = Math.max(0, Math.sin(t * 1.2 + inst.seed * 40)) * 0.35
      color.copy(baseColor).lerp(shimmerColor, glow)
      mesh.setColorAt(idx, color)
    }
    mesh.instanceColor.needsUpdate = true
  })

  if (instances.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, instances.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.2} metalness={0.5} toneMapped={false} />
    </instancedMesh>
  )
}

// Twin antenna spires on the hero (center) tower roof, echoing the classic
// bundled-tube skyscraper silhouette — tall, thin brushed-steel masts with a
// blinking aviation-light tip, unequal heights.
function AntennaSpires({ y }: { y: number }) {
  const spires: { x: number; height: number; z: number }[] = [
    { x: -0.18, height: 2.1, z: 0 },
    { x: 0.22, height: 1.55, z: 0.08 },
  ]

  return (
    <>
      {spires.map((s, i) => (
        <group key={i} position={[s.x, y, s.z]}>
          <mesh position={[0, s.height / 2, 0]}>
            <cylinderGeometry args={[0.022, 0.035, s.height, 8]} />
            <meshStandardMaterial color="#8793a8" roughness={0.25} metalness={0.85} toneMapped={false} />
          </mesh>
          <SpireTip y={s.height} />
        </group>
      ))}
    </>
  )
}

function SpireTip({ y }: { y: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    const cycle = (state.clock.elapsedTime + phase) % 2.4
    mat.emissiveIntensity = cycle < 0.16 ? 5 : 0.3
  })

  return (
    <mesh position={[0, y + 0.03, 0]}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial
        ref={matRef}
        color={colors.beaconBlink}
        emissive={colors.beaconBlink}
        emissiveIntensity={0.3}
        toneMapped={false}
      />
    </mesh>
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
