import * as THREE from 'three';

// Original studded-tile baseplate texture, generated procedurally (no external assets).
function makeBaseplateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#6d7075';
  ctx.fillRect(0, 0, 256, 256);

  // Tile edges
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 252);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 2;
  ctx.strokeRect(7, 7, 242, 242);

  // 4x4 studs per tile
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const cx = 32 + i * 64;
      const cy = 32 + j * 64;
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.arc(cx + 3, cy + 4, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBaseplate(scene, size = 512) {
  const tex = makeBaseplateTexture();
  tex.repeat.set(size / 8, size / 8);

  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, 16, size), mat);
  mesh.position.y = -8; // top surface at y = 0
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}