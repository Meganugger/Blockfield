import React, { useState } from 'react';
import { Plus, Trash2, Gem } from 'lucide-react';

const uid = () =>
  `col_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Editor tool for placing collectible blocks in the world. Emits the full
// collectibles array upward via onChange; the Editor persists it to WorldConfig.
export default function CollectiblePlacer({ collectibles, onChange }) {
  const [draft, setDraft] = useState({ name: 'Coin', color: '#f5c542', x: 0, y: 3, z: 0 });

  const setField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const add = () => {
    const item = {
      id: uid(),
      name: draft.name.trim() || 'Block',
      color: draft.color,
      x: Number(draft.x) || 0,
      y: Number(draft.y) || 0,
      z: Number(draft.z) || 0,
    };
    onChange([...collectibles, item]);
  };

  const remove = (id) => onChange(collectibles.filter((c) => c.id !== id));

  return (
    <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-8 space-y-5">
      <div className="flex items-center gap-2">
        <Gem className="w-5 h-5 text-sky-300" />
        <h2 className="text-lg font-bold text-white">Collectibles</h2>
        <span className="ml-auto text-xs text-sky-100/40">{collectibles.length} placed</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 flex items-center justify-between gap-3">
          <span className="text-sm text-sky-100/70">Name</span>
          <input
            value={draft.name}
            onChange={(e) => setField('name', e.target.value)}
            className="w-44 px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
          />
        </label>
        <label className="col-span-2 flex items-center justify-between gap-3">
          <span className="text-sm text-sky-100/70">Color</span>
          <input
            type="color"
            value={draft.color}
            onChange={(e) => setField('color', e.target.value)}
            className="w-28 h-10 rounded-lg bg-black/30 border border-white/15 cursor-pointer"
          />
        </label>
        {['x', 'y', 'z'].map((axis) => (
          <label key={axis} className="flex items-center justify-between gap-2">
            <span className="text-sm text-sky-100/70 uppercase">{axis}</span>
            <input
              type="number"
              step="any"
              value={draft[axis]}
              onChange={(e) => setField(axis, e.target.value)}
              className="w-24 px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
            />
          </label>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
      >
        <Plus className="w-4 h-4" /> Place collectible
      </button>

      {collectibles.length > 0 && (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1">
          {collectibles.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/25 border border-white/10"
            >
              <span
                className="w-5 h-5 rounded-md shrink-0"
                style={{ background: c.color, boxShadow: `0 0 8px ${c.color}80` }}
              />
              <span className="text-sm text-white truncate flex-1">{c.name}</span>
              <span className="text-xs text-sky-100/40 tabular-nums">
                {Math.round(c.x)}, {Math.round(c.y)}, {Math.round(c.z)}
              </span>
              <button
                onClick={() => remove(c.id)}
                className="text-white/30 hover:text-red-400 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
