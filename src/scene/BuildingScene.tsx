import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Sky } from './Sky'
import { Tower } from './Tower'
import { useBrainStore } from '../state/store'

const BUILDING_OFFSET_X = -4.5
const CAMERA_BASE = new THREE.Vector3(7, 11, 21)
const CAMERA_TARGET = new THREE.Vector3(-3.5, 6.5, 0)

function CameraRig() {
  const { camera } = useThree()
  const isAnimating = useBrainStore((s) => s.isAnimating)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const drift = isAnimating ? 1 : 0
    const radius = Math.hypot(CAMERA_BASE.x - CAMERA_TARGET.x, CAMERA_BASE.z - CAMERA_TARGET.z)
    const baseAngle = Math.atan2(CAMERA_BASE.z - CAMERA_TARGET.z, CAMERA_BASE.x - CAMERA_TARGET.x)
    const angle = baseAngle + Math.sin(t * 0.05) * 0.05 * drift
    const x = CAMERA_TARGET.x + radius * Math.cos(angle)
    const z = CAMERA_TARGET.z + radius * Math.sin(angle)
    const y = CAMERA_BASE.y + Math.sin(t * 0.08) * 0.25 * drift
    camera.position.set(x, y, z)
    camera.lookAt(CAMERA_TARGET)
  })

  return null
}

function Podium() {
  return (
    <mesh position={[BUILDING_OFFSET_X, -0.35, 0]}>
      <boxGeometry args={[17, 0.7, 6]} />
      <meshStandardMaterial color="#070b16" roughness={0.6} metalness={0.3} />
    </mesh>
  )
}

export function BuildingScene() {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={canvasRef} className="absolute inset-0">
      <Canvas camera={{ position: CAMERA_BASE.toArray(), fov: 42 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <CameraRig />
          <Sky />
          <ambientLight intensity={0.22} />
          <directionalLight position={[12, 20, 8]} intensity={0.35} color="#bfe3ff" />
          <Podium />
          <group position={[BUILDING_OFFSET_X, 0, 0]}>
            <Tower towerId="left" />
            <Tower towerId="center" />
            <Tower towerId="right" />
          </group>
          <EffectComposer>
            <Bloom intensity={0.65} luminanceThreshold={0.18} luminanceSmoothing={0.85} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
