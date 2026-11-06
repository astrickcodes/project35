// Interactive workout player: single overlay screen — demo, sets, rest timer, pause, summary.
import { EX } from './data.js';
import { icon, esc, figure, ring } from './lib.js';
import { guideHtml, shortCues, videoUrl, MEDIA } from './guide.js';

let C = null, P = null, tickId = null, wake = null, audio = null;
const root = () => document.getElementById('player');
const cur = () => P.steps[P.i];
const isPrep = st => st.it.role !== 'main';
const mmss = s => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const unitOf = it => (it.type === 'time' ? 's' : '');

export function openPlayer(ctx, plan) {
  C = ctx;
  const saved = C.S.session && C.S.session.date === plan.date && !plan.extra ? C.S.session : null;
  if (saved) { P = saved; P.paused = false; P.phase = P.phase === 'summary' ? 'work' : 'work'; P.tRun = false; }
  else P = build(plan);
  P.last = Date.now(); P.reps = cur().it.target; initWeight(); P.setAct = P.activeMs;
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume?.(); } catch (e) {}
  try { navigator.wakeLock?.request('screen').then(w => { wake = w; }).catch(() => {}); } catch (e) {}
  document.body.style.overflow = 'hidden';
  root().hidden = false;
  clearInterval(tickId); tickId = setInterval(tick, 250);
  autoStart(); draw();
}

function build(plan) {
  const mk = (it, role) => ({ ...it, role, nSets: it.sets, sets: Array.from({ length: it.sets }, () => ({ reps: null, done: false })) });
  const steps = [
    ...plan.warm.map(it => ({ g: 'Warm-up', it: mk(it, 'prep') })),
    ...plan.main.map(it => ({ g: plan.kind === 'train' ? 'Workout' : 'Session', it: mk(it, it.role === 'main' ? 'main' : 'mob') })),
    ...(plan.mob || []).map(it => ({ g: 'Mobility', it: mk(it, 'mob') })),
    ...plan.cool.map(it => ({ g: 'Cool-down', it: mk(it, 'prep') })),
  ];
  return { date: plan.date, plan: { focus: plan.focus, title: plan.title, kind: plan.kind }, extra: !!plan.extra, steps, i: 0, set: 0, phase: 'work', activeMs: 0, startedAt: Date.now(), paused: false };
}

function beep(long) {
  try {
    if (!audio) return; const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = long ? 988 : 660; o.connect(g); g.connect(audio.destination);
    g.gain.setValueAtTime(0.0001, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + (long ? 0.5 : 0.15));
    o.start(); o.stop(audio.currentTime + (long ? 0.55 : 0.2));
  } catch (e) {}
  if (long) navigator.vibrate?.([180, 80, 180]);
}
const saveSession = () => { if (!P.extra) { C.S.session = P; C.persist(); } };

function initWeight() {
  const it = cur().it; P.weight = it.load ? (it.sets.filter(s => s.weight).slice(-1)[0]?.weight ?? it.lastLoad ?? '') : '';
}
function autoStart() {
  const st = cur(), prev = P.steps[P.i - 1];
  if (st.it.type === 'time' && isPrep(st) && prev && isPrep(prev)) startTimer();
}
function startTimer() {
  const it = cur().it; P.tTotal = it.target; P.tEnd = Date.now() + it.target * 1000; P.tRun = true; P.tStart = Date.now();
}
function stopTimer() { P.tRun = false; }

function tick() {
  if (!P || P.phase === 'summary') return;
  const now = Date.now();
  if (P.paused) { P.last = now; return; }
  P.activeMs += now - P.last; P.last = now;
  const el = document.getElementById('elapsed'); if (el) el.textContent = mmss(Math.round(P.activeMs / 1000));
  if (P.phase === 'work' && P.tRun) {
    const rem = Math.ceil((P.tEnd - now) / 1000);
    if (rem !== P.lastShown) { if (rem <= 3 && rem > 0) beep(false); P.lastShown = rem; }
    setTimerUI(rem, P.tTotal);
    if (P.tEnd - now <= 0) { beep(true); completeSet(cur().it.target); }
  } else if (P.phase === 'rest') {
    const rem = Math.ceil((P.restEnd - now) / 1000);
    if (rem !== P.lastShown) { if (rem <= 3 && rem > 0) beep(false); P.lastShown = rem; }
    setTimerUI(rem, P.restTotal);
    if (P.restEnd - now <= 0) { beep(true); endRest(); }
  }
}
function setTimerUI(rem, total) {
  const t = document.getElementById('tm'); if (t) t.textContent = P.phase === 'rest' ? Math.max(0, rem) : mmss(Math.max(0, rem));
  const fg = document.querySelector('#player .ring-fg');
  if (fg) { const c = +fg.getAttribute('stroke-dasharray'); fg.setAttribute('stroke-dashoffset', c * (1 - Math.max(0, rem) / total)); }
}

// ---------- state transitions
function completeSet(reps) {
  const st = cur(), it = st.it;
  it.sets[P.set] = { reps: Math.max(0, Math.round(reps)), done: true, workSec: Math.max(1, Math.round((P.activeMs - (P.setAct || 0)) / 1000)) };
  if (it.load && +P.weight > 0) it.sets[P.set].weight = +P.weight;
  stopTimer();
  const lastSet = P.set >= it.sets.length - 1;
  let next = null;
  if (!lastSet) next = { i: P.i, set: P.set + 1 }; else if (P.i < P.steps.length - 1) next = { i: P.i + 1, set: 0 };
  saveSession();
  if (!next) return toSummary();
  const nextStep = P.steps[next.i];
  if (it.role === 'main' && it.rest > 0) {
    P.next = next; P.phase = 'rest'; P.restTotal = nextStep.it.role === 'main' ? it.rest : Math.min(20, it.rest);
    P.restEnd = Date.now() + P.restTotal * 1000; P.lastShown = null; draw();
  } else go(next);
}
function go(next) {
  P.i = next.i; P.set = next.set; P.phase = 'work'; P.reps = cur().it.target; P.tRun = false; P.lastShown = null; P.setAct = P.activeMs; initWeight(); autoStart(); saveSession(); draw();
}
function endRest() {
  const it = cur().it, s = it.sets[P.set]; if (s) s.restSec = Math.max(0, Math.round(P.restTotal - Math.max(0, (P.restEnd - Date.now()) / 1000)));
  go(P.next);
}
function jump(idx) {
  if (idx < 0) return;
  if (idx >= P.steps.length) return toSummary();
  const it = P.steps[idx].it, firstUndone = it.sets.findIndex(s => !s.done);
  go({ i: idx, set: firstUndone < 0 ? it.sets.length - 1 : firstUndone });
}
function swapEasier() {
  const it = cur().it, id = C.E.easierFor(C.S, it);
  if (!id) return C.toast('This is already the easiest version.');
  const ex = EX[id];
  it.origEx = it.exId; it.exId = id; it.swapped = true; it.type = ex.type;
  it.target = Math.round(ex.base + (ex.ceil - ex.base) * 0.4);
  if (ex.type === 'time') it.target = Math.max(10, Math.round(it.target / 5) * 5);
  P.reps = it.target; stopTimer(); saveSession(); draw(); C.toast(`Swapped to ${ex.name}. No problem — that’s smart training.`);
}
function pause() {
  if (P.paused) return;
  P.paused = true; const now = Date.now();
  if (P.tRun) P.tRemain = P.tEnd - now;
  if (P.phase === 'rest') P.restRemain = P.restEnd - now;
  draw();
}
function resume() {
  const now = Date.now(); P.paused = false; P.last = now;
  if (P.tRun) P.tEnd = now + P.tRemain;
  if (P.phase === 'rest') P.restEnd = now + P.restRemain;
  draw();
}
function toSummary() {
  stopTimer(); P.phase = 'summary';
  const items = P.steps.map(s => ({ exId: s.it.exId, chain: s.it.chain, target: s.it.target, type: s.it.type, role: s.it.role, sets: s.it.sets, rpe: s.it.rpe || null, swapped: !!s.it.swapped, noProg: !!s.it.noProg, scaled: !!s.it.scaled }));
  const doneSets = items.reduce((a, i) => a + i.sets.filter(s => s.done).length, 0);
  P.changes = [];
  if (doneSets === 0) { P.empty = true; C.S.session = null; C.persist(); return draw(); }
  const w = { id: Date.now(), date: P.date, focus: P.plan.focus, title: P.plan.title, kind: P.plan.kind, startedAt: P.startedAt, durationSec: Math.round(P.activeMs / 1000), items, completed: true };
  if (!P.extra) { C.S.workouts.push(w); P.changes = C.E.applyResult(C.S, w); }
  P.workout = w; C.S.session = null; C.persist(); draw();
}
function feel(v) {
  const w = P.workout; if (!w || w.rpe) return; w.rpe = v;
  if (v === 'easy') C.toast('Noted — if the next session also feels controlled, the coach will progress you.');
  else if (v === 'hard') C.toast('Noted — the next session will be a touch lighter.');
  else C.toast('Perfect — that’s the sweet spot.');
  C.persist(); draw();
}
function close() {
  clearInterval(tickId); tickId = null; wake?.release?.().catch(() => {}); wake = null;
  document.body.style.overflow = ''; root().hidden = true; root().innerHTML = '';
  P = null; C.onClose?.();
}
function quitMenu() {
  P.paused || pause();
  const ov = document.createElement('div'); ov.className = 'pause-ov'; ov.id = 'quit';
  const saved = !P.extra;
  ov.innerHTML = `<h2>Leave workout?</h2><p class="muted" style="text-align:center">Your logged sets are safe.</p><div class="col" style="width:100%;max-width:340px">
    <button class="btn" data-p="keep">Keep going</button>
    <button class="btn sec" data-p="finish">Finish & save what I’ve done</button>
    ${saved ? '<button class="btn sec" data-p="later">Exit — resume later</button>' : ''}
    <button class="btn danger" data-p="discard">Discard workout</button></div>`;
  root().appendChild(ov);
}

// ---------- drawing
const chips = ex => ex.muscles.split(',').map(m => { m = m.trim(); return `<span class="pill neutral">${esc(m[0].toUpperCase() + m.slice(1))}</span>`; }).join('');
function header() {
  const st = cur(), grp = P.steps.filter(s => s.g === st.g), idx = grp.indexOf(st) + 1;
  return `<div class="pl-top"><button class="icon-btn" data-p="quit" aria-label="Close workout">${icon('close', 22)}</button>
    <div class="grow" style="text-align:center"><div class="pl-phase">${st.g} · ${idx}/${grp.length}</div><div class="muted small" id="elapsed">${mmss(Math.round(P.activeMs / 1000))}</div></div>
    <button class="icon-btn" data-p="pause" aria-label="Pause">${icon('pause', 22)}</button></div>
    <div class="segs">${P.steps.map((s, i) => `<i class="${i < P.i ? 'done' : i === P.i ? 'cur' : ''}"></i>`).join('')}</div>`;
}
function draw() {
  const r = root();
  if (P.phase === 'summary') return drawSummary(r);
  const st = cur(), it = st.it, ex = EX[it.exId], timeSet = it.type === 'time', prep = isPrep(st);
  if (P.phase === 'rest') {
    const nx = P.steps[P.next.i], nex = EX[nx.it.exId], sameEx = P.next.i === P.i;
    r.innerHTML = `<div class="pl">${header()}
      <div class="rest-wrap"><div class="pl-phase">Rest</div>${ring(1, { size: 220, stroke: 12, label: `<span id="tm" style="font-size:64px;letter-spacing:-.04em">${Math.max(0, Math.ceil((P.restEnd - Date.now()) / 1000))}</span>`, sub: 'seconds' })}
      <p class="muted" style="text-align:center">${sameEx ? 'Shake it out, breathe slowly.' : 'Nice work. Get into position for the next exercise.'}</p>
      ${sameEx ? '' : (P.rateIdx = P.i, `<div class="small muted" style="text-align:center;margin-top:-4px">How did ${esc(EX[it.exId].name)} feel?</div><div class="rate-row">${[['easy', 'Easy'], ['right', 'Just right'], ['hard', 'Hard']].map(([v, l]) => `<button data-p="rate" data-v="${v}" class="${it.rpe === v ? 'on' : ''}">${l}</button>`).join('')}</div>`)}
      <div class="next-up">${figure(nex)}<div class="grow"><div class="eyebrow">Up next</div><b style="font-size:18px">${esc(nex.name)}</b><div class="muted small">${sameEx ? `Set ${P.next.set + 1} of ${nx.it.sets.length}` : `${nx.it.sets.length}×${nx.it.target}${unitOf(nx.it)}`}</div></div></div></div>
      <div class="pl-bottom"><div class="grid2"><button class="btn sec" data-p="rest+">+15 s</button><button class="btn xl" data-p="skiprest" style="min-height:56px">Skip rest</button></div></div></div>`;
    setTimerUI(Math.ceil((P.restEnd - Date.now()) / 1000), P.restTotal);
    return;
  }
  const hasEasier = it.role === 'main' && !it.sets.some(s => s.done);
  const uni = ex.unilateral ? ' each side' : '';
  const setIdx = P.set;
  r.innerHTML = `<div class="pl">${header()}
    <h1 class="pl-name">${esc(ex.name)}</h1>
    <div class="pl-target">${it.sets.length > 1 ? `${it.sets.length} sets × ` : ''}${it.target}${timeSet ? ' sec' : ' reps'}${uni}${it.role === 'main' ? ` · rest ${it.rest}s` : ''}${it.swapped ? ' · <span class="accent">easier version</span>' : ''}</div>
    <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">${chips(ex)}</div>
    <div class="pl-fig">${MEDIA.has(it.exId) ? `<img class="demo-gif" src="media/${it.exId}.gif" alt="${esc(ex.name)} demonstration"><span class="credit">© Gym visual</span>` : figure(ex)}</div>
    ${it.sets.length > 1 ? `<div class="setchips">${it.sets.map((s, i) => `<div class="setchip ${s.done ? 'done' : i === setIdx ? 'cur' : ''}"><span>Set ${i + 1}</span><b>${s.done ? s.reps + unitOf(it) : '–'}</b></div>`).join('')}</div>` : ''}
    ${timeSet ? `<div class="bigtime" id="tm">${mmss(P.tRun ? Math.max(0, Math.ceil((P.tEnd - Date.now()) / 1000)) : it.target)}</div>
        <div style="display:flex;justify-content:center;margin:4px 0 8px">${ring(P.tRun ? Math.max(0, (P.tEnd - Date.now()) / 1000 / P.tTotal) : 1, { size: 96, stroke: 7, label: '', sub: '' })}</div>` :
      `<div class="stepper"><button data-p="rep-" aria-label="Fewer reps">${icon('minus', 28)}</button><output id="reps" aria-live="polite">${P.reps}</output><button data-p="rep+" aria-label="More reps">${icon('plus', 28)}</button></div>
       <p class="muted small" style="text-align:center;margin-top:-6px">Reps you actually completed${uni}</p>`}
    ${it.load ? `<div class="weight-in"><button class="icon-btn" data-p="wt-" aria-label="Lighter">${icon('minus', 20)}</button><input id="wt" type="number" step="0.5" inputmode="decimal" placeholder="kg" value="${P.weight ?? ''}" aria-label="Dumbbell weight in kg"><span class="muted">kg each</span><button class="icon-btn" data-p="wt+" aria-label="Heavier">${icon('plus', 20)}</button></div>
      <p class="hint" style="text-align:center;margin:-4px 0 8px">${it.loadUp ? 'You’ve earned a heavier dumbbell — go up one small step. ' : P.weight ? '' : 'Pick a load that leaves 2–3 reps in reserve. '}</p>` : ''}
    <ul class="cues">${shortCues(ex).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <button class="btn sec sm info-btn" data-p="info">${icon('info', 18)} How to do it · full details</button>
    <div class="pl-bottom">
      ${timeSet ? (P.tRun ? `<button class="btn xl" data-p="finish-early">${icon('check', 22)} Finish now</button>` : `<button class="btn xl" data-p="start-timer">${icon('play', 22)} Start ${it.target}s timer</button>${prep ? '' : `<button class="btn sec" data-p="manual">I did it — log ${it.target}s</button>`}`)
        : `<button class="btn xl" data-p="done-set">${icon('check', 22)} Complete set ${setIdx + 1}</button>`}
      <div class="grid2"><button class="btn sec sm" data-p="prev" ${P.i === 0 ? 'disabled' : ''} style="width:100%">${icon('prev', 18)} Previous</button><button class="btn sec sm" data-p="next" style="width:100%">${P.i === P.steps.length - 1 ? 'Finish' : 'Next exercise'} ${icon('next', 18)}</button></div>
      <button class="btn ghost sm" style="align-self:center" data-p="opts">More options · easier · skip · sets</button>
    </div></div>`;
}
function drawSummary(r) {
  if (P.empty) { r.innerHTML = `<div class="pl"><div style="margin:auto;text-align:center" class="col"><h1>No sets logged</h1><p class="muted">That’s fine — showing up another day counts. Nothing was saved.</p><button class="btn" data-p="close">Back to dashboard</button></div></div>`; return; }
  const w = P.workout, main = w.items.filter(i => i.role === 'main');
  const sets = main.reduce((a, i) => a + i.sets.filter(s => s.done).length, 0), tot = main.reduce((a, i) => a + i.sets.length, 0);
  const reps = main.filter(i => i.type === 'reps').reduce((a, i) => a + i.sets.reduce((b, s) => b + (s.done ? s.reps : 0), 0), 0);
  const hold = main.filter(i => i.type === 'time').reduce((a, i) => a + i.sets.reduce((b, s) => b + (s.done ? s.reps : 0), 0), 0);
  const prepDone = w.items.filter(i => i.role === 'prep' && i.sets.every(s => s.done)).length;
  const full = tot && sets === tot;
  r.innerHTML = `<div class="pl"><div style="height:8px"></div>
    <div class="pl-phase">Workout complete</div><h1 style="font-size:34px;margin:6px 0">${full || !tot ? 'Great work.' : 'Good work showing up.'}</h1>
    <p class="muted">${esc(w.title)} · ${full || !tot ? 'every planned set done.' : `${sets} of ${tot} sets — a partial session still counts.`}</p>
    <div class="sum-grid"><div class="kpi"><span class="muted small">Duration</span><b>${Math.max(1, Math.round(w.durationSec / 60))} min</b></div><div class="kpi"><span class="muted small">Sets completed</span><b>${tot ? sets + '/' + tot : prepDone + ' moves'}</b></div>
      ${tot ? `<div class="kpi"><span class="muted small">Total reps</span><b>${reps}</b></div><div class="kpi"><span class="muted small">Hold time</span><b>${hold}s</b></div>` : ''}</div>
    ${P.changes.length ? `<h3 style="margin:6px 0">Coach notes</h3>${P.changes.map(c => `<div class="note ${['up', 'level', 'pr'].includes(c.kind) ? 'up' : ''}">${esc(c.text)}</div>`).join('')}` : (P.extra ? '' : '<div class="note">Logged. The coach will compare today with your next session before changing targets.</div>')}
    ${tot ? `<h3 style="margin:18px 0 6px">How did it feel?</h3><div class="seg">${[['easy', 'Too easy'], ['right', 'Just right'], ['hard', 'Too hard']].map(([v, l]) => `<button data-p="feel" data-v="${v}" class="${w.rpe === v ? 'on' : ''}">${l}</button>`).join('')}</div>` : ''}
    <div class="pl-bottom"><button class="btn xl" data-p="close">Done</button></div></div>`;
}

// ---------- events
document.addEventListener('input', e => { if (e.target.id === 'wt' && P) P.weight = e.target.value; });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-p]'); if (!b || !P || root().hidden) return;
  const a = b.dataset.p, it = P.phase !== 'summary' ? cur()?.it : null;
  const q = document.getElementById('quit');
  switch (a) {
    case 'quit': quitMenu(); break;
    case 'keep': q?.remove(); resume(); break;
    case 'finish': q?.remove(); P.paused = false; toSummary(); break;
    case 'later': saveSession(); q?.remove(); close(); break;
    case 'discard': C.S.session = null; C.persist(); q?.remove(); close(); break;
    case 'pause': pause(); { const ov = document.createElement('div'); ov.className = 'pause-ov'; ov.id = 'pausev'; ov.innerHTML = `<h1>Paused</h1><p class="muted">Take your time. Timers are frozen.</p><button class="btn xl" data-p="resume" style="max-width:340px">${icon('play', 22)} Resume</button>`; root().appendChild(ov); } break;
    case 'resume': document.getElementById('pausev')?.remove(); resume(); break;
    case 'rep-': P.reps = Math.max(0, P.reps - 1); document.getElementById('reps').textContent = P.reps; break;
    case 'rep+': P.reps = Math.min(999, P.reps + 1); document.getElementById('reps').textContent = P.reps; break;
    case 'done-set': completeSet(P.reps); break;
    case 'start-timer': startTimer(); draw(); break;
    case 'finish-early': completeSet(Math.max(1, Math.round((Date.now() - P.tStart) / 1000))); break;
    case 'manual': completeSet(it.target); break;
    case 'skiprest': endRest(); break;
    case 'rest+': P.restEnd += 15000; P.restTotal += 15; break;
    case 'prev': jump(P.i - 1); break;
    case 'next': jump(P.i + 1); break;
    case 'info': { P.paused || pause(); const ov = document.createElement('div'); ov.className = 'pause-ov info-ov'; ov.id = 'infov';
      const seen = (C.S.workouts || []).some(w => w.items?.some(i => i.exId === it.exId));
      ov.innerHTML = `<div class="info-sheet"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">${esc(EX[it.exId].name)}</h2><button class="icon-btn" data-p="infoclose" aria-label="Close">${icon('close', 20)}</button></div>
        <a class="btn sec sm vid-btn" href="${videoUrl(EX[it.exId])}" target="_blank" rel="noopener">▶ Watch a video demo (needs internet)</a>${guideHtml(EX[it.exId], esc, { first: true })}<button class="btn xl" data-p="infoclose" style="margin-top:14px">Got it</button></div>`; root().appendChild(ov); } break;
    case 'infoclose': document.getElementById('infov')?.remove(); resume(); break;
    case 'opts': { P.paused || pause(); const ov = document.createElement('div'); ov.className = 'pause-ov'; ov.id = 'optsv';
      ov.innerHTML = `<h2>${esc(EX[it.exId].name)}</h2><div class="col" style="width:100%;max-width:340px">${it.role === 'main' && !it.sets.some(s => s.done) ? '<button class="btn sec" data-p="easier">Too hard? Easier version</button>' : ''}<button class="btn sec" data-p="skip">Skip this exercise</button>${it.role === 'main' ? '<button class="btn sec" data-p="addset">+ Add a set</button><button class="btn sec" data-p="dropset">− Remove last set</button>' : ''}<button class="btn" data-p="optsclose">Back to workout</button></div>`;
      root().appendChild(ov); break; }
    case 'optsclose': document.getElementById('optsv')?.remove(); resume(); break;
    case 'easier': document.getElementById('optsv')?.remove(); resume(); swapEasier(); break;
    case 'skip': document.getElementById('optsv')?.remove(); resume(); it.skipped = true; C.toast(`Skipped ${EX[it.exId].name} — no problem.`); jump(P.i + 1); break;
    case 'addset': it.sets.push({ reps: null, done: false }); saveSession(); document.getElementById('optsv')?.remove(); resume(); break;
    case 'dropset': if (it.sets.length > 1 && !it.sets[it.sets.length - 1].done) { it.sets.pop(); if (P.set >= it.sets.length) P.set = it.sets.length - 1; saveSession(); } document.getElementById('optsv')?.remove(); resume(); break;
    case 'wt-': P.weight = Math.max(0, +((+P.weight || 0) - 0.5).toFixed(1)) || ''; document.getElementById('wt').value = P.weight; break;
    case 'wt+': P.weight = +((+P.weight || 0) + 0.5).toFixed(1); document.getElementById('wt').value = P.weight; break;
    case 'rate': { const prev = P.steps[P.rateIdx]; if (prev) { prev.it.rpe = b.dataset.v; saveSession(); document.querySelectorAll('.rate-row button').forEach(x => x.classList.toggle('on', x === b)); } break; }
    case 'feel': feel(b.dataset.v); break;
    case 'close': close(); break;
  }
});
