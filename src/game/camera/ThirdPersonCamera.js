import * as THREE from 'three';

// Third-person orbit camera with pointer-lock mouse look, wheel zoom,
// clamped pitch and smooth focus follow. Respawn-safe (just keeps following pos).
export class ThirdPersonCamera {
  constructor(dom) {
    this.dom = dom;
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 3000);
    this.yaw = Math.PI; // start behind avatar (avatar faces +Z)
    this.pitch = 0.35;
    this.dist = 16;
    this._focus = new THREE.Vector3(0, 4, 0);

    this._onMove = (e) => {
      if (document.pointerLockElement !== this.dom) return;
      this.yaw -= e.movementX * 0.0025;
      this.pitch = Math.max(-0.4, Math.min(1.4, this.pitch + e.movementY * 0.0025));
    };
    this._onWheel = (e) => {
      this.dist = Math.max(6, Math.min(40, this.dist + e.deltaY * 0.02));
    };
    this._onClick = () => {
      if (document.pointerLockElement !== this.dom) this.dom.requestPointerLock?.();
    };
  }

  attach() {
    document.addEventListener('mousemove', this._onMove);
    this.dom.addEventListener('wheel', this._onWheel, { passive: true });
    this.dom.addEventListener('click', this._onClick);
  }

  detach() {
    document.removeEventListener('mousemove', this._onMove);
    this.dom.removeEventListener('wheel', this._onWheel);
    this.dom.removeEventListener('click', this._onClick);
    if (document.pointerLockElement === this.dom) document.exitPointerLock?.();
  }

  setAspect(aspect) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(dt, targetPos) {
    const focus = new THREE.Vector3(targetPos.x, targetPos.y + 4.2, targetPos.z);
    this._focus.lerp(focus, 1 - Math.pow(0.0001, dt)); // smooth follow

    const cp = Math.cos(this.pitch);
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cp,
      Math.sin(this.pitch),
      Math.cos(this.yaw) * cp
    ).multiplyScalar(this.dist);

    const pos = this._focus.clone().add(offset);
    if (pos.y < 0.6) pos.y = 0.6; // don't dip below the baseplate
    this.camera.position.copy(pos);
    this.camera.lookAt(this._focus);
  }
}