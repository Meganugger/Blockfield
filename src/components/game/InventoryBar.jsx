import React from 'react';

// Bottom-center inventory hotbar. Renders fixed slots; filled slots show the
// block's color swatch, name and stack count. Purely presentational -- the
// Backpack model drives it through the `slots` prop.
export default function InventoryBar({ slots, equippedIndex = -1 }) {
  if (!slots || !slots.length) return null;
  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
      {slots.map((item, i) => (
        <div
          key={i}
          className={`w-12 h-12 rounded-lg bg-black/45 backdrop-blur-md flex items-center justify-center relative transition-all ${
            i === equippedIndex
              ? 'border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)] -translate-y-1'
              : 'border border-white/15'
          }`}
        >
          {item ? (
            <>
              <div
                className="w-7 h-7 rounded-md shadow-inner"
                style={{ background: item.color, boxShadow: `0 0 8px ${item.color}80` }}
                title={item.name}
              />
              {item.count > 1 && (
                <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white tabular-nums drop-shadow">
                  {item.count}
                </span>
              )}
            </>
          ) : (
            <span className="text-white/20 text-xs">{i + 1}</span>
          )}
        </div>
      ))}
    </div>
  );
}
