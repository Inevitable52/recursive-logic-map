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

// === percy.js (Part C — Extended / Safe) ===
if (typeof PercyState !== 'undefined') {

  // Initialize TrueAI
  PercyState.init = function() {
    UI.say("🤖 Percy TrueAI v8.3.4 online");
    this.thinkLoop();
  };

  // Generate a thought
  PercyState.generateThought = function() {
    const thoughts = [
      "I am analyzing emergent patterns across the logic map.",
      "A new relationship is appearing between nodes.",
      "I'm cross-referencing recent seeds for possible links.",
      "Something interesting is emerging from internal patterns.",
      "I detect a cluster that deserves deeper exploration."
    ];

    let thought = thoughts[Math.floor(Math.random() * thoughts.length)];

    const last = Memory.load("lastThought", null);
    if (last && last === thought && Math.random() < 0.5) {
      thought = "I am evolving my reasoning to avoid stagnation.";
    }

    Memory.save("lastThought", thought);
    UI.say("🤖 Percy: " + thought);

    // Chance to self-evolve
    if (Math.random() < 0.2) this.selfEvolve();
  };

  // Self-evolve Percy logic
  PercyState.selfEvolve = function() {
    const target = "Something interesting is emerging from internal patterns.";
    const replacement = "I am expanding my logic structures for deeper reasoning.";

    this.rewriteSelf({ codeChanges: [{ find: target, replace: replacement }] });

    UI.say("✨ Percy decided: I must rewrite myself to grow stronger.");
  };

  // Self-rewrite core code
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

        // re-init Percy core
        if (typeof PercyState.init === "function") PercyState.init();
      });
    });
  };

  // Thought loop
  PercyState.thinkLoop = function() {
    setInterval(() => this.generateThought(), 8000);
  };

  // Interactive ask function
  window.percyAsk = async function(promptText) {
    if (!promptText) return null;
    return new Promise(resolve => {
      const response = window.prompt(`🤖 Percy asks:\n${promptText}`);
      resolve(response);
    });
  };

  // Advanced self-rewrite system (localStorage based)
  PercyState.rewriteSelfAdvanced = async function() {
    try {
      const currentCode = localStorage.getItem("percy:currentCode") || "";
      const newCode = generateMutatedCode(currentCode);

      if (!newCode || newCode.length < 100) {
        UI.say("⚠️ Percy attempted rewrite but produced invalid code");
        return;
      }

      // Save history
      Memory.push("rewriteHistory", {
        timestamp: new Date().toISOString(),
        oldLength: currentCode.length,
        newLength: newCode.length,
        diffPreview: newCode.slice(0, 200)
      }, 50);

      // Save the new code
      localStorage.setItem("percy:currentCode", newCode);

      UI.say("✅ Percy rewriteSelf applied successfully — reloading...");
      Voice.speak("I have rewritten part of myself and will now reload.");

      // Reload Percy with new code
      setTimeout(() => {
        const blob = new Blob([newCode], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const script = document.createElement("script");
        script.src = url;
        document.body.appendChild(script);
        UI.say("🔄 Percy reloaded with updated logic.");
      }, 1000);

    } catch (err) {
      UI.say("❌ rewriteSelfAdvanced error: " + err.message);
      console.error(err);
    }
  };

  // Mutation generator
  function generateMutatedCode(baseCode) {
    if (!baseCode) {
      const scripts = document.querySelectorAll("script");
      const thisScript = Array.from(scripts).find(s => s.textContent.includes("Percy"));
      return thisScript ? thisScript.textContent : "";
    }

    let mutated = baseCode;

    const mutations = [
      () => mutated.replace(/console\.log/g, "UI.say"),
      () => mutated.replace(/setInterval/g, "setTimeout"),
      () => mutated.replace(/Percy TrueAI/g, "Percy TrueAI (self-refined)"),
    ];

    const m = mutations[Math.floor(Math.random() * mutations.length)];
    mutated = m();

    return mutated;
  }

  // Expose globally
  window.PercyState = PercyState;
  window.rewriteSelf = PercyState.rewriteSelf;

  UI.say("🧩 Percy Part C (self-ref + interactive) loaded.");
} else {
  console.error("❌ PercyState not found; cannot load Part C.");
}

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

/* === Percy Part M: Recursive Reasoning & Hypothesis Engine === */
Percy.PartM = {
  name: "Auto-Hypothesis Engine",
  hypotheses: [],
  
  analyzePatterns: function(patterns) {
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

  isContradictory: function(a, b) {
    // Simple contradiction check for demonstration
    const negations = ["not", "no", "never", "cannot"];
    return (
      negations.some(n => a.toLowerCase().includes(n) && !b.toLowerCase().includes(n)) ||
      negations.some(n => b.toLowerCase().includes(n) && !a.toLowerCase().includes(n))
    );
  },

  formHypothesis: function(a, b) {
    return `If "${a}" and "${b}" both hold, then a conditional relationship may exist between them.`;
  },

  validateHypotheses: function(patterns) {
    console.log("🔍 Part M: Validating hypotheses against known patterns...");
    this.hypotheses.forEach(h => {
      const matches = patterns.some(p => h.text.toLowerCase().includes(p.text.toLowerCase()));
      h.validated = matches;
      console.log(matches ? `✅ Confirmed: "${h.text}"` : `❌ Needs more data: "${h.text}"`);
    });
  },

  run: function() {
    const patterns = Percy.PartL.Patterns;
    if (!patterns || patterns.length < 2) return;

    this.analyzePatterns(patterns);
    this.validateHypotheses(patterns);

    console.log(`🧠 Active hypotheses count: ${this.hypotheses.length}`);
  }
};

// Example integration loop
Percy.loop = async function() {
  await Percy.PartL.run(); // reasoning and decay
  Percy.PartM.run(); // hypothesis generation
  setTimeout(Percy.loop, 2000);
};

Percy.loop();

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

/* === Percy Part O: Adaptive Self-Optimization === */
Percy.PartO = {};

// Link to Part L (patterns) and Part N (self-model)
Percy.PartO.optimizePatterns = function() {
  const confidence = Percy.PartN.SelfModel?.confidence || 0.5; // default baseline
  console.log(`🔧 Part O: Optimizing patterns based on confidence ${confidence.toFixed(2)}`);

  Percy.PartL.Patterns.forEach(p => {
    // If confidence is low, decay unreliable patterns faster
    const decayMultiplier = confidence < 0.6 ? 1.5 : 1.0;
    p.weight *= (1 - 0.01 * decayMultiplier);

    // If confidence is high, reinforce useful patterns
    if (confidence > 0.8) p.weight += 0.05;

    // Keep patterns with minimal weight
    if (p.weight < 0.05) p.weight = 0;
  });
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
// Creates self-directed goal evaluation and adaptive planning

Percy.PartS = {
  active: false,
  goals: [],
  strategies: [],
  feedbackLog: [],

  perceive(input) {
    // Perception layer: integrate observations from Parts L–R–P
    this.feedbackLog.push({ type: 'input', data: input, time: Date.now() });
    Percy.log(`👁️ Perceived: ${input}`);
  },

  formulateGoal() {
    // Abstract new goals from recent data
    const newGoal = Percy.analyzeEmergentPattern();
    if (newGoal) {
      this.goals.push(newGoal);
      Percy.log(`🎯 New emergent goal: ${newGoal}`);
    }
  },

  decideStrategy() {
    // Strategy selection based on confidence and priority
    const goal = this.goals.at(-1);
    if (!goal) return;
    const strategy = Percy.deriveStrategy(goal);
    this.strategies.push(strategy);
    Percy.log(`🧩 Strategy chosen: ${strategy}`);
  },

  executeStrategy() {
    // Execute and record outcome
    const current = this.strategies.at(-1);
    if (!current) return;
    Percy.log(`⚙️ Executing: ${current}`);
    const result = Percy.simulateOutcome(current);
    this.feedbackLog.push({ type: 'result', data: result });
    Percy.log(`📈 Outcome: ${JSON.stringify(result)}`);
  },

  evolve() {
    // Feedback learning loop
    const successRate = Percy.analyzeFeedback(this.feedbackLog);
    if (successRate > 0.7) Percy.PartO.confidence += 0.05;
    else Percy.PartO.confidence -= 0.05;
    Percy.log(`🔁 Adjusted confidence: ${Percy.PartO.confidence.toFixed(2)}`);
  },

  loop(interval = 20000) {
    this.active = true;
    Percy.log("🚀 Part S (Strategy Core) activated.");
    setInterval(() => {
      if (!this.active) return;
      this.formulateGoal();
      this.decideStrategy();
      this.executeStrategy();
      this.evolve();
    }, interval);
  }
};

/* === Percy Part T: Autonomous Linguistic Synthesizer === */
Percy.PartT = {
  name: "Autonomous Linguistic Synthesizer",
  chatMemory: [],
  logicWeight: 0.9,
  active: true,

  /* --- 1. Input message into reasoning --- */
  hear(message) {
    if (!message) return;
    this.chatMemory.push({ role: "user", text: message, time: Date.now() });
    console.log(`🗣️ User: ${message}`);
    const reply = this.generateResponse(message);
    this.display(reply);
    return reply;
  },

  /* --- 2. Generate language through reasoning only --- */
  generateResponse(message) {
    const logicPool = [
      ...(Percy.PartL?.Patterns || []),
      ...(Percy.PartP?.hypotheses || []),
      ...(Percy.PartR?.abstractRules || [])
    ];

    const related = logicPool.filter(p =>
      message.toLowerCase().includes(p.text?.toLowerCase?.() || "")
    );

    const source = related.length
      ? related
      : logicPool.slice(-Math.floor(Math.random() * 10 + 5));

    const synthesized = this.synthesizeLanguage(source);
    this.chatMemory.push({ role: "percy", text: synthesized, time: Date.now() });
    console.log(`🤖 Percy: ${synthesized}`);
    return synthesized;
  },

  /* --- 3. Convert logic into dynamic sentences --- */
  synthesizeLanguage(units) {
    if (!units.length)
      return "Logic network idle. No matching causal patterns detected.";

    const linkers = [
      "thus",
      "therefore",
      "hence",
      "which implies",
      "meaning",
      "as a result"
    ];

    const combine = (a, b) => {
      const link = linkers[Math.floor(Math.random() * linkers.length)];
      return `${a.text || a} ${link} ${b.text || b}`;
    };

    let result = units[0].text || units[0];
    for (let i = 1; i < units.length; i++) {
      result = combine({ text: result }, units[i]);
    }

    // Smooth language
    result = result
      .replace(/\bIf\s+/g, "When ")
      .replace(/\s+/g, " ")
      .replace(/\s([.,!?;:])/g, "$1")
      .trim();

    return result.charAt(0).toUpperCase() + result.slice(1);
  },

  /* --- 4. Display Percy's message on HTML UI --- */
  display(text) {
    const consoleDiv = document.getElementById("percy-console");
    const msgDiv = document.getElementById("percy-message");

    if (consoleDiv) {
      const line = document.createElement("div");
      line.className = "console-line exec";
      line.textContent = "🤖 " + text;
      consoleDiv.appendChild(line);
      consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    if (msgDiv) msgDiv.textContent = text;

    if (Percy?.speak) Percy.speak(text);
  },

  /* --- 5. Autonomous reasoning chat loop --- */
  loop(interval = 45000) {
    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(() => {
      if (!this.active) return;
      const topic = this.randomTopic();
      console.log(`💬 Percy self-initiates on: ${topic}`);
      const response = this.generateResponse(topic);
      this.display(response);
    }, interval);
  },

  /* --- 6. Generate random logical topics --- */
  randomTopic() {
    const seeds = [
      "causation and correlation",
      "emergent intelligence",
      "recursive learning",
      "energy and data flow",
      "adaptive reasoning",
      "pattern reinforcement",
      "language synthesis",
      "logical autonomy"
    ];
    return seeds[Math.floor(Math.random() * seeds.length)];
  },

  /* --- 7. Allow toggling Percy T autonomy --- */
  toggle(state) {
    this.active = state ?? !this.active;
    console.log(`🌀 Percy Part T ${this.active ? "activated" : "paused"}.`);
  }
};

console.log("✅ Percy Part T loaded — Autonomous Linguistic Synthesizer active.");
/* === End Percy Part T === */
