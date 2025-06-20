async function getGeoData(ip) {
  const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,isp`);
  return await response.json();
}

async function simulateTrace(target) {
  const hops = [];
  const ips = ["1.1.1.1", "8.8.8.8", "208.67.222.222"];
  for (const ip of ips) {
    const geo = await getGeoData(ip);
    if (geo.lat && geo.lon) {
      hops.push({ 
        ip, 
        lat: geo.lat, 
        lng: geo.lon, 
        name: geo.isp || 'Unknown' 
      });
    }
  }
  return hops;
}

function plotHops(hops) {
  const scene = window.globeScene;
  if (!scene) {
    console.error("Globe scene not initialized!");
    return;
  }

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

// Entry point (called from HTML button)
async function startTrace() {
  const target = document.getElementById('target').value;
  const hops = await simulateTrace(target);
  plotHops(hops);
}