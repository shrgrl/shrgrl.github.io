// Card / hero-background artwork for the project and blog sections.
// Each piece is composed from the primitives in lib.js - nothing is traced,
// imported or downloaded.

const L = require('./lib');
const { canvas, panel, window_, bar, dot, line, wire, text, chip, hex, waves, rgba, r2, rng, polyPath } = L;

const W = 1200, H = 900;

// --- small 3D helper, used by the graphics cover ----------------------------

function projector({ rotX = 0.5, rotY = 0.6, dist = 5.2, scale = 330, cx = 0, cy = 0 }) {
  const sx = Math.sin(rotX), cxr = Math.cos(rotX);
  const sy = Math.sin(rotY), cyr = Math.cos(rotY);
  return (x, y, z) => {
    let x1 = x * cyr + z * sy;
    let z1 = -x * sy + z * cyr;
    let y1 = y * cxr - z1 * sx;
    let z2 = y * sx + z1 * cxr;
    const k = dist / (dist + z2);
    return { x: cx + x1 * scale * k, y: cy + y1 * scale * k, depth: z2 };
  };
}

// =============================================================================
// Graphics and GUI  -  wireframe sphere, perspective floor, raster line
// =============================================================================

function graphics() {
  const A = '#3fd8c4', B = '#7b6cf6';
  const P = projector({ rotX: 0.42, rotY: 0.55, dist: 5.4, scale: 300, cx: 760, cy: 400 });
  let g = '';

  // Perspective floor: lines converging on a vanishing point.
  const vpX = 600, vpY = 455, horizon = 470;
  g += `<g opacity="0.5">`;
  for (let i = -14; i <= 14; i++) {
    const bx = 600 + i * 150;
    g += line(bx, H + 40, vpX, vpY, A, 0.16 + Math.max(0, 0.12 - Math.abs(i) * 0.012), 1.5);
  }
  for (let j = 1; j <= 11; j++) {
    const t = Math.pow(j / 11, 2.4);
    const y = horizon + t * (H + 40 - horizon);
    g += `<path d="M-60 ${r2(y)} H${W + 60}" stroke="${rgba(A, 0.05 + t * 0.16)}" stroke-width="1.5" fill="none"/>`;
  }
  g += `</g>`;

  // Wireframe sphere: latitude rings plus meridians, depth-faded.
  const seg = 48;
  const strokeFor = (d) => rgba(A, 0.14 + 0.4 * (1 - (d + 1) / 2));
  for (let lat = -60; lat <= 60; lat += 30) {
    const phi = (lat * Math.PI) / 180;
    let d = '', minD = 9;
    for (let i = 0; i <= seg; i++) {
      const th = (i / seg) * Math.PI * 2;
      const p = P(Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th));
      d += (i ? ' L' : 'M') + r2(p.x) + ' ' + r2(p.y);
      minD = Math.min(minD, p.depth);
    }
    g += `<path d="${d}" fill="none" stroke="${strokeFor(minD)}" stroke-width="1.8"/>`;
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const th = (lon * Math.PI) / 180;
    let d = '', minD = 9;
    for (let i = 0; i <= seg; i++) {
      const phi = -Math.PI / 2 + (i / seg) * Math.PI;
      const p = P(Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th));
      d += (i ? ' L' : 'M') + r2(p.x) + ' ' + r2(p.y);
      minD = Math.min(minD, p.depth);
    }
    g += `<path d="${d}" fill="none" stroke="${strokeFor(minD)}" stroke-width="1.8"/>`;
  }
  // Lit vertices on the front hemisphere.
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = 0; lon < 360; lon += 30) {
      const phi = (lat * Math.PI) / 180, th = (lon * Math.PI) / 180;
      const p = P(Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th));
      if (p.depth < -0.25) g += dot(p.x, p.y, 3, B, 0.75, true);
    }
  }

  // Bresenham staircase: ideal line vs. the pixels a rasteriser actually lights.
  const gx = 90, gy = 560, cell = 34, cols = 11, rows = 7;
  g += `<g>`;
  for (let c = 0; c <= cols; c++) g += line(gx + c * cell, gy, gx + c * cell, gy + rows * cell, A, 0.13, 1);
  for (let rI = 0; rI <= rows; rI++) g += line(gx, gy + rI * cell, gx + cols * cell, gy + rI * cell, A, 0.13, 1);
  let x0 = 0, y0 = rows - 1, x1 = cols - 1, y1 = 0;
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), err = dx + dy;
  let px = x0, py = y0;
  for (let n = 0; n < 60; n++) {
    g += `<rect x="${r2(gx + px * cell + 3)}" y="${r2(gy + py * cell + 3)}" width="${cell - 6}" height="${cell - 6}" `
       + `rx="4" fill="${rgba(B, 0.42)}" stroke="${rgba(B, 0.7)}" stroke-width="1.5"/>`;
    if (px === x1 && py === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; px += 1; }
    if (e2 <= dx) { err += dx; py -= 1; }
  }
  g += line(gx + cell / 2, gy + (rows - 0.5) * cell, gx + (cols - 0.5) * cell, gy + cell / 2, A, 0.9, 2.5);
  g += dot(gx + cell / 2, gy + (rows - 0.5) * cell, 5, A, 1, true);
  g += dot(gx + (cols - 0.5) * cell, gy + cell / 2, 5, A, 1, true);
  g += `</g>`;

  g += text(90, 528, 'RASTERISE', { size: 20, color: A, alpha: 0.6, weight: 700, spacing: 5 });
  g += text(90, 140, 'glBegin(GL_LINES)', { size: 24, color: A, alpha: 0.42, mono: true, weight: 500 });

  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 11, label: 'Wireframe sphere, perspective grid and a rasterised line', body: g });
}

// =============================================================================
// Web applications
// =============================================================================

function web() {
  const A = '#667eea', B = '#9d7bf0';
  let g = '';

  g += window_(160, 170, 760, 500, A);
  g += panel(200, 250, 680, 150, A, { r: 12, fill: 0.14, stroke: 0.22 });
  g += bar(232, 292, 300, 18, '#ffffff', 0.5);
  g += bar(232, 328, 200, 12, '#ffffff', 0.26);
  g += chip(232, 352, 'Explore', B);
  for (let i = 0; i < 3; i++) {
    const x = 200 + i * 230;
    g += panel(x, 432, 200, 150, A, { r: 12, fill: 0.1, stroke: 0.22 });
    g += bar(x + 22, 462, 70, 44, B, 0.3, 10);
    g += bar(x + 22, 522, 150, 11, '#ffffff', 0.34);
    g += bar(x + 22, 544, 110, 11, '#ffffff', 0.2);
  }
  g += bar(200, 614, 420, 12, '#ffffff', 0.16);

  // Phone frame breaking out of the desktop window.
  g += panel(860, 400, 230, 410, B, { r: 30, fill: 0.12, stroke: 0.45 });
  g += bar(940, 424, 70, 7, '#ffffff', 0.35);
  g += panel(884, 452, 182, 104, B, { r: 10, fill: 0.2, stroke: 0.22 });
  for (let i = 0; i < 3; i++) {
    g += panel(884, 574 + i * 62, 182, 50, B, { r: 10, fill: 0.1, stroke: 0.18 });
    g += bar(900, 592 + i * 62, 92, 10, '#ffffff', 0.32);
    g += bar(900, 610 + i * 62, 56, 8, '#ffffff', 0.18);
  }

  g += text(160, 132, '<!doctype html>', { size: 23, color: A, alpha: 0.4, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 23, label: 'Responsive web application layout', body: g });
}

// =============================================================================
// Parallel programming
// =============================================================================

function parallel() {
  const A = '#f2a65a', B = '#7b6cf6';
  const rand = rng(97);
  let g = '';
  const lanes = 6, top = 230, gap = 78, x0 = 250, x1 = 1010;

  g += dot(150, top + ((lanes - 1) * gap) / 2, 16, A, 0.95, true);
  g += text(150, top + ((lanes - 1) * gap) / 2 + 60, 'fork', { size: 20, color: A, alpha: 0.65, anchor: 'middle', weight: 600 });
  g += dot(1090, top + ((lanes - 1) * gap) / 2, 16, A, 0.95, true);
  g += text(1090, top + ((lanes - 1) * gap) / 2 + 60, 'join', { size: 20, color: A, alpha: 0.65, anchor: 'middle', weight: 600 });

  for (let i = 0; i < lanes; i++) {
    const y = top + i * gap;
    g += wire(166, top + ((lanes - 1) * gap) / 2, x0 - 10, y, A, 0.3, 2);
    g += wire(x1 + 10, y, 1074, top + ((lanes - 1) * gap) / 2, A, 0.3, 2);
    g += `<path d="M${x0} ${r2(y)} H${x1}" stroke="${rgba(A, 0.16)}" stroke-width="2" fill="none" stroke-dasharray="6 8"/>`;
    g += text(x0 - 30, y + 7, 't' + i, { size: 19, color: A, alpha: 0.55, anchor: 'end', mono: true, weight: 600 });

    // Work blocks: staggered so the lanes read as genuinely concurrent.
    let cx = x0 + 10 + rand() * 60;
    while (cx < x1 - 60) {
      const w = 60 + rand() * 140;
      if (cx + w > x1 - 10) break;
      const hot = rand() > 0.62;
      g += `<rect x="${r2(cx)}" y="${r2(y - 17)}" width="${r2(w)}" height="34" rx="8" `
         + `fill="${rgba(hot ? B : A, hot ? 0.42 : 0.3)}" stroke="${rgba(hot ? B : A, 0.7)}" stroke-width="1.5"/>`;
      cx += w + 22 + rand() * 70;
    }
  }

  g += text(250, 180, 'THREADS', { size: 21, color: A, alpha: 0.6, weight: 700, spacing: 6 });
  g += text(1010, 180, '#pragma omp parallel', { size: 20, color: B, alpha: 0.5, anchor: 'end', mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 41, label: 'Concurrent thread timeline with fork and join', body: g });
}

// =============================================================================
// RFID / IoT
// =============================================================================

function iot() {
  const A = '#43d6a0', B = '#4aa8e0';
  let g = '';

  // Reader
  g += panel(130, 250, 250, 400, A, { r: 22, fill: 0.1, stroke: 0.42 });
  g += panel(165, 300, 180, 120, A, { r: 10, fill: 0.2, stroke: 0.2 });
  g += bar(188, 332, 134, 12, '#ffffff', 0.45);
  g += bar(188, 358, 96, 10, '#ffffff', 0.25);
  for (let i = 0; i < 3; i++) g += dot(200 + i * 42, 470, 11, A, 0.3 + i * 0.2);
  g += bar(165, 530, 180, 10, A, 0.3);
  g += bar(165, 556, 130, 10, A, 0.2);
  g += text(255, 690, 'READER', { size: 20, color: A, alpha: 0.6, anchor: 'middle', weight: 700, spacing: 4 });

  // Signal
  g += waves(385, 450, 6, 48, A, { start: 20, spread: 42, sw: 3.5, from: 0.7 });

  // Tag with antenna coil
  g += panel(760, 330, 330, 230, B, { r: 18, fill: 0.1, stroke: 0.45 });
  for (let i = 0; i < 5; i++) {
    const inset = 26 + i * 17;
    g += `<rect x="${r2(760 + inset)}" y="${r2(330 + inset)}" width="${r2(330 - inset * 2)}" height="${r2(230 - inset * 2)}" `
       + `rx="${r2(14 - i)}" fill="none" stroke="${rgba(B, 0.5 - i * 0.06)}" stroke-width="2.5"/>`;
  }
  g += `<rect x="900" y="416" width="50" height="58" rx="7" fill="${rgba(B, 0.5)}" stroke="${rgba(B, 0.85)}" stroke-width="2"/>`;
  g += text(925, 620, 'TAG', { size: 20, color: B, alpha: 0.65, anchor: 'middle', weight: 700, spacing: 4 });

  g += chip(760, 232, 'UID 04 A2 3F', B);
  g += text(130, 196, '13.56 MHz', { size: 22, color: A, alpha: 0.45, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 59, label: 'RFID reader and tag exchanging a signal', body: g });
}

// =============================================================================
// REST API
// =============================================================================

function restapi() {
  const A = '#3fb8f0', B = '#7b6cf6';
  let g = '';

  g += window_(110, 280, 360, 340, A);
  g += bar(145, 360, 230, 13, '#ffffff', 0.4);
  g += bar(145, 390, 170, 11, '#ffffff', 0.22);
  g += panel(145, 424, 290, 160, A, { r: 10, fill: 0.12, stroke: 0.2 });
  g += text(166, 460, '{', { size: 24, color: A, alpha: 0.6, mono: true });
  g += bar(190, 478, 150, 10, '#ffffff', 0.3);
  g += bar(190, 500, 110, 10, '#ffffff', 0.22);
  g += bar(190, 522, 134, 10, '#ffffff', 0.3);
  g += text(166, 566, '}', { size: 24, color: A, alpha: 0.6, mono: true });
  g += text(290, 660, 'CLIENT', { size: 20, color: A, alpha: 0.6, anchor: 'middle', weight: 700, spacing: 4 });

  // Server stack
  for (let i = 0; i < 3; i++) {
    const y = 330 + i * 92;
    g += panel(760, y, 320, 74, B, { r: 12, fill: 0.14, stroke: 0.42 });
    g += dot(794, y + 37, 8, B, 0.8);
    g += bar(820, y + 26, 170, 11, '#ffffff', 0.34);
    g += bar(820, y + 47, 110, 9, '#ffffff', 0.2);
  }
  g += text(920, 660, 'SERVER', { size: 20, color: B, alpha: 0.6, anchor: 'middle', weight: 700, spacing: 4 });

  // Request / response
  g += `<path d="M480 392 C600 352 640 352 748 368" stroke="${rgba(A, 0.75)}" stroke-width="3" fill="none"/>`;
  g += `<path d="M748 368 l-18 -9 l2 17 Z" fill="${rgba(A, 0.9)}"/>`;
  g += `<path d="M748 520 C640 544 600 544 480 512" stroke="${rgba(B, 0.75)}" stroke-width="3" fill="none" stroke-dasharray="9 7"/>`;
  g += `<path d="M480 512 l19 -7 l-4 17 Z" fill="${rgba(B, 0.9)}"/>`;

  g += chip(506, 300, 'GET', A);
  g += chip(606, 300, 'POST', A);
  g += chip(506, 556, '200 OK', B);
  g += text(110, 206, '/api/v1/items', { size: 26, color: A, alpha: 0.45, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 73, label: 'REST client and server exchanging a request and response', body: g });
}

// =============================================================================
// ABAP
// =============================================================================

function abap() {
  const A = '#5b8def', B = '#43d6a0';
  const rand = rng(131);
  let g = '';

  g += window_(120, 200, 700, 540, A);
  g += line(190, 240, 190, 718, A, 0.22, 1.5);
  const kw = ['#7fa6ff', '#43d6a0', '#f2a65a', '#c8a6ff'];
  for (let i = 0; i < 14; i++) {
    const y = 288 + i * 31;
    g += text(172, y + 5, String(i + 1), { size: 15, color: A, alpha: 0.35, anchor: 'end', mono: true, weight: 500 });
    const indent = i > 2 && i < 11 ? 28 : 0;
    let x = 212 + indent;
    const tokens = 2 + Math.floor(rand() * 3);
    for (let t = 0; t < tokens; t++) {
      const w = 40 + rand() * 130;
      if (x + w > 790) break;
      g += bar(x, y - 6, w, 12, t === 0 ? kw[Math.floor(rand() * kw.length)] : '#ffffff', t === 0 ? 0.65 : 0.22);
      x += w + 16;
    }
  }

  // Data dictionary table
  g += panel(690, 500, 400, 250, B, { r: 14, fill: 0.1, stroke: 0.42 });
  g += `<rect x="690" y="500" width="400" height="48" rx="14" fill="${rgba(B, 0.26)}"/>`;
  g += `<path d="M690 548 h400" stroke="${rgba(B, 0.45)}" stroke-width="2" fill="none"/>`;
  for (let c = 1; c < 3; c++) g += line(690 + c * 133, 500, 690 + c * 133, 750, B, 0.22, 1.5);
  for (let rI = 1; rI < 5; rI++) g += line(690, 548 + rI * 40, 1090, 548 + rI * 40, B, 0.18, 1.5);
  for (let c = 0; c < 3; c++) g += bar(712 + c * 133, 518, 78, 11, '#ffffff', 0.5);
  for (let rI = 0; rI < 5; rI++)
    for (let c = 0; c < 3; c++) g += bar(712 + c * 133, 568 + rI * 40, 50 + rand() * 48, 9, '#ffffff', 0.2);

  g += text(120, 160, 'REPORT z_demo.', { size: 25, color: A, alpha: 0.45, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 101, label: 'ABAP editor beside a data dictionary table', body: g });
}

// =============================================================================
// SAP modules
// =============================================================================

function sapModules() {
  const A = '#4aa3ff', B = '#7b6cf6';
  const mods = ['SD', 'MM', 'FI', 'CO', 'PP', 'HR'];
  const cx = 600, cy = 440, R = 230;
  let g = '';

  mods.forEach((m, i) => {
    const a = -Math.PI / 2 + (i / mods.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    g += line(cx, cy, x, y, A, 0.3, 2);
    // satellite leaves
    for (let k = -1; k <= 1; k += 2) {
      const a2 = a + k * 0.34;
      g += line(x, y, cx + Math.cos(a2) * (R + 150), cy + Math.sin(a2) * (R + 150), A, 0.15, 1.5);
      g += dot(cx + Math.cos(a2) * (R + 150), cy + Math.sin(a2) * (R + 150), 7, B, 0.5);
    }
  });
  mods.forEach((m, i) => {
    const a = -Math.PI / 2 + (i / mods.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    g += hex(x, y, 66, A, { fill: 0.16, stroke: 0.6, sw: 2.5 });
    g += text(x, y + 11, m, { size: 30, color: '#ffffff', alpha: 0.9, anchor: 'middle', weight: 700, spacing: 1 });
  });
  g += `<path d="${polyPath(cx, cy, 108, 6, -Math.PI / 2)}" fill="${rgba(B, 0.22)}" stroke="${rgba(B, 0.75)}" stroke-width="3"/>`;
  g += text(cx, cy + 12, 'ERP', { size: 36, color: '#ffffff', alpha: 0.95, anchor: 'middle', weight: 700, spacing: 2 });
  g += text(120, 150, 'INTEGRATED MODULES', { size: 21, color: A, alpha: 0.45, weight: 700, spacing: 6 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 149, label: 'Linked enterprise resource planning modules', body: g, vignette: 0.3 });
}

// =============================================================================
// Fiori tiles
// =============================================================================

function fiori() {
  const A = '#2fb6c4', B = '#5b8def';
  const rand = rng(167);
  let g = '';

  g += panel(120, 190, 960, 560, A, { r: 26, fill: 0.07, stroke: 0.4 });
  g += `<path d="M120 258 h960" stroke="${rgba(A, 0.3)}" stroke-width="2" fill="none"/>`;
  g += bar(160, 216, 150, 14, '#ffffff', 0.45);
  for (let i = 0; i < 3; i++) g += dot(990 + i * 32, 224, 8, A, 0.45);

  const cols = 4, rows = 2, tw = 210, th = 190, gx = 160, gy = 300, gap = 22;
  let n = 0;
  for (let rI = 0; rI < rows; rI++) {
    for (let c = 0; c < cols; c++) {
      const x = gx + c * (tw + gap), y = gy + rI * (th + gap);
      const kind = n % 4;
      g += panel(x, y, tw, th, B, { r: 14, fill: 0.12, stroke: 0.3 });
      g += bar(x + 18, y + 22, 110, 11, '#ffffff', 0.42);
      g += bar(x + 18, y + 42, 72, 9, '#ffffff', 0.2);
      if (kind === 0) {
        g += text(x + 18, y + 128, '1 762', { size: 42, color: '#ffffff', alpha: 0.9, weight: 700 });
        g += bar(x + 18, y + 150, 150, 8, A, 0.55);
      } else if (kind === 1) {
        for (let b = 0; b < 6; b++) {
          const bh = 24 + rand() * 76;
          g += `<rect x="${r2(x + 20 + b * 30)}" y="${r2(y + 154 - bh)}" width="20" height="${r2(bh)}" rx="4" fill="${rgba(A, 0.3 + b * 0.09)}"/>`;
        }
      } else if (kind === 2) {
        let d = '';
        for (let p = 0; p <= 8; p++) d += (p ? ' L' : 'M') + r2(x + 20 + p * 21) + ' ' + r2(y + 150 - rand() * 74);
        g += `<path d="${d}" fill="none" stroke="${rgba(A, 0.85)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else {
        const pct = 0.3 + rand() * 0.55;
        g += `<circle cx="${r2(x + tw / 2)}" cy="${r2(y + 118)}" r="42" fill="none" stroke="${rgba(B, 0.25)}" stroke-width="10"/>`;
        g += `<circle cx="${r2(x + tw / 2)}" cy="${r2(y + 118)}" r="42" fill="none" stroke="${rgba(A, 0.9)}" stroke-width="10" `
           + `stroke-linecap="round" stroke-dasharray="${r2(264 * pct)} 264" transform="rotate(-90 ${r2(x + tw / 2)} ${r2(y + 118)})"/>`;
      }
      n++;
    }
  }
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 181, label: 'Launchpad of analytical application tiles', body: g });
}

// =============================================================================
// OData
// =============================================================================

function odata() {
  const A = '#f2913c', B = '#4aa3ff';
  let g = '';
  const ent = [
    { x: 130, y: 300, w: 270, t: 'Product' },
    { x: 470, y: 480, w: 270, t: 'Order' },
    { x: 810, y: 290, w: 270, t: 'Customer' },
  ];
  g += `<path d="M400 360 C440 360 450 530 470 530" stroke="${rgba(A, 0.5)}" stroke-width="2.5" fill="none"/>`;
  g += `<path d="M740 530 C790 530 790 360 810 352" stroke="${rgba(A, 0.5)}" stroke-width="2.5" fill="none"/>`;
  ent.forEach((e) => {
    g += panel(e.x, e.y, e.w, 210, A, { r: 14, fill: 0.1, stroke: 0.45 });
    g += `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="46" rx="14" fill="${rgba(A, 0.26)}"/>`;
    g += text(e.x + 20, e.y + 31, e.t, { size: 23, color: '#ffffff', alpha: 0.92, weight: 700 });
    for (let i = 0; i < 4; i++) {
      g += dot(e.x + 26, e.y + 76 + i * 33, 4.5, i === 0 ? B : A, i === 0 ? 0.95 : 0.5);
      g += bar(e.x + 42, e.y + 70 + i * 33, 110 + (i % 2) * 44, 10, '#ffffff', i === 0 ? 0.42 : 0.24);
    }
  });
  ['GET', 'POST', 'PATCH', 'DELETE'].forEach((v, i) => { g += chip(130 + i * 128, 180, v, B); });
  g += text(130, 760, "$filter=Price gt 100&$top=20", { size: 24, color: A, alpha: 0.5, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 197, label: 'Entity model with CRUD operations and a query option', body: g, vignette: 0.34 });
}

// =============================================================================
// RFC / web service
// =============================================================================

function rfc() {
  const A = '#8b7bf0', B = '#3fb8f0';
  let g = '';
  const box = (x, label, color) => {
    let s = panel(x, 320, 280, 280, color, { r: 20, fill: 0.11, stroke: 0.45 });
    s += panel(x + 30, 364, 220, 110, color, { r: 10, fill: 0.18, stroke: 0.18 });
    for (let i = 0; i < 3; i++) s += bar(x + 52, 392 + i * 26, 130 - i * 30, 10, '#ffffff', 0.34 - i * 0.07);
    for (let i = 0; i < 3; i++) s += bar(x + 30, 506 + i * 28, 220, 11, color, 0.3 - i * 0.07);
    s += text(x + 140, 642, label, { size: 20, color, alpha: 0.65, anchor: 'middle', weight: 700, spacing: 4 });
    return s;
  };
  g += box(100, 'SAP SYSTEM', A);
  g += box(820, 'EXTERNAL', B);

  g += `<path d="M390 420 H800" stroke="${rgba(A, 0.3)}" stroke-width="2.5" fill="none" stroke-dasharray="10 9"/>`;
  g += `<path d="M800 500 H390" stroke="${rgba(B, 0.3)}" stroke-width="2.5" fill="none" stroke-dasharray="10 9"/>`;
  g += `<path d="M800 420 l-20 -10 l3 19 Z" fill="${rgba(A, 0.8)}"/>`;
  g += `<path d="M390 500 l21 -9 l-4 19 Z" fill="${rgba(B, 0.8)}"/>`;

  // Envelope in transit
  g += panel(520, 384, 160, 104, A, { r: 10, fill: 0.3, stroke: 0.8, sw: 2.5 });
  g += `<path d="M520 392 L600 446 L680 392" stroke="${rgba('#ffffff', 0.75)}" stroke-width="2.5" fill="none"/>`;
  g += chip(498, 540, '<soap:Envelope>', A, { size: 18 });
  g += text(100, 246, 'SOAP / RFC', { size: 24, color: A, alpha: 0.45, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 211, label: 'Two systems exchanging a SOAP envelope', body: g });
}

// =============================================================================
// GitHub Pages
// =============================================================================

function ghpages() {
  const A = '#9b8cf2', B = '#43d6a0';
  let g = '';
  const baseY = 420, x0 = 110, step = 108;

  g += `<path d="M${x0} ${baseY} H${x0 + step * 6}" stroke="${rgba(A, 0.45)}" stroke-width="3" fill="none"/>`;
  g += `<path d="M${x0 + step} ${baseY} C${x0 + step * 1.6} ${baseY} ${x0 + step * 1.6} ${baseY - 120} ${x0 + step * 2.2} ${baseY - 120} `
     + `H${x0 + step * 3.8} C${x0 + step * 4.4} ${baseY - 120} ${x0 + step * 4.4} ${baseY} ${x0 + step * 5} ${baseY}" `
     + `stroke="${rgba(B, 0.55)}" stroke-width="3" fill="none"/>`;
  for (let i = 0; i <= 6; i++) g += dot(x0 + i * step, baseY, i === 6 ? 15 : 11, A, 0.95, i === 6);
  for (let i = 0; i < 3; i++) g += dot(x0 + step * 2.2 + i * step * 0.8, baseY - 120, 10, B, 0.9);
  g += text(x0, baseY + 56, 'main', { size: 21, color: A, alpha: 0.6, mono: true, weight: 600 });
  g += text(x0 + step * 2.2, baseY - 152, 'gh-pages', { size: 21, color: B, alpha: 0.65, mono: true, weight: 600 });

  // Published site
  g += window_(730, 210, 370, 290, B, { r: 14 });
  g += panel(762, 282, 306, 70, B, { r: 10, fill: 0.16, stroke: 0.2 });
  g += bar(782, 304, 160, 13, '#ffffff', 0.45);
  g += bar(782, 326, 110, 10, '#ffffff', 0.24);
  for (let i = 0; i < 3; i++) {
    g += panel(762 + i * 104, 372, 92, 96, B, { r: 10, fill: 0.1, stroke: 0.18 });
    g += bar(776 + i * 104, 392, 58, 9, '#ffffff', 0.3);
    g += bar(776 + i * 104, 410, 40, 8, '#ffffff', 0.18);
  }
  g += `<path d="M700 500 C740 560 760 580 830 596" stroke="${rgba(B, 0.4)}" stroke-width="2.5" fill="none" stroke-dasharray="8 8"/>`;
  g += chip(730, 596, 'username.github.io', B, { size: 19 });
  g += text(110, 226, 'git push origin', { size: 24, color: A, alpha: 0.45, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 223, label: 'Commit graph deploying to a published site', body: g, vignette: 0.34 });
}

// =============================================================================
// Node-RED style flow
// =============================================================================

function nodered() {
  const A = '#e0655f', B = '#f2a65a';
  let g = '';
  const node = (x, y, w, label, color, { inPort = true, outPort = true } = {}) => {
    let s = panel(x, y, w, 64, color, { r: 10, fill: 0.2, stroke: 0.6, sw: 2 });
    s += `<rect x="${r2(x)}" y="${r2(y)}" width="12" height="64" rx="6" fill="${rgba(color, 0.55)}"/>`;
    s += text(x + 26, y + 40, label, { size: 20, color: '#ffffff', alpha: 0.9, weight: 600 });
    if (inPort) s += `<rect x="${r2(x - 7)}" y="${r2(y + 24)}" width="14" height="16" rx="4" fill="${rgba(color, 0.9)}"/>`;
    if (outPort) s += `<rect x="${r2(x + w - 7)}" y="${r2(y + 24)}" width="14" height="16" rx="4" fill="${rgba(color, 0.9)}"/>`;
    return s;
  };

  const flows = [
    { x: 110, y: 250, w: 190, l: 'inject', c: A, inPort: false },
    { x: 410, y: 250, w: 220, l: 'function', c: B },
    { x: 410, y: 450, w: 220, l: 'switch', c: B },
    { x: 740, y: 190, w: 200, l: 'http req', c: A },
    { x: 740, y: 370, w: 200, l: 'debug', c: A, outPort: false },
    { x: 740, y: 550, w: 200, l: 'mqtt out', c: A, outPort: false },
    { x: 110, y: 450, w: 190, l: 'mqtt in', c: A, inPort: false },
  ];
  g += wire(300, 282, 410, 282, A, 0.6);
  g += wire(300, 482, 410, 482, A, 0.6);
  g += wire(630, 282, 740, 222, B, 0.6);
  g += wire(630, 282, 740, 402, B, 0.6);
  g += wire(630, 482, 740, 582, B, 0.6);
  g += wire(630, 482, 740, 402, B, 0.4);
  flows.forEach((f) => { g += node(f.x, f.y, f.w, f.l, f.c, { inPort: f.inPort !== false, outPort: f.outPort !== false }); });
  g += text(110, 196, 'FLOW', { size: 21, color: A, alpha: 0.55, weight: 700, spacing: 6 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 239, label: 'Wired flow of message nodes', body: g, vignette: 0.36 });
}

// =============================================================================
// Selenium / browser automation
// =============================================================================

function selenium() {
  const A = '#4fc98a', B = '#5b8def';
  let g = '';

  g += window_(110, 220, 640, 490, B);
  g += panel(150, 300, 560, 54, B, { r: 10, fill: 0.14, stroke: 0.2 });
  g += bar(174, 320, 230, 13, '#ffffff', 0.38);
  for (let i = 0; i < 3; i++) {
    g += panel(150, 380 + i * 82, 560, 62, B, { r: 10, fill: 0.09, stroke: 0.18 });
    g += bar(174, 400 + i * 82, 130, 11, '#ffffff', 0.32);
    g += bar(174, 420 + i * 82, 300, 9, '#ffffff', 0.18);
  }
  g += panel(150, 626, 190, 54, A, { r: 10, fill: 0.3, stroke: 0.7 });
  g += text(245, 660, 'Submit', { size: 21, color: '#ffffff', alpha: 0.95, anchor: 'middle', weight: 600 });
  // automation cursor
  g += `<path d="M318 648 l0 46 l12 -13 l9 19 l11 -6 l-9 -18 l17 -2 Z" fill="#ffffff" opacity="0.95" stroke="${rgba(B, 0.8)}" stroke-width="2"/>`;
  g += waves(318, 648, 3, 22, A, { start: 10, spread: 180, sw: 2.5, from: 0.55 });

  // Test report
  g += panel(800, 260, 300, 410, A, { r: 16, fill: 0.09, stroke: 0.42 });
  g += text(824, 308, 'TEST RUN', { size: 20, color: A, alpha: 0.7, weight: 700, spacing: 4 });
  g += `<path d="M800 332 h300" stroke="${rgba(A, 0.3)}" stroke-width="2" fill="none"/>`;
  const results = [1, 1, 1, 0, 1, 1];
  results.forEach((ok, i) => {
    const y = 364 + i * 48;
    if (ok) g += `<path d="M${828} ${y + 4} l10 11 l18 -22" stroke="${rgba(A, 0.95)}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    else g += `<path d="M828 ${y - 6} l24 24 M852 ${y - 6} l-24 24" stroke="${rgba('#e0655f', 0.95)}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    g += bar(876, y - 4, 150 - (i % 3) * 26, 11, '#ffffff', ok ? 0.3 : 0.45);
  });
  g += bar(824, 640, 252, 8, A, 0.2, 4);
  g += bar(824, 640, 210, 8, A, 0.9, 4);
  g += text(110, 180, 'driver.find_element(...)', { size: 23, color: B, alpha: 0.42, mono: true, weight: 500 });
  return canvas({ w: W, h: H, accent: A, accent2: B, seed: 251, label: 'Automated browser run with a passing test report', body: g });
}

module.exports = { graphics, web, parallel, iot, restapi, abap, sapModules, fiori, odata, rfc, ghpages, nodered, selenium, W, H };
