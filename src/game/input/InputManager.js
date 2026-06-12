// Keyboard input. Decoupled from simulation: the controller polls this each tick.

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.enabled = true;
    this._down = (e) => {
      if (!this.enabled) return;
      this.keys.add(e.code);
      if (e.code === 'Space') e.preventDefault();
    };
    this._up = (e) => this.keys.delete(e.code);
    this._blur = () => this.keys.clear();
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
    if (!enabled) this.keys.clear();
  }

  get moveVector() {
    if (!this.enabled) return { x: 0, z: 0 };
    const x = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    const z = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    return { x, z };
  }

  get jump() {
    return this.enabled && this.keys.has('Space');
  }

  get run() {
    return this.enabled && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'));
  }
}