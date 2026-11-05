// UI helpers: icons, stick-figure demo animations, SVG charts, storage.
import { POSES } from './data.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const IC = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  drop: '<path d="M12 2.7s6 6.2 6 10.6a6 6 0 0 1-12 0C6 8.9 12 2.7 12 2.7z"/>',
  dumbbell: '<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',
  steps: '<path d="M3 18h5v-4h5v-4h5V6h3"/>',
  leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-15 14zM5 19l8-8"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M6.5 17v4H20"/>',
  phoneoff: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M3 3l18 18"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  star: '<path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  coffee: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M7 2v3M11 2v3"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M18 6L6 18M6 6l12 12"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  prev: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  habits: '<path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
  progress: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  flame: '<path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  camera: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="4"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
};
export const HABIT_ICONS = ['sun', 'drop', 'dumbbell', 'steps', 'leaf', 'book', 'phoneoff', 'moon', 'heart', 'star', 'bolt', 'coffee'];
export const icon = (n, size = 22, cls = '') => `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.star}</svg>`;

// ---------- exercise demo (looping SVG animation between two poses)
const PROPS = {
  wall: '<line x1="156" y1="6" x2="156" y2="100"/>', wallL: '<line x1="56" y1="6" x2="56" y2="100"/>',
  bar: '<line x1="56" y1="12" x2="144" y2="12" stroke-width="4"/>', chair: '<rect x="62" y="68" width="26" height="32" rx="3"/>',
  boxR: '<rect x="146" y="72" width="30" height="28" rx="3"/>', boxL: '<rect x="14" y="70" width="28" height="30" rx="3"/>',
  table: '<line x1="100" y1="66" x2="170" y2="66" stroke-width="4"/><line x1="170" y1="66" x2="170" y2="100"/>',
};
const FB = { K2: 'K', F2: 'F', E2: 'E', W2: 'W' };
// Which body segments to highlight for each muscle group (green = working, grey = assisting).
const HL = { chest: ['SP'], back: ['SP'], core: ['SP'], glutes: ['SP', 'PK'], shoulders: ['SE'], arms: ['SE', 'EW'], legs: ['PK', 'KF'] };
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
// Draws the figure. frame = 0|1 → static start/end pose; otherwise animated loop between the two poses.
export function figure(ex, { size = 'lg', frame = null, arrow = frame !== 1 } = {}) {
  const [pa, pb] = (ex.poses || ['stand', 'stand']).map(n => POSES[n] || POSES.stand);
  const still = frame !== null, hold = ex.poses && ex.poses[0] === ex.poses[1];
  const a = still && frame === 1 ? pb : pa, b = still ? a : pb;
  const get = (p, j) => p[j] || (FB[j] && p[FB[j]]) || p[j.replace('2', '')];
  const anim = (attr, va, vb) => still || va === vb ? '' : `<animate attributeName="${attr}" values="${va};${vb};${va}" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="${hold ? 3 : 2.4}s" repeatCount="indefinite"/>`;
  const hl = new Set((ex.groups || []).flatMap(g => HL[g] || []));
  const seg = (j1, j2, w, key, far = false) => {
    const p1a = get(a, j1), p2a = get(a, j2), p1b = get(b, j1), p2b = get(b, j2);
    const cls = `limb w${w} ${far ? 'far' : hl.size && !hl.has(key) ? 'calm' : ''}`;
    return `<line class="${cls}" x1="${p1a[0]}" y1="${p1a[1]}" x2="${p2a[0]}" y2="${p2a[1]}">${anim('x1', p1a[0], p1b[0])}${anim('y1', p1a[1], p1b[1])}${anim('x2', p2a[0], p2b[0])}${anim('y2', p2a[1], p2b[1])}</line>`;
  };
  const dot = (j, r, cls = 'joint') => { const q = get(a, j), q2 = get(b, j); return `<circle class="${cls}" r="${r}" cx="${q[0]}" cy="${q[1]}">${anim('cx', q[0], q2[0])}${anim('cy', q[1], q2[1])}</circle>`; };
  const two = ['K2', 'F2', 'E2', 'W2'].some(j => pa[j] || pb[j]);
  // facing direction, used to draw feet
  const up = Math.abs(a.S[0] - a.P[0]) < 22, face = up ? (Math.sign(a.K[0] - a.P[0]) || 1) : 0;
  const foot = (j, far) => { if (j === 'F' && a.FT) { const q = a.FT, q2 = b.FT, f = a.F, f2 = b.F; return `<line class="limb w4 calm" x1="${f[0]}" y1="${f[1]}" x2="${q[0]}" y2="${q[1]}">${anim('x1', f[0], f2[0])}${anim('y1', f[1], f2[1])}${anim('x2', q[0], q2[0])}${anim('y2', q[1], q2[1])}</line>`; } if (!face || get(a, j)[1] < 88) return ''; const q = get(a, j), q2 = get(b, j); const x = d => d + face * 9; return `<line class="limb w4 ${far ? 'far' : 'calm'}" x1="${q[0]}" y1="${q[1]}" x2="${x(q[0])}" y2="${q[1]}">${anim('x1', q[0], q2[0])}${anim('y1', q[1], q2[1])}${anim('x2', x(q[0]), x(q2[0]))}${anim('y2', q[1], q2[1])}</line>`; };
  // zoom the view box to the pose so small figures fill the frame (exercises with props keep the fixed frame)
  let vb = [0, 0, 200, 110];
  if (!ex.props) {
    const pts = [...Object.values(pa), ...Object.values(pb)].filter(Array.isArray);
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const h = Math.max(y1 - y0 + 30, (x1 - x0 + 40) / 1.82, 60), w = Math.max(x1 - x0 + 40, h * 1.25);
    vb = [+((x0 + x1) / 2 - w / 2).toFixed(1), +(Math.max(y1 + 6, 8) - h + 0).toFixed(1), +w.toFixed(1), +h.toFixed(1)];
  }
  const gy = 101 - (ex.props ? 0 : 0);
  let s = `<svg class="fig ${size}" viewBox="${vb.join(' ')}" role="img" aria-label="${esc(ex.name)} demonstration"><g class="props">${ex.propSvg || PROPS[ex.props] || ''}</g><line class="ground" x1="${vb[0] + 4}" y1="${gy}" x2="${vb[0] + vb[2] - 4}" y2="${gy}"/>`;
  if (two) s += seg('P', 'K2', 8, 'PK', true) + seg('K2', 'F2', 6, 'KF', true) + foot('F2', true) + seg('S', 'E2', 5, 'SE', true) + seg('E2', 'W2', 4, 'EW', true);
  s += seg('P', 'K', 9, 'PK') + seg('K', 'F', 7, 'KF') + foot('F');
  s += a.M ? seg('S', 'M', 13, 'SP') + seg('M', 'P', 13, 'SP') : seg('S', 'P', 13, 'SP');
  s += seg('S', 'E', 6, 'SE') + seg('E', 'W', 5, 'EW');
  s += dot('K', 3.6) + dot('E', 3.2);
  if (ex.load || ex.props === 'db') { s += dot('W', 6.2, 'dbell'); if (two && (pa.W2 || pb.W2)) s += dot('W2', 5.4, 'dbell far'); }
  else s += dot('W', 3, 'hand');
  s += `<circle class="head" r="8.5" cx="${a.H[0]}" cy="${a.H[1]}">${anim('cx', a.H[0], b.H[0])}${anim('cy', a.H[1], b.H[1])}</circle>`;
  // movement arrow: the joint that travels the furthest between the two poses
  if (arrow && !hold || (arrow && pa !== pb)) {
    const best = ex.arrowJ ? [ex.arrowJ, dist(get(pa, ex.arrowJ), get(pb, ex.arrowJ))] : ['W', 'H', 'F', 'K', 'P'].map(j => [j, dist(get(pa, j), get(pb, j))]).sort((x, y) => y[1] - x[1])[0];
    if (best && best[1] > 9) {
      const [x1, y1] = get(pa, best[0]), [x2, y2] = get(pb, best[0]), L = best[1], ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy * 14, ny = ux * 14;
      const sx = x1 + ux * 8 + nx, sy = y1 + uy * 8 + ny, ex2 = x2 - ux * 8 + nx, ey = y2 - uy * 8 + ny;
      const hx = ex2 + ux * 1, hy = ey + uy * 1;
      s += `<g class="arrow"><line x1="${sx}" y1="${sy}" x2="${ex2}" y2="${ey}"/><polygon points="${hx + ux * 6},${hy + uy * 6} ${hx - uy * 4},${hy + ux * 4} ${hx + uy * 4},${hy - ux * 4}"/></g>`;
    }
  }
  return s + '</svg>';
}

// ---------- charts
const fmtShort = d => { const [, m, dd] = d.split('-'); return `${+dd}/${+m}`; };
export function lineChart(points, { unit = '', h = 150, color = 'var(--accent)', invert = false } = {}) {
  if (!points.length) return '<div class="empty-chart">No data yet</div>';
  const W = 320, H = h, pl = 34, pr = 10, pt = 14, pb = 22;
  const ys = points.map(p => p.v);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min -= 1; max += 1; }
  const padY = (max - min) * 0.15; min -= padY; max += padY;
  const x = i => pl + (points.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (points.length - 1));
  const y = v => pt + (H - pt - pb) * (1 - (v - min) / (max - min));
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${path} L${x(points.length - 1).toFixed(1)},${H - pb} L${x(0).toFixed(1)},${H - pb} Z`;
  const gid = 'g' + Math.random().toString(36).slice(2, 7);
  const ticks = [min + padY, (min + max) / 2, max - padY].map(v => `<text class="ax" x="${pl - 6}" y="${y(v) + 3}" text-anchor="end">${(+v.toFixed(1))}</text><line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/>`).join('');
  const dots = points.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.v)}" r="${i === points.length - 1 ? 4.5 : 3}"><title>${p.date || ''}: ${p.v}${unit}</title></circle>`).join('');
  const lab = [0, points.length - 1].filter((v, i, a) => a.indexOf(v) === i).map(i => `<text class="ax" x="${x(i)}" y="${H - 5}" text-anchor="${i === 0 && points.length > 1 ? 'start' : 'end'}">${points[i].date ? fmtShort(points[i].date) : ''}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".32"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${ticks}<path d="${area}" fill="url(#${gid})"/><path class="line-path" d="${path}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>${dots}${lab}</svg>`;
}
export function barChart(items, { h = 120, max = null, unit = '', every = 1 } = {}) {
  const W = 320, H = h, pb = 18, pt = 8, n = items.length;
  const m = max ?? Math.max(1, ...items.map(i => i.v));
  const bw = (W - 8) / n;
  const bars = items.map((it, i) => {
    const bh = Math.max(it.v ? 3 : 0, (H - pb - pt) * (it.v / m));
    return `<rect class="bar" style="animation-delay:${i * 18}ms" x="${4 + i * bw + bw * 0.16}" y="${H - pb - bh}" width="${bw * 0.68}" height="${bh}" rx="${Math.min(4, bw * 0.3)}"><title>${it.label}: ${it.v}${unit}</title></rect>` +
      (i % every === 0 ? `<text class="ax" x="${4 + i * bw + bw / 2}" y="${H - 4}" text-anchor="middle">${esc(it.label.replace(/^0/, ''))}</text>` : '');
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><line class="grid" x1="4" x2="${W - 4}" y1="${H - pb}" y2="${H - pb}"/>${bars}</svg>`;
}
export function ring(pct, { size = 84, stroke = 8, label = '', sub = '' } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none"/><circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, Math.max(0, pct)))}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><div class="ring-label"><b>${label}</b><small>${sub}</small></div></div>`;
}

// ---------- storage
const KEY = 'p35.state.v1';
export const DEFAULT_HABITS = () => [
  { id: 'wake', name: 'Wake up at my target time', icon: 'sun', target: null, unit: '', step: 1 },
  { id: 'water', name: 'Drink enough water', icon: 'drop', target: 3000, unit: 'ml', step: 250 },
  { id: 'workout', name: 'Complete the daily workout', icon: 'dumbbell', target: null, unit: '', auto: 'workout' },
  { id: 'steps', name: 'Hit my step target', icon: 'steps', target: 8000, unit: 'steps', step: 1000 },
  { id: 'diet', name: 'Eat a balanced diet', icon: 'leaf', target: null, unit: '' },
  { id: 'read', name: 'Read for 20 minutes', icon: 'book', target: 20, unit: 'min', step: 5 },
  { id: 'screen', name: 'Avoid unnecessary screen time', icon: 'phoneoff', target: null, unit: '' },
  { id: 'sleep', name: 'Sleep 7–9 hours', icon: 'moon', target: 7, unit: 'h', step: 0.5 },
];
export const defaultState = () => ({
  v: 1, onboarded: false, profile: {},
  settings: {
    theme: 'dark', weddingDate: '2026-12-09', wakeTime: '06:30', stepGoal: 8000, waterGoal: 3000, startDate: '2026-11-06',
    reminders: {
      morning: { on: false, time: '07:00', label: 'Morning habits' }, workout: { on: false, time: '18:00', label: 'Workout time' },
      water: { on: false, every: 120, from: '09:00', to: '21:00', label: 'Drink water' }, evening: { on: false, time: '21:00', label: 'Evening habit review' },
      bed: { on: false, time: '22:30', label: 'Bedtime' },
    },
  },
  habits: DEFAULT_HABITS().map(h => ({ ...h, created: null })),
  logs: {}, checkins: {}, plans: {}, workouts: [], prog: null, bests: {}, loads: {}, benchmarks: [], body: [], session: null, fired: {},
});
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw), d = defaultState();
    return { ...d, ...s, settings: { ...d.settings, ...s.settings, reminders: { ...d.settings.reminders, ...(s.settings?.reminders || {}) } } };
  } catch (e) { console.error(e); return defaultState(); }
}
export const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { console.error('save failed', e); } };

// Photos live in IndexedDB (too large for localStorage).
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('p35', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const tx = async (mode, fn) => { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction('photos', mode); const out = fn(t.objectStore('photos')); t.oncomplete = () => res(out.result); t.onerror = () => rej(t.error); }); };
export const photoPut = p => tx('readwrite', s => s.put(p));
export const photoDel = id => tx('readwrite', s => s.delete(id));
export const photoAll = () => tx('readonly', s => s.getAll()).then(r => (r || []).sort((a, b) => a.date.localeCompare(b.date)));
export async function resizeImage(file, max = 900) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
  return c.toDataURL('image/jpeg', 0.8);
}
