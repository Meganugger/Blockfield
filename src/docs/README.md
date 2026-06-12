# Blockfield

An original, clean-room **Roblox-like platform prototype**: join a shared baseplate world with a blocky avatar, third-person camera, physics, animations, nameplates, leaderboard, chat, and death/respawn.

## What this is
- A standalone web client (React + Three.js) with a custom game engine under `src/game/`.
- Real multiplayer: player state replicates through the platform's real-time data sync.
- A separate World Editor (`/editor`) that edits the shared world config (baseplate size, spawn, gravity, sky, lighting).
- A gameplay extension layer (`game/scripting/GameScripts.js`) with `onPlayerJoin/Leave/Respawn/Death/Tick/ChatMessage` hooks.

## What this is NOT
- Not Roblox, not built in Roblox Studio, no Roblox APIs/assets/branding. All assets are procedurally generated originals.
- Not a fully authoritative dedicated server (see Known limitations).

## Run
The app runs in the platform preview automatically. Routes:
- `/` — launcher (pick username + avatar color)
- `/play` — the game
- `/editor` — world editor

## Controls
- **WASD** — move (camera-relative)
- **Space** — jump
- **Shift** — run
- **Mouse** (click canvas for pointer lock) — orbit camera
- **Scroll** — zoom
- **/** — open chat, **Enter** send, **Esc** close

## Known limitations
- Replication runs over real-time data sync at ~4Hz with interpolation; a dedicated WebSocket server would allow 20–60Hz and server-authoritative physics.
- Health/death is simulated client-side (void fall only); no damage sources yet.
- No mobile touch controls yet.