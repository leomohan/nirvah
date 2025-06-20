// Global Three.js variables
let scene, camera, renderer, globe;

function initGlobe() {
  // Set up Three.js scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('globe-container').appendChild(renderer.domElement);

  // Create globe
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const texture = new THREE.TextureLoader().load('https://unpkg.com/three-globe@2.24.7/example/img/earth-blue-marble.jpg');
  const material = new THREE.MeshBasicMaterial({ map: texture });
  globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  camera.position.z = 10;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();

  // Expose to other files
  window.globeScene = scene;
}

// Start on load
window.onload = initGlobe;