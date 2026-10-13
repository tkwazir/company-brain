import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
const CAMERA_TARGET = new THREE.Vector3(BUILDING_OFFSET_X, 6.5, 0)
const CAMERA_BASE = new THREE.Vector3(BUILDING_OFFSET_X, 10, 28)
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
      <meshStandardMaterial color="#0c0908" roughness={0.6} metalness={0.3} />
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
          <ambientLight intensity={0.16} />
          {/* Warm low-angle "dusk sun" key light — the main source of the warm glow on the glass. */}
          <directionalLight position={[-14, 9, 14]} intensity={0.45} color={colors.sunKey} />
          {/* Cool fill from the opposite side keeps shadowed faces from going flat black. */}
          <directionalLight position={[10, 14, -6]} intensity={0.2} color="#bfe3ff" />
          <Podium />
          <group position={[BUILDING_OFFSET_X, 0, 0]}>
            <Tower towerId="left" />
            <Tower towerId="center" />
            <Tower towerId="right" />
          </group>
          <EffectComposer>
            <Bloom intensity={0.55} luminanceThreshold={0.35} luminanceSmoothing={0.8} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <BeamOverlay />
    </div>
  )
}
