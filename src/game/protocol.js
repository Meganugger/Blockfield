// Shared protocol/state shapes used by simulation, replication and UI.
// Replicated player state: { x, y, z, yaw, anim, health, deaths, last_seen }
// Chat message: { username, text }

export const ANIM = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  DEAD: 'dead',
};

export const CONNECTION = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected',
};