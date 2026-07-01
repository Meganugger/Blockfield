import React from 'react';

// Proximity interaction label. Appears just above the inventory bar when the
// character is near a collectible. Press E to pick the block up -- it leaves
// the map and appears in the inventory hotbar.
export default function PickupPrompt({ block }) {
  if (!block) return null;
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-150">
        <span
          className="w-3.5 h-3.5 rounded-sm"
          style={{ background: block.color, boxShadow: `0 0 8px ${block.color}aa` }}
        />
        <span className="text-white text-sm font-medium whitespace-nowrap flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-white/15 border border-white/25 text-xs font-bold leading-none">E</kbd>
          Pick up <span className="font-bold">{block.name}</span>
        </span>
      </div>
    </div>
  );
}
