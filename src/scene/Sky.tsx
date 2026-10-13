import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { colors } from '../config/theme'

// A very light, neutral fog matching the page background gives distant
// elements a soft fade — the premium-render equivalent of atmospheric haze,
// without the night-sky starfield this used to carry.
export function Sky() {
  const { scene } = useThree()

  useEffect(() => {
    scene.fog = new THREE.Fog(new THREE.Color(colors.pageBg).getHex(), 24, 55)
    return () => {
      scene.fog = null
    }
  }, [scene])

  return null
}
