// Coaching engine: rule-based, deterministic, no DOM. Modular so an external AI service
// could replace buildPlan() later (see `plannerProvider` at the bottom).
import { EX, CHAINS, DYNAMIC, dynamicChain, FOCUS, WEEK, STRENGTH, STRESS_WORDS } from './data.js';

// ---------- dates
export const pad = n => String(n).padStart(2, '0');
export const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
export const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 864e5);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const LV = { beginner: 0, intermediate: 1, advanced: 2 };

// ---------- injuries / equipment filtering
export function avoidInfo(profile = {}) {
  let text = String(profile.avoid || '').toLowerCase().trim();
  if (/^(none|no|nil|n\/a|nothing|no injuries?)\.?$/.test(text)) text = '';
  const positive = text.replace(/\b(no|not|without|zero)\s+\w+/g, ' ');
  const tags = new Set();
  STRESS_WORDS.forEach(([re, tag]) => { if (re.test(positive)) tags.add(tag); });
  const phrases = positive.split(/[,;\n]| and /).map(norm).filter(p => p.length >= 4);
  return { tags, phrases };
}
const norm = s => s.toLowerCase().replace(/[^a-z ]/g, '').replace(/s\b/g, '').trim();
export function isAllowed(exId, avoid, equip = []) {
  const ex = EX[exId]; if (!ex) return false;
  if (ex.equip && !ex.equip.split('+').every(k => equip.includes(k))) return false;
  if (ex.stress.some(t => avoid.tags.has(t))) return false;
  const n = norm(ex.name);
  if (avoid.phrases.some(p => n.includes(p) || (n.length >= 4 && p.includes(n)))) return false;
  return true;
}

// ---------- programme (34 days: 5 Nov → 8 Dec, wedding 9 Dec)
export const PHASES = [
  { id: 'foundation', name: 'Foundation', from: 1, to: 7, blurb: 'learn the movements and keep every set ~3 reps from failure.' },
  { id: 'build', name: 'Build', from: 8, to: 14, blurb: 'primary lifts gain a set as your technique settles.' },
  { id: 'progress', name: 'Progress', from: 15, to: 25, blurb: 'reps and loads increase once you show consistent, controlled sessions.' },
  { id: 'consolidate', name: 'Consolidation', from: 26, to: 30, blurb: 'hold your gains — no new increases, just crisp reps and fresh joints.' },
  { id: 'taper', name: 'Recovery & taper', from: 31, to: 34, blurb: 'recover and feel fresh for the wedding — no hard training.' },
];
export function programme(state, date) {
  const start = state.settings?.startDate; if (!start) return null;
  const day = diffDays(date, start) + 1;
  if (day < 1) return { day, total: 34, before: true, phase: PHASES[0] };
  return { day, total: 34, phase: PHASES.find(p => day >= p.from && day <= p.to) || null, complete: day > 34 };
}

// ---------- progression state
const START = { shoulder: 0, coreDyn: 1, side: 1, hollow: 0, glute: 0, calf: 0, cardio: 1, tri: 0, lunge: 0, corePlank: 1 };
const SETS3 = new Set(['push', 'goblet', 'row', 'sarow', 'glute']);
export const ALL_CHAINS = [...Object.keys(CHAINS), ...DYNAMIC];
const MAX_SETS = 4;

export function initProg(profile = {}) {
  const equip = profile.equip || [];
  const pu = +profile.pushups || 0, sq = +profile.squats || 0, pl = +profile.plank || 0;
  const prog = {};
  ALL_CHAINS.forEach(id => {
    const chain = dynamicChain(id, equip);
    const idx = clamp(START[id] ?? 0, 0, chain.length - 1), ex = EX[chain[idx]];
    prog[id] = { lvl: idx, reps: ex.base, sets: ex.step === 0 || (ex.type === 'time' && ex.base >= 300) ? 1 : SETS3.has(id) ? 3 : 2, fails: 0, okStreak: 0 };
  });
  const set = (id, lvl, reps) => { const c = dynamicChain(id, equip); lvl = clamp(lvl, 0, c.length - 1); prog[id].lvl = lvl; prog[id].reps = reps; };
  if (pu < 3) set('push', 0, 10); else if (pu < 6) set('push', 1, 8); else if (pu < 10) set('push', 3, Math.max(4, Math.round(pu * 0.55)));
  else if (pu < 30) set('push', 3, Math.min(14, Math.round(pu * 0.6))); else if (pu < 40) set('push', 4, 8); else set('push', 5, 8);
  if (sq < 8) set('squat', 0, 10); else if (sq < 35) set('squat', 1, clamp(Math.round(sq * 0.6), 8, 20)); else set('squat', 2, 10);
  if (pl < 15) set('corePlank', 0, 20); else if (pl < 90) set('corePlank', 1, clamp(Math.round(pl * 0.7 / 5) * 5, 20, 40)); else set('corePlank', 2, 12);
  return prog;
}
export function ensureProg(state) {
  const fresh = initProg(state.profile);
  state.prog ||= {}; state.loads ||= {};
  ALL_CHAINS.forEach(id => {
    const len = dynamicChain(id, state.profile.equip || []).length;
    if (!state.prog[id] || state.prog[id].lvl > len - 1) state.prog[id] = fresh[id];
  });
}

function resolve(chainId, state, avoid) {
  const equip = state.profile.equip || [];
  const chain = dynamicChain(chainId, equip);
  const p = state.prog[chainId];
  const lvl = clamp(p.lvl, 0, chain.length - 1);
  for (let d = 0; d < chain.length; d++) {
    for (const idx of [lvl - d, lvl + d]) {
      if (idx >= 0 && idx < chain.length && isAllowed(chain[idx], avoid, equip)) return { idx, ex: EX[chain[idx]], sub: idx !== lvl };
    }
  }
  return null;
}

// ---------- readiness & deload
export function readiness(ci) {
  if (!ci || ci.energy == null) return null;
  const parts = [ci.energy];
  if (ci.soreness != null) parts.push(6 - ci.soreness);
  if (ci.sleep != null) parts.push(ci.sleep);
  return +(parts.reduce((a, b) => a + b, 0) / parts.length).toFixed(1);
}
export const checkinDone = ci => !!ci && ci.energy != null && ci.soreness != null && ci.sleep != null;
export function deloadAdvice(state, date) {
  const hard = [...(state.workouts || [])].filter(w => w.date < date).sort((a, b) => a.date.localeCompare(b.date)).slice(-4);
  if (hard.filter(w => w.rpe === 'hard').length >= 2) return 'two of your last four sessions felt “too hard”';
  const cis = Object.entries(state.checkins || {}).filter(([d]) => d < date).sort((a, b) => a[0].localeCompare(b[0])).slice(-4).map(([, c]) => readiness(c)).filter(v => v != null);
  if (cis.length >= 3 && cis.reduce((a, b) => a + b, 0) / cis.length <= 2.6) return 'your recent readiness (energy, soreness, sleep) has been low';
  return null;
}

// ---------- planning
const WARM = {
  upper: ['marchWarm', 'shoulderMob', 'catCow', 'thoracic', 'inchworm', 'armCircles'],
  lower: ['marchWarm', 'bwSquatWarm', 'worldGreatest', 'hipMob', 'catCow', 'armCircles'],
  conditioning: ['marchWarm', 'armCircles', 'worldGreatest', 'inchworm', 'bwSquatWarm', 'catCow'],
  backcore: ['marchWarm', 'catCow', 'thoracic', 'shoulderMob', 'inchworm', 'armCircles'],
  posture: ['marchWarm', 'armCircles', 'shoulderMob'], cardioflex: ['marchWarm', 'armCircles', 'catCow'], recovery: [], rest: [],
};
const MOB = {
  upper: ['chestStretch', 'thoracic', 'hipFlexor', 'childPose', 'hamstringMob'],
  lower: ['hipFlexor', 'hamstringMob', 'deepSquat', 'quadStretch', 'childPose'],
  conditioning: ['hipFlexor', 'thoracic', 'hamstringMob', 'chestStretch', 'childPose'],
  backcore: ['chestStretch', 'thoracic', 'hipFlexor', 'cobra', 'childPose'],
};
const COOL = ['childPose', 'hamstringFold'];
const timed = (exId, avoid, equip, target) => (isAllowed(exId, avoid, equip) ? { exId, sets: 1, target: target ?? EX[exId].base, type: EX[exId].type, rest: 5, role: 'prep' } : null);
const est = it => {
  const ex = EX[it.exId], uni = ex.unilateral ? 2 : 1;
  const work = it.type === 'time' ? it.target * uni : it.target * 3 * uni + 10;
  return it.sets * (work + it.rest) + 5;
};
export const planSeconds = items => items.reduce((a, it) => a + est(it), 0);

export function summarise(state, date) {
  const done = (state.workouts || []).filter(w => w.date < date);
  const byDate = {};
  done.forEach(w => { (byDate[w.date] ||= []).push(w); });
  const dates = Object.keys(byDate).sort(), lastDate = dates[dates.length - 1];
  return { byDate, lastDate, gap: lastDate ? diffDays(date, lastDate) : Infinity, yFocus: byDate[addDays(date, -1)]?.[0]?.focus };
}

export function buildPlan(state, date, opts = {}) {
  const P = state.profile, equip = P.equip || [], avoid = avoidInfo(P);
  const minutes = +P.minutes || 30;
  const S = summarise(state, date);
  const ci = state.checkins?.[date], rd = readiness(ci);
  const prog = programme(state, date);
  const dToWed = state.settings?.weddingDate ? diffDays(state.settings.weddingDate, date) : 99;
  const reasons = [];
  let focus = WEEK[parse(date).getDay()], intensity = 'normal';
  const phase = prog?.phase && !prog.before ? prog.phase : null;
  const dayName = parse(date).toLocaleDateString('en-GB', { weekday: 'long' });
  if (prog && !prog.before && !prog.complete && phase) reasons.push(`Day ${prog.day} of 34 · ${phase.name}: ${phase.blurb}`);
  const deload = deloadAdvice(state, date);

  if (prog?.before && !opts.forceFocus) { focus = 'rest'; reasons.push(`Your 34-day programme starts on ${parse(state.settings.startDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. Until then: rest, drink water, and set up your habits.`); }
  else if (opts.forceFocus) { focus = opts.forceFocus; reasons.push('You chose this session yourself — the coach still sizes the volume to your recovery.'); }
  else if (dToWed === 0) { focus = 'rest'; reasons.push('It’s your wedding day. No training — hydrate, eat, and enjoy it. You’ve earned it.'); }
  else if (phase?.id === 'taper' || (dToWed >= 1 && dToWed <= 4)) {
    if (dToWed === 1) focus = 'recovery';
    else if (STRENGTH.has(focus)) focus = 'posture';
    reasons.push(`Taper phase: the goal now is to feel fresh and mobile, not to train harder. ${dayName}’s session is ${FOCUS[focus].title.toLowerCase()} — easy effort, no soreness-chasing.`);
    if (focus !== 'recovery') intensity = 'taper';
  } else {
    reasons.push(`${dayName} is ${FOCUS[focus].title.toLowerCase()} in your weekly structure.`);
    if (STRENGTH.has(focus)) {
      if (rd !== null && rd <= 2) { focus = 'recovery'; reasons.push(`Your readiness is low (${rd}/5 from energy, soreness and sleep), so strength work is swapped for a recovery day. Skipping a hard session when you’re run down is smart training.`); }
      else if (rd !== null && rd < 3) { intensity = 'light'; reasons.push(`Readiness ${rd}/5: volume trimmed (one fewer set, ~15% fewer reps).`); }
      else if (deload) { intensity = 'light'; reasons.push(`Deload recommended: ${deload}. Today is lighter — same movements, less volume.`); }
      else if (S.lastDate && S.gap >= 4) { intensity = 'restart'; reasons.push(`It’s been ${S.gap} days — no guilt. Easy restart with slightly reduced volume; you’ll be back at full load within a session or two.`); }
      else if (rd !== null && rd >= 4) reasons.push(`Great readiness (${rd}/5) — full planned workload today.`);
      else if (rd === null) reasons.push('Tip: complete the readiness check-in and the coach will tune today’s intensity.');
    }
  }
  const fo = FOCUS[focus];
  if (!state.workouts.length && fo.strength) reasons.push('First session: loads and reps start conservatively and are calibrated from your logged sets.');
  if (phase?.id === 'consolidate' && fo.strength) reasons.push('Consolidation: targets are held steady this week — focus on perfect form.');
  if (fo.strength && minutes) reasons.push('Choose dumbbell weights that leave 2–3 reps in reserve — the last rep should look the same as the first.');
  if (focus === 'posture') reasons.push('Posture work targets upper-back strength, scapular control, thoracic mobility and hip flexibility. It improves how you move and feel — it won’t “fix” structural posture issues; see a physio for persistent pain.');
  if (focus === 'recovery' && !opts.forceFocus && !phase?.id) reasons.push('Gentle movement helps recovery. Do your weekly check-in and read your report.');
  if (focus === 'recovery' && parse(date).getDay() === 0) reasons.push('Sunday: gentle walk, light stretching, then review your weekly report in Progress.');

  const plan = { pre: !!(prog?.before && !opts.forceFocus), date, focus, title: fo.title, sub: fo.sub, intensity, reasons, minutes, kind: fo.kind, warm: [], main: [], mob: [], cool: [], readiness: rd, phase: phase ? { id: phase.id, name: phase.name, day: prog.day } : null, hold: phase?.id === 'consolidate' || phase?.id === 'taper' };
  const mk = (ids, n, tgt) => ids.map(id => timed(id, avoid, equip, tgt)).filter(Boolean).slice(0, n);
  const full = minutes >= 30;
  plan.warm = mk(WARM[focus] || [], full ? 6 : 3, 40).map(it => ({ ...it, target: EX[it.exId].type === 'time' ? 40 : it.target }));
  if (fo.strength) {
    let acc = 0; plan.mob = [];
    for (const it of mk(MOB[focus], 6)) { if (acc >= (full ? 240 : 120)) break; plan.mob.push(it); acc += est(it); }
    plan.cool = mk(COOL, full ? 2 : 1, 30);
  } else if (focus === 'cardioflex') plan.cool = mk(['childPose'], 1, 30);

  // main items
  const weekIdx = prog && !prog.before ? Math.floor((prog.day - 1) / 7) : 0;
  let slots = [...fo.slots];
  if (state.profile.pullupModule && (focus === 'upper' || focus === 'backcore')) slots.splice(1, 0, 'pullDev');
  const used = new Set(), items = [];
  slots.forEach((slot, si) => {
    const chainId = Array.isArray(slot) ? slot[weekIdx % slot.length] : slot;
    const r = resolve(chainId, state, avoid); if (!r || used.has(r.ex.id)) return;
    used.add(r.ex.id);
    const p = state.prog[chainId], ex = r.ex;
    let sets = ex.step === 0 || (ex.type === 'time' && ex.base >= 300) ? 1 : p.sets, target = r.sub ? ex.base : p.reps, scaled = false;
    if (fo.strength && intensity === 'normal' && (phase?.id === 'build' || phase?.id === 'progress') && si < 2 && ex.step && sets < MAX_SETS) sets++;
    if (ex.step && (intensity === 'light' || intensity === 'restart')) {
      sets = Math.max(2, sets - 1); scaled = true; target = Math.round(target * (intensity === 'light' ? 0.85 : 0.8));
      if (ex.type === 'time') target = Math.max(10, Math.round(target / 5) * 5);
    }
    if (ex.step && intensity === 'taper') { sets = Math.max(1, sets - 1); scaled = true; target = Math.round(target * 0.8); }
    const rest = chainId === 'mountain' || chainId === 'cardio' ? 30 : (ex.type === 'time' && target >= 300) ? 0 : ex.type === 'time' ? 40 : ex.load ? 60 : 50;
    items.push({ exId: ex.id, chain: chainId, sets, target: Math.max(ex.type === 'time' ? 10 : 3, target), type: ex.type, rest, scaled, noProg: r.sub, role: ex.step ? 'main' : 'mob', substituted: r.sub, load: !!ex.load, lastLoad: state.loads?.[ex.id]?.kg ?? null, loadUp: !!p.loadUp });
  });
  const overhead = planSeconds([...plan.warm, ...plan.mob, ...plan.cool]) + 20;
  const budget = minutes * 60 - overhead;
  // Fit the time budget: trim sets from the lowest-priority exercises first (never below 2),
  // and only then drop trailing accessories. Form is never traded for speed.
  let guard = 200;
  while (planSeconds(items) > budget && guard--) {
    const idx = [...items.keys()].reverse().find(i => items[i].role === 'main' && items[i].sets > 2);
    if (idx !== undefined) { items[idx].sets--; continue; }
    if (items.length > 3) { items.pop(); continue; }
    const i1 = [...items.keys()].reverse().find(i => items[i].sets > 1 && items[i].role === 'main');
    if (i1 === undefined) break; items[i1].sets--;
  }
  plan.main = items;
  plan.seconds = planSeconds([...plan.warm, ...items, ...plan.mob, ...plan.cool]) + 20;
  plan.dropped = slots.length - items.length;
  if (items.some(i => i.substituted)) reasons.push('Some exercises were swapped to respect the limitations you listed.');
  if (plan.dropped > 0 && fo.strength) reasons.push(`To keep the session inside ${minutes} minutes, ${plan.dropped} accessory exercise${plan.dropped > 1 ? 's were' : ' was'} dropped rather than rushing form.`);
  const lastW = [...(state.workouts || [])].filter(w => w.date < date).sort((a, b) => a.date.localeCompare(b.date)).pop();
  (lastW?.changes || []).filter(c => c.kind === 'up' || c.kind === 'level').slice(0, 2).forEach(c => reasons.push(c.text));
  return plan;
}

export function planFor(state, date, force = false, opts = {}) {
  state.plans ||= {};
  const existing = state.plans[date];
  if (!force && existing) return existing;
  if ((state.workouts || []).find(x => x.date === date) && existing) return existing;
  const plan = buildPlan(state, date, opts);
  state.plans[date] = plan;
  return plan;
}

export function easierFor(state, item) {
  const ex = EX[item.exId], equip = state.profile.equip || [], avoid = avoidInfo(state.profile);
  const chain = dynamicChain(item.chain, equip), i = chain.indexOf(item.exId);
  for (let k = i - 1; k >= 0; k--) if (isAllowed(chain[k], avoid, equip)) return chain[k];
  if (ex.easier && isAllowed(ex.easier, avoid, equip)) return ex.easier;
  return null;
}

// ---------- apply results (progressive overload — only after consistent, controlled sessions)
export function applyResult(state, workout) {
  const changes = [];
  state.bests ||= {}; state.loads ||= {};
  const equip = state.profile.equip || [];
  const rpeSess = workout.rpe || 'right';
  const pr = programme(state, workout.date);
  const hold = ['consolidate', 'taper'].includes(pr?.phase?.id);
  for (const it of workout.items) {
    if (it.role !== 'main') continue;
    const done = it.sets.filter(s => s.done), ex = EX[it.exId];
    const rpe = it.rpe === 'hard' || rpeSess === 'hard' ? 'hard' : it.rpe === 'easy' || rpeSess === 'easy' ? 'easy' : 'right';
    const best = Math.max(0, ...done.map(s => +s.reps || 0));
    if (best > 0 && (!state.bests[it.exId] || best > state.bests[it.exId].v)) {
      if (state.bests[it.exId]) changes.push({ kind: 'pr', text: `New personal best: ${ex.name} — ${ex.type === 'time' && best >= 120 ? Math.round(best / 60) + ' min' : best + (ex.type === 'time' ? 's' : ' reps')}.` });
      state.bests[it.exId] = { v: best, date: workout.date };
    }
    const p = state.prog[it.chain]; if (!p || !done.length) continue;
    const ws = done.map(s => +s.weight).filter(Boolean);
    if (ex.load && ws.length) {
      const w = Math.max(...ws), prev = state.loads[ex.id]?.kg;
      if (prev && w > prev) p.loadUp = false;
      state.loads[ex.id] = { kg: w, date: workout.date };
    }
    if (it.noProg) continue;
    const chain = dynamicChain(it.chain, equip), cur = EX[chain[p.lvl]];
    if (it.swapped) {
      p.fails = (p.fails || 0) + 1; p.okStreak = 0;
      if (p.fails >= 2 && p.lvl > 0) {
        p.lvl--; const e = EX[chain[p.lvl]]; p.reps = Math.round(e.base + (e.ceil - e.base) * 0.5); p.fails = 0;
        changes.push({ kind: 'down', text: `${cur.name} was too hard twice, so your plan moves back to ${e.name}. Build from there — no rush.` });
      } else changes.push({ kind: 'hold', text: `You switched ${cur.name} to an easier version. Noted — the level stays put.` });
      continue;
    }
    if (it.exId !== cur.id) continue;
    const full = done.length >= it.sets.length && done.every(s => (+s.reps || 0) >= it.target);
    const ratio = done.reduce((a, s) => a + (+s.reps || 0) / it.target, 0) / it.sets.length;
    const unit = ex.type === 'time' ? (it.target >= 120 ? ' min' : 's') : ' reps';
    const fmt = v => (ex.type === 'time' && v >= 120 ? Math.round(v / 60) : v) + (unit === ' reps' && v === 1 ? ' rep' : unit);
    if (full && !it.scaled) {
      if (!ex.step) continue;
      if (rpe === 'hard') { p.okStreak = 0; changes.push({ kind: 'hold', text: `${cur.name}: you rated the session hard, so the target is held — no progression until it feels controlled.` }); continue; }
      if (hold) { p.okStreak = 0; continue; }
      p.okStreak = (p.okStreak || 0) + 1; // two consistent, controlled sessions in a row are required
      if (p.okStreak < 2) { changes.push({ kind: 'hold', text: `${cur.name}: solid and controlled. One more session like this and the coach will progress it.` }); continue; }
      p.okStreak = 0; p.fails = 0;
      const next = p.reps + ex.step;
      if (next > ex.ceil) {
        if (ex.load) { p.loadUp = true; p.reps = ex.base; changes.push({ kind: 'up', text: `${cur.name}: you topped out the rep range with control. Next session, increase the dumbbell by the smallest step available and start back at ${ex.base} reps.` }); }
        else if (p.lvl < chain.length - 1) { p.lvl++; const n = EX[chain[p.lvl]]; p.reps = n.base; changes.push({ kind: 'level', text: `Level up! You’ve mastered ${cur.name}. Next up: ${n.name} (${fmt(n.base)}).` }); }
        else if (p.sets < MAX_SETS) { p.sets++; p.reps = Math.round(ex.ceil * 0.75); changes.push({ kind: 'up', text: `${cur.name}: you topped out the reps, so we added a set (${p.sets} sets).` }); }
        else p.reps = ex.ceil;
      } else { p.reps = next; changes.push({ kind: 'up', text: `${cur.name}: consistent, controlled work — your next target is ${fmt(p.reps)} (+${fmt(ex.step)}).` }); }
    } else if (!full && (done.length < it.sets.length || ratio < 0.7)) {
      p.okStreak = 0; p.fails = (p.fails || 0) + 1;
      if (p.fails >= 2) {
        p.fails = 0;
        if (p.reps <= ex.base && p.lvl > 0) { p.lvl--; const e = EX[chain[p.lvl]]; p.reps = Math.round(e.base + (e.ceil - e.base) * 0.5); changes.push({ kind: 'down', text: `${cur.name} is still a stretch — stepping back to ${e.name} so you can build solid reps.` }); }
        else { const nr = Math.max(ex.base, Math.round(p.reps * 0.85)); p.reps = ex.type === 'time' ? Math.round(nr / 5) * 5 : nr; changes.push({ kind: 'down', text: `${cur.name} target eased to ${fmt(p.reps)}. Smart progress beats grinding.` }); }
      } else changes.push({ kind: 'hold', text: `${cur.name}: tough one. Same target next session — consistency will get you there.` });
    } else { p.okStreak = 0; }
  }
  workout.changes = changes; workout.applied = true;
  return changes;
}

// ---------- habits & stats
export const workoutsOn = (state, d) => (state.workouts || []).filter(w => w.date === d);
export function habitValue(state, h, d) { return state.logs?.[d]?.[h.id]; }
export function habitDone(state, h, d) {
  const v = habitValue(state, h, d);
  if (h.auto === 'workout' && workoutsOn(state, d).length) return true;
  if (h.target) return (+v || 0) >= h.target;
  return !!v;
}
export const activeHabits = (state, d) => state.habits.filter(h => !h.archived && (!h.created || h.created <= d));
export function dayCompletion(state, d) {
  const hs = activeHabits(state, d); if (!hs.length) return 0;
  return hs.filter(h => habitDone(state, h, d)).length / hs.length;
}
export function habitStreak(state, h, today) {
  const count = start => { let n = 0; for (let d = start; habitDone(state, h, d); d = addDays(d, -1)) n++; return n; };
  const cur = habitDone(state, h, today) ? count(today) : count(addDays(today, -1));
  let best = 0, run = 0;
  const from = h.created || addDays(today, -365);
  for (let d = from; d <= today; d = addDays(d, 1)) { if (habitDone(state, h, d)) { run++; best = Math.max(best, run); } else run = 0; }
  return { cur, best };
}
export function habitRate(state, h, today, days) {
  let n = 0, tot = 0;
  for (let i = 0; i < days; i++) { const d = addDays(today, -i); if (h.created && d < h.created) continue; tot++; if (habitDone(state, h, d)) n++; }
  return tot ? n / tot : 0;
}
export const activeDay = (state, d) => workoutsOn(state, d).length > 0 || activeHabits(state, d).some(h => h.auto !== 'workout' && habitDone(state, h, d));
export function streak(state, today) {
  const count = start => { let n = 0; for (let d = start; activeDay(state, d); d = addDays(d, -1)) n++; return n; };
  const cur = activeDay(state, today) ? count(today) : count(addDays(today, -1));
  const first = [...(state.workouts || []).map(w => w.date), ...Object.keys(state.logs || {})].sort()[0];
  let best = 0, run = 0;
  if (first) for (let d = first; d <= today; d = addDays(d, 1)) { if (activeDay(state, d)) { run++; best = Math.max(best, run); } else run = 0; }
  return { cur, best };
}
export function weeklyScore(state, today) {
  const lv = LV[state.profile.level] ?? 0, target = [3, 5, 6][lv];
  let w = 0, hab = 0, act = 0, daysCounted = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, -i);
    if (workoutsOn(state, d).length) w++;
    if (activeDay(state, d)) act++;
    hab += dayCompletion(state, d); daysCounted++;
  }
  const parts = { workouts: Math.min(1, w / target), habits: hab / daysCounted, consistency: act / 7 };
  const score = Math.round(parts.workouts * 50 + parts.habits * 35 + parts.consistency * 15);
  return { score, parts, workouts: w, target };
}
export function daysSinceActive(state, today) {
  for (let i = 0; i < 400; i++) if (activeDay(state, addDays(today, -i))) return i;
  return 999;
}

// ---------- series for charts
export function workoutsPerWeek(state, today, weeks = 8) {
  const out = [];
  for (let k = weeks - 1; k >= 0; k--) {
    const end = addDays(today, -7 * k); let n = 0;
    for (let i = 0; i < 7; i++) n += workoutsOn(state, addDays(end, -i)).length ? 1 : 0;
    out.push({ label: addDays(end, -6).slice(5), v: n });
  }
  return out;
}
export function habitDaily(state, today, days = 30) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) { const d = addDays(today, -i); out.push({ label: d.slice(5), v: Math.round(dayCompletion(state, d) * 100) }); }
  return out;
}
export function bestSetSeries(state, chain) {
  const equip = state.profile.equip || [];
  const ids = new Set(dynamicChain(chain, equip));
  return (state.workouts || []).filter(w => w.items.some(i => ids.has(i.exId) && i.role === 'main')).sort((a, b) => a.date.localeCompare(b.date)).map(w => {
    const it = w.items.find(i => ids.has(i.exId) && i.role === 'main');
    const best = Math.max(0, ...it.sets.filter(s => s.done).map(s => +s.reps || 0));
    return { date: w.date, v: best, ex: EX[it.exId].name };
  }).filter(x => x.v > 0);
}

// ---------- motivation (rule-based, deterministic per day)
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export function motivation(state, today) {
  const d = diffDays(state.settings.weddingDate, today);
  const away = daysSinceActive(state, today);
  const st = streak(state, today);
  const pool = [];
  if (!state.workouts.length && away > 30) pool.push('Day one is the hardest and the most important. Today, just do the first session — we’ll build from there.');
  else if (away >= 3 && away < 30) pool.push('Welcome back. One easy session today restarts everything — no catching up, no guilt.', 'Missing days doesn’t erase progress. Start small today and the rhythm will return.');
  if (st.cur >= 7) pool.push(`${st.cur} active days in a row — that’s real discipline, and it shows in how you move.`);
  else if (st.cur >= 3) pool.push(`${st.cur} days of showing up. Consistency, not intensity, is what changes your body.`);
  if (d > 0 && d <= 35) pool.push(`${d} days to go. Every session between now and then is a gift to your wedding-day self.`);
  if (d > 35) pool.push(`${Math.floor(d / 7)} weeks until the wedding — plenty of time for steady, sustainable progress.`);
  pool.push('Do it for the person you’ll be standing next to on 9 December — and for the person you’ll be afterwards.', 'You don’t need a perfect day. You need a day you showed up.', 'Strong is built one calm, repeatable rep at a time.', 'Rest is training too. Protect your sleep tonight.');
  return pool[hash(today) % pool.length];
}

// ---------- pluggable planner (swap in an external AI service here; rule-based is the default and the fallback)
export const plannerProvider = {
  name: 'rule-based',
  async plan(state, date, opts) { return planFor(state, date, true, opts); },
};

export const currentEx = (state, chain) => { const c = dynamicChain(chain, state.profile.equip || []); return EX[c[Math.min(state.prog?.[chain]?.lvl ?? 0, c.length - 1)]]; };
export { dynamicChain };

// ---------- mobility, walking, weekly report
export const MOBILITY_FOCUS = new Set(['posture', 'cardioflex', 'recovery']);
export function mobilityDone(state, d) {
  return workoutsOn(state, d).some(w => MOBILITY_FOCUS.has(w.focus) || w.items.filter(i => i.role === 'mob' && i.sets.some(s => s.done)).length >= 3);
}
export function mobilityDays(state, today, days = 7) { let n = 0; for (let i = 0; i < days; i++) if (mobilityDone(state, addDays(today, -i))) n++; return n; }
export function walkStats(state, today) {
  let stepsSum = 0, stepsDays = 0, walkSec = 0, walkDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, -i), st = +state.logs?.[d]?.steps || 0;
    if (st > 0) { stepsSum += st; stepsDays++; }
    let sec = 0;
    workoutsOn(state, d).forEach(w => w.items.forEach(it => { if (it.exId === 'walk' || it.exId === 'walkGentle') sec += it.sets.reduce((a, s) => a + (s.done ? +s.reps || 0 : 0), 0); }));
    walkSec += sec; if (sec) walkDays++;
  }
  return { stepsToday: +state.logs?.[today]?.steps || 0, avgSteps: stepsDays ? Math.round(stepsSum / stepsDays) : 0, walkMin: Math.round(walkSec / 60), walkDays };
}
export const mondayOf = (d, offset = 0) => addDays(d, -((parse(d).getDay() + 6) % 7) + 7 * offset);
export function weeklyReport(state, today, offset = 0) {
  const start = mondayOf(today, offset), days = Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter(d => d <= today && (!state.settings?.startDate || d >= state.settings.startDate));
  const ws = state.workouts.filter(w => days.includes(w.date));
  const scheduled = days.filter(d => WEEK[parse(d).getDay()] !== 'recovery').length;
  const strength = ws.filter(w => STRENGTH.has(w.focus)).length;
  const hab = days.reduce((a, d) => a + dayCompletion(state, d), 0) / Math.max(1, days.length);
  const rds = days.map(d => readiness(state.checkins?.[d])).filter(v => v != null);
  const changes = ws.flatMap(w => w.changes || []).filter(c => ['up', 'level', 'pr'].includes(c.kind));
  const hardN = ws.filter(w => w.rpe === 'hard').length;
  const mob = days.filter(d => mobilityDone(state, d)).length;
  const walk = walkStats(state, days.length ? days[days.length - 1] : today);
  const best = ex => Math.max(0, ...ws.flatMap(w => w.items.filter(i => i.exId === ex).flatMap(i => i.sets.filter(s => s.done).map(s => +s.reps || 0))));
  const r = { start, days: days.length, sessions: ws.length, scheduled, strength, habits: hab, readiness: rds.length ? +(rds.reduce((a, b) => a + b, 0) / rds.length).toFixed(1) : null, changes, mobility: mob, walk, hardN, minutes: Math.round(ws.reduce((a, w) => a + (w.durationSec || 0), 0) / 60), pushBest: Math.max(best('pushup'), best('inclinePush')), plankBest: best('plank'), notes: [] };
  if (r.sessions >= r.scheduled - 1 && r.scheduled) r.notes.push('Excellent consistency — you completed nearly every planned session.');
  else if (r.sessions >= 3) r.notes.push('Solid week. Keep protecting the sessions that matter most: strength days and one mobility day.');
  else r.notes.push('A lighter week happens. No catching up — just do the next planned session and the rhythm returns.');
  if (hardN >= 2 || (r.readiness != null && r.readiness <= 2.6)) r.notes.push('Recovery looks stretched. Consider a deload: fewer sets for a few days, earlier bedtime, and more walking.');
  else if (r.readiness != null && r.readiness >= 3.8) r.notes.push('Readiness is high — your body is absorbing the training well.');
  if (mob < 3) r.notes.push('Aim for at least three posture/mobility sessions a week (Wednesday, Saturday and Sunday are built for it).');
  if (changes.some(c => c.kind === 'level' || c.kind === 'up')) r.notes.push('You progressed this week — the coach raised targets where your performance was consistent and controlled.');
  return r;
}
export const dowName = d => parse(d).toLocaleDateString('en-GB', { weekday: 'long' });

export const WEEKDAY_FOCUS = d => WEEK[parse(d).getDay()];
