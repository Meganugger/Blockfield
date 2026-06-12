import React from 'react';

// Live player list (top right). Server-side records are deduped by username
// (freshest wins) so reconnects never show duplicate rows.
export default function Leaderboard({ players }) {
  const deduped = [...new Map(
    [...players]
      .sort((a, b) => (a.last_seen || 0) - (b.last_seen || 0))
      .map((p) => [p.username, p])
  ).values()].sort((a, b) => (b.isSelf ? 0 : 1) - (a.isSelf ? 0 : 1) || String(a.username).localeCompare(String(b.username)));

  return (
    <div className="absolute top-4 right-4 w-56 rounded-xl bg-black/45 backdrop-blur-md border border-white/10 overflow-hidden pointer-events-none">
      <div className="flex justify-between px-3 py-2 text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
        <span>Players ({deduped.length})</span>
        <span>Deaths</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {deduped.map((p) => (
          <div
            key={p.username}
            className={`flex justify-between px-3 py-1.5 text-sm ${
              p.isSelf ? 'text-sky-300 font-semibold bg-white/5' : 'text-white/85'
            }`}
          >
            <span className="truncate">{p.username}</span>
            <span className="tabular-nums">{p.deaths || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}