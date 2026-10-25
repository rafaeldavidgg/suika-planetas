/* Orbitas - Suika de planetas. Vanilla + Matter.js, render Canvas propio. */
(function () {
  'use strict';

  const PLANETS = [
    { name: 'Meteorito', diameterKm: 0.02, type: 'Roca espacial', fact: 'Fragmento rocoso menor que cualquier luna.', radius: 14, color: '#9aa3b2', dark: '#5b6474' },
    { name: 'Deimos', diameterKm: 12.4, type: 'Luna de Marte', fact: 'Una de las lunas más pequeñas conocidas.', radius: 16, color: '#b8a88f', dark: '#7a6f5c' },
    { name: 'Luna', diameterKm: 3474, type: 'Luna de la Tierra', fact: 'Nuestro satélite, más grande que Plutón.', radius: 19, color: '#d9d9d9', dark: '#8f8f8f' },
    { name: 'Mercurio', diameterKm: 4879, type: 'Planeta rocoso', fact: 'El planeta más pequeño del sistema solar.', radius: 22, color: '#c2a284', dark: '#7d6248' },
    { name: 'Marte', diameterKm: 6779, type: 'Planeta rocoso', fact: 'La mitad de tamaño que la Tierra.', radius: 26, color: '#e07a4f', dark: '#933d22' },
    { name: 'Venus', diameterKm: 12104, type: 'Planeta rocoso', fact: 'Casi gemelo de la Tierra en tamaño.', radius: 31, color: '#e8c47a', dark: '#9a7838' },
    { name: 'Tierra', diameterKm: 12742, type: 'Planeta rocoso', fact: 'Nuestro hogar: 12.742 km de diámetro.', radius: 36, color: '#3a86ff', dark: '#1b3fa0' },
    { name: 'Neptuno', diameterKm: 49528, type: 'Gigante helado', fact: '17 veces la Tierra, el más ventoso.', radius: 42, color: '#4f7cff', dark: '#223a99' },
    { name: 'Urano', diameterKm: 51118, type: 'Gigante helado', fact: 'Un poco mayor que Neptuno, rueda de lado.', radius: 49, color: '#7de3d4', dark: '#3a8f86' },
    { name: 'Saturno', diameterKm: 120536, type: 'Gigante gaseoso', fact: 'Sus anillos no cuentan para el tamaño.', radius: 58, color: '#e9d8a6', dark: '#a68f55', rings: true },
    { name: 'Júpiter', diameterKm: 139820, type: 'Gigante gaseoso', fact: 'El rey: caben 1.300 Tierras dentro.', radius: 68, color: '#e9a26b', dark: '#96522a' },
    { name: 'Sol', diameterKm: 1392700, type: 'Estrella', fact: '109 Tierras de ancho. Bonus al unir 2 Júpiter.', radius: 0, color: '#ffd166', dark: '#e09f00' }
  ];

  const DROPPABLE_MAX = 4; // niveles 0..4
  const COOLDOWN_MS = 500;
  const GRACE_MS = 2500;
  const W = 400, H = 640;
  const WALL = 12, FLOOR_H = 16;
  const DROP_Y = 70;
  const LINE_Y = 150;

  function pointsFor(createdLevel) {
    if (createdLevel >= 11) return 120; // Sol bonus
    return (createdLevel * (createdLevel + 1)) / 2; // 1,3,6,10,15,21,28,36,45,55
  }

  // --- Estado ---
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const comboEl = document.getElementById('combo');
  const toastEl = document.getElementById('toast');
  const nextCanvas = document.getElementById('nextCanvas');
  const nextCtx = nextCanvas.getContext('2d');

  let engine, world;
  let bodies = []; // matter bodies con plugin.level
  let current = randDroppable();
  let next = randDroppable();
  let dropX = W / 2;
  let cooldownUntil = 0;
  let score = 0;
  let best = parseInt(localStorage.getItem('orbitas:best') || '0', 10) || 0;
  let muted = localStorage.getItem('orbitas:mute') === '1';
  let discovered = loadCodex();
  let particles = [];
  let lastMergeAt = 0;
  let combo = 0;
  let overAt = 0; // timestamp desde el que algo lleva sobre la línea
  let isOver = false;
  let isPaused = false;
  let audioCtx = null;
  let toastTimer = null;

  function randDroppable() { return Math.floor(Math.random() * (DROPPABLE_MAX + 1)); }
  function loadCodex() {
    try {
      const raw = localStorage.getItem('orbitas:codex:v1');
      if (raw) { const a = JSON.parse(raw); if (Array.isArray(a) && a.length === 12) return a; }
    } catch (e) {}
    return new Array(12).fill(false);
  }
  function saveCodex() { try { localStorage.setItem('orbitas:codex:v1', JSON.stringify(discovered)); } catch (e) {} }

  // --- Audio ---
  function ensureAudio() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function pop(level) {
    if (muted || !audioCtx) return;
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220 * Math.pow(2, level / 12), t);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + 0.2);
  }
  function updateMuteBtn() { document.getElementById('btnMute').textContent = muted ? '🔇' : '🔊'; }

  // --- Física ---
  function setupWorld() {
    engine = Matter.Engine.create({ enableSleeping: true });
    engine.gravity.y = 1;
    world = engine.world;
    const opts = { isStatic: true, friction: 0.4, restitution: 0 };
    const floor = Matter.Bodies.rectangle(W / 2, H - FLOOR_H / 2, W, FLOOR_H, opts);
    const left = Matter.Bodies.rectangle(WALL / 2, H / 2, WALL, H, opts);
    const right = Matter.Bodies.rectangle(W - WALL / 2, H / 2, WALL, H, opts);
    Matter.World.add(world, [floor, left, right]);

    Matter.Events.on(engine, 'collisionStart', (ev) => {
      if (isOver || isPaused) return;
      for (const pair of ev.pairs) {
        const a = pair.bodyA, b = pair.bodyB;
        if (!a.plugin || !b.plugin || a.plugin.merging || b.plugin.merging) continue;
        if (a.plugin.level === undefined || b.plugin.level === undefined) continue;
        if (a.plugin.level !== b.plugin.level) continue;
        mergeBodies(a, b);
      }
    });
  }

  function spawnBody(level, x, y) {
    const r = PLANETS[level].radius;
    const body = Matter.Bodies.circle(x, y, r, {
      restitution: 0.15, friction: 0.3, frictionStatic: 0.6, density: 0.0012
    });
    body.plugin = { level };
    Matter.World.add(world, body);
    bodies.push(body);
    return body;
  }

  function mergeBodies(a, b) {
    const level = a.plugin.level;
    a.plugin.merging = true; b.plugin.merging = true;
    const mx = (a.position.x + b.position.x) / 2;
    const my = (a.position.y + b.position.y) / 2;
    Matter.World.remove(world, a); Matter.World.remove(world, b);
    bodies = bodies.filter((x) => x !== a && x !== b);
    burst(mx, my, PLANETS[Math.min(level + 1, 11)].color);

    if (level >= 10) {
      // Júpiter + Júpiter = Sol bonus, sin cuerpo permanente
      const pts = pointsFor(11);
      score += pts;
      onMerge(11, mx, my, pts, true);
      return;
    }
    const nl = level + 1;
    // Pequeño offset para evitar solape inmediato
    const nb = spawnBody(nl, Math.min(Math.max(mx, WALL + PLANETS[nl].radius), W - WALL - PLANETS[nl].radius), my);
    Matter.Body.setVelocity(nb, { x: (a.velocity.x + b.velocity.x) / 2, y: Math.min((a.velocity.y + b.velocity.y) / 2, 1) });
    const pts = pointsFor(nl);
    score += pts;
    onMerge(nl, mx, my, pts, false);
  }

  function onMerge(level, x, y, pts, isBonus) {
    const now = performance.now();
    if (now - lastMergeAt < 2000) combo += 1; else combo = 1;
    lastMergeAt = now;
    if (combo >= 2) { comboEl.textContent = 'Combo x' + combo; comboEl.classList.remove('hidden'); }
    else comboEl.classList.add('hidden');
    clearTimeout(onMerge._ct);
    onMerge._ct = setTimeout(() => comboEl.classList.add('hidden'), 1800);

    pop(level);
    showToast(level, isBonus);
    unlock(level);
    if (score > best) { best = score; try { localStorage.setItem('orbitas:best', String(best)); } catch (e) {} }
    renderHUD();
  }

  function fmtKm(n) {
    if (n < 1) return '≈ ' + String(n).replace('.', ',') + ' km';
    return n.toLocaleString('es-ES') + ' km';
  }
  function showToast(level, isBonus) {
    const p = PLANETS[level];
    toastEl.innerHTML = (isBonus ? '☀️ BONUS · ' : '✨ ') + '<b>' + p.name + '</b> · ' + fmtKm(p.diameterKm) + ' · ' + p.type;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 2200);
  }
  function unlock(level) { if (!discovered[level]) { discovered[level] = true; saveCodex(); renderCodex(); } }

  function burst(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 3;
      particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, life: 1, color });
    }
    if (particles.length > 220) particles.splice(0, particles.length - 220);
  }

  // --- Drop ---
  function tryDrop() {
    const now = performance.now();
    if (isOver || isPaused || now < cooldownUntil) return;
    ensureAudio();
    const r = PLANETS[current].radius;
    const x = Math.min(Math.max(dropX, WALL + r + 1), W - WALL - r - 1);
    spawnBody(current, x, DROP_Y);
    current = next; next = randDroppable();
    cooldownUntil = now + COOLDOWN_MS;
    renderHUD();
  }

  // --- Game over ---
  function checkGameOver(now) {
    if (isOver) return;
    let danger = false;
    for (const b of bodies) {
      if (!b.plugin || b.plugin.level === undefined) continue;
      const r = PLANETS[b.plugin.level].radius;
      const top = b.position.y - r;
      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      if (top < LINE_Y && speed < 0.6) { danger = true; break; }
    }
    if (danger) {
      if (!overAt) overAt = now;
      if (now - overAt >= GRACE_MS) doGameOver();
    } else overAt = 0;
  }
  function doGameOver() {
    isOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalBest').textContent = best;
    document.getElementById('gameover').classList.remove('hidden');
  }
  function restart() {
    for (const b of bodies.slice()) Matter.World.remove(world, b);
    bodies = []; particles = [];
    score = 0; combo = 0; overAt = 0; isOver = false; isPaused = false;
    current = randDroppable(); next = randDroppable(); dropX = W / 2;
    cooldownUntil = 0;
    document.getElementById('gameover').classList.add('hidden');
    document.getElementById('pauseOverlay').classList.add('hidden');
    renderHUD();
  }

  // --- Render ---
  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const cw = Math.max(1, Math.round(rect.width * dpr));
    const ch = Math.round(cw * (H / W));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  }
  function renderHUD() {
    scoreEl.textContent = score;
    bestEl.textContent = best;
    drawNext();
  }
  function circleArt(g, x, y, r, level) {
    const p = PLANETS[level];
    const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    grad.addColorStop(0, p.color); grad.addColorStop(1, p.dark);
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    // detalles baratos por tipo
    g.fillStyle = 'rgba(255,255,255,.25)';
    if (level <= 2 || level === 3) {
      g.beginPath(); g.arc(x - r * 0.3, y - r * 0.25, r * 0.14, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + r * 0.25, y + r * 0.2, r * 0.1, 0, Math.PI * 2); g.fill();
    } else if (level === 6) {
      g.fillStyle = 'rgba(255,255,255,.7)';
      g.beginPath(); g.arc(x - r * 0.2, y - r * 0.1, r * 0.32, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(58,134,255,.9)';
      g.beginPath(); g.arc(x - r * 0.2, y - r * 0.1, r * 0.26, 0, Math.PI * 2); g.fill();
    } else if (level >= 7) {
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = Math.max(1, r * 0.06);
      g.beginPath(); g.arc(x, y, r * 0.62, 0.3, Math.PI * 2 - 0.3); g.stroke();
      g.beginPath(); g.arc(x, y, r * 0.82, 0.5, Math.PI * 2 - 0.5); g.stroke();
    }
    // cara simple
    g.fillStyle = 'rgba(10,12,28,.85)';
    const ex = r * 0.22, ey = -r * 0.05, er = Math.max(1.2, r * 0.07);
    g.beginPath(); g.arc(x - ex, y + ey, er, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + ex, y + ey, er, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(10,12,28,.85)'; g.lineWidth = Math.max(1, r * 0.05);
    g.beginPath(); g.arc(x, y + r * 0.18, r * 0.18, 0.3, Math.PI - 0.3); g.stroke();
    if (p.rings) {
      g.strokeStyle = '#f4e3b2'; g.lineWidth = Math.max(2, r * 0.09);
      g.beginPath(); g.ellipse(x, y, r * 1.35, r * 0.42, -0.35, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(244,227,178,.5)'; g.lineWidth = Math.max(1, r * 0.04);
      g.beginPath(); g.ellipse(x, y, r * 1.5, r * 0.5, -0.35, 0, Math.PI * 2); g.stroke();
    }
    // etiqueta corta
    g.fillStyle = 'rgba(255,255,255,.9)';
    g.font = Math.max(9, r * 0.28) + 'px system-ui';
    g.textAlign = 'center';
    if (r >= 19) g.fillText(p.name.slice(0, 8), x, y + r + 11 > H ? y : y + r * 0.02);
  }

  function draw() {
    fitCanvas();
    const sx = canvas.width / W, sy = canvas.height / H;
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // cuenco
    ctx.fillStyle = '#0d1230';
    ctx.fillRect(WALL, 0, W - WALL * 2, H);
    ctx.fillStyle = '#232b63';
    ctx.fillRect(0, 0, WALL, H); ctx.fillRect(W - WALL, 0, WALL, H);
    ctx.fillRect(0, H - FLOOR_H, W, FLOOR_H);
    // línea game over
    const danger = overAt > 0;
    ctx.strokeStyle = danger ? '#ff5d5d' : 'rgba(255,255,255,.35)';
    ctx.setLineDash([8, 6]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(WALL, LINE_Y); ctx.lineTo(W - WALL, LINE_Y); ctx.stroke();
    ctx.setLineDash([]);
    if (danger) {
      const p = Math.min(1, (performance.now() - overAt) / GRACE_MS);
      ctx.fillStyle = '#ff5d5d';
      ctx.fillRect(WALL, LINE_Y - 6, (W - WALL * 2) * p, 4);
    }
    // dropper fantasma + guía
    if (!isOver) {
      const r = PLANETS[current].radius;
      const x = Math.min(Math.max(dropX, WALL + r + 1), W - WALL - r - 1);
      ctx.strokeStyle = 'rgba(255,255,255,.25)';
      ctx.beginPath(); ctx.moveTo(x, DROP_Y + r); ctx.lineTo(x, H - FLOOR_H); ctx.stroke();
      ctx.globalAlpha = 0.9;
      circleArt(ctx, x, DROP_Y, r, current);
      ctx.globalAlpha = 1;
    }
    for (const b of bodies) circleArt(ctx, b.position.x, b.position.y, PLANETS[b.plugin.level].radius, b.plugin.level);
    // partículas
    for (const pt of particles) {
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawNext() {
    const s = 56;
    nextCtx.setTransform(1, 0, 0, 1, 0, 0);
    nextCtx.clearRect(0, 0, s, s);
    const r = Math.min(24, PLANETS[next].radius * 0.55);
    const p = PLANETS[next];
    const g = nextCtx.createRadialGradient(s / 2 - 6, s / 2 - 6, 2, s / 2, s / 2, r);
    g.addColorStop(0, p.color); g.addColorStop(1, p.dark);
    nextCtx.fillStyle = g;
    nextCtx.beginPath(); nextCtx.arc(s / 2, s / 2, r, 0, Math.PI * 2); nextCtx.fill();
  }

  // --- Codex UI ---
  function renderCodex() {
    const grid = document.getElementById('codexGrid');
    grid.innerHTML = '';
    PLANETS.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'codex-item' + (discovered[i] ? '' : ' locked');
      div.innerHTML = '<span class="dot" style="background:' + p.color + '"></span><b>' + (discovered[i] ? p.name : '???') + '</b><br>' +
        (discovered[i] ? fmtKm(p.diameterKm) + ' · ' + p.type + '<br><i>' + p.fact + '</i>' : 'Fusiona para descubrir');
      grid.appendChild(div);
    });
  }

  // --- Input unificado ---
  function bindInput() {
    const move = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      dropX = Math.min(Math.max(x, 0), W);
    };
    canvas.addEventListener('pointermove', (e) => move(e.clientX));
    canvas.addEventListener('pointerdown', (e) => { move(e.clientX); ensureAudio(); });
    canvas.addEventListener('pointerup', (e) => { move(e.clientX); tryDrop(); });
    canvas.addEventListener('pointercancel', () => {});
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') dropX = Math.max(0, dropX - 12);
      else if (e.key === 'ArrowRight') dropX = Math.min(W, dropX + 12);
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tryDrop(); }
    });
    document.getElementById('btnRestart').addEventListener('click', restart);
    document.getElementById('btnAgain').addEventListener('click', restart);
    document.getElementById('btnPause').addEventListener('click', () => {
      if (isOver) return;
      isPaused = true;
      document.getElementById('pauseOverlay').classList.remove('hidden');
    });
    document.getElementById('btnResume').addEventListener('click', () => {
      isPaused = false;
      document.getElementById('pauseOverlay').classList.add('hidden');
    });
    document.getElementById('btnMute').addEventListener('click', () => {
      muted = !muted;
      try { localStorage.setItem('orbitas:mute', muted ? '1' : '0'); } catch (e) {}
      updateMuteBtn(); ensureAudio();
    });
    document.getElementById('btnCodex').addEventListener('click', () => {
      renderCodex();
      document.getElementById('codex').classList.remove('hidden');
    });
    document.getElementById('btnCloseCodex').addEventListener('click', () => {
      document.getElementById('codex').classList.add('hidden');
    });
  }

  // --- Loop ---
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(33, now - last); last = now;
    if (!isPaused && !isOver) {
      Matter.Engine.update(engine, 1000 / 60);
      for (const pt of particles) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.12; pt.life -= dt / 600; }
      particles = particles.filter((p) => p.life > 0);
      checkGameOver(now);
    }
    draw();
  }

  // --- Boot ---
  setupWorld();
  bindInput();
  updateMuteBtn();
  renderHUD(); renderCodex();
  bestEl.textContent = best;
  requestAnimationFrame(loop);

  // Expuesto para verificación automatizada
  window.__game = { PLANETS, pointsFor, get score() { return score; }, get bodies() { return bodies; }, DROPPABLE_MAX };
})();
