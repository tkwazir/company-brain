import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Sky } from './Sky'
import { Tower } from './Tower'
import { BeamOverlay, BeamProjector } from './Beam'
import { useBrainStore } from '../state/store'
import { colors } from '../config/theme'

// Camera sits dead-on with the building (zero X offset from target — no
// yaw/obliqueness at all) so floor bands read as flat and horizontal, not
// diagonal/"tilted". The leftward composition shift is done with a lens
// shift (setViewOffset) below, not by rotating the camera, so it never
// introduces any tilt.
const BUILDING_OFFSET_X = -1
// Target/distance leave headroom above the current roofline (~2-3 floors'
// worth) instead of fitting the current height exactly, since the ingest
// flow adds floors on top of the center tower and shouldn't clip them.
const CAMERA_TARGET = new THREE.Vector3(BUILDING_OFFSET_X, 8, 0)
const CAMERA_BASE = new THREE.Vector3(BUILDING_OFFSET_X, 12, 33)
const CAMERA_FOV = 36
// Fraction of the viewport width to push the building toward the left edge.
const VIEW_SHIFT_X = 0.16

function CameraRig() {
  const { camera, size } = useThree()
  const isAnimating = useBrainStore((s) => s.isAnimating)
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const drift = isAnimating && !reducedMotion.current ? 1 : 0
    const radius = Math.hypot(CAMERA_BASE.x - CAMERA_TARGET.x, CAMERA_BASE.z - CAMERA_TARGET.z)
    const baseAngle = Math.atan2(CAMERA_BASE.z - CAMERA_TARGET.z, CAMERA_BASE.x - CAMERA_TARGET.x)
    const angle = baseAngle + Math.sin(t * 0.05) * 0.015 * drift
    const x = CAMERA_TARGET.x + radius * Math.cos(angle)
    const z = CAMERA_TARGET.z + radius * Math.sin(angle)
    const y = CAMERA_BASE.y + Math.sin(t * 0.08) * 0.1 * drift
    camera.position.set(x, y, z)
    camera.lookAt(CAMERA_TARGET)
  })

  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera
    const w = size.width
    const h = size.height
    const fullWidth = w * (1 + 2 * VIEW_SHIFT_X)
    const offsetX = fullWidth - w
    persp.setViewOffset(fullWidth, h, offsetX, 0, w, h)
    persp.updateProjectionMatrix()
    return () => {
      persp.clearViewOffset()
      persp.updateProjectionMatrix()
    }
  }, [camera, size])

  return null
}

function Podium() {
  return (
    <mesh position={[BUILDING_OFFSET_X, -0.35, 0]}>
      <boxGeometry args={[11.2, 0.7, 5.2]} />
      <meshStandardMaterial color={colors.bodyBase} roughness={0.3} metalness={0.5} />
    </mesh>
  )
}

export function BuildingScene() {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={canvasRef} className="absolute inset-0">
      <Canvas camera={{ position: CAMERA_BASE.toArray(), fov: CAMERA_FOV }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <CameraRig />
          <BeamProjector />
          <Sky />
          {/* Soft neutral studio lighting plus image-based reflections — a
              clean product-render look rather than a glowing night scene. */}
          <ambientLight intensity={0.55} />
          <directionalLight position={[-10, 16, 12]} intensity={0.5} color="#ffffff" />
          <directionalLight position={[10, 10, -8]} intensity={0.25} color="#dbe4f0" />
          <Environment preset="studio" environmentIntensity={0.4} />
          <Podium />
          <ContactShadows
            position={[BUILDING_OFFSET_X, 0.01, 0]}
            opacity={0.3}
            scale={16}
            blur={2.2}
            far={6}
            color="#2a2d33"
          />
          <group position={[BUILDING_OFFSET_X, 0, 0]}>
            <Tower towerId="left" />
            <Tower towerId="center" />
            <Tower towerId="right" />
          </group>
          <EffectComposer>
            <Bloom intensity={0.35} luminanceThreshold={0.55} luminanceSmoothing={0.75} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <BeamOverlay />
    </div>
  )
}
