// Project 35 — main app: routing, views, state mutations.
import * as E from './engine.js';
import { EX, FOCUS, CHAIN_LABEL } from './data.js';
import { icon, esc, figure, lineChart, barChart, ring, HABIT_ICONS, load, save, DEFAULT_HABITS, defaultState, photoPut, photoDel, photoAll, resizeImage } from './lib.js';
import { openPlayer } from './player.js';

let S = load();
let view = 'today';
let habitDate = E.ymd();
let ob = null, obStep = 0;
const $ = s => document.querySelector(s);
const app = $('#app'), navEl = $('#nav');
const todayStr = () => E.ymd();
const persist = () => save(S);
const habitsFor = d => { const live = E.activeHabits(S, d); const open = S.habits.filter(h => !h.archived); return live.length === 0 || (d < todayStr() && live.length < open.length && open.every(h => h.created && h.created > d)) ? open : live; };
const num = v => (v === '' || v == null || isNaN(+v) ? null : +v);

// ---------- helpers
function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), ms); }
function applyTheme() {
  document.documentElement.dataset.theme = S.settings.theme;
  document.querySelector('meta[name=theme-color]').content = S.settings.theme === 'light' ? '#f3f5f3' : '#121513';
}
function sheet(html, onClose) {
  const w = $('#sheet'); w.hidden = false;
  w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  w.onclick = e => { if (e.target === w) closeSheet(); };
  w._onClose = onClose;
}
function closeSheet() { const w = $('#sheet'); w.hidden = true; w.innerHTML = ''; w._onClose?.(); w._onClose = null; }
const fmtDate = (d, o = { weekday: 'long', day: 'numeric', month: 'long' }) => E.parse(d).toLocaleDateString('en-GB', o);
const fmtMin = s => `${Math.max(1, Math.round(s / 60))} min`;
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const pct = v => Math.round(v * 100);
const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(+n.toFixed(1));

// ---------- routing & rendering
const NAV = [['today', 'Today', 'home'], ['habits', 'Habits', 'habits'], ['progress', 'Progress', 'progress'], ['settings', 'Settings', 'settings']];
function go(v) { view = v; render(); window.scrollTo(0, 0); }
function render() {
  applyTheme();
  if (!S.onboarded) { navEl.classList.add('hide'); return renderOnboarding(); }
  navEl.classList.remove('hide');
  navEl.innerHTML = `<div class="inner">${NAV.map(([id, l, ic]) => `<button data-act="nav" data-v="${id}" class="${view === id ? 'on' : ''}" aria-label="${l}" ${view === id ? 'aria-current="page"' : ''}>${icon(ic, 22)}<span>${l}</span></button>`).join('')}</div>`;
  ({ today: renderToday, habits: renderHabits, progress: renderProgress, settings: renderSettings })[view]();
  if (view === 'progress') loadPhotos();
}

// ---------- onboarding / profile form
const GOALS = ['Get stronger', 'Build muscle (toned)', 'Improve posture', 'More flexibility', 'Look great for the wedding', 'Build a daily routine'];
const EQUIP = [['dumbbells', 'Dumbbells'], ['bands', 'Resistance bands'], ['bar', 'Pull-up bar']];
const newDraft = () => ({ age: '', heightCm: '', weightKg: '', level: 'intermediate', pushups: '', squats: '', plank: '', pullups: 0, equip: ['dumbbells'], minutes: 30, avoid: '', dumbbells: '', pullupModule: false, goals: ['Improve overall fitness', 'Improve posture', 'More flexibility'], wake: S.settings.wakeTime, wedding: S.settings.weddingDate });
const seg = (k, opts, cur) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-act="ob-set" data-k="${k}" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
const field = (k, label, type = 'number', ph = '', extra = '') => `<div><label class="f" for="f-${k}">${label}</label><input id="f-${k}" type="${type}" inputmode="${type === 'number' ? 'decimal' : 'text'}" data-k="${k}" value="${esc(ob[k] ?? '')}" placeholder="${ph}" ${extra}></div>`;
function formSection(i) {
  if (i === 0) return `<h2>About you</h2><p class="muted small" style="margin:4px 0 14px">Body details are optional. Stored only on this device.</p>
    <div class="stack"><div class="grid2">${field('age', 'Age', 'number', 'years')}${field('heightCm', 'Height (cm)', 'number', 'cm')}</div>
    <div class="grid2">${field('weightKg', 'Weight (kg)', 'number', 'kg')}<div></div></div>
    <div><label class="f">Fitness level</label>${seg('level', [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']], ob.level)}</div></div>`;
  if (i === 1) return `<h2>Your baseline</h2><p class="muted small" style="margin:4px 0 14px">Starting estimates: 5 knee push-ups, 20 squats, 30-second plank. Update after a comfortable test; these are not measured results.</p>
    <div class="stack"><div class="grid2">${field('pushups', 'Max push-ups in a row', 'number', 'your best (5–10?)')}${field('squats', 'Max squats in a row', 'number', 'reps')}</div>
    <div class="grid2">${field('plank', 'Max plank (seconds)', 'number', 'seconds')}<div></div></div>
    <div><label class="f">Can you do pull-ups?</label>${seg('pullups', [[0, 'Not yet'], [2, '1–3'], [5, '4 or more']], ob.pullups)}</div></div>`;
  return `<h2>Your setup</h2><div class="stack" style="margin-top:14px">
    <div><label class="f">Available equipment <span class="dim">(bodyweight is always included)</span></label><div class="chips"><button type="button" class="chip ${!ob.equip.length ? 'on' : ''}" data-act="ob-equip" data-v="none">None</button>${EQUIP.map(([v, l]) => `<button type="button" class="chip ${ob.equip.includes(v) ? 'on' : ''}" data-act="ob-equip" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div><label class="f">Time available per day</label>${seg('minutes', [[15, '15'], [30, '30'], [45, '45'], [60, '60 min']], ob.minutes)}</div>
    <div><label class="f" for="f-avoid">Injuries, limitations or exercises to avoid <span class="dim">(blank = none)</span></label><textarea id="f-avoid" data-k="avoid" placeholder="None reported">${esc(ob.avoid)}</textarea><p class="hint">List only what to avoid. The coach swaps those exercises out.</p></div>
    <div><label class="f">Primary goals</label><div class="chips">${GOALS.map(g => `<button type="button" class="chip ${ob.goals.includes(g) ? 'on' : ''}" data-act="ob-goal" data-v="${g}">${g}</button>`).join('')}</div></div>
    ${ob.equip.includes('dumbbells') ? field('dumbbells', 'Dumbbell weights you own (kg) — optional', 'text', 'e.g. 5, 8, 10') : ''}
    <div class="list-row" style="border:0;padding:0"><div class="grow"><b>Pull-up development module</b><div class="hint" style="margin:0">Optional extra block on upper-body and back days. Works without a bar.</div></div><button type="button" class="switch ${ob.pullupModule ? 'on' : ''}" role="switch" aria-checked="${!!ob.pullupModule}" data-act="ob-pullmod"></button></div>
    <div class="grid2">${field('wake', 'Target wake-up time', 'time')}${field('wedding', 'Wedding date', 'date')}</div></div>`;
}
function renderOnboarding() {
  ob ||= newDraft();
  const last = obStep === 2;
  app.innerHTML = `<div class="ob"><div class="brand"><span class="logo">35</span>Project 35</div>
    <p class="muted small" style="margin-top:6px">The Better Me Challenge</p>
    <div class="steps">${[0, 1, 2].map(i => `<i class="${i <= obStep ? 'on' : ''}"></i>`).join('')}</div>
    ${obStep === 0 ? `<h1 style="margin-bottom:6px">Let’s build your plan.</h1><p class="muted" style="margin-bottom:22px">Three quick steps. Your coach uses these to choose exercises, sets and reps — then adapts as you improve.</p>` : ''}
    <div id="obform">${formSection(obStep)}</div>
    <div style="margin-top:auto;padding-top:24px" class="col">
      <button class="btn" data-act="ob-next">${last ? 'Create my programme' : 'Continue'}</button>
      ${obStep > 0 ? '<button class="btn ghost" data-act="ob-back">Back</button>' : ''}
    </div></div>`;
}
function validateDraft(step) {
  const req = { 0: [], 1: ['pushups', 'squats', 'plank'], 2: [] }[step];
  for (const k of req) if (num(ob[k]) == null || num(ob[k]) < 0) { toast('Please fill in every field (0 is fine).'); document.getElementById('f-' + k)?.focus(); return false; }
  if (step === 0 && num(ob.age) != null && (ob.age < 12 || ob.age > 100)) { toast('Please enter a valid age.'); return false; }
  if (step === 0 && ['heightCm', 'weightKg'].some(k => num(ob[k]) != null && num(ob[k]) <= 0)) { toast('Use a positive value, or leave body details blank.'); return false; }
  return true;
}
function finishOnboarding() {
  const t = todayStr();
  S.profile = cleanProfile(ob);
  S.settings.wakeTime = ob.wake || '06:30'; S.settings.weddingDate = ob.wedding || '2026-12-09'; S.settings.startDate ||= '2026-11-06';
  const water = S.profile.weightKg == null ? 2500 : Math.min(4500, Math.max(2000, Math.round(S.profile.weightKg * 35 / 250) * 250));
  S.settings.waterGoal = water;
  S.habits = DEFAULT_HABITS().map(h => ({ ...h, created: t }));
  S.habits.find(h => h.id === 'water').target = water;
  S.habits.find(h => h.id === 'read').name = 'Read for 20 minutes';
  S.prog = E.initProg(S.profile); S.loads = {};
  S.benchmarks = [{ date: t, pushups: S.profile.pushups, squats: S.profile.squats, plank: S.profile.plank, pullups: S.profile.pullups, baseline: true }];
  S.body = S.profile.weightKg == null ? [] : [{ date: t, weight: S.profile.weightKg }];
  S.onboarded = true; S.plans = {};
  E.planFor(S, t, true);
  persist(); ob = null; obStep = 0; view = 'today'; render();
  toast('Your programme is ready. Let’s go.');
}
const cleanProfile = d => ({ age: num(d.age), heightCm: num(d.heightCm), weightKg: num(d.weightKg), level: d.level, pushups: +d.pushups, squats: +d.squats, plank: +d.plank, pullups: +d.pullups, equip: [...d.equip], minutes: +d.minutes, avoid: d.avoid.trim(), dumbbells: (d.dumbbells || '').trim(), pullupModule: !!d.pullupModule, goals: [...d.goals] });

// ---------- Today
function workoutDoneToday(t) { return E.workoutsOn(S, t)[0]; }
const KIND_LABEL = { train: 'Today’s workout', posture: 'Posture & mobility', cardioflex: 'Cardio & flexibility', recovery: 'Recovery day', rest: 'Rest day' };
function weekDots(t) {
  const mon = E.mondayOf(t), L = 'MTWTFSS';
  return `<div class="wkdots">${Array.from({ length: 7 }, (_, i) => { const d = E.addDays(mon, i), done = E.workoutsOn(S, d).length, isT = d === t, isRest = E.parse(d).getDay() === 0; return `<span class="${done ? 'on' : ''} ${isT ? 'today' : ''} ${d > t ? 'future' : ''}" title="${d}">${L[i]}${done ? icon('check', 10) : ''}</span>`; }).join('')}</div>`;
}
function renderToday() {
  const t = todayStr(), wd = S.settings.weddingDate;
  const days = E.diffDays(wd, t);
  const plan = E.planFor(S, t); persist();
  const st = E.streak(S, t), ws = E.weeklyScore(S, t), comp = E.dayCompletion(S, t);
  const done = workoutDoneToday(t), pg = E.programme(S, t);
  const start = S.settings.startDate || t, total = Math.max(1, E.diffDays(wd, start)), prog = Math.min(1, Math.max(0, E.diffDays(t, start) / total));
  const away = E.daysSinceActive(S, t), hs = E.activeHabits(S, t), ci = S.checkins[t];
  const resumable = S.session && S.session.date === t && !done;
  const wk = E.weeklyReport(S, t), walk = E.walkStats(S, t), mobD = E.mobilityDays(S, t, 7);
  const pushEx = E.currentEx(S, 'push'), pp = S.prog.push, plk = S.prog.corePlank, plkEx = E.currentEx(S, 'corePlank');
  const bm = [...S.benchmarks].sort((a, b) => a.date.localeCompare(b.date));
  const bdelta = k => { const p = bm.filter(b => b[k] != null); return p.length > 1 ? changeText(p[0][k], p[p.length - 1][k], k === 'plank' ? 's' : '') : ''; };
  app.innerHTML = `
  <div class="page-head"><div><div class="eyebrow">${fmtDate(t)}</div><h1>Project 35</h1></div></div>
  ${away >= 3 && away < 400 && S.workouts.length ? `<div class="banner">${icon('heart', 20)}<span>Welcome back. No catching up needed — today’s plan is sized for where you are.</span></div>` : ''}
  <div class="stack">
  <section class="card hero" aria-label="Wedding countdown">
    <div class="eyebrow">Wedding countdown</div>
    ${days > 0 ? `<div class="row" style="align-items:baseline;margin-top:8px"><span class="big accent">${days}</span><span class="muted" style="font-size:18px">days to go</span></div>
      <p class="muted small" style="margin-top:6px">${fmtDate(wd, { day: 'numeric', month: 'long', year: 'numeric' })} · ${Math.floor(days / 7)} weeks ${days % 7} days</p>` :
      days === 0 ? `<div class="big accent" style="margin-top:8px;font-size:38px">Today’s the day.</div>` : `<div class="big accent" style="margin-top:8px;font-size:34px">Congratulations.</div>`}
    <div class="bar-track" style="margin-top:14px"><div class="bar-fill" style="width:${pct(prog)}%"></div></div>
    ${pg && !pg.before && !pg.complete && pg.phase ? `<button class="phase-row" data-act="programme-open"><span><b>Day ${pg.day} of 34</b> · ${pg.phase.name}</span><span class="accent small">View programme ›</span></button>` : ''}
    <p class="quote" style="margin-top:12px">${esc(E.motivation(S, t))}</p>
  </section>
  ${plan.pre ? `<div class="note">Programme starts ${fmtDate(S.settings.startDate)}. Your first circuit is ready to preview below.</div>` : ''}
  ${workoutCard(plan, done, resumable)}
  <div class="stats">
    <div class="stat">${ring(comp, { size: 62, stroke: 6, label: pct(comp) + '%' })}<small>Habits today</small></div>
    <div class="stat"><span class="accent">${icon('flame', 26)}</span><b>${st.cur}</b><small>day streak${st.best > st.cur ? ` · best ${st.best}` : ''}</small></div>
    <div class="stat">${ring(ws.score / 100, { size: 62, stroke: 6, label: ws.score })}<small>Weekly score</small></div>
  </div>
  ${!E.checkinDone(ci) ? checkinCard(ci) : `<div class="card row between" style="padding:14px 18px"><div><div class="eyebrow">Readiness check-in</div><p class="small muted" style="margin-top:2px">Energy ${ci.energy}/5 · Soreness ${ci.soreness}/5 · Sleep ${ci.sleep}/5 → <b>${E.readiness(ci)}/5</b></p></div><button class="btn sm sec" data-act="checkin-edit">Change</button></div>`}
  <section class="card"><div class="row between"><h2>This week</h2><button class="pill" data-act="report-open">Weekly report ›</button></div>
    ${weekDots(t)}
    <div class="kpis" style="margin-top:14px">
      <div class="kpi"><span class="muted small">Workouts</span><b>${wk.sessions}<span class="muted" style="font-size:15px;font-weight:600"> / ${wk.scheduled}</span></b><span class="tiny dim">sessions this week</span></div>
      <div class="kpi"><span class="muted small">Mobility consistency</span><b>${mobD}<span class="muted" style="font-size:15px;font-weight:600"> days</span></b><span class="tiny ${mobD >= 3 ? 'accent' : 'dim'}">${mobD >= 3 ? 'goal of 3 met' : 'goal: 3+ per week'}</span></div>
      <div class="kpi"><span class="muted small">Push-up progression</span><b style="font-size:18px">${esc(pushEx.name)}</b><span class="tiny dim">${pp.sets} × ${pp.reps} target${S.bests.pushup ? ` · best ${S.bests.pushup.v}` : ''}</span>${bdelta('pushups')}</div>
      <div class="kpi"><span class="muted small">Plank progression</span><b style="font-size:18px">${plkEx.name}</b><span class="tiny dim">${plk.sets} × ${plk.reps}s target${S.bests.plank ? ` · best ${S.bests.plank.v}s` : ''}</span>${bdelta('plank')}</div>
      <div class="kpi" style="grid-column:1/-1"><div class="row between"><div><span class="muted small">Walking</span><div class="row" style="align-items:baseline;gap:8px"><b>${walk.stepsToday ? walk.stepsToday.toLocaleString() : '—'}</b><span class="tiny dim">steps today</span></div></div><div style="text-align:right"><span class="tiny dim">7-day avg</span><div><b style="font-size:18px">${walk.avgSteps ? walk.avgSteps.toLocaleString() : '—'}</b></div></div><div style="text-align:right"><span class="tiny dim">brisk-walk sessions</span><div><b style="font-size:18px">${walk.walkMin} min</b></div></div></div>
        <button class="btn sm sec" style="margin-top:10px" data-act="steps-log">Log today’s steps</button></div>
    </div></section>
  <section class="card"><h2>Progress at a glance</h2>
    <p class="muted small" style="margin:4px 0 6px">Workouts per week</p>${barChart(E.workoutsPerWeek(S, t, 6), { max: 7, h: 90 })}
    <p class="muted small" style="margin:14px 0 6px">Habit completion · last 14 days</p>${barChart(E.habitDaily(S, t, 14), { max: 100, unit: '%', every: 3, h: 90 })}
    <button class="btn sec" style="margin-top:12px" data-act="nav" data-v="progress">All progress charts</button></section>
  <section class="card" aria-label="Today's habits">
    <div class="row between" style="margin-bottom:6px"><h2>Today’s habits</h2><button class="pill" data-act="nav" data-v="habits">${hs.filter(h => E.habitDone(S, h, t)).length}/${hs.length} done</button></div>
    ${hs.map(h => habitRow(h, t)).join('')}
  </section>
  </div>`;
}
function upcomingCard() {
  const sd = S.settings.startDate, nx = E.buildPlan(S, sd), mins = Math.max(1, Math.round(nx.seconds / 60));
  const thumbs = [...nx.main, ...(nx.mob || [])].filter((it, i, a) => a.findIndex(x => x.exId === it.exId) === i);
  const when = E.diffDays(sd, todayStr()) === 1 ? 'Tomorrow' : fmtDate(sd, { weekday: 'long', day: 'numeric', month: 'short' });
  return `<section class="card" style="border-color:var(--accent)"><div class="eyebrow accent">${when} · Day 1 of 34 · Foundation</div>
    <h2 style="font-size:24px;margin-top:6px">${esc(nx.title)}</h2><p class="muted" style="margin-top:2px">${esc(nx.sub)}</p>
    <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><span class="pill">${icon('bolt', 15)} ${mins} min</span><span class="pill neutral">${nx.main.length} exercises</span><span class="pill neutral">40s work · 20s rest</span></div>
    <div class="ex-thumbs">${thumbs.map(it => `<div class="thumb">${figure(EX[it.exId], { size: 'sm' })}<span>${esc(EX[it.exId].name)}</span></div>`).join('')}</div>
    <p class="small muted" style="margin-top:12px">Tonight: drink water, set out your dumbbells, aim for an early night. Tomorrow morning do the readiness check-in and the coach will fine-tune the session.</p>
    <div class="grid2" style="margin-top:12px"><button class="btn sec" data-act="programme-open">View 34-day plan</button><button class="btn sec" data-act="nav" data-v="habits">Set up habits</button></div></section>`;
}
function checkinCard(ci = {}) {
  const sc = (k, q, a, b) => `<div style="margin-top:14px"><div class="small" style="font-weight:600">${q}</div><div class="scale">${[1, 2, 3, 4, 5].map(v => `<button data-act="checkin" data-k="${k}" data-v="${v}" class="${ci[k] === v ? 'on' : ''}" aria-label="${v} of 5">${v}</button>`).join('')}</div><div class="scale-labels"><span>${a}</span><span>${b}</span></div></div>`;
  return `<section class="card"><div class="row between"><h2>Readiness check-in</h2><span class="pill neutral">15 sec</span></div><p class="muted small" style="margin-top:4px">Before training — the coach adapts today’s volume to your answers.</p>
    ${sc('energy', 'Energy level', 'Drained', 'Energised')}${sc('soreness', 'Muscle soreness', 'None', 'Very sore')}${sc('sleep', 'Sleep quality last night', 'Poor', 'Excellent')}</section>`;
}
function workoutCard(plan, done, resumable) {
  const isTrain = plan.kind === 'train', rest = plan.kind === 'rest';
  const intens = { light: 'Lighter day', restart: 'Easy restart', taper: 'Taper' }[plan.intensity];
  const mins = Math.max(1, Math.round(plan.seconds / 60));
  const thumbs = [...plan.main, ...(plan.mob || [])].filter((it, i, a) => a.findIndex(x => x.exId === it.exId) === i);
  return `<section class="card" aria-label="Today's workout">
    <div class="row between"><div class="eyebrow">${KIND_LABEL[plan.kind]}${plan.phase ? ` · ${plan.phase.name}` : ''}</div>${intens ? `<span class="pill neutral">${intens}</span>` : ''}</div>
    <h2 style="font-size:24px;margin-top:6px">${esc(plan.title)}</h2>
    <p class="muted" style="margin-top:2px">${esc(plan.sub)}</p>
    ${rest ? '' : `<div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><span class="pill">${icon('bolt', 15)} ${mins} min</span><span class="pill neutral">${new Set(plan.main.map(it => it.exId)).size} ${isTrain ? 'exercises' : 'movements'}</span>${plan.circuit ? `<span class="pill neutral">2 rounds · ${plan.main[0]?.target || 40}s work · 20s rest</span>` : ''}</div>`}
    ${plan.video ? `<a class="small muted" style="display:inline-block;margin-top:10px" href="${plan.video}" target="_blank" rel="noopener noreferrer">Optional follow-along video ↗</a>` : ''}
    ${thumbs.length ? `<div class="ex-thumbs">${thumbs.map(it => `<div class="thumb">${figure(EX[it.exId], { size: 'sm' })}<span>${esc(EX[it.exId].name)}</span></div>`).join('')}</div>` : ''}
    <details class="why"><summary>${icon('info', 16)} Why this workout?</summary><ul>${plan.reasons.map(r => `<li>${esc(r)}</li>`).join('')}</ul></details>
    <div class="col" style="margin-top:16px">
      ${done ? `<div class="note up"><b>Completed.</b> ${done.durationSec ? fmtMin(done.durationSec) : ''} · well done. The coach will build on this next session.</div>
          <button class="btn sec" data-act="extra-mobility">Add a 5-minute stretch</button>` :
      `<button class="btn xl" data-act="start">${icon('play', 22)} ${resumable ? 'Resume workout' : rest ? 'Optional gentle stretching' : isTrain ? 'Start workout' : 'Start session'}</button>
       ${resumable ? '<button class="btn ghost" data-act="discard-session">Discard saved progress</button>' : ''}
       <div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap">${rest ? '' : `<button class="btn ghost sm" data-act="plan-edit">Edit / skip exercises</button>`}<button class="btn ghost sm" data-act="change-focus">Different session</button></div>`}
    </div></section>`;
}

// ---------- habits
function habitValueText(h, v) { return h.target ? `${(+v || 0) % 1 ? (+v).toFixed(1) : (+v || 0)}${h.unit ? ' ' : ''}${h.unit}` : ''; }
function habitRow(h, d) {
  const done = E.habitDone(S, h, d), v = E.habitValue(S, h, d), s = E.habitStreak(S, h, todayStr());
  return `<div class="habit ${done ? 'done' : ''}">
    <button class="chk ${done ? 'on' : ''}" data-act="habit-toggle" data-id="${h.id}" data-d="${d}" role="checkbox" aria-checked="${done}" aria-label="${esc(h.name)}">${icon('check', 20)}</button>
    <div class="grow"><button class="title" style="text-align:left" data-act="habit-open" data-id="${h.id}">${esc(h.name)}</button>
      ${h.target ? `<div class="qty"><button data-act="habit-adj" data-id="${h.id}" data-d="${d}" data-dir="-1" aria-label="Decrease">${icon('minus', 16)}</button><span>${habitValueText(h, v || 0)} / ${h.target}${h.unit ? ' ' + h.unit : ''}</span><button data-act="habit-adj" data-id="${h.id}" data-d="${d}" data-dir="1" aria-label="Increase">${icon('plus', 16)}</button></div>` : ''}
      ${h.id === 'wake' && !h.target ? `<div class="tiny dim" style="margin-top:2px">Target ${esc(S.settings.wakeTime)}</div>` : ''}
    </div>
    ${s.cur > 0 ? `<span class="streak" title="Streak">${icon('flame', 15)}${s.cur}</span>` : ''}</div>`;
}
function renderHabits() {
  const t = todayStr(), d = habitDate;
  const days = Array.from({ length: 7 }, (_, i) => E.addDays(t, i - 6));
  const hs = habitsFor(d);
  const comp = hs.length ? hs.filter(h => E.habitDone(S, h, d)).length / hs.length : 0;
  const weekAvg = days.reduce((a, x) => a + E.dayCompletion(S, x), 0) / 7;
  let mo = 0; for (let i = 0; i < 30; i++) mo += E.dayCompletion(S, E.addDays(t, -i)); mo /= 30;
  const st = E.streak(S, t);
  app.innerHTML = `<div class="page-head"><div><div class="eyebrow">Daily habits</div><h1>${d === t ? 'Today' : fmtDate(d, { weekday: 'long', day: 'numeric', month: 'short' })}</h1></div><button class="icon-btn" data-act="habit-new" aria-label="Add habit">${icon('plus', 22)}</button></div>
  <div class="days">${days.map(x => `<button class="day ${x === d ? 'on' : ''}" data-act="habit-day" data-d="${x}"><span>${fmtDate(x, { weekday: 'short' })}</span><b>${+x.slice(8)}</b>${E.dayCompletion(S, x) >= 0.99 ? '<i></i>' : ''}</button>`).join('')}</div>
  <div class="stack">
  <section class="card"><div class="row between" style="margin-bottom:6px"><div><h2>${pct(comp)}% complete</h2><p class="muted small">${hs.filter(h => E.habitDone(S, h, d)).length} of ${hs.length} habits</p></div>${ring(comp, { size: 56, stroke: 6, label: '' })}</div>
    ${d !== t ? '<p class="hint" style="margin:0 0 6px">Logging a past day? No pressure — just record what happened.</p>' : ''}
    ${hs.map(h => habitRow(h, d)).join('')}
    <button class="btn sec" style="margin-top:12px" data-act="habit-new">${icon('plus', 18)} Add a habit</button></section>
  <section class="card"><div class="row between"><h2>Consistency</h2><span class="pill">${icon('flame', 15)} ${st.cur} day streak</span></div>
    <div class="kpis" style="margin-top:12px"><div class="kpi"><span class="muted small">Last 7 days</span><b>${pct(weekAvg)}%</b></div><div class="kpi"><span class="muted small">Last 30 days</span><b>${pct(mo)}%</b></div></div>
    <div style="margin-top:14px">${barChart(E.habitDaily(S, t, 30), { max: 100, unit: '%', every: 5, h: 110 })}</div>
    <p class="hint">${coachHabitNote(st, weekAvg)}</p></section></div>`;
}
function coachHabitNote(st, weekAvg) {
  if (st.cur === 0 && st.best > 0) return `Your best run was ${st.best} days. Missing days happens — tick one habit today and a new streak begins.`;
  if (weekAvg >= 0.8) return 'Excellent week. This is exactly the consistency that changes your body and routine.';
  if (weekAvg >= 0.5) return 'Solid progress. Pick one habit to nail every day this week.';
  return 'Small and steady wins. Aim for just your two most important habits each day.';
}
function habitSheet(id) {
  const h = id ? S.habits.find(x => x.id === id) : { name: '', icon: 'star', target: null, unit: '', step: 1 };
  const t = todayStr(), s = id ? E.habitStreak(S, h, t) : null;
  const hist = id ? Array.from({ length: 35 }, (_, i) => E.addDays(t, i - 34)) : [];
  sheet(`<h2>${id ? 'Edit habit' : 'New habit'}</h2>
  <div class="stack" style="margin-top:14px">
  ${id ? `<div class="kpis"><div class="kpi"><span class="muted small">Current streak</span><b>${s.cur}</b></div><div class="kpi"><span class="muted small">Best streak</span><b>${s.best}</b></div><div class="kpi"><span class="muted small">This week</span><b>${pct(E.habitRate(S, h, t, 7))}%</b></div><div class="kpi"><span class="muted small">This month</span><b>${pct(E.habitRate(S, h, t, 30))}%</b></div></div>
  <div><label class="f">Last 5 weeks</label><div class="heat">${hist.map(d => `<span class="${E.habitDone(S, h, d) ? 'on' : ''} ${d === t ? 'today' : ''}" title="${d}">${+d.slice(8)}</span>`).join('')}</div></div>` : ''}
  <div><label class="f" for="h-name">Habit name</label><input id="h-name" type="text" value="${esc(h.name)}" placeholder="e.g. Stretch for 10 minutes"></div>
  <div><label class="f">Icon</label><div class="chips" id="h-icons">${HABIT_ICONS.map(i => `<button type="button" class="chip ${h.icon === i ? 'on' : ''}" data-act="h-icon" data-v="${i}" aria-label="${i}" style="min-width:46px;padding:0 10px">${icon(i, 20)}</button>`).join('')}</div></div>
  <div class="grid2"><div><label class="f" for="h-target">Daily target <span class="dim">(optional)</span></label><input id="h-target" type="number" inputmode="decimal" value="${h.target ?? ''}" placeholder="e.g. 20"></div>
    <div><label class="f" for="h-unit">Unit</label><input id="h-unit" type="text" value="${esc(h.unit || '')}" placeholder="min, ml, pages…"></div></div>
  <div><label class="f" for="h-step">Step for +/− buttons</label><input id="h-step" type="number" inputmode="decimal" value="${h.step ?? 1}"></div>
  <button class="btn" data-act="habit-save" data-id="${id || ''}">Save habit</button>
  ${id ? `<button class="btn danger" data-act="habit-del" data-id="${id}">${icon('trash', 18)} Delete habit</button>` : ''}
  </div>`);
  $('#sheet')._icon = h.icon;
}

// ---------- progress
const METRICS = [['pushups', 'Push-ups', 'reps in a row'], ['squats', 'Squats', 'reps in a row'], ['plank', 'Plank', 'seconds']];
function changeText(first, last, unit = '') {
  if (first == null || last == null) return '';
  const d = last - first, p = first ? (d / first) * 100 : 0;
  return `<span class="delta ${d < 0 ? 'neg' : ''}">${d >= 0 ? '▲' : '▼'} ${sign(d)}${unit}${first ? ` (${sign(p)}%)` : ''}</span>`;
}
function renderProgress() {
  const t = todayStr();
  const wts = S.body.filter(b => b.weight != null).sort((a, b) => a.date.localeCompare(b.date));
  const bm = [...S.benchmarks].sort((a, b) => a.date.localeCompare(b.date));
  const monthW = S.workouts.filter(w => w.date >= E.addDays(t, -29)).length;
  let mo = 0; for (let i = 0; i < 30; i++) mo += E.dayCompletion(S, E.addDays(t, -i));
  const lastBm = bm[bm.length - 1], retest = lastBm && E.diffDays(t, lastBm.date) >= 14;
  const wFirst = wts[0]?.weight, wLast = wts[wts.length - 1]?.weight;
  const meas = ['chest', 'waist', 'hips', 'arm', 'thigh'], mm = S.body.filter(b => meas.some(k => b[k] != null)).sort((a, b) => a.date.localeCompare(b.date));
  const ws = E.weeklyScore(S, t);
  const seriesTop = chain => E.bestSetSeries(S, chain).slice(-4).reverse();
  app.innerHTML = `<div class="page-head"><div><div class="eyebrow">Your improvement</div><h1>Progress</h1></div></div><div class="stack">
  <div class="kpis">
    <div class="kpi"><span class="muted small">Workouts · 30 days</span><b>${monthW}</b></div>
    <div class="kpi"><span class="muted small">Habit consistency · 30d</span><b>${pct(mo / 30)}%</b></div>
    <div class="kpi"><span class="muted small">Weekly fitness score</span><b>${ws.score}</b><span class="tiny dim">${ws.workouts}/${ws.target} sessions · ${pct(ws.parts.habits)}% habits</span></div>
    <div class="kpi"><span class="muted small">Weight change</span><b>${wFirst != null && wts.length > 1 ? sign(wLast - wFirst) + ' kg' : '—'}</b><span class="tiny dim">${wLast != null ? 'now ' + wLast + ' kg' : ''}</span></div>
  </div>
  ${retest ? `<div class="banner">${icon('bolt', 20)}<span>It’s been ${E.diffDays(t, lastBm.date)} days since your last fitness test. A retest shows how far you’ve come.</span><button class="btn sm" data-act="bench-new">Test</button></div>` : ''}
  <section class="card"><div class="row between"><h2>Strength benchmarks</h2><button class="btn sm sec" data-act="bench-new">Log test</button></div>
    <p class="muted small" style="margin:4px 0 8px">Starting estimates, not measured tests: 5 knee push-ups, 20 squats and a 30s plank. Log a test when ready.</p>
    ${METRICS.map(([k, label, sub]) => { const pts = bm.filter(b => b[k] != null).map(b => ({ date: b.date, v: b[k] })); return `<div style="margin-top:14px"><div class="row between"><b>${label}</b>${pts.length > 1 ? changeText(pts[0].v, pts[pts.length - 1].v, k === 'plank' ? 's' : '') : '<span class="tiny dim">starting estimates</span>'}</div><div class="tiny dim">${pts.length ? `${pts[pts.length - 1].v} ${sub}` : ''}</div>${lineChart(pts, { h: 110 })}</div>`; }).join('')}
    ${bm.some(b => b.pullups != null) && (bm.some(b => b.pullups > 0)) ? `<div style="margin-top:14px"><div class="row between"><b>Pull-ups</b>${changeText(bm[0].pullups, lastBm.pullups)}</div>${lineChart(bm.filter(b => b.pullups != null).map(b => ({ date: b.date, v: b.pullups })), { h: 100 })}</div>` : ''}
  </section>
  <section class="card"><h2>In-workout top sets</h2><p class="muted small" style="margin:4px 0 8px">Your best set from recent sessions — progress as you move up the progression ladder.</p>
    ${[['push', 'Push'], ['squat', 'Squat'], ['corePlank', 'Plank / core']].map(([c, l]) => { const r = seriesTop(c); return `<div class="list-row" style="padding:10px 0"><div class="grow"><b>${l}</b></div><div class="muted small" style="text-align:right">${r.length ? r.map(x => `${x.v}${EX[Object.keys(EX).find(k => EX[k].name === x.ex)]?.type === 'time' ? 's' : '×'} ${esc(x.ex)}`).join('<br>') : 'Log a workout to see this'}</div></div>`; }).join('')}
    <p class="hint" style="margin-top:8px">Current coach targets: push-up path → ${esc(E.currentEx(S, 'push')?.name || '')}, squat path → ${esc(E.currentEx(S, 'squat')?.name || '')}.</p></section>
  ${pullupCard()}
  <section class="card"><div class="row between"><h2>Weight</h2><button class="btn sm sec" data-act="weight-new">Add</button></div>
    ${wFirst != null ? `<div class="row between" style="margin-top:8px"><span class="muted small">Start ${wFirst} kg → ${wLast} kg</span>${changeText(wFirst, wLast, ' kg')}</div>` : ''}
    <div style="margin-top:6px">${lineChart(wts.map(b => ({ date: b.date, v: b.weight })), { unit: ' kg' })}</div></section>
  <section class="card"><div class="row between"><h2>Body measurements</h2><button class="btn sm sec" data-act="meas-new">Add</button></div>
    ${mm.length ? `<div style="margin-top:8px">${meas.map(k => { const pts = mm.filter(b => b[k] != null); if (!pts.length) return ''; const f = pts[0][k], l = pts[pts.length - 1][k]; return `<div class="list-row" style="padding:10px 0"><div class="grow" style="text-transform:capitalize">${k}</div><b>${l} cm</b>${pts.length > 1 ? changeText(f, l, ' cm') : ''}</div>`; }).join('')}</div>` : '<p class="muted small" style="margin-top:8px">Add chest, waist, hips, arm and thigh once every 2 weeks. Often the tape measure shows progress before the scale does.</p>'}</section>
  <section class="card"><h2>Workout frequency</h2><p class="muted small" style="margin:4px 0 8px">Sessions per week — last 8 weeks</p>${barChart(E.workoutsPerWeek(S, t, 8), { max: 7, h: 110 })}
    <h3 style="margin-top:18px">Daily habit completion</h3><p class="muted small" style="margin:2px 0 8px">Last 30 days</p>${barChart(E.habitDaily(S, t, 30), { max: 100, every: 5, unit: '%', h: 100 })}</section>
  <section class="card"><div class="row between"><h2>Progress photos</h2><label class="btn sm sec" style="cursor:pointer">${icon('camera', 16)} Add<input id="photo-in" type="file" accept="image/*" hidden></label></div>
    <p class="muted small" style="margin:4px 0 10px">Optional and private — stored only on this device.</p><div id="photos" class="photos"></div></section>
  <section class="card"><h2>Recent workouts</h2>${[...S.workouts].sort((a, b) => b.id - a.id).slice(0, 8).map(w => { const main = w.items.filter(i => i.role === 'main'); const ds = main.reduce((a, i) => a + i.sets.filter(s => s.done).length, 0), tot = main.reduce((a, i) => a + i.sets.length, 0); return `<div class="list-row"><div class="grow"><b>${esc(w.title)}</b><div class="muted small">${fmtDate(w.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${fmtMin(w.durationSec || 0)}</div></div><span class="pill neutral">${tot ? ds + '/' + tot + ' sets' : 'done'}</span></div>`; }).join('') || '<p class="muted small" style="margin-top:8px">Your completed workouts will appear here.</p>'}</section>
  </div>`;
  const pin = $('#photo-in');
  if (pin) pin.onchange = async () => { const f = pin.files[0]; if (!f) return; try { const dataUrl = await resizeImage(f); await photoPut({ id: Date.now(), date: todayStr(), dataUrl }); toast('Photo saved'); loadPhotos(); } catch (e) { toast('Could not read that image'); } };
}
async function loadPhotos() {
  const box = $('#photos'); if (!box) return;
  const ph = await photoAll();
  box.innerHTML = ph.length ? ph.map(p => `<figure><img src="${p.dataUrl}" alt="Progress photo ${p.date}" data-act="photo-open" data-id="${p.id}"><figcaption>${fmtDate(p.date, { day: 'numeric', month: 'short' })}</figcaption></figure>`).join('') : '<p class="muted small" style="grid-column:1/-1">No photos yet.</p>';
}

// ---------- settings
function renderSettings() {
  const p = S.profile, r = S.settings.reminders;
  const rem = (k, extra = '') => `<div class="list-row"><div class="grow"><b>${r[k].label}</b>${extra}</div>${k === 'water' ? '' : `<input type="time" data-rem="${k}" data-f="time" value="${r[k].time}" style="width:118px;min-height:44px;font-size:15px">`}<button class="switch ${r[k].on ? 'on' : ''}" role="switch" aria-checked="${r[k].on}" aria-label="${r[k].label}" data-act="rem-toggle" data-k="${k}"></button></div>`;
  app.innerHTML = `<div class="page-head"><div><div class="eyebrow">Preferences</div><h1>Settings</h1></div></div><div class="stack">
  <section class="card"><h2>Your profile</h2><p class="muted small" style="margin-top:4px">${[p.age != null ? p.age + ' yrs' : '', p.heightCm != null ? p.heightCm + ' cm' : '', p.weightKg != null ? p.weightKg + ' kg' : ''].filter(Boolean).join(' · ') || 'Add your details (optional)'} · ${esc(p.level)}<br>${p.minutes} min/day · bodyweight + ${p.equip.length ? p.equip.join(', ') : 'no equipment'}${p.dumbbells ? ` (${esc(p.dumbbells)} kg)` : ''}${p.avoid ? `<br>Avoid: ${esc(p.avoid)}` : '<br>No injuries or limitations reported'}</p>
    <button class="btn sec" style="margin-top:12px" data-act="profile-edit">${icon('edit', 18)} Update details & goals</button></section>
  <section class="card"><h2>Appearance</h2><div style="margin-top:10px">${seg('theme', [['dark', 'Dark'], ['light', 'Light']], S.settings.theme).replace(/ob-set/g, 'set-theme')}</div></section>
  <section class="card"><h2>Targets</h2><div class="stack" style="margin-top:12px">
    <div class="grid2"><div><label class="f" for="s-wake">Wake-up time</label><input id="s-wake" type="time" data-set="wakeTime" value="${S.settings.wakeTime}"></div><div><label class="f" for="s-wed">Wedding date</label><input id="s-wed" type="date" data-set="weddingDate" value="${S.settings.weddingDate}"></div></div>
    <div><label class="f" for="s-start">Programme start date</label><input id="s-start" type="date" data-set="startDate" value="${S.settings.startDate}"></div></div>
    <p class="hint">Water and step targets are edited on each habit (Habits → tap a habit name).</p></section>
  <section class="card"><h2>Reminders</h2><p class="muted small" style="margin:4px 0 4px">${notifState()}</p>
    ${rem('morning')}${rem('workout')}
    <div class="list-row"><div class="grow"><b>${r.water.label}</b><div class="row small muted" style="margin-top:6px;gap:6px;flex-wrap:wrap">every <select data-rem="water" data-f="every" style="width:92px;min-height:40px;font-size:14px">${[60, 90, 120, 180].map(v => `<option value="${v}" ${r.water.every === v ? 'selected' : ''}>${v / 60} h</option>`).join('')}</select> from <input type="time" data-rem="water" data-f="from" value="${r.water.from}" style="width:104px;min-height:40px;font-size:14px"> to <input type="time" data-rem="water" data-f="to" value="${r.water.to}" style="width:104px;min-height:40px;font-size:14px"></div></div><button class="switch ${r.water.on ? 'on' : ''}" role="switch" aria-checked="${r.water.on}" aria-label="Water reminders" data-act="rem-toggle" data-k="water"></button></div>
    ${rem('evening')}${rem('bed')}
    <p class="hint">Reminders fire while the app is open or installed and running in the background. Browsers can’t guarantee alerts when a web app is fully closed — an alarm app is a good backup for wake-up and bedtime.</p></section>
  <section class="card"><h2>Coach</h2><p class="muted small" style="margin-top:4px">Planner: <b>rule-based engine</b> (runs fully offline on this device). It considers your level, equipment, injuries, recent sessions, recovery check-in and logged reps. The planner is modular (<code>plannerProvider</code> in engine.js) so an external AI service can be plugged in later, with this engine as fallback.</p>
    <button class="btn sec" style="margin-top:12px" data-act="recalibrate">Recalibrate levels from my baseline</button></section>
  <section class="card"><h2>Data & backup</h2><p class="muted small" style="margin:4px 0 12px">Everything is stored on this device. Export a backup regularly.</p>
    <div class="col"><button class="btn sec" data-act="export">Export backup (JSON)</button><label class="btn sec" style="cursor:pointer">Import backup<input id="import-in" type="file" accept="application/json" hidden></label><button class="btn danger" data-act="reset">Erase all data</button></div></section>
  <section class="card"><h2>Install</h2><p class="muted small" style="margin:4px 0 10px">${deferredInstall ? 'Install Project 35 for a full-screen, offline experience.' : 'On Android Chrome: menu ⋮ → “Install app” / “Add to Home screen”. It then works fully offline.'}</p>${deferredInstall ? '<button class="btn" data-act="install">Install app</button>' : ''}</section>
  <p class="tiny dim" style="text-align:center">Project 35 · v1.0</p></div>`;
  const imp = $('#import-in'); if (imp) imp.onchange = () => importBackup(imp.files[0]);
}
const notifState = () => !('Notification' in window) ? 'Notifications aren’t supported here; you’ll see in-app reminders.' : Notification.permission === 'granted' ? 'Notifications enabled.' : Notification.permission === 'denied' ? 'Notifications are blocked in browser settings — reminders show in-app only.' : 'Turn on a reminder to allow notifications.';

// ---------- programme, weekly report, plan editing, pull-up module
function programmeSheet() {
  const t = todayStr(), start = S.settings.startDate, pg = E.programme(S, t);
  const rows = E.PHASES.map(ph => {
    const cells = [];
    for (let d = ph.from; d <= ph.to; d++) {
      const date = E.addDays(start, d - 1), foc = date > S.settings.weddingDate ? 'rest' : E.WEEKDAY_FOCUS(date), w = E.workoutsOn(S, date)[0];
      const st = date === t ? 'today' : w ? 'done' : date < t ? 'past' : 'future';
      cells.push(`<div class="pcell ${st}" title="${fmtDate(date)}"><b>${d}</b><span>${({ upper: 'Upper', lower: 'Lower', posture: 'Posture', conditioning: 'Full', backcore: 'Back', cardioflex: 'Cardio', recovery: 'Recover', rest: 'Rest' })[foc]}</span></div>`);
    }
    const cur = pg?.phase?.id === ph.id;
    return `<div class="phase ${cur ? 'cur' : ''}"><div class="row between"><b>${ph.name}</b><span class="tiny dim">Days ${ph.from}–${ph.to}</span></div><p class="small muted" style="margin:2px 0 8px">${esc(ph.blurb[0].toUpperCase() + ph.blurb.slice(1))}</p><div class="pgrid">${cells.join('')}</div></div>`;
  }).join('');
  sheet(`<h2>34-day programme</h2><p class="muted small" style="margin:4px 0 14px">${fmtDate(start, { day: 'numeric', month: 'long' })} → wedding on ${fmtDate(S.settings.weddingDate, { day: 'numeric', month: 'long' })}. The day’s purpose stays fixed; the coach varies exercises, volume and intensity to fit your readiness. Missed days are simply skipped — never stacked up.</p>
    <div class="stack">${rows}</div>
    <div class="note" style="margin-top:14px"><b>Weekly structure</b><br>Mon upper strength · Tue lower strength · Wed posture & mobility · Thu full-body conditioning · Fri back & core · Sat cardio & flexibility · Sun recovery.</div>`);
}
function reportSheet(off = 0) {
  const t = todayStr(), r = E.weeklyReport(S, t, off), end = E.addDays(r.start, 6);
  const nav = `<div class="row between" style="margin:10px 0 14px"><button class="btn sm sec" data-act="report-nav" data-o="${off - 1}">‹ Earlier</button><span class="small muted">${fmtDate(r.start, { day: 'numeric', month: 'short' })} – ${fmtDate(end, { day: 'numeric', month: 'short' })}</span><button class="btn sm sec" data-act="report-nav" data-o="${Math.min(0, off + 1)}" ${off >= 0 ? 'disabled' : ''}>Later ›</button></div>`;
  sheet(`<h2>Weekly report</h2>${nav}
    <div class="kpis"><div class="kpi"><span class="muted small">Sessions</span><b>${r.sessions}/${r.scheduled}</b></div><div class="kpi"><span class="muted small">Training time</span><b>${r.minutes} min</b></div>
      <div class="kpi"><span class="muted small">Habit completion</span><b>${pct(r.habits)}%</b></div><div class="kpi"><span class="muted small">Mobility days</span><b>${r.mobility}</b></div>
      <div class="kpi"><span class="muted small">Avg readiness</span><b>${r.readiness ?? '—'}</b></div><div class="kpi"><span class="muted small">Steps (avg)</span><b>${r.walk.avgSteps ? r.walk.avgSteps.toLocaleString() : '—'}</b></div></div>
    ${r.pushBest ? `<p class="small muted" style="margin-top:12px">Best push-up set: <b>${r.pushBest}</b>${r.plankBest ? ` · Best plank: <b>${r.plankBest}s</b>` : ''}</p>` : ''}
    <h3 style="margin:16px 0 6px">What the coach noticed</h3>${r.notes.map(n => `<div class="note">${esc(n)}</div>`).join('')}
    ${r.changes.length ? `<h3 style="margin:16px 0 6px">Progress made</h3>${r.changes.slice(0, 8).map(c => `<div class="note up">${esc(c.text)}</div>`).join('')}` : ''}
    <p class="hint">Progression only happens after consistent, controlled sessions — small steady steps beat big jumps.</p>`);
}
function planEditSheet() {
  const t = todayStr(), plan = S.plans[t];
  const rows = plan.main.map((it, i) => `<div class="list-row" style="gap:10px"><div class="grow"><b>${esc(EX[it.exId].name)}</b><div class="muted small">${it.sets} × ${it.target}${it.type === 'time' ? 's' : ' reps'}</div></div>
    <div class="qty" style="margin:0"><button data-act="plan-sets" data-i="${i}" data-dir="-1" aria-label="Fewer sets">${icon('minus', 16)}</button><span>${it.sets}</span><button data-act="plan-sets" data-i="${i}" data-dir="1" aria-label="More sets">${icon('plus', 16)}</button></div>
    <button class="icon-btn" data-act="plan-remove" data-i="${i}" aria-label="Skip ${esc(EX[it.exId].name)}">${icon('trash', 18)}</button></div>`).join('');
  sheet(`<h2>Edit today’s plan</h2><p class="muted small" style="margin:4px 0 8px">Adjust sets or skip an exercise. Estimated time: <b>${Math.round(plan.seconds / 60)} min</b>${plan.seconds > 1800 ? ' — over 30 min, consider skipping an accessory.' : '.'}</p>${rows || '<p class="muted">Nothing left in the plan.</p>'}
    <button class="btn" style="margin-top:14px" data-act="sheet-close">Done</button><button class="btn ghost" data-act="plan-reset">Reset to coach’s plan</button>`);
}
function pullupCard() {
  const eq = S.profile.equip || [], bar = eq.includes('bar'), bands = eq.includes('bands');
  const chain = E.dynamicChain('pullDev', eq), p = S.prog.pullDev, on = !!S.profile.pullupModule;
  const stage = id => `<div class="stage ${chain.indexOf(id) < p.lvl ? 'done' : chain.indexOf(id) === p.lvl ? 'cur' : ''}"><i></i><span>${esc(EX[id].name)}</span></div>`;
  return `<section class="card"><div class="row between"><h2>Pull-up development</h2><button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${on}" aria-label="Pull-up module" data-act="pullmod-toggle"></button></div>
    <p class="muted small" style="margin:4px 0 10px">Optional. Adds a short pull-up-prep block to upper-body and back days. Your dumbbell rows are the main strength builder either way.</p>
    <div class="stages">${chain.map(stage).join('')}</div>
    ${!bar ? `<p class="hint">Without a bar this stays on <b>scapular control</b> (no-equipment shoulder-blade work). Dead hangs, scapular pull-ups and negative pull-ups unlock when you tell the app you have a suitable, secure bar.</p>` : ''}
    <div class="col" style="margin-top:12px"><button class="btn sec" data-act="equip-toggle" data-v="bar">${bar ? '✓ I have a pull-up bar (tap to remove)' : 'I now have a pull-up bar'}</button>
    <button class="btn sec" data-act="equip-toggle" data-v="bands">${bands ? '✓ I have a resistance band (tap to remove)' : 'I now have a resistance band — enables assisted pull-ups'}</button></div></section>`;
}

// ---------- backup
async function exportBackup() {
  const photos = await photoAll().catch(() => []);
  const blob = new Blob([JSON.stringify({ app: 'project35', exportedAt: new Date().toISOString(), state: S, photos }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `project35-backup-${todayStr()}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Backup downloaded');
}
async function importBackup(file) {
  if (!file) return;
  try {
    const j = JSON.parse(await file.text());
    if (j.app !== 'project35' || !j.state) throw new Error('bad');
    if (!confirm('Replace all current data with this backup?')) return;
    S = { ...defaultState(), ...j.state }; persist();
    for (const p of j.photos || []) await photoPut(p);
    toast('Backup restored'); view = 'today'; render();
  } catch (e) { toast('That file isn’t a valid Project 35 backup.'); }
}

// ---------- reminders
const REM_MSG = { morning: ['Good morning', 'Your habits are ready whenever you are.'], workout: ['Workout time', 'Your coach has today’s session ready.'], water: ['Water break', 'A glass of water now keeps you on track.'], evening: ['Evening review', 'Take a minute to log today’s habits — no pressure.'], bed: ['Bedtime', 'Wind down now. Sleep is where the progress happens.'] };
function notify(k) {
  const [title, body] = REM_MSG[k];
  toast(`${title}: ${body}`, 6000);
  if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
    navigator.serviceWorker.ready.then(r => r.showNotification('Project 35 · ' + title, { body, icon: 'icons/icon-192.png', tag: 'p35-' + k, badge: 'icons/icon-192.png' })).catch(() => {});
  }
}
function tickReminders() {
  if (!S.onboarded) return;
  const now = new Date(), t = E.ymd(now), hm = `${E.pad(now.getHours())}:${E.pad(now.getMinutes())}`, mins = now.getHours() * 60 + now.getMinutes();
  const tm = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  let changed = false;
  Object.entries(S.settings.reminders).forEach(([k, r]) => {
    if (!r.on) return;
    let key = null;
    if (k === 'water') { const f = tm(r.from), to = tm(r.to); if (mins >= f && mins <= to && (mins - f) % r.every === 0) key = `${t}-water-${mins}`; }
    else if (hm === r.time) key = `${t}-${k}`;
    if (key && !S.fired[key]) { S.fired[key] = 1; changed = true; notify(k); }
  });
  if (changed) { Object.keys(S.fired).filter(k => k < E.addDays(t, -2)).forEach(k => delete S.fired[k]); persist(); }
}

// ---------- actions
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (view === 'settings') render(); });
const A = {
  nav: d => go(d.v),
  'ob-set': (d, el) => {
    if (S.onboarded && el.closest('#sheet')) { ob[d.k] = d.v; el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); return; }
    ob[d.k] = isNaN(+d.v) ? d.v : +d.v; render();
  },
  'ob-equip': d => { if (d.v === 'none') ob.equip = []; else ob.equip = ob.equip.includes(d.v) ? ob.equip.filter(x => x !== d.v) : [...ob.equip, d.v]; refreshForm(); },
  'ob-pullmod': () => { ob.pullupModule = !ob.pullupModule; refreshForm(); },
  'ob-goal': d => { ob.goals = ob.goals.includes(d.v) ? ob.goals.filter(x => x !== d.v) : [...ob.goals, d.v]; refreshForm(); },
  'ob-next': () => { if (!validateDraft(obStep)) return; if (obStep < 2) { obStep++; render(); window.scrollTo(0, 0); } else finishOnboarding(); },
  'ob-back': () => { obStep = Math.max(0, obStep - 1); render(); },
  checkin: d => {
    const t = todayStr(); S.checkins[t] = { ...(S.checkins[t] || {}), [d.k]: +d.v };
    const c = S.checkins[t]; persist();
    if (E.checkinDone(c)) {
      if (!workoutDoneToday(t)) { E.planFor(S, t, true); persist(); const p = S.plans[t]; toast(p.kind === 'train' ? (p.intensity === 'light' ? 'Coach lightened today’s workout.' : 'Check-in saved — full plan on.') : 'Coach switched today to ' + p.title.toLowerCase() + '.'); }
      else toast('Check-in saved.');
    }
    render();
  },
  'checkin-edit': () => { S.checkins[todayStr()] = {}; persist(); render(); },
  start: () => { const t = todayStr(); const plan = E.planFor(S, t); if (plan.kind === 'rest') return A['extra-mobility'](); runPlayer(plan); },
  'extra-mobility': () => { const t = todayStr(); const rec = E.buildPlan(S, t, { forceFocus: 'recovery' }); rec.title = 'Gentle stretch'; rec.main = rec.main.filter(i => i.exId !== 'walkGentle').slice(0, 5); rec.warm = []; rec.mob = []; rec.cool = []; rec.extra = true; runPlayer(rec); },
  'sheet-close': () => { closeSheet(); render(); },
  'programme-open': programmeSheet,
  'report-open': () => reportSheet(0),
  'report-nav': d => reportSheet(+d.o),
  'plan-edit': planEditSheet,
  'plan-sets': d => { const pl = S.plans[todayStr()], it = pl.main[+d.i]; it.sets = Math.max(1, Math.min(6, it.sets + +d.dir)); pl.seconds = E.planSeconds([...pl.warm, ...pl.main, ...(pl.mob || []), ...pl.cool]) + 20; persist(); planEditSheet(); },
  'plan-remove': d => { const pl = S.plans[todayStr()]; pl.main.splice(+d.i, 1); pl.seconds = E.planSeconds([...pl.warm, ...pl.main, ...(pl.mob || []), ...pl.cool]) + 20; persist(); planEditSheet(); },
  'plan-reset': () => { E.planFor(S, todayStr(), true); persist(); closeSheet(); render(); toast('Plan reset'); },
  'steps-log': () => sheet(`<h2>Log steps</h2><p class="muted small" style="margin:4px 0 12px">From your phone’s step counter or watch.</p><div class="stack"><div><label class="f" for="st-v">Steps today</label><input id="st-v" type="number" inputmode="numeric" value="${S.logs[todayStr()]?.steps || ''}"></div><button class="btn" data-act="steps-save">Save</button></div>`),
  'steps-save': () => { const v = num($('#st-v').value); if (v == null) return toast('Enter a number.'); (S.logs[todayStr()] ||= {}).steps = v; persist(); closeSheet(); render(); toast('Steps saved'); },
  'pullmod-toggle': () => { S.profile.pullupModule = !S.profile.pullupModule; const t = todayStr(); if (!workoutDoneToday(t)) E.planFor(S, t, true); persist(); render(); toast(S.profile.pullupModule ? 'Pull-up prep added to upper & back days' : 'Pull-up module off'); },
  'equip-toggle': d => {
    const eq = S.profile.equip, k = d.v; S.profile.equip = eq.includes(k) ? eq.filter(x => x !== k) : [...eq, k];
    S.prog.pullDev = E.initProg(S.profile).pullDev; const t = todayStr(); if (!workoutDoneToday(t)) E.planFor(S, t, true);
    persist(); render(); toast(S.profile.equip.includes(k) ? 'Equipment added — new pull-up steps unlocked' : 'Equipment removed');
  },
  'discard-session': () => { S.session = null; persist(); render(); },
  'change-focus': () => {
    sheet(`<h2>Choose a session</h2><p class="muted small" style="margin:4px 0 12px">The coach will still size the volume to your recovery.</p><div class="col">${['lower', 'upper', 'backcore', 'posture', 'recovery', 'rest'].map(f => `<button class="btn sec" style="justify-content:space-between" data-act="set-focus" data-f="${f}"><span>${FOCUS[f].title}</span><span class="muted small" style="font-weight:500;text-align:right">${FOCUS[f].sub.split(' · ')[0]}</span></button>`).join('')}<button class="btn ghost" data-act="set-focus" data-f="auto">Let the coach decide</button></div>`);
  },
  'set-focus': d => { const t = todayStr(); if (d.f === 'auto') E.planFor(S, t, true); else E.planFor(S, t, true, { forceFocus: d.f }); persist(); closeSheet(); render(); },
  'habit-toggle': d => {
    const h = S.habits.find(x => x.id === d.id), L = (S.logs[d.d] ||= {});
    if (E.habitDone(S, h, d.d)) { L[h.id] = h.target ? 0 : false; if (h.auto === 'workout' && E.workoutsOn(S, d.d).length) toast('Workout habit is marked automatically from your logged workout.'); }
    else L[h.id] = h.target ? h.target : true;
    persist(); render();
  },
  'habit-adj': d => {
    const h = S.habits.find(x => x.id === d.id), L = (S.logs[d.d] ||= {}), step = +h.step || 1;
    L[h.id] = Math.max(0, +((+L[h.id] || 0) + step * +d.dir).toFixed(2)); persist(); render();
  },
  'habit-day': d => { habitDate = d.d; render(); },
  'habit-open': d => habitSheet(d.id),
  'habit-new': () => habitSheet(null),
  'h-icon': (d, el) => { $('#sheet')._icon = d.v; el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); },
  'habit-save': d => {
    const name = $('#h-name').value.trim(); if (!name) return toast('Give the habit a name.');
    const target = num($('#h-target').value), unit = $('#h-unit').value.trim(), step = num($('#h-step').value) || 1, ic = $('#sheet')._icon || 'star';
    if (d.id) Object.assign(S.habits.find(h => h.id === d.id), { name, target: target || null, unit, step, icon: ic });
    else S.habits.push({ id: 'h' + Date.now().toString(36), name, icon: ic, target: target || null, unit, step, created: todayStr() });
    persist(); closeSheet(); render(); toast('Habit saved');
  },
  'habit-del': d => { if (!confirm('Delete this habit and hide its history?')) return; S.habits = S.habits.filter(h => h.id !== d.id); persist(); closeSheet(); render(); },
  'bench-new': () => { const l = S.benchmarks[S.benchmarks.length - 1] || {}; sheet(`<h2>Fitness test</h2><p class="muted small" style="margin:4px 0 12px">One all-out clean set each, after a warm-up. Log what you achieved today.</p><div class="stack"><div class="grid2">${[['pushups', 'Push-ups', ''], ['squats', 'Squats', ''], ['plank', 'Plank (sec)', 's'], ['pullups', 'Pull-ups', '']].map(([k, l, u]) => `<div><label class="f" for="b-${k}">${l}</label><input id="b-${k}" type="number" inputmode="numeric" placeholder="${l.replace(/ \(.*/, '')}"><div class="tiny dim" style="margin-top:3px">${l.split(' ')[0]} last: ${l && l[0] ? (S.benchmarks.filter(b => b[k] != null).slice(-1)[0]?.[k] ?? '—') : ''}${u}</div></div>`).join('')}</div><button class="btn" data-act="bench-save">Save results</button></div>`); },
  'bench-save': () => {
    const e = { date: todayStr() }; let any = false;
    ['pushups', 'squats', 'plank', 'pullups'].forEach(k => { const v = num($('#b-' + k).value); if (v != null) { e[k] = v; any = true; } });
    if (!any) return toast('Enter at least one result.');
    const prev = S.benchmarks[S.benchmarks.length - 1] || {};
    S.benchmarks = S.benchmarks.filter(b => b.date !== e.date || b.baseline); S.benchmarks.push(e); persist(); closeSheet(); render();
    const gains = ['pushups', 'squats', 'plank'].filter(k => e[k] != null && prev[k] != null && e[k] > prev[k]);
    toast(gains.length ? 'Improvement logged — nice work.' : 'Saved. Progress isn’t always linear — keep going.');
  },
  'weight-new': () => sheet(`<h2>Log weight</h2><div class="stack" style="margin-top:14px"><div><label class="f" for="w-v">Weight (kg)</label><input id="w-v" type="number" step="0.1" inputmode="decimal" value="${S.body.filter(b => b.weight).slice(-1)[0]?.weight ?? ''}"></div><div><label class="f" for="w-d">Date</label><input id="w-d" type="date" value="${todayStr()}"></div><button class="btn" data-act="weight-save">Save</button></div>`),
  'weight-save': () => { const v = num($('#w-v').value), d = $('#w-d').value || todayStr(); if (!v) return toast('Enter your weight.'); const e = S.body.find(b => b.date === d); if (e) e.weight = v; else S.body.push({ date: d, weight: v }); persist(); closeSheet(); render(); toast('Weight saved'); },
  'meas-new': () => { sheet(`<h2>Body measurements (cm)</h2><div class="stack" style="margin-top:14px"><div class="grid2">${['chest', 'waist', 'hips', 'arm', 'thigh'].map(k => `<div><label class="f" for="m-${k}" style="text-transform:capitalize">${k}</label><input id="m-${k}" type="number" step="0.1" inputmode="decimal"></div>`).join('')}</div><p class="hint">Leave any blank. Measure at the same spot, relaxed, same time of day.</p><button class="btn" data-act="meas-save">Save</button></div>`); },
  'meas-save': () => { const d = todayStr(); let e = S.body.find(b => b.date === d); if (!e) { e = { date: d }; S.body.push(e); } let any = false; ['chest', 'waist', 'hips', 'arm', 'thigh'].forEach(k => { const v = num($('#m-' + k).value); if (v) { e[k] = v; any = true; } }); if (!any) return toast('Enter at least one measurement.'); persist(); closeSheet(); render(); toast('Measurements saved'); },
  'photo-open': async d => { const p = (await photoAll()).find(x => x.id === +d.id); if (!p) return; sheet(`<img src="${p.dataUrl}" alt="" style="width:100%;border-radius:18px"><p class="muted small" style="margin:10px 0">${fmtDate(p.date)}</p><button class="btn danger" data-act="photo-del" data-id="${p.id}">${icon('trash', 18)} Delete photo</button>`); },
  'photo-del': async d => { await photoDel(+d.id); closeSheet(); loadPhotos(); },
  'set-theme': d => { S.settings.theme = d.v; persist(); render(); },
  'rem-toggle': async d => {
    const r = S.settings.reminders[d.k]; r.on = !r.on;
    if (r.on && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (e) {} }
    persist(); render();
  },
  'profile-edit': () => {
    ob = { ...S.profile, equip: [...S.profile.equip], goals: [...(S.profile.goals || [])], wake: S.settings.wakeTime, wedding: S.settings.weddingDate, avoid: S.profile.avoid || '' };
    sheet(`<h2>Update your details</h2><div class="stack" style="margin-top:14px">${formSection(0)}<hr style="border:0;border-top:1px solid var(--line);width:100%">${formSection(1)}<hr style="border:0;border-top:1px solid var(--line);width:100%">${formSection(2)}
      <div class="list-row" style="border:0"><div class="grow"><b>Recalibrate training levels</b><div class="hint" style="margin:0">Off = keep the progress you’ve earned. Turn on if your baseline changed a lot.</div></div><button class="switch" id="recal" role="switch" aria-checked="false" data-act="recal-toggle"></button></div>
      <button class="btn" data-act="profile-save">Save changes</button></div>`, () => { ob = null; });
  },
  'recal-toggle': (d, el) => { el.classList.toggle('on'); el.setAttribute('aria-checked', el.classList.contains('on')); },
  'profile-save': () => {
    for (const s of [0, 1]) if (!validateDraft(s)) return;
    const recal = $('#recal').classList.contains('on');
    S.profile = cleanProfile(ob); S.settings.wakeTime = ob.wake; S.settings.weddingDate = ob.wedding;
    if (S.profile.weightKg == null) { S.settings.waterGoal = 2500; const water = S.habits.find(h => h.id === 'water'); if (water) water.target = 2500; }
    if (recal) S.prog = E.initProg(S.profile); else E.ensureProg(S);
    const t = todayStr(); if (!workoutDoneToday(t)) E.planFor(S, t, true);
    persist(); closeSheet(); render(); toast('Profile updated — coach plan refreshed');
  },
  recalibrate: () => { if (!confirm('Reset all exercise levels from your baseline numbers? Earned progression will be reset.')) return; S.prog = E.initProg(S.profile); const t = todayStr(); if (!workoutDoneToday(t)) E.planFor(S, t, true); persist(); toast('Levels recalibrated'); },
  export: exportBackup,
  reset: () => { if (!confirm('Erase ALL data on this device? This cannot be undone.')) return; if (!confirm('Really erase everything? Export a backup first if unsure.')) return; localStorage.removeItem('p35k.state.v1'); photoAll().then(ps => Promise.all(ps.map(p => photoDel(p.id)))).finally(() => { S = presetState(); persist(); ob = null; obStep = 0; render(); }); },
  install: async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; render(); },
};
function refreshForm() { const f = $('#obform'); if (f && !S.onboarded) f.innerHTML = formSection(obStep); else if (S.onboarded && $('#sheet').querySelector('.sheet')) { const y = $('#sheet').scrollTop; A['profile-edit'](); $('#sheet').scrollTop = y; } }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (fn) fn(el.dataset, el, e);
});
document.addEventListener('input', e => {
  const k = e.target.dataset.k;
  if (k && ob) ob[k] = e.target.value;
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.set) { if (!t.value) return; S.settings[t.dataset.set] = t.value; if (['startDate', 'weddingDate'].includes(t.dataset.set)) { S.plans = {}; const td = todayStr(); if (!workoutDoneToday(td)) E.planFor(S, td, true); } persist(); toast('Saved'); }
  if (t.dataset.rem) { const v = t.dataset.f === 'every' ? +t.value : t.value; S.settings.reminders[t.dataset.rem][t.dataset.f] = v; persist(); toast('Reminder updated'); }
});

// ---------- player bridge
function runPlayer(plan) {
  openPlayer({ S, persist, toast, E, onClose: () => { render(); } }, plan);
}

// Ready on first open; no body measurements are assumed.
function presetState() {
  const state = defaultState(), t = todayStr();
  state.profile = { age: null, heightCm: null, weightKg: null, level: 'beginner', pushups: 5, squats: 20, plank: 30, pullups: 0, baselineEstimated: true, pushupVariation: 'knee', equip: ['dumbbells'], dumbbells: '2, 3, 5', minutes: 15, avoid: 'jumping, high-impact', pullupModule: false, goals: [...GOALS] };
  state.settings.startDate = t > '2026-11-06' ? t : '2026-11-06';
  state.settings.weddingDate = '2026-12-09'; state.settings.waterGoal = 2500;
  state.habits = DEFAULT_HABITS().map(h => ({ ...h, created: t }));
  state.prog = E.initProg(state.profile);
  state.benchmarks = [{ date: t, pushups: 5, squats: 20, plank: 30, pullups: 0, baseline: true, estimated: true, pushupVariation: 'knee' }];
  state.onboarded = true;
  return state;
}

// ---------- boot
// One-time migration: programme start moved from 5 Nov to 6 Nov for users who haven't trained yet.
if (S.onboarded && !S.migrated1 && S.settings.startDate === '2026-11-05' && !S.workouts.length && todayStr() <= '2026-11-05') { S.settings.startDate = '2026-11-06'; S.plans = {}; }
if (!S.onboarded) S = presetState();
S.migrated1 = true; persist();
render();
setInterval(tickReminders, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tickReminders(); if (todayStr() !== habitDate && view === 'habits' && E.diffDays(todayStr(), habitDate) > 6) habitDate = todayStr(); } });
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.__p35 = { get S() { return S; }, E, render, go };
