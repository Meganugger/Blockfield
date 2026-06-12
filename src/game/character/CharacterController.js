import * as THREE from 'three';
import { PHYSICS } from '../config';
import { ANIM } from '../protocol';

const shortestAngle = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

// Kinematic humanoid character controller (clean-room Roblox-like feel).
//
// - Camera-relative, normalized movement; separate ground/air acceleration and braking
// - Jump fires on press edge only, with jump buffering and coyote time
// - Substepped movement + swept vertical resolution (no tunneling at high fall speed)
// - Cylinder-like body approximated as an AABB (PHYSICS.bodyRadius / bodyHeight)
// - Step-up onto low ledges, head bump, wall slide push-out, ground snap
//
// pos is the FEET position (the avatar group origin).
export class CharacterController {
  constructor(world, colliders = []) {
    this.world = world;
    this.colliders = colliders;
    this.spawn = new THREE.Vector3(world.spawn_x || 0, world.spawn_y ?? 8, world.spawn_z || 0);
    this.pos = this.spawn.clone();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.enabled = true;
    this.anim = ANIM.IDLE;

    // Locomotion state
    this.grounded = false;
    this.wasGrounded = false;
    this.timeSinceGrounded = Infinity;
    this.jumpBufferTimer = 0;
    this.jumpHeld = false;
    this.justLanded = false;
    this.landingTime = 0;
    this.lastGroundY = 0;
    this.floorNormal = new THREE.Vector3(0, 1, 0); // future-ready for slope support
    this._smoothedHSpeed = 0;
  }

  respawn() {
    this.pos.copy(this.spawn);
    // Anti-stuck: never spawn inside/below the ground under the spawn point
    const gy = this._groundHeightAt(this.pos.x, this.pos.z, Infinity);
    if (gy > -Infinity && this.pos.y < gy + 0.5) this.pos.y = gy + 0.5;
    this.vel.set(0, 0, 0);
    this.grounded = false;
    this.wasGrounded = false;
    this.timeSinceGrounded = Infinity;
    this.jumpBufferTimer = 0;
    this.jumpHeld = false;
    this.justLanded = false;
    this.landingTime = 0;
    this._smoothedHSpeed = 0;
    this.anim = ANIM.IDLE;
  }

  update(dt, input, camYaw) {
    const g = this.world.gravity ?? PHYSICS.gravity;
    this.wasGrounded = this.grounded;
    this.justLanded = false;
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    this.landingTime = Math.max(0, this.landingTime - dt);

    // --- input: jump press edge feeds the jump buffer ---
    const pressed = input.consumeJumpPressed ? input.consumeJumpPressed() : false;
    const jumpDown = input.jumpDown !== undefined ? input.jumpDown : !!input.jump;
    if (this.enabled && (pressed || (PHYSICS.allowHeldJump && jumpDown))) {
      this.jumpBufferTimer = PHYSICS.jumpBufferTime;
    }

    // --- camera-relative desired direction (normalized: diagonals are not faster) ---
    const mv = this.enabled ? input.moveVector : { x: 0, z: 0 };
    let dx = 0, dz = 0;
    if (mv.x || mv.z) {
      const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw); // forward
      const rx = Math.cos(camYaw), rz = -Math.sin(camYaw); // right
      dx = fx * mv.z + rx * mv.x;
      dz = fz * mv.z + rz * mv.x;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
    }
    const hasInput = !!(dx || dz);

    // --- horizontal velocity: accelerate toward target, brake hard when idle ---
    const targetSpeed = input.run ? PHYSICS.runSpeed : PHYSICS.walkSpeed;
    const rate = hasInput
      ? (this.grounded ? PHYSICS.groundAcceleration : PHYSICS.airAcceleration * PHYSICS.airControl)
      : (this.grounded ? PHYSICS.groundDeceleration : PHYSICS.airDeceleration);
    const ddx = dx * targetSpeed - this.vel.x;
    const ddz = dz * targetSpeed - this.vel.z;
    const dm = Math.hypot(ddx, ddz);
    if (dm > 1e-4) {
      const step = Math.min(dm, rate * dt);
      this.vel.x += (ddx / dm) * step;
      this.vel.z += (ddz / dm) * step;
    }
    // No speed gain from collisions, diagonals, or input tricks
    const hs0 = Math.hypot(this.vel.x, this.vel.z);
    if (hs0 > PHYSICS.runSpeed) {
      const k = PHYSICS.runSpeed / hs0;
      this.vel.x *= k;
      this.vel.z *= k;
    }

    // --- jump (buffered + coyote time) ---
    const canJump = this.grounded || this.timeSinceGrounded < PHYSICS.coyoteTime;
    if (this.enabled && this.jumpBufferTimer > 0 && canJump && this.vel.y <= 0.01) {
      this.vel.y = PHYSICS.jumpVelocity;
      this.jumpBufferTimer = 0;
      this.grounded = false;
      this.timeSinceGrounded = PHYSICS.coyoteTime; // consume the coyote window
      this.jumpHeld = true;
    }
    // Optional variable jump height (inert while jumpCutMultiplier = 1)
    if (this.jumpHeld && !jumpDown) {
      this.jumpHeld = false;
      if (this.vel.y > 0 && PHYSICS.jumpCutMultiplier < 1) this.vel.y *= PHYSICS.jumpCutMultiplier;
    }

    // --- gravity + terminal velocity ---
    this.vel.y -= g * dt;
    if (this.vel.y < -PHYSICS.terminalVelocity) this.vel.y = -PHYSICS.terminalVelocity;

    // --- substepped move: horizontal then swept vertical (prevents tunneling) ---
    const disp = Math.max(Math.hypot(this.vel.x, this.vel.z), Math.abs(this.vel.y)) * dt;
    const maxStepDist = Math.max(PHYSICS.bodyRadius * 0.8, 0.4);
    const steps = Math.max(1, Math.min(8, Math.ceil(disp / maxStepDist)));
    const sdt = dt / steps;
    for (let i = 0; i < steps; i++) {
      this.pos.x += this.vel.x * sdt;
      this.pos.z += this.vel.z * sdt;
      this._resolveHorizontal();
      const prevY = this.pos.y;
      this.pos.y += this.vel.y * sdt;
      this._resolveVertical(prevY);
    }

    // --- ground snap: walking over small drops stays glued to the floor ---
    if (!this.grounded && this.wasGrounded && this.vel.y <= 0) this._trySnapToGround();

    if (this.grounded) {
      if (!this.wasGrounded) {
        this.justLanded = true;
        this.landingTime = PHYSICS.landingLockTime;
      }
      this.timeSinceGrounded = 0;
      this.lastGroundY = this.pos.y;
    } else {
      this.timeSinceGrounded += dt;
    }

    // --- facing ---
    if (hasInput) {
      const target = Math.atan2(dx, dz);
      this.yaw += shortestAngle(target - this.yaw) * Math.min(1, 14 * dt);
    }

    // --- animation state (smoothed speed + airborne grace = no flicker) ---
    const hSpeed = Math.hypot(this.vel.x, this.vel.z);
    this._smoothedHSpeed += (hSpeed - this._smoothedHSpeed) * Math.min(1, 12 * dt);
    if (!this.grounded && (this.vel.y > 2 || this.timeSinceGrounded > 0.07)) {
      this.anim = this.vel.y > 2 ? ANIM.JUMP : ANIM.FALL;
    } else if (this._smoothedHSpeed > (PHYSICS.walkSpeed + PHYSICS.runSpeed) / 2) {
      this.anim = ANIM.RUN;
    } else if (this._smoothedHSpeed > 1.2) {
      this.anim = ANIM.WALK;
    } else {
      this.anim = ANIM.IDLE;
    }
  }

  // ---------------------------------------------------------------- collision

  _overlapsXZ(c, x, z) {
    const r = PHYSICS.bodyRadius;
    return x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ;
  }

  // Highest support surface (baseplate or part top) at/below maxY under (x, z).
  _groundHeightAt(x, z, maxY) {
    let best = -Infinity;
    const half = (this.world.baseplate_size || 512) / 2;
    if (Math.abs(x) <= half && Math.abs(z) <= half && maxY >= 0) best = 0;
    for (const c of this.colliders) {
      if (!this._overlapsXZ(c, x, z)) continue;
      if (c.maxY <= maxY + 1e-6 && c.maxY > best) best = c.maxY;
    }
    return best;
  }

  // True if a body standing with feet at footY fits at (x, z) without overlap.
  _headroomAt(x, z, footY) {
    const h = PHYSICS.bodyHeight;
    for (const c of this.colliders) {
      if (!this._overlapsXZ(c, x, z)) continue;
      if (footY < c.maxY - 1e-6 && footY + h > c.minY + 1e-6) return false;
    }
    return true;
  }

  // Push out of overlapping parts along the smallest XZ axis (wall slide),
  // stepping up instead when the ledge is within PHYSICS.stepHeight.
  _resolveHorizontal() {
    const r = PHYSICS.bodyRadius;
    const h = PHYSICS.bodyHeight;
    const skin = PHYSICS.skinWidth;
    for (const c of this.colliders) {
      if (!this._overlapsXZ(c, this.pos.x, this.pos.z)) continue;
      if (this.pos.y >= c.maxY - 1e-6 || this.pos.y + h <= c.minY + 1e-6) continue;

      const ledge = c.maxY - this.pos.y;
      if (
        ledge > 0 && ledge <= PHYSICS.stepHeight &&
        (this.grounded || this.wasGrounded) && this.vel.y <= 0.01 &&
        this._headroomAt(this.pos.x, this.pos.z, c.maxY)
      ) {
        this.pos.y = c.maxY; // step up onto the low ledge
        continue;
      }

      const overlapX = Math.min(this.pos.x + r - c.minX, c.maxX - (this.pos.x - r));
      const overlapZ = Math.min(this.pos.z + r - c.minZ, c.maxZ - (this.pos.z - r));
      if (overlapX < overlapZ) {
        const dir = this.pos.x < (c.minX + c.maxX) / 2 ? -1 : 1;
        this.pos.x += dir * (overlapX + skin);
        if (Math.sign(this.vel.x) !== dir) this.vel.x = 0;
      } else {
        const dir = this.pos.z < (c.minZ + c.maxZ) / 2 ? -1 : 1;
        this.pos.z += dir * (overlapZ + skin);
        if (Math.sign(this.vel.z) !== dir) this.vel.z = 0;
      }
    }
  }

  // Swept vertical resolution: land on tops the feet crossed while falling,
  // bump the head on bottoms the head crossed while rising.
  _resolveVertical(prevY) {
    const h = PHYSICS.bodyHeight;
    this.grounded = false;
    if (this.vel.y <= 0) {
      let landY = -Infinity;
      const half = (this.world.baseplate_size || 512) / 2;
      if (Math.abs(this.pos.x) <= half && Math.abs(this.pos.z) <= half && prevY >= -1e-4 && this.pos.y <= 0) landY = 0;
      for (const c of this.colliders) {
        if (!this._overlapsXZ(c, this.pos.x, this.pos.z)) continue;
        if (prevY >= c.maxY - 1e-4 && this.pos.y < c.maxY && c.maxY > landY) landY = c.maxY;
      }
      if (landY > -Infinity) {
        this.pos.y = landY;
        this.vel.y = 0;
        this.grounded = true;
      }
    } else {
      for (const c of this.colliders) {
        if (!this._overlapsXZ(c, this.pos.x, this.pos.z)) continue;
        if (prevY + h <= c.minY + 1e-4 && this.pos.y + h > c.minY) {
          this.pos.y = c.minY - h; // head bump: stop the jump
          this.vel.y = 0;
        }
      }
    }
  }

  _trySnapToGround() {
    const gy = this._groundHeightAt(this.pos.x, this.pos.z, this.pos.y + 1e-3);
    if (gy === -Infinity) return;
    const drop = this.pos.y - gy;
    if (drop >= 0 && drop <= Math.min(PHYSICS.groundSnapDistance, PHYSICS.groundProbeDistance)) {
      this.pos.y = gy;
      this.vel.y = 0;
      this.grounded = true;
    }
  }
}
