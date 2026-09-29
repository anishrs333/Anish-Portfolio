/* ═══════════════════════════════════════════════════════════
   scene.js — Three.js hero: noise blob + particles + rings
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js failed to load — hero falls back to static.');
    return;
  }

  const canvas = document.getElementById('gl');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Renderer ──────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7);

  // ── Lights ────────────────────────────────────────────────
  const keyLight = new THREE.DirectionalLight(0xd9f24f, 1.1);
  keyLight.position.set(5, 6, 8);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x6a7bff, 0.5);
  rimLight.position.set(-6, -3, -5);
  scene.add(rimLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.28));

  const pointLight = new THREE.PointLight(0xd9f24f, 1.4, 14);
  pointLight.position.set(0, 0, 3);
  scene.add(pointLight);

  // ── Main blob (vertex-displaced icosahedron) ──────────────
  const blobGroup = new THREE.Group();
  blobGroup.position.set(1.6, 0, 0); // offset right of the headline
  scene.add(blobGroup);

  const blobGeo = new THREE.IcosahedronGeometry(1.7, 48);
  const basePositions = blobGeo.attributes.position.array.slice();

  const blobMat = new THREE.MeshStandardMaterial({
    color: 0x151515,
    metalness: 0.85,
    roughness: 0.28,
  });
  const blob = new THREE.Mesh(blobGeo, blobMat);
  blobGroup.add(blob);

  // inner glow core
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 2),
    new THREE.MeshBasicMaterial({
      color: 0xd9f24f,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    })
  );
  blobGroup.add(core);

  // outer wireframe shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.35, 1),
    new THREE.MeshBasicMaterial({
      color: 0xd9f24f,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    })
  );
  blobGroup.add(shell);

  // ── Orbit rings ───────────────────────────────────────────
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(2.7 + i * 0.45, 0.006, 8, 140),
      new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xd9f24f : 0x3a3a34,
        transparent: true,
        opacity: i === 1 ? 0.5 : 0.35,
      })
    );
    r.rotation.x = Math.PI / 2.4 + i * 0.35;
    r.rotation.y = i * 0.9;
    rings.push(r);
    blobGroup.add(r);
  }

  // ── Floating particles ────────────────────────────────────
  const P_COUNT = 420;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(P_COUNT * 3);
  const pSeed = new Float32Array(P_COUNT);
  for (let i = 0; i < P_COUNT; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 16;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    pSeed[i] = Math.random() * Math.PI * 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0xd9f24f,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  scene.add(particles);

  // ── Mouse parallax ────────────────────────────────────────
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // ── Simple 3D simplex-ish noise (no external dep) ─────────
  // Classic Perlin-style value noise via sin hashing — cheap and smooth.
  function noise3(x, y, z, t) {
    return (
      Math.sin(x * 1.7 + t) * 0.5 +
      Math.sin(y * 1.3 - t * 1.2) * 0.35 +
      Math.sin(z * 1.9 + t * 0.8) * 0.3 +
      Math.sin((x + y + z) * 1.1 + t * 0.5) * 0.25
    );
  }

  // ── Scroll influence ──────────────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  // Pause rendering when hero off-screen
  let heroVisible = true;
  const hero = document.getElementById('hero');
  const io = new IntersectionObserver(
    ([entry]) => { heroVisible = entry.isIntersecting; },
    { threshold: 0.02 }
  );
  if (hero) io.observe(hero);

  // ── Animate ───────────────────────────────────────────────
  const clock = new THREE.Clock();
  const pos = blobGeo.attributes.position;

  function tick() {
    requestAnimationFrame(tick);
    if (!heroVisible) return; // save battery

    const t = clock.getElapsedTime();

    // smooth mouse follow
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    // blob breathing + noise displacement
    if (!prefersReduced) {
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const x = basePositions[ix];
        const y = basePositions[ix + 1];
        const z = basePositions[ix + 2];

        const n = noise3(x * 0.9, y * 0.9, z * 0.9, t * 0.6);
        const d = 1 + n * 0.22;

        pos.array[ix] = x * d;
        pos.array[ix + 1] = y * d;
        pos.array[ix + 2] = z * d;
      }
      pos.needsUpdate = true;

      blob.rotation.y = t * 0.12;
      blob.rotation.x = Math.sin(t * 0.2) * 0.15;

      core.rotation.y = -t * 0.3;
      core.rotation.z = t * 0.2;
      shell.rotation.y = t * 0.08;
      shell.rotation.x = -t * 0.05;

      rings.forEach((r, i) => {
        r.rotation.z = t * (0.1 + i * 0.07) * (i % 2 ? -1 : 1);
      });

      particles.rotation.y = t * 0.02;
      for (let i = 0; i < P_COUNT; i++) {
        pPos[i * 3 + 1] += Math.sin(t + pSeed[i]) * 0.0012;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    // mouse parallax
    blobGroup.rotation.y = mouse.x * 0.35;
    blobGroup.rotation.x = mouse.y * 0.25;
    blobGroup.position.y = 0.15 + mouse.y * -0.2;
    camera.position.x = mouse.x * 0.4;
    camera.lookAt(0, 0, 0);

    // gentle rise on scroll
    blobGroup.position.y += scrollY * 0.0012;
    particles.position.y = scrollY * 0.0006;

    renderer.render(scene, camera);
  }
  tick();
})();
