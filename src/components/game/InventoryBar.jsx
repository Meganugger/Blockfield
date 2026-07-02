import React from 'react';
import BlockIcon from '@/components/game/BlockIcon';

// Bottom-center inventory hotbar. Renders fixed slots; filled slots show an
// isometric block preview, name tooltip and stack count. Purely presentational --
// the Backpack model drives it through the `slots` prop.
export default function InventoryBar({ slots, equippedIndex = -1 }) {
  if (!slots || !slots.length) return null;
  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
      {slots.map((item, i) => {
        const selected = i === equippedIndex;
        return (
          <div
            key={i}
            className={`w-12 h-12 rounded-lg backdrop-blur-md flex items-center justify-center relative transition-all ${
              selected
                ? 'bg-sky-400/15 border-2 border-sky-300 ring-2 ring-sky-400/40 shadow-[0_0_16px_rgba(56,189,248,0.7)] -translate-y-1.5 scale-105'
                : 'bg-black/45 border border-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 left-1 text-[9px] font-bold tabular-nums ${
                selected ? 'text-sky-200' : 'text-white/30'
              }`}
            >
              {i + 1}
            </span>
            {item ? (
              <>
                <BlockIcon color={item.color} title={item.name} />
                {item.count > 1 && (
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white tabular-nums drop-shadow">
                    {item.count}
                  </span>
                )}
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
