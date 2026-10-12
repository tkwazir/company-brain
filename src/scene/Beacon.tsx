import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { colors } from '../config/theme'

interface BeaconProps {
  position: [number, number, number]
  phase: number
  color?: string
  radius?: number
}

// A single small blinking light.
export function Beacon({ position, phase, color = colors.beacon, radius = 0.05 }: BeaconProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    const period = 2.4
    const cycle = (state.clock.elapsedTime + phase) % period
    const on = cycle < 0.16
    mat.emissiveIntensity = on ? 5 : 0.1
  })

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 10, 10]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.1}
        toneMapped={false}
      />
    </mesh>
  )
}

interface CornerBeaconsProps {
  y: number
  size: number
  phase: number
}

// One small white flashing beacon on each of the four roof corners.
export function CornerBeacons({ y, size, phase }: CornerBeaconsProps) {
  const inset = 0.1
  const half = size / 2 - inset
  const corners: [number, number][] = [
    [half, half],
    [half, -half],
    [-half, half],
    [-half, -half],
  ]

  return (
    <>
      {corners.map(([x, z], i) => (
        <Beacon key={`${x}-${z}`} position={[x, y + 0.06, z]} phase={phase + i * 0.1} />
      ))}
    </>
  )
}
