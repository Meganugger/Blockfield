import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { DEFAULT_WORLD } from '@/game/config';
import { ArrowLeft, Save, Check } from 'lucide-react';

const FIELDS = [
  { key: 'name', label: 'World name', type: 'text' },
  { key: 'baseplate_size', label: 'Baseplate size (studs)', type: 'number' },
  { key: 'spawn_x', label: 'Spawn X', type: 'number' },
  { key: 'spawn_y', label: 'Spawn Y (height)', type: 'number' },
  { key: 'spawn_z', label: 'Spawn Z', type: 'number' },
  { key: 'gravity', label: 'Gravity (studs/s²)', type: 'number' },
  { key: 'sky_top', label: 'Sky top color', type: 'color' },
  { key: 'sky_bottom', label: 'Sky horizon color', type: 'color' },
  { key: 'sun_intensity', label: 'Sun intensity', type: 'number' },
  { key: 'ambient_intensity', label: 'Ambient intensity', type: 'number' },
];

export default function Editor() {
  const [recordId, setRecordId] = useState(null);
  const [form, setForm] = useState(DEFAULT_WORLD);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.WorldConfig.list();
      if (list[0]) {
        setRecordId(list[0].id);
        const next = { ...DEFAULT_WORLD };
        for (const f of FIELDS) if (list[0][f.key] !== undefined) next[f.key] = list[0][f.key];
        setForm(next);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {};
    for (const f of FIELDS) {
      payload[f.key] = f.type === 'number' ? Number(form[f.key]) || 0 : form[f.key];
    }
    if (recordId) await base44.entities.WorldConfig.update(recordId, payload);
    else {
      const rec = await base44.entities.WorldConfig.create(payload);
      setRecordId(rec.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1530] to-[#13294f] px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sky-100/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to launcher
        </Link>
        <h1 className="text-3xl font-black text-white mb-1">World Editor</h1>
        <p className="text-sky-100/50 text-sm mb-8">
          Edit the default world configuration. Changes apply the next time a player joins.
        </p>

        <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-8 space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-sky-100/70">{f.label}</label>
              {f.type === 'color' ? (
                <input
                  type="color"
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-28 h-10 rounded-lg bg-black/30 border border-white/15 cursor-pointer"
                />
              ) : (
                <input
                  type={f.type}
                  step="any"
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-44 px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                />
              )}
            </div>
          ))}

          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-[#0b1530] font-bold transition-colors"
          >
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Saved' : saving ? 'Saving…' : 'Save World'}
          </button>
        </div>
      </div>
    </div>
  );
}