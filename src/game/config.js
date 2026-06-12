// Engine constants. World values can be overridden via the World Editor (WorldConfig entity).

export const PHYSICS = {
  // --- gravity & vertical ---
  gravity: 196.2, // studs/s^2 (heavy, Roblox-like fall)
  jumpVelocity: 50, // initial jump impulse (studs/s) -> ~6.4 stud apex
  jumpCutMultiplier: 1, // <1 = releasing Space early shortens the jump (1 = fixed-height jumps)
  terminalVelocity: 160, // max fall speed (studs/s)
  voidY: -80, // falling below this kills the player

  // --- horizontal locomotion ---
  walkSpeed: 16,
  runSpeed: 24,
  groundAcceleration: 180, // accel toward target speed on ground (quick but not instant)
  groundDeceleration: 260, // braking/friction with no input on ground (crisp stop)
  airAcceleration: 140, // base steering accel while airborne (scaled by airControl)
  airDeceleration: 14, // mild drag with no input in air (momentum mostly kept)
  airControl: 0.35, // fraction of airAcceleration actually applied

  // --- jump assists ---
  jumpBufferTime: 0.12, // pressing Space this long before landing still jumps
  coyoteTime: 0.1, // jump still works this long after walking off a ledge
  allowHeldJump: false, // true = holding Space auto-rejumps on landing (bunnyhop)

  // --- body & collision ---
  bodyRadius: 1.0, // humanoid half-width (cylinder-like AABB approximation)
  bodyHeight: 5, // feet-to-head height
  skinWidth: 0.02, // push-out margin to avoid re-penetration jitter
  stepHeight: 1.0, // obstacles up to this height are stepped onto automatically
  groundSnapDistance: 0.5, // snap down to ground when walking over small drops
  groundProbeDistance: 0.6, // how far below the feet we search for support
  maxGroundSlopeDeg: 60, // placeholder: AABB world is flat-topped; ready for slope support

  // --- feel polish ---
  landingLockTime: 0.08, // brief just-landed window (animation/feel hook)
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
  // Static world parts: axis-aligned boxes players can stand on and collide with
  parts: [
    { x: 14, y: 2, z: 6, sx: 8, sy: 4, sz: 8, color: '#c84d3c' },
    { x: 22, y: 4, z: 14, sx: 8, sy: 8, sz: 8, color: '#e8b431' },
    { x: -16, y: 1.5, z: -10, sx: 12, sy: 3, sz: 6, color: '#1fae51' },
  ],
};

export const MAX_HEALTH = 100;
export const RESPAWN_DELAY_MS = 3000;
