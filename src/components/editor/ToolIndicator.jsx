import React from 'react';
import { Gem, ArrowUpToLine } from 'lucide-react';

const TOOLS = [
  { id: 'collectible', label: 'Collectible', Icon: Gem, activeClass: 'bg-sky-400/20 border-sky-300 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.5)]' },
  { id: 'jumppad', label: 'Jump Pad', Icon: ArrowUpToLine, activeClass: 'bg-emerald-400/20 border-emerald-300 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)]' },
];

// Sticky editor toolbar: shows which placement tool is active. Clicking a tool
// selects it (click again to deselect); the Editor highlights the matching
// panel and swaps the mouse cursor so it's always clear what you're placing.
export default function ToolIndicator({ activeTool, onSelect }) {
  const active = TOOLS.find((t) => t.id === activeTool);
  return (
    <div className="sticky top-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 w-fit">
      <span className="text-xs text-sky-100/50 pr-1">Tool:</span>
      {TOOLS.map(({ id, label, Icon, activeClass }) => (
        <button
          key={id}
          onClick={() => onSelect(activeTool === id ? null : id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
            activeTool === id ? activeClass : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Icon className="w-4 h-4" /> {label}
        </button>
      ))}
      <span className="text-xs text-white/40 pl-1">
        {active ? `Placing: ${active.label}` : 'No tool selected'}
      </span>
    </div>
  );
}
