/*
 * Routine Timer Card for Home Assistant
 * A visual countdown for daily routines (morning, after school, bedtime): a shrinking pie per step, a timeline,
 * per-person check-off with rewards, alternate-week presence, side steps, a big final countdown, sounds or a voice
 * per step, scripts per step, notifications, a status helper for automations and clothing advice.
 * https://github.com/OWNER/routine-timer-card  ·  MIT licence
 */
(() => {
const VERSION = '2.0.1';

/* ---------------------------------------------------------------- texts */
const TXT = {
  en: {
    min1: 'minute', minN: 'minutes', left: '{n} {u} left: {what}', then: 'then: {what}', thenEnd: 'then: {what}!',
    hurry: 'almost done: {what}!', sideLeft: '{what} · {n} {u} left', sleep: 'Still sleeping 😴', sleepSub: '{what} at {t}',
    idle: 'Hello!', idleSub: 'next: {name} at {t}', idleTomorrow: 'next: {name} tomorrow at {t}', free: 'Day off 🎉', freeSub: 'no routine today',
    holiday: 'No routine today 🎉', done: 'All done! 🎉', doneSub: '', end: 'done',
    dry: 'dry', rain: 'rain', snow: 'snow', thick: 'warm coat', coat: 'coat', hat: 'hat', gloves: 'gloves', cardigan: 'jumper',
    tshirt: 't-shirt', raincoat: 'raincoat', boots: 'boots', snowboots: 'snow boots', ready: '{name} finished {what}',
    noSteps: 'Add a routine with steps in the card editor.', reward: 'Well done, {names}!', rewardSub: 'everything done', stars: '{n} this week',
    paused: 'Paused', skip: 'Next step', startNow: 'Start now', pause: 'Pause', resume: 'Continue', allReady: 'Everyone is ready! 🎉',
    notifyTitle: 'Routine', notifyMsg: '{names}: "{what}" is not checked off yet', leaveAt: 'leave at {t}',
  },
  nl: {
    min1: 'minuut', minN: 'minuten', left: 'nog {n} {u} {what}', then: 'daarna: {what}', thenEnd: 'daarna: {what}!',
    hurry: 'nog even {what}!', sideLeft: '{what} · nog {n} {u}', sleep: 'Nog even slapen 😴', sleepSub: 'om {t} {what}',
    idle: 'Hallo!', idleSub: 'straks: {name} om {t}', idleTomorrow: 'morgen: {name} om {t}', free: 'Vrije dag 🎉', freeSub: 'geen routine vandaag',
    holiday: 'Vandaag geen routine 🎉', done: 'Helemaal klaar! 🎉', doneSub: '', end: 'klaar',
    dry: 'droog', rain: 'regen', snow: 'sneeuw', thick: 'dikke jas', coat: 'jas', hat: 'muts', gloves: 'handschoenen', cardigan: 'vest',
    tshirt: 't-shirt', raincoat: 'regenjas', boots: 'laarzen', snowboots: 'snowboots', ready: '{name} klaar met {what}',
    noSteps: 'Voeg in de kaart-editor een routine met stappen toe.', reward: 'Goed gedaan, {names}!', rewardSub: 'alles af', stars: '{n} deze week',
    paused: 'Gepauzeerd', skip: 'Volgende stap', startNow: 'Nu beginnen', pause: 'Pauze', resume: 'Verder', allReady: 'Iedereen is klaar! 🎉',
    notifyTitle: 'Routine', notifyMsg: '{names}: "{what}" is nog niet afgevinkt', leaveAt: 'vertrek {t}',
  },
};
const lang = (h) => (h && String(h.language || (h.locale && h.locale.language) || 'en').slice(0, 2) === 'nl' ? 'nl' : 'en');
const tr = (h, k, v) => { const d = TXT[lang(h)] || TXT.en; return String(k in d ? d[k] : k in TXT.en ? TXT.en[k] : k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : '')); };
const and = (h, xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${lang(h) === 'nl' ? 'en' : 'and'} ${xs[xs.length - 1]}`);

/* ---------------------------------------------------------------- extra icons: rtc:comb, rtc:lion, rtc:hairbrush */
const RTC_ICONS = {
  comb: 'M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5V9H3zM4 9h1.6v11H4zM7.1 9h1.6v11H7.1zM10.2 9h1.6v11h-1.6zM13.3 9h1.6v11h-1.6zM16.4 9h1.6v11h-1.6zM19.4 9H21v11h-1.6z',
  hairbrush: 'M9 2h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-1.2v6.5a1.8 1.8 0 0 1-3.6 0V14H9a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm-.5 3v1.4h1.4V5zm2.8 0v1.4h1.4V5zm2.8 0v1.4h1.4V5zM8.5 8.2v1.4h1.4V8.2zm2.8 0v1.4h1.4V8.2zm2.8 0v1.4h1.4V8.2z',
  lion: 'M12 3.7 C13.46 0.19 17.32 1.32 16.65 5.07 C19.78 2.9 22.41 5.94 19.82 8.73 C23.62 8.6 24.2 12.58 20.51 13.52 C23.78 15.47 22.11 19.13 18.5 17.93 C20.2 21.34 16.81 23.51 14.42 20.55 C14.01 24.33 9.99 24.33 9.58 20.55 C7.19 23.51 3.8 21.34 5.5 17.93 C1.89 19.13 0.22 15.47 3.49 13.52 C-0.2 12.58 0.38 8.6 4.18 8.73 C1.59 5.94 4.22 2.9 7.35 5.07 C6.68 1.32 10.54 0.19 12 3.7Z M12 4.9A7.4 7.4 0 1 0 12 19.7A7.4 7.4 0 1 0 12 4.9Z M12 5.8A6.5 6.5 0 1 1 12 18.8A6.5 6.5 0 1 1 12 5.8Z M8.08 5.83A1.8 1.8 0 1 1 8.08 9.43A1.8 1.8 0 1 1 8.08 5.83Z M15.92 5.83A1.8 1.8 0 1 1 15.92 9.43A1.8 1.8 0 1 1 15.92 5.83Z M8.01 6.75A0.8 0.8 0 1 0 8.01 8.35A0.8 0.8 0 1 0 8.01 6.75Z M15.99 6.75A0.8 0.8 0 1 0 15.99 8.35A0.8 0.8 0 1 0 15.99 6.75Z M9.5 10.15A0.95 0.95 0 1 0 9.5 12.05A0.95 0.95 0 1 0 9.5 10.15Z M14.5 10.15A0.95 0.95 0 1 0 14.5 12.05A0.95 0.95 0 1 0 14.5 10.15Z M12 12.8A3.0 2.1 0 1 0 12 17A3.0 2.1 0 1 0 12 12.8Z M10.7 13.5L13.3 13.5L12 14.9Z M11.75 14.8H12.25V15.9H11.75Z',
};
window.customIcons = window.customIcons || {};
if (!window.customIcons.rtc) {
  window.customIcons.rtc = {
    getIcon: async (n) => ({ path: RTC_ICONS[n] || '' }),
    getIconList: async () => Object.keys(RTC_ICONS).map((name) => ({ name })),
  };
}

/* ---------------------------------------------------------------- helpers */
const pad = (n) => String(n).padStart(2, '0');
const isCast = () => /CrKey/i.test(navigator.userAgent);
const esc = (x) => String(x == null ? '' : x).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const toMin = (t) => { const m = String(t || '').match(/^(\d{1,2}):(\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
const hhmm = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(Math.round(m % 60))}`;
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const COLORS = ['#7f9cf5', '#f5a623', '#5dcaa5', '#ef6f8a', '#4fb3d9', '#9a7ff5', '#c48a5a', '#e24b4a', '#43a047', '#3d8fe0'];
const uid = () => Math.random().toString(36).slice(2, 7);

/* Present this day? People with alternate_weeks are present in the week that contains week_start, and every other week after/before it. */
function present(p, d) {
  if (!p.alternate_weeks || !p.week_start) return true;
  const a = new Date(`${p.week_start}T12:00:00`), t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  if (isNaN(a)) return true;
  const w = Math.floor(Math.round((t - a) / 86400000) / 7);
  return ((w % 2) + 2) % 2 === 0;
}

/* Clothing advice for the forecast hour closest to leaving */
function clothing(h, f) {
  const t = Number(f.apparent_temperature != null ? f.apparent_temperature : f.temperature), c = f.condition || '';
  const wet = (Number(f.precipitation) || 0) >= 0.2 || /rain|pour/.test(c), snow = /snow/.test(c);
  const k = [];
  if (t <= 3) k.push(['mdi:coat-rack', tr(h, 'thick')], ['mdi:hat-fedora', tr(h, 'hat')], ['mdi:hand-back-left', tr(h, 'gloves')]);
  else if (t <= 10) k.push(['mdi:coat-rack', tr(h, 'thick')]);
  else if (t <= 16) k.push(['mdi:coat-rack', tr(h, 'coat')]);
  else if (t <= 20) k.push(['mdi:tshirt-crew', tr(h, 'cardigan')]);
  else k.push(['mdi:tshirt-crew', tr(h, 'tshirt')]);
  if (snow) k.push(['mdi:snowflake', tr(h, 'snowboots')]);
  else if (wet) k.push(['mdi:umbrella', tr(h, 'raincoat')], ['mdi:shoe-formal', tr(h, 'boots')]);
  return { t: Math.round(Number(f.temperature)), wt: tr(h, snow ? 'snow' : wet ? 'rain' : 'dry'), k };
}

/* Config with defaults. Older configs with top-level steps become one routine. Steps get ids and are sorted by start time. */
function normStep(s, i) {
  return Object.assign({ id: `s${i}`, name: `Step ${i + 1}`, icon: 'mdi:timer-outline', color: COLORS[i % COLORS.length], checkable: true }, s);
}
function normalize(c) {
  const cfg = Object.assign({ sound: 'cast', warn_minutes: 5, full_height: true, volume: 70, people: [], routines: [] }, c || {});
  cfg.people = (cfg.people || []).map((p, i) => Object.assign({ id: `p${i}`, name: `Person ${i + 1}`, icon: 'mdi:account', color: COLORS[(i + 7) % COLORS.length] }, p));
  let rs = Array.isArray(cfg.routines) && cfg.routines.length ? cfg.routines : null;
  if (!rs) { rs = [{ id: 'main', steps: cfg.steps || [] }]; ['days', 'end_time', 'end_label', 'done_message'].forEach((k) => { if (cfg[k] != null) rs[0][k] = cfg[k]; }); }
  cfg.routines = rs.map((r, ri) => {
    const o = Object.assign({ id: `r${ri}`, name: '', days: ['mon', 'tue', 'wed', 'thu', 'fri'], end_time: '08:00', skip_on_calendar: true }, r);
    o.steps = (o.steps || []).map(normStep).filter((s) => toMin(s.start) != null).sort((a, b) => toMin(a.start) - toMin(b.start));
    return o;
  });
  return cfg;
}
/* ISO week key, for the weekly star count */
function weekKey(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-${Math.ceil(((t - y) / 86400000 + 1) / 7)}`;
}

/* ---------------------------------------------------------------- sounds
 * Built-in sounds are synthesised (no files needed). 'voice' speaks a text: via a Home Assistant TTS engine
 * (tts_engine, played by the screen itself, also on cast displays) or else via the browser's own speech. */
const SOUNDS = {
  chime: { type: 'triangle', notes: [[523, 0], [659, 0.18], [784, 0.36]], len: 0.5 },
  bell: { type: 'sine', notes: [[1319, 0], [2637, 0], [1319, 0.6]], len: 1.6 },
  beep: { type: 'square', notes: [[988, 0]], len: 0.25, gain: 0.15 },
  double: { type: 'triangle', notes: [[660, 0], [660, 0.35]], len: 0.5 },
  triple: { type: 'triangle', notes: [[988, 0], [988, 0.25], [988, 0.5], [1319, 0.75]], len: 0.5 },
  fanfare: { type: 'sawtooth', notes: [[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.75], [1047, 0.9]], len: 0.4, gain: 0.18 },
  gong: { type: 'sine', notes: [[196, 0], [294, 0], [392, 0.01]], len: 3 },
  ok: { type: 'triangle', notes: [[784, 0], [1047, 0.12]], len: 0.5 },
};
const SOUND_NAMES = ['none', 'chime', 'bell', 'beep', 'double', 'triple', 'fanfare', 'gong', 'voice'];
const AUDIO = {};
function tone(kind, volume = 70) {
  const def = SOUNDS[kind]; if (!def) return 0;
  try {
    const C = window.AudioContext || window.webkitAudioContext; const c = AUDIO.ctx || (AUDIO.ctx = new C()); if (c.resume) c.resume();
    const peak = Math.max(0.0002, (def.gain || 0.35) * Math.max(0, Math.min(100, Number(volume))) / 70);
    def.notes.forEach(([f, d]) => {
      const o = c.createOscillator(), g = c.createGain(), st = c.currentTime + 0.03 + d;
      o.type = def.type; o.frequency.value = f; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(peak, st + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, st + def.len);
      o.start(st); o.stop(st + def.len + 0.05);
    });
    return (Math.max(...def.notes.map((n) => n[1])) + def.len) * 1000;
  } catch (e) { return 0; }
}
async function speak(hass, engine, text, volume = 70) {
  if (!text) return;
  const vol = Math.max(0, Math.min(1, Number(volume) / 100));
  if (engine && hass) {
    try {
      const r = await hass.callApi('POST', 'tts_get_url', { engine_id: engine, message: text, language: hass.language });
      const a = new Audio(r.path || r.url); a.volume = vol; await a.play(); return;
    } catch (e) { /* fall back to browser speech */ }
  }
  try {
    const u = new SpeechSynthesisUtterance(text); u.lang = hass && lang(hass) === 'nl' ? 'nl-NL' : (hass && hass.language) || 'en';
    u.volume = vol; window.speechSynthesis.speak(u);
  } catch (e) { /* no speech */ }
}
/* play one sound: kind = sound name or 'voice' (then text is spoken). Returns a rough duration in ms */
function play(hass, cfg, kind, text, volume) {
  const vol = volume != null && volume !== '' ? volume : (cfg && cfg.volume != null ? cfg.volume : 70);
  if (!kind || kind === 'none') return 0;
  if (kind === 'voice') { speak(hass, cfg && cfg.tts_engine, text, vol); return 2500; }
  return tone(kind, vol);
}
const fill = (t, s) => String(t || '').replace(/\{name\}/g, s.name || '').replace(/\{short\}/g, s.short || s.name || '');


/* sizes are written as @N (pixels on a 1280×800 screen) and scale with the card */
const U = (css) => css.replace(/@(\d+(?:\.\d+)?)/g, 'calc($1px * var(--u))');
const STYLE = U(`
:host{display:block}
.w{position:relative;box-sizing:border-box;padding:@16 @24;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);grid-template-rows:minmax(0,1fr) auto;gap:@14;background:var(--rtc-background,#0b0f17);color:#fff;font-family:var(--paper-font-body1_-_font-family,Roboto,sans-serif);user-select:none;-webkit-user-select:none;overflow:hidden;border-radius:var(--ha-card-border-radius,12px)}
.w.full{height:100vh;border-radius:0}
.w.box{aspect-ratio:16/10}
.big{background:#161c28;border-radius:@24;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:@10;padding:@16;position:relative;min-height:0}
.pie{position:relative;width:min(@400,100%);aspect-ratio:1;flex-shrink:1;min-height:0}
.pie svg{position:absolute;inset:0;transform:rotate(-90deg)}
.pie .in{position:absolute;inset:16%;border-radius:50%;background:#161c28;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pie .in ha-icon{--mdc-icon-size:@76}
.pie .n{font-size:@92;font-weight:800;line-height:.9;font-variant-numeric:tabular-nums}
.pie .u{font-size:@26;color:#cfd8dc}
.now{font-size:@38;font-weight:700;text-align:center;line-height:1.1}
.nx{font-size:@22;color:#aab4c3;text-align:center}
.side{display:flex;align-items:center;justify-content:center;gap:@10;background:#1c2434;border:@3 solid var(--c);border-radius:@18;padding:@6 @16;font-size:@24;font-weight:700}
.side ha-icon{--mdc-icon-size:@30;color:var(--c)}
.clk{position:absolute;left:@22;top:@14;font-size:@30;font-weight:700;color:#cfd8dc}
.ttl{position:absolute;right:@22;top:@18;font-size:@20;color:#aab4c3}
.list{display:flex;flex-direction:column;gap:@8;min-height:0}
.st{flex:1;min-height:0;background:#161c28;border-radius:@18;display:flex;align-items:center;gap:@14;padding:0 @16;border:@3 solid transparent;transition:opacity .4s}
.st.cur{border-color:var(--c);background:#1c2434}
.st.past{opacity:.38}
.st .ic{width:@56;height:@56;border-radius:@16;background:var(--c);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.st .ic ha-icon{--mdc-icon-size:@36;color:#0b0f17}
.st .tx{flex:1;min-width:0}
.st .nm{font-size:@24;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st .tm{font-size:@16;color:#aab4c3}
.kids{display:flex;gap:@8}
.kid{width:@58;height:@58;border-radius:50%;border:@3 solid var(--k);background:transparent;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:0;color:inherit;font:inherit}
.kid ha-icon{--mdc-icon-size:@30;color:var(--k)}
.kid b{position:absolute;bottom:@-6;right:@-6;font-size:@13;background:#0b0f17;border-radius:@8;padding:@1 @5;color:#cfd8dc}
.kid.ok{background:var(--k)}
.kid.ok ha-icon{color:#fff}
.kid.ok::after{content:'✓';position:absolute;top:@-8;right:@-8;width:@26;height:@26;border-radius:50%;background:#2e7d32;color:#fff;font-size:@17;font-weight:800;display:flex;align-items:center;justify-content:center;border:@2 solid #0b0f17}
.tl{grid-column:1 / span 2;position:relative;height:@56;background:#161c28;border-radius:@16;overflow:hidden}
.tl .sg{position:absolute;top:0;bottom:0;display:flex;align-items:center;justify-content:center;border-right:@2 solid #0b0f17}
.tl .sg ha-icon{--mdc-icon-size:@28;color:#0b0f17}
.tl .mk{position:absolute;top:@-2;bottom:@-2;width:@6;margin-left:@-3;background:#fff;border-radius:@3;box-shadow:0 0 0 @3 #0b0f17;transition:left 1s}
.tl .done{position:absolute;left:0;top:0;bottom:0;background:rgba(11,15,23,.55)}
.msg{font-size:@52;font-weight:800;text-align:center}
.msg small{display:block;font-size:@24;font-weight:400;color:#aab4c3;margin-top:@8}
.kl{display:flex;align-items:center;gap:@10;flex-wrap:wrap;justify-content:center;background:#0f141d;border-radius:@16;padding:@8 @14;font-size:@20;color:#cfd8dc}
.kl b{font-size:@22;color:#fff}
.kl span{display:flex;align-items:center;gap:@5;background:#232b3a;border-radius:@14;padding:@3 @10 @3 @7}
.kl ha-icon{--mdc-icon-size:@22;color:#b3e5fc}
.bt{position:absolute;inset:0;z-index:5;background:rgba(11,15,23,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:@4}
.bt>ha-icon{--mdc-icon-size:@96;color:var(--c)}
.bt .bn{font-size:@280;font-weight:800;line-height:.95;color:var(--c);font-variant-numeric:tabular-nums;letter-spacing:@-6}
.bt .bl{font-size:@42;font-weight:600;color:#cfd8dc}
.bt .kids{gap:@22;margin-top:@22}
.bt .kid{width:@84;height:@84}.bt .kid ha-icon{--mdc-icon-size:@44}
.ctl{position:absolute;right:@14;bottom:@14;display:flex;gap:@8}
.ctl button{width:@52;height:@52;border-radius:50%;border:0;background:#232b3a;color:#cfd8dc;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.ctl button ha-icon{--mdc-icon-size:@28}
.ctl button.on{background:#f5a623;color:#0b0f17}
.pz{position:absolute;left:50%;top:@14;transform:translateX(-50%);background:#f5a623;color:#0b0f17;font-weight:800;font-size:@20;border-radius:@12;padding:@4 @14}
.pic{width:100%;height:100%;border-radius:50%;object-fit:cover}
.kid .pic{width:calc(100% - @6);height:calc(100% - @6)}
.kid.ok .pic{opacity:.55}
.lv{position:absolute;right:@22;top:@18;font-size:@20;color:#aab4c3;display:flex;align-items:center;gap:@6}
.stars{display:flex;gap:@18;justify-content:center;margin-top:@12;font-size:@24;color:#ffd54f}
.stars span{display:flex;align-items:center;gap:@6}
.rw{position:absolute;inset:0;z-index:6;background:rgba(11,15,23,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:@10;overflow:hidden;cursor:pointer}
.rw .t{font-size:@64;font-weight:800;text-align:center}
.rw .s{font-size:@28;color:#cfd8dc}
.rw .cf{position:absolute;top:-5%;width:@14;height:@22;border-radius:@3;animation:fall linear forwards}
@keyframes fall{to{transform:translateY(115vh) rotate(720deg)}}
.empty{grid-column:1 / span 2;display:flex;align-items:center;justify-content:center;font-size:@28;color:#aab4c3}
`);
/* ================================================================ card */
class RoutineTimerCard extends HTMLElement {
  static getConfigElement() { return document.createElement('routine-timer-card-editor'); }
  static getStubConfig() {
    const t = (h, m) => `${pad(h)}:${pad(m)}`;
    return {
      people: [
        { id: 'a', name: 'Alex', icon: 'mdi:rocket-launch', color: '#3d8fe0' },
        { id: 'b', name: 'Bo', icon: 'rtc:lion', color: '#43a047' },
      ],
      routines: [{
        id: 'morning', name: 'Morning', days: ['mon', 'tue', 'wed', 'thu', 'fri'], end_time: t(8, 5), end_label: 'school',
        steps: [
          { id: 'up', name: 'Get up and dressed', short: 'get dressed', start: t(6, 45), icon: 'mdi:tshirt-crew', color: '#7f9cf5', checkable: true, big_timer: 3 },
          { id: 'eat', name: 'Breakfast', short: 'breakfast', start: t(7, 10), icon: 'mdi:food-croissant', color: '#f5a623', checkable: true },
          { id: 'teeth', name: 'Brush teeth', short: 'brush teeth', start: t(7, 35), icon: 'mdi:toothbrush', color: '#5dcaa5', checkable: true },
          { id: 'play', name: 'Play', short: 'play', start: t(7, 45), icon: 'mdi:toy-brick', color: '#9a7ff5', checkable: false },
          { id: 'shoes', name: 'Shoes and coat on', short: 'shoes on', start: t(8, 0), icon: 'mdi:shoe-sneaker', color: '#e24b4a', checkable: true },
        ],
      }],
    };
  }
  setConfig(c) {
    if (!c) throw new Error('Invalid configuration');
    this._c = normalize(c);
    this._html = null; this._cal = null;
    if (this.shadowRoot) this._render();
  }
  getCardSize() { return this._c && this._c.full_height ? 12 : 8; }
  getGridOptions() { return { columns: 'full', rows: 'auto', min_columns: 6 }; }
  connectedCallback() {
    if (!this._t) this._t = setInterval(() => this._render(), 1000);
    if (this._ro && this._w) this._ro.observe(this._w);
  }
  disconnectedCallback() { clearInterval(this._t); this._t = null; if (this._ro) this._ro.disconnect(); }
  set hass(h) {
    const first = !this._h; this._h = h;
    if (!this.shadowRoot) this._build();
    const c = this._c;
    if (c.weather_entity && h.connection && this._fcFor !== c.weather_entity) {
      this._fcFor = c.weather_entity;
      if (this._fcUnsub) { this._fcUnsub.then((u) => u && u()).catch(() => {}); }
      this._fcUnsub = h.connection.subscribeMessage((m) => { this._fc = m.forecast || []; this._html = null; this._render(); },
        { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: c.weather_entity }).catch(() => { this._fcFor = null; });
    }
    const s = c.store_entity && h.states[c.store_entity]; const key = s && s.state;
    if (first || key !== this._sk) { this._sk = key; this._render(); }
  }
  _build() {
    const r = this.attachShadow({ mode: 'open' });
    r.innerHTML = `<style>${STYLE}</style><ha-card style="background:none;border:0;box-shadow:none;overflow:hidden"><div class="w" id="w"></div></ha-card>`;
    this._w = r.getElementById('w');
    this._w.addEventListener('click', (e) => {
      const b = e.target.closest('.kid'); if (b) { this._toggle(b.dataset.s, b.dataset.k); return; }
      const ctl = e.target.closest('[data-ctl]'); if (ctl) { this._control(ctl.dataset.ctl); return; }
      if (e.target.closest('.rw')) { this._rwUntil = 0; this._render(); }
    });
    const fit = () => {
      const r2 = this._w.getBoundingClientRect(); if (!r2.width) return;
      const h = this._c && this._c.full_height ? window.innerHeight : r2.width / 1.6;
      this._w.style.setProperty('--u', String(Math.max(0.3, Math.min(r2.width / 1280, h / 800))));
    };
    this._ro = new ResizeObserver(fit); this._ro.observe(this._w); fit();
  }

  /* ---- shared state: check-offs, skip/pause offset, stars. In an input_text (shared by all screens) or per browser. */
  _lsKey() { return `rtc-state-${this._c.routines.map((r) => r.id).join('.')}`; }
  _raw() {
    if (this._c.store_entity) { const s = this._h && this._h.states[this._c.store_entity]; return s && s.state; }
    try { return localStorage.getItem(this._lsKey()); } catch (e) { return null; }
  }
  _state(rid) {
    const now = new Date(), d = dayKey(now), w = weekKey(now); let S = null;
    try { const raw = this._raw(); S = raw && raw[0] === '{' ? JSON.parse(raw) : null; } catch (e) { S = null; }
    S = S || {};
    if (S.w !== w) { S.w = w; S.s = {}; }
    S.s = S.s || {};
    if (S.d !== d || (rid && S.r !== rid)) { S.d = d; S.r = rid; S.t = {}; S.o = 0; S.p = 0; S.g = ''; }
    S.t = S.t || {}; S.o = Number(S.o) || 0; S.p = Number(S.p) || 0; S.g = S.g || '';
    return S;
  }
  _save(S) {
    const value = JSON.stringify(S);
    if (this._c.store_entity) {
      const st = this._h.states[this._c.store_entity];
      const max = Number(st && st.attributes.max) || 255;
      if (value.length > max) console.warn(`routine-timer-card: ${this._c.store_entity} is too short (${value.length} > ${max}); set its maximum length to 255`);
      this._h.callService('input_text', 'set_value', { entity_id: this._c.store_entity, value: value.slice(0, max) });
    } else { try { localStorage.setItem(this._lsKey(), value); } catch (e) { /* ignore */ } }
    this._sk = null; this._render(value);
  }
  _toggle(step, pid) {
    const x = this._ctx; if (!x) return;
    const S = this._state(x.r.id); const cur = (S.t[step] || '').split(',').filter(Boolean);
    const on = !cur.includes(pid);
    S.t[step] = (on ? [...cur, pid] : cur.filter((v) => v !== pid)).join(',');
    if (!S.t[step]) delete S.t[step];
    /* reward: everything done for this person in this routine → one star (once a day) */
    if (on && this._c.rewards !== false) {
      const g = S.g.split(',').filter(Boolean);
      x.here.forEach((p) => {
        if (g.includes(p.id) || !this._allDone(p, x, S.t)) return;
        g.push(p.id); S.s[p.id] = (Number(S.s[p.id]) || 0) + 1;
      });
      S.g = g.join(',');
    }
    if (on && this._c.sound !== 'off') tone('ok', this._c.volume);
    this._save(S);
  }
  _allDone(p, x, t) {
    const mine = x.steps.filter((s) => s.checkable && x.forStep(s).some((q) => q.id === p.id));
    return mine.length > 0 && mine.every((s) => (t[s.id] || '').split(',').includes(p.id));
  }
  _control(what) {
    const x = this._ctx; if (!x) return;
    const S = this._state(x.r.id), now = Date.now();
    if (what === 'pause') {
      if (S.p) { S.o -= (now - S.p) / 1000; S.p = 0; } else S.p = now;
    } else if (what === 'skip' && (x.cur || x.nm < x.start)) {
      const target = x.cur ? (x.next ? x.next.a : x.end) : x.start;
      S.o += (target - x.nm) * 60 + 1;
    }
    this._save(S);
  }

  /* ---- side effects (scripts, notification, status helper) run from ONE screen.
   * With a status helper: the screen that changes it does the work. Without: only cast displays. */
  _lead(desired, fn) {
    const c = this._c, h = this._h;
    if (!c.state_entity) { if (fn && isCast()) fn(); return; }
    const cur = () => { const s = h.states[c.state_entity]; return s ? s.state : null; };
    if (cur() === desired || this._leading === desired) return;
    this._leading = desired;
    setTimeout(() => {
      this._leading = null;
      if (cur() === desired) return;
      h.callService('input_text', 'set_value', { entity_id: c.state_entity, value: String(desired).slice(0, 255) });
      if (fn) fn();
    }, Math.random() * 900);
  }
  _run(entity, vars) {
    if (!entity) return;
    const [dom] = entity.split('.');
    if (dom === 'script') this._h.callService('script', 'turn_on', { entity_id: entity, variables: vars });
    else if (dom === 'scene') this._h.callService('scene', 'turn_on', { entity_id: entity });
    else this._h.callService('homeassistant', 'turn_on', { entity_id: entity });
  }
  _notifyMissing(x, s, t) {
    const c = this._c; if (!c.notify_service || !s || !s.notify_unchecked || !s.checkable) return;
    const missing = x.forStep(s).filter((p) => !(t[s.id] || '').split(',').includes(p.id)).map((p) => p.name);
    if (!missing.length) return;
    const svc = c.notify_service.replace(/^notify\./, '');
    this._h.callService('notify', svc, { title: x.r.name || tr(this._h, 'notifyTitle'), message: tr(this._h, 'notifyMsg', { names: and(this._h, missing), what: s.short || s.name }) });
  }
  _may() { const m = this._c.sound; return m === 'always' || (m === 'cast' && isCast()); }
  _sound(kind) { if (this._may()) tone(kind, this._c.volume); }
  _transition(x, prev, next, S, desired) {
    const c = this._c, h = this._h;
    if (this._may()) {
      const endKind = prev ? (prev.sound_end || (Number(prev.big_timer) ? 'triple' : 'none')) : 'none';
      const t = prev ? play(h, c, endKind, fill(prev.say_end, prev), prev.volume) : 0;
      if (next) setTimeout(() => play(h, c, next.sound_start || 'chime', fill(next.say_start, next), next.volume), t ? t + 250 : 0);
    }
    const vars = (s, ev) => ({ routine: x.r.id, step: s.id, event: ev });
    this._lead(desired, () => {
      if (prev) { this._run(prev.script_end, vars(prev, 'end')); this._notifyMissing(x, prev, S.t); }
      if (next) this._run(next.script_start, vars(next, 'start'));
    });
  }

  /* ---- which routine is relevant now? */
  _calendar(now) {
    const c = this._c; if (!c.skip_calendar || !this._h) return false;
    const d = dayKey(now);
    if (!this._cal || this._cal.d !== d || Date.now() - this._cal.at > 600000) {
      this._cal = { d, at: Date.now(), hit: this._cal && this._cal.d === d ? this._cal.hit : false };
      const a = new Date(now); a.setHours(0, 0, 0, 0); const b = new Date(a); b.setDate(b.getDate() + 1);
      this._h.callApi('GET', `calendars/${c.skip_calendar}?start=${encodeURIComponent(a.toISOString())}&end=${encodeURIComponent(b.toISOString())}`).then((evs) => {
        const kw = String(c.skip_keywords || '').split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
        this._cal.hit = (evs || []).some((e) => (kw.length ? kw.some((k) => String(e.summary || '').toLowerCase().includes(k)) : !!(e.start && e.start.date)));
        this._html = null; this._render();
      }).catch(() => {});
    }
    return this._cal.hit;
  }
  _endOf(r, steps) {
    const h = this._h;
    if (r.arrive_by && r.travel_time_entity && h.states[r.travel_time_entity]) {
      const tv = parseFloat(h.states[r.travel_time_entity].state);
      if (!isNaN(tv)) return toMin(r.arrive_by) - Math.round(tv) - (Number(r.travel_margin) || 0);
    }
    const e = toMin(r.end_time);
    return e != null ? e : toMin(steps[steps.length - 1].start) + 5;
  }
  _plan(r, d) {
    const c = this._c, here = c.people.filter((p) => present(p, d)), day = DAYS[d.getDay()];
    const forStep = (s) => (s.people && s.people.length ? here.filter((p) => s.people.includes(p.id)) : here);
    const steps = r.steps.filter((s) => (!s.days || !s.days.length || s.days.includes(day)) && (!(s.people && s.people.length) || forStep(s).length));
    const main = steps.filter((s) => !Number(s.duration));
    if (!main.length) return null;
    const end = this._endOf(r, main);
    const st = main.map((s, i) => ({ ...s, a: toMin(s.start), b: i < main.length - 1 ? toMin(main[i + 1].start) : end }));
    const side = steps.filter((s) => Number(s.duration)).map((s) => ({ ...s, a: toMin(s.start), b: toMin(s.start) + Number(s.duration) }));
    return { r, here, forStep, steps, st, side, start: st[0].a, end };
  }
  _pick(now) {
    const c = this._c, nm = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const skipped = this._calendar(now);
    const today = c.routines.filter((r) => (r.days || []).includes(DAYS[now.getDay()]) && !(skipped && r.skip_on_calendar !== false))
      .map((r) => this._plan(r, now)).filter(Boolean);
    const inWin = today.filter((x) => nm >= x.start - 60 && nm < x.end + 60).sort((a, b) => Math.abs(nm - a.start) - Math.abs(nm - b.start))[0];
    if (inWin) return { x: inWin };
    const later = today.filter((x) => x.start > nm).sort((a, b) => a.start - b.start)[0];
    if (later) return { idle: later };
    const tm = new Date(now); tm.setDate(tm.getDate() + 1);
    const tomorrow = c.routines.filter((r) => (r.days || []).includes(DAYS[tm.getDay()])).map((r) => this._plan(r, tm)).filter(Boolean).sort((a, b) => a.start - b.start)[0];
    const anyToday = c.routines.some((r) => (r.days || []).includes(DAYS[now.getDay()]));
    return { tomorrow, free: !today.length, holiday: skipped && anyToday };
  }

  _pic(p) {
    let src = p.picture;
    if (src && /^person\./.test(src)) { const s = this._h.states[src]; src = s && s.attributes.entity_picture; }
    return src ? `<img class="pic" src="${esc(src)}" alt="">` : `<ha-icon icon="${esc(p.icon)}"></ha-icon>`;
  }
  _btn(p, s, t) {
    const ok = (t[s.id] || '').split(',').includes(p.id);
    return `<button class="kid ${ok ? 'ok' : ''}" style="--k:${esc(p.color)}" data-s="${esc(s.id)}" data-k="${esc(p.id)}" aria-label="${esc(tr(this._h, 'ready', { name: p.name, what: s.short || s.name }))}">${this._pic(p)}<b>${esc(p.name)}</b></button>`;
  }
  _stars(S, people) {
    if (this._c.rewards === false) return '';
    const xs = people.filter((p) => Number(S.s[p.id]) > 0);
    return xs.length ? `<div class="stars">${xs.map((p) => `<span style="color:${esc(p.color)}">${this._pic(p).replace('class="pic"', 'class="pic" style="width:1.4em;height:1.4em"')}⭐ ${esc(tr(this._h, 'stars', { n: S.s[p.id] }))}</span>`).join('')}</div>` : '';
  }

  _render() {
    if (!this._h || !this._w || !this._c) return;
    const h = this._h, c = this._c, real = new Date();
    this._w.className = `w ${c.full_height ? 'full' : 'box'}`;
    const out = (html) => { if (html !== this._html) { this._html = html; this._w.innerHTML = html; } };
    if (!c.routines.some((r) => r.steps.length)) { out(`<div class="empty">${esc(tr(h, 'noSteps'))}</div>`); return; }
    const clockOf = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const pick = this._pick(real);
    const x0 = pick.x;
    const S = this._state(x0 ? x0.r.id : null);
    if (!x0) {
      this._ctx = null; this._lastStep = undefined; this._lastObj = null; this._seen = true;
      this._lead('idle');
      const msg = pick.idle ? [tr(h, 'idle'), tr(h, 'idleSub', { name: pick.idle.r.name || pick.idle.st[0].short || pick.idle.st[0].name, t: hhmm(pick.idle.start) })]
        : pick.holiday ? [tr(h, 'holiday'), ''] : pick.free ? [tr(h, 'free'), pick.tomorrow ? tr(h, 'idleTomorrow', { name: pick.tomorrow.r.name || pick.tomorrow.st[0].short || pick.tomorrow.st[0].name, t: hhmm(pick.tomorrow.start) }) : tr(h, 'freeSub')]
          : [tr(h, 'idle'), pick.tomorrow ? tr(h, 'idleTomorrow', { name: pick.tomorrow.r.name || pick.tomorrow.st[0].short || pick.tomorrow.st[0].name, t: hhmm(pick.tomorrow.start) }) : ''];
      out(`<div class="big" style="grid-column:1 / span 2"><div class="clk">${clockOf(real)}</div>${c.title ? `<div class="ttl">${esc(c.title)}</div>` : ''}<div class="msg">${esc(msg[0])}<small>${esc(msg[1])}</small></div>${this._stars(S, c.people)}</div>`);
      return;
    }
    /* virtual time: skip moves it forward, pause holds it */
    const vnow = new Date((S.p || real.getTime()) + S.o * 1000);
    const x = x0, nm = vnow.getHours() * 60 + vnow.getMinutes() + vnow.getSeconds() / 60;
    const { st, side, start, end } = x;
    const ci = st.findIndex((s) => nm >= s.a && nm < s.b);
    const t = S.t, unit = (n) => tr(h, n === 1 ? 'min1' : 'minN');
    const endLabel = x.r.end_label || tr(h, 'end');
    const ready = x.here.length > 0 && x.here.every((p) => this._allDone(p, x, t));
    const finished = nm >= end;
    const desired = ci >= 0 ? `${x.r.id}:${st[ci].id}${ready ? ':ready' : ''}` : finished ? `${x.r.id}:done` : `${x.r.id}:waiting`;
    this._ctx = { ...x, nm, cur: ci >= 0 ? st[ci] : null, next: ci >= 0 ? st[ci + 1] : null };
    const travel = x.r.arrive_by && x.r.travel_time_entity ? `<div class="lv"><ha-icon icon="mdi:car-clock"></ha-icon>${esc(tr(h, 'leaveAt', { t: hhmm(end) }))}</div>` : (c.title || x.r.name ? `<div class="ttl">${esc(x.r.name || c.title)}</div>` : '');
    const head = `<div class="clk">${clockOf(real)}</div>${travel}${S.p ? `<div class="pz">${esc(tr(h, 'paused'))}</div>` : ''}`;
    let big, bigT = '';
    if (ci >= 0) {
      const s = st[ci], left = s.b - nm, frac = Math.max(0, Math.min(1, left / (s.b - s.a)));
      const col = left <= 2 ? '#e24b4a' : left <= 5 ? '#f5a623' : s.color;
      const R = 46, C = 2 * Math.PI * R, mins = Math.ceil(left), next = st[ci + 1], what = s.short || s.name;
      big = `${head}<div class="pie"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${R}" fill="none" stroke="#232b3a" stroke-width="8"/><circle cx="50" cy="50" r="${R / 2}" fill="none" stroke="${esc(col)}" stroke-width="${R}" stroke-dasharray="${(C / 2).toFixed(2)}" stroke-dashoffset="${((C / 2) * (1 - frac)).toFixed(2)}"/></svg>
<div class="in"><ha-icon icon="${esc(s.icon)}" style="color:${esc(col)}"></ha-icon><div class="n">${mins}</div><div class="u">${unit(mins)}</div></div></div>
<div class="now">${esc(ready ? tr(h, 'allReady') : tr(h, 'left', { n: mins, u: unit(mins), what }))}</div><div class="nx">${esc(next ? tr(h, 'then', { what: next.short || next.name }) : tr(h, 'thenEnd', { what: endLabel }))}</div>`;
      if (c.show_controls !== false) big += `<div class="ctl"><button data-ctl="pause" class="${S.p ? 'on' : ''}" title="${esc(tr(h, S.p ? 'resume' : 'pause'))}"><ha-icon icon="${S.p ? 'mdi:play' : 'mdi:pause'}"></ha-icon></button><button data-ctl="skip" title="${esc(tr(h, 'skip'))}"><ha-icon icon="mdi:skip-next"></ha-icon></button></div>`;
      const key = `${dayKey(real)}-${x.r.id}-${s.id}`;
      if (this._lastStep !== undefined && this._lastStep !== key) this._transition(x, this._lastObj, s, S, desired);
      else if (this._lastStep === undefined && this._seen && Math.abs(nm - s.a) < 0.05) this._transition(x, null, s, S, desired);
      else this._lead(desired);
      this._lastObj = s; this._seen = true;
      const bigMin = Number(s.big_timer) || 0;
      if (bigMin > 0 && left <= bigMin && !S.p) {
        const sec = Math.max(0, Math.ceil(left * 60));
        [60, 30].forEach((m) => { if (sec <= m && sec > m - 3 && this._bp !== `${key}-${m}`) { this._bp = `${key}-${m}`; this._sound(s.beep_sound || 'beep'); } });
        const kb = s.checkable ? `<div class="kids">${x.forStep(s).map((p) => this._btn(p, s, t)).join('')}</div>` : '';
        bigT = `<div class="bt" style="--c:${esc(col)}"><ha-icon icon="${esc(s.icon)}"></ha-icon><div class="bn">${Math.floor(sec / 60)}:${pad(sec % 60)}</div><div class="bl">${esc(tr(h, 'hurry', { what }))}</div>${kb}</div>`;
      }
      const warn = Number(c.warn_minutes) || 0;
      if (warn && mins === warn && this._warned !== key && (s.b - s.a) > warn + 3 && !S.p) { this._warned = key; this._sound('double'); }
      this._lastStep = key;
    } else {
      if (this._lastStep !== undefined && this._lastObj) this._transition(x, this._lastObj, null, S, desired);
      else this._lead(desired);
      this._lastStep = undefined; this._lastObj = null; this._seen = true;
      if (finished) big = `${head}<div class="msg">${esc(x.r.done_message || tr(h, 'done'))}<small>${esc(tr(h, 'doneSub'))}</small></div>${this._stars(S, x.here)}`;
      else {
        big = `${head}<div class="msg">${esc(tr(h, 'sleep'))}<small>${esc(tr(h, 'sleepSub', { what: st[0].short || st[0].name, t: hhmm(start) }))}</small></div>`;
        if (c.show_controls !== false) big += `<div class="ctl"><button data-ctl="skip" title="${esc(tr(h, 'startNow'))}"><ha-icon icon="mdi:play"></ha-icon></button></div>`;
      }
    }
    const rows = [...st.map((s, i) => ({ s, i })), ...side.map((s) => ({ s, i: -1 }))].sort((a, b) => a.s.a - b.s.a || (a.i < 0) - (b.i < 0));
    const list = rows.map(({ s, i }) => {
      const cls = i < 0 ? (nm >= s.a && nm < s.b ? 'cur' : nm >= s.b ? 'past' : '') : i === ci ? 'cur' : (ci >= 0 && i < ci) || (ci < 0 && finished) ? 'past' : '';
      const kids = s.checkable ? `<div class="kids">${x.forStep(s).map((p) => this._btn(p, s, t)).join('')}</div>` : '';
      return `<div class="st ${cls}" style="--c:${esc(s.color)}"><div class="ic"><ha-icon icon="${esc(s.icon)}"></ha-icon></div><div class="tx"><div class="nm">${esc(s.name)}</div><div class="tm">${hhmm(s.a)} – ${hhmm(s.b)}</div></div>${kids}</div>`;
    }).join('');
    const span = Math.max(1, end - start);
    const segs = st.map((s) => `<div class="sg" style="left:${((s.a - start) / span) * 100}%;width:${((s.b - s.a) / span) * 100}%;background:${esc(s.color)}"><ha-icon icon="${esc(s.icon)}"></ha-icon></div>`).join('');
    const pos = Math.max(0, Math.min(100, ((nm - start) / span) * 100));
    const tl = `<div class="tl">${segs}<div class="done" style="width:${pos}%"></div>${nm >= start && nm <= end ? `<div class="mk" style="left:${pos}%"></div>` : ''}</div>`;
    let kl = '';
    if (c.weather_entity && nm < end && this._fc && this._fc.length) {
      const lv = new Date(real); lv.setHours(Math.floor(end / 60), end % 60, 0, 0);
      const f = this._fc.reduce((b, y) => (!b || Math.abs(new Date(y.datetime) - lv) < Math.abs(new Date(b.datetime) - lv) ? y : b), null);
      if (f && Math.abs(new Date(f.datetime) - lv) < 5400000) { const a = clothing(h, f); kl = `<div class="kl"><b>${a.t}° · ${esc(a.wt)}</b>${a.k.map(([ic, n]) => `<span><ha-icon icon="${ic}"></ha-icon>${esc(n)}</span>`).join('')}</div>`; }
    }
    const sa = side.find((y) => nm >= y.a && nm < y.b);
    if (sa) { const m = Math.ceil(sa.b - nm); big += `<div class="side" style="--c:${esc(sa.color)}"><ha-icon icon="${esc(sa.icon)}"></ha-icon>${esc(tr(h, 'sideLeft', { what: sa.short || sa.name, n: m, u: unit(m) }))}</div>`; }
    big += kl;
    /* reward overlay when someone has just finished everything */
    const g = S.g.split(',').filter(Boolean);
    if (this._gSeen === undefined || this._gDay !== `${S.d}-${S.r}`) { this._gSeen = g; this._gDay = `${S.d}-${S.r}`; }
    const fresh = g.filter((id) => !this._gSeen.includes(id));
    if (fresh.length) {
      this._gSeen = g; this._rwUntil = Date.now() + 7000;
      this._rwPeople = x.here.filter((p) => fresh.includes(p.id));
      this._rwConf = Array.from({ length: 40 }, (_, i) => `<i class="cf" style="left:${Math.random() * 100}%;background:${COLORS[i % COLORS.length]};animation-duration:${2.5 + Math.random() * 3}s;animation-delay:${Math.random() * 1.5}s"></i>`).join('');
      if (this._may()) tone('fanfare', c.volume);
    }
    let rw = '';
    if (this._rwUntil && Date.now() < this._rwUntil) {
      rw = `<div class="rw">${this._rwConf}<div class="t">${esc(tr(h, 'reward', { names: and(h, this._rwPeople.map((p) => p.name)) }))}</div><div class="s">${esc(tr(h, 'rewardSub'))}</div>${this._stars(S, this._rwPeople)}</div>`;
    }
    out(`<div class="big">${big}</div><div class="list">${list}</div>${tl}${bigT}${rw}`);
  }
}

/* ================================================================ editor */
const ED_TXT = {
  en: {
    general: 'General', people: 'People', routines: 'Routines', steps: 'Steps', add_person: 'Add person', add_routine: 'Add routine', add_step: 'Add step',
    remove: 'Remove', up: 'Move up', down: 'Move down', copy: 'Duplicate',
    title: 'Title (optional)', store_entity: 'Shared storage for check-offs and stars (input_text, max length 255)',
    state_entity: 'Status helper for automations (input_text, optional)', notify_service: 'Notify service for reminders (e.g. notify.mobile_app_phone)',
    weather_entity: 'Weather for clothing advice (optional)', tts_engine: 'Voice: text-to-speech engine (optional, else the browser voice)',
    sound: 'Sounds', sound_cast: 'Only on cast displays', sound_always: 'On every screen', sound_off: 'Off', warn_minutes: 'Warning beep … minutes before a step ends (0 = off)',
    volume: 'Volume (%)', full_height: 'Fill the whole screen (panel view)', show_controls: 'Show pause and next-step buttons', rewards: 'Rewards and stars',
    skip_calendar: 'Skip routines when this calendar has something today (holidays)', skip_keywords: 'Only for events containing (comma separated, empty = all-day events)',
    name: 'Name', icon: 'Picture (icon)', picture: 'Photo instead of icon: URL or person entity (optional)', color: 'Colour',
    alternate_weeks: 'Present every other week', week_start: 'A date in a week this person IS present',
    days: 'Days', end_time: 'End time (leave)', end_label: 'What happens at the end (e.g. school)', done_message: 'Message after the end (optional)',
    arrive_by: 'Arrive by (optional: end time follows the traffic)', travel_time_entity: 'Travel time sensor in minutes (e.g. Waze)', travel_margin: 'Extra margin (minutes)',
    skip_on_calendar: 'Skip on calendar days', short: 'Short text ("… left: brush teeth")', start: 'Start time', checkable: 'Can be checked off',
    big_timer: 'Big countdown for the last … minutes (0 = off)', step_people: 'Only for (empty = everyone)', step_days: 'Only on (empty = every routine day)',
    duration: 'Runs alongside for … minutes (0 = normal step)', sound_start: 'Sound at start', sound_end: 'Sound at the end',
    say_start: 'Text to say at start', say_end: 'Text to say at the end', step_volume: 'Volume for this step (%, empty = general)',
    script_start: 'Run at start (script or scene)', script_end: 'Run at the end (script or scene)', notify_unchecked: 'Notify my phone if not checked off at the end',
    test_start: 'Test start', test_end: 'Test end', say_hint: 'Use {name} or {short} for the step name.',
    s_none: 'None', s_chime: 'Chime', s_bell: 'Bell', s_beep: 'Beep', s_double: 'Double beep', s_triple: 'Countdown beeps', s_fanfare: 'Fanfare', s_gong: 'Gong', s_voice: 'Voice (say a text)',
    hint: 'A step lasts until the next step starts; the last step lasts until the end time. Extra icons: rtc:comb, rtc:hairbrush, rtc:lion. The status helper shows routine:step (with :ready when everyone is done), routine:done or idle.',
    every_other: 'every other week', steps_n: '{n} steps',
  },
  nl: {
    general: 'Algemeen', people: 'Personen', routines: 'Routines', steps: 'Stappen', add_person: 'Persoon toevoegen', add_routine: 'Routine toevoegen', add_step: 'Stap toevoegen',
    remove: 'Verwijderen', up: 'Omhoog', down: 'Omlaag', copy: 'Dupliceren',
    title: 'Titel (optioneel)', store_entity: 'Gedeelde opslag voor afvinken en sterren (input_text, max lengte 255)',
    state_entity: 'Status-helper voor automatiseringen (input_text, optioneel)', notify_service: 'Meldingsdienst voor herinneringen (bijv. notify.mobile_app_telefoon)',
    weather_entity: 'Weer voor kledingadvies (optioneel)', tts_engine: 'Stem: spraakdienst (optioneel, anders de stem van de browser)',
    sound: 'Geluid', sound_cast: 'Alleen op cast-schermen', sound_always: 'Op elk scherm', sound_off: 'Uit', warn_minutes: 'Waarschuwingspiep … minuten voor het einde van een stap (0 = uit)',
    volume: 'Volume (%)', full_height: 'Hele scherm vullen (paneelweergave)', show_controls: 'Pauze- en volgende-stap-knop tonen', rewards: 'Beloning en sterren',
    skip_calendar: 'Routines overslaan als deze agenda vandaag iets heeft (vakanties)', skip_keywords: 'Alleen bij afspraken met (komma-gescheiden, leeg = hele-dag-afspraken)',
    name: 'Naam', icon: 'Plaatje (icoon)', picture: 'Foto i.p.v. icoon: URL of persoon-entiteit (optioneel)', color: 'Kleur',
    alternate_weeks: 'Om de week aanwezig', week_start: 'Een datum in een week dat deze persoon er WEL is',
    days: 'Dagen', end_time: 'Eindtijd (vertrek)', end_label: 'Wat er aan het eind gebeurt (bijv. naar school)', done_message: 'Bericht na de eindtijd (optioneel)',
    arrive_by: 'Aankomen om (optioneel: eindtijd volgt het verkeer)', travel_time_entity: 'Reistijd-sensor in minuten (bijv. Waze)', travel_margin: 'Extra marge (minuten)',
    skip_on_calendar: 'Overslaan op agenda-dagen', short: 'Korte tekst ("nog 5 minuten tanden poetsen")', start: 'Begintijd', checkable: 'Kan afgevinkt worden',
    big_timer: 'Grote aftelklok de laatste … minuten (0 = uit)', step_people: 'Alleen voor (leeg = iedereen)', step_days: 'Alleen op (leeg = alle dagen van de routine)',
    duration: 'Loopt … minuten naast de rest (0 = gewone stap)', sound_start: 'Geluid bij start', sound_end: 'Geluid aan het eind',
    say_start: 'Tekst bij start', say_end: 'Tekst aan het eind', step_volume: 'Volume voor deze stap (%, leeg = algemeen)',
    script_start: 'Uitvoeren bij start (script of scène)', script_end: 'Uitvoeren aan het eind (script of scène)', notify_unchecked: 'Melding op mijn telefoon als dit aan het eind niet is afgevinkt',
    test_start: 'Test start', test_end: 'Test eind', say_hint: 'Gebruik {name} of {short} voor de naam van de stap.',
    s_none: 'Geen', s_chime: 'Belletje', s_bell: 'Bel', s_beep: 'Piep', s_double: 'Dubbele piep', s_triple: 'Aftelpiepjes', s_fanfare: 'Fanfare', s_gong: 'Gong', s_voice: 'Stem (zegt een tekst)',
    hint: 'Een stap duurt tot de volgende begint; de laatste stap tot de eindtijd. Extra iconen: rtc:comb, rtc:hairbrush, rtc:lion. De status-helper toont routine:stap (met :ready als iedereen klaar is), routine:done of idle.',
    every_other: 'om de week', steps_n: '{n} stappen',
  },
};
const et = (h, k, v) => String((ED_TXT[lang(h)] || ED_TXT.en)[k] || ED_TXT.en[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ''));
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], nl: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'] };
const tm = (v) => { const m = String(v || '').match(/^(\d{1,2}):(\d{2})/); return m ? `${pad(m[1])}:${m[2]}` : v; };

class RoutineTimerCardEditor extends HTMLElement {
  setConfig(c) {
    const next = JSON.parse(JSON.stringify(c || {}));
    next.people = next.people || [];
    if (!Array.isArray(next.routines) || !next.routines.length) {
      /* older format: top-level steps → one routine */
      next.routines = [{ id: 'main', name: '', days: next.days || ['mon', 'tue', 'wed', 'thu', 'fri'], end_time: next.end_time || '08:00', end_label: next.end_label, done_message: next.done_message, steps: next.steps || [] }];
      ['days', 'end_time', 'end_label', 'done_message', 'steps'].forEach((k) => delete next[k]);
    }
    next.routines.forEach((r) => { r.steps = r.steps || []; if (!r.id) r.id = uid(); });
    this._open = this._open || {};
    if (this._cfg && JSON.stringify(next) === JSON.stringify(this._clean())) return;
    this._cfg = next;
    this._draw();
  }
  set hass(h) {
    this._h = h;
    this.shadowRoot && this.shadowRoot.querySelectorAll('ha-form').forEach((f) => { f.hass = h; });
    if (!this._loaded) { this._loaded = true; this._ensure().then(() => this._draw()); }
  }
  async _ensure() {
    if (customElements.get('ha-form') && customElements.get('ha-entity-picker')) return;
    try {
      const helpers = await window.loadCardHelpers();
      const el = await helpers.createCardElement({ type: 'entities', entities: [] });
      if (el && el.constructor.getConfigElement) await el.constructor.getConfigElement();
    } catch (e) { /* ignore */ }
  }
  _emit() { this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._clean() }, bubbles: true, composed: true })); }
  _clean() {
    const c = JSON.parse(JSON.stringify(this._cfg));
    const drop = (o, keys) => keys.forEach((k) => { if (o[k] === '' || o[k] == null || (Array.isArray(o[k]) && !o[k].length)) delete o[k]; });
    drop(c, ['title', 'store_entity', 'state_entity', 'notify_service', 'weather_entity', 'tts_engine', 'skip_calendar', 'skip_keywords']);
    c.people.forEach((p) => { if (!p.alternate_weeks) { delete p.alternate_weeks; delete p.week_start; } drop(p, ['picture']); });
    c.routines.forEach((r) => {
      if (r.end_time) r.end_time = tm(r.end_time);
      if (r.arrive_by) r.arrive_by = tm(r.arrive_by);
      drop(r, ['name', 'end_label', 'done_message', 'arrive_by', 'travel_time_entity', 'travel_margin']);
      r.steps.forEach((s) => {
        if (s.start) s.start = tm(s.start);
        if (!Number(s.big_timer)) delete s.big_timer;
        if (!Number(s.duration)) delete s.duration;
        if (s.sound_start !== 'voice') delete s.say_start;
        if (s.sound_end !== 'voice') delete s.say_end;
        if (!s.notify_unchecked) delete s.notify_unchecked;
        drop(s, ['people', 'days', 'short', 'sound_start', 'sound_end', 'say_start', 'say_end', 'volume', 'script_start', 'script_end']);
      });
    });
    return c;
  }
  _form(data, schema, onChange) {
    const f = document.createElement('ha-form');
    f.hass = this._h; f.data = data; f.schema = schema;
    f.computeLabel = (s) => et(this._h, s.name);
    f.addEventListener('value-changed', (e) => { e.stopPropagation(); onChange(e.detail.value); this._emit(); });
    return f;
  }
  /* collapsible list with add / move / duplicate / remove */
  _list(root, arr, o) {
    const h = this._h;
    arr.forEach((it, i) => {
      const box = document.createElement('div'); box.className = `item ${o.cls || ''}`;
      const okey = `${o.key}-${it.id || i}`;
      box.innerHTML = `<div class="hd"><div class="sw" style="background:${esc(it.color || '#607d8b')}"><ha-icon icon="${esc(it.icon || o.icon || 'mdi:help')}"></ha-icon></div><div class="t"><span>${esc(it.name || o.untitled || '')}</span><small>${esc(o.sub(it))}</small></div>
${o.color ? `<input type="color" value="${esc(/^#[0-9a-f]{6}$/i.test(it.color || '') ? it.color : '#888888')}" title="${esc(et(h, 'color'))}">` : ''}
<button data-a="up" title="${esc(et(h, 'up'))}"><ha-icon icon="mdi:arrow-up"></ha-icon></button><button data-a="down" title="${esc(et(h, 'down'))}"><ha-icon icon="mdi:arrow-down"></ha-icon></button>${o.copy ? `<button data-a="copy" title="${esc(et(h, 'copy'))}"><ha-icon icon="mdi:content-copy"></ha-icon></button>` : ''}<button data-a="del" title="${esc(et(h, 'remove'))}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>
<ha-icon icon="${this._open[okey] ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon></div>`;
      const hd = box.querySelector('.hd'), inp = hd.querySelector('input');
      if (inp) {
        inp.addEventListener('click', (e) => e.stopPropagation());
        inp.addEventListener('input', (e) => { it.color = e.target.value; hd.querySelector('.sw').style.background = it.color; });
        inp.addEventListener('change', () => this._emit());
      }
      hd.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (b) {
          e.stopPropagation(); const a = b.dataset.a;
          if (a === 'del') { arr.splice(i, 1); if (o.onRemove) o.onRemove(it); }
          if (a === 'up' && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          if (a === 'down' && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
          if (a === 'copy') { const cp = JSON.parse(JSON.stringify(it)); cp.id = uid(); cp.name = `${cp.name || ''} (2)`; (cp.steps || []).forEach((s) => { s.id = uid(); }); arr.splice(i + 1, 0, cp); }
          this._emit(); this._draw(); return;
        }
        this._open[okey] = !this._open[okey]; this._draw();
      });
      if (this._open[okey]) {
        const bd = document.createElement('div'); bd.className = 'bd';
        const data = (o.toData || ((d) => d))(Object.assign({}, it));
        ['start', 'end_time', 'arrive_by'].forEach((k) => { if (data[k]) data[k] = tm(data[k]); });
        bd.appendChild(this._form(data, o.schema(it), (v) => {
          const sig = (y) => `${!!y.alternate_weeks}|${y.sound_start === 'voice'}|${y.sound_end === 'voice'}|${!!y.arrive_by}`, before = sig(it);
          const nv = (o.fromData || ((d) => d))(Object.assign({}, v));
          Object.keys(nv).forEach((k) => { if (k !== 'steps') it[k] = nv[k]; });
          hd.querySelector('.t span').textContent = it.name || o.untitled || '';
          hd.querySelector('.sw ha-icon').setAttribute('icon', it.icon || o.icon || 'mdi:help');
          hd.querySelector('small').textContent = o.sub(it);
          if (before !== sig(it)) setTimeout(() => this._draw(), 0);
        }));
        if (o.extra) o.extra(it, bd);
        box.appendChild(bd);
      }
      root.appendChild(box);
    });
    const add = document.createElement('button'); add.className = 'add';
    add.innerHTML = `<ha-icon icon="mdi:plus-circle-outline"></ha-icon>${esc(o.addLabel)}`;
    add.addEventListener('click', () => { const n = o.make(); arr.push(n); this._open[`${o.key}-${n.id}`] = true; this._emit(); this._draw(); });
    root.appendChild(add);
  }
  _draw() {
    if (!this._h || !this._cfg) return;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const h = this._h, c = this._cfg, L = lang(h), r = this.shadowRoot;
    r.innerHTML = `<style>
.sec{margin:18px 0 8px;font-weight:600;font-size:16px;display:flex;align-items:center;gap:8px}
.hint{font-size:12px;color:var(--secondary-text-color);margin:12px 0 4px}
.item{border:1px solid var(--divider-color);border-radius:10px;margin:8px 0;overflow:hidden}
.item.routine{border-width:2px}
.hd{display:flex;align-items:center;gap:6px;padding:6px 8px;cursor:pointer;background:var(--secondary-background-color)}
.hd .sw{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hd .sw ha-icon{color:#fff;--mdc-icon-size:22px}
.hd .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd .t small{display:block;color:var(--secondary-text-color)}
.hd input[type=color]{width:30px;height:28px;border:0;padding:0;background:none;cursor:pointer}
.hd button,.add{background:none;border:0;color:var(--primary-text-color);cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center}
.hd button:hover,.add:hover{background:var(--divider-color)}
.bd{padding:8px 12px 12px}
.add{gap:6px;color:var(--primary-color);font-weight:500;margin:4px 0 8px}
.sub{font-weight:600;margin:14px 0 4px;display:flex;align-items:center;gap:6px}
.tb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
.tb button{display:flex;align-items:center;gap:4px;border:1px solid var(--divider-color);background:none;color:var(--primary-text-color);border-radius:16px;padding:4px 12px 4px 6px;cursor:pointer}
.tb span{font-size:12px;color:var(--secondary-text-color)}
</style><div id="root"></div>`;
    const root = r.getElementById('root');
    const sec = (t, icon, into = root) => { const d = document.createElement('div'); d.className = 'sec'; d.innerHTML = `<ha-icon icon="${icon}"></ha-icon>${esc(t)}`; into.appendChild(d); };
    const dayOpts = DAY_ORDER.map((d, i) => ({ value: d, label: DAY_LABELS[L][i] }));
    const sOpts = SOUND_NAMES.map((n) => ({ value: n, label: et(h, `s_${n}`) }));
    const pOpts = c.people.map((p) => ({ value: p.id, label: p.name || p.id }));

    /* ---- general */
    sec(et(h, 'general'), 'mdi:cog');
    const gen = {
      title: c.title || '', store_entity: c.store_entity || '', state_entity: c.state_entity || '', notify_service: c.notify_service || '',
      weather_entity: c.weather_entity || '', tts_engine: c.tts_engine || '', sound: c.sound || 'cast', warn_minutes: c.warn_minutes != null ? c.warn_minutes : 5,
      volume: c.volume != null ? c.volume : 70, full_height: c.full_height !== false, show_controls: c.show_controls !== false, rewards: c.rewards !== false,
      skip_calendar: c.skip_calendar || '', skip_keywords: c.skip_keywords || '',
    };
    root.appendChild(this._form(gen, [
      { name: 'title', selector: { text: {} } },
      { name: 'store_entity', selector: { entity: { domain: 'input_text' } } },
      { name: 'state_entity', selector: { entity: { domain: 'input_text' } } },
      { name: 'notify_service', selector: { text: {} } },
      { name: 'weather_entity', selector: { entity: { domain: 'weather' } } },
      { name: 'tts_engine', selector: { entity: { domain: 'tts' } } },
      { type: 'grid', name: '', schema: [
        { name: 'sound', selector: { select: { mode: 'dropdown', options: [{ value: 'cast', label: et(h, 'sound_cast') }, { value: 'always', label: et(h, 'sound_always') }, { value: 'off', label: et(h, 'sound_off') }] } } },
        { name: 'warn_minutes', selector: { number: { min: 0, max: 30, mode: 'box' } } },
      ] },
      { name: 'volume', selector: { number: { min: 0, max: 100, step: 5, mode: 'slider', unit_of_measurement: '%' } } },
      { name: 'skip_calendar', selector: { entity: { domain: 'calendar' } } },
      { name: 'skip_keywords', selector: { text: {} } },
      { type: 'grid', name: '', schema: [{ name: 'full_height', selector: { boolean: {} } }, { name: 'show_controls', selector: { boolean: {} } }, { name: 'rewards', selector: { boolean: {} } }] },
    ], (v) => { Object.assign(this._cfg, v); }));

    /* ---- people */
    sec(et(h, 'people'), 'mdi:account-group');
    this._list(root, c.people, {
      key: 'p', color: true, icon: 'mdi:account', addLabel: et(h, 'add_person'),
      sub: (it) => (it.alternate_weeks ? et(h, 'every_other') : ''),
      schema: (it) => [
        { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'icon', selector: { icon: {} } }] },
        { name: 'picture', selector: { text: {} } },
        { name: 'alternate_weeks', selector: { boolean: {} } },
        ...(it.alternate_weeks ? [{ name: 'week_start', selector: { date: {} } }] : []),
      ],
      make: () => ({ id: uid(), name: L === 'nl' ? 'Nieuw' : 'New', icon: 'mdi:account', color: COLORS[(c.people.length + 7) % COLORS.length] }),
      onRemove: (p) => c.routines.forEach((ro) => ro.steps.forEach((s) => { if (s.people) s.people = s.people.filter((x) => x !== p.id); })),
    });

    /* ---- routines, each with its own steps */
    sec(et(h, 'routines'), 'mdi:calendar-clock');
    this._list(root, c.routines, {
      key: 'r', cls: 'routine', icon: 'mdi:calendar-clock', copy: true, untitled: L === 'nl' ? 'Routine' : 'Routine', addLabel: et(h, 'add_routine'),
      sub: (it) => `${(it.days || []).map((d) => DAY_LABELS[L][DAY_ORDER.indexOf(d)]).join(' ')} · ${et(h, 'steps_n', { n: (it.steps || []).length })}${it.end_time || it.arrive_by ? ` · ${tm(it.arrive_by ? it.arrive_by : it.end_time)}` : ''}`,
      schema: (it) => [
        { name: 'name', selector: { text: {} } },
        { name: 'days', selector: { select: { multiple: true, mode: 'list', options: dayOpts } } },
        { type: 'grid', name: '', schema: [{ name: 'end_time', selector: { time: {} } }, { name: 'end_label', selector: { text: {} } }] },
        { name: 'done_message', selector: { text: {} } },
        { name: 'arrive_by', selector: { time: {} } },
        ...(it.arrive_by ? [{ type: 'grid', name: '', schema: [{ name: 'travel_time_entity', selector: { entity: { domain: 'sensor' } } }, { name: 'travel_margin', selector: { number: { min: 0, max: 60, mode: 'box' } } }] }] : []),
        ...(c.skip_calendar ? [{ name: 'skip_on_calendar', selector: { boolean: {} } }] : []),
      ],
      toData: (d) => { delete d.steps; if (d.skip_on_calendar == null) d.skip_on_calendar = true; return d; },
      make: () => ({ id: uid(), name: L === 'nl' ? 'Nieuwe routine' : 'New routine', days: ['mon', 'tue', 'wed', 'thu', 'fri'], end_time: '08:00', steps: [] }),
      extra: (ro, bd) => {
        const t = document.createElement('div'); t.className = 'sub'; t.innerHTML = `<ha-icon icon="mdi:format-list-checks"></ha-icon>${esc(et(h, 'steps'))}`; bd.appendChild(t);
        this._list(bd, ro.steps, {
          key: `s-${ro.id}`, color: true, icon: 'mdi:timer-outline', addLabel: et(h, 'add_step'),
          sub: (it) => `${tm(it.start) || ''}${it.duration ? ` · +${it.duration} min` : ''}${it.people && it.people.length ? ` · ${it.people.map((id) => (c.people.find((p) => p.id === id) || {}).name || id).join(', ')}` : ''}${it.days && it.days.length ? ` · ${it.days.map((d) => DAY_LABELS[L][DAY_ORDER.indexOf(d)]).join(' ')}` : ''}`,
          schema: (it) => [
            { type: 'grid', name: '', schema: [{ name: 'name', selector: { text: {} } }, { name: 'icon', selector: { icon: {} } }] },
            { type: 'grid', name: '', schema: [{ name: 'start', selector: { time: {} } }, { name: 'short', selector: { text: {} } }] },
            { name: 'checkable', selector: { boolean: {} } },
            { type: 'grid', name: '', schema: [{ name: 'big_timer', selector: { number: { min: 0, max: 30, mode: 'box' } } }, { name: 'duration', selector: { number: { min: 0, max: 120, mode: 'box' } } }] },
            ...(pOpts.length ? [{ name: 'step_people', selector: { select: { multiple: true, mode: 'list', options: pOpts } } }] : []),
            { name: 'step_days', selector: { select: { multiple: true, mode: 'list', options: dayOpts } } },
            { type: 'grid', name: '', schema: [{ name: 'sound_start', selector: { select: { mode: 'dropdown', options: sOpts } } }, { name: 'sound_end', selector: { select: { mode: 'dropdown', options: sOpts } } }] },
            ...(it.sound_start === 'voice' ? [{ name: 'say_start', selector: { text: {} } }] : []),
            ...(it.sound_end === 'voice' ? [{ name: 'say_end', selector: { text: {} } }] : []),
            { name: 'step_volume', selector: { number: { min: 0, max: 100, step: 5, mode: 'slider', unit_of_measurement: '%' } } },
            { type: 'grid', name: '', schema: [{ name: 'script_start', selector: { entity: { domain: ['script', 'scene'] } } }, { name: 'script_end', selector: { entity: { domain: ['script', 'scene'] } } }] },
            ...(c.notify_service ? [{ name: 'notify_unchecked', selector: { boolean: {} } }] : []),
          ],
          toData: (d) => Object.assign(d, { step_people: d.people || [], step_days: d.days || [], step_volume: d.volume, sound_start: d.sound_start || 'chime', sound_end: d.sound_end || (Number(d.big_timer) ? 'triple' : 'none') }),
          fromData: (v) => { v.people = v.step_people || []; v.days = v.step_days || []; v.volume = v.step_volume; delete v.step_people; delete v.step_days; delete v.step_volume; return v; },
          make: () => {
            const last = ro.steps[ro.steps.length - 1], m = last ? (toMin(last.start) || 420) + 5 : (toMin(ro.end_time) || 480) - 30;
            return { id: uid(), name: L === 'nl' ? 'Nieuwe stap' : 'New step', start: hhmm(m), icon: 'mdi:timer-outline', color: COLORS[ro.steps.length % COLORS.length], checkable: true };
          },
          extra: (it, sbd) => {
            const tb = document.createElement('div'); tb.className = 'tb';
            tb.innerHTML = `<button data-t="start"><ha-icon icon="mdi:play-circle-outline"></ha-icon>${esc(et(h, 'test_start'))}</button><button data-t="end"><ha-icon icon="mdi:play-circle-outline"></ha-icon>${esc(et(h, 'test_end'))}</button><span>${esc(et(h, 'say_hint'))}</span>`;
            tb.addEventListener('click', (e) => {
              const b = e.target.closest('button'); if (!b) return;
              const st = b.dataset.t === 'start';
              play(this._h, this._cfg, st ? (it.sound_start || 'chime') : (it.sound_end || (Number(it.big_timer) ? 'triple' : 'none')), fill(st ? it.say_start : it.say_end, it), it.volume);
            });
            sbd.appendChild(tb);
          },
        });
      },
    });
    const hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = et(h, 'hint'); root.appendChild(hint);
  }
}

if (!customElements.get('routine-timer-card')) customElements.define('routine-timer-card', RoutineTimerCard);
if (!customElements.get('routine-timer-card-editor')) customElements.define('routine-timer-card-editor', RoutineTimerCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === 'routine-timer-card')) {
  window.customCards.push({ type: 'routine-timer-card', name: 'Routine Timer Card', description: 'Visual countdown for daily routines with check-off per person', preview: true, documentationURL: 'https://github.com/OWNER/routine-timer-card' });
}
console.info(`%c ROUTINE-TIMER-CARD %c ${VERSION} `, 'color:#fff;background:#3d8fe0;font-weight:700', 'color:#3d8fe0;background:#fff');
})();