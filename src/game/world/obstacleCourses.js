import { PHYSICS } from '@/game/config';

// Pre-built parkour layouts for the World Editor. Each course is a set of static
// parts (and optional jump pads) laid out relative to an origin, so loading one
// drops a ready-made obstacle course into the world. Loading appends to whatever
// is already placed — it never wipes existing geometry.

// Build a horizontal run of evenly spaced floating platforms.
function stepPath({ startX, z, count, gap, y, rise = 0, size = 5, color = '#4ec0f0' }) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    parts.push({
      x: startX + i * gap,
      y: y + i * rise,
      z,
      sx: size, sy: 1.5, sz: size,
      color,
    });
  }
  return parts;
}

export const OBSTACLE_COURSES = [
  {
    id: 'floating_steps',
    name: 'Floating Steps',
    description: 'A gentle climbing run of drifting platforms.',
    parts: stepPath({ startX: 20, z: -20, count: 7, gap: 8, y: 3, rise: 2, color: '#4ec0f0' }),
    pads: [],
  },
  {
    id: 'gap_jumps',
    name: 'Gap Jumps',
    description: 'Wide-set pillars that force precise leaps.',
    parts: stepPath({ startX: -30, z: 24, count: 6, gap: 12, y: 4, rise: 0, size: 4, color: '#e8b431' }),
    pads: [],
  },
  {
    id: 'launch_tower',
    name: 'Launch Tower',
    description: 'A jump pad rockets you up a stack of ledges.',
    parts: [
      { x: -24, y: 6, z: -28, sx: 6, sy: 1.5, sz: 6, color: '#8a4fd3' },
      { x: -24, y: 12, z: -34, sx: 6, sy: 1.5, sz: 6, color: '#8a4fd3' },
      { x: -24, y: 18, z: -40, sx: 6, sy: 1.5, sz: 6, color: '#8a4fd3' },
      { x: -30, y: 22, z: -40, sx: 8, sy: 1.5, sz: 8, color: '#c84d3c' },
    ],
    pads: [
      { x: -24, y: 1, z: -22, sx: 6, sy: 2, sz: 6, color: '#39e08a', jump: PHYSICS.jumpPadVelocity },
    ],
  },
];
