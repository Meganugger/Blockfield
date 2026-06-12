// Engine constants. World values can be overridden via the World Editor (WorldConfig entity).

export const PHYSICS = {
  gravity: 196.2, // studs/s^2
  walkSpeed: 16,
  runSpeed: 26,
  jumpVelocity: 55,
  groundAccel: 140,
  airControl: 0.25,
  voidY: -80, // falling below this kills the player
};

export const NET = {
  stateIntervalMs: 250, // replication send rate
  staleTimeoutMs: 12000, // remote players considered gone after this
  chatCooldownMs: 1200, // chat rate limit
};

export const DEFAULT_WORLD = {
  name: 'Baseplate',
  baseplate_size: 512,
  spawn_x: 0,
  spawn_y: 8,
  spawn_z: 0,
  gravity: 196.2,
  sky_top: '#3aa7e8',
  sky_bottom: '#cfeaff',
  sun_intensity: 1.6,
  ambient_intensity: 0.7,
};

export const MAX_HEALTH = 100;
export const RESPAWN_DELAY_MS = 3000;