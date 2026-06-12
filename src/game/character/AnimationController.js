import { ANIM } from '../protocol';

// State-based procedural animations: idle sway, walk/run swing, jump/fall poses.
// Designed so real animation assets can replace this later without touching gameplay code.

const lerp = (a, b, t) => a + (b - a) * t;

export class AnimationController {
  constructor(parts) {
    this.p = parts;
    this.t = Math.random() * 10; // de-sync players
    this.state = ANIM.IDLE;
  }

  setState(state) {
    this.state = state;
  }

  update(dt) {
    this.t += dt;
    const { t, p } = this;
    let la = 0, ra = 0, ll = 0, rl = 0, bob = 0;

    switch (this.state) {
      case ANIM.WALK: {
        const s = Math.sin(t * 8) * 0.7;
        la = s; ra = -s; ll = -s; rl = s;
        bob = Math.abs(Math.sin(t * 8)) * 0.08;
        break;
      }
      case ANIM.RUN: {
        const s = Math.sin(t * 12) * 1.15;
        la = s; ra = -s; ll = -s; rl = s;
        bob = Math.abs(Math.sin(t * 12)) * 0.12;
        break;
      }
      case ANIM.JUMP:
        la = -2.7; ra = -2.7; ll = 0.35; rl = -0.25;
        break;
      case ANIM.FALL:
        la = -2.4; ra = -2.4; ll = -0.45; rl = 0.45;
        break;
      case ANIM.DEAD:
        break; // limbs relax to neutral; engine tips the whole body over
      default: {
        const s = Math.sin(t * 2) * 0.06;
        la = s; ra = -s;
        bob = Math.sin(t * 2) * 0.02;
      }
    }

    const k = Math.min(1, 14 * dt);
    p.leftArm.rotation.x = lerp(p.leftArm.rotation.x, la, k);
    p.rightArm.rotation.x = lerp(p.rightArm.rotation.x, ra, k);
    p.leftLeg.rotation.x = lerp(p.leftLeg.rotation.x, ll, k);
    p.rightLeg.rotation.x = lerp(p.rightLeg.rotation.x, rl, k);
    p.body.position.y = lerp(p.body.position.y, bob, k);
  }
}