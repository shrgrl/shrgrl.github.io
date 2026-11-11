// Full-bleed hero backdrops. These sit behind a dark CSS gradient and a page
// title, so they stay atmospheric: large shapes, low contrast, nothing to read.

const L = require('./lib');
const { canvas, panel, bar, dot, line, wire, text, rgba, r2, rng, polyPath, waves } = L;

const W = 1600, H = 900;

/**
 * Wide colour fields. Radial gradients rather than blurred discs, so they fall
 * off smoothly instead of reading as soft circles sitting on top of the art.
 */
function fields(specs) {
  const defs = specs.map(([x, y, r, c, a], i) =>
    `<radialGradient id="f${i}" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">`
    + `<stop offset="0" stop-color="${c}" stop-opacity="${a}"/>`
    + `<stop offset="0.55" stop-color="${c}" stop-opacity="${r2(a * 0.32)}"/>`
    + `<stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('\n  ');
  const body = specs.map(([x, y, r], i) =>
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r2(r * 0.86)}" fill="url(#f${i})"/>`).join('');
  return { defs, body };
}

/** Layered silhouette ridges receding toward the horizon, with a lit rim. */
function ridges(baseY, layers, accent, seed, { amp = 90, step = 62 } = {}) {
  const rand = rng(seed);
  let g = '';
  for (let l = 0; l < layers; l++) {
    const y0 = baseY + l * step;
    const pts = [];
    let x = -20, y = y0;
    pts.push([x, y]);
    while (x < W + 20) {
      const dx = 110 + rand() * 190;
      const dy = (rand() - 0.5) * amp * (1 - l * 0.12);
      x += dx; y = Math.max(baseY - amp, Math.min(baseY + amp * 1.2, y + dy));
      pts.push([x, y]);
    }
    const crest = 'M' + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(' L');
    g += `<path d="${crest} L${W + 20} ${H + 20} L-20 ${H + 20} Z" fill="${rgba('#04050e', 0.62 + l * 0.12)}"/>`;
    // Rim light along the crest keeps the silhouette from disappearing.
    g += `<path d="${crest}" fill="none" stroke="${rgba(accent, 0.42 - l * 0.09)}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  return g;
}

/** Points joined to their nearest neighbours - the "network" backdrop. */
function constellation(count, accent, seed, { maxLink = 230, pad = 40, alpha = 0.45 } = {}) {
  const rand = rng(seed);
  const pts = [];
  for (let i = 0; i < count; i++) pts.push({ x: pad + rand() * (W - pad * 2), y: pad + rand() * (H - pad * 2) });
  let g = '';
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d = Math.hypot(dx, dy);
      if (d < maxLink) g += line(pts[i].x, pts[i].y, pts[j].x, pts[j].y, accent, alpha * (1 - d / maxLink), 1.5);
    }
  }
  pts.forEach((p, i) => { g += dot(p.x, p.y, i % 7 === 0 ? 6 : 3.2, accent, 0.85, i % 7 === 0); });
  return g;
}

// =============================================================================

function home() {
  const A = '#667eea', B = '#3fd8c4';
  const f = fields([[300, 230, 420, A, 0.3], [1330, 600, 460, B, 0.2], [860, 160, 340, '#9d7bf0', 0.22]]);
  let g = f.body;
  // Orbit rings behind the network.
  for (let i = 0; i < 5; i++) {
    g += `<circle cx="800" cy="440" r="${170 + i * 115}" fill="none" stroke="${rgba(B, 0.14 - i * 0.02)}" stroke-width="1.5"/>`;
  }
  g += constellation(46, A, 1009, { alpha: 0.5 });
  g += ridges(640, 3, B, 1013, { amp: 72, step: 72 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1019, defs: f.defs, label: 'Networked points over a layered horizon', body: g, grid: 72, stars: 170, vignette: 0.2, bloom: 0.26 });
}

function blogHero() {
  const A = '#667eea', B = '#9d7bf0';
  const f = fields([[360, 280, 420, A, 0.26], [1260, 580, 420, B, 0.22]]);
  let g = f.body;
  // Receding stack of cards.
  for (let i = 5; i >= 0; i--) {
    const s = 1 - i * 0.09;
    const w = 520 * s, h = 320 * s;
    const x = 760 - w / 2 + i * 56, y = 300 - h / 2 + i * 44;
    g += panel(x, y, w, h, i % 2 ? B : A, { r: 18 * s, fill: 0.1, stroke: 0.5 - i * 0.06, sw: 2 });
    g += bar(x + 30 * s, y + 42 * s, w * 0.55, 12 * s, '#ffffff', 0.4 - i * 0.05);
    g += bar(x + 30 * s, y + 72 * s, w * 0.38, 10 * s, '#ffffff', 0.26 - i * 0.03);
    g += bar(x + 30 * s, y + 100 * s, w * 0.46, 10 * s, '#ffffff', 0.18 - i * 0.02);
  }
  g += ridges(710, 2, A, 1021, { amp: 54, step: 82 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1031, defs: f.defs, label: 'A receding stack of article cards', body: g, grid: 72, stars: 130, vignette: 0.2, bloom: 0.24 });
}

function about() {
  const A = '#5b8def', B = '#9b8cf2';
  const f = fields([[1190, 240, 420, B, 0.24], [420, 400, 380, A, 0.18]]);
  let g = f.body;
  g += `<circle cx="1210" cy="240" r="88" fill="${rgba('#e4ebff', 0.16)}" stroke="${rgba('#e4ebff', 0.4)}" stroke-width="2"/>`;
  g += `<circle cx="1210" cy="240" r="146" fill="none" stroke="${rgba('#e4ebff', 0.12)}" stroke-width="1.5"/>`;
  g += `<circle cx="1210" cy="240" r="210" fill="none" stroke="${rgba('#e4ebff', 0.06)}" stroke-width="1.5"/>`;
  g += ridges(540, 4, A, 1033, { amp: 120, step: 90 });
  // A small figure standing on the near ridge, in silhouette against the sky.
  const fx = 470, fy = 540;
  g += `<g><circle cx="${fx}" cy="${fy - 46}" r="12" fill="#03040c"/>`
     + `<path d="M${fx} ${fy - 33} v46 M${fx} ${fy - 22} l-30 18 M${fx} ${fy - 22} l30 18 M${fx} ${fy + 13} l-20 38 M${fx} ${fy + 13} l20 38" `
     + `stroke="#03040c" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1039, defs: f.defs, label: 'A figure on a ridge under a wide night sky', body: g, grid: 84, stars: 300, vignette: 0.18, bloom: 0.22 });
}

function projects() {
  const A = '#3fd8c4', B = '#7b6cf6';
  const f = fields([[1280, 300, 420, B, 0.22], [340, 620, 400, A, 0.18]]);
  let g = f.body;
  const iso = (cx, cy, s, h, c, a) => {
    const w = s, d = s * 0.5;
    return `<path d="M${r2(cx)} ${r2(cy - d)} l${r2(w)} ${r2(d)} l${r2(-w)} ${r2(d)} l${r2(-w)} ${r2(-d)} Z" fill="${rgba(c, a + 0.2)}" stroke="${rgba(c, 0.4)}" stroke-width="1"/>`
      + `<path d="M${r2(cx - w)} ${r2(cy)} l0 ${r2(h)} l${r2(w)} ${r2(d)} l0 ${r2(-h)} Z" fill="${rgba(c, a)}"/>`
      + `<path d="M${r2(cx + w)} ${r2(cy)} l0 ${r2(h)} l${r2(-w)} ${r2(d)} l0 ${r2(-h)} Z" fill="${rgba(c, Math.max(0.04, a - 0.07))}"/>`;
  };
  const rand = rng(1049);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const cx = 300 + col * 170 + (row % 2) * 85;
      const cy = 330 + row * 86;
      const h = 40 + rand() * 90;
      g += iso(cx, cy, 82, h, rand() > 0.72 ? B : A, 0.16 + rand() * 0.14);
    }
  }
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1051, defs: f.defs, label: 'A field of isometric blocks', body: g, grid: 72, stars: 90, vignette: 0.22, bloom: 0.24 });
}

function contact() {
  const A = '#3fb8f0', B = '#667eea';
  const f = fields([[800, 400, 480, A, 0.22], [1320, 680, 360, B, 0.18]]);
  let g = f.body;
  g += waves(250, 470, 7, 80, A, { start: 44, spread: 52, sw: 3, from: 0.6 });
  g += waves(1350, 470, 7, 80, B, { start: 44, spread: 52, sw: 3, from: 0.6 });
  g += `<g transform="rotate(-6 800 430)">`;
  g += panel(620, 330, 360, 220, A, { r: 18, fill: 0.16, stroke: 0.6, sw: 2.5 });
  g += `<path d="M620 346 L800 476 L980 346" stroke="${rgba('#ffffff', 0.65)}" stroke-width="3" fill="none"/>`;
  g += `</g>`;
  g += dot(250, 470, 13, A, 0.95, true);
  g += dot(1350, 470, 13, B, 0.95, true);
  g += ridges(740, 2, A, 1061, { amp: 48, step: 74 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1063, defs: f.defs, label: 'A message travelling between two signal points', body: g, grid: 72, stars: 140, vignette: 0.2, bloom: 0.24 });
}

function privacy() {
  const A = '#8b9bd0', B = '#5b8def';
  const f = fields([[800, 400, 460, B, 0.2]]);
  let g = f.body;
  const rand = rng(1069);
  for (let i = 0; i < 70; i++) {
    const x = rand() * W, y = rand() * H;
    g += `<rect x="${r2(x)}" y="${r2(y)}" width="26" height="26" rx="6" fill="none" stroke="${rgba(A, 0.16)}" stroke-width="1.5"/>`;
  }
  g += `<path d="M800 240 L966 304 V470 C966 574 882 636 800 668 C718 636 634 574 634 470 V304 Z" `
     + `fill="${rgba(B, 0.14)}" stroke="${rgba(B, 0.6)}" stroke-width="3"/>`;
  g += `<rect x="758" y="432" width="84" height="68" rx="12" fill="${rgba(B, 0.34)}" stroke="${rgba(B, 0.8)}" stroke-width="2.5"/>`;
  g += `<path d="M774 432 v-22 a26 26 0 0 1 52 0 v22" fill="none" stroke="${rgba(B, 0.8)}" stroke-width="7"/>`;
  g += dot(800, 462, 7, '#ffffff', 0.8);
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1087, defs: f.defs, label: 'A shield over a lattice', body: g, grid: 72, stars: 80, vignette: 0.24, bloom: 0.2 });
}

function technologyHero() {
  const A = '#667eea', B = '#3fd8c4';
  const rand = rng(1091);
  const f = fields([[1240, 260, 420, B, 0.18], [400, 640, 400, A, 0.2]]);
  let g = f.body;
  for (let i = 0; i < 30; i++) {
    let x = rand() * W, y = rand() * H;
    let d = `M${r2(x)} ${r2(y)}`;
    for (let k = 0; k < 5; k++) {
      const horiz = rand() > 0.5, len = 60 + rand() * 200;
      if (horiz) x += rand() > 0.5 ? len : -len; else y += rand() > 0.5 ? len : -len;
      d += ` L${r2(x)} ${r2(y)}`;
    }
    g += `<path d="${d}" fill="none" stroke="${rgba(B, 0.24)}" stroke-width="2" stroke-linejoin="round"/>`;
    g += dot(x, y, 4.5, B, 0.55);
  }
  // Processor package with legs on all four sides.
  g += `<rect x="640" y="330" width="320" height="230" rx="18" fill="${rgba('#05060f', 0.86)}" stroke="${rgba(A, 0.6)}" stroke-width="2.5"/>`;
  for (let i = 0; i < 6; i++) {
    const x = 686 + i * 46;
    g += line(x, 306, x, 330, A, 0.6, 5);
    g += line(x, 560, x, 584, A, 0.6, 5);
  }
  for (let i = 0; i < 5; i++) {
    const y = 364 + i * 42;
    g += line(616, y, 640, y, A, 0.6, 5);
    g += line(960, y, 984, y, A, 0.6, 5);
  }
  g += `<rect x="686" y="376" width="228" height="138" rx="10" fill="none" stroke="${rgba(B, 0.4)}" stroke-width="1.5"/>`;
  g += text(800, 460, 'ABAP', { size: 42, color: '#ffffff', alpha: 0.55, anchor: 'middle', weight: 700, spacing: 7 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1093, defs: f.defs, label: 'A processor on a circuit board', body: g, grid: 72, stars: 120, vignette: 0.22, bloom: 0.22 });
}

function hobbyHero() {
  const A = '#e8a33d', B = '#e0655f';
  const rand = rng(1097);
  const f = fields([[380, 280, 400, A, 0.24], [1260, 560, 400, B, 0.22], [840, 780, 380, '#4fc98a', 0.16]]);
  let g = f.body;
  // Loose overlapping arcs - a brush-stroke feel without any imported artwork.
  for (let i = 0; i < 22; i++) {
    const cx = rand() * W, cy = 180 + rand() * 540;
    const r = 70 + rand() * 230;
    const a0 = rand() * Math.PI * 2, a1 = a0 + 1 + rand() * 2.4;
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    const c = [A, B, '#4fc98a', '#5b8def'][Math.floor(rand() * 4)];
    g += `<path d="M${r2(x0)} ${r2(y0)} A${r2(r)} ${r2(r)} 0 0 1 ${r2(x1)} ${r2(y1)}" fill="none" `
       + `stroke="${rgba(c, 0.16 + rand() * 0.24)}" stroke-width="${r2(4 + rand() * 18)}" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 32; i++) g += dot(rand() * W, 160 + rand() * 620, 3 + rand() * 8, [A, B, '#4fc98a'][i % 3], 0.4);
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1103, defs: f.defs, label: 'Overlapping colour strokes', body: g, grid: 84, stars: 60, vignette: 0.26, bloom: 0.26 });
}

function polyglotHero() {
  const A = '#5ec9e8', B = '#9b8cf2';
  const f = fields([[1200, 320, 420, B, 0.22], [400, 560, 400, A, 0.2]]);
  let g = f.body;
  const cx = 800, cy = 450, R = 245;
  g += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${rgba('#04050e', 0.5)}" stroke="${rgba(A, 0.55)}" stroke-width="2.5"/>`;
  for (let i = 1; i <= 3; i++) g += `<ellipse cx="${cx}" cy="${cy}" rx="${r2(R * (1 - i / 4))}" ry="${R}" fill="none" stroke="${rgba(A, 0.3)}" stroke-width="2"/>`;
  for (let i = -2; i <= 2; i++) {
    const yy = cy + (i / 3) * R;
    const half = Math.sqrt(Math.max(0, R * R - (yy - cy) * (yy - cy)));
    g += line(cx - half, yy, cx + half, yy, A, 0.28, 2);
  }
  const words = [[240, 250], [1300, 240], [210, 668], [1320, 658], [760, 140], [820, 800]];
  const greet = ['Hello', 'Merhaba', 'Bonjour', 'Hola', 'Ciao', 'Olá'];
  greet.forEach((t, i) => {
    const [x, y] = words[i];
    const ax = cx + (x < cx ? -1 : 1) * R * 0.86, ay = cy + (y < cy ? -1 : 1) * R * 0.4;
    g += line(x, y + 12, ax, ay, A, 0.2, 1.5, '6 8');
    g += dot(ax, ay, 5, B, 0.85, true);
    g += text(x, y, t, { size: 34, color: '#ffffff', alpha: 0.45, anchor: 'middle', weight: 600 });
  });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1109, defs: f.defs, label: 'A globe linked to greetings in several languages', body: g, grid: 84, stars: 140, vignette: 0.22, bloom: 0.24 });
}

function defaultHero() {
  const A = '#667eea', B = '#764ba2';
  const f = fields([[440, 280, 440, A, 0.26], [1200, 600, 440, B, 0.24]]);
  let g = f.body;
  g += constellation(40, A, 1117, { maxLink: 250, alpha: 0.42 });
  g += ridges(690, 2, A, 1123, { amp: 62, step: 84 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 1129, defs: f.defs, label: 'Abstract networked backdrop', body: g, grid: 72, stars: 150, vignette: 0.2, bloom: 0.24 });
}

module.exports = { home, blogHero, about, projects, contact, privacy, technologyHero, hobbyHero, polyglotHero, defaultHero };
