import React from 'react';

// Health bar (bottom center), identity chip + connection status (top left).
export default function Hud({ username, health, status }) {
  const pct = Math.max(0, Math.min(100, health));
  const statusColor =
    status === 'connected' ? 'bg-emerald-400' : status === 'connecting' ? 'bg-amber-400' : 'bg-red-400';

  return (
    <>
      <div className="absolute top-4 left-4 flex items-center gap-3 pointer-events-none">
        <div className="px-4 py-2 rounded-xl bg-black/45 backdrop-blur-md border border-white/10">
          <div className="text-white font-semibold text-sm leading-none">{username}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-white/60 text-[11px] capitalize leading-none">{status}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 pointer-events-none">
        <div className="h-4 rounded-full bg-black/50 backdrop-blur-md border border-white/15 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pct > 50 ? 'bg-emerald-400' : pct > 20 ? 'bg-amber-400' : 'bg-red-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-center text-white/80 text-xs mt-1 font-medium drop-shadow">
          {pct} / 100
        </div>
      </div>
    </>
  );
}