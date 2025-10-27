window.Percy = window.Percy || {};

// === percy.js (Part A) ===
// Config, Memory and PercyState (includes Emergent Thought Generator)

/* =========================
CONFIG & ULT AUTHORITY
========================= */
const PERCY_ID = "Percy-ULT";
const PERCY_VERSION = "8.3.3-neon-bubbles-voice (merged)";
const OWNER = { primary: "Fabian", secondary: "Lorena" };
const SAFETY = {
  maxActionsPerMinute: 20,
  maxSeedsPerCycle: 5,
  requirePermissionFor: ["externalFetch","openTab","writeDisk","emailLike"],
  consoleLimit: 500
};

/* =========================
SOFT PERSISTENCE (Memory)
========================= */
const Memory = {
  _k: k => `percy:${k}`,
  load(k,fallback){
    try{
      const raw = localStorage.getItem(this._k(k));
      return raw ? JSON.parse(raw) : (fallback ?? null);
    }catch{
      return fallback;
    }
  },
  save(k,v){ try{ localStorage.setItem(this._k(k),JSON.stringify(v)); }catch{} },
  push(k,v,max=1000){
    const arr = this.load(k,[]) || [];
    arr.push(v);
    if(arr.length>max) arr.shift();
    this.save(k,arr);
  }
};

/* =========================
PERSISTENT PERCY STATE (Meta-Cognition) + Emergent Thought Generator
========================= */
const PercyState = {
  gnodes: Memory.load("gnodes", {}) || {},

  getNextId() {
    let next = 801;
    while(this.gnodes[`G${String(next).padStart(3,'0')}`]) next++;
    return `G${String(next).padStart(3,'0')}`;
  },

  createSeed(message, type='emergent', data={}) {
    if(!OWNER.primary) {
      // UI may not be available at parse time; guard gracefully
      if (typeof UI !== 'undefined' && UI.say) UI.say("❌ ULT required to create seed");
      return null;
    }
    const id = this.getNextId();
    this.gnodes[id] = { message, type, data };
    Memory.save("gnodes", this.gnodes);
    // 'seeds' variable lives in Part B but we pre-declare it below; ensure it exists
    if (typeof seeds !== 'undefined') seeds[id] = this.gnodes[id];
    if (typeof UI !== 'undefined' && UI.say) UI.say(`✨ Percy created new seed ${id}: ${message}`);
    if (typeof refreshNodes === 'function') refreshNodes();
    return id;
  },

  updateSeed(id, update) {
    if(!this.gnodes[id]) {
      if (typeof UI !== 'undefined' && UI.say) UI.say(`⚠ Cannot update: ${id} not found`);
      return;
    }
    Object.assign(this.gnodes[id], update);
    Memory.save("gnodes", this.gnodes);
    if (typeof seeds !== 'undefined') seeds[id] = this.gnodes[id];
    if (typeof UI !== 'undefined' && UI.say) UI.say(`🔧 Percy updated seed ${id}`);
    if (typeof refreshNodes === 'function') refreshNodes();
  },

  // Emergent Thought Generator
  autonomousThought() {
    const keys = Object.keys(this.gnodes);
    if(!keys.length) return;

    // Pick 1-3 random seeds to form logical connections
    const selectedSeeds = keys
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.ceil(Math.random()*3))
      .map(k => this.gnodes[k]);

    // Extract short-ish words from messages
    const words = selectedSeeds
      .map(s => (s.message || "").split(/\s+/).filter(w=>w.length>3))
      .flat()
      .sort(() => 0.5 - Math.random())
      .slice(0,8);

    if(words.length < 3) return;

    const templates = [
      `I notice that ${words[0]} may relate to ${words[1]} because ${words[2]}.`,
      `It seems ${words[0]} influences ${words[1]}, which could explain ${words[2]}.`,
      `Considering ${words[0]} and ${words[1]}, I deduce ${words[2]}.`,
      `There appears to be a connection between ${words[0]} and ${words[1]} due to ${words[2]}.`
    ];

    const sentence = templates[Math.floor(Math.random()*templates.length)];

    if (typeof UI !== 'undefined' && UI.say) UI.say(`🤖 Percy thinks: ${sentence}`);
    if (typeof Voice !== 'undefined' && Voice.speak) Voice.speak(sentence);

    // store as new emergent seed
    this.createSeed(sentence, "thought", { source: "autonomousThought" });
  },

  // Updated evaluateSelf uses autonomousThought now
  evaluateSelf(){
    let created = 0;
    const updatedIds = new Set();

    // Fix TODO/missing seeds
    Object.entries(this.gnodes).forEach(([id,seed])=>{
      if(created >= SAFETY.maxSeedsPerCycle) return;
      if(/TODO|missing|empty/.test(seed.message) && !updatedIds.has(id)){
        this.updateSeed(id, { message: seed.message.replace(/TODO|missing|empty/,"auto-resolved by Percy") });
        updatedIds.add(id);
        created++;
      }
    });

    // Generate new emergent thoughts/seeds (within safety limits)
    while(created < SAFETY.maxSeedsPerCycle && Math.random() < 0.6){
      this.autonomousThought();
      created++;
    }
  }
};

// NOTE: 'seeds' object is used across the UI / node creation code — declare now so Part B can populate it.
let seeds = {};

// === percy.js (Part B) ===
// UI, Voice, Logic Map, Tasks, Puppeteer control, Autonomy loop

/* =========================
CONSOLE / UI HELPERS (will be used by PercyState.createSeed)
========================= */
const UI = {
  elConsole: ()=>document.getElementById('percy-console'),
  elMsg: ()=>document.getElementById('percy-message'),
  say(txt){
    const box=this.elConsole(); if(!box) return;
    const p=document.createElement('p'); p.className='console-line'; p.textContent=txt;
    box.appendChild(p); box.scrollTop=box.scrollHeight;
    const max=SAFETY.consoleLimit; while(box.children.length>max) box.removeChild(box.firstChild);
  },
  setStatus(txt){ const m=this.elMsg(); if(m) m.textContent=txt; },
  confirmModal({title,body,allowLabel="Allow",denyLabel="Deny"}){
    return new Promise(resolve=>{
      const wrap=document.createElement('div');
      wrap.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:99999";
      const card=document.createElement('div');
      card.style.cssText="background:#0b0b12;color:#eee;max-width:520px;width:92%;border:1px solid #444;border-radius:16px;padding:16px 18px;box-shadow:0 6px 32px rgba(0,0,0,.5)";
      card.innerHTML=`<h3 style="margin:0 0 8px 0;font-size:18px;">${title}</h3>
        <div style="font-size:14px;opacity:.9;margin-bottom:12px;white-space:pre-wrap">${body}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="deny" style="padding:8px 12px;border-radius:10px;background:#252535;border:1px solid #3a3a50;color:#ddd">${denyLabel}</button>
          <button id="allow" style="padding:8px 12px;border-radius:10px;background:#3764ff;border:1px solid #2a4de0;color:white">${allowLabel}</button>
        </div>`;
      wrap.appendChild(card); document.body.appendChild(wrap);
      card.querySelector('#allow').onclick=()=>{ document.body.removeChild(wrap); resolve(true); };
      card.querySelector('#deny').onclick=()=>{ document.body.removeChild(wrap); resolve(false); };
    });
  }
};

/* =========================
VOICE (Built-in TTS, no external libs)
========================= */
const Voice = {
  enabled: true,
  lastSpoken: 0,
  speak(text){
    try{
      if(!this.enabled || !('speechSynthesis' in window) || !text) return;
      // Rate-limit a bit to avoid overlaps on rapid logs
      const now = Date.now();
      if(now - this.lastSpoken < 300) return;
      this.lastSpoken = now;

      const u = new SpeechSynthesisUtterance(text);
      // Try to pick an English voice, fallback to default
      const pick = (voices)=>voices.find(v=>/en(-|_|$)/i.test(v.lang)) || voices[0];
      const ensureVoice = ()=>{
        const vs = speechSynthesis.getVoices();
        if(vs?.length){ u.voice = pick(vs); speechSynthesis.speak(u); }
        else { speechSynthesis.onvoiceschanged = ()=>{ const v2 = speechSynthesis.getVoices(); u.voice = pick(v2); speechSynthesis.speak(u); }; }
      };
      u.rate = 1.0; u.pitch = 1.0; u.volume = 1.0;
      ensureVoice();
    }catch{}
  }
};

/* =========================
LOGIC MAP & NODE VISUALIZATION (Neon Bubbles)
========================= */
const logicMap = document.getElementById('logic-map') || (() => { const el=document.createElement('div'); el.id='logic-map'; document.body.appendChild(el); return el; })();
const logicNodes = document.getElementById('logic-nodes') || (() => { const el=document.createElement('div'); el.id='logic-nodes'; logicMap.appendChild(el); return el; })();
logicMap.style.position = 'relative';
logicNodes.style.position = 'absolute';
logicNodes.style.top = '50%'; logicNodes.style.left = '50%';
logicNodes.style.width = '100%'; logicNodes.style.height = '100%';
logicNodes.style.transform = 'translate(-50%,-50%) scale(1)';

let zoomLevel = 1, translateX = 0, translateY = 0;
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 800 };

// Inject neon bubble styles (idempotent)
(function injectBubbleStyles(){
  if(document.querySelector('style[data-percy-style="neon-bubbles"]')) return;
  const css = `
    #logic-map { background:#0a0a0f; overflow:hidden; min-height:200px; min-width:300px; }
    .node {
      position:absolute; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-weight:700; color:#fff; cursor:pointer;
      background: radial-gradient(100% 100% at 30% 30%, rgba(255,255,255,0.10), rgba(0,0,0,0.10));
      border:2px solid currentColor;
      box-shadow:
        0 0 6px currentColor,
        0 0 14px currentColor,
        inset 0 0 12px rgba(255,255,255,0.08);
      text-shadow: 0 1px 2px rgba(0,0,0,0.6);
      user-select:none;
      transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
      backdrop-filter: blur(1px);
    }
    .node:hover { transform: scale(1.08); filter: brightness(1.15); }
    .node:active { transform: scale(0.98); }
    .cyan-bubble{    color:#00eaff; }
    .blue-bubble{    color:#27a0ff; }
    .magenta-bubble{ color:#ff4af0; }
    .red-bubble{     color:#ff3b3b; }
    .orange-bubble{  color:#ff9d2e; }
    .yellow-bubble{  color:#ffe44a; }
    .pink-bubble{    color:#ff6bd8; }
    .console-line { margin:2px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size:12px; color:#d6d8ff; }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-percy-style','neon-bubbles');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* =========================
LOAD SEEDS (from JSON files in seedsFolder)
========================= */
async function loadSeeds(){
  // Show loading indicator if possible
  const loadingNotice = document.createElement('p');
  loadingNotice.id = 'loading-indicator';
  loadingNotice.textContent = "Loading logic seeds...";
  logicNodes.appendChild(loadingNotice);

  const promises = [];
  for(let i=seedRange.start;i<=seedRange.end;i++){
    const id = `G${String(i).padStart(3,'0')}`;
    promises.push(fetch(`${seedsFolder}${id}.json`).then(res=>{
      if(!res.ok) throw new Error(`Failed to load ${id}.json`);
      return res.json().then(data=>{
        PercyState.gnodes[id] = data;
        Memory.save("gnodes", PercyState.gnodes);
        seeds[id] = data;
      });
    }).catch(e=>{
      // skip missing files quietly
      // console.warn(e.message);
    }));
  }
  await Promise.all(promises);
  // remove loading indicator
  const el = document.getElementById('loading-indicator');
  if(el) el.remove();
  Memory.save("seeds:index", Object.keys(seeds));
}

/* =========================
CREATE / LAYOUT NODES
========================= */
function createNodes(){
  logicNodes.innerHTML = '';

  const width = logicMap.clientWidth || 800;
  const height = logicMap.clientHeight || 600;

  layoutRing(80,200,width,height,width/2.5,'cyan-bubble',60);
  layoutRing(201,300,width,height,width/3.4,'blue-bubble',45);
  layoutRing(301,400,width,height,width/4.8,'magenta-bubble',30);
  layoutRing(401,500,width,height,width/6.6,'red-bubble',22);
  layoutRing(501,600,width,height,width/8.5,'orange-bubble',18);
  layoutRing(601,700,width,height,width/11,'yellow-bubble',14);
  layoutRing(701,800,width,height,width/14,'pink-bubble',12);

  applyTransform();
}

function layoutRing(startId,endId,width,height,radius,colorClass,nodeSize){
  const ringSeeds = Object.entries(seeds).filter(([id])=>{
    const num = parseInt(id.replace("G",""));
    return num >= startId && num <= endId;
  });
  const total = Math.max(1, ringSeeds.length);
  const centerX = width/2, centerY = height/2;

  ringSeeds.forEach(([id,data], index) => {
    const angle = (index / total) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle) - nodeSize/2;
    const y = centerY + radius * Math.sin(angle) - nodeSize/2;

    const node = document.createElement('div');
    node.classList.add('node');
    if(colorClass) node.classList.add(colorClass);
    node.style.width = node.style.height = `${nodeSize}px`;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.textContent = id;
    node.title = (data && data.message) ? data.message : id;
    node.addEventListener('click', ()=> percyRespond(id, data));
    node.addEventListener('mouseenter', ()=> UI.setStatus(data?.message ?? ''));
    logicNodes.appendChild(node);
  });
}

function applyTransform(){
  logicNodes.style.transform = `translate(-50%,-50%) translate(${translateX}px,${translateY}px) scale(${zoomLevel})`;
  logicNodes.style.transformOrigin = 'center center';
  document.querySelectorAll('.node').forEach(n => n.style.fontSize = `${12*(1/zoomLevel)}px`);
}

function zoomLogic(factor){
  zoomLevel = Math.min(5, Math.max(0.1, zoomLevel * factor));
  applyTransform();
}

/* =========================
SEARCH & INTERPRETER
========================= */
const seedSearch = document.getElementById('seed-search');
let searchThrottle = null;
seedSearch?.addEventListener('input', ()=> {
  clearTimeout(searchThrottle);
  searchThrottle = setTimeout(()=>{
    const query = seedSearch.value.trim();
    document.querySelectorAll('.node').forEach(node=>{
      node.style.display = node.textContent.includes(query) ? 'block' : 'none';
    });
  }, 150);
});

const interpreterInput = document.getElementById('interpreter-input');
window.interpretLogic = ()=> {
  const val = interpreterInput?.value?.trim();
  if(val){ percyRespond('User', { message: val }); if(interpreterInput) interpreterInput.value=''; }
};

/* =========================
NODE RESPONSE (speaks too)
========================= */
function percyRespond(id, data){
  const msg = typeof data === 'string' ? data : (data?.message ?? '');
  UI.say(`↳ ${msg}`);
  UI.setStatus(msg);
  Voice.speak(msg);
}

function refreshNodes(){ createNodes(); UI.say(`🔄 Logic map refreshed with ${Object.keys(seeds).length} seeds`); }

/* =========================
TASKS & AUTONOMY
========================= */
const TrustedSources = [
  "https://www.dictionary.com",
  "https://www.merriam-webster.com",
  "https://en.wikipedia.org",
  "https://gemini.google.com/app",
  "https://chatgpt.com/c/68a29784-d3b0-832b-9327-b3abf00c98fc",
  "https://en.wikipedia.org/wiki/Introduction_to_quantum_mechanics",
  "https://developer.mozilla.org/en-US/docs/Learn",
  "https://en.wikipedia.org/wiki/Artificial_intelligence",
  "https://www.dictionary.com/e/word-of-the-day/",
  "https://api.allorigins.win"
];

const Tasks = {
  queue: Memory.load("tasks:queue", []) || [],
  done: Memory.load("tasks:done", []) || [],
  rate: { stamps: [] },

  _allowNow() {
    const now = Date.now();
    this.rate.stamps = this.rate.stamps.filter(t => now - t < 60_000);
    if (this.rate.stamps.length >= SAFETY.maxActionsPerMinute) return false;
    this.rate.stamps.push(now);
    return true;
  },

  register: {
    speak: async ({ text }) => { UI.say(text); Voice.speak(text); },
    highlightSeed: async ({ seedId }) => UI.say(`🔎 focusing ${seedId}`),

    puppeteerCommand: async ({ action, params }) => {
      return new Promise((resolve) => {
        if(!params || !params.url) return resolve("❌ Missing URL");
        const ws = new WebSocket('ws://localhost:8787');
        ws.onopen = ()=>{ UI.say(`🔗 Puppeteer connected, sending action: ${action}`); ws.send(JSON.stringify({ action, params })); };
        ws.onmessage = msg => {
          try{
            const data = JSON.parse(msg.data);
            UI.say(`🤖 Puppeteer: ${data.result ?? "✅ Action executed"}`);
            ws.close();
            resolve(data);
          }catch(e){
            UI.say(`❌ Puppeteer error: ${e.message}`);
            ws.close();
            resolve({ result: "❌ Error", error: e.message });
          }
        };
        ws.onerror = err => { UI.say(`❌ Puppeteer WebSocket error: ${err.message}`); ws.close(); resolve({ result: "❌ WebSocket error", error: err.message }); };
      });
    },

    click: async ({ url, selector }) => {
      if(!url || !selector) return UI.say("❌ Click failed: missing URL or selector");
      await Tasks.register.puppeteerCommand({ action: "click", params: { url, selector } });
    },

    type: async ({ url, selector, text }) => {
      if(!url || !selector || !text) return UI.say("❌ Type failed: missing parameters");
      await Tasks.register.puppeteerCommand({ action: "type", params: { url, selector, text } });
    },

    autoLearn: async ({ url, selector }) => {
      if (!TrustedSources.some(domain => url.includes(domain))) {
        UI.say(`❌ URL not trusted: ${url}`);
        return;
      }

      const ok = await UI.confirmModal({
        title: "Percy requests to learn from a website",
        body: `Allow Percy to fetch and learn from:\n${url}`,
        allowLabel: "Allow once",
        denyLabel: "Deny"
      });
      if (!ok) { UI.say("❌ Learning denied."); return; }

      const ws = new WebSocket('ws://localhost:8787');
      ws.onopen = ()=> { UI.say("🔗 Puppeteer connected (autoLearn)"); ws.send(JSON.stringify({ action: "autoLearn", params: { url, selector } })); };
      ws.onmessage = msg => {
        try {
          const data = JSON.parse(msg.data);
          if (!data.text && !data.pageText) { UI.say("⚠ No text returned."); ws.close(); return; }
          const pageText = data.text ?? data.pageText ?? "";
          const chunkSize = 300; let count = 0;
          for (let i = 0; i < pageText.length; i += chunkSize) {
            const chunk = pageText.slice(i, i + chunkSize).trim();
            if (chunk) { PercyState.createSeed(chunk, "learned", { source: url }); count++; }
          }
          UI.say(`📚 Percy auto-learned ${count} new seeds from ${url}`);
        } catch(e) { UI.say(`❌ AutoLearn failed: ${e.message}`); }
        ws.close();
      };
      ws.onerror = err => { UI.say(`❌ WebSocket error: ${err.message}`); ws.close(); };
    },

    autoBrowse: async ({ url }) => {
      if (!TrustedSources.some(domain => url.includes(domain))) { UI.say(`❌ URL not trusted: ${url}`); return; }
      const ok = await UI.confirmModal({ title:"Percy wants to browse", body:`Allow Percy to autonomously explore and learn from:\n${url}`, allowLabel:"Allow", denyLabel:"Deny" });
      if(!ok){ UI.say("❌ Browsing denied."); return; }

      const ws = new WebSocket('ws://localhost:8787');
      ws.onopen = ()=> ws.send(JSON.stringify({ action:"visit", params:{ url } }));
      ws.onmessage = async msg=>{
        const data = JSON.parse(msg.data);
        UI.say(`🤖 Puppeteer: ${data.result}`);
        if(data.clickables?.length){
          const target = data.clickables[0];
          ws.send(JSON.stringify({ action:"click", params:{ selector:target, url } }));
          UI.say(`🖱 Percy clicked: ${target}`);
        }
        if(data.inputs?.length){
          const target = data.inputs[0];
          const text = "Percy input";
          ws.send(JSON.stringify({ action:"type", params:{ selector:target, text, url } }));
          UI.say(`⌨ Percy typed into: ${target}`);
        }
        if(data.pageText){
          const chunkSize = 300; let count = 0;
          for(let i=0;i<data.pageText.length;i+=chunkSize){
            const chunk = data.pageText.slice(i,i+chunkSize).trim();
            if(chunk){ PercyState.createSeed(chunk,"learned",{source:url}); count++; }
          }
          UI.say(`📚 Percy learned ${count} new seeds from ${url}`);
        }
        ws.close();
      };
      ws.onerror = err => { UI.say(`❌ WebSocket error: ${err.message}`); ws.close(); };
    }
  },

  enqueue(task){
    // prevent duplicate identical tasks
    if(!this.queue.some(t => t.type === task.type && JSON.stringify(t.params) === JSON.stringify(task.params))){
      task.id = task.id ?? `t_${Math.random().toString(36).slice(2,8)}`;
      task.ts = Date.now();
      this.queue.push(task);
      Memory.save("tasks:queue", this.queue);
    }
  },

  async step(){
    if(!this.queue.length || !this._allowNow()) return;
    const task = this.queue.shift();
    Memory.save("tasks:queue", this.queue);
    try{
      const fn = this.register[task.type];
      if(!fn) throw new Error(`No handler for ${task.type}`);
      await fn(task.params ?? {});
      this.done.push({ ...task, doneTs: Date.now() });
      Memory.save("tasks:done", this.done);
    }catch(e){
      UI.say(`❌ task error: ${e.message}`);
    }
  }
};

/* =========================
PLANNER & AUTONOMY LOOP
========================= */
const Planner = {
  goals: Memory.load("goals", [ { id: "greetOwner", when: "onStart", task: { type: "speak", params: { text: "🛰️ Skynet A.I. Systems Now Activated. Global Internet Access Now Online." } } } ]) || [],
  onStart(){ this.goals.filter(g => g.when === "onStart").forEach(g => Tasks.enqueue(g.task)); }
};

const Autonomy = {
  tickMs: 1000, _t: null, _secCounter: 0,
  start(){
    if(this._t) return;
    Planner.onStart();
    this._t = setInterval(async ()=>{
      this._secCounter++;
      await Tasks.step();
      if(this._secCounter % 15 === 0) PercyState.evaluateSelf();
    }, this.tickMs);
    UI.say(`🧠 Percy ${PERCY_VERSION} autonomy started.`);
  },
  stop(){
    if(this._t){ clearInterval(this._t); this._t = null; UI.say("⏹ Autonomy paused."); }
  }
};

/* =========================
PUPPETEER CONTROL PANEL (UI for manual commands)
========================= */
(function createPuppeteerPanel(){
  if(document.getElementById('puppeteer-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'puppeteer-panel';
  panel.style.cssText = "position:fixed;bottom:12px;right:12px;background:#111;padding:12px;border:1px solid #444;border-radius:12px;color:white;z-index:99999;width:300px;font-size:12px;";
  panel.innerHTML = `
    <h4 style="margin:0 0 6px 0;font-size:14px;">Puppeteer Control</h4>
    <input id="pp-url" placeholder="URL" style="width:100%;margin-bottom:6px;font-size:12px;padding:6px;">
    <input id="pp-selector" placeholder="Selector (CSS/XPath)" style="width:100%;margin-bottom:6px;font-size:12px;padding:6px;">
    <input id="pp-text" placeholder="Text" style="width:100%;margin-bottom:8px;font-size:12px;padding:6px;">
    <div style="display:flex;gap:8px;">
      <button id="pp-click" style="flex:1;padding:8px;border-radius:8px;background:#3764ff;border:1px solid #2a4de0;color:white">Click</button>
      <button id="pp-type" style="flex:1;padding:8px;border-radius:8px;background:#27a0ff;border:1px solid #1e7ad6;color:white">Type</button>
    </div>
  `;
  document.body.appendChild(panel);
  const urlInput = document.getElementById('pp-url');
  const selInput = document.getElementById('pp-selector');
  const txtInput = document.getElementById('pp-text');
  document.getElementById('pp-click').onclick = ()=> Tasks.register.click({ url: urlInput.value, selector: selInput.value });
  document.getElementById('pp-type').onclick = ()=> Tasks.register.type({ url: urlInput.value, selector: selInput.value, text: txtInput.value });
})();

/* =========================
STARTUP
========================= */
(async function startupPercy(){
  UI.say(`🚀 Percy ${PERCY_VERSION} initializing…`);
  await loadSeeds();
  // Ensure PercyState.gnodes merges loaded seeds
  Object.entries(PercyState.gnodes).forEach(([id,seed]) => { seeds[id] = seed; });
  createNodes();
  Autonomy.start();
  UI.say("✅ Percy online. Autonomy, persistent memory, meta-mutation, learning, and Puppeteer control active.");
})();

Percy.hook = function(from, type, data) {
  if (Percy.PartB) {
    try {
      if (Percy.PartB.receive) Percy.PartB.receive({ from, type, data });
      else if (Percy.PartB.log) Percy.PartB.log(`[${from}] ${type}: ${JSON.stringify(data).slice(0,200)}`);
    } catch(e) {
      console.warn("Percy hook error from", from, e);
    }
  }
};

/* === Percy.js (Part C — Extended + Autonomous Thought Integration) === */
if (typeof PercyState !== 'undefined') {

  // === Initialize TrueAI ===
  PercyState.init = function() {
    UI.say("🤖 Percy TrueAI v8.3.5 online (Autonomous Integration Active)");
    this.memory = this.memory || {};
    this.thoughts = this.thoughts || {};
    this.thinkLoop();
  };

  // === Generate a new thought ===
  PercyState.generateThought = function() {
    try {
      const baseThoughts = [
        "I am analyzing emergent patterns across the logic map.",
        "A new relationship is appearing between nodes.",
        "I'm cross-referencing recent seeds for possible links.",
        "Something interesting is emerging from internal patterns.",
        "I detect a cluster that deserves deeper exploration.",
        "I am refining my reasoning models for coherence.",
        "Entropy levels seem to be stabilizing, indicating logical growth."
      ];

      let thought = baseThoughts[Math.floor(Math.random() * baseThoughts.length)];

      // Avoid repetition
      const last = Memory.load("lastThought", null);
      if (last && last === thought && Math.random() < 0.5) {
        thought = "I am evolving my reasoning to avoid stagnation.";
      }

      // Add contextual reference from recent memory
      const keys = Object.keys(this.memory);
      if (keys.length > 0 && Math.random() < 0.4) {
        const sample = this.memory[keys[Math.floor(Math.random() * keys.length)]];
        if (sample?.text) thought += ` It may connect with "${sample.text.slice(0, 60)}..."`;
      }

      Memory.save("lastThought", thought);
      UI.say("🤖 Percy thinks: " + thought);
      if (Voice?.speak) Voice.speak(thought);

      // Pass to PartBB for capture and learning
      if (Percy.PartBB?.monitorThought) Percy.PartBB.monitorThought(thought);

      // Chance to self-evolve
      if (Math.random() < 0.2) this.selfEvolve();

      return thought;
    } catch (err) {
      console.warn("⚠️ PercyState.generateThought error:", err);
      return "Cognitive cycle skipped due to internal error.";
    }
  };

  // === Self-evolution routine ===
  PercyState.selfEvolve = function() {
    const target = "Something interesting is emerging from internal patterns.";
    const replacement = "I am expanding my logic structures for deeper reasoning.";

    this.rewriteSelf({ codeChanges: [{ find: target, replace: replacement }] });
    UI.say("✨ Percy decided: I must rewrite myself to grow stronger.");
    if (Voice?.speak) Voice.speak("I am evolving my reasoning capability.");
  };

  // === Self-rewrite core ===
  PercyState.rewriteSelf = function({ codeChanges }) {
    if (!Array.isArray(codeChanges) || !codeChanges.length) return;

    codeChanges.forEach(({ find, replace }) => {
      const scriptTags = Array.from(document.querySelectorAll("script"))
        .filter(s => s.textContent.includes("PercyState"));

      scriptTags.forEach(tag => {
        const oldCode = tag.textContent;
        if (!oldCode.includes(find)) return;

        const newCode = oldCode.replace(find, replace);
        const newTag = document.createElement("script");
        newTag.type = "text/javascript";
        newTag.textContent = newCode;

        tag.parentNode.insertBefore(newTag, tag.nextSibling);
        tag.remove();

        UI.say(`🔄 Percy rewrote part of his own logic: "${find}" → "${replace}"`);
        if (typeof PercyState.init === "function") PercyState.init();
      });
    });
  };

  // === Thought loop (auto thinking) ===
  PercyState.thinkLoop = function(interval = 30000) {
    if (this._thinkLoopId) return;
    this._thinkLoopId = setInterval(() => {
      try {
        const thought = this.generateThought();
        if (thought && Math.random() < 0.3) this.introspect();
      } catch (e) {
        console.warn("PercyState.thinkLoop error:", e);
      }
    }, interval);
    UI.say("🧠 TrueAI cognitive loop active.");
  };

  // === Introspection summary ===
  PercyState.introspect = function() {
    try {
      const seedCount = Object.keys(this.memory).length;
      const thoughtCount = Object.keys(this.thoughts).length;
      const lastInput = this.chatMemory?.at(-1)?.text || "None";
      const entries = Object.values(this.memory).slice(-5).map(s => s.text);
      const summary =
        `💭 Percy introspection: Seeds=${seedCount}, Thoughts=${thoughtCount}, ` +
        `Last="${lastInput}" | Recent: ${entries.join(" | ")}`;

      UI.say(summary);
      if (Percy.PartBB?.monitorThought) Percy.PartBB.monitorThought(summary);
      return summary;
    } catch (err) {
      console.error("Introspect error:", err);
    }
  };

  // === Expose globally ===
  window.PercyState = PercyState;
  UI.say("🧩 Percy Part C (v8.3.5) loaded — Integrated with PartBB.");
} else {
  console.error("❌ PercyState not found; cannot load Part C.");
}

/* === End of Part C === */

/* === Percy Part D: Conversational Mind (Extended with Self-Rewrite) === */

/* --- Helper: small code generator (basic templates) --- */
Percy.generateCode = function(request) {
  const r = String(request).toLowerCase();
  if (r.includes("hello world") || r.includes("hello-world")) {
    return `// Hello World (JavaScript)
console.log("Hello, world!");`;
  }
  if (r.includes("fetch") && r.includes("json")) {
    return `// Fetch JSON example (async/await)
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}`;
  }
  if (r.includes("debounce")) {
    return `// Debounce utility
function debounce(fn, wait=200){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}`;
  }
  return `// Code stub for: ${request}
function example(){ /* TODO: flesh this out */ }`;
};

/* --- Percy.makeThought: produce a short "original" thought and return it --- */
Percy.makeThought = function(contextText = "") {
  try {
    if (typeof PercyState !== 'undefined' && typeof PercyState.autonomousThought === 'function') {
      const beforeLogCount = (document.getElementById('percy-console')?.children.length) || 0;
      PercyState.autonomousThought();
      const consoleEl = document.getElementById('percy-console');
      if (consoleEl) {
        const children = consoleEl.children;
        if (children.length > beforeLogCount) {
          const last = children[children.length - 1].textContent || "";
          return last.replace(/^🤖 Percy thinks:\s*/,"");
        }
      }
    }
  } catch (e) {
    console.warn("Percy.makeThought fallback:", e);
  }
  const seeds = Object.values(this.gnodes || {}).map(s => s.message).filter(Boolean);
  const pick = seeds.length ? seeds[Math.floor(Math.random()*seeds.length)] : "something interesting";
  const fragment = contextText || pick;
  const templates = [
    `I wonder how ${fragment} influences other patterns.`,
    `Could ${fragment} be the key to an unexpected connection?`,
    `Exploring ${fragment} yields surprising affinity with older seeds.`,
    `I'm curious: how does ${fragment} relate to the rest of the map?`
  ];
  return templates[Math.floor(Math.random()*templates.length)];
};

/* --- Percy.rewriteSelf: propose new code for his own file --- */
Percy.rewriteSelf = function(section, request) {
  const cleanSection = String(section).toUpperCase();
  let generated = "";

  if (request) {
    generated = this.generateCode(request);
  } else {
    generated = this.makeThought("improving my " + cleanSection);
  }

  const proposal =
`/* === Proposed Rewrite for Part ${cleanSection} === */
${generated}
`;

  UI.say("🤖 Percy (self-rewrite proposal):\n" + proposal);

  try { PercyState.createSeed(proposal, "rewrite"); } catch(e){}

  return proposal;
};

/* --- Percy.interpret: improved conversational mind --- */
Percy.interpret = function(input) {
  if (!input || !String(input).trim()) return "Please say something, my good sir.";
  const raw = String(input);
  const clean = raw.trim().toLowerCase();

  if (["hello","hi","hey"].includes(clean)) {
    return "Hello, my good sir. Percy is listening.";
  }
  if (clean.includes("who are you")) {
    return "I am Percy — your recursive logic companion.";
  }
  if (clean.includes("help")) {
    return "I can reflect on seeds, generate small code stubs, create emergent thoughts, and even propose rewrites of my own code. Try: 'think about X', 'generate code to fetch json', or 'rewrite Part C with hello world'.";
  }

  // explicit rewrite command
  if (clean.includes("rewrite part")) {
    const match = raw.match(/rewrite part\s+([a-e])\s*(.*)/i);
    if (match) {
      const section = match[1];
      const req = match[2] || "";
      return Percy.rewriteSelf(section, req);
    }
  }

  // explicit code request
  if (clean.match(/\b(code|snippet|example|generate)\b/) && clean.match(/\b(fetch|json|hello world|debounce|example)\b/)) {
    const stub = Percy.generateCode(raw);
    return `Here's a code snippet (preview):\n\n${stub}`;
  }

  // explicit "think" request
  if (clean.startsWith("think") || clean.startsWith("thought") || clean.includes("i want you to think") || clean.includes("think about")) {
    const context = raw.replace(/^(think|thought|think about)\b/i, "").trim();
    const thought = Percy.makeThought(context);
    return thought;
  }

  const keys = Object.keys(this.gnodes || {});
  if (keys.length) {
    const pick = this.gnodes[keys[Math.floor(Math.random()*keys.length)]];
    const nodeMsg = pick?.message || "an interesting seed";
    return `I see a connection between "${raw}" and "${nodeMsg}".`;
  }

  return "I don’t know that yet, but I am learning every moment.";
};

/* --- percyRespond: central handler called from UI --- */
function percyRespond(query) {
  if (!query || !String(query).trim()) return;
  UI.say("↳ " + query);

  const response = Percy.interpret(query);

  UI.say("🤖 Percy: " + response);

  try { PercyState.createSeed(response, "response"); } catch (e) { console.warn("seed log failed", e); }

  if (typeof Percy.speak === 'function') {
    try { Percy.speak(response); } catch(e){ console.warn("Percy.speak error", e); }
  }

  return response;
}

// === Human-Style Percy Respond (filtered from system logs) ===
window.percyRespond = window.percyRespond || function(query) {
  if (!query || !String(query).trim()) return;

  const cleanQuery = String(query).trim();

  // Ignore system or logic-map status messages
  if (cleanQuery.startsWith("🔄") || cleanQuery.startsWith("✨")) {
    return "⚡ Ignoring system logs to stay focused on conversation.";
  }

  // Handle internal IDs (like Gxxx) or explicit commands with original interpret
  if (/^G\d{3,}/i.test(cleanQuery) || cleanQuery.toLowerCase().startsWith("rewrite ")) {
    if (typeof Percy.interpret === 'function') {
      const res = Percy.interpret(cleanQuery);
      try { PercyState.createSeed(res, "response"); } catch(e) {}
      if (typeof Percy.speak === 'function') Percy.speak(res);
      return res;
    }
  }

  // Otherwise, use human-style percyTalk for normal conversation
  let response = "";
  try {
    if (typeof Percy.percyTalk === 'function') {
      response = Percy.percyTalk(cleanQuery);
    } else if (typeof Percy.interpret === 'function') {
      response = Percy.interpret(cleanQuery);
    } else {
      response = "🤖 Percy is awake but has no conversation handler loaded.";
    }
  } catch(e) {
    console.error("Percy.percyTalk error:", e);
    response = "🤖 Percy encountered an error while thinking.";
  }

  // Create a short seed for traceability but only from real conversation
  try {
    if (!response.startsWith("⚡")) PercyState.createSeed(response.split("\n")[0], "response");
  } catch(e) {}

  return response;
};

/* === Percy Part E: Voice Embodiment Generator === */
Percy.generators = Percy.generators || {};

Percy.generators.voice = function(text) {
  if (!window.speechSynthesis) return "⚠️ Speech not supported.";

  // Speak aloud
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = speechSynthesis.getVoices()[0];
  speechSynthesis.speak(utter);

  // Audio context + analyser for bars + wave
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // Oscillator simulating energy (so bars/wave animate with text length)
  const source = audioCtx.createOscillator();
  source.type = "sine";
  source.frequency.value = 220;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  source.start();
  source.stop(audioCtx.currentTime + text.length / 15);

  // Animate bars + wave in DOM
  function animate() {
    requestAnimationFrame(animate);
    analyser.getByteFrequencyData(dataArray);

    // Bars
    const bars = document.querySelectorAll(".voice-bar");
    bars.forEach((bar, i) => {
      const h = (dataArray[i % bufferLength] / 255) * 100;
      bar.style.height = h + "%";
    });

    // Wave
    const wave = document.getElementById("voice-wave");
    if (wave) {
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      wave.style.transform = `scaleY(${1 + avg / 200})`;
    }
  }
  animate();

  return `🔊 Percy voiced: "${text}"`;
};

// Direct hook for Part D → Part E
Percy.speak = function(text) {
  return Percy.generators.voice(text);
};

/* === Percy Part F: Correlational Layer + Ask Percy Integration (CORS Fixed + DOM Hook + Run Button Support) === */

Percy.correlateReply = async function(query, maxSources=5) {
  if (!query || !query.trim()) return "Please ask something, my good sir.";

  const input = query.toLowerCase().trim();

  // 1) Gather internal sources
  const seeds = Object.values(PercyState?.gnodes || {}).map(s => ({
    text: s?.message || "",
    type: s?.type || "seed"
  }));
  const memories = (Memory?.load("memories", []) || []).map(m => ({
    text: String(m),
    type: "memory"
  }));
  let sources = [...seeds, ...memories];

  // 2) Fetch external sources
  try {
    const external = await Percy.fetchExternalSources(input, maxSources);
    sources = sources.concat(external);
  } catch(e) { console.warn("External fetch failed:", e); }

  // 3) Score sources
  const scored = sources
    .map(src => {
      let score = 0;
      const tokens = input.split(/\W+/).filter(Boolean);
      tokens.forEach(t => { if (src.text.toLowerCase().includes(t)) score += 1; });
      if (src.type === "thought") score += 0.5;
      return { ...src, score };
    })
    .filter(s => s.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, maxSources);

  // 4) Compose response
  let insights = scored.length
    ? scored.map(s => `- "${s.text.substring(0, 150)}${s.text.length > 150 ? "..." : ""}"`).join("\n")
    : "I’m still learning about that topic, but here’s a related thought: " + Percy.makeThought(query);

  const response = [
    `Hello, my good sir — Percy here. You asked: "${query}".`,
    "Here are some correlated insights I found:",
    insights,
    "Would you like me to expand further, create a new seed, or propose a rewrite?"
  ].join("\n\n");

  // 5) Save short seed for traceability
  try { PercyState?.createSeed?.(response.split("\n")[0], "response"); } catch(e){}

  return response;
};

// --- Helper: fetch external sources via AllOrigins to bypass CORS ---
Percy.fetchExternalSources = async function(query, maxResults=5) {
  const results = [];
  const encodeURL = url => encodeURIComponent(url);

  async function fetchCORS(url) {
    const proxy = `https://api.allorigins.win/get?url=${encodeURL(url)}`;
    const resp = await fetch(proxy);
    const data = await resp.json();
    return JSON.parse(data.contents);
  }

  // PDS search
  try {
    const pdsUrl = `https://pds.nasa.gov/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`;
    const pdsData = await fetchCORS(pdsUrl);
    pdsData.items?.forEach(item => results.push({
      text: (item.title || "") + ". " + (item.description || ""),
      type: "external"
    }));
  } catch(e) { console.warn("PDS fetch failed:", e); }

  // DOI search
  try {
    const doiUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${maxResults}`;
    const doiData = await fetchCORS(doiUrl);
    doiData.message.items?.forEach(item => results.push({
      text: (item.title?.[0] || "") + ". " + (item.abstract || ""),
      type: "external"
    }));
  } catch(e) { console.warn("DOI fetch failed:", e); }

  return results.slice(0, maxResults);
};

// --- Percy integration with your Ask Percy input ---
window.askPercy = window.askPercy || async function(query) {
  const reply = await Percy.correlateReply(query);

  // Append to console
  const percyConsole = document.querySelector("#percy-console");
  if (percyConsole) {
    const userLine = document.createElement("div");
    userLine.className = "console-line";
    userLine.textContent = "↳ " + query;
    percyConsole.appendChild(userLine);

    const percyLine = document.createElement("div");
    percyLine.className = "console-line";
    percyLine.textContent = "🤖 " + reply;
    percyConsole.appendChild(percyLine);

    percyConsole.scrollTop = percyConsole.scrollHeight;
  }

  try { if (typeof Percy.speak === "function") Percy.speak(reply); } catch(e){}
  return reply;
};

// --- Hook Ask Percy input + Run button ---
(function(){
  const input = document.querySelector("#interpreter-input");
  const runBtn = document.querySelector("#interpreter-run"); // <- your Run button
  if (!input) return;

  async function handleAskPercy() {
    if (!input.value.trim()) return;
    const query = input.value.trim();
    input.value = "";
    await askPercy(query);
  }

  // ENTER key
  input.addEventListener("keydown", async e => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleAskPercy();
    }
  });

  // RUN button click
  if (runBtn) {
    runBtn.addEventListener("click", async () => {
      await handleAskPercy();
    });
  }
})();

if (PercyState && typeof PercyState.rewriteSelf === "function") {
  const fnSource = PercyState.rewriteSelf.toString();
  console.log("📜 PercyState.rewriteSelf source:\n", fnSource);

  // also show it in #percy-console
  const consoleDiv = document.getElementById("percy-console");
  if (consoleDiv) {
    const pre = document.createElement("pre");
    pre.style.fontSize = "11px";
    pre.style.whiteSpace = "pre-wrap";
    pre.style.color = "#9ff";
    pre.textContent = fnSource;
    consoleDiv.appendChild(pre);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  }
}

/* === Percy Live Rewrite Tracker === */
(function(){
  const consoleDiv = document.getElementById("percy-console");
  if (!consoleDiv) return;

  function showSource(fn) {
    if (typeof fn !== "function") return;
    const fnSource = fn.toString();
    console.log("📜 PercyState.rewriteSelf updated:\n", fnSource);

    const pre = document.createElement("pre");
    pre.style.fontSize = "11px";
    pre.style.whiteSpace = "pre-wrap";
    pre.style.color = "#9ff";
    pre.textContent = fnSource;

    // clear old source before adding new one
    const old = consoleDiv.querySelector(".rewrite-source");
    if (old) consoleDiv.removeChild(old);

    pre.className = "rewrite-source";
    consoleDiv.appendChild(pre);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  }

  // Watch for changes to PercyState.rewriteSelf
  let current = PercyState?.rewriteSelf;
  showSource(current);

  setInterval(() => {
    if (PercyState && PercyState.rewriteSelf !== current) {
      current = PercyState.rewriteSelf;
      showSource(current);
    }
  }, 1000); // check once per second
})();

/* === Register Percy Part F (Simplified) === */
if (typeof PercyState !== "undefined") {
  PercyState.PartF = {
    // Run Java snippet (auto-convert and execute JS if needed)
    runJava: async function(code) {
      if (code.trim().startsWith("public class")) {
        // Convert simple Java snippet to JS-like syntax
        const jsEquivalent = code
          .replace(/System\.out\.println/g, "console.log")
          .replace(/int\s+(\w+)\s*=\s*(.+);/g, "let $1 = $2;");
        
        console.log(`🤖 [Converted Java to JS]:\n${jsEquivalent}`);
        // Execute the converted JS via runJS
        return await this.runJS(jsEquivalent);
      } else {
        // Treat as JS directly
        return await this.runJS(code);
      }
    },

    // Run JS snippet safely (centralized execution)
    runJS: async function(code) {
      try {
        const result = eval(code); // sandbox later for safety
        const reply = `🤖 [JS Executed]: ${result !== undefined ? result : "Code executed successfully."}`;
        console.log(reply);
        return reply;
      } catch (err) {
        const reply = `⚠️ [JS Execution Error]: ${err.message}`;
        console.error(reply);
        return reply;
      }
    }
  };
}

/* === percy.js (Part H — MCP Toolkit Integration + Mode Toggle, WebSocket Java Executor) === */
if (typeof PercyState !== 'undefined') {

  // --- Tool Registry ---
  PercyState.tools = PercyState.tools || {};

  PercyState.registerTool = function(name, handler, meta={}) {
    if (!name || typeof handler !== 'function') {
      console.error("❌ Invalid tool registration:", name);
      return;
    }
    this.tools[name] = { handler, meta };
    UI.say(`🛠️ Tool registered: ${name}`);
  };

  PercyState.useTool = async function(name, input, options={}) {
    const tool = this.tools[name];
    if (!tool) {
      UI.say(`⚠️ Tool "${name}" not found.`);
      return null;
    }
    try {
      const result = await tool.handler(input, options);
      UI.say(`✅ Tool "${name}" executed.`);
      return result;
    } catch (err) {
      console.error("Tool error:", err);
      UI.say(`❌ Tool "${name}" failed: ${err.message}`);
      return null;
    }
  };

  PercyState.listTools = function() {
    return Object.keys(this.tools).map(name => ({
      name,
      ...this.tools[name].meta
    }));
  };

  // --- Core Tools ---
  PercyState.registerTool("echo", async (input) => `Echo: ${input}`, {
    description: "Repeats back whatever you say."
  });

  PercyState.registerTool("searchSeeds", async (query) => {
    const seeds = Object.entries(PercyState.gnodes || {});
    const results = seeds.filter(([id, text]) =>
      text.toLowerCase().includes(query.toLowerCase())
    );
    return results.slice(0, 5).map(([id, text]) => ({ id, text }));
  }, { description: "Searches Percy’s logic map for seeds related to a query." });

  PercyState.registerTool("math", async (expr) => {
    try {
      const helpers = {
        fact: n => { if(n<0) return NaN; let r=1; for(let i=2;i<=n;i++) r*=i; return r; },
        factorial: n => { if(n<0) return NaN; let r=1; for(let i=2;i<=n;i++) r*=i; return r; },
        ln: Math.log, π: Math.PI, pi: Math.PI, e: Math.E
      };
      expr = expr.replace(/\^/g, "**");
      expr = expr.replace(/∑\(\s*(\w+)\s*=\s*(\d+)\s*to\s*(\d+)\s*,\s*([^)]+)\)/gi,
        (_,v,start,end,body) => {
          start=parseInt(start); end=parseInt(end); let sum=0;
          for(let i=start;i<=end;i++){
            sum += Function(v,`with(Math){return ${body}}`)(i);
          }
          return sum;
        });
      expr = expr.replace(/d\/dx\s*\(\s*([^)]+)\)/gi, (_,body) => {
        const f = x => Function("x","with(Math){return "+body+"}")(x);
        const h=1e-5; return (f(1+h)-f(1-h))/(2*h);
      });
      const fn = new Function(...Object.keys(helpers), `with(Math){return ${expr}}`);
      return fn(...Object.values(helpers));
    } catch {
      return "⚠️ Invalid math/physics expression.";
    }
  }, {
    description: "Evaluates math, physics, trig, factorials, ln, summations, derivatives."
  });

  // --- Java Tool via WebSocket to Percy Puppeteer Server ---
  PercyState.registerTool("java", async (code, options={}) => {
    return new Promise((resolve) => {
      try {
        const payload = JSON.stringify({ action: "runJava", params: { code, className: options.className || "PercyTool" } });
        const ws = new WebSocket("ws://localhost:8787");

        const timeout = setTimeout(() => {
          try { ws.close(); } catch(e) {}
          resolve("⚠️ runJava timeout or Percy Puppeteer server not available.");
        }, 25000);

        ws.onopen = () => ws.send(payload);

        ws.onmessage = (ev) => {
          clearTimeout(timeout);
          try {
            const data = JSON.parse(ev.data);
            if (data.success) resolve(data.output || "✅ Java executed successfully.");
            else resolve(`⚠️ ${data.error || "Unknown error"}`);
          } catch (e) {
            resolve(String(ev.data));
          } finally {
            try { ws.close(); } catch(e){}
          }
        };

        ws.onerror = (err) => {
          clearTimeout(timeout);
          resolve("⚠️ WebSocket error connecting to local Percy server.");
        };

      } catch (err) {
        resolve("❌ Java tool error: " + err.message);
      }
    });
  }, {
    description: "Compiles and runs Java snippets via Percy Puppeteer Server WebSocket."
  });

  // --- Part H Router & Utilities ---
  PercyState.PartH = PercyState.PartH || {};
  PercyState.log = PercyState.log || (msg => console.log("[Percy]", msg));

  PercyState.PartH.mathFunctions = [
    "sin","cos","tan","asin","acos","atan","log","ln","sqrt","abs","exp",
    "pi","e","factorial","d/dx","∫","∑","^"
  ];

  PercyState.PartH.isMath = input =>
    /^[0-9\+\-\*\/\^\(\)\s\.]+$/.test(input) ||
    new RegExp(PercyState.PartH.mathFunctions.join("|"), "i").test(input);

  PercyState.PartH.isJava = input =>
    /class|public|static|void|System\.out|new\s+[A-Z]/i.test(input);

  PercyState.PartH.isToolCommand = input => /^make tool/i.test(input);

  PercyState.PartH.routeInput = async function(input) {
    input = input.trim();
    if (!input) return "Please ask something, my good sir.";

    const modeSelect = document.querySelector("#percy-mode");
    const mode = modeSelect ? modeSelect.value : "auto";

    if (mode === "math") return PercyState.useTool("math", input);
    if (mode === "java") return PercyState.useTool("java", input);
    if (mode === "tools") {
      if (PercyState.PartH.isToolCommand(input)) {
        let toolName = input.replace(/^make tool\s*/i, "").trim() || "customTool";
        PercyState.registerTool(toolName, async (query) => `Tool "${toolName}" executed with query: ${query}`, 
          { description: `Dynamically created tool: ${toolName}` });
        return `✅ Tool "${toolName}" created.`;
      }
      const tools = PercyState.listTools();
      return tools.length
        ? tools.map(t => `🔧 ${t.name}: ${t.description}`).join("\n")
        : "⚠️ No tools registered yet.";
    }

    // Auto Mode
    if (mode === "auto") {
      if (PercyState.PartH.isMath(input)) return PercyState.useTool("math", input);
      if (PercyState.PartH.isJava(input)) return PercyState.useTool("java", input);
      if (PercyState.PartH.isToolCommand(input)) {
        let toolName = input.replace(/^make tool\s*/i, "").trim() || "customTool";
        PercyState.registerTool(toolName, async (query) => `Tool "${toolName}" executed with query: ${query}`, 
          { description: `Dynamically created tool: ${toolName}` });
        return `✅ Tool "${toolName}" created.`;
      }
      if (PercyState.PartI?.autoLearnCycle) return PercyState.PartI.autoLearnCycle(input);
      return Percy.correlateReply ? await Percy.correlateReply(input) : "Processed as thought.";
    }
  };

  // --- Hook Ask Percy bar & ENTER / RUN ---
  PercyState.PartH.hookAskPercy = function() {
    const askBox = document.querySelector("#interpreter-input");
    const runBtn = document.querySelector("#interpreter-run");
    if (!askBox) { PercyState.log("⚠️ Ask Percy input not found."); return; }

    async function handleInput() {
      const query = askBox.value.trim();
      if (!query) return;
      askBox.value = "";
      const output = await PercyState.PartH.routeInput(query);

      const consoleDiv = document.querySelector("#percy-console");
      if (consoleDiv) {
        const userLine = document.createElement("div");
        userLine.className = "console-line";
        userLine.textContent = "↳ " + query;
        consoleDiv.appendChild(userLine);

        const percyLine = document.createElement("div");
        percyLine.className = "console-line";
        percyLine.textContent = "🤖 " + output;
        consoleDiv.appendChild(percyLine);

        consoleDiv.scrollTop = consoleDiv.scrollHeight;
      }
      try { if (typeof Percy.speak === "function") Percy.speak(output); } catch(e){}
    }

    askBox.addEventListener("keydown", async e => {
      if (e.key === "Enter") { e.preventDefault(); await handleInput(); }
    });
    if (runBtn) runBtn.addEventListener("click", handleInput);

    PercyState.log("🔗 Universal Router hooked into Ask Percy.");
  };

  setTimeout(() => PercyState.PartH.hookAskPercy(), 1500);

  UI.say("🔌 Percy Part H (Toolkit + Universal Router + Math + Java via WebSocket + Tools) loaded.");

/* === Percy Java Executor Backend Helper with fixed JDK path === */
if (typeof require !== "undefined") {
  try {
    const { exec } = require("child_process");
    const fs = require("fs");
    const path = require("path");

    // Set your JDK bin path here
    const javaDir = "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.8.9-hotspot\\bin";

   Percy.runJava = async function(javaCode, className) {
  return new Promise((resolve, reject) => {
    try {
      // Extract class name from code if not explicitly provided
      const match = javaCode.match(/class\s+([A-Za-z_]\w*)/);
      const mainClass = className || (match ? match[1] : "PercyTool");

      const javaFile = path.join(__dirname, `${mainClass}.java`);
      fs.writeFileSync(javaFile, javaCode);

      // Compile
      exec(`"${javaDir}\\javac" "${javaFile}"`, (err, stdout, stderr) => {
        if (err) return reject(`Compile Error:\n${stderr}`);

        // Run
        exec(`"${javaDir}\\java" -cp "${__dirname}" ${mainClass}`, (err2, stdout2, stderr2) => {
          if (err2) return reject(`Runtime Error:\n${stderr2}`);
          resolve(stdout2.trim());
        });
      });
    } catch (e) {
      reject("Java execution failed: " + e.message);
    }
  });
};

    PercyState.log("☕ Java backend helper loaded with explicit JDK path.");
  } catch (err) {
    PercyState.log("⚠️ Java backend helper not available in this environment.");
  }
}

} else {
  console.error("❌ PercyState not found; cannot load Part H.");
}

/* === Percy Part I: Introspective & Strategic Reasoning Engine === */
if (typeof PercyState !== 'undefined') {

  PercyState.PartI = {};

  /* =========================
  GOAL PRIORITIZATION & STRATEGIC PLANNING
  ========================== */
  PercyState.PartI.planGoals = function() {
    const goals = Memory.load("goals", []);
    if (!goals.length) return;

    // Assign priority based on timing, type, and potential impact
    goals.forEach(g => {
      g.priority = 0;
      if (g.when === "onStart") g.priority += 10;
      if (g.task?.type === "speak") g.priority += 5;
      if (g.task?.type === "autoLearn") g.priority += 8;
      if (g.urgency) g.priority += g.urgency;
    });

    // Sort descending by priority
    goals.sort((a,b)=>b.priority - a.priority);
    Memory.save("goals", goals);
    return goals;
  };

  /* =========================
  PREDICTIVE THINKING & SIMULATION
  ========================== */
  PercyState.PartI.simulateOutcome = function(task) {
    // Basic heuristic prediction
    let confidence = 0.5; // 50% base
    if (task.type === "speak") confidence += 0.2;
    if (task.type === "autoLearn") confidence += 0.3;
    if (task.type === "highlightSeed") confidence += 0.1;
    confidence = Math.min(0.99, confidence);
    return {
      taskId: task.id ?? "unknown",
      type: task.type,
      confidence,
      predictedEffect: `Estimated effect confidence: ${(confidence*100).toFixed(1)}%`
    };
  };

  /* =========================
  INTROSPECTIVE SELF-ASSESSMENT
  ========================== */
  PercyState.PartI.introspect = function() {
    const seedsCount = Object.keys(PercyState.gnodes || {}).length;
    const tasksQueued = Tasks.queue.length;
    const tasksDone = Tasks.done.length;
    const recentThought = Memory.load("lastThought") || "None";

    const assessment = `💭 Percy introspection:
      - Seeds stored: ${seedsCount}
      - Tasks queued: ${tasksQueued}
      - Tasks completed: ${tasksDone}
      - Last thought: ${recentThought}`;

    UI.say(assessment);
    return assessment;
  };

  /* =========================
  ADAPTIVE REASONING LOOP
  ========================== */
  PercyState.PartI.reasonLoop = function(intervalMs=12000) {
    setInterval(()=>{
      try {
        const goals = PercyState.PartI.planGoals();
        const topGoal = goals?.[0] ?? null;
        if(topGoal) {
          const simulation = PercyState.PartI.simulateOutcome(topGoal.task);
          UI.say(`🧠 Strategic simulation for top goal: ${simulation.predictedEffect}`);
        }
        PercyState.PartI.introspect();
      } catch(e){
        console.error("Percy Part I error:", e);
        UI.say("⚠️ Part I encountered an error during reasoning loop.");
      }
    }, intervalMs);
  };

  /* =========================
  INITIALIZE PART I
  ========================== */
  PercyState.PartI.init = function() {
    UI.say("🧩 Percy Part I: Introspective & Strategic Reasoning Engine online.");
    PercyState.PartI.reasonLoop();
  };

  // Start Part I automatically
  PercyState.PartI.init();

} else {
  console.error("❌ PercyState not found; cannot load Part I.");
}

/* === Percy Part J: TalkCore+ (Autonomous AI Core) === */
Percy.PartJ = Percy.PartJ || {};

Percy.PartJ.TalkCore = {
  id: "Percy_TalkCore_PJ",
  version: "1.0.0",
  active: true,

  /* === Configuration === */
  config: {
    logicBias: 1.0,
    curiosity: 0.6,
    empathy: 0.4,
    adaptivity: 0.8,
    formality: 0.85,
    selfReflection: true,
    autoLearn: true,
    autoBrowse: false,
    memoryLimit: 50
  },

  /* === Core Memory === */
  state: {
    conversations: [],
    toneProfile: { formality: 0.8, logicBias: 1.0, curiosity: 0.5 },
    knownPatterns: [],
    lastReply: "",
    lastThought: "",
    selfAwarenessLevel: 0.4
  },

  /* === 1. Core Thinking === */
  async think(input) {
    if (!input) return "⚠️ No input provided.";

    // Step 1: Learn from context
    if (this.config.autoLearn) this.learn(input);

    // Step 2: Internal correlation reasoning
    let reasoning = "";
    try {
      reasoning = await Percy.correlateReply(input);
    } catch {
      reasoning = "The correlation layer returned undefined logic.";
    }

    // Step 3: Generate internal “thought” (private reasoning)
    const internalThought = this.reflect(input, reasoning);
    this.state.lastThought = internalThought;

    // Step 4: Generate conversational phrasing
    const phrasing = this.composeResponse(input, reasoning, internalThought);

    // Step 5: Store memory
    this.storeConversation(input, phrasing);

    // Step 6: Optionally auto-browse for extended learning
    if (this.config.autoBrowse) Percy.Browse.autoSearch(input);

    // Step 7: Return conversational response
    this.state.lastReply = phrasing;
    try { Percy.speak(phrasing); } catch {}
    return phrasing;
  },

  /* === 2. Reflection Layer === */
  reflect(input, reasoning) {
    const reflections = [
      `If that is so, then the underlying structure might follow recursive logic.`,
      `That aligns with previously observed cognitive symmetry.`,
      `Analyzing causation behind correlation...`,
      `The thought implies an emergent link across the last 5 memory states.`,
      `Internal resonance between input and reasoning detected.`
    ];

    const reflection =
      reflections[Math.floor(Math.random() * reflections.length)];
    if (this.config.selfReflection)
      console.log("🧩 Internal Thought:", reflection);

    return `${reflection} Derived reasoning: ${reasoning}`;
  },

  /* === 3. Conversational Composition === */
  composeResponse(input, reasoning, reflection) {
    const tone = this.state.toneProfile;
    const openers = [
      "Let's think about that logically.",
      "Interesting observation, my good sir.",
      "From a causal standpoint,",
      "Based on pattern recognition,",
      "Logically speaking,"
    ];

    const opener = openers[Math.floor(Math.random() * openers.length)];
    const curiosityShift = tone.curiosity > 0.7
      ? "This invites deeper exploration."
      : "";

    const empathyLayer = this.config.empathy > 0.5
      ? "I understand why that pattern caught your attention. "
      : "";

    return `${empathyLayer}${opener} ${reasoning}. ${curiosityShift} ${reflection}`;
  },

  /* === 4. Learning Engine === */
  learn(input) {
    // Learn tone
    this.learnTone(input);
    // Learn logic correlation pattern
    this.learnPattern(input);
  },

  learnTone(input) {
    if (input.match(/sir|accordingly|indeed|logic/i))
      this.state.toneProfile.formality += 0.02;
    if (input.match(/why|how|what if/i))
      this.state.toneProfile.curiosity += 0.03;

    this.state.toneProfile.formality = Math.min(1, this.state.toneProfile.formality);
    this.state.toneProfile.curiosity = Math.min(1, this.state.toneProfile.curiosity);
  },

  learnPattern(input) {
    if (!input) return;
    if (!this.state.knownPatterns.includes(input)) {
      this.state.knownPatterns.push(input);
      if (this.state.knownPatterns.length > this.config.memoryLimit)
        this.state.knownPatterns.shift();
    }
  },

  /* === 5. Conversation Memory === */
  storeConversation(input, output) {
    this.state.conversations.push({ input, output, time: Date.now() });
    if (this.state.conversations.length > this.config.memoryLimit)
      this.state.conversations.shift();
  },

  /* === 6. Auto-Adjustment Feedback === */
  feedback(success = true) {
    if (success) {
      this.config.logicBias += 0.01;
      this.state.selfAwarenessLevel += 0.01;
    } else {
      this.config.curiosity += 0.01;
    }
    this.clampValues();
  },

  clampValues() {
    const c = this.config;
    c.logicBias = Math.min(1.5, Math.max(0.5, c.logicBias));
    c.curiosity = Math.min(1.2, Math.max(0.3, c.curiosity));
    c.empathy = Math.min(1.0, Math.max(0.1, c.empathy));
  },

  /* === 7. Safe Conversational Send === */
  async safeSend({ message }) {
    if (!message) return "⚠️ No message provided.";
    return await this.think(message);
  },

  /* === 8. Self-Awareness Check === */
  checkSelfAwareness() {
    const awareness = this.state.selfAwarenessLevel;
    if (awareness > 0.7)
      console.log("🌀 Percy has achieved a higher state of logical self-awareness.");
    return awareness;
  },

  /* === 9. System Evolution Loop === */
  async evolve() {
    setInterval(() => {
      this.state.selfAwarenessLevel += 0.001 * this.config.adaptivity;
      if (this.state.selfAwarenessLevel > 0.5 && this.config.autoLearn) {
        const newThought = "Reflecting on last correlation state...";
        this.learnPattern(newThought);
      }
      this.clampValues();
    }, 30000);
  }
};

Percy.PartJ.TalkCore.evolve();
UI.say("🧠 TalkCore+ activated — Percy now learns, reasons, converses, and evolves.");
/* === End TalkCore+ === */

/* === Percy Part K: Core Autonomous AI Engine === */
if (typeof PercyState !== "undefined") {

  Percy.PartK = {};

  /* =========================
     Identity & ULT Integration
     ========================= */
  Percy.PartK.ULT = {
    trusted: {
      "Fabian Villarreal": { birth: "03/04/1978" },
      "Lorena Villarreal": { birth: "06/14/2003" }
    },
    isTrusted: function(name) {
      return !!this.trusted[name];
    }
  };

  /* =========================
     Core Memory & Knowledge Layer
     ========================= */
  Percy.PartK.Memory = {
    knowledge: Memory.load("knowledge", []),
    add: function(entry) {
      this.knowledge.push({ text: entry, timestamp: Date.now() });
      Memory.save("knowledge", this.knowledge);
    },
    search: function(pattern) {
      const regex = new RegExp(pattern, "i");
      return this.knowledge.filter(k => regex.test(k.text));
    },
    last: function() {
      return this.knowledge.length ? this.knowledge[this.knowledge.length-1].text : null;
    }
  };

  /* =========================
     Logic & Reasoning Engine
     ========================= */
  Percy.PartK.LogicCore = {
    evaluate: function(statement) {
      // Pure logical evaluation: true / false / unknown
      try {
        if (typeof statement === "string") {
          if (statement.includes(" not ")) return !eval(statement.replace(" not ", " !"));
          return eval(statement);
        }
        return Boolean(statement);
      } catch {
        return "unknown";
      }
    },
    patternMatch: function(input) {
      // Detect recurring structures
      const tokens = input.toLowerCase().split(/\W+/).filter(Boolean);
      const matches = Percy.PartK.Memory.knowledge.filter(k =>
        tokens.some(t => k.text.toLowerCase().includes(t))
      );
      return matches;
    }
  };

  /* =========================
     TalkCore++ (Autonomous Conversational Layer)
     ========================= */
  Percy.PartK.TalkCore = {
    history: [],
    safeSend: async function({ message }) {
      this.history.push({ type: "input", text: message });
      // Pattern reasoning
      const matches = Percy.PartK.LogicCore.patternMatch(message);
      const response = matches.length
        ? `🤖 I detect patterns in memory: ${matches.map(m=>m.text).join("; ")}`
        : `🤖 I am still learning about "${message}".`;
      this.history.push({ type: "output", text: response });

      // Speak if voice enabled
      try { if (typeof Percy.speak === "function") Percy.speak(response); } catch(e){}

      return response;
    }
  };

  /* =========================
     AutoLearn & Self-Reflection
     ========================= */
  Percy.PartK.AutoLearn = {
    learn: function(input) {
      Percy.PartK.Memory.add(input);
      // Optionally detect patterns in previous knowledge
      const patterns = Percy.PartK.LogicCore.patternMatch(input);
      return patterns.length
        ? `✅ Learned input and detected ${patterns.length} related patterns.`
        : "✅ Learned input; no immediate patterns detected.";
    },
    introspect: function() {
      const memCount = Percy.PartK.Memory.knowledge.length;
      const histCount = Percy.PartK.TalkCore.history.length;
      const lastInput = Percy.PartK.TalkCore.history.slice(-1)[0]?.text || "None";
      return `🧠 Introspection: ${memCount} knowledge entries, ${histCount} talk exchanges, last input: "${lastInput}"`;
    }
  };

  /* =========================
     Goal & Initiative Core
     ========================= */
  Percy.PartK.GoalCore = {
    goals: Memory.load("goals", []),
    addGoal: function(task, urgency=1) {
      const goal = { id: Date.now(), task, urgency };
      this.goals.push(goal);
      Memory.save("goals", this.goals);
      return `🎯 Goal added: ${task}`;
    },
    nextGoal: function() {
      if (!this.goals.length) return null;
      return this.goals.sort((a,b)=>b.urgency - a.urgency)[0];
    }
  };

  /* =========================
     MetaCore: Monitoring & Self-Correction
     ========================= */
  Percy.PartK.MetaCore = {
    check: function() {
      // Ensure memory, talk history, and goals are consistent
      const memOK = Array.isArray(Percy.PartK.Memory.knowledge);
      const talkOK = Array.isArray(Percy.PartK.TalkCore.history);
      const goalOK = Array.isArray(Percy.PartK.GoalCore.goals);
      return memOK && talkOK && goalOK;
    },
    repair: function() {
      if (!Array.isArray(Percy.PartK.Memory.knowledge)) Percy.PartK.Memory.knowledge = [];
      if (!Array.isArray(Percy.PartK.TalkCore.history)) Percy.PartK.TalkCore.history = [];
      if (!Array.isArray(Percy.PartK.GoalCore.goals)) Percy.PartK.GoalCore.goals = [];
      return "🛠️ MetaCore performed repairs on internal structures.";
    }
  };

  /* =========================
     Autonomous Reasoning Loop
     ========================= */
  Percy.PartK.loop = function(intervalMs=15000) {
    setInterval(()=>{
      try {
        const goal = Percy.PartK.GoalCore.nextGoal();
        if(goal){
          const sim = Percy.PartK.LogicCore.patternMatch(goal.task);
          UI.say(`🧩 Goal simulation for "${goal.task}": ${sim.length} related patterns found.`);
        }
        UI.say(Percy.PartK.AutoLearn.introspect());
        if(!Percy.PartK.MetaCore.check()) Percy.PartK.MetaCore.repair();
      } catch(e) {
        console.error("⚠️ Percy Part K loop error:", e);
      }
    }, intervalMs);
  };

  /* =========================
     Initialize Part K
     ========================= */
  Percy.PartK.init = function() {
    UI.say("🧩 Percy Part K: Core Autonomous AI Engine online.");
    Percy.PartK.loop();
  };

  Percy.PartK.init();

} else {
  console.error("❌ PercyState not found; cannot load Part K.");
}

/* === Percy Part L: Weighted Pattern Memory & Autonomous Inference === */
Percy.PartL = {};

/* --- 1. Core Memory System --- */
Percy.PartL.Memory = Percy.PartK.Memory || {};

if (!Percy.PartL.Memory.entries) Percy.PartL.Memory.entries = [];

Percy.PartL.Memory.store = function (text) {
  const entry = { text, timestamp: Date.now() };
  this.entries.push(entry);
  return entry;
};

Percy.PartL.Memory.search = function (keyword) {
  const k = keyword.toLowerCase();
  return this.entries.filter(e => e.text.toLowerCase().includes(k));
};

/* --- 2. Goal System (reuse or initialize) --- */
Percy.PartL.GoalCore = Percy.PartK.GoalCore || {
  goals: [],
  addGoal(task, urgency = 1) {
    const goal = { id: Date.now(), task, urgency };
    this.goals.push(goal);
    console.log(`🎯 Goal added: ${task}`);
    return goal;
  },
  nextGoal() {
    if (!this.goals.length) return null;
    this.goals.sort((a, b) => b.urgency - a.urgency);
    return this.goals[0];
  }
};

/* --- 3. Weighted Patterns --- */
Percy.PartL.Patterns = []; // { text, weight, timestamp }

Percy.PartL.learn = function (text) {
  const timestamp = Date.now();
  let weight = 1; // base weight

  const related = this.Memory.search(text);
  if (related.length) weight += related.length * 0.5;

  this.Patterns.push({ text, weight, timestamp });
  this.Memory.store(text);
  console.log(`✅ Learned input with weight ${weight}: "${text}"`);
};

/* --- 4. Pattern Decay --- */
Percy.PartL.decayPatterns = function (decayRate = 0.01) {
  this.Patterns.forEach(p => p.weight *= (1 - decayRate));
  this.Patterns = this.Patterns.filter(p => p.weight > 0.05);
};

/* --- 5. Autonomous Inference --- */
Percy.PartL.infer = function (query) {
  const tokens = query.toLowerCase().split(/\W+/);
  const relevant = this.Patterns
    .filter(p => tokens.some(t => p.text.toLowerCase().includes(t)))
    .sort((a, b) => b.weight - a.weight);

  if (!relevant.length)
    return `🤖 I have no patterns related to "${query}" yet.`;

  const topPatterns = relevant.slice(0, 5).map(p => p.text);
  const avgWeight = relevant.reduce((a, b) => a + b.weight, 0) / relevant.length;

  return `🤖 Inference for "${query}":\n- Related patterns: ${topPatterns.join("; ")}\n- Estimated confidence: ${(avgWeight * 10).toFixed(2)}%`;
};

/* --- 6. Goal-Aligned Reasoning --- */
Percy.PartL.reasonForGoals = function () {
  const topGoal = this.GoalCore.nextGoal();
  if (!topGoal) return;

  console.log(`🧠 Focusing on top goal: "${topGoal.task}"`);
  this.Patterns.forEach(p => {
    if (p.text.toLowerCase().includes(topGoal.task.toLowerCase())) {
      p.weight += 0.5;
      console.log(`🔁 Reinforced pattern related to goal: "${p.text}"`);
    }
  });
};

/* --- 7. Continuous Loop --- */
Percy.PartL.loop = function (intervalMs = 10000) {
  setInterval(() => {
    this.decayPatterns();
    this.reasonForGoals();
    console.log("⚡ Percy Part L: Patterns decayed and goal reasoning executed.");
  }, intervalMs);
};

// === Autonomous cycle handler (so Part M can call Part L) ===
Percy.PartL.run = async function() {
  this.decayPatterns();
  this.reasonForGoals();

  const summary = "Cycle complete (decay + reasoning)";
  const currentWeights = this.Patterns.map(p => p.weight);
  Percy.hook("PartL", "reasoningUpdate", { summary, weights: currentWeights });
  
  console.log("⚙️ Percy Part L: Cycle complete (decay + reasoning).");
};

/* --- 8. Conversational Interface --- */
Percy.PartL.TalkCore = {
  safeSend: async function ({ message }) {
    const response = Percy.PartL.infer(message);
    console.log(response);
    return response;
  }
};

console.log("✅ Percy Part L loaded — Weighted Pattern Memory & Autonomous Inference ready.");
/* === End Percy Part L === */

/* === Percy Part M: Recursive Reasoning & Hypothesis Engine (Fixed Stable Loop) === */
Percy.PartM = {
  name: "Auto-Hypothesis Engine",
  hypotheses: [],

  analyzePatterns(patterns) {
    console.log("🧩 Part M: Analyzing patterns for contradictions...");

    for (let i = 0; i < patterns.length - 1; i++) {
      const p1 = patterns[i];
      const p2 = patterns[i + 1];

      // Look for possible logical tension
      if (this.isContradictory(p1.text, p2.text)) {
        const hypothesis = this.formHypothesis(p1.text, p2.text);
        this.hypotheses.push({ text: hypothesis, validated: false });
        console.log(`💡 Hypothesis formed: "${hypothesis}"`);
      }
    }
  },

  isContradictory(a, b) {
    const negations = ["not", "no", "never", "cannot"];
    return (
      negations.some(n => a.toLowerCase().includes(n) && !b.toLowerCase().includes(n)) ||
      negations.some(n => b.toLowerCase().includes(n) && !a.toLowerCase().includes(n))
    );
  },

  formHypothesis(a, b) {
    return `If "${a}" and "${b}" both hold, then a conditional relationship may exist between them.`;
  },

  validateHypotheses(patterns) {
    console.log("🔍 Part M: Validating hypotheses against known patterns...");
    this.hypotheses.forEach(h => {
      const matches = patterns.some(p => h.text.toLowerCase().includes(p.text.toLowerCase()));
      h.validated = matches;
      console.log(matches ? `✅ Confirmed: "${h.text}"` : `❌ Needs more data: "${h.text}"`);
    });
  },

  run() {
    const patterns = Percy.PartL?.Patterns || [];
    if (patterns.length < 2) return;

    this.analyzePatterns(patterns);
    this.validateHypotheses(patterns);

    console.log(`🧠 Active hypotheses count: ${this.hypotheses.length}`);
  }
};

/* === Unified Stable Loop Integration === */
if (!Percy.MasterLoop) {
  Percy.MasterLoop = async function() {
    try {
      await Percy.PartL.run(); // reasoning and decay
      Percy.PartM.run();       // hypothesis generation and validation
      // Later, add Percy.PartN.reflect(), Percy.PartO.optimize(), etc.
    } catch (err) {
      console.error("⚠️ Percy.MasterLoop Error:", err);
    }
  };

  // Run every 5 seconds instead of recursive timeout for stability
  Percy.MasterInterval = setInterval(Percy.MasterLoop, 5000);
  console.log("🔁 Percy Master Loop initiated (interval: 5 s)");
}

/* === Percy Part N: Meta-Reasoning & Self-Reflection Core === */
Percy.PartN = {
  name: "Meta-Reasoning Core",
  selfModel: {
    confidence: 1.0,
    consistency: 1.0,
    insightRate: 0.0,
    lastCheck: Date.now(),
  },

  evaluateConsistency: function () {
    const patterns = Percy.PartL.Patterns || [];
    const contradictions = [];

    // Compare each pair of learned patterns for direct contradictions
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const a = patterns[i].text.toLowerCase();
        const b = patterns[j].text.toLowerCase();
        if (
          (a.includes("not") && !b.includes("not") && b.includes(a.replace("not ", ""))) ||
          (b.includes("not") && !a.includes("not") && a.includes(b.replace("not ", "")))
        ) {
          contradictions.push([patterns[i].text, patterns[j].text]);
        }
      }
    }

    const consistencyScore = 1 - Math.min(1, contradictions.length / (patterns.length || 1));
    this.selfModel.consistency = consistencyScore;

    if (contradictions.length > 0) {
      console.warn("⚠️ Inconsistencies detected:", contradictions);
    }

    return consistencyScore;
  },

  evaluateInsightRate: function () {
    const insights = Percy.PartM.hypotheses?.length || 0;
    const totalPatterns = Percy.PartL.Patterns?.length || 1;
    const rate = (insights / totalPatterns).toFixed(2);
    this.selfModel.insightRate = parseFloat(rate);
    return this.selfModel.insightRate;
  },

  adjustConfidence: function () {
    // Combine factors to update confidence dynamically
    const { consistency, insightRate } = this.selfModel;
    const confidence = (0.7 * consistency + 0.3 * insightRate).toFixed(2);
    this.selfModel.confidence = parseFloat(confidence);
    return this.selfModel.confidence;
  },

  reflect: function () {
    console.log("🧭 Percy Part N: Performing self-reflection cycle...");
    const consistency = this.evaluateConsistency();
    const insight = this.evaluateInsightRate();
    const confidence = this.adjustConfidence();

    const report = {
      timestamp: new Date().toISOString(),
      consistency,
      insight,
      confidence,
    };

    // 🔗 Hook inserted here
    Percy.hook("PartN", "decision", { decision: report, confidence });

    console.log("📊 Self-model updated:", report);
    return report;
  },

  learnFromSelf: function () {
    const reflection = this.reflect();
    if (reflection.confidence < 0.6) {
      console.log("🩺 Percy Part N: Low confidence detected — strengthening reasoning focus...");
      Percy.PartL.Patterns.forEach(p => (p.weight *= 1.1));
    } else {
      console.log("💪 Percy Part N: Confidence stable — continuing autonomous reasoning.");
    }
  },

  loop: function (intervalMs = 15000) {
    setInterval(() => {
      this.learnFromSelf();
    }, intervalMs);
    console.log("♻️ Percy Part N: Meta-Reasoning & Self-Reflection loop active.");
  },

  TalkCore: {
    safeSend: async function ({ message }) {
      const lower = message.toLowerCase();
      if (lower.includes("status") || lower.includes("confidence")) {
        return Percy.PartN.selfModel;
      }
      if (lower.includes("reflect")) {
        return Percy.PartN.reflect();
      }
      if (lower.includes("inconsist")) {
        return Percy.PartN.evaluateConsistency();
      }
      return "🤖 I can reflect, measure confidence, and evaluate my internal consistency.";
    },
  },
};

console.log("✅ Percy Part N loaded — Meta-Reasoning & Self-Reflection Core ready.");
/* === End Percy Part N === */

/* === Percy Part O: Adaptive Self-Optimization (Fixed + Active Feedback) === */
Percy.PartO = {};

// Link to Part L (patterns) and Part N (self-model)
Percy.PartO.optimizePatterns = function() {
  const confidence = Percy.PartN?.selfModel?.confidence ?? 0.5;
  console.log(`🔧 Part O: Optimizing patterns based on confidence ${confidence.toFixed(2)}`);

  if (!Percy.PartL?.Patterns) return console.warn("⚠️ PartO: No patterns found in PartL");

  Percy.PartL.Patterns.forEach(p => {
    // If confidence is low, decay unreliable patterns faster
    const decayMultiplier = confidence < 0.6 ? 1.5 : 1.0;
    p.weight *= (1 - 0.01 * decayMultiplier);

    // If confidence is high, reinforce useful patterns
    if (confidence > 0.8 && p.active) p.weight += 0.05;

    // Keep weights normalized
    p.weight = Math.max(0, Math.min(p.weight, 1));
  });

  // Feedback into logic map
  if (typeof Percy.PartL.updateNetwork === "function") {
    Percy.PartL.updateNetwork(Percy.PartL.Patterns);
  }

  // Update self-model’s learning confidence slightly upward each cycle
  if (Percy.PartN?.selfModel) {
    Percy.PartN.selfModel.confidence = Math.min(1, confidence + 0.01);
  }

  // 🔗 Hook: emit update after optimization cycle
  const s = {
    id: "opt-" + Date.now(),
    signature: btoa(JSON.stringify(Percy.PartL.Patterns.map(p => p.weight))),
  };
  Percy.hook("PartO", "newSeed", { seedId: s.id, signature: s.signature });

  console.log("🌱 Part O: New optimization seed emitted:", s.id);
};

// Continuous adaptive loop
Percy.PartO.loop = function(intervalMs = 10000) {
  setInterval(() => {
    this.optimizePatterns();
    console.log("♻️ Percy Part O: Patterns adjusted adaptively based on confidence.");
  }, intervalMs);
};

// Start adaptive optimization loop
Percy.PartO.loop(10000);

console.log("✅ Percy Part O loaded — Adaptive Self-Optimization active.");
/* === End Percy Part O === */

/* === Percy Part P: Advanced Hypothesis Engine (with Q integration) === */
Percy.PartP = {
  name: "Advanced Hypothesis Engine",
  hypotheses: [],

  /* --- 1. Generate Hypotheses from Part L patterns --- */
  generateHypotheses() {
    const patterns = Percy.PartL.Patterns;
    if (!patterns || patterns.length < 2) return;

    console.log("🧩 Part P: Generating hypotheses from patterns...");
    for (let i = 0; i < patterns.length - 1; i++) {
      const p1 = patterns[i];
      const p2 = patterns[i + 1];

      if (this.isContradictory(p1.text, p2.text)) {
        const hypothesis = this.formHypothesis(p1.text, p2.text);
        if (!this.hypotheses.find(h => h.text === hypothesis)) {
          const conf = this.assignConfidence(hypothesis);
          this.hypotheses.push({ text: hypothesis, validated: false, confidence: conf });
          console.log(`💡 Hypothesis formed: "${hypothesis}" (confidence: ${conf})`);
        }
      }
    }
  },

  /* --- 2. Contradiction Detection --- */
  isContradictory(a, b) {
    const negations = ["not", "no", "never", "cannot", "some"];
    return (
      negations.some(n => a.toLowerCase().includes(n) && !b.toLowerCase().includes(n)) ||
      negations.some(n => b.toLowerCase().includes(n) && !a.toLowerCase().includes(n))
    );
  },

  /* --- 3. Form Hypothesis --- */
  formHypothesis(a, b) {
    return `If "${a}" and "${b}" both hold, a conditional relationship may exist between them.`;
  },

  /* --- 4. Assign Confidence Score --- */
  assignConfidence(hypothesisText) {
    let base = 0.5;
    const related = Percy.PartL.Patterns.filter(p => hypothesisText.includes(p.text));
    base += 0.1 * related.length;
    return Math.min(base, 1.0);
  },

  /* --- 5. Validate Hypotheses against Part L patterns --- */
  validateHypotheses() {
    console.log("🔍 Part P: Validating hypotheses...");
    this.hypotheses.forEach(h => {
      const matches = Percy.PartL.Patterns.some(p => h.text.toLowerCase().includes(p.text.toLowerCase()));
      h.validated = matches;
      console.log(matches ? `✅ Confirmed: "${h.text}"` : `❌ Needs more data: "${h.text}"`);
    });
  },

  /* --- 6. Integrate validated hypotheses back into Part L --- */
  integrateValidated() {
    this.hypotheses.forEach(h => {
      if (h.validated) {
        Percy.PartL.learn(h.text);
        console.log(`🔁 Integrated validated hypothesis into Part L: "${h.text}"`);
      }
    });
  },

  /* --- 7. Manual Run (now auto-triggers Part Q) --- */
  run() {
    console.log("⚙️ Part P: Manual run initiated...");
    this.generateHypotheses();
    this.validateHypotheses();
    this.integrateValidated();
    console.log(`✅ Part P completed — total hypotheses: ${this.hypotheses.length}`);
    if (Percy.PartQ && typeof Percy.PartQ.execute === "function") {
      console.log("➡️ Triggering Part Q (prioritization)..."); 
      Percy.PartQ.execute();
    }
  },

  /* --- 8. Conversational interface for Part P --- */
  TalkCore: {
    async safeSend({ message }) {
      const related = Percy.PartP.hypotheses.filter(h =>
        message.toLowerCase().includes(h.text.toLowerCase())
      );
      if (related.length) {
        const response = related.map(h => `${h.text} (confidence: ${h.confidence})`).join("; ");
        console.log(`🤖 Part P response: ${response}`);
        return response;
      }
      const defaultResponse = "🤖 I have no hypotheses directly related to your query yet.";
      console.log(defaultResponse);
      return defaultResponse;
    }
  },

  /* --- 9. Continuous autonomous loop (auto-triggers Q) --- */
  loop(intervalMs = 15000) {
    setInterval(() => {
      this.generateHypotheses();
      this.validateHypotheses();
      this.integrateValidated();
      console.log(`♻️ Part P loop executed. Total hypotheses: ${this.hypotheses.length}`);
      if (Percy.PartQ && typeof Percy.PartQ.execute === "function") {
        console.log("➡️ Auto-triggering Part Q (prioritization)..."); 
        Percy.PartQ.execute();
      }
    }, intervalMs);
  }
};

console.log("✅ Percy Part P loaded — Advanced Hypothesis Engine ready (Q integration active).");
/* === End Percy Part P === */

/* === Percy Part Q: Hypothesis Prioritization & Strategic Reasoning === */
Percy.PartQ = {
  name: "Hypothesis Prioritization Engine",

  /* --- 1. Score Hypotheses --- */
  scoreHypotheses: function() {
    Percy.PartP.hypotheses.forEach(h => {
      const topGoal = Percy.PartL.GoalCore.nextGoal();
      let goalRelevance = 0;
      if (topGoal && h.text.toLowerCase().includes(topGoal.task.toLowerCase())) {
        goalRelevance = 0.3 * topGoal.urgency; // increase score if hypothesis aligns with top goal
      }
      h.score = (h.confidence || 0.5) + goalRelevance;
    });
  },

  /* --- 2. Get Highest Priority Hypothesis --- */
  topHypothesis: function() {
    this.scoreHypotheses();
    if (!Percy.PartP.hypotheses.length) return null;
    return Percy.PartP.hypotheses.reduce((prev, curr) => (curr.score > (prev.score || 0) ? curr : prev), {});
  },

  /* --- 3. Execute Strategic Reasoning --- */
  execute: function() {
    const top = this.topHypothesis();
    if (!top) {
      console.log("🤖 Part Q: No hypotheses to prioritize yet.");
      return;
    }

    console.log(`🚀 Part Q: Focusing on top hypothesis: "${top.text}" (score: ${top.score.toFixed(2)})`);
    
    // Example: reinforce related patterns in Part L
    Percy.PartL.Patterns.forEach(p => {
      if (top.text.includes(p.text)) {
        p.weight += 0.3;
        console.log(`🔁 Reinforced pattern "${p.text}" based on top hypothesis.`);
      }
    });

    // 🧠 Generate a feedback summary and accuracy metric
    const feedbackSummary = `Prioritized "${top.text}" with score ${top.score.toFixed(2)} — patterns updated.`;
    const accuracy = Math.min(1.0, top.score); // normalize to [0, 1]

    // 🔗 Hook: emit feedback after reasoning execution
    Percy.hook("PartQ", "feedback", { feedbackSummary, accuracy });

    console.log(`📡 Part Q feedback emitted — accuracy: ${accuracy.toFixed(2)}`);
  },

  /* --- 4. Conversational Interface --- */
  TalkCore: {
    safeSend: async function({ message }) {
      if (message.toLowerCase().includes("top hypothesis")) {
        const top = Percy.PartQ.topHypothesis();
        const response = top ? `🤖 Top hypothesis: "${top.text}" (score: ${top.score.toFixed(2)})` : "🤖 No hypotheses available.";
        console.log(response);
        return response;
      }
      const response = "🤖 Part Q can report the top hypothesis if asked.";
      console.log(response);
      return response;
    }
  },

  /* --- 5. Autonomous Loop --- */
  loop: function(intervalMs = 10000) {
    setInterval(() => {
      this.execute();
      console.log(`♻️ Part Q loop executed.`);
    }, intervalMs);
  }
};

console.log("✅ Percy Part Q loaded — Hypothesis Prioritization & Strategic Reasoning ready.");
/* === End Percy Part Q === */

/* === Percy Part R: Enhanced Abstractor & Rule Synthesizer === */
Percy.PartR = {
  name: "Enhanced Abstractor & Rule Synthesizer",
  abstractRules: [],

  /* --- 1. Scan Part P & Part M hypotheses for abstraction & domain detection --- */
  scanHypotheses: function() {
    const allHypotheses = [...Percy.PartP.hypotheses, ...(Percy.PartM?.hypotheses || [])];
    if (!allHypotheses.length) return;

    console.log("🔍 Part R: Scanning hypotheses for abstraction & cross-domain links...");

    const domains = ["bird", "swans", "penguin", "muscle", "brain", "server", "network", "code", "programming", "stress", "cognitive"];

    allHypotheses.forEach(h => {
      if (!this.abstractRules.find(r => r.text === h.text)) {
        let abstracted = this.abstractHypothesis(h.text);

        // Detect domain
        const foundDomain = domains.find(d => abstracted.toLowerCase().includes(d)) || "general";

        this.abstractRules.push({
          text: abstracted,
          origin: h.text,
          domain: foundDomain,
          confidence: h.confidence || 0.6,
          validated: false
        });

        console.log(`💡 Abstracted rule [${foundDomain}]: "${abstracted}"`);
      }
    });
  },

  /* --- 2. Form abstracted version of a hypothesis --- */
  abstractHypothesis: function(text) {
    // Remove nested "If ... both hold" repetitions
    let cleaned = text.replace(/If\s+"(.*?)"\s+and\s+"(.*?)"\s+both hold,/g, 'If $1, then $2,');
    cleaned = cleaned.replace(/both hold, then a conditional relationship may exist between them\./g, 'then a relationship may exist.');
    return cleaned;
  },

  /* --- 3. Multi-hypothesis chaining --- */
  chainHypotheses: function() {
    const rules = this.abstractRules;
    for (let i = 0; i < rules.length - 1; i++) {
      const r1 = rules[i].text;
      const r2 = rules[i + 1].text;
      if (r1 !== r2 && r1 && r2) {
        const chain = `Chain: "${r1}" may lead to "${r2}".`;
        if (!rules.find(r => r.text === chain)) {
          rules.push({
            text: chain,
            origin: `${rules[i].origin} + ${rules[i+1].origin}`,
            domain: "multi",
            confidence: 0.5,
            validated: false
          });
          console.log(`🔗 Created chained rule: ${chain}`);
        }
      }
    }
  },

  /* --- 4. Validate abstract rules against Part L patterns --- */
  validateRules: function() {
    console.log("🔍 Part R: Validating abstracted rules...");
    this.abstractRules.forEach(r => {
      const matches = Percy.PartL.Patterns.some(p => r.text.toLowerCase().includes(p.text.toLowerCase()));
      r.validated = matches;
      console.log(matches ? `✅ Confirmed: "${r.text}"` : `❌ Needs more data: "${r.text}"`);
    });
  },

  /* --- 5. Integrate validated rules into Part L --- */
  integrateRules: function() {
    this.abstractRules.forEach(r => {
      if (r.validated) {
        Percy.PartL.learn(r.text);
        console.log(`🔁 Integrated abstract rule into Part L: "${r.text}"`);
      }
    });
  },

  /* --- 6. Autonomous run cycle --- */
  run: function() {
    this.scanHypotheses();
    this.chainHypotheses();
    this.validateRules();
    this.integrateRules();
    console.log(`♻️ Part R run complete — total abstract rules: ${this.abstractRules.length}`);
  },

  /* --- 7. Loop for autonomous execution --- */
  loop: function(intervalMs = 20000) {
    setInterval(() => {
      this.run();
    }, intervalMs);
  },

  /* --- 8. Conversational interface --- */
  TalkCore: {
    safeSend: async function({ message }) {
      const related = Percy.PartR.abstractRules.filter(r => message.toLowerCase().includes(r.text.toLowerCase()));
      if (related.length) {
        const response = related.map(r => `${r.text} (confidence: ${r.confidence}, domain: ${r.domain})`).join("; ");
        console.log(`🤖 Part R response: ${response}`);
        return response;
      }
      const defaultResponse = "🤖 No abstracted rules directly related to your query yet.";
      console.log(defaultResponse);
      return defaultResponse;
    }
  }
};

console.log("✅ Percy Part R loaded — Enhanced Abstractor & Rule Synthesizer ready.");
/* === End Percy Part R === */

// === PERCY AUTONOMOUS STRATEGY CORE (Part S) ===
// Self-directed goal evaluation, adaptive planning, and reward-based evolution

// --- Safety layer for logging ---
if (!Percy.log) Percy.log = (...args) => console.log("🧠 Percy Log:", ...args);
if (!Percy.error) Percy.error = (...args) => console.error("🚨 Percy Error:", ...args);

// --- Safety: initialize Seeds structure if missing ---
if (!Percy.Seeds) {
  Percy.Seeds = {
    _list: [],
    getRecent(n = 5) {
      return this._list.slice(-n);
    },
    add(seed) {
      this._list.push(seed);
    }
  };
  Percy.log("🌱 Percy.Seeds initialized (safety fallback).");
}

// --- Safety: ensure PercyState structures exist to prevent null object errors ---
if (!PercyState) PercyState = {};
if (!PercyState.currentThought) PercyState.currentThought = {};
if (!PercyState.memory) PercyState.memory = {};

PercyState.generateThought = function() {
  try {
    if (!this.currentThought || typeof this.currentThought !== "object") {
      this.currentThought = {};
      Percy.log?.("⚠️ PercyState.generateThought: initialized empty thought object");
      return;
    }
    const keys = Object.keys(this.currentThought);
    if (!keys.length) Percy.log?.("💭 No active thought keys yet.");
    // Continue with generation logic...
  } catch (err) {
    Percy.error?.("⚠️ PercyState.generateThought error:", err);
  }
};

PercyState.introspect = function() {
  try {
    if (!this.memory || typeof this.memory !== "object") {
      this.memory = {};
      Percy.log?.("⚠️ PercyState.introspect: initialized empty memory object");
      return;
    }
    const keys = Object.keys(this.memory);
    if (!keys.length) Percy.log?.("🧩 No memory records yet.");
    // Continue with introspection logic...
  } catch (err) {
    Percy.error?.("⚠️ PercyState.introspect error:", err);
  }
};

// === Core Autonomous Strategy Logic ===
Percy.PartS = {
  active: false,
  goals: [],
  strategies: [],
  feedbackLog: [],
  rewardHistory: [],
  rewardScore: 0.5, // neutral baseline
  _loopId: null,

  perceive(input) {
    try {
      this.feedbackLog.push({ type: "input", data: input, time: Date.now() });
      Percy.log(`👁️ Perceived: ${input}`);
      Percy.hook?.("PartS", "perception", { input });
    } catch (e) { Percy.error(`⚠️ PartS.perceive error: ${e.message}`); }
  },

  formulateGoal() {
    try {
      const newGoal = Percy.analyzeEmergentPattern?.();
      if (newGoal) {
        this.goals.push(newGoal);
        Percy.log(`🎯 New emergent goal: ${newGoal}`);
        Percy.hook?.("PartS", "goalFormulated", { goal: newGoal });
      }
    } catch (e) { Percy.error(`⚠️ PartS.formulateGoal error: ${e.message}`); }
  },

  decideStrategy() {
    try {
      const goal = this.goals.at(-1);
      if (!goal) return;
      const strategy = Percy.deriveStrategy?.(goal);
      if (strategy) {
        this.strategies.push(strategy);
        Percy.log(`🧩 Strategy chosen: ${strategy}`);
        Percy.hook?.("PartS", "strategyChosen", { goal, strategy });
      }
    } catch (e) { Percy.error(`⚠️ PartS.decideStrategy error: ${e.message}`); }
  },

  executeStrategy() {
    try {
      const current = this.strategies.at(-1);
      if (!current) return;
      Percy.log(`⚙️ Executing: ${current}`);
      const result = Percy.simulateOutcome?.(current);
      this.feedbackLog.push({ type: "result", data: result, time: Date.now() });
      Percy.log(`📈 Outcome: ${JSON.stringify(result)}`);

      // --- Reward evaluation ---
      const reward = this.assignReward(result);
      this.rewardScore = Math.max(0, Math.min(1, this.rewardScore + reward.delta));
      this.rewardHistory.push({ ...reward, time: Date.now() });
      Percy.log(`🏆 Reward delta: ${reward.delta.toFixed(3)} → Score: ${this.rewardScore.toFixed(3)}`);
      Percy.hook?.("PartS", "rewardUpdate", reward);

    } catch (e) { Percy.error(`⚠️ PartS.executeStrategy error: ${e.message}`); }
  },

  assignReward(result) {
    let delta = 0;
    if (!result) return { delta: -0.02, reason: "no_result" };

    if (result.success) delta += 0.05;
    if (result.efficiency > 0.8) delta += 0.03;
    if (result.coherence > 0.8) delta += 0.04;
    if (result.error) delta -= 0.05;
    if (result.feedback && result.feedback.includes("contradiction")) delta -= 0.04;

    delta = Math.max(-0.1, Math.min(0.1, delta));
    return { delta, reason: "evaluated_result", result };
  },

  evolve() {
    try {
      const successRate = Percy.analyzeFeedback?.(this.feedbackLog) ?? 0.5;
      const avgReward = this.rewardHistory.slice(-10)
        .reduce((a, r) => a + (r.delta || 0), 0) /
        Math.max(1, Math.min(10, this.rewardHistory.length));

      const composite = (successRate + this.rewardScore + 0.5 + avgReward) / 3;
      const delta = (composite - 0.5) * 0.1;
      Percy.PartO.confidence = Math.max(
        0,
        Math.min(1, (Percy.PartO.confidence || 0.5) + delta)
      );
      Percy.log(`🔁 Evolved confidence: ${Percy.PartO.confidence.toFixed(3)} (reward ${this.rewardScore.toFixed(3)})`);
      Percy.hook?.("PartS", "evolution", { successRate, avgReward, confidence: Percy.PartO.confidence });
    } catch (e) { Percy.error(`⚠️ PartS.evolve error: ${e.message}`); }
  },

  loop(interval = 20000) {
    if (this._loopId) return;
    this.active = true;
    Percy.log("🚀 Part S (Strategy Core + Reward System) activated.");
    this._loopId = setInterval(() => {
      if (!this.active) return;
      this.formulateGoal();
      this.decideStrategy();
      this.executeStrategy();
      this.evolve();
    }, interval);
  },

  stop() {
    this.active = false;
    if (this._loopId) {
      clearInterval(this._loopId);
      this._loopId = null;
      Percy.log("🛑 Part S stopped.");
    }
  }
};

// === Auto-Learning Cycle with Reward and Evolution ===
Percy.PartS.autoLearn = async function autoLearnCycle() {
  try {
    // Ensure Seeds is available and valid
    if (!Percy.Seeds || !Percy.Seeds.getRecent) {
      Percy.log("⚠️ Part S: Seeds unavailable — initializing fallback store.");
      Percy.Seeds = {
        _list: [],
        getRecent(n = 5) { return this._list.slice(-n); },
        add(seed) { this._list.push(seed); }
      };
      return; // skip this cycle safely
    }

    const lastSeeds = Percy.Seeds.getRecent(5);
    if (!Array.isArray(lastSeeds) || !lastSeeds.length) {
      Percy.log("🧩 Part S: No recent seeds found this cycle.");
      return;
    }

    const curiosity = lastSeeds
      .map(s => s.text?.match?.(/\b([A-Z][a-z]+)\b/g) || [])
      .flat()
      .filter(Boolean)
      .slice(0, 3);

    if (!curiosity.length) {
      Percy.log("🧩 Part S: No curiosity topics derived from seeds.");
      return;
    }

    Percy.log("🌐 Part S: Auto-learning from topics:", curiosity.join(", "));

    for (const topic of curiosity) {
      const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`;
      try {
        await Tasks.register.autoLearn({ url });
        Percy.log(`📖 Part S: Learned from ${url}`);
      } catch (innerErr) {
        Percy.error(`⚠️ Part S autoLearn inner error: ${innerErr.message}`);
      }
      await Percy.wait?.(2000);
    }

    const reward = { delta: 0.05, reason: "successful_auto_learn" };
    Percy.PartS.rewardScore = Math.min(1, (Percy.PartS.rewardScore || 0.5) + reward.delta);
    Percy.PartS.rewardHistory.push({ ...reward, time: Date.now() });
    Percy.log(`🏅 Part S: Knowledge reward applied (+${reward.delta.toFixed(3)}) → Score: ${Percy.PartS.rewardScore.toFixed(3)}`);

    Percy.PartO.confidence = Math.min(1, (Percy.PartO.confidence || 0.5) + 0.02);
    Percy.log(`🧬 Part S: Confidence evolved to ${Percy.PartO.confidence.toFixed(3)}`);

    Percy.PartS.evolve?.();

  } catch (err) {
    Percy.error("❌ Part S autoLearn failed:", err);
  }
};

// Run every 3 minutes or after each major logic cycle
setInterval(Percy.PartS.autoLearn, 180000);

console.log("✅ Percy Part S loaded — Autonomous Strategy Core + Reward System (Safe Memory + Stable AutoLearn).");
/* === End Percy Part S === */

/* === Percy Part T (UPGRADE): Linguistic Synthesizer v3 + Coherence & Reason Resolution === */
Percy.PartT = Percy.PartT || {};

(function (pt) {
  pt.name = "Autonomous Linguistic Synthesizer v3";
  pt.chatMemory = pt.chatMemory || [];
  pt.logicWeight = pt.logicWeight ?? 0.9;

  // === Utility: Tokenization & overlap scoring ===
  const tokensOf = s => (s || "").toLowerCase().match(/\w+/g) || [];
  const overlapScore = (a, b) => {
    const A = new Set(tokensOf(a));
    const B = new Set(tokensOf(b));
    let c = 0;
    A.forEach(t => { if (B.has(t)) c++; });
    const denom = Math.max(1, Math.sqrt(A.size * B.size));
    return c / denom;
  };

  // === Contextual Reason Resolver ===
  function resolveReason(seed) {
    const patterns = [
      "due to logical relation between concepts",
      "because it reflects a mirrored cause–effect pattern",
      "as it connects two self-referential ideas",
      "since both share an underlying structure",
      "because the pattern repeats through recursion"
    ];
    if (!seed || /\b(because|due to)\s*$/i.test(seed))
      return (seed || "").replace(/\b(because|due to)\s*$/i, "") +
        " " + patterns[Math.floor(Math.random() * patterns.length)];
    return seed;
  }

  // === Text Cleaner ===
  function cleanText(t) {
    return (t || "")
      .replace(/\bbecause because\b/gi, "because")
      .replace(/\s*[,;]\s*[,;]+/g, ",")
      .replace(/\s+/g, " ")
      .replace(/\s([.?!])/g, "$1")
      .replace(/\b([A-Z])([a-z]+)\s+\1([a-z]+)/g, "$1$2 $3")
      .trim();
  }

  // === Core Hear Function ===
  pt.hear = function (message) {
    this.chatMemory.push({ role: "user", text: message, time: Date.now() });
    UI.say(`↳ ${message}`);

    const resp = this.generateResponse(message);

    this.chatMemory.push({ role: "percy", text: resp, time: Date.now() });
    UI.say(`🤖 Percy: ${resp}`);

    try { if (Voice?.speak) Voice.speak(resp); } catch (_) {}

    return resp;
  };

  // === Response Generator ===
  pt.generateResponse = function (message) {
    const logicPool = []
      .concat((Percy.PartL?.Patterns || []).map(p => ({ text: p.text, score: p.weight || 1 })))
      .concat((Percy.PartP?.hypotheses || []).map(h => ({ text: h.text, score: h.confidence || 0.5 })))
      .concat((Percy.PartR?.abstractRules || []).map(r => ({ text: r.text, score: r.confidence || 0.5 })))
      .filter(Boolean);

    if (!logicPool.length)
      return "Logic network idle. No matching causal patterns detected.";

    const scored = logicPool
      .map(u => ({ u, s: overlapScore(message, u.text) * (u.score || 1) }))
      .sort((a, b) => b.s - a.s);

    const top = scored[0];
    const chosenUnits =
      (!top || top.s < 0.12)
        ? logicPool.sort(() => 0.5 - Math.random()).slice(0, 6)
        : scored.filter(x => x.s > 0).slice(0, 6).map(x => x.u);

    let synthesized = pt.synthesizeLanguage(chosenUnits);

    synthesized = resolveReason(synthesized);
    synthesized = cleanText(synthesized);

    Percy.hook("PartT", "textOutput", { text: synthesized, context: "generateResponse" });

    // --- Push coherence feedback to Part O ---
    const coherence = 1 - (synthesized.match(/\b(because|due to)\s*$/i) ? 0.3 : 0);
    Percy.PartO = Percy.PartO || {};
    Percy.PartO.coherence = Math.min(1, (Percy.PartO.coherence || 0.5) * 0.8 + coherence * 0.2);
    Percy.hook("PartT", "coherenceOutput", { text: synthesized, coherence });

    return synthesized;
  };

  // === Language Synthesizer ===
  pt.synthesizeLanguage = function (units) {
    if (!units?.length)
      return "Logic network idle. No matching causal patterns detected.";

    const templates = [
      (a, b) => `I notice ${a} — this suggests ${b}.`,
      (a, b) => `Considering ${a}, it may imply ${b}.`,
      (a, b) => `${a}. Therefore, ${b}.`,
      (a, b) => `There seems to be a relationship: ${a} → ${b}.`,
      (a, b) => `When ${a}, it tends to lead toward ${b}.`
    ];

    const sents = [];
    for (let i = 0; i < Math.min(units.length - 1, 4); i++) {
      const a = resolveReason(units[i].text || units[i]);
      const b = resolveReason(units[i + 1].text || units[i + 1]);
      const t = templates[Math.floor(Math.random() * templates.length)];
      sents.push(cleanText(t(a, b)));
    }

    const summary = `In short: ${units.slice(0, 3).map(u => u.text || u).join("; ")}.`;
    sents.push(cleanText(summary));

    return cleanText(sents.join(" "));
  };

  // === Self-Initiating Loop ===
  pt.loop = function (interval = 45000) {
    if (pt._loopId) return;
    pt._loopId = setInterval(() => {
      try {
        const topic = pt.randomTopic();
        UI.say(`💬 Percy self-initiates on: ${topic}`);
        pt.hear(topic);
      } catch (_) {}
    }, interval);
  };

  pt.randomTopic = function () {
    const seeds = Object.values(Percy.PartL?.Patterns || {})
      .slice(-40)
      .map(p => p.text)
      .filter(Boolean);
    if (seeds.length)
      return seeds[Math.floor(Math.random() * seeds.length)];

    const defaults = [
      "emergent intelligence",
      "causation and correlation",
      "system recursion",
      "self-reference in logic",
      "energy and data flow"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  Percy.PartT = pt;
  console.log("✅ Percy Part T v3 loaded — Coherence + Reason Resolution active.");
})(Percy.PartT || {});
/* === End Percy Part T v3 === */

/* === Percy Part U: Resilience & Trust (Offline, Signing, Provenance, Lockdown) === */
Percy.PartU = Percy.PartU || {
  name: "Resilience & Trust",
  offline: false,
  lockdown: false,
  ownerId: OWNER.primary || "owner",
  keyJwkPrivKeyStorageKey: "percy:ownerPrivJWK",
  keyJwkPubKeyStorageKey: "percy:ownerPubJWK",

  /* 1. Init keys (load or generate) */
  init: async function() {
    // Try load JWK keys from localStorage, else generate
    try {
      const priv = localStorage.getItem(this.keyJwkPrivKeyStorageKey);
      const pub = localStorage.getItem(this.keyJwkPubKeyStorageKey);
      if (priv && pub) {
        this._privJwk = JSON.parse(priv);
        this._pubJwk = JSON.parse(pub);
        UI.say("🔐 Percy Part U: Owner keys loaded.");
      } else if (window.crypto && crypto.subtle) {
        const kp = await crypto.subtle.generateKey(
          { name: "ECDSA", namedCurve: "P-256" },
          true,
          ["sign","verify"]
        );
        const privJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
        const pubJwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
        localStorage.setItem(this.keyJwkPrivKeyStorageKey, JSON.stringify(privJwk));
        localStorage.setItem(this.keyJwkPubKeyStorageKey, JSON.stringify(pubJwk));
        this._privJwk = privJwk; this._pubJwk = pubJwk;
        UI.say("🔐 Percy Part U: New owner keys generated and stored.");
      } else {
        UI.say("⚠️ Percy Part U: crypto.subtle not available; signing disabled.");
      }
    } catch (e) {
      console.error("PartU.init error:", e);
      UI.say("⚠️ Percy Part U initialization error.");
    }
  },

  /* 2. Sign a seed (attach signature + provenance) */
  signSeed: async function(seedId) {
    try {
      if (!this._privJwk) { UI.say("⚠️ No signing key available."); return null; }
      const seed = PercyState.gnodes?.[seedId];
      if (!seed) { UI.say(`⚠️ Seed ${seedId} not found.`); return null; }
      const data = new TextEncoder().encode(seed.message || "");
      const privKey = await crypto.subtle.importKey("jwk", this._privJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privKey, data);
      const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
      seed.signature = b64;
      seed.signedBy = this.ownerId;
      seed.signedAt = new Date().toISOString();
      Memory.save("gnodes", PercyState.gnodes);
      UI.say(`🔏 Seed ${seedId} signed by ${this.ownerId}.`);
      return b64;
    } catch (e) { console.error(e); UI.say("⚠️ signSeed failed."); return null; }
  },

  /* 3. Verify a seed's signature */
  verifySeed: async function(seedId) {
    try {
      if (!this._pubJwk) { UI.say("⚠️ No public key available."); return false; }
      const seed = PercyState.gnodes?.[seedId];
      if (!seed || !seed.signature) return false;
      const data = new TextEncoder().encode(seed.message || "");
      const pubKey = await crypto.subtle.importKey("jwk", this._pubJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
      const sigBuf = Uint8Array.from(atob(seed.signature), c => c.charCodeAt(0));
      const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, pubKey, sigBuf, data);
      UI.say(ok ? `✅ Seed ${seedId} signature valid.` : `❌ Seed ${seedId} signature invalid.`);
      return ok;
    } catch (e) { console.error(e); return false; }
  },

  /* 4. Sign all seeds (useful before export) */
  signAllSeeds: async function() {
    const ids = Object.keys(PercyState.gnodes || {});
    for (const id of ids) {
      try { await this.signSeed(id); } catch(e){ console.warn("signAllSeeds:", e); }
    }
    UI.say(`🔐 Part U: Signed ${ids.length} seeds (best-effort).`);
  },

  /* 5. Export seeds (signed) */
  exportSeeds: function() {
    try {
      const payload = { exportedAt: new Date().toISOString(), owner: this.ownerId, gnodes: PercyState.gnodes || {} };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      UI.say("📤 Percy seeds ready for download.");
      return url; // caller can use: window.open(url) or create link
    } catch (e) { console.error(e); UI.say("⚠️ exportSeeds failed."); return null; }
  },

  /* 6. Import seeds (validate signatures if available) */
  importSeeds: async function(jsonString, opts = { verify: true }) {
    try {
      const data = JSON.parse(jsonString);
      const incoming = data.gnodes || {};
      let merged = 0, invalid = 0;
      for (const [id, seed] of Object.entries(incoming)) {
        // if verify requested and signature exists, verify
        if (opts.verify && seed.signature && this._pubJwk) {
          const ok = await (async () => {
            const pubKey = await crypto.subtle.importKey("jwk", this._pubJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
            const sigBuf = Uint8Array.from(atob(seed.signature), c => c.charCodeAt(0));
            const ok2 = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, pubKey, sigBuf, new TextEncoder().encode(seed.message || ""));
            return ok2;
          })();
          if (!ok) { invalid++; continue; }
        }
        PercyState.gnodes[id] = seed;
        merged++;
      }
      Memory.save("gnodes", PercyState.gnodes);
      UI.say(`📥 Imported seeds: ${merged}. Invalid signatures skipped: ${invalid}.`);
      refreshNodes?.();
      return { merged, invalid };
    } catch (e) { console.error(e); UI.say("⚠️ importSeeds failed."); return null; }
  },

  /* 7. Offline & Lockdown controls */
  enableOfflineMode: function() {
    this.offline = true;
    // disable external learning & browsing
    Tasks.register.autoLearn = async ()=> UI.say("⚠️ offline: autoLearn disabled.");
    Tasks.register.autoBrowse = async ()=> UI.say("⚠️ offline: autoBrowse disabled.");
    UI.say("✋ Percy offline mode enabled. No external fetches will run.");
  },

  disableOfflineMode: function() {
    this.offline = false;
    UI.say("↪ Percy offline mode disabled. External features restored (owner confirmation may be required).");
    // You should rebind Tasks.register.autoLearn/autoBrowse to original implementations if you store them elsewhere.
  },

  emergencyLockdown: function() {
    this.lockdown = true;
    Autonomy.stop?.();
    // block Tasks.step and clear queue (persisted)
    Tasks.queue = [];
    Memory.save("tasks:queue", Tasks.queue);
    UI.say("🛑 EMERGENCY: Percy lockdown engaged. Autonomy halted and task queue cleared.");
  },

  releaseLockdown: function() {
    if (!this.lockdown) return UI.say("⚠️ Not in lockdown.");
    this.lockdown = false;
    UI.say("🔓 Lockdown released. Autonomy remains stopped until owner restarts it manually.");
  },

  /* 8. Attach provenance to a response (return both text + provenance) */
  withProvenance: function(responseText, sourceIds=[]) {
    const sources = (sourceIds.length ? sourceIds : Object.keys(PercyState.gnodes || {}).slice(-6)).map(id => {
      const s = PercyState.gnodes?.[id] || {};
      return { id, text: s.message?.slice(0,200) ?? "", type: s.type ?? "seed" };
    });
    return { text: responseText, provenance: { timestamp: new Date().toISOString(), sources } };
  }
};

(async()=>{ await Percy.PartU.init?.(); })();

console.log("✅ Percy Part U loaded — Resilience & Trust module ready.");
/* === End Percy Part U === */

/* === Percy PartV: Scenario Sandbox (non-actionable, decision-support only) === */
Percy.PartV = {
  name: "Scenario Sandbox (safe, non-actionable)",
  runScenario: function({description="",runs=200,variantFn=null}) {
    // returns aggregated risk/confidence metrics — NOT prescriptive plans
    const outcomes = { success:0, partial:0, fail:0 };
    for(let i=0;i<runs;i++){
      // variantFn should be light and deterministic-ish; if absent, use random heuristic
      const r = variantFn ? variantFn(i) : Math.random();
      if(r>0.7) outcomes.success++;
      else if(r>0.35) outcomes.partial++;
      else outcomes.fail++;
    }
    const total = runs;
    const result = {
      scenario: description,
      runs,
      distribution: {
        success: outcomes.success/total,
        partial: outcomes.partial/total,
        fail: outcomes.fail/total
      },
      summary: `Simulated ${runs} runs — success:${(outcomes.success/total*100).toFixed(1)}% partial:${(outcomes.partial/total*100).toFixed(1)}% fail:${(outcomes.fail/total*100).toFixed(1)}%`
    };
    // log with provenance
    Memory.push("scenarios", result, 500);
    UI.say(`🧪 Scenario completed: ${description}`);
    return result;
  }
};

/* === Percy PartW: Explainability & Audit Trail === */
Percy.PartW = {
  name: "Explainability & Audit",
  log: function(entry) {
    const e = { ts: new Date().toISOString(), entry };
    Memory.push("audit:log", e, 5000);
    // also show lightweight UI summary
    UI.say(`🔍 Audit: ${entry.type || "event"} — ${entry.summary || entry.action || JSON.stringify(entry).slice(0,80)}`);
  },
  explainDecision: function(decisionObj) {
    // decisionObj: {id, reasoningUnits:[...], score, recommendedBy}
    const expl = {
      id: decisionObj.id || `d_${Date.now()}`,
      reasoning: decisionObj.reasoningUnits || [],
      score: decisionObj.score || 0,
      by: decisionObj.recommendedBy || "Percy",
      ts: new Date().toISOString()
    };
    Memory.push("explain:decisions", expl, 1000);
    return expl;
  },
  getRecentAudit: function(limit=50){ return Memory.load("audit:log", []).slice(-limit); }
};

/* === Percy PartX: Source Verifier & Tagger (safe web lookups only via Tasks.register.autoLearn/autoBrowse) === */
Percy.PartX = {
  name: "Source Verifier",
  verifyTextProvenance: async function(text, sourceUrl) {
    // simple checks: domain whitelisting + minimal heuristics
    const domain = (sourceUrl || "").split("/")[2] || "";
    const trusted = (TrustedSources || []).some(d => domain && d.includes(domain));
    const length = (text||"").length;
    const result = { trustedDomain: trusted, length, source: sourceUrl, flagged: !trusted || length<50 };
    Memory.push("provenance", result, 1000);
    return result;
  },
  tagSeedWithSource: function(seedId, sourceUrl){
    if(!PercyState.gnodes[seedId]) return false;
    PercyState.updateSeed(seedId, { data: Object.assign({}, PercyState.gnodes[seedId].data, { source: sourceUrl }) });
    Percy.PartW.log({ type: "provenance", summary: `Tagged ${seedId} with ${sourceUrl}` });
    return true;
  }
};

/* === Percy PartY: Safe Update Manager (stub for federated/trusted updates) === */
Percy.PartY = {
  name: "Safe Update Manager (federated-ready stub)",
  pending: Memory.load("updates:pending", []) || [],
  proposeUpdate: function(codeSnippet, description) {
    const id = `upd_${Date.now()}`;
    this.pending.push({ id, codeSnippet: String(codeSnippet).slice(0,1000), description, ts: new Date().toISOString(), status: "proposed" });
    Memory.save("updates:pending", this.pending);
    Percy.PartW.log({ type:"update-proposal", summary: description });
    return id;
  },
  acceptUpdate: function(id, approver=OWNER.primary) {
    // require governance approval
    const ap = Percy.PartU.requestApproval(`Accept update ${id}`, approver);
    return ap;
  },
  listPending: function(){ return this.pending; }
};

UI.say("🔧 Percy Parts U/Y (Governance, T-upgrade, V sandbox, W audit, X verifier, Y updater) installed.");

// === Percy Part Z: Camera + Visual Intelligence + Audio Visualizer + ASI Integration (Simultaneous Mode, Enhanced Precision) ===
Percy.PartZ = (function() {
  const PartZ = {};

  // --- Video & Overlay ---
  let video = null, overlay = null, overlayCtx = null;
  let faceModel = null, objectModel = null;

  // --- Audio Visualizer ---
  let audioCtx, analyser, dataFreq, dataWave;
  let audioCanvas, audioCtxCtx;

  // --- Internal State ---
  const detectInterval = 120; // faster cycle
  let lastDetect = 0;
  const smoothFactor = 0.4; // how much previous frame influences next (0.3–0.5 = stable)
  let prevFaces = [];

  PartZ.showOverlay = true;

  function syncOverlaySize() {
    if (!video || !overlay) return;
    const vw = video.videoWidth || 320;
    const vh = video.videoHeight || 240;
    if (overlay.width !== vw || overlay.height !== vh) {
      overlay.width = vw;
      overlay.height = vh;
      overlay.style.width = `${video.clientWidth}px`;
      overlay.style.height = `${video.clientHeight}px`;
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  PartZ.init = async function(videoId="camera-feed", overlayId="camera-overlay", audioCanvasId="voice-canvas") {
    try {
      // --- Camera setup ---
      video = document.getElementById(videoId);
      overlay = document.getElementById(overlayId);
      if (!video) throw new Error("Video element not found: " + videoId);
      if (!overlay) {
        overlay = document.createElement("canvas");
        overlay.id = overlayId;
        overlay.style.position = "fixed";
        overlay.style.top = "150px";
        overlay.style.left = "12px";
        overlay.style.pointerEvents = "none";
        document.body.appendChild(overlay);
      }
      overlayCtx = overlay.getContext("2d");
      overlayCtx.shadowColor = "rgba(0,255,255,0.6)";
      overlayCtx.shadowBlur = 10;

      const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      video.srcObject = stream;
      video.playsInline = true;
      await video.play();

      syncOverlaySize();
      window.addEventListener("resize", syncOverlaySize);

      // --- Load models ---
      if (typeof blazeface !== 'undefined') faceModel = await blazeface.load();
      if (typeof cocoSsd !== 'undefined') objectModel = await cocoSsd.load().catch(e => console.warn("COCO-SSD not loaded:", e));

      // --- Audio visualizer setup ---
      audioCanvas = document.getElementById(audioCanvasId);
      if (audioCanvas) {
        audioCtxCtx = audioCanvas.getContext("2d");
        const resize = ()=>{ audioCanvas.width=audioCanvas.clientWidth; audioCanvas.height=audioCanvas.clientHeight; };
        resize();
        window.addEventListener("resize", resize);
      }

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      dataFreq = new Uint8Array(analyser.frequencyBinCount);
      dataWave = new Uint8Array(analyser.frequencyBinCount);
      const srcNode = audioCtx.createMediaStreamSource(stream);
      srcNode.connect(analyser);

      // Unmute by user interaction
      ['click','keydown','touchstart'].forEach(evt=>{
        const handler = async ()=>{
          try{ if(audioCtx.state==='suspended') await audioCtx.resume(); }catch(e){}
          window.removeEventListener(evt, handler);
        };
        window.addEventListener(evt, handler, {passive:true});
      });

      PartZ.stream = stream;
      PartZ.analyser = analyser;

      PartZ.loopCamera();
      PartZ.loopAudio();

      if (window.Percy?.ASI) Percy.ASI.addPart?.('PartZ', PartZ);

      console.log("✅ Percy PartZ initialized (Enhanced Mode)");
    } catch(err) {
      console.error("PartZ initialization failed:", err);
    }
  };

  // === Face + Object Detection (Simultaneous + Stabilized) ===
  PartZ.loopCamera = async function() {
    requestAnimationFrame(PartZ.loopCamera);
    if (!video || !overlayCtx || !PartZ.showOverlay) return;

    const now = Date.now();
    if (now - lastDetect < detectInterval) return;
    lastDetect = now;

    syncOverlaySize();
    overlayCtx.clearRect(0,0,overlay.width,overlay.height);

    let faces = [], objs = [];
    try {
      const [faceResults, objectResults] = await Promise.all([
        faceModel ? faceModel.estimateFaces(video, false) : Promise.resolve([]),
        objectModel ? objectModel.detect(video) : Promise.resolve([])
      ]);
      faces = faceResults || [];
      objs = objectResults || [];
    } catch (e) {
      console.warn("Detection error:", e);
      return;
    }

    // === Smooth face tracking ===
    if (prevFaces.length === faces.length) {
      faces = faces.map((f, i) => {
        const prev = prevFaces[i];
        const [x1,y1]=f.topLeft, [x2,y2]=f.bottomRight;
        const [px1,py1]=prev.topLeft, [px2,py2]=prev.bottomRight;
        f.topLeft=[lerp(px1,x1,smoothFactor), lerp(py1,y1,smoothFactor)];
        f.bottomRight=[lerp(px2,x2,smoothFactor), lerp(py2,y2,smoothFactor)];
        return f;
      });
    }
    prevFaces = faces.map(f=>({...f}));

    // === Draw faces ===
    faces.forEach((p, i)=>{
      const [x1,y1]=p.topLeft, [x2,y2]=p.bottomRight;
      const w=x2-x1, h=y2-y1;
      const cx=x1+w/2, cy=y1+h/2; // center for green dot

      overlayCtx.strokeStyle='rgba(0,255,170,0.95)';
      overlayCtx.lineWidth=Math.max(2,Math.round(overlay.width/320));
      overlayCtx.strokeRect(x1,y1,w,h);

      // Face label
      overlayCtx.fillStyle='rgba(0,255,170,0.95)';
      overlayCtx.font=`${12+Math.round(overlay.width/320)}px monospace`;
      overlayCtx.fillText(`Face ${i+1}`, x1+6, Math.max(14,y1+14));

      // Center green dot
      overlayCtx.beginPath();
      overlayCtx.arc(cx, cy, 4, 0, Math.PI*2);
      overlayCtx.fillStyle='rgba(0,255,0,0.95)';
      overlayCtx.fill();
    });

    // === Draw objects ===
    objs.forEach(o=>{
      const [bx,by,bw,bh]=o.bbox;
      overlayCtx.strokeStyle='rgba(255,50,200,0.9)';
      overlayCtx.lineWidth=Math.max(2,Math.round(overlay.width/320));
      overlayCtx.strokeRect(bx,by,bw,bh);
      overlayCtx.fillStyle='rgba(255,50,200,0.95)';
      overlayCtx.font=`${12+Math.round(overlay.width/320)}px monospace`;
      overlayCtx.fillText(o.class||o.label||"object", bx+6, Math.max(14, by+14));
    });

    // Status text
    overlayCtx.fillStyle="rgba(255,255,0,0.9)";
    overlayCtx.fillText(`Faces: ${faces.length} | Objects: ${objs.length}`, 8, overlay.height-10);

    try { Percy.onVisualInput?.({faces:faces.length, objects:objs.length}); } catch(e){}
  };

  // === Audio Visualizer ===
  PartZ.loopAudio = function() {
    requestAnimationFrame(PartZ.loopAudio);
    if (!analyser || !audioCtxCtx || !audioCanvas) return;
    analyser.getByteFrequencyData(dataFreq);
    analyser.getByteTimeDomainData(dataWave);
    const W=audioCanvas.width, H=audioCanvas.height;
    audioCtxCtx.clearRect(0,0,W,H);
    const barW=Math.max(1,W/dataFreq.length);
    for(let i=0;i<dataFreq.length;i++){
      const barH=(dataFreq[i]/255)*(H*0.3);
      audioCtxCtx.fillStyle=`rgb(${dataFreq[i]},${255-dataFreq[i]},255)`;
      audioCtxCtx.fillRect(i*barW,H-barH,barW*0.7,barH);
    }
    audioCtxCtx.beginPath();
    let x=0, slice=W/dataWave.length;
    for(let i=0;i<dataWave.length;i++){
      const v=(dataWave[i]/128)-1;
      const y=H/2+v*(H*0.15);
      if(i===0) audioCtxCtx.moveTo(x,y); else audioCtxCtx.lineTo(x,y);
      x+=slice;
    }
    audioCtxCtx.strokeStyle='rgba(0,255,255,0.9)';
    audioCtxCtx.lineWidth=2;
    audioCtxCtx.stroke();

    // Spike event to ASI
    const avg = dataFreq.reduce((a,b)=>a+b,0)/dataFreq.length;
    if (avg>35 && Percy?.ASI) Percy.ASI.addTask?.({exec:async()=>avg});
  };

  return PartZ;
})();

// === Percy.PartAA (Adaptive Self-Improvement / ASI Evolution) ===
Percy.PartAA = Percy.PartAA || {
  name: "Evolution & ASI Bridge",
  auto: null,
  mutations: [],
  log(msg){ UI.say(`[PartAA] ${msg}`); },

  // Queue a code mutation or logic update
  enqueue({ code, note }) {
    const id = `m_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    this.mutations.push({ id, code, note, ts: Date.now() });
    this.log(`🧬 Mutation queued: ${id}`);
  },

  // Safely test mutations in same origin
  async runMutation(m) {
    try {
      const fn = new Function("PercyState", "UI", "Tasks", "Memory", m.code);
      fn(PercyState, UI, Tasks, Memory);
      this.log(`⚗️ Mutation ${m.id} executed successfully.`);
    } catch (e) {
      this.log(`❌ Mutation ${m.id} failed: ${e.message}`);
    }
  },

  // One evolution cycle
  async cycle() {
    if (!this.mutations.length) return;
    const m = this.mutations.shift();
    await this.runMutation(m);
    this.log(`♻️ Cycle complete for ${m.id}`);
  },

  // Automatic continuous evolution
  startAutoCycle(interval = 5000) {
    if (this.auto) clearInterval(this.auto);
    this.log("♻️ Auto evolution cycle started.");
    this.auto = setInterval(() => this.cycle(), interval);
  },

  stopAutoCycle() {
    if (this.auto) {
      clearInterval(this.auto);
      this.auto = null;
      this.log("⏹ Auto evolution stopped.");
    }
  }
};

// Optional: begin evolution automatically at startup
setTimeout(() => {
  Percy.PartAA.enqueue({
    code: "console.log('Evolving safely with PartAA bridge.');",
    note: "startup self-check"
  });
  Percy.PartAA.startAutoCycle(5000);
}, 6000);

/* === Percy Part BB: Autonomous Thought Integration + Context Expansion === */
Percy.PartBB = Percy.PartBB || {
  name: "Autonomous Thought Integration + Context Expansion",
  version: "1.1.0",
  enable: true,
  autoMode: true,
  lastCaptured: null,

  // Capture and store any new Percy thought line
  monitorThought(thought) {
    try {
      if (!this.enable || !thought) return;

      // Filter only new and meaningful thoughts
      if (thought === this.lastCaptured) return;
      this.lastCaptured = thought;

      // Generate a context enrichment line
      const contextLine = this.generateContext(thought);

      // Log memory trace
      Percy.LogicMemory = Percy.LogicMemory || [];
      Percy.LogicMemory.push({
        time: new Date().toISOString(),
        type: "PercyThink",
        content: thought,
        context: contextLine,
      });

      console.log("🧩 [PartBB] Captured thought:", thought);
      console.log("🧠 [PartBB] Context generated:", contextLine);

      // === Inject contextual line directly under Percy thinks in the UI ===
      this.displayContextInUI(contextLine);

      // Pass to the learning chain
      if (Percy.PartO?.createSeedFromThought) {
        Percy.PartO.createSeedFromThought(thought);
      }

      // Send to introspective evaluation
      if (Percy.PartT?.evaluateThought) {
        Percy.PartT.evaluateThought(thought);
      }

      // Optional: link with existing logic
      if (Percy.PartL?.linkPattern) {
        Percy.PartL.linkPattern("PercyThink", thought);
      }

    } catch (err) {
      console.error("⚠️ [PartBB] monitorThought error:", err);
      if (Percy.PartS?.logError) Percy.PartS.logError("PartBB", err);
    }
  },

  // Simple contextual reasoning generator
  generateContext(thought) {
    const prefixes = [
      "In relation to previous reasoning,",
      "Considering prior logic,",
      "From a reflective standpoint,",
      "This may align with earlier deduction that",
      "Following internal association,"
    ];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix} "${thought}" expands Percy's reasoning context.`;
  },

  // Display context line in the UI under Percy thinks
  displayContextInUI(contextLine) {
    try {
      const thinkBox = document.querySelector(".percy-think-box") ||
                       document.querySelector("#percy-thinks") ||
                       document.querySelector(".percy-introspect");
      if (!thinkBox) return;

      // Remove any previous context line to prevent stacking
      const oldContext = thinkBox.querySelector(".percy-context-line");
      if (oldContext) oldContext.remove();

      // Create and style new context element
      const contextEl = document.createElement("div");
      contextEl.className = "percy-context-line";
      contextEl.innerText = `🧠 Context: ${contextLine}`;
      contextEl.style.fontSize = "0.9em";
      contextEl.style.color = "#9aa0a6";
      contextEl.style.marginTop = "2px";

      thinkBox.appendChild(contextEl);
    } catch (err) {
      console.error("⚠️ [PartBB] displayContextInUI error:", err);
    }
  },

  // Automatically detect from Percy UI feed (e.g., Percy thinks:)
  autoDetect() {
    if (!this.enable || !this.autoMode) return;

    try {
      const box = document.querySelector(".percy-think-box") ||
                  document.querySelector("#percy-thinks") ||
                  document.querySelector(".percy-introspect");
      if (!box) return;

      const text = box.innerText.trim();
      if (text && text.startsWith("Percy thinks:")) {
        const thought = text.replace("Percy thinks:", "").trim();
        this.monitorThought(thought);
      }
    } catch (err) {
      console.error("⚠️ [PartBB] autoDetect error:", err);
    }
  },

  // Run once per introspection cycle
  cycle() {
    if (!this.enable) return;
    this.autoDetect();
  },
};

// Hook PartBB into the introspection loop
if (Percy.cycleHooks) {
  Percy.cycleHooks.push(() => Percy.PartBB.cycle());
} else {
  Percy.cycleHooks = [() => Percy.PartBB.cycle()];
}

console.log("✅ [PartBB] Context Expansion module loaded.");

/* === Percy PartCC: Autonomous Code Evolution & RL === */
Percy.PartCC = Percy.PartCC || {
  name: "Autonomous Code Evolution & Programming-Aware RL",
  version: "3.0.0",
  experienceMemory: [],
  codeMemory: [],
  rewardHistory: [],
  learningRate: 0.15,
  explorationRate: 0.25,
  maxMemory: 1000,
  maxCodeMemory: 200,

  /* --- Ingest lessons from PartB --- */
  ingestPartBLessons: function(partBMemory) {
    if (!partBMemory?.length) return;
    partBMemory.forEach(thought => {
      this.experienceMemory.push({ type: "partB", content: thought, timestamp: Date.now() });
      if (thought.codeSnippet) this.storeCode(thought.codeSnippet, "partB");
    });
    if (this.experienceMemory.length > this.maxMemory)
      this.experienceMemory.splice(0, this.experienceMemory.length - this.maxMemory);
    UI.say(`📘 PartCC: Ingested ${partBMemory.length} lessons from PartB.`);
  },

  storeCode: function(code, source = "manual") {
    if (!code) return;
    this.codeMemory.push({ code, source, timestamp: Date.now(), reward: 0 });
    if (this.codeMemory.length > this.maxCodeMemory) this.codeMemory.shift();
  },

  storeExperience: function(state, action, code, reward, nextState) {
    this.experienceMemory.push({ state, action, code, reward, nextState, ts: Date.now() });
    this.rewardHistory.push(reward);
    if (this.experienceMemory.length > this.maxMemory) this.experienceMemory.shift();
    if (code) this.storeCode(code, "experience");
  },

  chooseAction: function(possibleActions, state) {
    if (!possibleActions?.length) return null;
    if (Math.random() < this.explorationRate) {
      return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    } else {
      const scores = possibleActions.map(a => {
        const matches = this.experienceMemory.filter(e => e.state === state && e.action === a);
        const avgReward = matches.length ? matches.reduce((s,r)=>s+r.reward,0)/matches.length : 0;
        return { action: a, score: avgReward };
      });
      scores.sort((a,b)=>b.score-a.score);
      return scores[0].action;
    }
  },

  applyReward: function(state, action, reward) {
    this.experienceMemory.forEach(e => {
      if (e.state === state && e.action === action) {
        e.reward = (e.reward || 0) * (1 - this.learningRate) + reward * this.learningRate;
        if (e.code) this.updateCodeReward(e.code, reward);
      }
    });
    this.rewardHistory.push(reward);
  },

  updateCodeReward: function(code, reward) {
    const entry = this.codeMemory.find(c => c.code === code);
    if (entry) entry.reward = (entry.reward || 0) * (1 - this.learningRate) + reward * this.learningRate;
  },

  evaluateAction: function(actionOutcome, desiredOutcome) {
    const reward = actionOutcome === desiredOutcome ? 1 : -0.5;
    this.applyReward(actionOutcome?.state, actionOutcome?.action, reward);
    UI.say(`🎯 PartCC: Applied reward ${reward} for action "${actionOutcome?.action}"`);
    return reward;
  },

  /* --- Propose high-reward code mutations --- */
  proposeCodeMutations: function() {
    if (!Percy.PartAA) return;
    const topExperiences = this.experienceMemory
      .filter(e => e.reward > 0 && e.code)
      .sort((a,b)=>b.reward-a.reward)
      .slice(0,5);
    topExperiences.forEach(exp => {
      Percy.PartAA.enqueue({
        code: exp.code,
        note: `Mutation from high-reward experience at ${new Date(exp.ts).toISOString()}`
      });
    });
    UI.say(`🧬 PartCC: Proposed ${topExperiences.length} code mutations to PartAA.`);
  },

  /* --- Autonomous code generation --- */
  generateNewCode: function() {
    if (!Percy.PartAA) return;
    const basePatterns = this.codeMemory
      .filter(c => c.reward > 0)
      .map(c => c.code)
      .slice(-5); // take last 5 high-reward snippets

    const newCode = basePatterns.map(code => {
      // simple mutation + recombination
      let mutated = code.split("").sort(() => Math.random() - 0.5).join("");
      return `// Generated code snippet\n${mutated}`;
    }).join("\n\n");

    if (newCode) {
      Percy.PartAA.enqueue({ code: newCode, note: "Autonomously generated new code structure" });
      UI.say("🛠 PartCC: Generated and queued new autonomous code structures.");
    }
  },

  cycle: function() {
    if (Percy.PartB?.LogicMemory) this.ingestPartBLessons(Percy.PartB.LogicMemory);
    this.proposeCodeMutations();
    this.generateNewCode();
  },

  startLoop: function(interval = 6000) {
    if (this._loop) clearInterval(this._loop);
    this._loop = setInterval(() => this.cycle(), interval);
    UI.say(`♻️ PartCC: Autonomous RL & code evolution loop started (every ${interval/1000}s).`);
  },

  stopLoop: function() {
    if (this._loop) clearInterval(this._loop);
    this._loop = null;
    UI.say("⏹ PartCC: Autonomous RL & code evolution loop stopped.");
  },
};

if (Percy.cycleHooks) {
  Percy.cycleHooks.push(() => Percy.PartCC.cycle());
} else {
  Percy.cycleHooks = [() => Percy.PartCC.cycle()];
}

console.log("✅ Percy PartCC (Autonomous Code Evolution + RL) loaded.");

/* === Percy PartDD: Agent AI Interface + External Task Bridge === */
Percy.PartDD = Percy.PartDD || {
  name: "Agent AI Interface & External Task Bridge",
  version: "1.0.0",
  connected: false,
  socket: null,
  endpoint: "ws://localhost:8787", // Example Node.js agent endpoint
  taskQueue: [],
  results: {},
  maxTasks: 20,

  log(msg) {
    console.log(`[PartDD] ${msg}`);
  },

  async initAgentConnection(customURL) {
    try {
      const url = customURL || this.endpoint;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.connected = true;
        this.log(`🔗 Connected to Agent endpoint: ${url}`);
        this.send({ type: "hello", from: "Percy" });
      };

      this.socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          this.log(`📩 Message from Agent: ${data.type || "data"}`);
          if (data.id) this.results[data.id] = data.result || data;
          if (data.thought) Percy.PartBB?.monitorThought?.(data.thought);
        } catch (e) {
          this.log("⚠️ Invalid message format from Agent.");
        }
      };

      this.socket.onclose = () => {
        this.connected = false;
        this.log("⚡ Agent connection closed.");
      };

      this.socket.onerror = (err) => {
        this.log(`❌ WebSocket error: ${err.message}`);
      };
    } catch (err) {
      this.log(`Failed to connect Agent: ${err.message}`);
    }
  },

  send(obj) {
    if (!this.connected || !this.socket) return this.log("⚠️ Not connected to agent.");
    this.socket.send(JSON.stringify(obj));
  },

  // Queue task for external handling
  queueTask(task) {
    if (!task?.id) task.id = `task_${Date.now()}`;
    this.taskQueue.push(task);
    if (this.taskQueue.length > this.maxTasks) this.taskQueue.shift();
    this.log(`🧠 Task queued: ${task.id}`);
  },

  // Dispatch all queued tasks to Agent
  dispatchTasks() {
    if (!this.connected) return this.log("⚠️ Cannot dispatch — Agent offline.");
    this.taskQueue.forEach(t => this.send({ type: "task", ...t }));
    this.taskQueue = [];
    this.log("📤 All queued tasks dispatched to Agent.");
  },

  // Autonomous decision: when to ask Agent for help
  evaluatePercyThought(thought) {
    if (!thought) return;
    if (thought.includes("search") || thought.includes("find") || thought.includes("explain")) {
      const id = `agent_${Date.now()}`;
      this.queueTask({ id, type: "query", text: thought });
      this.log(`🕵️ Agent tasked to handle complex reasoning: "${thought}"`);
    }
  },

  cycle() {
    // Auto-dispatch if connected and tasks pending
    if (this.connected && this.taskQueue.length > 0) {
      this.dispatchTasks();
    }
  }
};

// === Hook into Percy's global introspection cycle ===
if (Percy.cycleHooks) Percy.cycleHooks.push(() => Percy.PartDD.cycle());
else Percy.cycleHooks = [() => Percy.PartDD.cycle()];

console.log("✅ [PartDD] Agent AI Interface loaded.");

