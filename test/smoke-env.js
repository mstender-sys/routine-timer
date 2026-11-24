// minimal DOM stubs to run the card's render logic in node
const els = {};
class El { constructor(){ this.style={setProperty(){}}; this._l={}; this.innerHTML=''; this.className=''; }
  addEventListener(t,f){ this._l[t]=f; } getBoundingClientRect(){ return {width:1280,height:800}; }
  getElementById(id){ return els[id] || (els[id]=new El()); } querySelector(){ return null; } querySelectorAll(){ return []; } appendChild(){} }
global.HTMLElement = class extends El { attachShadow(){ this.shadowRoot = new El(); return this.shadowRoot; } dispatchEvent(){} };
global.window = { innerHeight: 800 }; global.navigator = { userAgent: 'node' }; global.document = { createElement: () => new El() };
global.ResizeObserver = class { observe(){} disconnect(){} };
global.localStorage = { _s:{}, getItem(k){return this._s[k]||null}, setItem(k,v){this._s[k]=v} };
const defs = global.__defs = {}; global.customElements = { get: (n) => defs[n], define: (n, c) => { defs[n] = c; } };
global.console.info = () => {};
