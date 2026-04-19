/* BYTEX IA — Three.js: Kinetic Spring Particles */

function initHeroScene() {
  const container = document.getElementById('hero-canvas');
  if (!container) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 4;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Generate "IA" text points using offscreen canvas
  const canvas2d = document.createElement('canvas');
  canvas2d.width = 256; canvas2d.height = 200;
  const ctx = canvas2d.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 160px "Space Grotesk", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IA', 128, 105);
  const imgData = ctx.getImageData(0, 0, 256, 200).data;

  // Sample points from text
  const textPoints = [];
  for (let y = 0; y < 200; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      if (imgData[(y * 256 + x) * 4 + 3] > 128) {
        textPoints.push({
          x: (x - 128) * 0.028,
          y: (100 - y) * 0.028,
          z: (Math.random() - 0.5) * 0.4
        });
      }
    }
  }

  const particleCount = Math.min(textPoints.length, 5000);
  const positions = new Float32Array(particleCount * 3);
  const basePositions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const p = textPoints[i % textPoints.length];
    positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z;
    basePositions[i * 3] = p.x; basePositions[i * 3 + 1] = p.y; basePositions[i * 3 + 2] = p.z;
    velocities[i * 3] = 0; velocities[i * 3 + 1] = 0; velocities[i * 3 + 2] = 0;
    colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let isHovered = false;

  container.addEventListener('mouseenter', () => isHovered = true);
  container.addEventListener('mouseleave', () => { isHovered = false; });
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  const colArr = geo.attributes.color.array;
  const posArr = geo.attributes.position.array;

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.0003;

    mouseX += (targetMouseX - mouseX) * 0.1;
    mouseY += (targetMouseY - mouseY) * 0.1;

    const mx = mouseX * 4;
    const my = -mouseY * 4; // Invert Y for 3D space

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      let px = posArr[idx];
      let py = posArr[idx + 1];
      let pz = posArr[idx + 2];

      const bx = basePositions[idx];
      const by = basePositions[idx + 1];
      const bz = basePositions[idx + 2];

      let vx = velocities[idx];
      let vy = velocities[idx + 1];
      let vz = velocities[idx + 2];

      if (isHovered) {
        const dx = px - mx;
        const dy = py - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.4) { // Reduced radius for a much smaller cursor effect
          const force = (0.4 - dist) / 0.4;
          vx += (dx / dist) * force * 0.04; // Tighter, smaller push
          vy += (dy / dist) * force * 0.04;
          vz += (Math.random() - 0.5) * force * 0.06;
        }
      }

      // Base Floating Target (Efecto de Ola / Wave Effect)
      const wavePhase = t * 2.0 + bx * 2.5 + by * 1.5;
      const targetX = bx + Math.sin(wavePhase) * 0.03;
      const targetY = by + Math.cos(wavePhase) * 0.03;
      const targetZ = bz + Math.sin(wavePhase * 0.8) * 0.15; // Pronounced depth wave

      // Spring Force pulling back to target
      vx += (targetX - px) * 0.1;
      vy += (targetY - py) * 0.1;
      vz += (targetZ - pz) * 0.1;

      // Friction / Damping
      vx *= 0.82;
      vy *= 0.82;
      vz *= 0.82;

      // Apply Velocity
      posArr[idx] = px + vx;
      posArr[idx + 1] = py + vy;
      posArr[idx + 2] = pz + vz;

      velocities[idx] = vx;
      velocities[idx + 1] = vy;
      velocities[idx + 2] = vz;

      // Kinetic Color: Glow brightly when moving fast
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

      const c = new THREE.Color();
      // Use grayscale (lightness based on speed)
      c.setHSL(0, 0, 0.4 + Math.min(speed * 3.0, 0.6));

      colArr[idx] = c.r;
      colArr[idx + 1] = c.g;
      colArr[idx + 2] = c.b;
    }

    geo.attributes.color.needsUpdate = true;
    geo.attributes.position.needsUpdate = true;

    // Elegant full-mesh tilt tracking the mouse
    particles.rotation.y = mouseX * 0.2;
    particles.rotation.x = mouseY * 0.1;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

function initTechScene() {
  const container = document.getElementById('tech-canvas');
  if (!container) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 6;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  // Glowing points globe
  const geo = new THREE.SphereGeometry(2.5, 64, 64);
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  
  // Make some points pop out for dynamic effect
  const posArr = geo.attributes.position.array;
  for(let i=0; i<posArr.length; i+=3) {
      if(Math.random() > 0.8) {
          posArr[i] *= 1.03;
          posArr[i+1] *= 1.03;
          posArr[i+2] *= 1.03;
      }
  }

  const globe = new THREE.Points(geo, mat);
  group.add(globe);

  // Inner solid core wireframe
  const coreGeo = new THREE.SphereGeometry(2.45, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.3,
      wireframe: true
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  let scrollP = 0;
  window.addEventListener('scroll', () => {
    const r = container.getBoundingClientRect();
    scrollP = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
  });

  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.0003;
    
    // Smooth dynamic rotation combined with scroll and mouse movement
    globe.rotation.y = t * 0.5 + mouseX * 0.3 + scrollP * 2;
    globe.rotation.x = Math.sin(t * 0.5) * 0.1 + mouseY * 0.3;
    
    core.rotation.y = t * 0.3;
    core.rotation.x = t * 0.2;

    // Scale slightly with scroll
    const s = 0.8 + scrollP * 0.3;
    group.scale.set(s, s, s);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

document.addEventListener('DOMContentLoaded', () => { initHeroScene(); initTechScene(); });
