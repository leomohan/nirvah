// ======================
// TRACEROUTE VISUALIZATION
// ======================

// Configuration
const TRACEROUTE_CONFIG = {
  MARKER_COLOR: 0xff0000,    // Red
  LINE_COLOR: 0x4fc3f7,      // Light blue
  LINE_WIDTH: 2,
  MARKER_SIZE: 0.15,
  PULSE_SPEED: 0.02
};

// Global variables
let currentMarkers = [];
let currentLines = [];
let animationId = null;

// ======================
// CORE FUNCTIONS
// ======================

/**
 * Main trace function - called from UI
 */
async function startTrace(target) {
  try {
    console.group(`Tracing ${target}`);
    
    // 1. Clear previous visualization
    clearVisualization();
    
    // 2. Get trace data (mock or real)
    const hops = await getTraceData(target);
    if (!hops || hops.length === 0) {
      throw new Error("No hops received");
    }
    
    // 3. Visualize on globe
    visualizeHops(hops);
    
    // 4. Animate connection
    animatePacketFlow(hops);
    
    console.groupEnd();
    return hops;
    
  } catch (error) {
    console.error("Trace failed:", error);
    alert(`Trace failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get trace data (currently using mock)
 */
async function getTraceData(target) {
  console.log("Fetching trace data...");
  
  // Mock data - replace with real API call later
  const mockHops = [
    {
      ip: "192.168.1.1",
      lat: 37.7749,
      lng: -122.4194,
      name: "Your Router",
      avgLatency: 12
    },
    {
      ip: "8.8.8.8",
      lat: 34.0522,
      lng: -118.2437,
      name: "Google DNS",
      avgLatency: 28
    },
    {
      ip: "1.1.1.1",
      lat: -33.8688,
      lng: 151.2093,
      name: "Cloudflare",
      avgLatency: 45
    }
  ];
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockHops;
}

// ======================
// VISUALIZATION FUNCTIONS
// ======================

function visualizeHops(hops) {
  if (!window.globeScene) {
    throw new Error("Three.js scene not initialized");
  }
  
  console.log(`Visualizing ${hops.length} hops`);
  
  // 1. Create markers
  currentMarkers = hops.map(hop => createHopMarker(hop));
  
  // 2. Create connecting lines
  currentLines = [];
  for (let i = 1; i < hops.length; i++) {
    currentLines.push(createConnectionLine(hops[i-1], hops[i]));
  }
  
  // Add to scene
  currentMarkers.forEach(marker => window.globeScene.add(marker));
  currentLines.forEach(line => window.globeScene.add(line));
}

function createHopMarker(hop) {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(TRACEROUTE_CONFIG.MARKER_SIZE, 16, 16),
    new THREE.MeshBasicMaterial({ 
      color: TRACEROUTE_CONFIG.MARKER_COLOR,
      transparent: true,
      opacity: 0.9
    })
  );
  
  // Position marker on globe surface
  marker.position.setFromSphericalCoords(
    5.1, // Slightly above surface
    THREE.MathUtils.degToRad(90 - hop.lat),
    THREE.MathUtils.degToRad(hop.lng)
  );
  
  // Store hop data for interaction
  marker.userData = { 
    type: 'hop',
    info: hop 
  };
  
  console.log(`Created marker for ${hop.ip} at (${hop.lat},${hop.lng})`);
  return marker;
}

function createConnectionLine(startHop, endHop) {
  const points = [
    new THREE.Vector3().setFromSphericalCoords(
      5.1,
      THREE.MathUtils.degToRad(90 - startHop.lat),
      THREE.MathUtils.degToRad(startHop.lng)
    ),
    new THREE.Vector3().setFromSphericalCoords(
      5.1,
      THREE.MathUtils.degToRad(90 - endHop.lat),
      THREE.MathUtils.degToRad(endHop.lng)
    )
  ];
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ 
    color: TRACEROUTE_CONFIG.LINE_COLOR,
    linewidth: TRACEROUTE_CONFIG.LINE_WIDTH
  });
  
  const line = new THREE.Line(geometry, material);
  line.userData = { type: 'connection' };
  
  console.log(`Created line from ${startHop.ip} to ${endHop.ip}`);
  return line;
}

// ======================
// ANIMATION FUNCTIONS
// ======================

function animatePacketFlow(hops) {
  // Clear any existing animation
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // Create packet object
  const packetGeometry = new THREE.SphereGeometry(0.08, 12, 12);
  const packetMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const packet = new THREE.Mesh(packetGeometry, packetMaterial);
  window.globeScene.add(packet);
  
  let progress = 0;
  let currentSegment = 0;
  
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (currentSegment >= hops.length - 1) {
      window.globeScene.remove(packet);
      return;
    }
    
    const start = hops[currentSegment];
    const end = hops[currentSegment + 1];
    
    // Calculate position along path
    const startPos = new THREE.Vector3().setFromSphericalCoords(
      5.1,
      THREE.MathUtils.degToRad(90 - start.lat),
      THREE.MathUtils.degToRad(start.lng)
    );
    
    const endPos = new THREE.Vector3().setFromSphericalCoords(
      5.1,
      THREE.MathUtils.degToRad(90 - end.lat),
      THREE.MathUtils.degToRad(end.lng)
    );
    
    packet.position.lerpVectors(startPos, endPos, progress);
    progress += TRACEROUTE_CONFIG.PULSE_SPEED;
    
    // Move to next segment
    if (progress >= 1) {
      currentSegment++;
      progress = 0;
    }
  }
  
  animate();
}

function clearVisualization() {
  const scene = window.globeScene;
  if (!scene) return;
  
  // Clear markers
  currentMarkers.forEach(marker => scene.remove(marker));
  currentMarkers = [];
  
  // Clear lines
  currentLines.forEach(line => scene.remove(line));
  currentLines = [];
  
  // Stop animation
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  console.log("Cleared previous visualization");
}

// ======================
// DEBUGGING TOOLS
// ======================

// Expose to console for testing
window.traceDebug = {
  testTrace: () => startTrace("8.8.8.8"),
  clear: clearVisualization,
  showHops: () => console.log(currentMarkers),
  showLines: () => console.log(currentLines)
};

console.log("Traceroute module loaded");