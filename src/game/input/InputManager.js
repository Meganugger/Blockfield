// Keyboard input. Decoupled from simulation: the controller polls this each tick.
// Jump uses press-edge detection: consumeJumpPressed() returns true exactly once
// per physical Space press, so holding the key never re-triggers a jump.

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.enabled = true;
    this._jumpPressed = false;
    this._jumpReleased = false;
    this._interactPressed = false;
    this._dropPressed = false;
    this._slotPressed = -1; // 0-based inventory slot requested this frame, or -1
    this._down = (e) => {
      if (!this.enabled) return;
      if (e.code === 'Space') {
        e.preventDefault(); // stop browser page scroll
        if (!e.repeat && !this.keys.has('Space')) this._jumpPressed = true;
      }
      if (e.code === 'KeyE' && !e.repeat && !this.keys.has('KeyE')) this._interactPressed = true;
      if (e.code === 'KeyQ' && !e.repeat && !this.keys.has('KeyQ')) this._dropPressed = true;
      if (!e.repeat && /^Digit[1-8]$/.test(e.code) && !this.keys.has(e.code)) {
        this._slotPressed = Number(e.code.slice(5)) - 1;
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
    this._interactPressed = false;
    this._dropPressed = false;
    this._slotPressed = -1;
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

  /** One-frame interact (E) press edge; consumed on read. */
  consumeInteractPressed() {
    if (!this.enabled) return false;
    const p = this._interactPressed;
    this._interactPressed = false;
    return p;
  }

  /** One-frame drop (Q) press edge; consumed on read. */
  consumeDropPressed() {
    if (!this.enabled) return false;
    const p = this._dropPressed;
    this._dropPressed = false;
    return p;
  }

  /** One-frame inventory slot (0-based) press edge; -1 if none. Consumed on read. */
  consumeSlotPressed() {
    if (!this.enabled) return -1;
    const s = this._slotPressed;
    this._slotPressed = -1;
    return s;
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
