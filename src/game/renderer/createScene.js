import * as THREE from 'three';

// Builds renderer + scene: gradient sky dome, sun with shadows, ambient light, fog.
export function createScene(container, world) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(world.sky_bottom), 350, 1000);

  // Gradient sky dome (original shader, no external assets)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(world.sky_top) },
      bottom: { value: new THREE.Color(world.sky_bottom) },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 top;
      uniform vec3 bottom;
      varying vec3 vPos;
      void main() {
        float h = clamp(normalize(vPos).y * 0.5 + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottom, top, pow(h, 0.75)), 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 24, 16), skyMat);
  scene.add(sky);

  const ambient = new THREE.AmbientLight(0xffffff, world.ambient_intensity ?? 0.7);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff4e0, world.sun_intensity ?? 1.6);
  sun.position.set(80, 160, 60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = 130;
  sun.shadow.camera.left = -s;
  sun.shadow.camera.right = s;
  sun.shadow.camera.top = s;
  sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 450;
  scene.add(sun);

  const dispose = () => {
    renderer.dispose();
    renderer.domElement.remove();
  };

  return { renderer, scene, sun, dispose };
}