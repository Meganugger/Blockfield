import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Play, Wrench } from 'lucide-react';

const COLORS = ['#2a6dd0', '#d04a35', '#1fae51', '#e8b431', '#8a4fd3', '#e066a6'];

export default function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState(sessionStorage.getItem('bf_username') || '');
  const [color, setColor] = useState(sessionStorage.getItem('bf_color') || COLORS[0]);

  const join = (e) => {
    e.preventDefault();
    const clean = name.trim().slice(0, 20);
    if (!clean) return;
    sessionStorage.setItem('bf_username', clean);
    sessionStorage.setItem('bf_color', color);
    navigate('/play');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b1530] via-[#10224d] to-[#1a3a6e] px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-400/20 border border-sky-300/30 flex items-center justify-center">
            <Box className="w-6 h-6 text-sky-300" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">
            Block<span className="text-sky-300">field</span>
          </h1>
        </div>
        <p className="text-center text-sky-100/60 text-sm mb-10">
          An original, open multiplayer baseplate world. Pick a name and jump in.
        </p>

        <form
          onSubmit={join}
          className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 p-8 space-y-6 shadow-2xl"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-sky-100/50 mb-2">
              Username
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="e.g. Builder42"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-sky-100/50 mb-2">
              Avatar color
            </label>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-xl transition-transform ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: c }}
                  aria-label={`color ${c}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#0b1530] font-bold text-lg transition-colors"
          >
            <Play className="w-5 h-5" /> Join World
          </button>
        </form>

        <div className="flex items-center justify-between mt-6 text-sm">
          <Link
            to="/editor"
            className="flex items-center gap-1.5 text-sky-100/50 hover:text-white transition-colors"
          >
            <Wrench className="w-4 h-4" /> World Editor
          </Link>
          <span className="text-sky-100/35">WASD move · Space jump · Shift run · / chat</span>
        </div>
      </motion.div>
    </div>
  );
}