// Shared drawing primitives for the site's original artwork.
// Everything here is generated from code - no third-party image assets.

const OUT_W = 1200;
const OUT_H = 900;

// Deterministic PRNG so regenerating produces byte-identical files.
function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const r2 = (n) => Math.round(n * 100) / 100;

// --- colour -----------------------------------------------------------------

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// --- document ---------------------------------------------------------------

/**
 * Wrap body markup in the shared dark canvas: gradient ground, accent bloom,
 * a faint engineering grid, a sparse star field and a centre vignette that
 * keeps overlaid caption text readable.
 */
function canvas({ w = OUT_W, h = OUT_H, accent, accent2, label, seed = 7, body,
                  defs = '', grid = 60, stars = 90, vignette = 0.38, bloom = 0.56 }) {
  const rand = rng(seed);
  const ground0 = '#0d0f22';
  const ground1 = mix('#1b1e40', accent2 || accent, 0.22);

  let starField = '';
  for (let i = 0; i < stars; i++) {
    const x = r2(rand() * w);
    const y = r2(rand() * h);
    const rad = r2(0.7 + rand() * 1.8);
    const op = r2(0.08 + rand() * 0.3);
    starField += `<circle cx="${x}" cy="${y}" r="${rad}" fill="#fff" opacity="${op}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<defs>
  <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${ground0}"/>
    <stop offset="1" stop-color="${ground1}"/>
  </linearGradient>
  <radialGradient id="bloom" cx="0.5" cy="0.34" r="0.78">
    <stop offset="0" stop-color="${accent}" stop-opacity="${bloom}"/>
    <stop offset="0.55" stop-color="${accent2 || accent}" stop-opacity="${r2(bloom * 0.35)}"/>
    <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.72">
    <stop offset="0" stop-color="#000" stop-opacity="${vignette}"/>
    <stop offset="0.6" stop-color="#000" stop-opacity="${r2(vignette * 0.35)}"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="edge" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity="0.38"/>
    <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
  </linearGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="14"/>
  </filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <pattern id="mesh" width="${grid}" height="${grid}" patternUnits="userSpaceOnUse">
    <path d="M ${grid} 0 L 0 0 0 ${grid}" fill="none" stroke="${rgba(accent, 0.14)}" stroke-width="1"/>
  </pattern>
${defs}
</defs>
<rect width="${w}" height="${h}" fill="url(#ground)"/>
<rect width="${w}" height="${h}" fill="url(#mesh)"/>
<rect width="${w}" height="${h}" fill="url(#bloom)"/>
<g>${starField}</g>
${body}
<rect width="${w}" height="${h}" fill="url(#vig)"/>
<rect width="${w}" height="${h}" fill="url(#edge)"/>
</svg>
`;
}

// --- shapes -----------------------------------------------------------------

/** Rounded translucent panel, used for every "window" / "card" in the set. */
function panel(x, y, w, h, accent, { r = 18, fill = 0.07, stroke = 0.34, sw = 2 } = {}) {
  return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r}" `
    + `fill="${rgba(accent, fill)}" stroke="${rgba(accent, stroke)}" stroke-width="${sw}"/>`;
}

/** Browser/app chrome: panel plus a title bar with three dots. */
function window_(x, y, w, h, accent, { r = 16, bar = 38 } = {}) {
  let s = panel(x, y, w, h, accent, { r });
  s += `<path d="M${r2(x)} ${r2(y + bar)} h${r2(w)}" stroke="${rgba(accent, 0.3)}" stroke-width="2" fill="none"/>`;
  for (let i = 0; i < 3; i++) {
    s += `<circle cx="${r2(x + 24 + i * 20)}" cy="${r2(y + bar / 2)}" r="5" fill="${rgba(accent, 0.5)}"/>`;
  }
  return s;
}

/** Horizontal bar that stands in for a line of text or a data row. */
function bar(x, y, w, h, color, alpha = 0.5, r = null) {
  return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r === null ? r2(h / 2) : r}" fill="${rgba(color, alpha)}"/>`;
}

function dot(x, y, rad, color, alpha = 1, glow = false) {
  return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(rad)}" fill="${rgba(color, alpha)}"${glow ? ' filter="url(#glow)"' : ''}/>`;
}

function line(x1, y1, x2, y2, color, alpha = 0.5, sw = 2, dash = null) {
  return `<path d="M${r2(x1)} ${r2(y1)} L${r2(x2)} ${r2(y2)}" stroke="${rgba(color, alpha)}" stroke-width="${sw}" `
    + `fill="none" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}

/** Cubic bezier wire between two points, flowing horizontally. */
function wire(x1, y1, x2, y2, color, alpha = 0.55, sw = 2.5) {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `<path d="M${r2(x1)} ${r2(y1)} C${r2(x1 + dx)} ${r2(y1)} ${r2(x2 - dx)} ${r2(y2)} ${r2(x2)} ${r2(y2)}" `
    + `stroke="${rgba(color, alpha)}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
}

/** SVG is XML, so anything that reaches a text node has to be escaped. */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function text(x, y, str, { size = 26, color = '#ffffff', alpha = 0.85, weight = 600, anchor = 'start',
                           family = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
                           spacing = 0, mono = false } = {}) {
  const f = mono ? "'JetBrains Mono','SF Mono',Consolas,monospace" : family;
  return `<text x="${r2(x)}" y="${r2(y)}" font-family="${f}" font-size="${size}" font-weight="${weight}" `
    + `fill="${rgba(color, alpha)}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}>${esc(str)}</text>`;
}

/** Small pill label, e.g. an HTTP verb or a module code. */
function chip(x, y, label, color, { pad = 16, size = 20, h = 34 } = {}) {
  const w = label.length * size * 0.62 + pad * 2;
  return panel(x, y, w, h, color, { r: h / 2, fill: 0.18, stroke: 0.5, sw: 1.5 })
    + text(x + w / 2, y + h / 2 + size * 0.35, label, { size, color, alpha: 0.95, anchor: 'middle', weight: 700 });
}

/** Regular polygon path, used for the wireframe and hex motifs. */
function polyPath(cx, cy, rad, sides, rot = 0) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = rot + (i / sides) * Math.PI * 2;
    pts.push(`${r2(cx + Math.cos(a) * rad)},${r2(cy + Math.sin(a) * rad)}`);
  }
  return `M${pts.join(' L')} Z`;
}

function hex(cx, cy, rad, color, { fill = 0.12, stroke = 0.45, sw = 2 } = {}) {
  return `<path d="${polyPath(cx, cy, rad, 6, -Math.PI / 2)}" fill="${rgba(color, fill)}" `
    + `stroke="${rgba(color, stroke)}" stroke-width="${sw}"/>`;
}

/** Concentric arc pairs radiating from a point - the "signal" motif. */
function waves(cx, cy, count, step, color, { start = 80, spread = 60, sw = 3, from = 0.5 } = {}) {
  let s = '';
  for (let i = 1; i <= count; i++) {
    const rad = start + i * step;
    const a0 = (-spread * Math.PI) / 180;
    const a1 = (spread * Math.PI) / 180;
    const x0 = r2(cx + Math.cos(a0) * rad), y0 = r2(cy + Math.sin(a0) * rad);
    const x1 = r2(cx + Math.cos(a1) * rad), y1 = r2(cy + Math.sin(a1) * rad);
    s += `<path d="M${x0} ${y0} A${rad} ${rad} 0 0 1 ${x1} ${y1}" fill="none" `
      + `stroke="${rgba(color, from * (1 - i / (count + 1)))}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  return s;
}

module.exports = { OUT_W, OUT_H, rng, r2, mix, rgba, esc, canvas, panel, window_, bar, dot, line, wire, text, chip, polyPath, hex, waves };
