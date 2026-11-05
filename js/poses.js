// Angle-based poses: every figure uses the same body proportions, so standing and lying poses look consistent.
// Angles are degrees, screen coordinates (0 = right, 90 = down, -90 = up). Figures face right.
const T = Math.PI / 180, TORSO = 29, THIGH = 23, SHIN = 23, UA = 15, FA = 14;
const R = (p, a, l) => [p[0] + Math.cos(a * T) * l, p[1] + Math.sin(a * T) * l];
function mk(s, P = [0, 0]) {
  const o = { P };
  o.S = R(P, s.t, TORSO * (s.lt || 1));
  o.H = R(o.S, s.h ?? s.t, 10);
  o.K = R(P, s.th, THIGH); o.F = R(o.K, s.sh, SHIN);
  o.E = R(o.S, s.ua, UA * (s.lu || 1)); o.W = R(o.E, s.fa, FA * (s.lf || 1));
  if (s.th2 != null) { o.K2 = R(P, s.th2, THIGH); o.F2 = R(o.K2, s.sh2 ?? s.th2, SHIN); }
  if (s.ua2 != null) { o.E2 = R(o.S, s.ua2, UA * (s.lu || 1)); o.W2 = R(o.E2, s.fa2 ?? s.ua2, FA * (s.lf || 1)); }
  if (s.m != null) { const dx = o.S[0] - P[0], dy = o.S[1] - P[1], L = Math.hypot(dx, dy) || 1; o.M = [(P[0] + o.S[0]) / 2 + (dy / L) * s.m, (P[1] + o.S[1]) / 2 - (dx / L) * s.m]; }
  if (s.ft != null) o.FT = R(o.F, s.ft, 9);
  return o;
}
const JOINTS = ['H', 'S', 'P', 'K', 'F', 'E', 'W', 'K2', 'F2', 'E2', 'W2', 'M', 'FT'];
function pair(a, b, fix = 'F') {
  const A = mk(a), B0 = mk(b);
  const d = [A[fix][0] - B0[fix][0], A[fix][1] - B0[fix][1] - (b.dy || 0)], B = mk(b, d);
  let x0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const q of [A, B]) for (const j of JOINTS) if (q[j]) { x0 = Math.min(x0, q[j][0]); x1 = Math.max(x1, q[j][0]); y1 = Math.max(y1, q[j][1]); }
  const dx = 100 - (x0 + x1) / 2, dy = 100 - y1, fin = q => Object.fromEntries(JOINTS.filter(j => q[j]).map(j => [j, [+(q[j][0] + dx).toFixed(1), +(q[j][1] + dy).toFixed(1)]]));
  return [fin(A), fin(B)];
}
export const NEW_POSES = {}, POSE_FOR = {}, ARROW_J = {}, PROP_FOR = {};
function def(ids, name, a, b, fix, arrow, prop) { if (arrow) [].concat(ids).forEach(id => { ARROW_J[id] = arrow; });
  const [A, B] = pair(a, b, fix); NEW_POSES[name + '_a'] = A; NEW_POSES[name + '_b'] = B; if (prop) [].concat(ids).forEach(id => { PROP_FOR[id] = prop(A, B); }); [].concat(ids).forEach(id => { POSE_FOR[id] = [name + '_a', name + '_b']; }); }
const same = (ids, name, a, fix) => def(ids, name, a, a, fix);

// ---- standing / hinge
const UP = { t: -90, th: 90, sh: 90 };
// Single-arm dumbbell row: hinge forward, arm hangs, then elbow drives back toward the hip.
def(['dbRow', 'dbBentRow'], 'row', { t: -25, th: 80, sh: 100, ua: 90, fa: 90  }, { t: -25, th: 80, sh: 100, ua: 160, fa: 95  }, 'F');
// Rear fly: arms hang, then lift out to the sides (seen from the side the arms foreshorten).
def('dbRearFly', 'fly', { t: -25, th: 80, sh: 100, ua: 90, fa: 90 }, { t: -25, th: 80, sh: 100, ua: 90, fa: 90, lu: 0.35, lf: 0.35 }, 'F');
// ---- floor work
def('proneYTW', 'ytw', { t: 0, h: -5, th: 180, sh: 180, ua: 0, fa: 0, ft: 90 }, { t: -8, h: -20, th: 180, sh: 180, ua: -22, fa: -22, ft: 90 }, 'P');
def('sidePlank', 'side', { t: -6, th: 174, sh: 174, ua: 90, fa: 0, lf: 0.3, ft: 100 }, { t: -17, th: 163, sh: 163, ua: 90, fa: 0, lf: 0.3, ft: 100 }, 'F');
def('bridge', 'bridge', { t: 180, h: 180, th: -50, sh: 50, ua: 0, fa: 0, ft: 0 }, { t: 140, h: 150, th: -8, sh: 95, ua: 0, fa: 0, ft: 0 }, 'F');
def('catCow', 'catcow', { t: 0, h: 20, th: 90, sh: 180, ua: 90, fa: 90, m: 7 }, { t: 0, h: -30, th: 90, sh: 180, ua: 90, fa: 90, m: -6 }, 'K');
def('thoracic', 'thor', { t: 0, h: 10, th: 90, sh: 180, ua: 100, fa: -40, ua2: 90, fa2: 90 }, { t: -8, h: -15, th: 90, sh: 180, ua: -80, fa: -40, ua2: 90, fa2: 90 }, 'K');
def('hipFlexor', 'hipflex', { t: -90, h: -90, th: 0, sh: 90, th2: 100, sh2: 180, ua: 120, fa: 60 }, { t: -86, h: -88, th: 8, sh: 98, th2: 112, sh2: 180, ua: -80, fa: -80 }, 'F', 'P');
def('chestStretch', 'chest', { ...UP, ua: 95, fa: 92 }, { t: -94, h: -100, th: 90, sh: 90, ua: 135, fa: 125 }, 'F', 'W');
def('childPose', 'child', { t: 0, h: 10, th: 90, sh: 180, ua: 90, fa: 90 }, { t: -12, h: -4, th: 22, sh: 180, ua: 0, fa: 0 }, 'K', 'P');

// =================== batch 1: push, core, legs ===================
const pr = (c, x, y, w, h) => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`;
const ST = { t: -90, th: 90, sh: 90, ua: 90, fa: 90 };
// push-ups
const PU = { th: 160, sh: 160, ua: 90, fa: 90 };
def(['pushup', 'diamond', 'burpee'], 'push', { t: -20, ...PU }, { t: -8, th: 172, sh: 172, ua: 150, fa: 62 }, 'F', 'H');
def('kneePush', 'kneepush', { t: -34, th: 146, sh: -146, ua: 90, fa: 90 }, { t: -12, th: 168, sh: -168, ua: 150, fa: 62 }, 'K', 'H');
def('inclinePush', 'incline', { t: -39, th: 141, sh: 141, ua: 90, fa: 90 }, { t: -24, th: 156, sh: 156, ua: 140, fa: 64 }, 'F', 'H', (A) => pr('prop', A.W[0] - 15, A.W[1], 30, 100 - A.W[1]));
def(['decline'], 'decline', { t: -8, th: 172, sh: 172, ua: 90, fa: 90 }, { t: 2, th: 182, sh: 182, ua: 150, fa: 62 }, 'F', 'H', (A) => pr('prop', A.F[0] - 14, A.F[1] - 1, 28, 101 - A.F[1]));
def('scapPushup', 'scappush', { t: -20, ...PU }, { t: -17, th: 163, sh: 163, ua: 90, fa: 90 }, 'F', 'S');
def('plankTaps', 'taps', { t: -20, ...PU }, { t: -20, ...PU, ua: -5, fa: -5 }, 'F', 'W');
def('pike', 'pike', { t: 135, th: 62, sh: 62, ua: 90, fa: 90 }, { t: 128, th: 62, sh: 62, ua: 160, fa: 55, lu: 1 }, 'F', 'H');
def('pikeHold', 'pikehold', { t: 135, th: 62, sh: 62, ua: 90, fa: 90 }, { t: 135, th: 62, sh: 62, ua: 90, fa: 90 }, 'F');
def('downDog', 'dog', { t: 135, th: 62, sh: 62, ua: 90, fa: 90 }, { t: 135, th: 62, sh: 62, ua: 90, fa: 90 }, 'F');
def('wallPush', 'wallpush', { t: -75, th: 105, sh: 105, ua: -8, fa: -8 }, { t: -60, th: 120, sh: 120, ua: 40, fa: -20 }, 'F', 'H', (A) => `<line class="prop thick" x1="${A.W[0] + 4}" y1="${A.W[1] - 40}" x2="${A.W[0] + 4}" y2="100"/>`);
// plank on forearms + side/knee variants
def('plank', 'plank', { t: -11, th: 169, sh: 169, ua: 90, fa: 0 }, { t: -11, th: 169, sh: 169, ua: 90, fa: 0 }, 'F');
def('kneePlank', 'kneeplank', { t: -14, th: 166, sh: -166, ua: 90, fa: 0 }, { t: -14, th: 166, sh: -166, ua: 90, fa: 0 }, 'K');
def('mountain', 'mtn', { t: -20, ...PU }, { t: -20, th: 160, sh: 160, th2: 68, sh2: 158, ua: 90, fa: 90 }, 'F', 'K2');
def('superman', 'super', { t: 0, th: 180, sh: 180, ua: 0, fa: 0 }, { t: -10, h: -20, th: 195, sh: 195, ua: -18, fa: -18 }, 'P', 'F');
def('snowAngel', 'snow', { t: -4, th: 180, sh: 180, ua: 180, fa: 180 }, { t: -8, th: 180, sh: 180, ua: -20, fa: -20 }, 'P', 'W');
def('scapRetract', 'scapret', { t: 0, th: 180, sh: 180, ua: 180, fa: 180 }, { t: -9, th: 180, sh: 180, ua: 180, fa: 180 }, 'P', 'H');
// back-lying core (head on the left)
def('deadBug', 'dead', { t: 180, th: -90, sh: 0, th2: -90, sh2: 0, ua: -90, fa: -90, ua2: -90, fa2: -90 }, { t: 180, th: -8, sh: -8, th2: -90, sh2: 0, ua: -90, fa: -90, ua2: -172, fa2: -172 }, 'P', 'F');
def('bicycle', 'bike', { t: 200, th: -8, sh: -8, th2: -80, sh2: -10, ua: -125, fa: -125 }, { t: 200, th: -80, sh: -10, th2: -8, sh2: -8, ua: -125, fa: -125 }, 'P', 'K');
def('legRaise', 'legr', { t: 180, th: 0, sh: 0, ua: 180, fa: 180 }, { t: 180, th: -90, sh: -90, ua: 180, fa: 180 }, 'P', 'F');
def('vUp', 'vup', { t: 180, th: 0, sh: 0, ua: -172, fa: -172 }, { t: -125, h: -125, th: -55, sh: -55, ua: -30, fa: -30 }, 'P', 'F');
def('hollow', 'hollow', { t: 197, th: -60, sh: 60, ua: -165, fa: -165 }, { t: 197, th: -22, sh: -22, ua: -165, fa: -165 }, 'P', 'F');
def('tuckHollow', 'tuck', { t: 197, th: -60, sh: 60, ua: -165, fa: -165 }, { t: 197, th: -60, sh: 60, ua: -165, fa: -165 }, 'P');
def('slBridge', 'slbridge', { t: 180, h: 180, th: -50, sh: 50, th2: -50, sh2: 50, ua: 0, fa: 0 }, { t: 140, h: 150, th: -8, sh: 95, th2: -48, sh2: -48, ua: 0, fa: 0 }, 'F', 'F2');
def('sideDip', 'sidedip', { t: -4, th: 176, sh: 176, ua: 90, fa: 0, lf: 0.3 }, { t: -17, th: 163, sh: 163, ua: 90, fa: 0, lf: 0.3 }, 'F', 'P');
def('kneeSide', 'kneeside', { t: -8, th: 172, sh: -172, ua: 90, fa: 0, lf: 0.3 }, { t: -19, th: 161, sh: -161, ua: 90, fa: 0, lf: 0.3 }, 'K', 'P');

// =================== batch 2: legs, standing, pulling, mobility ===================
const SQ = { t: -62, th: 8, sh: 100 };
def(['squat', 'tempoSquat', 'bwSquatWarm'], 'squat', { ...ST, ua: 0, fa: 0 }, { ...SQ, ua: 0, fa: 0 }, 'F', 'P');
def('gobletSquat', 'goblet', { ...ST, ua: 70, fa: -75 }, { ...SQ, t: -72, ua: 70, fa: -75 }, 'F', 'P');
def('chairSquat', 'chairsq', { ...ST, ua: 0, fa: 0 }, { ...SQ, ua: 0, fa: 0 }, 'F', 'P', (A, B) => pr('prop', B.P[0] - 34, B.P[1] + 2, 26, 100 - B.P[1] - 2));
def('jumpSquat', 'jumpsq', { ...SQ, ua: 60, fa: 60 }, { ...ST, ua: -80, fa: -80, dy: 14 }, 'F', 'P');
def('squatReach', 'sqreach', { ...SQ, ua: 55, fa: 55 }, { ...ST, ua: -85, fa: -85 }, 'F', 'W');
def('deepSquat', 'deep', { t: -70, th: -8, sh: 104, ua: 40, fa: -35 }, { t: -70, th: -8, sh: 104, ua: 40, fa: -35 }, 'F');
def('wallSit', 'wallsit', { t: -90, th: 0, sh: 90, ua: 30, fa: 20 }, { t: -90, th: 0, sh: 90, ua: 30, fa: 20 }, 'F', null, (A) => `<line class="prop thick" x1="${A.S[0] - 10}" y1="${A.H[1] - 10}" x2="${A.S[0] - 10}" y2="100"/>`);
def('revLunge', 'rlunge', { ...ST, th2: 90, sh2: 90 }, { t: -90, th: 6, sh: 94, th2: 112, sh2: -158, ua: 90, fa: 90 }, 'F', 'F2');
def('worldGreatest', 'wgs', { t: -90, th: 6, sh: 94, th2: 112, sh2: -158, ua: 90, fa: 90 }, { t: -70, th: 6, sh: 94, th2: 112, sh2: -158, ua: -90, fa: -90 }, 'F', 'W');
def('bulgarian', 'bulg', { t: -90, th: 70, sh: 94, th2: 140, sh2: -150, ua: 90, fa: 90 }, { t: -86, th: 8, sh: 96, th2: 130, sh2: -150, ua: 90, fa: 90 }, 'F', 'P', (A) => pr('prop', A.F2[0] - 22, A.F2[1], 24, 100 - A.F2[1]));
def('calfRaise', 'calf', { ...ST, ft: 0 }, { ...ST, ft: 62, dy: 8 }, 'F', 'H');
def('slCalf', 'slcalf', { ...ST, th2: 108, sh2: -172, ft: 0 }, { ...ST, th2: 108, sh2: -172, ft: 62, dy: 8 }, 'F', 'H');
def('dbRdl', 'rdl', { ...ST }, { t: -22, th: 78, sh: 98, ua: 90, fa: 90 }, 'F', 'H');
def('bwRdl', 'bwrdl', { ...ST, ua: 0, fa: 0 }, { t: -22, th: 78, sh: 98, ua: 0, fa: 0 }, 'F', 'H');
def('dbThruster', 'thruster', { ...SQ, t: -68, ua: 50, fa: -100 }, { ...ST, ua: -72, fa: -96 }, 'F', 'W');
def('dbPress', 'press', { ...ST, ua: 50, fa: -100 }, { ...ST, ua: -72, fa: -96 }, 'F', 'W');
def(['highKnees', 'marchWarm', 'walk', 'walkGentle'], 'march', { t: -90, th: 90, sh: 90, th2: 12, sh2: 90, ua: 120, fa: 40, ua2: 60, fa2: -30 }, { t: -90, th: 12, sh: 90, th2: 90, sh2: 90, ua: 60, fa: -30, ua2: 120, fa2: 40 }, 'F');
def('jacks', 'jacks', { ...ST, ua: 92, fa: 92 }, { t: -90, th: 112, sh: 112, th2: 68, sh2: 68, ua: -128, fa: -128, ua2: -52, fa2: -52 }, 'P', 'W');
def('inchworm', 'inch', { t: -90, th: 90, sh: 90, ua: 90, fa: 90 }, { t: -20, th: 160, sh: 160, ua: 90, fa: 90 }, 'F', 'H');
def('hamstringFold', 'fold', { ...ST }, { t: 30, th: 92, sh: 92, ua: 95, fa: 95 }, 'F', 'H');
def('quadStretch', 'quad', { ...ST, th2: 90, sh2: 90 }, { ...ST, th2: 100, sh2: -160, ua: 90, fa: 90 }, 'F', 'F2');
// curls / presses / shoulders / pulling
def(['dbCurl', 'bandCurl', 'towelCurl'], 'curl', { ...ST, ua: 85, fa: 78 }, { ...ST, ua: 78, fa: -62 }, 'F', 'W');
def('bandRow', 'bandrow', { t: -90, th: 0, sh: 0, ua: 0, fa: 0 }, { t: -90, th: 0, sh: 0, ua: 155, fa: 10 }, 'P', 'W');
def('bandPull', 'bandpull', { ...ST, ua: 0, fa: 0 }, { ...ST, ua: 0, fa: 0, lu: .3, lf: .3 }, 'F', 'W');
def('armCircles', 'armcirc', { ...ST, ua: 0, fa: 0 }, { ...ST, ua: -90, fa: -90 }, 'F', 'W');
def('shoulderMob', 'shmob', { ...ST, ua: 90, fa: 90 }, { ...ST, ua: 90, fa: 90, lt: .93 }, 'F', 'S');
def('wallAngel', 'wallang', { ...ST, ua: 95, fa: -90 }, { ...ST, ua: -85, fa: -90 }, 'F', 'W', (A) => `<line class="prop thick" x1="${A.S[0] - 9}" y1="${A.H[1] - 12}" x2="${A.S[0] - 9}" y2="100"/>`);
// hanging
const HG = { t: -90, th: 90, sh: 90, ua: -90, fa: -90 };
const bar = (A) => `<line class="prop thick" x1="${A.W[0] - 26}" y1="${A.W[1]}" x2="${A.W[0] + 26}" y2="${A.W[1]}"/>`;
def(['pullup', 'assistedPull', 'chinUp'], 'pull', HG, { t: -90, th: 90, sh: 90, ua: 100, fa: -90 }, 'W', 'H', bar);
def('negPull', 'neg', { t: -90, th: 90, sh: 90, ua: 100, fa: -90 }, HG, 'W', 'H', bar);
def('scapPull', 'scap', HG, { ...HG, lu: .78, lf: .78 }, 'W', 'S', bar);
def('deadHang', 'hang', HG, HG, 'W', null, bar);
def('tableRow', 'trow', { t: 188, th: 8, sh: 8, ua: -90, fa: -90 }, { t: 188, th: 8, sh: 8, ua: -150, fa: -55 }, 'F', 'S', (A) => `<line class="prop thick" x1="${A.W[0] - 18}" y1="${A.W[1]}" x2="${A.W[0] + 22}" y2="${A.W[1]}"/>`);
// dips
const BD = { t: -90, th: 12, sh: 92, ua: 100, fa: 100 };
def('benchDip', 'dip', BD, { ...BD, ua: 170, fa: 92 }, 'W', 'S', (A) => pr('prop', A.W[0] - 26, A.W[1], 30, 100 - A.W[1]));
def('benchDipStraight', 'dip2', { ...BD, th: 2, sh: 2 }, { ...BD, th: 2, sh: 2, ua: 170, fa: 92 }, 'W', 'S', (A) => pr('prop', A.W[0] - 26, A.W[1], 30, 100 - A.W[1]));
// floor mobility
def('cobra', 'cobra', { t: 0, th: 180, sh: 180, ua: 90, fa: 90 }, { t: -38, h: -48, th: 180, sh: 180, ua: 80, fa: 95 }, 'P', 'H');
def('birdDog', 'bird', { t: 0, th: 90, sh: 180, th2: 90, sh2: 180, ua: 90, fa: 90, ua2: 90, fa2: 90 }, { t: 0, th: 90, sh: 180, th2: 180, sh2: 180, ua: 90, fa: 90, ua2: 0, fa2: 0 }, 'K', 'F2');
def('hamstringMob', 'hamlie', { t: 180, th: 0, sh: 0, th2: -50, sh2: -50, ua: -60, fa: -60 }, { t: 180, th: 0, sh: 0, th2: -86, sh2: -86, ua: -80, fa: -80 }, 'P', 'F2');
def('hipMob', 'hipmob', { t: -90, th: 10, sh: 92, th2: 90, sh2: 90, ua: 90, fa: 90 }, { t: -90, th: 140, sh: 100, th2: 90, sh2: 90, ua: 90, fa: 90 }, 'F2', 'K');

def('pikeElev', 'pikeel', { t: 140, th: 52, sh: 52, ua: 90, fa: 90 }, { t: 132, th: 52, sh: 52, ua: 160, fa: 55 }, 'W', 'H', (A) => pr('prop', A.F[0] - 12, A.F[1], 26, Math.max(4, 100 - A.F[1])));
