// Fetch real GeoIP data for an IP
async function getGeoData(ip) {
  const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,isp`);
  return await response.json();
}

// Simulate real traceroute (will replace with actual API later)
async function simulateTrace(target) {
  const hops = [];
  const ips = ["1.1.1.1", "8.8.8.8", "208.67.222.222"]; // Example IPs
  for (const ip of ips) {
    const geo = await getGeoData(ip);
    hops.push({ ip, lat: geo.lat, lng: geo.lon, name: geo.isp });
  }
  return hops;
}

// Plot hops on the globe (requires `scene` from initGlobe())
function plotHops(hops, scene) {
  // Clear old markers
  scene.children.filter(obj => obj.isHopMarker).forEach(obj => scene.remove(obj));

  // Add new markers
  hops.forEach(hop => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    marker.position.setFromSphericalCoords(
      5.1,
      THREE.MathUtils.degToRad(90 - hop.lat),
      THREE.MathUtils.degToRad(hop.lng)
    );
    marker.isHopMarker = true;
    scene.add(marker);
  });
}

// Main trace function
async function visualizeTrace() {
  const target = document.getElementById("target").value;
  const hops = await simulateTrace(target);
  if (window.plotHops) {
    window.plotHops(hops); // Use globally exposed function
  } else {
    console.error("Scene not initialized!");
  }
}