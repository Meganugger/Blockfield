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