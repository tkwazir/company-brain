// Color language used consistently across the 3D scene and UI. The building
// is sleek navy glass (reflective, not glowing) against a light premium-SaaS
// page; cyan is reserved for the active "reading data" pulse so it reads as
// a deliberate state change against the otherwise quiet navy.
export const colors = {
  idle: '#3d5478', // mid steel-navy — floor edge lines / resting definition
  active: '#0ea5e9', // sky-blue pulse — reading data (deepened for contrast on light bg)
  granted: '#10b981', // green — access granted
  masked: '#f59e0b', // amber — partial access / masked
  denied: '#ef4444', // red — access denied
  ingest: '#f59e0b', // amber-gold — new data landing
  beacon: '#334155', // steel spire/beacon body (non-emissive)
  beaconBlink: '#f43f5e', // rose — aviation-style blink, visible against a light sky
  windowMullion: '#24334a', // subtle cool window-grid tone, slightly lighter than body
  bodyBase: '#0d1420', // near-black navy glass body
  pageBg: '#f7f4ee', // soft warm off-white page background
} as const

export type TowerId = 'left' | 'center' | 'right'

export const buildingDimensions = {
  floorHeight: 1.1,
  floorGap: 0.05,
  baseSize: {
    left: 3.0,
    center: 4.4,
    right: 3.0,
  },
  // Shrinks the footprint every N floors to create the setback silhouette.
  setbackEvery: {
    left: 3,
    center: 4,
    right: 3,
  },
  setbackFactor: 0.9,
  // Distance between tower centers along X — set so each tower's base
  // footprint touches its neighbor's (half-width + half-width + a hairline
  // gap to avoid z-fighting). They taper apart above the podium as the
  // setbacks shrink each tower's footprint with height.
  towerSpacing: {
    left: -(3.0 / 2 + 4.4 / 2 + 0.03),
    center: 0,
    right: 3.0 / 2 + 4.4 / 2 + 0.03,
  },
  windowsPerFloorSide: 5,
  windowRows: 2,
} as const
