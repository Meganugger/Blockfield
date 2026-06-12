import * as THREE from 'three';

// Third-person orbit camera, Roblox-style mouse model: the camera rotates ONLY
// while the right mouse button is held (camera-drag mode). Plain mouse movement
// and left clicks never rotate the camera. Pointer lock is requested only while
// right-dragging and released when the drag ends; if pointer lock is not
// available, raw client deltas are used instead. Wheel zoom, pitch/zoom clamps,
// obstruction raycast and smooth follow are preserved.
export class ThirdPersonCamera {
  constructor(dom) {
    this.dom = dom;
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 3000);
    this.yaw = Math.PI; // start behind avatar (avatar faces +Z)
    this.pitch = 0.35;
    this.dist = 16;
    this.sensitivity = 1; // settings: look sensitivity multiplier
    this.invertY = false; // settings: invert vertical look
    this.enabled = true; // false while a menu / chat blocks game input
    this._dragging = false;
    this._last = null; // fallback deltas when pointer lock is unavailable
    this._focus = new THREE.Vector3(0, 4, 0);
    this._raycaster = new THREE.Raycaster();
    this.obstacles = [];

    this._onMouseDown = (e) => {
      if (e.button !== 2 || !this.enabled) return; // right button only
      e.preventDefault();
      this._dragging = true;
      this._last = { x: e.clientX, y: e.clientY };
      this.dom.requestPointerLock?.();
    };
    this._onMouseUp = (e) => {
      if (e.button !== 2) return;
      this._endDrag();
    };
    this._onMove = (e) => {
      if (!this._dragging || !this.enabled) return;
      let dx, dy;
      if (document.pointerLockElement === this.dom) {
        dx = e.movementX;
        dy = e.movementY;
      } else if (this._last) {
        dx = e.clientX - this._last.x;
        dy = e.clientY - this._last.y;
        this._last = { x: e.clientX, y: e.clientY };
      } else {
        return;
      }
      const k = 0.0025 * this.sensitivity;
      this.yaw -= dx * k;
      const dir = this.invertY ? -1 : 1;
      this.pitch = Math.max(-0.4, Math.min(1.4, this.pitch + dy * k * dir));
    };
    this._onWheel = (e) => {
      if (!this.enabled) return;
      this.dist = Math.max(6, Math.min(40, this.dist + e.deltaY * 0.02));
    };
    // Right-drag is the camera control; never show the browser context menu
    // over the game canvas.
    this._onContextMenu = (e) => e.preventDefault();
    this._onBlur = () => this._endDrag();
  }

  _endDrag() {
    this._dragging = false;
    this._last = null;
    if (document.pointerLockElement === this.dom) document.exitPointerLock?.();
  }

  attach() {
    this.dom.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('mousemove', this._onMove);
    this.dom.addEventListener('wheel', this._onWheel, { passive: true });
    this.dom.addEventListener('contextmenu', this._onContextMenu);
    window.addEventListener('blur', this._onBlur);
  }

  detach() {
    this.dom.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('mousemove', this._onMove);
    this.dom.removeEventListener('wheel', this._onWheel);
    this.dom.removeEventListener('contextmenu', this._onContextMenu);
    window.removeEventListener('blur', this._onBlur);
    this._endDrag();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this._endDrag();
  }

  setObstacles(meshes) {
    this.obstacles = meshes || [];
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

    // Obstruction handling: pull the camera in front of any blocking part
    let dist = this.dist;
    if (this.obstacles.length) {
      const dir = offset.clone().normalize();
      this._raycaster.set(this._focus, dir);
      this._raycaster.far = this.dist;
      const hit = this._raycaster.intersectObjects(this.obstacles, false)[0];
      if (hit) dist = Math.max(2, hit.distance - 0.8);
    }
    const pos = this._focus.clone().add(offset.normalize().multiplyScalar(dist));
    if (pos.y < 0.6) pos.y = 0.6; // don't dip below the baseplate
    this.camera.position.copy(pos);
    this.camera.lookAt(this._focus);
  }
}
