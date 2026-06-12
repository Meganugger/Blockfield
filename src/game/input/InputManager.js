// Keyboard input. Decoupled from simulation: the controller polls this each tick.
// Jump uses press-edge detection: consumeJumpPressed() returns true exactly once
// per physical Space press, so holding the key never re-triggers a jump.

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.enabled = true;
    this._jumpPressed = false;
    this._jumpReleased = false;
    this._down = (e) => {
      if (!this.enabled) return;
      if (e.code === 'Space') {
        e.preventDefault(); // stop browser page scroll
        if (!e.repeat && !this.keys.has('Space')) this._jumpPressed = true;
      }
      this.keys.add(e.code);
    };
    this._up = (e) => {
      if (e.code === 'Space' && this.keys.has('Space')) this._jumpReleased = true;
      this.keys.delete(e.code);
    };
    this._blur = () => this._clearAll();
  }

  _clearAll() {
    this.keys.clear();
    this._jumpPressed = false;
    this._jumpReleased = false;
  }

  attach() {
    window.addEventListener('keydown', this._down);
    window.addEventListener('keyup', this._up);
    window.addEventListener('blur', this._blur);
  }

  detach() {
    window.removeEventListener('keydown', this._down);
    window.removeEventListener('keyup', this._up);
    window.removeEventListener('blur', this._blur);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this._clearAll(); // safe clear on chat open / blur
  }

  /** One-frame jump press edge; consumed on read. */
  consumeJumpPressed() {
    if (!this.enabled) return false;
    const p = this._jumpPressed;
    this._jumpPressed = false;
    return p;
  }

  /** One-frame jump release edge; consumed on read. */
  consumeJumpReleased() {
    const r = this._jumpReleased;
    this._jumpReleased = false;
    return r;
  }

  /** Space currently held. */
  get jumpDown() {
    return this.enabled && this.keys.has('Space');
  }

  /** @deprecated Held-Space query kept for backward compatibility; prefer jumpDown/consumeJumpPressed. */
  get jump() {
    return this.jumpDown;
  }

  get moveVector() {
    if (!this.enabled) return { x: 0, z: 0 };
    const x = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    const z = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    return { x, z };
  }

  get run() {
    return this.enabled && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'));
  }
}
