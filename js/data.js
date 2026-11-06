// Exercise library, progression chains, poses for the stick-figure demos.
// Pure data — no DOM access, safe to import from Node for testing.

// ---------- Poses (viewBox 0 0 200 110). Joints: H head, S shoulder, P pelvis, K knee, F foot, E elbow, W wrist.
// K2/F2/E2/W2 = optional far-side limbs (drawn dimmer).
const stand = { H:[100,16], S:[100,30], P:[100,60], K:[100,80], F:[100,100], E:[104,45], W:[104,60] };
const fwd = { ...stand, E:[114,38], W:[130,40] };
const up = { ...stand, E:[112,22], W:[116,6] };
const jackOut = { ...stand, K:[84,80], F:[72,100], K2:[116,80], F2:[128,100], E:[122,20], W:[136,8], E2:[78,20], W2:[64,8] };
const jackIn = { ...stand, K2:[100,80], F2:[100,100], E2:[96,45], W2:[96,60] };
const squatDn = { H:[92,30], S:[92,42], P:[78,74], K:[112,72], F:[100,100], E:[112,50], W:[128,48] };
const lungeDn = { H:[100,24], S:[100,38], P:[100,70], K:[128,74], F:[128,100], K2:[84,92], F2:[66,100], E:[104,52], W:[104,64] };
const lungeBulg = { ...lungeDn, F2:[66,82], K2:[84,82] };
const pushUp = { H:[158,46], S:[140,56], P:[90,68], K:[60,80], F:[30,94], E:[140,76], W:[140,96] };
const pushDn = { H:[158,80], S:[140,84], P:[90,88], K:[60,92], F:[30,96], E:[120,80], W:[140,96] };
const kneeUp = { H:[158,46], S:[140,56], P:[100,72], K:[70,94], F:[44,80], E:[140,76], W:[140,96] };
const kneeDn = { H:[158,80], S:[140,84], P:[100,90], K:[70,94], F:[44,80], E:[120,82], W:[140,96] };
const incUp = { H:[158,32], S:[140,40], P:[90,58], K:[60,78], F:[30,98], E:[144,56], W:[152,72] };
const incDn = { H:[158,48], S:[140,56], P:[90,70], K:[60,84], F:[30,98], E:[128,66], W:[152,72] };
const decUp = { H:[158,52], S:[140,62], P:[90,66], K:[60,68], F:[30,70], E:[140,80], W:[140,98] };
const decDn = { H:[158,82], S:[140,86], P:[90,80], K:[60,74], F:[30,70], E:[122,86], W:[140,98] };
const wallUp = { H:[128,18], S:[120,32], P:[98,62], K:[88,82], F:[78,100], E:[135,34], W:[150,34] };
const wallDn = { H:[142,22], S:[134,34], P:[104,62], K:[90,82], F:[78,100], E:[124,46], W:[150,34] };
const pikeUp = { H:[140,68], S:[125,60], P:[92,32], K:[70,64], F:[48,98], E:[128,80], W:[130,98] };
const pikeDn = { H:[150,88], S:[134,76], P:[96,40], K:[72,68], F:[48,98], E:[116,86], W:[130,98] };
const plankA = { H:[160,60], S:[140,68], P:[90,74], K:[60,86], F:[30,98], E:[140,96], W:[165,96] };
const plankB = { ...plankA, P:[90,71], K:[60,84] };
const sideA = { ...plankA, P:[90,76], E:[140,96] };
const sideB = { ...plankA, P:[90,64], K:[60,80] };
const mtnA = { H:[158,46], S:[140,56], P:[90,68], K:[120,76], F:[108,96], E:[140,76], W:[140,96], K2:[60,80], F2:[30,94] };
const mtnB = { H:[158,46], S:[140,56], P:[90,68], K:[60,80], F:[30,94], E:[140,76], W:[140,96], K2:[120,76], F2:[108,96] };
const dbA = { H:[34,88], S:[50,92], P:[100,92], K:[112,66], F:[140,66], E:[56,70], W:[52,48] };
const dbB = { ...dbA, K:[112,66], F:[140,66], K2:[130,88], F2:[162,90], E2:[40,90], W2:[22,92] };
const lrFlat = { H:[34,88], S:[50,92], P:[100,92], K:[130,92], F:[160,92], E:[70,94], W:[90,94] };
const lrUp = { ...lrFlat, K:[100,62], F:[100,32] };
const bicA = { ...dbA, K:[116,66], F:[140,70], K2:[130,86], F2:[158,90], E:[44,76], W:[44,86] };
const bicB = { ...dbA, K:[130,86], F:[158,90], K2:[116,66], F2:[140,70], E:[44,76], W:[44,86] };
const hollowA = { H:[40,84], S:[56,86], P:[100,92], K:[130,76], F:[150,86], E:[44,66], W:[34,52] };
const hollowB = { H:[34,80], S:[50,78], P:[100,90], K:[135,84], F:[165,76], E:[36,64], W:[22,52] };
const vupB = { H:[70,42], S:[70,52], P:[100,90], K:[130,60], F:[150,34], E:[100,60], W:[130,40] };
const bridgeA = { H:[24,90], S:[40,92], P:[90,92], K:[130,66], F:[150,92], E:[70,94], W:[100,94] };
const bridgeB = { ...bridgeA, P:[90,64], S:[40,88], H:[24,86] };
const slBridgeB = { ...bridgeB, K2:[140,48], F2:[170,34] };
const calfB = { H:[100,10], S:[100,24], P:[100,54], K:[100,74], F:[100,94], E:[104,40], W:[104,54] };
const wallSitA = { H:[64,26], S:[64,40], P:[64,70], K:[104,70], F:[104,100], E:[78,58], W:[92,66] };
const wallSitB = { ...wallSitA, P:[64,71], K:[104,71] };
const dipUp = { H:[84,34], S:[84,46], P:[84,70], K:[128,72], F:[150,100], E:[84,62], W:[84,68] };
const dipDn = { H:[84,52], S:[84,64], P:[84,88], K:[128,84], F:[150,100], E:[102,76], W:[84,68] };
const curlA = { ...stand, E:[104,46], W:[104,62] };
const curlB = { ...stand, E:[106,46], W:[120,28] };
const rowA = { H:[134,40], S:[124,46], P:[80,56], K:[84,80], F:[84,100], E:[124,66], W:[124,84] };
const rowB = { ...rowA, E:[104,56], W:[120,60] };
const superA = { H:[160,90], S:[140,92], P:[100,94], K:[60,94], F:[30,94], E:[158,94], W:[178,94] };
const superB = { H:[160,76], S:[140,84], P:[100,92], K:[60,84], F:[30,76], E:[158,80], W:[178,70] };
const snowA = { ...superB, E:[120,88], W:[100,90] };
const snowB = { ...superB, E:[160,76], W:[180,72] };
const hangA = { H:[104,32], S:[100,44], P:[100,70], K:[100,86], F:[100,100], E:[92,28], W:[90,12] };
const hangHalf = { ...hangA, H:[104,28], S:[100,38], P:[100,64], K:[100,80], F:[100,96] };
const pullTop = { H:[106,8], S:[100,24], P:[100,50], K:[100,66], F:[100,82], E:[84,28], W:[90,12] };
const burpeeLow = { H:[132,66], S:[120,72], P:[84,76], K:[110,84], F:[96,100], E:[132,86], W:[140,98] };
const kneeHigh = { ...stand, K:[118,62], F:[118,82], K2:[100,80], F2:[100,100] };
const kneeHighB = { ...stand, K2:[118,62], F2:[118,82], K:[100,80], F:[100,100] };
const quadA = { ...stand, K2:[100,80], F2:[100,100] };
const quadB = { ...stand, K2:[104,82], F2:[128,68] };
const fold = { H:[132,76], S:[118,66], P:[84,58], K:[86,80], F:[84,100], E:[122,82], W:[126,94] };
const quadAll = { H:[150,50], S:[130,58], P:[80,58], K:[80,92], F:[56,96], E:[130,78], W:[130,96] };
const cat = { ...quadAll, H:[150,66], S:[130,66], P:[80,66] };
const cow = { ...quadAll, H:[152,40], S:[130,52], P:[80,50] };
const childB = { H:[135,92], S:[120,88], P:[70,86], K:[80,92], F:[56,96], E:[150,94], W:[170,96] };
const cobraB = { H:[150,56], S:[135,70], P:[95,92], K:[60,94], F:[30,94], E:[135,88], W:[135,96] };
const hipFlexA = { H:[100,26], S:[100,40], P:[96,72], K:[126,76], F:[126,100], K2:[76,98], F2:[50,98], E:[104,54], W:[110,66] };
const hipFlexB = { ...hipFlexA, P:[108,74], S:[106,40], H:[106,26] };
const wgsB = { ...lungeDn, E:[104,40], W:[112,18] };
const chestA = { ...stand, E:[118,44], W:[134,40] };
const chestB = { ...stand, E:[126,32], W:[140,20] };
const armOut = { ...stand, E:[120,30], W:[140,30] };
const armCircUp = { ...stand, E:[104,16], W:[104,2] };
const tabletopRow = { H:[150,60], S:[134,66], P:[84,72], K:[56,82], F:[36,98], E:[130,84], W:[124,96] };
const tabletopRowB = { ...tabletopRow, S:[130,72] };
const inchA = stand;
const inchB = { ...pikeUp, H:[142,70] };

const pressA = { ...stand, E:[110,42], W:[110,28] };
const pressB = { ...stand, E:[108,22], W:[106,4] };
const birdB = { H:[150,52], S:[130,58], P:[80,58], K:[80,92], F:[56,96], E:[152,56], W:[178,54], K2:[52,60], F2:[22,62] };
const trA = { ...quadAll, E:[130,78], W:[124,60] };
const trB = { ...quadAll, E:[126,70], W:[122,44] };
export const POSES = {
  pressA, pressB, birdB, trA, trB,
  stand, fwd, up, jackOut, jackIn, squatDn, lungeDn, lungeBulg, pushUp, pushDn, kneeUp, kneeDn, incUp, incDn, decUp, decDn,
  wallUp, wallDn, pikeUp, pikeDn, plankA, plankB, sideA, sideB, mtnA, mtnB, dbA, dbB, lrFlat, lrUp, bicA, bicB, hollowA, hollowB,
  vupB, bridgeA, bridgeB, slBridgeB, calfB, wallSitA, wallSitB, dipUp, dipDn, curlA, curlB, rowA, rowB, superA, superB, snowA, snowB,
  hangA, hangHalf, pullTop, burpeeLow, kneeHigh, kneeHighB, quadA, quadB, fold, cat, cow, quadAll, childB, cobraB, hipFlexA, hipFlexB,
  wgsB, chestA, chestB, armOut, armCircUp, tabletopRow, tabletopRowB, inchA, inchB,
};

// Props are small static SVG fragments drawn behind the figure.
const PROPS = {
  wall: '<line x1="156" y1="6" x2="156" y2="100" class="prop"/>',
  wallL: '<line x1="56" y1="6" x2="56" y2="100" class="prop"/>',
  bar: '<line x1="56" y1="12" x2="144" y2="12" class="prop thick"/>',
  chair: '<rect x="62" y="68" width="26" height="32" rx="3" class="prop"/>',
  boxR: '<rect x="146" y="72" width="30" height="28" rx="3" class="prop"/>',
  boxL: '<rect x="14" y="70" width="28" height="30" rx="3" class="prop"/>',
  boxLsm: '<rect x="14" y="72" width="30" height="28" rx="3" class="prop"/>',
  table: '<line x1="100" y1="66" x2="170" y2="66" class="prop thick"/><line x1="170" y1="66" x2="170" y2="100" class="prop"/>',
};

// ---------- Exercises
// type: 'reps' | 'time'. base = target on entering the exercise; ceil = target at which we advance; step = increase per success.
const L = (id, name, o) => ({ id, name, type:'reps', base:8, ceil:15, step:1, groups:[], muscles:'', cues:[], poses:['stand','stand'], stress:[], ...o });

export const EX = {};
function add(...list) { list.forEach(e => { EX[e.id] = e; }); }

// Push
add(
 L('wallPush','Wall push-up',{ base:10, ceil:20, step:2, groups:['chest','shoulders'], muscles:'Chest, front shoulders, triceps', poses:['wallUp','wallDn'], props:'wall',
   cues:['Hands at chest height, a little wider than shoulders.','Body in one straight line from head to heels.','Lower chest toward the wall, then press away.'] }),
 L('inclinePush','Incline push-up',{ base:8, ceil:15, groups:['chest','shoulders'], muscles:'Chest, shoulders, triceps', poses:['incUp','incDn'], props:'boxR', stress:['wrist'],
   cues:['Hands on a sturdy bench, sofa or stair, shoulder-width.','Squeeze glutes and abs; keep a straight line.','Chest to the edge, elbows ~45° from your body.'] }),
 L('kneePush','Knee push-up',{ base:8, ceil:15, groups:['chest','shoulders'], muscles:'Chest, shoulders, triceps', poses:['kneeUp','kneeDn'], stress:['wrist'],
   cues:['Knees on a mat, straight line from knees to head.','Hands under shoulders, core tight.','Lower chest to a fist-height from the floor, press up.'] }),
 L('pushup','Push-up',{ base:6, ceil:15, groups:['chest','shoulders'], muscles:'Chest, shoulders, triceps, core', poses:['pushUp','pushDn'], stress:['wrist'], easier:'kneePush',
   cues:['Hands under shoulders, body like a plank.','Elbows about 45° from your ribs, not flared.','Lower with control until chest is close to the floor, then press.'] }),
 L('diamond','Diamond push-up',{ base:5, ceil:12, groups:['chest','arms'], muscles:'Triceps, inner chest', poses:['pushUp','pushDn'], stress:['wrist','elbow'], easier:'pushup',
   cues:['Thumbs and index fingers form a diamond under your chest.','Keep elbows tucked close to the body.','Go as low as you can with a flat back.'] }),
 L('decline','Decline push-up',{ base:5, ceil:12, groups:['chest','shoulders'], muscles:'Upper chest, shoulders, triceps', poses:['decUp','decDn'], props:'boxL', stress:['wrist','shoulder'], easier:'pushup',
   cues:['Feet on a stable surface, hands under shoulders.','Do not let hips sag or pike.','Lower until nose is near the floor, press up.'] }),
// Shoulders
 L('pikeHold','Downward-dog hold',{ type:'time', base:15, ceil:40, step:5, groups:['shoulders'], muscles:'Shoulders, upper back, hamstrings', poses:['pikeUp','pikeUp'], stress:['wrist','shoulder'],
   cues:['Hips high, body an upside-down V.','Press the floor away; head between arms.','Keep a soft bend in knees if hamstrings are tight.'] }),
 L('pike','Pike push-up',{ base:5, ceil:12, groups:['shoulders','chest'], muscles:'Shoulders, triceps, upper chest', poses:['pikeUp','pikeDn'], stress:['wrist','shoulder'], easier:'pikeHold',
   cues:['Start in an inverted V, hips high.','Bend elbows to lower the crown of your head toward the floor.','Press back up through your shoulders.'] }),
 L('pikeElev','Elevated pike push-up',{ base:4, ceil:10, groups:['shoulders'], muscles:'Shoulders, triceps', poses:['pikeUp','pikeDn'], props:'boxL', stress:['wrist','shoulder'], easier:'pike',
   cues:['Feet on a sturdy chair or step.','Hips stacked high over shoulders.','Lower slowly, drive up without arching your lower back.'] }),
// Triceps / biceps
 L('benchDip','Bench dip',{ base:8, ceil:15, groups:['arms','shoulders'], muscles:'Triceps, front shoulders', poses:['dipUp','dipDn'], props:'chair', stress:['shoulder','wrist'],
   cues:['Hands on the edge of a sturdy chair, fingers forward.','Keep your back close to the chair.','Lower until elbows are about 90°, then press up.'] }),
 L('benchDipStraight','Bench dip, legs straight',{ base:6, ceil:14, groups:['arms','shoulders'], muscles:'Triceps, front shoulders', poses:['dipUp','dipDn'], props:'chair', stress:['shoulder','wrist'], easier:'benchDip',
   cues:['Heels on the floor, legs straight.','Shoulders down away from your ears.','Slow lowering, full press-up.'] }),
 L('dbCurl','Dumbbell curl',{ load:true, base:10, ceil:15, groups:['arms'], muscles:'Biceps', equip:'dumbbells', poses:['curlA','curlB'], stress:['elbow'],
   cues:['Elbows pinned to your sides.','Curl up without swinging your torso.','Lower for 2–3 seconds.'] }),
 L('bandCurl','Resistance-band curl',{ base:10, ceil:18, groups:['arms'], muscles:'Biceps', equip:'bands', poses:['curlA','curlB'], stress:['elbow'],
   cues:['Stand on the band, elbows by your sides.','Curl to shoulders, keep wrists straight.','Slowly lower to full extension.'] }),
 L('towelCurl','Isometric towel curl',{ type:'time', base:15, ceil:30, step:5, groups:['arms'], muscles:'Biceps', poses:['curlA','curlB'],
   cues:['Stand on a towel, hold the ends with both hands.','Pull up as if curling, resisting with your foot.','Breathe steadily and hold the tension.'] }),
// Pull / back
 L('scapPull','Scapular pull-up',{ base:6, ceil:12, groups:['back','arms'], muscles:'Lats, lower traps, grip', equip:'bar', poses:['hangA','hangHalf'], props:'bar', stress:['shoulder'],
   cues:['Hang from the bar with straight arms.','Without bending elbows, pull shoulder blades down.','Pause, then relax back to a full hang.'] }),
 L('negPull','Negative pull-up',{ base:3, ceil:6, groups:['back','arms'], muscles:'Lats, biceps, grip', equip:'bar', poses:['pullTop','hangA'], props:'bar', stress:['shoulder','elbow'], easier:'scapPull',
   cues:['Jump or step so your chin is above the bar.','Lower yourself for 4–5 seconds.','Reset and repeat; control matters more than speed.'] }),
 L('assistedPull','Band-assisted pull-up',{ base:4, ceil:10, groups:['back','arms'], muscles:'Lats, biceps', equip:'bar+bands', poses:['hangA','pullTop'], props:'bar', stress:['shoulder','elbow'], easier:'negPull',
   cues:['Loop a band over the bar and under a knee or foot.','Start from a dead hang, pull chest to the bar.','Lower under control.'] }),
 L('chinUp','Chin-up',{ base:3, ceil:10, groups:['back','arms'], muscles:'Biceps, lats', equip:'bar', poses:['hangA','pullTop'], props:'bar', stress:['shoulder','elbow'], easier:'negPull',
   cues:['Underhand grip, shoulder-width.','Pull until chin clears the bar.','Lower fully to straight arms.'] }),
 L('pullup','Pull-up',{ base:3, ceil:12, groups:['back','arms'], muscles:'Lats, upper back, biceps', equip:'bar', poses:['hangA','pullTop'], props:'bar', stress:['shoulder','elbow'], easier:'negPull',
   cues:['Overhand grip slightly wider than shoulders.','Pull elbows down toward your hips.','Chin over the bar, then lower fully.'] }),
 L('bandRow','Resistance-band row',{ base:10, ceil:20, groups:['back','arms'], muscles:'Lats, rhomboids, biceps', equip:'bands', poses:['rowA','rowB'],
   cues:['Anchor the band at chest height or sit with it around your feet.','Pull elbows back, squeeze shoulder blades.','Return slowly without shrugging.'] }),
 L('dbRow','Single-arm dumbbell row',{ base:10, ceil:15, load:true, groups:['back','arms'], muscles:'Lats, rhomboids, biceps', equip:'dumbbells', poses:['rowA','rowB'], unilateral:true, stress:['back'],
   cues:['Hinge forward with a flat back, hand on a chair for support.','Row the weight to your hip.','Lower fully. Repeat on both sides.'] }),
 L('tableRow','Table row (inverted)',{ base:5, ceil:12, groups:['back','arms'], muscles:'Lats, rhomboids, biceps', poses:['tabletopRow','tabletopRowB'], props:'table', stress:['shoulder'],
   cues:['Only use a very sturdy table; lie underneath and grip the edge.','Body straight, heels on the floor.','Pull chest to the table edge, lower slowly.'] }),
 L('bandPull','Band pull-apart',{ base:12, ceil:25, step:2, groups:['back','shoulders'], muscles:'Rear shoulders, upper back', equip:'bands', poses:['armOut','fwd'],
   cues:['Hold the band at chest height, arms straight.','Pull apart until arms form a T.','Control the return.'] }),
 L('superman','Superman',{ base:10, ceil:20, step:2, groups:['back'], muscles:'Lower back, glutes, rear shoulders', poses:['superA','superB'], stress:['back'],
   cues:['Lie face down, arms extended.','Lift arms, chest and legs a few centimetres.','Squeeze glutes, hold 1 second, lower.'] }),
 L('snowAngel','Reverse snow angel',{ base:10, ceil:20, step:2, groups:['back','shoulders'], muscles:'Mid/upper back, rear shoulders', poses:['snowA','snowB'], stress:['back'],
   cues:['Lie face down, chest slightly lifted.','Sweep arms from hips to overhead in an arc.','Keep thumbs up and neck long.'] }),
// Core
 L('deadBug','Dead bug',{ base:8, ceil:16, step:2, groups:['core'], muscles:'Deep core, hip flexors', poses:['dbA','dbB'], unilateral:true,
   cues:['Back flat on the floor, knees over hips.','Extend opposite arm and leg slowly.','Keep lower back pressed down; alternate sides.'] }),
 L('bicycle','Bicycle crunch',{ base:12, ceil:24, step:2, groups:['core'], muscles:'Abs, obliques', poses:['bicA','bicB'],
   cues:['Hands light behind head, shoulders off the floor.','Rotate to bring elbow toward opposite knee.','Move slowly; do not pull on your neck.'] }),
 L('legRaise','Lying leg raise',{ base:8, ceil:15, groups:['core'], muscles:'Lower abs, hip flexors', poses:['lrFlat','lrUp'], stress:['back'], easier:'deadBug',
   cues:['Hands under hips, lower back pressed down.','Raise legs together to vertical.','Lower slowly, stop before your back arches.'] }),
 L('vUp','V-up',{ base:6, ceil:15, groups:['core'], muscles:'Abs, hip flexors', poses:['lrFlat','vupB'], stress:['back'], easier:'legRaise',
   cues:['Lie flat, arms overhead.','Lift legs and torso together, reaching for your toes.','Lower with control.'] }),
 L('kneePlank','Knee plank',{ type:'time', base:20, ceil:45, step:5, groups:['core'], muscles:'Abs, shoulders', poses:['plankA','plankB'], stress:['shoulder'],
   cues:['Forearms down, elbows under shoulders.','Straight line from knees to head.','Squeeze abs and glutes; breathe.'] }),
 L('plank','Plank',{ type:'time', base:25, ceil:75, step:5, groups:['core','shoulders'], muscles:'Abs, shoulders, glutes', poses:['plankA','plankB'], stress:['shoulder'], easier:'kneePlank',
   cues:['Forearms down, elbows under shoulders.','Body in a straight line; don’t let hips sag or rise.','Squeeze glutes, ribs down, breathe steadily.'] }),
 L('plankTaps','Plank shoulder taps',{ base:12, ceil:30, step:2, groups:['core','shoulders'], muscles:'Core, shoulders', poses:['mtnA','mtnB'], stress:['wrist','shoulder'], easier:'plank',
   cues:['High plank, feet wider than hips.','Tap opposite shoulder, keep hips still.','Move slowly and stay level.'] }),
 L('kneeSide','Knee side plank',{ type:'time', base:15, ceil:40, step:5, groups:['core'], muscles:'Obliques', poses:['sideA','sideB'], unilateral:true, stress:['shoulder'],
   cues:['Lie on your side, bent knees, elbow under shoulder.','Lift hips so shoulders-hips-knees are in line.','Hold, then switch sides.'] }),
 L('sidePlank','Side plank',{ type:'time', base:20, ceil:60, step:5, groups:['core'], muscles:'Obliques, glute medius', poses:['sideA','sideB'], unilateral:true, stress:['shoulder'], easier:'kneeSide',
   cues:['Elbow under shoulder, legs stacked.','Lift hips high; body in a straight line.','Hold, then switch sides.'] }),
 L('sideDip','Side plank hip dip',{ base:8, ceil:16, step:2, groups:['core'], muscles:'Obliques', poses:['sideA','sideB'], unilateral:true, stress:['shoulder'], easier:'sidePlank',
   cues:['Hold a side plank on your forearm.','Lower hip toward floor, lift back up.','Complete all reps, then switch.'] }),
 L('tuckHollow','Tuck hollow hold',{ type:'time', base:15, ceil:35, step:5, groups:['core'], muscles:'Abs', poses:['hollowA','hollowA'],
   cues:['Lie on back, knees tucked, arms by your ears or at sides.','Press lower back into the floor; lift shoulders.','Hold the tight, rounded shape.'] }),
 L('hollow','Hollow body hold',{ type:'time', base:15, ceil:45, step:5, groups:['core'], muscles:'Abs, hip flexors', poses:['hollowA','hollowB'], stress:['back'], easier:'tuckHollow',
   cues:['Lower back glued to the floor.','Legs and arms extended, shoulders lifted.','If your back arches, bend knees or raise legs higher.'] }),
// Legs
 L('chairSquat','Chair squat',{ base:10, ceil:20, step:2, groups:['legs','glutes'], muscles:'Quads, glutes', poses:['fwd','squatDn'], props:'chair', stress:['knee'],
   cues:['Stand in front of a chair, feet shoulder-width.','Sit back and down until you lightly touch the chair.','Drive through your heels to stand.'] }),
 L('squat','Bodyweight squat',{ base:12, ceil:25, step:2, groups:['legs','glutes'], muscles:'Quads, glutes, hamstrings', poses:['fwd','squatDn'], stress:['knee'], easier:'chairSquat',
   cues:['Feet shoulder-width, toes slightly out.','Hips back and down, chest tall, knees track over toes.','Push the floor away to stand.'] }),
 L('tempoSquat','Tempo squat (3-1-1)',{ base:8, ceil:15, groups:['legs','glutes'], muscles:'Quads, glutes', poses:['fwd','squatDn'], stress:['knee'], easier:'squat',
   cues:['Lower for 3 seconds.','Pause 1 second at the bottom.','Stand up explosively but controlled.'] }),
 L('jumpSquat','Jump squat',{ base:8, ceil:15, groups:['legs','cardio'], muscles:'Quads, glutes, calves', poses:['squatDn','up'], stress:['knee','ankle','impact'], easier:'tempoSquat',
   cues:['Squat down, then jump up explosively.','Land softly on bent knees.','Reset between reps if form slips.'] }),
 L('revLunge','Reverse lunge',{ base:8, ceil:14, groups:['legs','glutes'], muscles:'Quads, glutes', poses:['stand','lungeDn'], unilateral:true, stress:['knee'],
   cues:['Step back and lower until both knees are about 90°.','Front knee over ankle, torso tall.','Push through the front heel to stand. Count reps per leg.'] }),
 L('bulgarian','Bulgarian split squat',{ base:6, ceil:12, groups:['legs','glutes'], muscles:'Quads, glutes', poses:['stand','lungeBulg'], unilateral:true, stress:['knee','ankle'], easier:'revLunge',
   cues:['Rear foot on a chair behind you.','Lower straight down, front knee tracks over toes.','Drive up through the front heel. Per leg.'] }),
 L('bridge','Glute bridge',{ base:12, ceil:25, step:2, groups:['glutes','legs'], muscles:'Glutes, hamstrings', poses:['bridgeA','bridgeB'],
   cues:['Lie on back, knees bent, feet flat.','Drive hips up, squeeze glutes at the top.','Lower slowly without arching your back.'] }),
 L('slBridge','Single-leg glute bridge',{ base:8, ceil:15, groups:['glutes','legs'], muscles:'Glutes, hamstrings', poses:['bridgeA','slBridgeB'], unilateral:true, easier:'bridge',
   cues:['One foot flat, other leg extended.','Drive hips up level; do not rotate.','Per leg.'] }),
 L('calfRaise','Calf raise',{ base:15, ceil:30, step:3, groups:['legs'], muscles:'Calves', poses:['stand','calfB'], stress:['ankle'],
   cues:['Stand tall, hold a wall for balance.','Rise high onto your toes, pause.','Lower slowly.'] }),
 L('slCalf','Single-leg calf raise',{ base:10, ceil:20, step:2, groups:['legs'], muscles:'Calves', poses:['stand','calfB'], unilateral:true, stress:['ankle'], easier:'calfRaise',
   cues:['Balance on one foot with light wall support.','Full range: deep stretch to high toes.','Per leg.'] }),
 L('wallSit','Wall sit',{ type:'time', base:20, ceil:60, step:5, groups:['legs'], muscles:'Quads, glutes', poses:['wallSitA','wallSitB'], props:'wallL', stress:['knee'],
   cues:['Back flat on the wall, thighs parallel to the floor.','Knees over ankles.','Breathe; keep weight in your heels.'] }),
// Cardio
 L('highKnees','High knees (low impact march)',{ type:'time', base:30, ceil:60, step:5, groups:['cardio'], muscles:'Heart & lungs, hip flexors', poses:['kneeHigh','kneeHighB'],
   cues:['March or jog on the spot, knees to hip height.','Pump your arms.','Stay on the balls of your feet; keep it brisk.'] }),
 L('jacks','Jumping jacks',{ type:'time', base:30, ceil:60, step:5, groups:['cardio'], muscles:'Full body, heart & lungs', poses:['jackIn','jackOut'], stress:['impact','ankle','knee'], easier:'highKnees',
   cues:['Jump feet out while arms sweep overhead.','Land softly.','Keep a steady rhythm.'] }),
 L('mountain','Mountain climbers',{ type:'time', base:20, ceil:50, step:5, groups:['cardio','core'], muscles:'Core, shoulders, heart & lungs', poses:['mtnA','mtnB'], stress:['wrist','shoulder'], easier:'jacks',
   cues:['High plank, hands under shoulders.','Drive knees toward chest alternately.','Hips low and level; breathe.'] }),
 L('burpee','Burpee',{ base:5, ceil:15, groups:['cardio','legs','chest'], muscles:'Full body, heart & lungs', poses:['stand','pushUp'], stress:['wrist','impact','knee','back'], easier:'mountain',
   cues:['Squat, hands down, jump or step feet back to plank.','Optional push-up, then jump or step feet in.','Stand and jump (or just stand up) to finish.'] }),
// Mobility / warm-up / cool-down (time-based)
 L('armCircles','Arm circles',{ type:'time', base:30, ceil:30, step:0, groups:['mobility','shoulders'], muscles:'Shoulders', poses:['armOut','armCircUp'], role:'warm',
   cues:['Arms out to the sides.','Make slow circles, small to big.','Switch direction halfway.'] }),
 L('catCow','Cat–cow',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','back'], muscles:'Spine, core', poses:['cat','cow'], role:'both',
   cues:['On hands and knees.','Inhale: lift chest and tailbone. Exhale: round your back.','Move slowly with your breath.'] }),
 L('worldGreatest','World’s greatest stretch',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','legs'], muscles:'Hips, hamstrings, thoracic spine', poses:['lungeDn','wgsB'], role:'warm', stress:['knee'],
   cues:['Step into a deep lunge.','Rotate chest and reach the top arm to the ceiling.','Switch sides each round.'] }),
 L('inchworm','Inchworm',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','core'], muscles:'Hamstrings, shoulders, core', poses:['inchA','inchB'], role:'warm', stress:['wrist'],
   cues:['Hinge forward and walk hands out to a plank.','Walk hands back to your feet.','Keep legs as straight as comfortable.'] }),
 L('marchWarm','Marching warm-up',{ type:'time', base:40, ceil:40, step:0, groups:['cardio','mobility'], muscles:'Whole body', poses:['kneeHigh','kneeHighB'], role:'warm',
   cues:['March on the spot, swinging your arms.','Raise your knees a little higher each 10 seconds.','Breathe through your nose if you can.'] }),
 L('bwSquatWarm','Slow bodyweight squat',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','legs'], muscles:'Hips, knees, ankles', poses:['fwd','squatDn'], role:'warm', stress:['knee'],
   cues:['Slow, deep, pain-free squats.','Chest tall, heels down.','Use this to rehearse form.'] }),
 L('childPose',"Child's pose",{ type:'time', base:40, ceil:40, step:0, groups:['mobility','back'], muscles:'Lower back, lats, hips', poses:['quadAll','childB'], role:'cool',
   cues:['Sit hips back toward your heels.','Arms long in front.','Breathe deep into your back.'] }),
 L('kegel','Kegel (pelvic-floor) session',{ type:'time', base:600, ceil:600, step:0, groups:[], muscles:'Pelvic floor', poses:['quadAll','childB'], role:'kegel',
   cues:['Sit or lie comfortably.','Squeeze gently, then fully let go.','Keep breathing the whole time.'] }),
 L('cobra','Cobra stretch',{ type:'time', base:30, ceil:30, step:0, groups:['mobility','core'], muscles:'Abs, chest, spine', poses:['superA','cobraB'], role:'cool', stress:['back'],
   cues:['Lie face down, hands by your chest.','Press up gently, hips on the floor.','Keep shoulders away from ears.'] }),
 L('hipFlexor','Kneeling hip-flexor stretch',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','legs'], muscles:'Hip flexors, quads', poses:['hipFlexA','hipFlexB'], role:'cool', stress:['knee'],
   cues:['Half-kneeling, back knee on a mat.','Tuck pelvis and shift forward gently.','Hold each side; breathe slowly.'] }),
 L('hamstringFold','Standing hamstring fold',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','legs'], muscles:'Hamstrings, lower back', poses:['stand','fold'], role:'cool', stress:['back'],
   cues:['Hinge at the hips with soft knees.','Let your head and arms hang.','Don’t bounce; relax a little deeper each breath.'] }),
 L('chestStretch','Doorway chest stretch',{ type:'time', base:30, ceil:30, step:0, groups:['mobility','chest','shoulders'], muscles:'Chest, front shoulders', poses:['chestA','chestB'], role:'cool', stress:['shoulder'],
   cues:['Forearm on a wall or door frame, elbow at shoulder height.','Gently turn your chest away.','Hold each side.'] }),
 L('quadStretch','Standing quad stretch',{ type:'time', base:30, ceil:30, step:0, groups:['mobility','legs'], muscles:'Quads, hip flexors', poses:['quadA','quadB'], role:'cool', stress:['knee'],
   cues:['Hold a wall; pull one heel to your glute.','Knees together, hips tucked.','Hold each side.'] }),
);


add(
 L('gobletSquat','Goblet squat',{ base:10, ceil:15, load:true, equip:'dumbbells', groups:['legs','glutes','core'], muscles:'Quads, glutes, core', poses:['fwd','squatDn'], stress:['knee'], easier:'squat',
   cues:['Hold one dumbbell vertically at your chest with both hands.','Elbows inside knees at the bottom, chest tall.','Drive through your whole foot to stand.'] }),
 L('dbBentRow','Dumbbell bent-over row',{ base:10, ceil:15, load:true, equip:'dumbbells', groups:['back','arms'], muscles:'Lats, mid-back, rear shoulders, biceps', poses:['rowA','rowB'], stress:['back'],
   cues:['Hinge at the hips with a flat back, soft knees.','Row both dumbbells toward your hips.','Squeeze shoulder blades together, lower for 2 seconds.'] }),
 L('dbPress','Dumbbell shoulder press',{ base:8, ceil:12, load:true, equip:'dumbbells', groups:['shoulders','arms'], muscles:'Shoulders, triceps', poses:['pressA','pressB'], stress:['shoulder'], easier:'pike',
   cues:['Dumbbells at shoulder height, ribs down, glutes tight.','Press overhead without leaning back.','Lower under control to shoulder level.'] }),
 L('dbRdl','Dumbbell Romanian deadlift',{ base:10, ceil:15, load:true, equip:'dumbbells', groups:['glutes','legs','back'], muscles:'Hamstrings, glutes, lower back', poses:['stand','rowA'], stress:['back'],
   cues:['Soft knees, dumbbells in front of thighs.','Push hips back, keep the weights close to your legs.','Stop when you feel a hamstring stretch; squeeze glutes to stand.'] }),
 L('bwRdl','Good-morning hip hinge',{ base:12, ceil:20, step:2, groups:['glutes','legs','back'], muscles:'Hamstrings, glutes', poses:['stand','rowA'], stress:['back'],
   cues:['Hands behind head, soft knees.','Push hips back with a flat back.','Squeeze glutes to return.'] }),
 L('dbThruster','Dumbbell thruster',{ base:8, ceil:14, load:true, equip:'dumbbells', groups:['legs','shoulders','cardio'], muscles:'Legs, shoulders, heart & lungs', poses:['squatDn','pressB'], stress:['knee','shoulder'], easier:'gobletSquat',
   cues:['Hold dumbbells at your shoulders and squat.','Drive up and press the weights overhead in one flow.','Lower to shoulders as you sink into the next squat.'] }),
 L('squatReach','Squat to overhead reach',{ base:10, ceil:18, step:2, groups:['legs','shoulders','cardio'], muscles:'Legs, shoulders', poses:['squatDn','up'], stress:['knee'],
   cues:['Squat down with chest tall.','Stand and reach both arms overhead.','Keep a steady rhythm.'] }),
 L('dbRearFly','Dumbbell reverse fly',{ base:10, ceil:15, load:true, equip:'dumbbells', groups:['back','shoulders'], muscles:'Rear shoulders, upper back', poses:['rowA','rowB'], stress:['back'],
   cues:['Hinge forward, slight bend in elbows, light weights.','Lift arms out to the sides, leading with elbows.','Pause, then lower slowly. Go light — control beats load.'] }),
 L('proneYTW','Prone Y-T-W raises',{ base:8, ceil:14, groups:['back','shoulders'], muscles:'Lower & mid traps, rear shoulders', poses:['superA','superB'], stress:['back'],
   cues:['Lie face down, forehead off the floor, thumbs up.','Lift arms into a Y, then a T, then a W — one rep.','Squeeze shoulder blades, keep your neck long.'] }),
 L('birdDog','Bird dog',{ base:10, ceil:16, groups:['core','glutes','back'], muscles:'Deep core, glutes, spinal stabilisers', poses:['quadAll','birdB'], unilateral:true,
   cues:['Hands under shoulders, knees under hips, flat back.','Extend opposite arm and leg without rotating your hips.','Pause 1 second, return slowly. Reps per side.'] }),
 L('wallAngel','Wall angels',{ base:10, ceil:15, groups:['back','shoulders','mobility'], muscles:'Lower traps, shoulder blades, thoracic spine', poses:['chestA','armCircUp'], props:'wall',
   cues:['Stand with back, hips and head near the wall, ribs down.','Slide arms up and down the wall like a snow angel.','Keep contact as far as comfortable — don’t arch your back.'] }),
 L('thoracic','Thoracic rotation (open book)',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','back'], muscles:'Upper back, chest', poses:['trA','trB'], unilateral:true,
   cues:['On hands and knees, one hand behind your head.','Rotate your elbow up toward the ceiling.','Follow with your eyes; breathe. Both sides.'] }),
 L('hamstringMob','Hamstring mobility (lying)',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','legs'], muscles:'Hamstrings', poses:['lrFlat','lrUp'], unilateral:true,
   cues:['Lie on your back, raise one leg.','Hold behind the thigh, gently straighten the knee.','Relax your shoulders; both sides.'] }),
 L('hipMob','Hip mobility (90/90 switches)',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','legs'], muscles:'Hip rotators, glutes', poses:['bicA','bicB'], stress:['knee'],
   cues:['Sit with both knees bent at 90° on the floor.','Rotate both knees over to the other side.','Move slowly; sit tall if you can.'] }),
 L('deepSquat','Deep squat mobility hold',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','legs'], muscles:'Hips, ankles, adductors', poses:['squatDn','squatDn'], stress:['knee'],
   cues:['Sink into a comfortable deep squat, hold a post if needed.','Elbows gently press knees out.','Keep heels down and chest lifted.'] }),
 L('downDog','Downward dog',{ type:'time', base:30, ceil:30, step:0, groups:['mobility','shoulders','legs'], muscles:'Shoulders, hamstrings, calves', poses:['pikeUp','pikeUp'], stress:['wrist'],
   cues:['Hips high, heels reaching toward the floor.','Press the floor away, ears between arms.','Pedal your feet to loosen calves.'] }),
 L('shoulderMob','Shoulder mobility (controlled circles)',{ type:'time', base:40, ceil:40, step:0, groups:['mobility','shoulders'], muscles:'Shoulder joint, upper back', poses:['armOut','armCircUp'],
   cues:['Make the biggest slow circles you can with each arm.','Keep ribs down and neck relaxed.','Switch direction halfway.'] }),
 L('walk','Brisk walk',{ type:'time', base:600, ceil:900, step:60, groups:['cardio'], muscles:'Heart & lungs, legs', poses:['kneeHigh','kneeHighB'],
   cues:['Walk fast enough that you can talk but not sing.','Swing your arms, stand tall, land softly.','Outdoors or on the spot — the timer keeps counting.'] }),
 L('walkGentle','Gentle walk',{ type:'time', base:900, ceil:1500, step:0, groups:['cardio','mobility'], muscles:'Whole body, circulation', poses:['kneeHigh','kneeHighB'],
   cues:['Easy conversational pace.','Relax shoulders and breathe slowly.','This is recovery — keep it comfortable.'] }),
 L('scapRetract','Prone scapular squeeze',{ base:10, ceil:20, step:2, groups:['back'], muscles:'Mid traps, rhomboids', poses:['superA','superB'],
   cues:['Lie face down, arms by your sides, palms down.','Squeeze shoulder blades together and lift hands slightly.','Hold 2 seconds, no neck strain.'] }),
 L('scapPushup','Scapular push-up',{ base:8, ceil:15, groups:['shoulders','back','chest'], muscles:'Serratus, shoulder blade control', poses:['pushUp','pushUp'], stress:['wrist'],
   cues:['High plank with straight arms.','Let the chest sink between shoulder blades, then push the floor away.','Elbows stay locked — only the shoulder blades move.'] }),
 L('deadHang','Dead hang',{ type:'time', base:10, ceil:40, step:5, equip:'bar', groups:['back','arms'], muscles:'Grip, lats, shoulder health', poses:['hangA','hangA'], props:'bar', stress:['shoulder'],
   cues:['Grip the bar, hang with active shoulders.','Don’t shrug to your ears; stay relaxed.','Step down safely when grip fades.'] }),
);

// ---------- Progression chains (index 0 = easiest). Dynamic chains depend on equipment.
export const CHAINS = {
  push: ['wallPush','inclinePush','kneePush','pushup','diamond','decline'],
  inclineAcc: ['inclinePush'],
  shoulder: ['pikeHold','pike','pikeElev'],
  tri: ['benchDip','benchDipStraight'],
  squat: ['chairSquat','squat','tempoSquat','jumpSquat'],
  lunge: ['revLunge','bulgarian'],
  glute: ['bridge','slBridge'],
  calf: ['calfRaise','slCalf'],
  wallSit: ['wallSit'],
  coreDyn: ['deadBug','bicycle','legRaise','vUp'],
  corePlank: ['kneePlank','plank','plankTaps'],
  side: ['kneeSide','sidePlank','sideDip'],
  hollow: ['tuckHollow','hollow'],
  mountain: ['mountain'],
  wallAngel: ['wallAngel'], birdDog: ['birdDog'], ytw: ['proneYTW'], thoracic: ['thoracic'],
  hipflex: ['hipFlexor'], hamstring: ['hamstringMob'], catcow: ['catCow'], downDog: ['downDog'], deepSquat: ['deepSquat'],
  hipMob: ['hipMob'], shoulderMob: ['shoulderMob'], walk: ['walk'], walkGentle: ['walkGentle'], chest: ['chestStretch'], childs: ['childPose'],
  cardio: ['highKnees','jacks','mountain','burpee'],
};
export const DYNAMIC = ['goblet','row','press','rdl','sarow','rfly','thruster','pullDev'];
export function dynamicChain(id, equip = []) {
  const has = k => equip.includes(k);
  switch (id) {
    case 'goblet': return has('dumbbells') ? ['gobletSquat'] : ['squat','tempoSquat'];
    case 'row': return has('dumbbells') ? ['dbBentRow'] : has('bands') ? ['bandRow'] : ['tableRow','superman'];
    case 'sarow': return has('dumbbells') ? ['dbRow'] : has('bands') ? ['bandRow'] : ['tableRow','superman'];
    case 'press': return has('dumbbells') ? ['dbPress'] : ['pikeHold','pike','pikeElev'];
    case 'rdl': return has('dumbbells') ? ['dbRdl'] : ['bwRdl'];
    case 'rfly': return has('dumbbells') ? ['dbRearFly'] : has('bands') ? ['bandPull'] : ['snowAngel'];
    case 'thruster': return has('dumbbells') ? ['dbThruster'] : ['squatReach'];
    case 'pullDev': // optional pull-up development; bar-dependent steps appear only if a bar is owned
      return has('bar') ? ['scapRetract','deadHang','scapPull','negPull', ...(has('bands') ? ['assistedPull'] : []), 'chinUp','pullup'] : ['scapRetract','scapPushup'];
    default: return CHAINS[id];
  }
}
export const CHAIN_LABEL = {
  push:'Push-ups', inclineAcc:'Incline push-ups', shoulder:'Shoulders', squat:'Squats', goblet:'Goblet squat', lunge:'Reverse lunge', rdl:'Romanian deadlift',
  row:'Bent-over row', sarow:'Single-arm row', press:'Shoulder press', rfly:'Reverse fly', thruster:'Thruster', corePlank:'Plank', side:'Side plank',
  glute:'Glute bridge', calf:'Calf raise', coreDyn:'Dead bug / core', walk:'Brisk walk', pullDev:'Pull-up development', birdDog:'Bird dog',
};

// ---------- Day purposes (weekly template). Slots are in priority order; later slots are dropped first when time is short.
export const FOCUS = {
  upper:        { title:'Upper-body strength', sub:'Push · row · press · plank', kind:'train', strength:true, slots:['push','row','press','inclineAcc',['corePlank','hollow']] },
  lower:        { title:'Lower-body strength', sub:'Squat · lunge · hinge · glutes · calves', kind:'train', strength:true, slots:['goblet','lunge','rdl','glute','calf'] },
  posture:      { title:'Posture & mobility', sub:'Upper back · scapular control · hips · thoracic spine', kind:'posture', slots:['wallAngel','birdDog','ytw','thoracic','hipflex','hamstring','catcow'] },
  conditioning: { title:'Full-body conditioning', sub:'Squat · push · thruster · climbers · core', kind:'train', strength:true, slots:['squat','push','thruster','mountain','coreDyn'] },
  backcore:     { title:'Back & core', sub:'Rows · rear delts · Y-T-W · side plank · glutes', kind:'train', strength:true, slots:['sarow','rfly','ytw',['side','coreDyn'],'glute'] },
  cardioflex:   { title:'Cardio & flexibility', sub:'Brisk walk · hips · hamstrings · shoulders', kind:'cardioflex', slots:['walk','downDog','deepSquat','hipMob','hamstring','shoulderMob'] },
  recovery:     { title:'Recovery day', sub:'Gentle walk · light stretching', kind:'recovery', slots:['walkGentle','catcow','hamstring','hipflex','thoracic','chest','childs'] },
  rest:         { title:'Rest day', sub:'Let your body rebuild', kind:'rest', slots:[] },
};
export const WEEK = { 1:'upper', 2:'lower', 3:'posture', 4:'conditioning', 5:'backcore', 6:'cardioflex', 0:'recovery' };
export const STRENGTH = new Set(['upper','lower','conditioning','backcore']);

export const STRESS_WORDS = [
  [/knee|patella|acl|meniscus/, 'knee'], [/wrist|carpal/, 'wrist'], [/shoulder|rotator/, 'shoulder'],
  [/back|spine|disc|sciatica/, 'back'], [/ankle|achilles|foot|heel/, 'ankle'], [/elbow|tendon|tennis/, 'elbow'],
  [/jump|impact|high.?impact/, 'impact'],
];
