import * as THREE from 'three';
import { PHYSICS } from '../config';
import { ANIM } from '../protocol';

const shortestAngle = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

// Kinematic character physics: camera-relative movement, acceleration,
// gravity, jump, baseplate collision, void detection, facing smoothing.
export class CharacterController {
  constructor(world, colliders = []) {
    this.world = world;
    this.colliders = colliders;
    this.spawn = new THREE.Vector3(world.spawn_x || 0, world.spawn_y ?? 8, world.spawn_z || 0);
    this.pos = this.spawn.clone();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.grounded = false;
    this.enabled = true;
    this.anim = ANIM.IDLE;
  }

  respawn() {
    this.pos.copy(this.spawn);
    // Anti-stuck correction: never spawn inside/below the plate
    if (this.pos.y < 0.5) this.pos.y = 4;
    this.vel.set(0, 0, 0);
    this.grounded = false;
  }

  update(dt, input, camYaw) {
    const g = this.world.gravity || PHYSICS.gravity;
    const mv = this.enabled ? input.moveVector : { x: 0, z: 0 };

    // Camera-relative move direction
    let dx = 0, dz = 0;
    if (mv.x || mv.z) {
      const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw); // forward
      const rx = Math.cos(camYaw), rz = -Math.sin(camYaw); // right
      dx = fx * mv.z + rx * mv.x;
      dz = fz * mv.z + rz * mv.x;
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;
    }

    // Accelerate horizontal velocity toward target (friction is implicit when target = 0)
    const speed = input.run ? PHYSICS.runSpeed : PHYSICS.walkSpeed;
    const accel = PHYSICS.groundAccel * (this.grounded ? 1 : PHYSICS.airControl);
    const ax = dx * speed - this.vel.x;
    const az = dz * speed - this.vel.z;
    const m = Math.hypot(ax, az);
    if (m > 0.0001) {
      const step = Math.min(m, accel * dt);
      this.vel.x += (ax / m) * step;
      this.vel.z += (az / m) * step;
    }

    if (this.enabled && this.grounded && input.jump) {
      this.vel.y = PHYSICS.jumpVelocity;
      this.grounded = false;
    }

    this.vel.y -= g * dt;
    if (this.vel.y < -150) this.vel.y = -150; // terminal velocity (also prevents tunneling)
    this.pos.addScaledVector(this.vel, dt);

    // Baseplate collision (top surface at y = 0)
    const half = (this.world.baseplate_size || 512) / 2;
    const onPlate = Math.abs(this.pos.x) <= half && Math.abs(this.pos.z) <= half;
    if (onPlate && this.pos.y <= 0 && this.vel.y <= 0) {
      this.pos.y = 0;
      this.vel.y = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    // Static part collision (AABB resolution along the axis of least penetration)
    const HALF_W = 1.0;
    const HEIGHT = 5;
    for (const c of this.colliders) {
      if (this.pos.x + HALF_W <= c.minX || this.pos.x - HALF_W >= c.maxX) continue;
      if (this.pos.z + HALF_W <= c.minZ || this.pos.z - HALF_W >= c.maxZ) continue;
      if (this.pos.y >= c.maxY || this.pos.y + HEIGHT <= c.minY) continue;
      const overlapX = Math.min(this.pos.x + HALF_W - c.minX, c.maxX - (this.pos.x - HALF_W));
      const overlapZ = Math.min(this.pos.z + HALF_W - c.minZ, c.maxZ - (this.pos.z - HALF_W));
      const overlapTop = c.maxY - this.pos.y;
      const overlapBottom = this.pos.y + HEIGHT - c.minY;
      const minPen = Math.min(overlapX, overlapZ, overlapTop, overlapBottom);
      if (minPen === overlapTop && this.vel.y <= 0) {
        this.pos.y = c.maxY;
        this.vel.y = 0;
        this.grounded = true;
      } else if (minPen === overlapBottom) {
        this.pos.y = c.minY - HEIGHT;
        if (this.vel.y > 0) this.vel.y = 0;
      } else if (minPen === overlapX) {
        this.pos.x += this.pos.x < (c.minX + c.maxX) / 2 ? -overlapX : overlapX;
        this.vel.x = 0;
      } else {
        this.pos.z += this.pos.z < (c.minZ + c.maxZ) / 2 ? -overlapZ : overlapZ;
        this.vel.z = 0;
      }
    }

    // Face movement direction
    if (dx || dz) {
      const target = Math.atan2(dx, dz);
      this.yaw += shortestAngle(target - this.yaw) * Math.min(1, 12 * dt);
    }

    // Derive animation state
    const hSpeed = Math.hypot(this.vel.x, this.vel.z);
    if (!this.grounded) this.anim = this.vel.y > 4 ? ANIM.JUMP : ANIM.FALL;
    else if (hSpeed > PHYSICS.walkSpeed + 2) this.anim = ANIM.RUN;
    else if (hSpeed > 0.8) this.anim = ANIM.WALK;
    else this.anim = ANIM.IDLE;
  }
}