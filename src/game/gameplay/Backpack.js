// Simple client-side inventory: a fixed number of slots that stack identical
// block types by name+color. Emits a change callback whenever its contents
// change so the React inventory bar can re-render.

export class Backpack {
  constructor(slots = 8, onChange = null) {
    this.slots = slots;
    this.onChange = onChange;
    this.items = [];
  }

  add(block) {
    const existing = this.items.find((i) => i.name === block.name && i.color === block.color);
    if (existing) {
      existing.count += 1;
    } else if (this.items.length < this.slots) {
      this.items.push({ name: block.name, color: block.color, count: 1 });
    } else {
      return false;
    }
    this._emit();
    return true;
  }

  _emit() {
    this.onChange?.(this.snapshot());
  }

  snapshot() {
    const out = new Array(this.slots).fill(null);
    this.items.forEach((it, i) => {
      out[i] = { ...it };
    });
    return out;
  }
}
