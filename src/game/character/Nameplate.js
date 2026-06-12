import * as THREE from 'three';

// Billboard nameplate rendered to a canvas texture. Sprites always face the camera.
export function createNameplate(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.strokeText(String(name).slice(0, 20), 256, 64);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(name).slice(0, 20), 256, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(6, 1.5, 1);
  sprite.position.y = 6.3;
  sprite.renderOrder = 10;
  return sprite;
}