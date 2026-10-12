import * as THREE from 'three'

// Bridges the 3D scene (floor world positions) to the 2D SVG beam overlay
// (src/scene/Beam.tsx), which lives outside the <Canvas> tree. Both sides
// read/write these plain mutable maps directly every animation frame rather
// than going through React state, so a 60fps projection never triggers a
// React re-render.
export const floorObjects = new Map<string, THREE.Object3D>()
export const floorScreenPositions = new Map<string, { x: number; y: number }>()

let feedAnchorEl: HTMLElement | null = null

export function setFeedAnchorEl(el: HTMLElement | null) {
  feedAnchorEl = el
}

export function getFeedAnchorEl() {
  return feedAnchorEl
}
