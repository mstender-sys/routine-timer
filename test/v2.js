require('./smoke-env.js');
const calls = [];
global.window.AudioContext = undefined; global.setTimeout = (f) => f(); global.navigator.userAgent = 'CrKey';
require('../src/routine-timer-card.js');
const Card = global.__defs['routine-timer-card'];
const RealDate = Date; let NOW = null;
const setNow = (d, t) => { const [H, M, S] = t.split(':').map(Number); NOW = new RealDate(2026, 10, d, H, M, S || 0);
  global.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(NOW.getTime()); } static now() { return NOW.getTime(); } }; };
const states = { 'input_text.store': { state: '', attributes: { max: 255 } }, 'input_text.status': { state: 'idle', attributes: {} }, 'sensor.waze': { state: '22.4', attributes: {} } };
const hass = { language: 'nl', states, connection: null,
  callService(d, s, data) { calls.push(`${d}.${s} ${JSON.stringify(data)}`); if (d === 'input_text') states[data.entity_id] = { state: data.value, attributes: states[data.entity_id].attributes }; },
  callApi(m, path) { calls.push(`API ${path.split('?')[0]}`); return Promise.resolve(path.includes('vakantie') ? [{ summary: 'Herfstvakantie', start: { date: '2026-11-24' } }] : []); } };
const txt = (c) => c._w.innerHTML.replace(/<style[\s\S]*?<\/style>/, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const cfg = {
  store_entity: 'input_text.store', state_entity: 'input_text.status', notify_service: 'notify.mobile_app_tel', sound: 'off',
  people: [{ id: 's', name: 'Sam' }, { id: 'h', name: 'Hugo', picture: 'https://x/hugo.jpg' }],
  routines: [
    { id: 'och', name: 'Ochtend', days: ['mon', 'tue', 'wed', 'thu', 'fri'], arrive_by: '08:30', travel_time_entity: 'sensor.waze', travel_margin: 3, end_label: 'school',
      steps: [{ id: 'op', name: 'Aankleden', start: '07:00', script_start: 'script.licht_aan', notify_unchecked: true },
              { id: 'eten', name: 'Eten', start: '07:30' },
              { id: 'gym', name: 'Gymtas', start: '07:50', days: ['wed'], people: ['s'] }] },
    { id: 'bed', name: 'Bedtijd', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], end_time: '19:30',
      steps: [{ id: 'pyj', name: 'Pyjama', start: '19:00' }, { id: 'tand', name: 'Tanden', start: '19:15', script_end: 'scene.nacht' }] },
  ] };
const c = new Card(); c.setConfig(cfg);
const run = (d, t, label) => { setNow(d, t); calls.length = 0; c.hass = hass; c._render(); console.log(`${label || ''} ${d}/11 ${t} → ${txt(c).slice(0, 150)}`); if (calls.length) console.log('   calls:', calls.join(' | ')); };
run(24, '05:30');           // tue: idle, next ochtend
run(24, '06:59:59');
run(24, '07:00:00');        // transition → script licht_aan + status
run(24, '07:45');           // eten; end 08:30-22-3 = 08:05
run(25, '07:51', 'wed');    // gymtas only on wednesday
// check-off everything for Sam (op, eten) on tue
run(24, '07:40');
c._toggle('op', 's'); c._toggle('eten', 's'); console.log('   store:', states['input_text.store'].state);
run(24, '07:40:02', 'reward');
c._toggle('op', 'h'); c._toggle('eten', 'h');
run(24, '07:40:04', 'all ready');
console.log('   status:', states['input_text.status'].state);
c._control('skip'); run(24, '07:40:06', 'skip');
c._control('pause'); run(24, '07:42', 'paused'); c._control('pause'); run(24, '07:43', 'resumed');
run(24, '12:00', 'midday');
run(24, '19:16', 'bed');
run(24, '19:30:00', 'bed end');
run(28, '10:00', 'sat');
// calendar skip
const c2 = new Card(); c2.setConfig(Object.assign({}, cfg, { store_entity: undefined, state_entity: undefined, skip_calendar: 'calendar.vakantie' }));
setNow(24, '07:10'); c2.hass = hass; c2._render(); Promise.resolve().then(() => Promise.resolve()).then(() => { c2._render(); console.log('holiday →', txt(c2).slice(0, 120)); });
// old v1 config still works
const c3 = new Card(); c3.setConfig({ end_time: '08:00', people: [{ id: 'a', name: 'A' }], steps: [{ name: 'X', start: '07:00' }, { name: 'Y', start: '07:30' }] });
setNow(24, '07:40'); c3.hass = { language: 'en', states: {}, callService() {}, callApi: () => Promise.resolve([]) }; c3._render(); console.log('v1 →', txt(c3).slice(0, 100));
