import React, { useState } from 'react';
import { Plus, Trash2, ArrowUpToLine } from 'lucide-react';
import { PHYSICS } from '@/game/config';

// Editor tool for placing jump pads: static parts with a `jump` boost that
// launch the player upward on landing. Emits only the jump-pad parts upward;
// the Editor merges them back with the plain parts before saving to WorldConfig.
export default function JumpPadPlacer({ pads, onChange }) {
  const [draft, setDraft] = useState({
    color: '#39e08a',
    x: 0, y: 1, z: 0,
    sx: 8, sy: 2, sz: 8,
    jump: PHYSICS.jumpPadVelocity,
  });

  const setField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const add = () => {
    const pad = {
      color: draft.color,
      x: Number(draft.x) || 0,
      y: Number(draft.y) || 0,
      z: Number(draft.z) || 0,
      sx: Number(draft.sx) || 4,
      sy: Number(draft.sy) || 2,
      sz: Number(draft.sz) || 4,
      jump: Number(draft.jump) || PHYSICS.jumpPadVelocity,
    };
    onChange([...pads, pad]);
  };

  const remove = (idx) => onChange(pads.filter((_, i) => i !== idx));

  return (
    <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-8 space-y-5">
      <div className="flex items-center gap-2">
        <ArrowUpToLine className="w-5 h-5 text-emerald-300" />
        <h2 className="text-lg font-bold text-white">Jump Pads</h2>
        <span className="ml-auto text-xs text-sky-100/40">{pads.length} placed</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 flex items-center justify-between gap-3">
          <span className="text-sm text-sky-100/70">Color</span>
          <input
            type="color"
            value={draft.color}
            onChange={(e) => setField('color', e.target.value)}
            className="w-28 h-10 rounded-lg bg-black/30 border border-white/15 cursor-pointer"
          />
        </label>
        <label className="col-span-2 flex items-center justify-between gap-3">
          <span className="text-sm text-sky-100/70">Boost (studs/s)</span>
          <input
            type="number"
            step="any"
            value={draft.jump}
            onChange={(e) => setField('jump', e.target.value)}
            className="w-44 px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-400"
          />
        </label>
        {[
          ['x', 'X'], ['y', 'Y'], ['z', 'Z'],
          ['sx', 'Width'], ['sy', 'Height'], ['sz', 'Depth'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-2">
            <span className="text-sm text-sky-100/70">{label}</span>
            <input
              type="number"
              step="any"
              value={draft[key]}
              onChange={(e) => setField(key, e.target.value)}
              className="w-24 px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-400"
            />
          </label>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
      >
        <Plus className="w-4 h-4" /> Add jump pad
      </button>

      {pads.length > 0 && (
        <div className="space-y-2 pt-1">
          {pads.map((p, idx) => (
            <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/25 border border-white/10">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: p.color || '#39e08a' }} />
              <span className="text-sm text-white/85">Boost {Math.round(p.jump)}</span>
              <span className="text-xs text-sky-100/40">({p.x}, {p.y}, {p.z})</span>
              <button
                onClick={() => remove(idx)}
                className="ml-auto text-white/40 hover:text-red-400 transition-colors"
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
