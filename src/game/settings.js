// Player-local settings with safe localStorage persistence.
// Reads always fall back to sane defaults if storage is unavailable,
// blocked (private mode) or corrupted.

const STORAGE_KEY = 'blockfield_settings_v1';

export const DEFAULT_SETTINGS = {
  sensitivity: 1, // camera look sensitivity multiplier (0.2 - 3)
  invertY: false,
  volume: 0.5, // placeholder until audio lands
  shadows: true,
  showLeaderboard: true,
  showChat: true,
};

const clampNum = (v, min, max, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

export function loadSettings() {
  let parsed = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) parsed = JSON.parse(raw);
  } catch {
    parsed = null; // storage unavailable or corrupted JSON -> defaults
  }
  if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
  return {
    sensitivity: clampNum(parsed.sensitivity, 0.2, 3, DEFAULT_SETTINGS.sensitivity),
    invertY: !!parsed.invertY,
    volume: clampNum(parsed.volume, 0, 1, DEFAULT_SETTINGS.volume),
    shadows: parsed.shadows !== false,
    showLeaderboard: parsed.showLeaderboard !== false,
    showChat: parsed.showChat !== false,
  };
}

export function saveSettings(settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable (private mode / quota) -> settings stay session-only
  }
}
