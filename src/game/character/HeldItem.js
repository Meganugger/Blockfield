import * as THREE from 'three';

// Manages the small block held in the character's right hand. The mesh is
// parented to the right-arm pivot so it swings with the arm during animation.
// set(block) swaps the held block (or clears it with null).
export class HeldItem {
  constructor(handPivot) {
    this.handPivot = handPivot;
    this.mesh = null;
  }

  set(block) {
    this._clear();
    if (!block) return;
    const mat = new THREE.MeshStandardMaterial({
      color: block.color || '#4ec0f0',
      emissive: new THREE.Color(block.color || '#4ec0f0'),
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat);
    mesh.castShadow = true;
    // Position at the hand end of the arm (arm hangs down to y ~= -2 in pivot space).
    mesh.position.set(0, -2, 0.75);
    this.handPivot.add(mesh);
    this.mesh = mesh;
  }

  _clear() {
    if (!this.mesh) return;
    this.handPivot.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.mesh = null;
  }

  dispose() {
    this._clear();
  }
}
