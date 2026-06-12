import { base44 } from '@/api/base44Client';
import { NET } from '../config';
import { CONNECTION } from '../protocol';

// Replication layer over the platform's real-time data sync.
// Responsibilities: join/leave, throttled state replication, remote player
// registry with stale pruning (heartbeat via last_seen), chat broadcast with
// rate limiting. The protocol shapes live in protocol.js so a dedicated
// WebSocket server transport can replace this class without touching the engine.

export class NetworkClient {
  constructor(handlers) {
    this.h = handlers; // { onPlayers, onChat, onStatus }
    this.players = new Map(); // id -> remote player record
    this.lastSend = 0;
    this.lastChat = 0;
    this.connected = false;
    this.playerId = null;
  }

  async connect(username, color, spawn) {
    this.h.onStatus?.(CONNECTION.CONNECTING);
    this.username = username;

    const rec = await base44.entities.Player.create({
      username,
      color,
      x: spawn.x, y: spawn.y, z: spawn.z,
      yaw: 0, anim: 'idle', health: 100, deaths: 0,
      last_seen: Date.now(),
    });
    this.playerId = rec.id;

    // Load currently-active players
    const all = await base44.entities.Player.list('-updated_date', 100);
    const now = Date.now();
    for (const p of all) {
      if (p.id !== this.playerId && now - (p.last_seen || 0) < NET.staleTimeoutMs) {
        this.players.set(p.id, p);
      }
    }

    this.unsubPlayers = base44.entities.Player.subscribe((event) => {
      if (event.id === this.playerId) return;
      if (event.type === 'delete') this.players.delete(event.id);
      else this.players.set(event.id, event.data);
      this._emit();
    });

    this.unsubChat = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === 'create') this.h.onChat?.(event.data);
    });

    // Presence pruning (covers tabs killed without a clean disconnect)
    this.pruneTimer = setInterval(() => {
      const cutoff = Date.now() - NET.staleTimeoutMs;
      let changed = false;
      for (const [id, p] of this.players) {
        if ((p.last_seen || 0) < cutoff) {
          this.players.delete(id);
          changed = true;
        }
      }
      if (changed) this._emit();
    }, 4000);

    this.connected = true;
    this.h.onStatus?.(CONNECTION.CONNECTED);
    this._emit();
  }

  _emit() {
    this.h.onPlayers?.(this.getRemotes());
  }

  getRemotes() {
    return [...this.players.values()];
  }

  // Called every tick; throttles internally.
  sendState(state) {
    if (!this.connected || !this.playerId) return;
    const now = Date.now();
    if (now - this.lastSend < NET.stateIntervalMs) return;
    this.lastSend = now;
    base44.entities.Player.update(this.playerId, { ...state, last_seen: now }).catch(() => {
      this.h.onStatus?.(CONNECTION.RECONNECTING);
    });
  }

  // Returns false when rate-limited or empty.
  sendChat(text) {
    const clean = String(text || '').trim().slice(0, 200);
    if (!clean || !this.connected) return false;
    const now = Date.now();
    if (now - this.lastChat < NET.chatCooldownMs) return false;
    this.lastChat = now;
    base44.entities.ChatMessage.create({ username: this.username, text: clean }).catch(() => {});
    return true;
  }

  disconnect() {
    this.connected = false;
    this.unsubPlayers?.();
    this.unsubChat?.();
    clearInterval(this.pruneTimer);
    if (this.playerId) {
      base44.entities.Player.delete(this.playerId).catch(() => {});
      this.playerId = null;
    }
    this.h.onStatus?.(CONNECTION.DISCONNECTED);
  }
}