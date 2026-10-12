// Color language used consistently across the 3D scene and UI.
export const colors = {
  idle: '#38bdf8', // cool cyan/blue — resting state
  active: '#22d3ee', // bright cyan pulse — reading data
  granted: '#34d399', // green — access granted
  masked: '#fbbf24', // amber — partial access / masked
  denied: '#f87171', // red — access denied
  ingest: '#fde68a', // white-gold — new data landing
  beacon: '#ffffff', // white corner flashers
  windowLit: '#ffd98a',
  windowDim: '#131a2e',
  skyTop: '#050711',
  skyBottom: '#121a3a',
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
