// Color language used consistently across the 3D scene and UI. The building
// is sleek grey glass (reflective, not glowing) against a light neutral-grey
// premium-SaaS page; cyan is reserved for the active "reading data" pulse so
// it reads as a deliberate state change against the otherwise quiet grey.
export const colors = {
  idle: '#9aa1ad', // light steel-grey — floor edge lines / resting definition
  active: '#0ea5e9', // sky-blue pulse — reading data
  granted: '#10b981', // green — access granted
  denied: '#ef4444', // red — access denied
  ingest: '#f59e0b', // amber-gold — new data landing
  beaconBlink: '#ffffff', // white — corner flasher / spire-tip blink
  windowMullion: '#3a3e46', // subtle grey window-grid tone, close to body
  bodyBase: '#4a4e57', // mid-dark neutral grey glass body
  pageBg: '#eef0f2', // soft light neutral-grey page background
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
