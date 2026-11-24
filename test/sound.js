const log=[]; 
class Ctx{ constructor(){this.currentTime=0;this.destination={};} resume(){} createOscillator(){return {type:'',frequency:{},connect(){},start(){},stop(){}, set _t(v){}}} createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}} }
let n=0; const origOsc=Ctx.prototype.createOscillator; Ctx.prototype.createOscillator=function(){ n++; const o=origOsc.call(this); Object.defineProperty(o,'type',{set(v){log.push(v)}}); return o; };
require('./smoke-env.js');
global.window.AudioContext = Ctx; global.setTimeout = (f)=>f();
global.SpeechSynthesisUtterance = function(t){ this.t=t; }; global.window.speechSynthesis={speak(u){log.push('SAY:'+u.t)}};
require('../src/routine-timer-card.js');
const Card = global.__defs['routine-timer-card'];
const c = new Card(); const cfg = Card.getStubConfig(); cfg.routines[0].days=['mon','tue','wed','thu','fri','sat','sun']; cfg.sound='always';
cfg.routines[0].steps[1].sound_start='voice'; cfg.routines[0].steps[1].say_start='Tijd voor {short}!';
c.setConfig(cfg); const hass={language:'nl',states:{},callService(){},callApi(){return Promise.reject()}};
const RealDate=Date;
for (const t of ['06:44:59','06:45:00','07:09:59','07:10:00','08:04:59','08:05:00']) {
  const [H,M,S]=t.split(':').map(Number);
  global.Date = class extends RealDate { constructor(...a){ if(a.length) super(...a); else super(2026,10,24,H,M,S||0); } static now(){ return new RealDate(2026,10,24,H,M,S||0).getTime(); } };
  log.length=0; c.hass=hass; c._render(); console.log(t, log.join(' '));
}
