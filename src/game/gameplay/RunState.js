// Local-first run tracking: objective timer, ordered checkpoints, finish and a
// persisted best time. The engine only talks to this class through update()
// events and spawnPoint, so a server-authoritative scorer can replace it later.

const bestKey = (id) => `blockfield_best_${id}`;

export const formatTime = (s) => {
  if (s == null || !Number.isFinite(s)) return '--:--.-';
  const m = Math.floor(s / 60);
  const sec = (s - m * 60).toFixed(1).padStart(4, '0');
  return `${m}:${sec}`;
};

export class RunState {
  constructor(course) {
    this.course = course || null;
    this.best = null;
    if (this.course) {
      try {
        const v = parseFloat(window.localStorage.getItem(bestKey(this.course.id)));
        if (Number.isFinite(v)) this.best = v;
      } catch {
        // storage unavailable -> best time stays session-only
      }
    }
    this.reset();
  }

  reset() {
    this.started = false;
    this.finished = false;
    this.elapsed = 0;
    this.checkpoint = 0; // index into course.checkpoints (0 = spawn)
  }

  /** Respawn point for the last reached checkpoint. */
  get spawnPoint() {
    const c = this.course;
    if (!c) return null;
    const cp = c.checkpoints[Math.min(this.checkpoint, c.checkpoints.length - 1)];
    return { x: cp.x, y: (cp.y ?? 0) + 1, z: cp.z };
  }

  sectionAt(pos) {
    const c = this.course;
    if (!c) return '';
    const t = c.towerZone;
    if (t && pos.x >= t.minX && pos.x <= t.maxX && pos.z >= t.minZ && pos.z <= t.maxZ) {
      return t.name;
    }
    const s = c.sections.find(
      (sec) => pos.z >= sec.minZ && pos.z <= sec.maxZ && Math.abs(pos.x) <= 25
    );
    return s ? s.name : 'Open Baseplate';
  }

  _inZone(zone, pos) {
    return (
      Math.hypot(pos.x - zone.x, pos.z - zone.z) <= zone.r &&
      Math.abs(pos.y - (zone.y ?? 0)) < 4
    );
  }

  /** Advance the run; returns events: {type:'start'|'checkpoint'|'finish', ...} */
  update(dt, pos) {
    const ev = [];
    const c = this.course;
    if (!c || this.finished) return ev;
    if (!this.started && Math.hypot(pos.x - c.start.x, pos.z - c.start.z) > c.start.r) {
      this.started = true;
      ev.push({ type: 'start' });
    }
    if (this.started) this.elapsed += dt;
    const next =
      this.checkpoint + 1 < c.checkpoints.length ? c.checkpoints[this.checkpoint + 1] : null;
    if (next && this._inZone(next, pos)) {
      this.checkpoint += 1;
      ev.push({ type: 'checkpoint', name: next.name });
    }
    if (this.started && this._inZone(c.finish, pos)) {
      this.finished = true;
      let newBest = false;
      if (this.best == null || this.elapsed < this.best) {
        this.best = this.elapsed;
        newBest = true;
        try {
          window.localStorage.setItem(bestKey(c.id), String(this.elapsed));
        } catch {
          // ignore: best time just won't persist
        }
      }
      ev.push({ type: 'finish', time: this.elapsed, newBest });
    }
    return ev;
  }
}
