import { createAvatar } from '../character/Avatar';
import { createNameplate } from '../character/Nameplate';
import { AnimationController } from '../character/AnimationController';
import { ANIM } from '../protocol';

const shortestAngle = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

// Manages remote avatars: spawn/despawn, snapshot interpolation toward the
// latest replicated state, animation state mirroring. No duplicate avatars:
// keyed by player id, removed on disconnect/stale prune.
export class RemotePlayers {
  constructor(scene) {
    this.scene = scene;
    this.map = new Map();
  }

  sync(players) {
    const seen = new Set();
    for (const p of players) {
      seen.add(p.id);
      let r = this.map.get(p.id);
      if (!r) {
        const avatar = createAvatar(p.color || '#2a6dd0');
        avatar.group.add(createNameplate(p.username || 'Player'));
        avatar.group.position.set(p.x || 0, p.y || 0, p.z || 0);
        this.scene.add(avatar.group);
        r = { avatar, anim: new AnimationController(avatar.parts), target: {}, state: ANIM.IDLE };
        this.map.set(p.id, r);
      }
      r.target = { x: p.x || 0, y: p.y || 0, z: p.z || 0, yaw: p.yaw || 0 };
      r.state = p.anim || ANIM.IDLE;
    }
    for (const [id, r] of this.map) {
      if (!seen.has(id)) {
        this.scene.remove(r.avatar.group);
        this.map.delete(id);
      }
    }
  }

  update(dt) {
    const k = Math.min(1, 8 * dt);
    for (const r of this.map.values()) {
      const g = r.avatar.group;
      g.position.x += (r.target.x - g.position.x) * k;
      g.position.y += (r.target.y - g.position.y) * k;
      g.position.z += (r.target.z - g.position.z) * k;
      g.rotation.y += shortestAngle(r.target.yaw - g.rotation.y) * k;
      const tip = r.state === ANIM.DEAD ? Math.PI / 2 : 0;
      g.rotation.x += (tip - g.rotation.x) * k;
      r.anim.setState(r.state);
      r.anim.update(dt);
    }
  }

  dispose() {
    for (const r of this.map.values()) this.scene.remove(r.avatar.group);
    this.map.clear();
  }
}