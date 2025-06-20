// ======================
// GLOBE VISUALIZATION
// ======================

// Configuration
const GLOBE_CONFIG = {
  RADIUS: 5,
  ROTATION_SPEED: 0.005,
  TEXTURE_PATH: '/public/assets/earth.jpg',
  BACKGROUND_COLOR: 0x0f0c29,
  LIGHT_INTENSITY: 1.2
};

// Global variables
let scene, camera, renderer, globe;
let controls, ambientLight, directionalLight;
let isInitialized = false;

// ======================
// MAIN INITIALIZATION
// ======================

function initGlobe() {
  if (isInitialized) {
    console.warn("Globe already initialized");
    return;
  }

  try {
    // 1. Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(GLOBE_CONFIG.BACKGROUND_COLOR);
    
    // 2. Setup camera
    camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 15;

    // 3. Create renderer
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('globe-container').appendChild(renderer.domElement);

    // 4. Add lighting
    setupLighting();

    // 5. Create globe
    createGlobe();

    // 6. Add orbit controls
    setupControls();

    // 7. Start animation loop
    animate();

    // 8. Make scene available globally
    window.globeScene = scene;
    isInitialized = true;

    console.log("Globe initialized successfully");
    
  } catch (error) {
    console.error("Globe initialization failed:", error);
    alert("Failed to initialize 3D globe. Check console for details.");
  }
}

// ======================
// SCENE SETUP FUNCTIONS
// ======================

function createGlobe() {
  // 1. Create geometry
  const geometry = new THREE.SphereGeometry(
    GLOBE_CONFIG.RADIUS,
    64,  // Width segments
    64   // Height segments
  );

  // 2. Load texture
  const texture = new THREE.TextureLoader().load(
    GLOBE_CONFIG.TEXTURE_PATH,
    () => console.log("Earth texture loaded successfully"),
    undefined,
    (err) => console.error("Failed to load texture:", err)
  );

  // 3. Create material
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    specular: new THREE.Color(0x333333),
    shininess: 15,
    bumpScale: 0.05
  });

  // 4. Create mesh
  globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // 5. Add subtle glow effect
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.1
  });
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_CONFIG.RADIUS * 1.02, 32, 32),
    glowMaterial
  );
  globe.add(glow);
}

function setupLighting() {
  // Ambient light
  ambientLight = new THREE.AmbientLight(
    0x404040, 
    GLOBE_CONFIG.LIGHT_INTENSITY * 0.4
  );
  scene.add(ambientLight);

  // Directional light (sun)
  directionalLight = new THREE.DirectionalLight(
    0xffffff, 
    GLOBE_CONFIG.LIGHT_INTENSITY
  );
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // Hemisphere light
  const hemisphereLight = new THREE.HemisphereLight(
    0xffffbb, 
    0x080820, 
    GLOBE_CONFIG.LIGHT_INTENSITY * 0.7
  );
  scene.add(hemisphereLight);
}

function setupControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 8;
  controls.maxDistance = 30;
  controls.enablePan = false;
}

// ======================
// ANIMATION LOOP
// ======================

function animate() {
  requestAnimationFrame(animate);

  // Rotate globe
  if (globe) {
    globe.rotation.y += GLOBE_CONFIG.ROTATION_SPEED;
  }

  // Update controls if enabled
  if (controls) {
    controls.update();
  }

  renderer.render(scene, camera);
}

// ======================
// WINDOW RESIZE HANDLER
// ======================

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// ======================
// DEBUGGING TOOLS
// ======================

// Expose to console for testing
window.globeDebug = {
  toggleRotation: (speed = GLOBE_CONFIG.ROTATION_SPEED) => {
    GLOBE_CONFIG.ROTATION_SPEED = speed;
    console.log(`Rotation speed set to ${speed}`);
  },
  toggleControls: (enabled) => {
    if (controls) {
      controls.enabled = enabled;
      console.log(`Orbit controls ${enabled ? "enabled" : "disabled"}`);
    }
  },
  getScene: () => scene
};

// Initialize on load
window.onload = initGlobe;

console.log("Globe module loaded");