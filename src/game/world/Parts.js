import * as THREE from 'three';

// Static world parts: axis-aligned boxes defined in the world config.
// Returns meshes (rendering + camera obstruction) and AABB colliders (physics).
export function createParts(scene, parts = []) {
  const meshes = [];
  const colliders = [];
  for (const p of parts) {
    const sx = p.sx || 4, sy = p.sy || 4, sz = p.sz || 4;
    const mat = new THREE.MeshStandardMaterial({ color: p.color || '#c84d3c', roughness: 0.4, metalness: 0.05 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    mesh.position.set(p.x || 0, p.y ?? sy / 2, p.z || 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshes.push(mesh);
    colliders.push({
      minX: mesh.position.x - sx / 2, maxX: mesh.position.x + sx / 2,
      minY: mesh.position.y - sy / 2, maxY: mesh.position.y + sy / 2,
      minZ: mesh.position.z - sz / 2, maxZ: mesh.position.z + sz / 2,
    });
  }
  return { meshes, colliders };
}
