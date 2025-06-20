// ===== GLOBALS ===== //
const markers = [];

// ===== CORE FUNCTIONS ===== //
function plotHops(hops) {
  // Clear old markers...
  
  hops.forEach(hop => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.3),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    
    if (is2DView) {
      // 2D coordinates (simple mercator projection)
      marker.position.x = (hop.lng / 180) * 5;
      marker.position.y = -(hop.lat / 90) * 2.5;
      marker.position.z = 0.1; // Slightly above the map
    } else {
      // 3D coordinates (existing code)
      const phi = (90 - hop.lat) * (Math.PI / 180);
      const theta = (hop.lng + 180) * (Math.PI / 180);
      marker.position.setFromSphericalCoords(5.1, phi, theta);
    }
    
    scene.add(marker);
    markers.push(marker);
  });
}
  // 1. Clear old markers
  markers.forEach(m => scene.remove(m));
  markers.length = 0;
  
  // 2. Create new markers
  hops.forEach(hop => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.3),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    
    // Convert lat/lng to 3D position
    const phi = (90 - hop.lat) * (Math.PI / 180);
    const theta = (hop.lng + 180) * (Math.PI / 180);
    marker.position.setFromSphericalCoords(5.1, phi, theta);
    
    // Tag and store marker
    marker.userData = { isHop: true, info: hop };
    scene.add(marker);
    markers.push(marker);
    
    console.log("Added marker for", hop.ip, "at", marker.position);
  });
  
  console.log("Total markers in scene:", 
    scene.children.filter(c => c.userData?.isHop).length);
}

// ===== TRACING API ===== //
window.startTrace = async function(target) {
  try {
    // Mock data - replace with API later
    const hops = [
      { ip: "192.168.1.1", lat: 37.7749, lng: -122.4194, name: "Your Router" },
      { ip: "8.8.8.8", lat: 34.0522, lng: -118.2437, name: "Google DNS" }
    ];
    
    plotHops(hops);
    return hops;
    
  } catch (error) {
    console.error("Trace failed:", error);
    throw error;
  }
};

// ===== GLOBAL EXPORTS ===== //
window.Nirvah = {
  plotHops,  // Now available as window.Nirvah.plotHops
  startTrace,
  debug: {
    test: () => plotHops([
      {ip: "test1", lat: 0, lng: 0, name: "Equator"},
      {ip: "test2", lat: 45, lng: 45, name: "NE"}
    ])
  }
};

console.log("✅ Traceroute module loaded");