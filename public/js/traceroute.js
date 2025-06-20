// GeoIP Lookup
async function getGeoData(ip) {
  const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,isp`);
  return await response.json();
}

// Real Traceroute
// In traceroute.js
async function realTrace(target) {
  const response = await fetch(`http://localhost:3000/trace?host=${target}`);
  return await response.json(); // Returns [{ip, lat, lng, name, avgLatency}]
}

// Draw connection paths
function drawArcs(hops) {
  const scene = window.globeScene;
  const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  
  hops.forEach((hop, i) => {
    if (i > 0) {
      const prevHop = hops[i-1];
      const curve = new THREE.LineCurve3(
        new THREE.Vector3().setFromSphericalCoords(5, 
          THREE.MathUtils.degToRad(90 - prevHop.lat),
          THREE.MathUtils.degToRad(prevHop.lng)),
        new THREE.Vector3().setFromSphericalCoords(5,
          THREE.MathUtils.degToRad(90 - hop.lat),
          THREE.MathUtils.degToRad(hop.lng))
      );
      scene.add(new THREE.Line(curve, material));
    }
  });
}
function animatePacket(hops) {
  const packet = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  scene.add(packet);

  // Animation along path
  let progress = 0;
  const animate = () => {
    const segment = Math.floor(progress * (hops.length-1));
    const start = hops[segment];
    const end = hops[segment+1];
    
    packet.position.lerpVectors(
      new THREE.Vector3().setFromSphericalCoords(/* start */),
      new THREE.Vector3().setFromSphericalCoords(/* end */),
      progress
    );
    
    progress += 0.01;
    if (progress < 1) requestAnimationFrame(animate);
  };
  animate();
}

// Visualize latency
function addHeatmap(hops) {
  hops.forEach(hop => {
    const intensity = Math.min(hop.avgLatency / 100, 1);
    const color = new THREE.Color(intensity, 1-intensity, 0);
    
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.2, 32),
      new THREE.MeshBasicMaterial({ 
        color,
        transparent: true,
        opacity: 0.7
      })
    );
    ring.position.setFromSphericalCoords(
      5.1,
      THREE.MathUtils.degToRad(90 - hop.lat),
      THREE.MathUtils.degToRad(hop.lng)
    );
    window.globeScene.add(ring);
  });
}

// Main visualization
function plotHops(hops) {
  const scene = window.globeScene;
  // Create label container
const labelContainer = document.createElement('div');
labelContainer.id = 'hop-labels';
document.body.appendChild(labelContainer);

// Add label interaction
marker.userData = { info: hop };
marker.on('pointerover', () => {
  labelContainer.innerHTML = `
    <div class="hop-tooltip">
      <strong>${hop.name}</strong><br>
      IP: ${hop.ip}<br>
      Latency: ${hop.avgLatency}ms
    </div>
  `;
});
  if (!scene) return console.error("Globe not initialized!");

  // Clear old objects
  scene.children.forEach(obj => {
    if (obj.isHopMarker || obj.isArc || obj.isHeatmap) {
      scene.remove(obj);
    }
  });

  // Add new elements
  hops.forEach(hop => {
    // Marker
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    marker.position.setFromSphericalCoords(/*...*/);
    marker.isHopMarker = true;
    scene.add(marker);
  });

  drawArcs(hops);
  addHeatmap(hops);
}

// Entry point
async function startTrace() {
  const target = document.getElementById('target').value;
  const hops = await simulateTrace(target);
  plotHops(hops);
  
  // Optional: Uncomment when backend ready
  // const pingData = await runPing(target);
  // updatePingStats(pingData);
}