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