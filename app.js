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

  // --- Texturas procedurales (sprites prerenderizados al arranque) ---
  const TEX_SS = 3;
  const SPRITES = [];

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) {
    const c = hexRgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }
  function softBlob(g, x, y, r, color, alpha) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(color, alpha));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  function inDisc(rnd, c, R, margin) {
    for (let t = 0; t < 24; t++) {
      const x = c + (rnd() * 2 - 1) * (R - margin);
      const y = c + (rnd() * 2 - 1) * (R - margin);
      if (Math.hypot(x - c, y - c) < R - margin) return [x, y];
    }
    return [c, c];
  }
  function paintCraters(g, c, R, rnd, n, maxR, dark, light) {
    for (let i = 0; i < n; i++) {
      const pt = inDisc(rnd, c, R, R * 0.25);
      const cr = R * (0.06 + rnd() * maxR);
      g.fillStyle = dark;
      g.beginPath(); g.arc(pt[0], pt[1], cr, 0, Math.PI * 2); g.fill();
      g.strokeStyle = light; g.lineWidth = Math.max(1, cr * 0.25);
      g.beginPath(); g.arc(pt[0], pt[1], cr * 0.8, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
    }
  }
  function paintSpeckle(g, c, R, rnd, n, colors, aMax, rMin, rMax) {
    for (let i = 0; i < n; i++) {
      const pt = inDisc(rnd, c, R, R * 0.06);
      g.fillStyle = rgba(colors[(rnd() * colors.length) | 0], 0.08 + rnd() * aMax);
      g.beginPath(); g.arc(pt[0], pt[1], R * (rMin + rnd() * (rMax - rMin)), 0, Math.PI * 2); g.fill();
    }
  }
  function paintBands(g, c, R, rnd, palette, warp, alpha, turb) {
    const count = palette.length;
    const step = Math.max(1, Math.round(R / 110));
    const ph1 = rnd() * 6.28, ph2 = rnd() * 6.28;
    for (let y = -R; y < R; y += step) {
      const t = (y / R + 1) / 2;
      const w = Math.sin(y * 0.09 + ph1) * warp + Math.sin(y * 0.031 + ph2) * warp * 1.6;
      const idx = Math.floor((((t * count + w) % count) + count) % count);
      const chord = Math.sqrt(Math.max(0, R * R - y * y));
      g.fillStyle = rgba(palette[idx], alpha);
      g.fillRect(c - chord, c + y, chord * 2, step + 0.5);
    }
    for (let i = 0; i < turb; i++) {
      const pt = inDisc(rnd, c, R, R * 0.3);
      softBlob(g, pt[0], pt[1], R * (0.1 + rnd() * 0.16), rnd() < 0.5 ? '#ffffff' : '#3a2a18', 0.10);
    }
  }
  function paintCaps(g, c, R, color, alpha, top, bottom) {
    // Casquete suave (sin borde duro): el recorte al disco ya está activo
    if (top) softBlob(g, c, c - R * 0.98, R * 0.44, color, alpha);
    if (bottom) softBlob(g, c, c + R * 0.98, R * 0.40, color, alpha);
  }
  function makeSprite(level) {
    const p = PLANETS[level];
    const nomR = Math.max(p.radius, 22);
    const S = Math.max(16, Math.ceil(nomR * 2 * TEX_SS));
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const g = cv.getContext('2d');
    const c = S / 2, R = S / 2 - 1;
    const rnd = mulberry32(1234 + level * 977);
    const base = g.createLinearGradient(0, 0, R * 0.4, S);
    base.addColorStop(0, p.color);
    base.addColorStop(1, p.dark);
    g.fillStyle = base;
    g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.fill();
    g.save();
    g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.clip();
    if (level === 0) {
      paintSpeckle(g, c, R, rnd, 170, ['#3c4350', '#cfd6e2'], 0.22, 0.008, 0.03);
      paintCraters(g, c, R, rnd, 5, 0.10, 'rgba(20,24,36,.5)', 'rgba(255,255,255,.35)');
    } else if (level === 1) {
      for (let i = 0; i < 3; i++) { const pt = inDisc(rnd, c, R, R * 0.3); softBlob(g, pt[0], pt[1], R * 0.4, '#5c5142', 0.35); }
      paintCraters(g, c, R, rnd, 8, 0.12, 'rgba(40,32,22,.5)', 'rgba(255,244,220,.35)');
    } else if (level === 2) {
      for (let i = 0; i < 4; i++) { const pt = inDisc(rnd, c, R, R * 0.35); softBlob(g, pt[0], pt[1], R * (0.3 + rnd() * 0.2), '#6f7688', 0.5); }
      paintCraters(g, c, R, rnd, 10, 0.10, 'rgba(70,76,92,.55)', 'rgba(255,255,255,.5)');
    } else if (level === 3) {
      paintSpeckle(g, c, R, rnd, 140, ['#5e4630', '#e8cfa8'], 0.2, 0.008, 0.028);
      paintCraters(g, c, R, rnd, 10, 0.11, 'rgba(60,40,24,.5)', 'rgba(255,235,200,.35)');
    } else if (level === 4) {
      for (let i = 0; i < 3; i++) { const pt = inDisc(rnd, c, R, R * 0.35); softBlob(g, pt[0], pt[1], R * 0.42, '#6e2f16', 0.4); }
      paintCaps(g, c, R, '#f4ede2', 0.75, true, false);
      paintCraters(g, c, R, rnd, 4, 0.08, 'rgba(90,40,20,.45)', 'rgba(255,220,190,.3)');
    } else if (level === 5) {
      paintBands(g, c, R, rnd, ['#e8c47a', '#d9a13c', '#f2d894', '#c98f2e'], 0.5, 0.7, 4);
      for (let i = 0; i < 3; i++) { const pt = inDisc(rnd, c, R, R * 0.3); softBlob(g, pt[0], pt[1], R * 0.3, '#fff6e0', 0.25); }
    } else if (level === 6) {
      let placed = 0, guard = 0;
      while (placed < 7 && guard++ < 60) {
        const pt = inDisc(rnd, c, R, R * 0.3);
        if (Math.abs(pt[1] - c) > R * 0.62) continue;
        softBlob(g, pt[0], pt[1], R * (0.16 + rnd() * 0.2), rnd() < 0.6 ? '#3d8b4f' : '#8a7a4d', 0.95);
        placed++;
      }
      paintCaps(g, c, R, '#ffffff', 0.8, true, true);
      for (let i = 0; i < 9; i++) { const pt = inDisc(rnd, c, R, R * 0.2); softBlob(g, pt[0], pt[1], R * (0.14 + rnd() * 0.14), '#ffffff', 0.4); }
    } else if (level === 7) {
      paintBands(g, c, R, rnd, ['#4f7cff', '#3f6bf0', '#6a8dff', '#3556c4'], 0.3, 0.6, 2);
      const pt = inDisc(rnd, c, R, R * 0.3);
      g.fillStyle = 'rgba(20,30,80,.5)';
      g.beginPath(); g.ellipse(pt[0], pt[1], R * 0.2, R * 0.13, 0.3, 0, Math.PI * 2); g.fill();
      softBlob(g, c - R * 0.3, c - R * 0.35, R * 0.35, '#ffffff', 0.22);
    } else if (level === 8) {
      paintBands(g, c, R, rnd, ['#7de3d4', '#74d8c9', '#8ae9db'], 0.2, 0.35, 1);
      softBlob(g, c, c - R * 0.7, R * 0.5, '#ffffff', 0.18);
    } else if (level === 9) {
      paintBands(g, c, R, rnd, ['#e9d8a6', '#dfc891', '#f2e4bc', '#d3b67e'], 0.3, 0.5, 2);
      paintCaps(g, c, R, '#b39a5e', 0.35, true, false);
    } else if (level === 10) {
      paintBands(g, c, R, rnd, ['#e9a26b', '#d98d55', '#f2c194', '#b06a35', '#e8b083'], 0.45, 0.75, 6);
      g.fillStyle = 'rgba(193,68,46,.9)';
      g.beginPath(); g.ellipse(c + R * 0.28, c + R * 0.22, R * 0.22, R * 0.14, -0.2, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(230,130,90,.9)';
      g.beginPath(); g.ellipse(c + R * 0.28, c + R * 0.22, R * 0.14, R * 0.085, -0.2, 0, Math.PI * 2); g.fill();
    } else {
      paintSpeckle(g, c, R, rnd, 420, ['#ffe9a8', '#d98a00', '#fff6d8'], 0.16, 0.006, 0.022);
    }
    // Volumen esférico: luz arriba-izquierda + oscurecido de limbo
    const hl = g.createRadialGradient(c - R * 0.38, c - R * 0.42, R * 0.05, c - R * 0.38, c - R * 0.42, R * 1.3);
    hl.addColorStop(0, 'rgba(255,255,255,.32)');
    hl.addColorStop(0.5, 'rgba(255,255,255,0)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl;
    g.fillRect(0, 0, S, S);
    const limb = g.createRadialGradient(c, c, R * (level === 11 ? 0.45 : 0.58), c, c, R);
    limb.addColorStop(0, 'rgba(5,7,20,0)');
    limb.addColorStop(1, level === 11 ? 'rgba(120,50,0,.55)' : 'rgba(5,7,20,.48)');
    g.fillStyle = limb;
    g.fillRect(0, 0, S, S);
    g.restore();
    return cv;
  }
  function buildSprites() {
    for (let i = 0; i < PLANETS.length; i++) SPRITES.push(makeSprite(i));
  }

  // --- Audio ---
  // Nota iOS: el AudioContext solo arranca dentro de un gesto del usuario
  // (touch/click) y el conmutador de silencio del iPhone silencia la Web Audio:
  // eso no es un bug del juego, no se puede saltar por software.
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
      // Desbloqueo iOS clásico: buffer silencioso reproducido dentro del gesto
      if (audioCtx) {
        try {
          const len = Math.max(1, Math.floor(audioCtx.sampleRate * 0.02));
          const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
          const src = audioCtx.createBufferSource();
          src.buffer = buf;
          src.connect(audioCtx.destination);
          if (src.start) src.start(0);
        } catch (e2) {}
      }
    }
    if (audioCtx && (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted')) {
      try { const p = audioCtx.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
  }
  function pop(level) {
    if (muted || !audioCtx || audioCtx.state !== 'running') {
      // Si iOS aún lo tiene suspendido, reintenta desbloquear para la próxima fusión
      if (audioCtx && !muted && audioCtx.state !== 'running') ensureAudio();
      return;
    }
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
  function updateMuteBtn() {
    const b = document.getElementById('btnMute');
    b.classList.toggle('muted', muted);
    b.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar');
  }

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
      restitution: 0.2, friction: 0.25, frictionStatic: 0.4, frictionAir: 0.008, density: 0.0012
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
    toastEl.innerHTML = (isBonus ? 'BONUS · ' : '') + '<b>' + p.name + '</b> · ' + fmtKm(p.diameterKm) + ' · ' + p.type;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 2200);
  }
  function unlock(level) { if (!discovered[level]) { discovered[level] = true; saveCodex(); renderCodex(); } }

  function burst(x, y, color) {
    if (REDUCED) return;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 3;
      particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, life: 1, color });
    }
    if (particles.length > 220) particles.splice(0, particles.length - 220);
  }

  // --- Fondo estrellado prerenderizado (una capa reutilizada, sin animación) ---
  let bgCanvas = null;
  function buildBackground() {
    const SS = 2, bw = W * SS, bh = H * SS;
    bgCanvas = document.createElement('canvas');
    bgCanvas.width = bw; bgCanvas.height = bh;
    const g = bgCanvas.getContext('2d');
    const rnd = mulberry32(42);
    g.fillStyle = '#070a1e'; g.fillRect(0, 0, bw, bh);
    const nebs = [
      [0.22, 0.20, 0.50, '64,50,140'],
      [0.82, 0.52, 0.55, '28,78,140'],
      [0.50, 0.86, 0.45, '110,55,120']
    ];
    for (const n of nebs) {
      const gr = g.createRadialGradient(bw * n[0], bh * n[1], 0, bw * n[0], bh * n[1], bw * n[2]);
      gr.addColorStop(0, 'rgba(' + n[3] + ',.20)');
      gr.addColorStop(1, 'rgba(' + n[3] + ',0)');
      g.fillStyle = gr; g.fillRect(0, 0, bw, bh);
    }
    for (let i = 0; i < 150; i++) {
      const x = rnd() * bw, y = rnd() * bh, rr = rnd();
      const rad = rr < 0.85 ? SS * 0.7 : rr < 0.97 ? SS * 1.1 : SS * 1.7;
      const tint = rnd();
      const col = tint < 0.75 ? '255,255,255' : tint < 0.88 ? '190,210,255' : '255,220,170';
      g.fillStyle = 'rgba(' + col + ',' + (0.25 + rnd() * 0.65).toFixed(2) + ')';
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
      if (rad > SS * 1.2) {
        g.fillStyle = 'rgba(255,255,255,.30)';
        g.fillRect(x - rad * 2.2, y - 0.5, rad * 4.4, 1);
        g.fillRect(x - 0.5, y - rad * 2.2, 1, rad * 4.4);
      }
    }
  }

  // --- Movimiento reducido: sin partículas ni efectos prescindibles ---
  const REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

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
  function layoutGame() {
    // Encaja el canvas en el espacio disponible sin deformar (nunca scroll)
    const wrap = document.getElementById('board-wrap');
    const controls = document.getElementById('controls');
    const availW = wrap.clientWidth;
    const availH = Math.max(200, wrap.clientHeight - controls.offsetHeight - 8);
    const s = Math.max(0.3, Math.min(availW / W, availH / H));
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
  }
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
  function drawFace(g, x, y, r) {
    const ex = r * 0.22, ey = -r * 0.05, er = Math.max(1.2, r * 0.07);
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.beginPath(); g.arc(x - ex, y + ey, er * 1.7, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + ex, y + ey, er * 1.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(10,12,28,.88)';
    g.beginPath(); g.arc(x - ex, y + ey, er, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + ex, y + ey, er, 0, Math.PI * 2); g.fill();
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(1.5, r * 0.085);
    g.beginPath(); g.arc(x, y + r * 0.18, r * 0.18, 0.3, Math.PI - 0.3); g.stroke();
    g.strokeStyle = 'rgba(10,12,28,.88)'; g.lineWidth = Math.max(1, r * 0.05);
    g.beginPath(); g.arc(x, y + r * 0.18, r * 0.18, 0.3, Math.PI - 0.3); g.stroke();
  }
  function circleArt(g, x, y, r, level) {
    const sp = SPRITES[level];
    if (sp) g.drawImage(sp, x - r, y - r, r * 2, r * 2);
    if (PLANETS[level].rings) {
      g.strokeStyle = '#f4e3b2'; g.lineWidth = Math.max(2, r * 0.09);
      g.beginPath(); g.ellipse(x, y, r * 1.35, r * 0.42, -0.35, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(244,227,178,.5)'; g.lineWidth = Math.max(1, r * 0.04);
      g.beginPath(); g.ellipse(x, y, r * 1.5, r * 0.5, -0.35, 0, Math.PI * 2); g.stroke();
    }
    drawFace(g, x, y, r);
    // etiqueta en el tercio inferior con halo para legibilidad sobre la textura
    if (r >= 19) {
      g.save();
      g.shadowColor = 'rgba(0,0,0,.65)'; g.shadowBlur = Math.max(2, r * 0.12);
      g.fillStyle = 'rgba(255,255,255,.94)';
      g.font = '700 ' + Math.max(10, r * 0.26) + 'px system-ui';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(PLANETS[level].name.slice(0, 8), x, y + r * 0.52);
      g.restore();
    }
  }

  function draw() {
    fitCanvas();
    const sx = canvas.width / W, sy = canvas.height / H;
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // cuenco: fondo estrellado prerenderizado (con fallback plano)
    if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, W, H);
    else { ctx.fillStyle = '#0d1230'; ctx.fillRect(WALL, 0, W - WALL * 2, H); }
    ctx.fillStyle = '#232b63';
    ctx.fillRect(0, 0, WALL, H); ctx.fillRect(W - WALL, 0, WALL, H);
    ctx.fillRect(0, 0, W, WALL); // rim superior: el marco cierra por los 4 lados
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
    const sp = SPRITES[next];
    if (!sp) return;
    nextCtx.drawImage(sp, 2, 2, s - 4, s - 4);
    drawFace(nextCtx, s / 2, s / 2, (s - 4) / 2);
  }

  // --- Codex UI ---
  function renderCodex() {
    const grid = document.getElementById('codexGrid');
    grid.innerHTML = '';
    PLANETS.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'codex-item' + (discovered[i] ? '' : ' locked');
      const cv = document.createElement('canvas');
      cv.width = 52; cv.height = 52; cv.className = 'codex-thumb';
      cv.setAttribute('aria-hidden', 'true');
      const cx = cv.getContext('2d');
      if (discovered[i] && SPRITES[i]) {
        cx.drawImage(SPRITES[i], 0, 0, 52, 52);
        drawFace(cx, 26, 26, 26);
      } else {
        cx.fillStyle = '#0f1430';
        cx.beginPath(); cx.arc(26, 26, 25, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.lineWidth = 2;
        cx.beginPath(); cx.arc(26, 26, 25, 0, Math.PI * 2); cx.stroke();
        cx.fillStyle = 'rgba(255,255,255,.6)';
        cx.font = '700 20px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('?', 26, 27);
      }
      div.appendChild(cv);
      const tx = document.createElement('div');
      tx.innerHTML = '<b>' + (discovered[i] ? p.name : '???') + '</b><br>' +
        (discovered[i] ? fmtKm(p.diameterKm) + ' · ' + p.type + '<br><i>' + p.fact + '</i>' : 'Fusiona para descubrir');
      div.appendChild(tx);
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
    // Desbloqueo de audio en iOS: debe ocurrir dentro de un gesto touch/click.
    // Solo con pointerdown algunos Safari no desbloquean, así que se escucha todo.
    const unlock = () => ensureAudio();
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) ensureAudio(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('codex').classList.add('hidden');
        return;
      }
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
    document.getElementById('codex').addEventListener('click', (e) => {
      if (e.target.id === 'codex') document.getElementById('codex').classList.add('hidden');
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
  buildSprites();
  buildBackground();
  layoutGame();
  window.addEventListener('resize', layoutGame);
  setupWorld();
  bindInput();
  updateMuteBtn();
  renderHUD(); renderCodex();
  bestEl.textContent = best;
  requestAnimationFrame(loop);

  // Expuesto para verificación automatizada
  window.__game = { PLANETS, pointsFor, get score() { return score; }, get bodies() { return bodies; }, DROPPABLE_MAX, sprites: SPRITES, get reduced() { return REDUCED; }, get isOver() { return isOver; } };
})();
