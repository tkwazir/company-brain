import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { colors } from '../config/theme'

// Dark gradient-ish depth via fog (blends the building into the night) plus
// a faint starfield so the sky never looks flat.
export function Sky() {
  const { scene } = useThree()

  useEffect(() => {
    const fogColor = new THREE.Color(colors.skyTop)
    scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.028)
    return () => {
      scene.fog = null
    }
  }, [scene])

  return <Stars radius={70} depth={35} count={1600} factor={2} fade speed={0.3} />
}
