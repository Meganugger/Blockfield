import * as THREE from 'three';

// Original blocky humanoid: head, torso, 2 arms, 2 legs.
// Group origin is at the feet. Limbs are wrapped in pivot groups at shoulder/hip
// so the AnimationController can swing them.

const plastic = (color) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.05 });

function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  return m;
}

export function createAvatar(torsoColor = '#2a6dd0') {
  const skin = plastic('#f3c63f');
  const torsoMat = plastic(torsoColor);
  const legMat = plastic('#1fae51');

  const group = new THREE.Group();
  const body = new THREE.Group(); // bob target for animations
  group.add(body);

  const torso = box(2, 2, 1, torsoMat);
  torso.position.y = 3;
  body.add(torso);

  const head = box(1.2, 1.2, 1.2, skin);
  head.position.y = 4.7;
  body.add(head);

  // Simple original face (avatar faces +Z)
  const faceMat = new THREE.MeshStandardMaterial({ color: '#222222', roughness: 0.3 });
  for (const sx of [-0.26, 0.26]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.05), faceMat);
    eye.position.set(sx, 4.85, 0.63);
    body.add(eye);
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.05), faceMat);
  mouth.position.set(0, 4.45, 0.63);
  body.add(mouth);

  const mkLimb = (mat, x, pivotY) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, pivotY, 0);
    const limb = box(1, 2, 1, mat);
    limb.position.y = -1;
    pivot.add(limb);
    body.add(pivot);
    return pivot;
  };

  const leftArm = mkLimb(skin, -1.5, 4);
  const rightArm = mkLimb(skin, 1.5, 4);
  const leftLeg = mkLimb(legMat, -0.5, 2);
  const rightLeg = mkLimb(legMat, 0.5, 2);

  return { group, parts: { body, head, torso, leftArm, rightArm, leftLeg, rightLeg } };
}