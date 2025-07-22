// Add these variables at the top
let is2DView = false;
let flatMap, globeMesh;

function initGlobe() {
  // ... existing code ...

  // Create both versions
  globeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshBasicMaterial({ 
      map: new THREE.TextureLoader().load('assets/earth.jpg')
    })
  );

  flatMap = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 5),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('assets/earth-flat.jpg'),
      side: THREE.DoubleSide
    })
  );
  
  scene.add(globeMesh); // Start with 3D view
}

// Add this new function
function toggleView() {
  is2DView = !is2DView;
  
  scene.remove(is2DView ? globeMesh : flatMap);
  scene.add(is2DView ? flatMap : globeMesh);
  
  document.getElementById('view-toggle').textContent = 
    is2DView ? "Switch to 3D Globe" : "Switch to 2D Map";
  
  // Adjust camera for 2D
  if (is2DView) {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  } else {
    camera.position.set(0, 0, 20);
  }
}