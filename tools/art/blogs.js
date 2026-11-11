// Blog-hub covers, hobby/language covers and the in-article figures.

const L = require('./lib');
const { canvas, panel, window_, bar, dot, line, wire, text, chip, hex, waves, rgba, r2, rng, polyPath } = L;

const W = 1200, H = 900;

// --- reusable glyphs ---------------------------------------------------------

function speechBubble(x, y, w, h, color, { r = 18, tail = 'bl', fill = 0.16, stroke = 0.5 } = {}) {
  let s = panel(x, y, w, h, color, { r, fill, stroke, sw: 2.5 });
  const t = { bl: `M${r2(x + 32)} ${r2(y + h)} l0 34 l34 -34 Z`,
              br: `M${r2(x + w - 32)} ${r2(y + h)} l0 34 l-34 -34 Z` }[tail];
  s += `<path d="${t}" fill="${rgba(color, fill + 0.08)}" stroke="${rgba(color, stroke)}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return s;
}

function person(cx, cy, scale, color, alpha = 0.55) {
  const rHead = 34 * scale;
  return `<circle cx="${r2(cx)}" cy="${r2(cy - 52 * scale)}" r="${r2(rHead)}" fill="${rgba(color, alpha)}"/>`
    + `<path d="M${r2(cx - 62 * scale)} ${r2(cy + 62 * scale)} a${r2(62 * scale)} ${r2(72 * scale)} 0 0 1 ${r2(124 * scale)} 0 Z" fill="${rgba(color, alpha)}"/>`;
}

function filmStrip(x, y, w, h, color) {
  let s = `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="8" fill="${rgba(color, 0.14)}" stroke="${rgba(color, 0.4)}" stroke-width="2"/>`;
  const n = Math.floor(w / 58);
  for (let i = 0; i < n; i++) {
    s += `<rect x="${r2(x + 14 + i * 58)}" y="${r2(y + 10)}" width="26" height="16" rx="4" fill="${rgba(color, 0.42)}"/>`;
    s += `<rect x="${r2(x + 14 + i * 58)}" y="${r2(y + h - 26)}" width="26" height="16" rx="4" fill="${rgba(color, 0.42)}"/>`;
    s += `<rect x="${r2(x + 10 + i * 58)}" y="${r2(y + 36)}" width="42" height="${r2(h - 72)}" rx="4" fill="${rgba(color, 0.1)}" stroke="${rgba(color, 0.22)}" stroke-width="1.5"/>`;
  }
  return s;
}

function globe(cx, cy, R, color, { sw = 2.5, alpha = 0.55 } = {}) {
  let s = `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}" fill="${rgba(color, 0.07)}" stroke="${rgba(color, alpha)}" stroke-width="${sw}"/>`;
  for (let i = 1; i <= 3; i++) {
    const rx = R * (1 - i / 4);
    s += `<ellipse cx="${r2(cx)}" cy="${r2(cy)}" rx="${r2(rx)}" ry="${r2(R)}" fill="none" stroke="${rgba(color, alpha * 0.55)}" stroke-width="${sw * 0.7}"/>`;
  }
  for (let i = -2; i <= 2; i++) {
    const yy = cy + (i / 3) * R;
    const half = Math.sqrt(Math.max(0, R * R - (yy - cy) * (yy - cy)));
    s += `<path d="M${r2(cx - half)} ${r2(yy)} H${r2(cx + half)}" stroke="${rgba(color, alpha * 0.5)}" stroke-width="${sw * 0.7}" fill="none"/>`;
  }
  return s;
}

// =============================================================================
// Blog hub covers
// =============================================================================

function technoblog() {
  const A = '#667eea', B = '#3fd8c4';
  const rand = rng(307);
  let g = '';

  // Circuit traces running under everything.
  g += `<g opacity="0.55">`;
  for (let i = 0; i < 16; i++) {
    let x = 40 + rand() * 1120, y = 60 + rand() * 780;
    let d = `M${r2(x)} ${r2(y)}`;
    for (let k = 0; k < 4; k++) {
      const horiz = rand() > 0.5;
      const len = 50 + rand() * 150;
      if (horiz) x += rand() > 0.5 ? len : -len; else y += rand() > 0.5 ? len : -len;
      d += ` L${r2(x)} ${r2(y)}`;
    }
    g += `<path d="${d}" fill="none" stroke="${rgba(B, 0.14)}" stroke-width="2" stroke-linejoin="round"/>`;
    g += dot(x, y, 4, B, 0.35);
  }
  g += `</g>`;

  g += window_(190, 230, 700, 440, A);
  g += text(226, 330, '$ jekyll build', { size: 27, color: B, alpha: 0.85, mono: true, weight: 600 });
  const lines = [0.62, 0.4, 0.78, 0.33, 0.55, 0.46];
  lines.forEach((f, i) => { g += bar(226, 362 + i * 34, 620 * f, 13, '#ffffff', 0.3 - i * 0.025); });
  g += `<rect x="226" y="590" width="16" height="26" fill="${rgba(B, 0.9)}"/>`;

  // Chips floating around the terminal.
  ['ABAP', 'SAPUI5', 'SQL', 'JS'].forEach((t, i) => { g += chip(190 + i * 150, 710, t, B, { size: 19 }); });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 311, label: 'Terminal window over a circuit trace field', body: g });
}

function hobbylog() {
  const A = '#e8a33d', B = '#e0655f';
  let g = '';
  const tile = (x, y, draw, color) => panel(x, y, 190, 190, color, { r: 20, fill: 0.1, stroke: 0.4 }) + draw(x + 95, y + 95, color);

  // palette + brush
  const palette = (cx, cy, c) => {
    let s = `<path d="M${r2(cx - 58)} ${r2(cy + 6)} a58 50 0 1 1 116 0 a16 16 0 0 1 -22 14 a14 14 0 0 0 -16 20 a20 20 0 0 1 -30 14 a58 50 0 0 1 -48 -48 Z" `
      + `fill="${rgba(c, 0.2)}" stroke="${rgba(c, 0.7)}" stroke-width="2.5"/>`;
    [[-30, -8], [-4, -22], [22, -10], [30, 16]].forEach((p, i) => { s += dot(cx + p[0], cy + p[1], 8, ['#e0655f', '#4fc98a', '#5b8def', '#f2d24b'][i], 0.85); });
    return s;
  };
  // open book
  const book = (cx, cy, c) => {
    let s = `<path d="M${r2(cx)} ${r2(cy - 36)} c-24 -16 -48 -18 -66 -14 v68 c18 -4 42 -2 66 14 Z" fill="${rgba(c, 0.22)}" stroke="${rgba(c, 0.7)}" stroke-width="2.5"/>`;
    s += `<path d="M${r2(cx)} ${r2(cy - 36)} c24 -16 48 -18 66 -14 v68 c-18 -4 -42 -2 -66 14 Z" fill="${rgba(c, 0.14)}" stroke="${rgba(c, 0.7)}" stroke-width="2.5"/>`;
    for (let i = 0; i < 3; i++) {
      s += `<path d="M${r2(cx - 52)} ${r2(cy - 22 + i * 16)} h32" stroke="${rgba(c, 0.4)}" stroke-width="2.5" fill="none"/>`;
      s += `<path d="M${r2(cx + 20)} ${r2(cy - 22 + i * 16)} h32" stroke="${rgba(c, 0.4)}" stroke-width="2.5" fill="none"/>`;
    }
    return s;
  };
  // camera
  const camera = (cx, cy, c) => `<rect x="${r2(cx - 60)}" y="${r2(cy - 34)}" width="120" height="78" rx="12" fill="${rgba(c, 0.2)}" stroke="${rgba(c, 0.7)}" stroke-width="2.5"/>`
    + `<path d="M${r2(cx - 24)} ${r2(cy - 34)} l10 -16 h28 l10 16 Z" fill="${rgba(c, 0.3)}" stroke="${rgba(c, 0.7)}" stroke-width="2.5" stroke-linejoin="round"/>`
    + `<circle cx="${r2(cx)}" cy="${r2(cy + 6)}" r="24" fill="none" stroke="${rgba(c, 0.85)}" stroke-width="3"/>`
    + `<circle cx="${r2(cx)}" cy="${r2(cy + 6)}" r="11" fill="${rgba(c, 0.5)}"/>`;
  // plant
  const plant = (cx, cy, c) => `<path d="M${r2(cx - 30)} ${r2(cy + 14)} h60 l-9 44 h-42 Z" fill="${rgba(c, 0.25)}" stroke="${rgba(c, 0.7)}" stroke-width="2.5" stroke-linejoin="round"/>`
    + `<path d="M${r2(cx)} ${r2(cy + 14)} V${r2(cy - 46)}" stroke="${rgba('#4fc98a', 0.8)}" stroke-width="3" fill="none"/>`
    + `<path d="M${r2(cx)} ${r2(cy - 22)} c-32 -4 -40 -26 -38 -42 c20 -2 38 16 38 42 Z" fill="${rgba('#4fc98a', 0.45)}"/>`
    + `<path d="M${r2(cx)} ${r2(cy - 34)} c32 -6 40 -26 38 -42 c-20 -2 -38 16 -38 42 Z" fill="${rgba('#4fc98a', 0.3)}"/>`;
  // music
  const music = (cx, cy, c) => `<path d="M${r2(cx - 18)} ${r2(cy + 26)} V${r2(cy - 44)} l50 -14 v68" fill="none" stroke="${rgba(c, 0.85)}" stroke-width="4" stroke-linejoin="round"/>`
    + `<ellipse cx="${r2(cx - 30)}" cy="${r2(cy + 28)}" rx="16" ry="12" fill="${rgba(c, 0.7)}"/>`
    + `<ellipse cx="${r2(cx + 20)}" cy="${r2(cy + 14)}" rx="16" ry="12" fill="${rgba(c, 0.7)}"/>`;
  // play / screen
  const play = (cx, cy, c) => `<rect x="${r2(cx - 62)}" y="${r2(cy - 44)}" width="124" height="88" rx="12" fill="${rgba(c, 0.18)}" stroke="${rgba(c, 0.7)}" stroke-width="2.5"/>`
    + `<path d="M${r2(cx - 14)} ${r2(cy - 20)} l40 20 l-40 20 Z" fill="${rgba(c, 0.9)}"/>`;

  const draws = [palette, book, camera, plant, music, play];
  const cols = 3, gx = 230, gy = 250, gap = 24;
  draws.forEach((d, i) => {
    const x = gx + (i % cols) * (190 + gap), y = gy + Math.floor(i / cols) * (190 + gap);
    g += tile(x, y, d, i % 2 ? B : A);
  });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 313, label: 'Tiles of hobby pursuits', body: g, vignette: 0.42 });
}

function polyblog() {
  const A = '#5ec9e8', B = '#9b8cf2';
  let g = '';
  g += globe(880, 430, 210, A, { alpha: 0.4 });
  g += speechBubble(130, 230, 360, 190, A, { tail: 'bl' });
  g += text(170, 320, 'Hello', { size: 54, color: '#ffffff', alpha: 0.9, weight: 700 });
  g += text(170, 376, 'Merhaba', { size: 34, color: A, alpha: 0.8, weight: 600 });

  g += speechBubble(170, 500, 310, 160, B, { tail: 'br' });
  g += text(205, 572, 'Bonjour', { size: 38, color: '#ffffff', alpha: 0.85, weight: 600 });
  g += text(205, 618, 'Hola  ·  Ciao', { size: 26, color: B, alpha: 0.8, weight: 500 });

  // Letterform strip
  'AÁÄBÇÐÉĞİÑÖŞÜ'.split('').forEach((ch, i) => {
    g += text(150 + i * 72, 790, ch, { size: 40, color: A, alpha: 0.22, weight: 700, anchor: 'middle' });
  });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 317, label: 'Greetings in several languages around a globe', body: g, vignette: 0.44 });
}

// =============================================================================
// Hobby covers
// =============================================================================

function streaming() {
  const A = '#e0556b', B = '#8b7bf0';
  let g = '';
  g += filmStrip(60, 150, 1080, 150, A);
  g += filmStrip(60, 680, 1080, 150, B);

  // Card stack with a play button
  for (let i = 2; i >= 0; i--) {
    g += panel(380 + i * 18, 370 + i * 14, 440 - i * 36, 200 - i * 20, i === 0 ? A : B, { r: 18, fill: 0.12 - i * 0.03, stroke: 0.4 - i * 0.1 });
  }
  g += `<circle cx="600" cy="470" r="58" fill="${rgba(A, 0.28)}" stroke="${rgba(A, 0.85)}" stroke-width="3.5"/>`;
  g += `<path d="M584 442 l48 28 l-48 28 Z" fill="#ffffff" opacity="0.92"/>`;
  g += bar(406, 572, 220, 12, '#ffffff', 0.32);
  g += bar(406, 594, 150, 10, '#ffffff', 0.18);
  g += chip(880, 380, 'S1 · E1', B, { size: 19 });
  g += chip(880, 430, '9 EPISODES', B, { size: 19 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 331, label: 'Series card between two film strips', body: g, vignette: 0.42 });
}

function telegramCover() {
  const A = '#4aa8e0', B = '#43d6a0';
  let g = '';
  g += window_(200, 180, 800, 560, A, { r: 22 });
  const msgs = [
    { side: 'l', w: 300, h: 70, t: '/start' },
    { side: 'r', w: 380, h: 96, t: null },
    { side: 'l', w: 250, h: 70, t: '/weather' },
    { side: 'r', w: 420, h: 110, t: null },
  ];
  let y = 280;
  msgs.forEach((m) => {
    const left = m.side === 'l';
    const x = left ? 240 : 960 - m.w;
    const c = left ? A : B;
    g += panel(x, y, m.w, m.h, c, { r: 16, fill: left ? 0.16 : 0.22, stroke: 0.42 });
    if (m.t) g += text(x + 24, y + m.h / 2 + 9, m.t, { size: 24, color: '#ffffff', alpha: 0.92, mono: true, weight: 600 });
    else {
      g += bar(x + 24, y + 24, m.w - 90, 11, '#ffffff', 0.34);
      g += bar(x + 24, y + 46, m.w - 150, 11, '#ffffff', 0.22);
      if (m.h > 100) g += bar(x + 24, y + 68, m.w - 120, 11, '#ffffff', 0.18);
    }
    y += m.h + 24;
  });
  g += panel(240, 646, 720, 58, A, { r: 29, fill: 0.1, stroke: 0.32 });
  g += bar(272, 668, 180, 12, '#ffffff', 0.2);
  g += `<path d="M900 660 l40 15 l-40 15 l8 -15 Z" fill="${rgba(B, 0.9)}"/>`;
  // bot head
  g += panel(866, 196, 110, 90, B, { r: 18, fill: 0.2, stroke: 0.6 });
  g += dot(896, 240, 9, B, 0.95); g += dot(946, 240, 9, B, 0.95);
  g += `<path d="M921 196 V172" stroke="${rgba(B, 0.8)}" stroke-width="3" fill="none"/>`;
  g += dot(921, 166, 7, B, 0.95, true);
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 337, label: 'Chat thread with a bot', body: g, vignette: 0.4 });
}

function diy() {
  const A = '#e0804a', B = '#4fc98a';
  let g = '';
  // workbench line
  g += `<path d="M90 690 H1110" stroke="${rgba(A, 0.35)}" stroke-width="3" fill="none"/>`;

  // scissors
  const sx = 230, sy = 430;
  g += `<path d="M${sx - 50} ${sy - 80} L${sx + 56} ${sy + 60}" stroke="${rgba(A, 0.85)}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M${sx + 50} ${sy - 80} L${sx - 56} ${sy + 60}" stroke="${rgba(A, 0.85)}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  g += `<circle cx="${sx - 62}" cy="${sy + 82}" r="24" fill="none" stroke="${rgba(A, 0.85)}" stroke-width="7"/>`;
  g += `<circle cx="${sx + 62}" cy="${sy + 82}" r="24" fill="none" stroke="${rgba(A, 0.85)}" stroke-width="7"/>`;
  g += dot(sx, sy - 6, 8, A, 0.9);

  // needle and thread
  g += `<path d="M470 560 C520 470 600 500 640 430 C680 360 760 390 800 330" stroke="${rgba(B, 0.7)}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M800 330 L880 262" stroke="${rgba(B, 0.95)}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  g += `<ellipse cx="804" cy="326" rx="9" ry="14" fill="none" stroke="${rgba(B, 0.95)}" stroke-width="4" transform="rotate(-40 804 326)"/>`;

  // ruler
  g += `<rect x="480" y="620" width="420" height="58" rx="8" fill="${rgba(A, 0.16)}" stroke="${rgba(A, 0.6)}" stroke-width="2.5"/>`;
  for (let i = 1; i < 14; i++) {
    const tall = i % 3 === 0;
    g += `<path d="M${r2(480 + i * 30)} 620 v${tall ? 26 : 15}" stroke="${rgba(A, 0.65)}" stroke-width="2.5" fill="none"/>`;
  }

  // paint tube
  g += `<rect x="930" y="470" width="86" height="190" rx="14" fill="${rgba(B, 0.2)}" stroke="${rgba(B, 0.7)}" stroke-width="2.5"/>`;
  g += `<rect x="952" y="436" width="42" height="40" rx="8" fill="${rgba(B, 0.45)}" stroke="${rgba(B, 0.8)}" stroke-width="2.5"/>`;
  for (let i = 0; i < 3; i++) g += bar(952, 520 + i * 32, 44, 10, '#ffffff', 0.25);

  // spool of thread
  g += `<ellipse cx="200" cy="640" rx="76" ry="22" fill="${rgba(B, 0.22)}" stroke="${rgba(B, 0.6)}" stroke-width="2.5"/>`;
  for (let i = 0; i < 4; i++) g += `<path d="M124 ${640 - i * 16} a76 22 0 0 0 152 0" fill="none" stroke="${rgba(B, 0.45)}" stroke-width="2.5"/>`;

  g += text(90, 230, 'MAKE IT YOURSELF', { size: 22, color: A, alpha: 0.5, weight: 700, spacing: 6 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 347, label: 'Craft tools laid out on a bench', body: g, vignette: 0.42 });
}

function interview() {
  const A = '#f2a93c', B = '#5b8def';
  let g = '';
  g += person(250, 520, 1.25, B, 0.4);
  g += person(950, 520, 1.25, A, 0.4);
  g += speechBubble(390, 230, 420, 160, B, { tail: 'bl' });
  g += bar(428, 282, 300, 13, '#ffffff', 0.4);
  g += bar(428, 310, 230, 11, '#ffffff', 0.24);
  g += bar(428, 336, 270, 11, '#ffffff', 0.18);
  g += speechBubble(430, 450, 380, 140, A, { tail: 'br' });
  g += bar(466, 496, 250, 13, '#ffffff', 0.4);
  g += bar(466, 524, 190, 11, '#ffffff', 0.22);
  ['S', 'T', 'A', 'R'].forEach((s, i) => { g += chip(430 + i * 86, 638, s, A, { size: 20, pad: 22 }); });
  g += text(90, 180, 'BEHAVIOURAL ROUND', { size: 22, color: A, alpha: 0.5, weight: 700, spacing: 6 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 349, label: 'Interview conversation with STAR structure', body: g, vignette: 0.4 });
}

// =============================================================================
// Language covers
// =============================================================================

function english() {
  const A = '#5e9ae8', B = '#f2a65a';
  let g = '';
  g += text(190, 520, 'Aa', { size: 300, color: A, alpha: 0.16, weight: 700 });
  g += text(640, 620, 'Bb', { size: 220, color: B, alpha: 0.12, weight: 700 });
  g += speechBubble(260, 250, 520, 220, A, { tail: 'bl', fill: 0.14 });
  g += text(300, 338, 'Do you speak', { size: 38, color: '#ffffff', alpha: 0.8, weight: 500 });
  g += text(300, 404, 'English?', { size: 58, color: '#ffffff', alpha: 0.95, weight: 700 });
  g += `<path d="M300 430 h150" stroke="${rgba(B, 0.9)}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  ['listen', 'read', 'speak', 'write'].forEach((t, i) => { g += chip(240 + i * 170, 700, t, B, { size: 20 }); });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 353, label: 'Speech bubble asking do you speak English', body: g, vignette: 0.4 });
}

function toefl() {
  const A = '#6fb3e0', B = '#4fc98a';
  let g = '';
  g += panel(170, 220, 860, 480, A, { r: 24, fill: 0.08, stroke: 0.4 });
  g += text(214, 300, 'SECTION SCORES', { size: 22, color: A, alpha: 0.7, weight: 700, spacing: 5 });
  g += `<path d="M170 328 h860" stroke="${rgba(A, 0.25)}" stroke-width="2" fill="none"/>`;
  const sections = [['Reading', 0.9], ['Listening', 0.82], ['Speaking', 0.7], ['Writing', 0.86]];
  sections.forEach(([name, v], i) => {
    const y = 378 + i * 74;
    g += text(214, y + 8, name, { size: 25, color: '#ffffff', alpha: 0.85, weight: 500 });
    g += bar(430, y - 8, 380, 16, A, 0.16, 8);
    g += bar(430, y - 8, 380 * v, 16, B, 0.9, 8);
    g += text(986, y + 8, String(Math.round(v * 30)), { size: 26, color: '#ffffff', alpha: 0.9, anchor: 'end', weight: 700, mono: true });
  });
  // total ring
  const cx = 600, cy = 760;
  g += `<circle cx="${cx}" cy="${cy}" r="58" fill="none" stroke="${rgba(A, 0.2)}" stroke-width="12"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="58" fill="none" stroke="${rgba(B, 0.9)}" stroke-width="12" stroke-linecap="round" `
     + `stroke-dasharray="${r2(364 * 0.82)} 364" transform="rotate(-90 ${cx} ${cy})"/>`;
  g += text(cx, cy + 12, '98', { size: 38, color: '#ffffff', alpha: 0.95, anchor: 'middle', weight: 700, mono: true });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 359, label: 'Language exam score card by section', body: g, vignette: 0.3 });
}

// =============================================================================
// In-article figures (wider format)
// =============================================================================

const FW = 1600, FH = 900;

function figSapui5() {
  const A = '#2fb6c4', B = '#5b8def';
  const rand = rng(367);
  let g = '';
  const tiles = (x, y, w, h, cols, rows, c) => {
    let s = '';
    const tw = (w - (cols + 1) * 12) / cols, th = (h - (rows + 1) * 12) / rows;
    for (let r0 = 0; r0 < rows; r0++) for (let c0 = 0; c0 < cols; c0++) {
      const tx = x + 12 + c0 * (tw + 12), ty = y + 12 + r0 * (th + 12);
      s += panel(tx, ty, tw, th, c, { r: 8, fill: 0.14, stroke: 0.26, sw: 1.5 });
      s += bar(tx + 10, ty + 12, tw * 0.6, 7, '#ffffff', 0.4);
      const k = (r0 * cols + c0) % 3;
      if (k === 0) s += text(tx + 10, ty + th - 16, String(Math.round(rand() * 900 + 100)), { size: Math.min(26, th * 0.3), color: '#ffffff', alpha: 0.85, weight: 700 });
      else if (k === 1) for (let b = 0; b < 5; b++) {
        const bh = (th - 40) * (0.25 + rand() * 0.7);
        s += `<rect x="${r2(tx + 12 + b * (tw - 24) / 5)}" y="${r2(ty + th - 12 - bh)}" width="${r2((tw - 34) / 5)}" height="${r2(bh)}" rx="2" fill="${rgba(A, 0.5)}"/>`;
      } else {
        let d = '';
        for (let p = 0; p <= 6; p++) d += (p ? ' L' : 'M') + r2(tx + 12 + p * (tw - 24) / 6) + ' ' + r2(ty + th - 14 - (th - 44) * rand());
        s += `<path d="${d}" fill="none" stroke="${rgba(A, 0.8)}" stroke-width="2" stroke-linecap="round"/>`;
      }
    }
    return s;
  };

  // Desktop
  g += panel(300, 140, 760, 500, B, { r: 16, fill: 0.08, stroke: 0.42 });
  g += `<path d="M300 192 h760" stroke="${rgba(B, 0.3)}" stroke-width="2" fill="none"/>`;
  g += bar(330, 162, 120, 10, '#ffffff', 0.4);
  g += tiles(320, 206, 720, 420, 4, 3, B);
  g += `<path d="M620 640 h120 v40 h-120 Z" fill="${rgba(B, 0.2)}"/>`;
  g += `<rect x="540" y="678" width="280" height="14" rx="7" fill="${rgba(B, 0.3)}"/>`;

  // Tablet
  g += panel(1080, 300, 440, 330, A, { r: 18, fill: 0.09, stroke: 0.45 });
  g += tiles(1092, 312, 416, 306, 3, 2, A);

  // Phone
  g += panel(120, 340, 220, 420, A, { r: 26, fill: 0.09, stroke: 0.45 });
  g += bar(196, 362, 68, 7, '#ffffff', 0.35);
  g += tiles(132, 382, 196, 360, 1, 4, A);

  g += text(120, 820, 'One application, three form factors', { size: 28, color: A, alpha: 0.6, weight: 500 });
  return canvas({ w: FW, h: FH, accent: A, accent2: B, seed: 373, label: 'A responsive dashboard on desktop, tablet and phone', body: g, vignette: 0.22, grid: 70 });
}

function figLeadership() {
  const A = '#f2a93c', B = '#5b8def';
  const items = [
    'Customer Obsession', 'Ownership', 'Invent and Simplify', 'Are Right, A Lot',
    'Learn and Be Curious', 'Hire and Develop the Best', 'Insist on the Highest Standards',
    'Think Big', 'Bias for Action', 'Frugality', 'Earn Trust', 'Dive Deep',
    'Have Backbone; Disagree and Commit', 'Deliver Results',
  ];
  let g = '';
  g += text(80, 110, 'THE 14 LEADERSHIP PRINCIPLES', { size: 34, color: '#ffffff', alpha: 0.95, weight: 700, spacing: 3 });
  g += text(80, 152, 'What the behavioural interview is actually scoring', { size: 23, color: A, alpha: 0.7, weight: 500 });
  g += `<path d="M80 184 H1520" stroke="${rgba(A, 0.3)}" stroke-width="2" fill="none"/>`;
  items.forEach((t, i) => {
    const col = i < 7 ? 0 : 1;
    const row = i % 7;
    const x = 80 + col * 760, y = 240 + row * 92;
    g += panel(x, y - 36, 700, 70, col ? B : A, { r: 12, fill: 0.09, stroke: 0.26, sw: 1.5 });
    g += `<circle cx="${r2(x + 38)}" cy="${r2(y - 1)}" r="22" fill="${rgba(col ? B : A, 0.26)}" stroke="${rgba(col ? B : A, 0.7)}" stroke-width="2"/>`;
    g += text(x + 38, y + 8, String(i + 1), { size: 21, color: '#ffffff', alpha: 0.95, anchor: 'middle', weight: 700, mono: true });
    g += text(x + 78, y + 8, t, { size: 24, color: '#ffffff', alpha: 0.88, weight: 500 });
  });
  return canvas({ w: FW, h: FH, accent: A, accent2: B, seed: 379, label: 'The fourteen leadership principles listed in two columns', body: g, vignette: 0.16, bloom: 0.26, grid: 80 });
}

function figInterviewChat() {
  const A = '#f2a93c', B = '#5b8def';
  let g = '';
  g += text(80, 110, 'HOW A STAR ANSWER IS BUILT', { size: 30, color: '#ffffff', alpha: 0.92, weight: 700, spacing: 3 });
  const rows = [
    { who: 'Interviewer', side: 'l', c: B, tag: null, lines: [0.8, 0.5] },
    { who: 'You', side: 'r', c: A, tag: 'Situation', lines: [0.75, 0.6] },
    { who: 'You', side: 'r', c: A, tag: 'Task', lines: [0.65] },
    { who: 'You', side: 'r', c: A, tag: 'Action', lines: [0.85, 0.7, 0.5] },
    { who: 'You', side: 'r', c: A, tag: 'Result', lines: [0.6, 0.4] },
  ];
  let y = 180;
  rows.forEach((r0) => {
    const h = 54 + r0.lines.length * 30 + (r0.tag ? 14 : 0);
    const w = 820;
    const x = r0.side === 'l' ? 80 : 1520 - w;
    g += panel(x, y, w, h, r0.c, { r: 16, fill: 0.1, stroke: 0.38 });
    g += text(x + 28, y + 36, r0.who, { size: 20, color: r0.c, alpha: 0.85, weight: 700, spacing: 2 });
    if (r0.tag) g += chip(x + w - 150, y + 14, r0.tag, r0.c, { size: 18 });
    r0.lines.forEach((f, i) => { g += bar(x + 28, y + 58 + i * 30, (w - 80) * f, 12, '#ffffff', 0.3 - i * 0.04); });
    y += h + 22;
  });
  return canvas({ w: FW, h: FH, accent: A, accent2: B, seed: 383, label: 'A STAR-structured interview answer broken into parts', body: g, vignette: 0.16, bloom: 0.26, grid: 80 });
}

function figWorldLanguages() {
  const A = '#5ec9e8', B = '#9b8cf2';
  let g = '';
  const cx = 800, cy = 480, R = 250;
  g += globe(cx, cy, R, A, { alpha: 0.5, sw: 3 });
  const greet = ['Hello', 'Merhaba', 'Bonjour', 'Hola', 'Ciao', 'Hallo', 'Olá', 'Dzień dobry'];
  greet.forEach((t, i) => {
    const a = -Math.PI / 2 + (i / greet.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * (R + 140), y = cy + Math.sin(a) * (R + 110);
    g += line(cx + Math.cos(a) * (R + 12), cy + Math.sin(a) * (R + 12), cx + Math.cos(a) * (R + 72), cy + Math.sin(a) * (R + 62), A, 0.4, 2);
    g += text(x, y + 9, t, { size: 30, color: '#ffffff', alpha: 0.88, anchor: 'middle', weight: 600 });
    g += dot(cx + Math.cos(a) * (R + 12), cy + Math.sin(a) * (R + 12), 6, B, 0.9, true);
  });
  g += text(80, 110, 'ONE IDEA, MANY LANGUAGES', { size: 30, color: '#ffffff', alpha: 0.9, weight: 700, spacing: 3 });
  return canvas({ w: FW, h: FH, accent: A, accent2: B, seed: 389, label: 'Greetings from several languages around a globe', body: g, vignette: 0.2, grid: 80 });
}

function figToeflSections() {
  const A = '#6fb3e0', B = '#4fc98a';
  let g = '';
  g += text(80, 110, 'HOW THE TEST IS STRUCTURED', { size: 30, color: '#ffffff', alpha: 0.92, weight: 700, spacing: 3 });
  const secs = [
    { t: 'Reading', d: 'passages · multiple choice', c: A },
    { t: 'Listening', d: 'lectures · conversations', c: B },
    { t: 'Speaking', d: 'recorded responses', c: A },
    { t: 'Writing', d: 'integrated · independent', c: B },
  ];
  secs.forEach((s, i) => {
    const x = 80 + i * 370;
    g += panel(x, 200, 330, 480, s.c, { r: 20, fill: 0.09, stroke: 0.42 });
    g += `<circle cx="${r2(x + 165)}" cy="320" r="58" fill="${rgba(s.c, 0.16)}" stroke="${rgba(s.c, 0.6)}" stroke-width="3"/>`;
    g += text(x + 165, 336, String(i + 1), { size: 44, color: '#ffffff', alpha: 0.9, anchor: 'middle', weight: 700, mono: true });
    g += text(x + 165, 440, s.t, { size: 32, color: '#ffffff', alpha: 0.95, anchor: 'middle', weight: 700 });
    g += text(x + 165, 480, s.d, { size: 19, color: s.c, alpha: 0.8, anchor: 'middle', weight: 500 });
    for (let k = 0; k < 4; k++) g += bar(x + 40, 528 + k * 30, 250 - k * 34, 10, '#ffffff', 0.24 - k * 0.04);
  });
  return canvas({ w: FW, h: FH, accent: A, accent2: B, seed: 397, label: 'The four sections of the exam', body: g, vignette: 0.18, grid: 80 });
}

function figSeriesCard(title, meta, accentA, accentB, seed) {
  let g = '';
  g += filmStrip(80, 120, 1440, 120, accentB);
  g += panel(260, 310, 1080, 420, accentA, { r: 26, fill: 0.1, stroke: 0.45 });
  g += text(800, 470, title, { size: 68, color: '#ffffff', alpha: 0.96, anchor: 'middle', weight: 700, spacing: 2 });
  g += `<path d="M560 510 H1040" stroke="${rgba(accentB, 0.8)}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  g += text(800, 568, meta, { size: 26, color: accentB, alpha: 0.9, anchor: 'middle', weight: 500, spacing: 3 });
  g += `<circle cx="800" cy="650" r="42" fill="${rgba(accentB, 0.22)}" stroke="${rgba(accentB, 0.8)}" stroke-width="3"/>`;
  g += `<path d="M788 630 l34 20 l-34 20 Z" fill="#ffffff" opacity="0.92"/>`;
  g += filmStrip(80, 780, 1440, 90, accentB);
  return canvas({ w: FW, h: FH, accent: accentA, accent2: accentB, seed, label: title + ' title card', body: g, vignette: 0.2, grid: 80 });
}

module.exports = {
  technoblog, hobbylog, polyblog, streaming, telegramCover, diy, interview, english, toefl,
  figSapui5, figLeadership, figInterviewChat, figWorldLanguages, figToeflSections, figSeriesCard,
};
