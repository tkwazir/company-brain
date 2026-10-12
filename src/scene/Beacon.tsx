import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BeaconProps {
  y: number
  phase: number
  color: string
}

// Slow-blinking aircraft warning beacon on top of a tower. Phase-offset per
// tower so the three towers never blink in sync.
export function Beacon({ y, phase, color }: BeaconProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    const period = 2.4
    const cycle = (state.clock.elapsedTime + phase) % period
    const on = cycle < 0.18
    mat.emissiveIntensity = on ? 4.5 : 0.15
  })

  return (
    <mesh position={[0, y + 0.45, 0]}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        toneMapped={false}
      />
    </mesh>
  )
}
