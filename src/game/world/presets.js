// Authoring presets for the World Editor. Each preset is a self-contained set
// of spawn coordinates + static parts that get written onto the WorldConfig so
// the engine renders/collides against them. The "Testing Map" is a movement &
// camera-collision obstacle course: stairs, platforms at varied heights, gaps
// to jump, narrow ledges, a pit, and tall walls for camera pull-in checks.

// Build a flight of steps rising along +Z so step-up + ground-snap can be tested.
function buildStairs(x, baseZ, count, stepSize, color) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const h = (i + 1) * stepSize; // top height grows each step
    parts.push({
      x,
      y: h / 2,
      z: baseZ + i * (stepSize * 2),
      sx: 8,
      sy: h,
      sz: stepSize * 2,
      color,
    });
  }
  return parts;
}

export const TESTING_MAP = {
  name: 'Testing Map',
  baseplate_size: 256,
  spawn_x: 0,
  spawn_y: 6,
  spawn_z: -40,
  gravity: 196.2,
  sky_top: '#2a4a78',
  sky_bottom: '#bcd6f5',
  sun_intensity: 1.6,
  ambient_intensity: 0.7,
  parts: [
    // --- staircase (step-up + ground snap) ---
    ...buildStairs(-24, -20, 6, 1, '#c84d3c'),

    // --- ascending platforms with gaps (jump distance + landing) ---
    { x: 0, y: 1, z: 0, sx: 10, sy: 2, sz: 10, color: '#e8b431' },
    { x: 0, y: 2.5, z: 16, sx: 8, sy: 5, sz: 8, color: '#e8b431' },
    { x: 0, y: 4, z: 32, sx: 8, sy: 8, sz: 8, color: '#e8b431' },

    // --- narrow balance beam (edge handling) ---
    { x: 18, y: 2, z: 8, sx: 2, sy: 4, sz: 28, color: '#1fae51' },

    // --- floating island reached by a jump (apex height check) ---
    { x: 30, y: 6, z: 28, sx: 10, sy: 1, sz: 10, color: '#34d399' },

    // --- pit walls forming a trench you can fall into (void/respawn near edges) ---
    { x: -10, y: 3, z: 44, sx: 24, sy: 6, sz: 2, color: '#8a4fd3' },
    { x: -22, y: 3, z: 50, sx: 2, sy: 6, sz: 14, color: '#8a4fd3' },
    { x: 2, y: 3, z: 50, sx: 2, sy: 6, sz: 14, color: '#8a4fd3' },

    // --- tall walls (third-person camera collision pull-in) ---
    { x: -36, y: 8, z: 30, sx: 2, sy: 16, sz: 30, color: '#4a5a78' },
    { x: 40, y: 8, z: -10, sx: 2, sy: 16, sz: 30, color: '#4a5a78' },

    // --- low ceiling tunnel (head-bump while jumping) ---
    { x: 0, y: 7, z: -16, sx: 14, sy: 1, sz: 8, color: '#4a5a78' },
    { x: -7, y: 3, z: -16, sx: 1, sy: 7, sz: 8, color: '#4a5a78' },
    { x: 7, y: 3, z: -16, sx: 1, sy: 7, sz: 8, color: '#4a5a78' },
  ],
  collectibles: [
    { id: 't_top', name: 'Gold Block', color: '#f6c945', x: 0, y: 8, z: 32 },
    { id: 't_island', name: 'Green Block', color: '#34d399', x: 30, y: 7, z: 28 },
    { id: 't_beam', name: 'Blue Block', color: '#4ec0f0', x: 18, y: 4, z: 14 },
  ],
};

export const PRESETS = [TESTING_MAP];