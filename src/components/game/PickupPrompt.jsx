import React from 'react';

// Proximity interaction label. Appears just above the inventory bar when the
// character is near a collectible. Walking into the block auto-collects it, so
// this is a lightweight hint rather than a key-press gate.
export default function PickupPrompt({ block }) {
  if (!block) return null;
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-150">
        <span
          className="w-3.5 h-3.5 rounded-sm"
          style={{ background: block.color, boxShadow: `0 0 8px ${block.color}aa` }}
        />
        <span className="text-white text-sm font-medium whitespace-nowrap">
          Pick up <span className="font-bold">{block.name}</span>
        </span>
      </div>
    </div>
  );
}
