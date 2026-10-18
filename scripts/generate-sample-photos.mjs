// Generates synthetic, copyright-free sample photos for the in-app sample mode and tests.
// Usage: node scripts/generate-sample-photos.mjs
// Output: assets/samples/sample-XX.jpg (no EXIF, no real people or third-party content)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import jpeg from 'jpeg-js';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'samples');
mkdirSync(OUT, { recursive: true });

let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function canvas(w, h) {
  return { w, h, d: new Uint8Array(w * h * 4) };
}
function put(c, x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  c.d[i] = r; c.d[i + 1] = g; c.d[i + 2] = b; c.d[i + 3] = 255;
}
function vgrad(c, top, bottom) {
  for (let y = 0; y < c.h; y++) {
    const t = y / (c.h - 1);
    const col = top.map((v, k) => Math.round(v + (bottom[k] - v) * t));
    for (let x = 0; x < c.w; x++) put(c, x, y, ...col);
  }
}
function circle(c, cx, cy, rad, col) {
  for (let y = Math.floor(cy - rad); y <= cy + rad; y++)
    for (let x = Math.floor(cx - rad); x <= cx + rad; x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) put(c, x, y, ...col);
}
function rect(c, x0, y0, w, h, col) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) put(c, x, y, ...col);
}
function tri(c, x0, base, x1, peakX, peakY, col) {
  for (let y = peakY; y <= base; y++) {
    const t = (y - peakY) / (base - peakY);
    const l = Math.round(peakX + (x0 - peakX) * t);
    const r = Math.round(peakX + (x1 - peakX) * t);
    for (let x = l; x <= r; x++) put(c, x, y, ...col);
  }
}
function noise(c, amount) {
  for (let i = 0; i < c.d.length; i += 4) {
    const n = (rand() - 0.5) * amount;
    for (let k = 0; k < 3; k++) c.d[i + k] = Math.max(0, Math.min(255, c.d[i + k] + n));
  }
}
function adjust(c, mul, add) {
  for (let i = 0; i < c.d.length; i += 4) for (let k = 0; k < 3; k++) c.d[i + k] = Math.max(0, Math.min(255, c.d[i + k] * mul + add));
}
function boxBlur(c, r) {
  const src = new Uint8Array(c.d);
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++) {
      const s = [0, 0, 0];
      let n = 0;
      for (let dy = -r; dy <= r; dy += 2)
        for (let dx = -r; dx <= r; dx += 2) {
          const xx = Math.min(c.w - 1, Math.max(0, x + dx));
          const yy = Math.min(c.h - 1, Math.max(0, y + dy));
          const i = (yy * c.w + xx) * 4;
          s[0] += src[i]; s[1] += src[i + 1]; s[2] += src[i + 2]; n++;
        }
      put(c, x, y, ...s.map((v) => Math.round(v / n)));
    }
}
function shift(c, dx, dy) {
  const src = new Uint8Array(c.d);
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++) {
      const xx = Math.min(c.w - 1, Math.max(0, x - dx));
      const yy = Math.min(c.h - 1, Math.max(0, y - dy));
      const i = (yy * c.w + xx) * 4;
      put(c, x, y, src[i], src[i + 1], src[i + 2]);
    }
}
function save(c, n) {
  const buf = jpeg.encode({ width: c.w, height: c.h, data: c.d }, 88).data;
  writeFileSync(join(OUT, `sample-${String(n).padStart(2, '0')}.jpg`), buf);
}

const P = [720, 900]; // 4:5 portrait
const L = [1080, 720]; // 3:2 landscape
const S = [800, 800];

// Scene builders
function sunset([w, h]) {
  const c = canvas(w, h);
  vgrad(c, [255, 140, 90], [90, 40, 110]);
  circle(c, w * 0.5, h * 0.55, w * 0.14, [255, 220, 150]);
  rect(c, 0, Math.round(h * 0.7), w, Math.round(h * 0.3), [40, 50, 90]);
  for (let i = 0; i < 40; i++) rect(c, Math.round(rand() * w), Math.round(h * 0.7 + rand() * h * 0.3), 30, 3, [255, 190, 140]);
  noise(c, 8);
  return c;
}
function cafe([w, h], bright = 0) {
  const c = canvas(w, h);
  vgrad(c, [150, 105, 70], [110, 75, 50]);
  for (let y = 0; y < h; y += 24) rect(c, 0, y, w, 2, [125, 88, 60]);
  circle(c, w * 0.42, h * 0.5, w * 0.3, [245, 242, 235]);
  circle(c, w * 0.42, h * 0.5, w * 0.22, [210, 150, 80]);
  circle(c, w * 0.78, h * 0.25, w * 0.12, [250, 250, 250]);
  circle(c, w * 0.78, h * 0.25, w * 0.09, [120, 70, 40]);
  noise(c, 10);
  if (bright) adjust(c, 1, bright);
  return c;
}
function park([w, h], dx = 0) {
  const c = canvas(w, h);
  vgrad(c, [120, 180, 240], [200, 230, 250]);
  rect(c, 0, Math.round(h * 0.6), w, Math.round(h * 0.4), [70, 140, 60]);
  for (let i = 0; i < 6; i++) {
    const x = 80 + i * (w / 6) + dx;
    rect(c, Math.round(x), Math.round(h * 0.45), 14, Math.round(h * 0.2), [90, 60, 40]);
    circle(c, x + 7, h * 0.42, 50, [40 + i * 8, 110, 50]);
  }
  noise(c, 12);
  return c;
}

let n = 1;
save(sunset(P), n++); // 01 sunset
{ const c = sunset(P); shift(c, 6, 4); save(c, n++); } // 02 near-duplicate of 01
{ const c = sunset(P); boxBlur(c, 6); save(c, n++); } // 03 blurred 01
save(cafe(P), n++); // 04 cafe
save(cafe(P, 14), n++); // 05 near-duplicate brighter cafe
{ // 06 night neon (dark but colorful)
  const c = canvas(...P);
  vgrad(c, [10, 8, 25], [25, 10, 35]);
  for (let i = 0; i < 7; i++) rect(c, 60 + i * 90, 200 + (i % 3) * 120, 50, 260, [i % 2 ? 255 : 40, 40, i % 2 ? 180 : 255]);
  noise(c, 14);
  save(c, n++);
}
{ // 07 overexposed
  const c = sunset(P); adjust(c, 1.6, 90); save(c, n++);
}
{ // 08 city buildings landscape
  const c = canvas(...L);
  vgrad(c, [180, 190, 200], [150, 160, 170]);
  for (let i = 0; i < 9; i++) {
    const bw = 100, bh = 250 + ((i * 97) % 300), x = i * 120 + 10;
    rect(c, x, L[1] - bh, bw, bh, [90 + i * 6, 95 + i * 5, 105]);
    for (let wy = L[1] - bh + 20; wy < L[1] - 20; wy += 36) for (let wx = x + 12; wx < x + bw - 12; wx += 26) rect(c, wx, wy, 12, 18, [230, 220, 160]);
  }
  noise(c, 10);
  save(c, n++);
}
save(park(L), n++); // 09 park landscape
{ // 10 food top view
  const c = canvas(...S);
  vgrad(c, [235, 230, 222], [225, 220, 212]);
  circle(c, 400, 400, 300, [255, 255, 255]);
  const cols = [[220, 60, 50], [250, 190, 40], [70, 160, 70], [240, 120, 40], [130, 70, 160]];
  for (let i = 0; i < 70; i++) circle(c, 400 + (rand() - 0.5) * 380, 400 + (rand() - 0.5) * 380, 18 + rand() * 18, cols[i % cols.length]);
  noise(c, 8);
  save(c, n++);
}
{ // 11 calm film, low saturation beige
  const c = canvas(...P);
  vgrad(c, [205, 195, 180], [170, 160, 150]);
  rect(c, 120, 260, 480, 420, [185, 175, 165]);
  circle(c, 360, 470, 120, [160, 150, 140]);
  noise(c, 22);
  save(c, n++);
}
{ // 12 cool ocean landscape
  const c = canvas(...L);
  vgrad(c, [150, 200, 235], [20, 80, 140]);
  for (let y = 380; y < L[1]; y += 14) rect(c, 0, y, L[0], 3, [200, 230, 250]);
  noise(c, 10);
  save(c, n++);
}
{ // 13 mountains
  const c = canvas(...L);
  vgrad(c, [210, 225, 240], [240, 240, 245]);
  tri(c, 0, 720, 600, 300, 200, [90, 100, 120]);
  tri(c, 400, 720, 1080, 760, 150, [70, 80, 100]);
  tri(c, 650, 720, 870, 760, 150, [240, 240, 250]);
  rect(c, 0, 600, 1080, 120, [60, 110, 70]);
  noise(c, 8);
  save(c, n++);
}
{ // 14 grainy dark film
  const c = sunset(P); adjust(c, 0.45, -10); noise(c, 50); save(c, n++);
}
{ // 15 pink flowers square
  const c = canvas(...S);
  vgrad(c, [80, 130, 70], [50, 100, 50]);
  for (let i = 0; i < 26; i++) {
    const x = 60 + rand() * 680, y = 60 + rand() * 680;
    for (let k = 0; k < 5; k++) circle(c, x + Math.cos(k * 1.256) * 22, y + Math.sin(k * 1.256) * 22, 18, [250, 150, 190]);
    circle(c, x, y, 10, [250, 220, 90]);
  }
  noise(c, 8);
  save(c, n++);
}
{ // 16 neon blur
  const c = canvas(...P);
  vgrad(c, [20, 10, 30], [10, 10, 20]);
  for (let i = 0; i < 12; i++) circle(c, rand() * P[0], rand() * P[1], 40 + rand() * 50, [200 + rand() * 55, 60, 200 + rand() * 55]);
  boxBlur(c, 10);
  save(c, n++);
}
save(park(L, 10), n++); // 17 near-duplicate of 09
{ // 18 street poles vertical
  const c = canvas(...P);
  vgrad(c, [235, 200, 170], [200, 170, 150]);
  for (let i = 0; i < 8; i++) rect(c, 40 + i * 85, 150, 10, 750, [60, 55, 60]);
  rect(c, 0, 780, P[0], 120, [120, 115, 115]);
  noise(c, 10);
  save(c, n++);
}
console.log(`wrote ${n - 1} samples to ${OUT}`);
