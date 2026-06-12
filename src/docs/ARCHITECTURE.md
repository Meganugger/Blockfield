# Architecture

## Layers
```
React UI (pages/, components/game/)   <- HUD, leaderboard, chat, death screen
        ↕ event callbacks
Engine (game/Engine.js)               <- fixed 60Hz simulation, decoupled render loop
 ├─ renderer/createScene.js           <- WebGL renderer, sky shader, sun + shadows
 ├─ world/Baseplate.js                <- procedural studded baseplate
 ├─ character/                        <- Avatar mesh, CharacterController physics,
 │                                       AnimationController (procedural), Nameplate
 ├─ camera/ThirdPersonCamera.js       <- pointer-lock orbit camera
 ├─ input/InputManager.js             <- keyboard polling, chat-safe disable
 ├─ net/NetworkClient.js              <- replication transport (real-time data sync)
 ├─ net/RemotePlayers.js              <- remote avatar spawn/interpolation
 └─ scripting/GameScripts.js          <- gameplay extension hooks
```

## Simulation
- Fixed timestep accumulator (1/60s) inside `requestAnimationFrame`; rendering happens once per frame regardless of how many sim steps ran.
- Input → physics → animation → camera → replication, strictly in that order, fully separated modules.

## Replication protocol (game/protocol.js)
Player state record: `{ username, color, x, y, z, yaw, anim, health, deaths, last_seen }`.
- Join: create a Player record. Leave: delete it (plus heartbeat pruning after 12s for crashed tabs).
- State: throttled updates every 250ms; remote clients interpolate position/yaw and mirror anim state.
- Chat: ChatMessage records broadcast via subscription; 1.2s client rate limit; rendered as plain text (no HTML injection).
- The `NetworkClient` class is a swappable transport: a dedicated WebSocket server can implement the same handler interface (`onPlayers`, `onChat`, `onStatus`) without engine changes.

## World format
`WorldConfig` entity (one record = the default world): name, baseplate_size, spawn_x/y/z, gravity, sky_top, sky_bottom, sun_intensity, ambient_intensity. Edited by `/editor`, loaded by `/play` on join, merged over `DEFAULT_WORLD` defaults.

## Scripting layer
`scripts.on(event, fn)` — events: `onPlayerJoin`, `onPlayerLeave`, `onPlayerDeath`, `onPlayerRespawn`, `onTick`, `onChatMessage`. Handlers are try/catch sandboxed. No arbitrary user code execution.