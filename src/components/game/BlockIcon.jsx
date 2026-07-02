import React from 'react';

// Tiny isometric block preview used in inventory slots. Draws a 3D-looking
// cube as an SVG with three faces shaded from the item's base color.
function shade(hex, factor) {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * factor)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
}

export default function BlockIcon({ color = '#888888', size = 30, title }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-label={title}>
      {title && <title>{title}</title>}
      {/* top face */}
      <polygon points="16,3 29,10 16,17 3,10" fill={shade(color, 1.25)} />
      {/* left face */}
      <polygon points="3,10 16,17 16,31 3,24" fill={shade(color, 0.75)} />
      {/* right face */}
      <polygon points="29,10 16,17 16,31 29,24" fill={shade(color, 0.95)} />
      {/* edge outline */}
      <polygon
        points="16,3 29,10 29,24 16,31 3,24 3,10"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1"
      />
    </svg>
  );
}
