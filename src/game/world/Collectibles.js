import * as THREE from 'three';

// Pickup blocks the player can collect. Each spawns a small, floating,
// spinning, slightly glowing cube. The class owns the meshes/animation and
// exposes findNearest(pos) for the prompt and collect(id) which the player
// triggers with the interact key, removing its mesh from the scene. Client-local for now --
// a server-authoritative item registry can replace this later.

const NEARBY_RADIUS = 5; // distance at which the pickup prompt appears

export class Collectibles {
  constructor(scene, defs = []) {
    this.scene = scene;
    this.items = [];
    for (const d of defs) {
      const size = d.size || 1;
      const mat = new THREE.MeshStandardMaterial({
        color: d.color || '#4ec0f0',
        emissive: new THREE.Color(d.color || '#4ec0f0'),
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
      mesh.castShadow = true;
      mesh.position.set(d.x || 0, (d.y ?? 1) + 0.5, d.z || 0);
      scene.add(mesh);
      this.items.push({
        id: d.id || `${d.x}_${d.z}`,
        name: d.name || 'Block',
        color: d.color || '#4ec0f0',
        mesh,
        baseY: mesh.position.y,
        collected: false,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(dt, elapsed) {
    for (const it of this.items) {
      if (it.collected) continue;
      it.mesh.rotation.y += dt * 1.6;
      it.mesh.position.y = it.baseY + Math.sin(elapsed * 2 + it.phase) * 0.25;
    }
  }

  // Closest un-collected item within NEARBY_RADIUS (for the proximity prompt), else null.
  findNearest(pos) {
    let best = null;
    let bestDist = NEARBY_RADIUS * NEARBY_RADIUS;
    for (const it of this.items) {
      if (it.collected) continue;
      const dx = it.mesh.position.x - pos.x;
      const dz = it.mesh.position.z - pos.z;
      const dy = it.mesh.position.y - (pos.y + 2);
      const d2 = dx * dx + dz * dz + dy * dy;
      if (d2 <= bestDist) {
        bestDist = d2;
        best = { id: it.id, name: it.name, color: it.color };
      }
    }
    return best;
  }

  // Collect a specific item by id (triggered by the player's interact key).
  // Removes its mesh from the scene and returns the item, or null if not found.
  collect(id) {
    for (const it of this.items) {
      if (it.collected || it.id !== id) continue;
      it.collected = true;
      this.scene.remove(it.mesh);
      it.mesh.geometry.dispose();
      it.mesh.material.dispose();
      return { id: it.id, name: it.name, color: it.color };
    }
    return null;
  }

  dispose() {
    for (const it of this.items) {
      if (it.collected) continue;
      this.scene.remove(it.mesh);
      it.mesh.geometry.dispose();
      it.mesh.material.dispose();
    }
    this.items = [];
  }
}
