// Lightweight gameplay extension layer.
// Register handlers with scripts.on(event, fn). The engine emits:
//   onPlayerJoin, onPlayerLeave, onPlayerRespawn, onPlayerDeath, onTick, onChatMessage
// Handlers are sandboxed by try/catch so a bad script never crashes the engine.
// This is intentionally NOT an arbitrary-code runner; only first-party systems register here.

class GameScripts {
  constructor() {
    this.handlers = {};
  }

  on(event, fn) {
    (this.handlers[event] ||= []).push(fn);
    return () => {
      this.handlers[event] = (this.handlers[event] || []).filter((f) => f !== fn);
    };
  }

  emit(event, payload) {
    const fns = this.handlers[event];
    if (!fns) return;
    for (const fn of fns) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[GameScripts] handler for "${event}" failed:`, err);
      }
    }
  }
}

export const scripts = new GameScripts();