# Manual Test Checklist

1. **Launcher** — open `/`, enter a username, pick a color, click Join World → lands on `/play`.
2. **World renders** — sky gradient, sunlit studded baseplate, shadows under the avatar.
3. **Movement** — WASD walks (camera-relative), Shift runs, arms/legs swing faster while running.
4. **Camera** — click the canvas to lock pointer; mouse orbits, scroll zooms (clamped), pitch clamps.
5. **Jump/fall** — Space jumps (jump pose), falling shows fall pose, landing returns to idle/walk.
6. **Nameplate** — username floats above the avatar and always faces the camera.
7. **Death/respawn** — walk off the edge of the baseplate, fall into the void → "You died" overlay, avatar tips over, respawns at spawn after ~3s with full health; deaths +1 on the leaderboard. No duplicate nameplates/UI after respawn.
8. **Two clients** — open a second browser tab/window, join with a different name → both see each other moving with smooth interpolation, correct colors, nameplates, and both rows on the leaderboard.
9. **Chat** — press `/`, type, Enter → message appears on both clients with the sender name. Spamming faster than ~1 msg/1.2s is dropped.
10. **Disconnect cleanup** — close one tab → within ~12s the other client's leaderboard row and avatar disappear. No duplicate rows after the same player rejoins.
11. **Editor** — open `/editor`, change baseplate size / spawn height / sky colors / gravity, Save → rejoin `/play` and verify the world reflects the changes.
12. **Resize** — resize the window during play → canvas and camera aspect adapt without distortion.

## Physics / movement checklist (Roblox-like controller)

- Spawn on baseplate; no sinking, no jitter while idle.
- Walk W/A/S/D in all four directions; movement is camera-relative.
- Diagonal movement (e.g. W+D) is NOT faster than straight movement.
- Hold Shift: run speed engages; release: drops back to walk crisply.
- Releasing all keys on ground: character stops quickly (strong braking), no ice-skating.
- Jump from standing and while running: single strong impulse, heavy fall.
- HOLD Space: exactly one jump fires; no auto-bunnyhop on landing (allowHeldJump=false).
- Press Space ~0.1s BEFORE landing: buffered jump fires on touchdown.
- Walk off a platform edge and press Space within ~0.1s: coyote jump fires.
- Land on the demo parts (red/yellow/green) without jitter or bounce.
- Walk into the side of a part: slide along it, no sticky jitter, no speed gain.
- Walk onto a ledge lower than 1 stud: automatic step-up, no jump needed.
- Jump under an overhang (build one in editor): head bump stops ascent cleanly.
- Fall from the yellow part (8 studs): lands on baseplate, never tunnels through.
- Fall into the void: death + respawn resets position, velocity, and all jump state.
- Open chat with "/" mid-run: movement stops, held keys cleared, Space does not scroll page.
- Camera follow + obstruction still work; pointer lock and zoom unchanged.
- Second client: remote players still animate idle/walk/run/jump/fall correctly.
