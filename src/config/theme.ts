// Color language used consistently across the 3D scene and UI. Idle glass
// glows warm (amber/gold, like sun-struck glass at dusk) so the building
// reads as lively against the dark sky; cyan is reserved for the active
// "reading data" pulse so it stands out as a deliberate state change.
export const colors = {
  idle: '#e8a254', // warm amber-gold — resting glass glow
  active: '#22d3ee', // bright cyan pulse — reading data
  granted: '#34d399', // green — access granted
  masked: '#fbbf24', // amber — partial access / masked
  denied: '#f87171', // red — access denied
  ingest: '#fde68a', // white-gold — new data landing
  beacon: '#ffffff', // white corner flashers + antenna spires
  windowDim: '#191310',
  skyTop: '#050711',
  skyBottom: '#121a3a',
  sunKey: '#ffb374', // warm low-angle key light, like a dusk sun
} as const

// A few warm window tones so lit windows don't read as one flat color —
// gold, amber, and a soft warm white, like a real lit facade at dusk.
export const windowLitColors = ['#ffcf8a', '#ffb870', '#fff0d2'] as const

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
