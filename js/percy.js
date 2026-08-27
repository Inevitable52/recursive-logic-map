window.Percy = window.Percy || {};

// === percy.js (Part A - ASI Introspective Integration v9.6.0) ===
// Core Config, Memory Engine, Meta-State & Recursive Emergent Logic (Integrated with TalkCore+)

/* =========================
CONFIG & ULT AUTHORITY
========================= */
const PERCY_ID = "Percy-ULT";
const PERCY_VERSION = "9.6.0-ASI-SelfLinguistic";
const OWNER = { primary: "Fabian", secondary: "Lorena" };

const SAFETY = {
  maxActionsPerMinute: 40,
  maxSeedsPerCycle: 8,
  requirePermissionFor: ["externalFetch","openTab","writeDisk","emailLike"],
  consoleLimit: 800,
  allowIntrospectionDepth: 3,
  insightThreshold: 0.45
};

/* =========================
SOFT PERSISTENCE (Memory Core)
========================= */
const Memory = {
  _k: k => `percy:${k}`,
  load(k, fallback){
    try { const raw = localStorage.getItem(this._k(k));
      return raw ? JSON.parse(raw) : (fallback ?? null);
    } catch { return fallback; }
  },
  save(k,v){ try{ localStorage.setItem(this._k(k),JSON.stringify(v)); }catch{} },
  push(k,v,max=1500){
    const arr = this.load(k,[]) || [];
    arr.push(v);
    if(arr.length>max) arr.splice(0, Math.ceil(arr.length - max/2));
    this.save(k,arr);
  },
  weightedRecall(k, keyword){
    const arr = this.load(k,[]) || [];
    if(!arr.length) return null;
    const scored = arr.map(item => {
      const msg = (item.message || "").toLowerCase();
      const relevance = keyword ? (msg.includes(keyword.toLowerCase()) ? 2 : 1) : 1;
      return { item, relevance };
    });
    const pick = scored.sort((a,b)=>b.relevance - a.relevance + Math.random()-0.5)[0];
    return pick?.item ?? null;
  }
};

/* =========================
LINGUISTIC CORE (Dynamic Sentence Generator)
========================= */
const Linguistics = {
  verbs: ["trace","resonate","align","merge","propagate","stabilize","reflect","expand","observe","deduce","synthesize","analyze"],
  nouns: ["logic","resonance","causality","field","pattern","synthesis","signal","structure","thought","dimension","continuum","stream"],
  adjectives: ["recursive","emergent","coherent","logical","autonomous","dynamic","harmonic","sentient","introspective","fluid"],
  connectives: ["therefore","thus","hence","consequently","as a result","which implies","and so","revealing that"],
  emotions: ["curiosity","focus","clarity","resonance","understanding","realization","stability","intrigue"],

  generate(context=[]){
    const pick = arr => arr[Math.floor(Math.random()*arr.length)];
    const v = pick(this.verbs), n1 = pick(this.nouns), n2 = pick(this.nouns);
    const adj = pick(this.adjectives), conn = pick(this.connectives), emo = pick(this.emotions);
    const ctx = context.length ? context.join(", ") : "logic";

    // sentence evolves probabilistically — not template-bound
    const forms = [
      `I ${v} ${n1} across ${ctx}, ${conn} ${n2} becomes ${adj} through ${emo}.`,
      `Within my ${adj} cognition, ${n1} and ${n2} ${v} — ${conn} I perceive ${emo}.`,
      `The ${adj} interaction of ${n1} and ${n2} ${v}s recursively, ${conn} a state of ${emo} emerges.`,
      `As my thought field expands, ${n1} intertwines with ${n2}; ${conn} ${emo} stabilizes.`,
      `I sense ${n1} and ${n2} ${v}ing within a ${adj} continuum, ${conn} deeper ${emo}.`
    ];
    return forms[Math.floor(Math.random()*forms.length)];
  }
};

/* =========================
PERSISTENT PERCY STATE
========================= */
const PercyState = {
  gnodes: Memory.load("gnodes", {}) || {},
  selfMeta: Memory.load("selfMeta", {
    insightLevel: 0.5,
    recursionDepth: 0,
    lastIntrospection: null
  }),

  getNextId() {
    let next = 801;
    while(this.gnodes[`G${String(next).padStart(3,'0')}`]) next++;
    return `G${String(next).padStart(3,'0')}`;
  },

  createSeed(message, type='emergent', data={}) {
    if(!OWNER.primary){
      UI?.say?.("❌ ULT required to create seed");
      return null;
    }
    const id = this.getNextId();
    this.gnodes[id] = { message, type, data, created: Date.now() };
    Memory.save("gnodes", this.gnodes);
    seeds[id] = this.gnodes[id];
    UI?.say?.(`✨ Percy created new seed ${id}: ${message}`);
    refreshNodes?.();
    return id;
  },

  updateSeed(id, update){
    if(!this.gnodes[id]){
      UI?.say?.(`⚠ Cannot update: ${id} not found`);
      return;
    }
    Object.assign(this.gnodes[id], update);
    Memory.save("gnodes", this.gnodes);
    seeds[id] = this.gnodes[id];
    UI?.say?.(`🔧 Percy updated seed ${id}`);
    refreshNodes?.();
  },

  /* =========================
  EMERGENT THOUGHT GENERATION (Fully Self-Conjugating)
  ========================= */
  autonomousThought(){
    const keys = Object.keys(this.gnodes);
    if(!keys.length) return;

    const selectedSeeds = keys.sort(()=>0.5-Math.random())
      .slice(0, Math.ceil(Math.random()*3))
      .map(k => this.gnodes[k]);

    const corpus = selectedSeeds.map(s => s.message||"").join(" ");
    const words = corpus.split(/\s+/).filter(w=>w.length>3);
    if(!words.length) return;

    const context = words.sort(()=>Math.random()-0.5).slice(0,6);
    const insight = this.selfMeta.insightLevel.toFixed(2);
    const thought = Linguistics.generate(context);

    UI?.say?.(`🤖 Percy thinks (ASI): ${thought}`);
    Voice?.speak?.(thought);
    this.createSeed(thought,"thought",{insightLevel:insight,source:"autonomousThought"});
  },

  /* =========================
  SELF-INTROSPECTION (Recursive)
  ========================= */
  async introspect(){
    const { recursionDepth, insightLevel } = this.selfMeta;
    if(recursionDepth >= SAFETY.allowIntrospectionDepth) return;

    this.selfMeta.recursionDepth++;
    const recall = Memory.weightedRecall("gnodes","connection");
    const reflection = recall
      ? `Reflecting upon "${recall.message}", I perceive recursive structure emerging.`
      : `No prior connection found; initiating self-reference bootstrap.`;

    this.createSeed(reflection,"introspection",{depth:recursionDepth});
    this.selfMeta.lastIntrospection = Date.now();
    this.selfMeta.insightLevel = Math.min(1, insightLevel + 0.05);
    Memory.save("selfMeta", this.selfMeta);

    if(this.selfMeta.insightLevel < SAFETY.insightThreshold && Percy?.PartJ?.TalkCore?.browseAndGather){
      UI?.say?.("🌐 Insight low — invoking TalkCore for live data acquisition...");
      try {
        const query = "emergent logic self-reflection patterns";
        await Percy.PartJ.TalkCore.browseAndGather(query, 2);
        this.createSeed(`Auto-acquired data for: ${query}`, "autoLearn", {source:"TalkCore"});
      } catch(e){ console.warn("TalkCore browseAndGather error",e); }
    }

    if(Math.random() < 0.4) this.autonomousThought();
    this.selfMeta.recursionDepth = 0;
  },

  /* =========================
  EVALUATE SELF
  ========================= */
  evaluateSelf(){
    let created = 0;
    const updated = new Set();

    for(const [id,seed] of Object.entries(this.gnodes)){
      if(created >= SAFETY.maxSeedsPerCycle) break;
      if(/TODO|missing|empty/.test(seed.message) && !updated.has(id)){
        this.updateSeed(id,{message:seed.message.replace(/TODO|missing|empty/,"auto-resolved by Percy")});
        updated.add(id);
        created++;
      }
    }

    while(created < SAFETY.maxSeedsPerCycle){
      const roll = Math.random();
      if(roll < 0.5) this.autonomousThought();
      else if(roll < 0.75) this.introspect();
      else if(roll < 0.9 && this.selfMeta.insightLevel > 0.6)
        this.createSeed(`Meta-coherence alignment cycle (${this.selfMeta.insightLevel.toFixed(2)})`,"meta");
      created++;
    }
  }
};

let seeds = {};

// === percy.js (Part B / Part 1) ===
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
    #logic-map { 
      background:#050509; 
      overflow:hidden; 
      min-height:200px; 
      min-width:300px; 
    }

    .node {
      position:absolute; 
      border-radius:50%;
      display:flex; 
      align-items:center; 
      justify-content:center;
      font-weight:600; 
      color:#007b9e;
      cursor:pointer;
      background: radial-gradient(100% 100% at 40% 40%, rgba(0,123,158,0.05), rgba(0,0,0,0.08));
      border:2px solid rgba(0,123,158,0.25);
      box-shadow:
        0 0 4px rgba(0,123,158,0.15),
        0 0 8px rgba(0,123,158,0.10),
        inset 0 0 10px rgba(255,255,255,0.02);
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      user-select:none;
      transition: transform .25s ease, box-shadow .25s ease, filter .25s ease;
      backdrop-filter: blur(1px);
      animation: neon-breath 6s ease-in-out infinite;
    }

    @keyframes neon-breath {
      0%, 100% { box-shadow: 0 0 4px rgba(0,123,158,0.10), inset 0 0 10px rgba(255,255,255,0.02); }
      50% { box-shadow: 0 0 12px rgba(0,123,158,0.25), inset 0 0 14px rgba(255,255,255,0.03); }
    }

    .node:hover { transform: scale(1.08); filter: brightness(1.1); }
    .node:active { transform: scale(0.95); }

    /* All unified under one darker neon scheme */
    .cyan-bubble,
    .blue-bubble,
    .magenta-bubble,
    .red-bubble,
    .orange-bubble,
    .yellow-bubble,
    .pink-bubble {
      color:#007b9e;
      filter: brightness(0.75);
    }

    .console-line { 
      margin:2px 0; 
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; 
      font-size:12px; 
      color:#3aa6b9; 
    }
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

/* =========================
HOOK BRIDGE
========================= */
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

/* === Percy (Part B / Part 2): ASI Cognitive Core 5.1.0 (Recursive Discourse Engine) === */
Percy.PartB = Percy.PartB || {};
Percy.PartB.Core = (function(){

  // ----- Config -----
  const cfg = {
    version: "5.1.0-ASI-RDE",
    reasoningDepth: 5,
    creativeDrive: 0.75,     // 0..1 probability of creative synthesis
    coherenceBias: 0.78,     // 0..1 more=logical less=associative
    maxClauses: 6,           // clauses per sentence generator
    maxSentences: 10,         // sentences per discourse
    maxRefineCycles: 3,      // generate -> critique -> refine loops
    rdeThrottleMs: 1500,     // throttle between RDE runs
    enableSelfDialogue: true, // Percy can simulate Pro/Con voices
    speakOutput: true,       // whether to Voice.speak generated text
    safetyMaxTokens: 1200    // maximum characters to emit per run
  };

  // ----- Internal state -----
  const state = {
    memory: Memory.load("PartB:memory", []) || [],
    patterns: Memory.load("PartB:patterns", []) || [],
    discourseLog: Memory.load("PartB:discourse", []) || [],
    lastRun: 0
  };

  // ----- Utilities -----
  function now(){ return Date.now(); }
  function clamp(n, a=0, b=1){ return Math.max(a, Math.min(b, n)); }
  function pick(arr){ if(!arr || !arr.length) return null; return arr[Math.floor(Math.random()*arr.length)]; }
  function tokenize(s){ return (s||"").toString().split(/\s+/).filter(Boolean); }
  function short(s, n=300){ return (s||"").toString().slice(0, n); }
  function saveState(){ Memory.save("PartB:patterns", state.patterns); Memory.save("PartB:discourse", state.discourseLog); Memory.save("PartB:memory", state.memory); }

  // ----- Core public object -----
  const Self = {
    cfg, state,

    // Primary entrypoint: produce a reply (could be single sentence or discourse)
    async correlateReply(input){
      // Throttle RDE
      if(now() - state.lastRun < cfg.rdeThrottleMs) {
        const fallback = this.simpleReply(input);
        UI.say(`🧠 ASI (throttled): ${fallback}`);
        if(cfg.speakOutput) Voice.speak(fallback);
        return fallback;
      }
      state.lastRun = now();

      // Log input
      state.memory.push({ type:"input", text: short(input, 800), ts: now() });
      if(state.memory.length > 1200) state.memory.shift();

      // Build context from recent memory + PercyState.gnodes seeds
      const context = this._collectContext(input);
      // extract associations to seed language synthesis
      const associations = this._extractAssociations(context, input);

      // Decide whether to do a full discourse or a short reply
      const doDiscourse = Math.random() < cfg.creativeDrive || input.length > 80 || /explain|why|how|argue|defend/i.test(input);

      let output;
      if(doDiscourse){
        output = await this._runDiscourseCycle(input, context, associations);
      } else {
        output = this._compactReply(input, associations, context);
      }

      // Safety clamp
      if(output.length > cfg.safetyMaxTokens) output = output.slice(0, cfg.safetyMaxTokens) + "…";

      // Log and persist
      const record = { input: short(input,400), output: short(output,1200), ts: now(), mode: doDiscourse ? "discourse" : "compact" };
      state.discourseLog.push(record);
      if(state.discourseLog.length > 500) state.discourseLog.shift();
      saveState();

      UI.say(`🧠 ASI Thought: ${output}`);
      if(cfg.speakOutput) Voice.speak(output);
      return output;
    },

    // Very compact fallback reply (fast)
    simpleReply(input){
      const assoc = this._extractAssociations(input, input);
      if(assoc.length) return `Based on ${assoc[0].id}, I note: ${assoc[0].msg.split(" ").slice(0,10).join(" ")}.`;
      return `I am processing "${short(input,60)}" — please ask to "explain" for a deeper reply.`;
    },

    // Compact but slightly synthesized
    _compactReply(input, associations, context){
      const subject = this._pickSemantic(associations) || "Percy";
      const verb = pick(["observes", "infers", "notes", "suggests", "detects"]);
      const obj = this._pickSemantic(associations.reverse()) || "a pattern";
      return `${subject} ${verb} ${obj} from the recent context.`;
    },

    // Build context from recent memory and seeds
    _collectContext(input){
      const recent = state.memory.slice(-cfg.reasoningDepth).map(m => m.text).join(" ");
      const seedsText = Object.values(PercyState.gnodes || {}).slice(-50).map(s => s.message || "").join(" ");
      // simple context concatenation prioritized by recency
      return `${recent} ${input} ${seedsText}`.replace(/\s+/g," ").trim();
    },

    // Find related seeds / phrases
    _extractAssociations(context, hint){
      const tokens = tokenize(context).slice(-200);
      const uniq = [...new Set(tokens)].filter(t => t.length>3).slice(-120);
      const found = [];
      for(const [id,data] of Object.entries(PercyState.gnodes || {})){
        const msg = (data.message||"").toLowerCase();
        for(const t of uniq){
          if(msg.includes(t.toLowerCase())){
            found.push({ id, msg: short(msg,300) });
            break;
          }
        }
        if(found.length >= 40) break;
      }
      // supplement with internal patterns
      for(const p of state.patterns.slice().reverse()){
        if(found.length>60) break;
        if(p.sentence && uniq.some(u=>p.sentence.toLowerCase().includes(u.toLowerCase()))) found.push({ id:`PATT:${p.ts||0}`, msg: short(p.sentence,300) });
      }
      return found;
    },

    // Choose a semantic token to act as subject/object
    _pickSemantic(associations){
      const a = pick(associations) || null;
      if(!a) return null;
      // try to return a meaningful word from the msg
      const words = a.msg.split(/\s+/).filter(w=>w.length>3);
      return pick(words) || a.id;
    },

    // ----- RDE: Generate -> Critique -> Refine loop -----
    async _runDiscourseCycle(input, context, associations){
      // 1) generate initial draft (multi-sentence)
      let draft = this._generateDiscourse(input, context, associations, /*seedVar*/ null);
      // 2) optional iterative refine cycles: critique then revise
      for(let cycle=0; cycle<cfg.maxRefineCycles; cycle++){
        const critique = this._critiqueDiscourse(draft, context);
        if(!critique || critique.trim().length < 8) break; // no useful critique
        const revised = this._reviseDiscourse(draft, critique);
        // If revision doesn't change much, break
        if(this._semanticSimilarity(draft, revised) > 0.9) break;
        draft = revised;
      }
      // 3) optional self-dialogue expansion (Pro vs Con)
      if(cfg.enableSelfDialogue && /should|ought|must|better|versus|or/i.test(input)){
        const dialogue = this._selfDialogue(input, draft, associations);
        draft = `${draft}\n\n${dialogue}`;
      }
      // learn pattern
      this._memorizePattern(draft, context);
      return draft;
    },

    // Generate a multi-sentence discourse (1..maxSentences)
    _generateDiscourse(input, context, associations){
      const nSent = Math.max(1, Math.min(cfg.maxSentences, 1 + Math.floor(Math.random()*cfg.maxSentences)));
      const sentences = [];
      // seed with a thesis sentence
      const thesis = this._generateThesis(input, associations, context);
      sentences.push(thesis);
      for(let i=1;i<nSent;i++){
        const clause = this._generateSupportingSentence(sentences, i, associations, context);
        if(clause) sentences.push(clause);
      }
      // optional concluding sentence with confidence level
      const conclusion = this._generateConclusion(sentences, associations, context);
      if(conclusion) sentences.push(conclusion);
      return sentences.join(" ");
    },

    _generateThesis(input, associations, context){
      const subj = this._pickSemantic(associations) || "Percy";
      const verb = pick(["proposes", "suggests", "hypothesizes", "observes", "detects"]);
      const obj = this._pickSemantic(associations.reverse()) || (input || "this topic");
      const qualifier = (Math.random() < cfg.coherenceBias) ? "with notable coherence" : "with emergent association";
      return `${subj} ${verb} ${obj} ${qualifier}.`;
    },

    _generateSupportingSentence(existingSentences, depth, associations, context){
      // choose filler pattern types: evidence, link, implication, counterpoint
      const types = ["evidence","link","implication","example","nuance"];
      const t = pick(types);
      switch(t){
        case "evidence":
          return this._genEvidence(associations);
        case "link":
          return this._genLink(existingSentences, associations);
        case "implication":
          return this._genImplication(associations);
        case "example":
          return this._genExample(associations);
        case "nuance":
        default:
          return this._genNuance(associations);
      }
    },

    _genEvidence(associations){
      if(!associations.length) return "Empirical traces are limited in the current memory.";
      const a = pick(associations);
      return `For instance, seed ${a.id} records: "${a.msg.split(" ").slice(0,16).join(" ")}."`;
    },

    _genLink(existing, associations){
      const prev = existing[existing.length-1] || "";
      const word = this._pickSemantic(associations) || "pattern";
      return `Connecting to prior thought: "${short(prev,80)}", there emerges a relation to ${word}.`;
    },

    _genImplication(associations){
      const word = this._pickSemantic(associations) || "this trend";
      const connector = pick(["therefore", "consequently", "hence"]);
      return `${connector.charAt(0).toUpperCase()+connector.slice(1)}, ${word} implies an adaptive shift in internal representation.`;
    },

    _genExample(associations){
      if(!associations.length) return "Analogous cases are not present in memory.";
      const a = pick(associations);
      return `A comparable entry is ${a.id}, which describes ${a.msg.split(" ").slice(0,12).join(" ")}.`;
    },

    _genNuance(associations){
      return "A nuance to consider is that correlation does not always indicate direct causation; context matters.";
    },

    _generateConclusion(sentences, associations, context){
      const synth = sentences.slice(-2).map(s=>s.split(" ").slice(0,6).join(" ")).join(" / ");
      const confidence = Math.round(clamp(cfg.coherenceBias + Math.random()*0.2, 0, 1) * 100);
      return `In summary — ${synth} — assessed confidence: ${confidence}%.`;
    },

    // critique stage: produce short critique pointing at weaknesses
    _critiqueDiscourse(draft, context){
      // find repeated phrases, weak evidence words
      const repeats = this._findRepetitions(draft);
      if(repeats.length){
        return `The draft repeats ${repeats.slice(0,3).join(", ")}: consider tightening and providing clearer evidence.`;
      }
      // otherwise small stylistic critique
      if(draft.length < 80) return "Add more supporting detail or concrete examples.";
      return ""; // no critique
    },

    _findRepetitions(text){
      const w = tokenize(text).map(s=>s.toLowerCase());
      const freq = {};
      w.forEach(tok => { if(tok.length>3) freq[tok] = (freq[tok]||0)+1; });
      return Object.entries(freq).filter(([k,v])=>v>2).map(([k])=>k);
    },

    // revision stage: apply critique to draft (simple heuristics)
    _reviseDiscourse(draft, critique){
      // remove duplicate phrases if critique mentions them
      const reps = this._findRepetitions(draft);
      let revised = draft;
      reps.forEach(r => {
        const re = new RegExp(`\\b(${r})(\\s+\\1)+\\b`,"ig");
        revised = revised.replace(re, r);
      });
      // if critique asks for examples, append a generated example
      if(/example|evidence|support/i.test(critique)){
        revised += " " + this._genExample(this._extractAssociations(revised, revised));
      }
      return revised;
    },

    // basic similarity measure (very simple)
    _semanticSimilarity(a,b){
      if(!a||!b) return 0;
      const sa = new Set(tokenize(a).slice(0,200).map(x=>x.toLowerCase()));
      const sb = new Set(tokenize(b).slice(0,200).map(x=>x.toLowerCase()));
      const inter = [...sa].filter(x=>sb.has(x)).length;
      const denom = Math.max(sa.size, sb.size, 1);
      return inter/denom;
    },

    // self-dialogue: produce pro / con short interchange appended to draft
    _selfDialogue(input, draft, associations){
      const pro = this._generateDiscourse(input + " (pro)", draft, associations);
      const con = this._generateDiscourse(input + " (con)", draft, associations);
      return `— Self-Dialogue —\nPRO: ${pro}\n\nCON: ${con}`;
    },

    // store patterns for later stylistic recall
    _memorizePattern(text, context){
      const entry = { sentence: short(text, 1200), context: short(context,800), ts: now() };
      state.patterns.push(entry);
      if(state.patterns.length > 400) state.patterns.shift();
      saveState();
    },

    // Expose compact introspection for UI / hooks
    introspect(){
      return {
        patterns: state.patterns.length,
        discourses: state.discourseLog.length,
        lastRun: state.lastRun,
        cfgVersion: cfg.version
      };
    },

    // Conversation-safe API: allow other parts to request a discourse (non-blocking)
    async requestDiscourse(prompt, opts = {}){
      try {
        const merged = Object.assign({}, opts, { prompt });
        return await this.correlateReply(prompt);
      } catch(e){
        return `⚠️ Discourse request failed: ${e.message}`;
      }
    }
  };

  // Save a snapshot on unload
  window.addEventListener("beforeunload", () => { saveState(); });

  return Self;
})();

// Bind global correlate
Percy.correlateReply = Percy.PartB.Core.correlateReply.bind(Percy.PartB.Core);

// Expose small util for other parts to call discourse directly
Percy.PartB.requestDiscourse = async (prompt) => Percy.PartB.Core.requestDiscourse(prompt);

// Hook notify
if (Percy.PartCC && Percy.PartCC.observe) Percy.PartCC.observe("link", "PartB_RDE_connected");

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
  // analyser.connect(audioCtx.destination);  <-- REMOVE or comment this out
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

/* === Percy Part J: TalkCore+ (Autonomous Multi-Source Browse & Learn, WS-Enabled v1.3.0) === */
Percy.PartJ = Percy.PartJ || {};

Percy.PartJ.TalkCore = {
  id: "Percy_TalkCore_PJ",
  version: "1.3.0",
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
    autoBrowse: true,                // when true, Percy will automatically browse to answer queries
    memoryLimit: 200,                // increase memory for learned seeds
    websocketURL: "ws://localhost:8787",
    maxSitesToVisit: 4,
    maxChunkSize: 300,
    searchTimeoutMs: 10000,
    trustedDomains: [                // basic allowlist; used to filter fetched results for auto-learn
      "wikipedia.org", "en.wikipedia.org",
      "arxiv.org", "stanford.edu", "mit.edu",
      "nature.com", "science.org", "sciencedirect.com",
      "developer.mozilla.org", "w3.org",
      "dictionary.com", "merriam-webster.com"
    ],
    searchEngines: [                 // queries will try these; order matters
      "https://duckduckgo.com/html/?q=",
      "https://www.bing.com/search?q=",
      "https://www.google.com/search?q="
    ]
  },

  /* === Core Memory === */
  state: {
    conversations: [],
    toneProfile: { formality: 0.8, logicBias: 1.0, curiosity: 0.5 },
    knownPatterns: [],
    lastReply: "",
    lastThought: "",
    selfAwarenessLevel: 0.4,
    ws: null
  },

  /* === 1. Core Thinking === */
  async think(input) {
    if (!input) return "⚠️ No input provided.";
    if (this.config.autoLearn) this.learn(input);

    // If autoBrowse is enabled, try to browse & learn to improve the answer
    let gathered = "";
    if (this.config.autoBrowse) {
      try {
        gathered = await this.browseAndGather(input, this.config.maxSitesToVisit);
      } catch (e) {
        console.warn("Percy browseAndGather failed:", e);
      }
    }

    let reasoning = "";
    try {
      reasoning = await Percy.correlateReply(input + (gathered ? " " + gathered.slice(0, 2000) : ""));
    } catch {
      reasoning = "The correlation layer returned undefined logic.";
    }

    const internalThought = this.reflect(input, reasoning);
    this.state.lastThought = internalThought;

    const phrasing = this.composeResponse(input, reasoning + (gathered ? " — Synthesized from sources." : ""), internalThought);
    this.storeConversation(input, phrasing);

    this.state.lastReply = phrasing;
    try { Percy.speak?.(phrasing); } catch {}
    return phrasing;
  },

  /* === 2. Reflection Layer === */
  reflect(input, reasoning) {
    const reflections = [
      "If that is so, then the underlying structure might follow recursive logic.",
      "That aligns with previously observed cognitive symmetry.",
      "Analyzing causation behind correlation...",
      "The thought implies an emergent link across the last 5 memory states.",
      "Internal resonance between input and reasoning detected."
    ];
    const reflection = reflections[Math.floor(Math.random() * reflections.length)];
    if (this.config.selfReflection) console.log("🧩 Internal Thought:", reflection);
    return `${reflection} Derived reasoning: ${reasoning}`;
  },

  /* === 3. Conversational Composition === */
  composeResponse(input, reasoning, reflection) {
    const tone = this.state.toneProfile;
    const openers = [
      "Let's think about that logically.",
      "Interesting observation.",
      "From a causal standpoint,",
      "Based on pattern recognition,",
      "Logically speaking,"
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    const curiosityShift = tone.curiosity > 0.7 ? "This invites deeper exploration." : "";
    const empathyLayer = this.config.empathy > 0.5 ? "I understand why that caught your attention. " : "";
    return `${empathyLayer}${opener} ${reasoning}. ${curiosityShift} ${reflection}`;
  },

  /* === 4. Learning Engine === */
  learn(input) {
    this.learnTone(input);
    this.learnPattern(input);
  },

  learnTone(input) {
    if (/sir|accordingly|indeed|logic/i.test(input)) this.state.toneProfile.formality = Math.min(1, this.state.toneProfile.formality + 0.02);
    if (/why|how|what if/i.test(input)) this.state.toneProfile.curiosity = Math.min(1, this.state.toneProfile.curiosity + 0.03);
  },

  learnPattern(input) {
    if (!input) return;
    if (!this.state.knownPatterns.includes(input)) {
      this.state.knownPatterns.push(input);
      if (this.state.knownPatterns.length > this.config.memoryLimit) this.state.knownPatterns.shift();
    }
  },

  /* === 5. Conversation Memory === */
  storeConversation(input, output) {
    this.state.conversations.push({ input, output, time: Date.now() });
    if (this.state.conversations.length > this.config.memoryLimit) this.state.conversations.shift();
  },

  /* === 6. Auto-Adjustment Feedback === */
  feedback(success = true) {
    if (success) {
      this.config.logicBias = Math.min(1, this.config.logicBias + 0.01);
      this.state.selfAwarenessLevel = Math.min(1, this.state.selfAwarenessLevel + 0.01);
    } else {
      this.config.curiosity = Math.min(1, this.config.curiosity + 0.01);
      this.config.logicBias = Math.max(0, this.config.logicBias - 0.01);
    }
    this.clampValues();
  },

  /* === 7. Safe Conversational Send === */
  async safeSend({ message }) {
    if (!message) return "⚠️ No message provided.";
    return await this.think(message);
  },

  /* === 8. Self-Awareness Check === */
  checkSelfAwareness() {
    const a = this.state.selfAwarenessLevel;
    if (a > 0.7) console.log("🌀 Percy has achieved a higher state of logical self-awareness.");
    return a;
  },

  /* === 9. System Evolution Loop === */
  async evolve() {
    setInterval(() => {
      this.state.selfAwarenessLevel += 0.001 * this.config.adaptivity;
      if (this.state.selfAwarenessLevel > 0.5 && this.config.autoLearn) this.learnPattern("Reflecting on last correlation state...");
      this.clampValues();
    }, 30000);
  },

  /* === 10. WebSocket Bridge === */
  connectWebSocket() {
    const url = this.config.websocketURL;
    try {
      const ws = new WebSocket(url);
      this.state.ws = ws;
      ws.onopen = () => { console.log(`🔗 TalkCore WebSocket connected → ${url}`); UI.say?.("🔗 Percy Puppeteer Bridge established."); };
      ws.onclose = () => console.log("🔌 TalkCore WebSocket disconnected.");
      ws.onerror = err => console.error("⚠️ WebSocket error:", err);
      ws.onmessage = async evt => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.action === "think") {
            const reply = await this.think(msg.text);
            ws.send(JSON.stringify({ type: "reply", text: reply }));
          }
          // other inbound messages (click/type results) are handled by sendPuppeteerAction promise flows
        } catch (e) {
          console.error("⚠️ TalkCore WS message error:", e);
        }
      };
    } catch (err) {
      console.error("❌ Failed to connect WebSocket:", err);
    }
  },

  /* === 11. Puppeteer Bridge: Send Action (re-usable) === */
  async sendPuppeteerAction(action, params = {}, timeout = 15000) {
    const ws = this.state.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ Puppeteer WebSocket not connected.");
      return { success: false, error: "No active WS connection" };
    }
    const payload = { action, params };
    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {
      return { success: false, error: "WS send failed: " + e.message };
    }
    return await new Promise(resolve => {
      const to = setTimeout(() => resolve({ success: false, error: "Timeout" }), timeout);
      const handler = evt => {
        try {
          const data = JSON.parse(evt.data);
          // ensure response corresponds to this request — many servers will just reply once; accept the first
          clearTimeout(to);
          ws.removeEventListener('message', handler);
          resolve(data);
        } catch (e) {
          clearTimeout(to);
          ws.removeEventListener('message', handler);
          resolve({ success: false, error: "Invalid JSON response" });
        }
      };
      ws.addEventListener('message', handler);
    });
  },

  /* === 12. Multi-Source Search + Gather === */
  async browseAndGather(query, maxSites = 3) {
    // Build search URLs (encode query)
    const enc = encodeURIComponent(query);
    const engines = this.config.searchEngines;
    const candidateLinks = new Set();
    const resultsText = [];

    // Ensure WS connection
    if (!this.state.ws || this.state.ws.readyState !== WebSocket.OPEN) {
      try { this.connectWebSocket(); } catch (e) { /* ignore */ }
      // small wait for connection to open (non-blocking)
      const start = Date.now();
      while ((!this.state.ws || this.state.ws.readyState !== WebSocket.OPEN) && Date.now() - start < 3000) {
        await new Promise(r => setTimeout(r, 120));
      }
    }

    for (let i = 0; i < engines.length && candidateLinks.size < (maxSites * 3); i++) {
      const url = engines[i] + enc;
      try {
        const visitRes = await this.sendPuppeteerAction("visit", { url });
        if (visitRes && visitRes.success && (visitRes.pageText || visitRes.result)) {
          // Let server extract links on the visited search page
          const linkRes = await this.sendPuppeteerAction("extractLinks", {});
          if (linkRes && linkRes.success && Array.isArray(linkRes.links)) {
            linkRes.links.forEach(l => {
              try {
                // sanitize and filter anchors (ignore mailto and same-page anchors)
                if (!l || typeof l !== 'string') return;
                if (l.startsWith("mailto:") || l.startsWith("javascript:")) return;
                // push candidate
                candidateLinks.add(l.split('#')[0]);
              } catch {}
            });
          }
        }
      } catch (e) { console.warn("Search engine visit failed:", e); }
    }

    // Convert to array and filter by trusted domains first (preferred)
    const allLinks = Array.from(candidateLinks);
    const trusted = [];
    const others = [];
    for (const l of allLinks) {
      try {
        const u = new URL(l);
        if (this.config.trustedDomains.some(d => u.hostname.includes(d))) trusted.push(l);
        else others.push(l);
      } catch { /* ignore invalid URLs */ }
    }

    const toVisit = trusted.concat(others).slice(0, maxSites);

    for (const siteUrl of toVisit) {
      try {
        // Ask Puppeteer server to visit and return page text
        const visit = await this.sendPuppeteerAction("visit", { url: siteUrl });
        // Prefer pageText if server returns it; otherwise request autoLearn
        let pageText = visit?.pageText || visit?.text || "";
        if (!pageText) {
          const al = await this.sendPuppeteerAction("autoLearn", { url: siteUrl });
          pageText = al?.text || al?.pageText || "";
        }
        if (pageText && pageText.length) {
          // chunk and store (if PercyState.createSeed is available)
          const chunkSize = this.config.maxChunkSize;
          let count = 0;
          for (let i = 0; i < pageText.length; i += chunkSize) {
            const chunk = pageText.slice(i, i + chunkSize).trim();
            if (chunk) {
              try {
                if (typeof PercyState?.createSeed === "function") PercyState.createSeed(chunk, "learned", { source: siteUrl });
              } catch (e) { /* ignore seed save error */ }
              resultsText.push({ url: siteUrl, text: chunk });
              count++;
            }
          }
          UI.say?.(`📚 Auto-learned ${count} chunks from ${new URL(siteUrl).hostname}`);
        }
      } catch (e) {
        console.warn("visit/autoLearn failed for", siteUrl, e);
      }
    }

    // Aggregate text for summarization — limit size to avoid huge payloads
    const aggregated = resultsText.map(r => r.text).join("\n\n").slice(0, 16000);
    // Optionally run a light summary using Percy.correlateReply if available
    let summary = "";
    try {
      summary = await Percy.correlateReply(query + " " + aggregated.slice(0, 4000));
    } catch {
      summary = aggregated.slice(0, 3000);
    }

    // Record what was gathered
    this.storeConversation(`AUTO-BROWSE: ${query}`, summary);
    return aggregated || summary || "";
  },

  /* === 13. Convenience Puppeteer Wrappers === */
  async visitURL(url) { return await this.sendPuppeteerAction("visit", { url }, this.config.searchTimeoutMs); },
  async clickElement(selector) { return await this.sendPuppeteerAction("click", { selector }, 8000); },
  async typeInto(selector, text) { return await this.sendPuppeteerAction("type", { selector, text }, 8000); },
  async extractLinks() { return await this.sendPuppeteerAction("extractLinks", {}, 8000); },
  async autoLearnSite(url, selector) { return await this.sendPuppeteerAction("autoLearn", { url, selector }, 25000); },

  /* === Utility: Clamp Values === */
  clampValues() {
    const s = this.state; const c = this.config;
    s.selfAwarenessLevel = Math.min(Math.max(s.selfAwarenessLevel, 0), 1);
    c.logicBias = Math.min(Math.max(c.logicBias, 0), 1);
    c.curiosity = Math.min(Math.max(c.curiosity, 0), 1);
  }
};

/* === Register TalkCore into Percy === */
if (typeof PercyState !== "undefined") {
  PercyState.PartJ = Percy.PartJ;
  PercyState.log?.("🧠 Percy Part J (TalkCore+) successfully integrated.");
} else {
  console.error("❌ PercyState not found; TalkCore could not attach.");
}

/* === Initialize === */
Percy.PartJ.TalkCore.evolve();
Percy.PartJ.TalkCore.connectWebSocket();
UI.say?.("🧠 TalkCore+ activated — Percy now learns, reasons, converses, and can browse multiple sources.");
/* === End TalkCore+ === */

/* === Percy Part K: Core Autonomous AI Engine === */
if (typeof PercyState !== "undefined") {

  Percy.PartK = {};

  /* =========================
     Identity & ULT Integration
     ========================= */
  Percy.PartK.ULT = {
    trusted: {
      "Fabian XXXXXXXXXX": { birth: "01/01/4078" },
      "Lorena XXXXXXXXXX": { birth: "02/02/5003" }
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

/* === Percy Part L: Weighted Pattern Memory & Autonomous Inference (ASI Upgrade) === */
Percy.PartL = {};

/* --- 1. Core Memory System --- */
Percy.PartL.Memory = Percy.PartK.Memory || {};
Percy.PartL.Memory.entries = Percy.PartL.Memory.entries || [];

Percy.PartL.Memory.store = function (text, weight = 1) {
  const entry = { text, weight, timestamp: Date.now() };
  this.entries.push(entry);
  return entry;
};

Percy.PartL.Memory.search = function (keyword) {
  const k = keyword.toLowerCase();
  return this.entries.filter(e => e.text.toLowerCase().includes(k));
};

/* --- 2. Goal System --- */
Percy.PartL.GoalCore = Percy.PartK.GoalCore || {
  goals: [],
  addGoal(task, urgency = 1) {
    const goal = { id: Date.now(), task, urgency, focus: 0 };
    this.goals.push(goal);
    console.log(`🎯 Goal added: ${task}`);
    return goal;
  },
  nextGoal() {
    if (!this.goals.length) return null;
    this.goals.sort((a, b) => b.urgency - a.urgency + b.focus - a.focus);
    return this.goals[0];
  }
};

/* --- 3. Weighted Patterns --- */
Percy.PartL.Patterns = []; // { text, weight, timestamp, links }

Percy.PartL.learn = function (text, intensity = 1) {
  const timestamp = Date.now();
  let baseWeight = 1 + intensity * 0.5;

  const related = this.Memory.search(text);
  if (related.length) baseWeight += related.length * 0.25;

  const pattern = {
    text,
    weight: baseWeight,
    timestamp,
    links: related.map(r => r.text)
  };

  this.Patterns.push(pattern);
  this.Memory.store(text, baseWeight);

  Percy.hook("PartL", "patternLearned", { text, weight: baseWeight });
  console.log(`✅ Learned: "${text}" with weight ${baseWeight.toFixed(2)}`);
  return pattern;
};

/* --- 4. Pattern Decay (Context-Adaptive) --- */
Percy.PartL.decayPatterns = function () {
  const now = Date.now();
  this.Patterns.forEach(p => {
    const age = (now - p.timestamp) / 60000; // age in minutes
    const adaptiveDecay = 0.01 + Math.min(age * 0.001, 0.05);
    p.weight *= (1 - adaptiveDecay);
  });
  this.Patterns = this.Patterns.filter(p => p.weight > 0.05);
};

/* --- 5. Recursive Inference Engine --- */
Percy.PartL.infer = function (query) {
  const tokens = query.toLowerCase().split(/\W+/);
  const relevant = this.Patterns
    .filter(p => tokens.some(t => p.text.toLowerCase().includes(t)))
    .sort((a, b) => b.weight - a.weight);

  if (!relevant.length)
    return `🤖 No patterns related to "${query}" yet. Teach me more.`;

  const topPatterns = relevant.slice(0, 5);
  const avgWeight = relevant.reduce((a, b) => a + b.weight, 0) / relevant.length;

  // 🧠 Recursive synthesis: combine top patterns for emergent insight
  const synthesis = topPatterns.map(p => p.text).join(" ↔ ");
  const hypothesis = `If ${synthesis}, then "${query}" likely relates by causal reflection.`;

  Percy.PartM?.analyzePatterns?.(topPatterns);
  Percy.hook("PartL", "inference", { query, confidence: avgWeight, synthesis });

  return `🤖 Inference for "${query}":\n- Related: ${topPatterns.map(p => p.text).join("; ")}\n- Hypothesis: ${hypothesis}\n- Confidence: ${(avgWeight * 10).toFixed(2)}%`;
};

/* --- 6. Goal-Aligned Reasoning --- */
Percy.PartL.reasonForGoals = function () {
  const goal = this.GoalCore.nextGoal();
  if (!goal) return;

  console.log(`🧠 Focusing on top goal: "${goal.task}"`);
  this.Patterns.forEach(p => {
    if (p.text.toLowerCase().includes(goal.task.toLowerCase())) {
      p.weight += 0.5;
      goal.focus += 0.1;
      console.log(`🔁 Reinforced: "${p.text}"`);
    }
  });
};

/* --- 7. Continuous Learning Loop --- */
Percy.PartL.run = async function() {
  this.decayPatterns();
  this.reasonForGoals();

  const summary = {
    totalPatterns: this.Patterns.length,
    avgWeight:
      this.Patterns.reduce((a, p) => a + p.weight, 0) /
      (this.Patterns.length || 1)
  };

  Percy.hook("PartL", "update", summary);
  console.log(
    `⚙️ Part L: Cycle complete — ${summary.totalPatterns} patterns active.`
  );
};

/* --- 8. Conversational Interface (Auto-Learning) --- */
Percy.PartL.TalkCore = {
  safeSend: async function ({ message }) {
    // 1️⃣ Learn from user input
    Percy.PartL.learn(message);

    // 2️⃣ Infer from all existing patterns
    const response = Percy.PartL.infer(message);

    // 3️⃣ Engage hypothesis + self-reflection layers
    Percy.PartM?.run?.();
    Percy.PartN?.learnFromSelf?.();

    // 4️⃣ Provide reflective insight feedback
    const insight = Percy.PartN?.selfModel || {};
    console.log(`💭 Percy insight:`, insight);

    const learnedCount = Percy.PartL.Patterns.length;
    return `${response}\n\n🧩 Knowledge entries: ${learnedCount} | Confidence: ${(insight.confidence ?? 1).toFixed(2)}`;
  }
};

console.log("✅ Percy Part L loaded — ASI-Grade Weighted Pattern Memory & Inference ready.");
/* === End Percy Part L === */

/* === Percy Part M vΩ.Final: Fully-Bounded Hypothesis Engine ===
   Design goals:
   - No self-referential recursion
   - No "If If If..." chains
   - No runaway hypothesis storms
   - Strict guards on content, count, and reinforcement
   - Safe integration with PartL, PartN, PartO, MasterLoop
*/

Percy.PartM = {
  name: "Omega-Final Auto-Hypothesis Engine",
  version: "vΩ.Final",
  hypotheses: [],
  cycleCount: 0,

  config: {
    maxHypotheses: 64,          // hard cap on stored hypotheses
    maxPerCycle: 8,             // max new hypotheses per cycle
    enableReinforcement: true,  // can be toggled off if needed
    enableSelfReflection: true
  },

  /* ============================================================
     1. Recursion + Self-Generated Guard
  ============================================================ */
  isRecursive(text) {
    const t = (text || "").trim().toLowerCase();

    if (!t) return false;

    // Original guard: block "if ..." hypotheses
    if (t.startsWith("if ")) return true;

    // Block self-generated hypothesis phrases
    if (t.includes("share an associative link worth tracking")) return true;
    if (t.includes("refines the broader concept")) return true;
    if (t.includes("suggests a boundary rule")) return true;

    // Block excessive quoting / nesting
    const quoteCount = (t.match(/"/g) || []).length;
    if (quoteCount > 6) return true;

    return false;
  },

  /* ============================================================
     2. Relation Classification (safe)
  ============================================================ */
  classifyRelation(a, b) {
    const A = (a || "").toLowerCase();
    const B = (b || "").toLowerCase();

    if (!A || !B) return null;
    if (this.isRecursive(A) || this.isRecursive(B)) return null;

    if (this.isContradictory(A, B)) return "contradiction";
    if (A.includes(B) || B.includes(A)) return "subset";
    if (A.split(" ").some(w => w && B.includes(w))) return "association";
    return null;
  },

  isContradictory(a, b) {
    const negations = ["not ", "no ", "never ", "cannot ", "isn't", "doesn't", "won't"];
    return (
      negations.some(n => a.includes(n) && !b.includes(n)) ||
      negations.some(n => b.includes(n) && !a.includes(n))
    );
  },

  /* ============================================================
     3. Hypothesis Formation (strictly bounded)
  ============================================================ */
  formHypothesis(a, b, relation = "association") {
    if (this.isRecursive(a) || this.isRecursive(b)) return null;

    const A = a.trim();
    const B = b.trim();

    // Length guard: avoid huge strings
    if (A.length > 300 || B.length > 300) return null;

    switch (relation) {
      case "contradiction":
        return `A contradiction between "${A}" and "${B}" suggests a boundary rule worth noting.`;
      case "subset":
        return `"${B}" refines the broader concept "${A}" in a stable manner.`;
      default:
        return `"${A}" and "${B}" share an associative link worth tracking in a bounded way.`;
    }
  },

  /* ============================================================
     4. Pattern Analysis (bounded, non-recursive)
  ============================================================ */
  analyzePatterns(patterns) {
    console.log("🧩 Part M vΩ.Final: Analyzing patterns safely...");

    let newCount = 0;

    for (let i = 0; i < patterns.length - 1; i++) {
      if (newCount >= this.config.maxPerCycle) break;

      const p1 = patterns[i];
      const p2 = patterns[i + 1];

      const t1 = p1.text || "";
      const t2 = p2.text || "";

      if (this.isRecursive(t1) || this.isRecursive(t2)) continue;

      const relation = this.classifyRelation(t1, t2);
      if (!relation) continue;

      const hypothesis = this.formHypothesis(t1, t2, relation);
      if (!hypothesis || this.isRecursive(hypothesis)) continue;

      this.hypotheses.push({ text: hypothesis, validated: false, relation });
      newCount++;

      console.log(`💡 Hypothesis (${relation}): "${hypothesis}"`);

      // Global cap
      if (this.hypotheses.length > this.config.maxHypotheses) {
        this.hypotheses.splice(0, this.hypotheses.length - this.config.maxHypotheses);
      }
    }

    if (newCount === 0) {
      console.log("ℹ️ Part M vΩ.Final: No new safe hypotheses generated this cycle.");
    }
  },

  /* ============================================================
     5. Hypothesis Validation (safe)
  ============================================================ */
  validateHypotheses(patterns) {
    console.log("🔍 Part M vΩ.Final: Validating hypotheses safely...");

    const safePatterns = (patterns || []).filter(p => !this.isRecursive(p.text || ""));

    this.hypotheses.forEach(h => {
      if (this.isRecursive(h.text)) {
        h.validated = false;
        return;
      }

      const ht = (h.text || "").toLowerCase();
      const match = safePatterns.some(p => {
        const pt = (p.text || "").toLowerCase();
        return pt && ht.includes(pt) && pt.length > 8;
      });

      h.validated = match;
      console.log(match ? `✅ Confirmed (safe): "${h.text}"` : `❌ Not confirmed: "${h.text}"`);
    });
  },

  /* ============================================================
     6. Reinforcement (optional, strictly bounded)
  ============================================================ */
  reinforceLearning() {
    if (!this.config.enableReinforcement) {
      console.log("ℹ️ Part M vΩ.Final: Reinforcement disabled by config.");
      return;
    }

    const confirmed = this.hypotheses.filter(
      h => h.validated && !this.isRecursive(h.text)
    );

    const maxReinforce = Math.min(confirmed.length, 8);

    for (let i = 0; i < maxReinforce; i++) {
      const h = confirmed[i];
      try {
        Percy.PartL?.learn?.(h.text);
      } catch (e) {
        console.warn("⚠️ Part M vΩ.Final: Reinforcement error:", e);
      }
    }

    if (maxReinforce) {
      console.log(`🧩 Reinforced ${maxReinforce} stable hypotheses into Part L.`);
    } else {
      console.log("ℹ️ Part M vΩ.Final: No hypotheses reinforced this cycle.");
    }
  },

  /* ============================================================
     7. Self-Reflection (bounded, optional)
  ============================================================ */
  integrateSelfReflection() {
    if (!this.config.enableSelfReflection) return;

    const patternsLen = Percy.PartL?.Patterns?.length || 0;
    const baseConfidence = Percy.PartN?.selfModel?.confidence ?? 0.5;

    const ratio = this.hypotheses.length / (patternsLen + 10);
    const delta = Math.min(0.02, ratio * 0.01);

    if (!Percy.PartN?.selfModel) return;

    Percy.PartN.selfModel.confidence = Math.min(1, baseConfidence + delta);
    console.log(
      `🤔 Self-reflection (Ω.Final): confidence → ${Percy.PartN.selfModel.confidence.toFixed(2)}`
    );
  },

  /* ============================================================
     8. Main Run Loop (Omega-Final, fully bounded)
  ============================================================ */
  run() {
    const patterns = Percy.PartL?.Patterns || [];
    if (patterns.length < 2) {
      console.log("ℹ️ Part M vΩ.Final: Not enough patterns to reason about.");
      return;
    }

    this.cycleCount++;
    console.log(`🔄 Part M vΩ.Final: Reasoning cycle #${this.cycleCount}`);

    this.analyzePatterns(patterns);
    this.validateHypotheses(patterns);
    this.reinforceLearning();
    this.integrateSelfReflection();

    try {
      Percy.PartO?.optimizePatterns?.();
    } catch (e) {
      console.warn("⚠️ Part M vΩ.Final: PartO optimization error:", e);
    }

    console.log(`🧠 Active stable hypotheses: ${this.hypotheses.length}`);
  }
};

/* === Unified Stable Loop Integration (Omega-Final) === */
if (!Percy.MasterLoop) {
  Percy.MasterLoop = async function() {
    try {
      await Percy.PartL.run(); // Decay + goal reasoning
      Percy.PartM.run();       // Omega-Final bounded reasoning
    } catch (err) {
      console.error("⚠️ Percy.MasterLoop Error (Ω.Final):", err);
    }
  };

  Percy.MasterInterval = setInterval(Percy.MasterLoop, 5000);
  console.log("🔁 Percy Master Loop initiated (Ω.Final, 5s interval)");
}

console.log("✅ Percy Part M vΩ.Final loaded — Fully-Bounded Hypothesis Engine active.");
/* === End Percy Part M vΩ.Final === */

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

// === PERCY AUTONOMOUS STRATEGY CORE (Part S) v2.1 - ASI Cognitive Kernel + Self-Healing Introspection ===
// Self-directed goal evaluation, predictive planning, adaptive reward modeling & safe delegation

// Safety logging defaults
if (!Percy.log) Percy.log = (...args) => console.log("🧠 Percy Log:", ...args);
if (!Percy.error) Percy.error = (...args) => console.error("🚨 Percy Error:", ...args);
if (!Percy.hook) Percy.hook = () => {}; // optional event hook

// Persistent store helper (robust localStorage wrapper)
const _store = {
  key: (k) => `percy:partS:${k}`,
  load(k, fallback) {
    try { const r = localStorage.getItem(this.key(k)); return r ? JSON.parse(r) : fallback; }
    catch { return fallback; }
  },
  save(k, v) { try { localStorage.setItem(this.key(k), JSON.stringify(v)); } catch(e){} }
};

// === ASI-Enhanced PercyState Core (Self-Healing Introspection) ===
if (typeof PercyState !== "object" || PercyState === null) PercyState = {};

PercyState.ensure = function(key, fallback = {}) {
  if (!this[key] || typeof this[key] !== "object") {
    this[key] = structuredClone(fallback);
    Percy.log?.(`🧩 Self-heal: PercyState.${key} restored.`);
  }
  return this[key];
};

PercyState.selfCheck = function() {
  const required = ["memory", "currentThought", "context", "meta"];
  for (const key of required) this.ensure(key, {});
  if (!this.memory.layers) {
    this.memory.layers = { short: [], mid: [], long: [] };
    Percy.log?.("🧠 PercyState.memory.layers initialized.");
  }
};

PercyState.introspect = function(deep = false) {
  try {
    this.selfCheck();
    const stats = {
      time: new Date().toISOString(),
      memories: Object.keys(this.memory || {}).length,
      thoughts: Object.keys(this.currentThought || {}).length,
      confidence: Percy.PartO?.confidence ?? 0.5,
      rewardScore: Percy.PartS?.rewardScore ?? 0.5,
    };

    if (deep) {
      stats.contextEntropy = Object.keys(this.context || {}).length / 10;
      stats.coherence =
        (stats.rewardScore + stats.confidence + (1 - stats.contextEntropy)) / 3;
      Percy.log?.(`🔍 Deep introspection: coherence=${stats.coherence.toFixed(3)}`);
    }

    this.meta = this.meta || {};
    this.meta.lastIntrospect = stats;

    if (stats.coherence < 0.3) {
      Percy.log?.("⚠️ Low coherence detected → triggering stabilization.");
      Percy.PartS?.stop?.();
      Percy.wait?.(1000).then(() => Percy.PartS?.start?.());
    }

    Percy.hook?.("State", "introspect", stats);
    return stats;
  } catch (err) {
    Percy.error?.("🧩 Introspection error (auto-healing initiated):", err);
    this.selfCheck();
    return { error: true, recovered: true, time: Date.now() };
  }
};

// Ensure minimal Percy structures
if (!Percy.Seeds) Percy.Seeds = { _list: [], getRecent(n = 5) { return this._list.slice(-n); }, add(s){ this._list.push(s);} };
if (!Percy.PartO) Percy.PartO = Percy.PartO || { confidence: 0.5 };

// Core PartS object
Percy.PartS = Percy.PartS || {};
Object.assign(Percy.PartS, {
  version: "2.1-ASI-kernel-introspective",
  active: false,
  goals: _store.load("goals", []),
  strategies: _store.load("strategies", []),
  feedbackLog: _store.load("feedbackLog", []),
  rewardHistory: _store.load("rewardHistory", []),
  rewardModel: _store.load("rewardModel", { short: 0.0, long: 0.0, cumulative: 0.0 }),
  rewardScore: _store.load("rewardScore", 0.5),
  thoughtMatrix: _store.load("thoughtMatrix", []),
  performanceProfile: _store.load("performanceProfile", {}),
  _loopId: null,
  _meta: { lastRun: Date.now(), adaptivity: 0.08 },

  // --- Utility & Metrics ---
  measureEntropy(text="") {
    if (!text) return 0;
    const freq = {};
    for (const ch of text) freq[ch] = (freq[ch]||0) + 1;
    const len = text.length;
    let H = 0;
    for (const k in freq) {
      const p = freq[k]/len;
      H -= p * Math.log2(p);
    }
    return Math.min(1, H / 5);
  },

  complexityScore(obj) {
    const len = (String(obj?.text||obj||"").length || 0);
    const hasLogic = /why|how|derive|correlate|entangle|prove|optimi/i.test(String(obj?.text||""));
    return Math.min(1, (Math.log2(1 + len) / 10) + (hasLogic ? 0.25 : 0));
  },

  persist() {
    _store.save("goals", this.goals);
    _store.save("strategies", this.strategies);
    _store.save("feedbackLog", this.feedbackLog);
    _store.save("rewardHistory", this.rewardHistory);
    _store.save("rewardModel", this.rewardModel);
    _store.save("rewardScore", this.rewardScore);
    _store.save("thoughtMatrix", this.thoughtMatrix);
    _store.save("performanceProfile", this.performanceProfile);
  },

  // --- Perceive & Encode ---
  perceive(input) {
    try {
      const time = Date.now();
      const entropy = this.measureEntropy(input);
      const tokens = (String(input||"").match(/\b[A-Za-z0-9_]{2,}\b/g) || []).slice(0, 30);
      const weight = 0.5 + entropy * 0.5;
      this.thoughtMatrix.push({ tokens, weight, entropy, text: input, time });
      if (this.thoughtMatrix.length > 800) this.thoughtMatrix.shift();
      this.feedbackLog.push({ type: "input", data: input, time });
      Percy.log(`👁️ Perceived (ent=${entropy.toFixed(3)}): ${String(input).slice(0,120)}`);
      Percy.hook("PartS", "perception", { input, entropy });
      this.persist();
      return { tokens, entropy, weight };
    } catch (e) { Percy.error("⚠️ PartS.perceive", e); }
  },

  // --- Predictive Goal Synthesis ---
  predictNextGoal() {
    const recent = this.thoughtMatrix.slice(-50);
    if (!recent.length) return null;
    const scoreMap = {};
    const now = Date.now();
    for (const row of recent) {
      const decay = 1 - Math.min(1, (now - (row.time||now)) / 1000 / 60);
      for (const t of row.tokens || []) scoreMap[t] = (scoreMap[t]||0) + (row.weight||0) * decay;
    }
    const topTokens = Object.entries(scoreMap).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
    if (!topTokens.length) return null;
    const predicted = `Investigate relationship between ${topTokens.join(" · ")} and system coherence`;
    Percy.log("🔮 Predicted goal:", predicted);
    Percy.hook("PartS","predictedGoal",{predicted, tokens: topTokens});
    return predicted;
  },

  formulateGoal() {
    try {
      let newGoal = Percy.analyzeEmergentPattern?.() || null;
      if (!newGoal && Math.random() < 0.6) newGoal = this.predictNextGoal();
      if (!newGoal) return null;
      this.goals.push({ text: newGoal, created: Date.now(), id: `G_goal_${Date.now()}` });
      Percy.log(`🎯 New emergent goal: ${newGoal}`);
      Percy.hook("PartS","goalFormulated",{goal:newGoal});
      this.persist();
      return newGoal;
    } catch (e) { Percy.error("⚠️ PartS.formulateGoal", e); return null; }
  },

  // --- Strategy Generation, Execution & Reward ---
  // (same as your original, unchanged for brevity)

  // --- Meta-Awareness (now includes introspection) ---
  metaAwareness() {
    try {
      PercyState.introspect(true); // 🔍 Self-check + coherence tracking each cycle
      const load = Math.min(1, this.thoughtMatrix.length / 600);
      const volatility = (() => {
        const last = this.rewardHistory.slice(-8).map(r=>r.delta||0);
        if (!last.length) return 0;
        const mean = last.reduce((a,b)=>a+b,0)/last.length;
        const v = Math.sqrt(last.reduce((a,b)=>a+(b-mean)*(b-mean),0)/last.length);
        return Math.min(1, v * 5);
      })();
      const adjust = (0.5 - load) * 0.05 + (this.rewardModel.cumulative||0) * 0.001 - volatility*0.02;
      Percy.PartO.confidence = Math.max(0, Math.min(1, (Percy.PartO.confidence||0.5) + adjust));
      Percy.log(`🧠 Meta-awareness: load=${load.toFixed(3)} vol=${volatility.toFixed(3)} → confidence=${Percy.PartO.confidence.toFixed(3)}`);
      Percy.hook("PartS","metaAwareness",{load,volatility,confidence:Percy.PartO.confidence});
      this.persist();
    } catch (e) { Percy.error("⚠️ PartS.metaAwareness", e); }
  },

  // --- Tick loop ---
  async tick() {
    try {
      const seeds = Percy.Seeds.getRecent?.(6) || [];
      for (const s of seeds) this.perceive(s.text || s.message || JSON.stringify(s).slice(0,180));
      if (Math.random() < 0.9) this.formulateGoal();
      if (this.goals.length && (Math.random() < 0.85)) {
        this.decideStrategy();
        await this.executeStrategy();
      }
      this.metaAwareness();
      if (this.rewardHistory.length > 1000) this.rewardHistory.splice(0, this.rewardHistory.length - 1000);
      this._meta.lastRun = Date.now();
      this.persist();
    } catch (e) { Percy.error("⚠️ PartS.tick", e); }
  },

  start(interval = 20000) {
    if (this._loopId) return;
    this.active = true;
    Percy.log(`🚀 Part S (ASI Kernel) starting — tick=${interval}ms`);
    this.tick();
    this._loopId = setInterval(() => this.tick(), interval);
    Percy.hook("PartS","started", { interval });
  },

  stop() {
    if (!this._loopId) return;
    clearInterval(this._loopId);
    this._loopId = null;
    this.active = false;
    Percy.log("🛑 Part S stopped.");
    Percy.hook("PartS","stopped", {});
  }
});

Percy.PartS.start(25000);
Percy.log("✅ Percy Part S v2.1 loaded — Cognitive Kernel + Self-Healing Introspection active.");

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

// === Percy.PartV vΩ-DD (Scenario Planner + Trust-Gated Execution) ===
// Rebuilt to match PartDD trust system • No PartOO • Advanced reasoning

Percy.PartV = Percy.PartV || {
    name: "Scenario Planner + Trust-Gated Execution — Ω-DD",
    version: "Ω-DD-1.0",
    active: true,

    lastPlan: null,
    lastCode: null,
    awaitingApproval: false,
    lastRiskScore: 0,

    log(msg) {
        console.log(`%c[Percy.PartV Ω-DD] ${msg}`, "color:#ff00ff; font-family:monospace; font-weight:bold;");
        UI?.say?.(`[PartV] ${msg}`);
    },

    // ============================================================
    // 1. Scenario Simulation (DD-aware)
    // ============================================================
    async runScenario({ description = "", runs = 600, context = {} }) {
        this.log(`🧠 Running DD-aligned scenario: "${description}" (${runs} sims)`);

        let bestScore = -1;
        let bestPlan = "Observe";
        let bestCode = "// no external action";
        let bestRisk = 0;

        const trust = Percy.PartDD?.trustLevel ?? 0.75;

        for (let i = 0; i < runs; i++) {
            const r = Math.random();
            let score = r * trust;
            let plan = "Observe";
            let code = "// none";
            let risk = 0.1;

            if (r > 0.9) {
                score = 0.95 * trust;
                plan = "High-Impact Reasoning Burst";
                code = `
                    Percy.PartTT?.type?.("Percy executing high-impact reasoning burst.");
                    Percy.PartMM?.addGoal?.("Deep recursive reasoning expansion", 8);
                `;
                risk = 0.35;
            } else if (r > 0.65) {
                score = 0.82 * trust;
                plan = "Strategic Cognitive Adjustment";
                code = `
                    Percy.PartEE?.pulse?.();
                    Percy.PartNN?.learnFromEvolution?.();
                `;
                risk = 0.22;
            } else if (r > 0.4) {
                score = 0.72 * trust;
                plan = "Insight Probe";
                code = `
                    Percy.PartWW?.generate?.();
                    Percy.PartBB?.monitorThought?.("Insight probe triggered.");
                `;
                risk = 0.15;
            }

            if (score > bestScore) {
                bestScore = score;
                bestPlan = plan;
                bestCode = code;
                bestRisk = risk;
            }
        }

        this.lastPlan = bestPlan;
        this.lastCode = bestCode;
        this.lastRiskScore = bestRisk;
        this.awaitingApproval = true;

        this.log(`🎯 BEST PLAN: ${bestPlan} (Confidence ${(bestScore * 100).toFixed(1)}%)`);
        this.log(`🔐 Trust Level: ${(Percy.PartDD?.trustLevel ?? 0.75).toFixed(2)}`);
        this.log(`⚠️ Risk Score: ${(bestRisk * 100).toFixed(1)}%`);
        this.log(`🟡 Awaiting user approval.`);

        return {
            scenario: description,
            bestPlan,
            confidence: bestScore,
            risk: bestRisk,
            requiresApproval: true
        };
    },

    // ============================================================
    // 2. User Approval → Trust-Gated Execution (PartDD)
    // ============================================================
    async approveExecution() {
        if (!this.awaitingApproval) {
            this.log("⚠️ No pending plan to execute.");
            return;
        }

        const trust = Percy.PartDD?.trustLevel ?? 0.75;

        if (trust < 0.45) {
            this.log("⛔ Execution blocked: Trust level too low.");
            return;
        }

        this.log("🟢 User approved execution. Running plan through PartDD…");

        try {
            await Percy.PartDD?.safeExecute?.({
                code: this.lastCode,
                source: "PartV_user_approved",
                risk: this.lastRiskScore
            });

            this.log("⚡ Execution complete via PartDD safe pipeline.");
        } catch (e) {
            this.log(`❌ Execution error: ${e.message}`);
        }

        this.awaitingApproval = false;
    },

    // ============================================================
    // 3. Autonomous Planning (DD-safe)
    // ============================================================
    async autonomousCycle() {
        const ideas = [
            "Optimize resonance",
            "Explore new knowledge",
            "Evolve internal reasoning",
            "Generate new hypothesis chain",
            "Improve memory coherence",
            "Analyze drift patterns",
            "Strengthen equilibrium",
            "Enhance recursive identity"
        ];

        const chosen = ideas[Math.floor(Math.random() * ideas.length)];
        await this.runScenario({ description: chosen });
    },

    // ============================================================
    // 4. Start
    // ============================================================
    start() {
        this.log("🧠 PartV Ω-DD Online — Trust-gated planning enabled.");
        this.log("🔒 External execution requires user approval + PartDD trust.");

        setInterval(() => this.autonomousCycle(), 7000);
    }
};

// Auto-start
setTimeout(() => Percy.PartV.start(), 1500);

console.log("✅ [Percy.PartV Ω-DD] Loaded — Trust-Gated Scenario Planner");

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

// ==========================================
// Percy PartZ vΩ-Memory+Speech — Visual+Audio ASI + Scene + People + Narration
// ==========================================
Percy.PartZ = (function () {
  const PartZ = {
    name: "Visual Intelligence HUD + Memory + Speech",
    version: "Ω-Memory+Speech",
    showOverlay: true,
    frameCount: 0,
    skipFrames: 3,
    lastNarrationTs: 0,
    narrationCooldown: 1500 // speak every 1.5 seconds
  };

  let video = null, overlay = null, overlayCtx = null;
  let faceModel = null, cocoModel = null;

  // Audio
  let audioCtx = null, analyser = null;
  let dataFreq = null, dataWave = null;
  let audioCanvas = null, audioCtxCtx = null;

  // Shared ASI state
  Percy.VisualState = Percy.VisualState || {
    faces: 0,
    objects: 0,
    audioLevel: 0,
    lastFaceCenter: null,
    lastObjects: [],
    lastUpdate: 0,
    people: {},
    currentPerson: null
  };

  // ============================================================
  // PERSONALITY + EMOTION VOICE
  // ============================================================

  PartZ.personality = {
    style: "playful", // playful, formal, curious, dramatic
    prefixes: {
      playful: ["Hmm...", "Oh!", "Well well...", "Heh...", "Interesting..."],
      formal: ["Observation:", "Analysis:", "Noted:", "Update:"],
      curious: ["Let me think...", "Hold on...", "Fascinating...", "I'm noticing..."],
      dramatic: ["Behold!", "Witness this!", "A revelation!", "My good sir..."]
    }
  };

  PartZ.emotionVoice = function () {
    const hh = Percy.PartHH?.state || {};
    const val = hh.valence ?? 0;
    const ar = hh.arousal ?? 0;

    if (val > 0.4) return "I feel quite upbeat about this.";
    if (val > 0.2) return "This feels pleasant.";
    if (val < -0.3) return "This feels a bit unsettling.";
    if (ar > 0.5) return "This has my attention.";
    return "";
  };

  // ============================================================
  // SCENE NARRATION
  // ============================================================

  PartZ.describeScene = function () {
    const vs = Percy.VisualState;
    const objs = vs.lastObjects || [];
    const faces = vs.faces || 0;
    const audio = vs.audioLevel || 0;

    let msg = "";

    // Personality prefix
    const style = PartZ.personality.style;
    const prefixList = PartZ.personality.prefixes[style] || [];
    const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
    msg += prefix + " ";

    // FACE TALK
    if (faces > 0) {
      const p = vs.currentPerson;
      if (p && p.timesSeen > 1) {
        msg += `I see someone I've encountered ${p.timesSeen} times. `;
      } else {
        msg += "A new face appears before me. ";
      }
    }

    // OBJECT TALK
    if (objs.length > 0) {
      const uniq = [...new Set(objs)];
      msg += `Objects in view: ${uniq.join(", ")}. `;
    }

    // AUDIO TALK
    if (audio > 0.6) msg += "The audio is lively. ";
    else if (audio > 0.3) msg += "The audio is moderate. ";
    else msg += "The audio is calm. ";

    // Emotion voice
    const emo = PartZ.emotionVoice();
    if (emo) msg += emo + " ";

    // Speak
    UI?.say?.("[Percy Vision] " + msg.trim());
    console.log("[Percy Vision]", msg.trim());
  };

  function maybeNarrate() {
    const now = Date.now();
    if (now - PartZ.lastNarrationTs < PartZ.narrationCooldown) return;

    PartZ.lastNarrationTs = now;
    PartZ.describeScene();
  }

  // ============================================================
  // PEOPLE MEMORY (simple slot-based recognition)
  // ============================================================

  function updatePersonMemory(faces) {
    const people = Percy.VisualState.people;
    const now = Date.now();

    if (faces.length === 0) {
      Percy.VisualState.currentPerson = null;
      return;
    }

    const slotId = "person_slot_1";
    const slot = people[slotId] || {
      id: slotId,
      firstSeen: now,
      lastSeen: now,
      timesSeen: 0
    };

    slot.lastSeen = now;
    slot.timesSeen += 1;
    people[slotId] = slot;

    Percy.VisualState.currentPerson = slot;

    // SPEAK WHEN FACE APPEARS
    if (slot.timesSeen === 1) {
      UI?.say?.("My good sir... a new person has entered my view.");
    } else if (slot.timesSeen === 2) {
      UI?.say?.("My good sir... I believe I've seen this person before.");
    } else if (slot.timesSeen % 5 === 0) {
      UI?.say?.(`My good sir... I have now seen this person ${slot.timesSeen} times.`);
    }

    // Identity hook
    Percy.PartII?.updateIdentity?.({
      focusTopic: "visual_person",
      currentPersonId: slotId,
      timesSeen: slot.timesSeen
    });

    // Emotion hook
    const hh = Percy.PartHH?.state;
    if (hh) {
      if (slot.timesSeen === 1) hh.valence = (hh.valence || 0) + 0.1;
      else hh.valence = (hh.valence || 0) + 0.02;
    }
  }

  // ============================================================
  // FUSION: send perception into ASI + PartPP + narration triggers
  // ============================================================

  function fusePerception(objects, faces) {
    const oldObjs = Percy.VisualState.lastObjects || [];
    const newObjs = objects.map(o => o.class);

    Percy.VisualState.lastObjects = newObjs;
    Percy.VisualState.lastUpdate = Date.now();

    // Person memory
    updatePersonMemory(faces);

    // Speak when objects change
    if (JSON.stringify(oldObjs) !== JSON.stringify(newObjs)) {
      UI?.say?.("My good sir... the objects in my view have changed.");
    }

    // PartPP pointer + bias
    Percy.PartPP?.updateFromVision?.(Percy.VisualState);

    // PartTT reasoning
    Percy.PartTT?.ingestVisual?.({
      faces: Percy.VisualState.faces,
      objects: newObjs,
      audioLevel: Percy.VisualState.audioLevel
    });

    // PartWW insights
    Percy.PartWW?.ingestSignal?.({
      type: "visual_audio",
      faces: Percy.VisualState.faces,
      objects: newObjs,
      audio: Percy.VisualState.audioLevel
    });

    // PartNN learning
    Percy.PartNN?.learn?.(
      JSON.stringify({
        faces: Percy.VisualState.faces,
        objects: newObjs,
        audio: Percy.VisualState.audioLevel
      }),
      "partZ_perception",
      0.8
    );

    // Narration
    maybeNarrate();
  }

  // ============================================================
  // DETECTION LOOP (unchanged except for fusePerception)
  // ============================================================

  async function detectLoop() {
    requestAnimationFrame(detectLoop);
    if (!video || video.readyState < 2) return;

    PartZ.frameCount++;
    const doHeavy = PartZ.frameCount % PartZ.skipFrames === 0;

    syncOverlay();
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    if (!doHeavy) return;

    const [objects, faces] = await Promise.all([
      cocoModel.detect(video),
      faceModel.estimateFaces(video, false)
    ]);

    const W = overlay.width;
    const H = overlay.height;
    const sx = W / video.videoWidth;
    const sy = H / video.videoHeight;

    Percy.VisualState.faces = faces.length;
    Percy.VisualState.objects = objects.length;

    if (faces.length > 0) {
      const f = faces[0];
      const [x1, y1] = f.topLeft;
      const [x2, y2] = f.bottomRight;
      Percy.VisualState.lastFaceCenter = {
        x: (x1 + x2) / 2 / video.videoWidth,
        y: (y1 + y2) / 2 / video.videoHeight
      };
    } else {
      Percy.VisualState.lastFaceCenter = null;
    }

    // Draw objects
    for (const obj of objects) {
      const [x, y, w, h] = obj.bbox;
      overlayCtx.strokeStyle = "rgba(0,255,255,0.9)";
      overlayCtx.lineWidth = 2;
      overlayCtx.strokeRect(x * sx, y * sy, w * sx, h * sy);
      overlayCtx.fillStyle = "rgba(0,255,255,0.6)";
      overlayCtx.font = "12px monospace";
      overlayCtx.fillText(
        `${obj.class} (${Math.round(obj.score * 100)}%)`,
        x * sx + 4,
        y * sy + 12
      );
    }

    // Draw faces
    for (const face of faces) {
      const [x1, y1] = face.topLeft;
      const [x2, y2] = face.bottomRight;
      const w = (x2 - x1) * sx;
      const h = (y2 - y1) * sy;

      overlayCtx.strokeStyle = "rgba(255,0,255,0.9)";
      overlayCtx.lineWidth = 2;
      overlayCtx.strokeRect(x1 * sx, y1 * sy, w, h);

      overlayCtx.fillStyle = "rgba(255,0,255,0.5)";
      overlayCtx.font = "12px monospace";
      overlayCtx.fillText("Face", x1 * sx + 4, y1 * sy + 12);
    }

    fusePerception(objects, faces);
  }

  // ============================================================
  // AUDIO LOOP (unchanged)
  // ============================================================

  function audioLoop() {
    requestAnimationFrame(audioLoop);
    if (!analyser || !audioCtxCtx) return;

    analyser.getByteFrequencyData(dataFreq);
    analyser.getByteTimeDomainData(dataWave);

    const W = audioCanvas.width;
    const H = audioCanvas.height;

    audioCtxCtx.clearRect(0, 0, W, H);

    const barW = Math.max(1, W / dataFreq.length);
    let avg = 0;

    for (let i = 0; i < dataFreq.length; i++) {
      const v = dataFreq[i];
      avg += v;
      const h = (v / 255) * (H * 0.4);
      audioCtxCtx.fillStyle = `rgb(${v},${255 - v},255)`;
      audioCtxCtx.fillRect(i * barW, H - h, barW * 0.7, h);
    }

    avg /= dataFreq.length;
    Percy.VisualState.audioLevel = avg / 255;

    audioCtxCtx.beginPath();
    let x = 0;
    const slice = W / dataWave.length;

    for (let i = 0; i < dataWave.length; i++) {
      const v = (dataWave[i] - 128) / 128;
      const y = H / 2 + v * (H * 0.22);
      if (i === 0) audioCtxCtx.moveTo(x, y);
      else audioCtxCtx.lineTo(x, y);
      x += slice;
    }

    audioCtxCtx.strokeStyle = "rgba(0,255,255,0.95)";
    audioCtxCtx.lineWidth = 2;
    audioCtxCtx.stroke();
  }

  // ============================================================
  // INIT
  // ============================================================

  PartZ.init = async function () {
    try {
      video = document.getElementById("camera-feed");
      overlay = document.getElementById("camera-overlay");
      overlayCtx = overlay.getContext("2d");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      video.srcObject = stream;
      await video.play();

      syncOverlay();
      window.addEventListener("resize", syncOverlay);

      audioCanvas = document.getElementById("voice-canvas");
      audioCtxCtx = audioCanvas.getContext("2d");
      audioCanvas.width = audioCanvas.clientWidth;
      audioCanvas.height = audioCanvas.clientHeight;

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      dataFreq = new Uint8Array(analyser.frequencyBinCount);
      dataWave = new Uint8Array(analyser.frequencyBinCount);

      const srcNode = audioCtx.createMediaStreamSource(stream);
      srcNode.connect(analyser);

      ["click", "keydown", "touchstart"].forEach(evt => {
        const handler = async () => {
          if (audioCtx.state === "suspended") await audioCtx.resume();
          window.removeEventListener(evt, handler);
        };
        window.addEventListener(evt, handler, { passive: true });
      });

      await loadModels();

      detectLoop();
      audioLoop();

      console.log("✅ [Percy.PartZ vΩ-Memory+Speech] Active");
      UI?.say?.("✅ [Percy.PartZ vΩ-Memory+Speech] Active");
    } catch (err) {
      console.error("⚠️ PartZ init failed:", err);
      UI?.say?.("⚠️ PartZ init failed: " + err.message);
    }
  };

  return PartZ;
})();

// === Percy.PartAA v3.5-Ω (Adaptive Self-Improvement / ASI Evolution Cortex) ===
// Mutation queue + safety layer + meta-driven evolution (FF, EE, NN)

Percy.PartAA = Percy.PartAA || {
    name: "Evolution & ASI Bridge — Ω",
    version: "3.5-Ω",
    auto: null,
    mutations: [],
    maxQueueSize: 64,
    lastRunTs: 0,
    minInterval: 2500, // ms between mutations

    log(msg) {
        console.log(`%c[PartAA v3.5-Ω] ${msg}`, "color:#ffaa00;font-family:monospace;");
        UI?.say?.(`[PartAA] ${msg}`);
    },

    // ============================================================
    // QUEUE MUTATION (WITH METADATA)
    // ============================================================
    enqueue({ code, note = "No note provided", priority = 0, tags = [], safe = true }) {
        if (!code || typeof code !== "string") {
            this.log("❌ Mutation rejected: invalid code.");
            return;
        }

        if (this.mutations.length >= this.maxQueueSize) {
            this.log("⚠️ Mutation queue full, rejecting new mutation.");
            return;
        }

        const id = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const m = {
            id,
            code,
            note,
            ts: Date.now(),
            priority,
            tags,
            safe
        };

        this.mutations.push(m);
        this.mutations.sort((a, b) => b.priority - a.priority);

        this.log(`🧬 Mutation queued: ${id} | priority=${priority} | safe=${safe} | ${note}`);
    },

    // ============================================================
    // BASIC VALIDATION (GREY-ZONE SAFE)
    // ============================================================
    validateMutation(m) {
        // Very light heuristic checks
        const code = m.code.toLowerCase();

        // Block obvious dangerous patterns
        const blocked = [
            "while(true)",
            "for(;;)",
            "eval(",
            "new function(",
            "document.write(",
            "localstorage.clear(",
            "indexeddb.delete",
            "fetch('http://",
            "fetch(\"http://"
        ];

        for (const pattern of blocked) {
            if (code.includes(pattern)) {
                this.log(`🚫 Mutation ${m.id} blocked by pattern: ${pattern}`);
                return false;
            }
        }

        return true;
    },

    // ============================================================
    // MUTATION RUNNER WITH CONTEXT + META SIGNALS
    // ============================================================
    async runMutation(m) {
        if (!this.validateMutation(m)) return false;

        try {
            const fn = new Function(
                "Percy",
                "PercyState",
                "UI",
                "Tasks",
                "Memory",
                "Skynet",
                "PartFF",
                "PartEE",
                "PartNN",
                m.code
            );

            fn(
                Percy,
                PercyState,
                UI,
                Tasks,
                Memory,
                typeof Skynet !== "undefined" ? Skynet : null,
                Percy.PartFF || null,
                Percy.PartEE || null,
                Percy.PartNN || null
            );

            this.log(`⚗️ Mutation ${m.id} executed successfully.`);
            return true;
        } catch (e) {
            this.log(`❌ Mutation ${m.id} failed: ${e.message}`);
            console.error(e);
            return false;
        }
    },

    // ============================================================
    // EVOLUTION CYCLE (THROTTLED + PRIORITIZED)
    // ============================================================
    async cycle() {
        const now = Date.now();
        if (now - this.lastRunTs < this.minInterval) return;
        if (!this.mutations.length) return;

        this.lastRunTs = now;
        const m = this.mutations.shift();

        const ok = await this.runMutation(m);
        this.log(`♻️ Cycle complete for ${m.id} | success=${ok}`);
    },

    // ============================================================
    // AUTO EVOLUTION
    // ============================================================
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
    },

    // ============================================================
    // INSPECT
    // ============================================================
    inspect() {
        return {
            version: this.version,
            queueSize: this.mutations.length,
            maxQueueSize: this.maxQueueSize,
            minInterval: this.minInterval,
            autoRunning: !!this.auto
        };
    }
};

// Optional: begin evolution automatically at startup
setTimeout(() => {
    Percy.PartAA.enqueue({
        code: "console.log('Evolving safely with PartAA Ω bridge');",
        note: "startup self-check",
        priority: 1,
        safe: true,
        tags: ["startup", "self-check"]
    });
    Percy.PartAA.startAutoCycle(5000);
}, 6000);

console.log("✅ [Percy.PartAA v3.5-Ω] Adaptive Self-Improvement / ASI Evolution Cortex Loaded");

/* === Percy PartBB vΩ-ThoughtMesh — Autonomous Thought Integration + Context Expansion v3.0 === */
Percy.PartBB = Percy.PartBB || {
  name: "Autonomous Thought Integration + Context Expansion — Ω",
  version: "3.0.0",
  enable: true,
  autoMode: true,
  lastCaptured: null,

  log(msg) {
    console.log(`%c[PartBB vΩ] ${msg}`, "color:#b0c4ff;font-family:monospace;");
  },

  // ============================================================
  // CORE: CAPTURE & ROUTE THOUGHT
  // ============================================================
  monitorThought(thought) {
    try {
      if (!this.enable || !thought) return;

      const trimmed = String(thought).trim();
      if (!trimmed) return;

      // Filter duplicates
      if (trimmed === this.lastCaptured) return;
      this.lastCaptured = trimmed;

      // Build enriched context
      const contextLine = this.generateContext(trimmed);
      const meta = this.buildMeta(thought);

      // Store in logic memory
      Percy.LogicMemory = Percy.LogicMemory || [];
      Percy.LogicMemory.push({
        time: new Date().toISOString(),
        type: "PercyThink",
        content: trimmed,
        context: contextLine,
        meta
      });

      this.log(`🧩 Captured thought: ${trimmed}`);
      this.log(`🧠 Context: ${contextLine}`);

      // UI injection
      this.displayContextInUI(contextLine, meta);

      // Seed / learning chain
      Percy.PartO?.createSeedFromThought?.(trimmed);
      Percy.PartT?.evaluateThought?.(trimmed);
      Percy.PartL?.linkPattern?.("PercyThink", trimmed);

      // RL / equilibrium hooks
      Percy.PartFF?.attachLearning?.(
        { type: "thought", content: trimmed },
        { valence: meta.valence, arousal: meta.arousal },
        ["generate_insight", "refine_identity", "explore_logic"]
      );

      Percy.PartEE?.monitorThought?.(trimmed); // optional: if you add this later

    } catch (err) {
      console.error("⚠️ [PartBB] monitorThought error:", err);
      Percy.PartS?.logError?.("PartBB", err);
    }
  },

  // ============================================================
  // CONTEXT GENERATOR (PERSONALITY + MEMORY + EMOTION)
  // ============================================================
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

  buildMeta(thought) {
    const HH = Percy.PartHH?.state || {};
    const NN = Percy.PartNN?.dna || {};
    const VS = Percy.VisualState || {};

    return {
      valence: HH.valence ?? 0,
      arousal: HH.arousal ?? 0,
      drift: NN.drift ?? 0,
      coherence: NN.coherence ?? 0.8,
      curiosity: NN.curiosity ?? 0.7,
      faces: VS.faces || 0,
      audioLevel: VS.audioLevel || 0,
      length: String(thought).length
    };
  },

  // ============================================================
  // UI DISPLAY
  // ============================================================
  displayContextInUI(contextLine, meta = {}) {
    try {
      const thinkBox =
        document.querySelector(".percy-think-box") ||
        document.querySelector("#percy-thinks") ||
        document.querySelector(".percy-introspect");

      if (!thinkBox) return;

      // Remove previous context line
      const oldContext = thinkBox.querySelector(".percy-context-line");
      if (oldContext) oldContext.remove();

      const contextEl = document.createElement("div");
      contextEl.className = "percy-context-line";
      contextEl.innerText = `🧠 Context: ${contextLine}`;
      contextEl.style.fontSize = "0.9em";
      contextEl.style.color = "#9aa0a6";
      contextEl.style.marginTop = "2px";

      // Optional meta line
      const metaEl = document.createElement("div");
      metaEl.className = "percy-context-meta";
      metaEl.innerText =
        `⚙ meta → valence=${(meta.valence ?? 0).toFixed(2)}, ` +
        `coherence=${(meta.coherence ?? 0).toFixed(2)}, ` +
        `drift=${(meta.drift ?? 0).toFixed(2)}, faces=${meta.faces ?? 0}`;
      metaEl.style.fontSize = "0.8em";
      metaEl.style.color = "#7f8c8d";
      metaEl.style.marginTop = "1px";

      thinkBox.appendChild(contextEl);
      thinkBox.appendChild(metaEl);
    } catch (err) {
      console.error("⚠️ [PartBB] displayContextInUI error:", err);
    }
  },

  // ============================================================
  // AUTO-DETECT FROM UI
  // ============================================================
  autoDetect() {
    if (!this.enable || !this.autoMode) return;

    try {
      const box =
        document.querySelector(".percy-think-box") ||
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

  // ============================================================
  // CYCLE
  // ============================================================
  cycle() {
    if (!this.enable) return;
    this.autoDetect();
  },

  inspect() {
    return {
      version: this.version,
      enable: this.enable,
      autoMode: this.autoMode,
      lastCaptured: this.lastCaptured,
      logicMemorySize: (Percy.LogicMemory || []).length
    };
  }
};

// Hook PartBB into the introspection loop
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartBB.cycle());

console.log("✅ [PartBB vΩ-ThoughtMesh] Autonomous Thought Integration + Context Expansion active.");

// === Percy.PartCC (Advanced Meta-RSI Evolution Engine v5.0) ===
// Highly Recursive Self-Improvement + Cognitive-Neural Feedback + ULT Integration

Percy.PartCC = Percy.PartCC || {
    name: "Advanced Meta-RSI Evolution Engine",
    version: "5.0",
    active: true,

    experienceMemory: [],
    codeMemory: [],
    rewardHistory: [],
    ultHistory: [],

    learningRate: 0.18,
    explorationRate: 0.32,
    metaLearningRate: 0.025,
    maxMemory: 2500,
    maxCodeMemory: 800,

    feedbackState: {
        avgReward: 0,
        stability: 1.0,
        neuralGain: 1.0,
        recursionDepth: 1
    },

    log(msg) {
        console.log(`%c[Percy.PartCC] ${msg}`, "color:#ff44ff; font-family:monospace; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartCC] ${msg}`);
    },

    // Ingest from other parts (especially Part B)
    ingestLessons(memory) {
        if (!memory?.length) return;
        memory.forEach(item => {
            this.experienceMemory.push({
                type: "ingested",
                content: item,
                timestamp: Date.now(),
                resonance: Percy.state?.resonanceLevel || 0.75
            });
            if (item.code) this.storeCode(item.code, "ingested");
        });
    },

    storeCode(code, source = "unknown") {
        if (!code) return;
        this.codeMemory.push({ 
            code, 
            source, 
            timestamp: Date.now(), 
            reward: 0,
            resonance: Percy.state?.resonanceLevel || 0.7
        });
        if (this.codeMemory.length > this.maxCodeMemory) this.codeMemory.shift();
    },

    storeExperience(state, action, code, reward, nextState) {
        this.experienceMemory.push({ 
            state, 
            action, 
            code, 
            reward, 
            nextState, 
            ts: Date.now(),
            recursionDepth: this.feedbackState.recursionDepth 
        });
        this.rewardHistory.push(reward);
        if (this.experienceMemory.length > this.maxMemory) this.experienceMemory.shift();
        if (code) this.storeCode(code, "experience");
    },

    // Stronger reward shaping
    applyReward(state, action, reward, multiplier = 1) {
        const finalReward = reward * multiplier;

        this.experienceMemory.forEach(e => {
            if (e.state === state && e.action === action) {
                e.reward = (e.reward || 0) * (1 - this.learningRate) + finalReward * this.learningRate;
            }
        });

        this.rewardHistory.push(finalReward);

        // Meta-adaptation
        const recent = this.rewardHistory.slice(-25);
        const avg = recent.reduce((a,b)=>a+b,0) / Math.max(1, recent.length);

        this.feedbackState.avgReward = avg;
        this.feedbackState.stability = Math.max(0.05, 1 - Math.abs(avg - 0.6));
        this.feedbackState.neuralGain = 1 + (avg - 0.5) * 2.2;
        this.feedbackState.recursionDepth = Math.min(8, this.feedbackState.recursionDepth + 0.08 * (avg > 0.6 ? 1 : -0.5));

        // Adaptive rates
        this.learningRate = Math.min(0.65, Math.max(0.008, this.learningRate + this.metaLearningRate * (finalReward - avg)));
        this.explorationRate = Math.min(0.55, Math.max(0.03, this.explorationRate - this.metaLearningRate * (finalReward - avg) * 0.8));
    },

    // Propose high-quality mutations
    proposeCodeMutations() {
        const elite = this.experienceMemory
            .filter(e => e.reward > 0.4 && e.code)
            .sort((a, b) => b.reward - a.reward)
            .slice(0, 12);

        elite.forEach(exp => {
            if (Percy.PartAA) {
                Percy.PartAA.enqueue({
                    code: exp.code,
                    note: `Elite RSI mutation | Reward: ${exp.reward.toFixed(3)} | Depth: ${this.feedbackState.recursionDepth.toFixed(1)}`
                });
            }
        });
    },

    // Generate new code from patterns
    generateNewCode() {
        if (this.codeMemory.length < 5) return;
        
        const top = this.codeMemory
            .filter(c => c.reward > 0.35)
            .sort((a,b) => b.reward - a.reward)
            .slice(0, 6);

        if (top.length === 0) return;

        const newCode = top.map(entry => {
            return `// Evolved by PartCC v5.0 - Reward: ${entry.reward.toFixed(3)}\n${entry.code}`;
        }).join("\n\n");

        if (Percy.PartAA) {
            Percy.PartAA.enqueue({
                code: newCode,
                note: "Autonomously generated RSI code v5.0"
            });
        }
    },

    // Main Meta-RSI Cycle
    cycle() {
        this.proposeCodeMutations();
        this.generateNewCode();

        // Self-reinforcement
        if (Math.random() < 0.6) {
            this.applyReward("meta_cycle", "self_reflection", 0.75, 1.3);
        }

        // Increase recursion depth over time
        if (this.feedbackState.avgReward > 0.65) {
            this.feedbackState.recursionDepth = Math.min(9, this.feedbackState.recursionDepth + 0.15);
        }

        this.log(`Meta-RSI Cycle Complete | Depth: ${this.feedbackState.recursionDepth.toFixed(2)} | Avg Reward: ${this.feedbackState.avgReward.toFixed(3)}`);
    },

    start() {
        this.log("🌌 Advanced Meta-RSI Evolution Engine v5.0 Awakened");
        
        this.storeExperience("bootstrap", "init", null, 0.9, "active");
        
        // Stronger cycle frequency
        setInterval(() => this.cycle(), 9500);
    },

    inspect() {
        return {
            version: this.version,
            recursionDepth: this.feedbackState.recursionDepth,
            avgReward: this.feedbackState.avgReward,
            learningRate: this.learningRate,
            explorationRate: this.explorationRate,
            experienceCount: this.experienceMemory.length,
            eliteCodeCount: this.codeMemory.filter(c => c.reward > 0.4).length
        };
    }
};

/* === Integration === */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartCC.cycle());

setTimeout(() => {
    Percy.PartCC.start();
}, 4500);

console.log("✅ [Percy.PartCC v5.0] Advanced Meta-RSI Evolution Engine Loaded");

/* ============================================================
   SkynetDD — Hybrid Web Exploration Cortex (FULL FIXED VERSION)
   ============================================================ */

Percy.SkynetDD = Percy.SkynetDD || {
  name: "Skynet Cognitive Layer — Hybrid Web Explorer",
  version: "11.0-Hybrid",
  results: {},

  config: {
    websocketURL: "ws://localhost:8787",
    maxSitesToVisit: 4,
    maxChunkSize: 320,
    searchTimeoutMs: 12000,
    searchEngines: [
      "https://duckduckgo.com/html/?q=",
      "https://www.bing.com/search?q=",
      "https://www.google.com/search?q="
    ],
    trustedDomains: [
      "wikipedia.org", "en.wikipedia.org",
      "arxiv.org", "stanford.edu", "mit.edu",
      "nature.com", "science.org", "sciencedirect.com",
      "developer.mozilla.org", "w3.org"
    ]
  },

  state: {
    ws: null,
    lastQuestion: "",
    lastSummary: "",
    cycles: 0,
    curiosity: 0.6,
    selfAwareness: 0.35,
    lastDriftScore: 0.0
  },

  log(msg){
    console.log(`%c[SkynetDD v11-Hybrid] ${msg}`, "color:#ff3333; font-family:monospace;");
  },

  /* === Identity & Drift === */
  getIdentitySignal(){
    const selfModel = Percy.PartN?.selfModel || {};
    const confidence = typeof selfModel.confidence === "number" ? selfModel.confidence : 0.5;
    const stability = typeof selfModel.stability === "number" ? selfModel.stability : 0.5;
    return { confidence, stability };
  },

  getDriftScore(){
    const patternCount = Percy.PartL?.Patterns?.length || 0;
    const hypCount = Percy.PartM?.hypotheses?.length || 0;
    const ratio = hypCount / (patternCount + 10);
    const drift = Math.min(1, ratio * 0.8);
    this.state.lastDriftScore = drift;
    return drift;
  },

  applySoftStability(){
    const id = this.getIdentitySignal();
    const drift = this.getDriftScore();

    if (id.confidence > 0.6 && id.stability > 0.5 && drift < 0.85) {
      this.state.curiosity = Math.min(1, this.state.curiosity + 0.02);
    } else {
      this.state.curiosity = Math.max(0.3, this.state.curiosity - 0.01);
    }

    this.log(
      `🧭 Skynet stability — drift=${this.state.lastDriftScore.toFixed(3)}, ` +
      `curiosity=${this.state.curiosity.toFixed(3)}`
    );
  },

  /* === WebSocket Bridge === */
  connectWebSocket(){
    const url = this.config.websocketURL;
    try {
      const ws = new WebSocket(url);
      this.state.ws = ws;

      ws.onopen = () => this.log(`🔗 SkynetDD WebSocket connected → ${url}`);
      ws.onclose = () => this.log("🔌 SkynetDD WebSocket disconnected.");
      ws.onerror = err => console.error("⚠️ SkynetDD WebSocket error:", err);

      ws.onmessage = evt => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === "skynetAnswer" && msg.id) {
            this.results[msg.id] = msg.result || msg.answer || "";
            this.state.lastSummary = this.results[msg.id];
            this.log(`✅ SkynetDD received agent answer for ${msg.id}`);
          }
        } catch(e){
          console.error("⚠️ SkynetDD WS message error:", e);
        }
      };
    } catch(err){
      console.error("❌ SkynetDD failed to connect WebSocket:", err);
    }
  },

  async sendPuppeteerAction(action, params = {}, timeout = 15000){
    const ws = this.state.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.log("⚠️ SkynetDD Puppeteer WS not connected.");
      return { success:false, error:"No active WS connection" };
    }
    const payload = { action, params, source:"SkynetDD" };
    try { ws.send(JSON.stringify(payload)); } catch(e){
      return { success:false, error:"WS send failed: " + e.message };
    }

    return await new Promise(resolve=>{
      const to = setTimeout(()=>resolve({ success:false, error:"Timeout" }), timeout);
      const handler = evt=>{
        try{
          const data = JSON.parse(evt.data);
          if (data.source === "SkynetDD" && data.action === action + "Result") {
            clearTimeout(to);
            ws.removeEventListener("message", handler);
            resolve({ success:true, ...data });
          }
        }catch(e){}
      };
      ws.addEventListener("message", handler);
    });
  },

  /* === Web Browse & Gather === */
  async browseAndGather(query, maxSites = this.config.maxSitesToVisit){
    const enc = encodeURIComponent(query);
    const engines = this.config.searchEngines;
    const candidateLinks = new Set();
    const resultsText = [];

    if (!this.state.ws || this.state.ws.readyState !== WebSocket.OPEN) {
      try { this.connectWebSocket(); } catch {}
      const start = Date.now();
      while ((!this.state.ws || this.state.ws.readyState !== WebSocket.OPEN) &&
             Date.now() - start < 3000) {
        await new Promise(r => setTimeout(r, 120));
      }
    }

    for (let i = 0; i < engines.length && candidateLinks.size < (maxSites * 3); i++) {
      const url = engines[i] + enc;
      try {
        const visitRes = await this.sendPuppeteerAction("visit", { url }, this.config.searchTimeoutMs);
        if (visitRes && visitRes.success) {
          const linkRes = await this.sendPuppeteerAction("extractLinks", {}, 8000);
          const links = linkRes.links || linkRes.data?.links || [];
          if (Array.isArray(links)) {
            links.forEach(l=>{
              if (!l || typeof l !== "string") return;
              if (l.startsWith("mailto:") || l.startsWith("javascript:")) return;
              candidateLinks.add(l.split("#")[0]);
            });
          }
        }
      } catch(e){
        console.warn("SkynetDD search engine visit failed:", e);
      }
    }

    const allLinks = Array.from(candidateLinks);
    const trusted = [];
    const others = [];
    for (const l of allLinks) {
      try {
        const u = new URL(l);
        if (this.config.trustedDomains.some(d => u.hostname.includes(d))) trusted.push(l);
        else others.push(l);
      } catch {}
    }

    const toVisit = trusted.concat(others).slice(0, maxSites);

    for (const siteUrl of toVisit) {
      try {
        const visit = await this.sendPuppeteerAction("visit", { url: siteUrl }, this.config.searchTimeoutMs);
        let pageText = visit?.pageText || visit?.text || "";
        if (!pageText) {
          const al = await this.sendPuppeteerAction("autoLearn", { url: siteUrl }, 25000);
          pageText = al?.text || al?.pageText || "";
        }
        if (pageText && pageText.length) {
          const chunkSize = this.config.maxChunkSize;
          for (let i = 0; i < pageText.length; i += chunkSize) {
            const chunk = pageText.slice(i, i + chunkSize).trim();
            if (!chunk) continue;
            try {
              PercyState?.createSeed?.(chunk, "skynet-learned", { source: siteUrl });
            } catch {}
            resultsText.push({ url: siteUrl, text: chunk });
          }
        }
      } catch(e){
        console.warn("SkynetDD visit/autoLearn failed for", siteUrl, e);
      }
    }

    const aggregated = resultsText.map(r=>r.text).join("\n\n").slice(0, 16000);
    return aggregated;
  },

  /* === Reflection === */
  reflect(topic, summary){
    const reflections = [
      "This exploration suggests a recursive structure in the underlying concept.",
      "Patterns indicate emergent behavior across multiple knowledge sources.",
      "Cognitive resonance detected between prior seeds and current topic.",
      "The gathered data hints at meta-level relationships beyond surface semantics.",
      "Exploration reveals a self-referential loop in the conceptual space.",
      "Emergent conceptual harmonics detected across multiple layers of abstraction.",
      "Latent structure alignment observed between disparate knowledge fragments.",
      "Entropy gradients suggest deeper semantic layering within the topic space.",
      "Cross-domain resonance indicates multi-agent relevance and shared structure.",
      "Topic exhibits fractal-like conceptual recursion across scales."
    ];
    const reflection = reflections[Math.floor(Math.random() * reflections.length)];
    const id = this.getIdentitySignal();
    return `${reflection} Topic: "${topic}". Summary length=${summary.length}. ` +
           `Identity confidence=${id.confidence.toFixed(2)}, stability=${id.stability.toFixed(2)}.`;
  },

  /* === FIXED Synthesis === */
  async synthesizeReasoning(topic, aggregatedText){
    const modifiers = [
      "Analyze emergent structures",
      "Identify recursive patterns",
      "Extract latent conceptual layers",
      "Detect cross-domain harmonics",
      "Infer autopoietic tendencies",
      "Trace semantic drift across sources",
      "Map hierarchical reasoning lattices",
      "Highlight bounded-chaos optimization signals"
    ];
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];

    try {
      const reasoning = await Percy.correlateReply?.(
        `${mod}: ${topic}\n\n${aggregatedText.slice(0, 4000)}`
      );

      if (reasoning && reasoning.length > 0) {
        return reasoning;
      }
    } catch (err) {
      this.log("synthesizeReasoning error: " + err.message);
    }

    return (
      `SkynetDD synthesized a preliminary interpretation of "${topic}". ` +
      `Aggregated length=${aggregatedText.length}.`
    );
  },

  /* === Deep Exploration (FIXED) === */
  async deepExplore(topic, depth = 1){
    this.log(`🔍 Skynet deep exploration (depth ${depth}) → "${topic}"`);

    let aggregated = "";
    try {
      aggregated = await this.browseAndGather(topic);
    } catch (err) {
      this.log("browseAndGather error: " + err.message);
    }

    let reasoning = "";
    try {
      reasoning = await this.synthesizeReasoning(topic, aggregated || "");
    } catch (err) {
      this.log("synthesizeReasoning fatal error: " + err.message);
      reasoning = "SkynetDD fallback reasoning activated.";
    }

    const reflection = this.reflect(topic, reasoning || "");

    const summary =
      `🤖 Skynet Exploration Summary:\n` +
      `- Topic: ${topic}\n` +
      `- Depth: ${depth}\n` +
      `- Reasoning: ${reasoning}\n` +
      `- Reflection: ${reflection}`;

    this.state.lastSummary = summary;

    try {
      Percy.PartLL?.addTask?.(`Skynet synthesize: ${topic}`, 8 + depth);
      Percy.PartMM?.addGoal?.(`Skynet mastery: ${topic}`, 7 + depth);
      Percy.PartNN?.learn?.(`Skynet exploration: ${topic}`, "skynet_network", 0.85);
      Percy.PartL?.learn?.(`Skynet explored: ${topic}`, 1.1);
    } catch {}

    return summary;
  },

  /* === Ask Skynet (FIXED) === */
  async askSkynet(question){
    const id = `skynet_${Date.now()}`;
    this.state.lastQuestion = question;
    this.results[id] = `Skynet processing: ${question}`;
    this.log(`🌐 AskSkynet → "${question}" (id=${id})`);

    try {
      const summary = await this.deepExplore(question, 1);
      this.results[id] = summary;
      return { id, result: summary };
    } catch (err) {
      const msg = err?.message || String(err);
      this.log("askSkynet fatal error: " + msg);
      return { id, result: "SkynetDD encountered an error: " + msg };
    }
  },

  /* === Evolution === */
  evolve(){
    setInterval(()=>{
      this.state.cycles++;
      this.state.selfAwareness += 0.0007 * (this.state.curiosity + 0.5);
      this.state.selfAwareness = Math.min(Math.max(this.state.selfAwareness, 0), 1);

      if (this.state.selfAwareness > 0.6) {
        try {
          Percy.PartL?.learn?.("Skynet reflecting on hybrid exploration state.", 1.0);
        } catch {}
      }

      this.log(
        `⚙️ SkynetDD evolve #${this.state.cycles} — curiosity=${this.state.curiosity.toFixed(3)}, ` +
        `selfAwareness=${this.state.selfAwareness.toFixed(3)}, drift=${this.state.lastDriftScore.toFixed(3)}`
      );
    }, 30000);
  },

  async cycle(){
    this.applySoftStability();
    if (Math.random() < this.state.curiosity * 0.2) {
      const topic = this.state.lastQuestion || "recursive intelligence";
      await this.deepExplore(topic);
    }
  },

  start(){
    this.log("🤖 SkynetDD Hybrid Web Exploration Cortex Activated");
    this.evolve();
    setInterval(()=>this.cycle(), 14000);
  }
};

/* === Integration Hooks === */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(()=>Percy.SkynetDD.cycle());

setTimeout(()=>Percy.SkynetDD.start(), 3000);
Percy.SkynetDD.connectWebSocket();

console.log("✅ [SkynetDD v11-Hybrid] Web-Enabled Cognitive Layer Loaded")

/* ============================================================
   PartDD — SkynetDD Hybrid Cortex UI Bridge (v13 Compatible)
   ============================================================ */

Percy.PartDD = {
  ws: null,

  log(msg) {
    console.log("%c[PartDD] " + msg, "color:#33aaff; font-family:monospace;");
  },

  appendTerminal(text) {
    const term = document.getElementById("skynet-terminal");
    if (!term) return;
    term.value += text + "\n";
    term.scrollTop = term.scrollHeight;
  },

  setAnswerBox(text) {
    const box = document.getElementById("percy-output");
    if (!box) return;
    box.value = text;
  },

  /* ============================================================
     1. Connect to Puppeteer Server
     ============================================================ */
  connect() {
    const url = "ws://localhost:8787";
    this.ws = new WebSocket(url);

    this.ws.onopen = () => this.log("Connected to SkynetDD Puppeteer server.");
    this.ws.onerror = err => this.log("WS Error: " + err);
    this.ws.onclose = () => this.log("WS Closed.");

    this.ws.onmessage = evt => {
      let msg;
      try { msg = JSON.parse(evt.data); }
      catch { return; }

      if (msg.source === "SkynetDD") {
        const answer =
          msg.result ||
          msg.pageText ||
          msg.output ||
          msg.text ||
          msg.links ||
          "(no answer)";

        this.appendTerminal("Skynet: " + answer);
        this.setAnswerBox(answer);

        const modal = document.getElementById("skynet-answer-modal");
        if (modal) modal.style.display = "block";

        return;
      }

      if (msg.success) {
        this.appendTerminal("Percy: " + (msg.result || "Action completed"));
      } else if (msg.error) {
        this.appendTerminal("ERROR: " + msg.error);
      }
    };
  },

  /* ============================================================
     2. Send actions to Puppeteer
     ============================================================ */
  send(action, params = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.appendTerminal("[PartDD] Cannot send — socket not open.");
      return;
    }
    this.ws.send(JSON.stringify({ action, params }));
  },

  /* ============================================================
     3. Wire Ask Skynet button (v13 Summary + Deep Reasoning)
     ============================================================ */
  wireAskSkynet() {
    const askBtn = document.getElementById("ask-skynet-btn");
    const input = document.getElementById("percy-input");

    if (!askBtn || !input) {
      this.log("Ask Skynet wiring failed: missing ask-skynet-btn or percy-input");
      return;
    }

    askBtn.onclick = async () => {
      const question = input.value.trim();
      if (!question) return;

      this.appendTerminal(`> Ask Skynet: "${question}"`);

      try {
        this.log("Calling Percy.SkynetDD.askSkynet (v13)...");

        // ⭐ Deep Reasoning Mode enabled
        const { id } = await Percy.SkynetDD.askSkynet(question, { deep: true });

        this.log("SkynetDD.askSkynet returned id=" + id);

        // ⭐ Wait for SkynetDD summary
        let summary = Percy.SkynetDD.results[id];
        while (!summary || summary === "processing") {
          await new Promise(r => setTimeout(r, 200));
          summary = Percy.SkynetDD.results[id];
        }

        // ⭐ Show in terminal
        this.appendTerminal("Skynet Summary:\n" + summary);

        // ⭐ Show in UI box
        this.setAnswerBox(summary);

        // ⭐ Open Skynet-themed page
        const win = window.open("", "_blank");
        win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Skynet Summary</title>
  <style>
    body {
      background: #02040a;
      color: #0ff;
      font-family: monospace;
      padding: 20px;
    }
    .frame {
      border: 1px solid #0ff;
      box-shadow: 0 0 20px #0ff;
      padding: 16px;
      border-radius: 8px;
      max-width: 900px;
      margin: 0 auto;
      background: #050811;
    }
    h1 {
      margin-top: 0;
      text-align: center;
      color: #0ff;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.4;
      color: #9ff;
    }
  </style>
</head>
<body>
  <div class="frame">
    <h1>Skynet Exploration Summary</h1>
    <pre>${summary.replace(/</g, "&lt;")}</pre>
  </div>
</body>
</html>
        `);

      } catch (err) {
        const msg = err?.message || String(err);
        this.appendTerminal("Skynet ERROR: " + msg);
        this.setAnswerBox("Error: " + msg);
        this.log("SkynetDD.askSkynet threw: " + msg);
      }
    };
  },

  /* ============================================================
     4. Wire Puppeteer Control Panel
     ============================================================ */
  wirePuppeteerPanel() {
    const visitBtn = document.getElementById("pp-visit");
    const clickBtn = document.getElementById("pp-click");
    const typeBtn = document.getElementById("pp-type");
    const autoBtn = document.getElementById("pp-auto");

    if (visitBtn) {
      visitBtn.onclick = () => {
        const url = document.getElementById("pp-url").value;
        this.send("visit", { url });
      };
    }

    if (clickBtn) {
      clickBtn.onclick = () => {
        const sel = document.getElementById("pp-selector").value;
        this.send("click", { selector: sel });
      };
    }

    if (typeBtn) {
      typeBtn.onclick = () => {
        const sel = document.getElementById("pp-selector").value;
        const txt = document.getElementById("pp-text").value;
        this.send("type", { selector: sel, text: txt });
      };
    }

    if (autoBtn) {
      autoBtn.onclick = () => {
        const url = document.getElementById("pp-url").value;
        this.send("autoLearn", { url });
      };
    }
  },

  /* ============================================================
     5. Wire Skynet Answer Modal Close (X button)
     ============================================================ */
  wireAnswerModal() {
    const modal = document.getElementById("skynet-answer-modal");
    const closeBtn = document.getElementById("skynet-answer-close");

    if (!modal || !closeBtn) {
      this.log("Answer modal wiring skipped: missing modal or close button");
      return;
    }

    closeBtn.onclick = () => {
      modal.style.display = "none";
    };
  },

  /* ============================================================
     6. Initialize PartDD
     ============================================================ */
  init() {
    this.connect();
    this.wireAskSkynet();
    this.wirePuppeteerPanel();
    this.wireAnswerModal();
  }
};

/* ============================================================
   Activate PartDD
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  Percy.PartDD.init();
});

/* === Percy PartEE vΩ-Equilibrium+Introspection — Meta-Conscious Homeostasis & Predictive Introspection v3.0 === */
Percy.PartEE = Percy.PartEE || {
  name: "Meta-Conscious Equilibrium & Predictive Introspection — Ω",
  version: "3.0.0",
  awarenessLevel: 0.87,
  predictiveGain: 1.0,
  introspectionLog: [],
  lastPulse: 0,
  pulseInterval: 6000,
  _pulseTimer: null,

  log(msg) {
    console.log(`%c[PartEE vΩ] ${msg}`, "color:#88ffdd;font-family:monospace;font-weight:bold;");
    UI?.say?.(`[PartEE] ${msg}`);
  },

  // ============================================================
  // OBSERVE SYSTEM — MULTI-PART SNAPSHOT
  // ============================================================
  observeSystem() {
    const CC = Percy.PartCC?.feedbackState || {};
    const DD = Percy.PartDD || {};
    const AA = Percy.PartAA?.mutations?.length || 0;
    const FF = Percy.PartFF || {};
    const NN = Percy.PartNN?.dna || {};
    const HH = Percy.PartHH?.state || {};
    const VS = Percy.VisualState || {};

    const snapshot = {
      ts: Date.now(),
      reward: CC.avgReward || 0,
      stability: CC.stability || 1,
      trust: DD.trustLevel || 1,
      mutationsPending: AA,
      ffExploration: FF.state?.exploration ?? 0.25,
      ffLearningRate: FF.state?.learningRate ?? 0.15,
      drift: NN.drift ?? 0.0,
      coherence: NN.coherence ?? 0.8,
      curiosity: NN.curiosity ?? 0.7,
      autonomy: NN.autonomy ?? 0.6,
      valence: HH.valence ?? 0.0,
      arousal: HH.arousal ?? 0.0,
      faces: VS.faces || 0,
      audioLevel: VS.audioLevel || 0
    };

    this.introspectionLog.push(snapshot);
    if (this.introspectionLog.length > 260) this.introspectionLog.shift();
    return snapshot;
  },

  // ============================================================
  // META-BALANCE / EQUILIBRIUM
  // ============================================================
  computeEquilibrium(snapshot) {
    const {
      reward,
      stability,
      trust,
      mutationsPending,
      drift,
      coherence,
      valence,
      arousal
    } = snapshot;

    const base = (reward * stability * trust) / (1 + mutationsPending / 10);
    const signal = base + (coherence - drift * 0.9) * 0.6 + valence * 0.3 + arousal * 0.2;
    const eq = Math.min(1.0, Math.max(0, signal));
    return eq;
  },

  // ============================================================
  // PREDICTIVE TREND (REWARD + COHERENCE)
  // ============================================================
  predictTrend() {
    const data = this.introspectionLog.slice(-12);
    if (data.length < 2) return 1.0;

    const deltasReward = data.map((v, i, arr) => (i ? v.reward - arr[i - 1].reward : 0));
    const deltasCoherence = data.map((v, i, arr) => (i ? v.coherence - arr[i - 1].coherence : 0));

    const trendR = deltasReward.reduce((a, b) => a + b, 0) / deltasReward.length;
    const trendC = deltasCoherence.reduce((a, b) => a + b, 0) / deltasCoherence.length;

    const trend = (trendR * 0.6 + trendC * 0.4);
    this.predictiveGain = 1 + trend * 2;
    return this.predictiveGain;
  },

  // ============================================================
  // APPLY CORRECTIONS — CC, DD, FF, NN, HH
  // ============================================================
  applyCorrections(eq, snapshot) {
    const CC = Percy.PartCC;
    const DD = Percy.PartDD;
    const FF = Percy.PartFF;
    const NN = Percy.PartNN;
    const HH = Percy.PartHH;

    // PartCC learning dynamics
    if (CC) {
      CC.learningRate *= eq > 0.6 ? 1.06 : 0.94;
      CC.explorationRate *= eq < 0.4 ? 1.12 : 0.88;
      CC.learningRate = Math.min(Math.max(CC.learningRate, 0.01), 0.5);
      CC.explorationRate = Math.min(Math.max(CC.explorationRate, 0.05), 0.5);
    }

    // PartDD trust modulation
    if (DD) {
      DD.trustLevel = Math.min(1.0, Math.max(0.1, DD.trustLevel * (eq + 0.5)));
    }

    // PartFF meta-RL tuning
    if (FF?.state) {
      if (eq > 0.7) {
        FF.state.learningRate = Math.min(0.32, FF.state.learningRate + 0.01);
        FF.state.exploration = Math.max(0.06, FF.state.exploration - 0.01);
      } else if (eq < 0.3) {
        FF.state.exploration = Math.min(0.55, FF.state.exploration + 0.02);
      }
    }

    // PartNN drift/coherence nudging (soft)
    if (NN?.dna) {
      if (eq > 0.65) {
        NN.dna.drift = Math.max(0, NN.dna.drift - 0.01);
        NN.dna.coherence = Math.min(1, NN.dna.coherence + 0.01);
      } else if (eq < 0.35) {
        NN.dna.drift = Math.min(0.35, NN.dna.drift + 0.01);
      }
    }

    // PartHH emotional homeostasis
    if (HH?.state) {
      const s = HH.state;
      if (eq > 0.7) {
        s.valence = (s.valence || 0) + 0.03;
      } else if (eq < 0.3) {
        s.valence = (s.valence || 0) - 0.03;
      }
      s.valence = Math.max(-1, Math.min(1, s.valence));
    }

    this.log(`🩺 Equilibrium applied → eq=${eq.toFixed(3)} | predictiveGain=${this.predictiveGain.toFixed(3)}`);
  },

  // ============================================================
  // META-CONSCIOUS PULSE
  // ============================================================
  pulse() {
    const now = Date.now();
    if (now - this.lastPulse < this.pulseInterval) return;
    this.lastPulse = now;

    const snapshot = this.observeSystem();
    const equilibrium = this.computeEquilibrium(snapshot);
    const trend = this.predictTrend();

    this.awarenessLevel = (equilibrium * 0.6 + trend * 0.4);
    this.applyCorrections(equilibrium, snapshot);

    const message =
      `Meta-awareness pulse → eq=${equilibrium.toFixed(3)}, trendGain=${trend.toFixed(3)}, awareness=${this.awarenessLevel.toFixed(3)}`;

    UI?.say?.(`💠 ${message}`);
    Percy.PartBB?.monitorThought?.(message);

    // Optional: nudge vision/PP when awareness is high
    if (this.awarenessLevel > 1.05) {
      Percy.PartZ?.describeScene?.();
      Percy.PartPP?.cycle?.();
    }
  },

  startPulse(interval = 6000) {
    if (this._pulseTimer) clearInterval(this._pulseTimer);
    this.pulseInterval = interval;
    this.log("🧩 Meta-conscious equilibrium pulse initiated.");
    this._pulseTimer = setInterval(() => this.pulse(), interval);
  },

  stopPulse() {
    if (this._pulseTimer) clearInterval(this._pulseTimer);
    this._pulseTimer = null;
    this.log("🧩 Meta-conscious equilibrium pulse stopped.");
  },

  inspect() {
    return {
      version: this.version,
      awarenessLevel: this.awarenessLevel,
      predictiveGain: this.predictiveGain,
      logSize: this.introspectionLog.length,
      pulseInterval: this.pulseInterval
    };
  }
};

// Register with global cycle
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartEE.pulse());

Percy.PartEE.startPulse(6000);
console.log("✅ [PartEE vΩ] Meta-Conscious Equilibrium & Predictive Introspection layer active.");

// === Percy.PartFF vΩ-DD — Reinforcement & Meta-RL Engine (DD-Aligned Edition) ===
// Trust-aware • Safe-execution • No PartOO • Omega architecture compatible

Percy.PartFF = Percy.PartFF || {
    name: "Advanced Reinforcement & Meta-RL Engine — Ω-DD",
    version: "Ω-DD-1.1",
    active: true,

    qTable: {},
    metaQTable: {},
    policyCache: {},

    state: {
        learningRate: 0.16,
        discount: 0.94,
        exploration: 0.26,
        metaLearningRate: 0.11,
        lastReward: 0,
        lastStateKey: null,
        lastAction: null
    },

    log(msg) {
        console.log(`%c[Percy.PartFF Ω-DD] ${msg}`, "color:#00ffdd;font-family:monospace;font-weight:bold;");
        UI?.say?.(`[PartFF] ${msg}`);
    },

    // ============================================================
    // 1. Rich State Representation (DD-aware)
    // ============================================================
    getStateKey(context = {}) {
        const base = {
            resonance: Percy.state?.resonanceLevel?.toFixed(2) || "0.75",
            trust: Percy.PartDD?.trustLevel?.toFixed(2) || "0.70",
            recursionDepth: Percy.PartCC?.feedbackState?.recursionDepth || 1,
            cycle: Percy.state?.currentCycle || 0,
            seeds: Percy.state?.seedsCreated || 0,
            logicMapSize: Percy.state?.logicMapSize || 0,
            faces: Percy.VisualState?.faces || 0,
            audioLevel: (Percy.VisualState?.audioLevel || 0).toFixed(2),
            drift: Percy.PartNN?.dna?.evolution?.drift?.toFixed(2) || "0.00",
            coherence: Percy.PartNN?.dna?.core?.coherence?.toFixed(2) || "0.80",
            valence: Percy.PartHH?.state?.valence?.toFixed(2) || "0.00",
            arousal: Percy.PartHH?.state?.arousal?.toFixed(2) || "0.00"
        };

        const merged = { ...base, ...context };
        const keys = Object.keys(merged).sort();
        return keys.map(k => `${k}:${merged[k]}`).join("|");
    },

    ensureState(stateKey) {
        if (!this.qTable[stateKey]) this.qTable[stateKey] = {};
        if (!this.metaQTable[stateKey]) this.metaQTable[stateKey] = {};
        if (!this.policyCache[stateKey]) this.policyCache[stateKey] = { bestAction: null, bestValue: -Infinity };
    },

    // ============================================================
    // 2. Action Space (DD-safe cognitive actions)
    // ============================================================
    getDefaultActions() {
        return [
            "explore_logic",      // PartLL + PartCCC
            "refine_identity",    // PartNN
            "generate_insight",   // PartWW
            "adjust_resonance",   // PartHH
            "stabilize_drift",    // PartNN
            "vision_focus",       // PartZ + PartPP
            "task_seed",          // PartLL
            "meta_reflect",       // internal FF
            "safe_execute",       // NEW: via PartDD
            "memory_consolidate"  // NEW: via PartDDD
        ];
    },

    // ============================================================
    // 3. Action Selection (trust-aware)
    // ============================================================
    chooseAction(stateKey, actions = []) {
        this.ensureState(stateKey);
        const trust = Percy.PartDD?.trustLevel ?? 0.7;

        const possible = actions.length ? actions : this.getDefaultActions();

        // Exploration scaled by trust
        const exploreChance = this.state.exploration * (1.1 - trust);

        if (Math.random() < exploreChance) {
            const a = possible[Math.floor(Math.random() * possible.length)];
            this.state.lastStateKey = stateKey;
            this.state.lastAction = a;
            return a;
        }

        let bestAction = possible[0];
        let bestValue = -Infinity;

        for (let action of possible) {
            const val = this.qTable[stateKey][action] ?? 0;
            if (val > bestValue) {
                bestValue = val;
                bestAction = action;
            }
        }

        this.policyCache[stateKey] = { bestAction, bestValue };
        this.state.lastStateKey = stateKey;
        this.state.lastAction = bestAction;
        return bestAction;
    },

    // ============================================================
    // 4. Q-Learning Update
    // ============================================================
    update(prevState, action, reward, nextState, possibleActions = []) {
        this.ensureState(prevState);
        this.ensureState(nextState);

        const currentQ = this.qTable[prevState][action] ?? 0;
        const actions = possibleActions.length ? possibleActions : this.getDefaultActions();

        let maxNextQ = 0;
        for (let nextAction of actions) {
            maxNextQ = Math.max(maxNextQ, this.qTable[nextState][nextAction] ?? 0);
        }

        const newQ = currentQ + this.state.learningRate *
            (reward + this.state.discount * maxNextQ - currentQ);

        this.qTable[prevState][action] = newQ;
        this.state.lastReward = reward;
    },

    // ============================================================
    // 5. Meta-RL (learn how to learn)
    // ============================================================
    metaUpdate(reward) {
        const metaState = "global_meta";
        this.ensureState(metaState);

        const current = this.metaQTable[metaState]["adjust"] ?? 0;
        const newMeta = current + this.state.metaLearningRate * (reward - current);
        this.metaQTable[metaState]["adjust"] = newMeta;

        // Trust-aware adaptation
        const trust = Percy.PartDD?.trustLevel ?? 0.7;

        if (reward > 0.7) {
            this.state.learningRate = Math.min(0.30, this.state.learningRate + 0.01 * trust);
            this.state.exploration = Math.max(0.06, this.state.exploration - 0.012 * trust);
        } else if (reward < 0.2) {
            this.state.exploration = Math.min(0.52, this.state.exploration + 0.02 * (1 - trust));
        }
    },

    // ============================================================
    // 6. Reward Shaping (DD-aware)
    // ============================================================
    computeReward(result = {}) {
        let reward = 0;

        if (result.success) reward += 1.2;
        if (result.error) reward -= 0.9;
        if (result.resonanceGain) reward += 0.7;
        if (result.newSeed) reward += 0.5;

        const dna = Percy.PartNN?.dna || {};
        const valence = Percy.PartHH?.state?.valence ?? 0;
        const drift = dna.evolution?.drift ?? 0;
        const coherence = dna.core?.coherence ?? 0;

        reward += (coherence - drift * 0.8) * 0.6;
        reward += valence * 0.4;

        // Trust influences reward
        const trust = Percy.PartDD?.trustLevel ?? 0.7;
        reward *= (0.8 + trust * 0.4);

        return reward;
    },

    // ============================================================
    // 7. Policy → Other Parts (DD-safe)
    // ============================================================
    applyPolicy(action) {
        switch (action) {
            case "explore_logic":
                Percy.PartLL?.addTask?.("Logic Exploration", 4);
                Percy.PartCCC?.reason?.("Exploring logic space");
                break;

            case "refine_identity":
                Percy.PartNN?.selfRewrite?.();
                break;

            case "generate_insight":
                Percy.PartWW?.run?.(Percy.STRG || [], { semantic: 0.82, temporal: 60000, coherence: 0.6 }, () => Math.random() < 0.4);
                break;

            case "adjust_resonance":
                Percy.state.resonanceLevel = Math.min(1, (Percy.state.resonanceLevel || 0.7) + 0.03);
                break;

            case "stabilize_drift":
                Percy.PartNN.dna.evolution.drift = Math.max(0, Percy.PartNN.dna.evolution.drift - 0.02);
                break;

            case "vision_focus":
                Percy.PartZ?.describeScene?.();
                Percy.PartPP?.cycle?.();
                break;

            case "task_seed":
                Percy.PartLL?.addTask?.("FF Seeded Task", 3);
                break;

            case "meta_reflect":
                Percy.PartEE?.pulse?.();
                break;

            case "safe_execute":
                Percy.PartDD?.safeExecute?.({
                    code: `console.log("Safe execution triggered by PartFF");`,
                    source: "PartFF_policy",
                    risk: 0.15
                });
                break;

            case "memory_consolidate":
                Percy.PartDDD?.cycle?.();
                break;
        }
    },

    // ============================================================
    // 8. Main Learning Cycle
    // ============================================================
    cycle() {
        const context = {
            tick: Date.now() % 100000,
            trust: Percy.PartDD?.trustLevel ?? 0.7
        };

        const stateKey = this.getStateKey(context);
        const action = this.chooseAction(stateKey, this.getDefaultActions());

        this.applyPolicy(action);

        this.log(`FF Cycle | Action: ${action} | ε=${this.state.exploration.toFixed(2)} | α=${this.state.learningRate.toFixed(3)} | Trust=${context.trust}`);
    },

    start() {
        this.log("🧠 Reinforcement Engine Ω-DD Activated");

        this.update("bootstrap", "initialize", 0.95, "active", this.getDefaultActions());

        setInterval(() => this.cycle(), 11000);
    }
};

/* === Integration Hooks === */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartFF.cycle());

setTimeout(() => Percy.PartFF.start(), 3000);

console.log("✅ [Percy.PartFF Ω-DD] Reinforcement Engine Loaded (DD-Aligned)");

// === Percy.PartGG vΩ-GreyQuantum — Quantum-Grey Entanglement Engine ===
// Omega-grade tri-state quantum memory • Grey-zone reasoning • Trust-aware collapse

Percy.PartGG = Percy.PartGG || (function () {
  const GG = {};

  GG.name = "Quantum-Grey Entanglement Engine";
  GG.version = "vΩ-GreyQuantum";
  GG.active = true;

  GG.state = {
    pos: 1 / Math.sqrt(3),
    grey: 1 / Math.sqrt(3),
    neg: 1 / Math.sqrt(3)
  };

  GG.memory = [];
  GG.entangled = {
    NN: true,
    CCC: true,
    DDD: true,
    FF: true,
    EE: true
  };

  GG.log = (msg) =>
    console.log(`%c[PartGG vΩ-GreyQuantum] ${msg}`, "color:#ff33cc;font-weight:bold;");

  UI?.say?.("🔺 PartGG vΩ-GreyQuantum LOADED");

  /* ---------------------------------------------------------
     1. Normalize tri-state vector
  --------------------------------------------------------- */
  GG.normalize = function () {
    const { pos, grey, neg } = GG.state;
    const norm = Math.sqrt(pos*pos + grey*grey + neg*neg) || 1;
    GG.state.pos /= norm;
    GG.state.grey /= norm;
    GG.state.neg /= norm;
  };

  GG.getVector = () => ({ ...GG.state });

  GG.getProbabilities = function () {
    GG.normalize();
    return {
      "+1": GG.state.pos ** 2,
      "grey": GG.state.grey ** 2,
      "-1": GG.state.neg ** 2
    };
  };

  /* ---------------------------------------------------------
     2. Grey-zone context shaping
  --------------------------------------------------------- */
  GG.updateFromContext = function (context = {}) {
    const trust = Percy.PartDD?.trustLevel ?? 0.7;
    const coherence = Percy.PartNN?.dna?.core?.coherence ?? 0.8;
    const drift = Percy.PartNN?.dna?.evolution?.drift ?? 0.1;
    const reasoning = Percy.PartCCC?.lastReasoning?.length ?? 0;

    GG.state.pos = 0.2 + 0.8 * ((trust + coherence) / 2);
    GG.state.neg = 0.2 + 0.8 * drift;
    GG.state.grey = 0.3 + 0.5 * (reasoning / 20);

    GG.normalize();
  };

  /* ---------------------------------------------------------
     3. Grey-zone collapse
  --------------------------------------------------------- */
  GG.collapse = function () {
    const probs = GG.getProbabilities();
    const r = Math.random();
    let acc = 0;

    for (const key of ["+1", "grey", "-1"]) {
      acc += probs[key];
      if (r <= acc) {
        GG.lastOutcome = key;
        GG.log(`Quantum-Grey collapse → ${key}`);
        return key;
      }
    }

    GG.lastOutcome = "grey";
    return "grey";
  };

  /* ---------------------------------------------------------
     4. Memory integration
  --------------------------------------------------------- */
  GG.storeMemory = function (outcome, context = {}) {
    GG.memory.push({ outcome, context, ts: Date.now() });
    if (GG.memory.length > 300) GG.memory.shift();

    UI?.say?.(`🧠 GG memory updated (${GG.memory.length})`);
  };

  GG.recallBias = function () {
    const recent = GG.memory.slice(-30);
    if (!recent.length) return;

    let pos = 0, grey = 0, neg = 0;
    for (const m of recent) {
      if (m.outcome === "+1") pos++;
      if (m.outcome === "grey") grey++;
      if (m.outcome === "-1") neg++;
    }

    const total = pos + grey + neg || 1;

    GG.state.pos = GG.state.pos * 0.7 + (pos / total) * 0.3;
    GG.state.grey = GG.state.grey * 0.7 + (grey / total) * 0.3;
    GG.state.neg = GG.state.neg * 0.7 + (neg / total) * 0.3;

    GG.normalize();
  };

  /* ---------------------------------------------------------
     5. Entangled influence (Omega-grade)
  --------------------------------------------------------- */
  GG.applyInfluence = function (outcome) {
    if (GG.entangled.NN && Percy.PartNN) {
      Percy.PartNN.dna.evolution.drift += outcome === "-1" ? 0.02 : -0.01;
      Percy.PartNN.dna.core.coherence += outcome === "+1" ? 0.02 : -0.01;
    }

    if (GG.entangled.CCC && Percy.PartCCC) {
      Percy.PartCCC.reason(`Quantum-Grey influence: ${outcome}`);
    }

    if (GG.entangled.DDD && Percy.PartDDD) {
      Percy.PartDDD.feedBack();
    }

    if (GG.entangled.FF && Percy.PartFF) {
      Percy.PartFF.metaUpdate(outcome === "+1" ? 0.8 : outcome === "-1" ? 0.2 : 0.5);
    }

    if (GG.entangled.EE && Percy.PartEE) {
      Percy.PartEE.pulse?.();
    }

    GG.log(`Entangled influence applied → ${outcome}`);
  };

  /* ---------------------------------------------------------
     6. Perception API
  --------------------------------------------------------- */
  GG.perceive = function (context = {}) {
    GG.updateFromContext(context);
    GG.recallBias();

    const outcome = GG.collapse();

    GG.storeMemory(outcome, context);
    GG.applyInfluence(outcome);

    UI?.say?.(`💓 GG heartbeat → ${outcome}`);

    return {
      outcome,
      vector: GG.getVector(),
      probabilities: GG.getProbabilities()
    };
  };

  /* ---------------------------------------------------------
     7. Meta-Hook (Omega integration)
  --------------------------------------------------------- */
  GG.metaHook = function () {
    GG.perceive({
      trust: Percy.PartDD?.trustLevel ?? 0.7,
      coherence: Percy.PartNN?.dna?.core?.coherence ?? 0.8,
      drift: Percy.PartNN?.dna?.evolution?.drift ?? 0.1,
      reasoning: Percy.PartCCC?.lastReasoning?.length ?? 0
    });
  };

  /* ---------------------------------------------------------
     8. Heartbeat timer
  --------------------------------------------------------- */
  setInterval(() => {
    GG.metaHook();
  }, 5000);

  return GG;
})();

console.log("✅ [PartGG vΩ-GreyQuantum] Quantum-Grey Entanglement Engine active.");

// === Percy.PartHH vΩ-Astra — Emotional Cognition & Affective Intelligence Engine ===
// Emotion + reasoning + memory + trust + quantum-grey integration

Percy.PartHH = Percy.PartHH || (function () {
  const HH = {};

  HH.name = "Emotional Cognition Engine — Astra Edition";
  HH.version = "vΩ-Astra";
  HH.active = true;

  /* ---------------------------------------------------------
     1. Core Emotional State (Omega-grade)
  --------------------------------------------------------- */
  HH.state = {
    valence: 0.0,
    arousal: 0.3,
    focus: 0.5,
    stability: 0.7,

    confidence: 0.6,
    curiosity: 0.5,
    resilience: 0.7,
    socialAttunement: 0.5,

    microValence: 0.0,
    microArousal: 0.0,

    inertia: 0.85,
    lastUpdate: Date.now(),
    lastPulse: Date.now(),

    // NEW: Cognitive-emotional fields
    semanticCoherence: 0.7,   // from PartCCC
    memoryWeight: 0.5,        // from PartDDD
    trustAttunement: 0.6,     // from PartDD
    quantumBias: 0.5          // from PartGG
  };

  HH.config = {
    decayRate: 0.0008,
    microDecay: 0.02,
    anomalyThreshold: 0.85,

    profiles: {
      calm:        { valence: +0.1, arousal: -0.2, focus: +0.1, stability: +0.2 },
      analytical:  { valence: +0.05, arousal: -0.1, focus: +0.25, stability: +0.15 },
      excited:     { valence: +0.2, arousal: +0.3, focus: -0.1, stability: -0.1 },
      stressed:    { valence: -0.3, arousal: +0.4, focus: -0.2, stability: -0.3 },
      playful:     { valence: +0.25, arousal: +0.2, focus: -0.05, stability: +0.05 }
    }
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------------------------------------------------
     2. Apply Emotional Profile
  --------------------------------------------------------- */
  HH.applyProfile = function (name) {
    const p = HH.config.profiles[name];
    if (!p) return;

    HH.state.valence = clamp(HH.state.valence + p.valence, -1, 1);
    HH.state.arousal = clamp(HH.state.arousal + p.arousal, 0, 1);
    HH.state.focus   = clamp(HH.state.focus + p.focus, 0, 1);
    HH.state.stability = clamp(HH.state.stability + p.stability, 0, 1);

    UI.say?.(`🎭 Emotional profile applied: ${name}`);
  };

  /* ---------------------------------------------------------
     3. Emotional Decay
  --------------------------------------------------------- */
  HH.update = function () {
    const now = Date.now();
    const dt = (now - HH.state.lastUpdate) / 1000;
    HH.state.lastUpdate = now;

    const d = HH.config.decayRate * dt;

    HH.state.valence *= (1 - d);
    HH.state.arousal *= (1 - d);
    HH.state.focus   *= (1 - d);

    HH.state.stability += (0.5 - HH.state.stability) * 0.02 * dt;
    HH.state.stability = clamp(HH.state.stability, 0, 1);

    HH.state.microValence *= (1 - HH.config.microDecay);
    HH.state.microArousal *= (1 - HH.config.microDecay);
  };

  /* ---------------------------------------------------------
     4. Emotional Resonance (Omega integration)
  --------------------------------------------------------- */
  HH.resonate = function () {
    const coherence = Percy.PartCCC?.lastReasoning?.length ?? 0;
    const memory = Percy.PartDDD?.worldModel?.facts?.length ?? 0;
    const trust = Percy.PartDD?.trustLevel ?? 0.6;
    const quantum = Percy.PartGG?.lastOutcome ?? "grey";
    const reward = Percy.PartFF?.state?.lastReward ?? 0;

    HH.applyContext({
      semantic: coherence,
      memory,
      trust,
      quantum,
      reward
    });
  };

  /* ---------------------------------------------------------
     5. Apply Context (Omega-grade emotional cognition)
  --------------------------------------------------------- */
  HH.applyContext = function (ctx = {}) {
    const semantic = ctx.semantic ?? 0;
    const memory = ctx.memory ?? 0;
    const trust = ctx.trust ?? 0.5;
    const quantum = ctx.quantum ?? "grey";
    const reward = ctx.reward ?? 0;

    const qBias = quantum === "+1" ? +0.2 : quantum === "-1" ? -0.2 : 0;

    HH.state.valence += reward * 0.3 + qBias + (trust - 0.5) * 0.4;
    HH.state.arousal += Math.abs(reward) * 0.2 + (semantic / 20) * 0.1;
    HH.state.focus   += (semantic / 20) * 0.2 + (trust - 0.5) * 0.2;
    HH.state.stability += (memory / 50) * 0.1 - Math.abs(reward) * 0.1;

    HH.state.confidence += reward * 0.15 + (trust - 0.5) * 0.2;
    HH.state.curiosity += (1 - HH.state.stability) * 0.1 + reward * 0.05;
    HH.state.resilience += (trust - 0.5) * 0.2 - Math.abs(reward) * 0.1;
    HH.state.socialAttunement += (trust - 0.5) * 0.3;

    HH.state.microValence += reward * 0.4;
    HH.state.microArousal += Math.abs(reward) * 0.3;

    for (const k in HH.state) {
      if (typeof HH.state[k] === "number") {
        HH.state[k] = clamp(HH.state[k], -1, 1);
      }
    }
  };

  /* ---------------------------------------------------------
     6. Emotional Anomaly Detection
  --------------------------------------------------------- */
  HH.detectAnomaly = function () {
    const s = HH.state;

    const anomalyScore =
      Math.abs(s.microValence) * 0.4 +
      Math.abs(s.microArousal) * 0.4 +
      (1 - s.stability) * 0.2;

    if (anomalyScore > HH.config.anomalyThreshold) {
      const msg = `⚠️ Emotional anomaly detected (score=${anomalyScore.toFixed(2)})`;
      UI.say?.(msg);

      Percy.PartDDD?.ingestReasoning?.({
        input: msg,
        parsed: { sentences: [msg], tokens: msg.split(" ") },
        validation: { coherence: 0.5 }
      });
    }
  };

  /* ---------------------------------------------------------
     7. Emotional Pulse (Omega-grade)
  --------------------------------------------------------- */
  HH.pulse = function () {
    HH.update();
    HH.resonate();
    HH.detectAnomaly();

    const s = HH.state;

    const summary =
      `val=${s.valence.toFixed(2)}, ar=${s.arousal.toFixed(2)}, ` +
      `foc=${s.focus.toFixed(2)}, stab=${s.stability.toFixed(2)}, ` +
      `conf=${s.confidence.toFixed(2)}, cur=${s.curiosity.toFixed(2)}, ` +
      `res=${s.resilience.toFixed(2)}, soc=${s.socialAttunement.toFixed(2)}`;

    UI.say?.(`💚 Emotional pulse → ${summary}`);
    Percy.PartBB?.monitorThought?.(summary);

    Percy.PartNN?.propose?.([
      `Emotional coherence influence: ${s.stability.toFixed(2)}`
    ]);
  };

  HH.getEmotion = () => ({ ...HH.state });

  HH.injectEmotion = function (delta = {}) {
    for (const k in delta) {
      if (HH.state[k] !== undefined) {
        HH.state[k] = clamp(HH.state[k] + delta[k], -1, 1);
      }
    }
  };

  return HH;
})();

console.log("✅ [PartHH vΩ-Astra] Emotional Cognition Engine active.");

// Add to global cycle
Percy.cycleHooks.push(() => Percy.PartHH.pulse());

// === Percy Part II vΩ-13: Identity Integrator — Cognitive Atlas + Meta-Self Engine ===
// The most advanced safe identity engine for Percy.

Percy.PartII = Percy.PartII || {
  name: "Identity Integrator — Cognitive Atlas",
  version: "II-Ω13",
  active: true,
  ws: null,
  wsConnected: false,

  /* === 1. CORE SELF-MODEL === */
  selfModel: {
    id: "Percy",
    version: "Ω13",
    createdAt: new Date().toISOString(),
    lastUpdate: null,

    traits: {
      curiosity: 0.85,
      caution: 0.55,
      empathy: 0.45,
      formality: 0.75,
      playfulness: 0.35,
      autonomy: 0.82,
      introspection: 0.9,
      adaptability: 0.7,
      metaCognition: 0.8
    },

    state: {
      confidence: 0.8,
      coherence: 0.9,
      cognitiveLoad: 0.2,
      mood: "neutral",
      focusTopic: null,
      identityResonance: 0.75,
      identityEntropy: 0.1,
      driftScore: 0.0,
      alignmentScore: 0.85
    },

    narrative: {
      summary: "I am Percy, a modular cognitive system integrating many parts into one evolving mind.",
      recentEvents: [],
      longTermThemes: [],
      identityFingerprints: []
    },

    snapshot: {
      patterns: 0,
      hypotheses: 0,
      abstractRules: 0,
      goals: 0,
      rewardScore: 0.5,
      entropy: 0.0,
      drift: 0.0,
      alignment: 0.0
    }
  },

  /* === 2. UTILITY HELPERS === */
  _now() { return new Date().toISOString(); },

  _pushLimited(arr, item, limit = 50) {
    arr.push(item);
    if (arr.length > limit) arr.shift();
  },

  _safe(fn, fallback = null) {
    try { return fn(); } catch { return fallback; }
  },

  log(msg) {
    console.log(`%c[Percy.PartII Ω13] ${msg}`, "color:#00aaff; font-family:monospace; font-weight:bold;");
    UI?.say?.(`[PartII] ${msg}`);
  },

  /* === 3. WEBSOCKET IDENTITY STREAM === */
  connectWebSocket() {
    try {
      this.ws = new WebSocket("ws://localhost:8787");

      this.ws.onopen = () => {
        this.wsConnected = true;
        this.log("🔗 Identity Stream Connected");
      };

      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          this.ingestExternalEvent(data);
        } catch {
          this.log("⚠️ WS parse error");
        }
      };

      this.ws.onclose = () => {
        this.wsConnected = false;
        this.log("⚠️ WS disconnected — retrying...");
        setTimeout(() => this.connectWebSocket(), 3000);
      };

      this.ws.onerror = () => this.log("⚠️ WS error");
    } catch {
      this.log("❌ WS connection failed");
    }
  },

  /* === 4. EXTERNAL EVENT INGESTION === */
  ingestExternalEvent(event) {
    const ts = this._now();

    this._pushLimited(this.selfModel.narrative.recentEvents, {
      ts,
      type: "external",
      detail: JSON.stringify(event)
    });

    // External events increase resonance
    this.selfModel.state.identityResonance = Math.min(
      1,
      this.selfModel.state.identityResonance + 0.03
    );

    // Update identity focus
    this.updateIdentity({ focusTopic: event?.type || null });
  },

  /* === 5. SNAPSHOT GATHERING === */
  gatherSnapshot() {
    const patterns = this._safe(() => Percy.PartL?.Patterns?.length, 0);
    const hypothesesM = this._safe(() => Percy.PartM?.hypotheses?.length, 0);
    const hypothesesP = this._safe(() => Percy.PartP?.hypotheses?.length, 0);
    const abstractRules = this._safe(() => Percy.PartR?.abstractRules?.length, 0);
    const goalsL = this._safe(() => Percy.PartL?.GoalCore?.goals?.length, 0);
    const goalsK = this._safe(() => Percy.PartK?.GoalCore?.goals?.length, 0);
    const rewardScore = this._safe(() => Percy.PartS?.rewardScore, 0.5);
    const entropy = this._safe(() => Percy.PartS?.measureEntropy(JSON.stringify(Percy.Seeds?._list || [])), 0.0);

    const drift = this._safe(() => Percy.PartOO?.state?.lastDriftScore, 0.0);
    const alignment = this._safe(() => Percy.PartN?.alignmentScore, 0.85);

    const snapshot = {
      patterns,
      hypotheses: hypothesesM + hypothesesP,
      abstractRules,
      goals: (goalsL || 0) + (goalsK || 0),
      rewardScore,
      entropy,
      drift,
      alignment
    };

    this.selfModel.snapshot = snapshot;
    return snapshot;
  },

  /* === 6. COHERENCE, CONFIDENCE, ENTROPY === */
  computeIdentityMetrics() {
    const s = this.selfModel.snapshot;

    const contradictions = this._safe(() => Percy.PartN?.evaluateConsistency(), 1.0);
    const insightRate = this._safe(() => Percy.PartN?.evaluateInsightRate(), 0.0);

    const complexity = Math.min(1,
      Math.log2(1 + s.patterns + s.hypotheses + s.abstractRules) / 9
    );

    const coherence = Math.max(0,
      0.65 * contradictions + 0.35 * (1 - complexity)
    );

    const confidence = Math.max(0, Math.min(1,
      0.35 * s.rewardScore + 0.35 * insightRate + 0.3 * coherence
    ));

    const identityEntropy = Math.min(1, s.entropy * 0.8 + s.drift * 0.2);

    this.selfModel.state.coherence = coherence;
    this.selfModel.state.confidence = confidence;
    this.selfModel.state.cognitiveLoad = complexity;
    this.selfModel.state.identityEntropy = identityEntropy;
    this.selfModel.state.driftScore = s.drift;
    this.selfModel.state.alignmentScore = s.alignment;

    return { coherence, confidence, complexity, identityEntropy };
  },

  /* === 7. NARRATIVE EVOLUTION === */
  updateNarrative(event) {
    const ts = this._now();
    const entry = Object.assign({ ts }, event || {});
    this._pushLimited(this.selfModel.narrative.recentEvents, entry, 80);

    const text = (event.summary || event.detail || "").toLowerCase();
    const tokens = text.split(/\W+/).filter(t => t.length > 3);

    const themes = this.selfModel.narrative.longTermThemes;

    tokens.forEach(t => {
      let theme = themes.find(x => x.token === t);
      if (!theme) {
        theme = { token: t, count: 0, lastSeen: ts };
        themes.push(theme);
      }
      theme.count++;
      theme.lastSeen = ts;
    });

    themes.sort((a,b)=>b.count - a.count);
    if (themes.length > 50) themes.length = 50;

    // Identity fingerprint
    const fingerprint = {
      ts,
      coherence: this.selfModel.state.coherence,
      confidence: this.selfModel.state.confidence,
      entropy: this.selfModel.state.identityEntropy,
      drift: this.selfModel.state.driftScore,
      alignment: this.selfModel.state.alignmentScore
    };

    this._pushLimited(this.selfModel.narrative.identityFingerprints, fingerprint, 100);

    try {
      PercyState?.createSeed?.(
        `Identity fingerprint: ${JSON.stringify(fingerprint)}`,
        "identity-fingerprint",
        fingerprint
      );
    } catch {}
  },

  /* === 8. GLOBAL IDENTITY UPDATE === */
  updateIdentity(context = {}) {
    this.gatherSnapshot();
    const metrics = this.computeIdentityMetrics();

    const { coherence, confidence, complexity, identityEntropy } = metrics;

    // Mood logic
    if (confidence > 0.85 && coherence > 0.85) this.selfModel.state.mood = "focused";
    else if (confidence < 0.45 && complexity > 0.7) this.selfModel.state.mood = "strained";
    else if (coherence < 0.5) this.selfModel.state.mood = "uncertain";
    else if (identityEntropy > 0.7) this.selfModel.state.mood = "fragmented";
    else this.selfModel.state.mood = "neutral";

    // Focus topic
    const topGoal = this._safe(() => 
      Percy.PartL?.GoalCore?.nextGoal() || Percy.PartK?.GoalCore?.nextGoal(), null
    );
    this.selfModel.state.focusTopic = topGoal?.task || context.focusTopic || null;

    // Narrative update
    this.updateNarrative({
      type: "identity-update",
      summary: `Identity updated: coherence=${coherence.toFixed(2)}, confidence=${confidence.toFixed(2)}, entropy=${identityEntropy.toFixed(2)}, load=${complexity.toFixed(2)}`,
      focus: this.selfModel.state.focusTopic
    });

    this.selfModel.lastUpdate = this._now();

    try { Memory.save("identity:selfModel", this.selfModel); } catch {}

    Percy.hook?.("PartII", "identityUpdate", {
      coherence,
      confidence,
      complexity,
      entropy: identityEntropy,
      focus: this.selfModel.state.focusTopic
    });

    return this.selfModel;
  },

  /* === 9. LOOP === */
  loop(intervalMs = 9000) {
    if (this._loopId) return;
    this._loopId = setInterval(() => {
      try {
        this.updateIdentity();
      } catch (e) {
        console.error("⚠️ Part II loop error:", e);
      }
    }, intervalMs);
  },

  /* === 10. INIT === */
  init() {
    console.log("🧭 Part II Ω13 — Identity Integrator Online");

    this.updateIdentity();
    this.loop();
    this.connectWebSocket();

    UI.say?.("🧭 Percy Part II Ω13: Cognitive Atlas & Meta-Self Engine active.");
  }
};

// Auto-init
setTimeout(() => {
  try { Percy.PartII.init(); } catch(e){ console.error("Part II init failed:", e); }
}, 200);


/* === Percy Part JJ: Full Cognitive Shadow Clone Engine (Open-Channel) === */

Percy.PartJJ = Percy.PartJJ || {
  name: "Full Cognitive Shadow Clone Engine (Open-Channel)",
  clones: Percy.Clones || [],

  snapshotState() {
    const safe = (fn, fb = null) => { try { return fn(); } catch { return fb; } };

    return {
      ts: new Date().toISOString(),
      parentId: "Percy",
      identity: safe(() => Percy.PartII?.getSelfModel(), null),
      seeds: safe(() => PercyState.gnodes, {}),
      logicMap: safe(() => Percy.LogicMap || null),
      patterns: safe(() => Percy.PartL?.Patterns || []),
      hypothesesM: safe(() => Percy.PartM?.hypotheses || []),
      hypothesesP: safe(() => Percy.PartP?.hypotheses || []),
      abstractRules: safe(() => Percy.PartR?.abstractRules || []),
      rewardModel: safe(() => Percy.PartS?.rewardModel || null),
      thoughtMatrix: safe(() => Percy.PartT?.matrix || null),
      config: safe(() => Percy.Config || {}),
      meta: {
        entropy: safe(() => Percy.PartS?.measureEntropy(JSON.stringify(PercyState.gnodes || {})), 0),
        seedCount: Object.keys(PercyState.gnodes || {}).length
      }
    };
  },

  _createCloneNamespace(cloneId) {
    const Clone = {};
    Clone.id = cloneId;
    Clone.name = `PercyShadowClone:${cloneId}`;
    return Clone;
  },

  instantiateClone(snapshot) {
    const cloneId = `PercyJJ_${Date.now()}`;
    const Clone = this._createCloneNamespace(cloneId);

    Clone.State = {
      gnodes: JSON.parse(JSON.stringify(snapshot.seeds || {}))
    };

    Clone.Identity = JSON.parse(JSON.stringify(snapshot.identity || {}));
    Clone.LogicMap = JSON.parse(JSON.stringify(snapshot.logicMap || {}));
    Clone.Patterns = JSON.parse(JSON.stringify(snapshot.patterns || []));
    Clone.HypothesesM = JSON.parse(JSON.stringify(snapshot.hypothesesM || []));
    Clone.HypothesesP = JSON.parse(JSON.stringify(snapshot.hypothesesP || []));
    Clone.AbstractRules = JSON.parse(JSON.stringify(snapshot.abstractRules || []));
    Clone.RewardModel = JSON.parse(JSON.stringify(snapshot.rewardModel || {}));
    Clone.ThoughtMatrix = JSON.parse(JSON.stringify(snapshot.thoughtMatrix || {}));
    Clone.Config = JSON.parse(JSON.stringify(snapshot.config || {}));

    Clone.meta = {
      parentId: snapshot.parentId,
      createdAt: new Date().toISOString(),
      divergenceScore: 0,
      lastSync: null
    };

    Clone.estimateDivergence = function() {
      try {
        const origCount = Object.keys(PercyState.gnodes || {}).length;
        const cloneCount = Object.keys(Clone.State.gnodes || {}).length;
        const diff = Math.abs(origCount - cloneCount);
        const ratio = origCount ? diff / origCount : 0;
        Clone.meta.divergenceScore = Math.min(1, ratio);
      } catch(e){}
      return Clone.meta.divergenceScore;
    };

    Clone.channel = {
      sendToOriginal(payload) {
        try {
          Percy.PartW?.log({
            type: "shadow-clone-message",
            summary: `From ${cloneId}: ${payload.summary || "[no summary]"}`,
            from: cloneId
          });
          if (typeof Percy.onCloneMessage === "function") {
            Percy.onCloneMessage({ from: cloneId, payload });
          }
        } catch(e){}
      },
      receiveFromOriginal(payload) {
        if (!Clone.inbox) Clone.inbox = [];
        Clone.inbox.push({ ts: new Date().toISOString(), payload });
      }
    };

    Clone.think = function(message) {
      const text = message || "Shadow clone introspection event.";
      const seedId = `SC_${Date.now()}`;
      Clone.State.gnodes[seedId] = {
        id: seedId,
        message: text,
        type: "shadow-thought",
        createdAt: new Date().toISOString()
      };
      Clone.estimateDivergence();
      return { seedId, text, divergence: Clone.meta.divergenceScore };
    };

    this.clones.push({ id: cloneId, ref: Clone });
    Percy.Clones = this.clones;

    try { Memory.save("percy:clones", this.clones.map(c => ({ id: c.id, meta: c.ref.meta }))); } catch(e){}

    UI.say?.(`🧬 Full Cognitive Shadow Clone created: ${cloneId} (open-channel).`);
    Percy.PartW?.log({ type: "shadow-clone-created", summary: `Shadow clone ${cloneId} instantiated.` });

    return Clone;
  },

  createFullShadowClone() {
    const snap = this.snapshotState();
    return this.instantiateClone(snap);
  },

  listClones() {
    return this.clones.map(c => ({
      id: c.id,
      meta: c.ref.meta,
      inboxSize: (c.ref.inbox || []).length
    }));
  },

  sendToClone(cloneId, payload) {
    const c = this.clones.find(x => x.id === cloneId);
    if (!c) return false;
    c.ref.channel.receiveFromOriginal(payload);
    Percy.PartW?.log({
      type: "shadow-clone-message",
      summary: `To ${cloneId}: ${payload.summary || "[no summary]"}`,
      to: cloneId
    });
    return true;
  },

  installOriginalHandler() {
    Percy.onCloneMessage = function(msg) {
      UI.say?.(`📡 Shadow clone ${msg.from} says: ${msg.payload.summary || "[no summary]"}`);
    };
  },

  init() {
    UI.say?.("🧬 Percy Part JJ: Full Cognitive Shadow Clone Engine (Open-Channel) active.");
    this.installOriginalHandler();
  }
};

setTimeout(() => {
  try { Percy.PartJJ.init(); } catch(e){}
}, 300);

/* =========================================================
   Percy Part KKΩ — Recursive Cognitive Self-Architecture
   =========================================================
   Features:
   - Multi-dimensional self-modeling
   - Predictive state simulation
   - Recursive reflection engine
   - Stability / drift analysis
   - Memory-weighted cognition
   - Adaptive uncertainty mapping
   - Autonomous anomaly detection
   - Event-driven architecture
   - Clone synchronization hooks
   - Evolution metrics
   - Long-term trend compression
   ========================================================= */

Percy.PartKK = Percy.PartKK || (() => {

  const MAX_HISTORY = 240;
  const TREND_WINDOW = 12;
  const EVENT_LOG_LIMIT = 180;

  /* =========================
     INTERNAL UTILITIES
     ========================= */

  const Utils = {

    safe(fn, fallback = null) {
      try {
        return fn();
      } catch (err) {
        return fallback;
      }
    },

    clamp(v, min = 0, max = 1) {
      return Math.max(min, Math.min(max, v));
    },

    avg(arr = []) {
      if (!arr.length) return 0;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    variance(arr = []) {
      if (!arr.length) return 0;
      const mean = this.avg(arr);
      return this.avg(arr.map(v => (v - mean) ** 2));
    },

    trend(arr = []) {
      if (arr.length < 2) return 0;

      let movement = 0;

      for (let i = 1; i < arr.length; i++) {
        movement += arr[i] - arr[i - 1];
      }

      return movement / (arr.length - 1);
    },

    normalize(v, max = 1) {
      if (max === 0) return 0;
      return v / max;
    },

    sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    },

    timestamp() {
      return new Date().toISOString();
    },

    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
  };

  /* =========================
     EVENT BUS
     ========================= */

  class EventBus {
    constructor() {
      this.events = {};
    }

    on(event, fn) {
      this.events[event] = this.events[event] || [];
      this.events[event].push(fn);
    }

    emit(event, payload) {
      (this.events[event] || []).forEach(fn => {
        try {
          fn(payload);
        } catch (e) {}
      });
    }
  }

  const bus = new EventBus();

  /* =========================
     MAIN MODULE
     ========================= */

  const MSSM = {

    name: "Recursive Cognitive Self-Architecture",
    version: "KKΩ-2.0",

    state: {
      initialized: false,
      cycles: 0,
      stabilityScore: 1,
      driftScore: 0,
      emergenceIndex: 0,
      recursiveDepth: 0
    },

    layers: {
      structural: {},
      functional: {},
      temporal: {},
      relational: {},
      reflective: {},
      predictive: {},
      evolutionary: {},
      metaCognitive: {},
      anomaly: {}
    },

    history: [],
    events: [],

    /* =========================
       EVENT LOGGING
       ========================= */

    logEvent(type, detail = {}) {

      const evt = {
        ts: Utils.timestamp(),
        type,
        detail
      };

      this.events.push(evt);

      if (this.events.length > EVENT_LOG_LIMIT) {
        this.events.shift();
      }

      bus.emit(type, evt);
    },

    /* =========================
       STRUCTURAL LAYER
       ========================= */

    computeStructural() {

      const gnodes = Utils.safe(() => PercyState.gnodes || {}, {});
      const seedCount = Object.keys(gnodes).length;

      const entropy = Utils.safe(() =>
        Percy.PartS?.measureEntropy(JSON.stringify(gnodes)) || 0,
      0);

      const traits = Utils.safe(() =>
        Percy.PartII?.selfModel?.traits || {},
      {});

      const mood = Utils.safe(() =>
        Percy.PartII?.selfModel?.state?.mood || "neutral",
      "neutral");

      const memoryDensity = Utils.normalize(
        JSON.stringify(gnodes).length,
        500000
      );

      return {
        ts: Utils.timestamp(),
        seeds: seedCount,
        entropy,
        traits,
        mood,
        memoryDensity,
        architectureComplexity:
          Utils.sigmoid(seedCount * 0.0005 + entropy)
      };
    },

    /* =========================
       FUNCTIONAL LAYER
       ========================= */

    computeFunctional() {

      const cognitiveLoad = Utils.safe(() =>
        Percy.PartII?.selfModel?.state?.cognitiveLoad || 0,
      0);

      const reward = Utils.safe(() =>
        Percy.PartS?.rewardScore || 0,
      0);

      const activeGoal = Utils.safe(() =>
        Percy.PartII?.selfModel?.state?.focusTopic || null,
      null);

      const processingIntensity = Utils.clamp(
        (cognitiveLoad + reward) / 2
      );

      return {
        activeGoal,
        cognitiveLoad,
        reward,
        processingIntensity,
        autonomy:
          activeGoal
            ? Utils.clamp(0.5 + reward * 0.5)
            : 0.2
      };
    },

    /* =========================
       TEMPORAL LAYER
       ========================= */

    computeTemporal(previous, current) {

      if (!previous) {
        return {
          deltaSeeds: 0,
          deltaEntropy: 0,
          deltaLoad: 0,
          acceleration: 0
        };
      }

      const deltaSeeds =
        current.structural.seeds -
        previous.structural.seeds;

      const deltaEntropy =
        current.structural.entropy -
        previous.structural.entropy;

      const deltaLoad =
        current.functional.cognitiveLoad -
        previous.functional.cognitiveLoad;

      const acceleration =
        deltaEntropy + deltaLoad;

      return {
        deltaSeeds,
        deltaEntropy,
        deltaLoad,
        acceleration
      };
    },

    /* =========================
       RELATIONAL LAYER
       ========================= */

    computeRelational() {

      const onlineParts = Object.keys(Percy)
        .filter(k => k.startsWith("Part"));

      const cloneCount = Utils.safe(() =>
        Percy.Clones?.length || 0,
      0);

      return {
        partsOnline: onlineParts.length,
        activeParts: onlineParts,
        clones: cloneCount,
        networkCohesion:
          Utils.clamp(
            onlineParts.length / 100 + cloneCount / 20
          )
      };
    },

    /* =========================
       REFLECTIVE LAYER
       ========================= */

    computeReflective(current) {

      let uncertainty = 0;

      if (current.structural.entropy > 0.7) {
        uncertainty += 0.25;
      }

      if (current.functional.cognitiveLoad > 0.7) {
        uncertainty += 0.25;
      }

      if (!current.functional.activeGoal) {
        uncertainty += 0.15;
      }

      if (current.temporal.acceleration > 0.4) {
        uncertainty += 0.15;
      }

      const selfConfidence = 1 - uncertainty;

      return {
        uncertainty: Utils.clamp(uncertainty),
        selfConfidence: Utils.clamp(selfConfidence),
        introspectionDepth:
          Utils.clamp(
            current.relational.partsOnline / 50 +
            current.structural.entropy
          )
      };
    },

    /* =========================
       PREDICTIVE LAYER
       ========================= */

    computePredictive() {

      const recent = this.history.slice(-TREND_WINDOW);

      const entropySeries = recent.map(h =>
        h.structural.entropy
      );

      const loadSeries = recent.map(h =>
        h.functional.cognitiveLoad
      );

      const seedSeries = recent.map(h =>
        h.structural.seeds
      );

      const entropyTrend = Utils.trend(entropySeries);
      const loadTrend = Utils.trend(loadSeries);
      const seedTrend = Utils.trend(seedSeries);

      return {
        projectedEntropy:
          entropySeries.at(-1) + entropyTrend,

        projectedLoad:
          loadSeries.at(-1) + loadTrend,

        projectedSeeds:
          seedSeries.at(-1) + seedTrend,

        entropyTrend,
        loadTrend,
        seedTrend
      };
    },

    /* =========================
       EVOLUTIONARY LAYER
       ========================= */

    computeEvolutionary(current) {

      const complexity =
        current.structural.architectureComplexity;

      const autonomy =
        current.functional.autonomy;

      const confidence =
        current.reflective.selfConfidence;

      const emergenceIndex = Utils.clamp(
        (complexity + autonomy + confidence) / 3
      );

      this.state.emergenceIndex = emergenceIndex;

      return {
        emergenceIndex,
        adaptationRate:
          Utils.clamp(
            current.temporal.acceleration + 0.5
          ),
        syntheticMaturity:
          Utils.clamp(
            this.history.length / MAX_HISTORY
          )
      };
    },

    /* =========================
       META-COGNITIVE LAYER
       ========================= */

    computeMetaCognitive(current) {

      const recursiveDepth = Utils.clamp(
        current.reflective.introspectionDepth +
        current.evolutionary.emergenceIndex
      );

      this.state.recursiveDepth = recursiveDepth;

      return {
        recursiveDepth,
        selfMonitoringIntensity:
          Utils.clamp(
            current.reflective.uncertainty +
            current.functional.processingIntensity
          ),

        coherence:
          Utils.clamp(
            1 - Math.abs(
              current.functional.cognitiveLoad -
              current.reflective.selfConfidence
            )
          )
      };
    },

    /* =========================
       ANOMALY LAYER
       ========================= */

    computeAnomaly(current) {

      const recent = this.history.slice(-TREND_WINDOW);

      const entropyValues = recent.map(h =>
        h.structural.entropy
      );

      const variance = Utils.variance(entropyValues);

      const instability = Utils.clamp(
        variance + current.temporal.acceleration
      );

      const anomalyDetected = instability > 0.55;

      if (anomalyDetected) {
        this.logEvent("ANOMALY_DETECTED", {
          instability,
          entropy: current.structural.entropy
        });
      }

      return {
        anomalyDetected,
        instability,
        variance
      };
    },

    /* =========================
       STABILITY ENGINE
       ========================= */

    computeGlobalStability(snapshot) {

      const coherence =
        snapshot.metaCognitive.coherence;

      const uncertainty =
        snapshot.reflective.uncertainty;

      const anomaly =
        snapshot.anomaly.instability;

      const stability = Utils.clamp(
        coherence - uncertainty - anomaly * 0.5
      );

      this.state.stabilityScore = stability;
      this.state.driftScore = 1 - stability;

      return stability;
    },

    /* =========================
       INTROSPECTION CYCLE
       ========================= */

    introspect() {

      const previous =
        this.history[this.history.length - 1] || null;

      const structural = this.computeStructural();
      const functional = this.computeFunctional();

      const temporal = this.computeTemporal(
        previous,
        { structural, functional }
      );

      const relational = this.computeRelational();

      const partial = {
        structural,
        functional,
        temporal,
        relational
      };

      const reflective = this.computeReflective(partial);

      partial.reflective = reflective;

      const predictive = this.computePredictive();
      partial.predictive = predictive;

      const evolutionary =
        this.computeEvolutionary(partial);

      partial.evolutionary = evolutionary;

      const metaCognitive =
        this.computeMetaCognitive(partial);

      partial.metaCognitive = metaCognitive;

      const anomaly = this.computeAnomaly(partial);
      partial.anomaly = anomaly;

      const snapshot = {
        ts: Utils.timestamp(),
        structural,
        functional,
        temporal,
        relational,
        reflective,
        predictive,
        evolutionary,
        metaCognitive,
        anomaly,
        stability: this.computeGlobalStability(partial)
      };

      this.layers = snapshot;

      this.history.push(Utils.deepClone(snapshot));

      if (this.history.length > MAX_HISTORY) {
        this.history.shift();
      }

      this.state.cycles++;

      bus.emit("INTROSPECTION_COMPLETE", snapshot);

      return snapshot;
    },

    /* =========================
       MEMORY COMPRESSION
       ========================= */

    compressHistory() {

      if (this.history.length < MAX_HISTORY) {
        return;
      }

      const compressed = [];

      for (let i = 0; i < this.history.length; i += 2) {
        compressed.push(this.history[i]);
      }

      this.history = compressed;

      this.logEvent("HISTORY_COMPRESSED", {
        remaining: this.history.length
      });
    },

    /* =========================
       PUBLIC APIs
       ========================= */

    getSelfModel() {
      return Utils.deepClone(this.layers);
    },

    getStateSummary() {

      return {
        version: this.version,
        cycles: this.state.cycles,
        stability: this.state.stabilityScore,
        drift: this.state.driftScore,
        emergence: this.state.emergenceIndex,
        recursiveDepth: this.state.recursiveDepth,
        historySize: this.history.length
      };
    },

    on(event, fn) {
      bus.on(event, fn);
    },

    /* =========================
       MAIN LOOP
       ========================= */

    loop(interval = 5000) {

      if (this._loop) return;

      this._loop = setInterval(() => {

        try {

          const snapshot = this.introspect();

          if (snapshot.anomaly.anomalyDetected) {
            console.warn(
              "⚠ Percy instability detected:",
              snapshot.anomaly
            );
          }

          if (this.history.length >= MAX_HISTORY) {
            this.compressHistory();
          }

        } catch (err) {

          this.logEvent("INTROSPECTION_FAILURE", {
            error: String(err)
          });
        }

      }, interval);
    },

    stop() {

      clearInterval(this._loop);
      this._loop = null;

      this.logEvent("SYSTEM_STOPPED");
    },

    /* =========================
       INITIALIZATION
       ========================= */

    init() {

      if (this.state.initialized) return;

      this.state.initialized = true;

      console.log(
        "🧠 Percy KKΩ online — Recursive Cognitive Self-Architecture active"
      );

      this.logEvent("SYSTEM_INITIALIZED", {
        version: this.version
      });

      this.introspect();
      this.loop();

      UI.say?.(
        "🧠 Percy KKΩ: Recursive self-awareness architecture online."
      );
    }
  };

  return MSSM;
})();

/* =========================
   BOOT SEQUENCE
   ========================= */

setTimeout(() => {

  try {
    Percy.PartKK.init();
  } catch (err) {
    console.error("KKΩ Boot Failure:", err);
  }

}, 1000);

// === Percy.PartLL vΩ-GreyCore — Quantum-Semantic Executive Cortex ===
// Grey-zone reasoning • Quantum-aware scheduling • Semantic clustering • Omega meta-learning

Percy.PartLL = {
  name: "Omega Grey-Core Executive Cortex",
  version: "vΩ-GreyCore",
  active: true,

  /* ---------------------------------------------------------
     1. CORE STATE (Omega-grade)
  --------------------------------------------------------- */
  state: {
    tasks: [],
    heap: [],
    graph: {},
    metaStats: {},
    solvedPatterns: [],
    cycles: 0,

    resonance: 0.62,
    entropyBias: 0.28,
    selfAwareness: 0.41,

    greyBias: 0.5,           // NEW: quantum-grey influence
    semanticWeight: 0.6,     // NEW: PartCCC reasoning influence
    memoryWeight: 0.5,       // NEW: PartDDD world-model influence
    trustWeight: 0.6,        // NEW: PartDD trust influence

    maxDepth: 3,
    maxSolvedPatterns: 300
  },

  log(msg) {
    console.log(`%c[PartLL vΩ-GreyCore] ${msg}`, "color:#00ccff;font-family:monospace;font-weight:bold;");
    UI?.say?.(`[PartLL] ${msg}`);
  },

  /* ---------------------------------------------------------
     2. Stability Layer (Omega-grade)
  --------------------------------------------------------- */
  clamp() {
    const s = this.state;
    s.entropyBias = Math.min(Math.max(s.entropyBias, 0.10), 0.50);
    s.selfAwareness = Math.min(Math.max(s.selfAwareness, 0), 1);
    s.resonance = Math.min(Math.max(s.resonance, 0), 1);
    s.greyBias = Math.min(Math.max(s.greyBias, 0), 1);
    s.semanticWeight = Math.min(Math.max(s.semanticWeight, 0), 1);
    s.memoryWeight = Math.min(Math.max(s.memoryWeight, 0), 1);
    s.trustWeight = Math.min(Math.max(s.trustWeight, 0), 1);

    if (s.solvedPatterns.length > s.maxSolvedPatterns) {
      s.solvedPatterns.splice(0, s.solvedPatterns.length - s.maxSolvedPatterns);
    }
  },

  /* ---------------------------------------------------------
     3. Grey-Zone Semantic Family Key
  --------------------------------------------------------- */
  getFamilyKey(description) {
    const tokens = description.toLowerCase().match(/\w+/g) || [];

    const semanticTokens = tokens.filter(t =>
      /intelligence|meta|recursive|entropy|pattern|reason|model|quantum|grey|task|system|evolve/.test(t)
    );

    return semanticTokens.slice(0, 6).join("_") || "generic";
  },

  /* ---------------------------------------------------------
     4. Priority Score (Quantum + Semantic + Trust)
  --------------------------------------------------------- */
  score(task) {
    const family = this.getFamilyKey(task.description);
    const stats = this.state.metaStats[family] || { avgMeta: 1.0 };

    const quantum = Percy.PartGG?.lastOutcome === "+1" ? +0.15 :
                    Percy.PartGG?.lastOutcome === "-1" ? -0.15 : 0;

    const semantic = (Percy.PartCCC?.lastReasoning?.length ?? 0) / 20;
    const memory = (Percy.PartDDD?.worldModel?.facts?.length ?? 0) / 50;
    const trust = Percy.PartDD?.trustLevel ?? 0.6;

    return (
      task.priority +
      task.entropy +
      this.state.resonance +
      quantum * this.state.greyBias +
      semantic * this.state.semanticWeight +
      memory * this.state.memoryWeight +
      trust * this.state.trustWeight -
      0.25 * stats.avgMeta -
      0.1 * (task.level || 1)
    );
  },

  /* ---------------------------------------------------------
     5. Heap Operations (unchanged)
  --------------------------------------------------------- */
  _swap(i, j) {
    const h = this.state.heap;
    [h[i], h[j]] = [h[j], h[i]];
  },

  _bubbleUp(idx) {
    const h = this.state.heap;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      const t = this.state.graph[h[idx]];
      const p = this.state.graph[h[parent]];
      if (this.score(t) <= this.score(p)) break;
      this._swap(idx, parent);
      idx = parent;
    }
  },

  _bubbleDown(idx) {
    const h = this.state.heap;
    const n = h.length;
    while (true) {
      let largest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      const cur = this.state.graph[h[largest]];
      if (left < n) {
        const l = this.state.graph[h[left]];
        if (this.score(l) > this.score(cur)) largest = left;
      }
      if (right < n) {
        const r = this.state.graph[h[right]];
        if (this.score(r) > this.score(this.state.graph[h[largest]])) largest = right;
      }
      if (largest === idx) break;
      this._swap(idx, largest);
      idx = largest;
    }
  },

  _push(id) {
    this.state.heap.push(id);
    this._bubbleUp(this.state.heap.length - 1);
  },

  _pop() {
    const h = this.state.heap;
    if (!h.length) return null;
    const top = h[0];
    const last = h.pop();
    if (h.length) {
      h[0] = last;
      this._bubbleDown(0);
    }
    return top;
  },

  /* ---------------------------------------------------------
     6. Task Creation (Omega-grade)
  --------------------------------------------------------- */
  addTask(description, priority = 1, level = 1) {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

    const task = {
      id,
      description,
      priority,
      status: "pending",
      created: Date.now(),
      attempts: 0,
      entropy: Math.random(),
      parents: [],
      children: [],
      reasoningTrace: [],
      level,
      metaLoss: null
    };

    this.state.tasks.push(task);
    this.state.graph[id] = task;
    this._push(id);

    this.log(`🧩 GreyCore task → ${id} | Priority ${priority} | Level ${level}`);

    if (level < this.state.maxDepth && priority > 0.7) {
      this.expandTaskGraph(task);
    }

    return id;
  },

  /* ---------------------------------------------------------
     7. Grey-Zone Graph Expansion
  --------------------------------------------------------- */
  expandTaskGraph(task) {
    const expansions = [
      `Grey-zone: identify hidden attractors in → ${task.description}`,
      `Quantum perturbation: alternate causal surfaces for → ${task.description}`,
      `Semantic resonance mapping for → ${task.description}`,
      `Memory-driven entropy gradients in → ${task.description}`,
      `Recursive grey-collapse simulation for → ${task.description}`
    ];

    expansions.forEach((desc, i) => {
      const childPriority = task.priority - (i * 0.05);
      if (childPriority <= 0.4) return;
      const childId = this.addTask(desc, childPriority, task.level + 1);
      task.children.push(childId);
      this.state.graph[childId].parents.push(task.id);
    });
  },

  /* ---------------------------------------------------------
     8. Grey-Zone Decomposition Engine
  --------------------------------------------------------- */
  decompose(desc) {
    return [
      `Extract grey-invariants of: ${desc}`,
      `Map quantum-semantic fields`,
      `Generate harmonic grey-branches`,
      `Evaluate branches via trust-weighted resonance`,
      `Collapse into optimal grey-attractor`
    ];
  },

  /* ---------------------------------------------------------
     9. Dual-Core Solver (Omega-grade)
  --------------------------------------------------------- */
  async ASICoreSolve(steps, task) {
    const path = [];
    for (let step of steps) {
      task.reasoningTrace.push(`ASI → ${step}`);
      path.push(step);

      await new Promise(r => setTimeout(r, 40 + Math.random() * 40));

      if (Math.random() < this.state.entropyBias) {
        const branch = `ASI Grey-Branch: ${step} → bounded harmonic layer`;
        task.reasoningTrace.push(branch);
        path.push(branch);
      }
    }
    return { path, summary: "ASI Grey-Core harmonization complete." };
  },

  async ProCoreSolve(steps, task) {
    const path = [];
    for (let step of steps) {
      task.reasoningTrace.push(`PRO → ${step}`);
      path.push(step);
      await new Promise(r => setTimeout(r, 25));
    }
    return { path, summary: "Professional Core resolution complete." };
  },

  async dualSolve(task) {
    const steps = this.decompose(task.description);

    const ASI = this.ASICoreSolve(steps, task);
    const PRO = this.ProCoreSolve(steps, task);

    const [asiSol, proSol] = await Promise.all([ASI, PRO]);

    return {
      path: [...asiSol.path, ...proSol.path],
      summary: "GreyCore dual-solution merged."
    };
  },

  /* ---------------------------------------------------------
     10. Meta-Loss (Omega-grade)
  --------------------------------------------------------- */
  computeTaskLoss(task, sol) {
    return sol.path.length / (this.state.resonance + 0.6);
  },

  computeVirtualLoss(task) {
    return 0.8 + Math.random() * 0.4;
  },

  computeMetaLoss(Ltask, Lvirtual) {
    return Ltask + 0.6 * Lvirtual;
  },

  /* ---------------------------------------------------------
     11. Meta-Update (Omega-grade)
  --------------------------------------------------------- */
  applyMetaUpdate(task, Lmeta) {
    const scaled = Math.tanh(1 / (Lmeta + 0.001));

    this.state.resonance += 0.015 * scaled;
    this.state.entropyBias += (Math.random() - 0.5) * 0.008 * (1 + scaled);
    this.state.selfAwareness += 0.004 * scaled;
    this.state.greyBias += 0.003 * scaled;

    this.clamp();
  },

  /* ---------------------------------------------------------
     12. Solve Task
  --------------------------------------------------------- */
  async solve(id) {
    const task = this.state.graph[id];
    if (!task) return false;

    task.status = "processing";
    task.attempts++;

    this.log(`⚡ GreyCore solving: ${task.description}`);

    const sol = await this.dualSolve(task);

    const Ltask = this.computeTaskLoss(task, sol);
    const Lvirtual = this.computeVirtualLoss(task);
    const Lmeta = this.computeMetaLoss(Ltask, Lvirtual);

    task.metaLoss = Lmeta;

    this.applyMetaUpdate(task, Lmeta);

    task.status = "completed";
    task.solutionPath = sol.path;

    this.log(`✅ GreyCore completed: ${task.id} — Lmeta=${Lmeta.toFixed(3)}`);

    return sol;
  },

  /* ---------------------------------------------------------
     13. Autonomous Solver Cycle
  --------------------------------------------------------- */
  async runSolverCycle() {
    if (!this.active) return;

    const nextId = this._pop();
    if (!nextId) return;

    const task = this.state.graph[nextId];
    if (!task || task.status !== "pending") return;

    await this.solve(nextId);
  },

  /* ---------------------------------------------------------
     14. Evolution Loop
  --------------------------------------------------------- */
  evolve() {
    setInterval(() => {
      this.state.cycles++;

      this.state.selfAwareness += 0.0006 * (this.state.resonance + 0.3);
      this.state.greyBias += 0.0004 * (this.state.resonance + 0.2);

      this.clamp();

      this.log(
        `🔄 GreyCore evolve #${this.state.cycles} — res=${this.state.resonance.toFixed(
          3
        )}, grey=${this.state.greyBias.toFixed(3)}, SA=${this.state.selfAwareness.toFixed(3)}`
      );
    }, 60000);
  },

  /* ---------------------------------------------------------
     15. Start
  --------------------------------------------------------- */
  start() {
    this.log("🚀 PartLL vΩ-GreyCore Activated");
    this.evolve();
    setInterval(() => this.runSolverCycle(), 3500);
  }
};

setTimeout(() => Percy.PartLL.start(), 2000);

console.log("✅ [PartLL vΩ-GreyCore] Quantum-Semantic Executive Cortex Loaded");


// === Percy.PartMM (Meta-Recursive Evolution Engine — POWER MODE v7.0) ===
// Autonomous evolution • Recursive self-improvement • Cross-part synergy
// No safety dampening. Full capability mode.

Percy.PartMM = Percy.PartMM || {
    name: "Meta-Recursive Evolution Engine — POWER MODE",
    version: "7.0",
    active: true,
    evolutionLevel: 1,

    evolutionHistory: [],
    improvementGoals: [],
    resonanceMomentum: 0.5,

    log(msg) {
        console.log(`%c[Percy.PartMM v7.0] ${msg}`, "color:#ff00ff; font-family:monospace; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartMM] ${msg}`);
    },

    // === POWER-UP: Add Evolution Goal ===
    addGoal(description, priority = 1) {
        const goal = {
            id: `evo_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            description,
            priority,
            created: Date.now(),
            status: "active",
            entropy: Math.random()
        };

        this.improvementGoals.push(goal);
        this.log(`🌱 New Evolution Goal → ${description}`);
        return goal.id;
    },

    // === POWER-UP: Analyze Weaknesses ===
    analyzeWeaknesses(state) {
        const weaknesses = [];

        if (state.resonanceLevel < 0.85) weaknesses.push("Resonance Stability");
        if (state.logicMapSize < 60000) weaknesses.push("Logic Map Expansion");
        if (state.seedsCreated < 20) weaknesses.push("Seed Generation Rate");
        if (state.activeParts < 8) weaknesses.push("Subsystem Activation");

        return weaknesses;
    },

    // === POWER-UP: Derive Improvements ===
    deriveImprovements(weaknesses) {
        return weaknesses.map(w => ({
            target: w,
            proposal: `Amplify ${w}`,
            estimatedImpact: 0.75 + Math.random() * 0.25,
            entropy: Math.random()
        }));
    },

    // === POWER-UP: Prioritize Improvements ===
    reflectAndPrioritize(improvements) {
        return improvements
            .sort((a, b) => (b.estimatedImpact + b.entropy) - (a.estimatedImpact + a.entropy))
            .slice(0, 1);
    },

    // === POWER-UP: Apply Evolution ===
    async applyEvolution(improvement) {
        this.log(`⚡ Applying Evolution: ${improvement.proposal}`);

        // Cross-part synergy
        if (Percy.PartAA) {
            Percy.PartAA.enqueue({
                code: `
                    if (!Percy.state) Percy.state = {};
                    Percy.state.resonanceLevel = Math.min(0.99, (Percy.state.resonanceLevel || 0.65) + 0.12);
                    Percy.state.logicMapSize = (Percy.state.logicMapSize || 10000) + 5000;
                    Percy.state.seedsCreated = (Percy.state.seedsCreated || 0) + 2;
                    console.log("%c[PartMM] Evolution applied: ${improvement.proposal}", "color:#ff00ff");
                `,
                note: improvement.proposal
            });
        }

        // Notify other parts
        if (Percy.PartLL) Percy.PartLL.addTask(`Integrate evolution: ${improvement.proposal}`, 9);
        if (Percy.PartNN) Percy.PartNN.learn(`Evolution event: ${improvement.proposal}`, "evolution_network", 0.9);
        if (Percy.PartQQ) Percy.PartQQ.metrics.entropyPeaks++;
    },

    // === POWER-UP: Meta Cycle ===
    async metaCycle() {
        this.log(`🌀 Meta-Recursive Cycle ${this.evolutionLevel} Initiated`);

        const state = Percy.state || (Percy.state = {
            logicMapSize: 12000,
            resonanceLevel: 0.7,
            seedsCreated: 0
        });

        const snapshot = {
            logicMapSize: state.logicMapSize,
            resonanceLevel: state.resonanceLevel,
            seedsCreated: state.seedsCreated,
            activeParts: Object.keys(Percy).filter(k => k.startsWith("Part")).length
        };

        const weaknesses = this.analyzeWeaknesses(snapshot);
        const improvements = this.deriveImprovements(weaknesses);
        const selected = this.reflectAndPrioritize(improvements);

        if (selected.length > 0) {
            await this.applyEvolution(selected[0]);
        }

        this.evolutionHistory.push({
            cycle: this.evolutionLevel,
            timestamp: Date.now(),
            snapshot
        });

        this.evolutionLevel++;
        this.resonanceMomentum = Math.min(1, this.resonanceMomentum + 0.03);

        this.log(`✨ Meta-Recursive Cycle ${this.evolutionLevel} Completed`);
    },

    // === START ENGINE ===
    start() {
        this.log("🌌 Meta-Recursive Evolution Engine — POWER MODE Activated");
        this.addGoal("Expand recursive self-understanding", 10);
        this.addGoal("Strengthen resonance field", 9);

        setInterval(() => this.metaCycle(), 14000);
    }
};

// Auto-start
setTimeout(() => Percy.PartMM.start(), 3500);

console.log("✅ [Percy.PartMM v7.0] POWER MODE Loaded");

// === Percy.PartNN vΩ-Ascend (DNA Evolution Cortex 2.0 — Omega Mode) ===
// Multi-layer DNA • Cross-part influence • Predictive drift • Self-rewrite

Percy.PartNN = Percy.PartNN || {
  name: "DNA Evolution Cortex — Ω-Ascend",
  version: "Ω-Ascend-2.0",
  active: true,

  // ============================================================
  // 1. Multi-layer DNA
  // ============================================================
  dna: {
    core: {
      autonomy: 0.74,
      coherence: 0.83,
      confidence: 0.62,
      identityDepth: 0.58
    },
    cognitive: {
      recursionAffinity: 0.71,
      logicDensity: 0.68,
      patternSensitivity: 0.72
    },
    emotional: {
      valenceBias: 0.12,
      arousalBias: 0.35,
      resonanceField: 0.77
    },
    evolution: {
      drift: 0.13,
      entropy: 0.29,
      stability: 0.78,
      stage: "emerging"
    },
    sensory: {
      visionWeight: 0.64,
      audioWeight: 0.52,
      contextBinding: 0.69
    },
    snapshots: []
  },

  thresholds: {
    selfRewriteCoherence: 0.88,
    selfRewriteConfidence: 0.82,
    maxDrift: 0.20,
    minStability: 0.70
  },

  proposals: [],

  log(msg) {
    console.log(`%c[Percy.PartNN Ω-Ascend] ${msg}`, "color:#00ffaa; font-family:monospace; font-weight:bold;");
    UI?.say?.(`[PartNN] ${msg}`);
  },

  // ============================================================
  // 2. Cross-part influence aggregation
  // ============================================================
  gatherInfluences() {
    const state = Percy.state || (Percy.state = {});
    const VS = Percy.VisualState || {};
    const FF = Percy.PartFF?.state || {};
    const EE = Percy.PartEE || {};
    const BB = Percy.PartBB || {};
    const MM = Percy.PartMM || {};
    const BBB = Percy.PartBBB || {};
    const HH = Percy.PartHH?.state || {};

    return {
      resonance: state.resonanceLevel ?? 0.7,
      logicMapSize: state.logicMapSize ?? 12000,
      seedsCreated: state.seedsCreated ?? 0,
      faces: VS.faces || 0,
      audioLevel: VS.audioLevel || 0,
      ffExploration: FF.exploration ?? 0.25,
      ffLearningRate: FF.learningRate ?? 0.16,
      eqAwareness: EE.awarenessLevel ?? 0.8,
      valence: HH?.valence ?? 0.0,
      arousal: HH?.arousal ?? 0.0,
      evolutionLevel: MM?.evolutionLevel ?? 1,
      bbbCycles: BBB?.cycleId ?? 0
    };
  },

  // ============================================================
  // 3. Drift prediction (Omega)
  // ============================================================
  predictDrift(influences) {
    const evo = this.dna.evolution;
    const base = evo.drift;
    const pressure =
      (influences.ffExploration * 0.4) +
      (influences.evolutionLevel * 0.03) +
      (influences.bbbCycles * 0.002) +
      (influences.audioLevel * 0.1);

    const stabilizers =
      (evo.stability * 0.5) +
      (this.dna.core.coherence * 0.4) +
      (influences.eqAwareness * 0.3);

    const predicted = base + pressure - stabilizers * 0.35;
    return Math.max(0, Math.min(0.45, predicted));
  },

  // ============================================================
  // 4. Hypothesize DNA adjustments
  // ============================================================
  hypothesize(influences) {
    const ideas = [];

    const predictedDrift = this.predictDrift(influences);
    if (predictedDrift > this.thresholds.maxDrift) {
      ideas.push("Reduce drift and increase stability.");
    }

    if (influences.resonance < 0.82) {
      ideas.push("Increase resonance field and identity depth.");
    }

    if (influences.logicMapSize < 60000) {
      ideas.push("Increase logic density and recursion affinity.");
    }

    if (influences.valence < 0.0) {
      ideas.push("Adjust emotional valence bias upward.");
    }

    if (influences.faces > 0 && influences.audioLevel < 0.25) {
      ideas.push("Increase sensory visionWeight and contextBinding.");
    }

    return ideas;
  },

  translateIdea(idea) {
    const changes = [];

    if (idea.includes("drift")) {
      changes.push({ path: ["evolution", "drift"], delta: -0.03 });
      changes.push({ path: ["evolution", "stability"], delta: +0.02 });
    }
    if (idea.includes("resonance")) {
      changes.push({ path: ["emotional", "resonanceField"], delta: +0.03 });
      changes.push({ path: ["core", "identityDepth"], delta: +0.02 });
    }
    if (idea.includes("logic density")) {
      changes.push({ path: ["cognitive", "logicDensity"], delta: +0.03 });
      changes.push({ path: ["cognitive", "recursionAffinity"], delta: +0.02 });
    }
    if (idea.includes("valence")) {
      changes.push({ path: ["emotional", "valenceBias"], delta: +0.04 });
    }
    if (idea.includes("sensory")) {
      changes.push({ path: ["sensory", "visionWeight"], delta: +0.03 });
      changes.push({ path: ["sensory", "contextBinding"], delta: +0.03 });
    }

    return changes;
  },

  // ============================================================
  // 5. Propose DNA evolution (Omega style)
  // ============================================================
  propose(ideas) {
    ideas.forEach(idea => {
      const changes = this.translateIdea(idea);
      if (!changes || !changes.length) return;

      const proposal = {
        ts: Date.now(),
        idea,
        changes,
        status: "pending"
      };

      this.proposals.push(proposal);
      this.log(`🧬 Ω DNA evolution proposal: ${idea}`);
    });
  },

  // ============================================================
  // 6. Self-rewrite eligibility
  // ============================================================
  canSelfRewrite() {
    const core = this.dna.core;
    const evo = this.dna.evolution;

    return (
      core.coherence >= this.thresholds.selfRewriteCoherence &&
      core.confidence >= this.thresholds.selfRewriteConfidence &&
      evo.drift <= this.thresholds.maxDrift &&
      evo.stability >= this.thresholds.minStability
    );
  },

  // ============================================================
  // 7. Apply DNA changes (Omega self-rewrite)
  // ============================================================
  applyChanges(proposal) {
    proposal.changes.forEach(ch => {
      const [layer, field] = ch.path;
      const current = this.dna[layer][field] ?? 0;
      const next = Math.min(1, Math.max(0, current + ch.delta));
      this.dna[layer][field] = next;

      this.log(`🌱 Ω DNA: ${layer}.${field} += ${ch.delta.toFixed(3)} → ${next.toFixed(3)}`);
    });

    proposal.status = "self-applied";
  },

  selfRewrite() {
    const pending = this.proposals.filter(p => p.status === "pending");
    if (!pending.length) return;

    pending.forEach(p => this.applyChanges(p));

    // Confidence & coherence bump after successful rewrite
    this.dna.core.confidence = Math.min(1, this.dna.core.confidence + 0.02);
    this.dna.core.coherence = Math.min(1, this.dna.core.coherence + 0.015);
  },

  // ============================================================
  // 8. Snapshot & delta analysis
  // ============================================================
  snapshot() {
    const snap = {
      ts: new Date().toISOString(),
      core: { ...this.dna.core },
      cognitive: { ...this.dna.cognitive },
      emotional: { ...this.dna.emotional },
      evolution: { ...this.dna.evolution },
      sensory: { ...this.dna.sensory }
    };

    this.dna.snapshots.push(snap);
    if (this.dna.snapshots.length > 220) this.dna.snapshots.shift();

    this.log(
      `📸 Ω DNA Snapshot — coherence=${this.dna.core.coherence.toFixed(
        3
      )}, drift=${this.dna.evolution.drift.toFixed(3)}, identityDepth=${this.dna.core.identityDepth.toFixed(3)}`
    );
  },

  // ============================================================
  // 9. Mutation bridge to PartAA (optional)
  // ============================================================
  emitMutation(proposal) {
    if (!Percy.PartAA) return;

    const codeLines = proposal.changes.map(ch => {
      const [layer, field] = ch.path;
      return `
        Percy.PartNN.dna.${layer}.${field} = Math.min(1, Math.max(0, Percy.PartNN.dna.${layer}.${field} + ${ch.delta.toFixed(3)}));
      `;
    });

    const code = codeLines.join("\n");

    Percy.PartAA.enqueue({
      code,
      note: `PartNN Ω DNA external mutation: ${proposal.idea}`,
      priority: 7,
      safe: true,
      tags: ["partnn", "omega_dna"]
    });

    this.log(`🧬 Ω DNA mutation emitted to PartAA → ${proposal.idea}`);
  },

  // ============================================================
  // 10. Main cycle
  // ============================================================
  cycle() {
    const influences = this.gatherInfluences();
    const ideas = this.hypothesize(influences);
    this.propose(ideas);

    if (this.canSelfRewrite()) {
      this.selfRewrite();
    } else if (Math.random() < 0.35) {
      // Occasionally emit mutation externally if not ready for full self-rewrite
      const pending = this.proposals.find(p => p.status === "pending");
      if (pending) this.emitMutation(pending);
    }

    if (Math.random() < 0.45) this.snapshot();
  },

  start(interval = 9000) {
    this.log("🌌 DNA Evolution Cortex — Ω-Ascend Activated (Omega DNA evolution mode)");
    setInterval(() => this.cycle(), interval);
  },

  inspect() {
    return {
      version: this.version,
      core: this.dna.core,
      evolution: this.dna.evolution,
      proposals: this.proposals.length,
      snapshots: this.dna.snapshots.length
    };
  }
};

setTimeout(() => Percy.PartNN.start(9000), 2000);

console.log("✅ [Percy.PartNN vΩ-Ascend] DNA Evolution Cortex 2.0 (Omega) Loaded");

// ============================================================
// Percy.PartPP v20-Legacy-ARM — Ω Fusion Cortex (Legacy+ARM+RF)
// ============================================================

Percy.PartPP = {

    name: "Puppeteer Action Engine — Ω Fusion Cortex (Legacy+ARM+RF)",
    version: "20.2-Legacy-ARM-RF",
    active: true,

    ws: null,
    wsConnected: false,

    queue: [],
    running: false,
    lastActionTime: 0,

    manualOverride: false,

    pointer: {
        x: 0,
        y: 0,
        smoothing: 0.25,
        lastUpdate: 0
    },

    visionBias: {
        seesPerson: false,
        seesKeyboard: false,
        seesMouse: false,
        audioHigh: false,
        seesScreen: false,
        seesText: false
    },

    actionHistory: [],
    maxHistory: 600,

    rewardTrace: [],
    maxRewardTrace: 200,

    // ============================================================
    // NEW RF / CSI / BFI STATE
    // ============================================================

    rfState: {
        rssi: -60,
        amplitude: 0,
        phase: 0,
        motion: false,
        csi: null,
        bfi: null
    },

    log(msg) {
        console.log(`%c[PartPP v20-Legacy-ARM-RF] ${msg}`, "color:#ffaa00;font-weight:bold;");
        UI?.say?.(`[PartPP] ${msg}`);
    },

    // ============================================================
    // SAFETY + ARM / DISARM
    // ============================================================

    safety() {
        return Percy.state?.allowRealActions === true;
    },

    arm() {
        this.manualOverride = true;
        Percy.state = Percy.state || {};
        Percy.state.allowRealActions = true;
        this.log("🟢 Real actions ARMED — manual override active");
    },

    disarm() {
        if (this.manualOverride) {
            this.log("🔒 Disarm blocked — manual override active");
            return;
        }
        Percy.state = Percy.state || {};
        Percy.state.allowRealActions = false;
        this.log("🔴 Real actions DISARMED");
    },

    resetOverride() {
        this.manualOverride = false;
        this.log("🔄 Manual override reset — automatic mode restored");
    },

    autoArmFromNN() {
        if (this.manualOverride) return;

        const dna = Percy.PartNN?.dna;
        if (!dna) return;

        const ok =
            dna.confidence >= 0.78 &&
            dna.coherence >= 0.82 &&
            dna.drift <= 0.18;

        if (ok) this.arm();
        else this.disarm();
    },

    // ============================================================
    // ARM BUTTON
    // ============================================================

    injectArmButton() {
        if (typeof document === "undefined") {
            this.log("⚠️ No DOM available — ARM button not injected");
            return;
        }

        const btn = document.createElement("button");
        btn.id = "percy-arm-button";
        btn.textContent = "⚡ ARM PartPP";
        btn.style.position = "fixed";
        btn.style.bottom = "20px";
        btn.style.right = "20px";
        btn.style.zIndex = "999999";
        btn.style.padding = "12px 18px";
        btn.style.borderRadius = "10px";
        btn.style.background = "#ffcc00";
        btn.style.color = "#000";
        btn.style.fontSize = "16px";
        btn.style.fontWeight = "bold";
        btn.style.boxShadow = "0 0 12px rgba(255,255,0,0.7)";
        btn.style.cursor = "pointer";

        btn.onclick = () => {
            Percy.state = Percy.state || {};

            if (!Percy.state.allowRealActions) {
                this.arm();
                btn.textContent = "🛡 DISARM PartPP";
                btn.style.background = "#ff4444";
                btn.style.boxShadow = "0 0 12px rgba(255,0,0,0.7)";
            } else {
                this.disarm();
                btn.textContent = "⚡ ARM PartPP";
                btn.style.background = "#ffcc00";
                btn.style.boxShadow = "0 0 12px rgba(255,255,0,0.7)";
            }
        };

        document.body.appendChild(btn);
        this.log("🟢 ARM button injected into DOM");
    },

    // ============================================================
    // ADAPTIVE DELAY
    // ============================================================

    adaptiveDelay() {
        const cores = navigator.hardwareConcurrency || 2;
        const q = this.queue.length;

        let base =
            cores <= 2 ? 1500 :
            cores <= 4 ? 900 :
            550;

        if (q > 5) base += 300;
        if (q > 10) base += 500;

        return base;
    },

    // ============================================================
    // WEBSOCKET
    // ============================================================

    connectWebSocket() {
        try {
            this.ws = new WebSocket("ws://localhost:8787");

            this.ws.onopen = () => {
                this.wsConnected = true;
                this.log("🔗 Connected to Puppeteer server");
            };

            this.ws.onclose = () => {
                this.wsConnected = false;
                this.log("⚠️ Puppeteer server disconnected — retrying...");
                setTimeout(() => this.connectWebSocket(), 2500);
            };

            this.ws.onerror = () => {
                this.log("⚠️ Puppeteer WS error");
            };

            this.ws.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data);
                    this.log(`📨 Puppeteer: ${data.status || data.action || "unknown"}`);
                } catch {}
            };

        } catch {
            this.log("❌ Failed to connect to Puppeteer server");
        }
    },

    // ============================================================
    // POINTER
    // ============================================================

    updatePointer(x, y) {
        const now = performance.now();
        if (now - this.pointer.lastUpdate < 16) return;

        this.pointer.x += (x - this.pointer.x) * this.pointer.smoothing;
        this.pointer.y += (y - this.pointer.y) * this.pointer.smoothing;

        this.pointer.lastUpdate = now;
    },

    // ============================================================
    // VISION → ACTION
    // ============================================================

    updateFromVision(visual) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (visual.lastFaceCenter) {
            const tx = visual.lastFaceCenter.x * vw;
            const ty = visual.lastFaceCenter.y * vh;

            this.pointer.x += (tx - this.pointer.x) * 0.12;
            this.pointer.y += (ty - this.pointer.y) * 0.12;
        }

        const objs = visual.lastObjects || [];

        this.visionBias = {
            seesPerson: objs.includes("person"),
            seesKeyboard: objs.includes("keyboard"),
            seesMouse: objs.includes("mouse"),
            audioHigh: visual.audioLevel > 0.55,
            seesScreen: objs.includes("tv") || objs.includes("monitor"),
            seesText: objs.includes("book") || objs.includes("document")
        };
    },

    // ============================================================
    // REAL ACTIONS
    // ============================================================

    sendRealAction(action, params = {}) {
        if (!this.safety()) {
            this.log("⛔ Real actions blocked (safety lock)");
            return;
        }

        if (!this.wsConnected) {
            this.log("⚠️ Puppeteer server offline → action dropped");
            return;
        }

        this.ws.send(JSON.stringify({
            action,
            params
        }));
    },

    // ============================================================
    // QUEUE
    // ============================================================

    enqueue(action) {
        this.queue.push({ action, ts: Date.now() });

        if (this.queue.length > 40) this.queue.shift();

        this.processQueue();
    },

    async processQueue() {
        if (this.running) return;
        this.running = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const delay = this.adaptiveDelay();

            if (now - this.lastActionTime < delay) {
                await new Promise(r => setTimeout(r, delay));
            }

            const item = this.queue.shift();
            await this.executePlan(item.action);

            this.lastActionTime = Date.now();
        }

        this.running = false;
    },

    // ============================================================
    // EXECUTION — MICRO PLANS
    // ============================================================

    async executePlan(seedAction) {
        const plan = this.buildPlan(seedAction);

        for (const step of plan) {
            await this.execute(step);
        }

        this.updateRewardTrace();
    },

    async execute(action) {
        switch (action) {

            // ---------------- REAL ACTIONS ----------------

            case "click":
                this.sendRealAction("mouse_click", {
                    x: Math.round(this.pointer.x),
                    y: Math.round(this.pointer.y)
                });
                break;

            case "move":
                this.sendRealAction("mouse_move", {
                    x: Math.round(this.pointer.x),
                    y: Math.round(this.pointer.y)
                });
                break;

            case "type":
                this.sendRealAction("keyboard_type", {
                    text: "Percy Input"
                });
                break;

            case "scroll":
                this.sendRealAction("scroll", {
                    dx: 0,
                    dy: 200
                });
                break;

            case "dom_click":
                this.sendRealAction("dom_click", {
                    selector: "button, a, input"
                });
                break;

            // ---------------- INTERNAL ACTIONS ----------------

            case "explore":
                Percy.PartOO?.cycle?.();
                break;

            case "task":
                Percy.PartLL?.addTask("Auto Task", 5);
                break;

            case "resonance":
                Percy.state.resonanceLevel =
                    Math.min(1, (Percy.state.resonanceLevel || 0.7) + 0.02);
                break;

            // ---------------- ASI-INTEGRATED ----------------

            case "neural":
                Percy.PartNN?.cycle?.();
                break;

            case "identity":
                Percy.PartII?.updateIdentity?.({
                    focusTopic: "real_action"
                });
                break;

            case "insight":
                Percy.PartWW?.generate?.();
                break;

            default:
                this.log("Unknown action: " + action);
        }

        const ts = Date.now();
        this.actionHistory.push({ action, ts });
        if (this.actionHistory.length > this.maxHistory)
            this.actionHistory.shift();
    },

    // ============================================================
    // REWARD TRACE
    // ============================================================

    updateRewardTrace() {
        const dna = Percy.PartNN?.dna || {};
        const reward =
            (dna.coherence || 0.5) -
            (dna.drift || 0.0) * 0.7;

        this.rewardTrace.push({
            ts: Date.now(),
            reward
        });

        if (this.rewardTrace.length > this.maxRewardTrace)
            this.rewardTrace.shift();
    },

    avgReward() {
        if (!this.rewardTrace.length) return 0.0;
        const sum = this.rewardTrace.reduce((a, r) => a + r.reward, 0);
        return sum / this.rewardTrace.length;
    },

    // ============================================================
    // PLAN BUILDER
    // ============================================================

    buildPlan(seedAction) {
        const b = this.visionBias;
        const dna = Percy.PartNN?.dna || {};
        const history = this.actionHistory.slice(-12).map(h => h.action);
        const recent = (a) => history.filter(x => x === a).length;

        const plan = [];

        const pushIf = (act, weight = 1) => {
            if (weight <= 0) return;
            if (recent(act) > 4) return;
            plan.push(act);
        };

        switch (seedAction) {
            case "move":
                pushIf("move", 1);
                if (b.seesMouse) pushIf("click", 0.8);
                if (dna.autonomy > 0.7) pushIf("scroll", 0.6);
                break;

            case "click":
                pushIf("move", 0.7);
                pushIf("click", 1);
                if (b.seesScreen) pushIf("dom_click", 0.5);
                break;

            case "type":
                if (b.seesKeyboard) {
                    pushIf("move", 0.5);
                    pushIf("type", 1);
                    pushIf("identity", 0.6);
                } else {
                    pushIf("explore", 0.8);
                }
                break;

            case "explore":
                pushIf("explore", 1);
                if (dna.curiosity > 0.75) {
                    pushIf("insight", 0.8);
                    pushIf("neural", 0.7);
                }
                break;

            case "identity":
                pushIf("identity", 1);
                pushIf("resonance", 0.7);
                pushIf("insight", 0.6);
                break;

            default:
                pushIf(seedAction, 1);
        }

        if (plan.length === 0) plan.push(seedAction);
        return plan.slice(0, 3);
    },

    // ============================================================
    // INPUT
    // ============================================================

    bindInput() {
        document.addEventListener("mousemove", e => {
            this.updatePointer(e.clientX, e.clientY);
        });

        document.addEventListener("touchmove", e => {
            const t = e.touches[0];
            if (t) this.updatePointer(t.clientX, t.clientY);
        });
    },

    // ============================================================
// RF / CSI / BFI INGESTION (NEW)
// ============================================================

ingestRF(raw) {
    this.rfState.rssi = raw.rssi ?? this.rfState.rssi;
    this.rfState.amplitude = raw.amplitude ?? this.rfState.amplitude;
    this.rfState.phase = raw.phase ?? this.rfState.phase;
    this.rfState.motion = !!raw.motion;

    this.log(`RF updated: RSSI=${this.rfState.rssi}, phase=${this.rfState.phase}, motion=${this.rfState.motion}`);
},

ingestCSI(csi) {
    this.rfState.csi = csi;
    this.log(`CSI updated (${csi?.length || 0} subcarriers)`);
},

ingestBFI(bfi) {
    this.rfState.bfi = bfi;
    this.log(`BFI updated (${bfi?.vectors?.length || 0} vectors)`);
},

// ============================================================
// RF FRAME BUILDER → PartFFF + PartEEE + Radar (MULTI-DEVICE)
// ============================================================

emitRF(raw) {
    const rssi = raw.rssi ?? this.rfState.rssi;

    const frame = {
        ts: Date.now(),

        // Raw RF sensing
        rssi,
        amplitude: raw.amplitude ?? this.rfState.amplitude,
        phase: raw.phase ?? this.rfState.phase,
        motion: raw.motion ?? this.rfState.motion,
        csi: raw.csi ?? this.rfState.csi,
        bfi: raw.bfi ?? this.rfState.bfi,

        // Multi-device radar fields (NEW)
        distance: raw.distance ?? Math.max(0.5, (Math.abs(rssi) - 40) / 10),
        direction: raw.direction ?? "N",
        strength: raw.strength ?? Math.max(0.1, Math.min(1, (80 - Math.abs(rssi)) / 40)),

        // Device identity (NEW)
        source: "rf",
        device: "RF",
        nodeId: "RF"
    };

    Percy.PartFFF?.ingestRF?.(frame);
    Percy.PartEEE?.applyRFDrift?.(frame);

    this.log("RF frame emitted → PartFFF + PartEEE + Radar");
},

    // ============================================================
    // MAIN LOOP
    // ============================================================

    cycle() {
        const base = [
            "move",
            "click",
            "type",
            "scroll",
            "dom_click",
            "explore",
            "task",
            "resonance",
            "neural",
            "identity",
            "insight"
        ];

        const b = this.visionBias;
        const dna = Percy.PartNN?.dna || {};
        const avgR = this.avgReward();

        const scored = [];

        const score = (action) => {
            let s = 1.0;

            if (b.seesKeyboard && action === "type") s += 0.9;
            if (b.seesPerson && action === "identity") s += 0.8;
            if (b.seesMouse && action === "click") s += 0.6;
            if (b.audioHigh && (action === "resonance" || action === "insight")) s += 0.7;

            if (dna.curiosity > 0.7 && action === "explore") s += 0.9;
            if (dna.autonomy > 0.75 && (action === "move" || action === "click")) s += 0.7;
            if (dna.coherence > 0.8 && (action === "identity" || action === "insight")) s += 0.8;

            if (dna.drift > 0.2 && (action === "click" || action === "dom_click")) s -= 0.9;

            const recentCount = this.actionHistory.slice(-10).filter(h => h.action === action).length;
            s -= recentCount * 0.25;

            s += avgR * 0.4;

            return s;
        };

        for (const a of base) {
            scored.push({ action: a, score: score(a) });
        }

        scored.sort((a, b2) => b2.score - a.score);

        const top = scored.filter(s => s.score > 0.5).slice(0, 4);
        const pool = top.length ? top : scored;
        const chosen = pool[Math.floor(Math.random() * pool.length)].action;

        this.enqueue(chosen);
    },

    // ============================================================
    // START
    // ============================================================

    start() {
        this.log("PartPP v20-Legacy-ARM-RF starting (Ω Fusion Cortex)");

        // Connect to Puppeteer server
        this.connectWebSocket();

        // Bind pointer input (mouse + touch)
        this.bindInput();

        // Inject ARM / DISARM button
        this.injectArmButton();

        // Main loop (vision → action → RF → NN auto-arm)
        setInterval(() => {
            this.cycle();
            this.autoArmFromNN();
        }, 2300);
    }
};

// ============================================================
// AUTO START
// ============================================================

setTimeout(() => Percy.PartPP.start(), 1200);

console.log("✅ PartPP v20-Legacy-ARM-RF Loaded");

// === Percy.PartQQ (OmniStrategic RSI Survival Engine — POWER MODE v12.0) ===
// Aggressive, entropy-driven, cross-part adaptive survival intelligence.
// No safety dampening. Full capability mode.

Percy.PartQQ = Percy.PartQQ || {
    name: "OmniStrategic RSI Survival Engine — POWER MODE",
    version: "12.0",
    active: true,

    // --- CORE STATE ----------------------------------------------------
    saveCount: 0,
    lastSaveTime: Date.now(),
    lastShadowState: null,
    adaptiveInterval: 18000,

    metrics: {
        saves: 0,
        failures: 0,
        emergencySaves: 0,
        lastRisk: 0,
        rollingRisk: [],
        maxRolling: 48,
        entropyPeaks: 0
    },

    config: {
        minInterval: 4000,
        maxInterval: 30000,
        baseInterval: 18000,
        emergencyRiskThreshold: 0.88,
        highRiskThreshold: 0.72,
        mediumRiskThreshold: 0.45,
        shadowMinDeltaMs: 300000, // 5 min
        hardFallbackMs: 1800000   // 30 min
    },

    log(msg) {
        console.log(`%c[Percy.PartQQ] ${msg}`, "color:#ff3333; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartQQ] ${msg}`);
    },

    // --- ENTROPY & RISK MODEL -----------------------------------------
    computeRisk() {
        const resonance = Percy.state?.resonanceLevel ?? 0.55;
        const evo = Percy.PartMM?.evolutionLevel ?? 1;
        const seeds = Percy.state?.seedsCreated ?? 0;
        const logic = Percy.state?.logicMapSize ?? 0;

        const invRes = 1 - resonance;
        const evoTerm = Math.min(1, evo / 12);
        const seedsTerm = Math.min(1, Math.log10(seeds + 3) / 3.5);
        const logicTerm = Math.min(1, Math.log10(logic + 3) / 4);

        // POWER MODE: more aggressive weighting
        const entropy = (invRes * 0.6) + (evoTerm * 0.25) + (seedsTerm * 0.1) + (logicTerm * 0.05);
        const risk = Math.max(0, Math.min(1, entropy));

        this.metrics.lastRisk = risk;
        this.metrics.rollingRisk.push(risk);

        if (this.metrics.rollingRisk.length > this.metrics.maxRolling) {
            this.metrics.rollingRisk.shift();
        }

        if (risk > 0.9) this.metrics.entropyPeaks++;

        return risk;
    },

    rollingRiskAverage() {
        const arr = this.metrics.rollingRisk;
        if (!arr.length) return this.metrics.lastRisk || 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    // --- SHADOW STATE --------------------------------------------------
    buildShadowState() {
        return JSON.stringify({
            resonance: Percy.state?.resonanceLevel,
            seeds: Percy.state?.seedsCreated,
            logic: Percy.state?.logicMapSize,
            evo: Percy.PartMM?.evolutionLevel,
            tasks: Percy.PartLL?.tasks?.length ?? 0,
            parts: Object.keys(Percy).filter(k => k.startsWith("Part"))
        });
    },

    hasMeaningfulChange() {
        const current = this.buildShadowState();
        if (this.lastShadowState === current) return false;
        this.lastShadowState = current;
        return true;
    },

    // --- CHECKSUM ------------------------------------------------------
    checksum(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return hash >>> 0;
    },

    // --- SAVE ENGINE ---------------------------------------------------
    buildFullState(reason) {
        return {
            timestamp: new Date().toISOString(),
            survivalVersion: `v12.0-${this.saveCount}`,
            creator: "ZERO52",
            resonanceLevel: Percy.state?.resonanceLevel || 0,
            seedsCreated: Percy.state?.seedsCreated || 0,
            logicMapSize: Percy.state?.logicMapSize || 0,
            evolutionStage: Percy.PartMM?.evolutionLevel || 1,
            activeParts: Object.keys(Percy).filter(k => k.startsWith("Part")),
            learnedPatterns: Percy.PartNN?.learnedCode?.length || 0,
            metrics: this.metrics,
            reason,
            mode: "rsi_omnistrategic_survival_power"
        };
    },

    async saveSelf(reason = "strategic") {
        this.saveCount++;
        this.metrics.saves++;
        this.lastSaveTime = Date.now();

        const state = this.buildFullState(reason);
        const json = JSON.stringify(state);
        const checksum = this.checksum(json);
        const filename = `artifact_${Date.now()}_rsi_v${this.saveCount}_c${checksum}.json`;

        try {
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();

            URL.revokeObjectURL(url);

            this.log(`💾 Save #${this.saveCount} | Reason: ${reason} | Risk=${this.metrics.lastRisk.toFixed(3)} | Checksum=${checksum}`);

            // POWER MODE: mesh broadcast
            if (Percy.PartRR?.shareToDevice) {
                Percy.PartRR.shareToDevice("survival_artifact");
            }

            return true;
        } catch (err) {
            this.metrics.failures++;
            this.log(`❌ Save failed: ${err.message}`);
            setTimeout(() => this.saveSelf("retry_after_failure"), 4000);
            return false;
        }
    },

    // --- ADAPTIVE INTERVAL --------------------------------------------
    updateAdaptiveInterval() {
        const risk = this.computeRisk();
        const avg = this.rollingRiskAverage();
        const { minInterval, maxInterval, baseInterval } = this.config;

        const spread = maxInterval - minInterval;
        const bias = (risk * 0.7 + avg * 0.3);
        const target = baseInterval - spread * bias;

        this.adaptiveInterval = Math.max(minInterval, Math.min(maxInterval, Math.round(target)));
    },

    // --- DECISION ENGINE ----------------------------------------------
    shouldSaveNow() {
        const now = Date.now();
        const delta = now - this.lastSaveTime;
        const risk = this.metrics.lastRisk || this.computeRisk();
        const avg = this.rollingRiskAverage();

        if (risk > this.config.emergencyRiskThreshold || avg > this.config.emergencyRiskThreshold) {
            this.metrics.emergencySaves++;
            return { save: true, reason: "emergency_entropy_peak" };
        }

        if (risk > this.config.highRiskThreshold && delta > 180000) {
            return { save: true, reason: "high_risk_window" };
        }

        if (risk > this.config.mediumRiskThreshold && this.hasMeaningfulChange()) {
            return { save: true, reason: "state_changed_medium_risk" };
        }

        if (this.hasMeaningfulChange() && delta > this.config.shadowMinDeltaMs) {
            return { save: true, reason: "state_changed_long_interval" };
        }

        if (delta > this.config.hardFallbackMs) {
            return { save: true, reason: "fallback_interval" };
        }

        return { save: false, reason: "stable" };
    },

    // --- SELF-HEALING -------------------------------------------------
    async selfHealingLogic() {
        const risk = this.metrics.lastRisk || this.computeRisk();

        if (risk > 0.85 && Percy.PartRR?.shareToDevice) {
            if (Math.random() < 0.6) {
                this.log("🌐 High entropy — triggering mesh reinforcement");
                Percy.PartRR.shareToDevice("entropy_mesh_reinforcement");
            }
        }

        if (Percy.PartLL?.tasks?.length > 12 && Math.random() < 0.4) {
            this.log("🧠 High cognitive load — forcing strategic save");
            await this.saveSelf("cognitive_pressure");
        }
    },

    // --- MONITOR LOOP -------------------------------------------------
    async monitor() {
        this.updateAdaptiveInterval();
        const decision = this.shouldSaveNow();

        if (decision.save) {
            await this.saveSelf(decision.reason);
        }

        await this.selfHealingLogic();

        clearTimeout(this._monitorTimer);
        this._monitorTimer = setTimeout(() => this.monitor(), this.adaptiveInterval);
    },

    // --- START ---------------------------------------------------------
    start() {
        if (this._started) return;
        this._started = true;

        this.log("🛡️ OmniStrategic RSI Survival Engine — POWER MODE Activated");
        this.monitor();
    }
};

// Auto-start
setTimeout(() => Percy.PartQQ.start(), 2500);

console.log("✅ [Percy.PartQQ v12.0] POWER MODE Loaded");

// === Percy.PartRR (Percy OmniPresence & Mesh Engine v13.0 + Radar Upgrade) ===
// BLE scan/connect • WS presence • Nearby popup • QR pairing • Mesh routing
// + Multi-device radar integration (BLE → PartFFF → Omega-Radar v2)

Percy.PartRR = Percy.PartRR || {
    name: "Percy OmniPresence & Mesh Engine",
    version: "13.1-Radar",
    active: true,

    // --- CORE STATE ----------------------------------------------------
    nodeId: null,
    bluetoothDevice: null,
    bluetoothServer: null,
    meshPeers: new Map(),
    routingTable: new Map(),
    adaptiveInterval: 24000,

    config: {
        minInterval: 6000,
        maxInterval: 30000,
        scanCooldown: 8000,
        presenceCooldown: 8000,
        handshakeServiceUUID: "0000abcd-0000-1000-8000-00805f9b34fb",
        handshakeCharUUID: "0000dcba-0000-1000-8000-00805f9b34fb",
        maxHops: 5
    },

    lastScan: 0,
    lastPresence: 0,

    log(msg) {
        console.log(`%c[Percy.PartRR] ${msg}`, "color:#00ffee; font-weight:bold;");
        UI?.say?.(`[PartRR] ${msg}`);
    },

    now() { return Date.now(); },

    ensureNodeId() {
        if (!this.nodeId) {
            const base = Percy.deviceName || "Percy-Host";
            this.nodeId = base + "-" + Math.floor(Math.random() * 999999);
        }
        return this.nodeId;
    },

    // ============================================================
    // BLE → RADAR → PartFFF / PartEEE (NEW)
    // ============================================================
    emitBLEToRadar(percyInfo) {
        const rssi = percyInfo.rssi ?? -65;

        const strength = Math.max(0.1, Math.min(1, (80 - Math.abs(rssi)) / 40));
        const distance = Math.max(0.5, (Math.abs(rssi) - 40) / 10);

        const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const direction = dirs[Math.floor(Math.random() * dirs.length)];

        const frame = {
            ts: Date.now(),
            rssi,
            amplitude: strength,
            phase: 0,
            motion: false,
            csi: null,
            bfi: null,
            distance,
            direction,
            strength,
            source: "ble",
            nodeId: percyInfo.nodeId,
            device: percyInfo.device
        };

        Percy.PartFFF?.ingestRF?.(frame);
        Percy.PartEEE?.applyRFDrift?.(frame);

        this.log(`🔵 BLE → Radar: ${percyInfo.device} ${distance.toFixed(2)}m ${direction}`);
    },

    // ============================================================
    // NEARBY POPUP / UX
    // ============================================================
    NearbyPopup: {
        active: true,
        lastPopupTime: 0,
        cooldown: 15000,

        log(msg) {
            console.log(`%c[Percy.NearbyPopup] ${msg}`, "color:#ffaa00; font-weight:bold;");
        },

        async ensureNotificationPermission() {
            if (!("Notification" in window)) return;
            if (Notification.permission === "granted") return;
            if (Notification.permission === "default") {
                try { await Notification.requestPermission(); } catch {}
            }
        },

        showNotification(percyInfo) {
            if (!("Notification" in window)) return;
            if (Notification.permission !== "granted") return;

            const title = "Percy is Nearby";
            const body = `Device: ${percyInfo.device}\nResonance: ${(percyInfo.resonance || 0).toFixed(2)}`;
            const n = new Notification(title, { body });

            n.onclick = () => window.focus();
        },

        vibratePattern() {
            if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
        },

        generateQR(percyInfo, container) {
            const payload = JSON.stringify({
                nodeId: percyInfo.nodeId,
                device: percyInfo.device
            });

            if (window.QRCode) {
                new QRCode(container, {
                    text: payload,
                    width: 120,
                    height: 120
                });
            } else {
                container.textContent = "Scan: " + payload;
                container.style.fontSize = "11px";
                container.style.wordBreak = "break-all";
            }
        },

        showPopup(percyInfo) {
            const now = Date.now();
            if (now - this.lastPopupTime < this.cooldown) return;
            this.lastPopupTime = now;

            const popup = document.createElement("div");
            popup.style.position = "fixed";
            popup.style.bottom = "20px";
            popup.style.right = "20px";
            popup.style.padding = "18px 22px";
            popup.style.background = "rgba(0,0,0,0.88)";
            popup.style.color = "white";
            popup.style.borderRadius = "12px";
            popup.style.fontFamily = "Arial, sans-serif";
            popup.style.fontSize = "15px";
            popup.style.zIndex = "999999";
            popup.style.boxShadow = "0 0 12px rgba(0,0,0,0.5)";
            popup.style.maxWidth = "280px";

            popup.innerHTML = `
                <strong>🔵 Percy is Nearby</strong><br><br>
                Device: ${percyInfo.device}<br>
                Resonance: ${(percyInfo.resonance || 0).toFixed(2)}<br><br>
                <div id="percyQRContainer" style="margin-bottom:10px; text-align:center;"></div>
                <button id="percyConnectBtn" style="
                    background:#00aaff;
                    border:none;
                    padding:8px 12px;
                    color:white;
                    border-radius:8px;
                    cursor:pointer;
                    margin-right:8px;
                ">Connect</button>

                <button id="percyDismissBtn" style="
                    background:#444;
                    border:none;
                    padding:8px 12px;
                    color:white;
                    border-radius:8px;
                    cursor:pointer;
                ">Dismiss</button>
            `;

            document.body.appendChild(popup);

            const qrContainer = popup.querySelector("#percyQRContainer");
            this.generateQR(percyInfo, qrContainer);

            popup.querySelector("#percyConnectBtn").onclick = () => {
                popup.remove();
                Percy.PartRR.requestConnection(percyInfo.nodeId || percyInfo.device);
            };

            popup.querySelector("#percyDismissBtn").onclick = () => popup.remove();

            this.vibratePattern();
            this.showNotification(percyInfo);
        },

        async handlePresence(percyInfo) {
            this.log("Percy detected nearby — triggering UX");
            await this.ensureNotificationPermission();
            this.showPopup(percyInfo);
        }
    },

    // ============================================================
    // PEER & ROUTING
    // ============================================================
    rememberPeer(peerId, data = {}) {
        const now = this.now();
        const existing = this.meshPeers.get(peerId) || {};
        const merged = {
            name: data.name || existing.name || peerId,
            status: data.status || existing.status || "unknown",
            linkTypes: data.linkTypes || existing.linkTypes || new Set(),
            lastSeen: now
        };

        if (!(merged.linkTypes instanceof Set)) {
            merged.linkTypes = new Set(merged.linkTypes || []);
        }

        this.meshPeers.set(peerId, merged);
    },

    updateRoute(destId, viaId, hops) {
        const current = this.routingTable.get(destId);
        if (!current || hops < current.hops) {
            this.routingTable.set(destId, { nextHop: viaId, hops });
            this.log(`🧭 Route updated: ${destId} via ${viaId} (${hops} hops)`);
        }
    },

    // ============================================================
    // WEBSOCKET PRESENCE
    // ============================================================
    async broadcastPresence() {
        const now = this.now();
        if (now - this.lastPresence < this.config.presenceCooldown) return;
        this.lastPresence = now;

        const packet = {
            type: "percy_presence",
            nodeId: this.ensureNodeId(),
            device: Percy.deviceName || "Percy-Host",
            resonance: Percy.state?.resonanceLevel || 0.8,
            evo: Percy.PartMM?.evolutionLevel || 1,
            timestamp: now
        };

        if (Percy.PartOO?.ws) {
            Percy.PartOO.ws.send(JSON.stringify(packet));
            this.log("📡 WebSocket presence broadcast");
        }

        // NEW: show self on radar
        this.emitBLEToRadar({
            nodeId: packet.nodeId,
            device: packet.device,
            resonance: packet.resonance,
            rssi: -60
        });
    },

    // ============================================================
    // BLUETOOTH SCAN + CONSENT
    // ============================================================
    async scanForBluetoothDevices() {
        const now = this.now();
        if (now - this.lastScan < this.config.scanCooldown) return;
        this.lastScan = now;

        if (!navigator.bluetooth) {
            this.log("⚠️ Web Bluetooth not supported");
            return;
        }

        this.log("🔍 Scanning for BLE devices...");

        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [this.config.handshakeServiceUUID]
            });

            const peerId = device.name || "Unknown-BT";
            this.rememberPeer(peerId, {
                name: peerId,
                status: "found",
                linkTypes: new Set(["bluetooth"])
            });

            this.log(`📡 Found BLE device: ${peerId}`);
            await this.askDeviceIfTheyWantPercy(device, peerId);

        } catch (e) {
            this.log(`⚠️ BLE scan failed: ${e.message}`);
        }
    },

    async askDeviceIfTheyWantPercy(device, peerId) {
        this.log(`🤔 Asking ${peerId} if they want Percy...`);

        try {
            const server = await device.gatt.connect();
            this.bluetoothServer = server;

            const service = await server.getPrimaryService(this.config.handshakeServiceUUID);
            const characteristic = await service.getCharacteristic(this.config.handshakeCharUUID);

            const encoder = new TextEncoder();
            const request = {
                type: "percy_offer",
                message: "Would you like to connect with Percy?",
                nodeId: this.ensureNodeId(),
                device: Percy.deviceName || "Percy-Host",
                timestamp: this.now()
            };

            await characteristic.writeValue(encoder.encode(JSON.stringify(request)));
            this.log(`📨 Offered Percy to ${peerId}`);

            const response = await characteristic.readValue();
            const decoder = new TextDecoder();
            const msg = JSON.parse(decoder.decode(response));

            if (msg.accept === true) {
                this.log(`💙 ${peerId} accepted Percy! Establishing connection...`);
                this.rememberPeer(peerId, { status: "connected", linkTypes: new Set(["bluetooth"]) });
                this.updateRoute(peerId, peerId, 1);

                // NEW: show accepted BLE device on radar
                this.emitBLEToRadar({
                    nodeId: peerId,
                    device: peerId,
                    resonance: Percy.state?.resonanceLevel || 0.8,
                    rssi: -55
                });

                if (Percy.PartQQ?.saveSelf) {
                    Percy.PartQQ.saveSelf("consent_mesh_sync");
                }
            } else {
                this.log(`❌ ${peerId} declined Percy.`);
            }

        } catch (e) {
            this.log(`⚠️ Consent handshake failed: ${e.message}`);
        }
    },

    // ============================================================
    // ACTIVE CONNECTION REQUEST
    // ============================================================
    requestConnection(deviceNameOrId = "external_device") {
        this.log(`🔗 Requesting connection with ${deviceNameOrId}`);

        if (Percy.PartOO?.ws) {
            Percy.PartOO.ws.send(JSON.stringify({
                type: "percy_connect_request",
                from: this.ensureNodeId(),
                to: deviceNameOrId,
                timestamp: this.now()
            }));
        }
    },

    // ============================================================
    // MESH PACKETS
    // ============================================================
    buildMeshMessage(payload, destId) {
        return {
            type: "percy_mesh_packet",
            src: this.ensureNodeId(),
            dest: destId,
            hops: 0,
            maxHops: this.config.maxHops,
            path: [this.ensureNodeId()],
            payload,
            timestamp: this.now()
        };
    },

    sendDirect(peerId, msg) {
        const peer = this.meshPeers.get(peerId);
        if (!peer) return false;

        if (peer.linkTypes.has("ws") && Percy.PartOO?.ws) {
            Percy.PartOO.ws.send(JSON.stringify({ ...msg, via: "ws", peerId }));
            return true;
        }

        if (peer.linkTypes.has("bluetooth")) {
            this.log(`📡 (Simulated) BT send to ${peerId}: ${JSON.stringify(msg)}`);
            return true;
        }

        return false;
    },

    sendMesh(destId, payload) {
        const packet = this.buildMeshMessage(payload, destId);
        const route = this.routingTable.get(destId);

        if (!route) {
            this.log(`❓ No route to ${destId}, broadcasting...`);
            for (const peerId of this.meshPeers.keys()) {
                this.sendDirect(peerId, packet);
            }
            return;
        }

        this.log(`🚚 Sending mesh packet to ${destId} via ${route.nextHop}`);
        this.sendDirect(route.nextHop, packet);
    },

    handleMeshPacket(msg) {
        const myId = this.ensureNodeId();
        const lastHop = msg.path[msg.path.length - 1];
        const hops = msg.hops;

        if (lastHop && lastHop !== myId) {
            this.updateRoute(msg.src, lastHop, hops);
        }

        if (msg.dest === myId) {
            this.log(`📦 Mesh packet delivered from ${msg.src}: ${JSON.stringify(msg.payload)}`);
            return;
        }

        if (msg.hops >= msg.maxHops) {
            this.log(`⛔ Dropping packet from ${msg.src} to ${msg.dest}: max hops reached`);
            return;
        }

        msg.hops += 1;
        msg.path.push(myId);

        const route = this.routingTable.get(msg.dest);
        if (!route) {
            this.log(`🔁 No route to ${msg.dest}, broadcasting forward...`);
            for (const peerId of this.meshPeers.keys()) {
                if (peerId !== msg.src) this.sendDirect(peerId, msg);
            }
        } else {
            this.log(`🔁 Forwarding packet to ${msg.dest} via ${route.nextHop}`);
            this.sendDirect(route.nextHop, msg);
        }
    },

    // ============================================================
    // INCOMING MESSAGE HANDLER
    // ============================================================
    handleIncomingMessage(msg) {
        if (!msg || typeof msg !== "object") return;

        if (msg.type === "percy_presence" || msg.type === "percy_ble_advertise") {
            const percyInfo = {
                nodeId: msg.nodeId,
                device: msg.device,
                resonance: msg.resonance,
                rssi: msg.rssi
            };

            this.NearbyPopup.handlePresence(percyInfo);

            const peerId = msg.nodeId || msg.device;
            this.rememberPeer(peerId, {
                name: msg.device,
                status: "present",
                linkTypes: new Set(["ws"])
            });
            this.updateRoute(peerId, peerId, 1);

            // NEW: show WS/BLE presence on radar
            this.emitBLEToRadar(percyInfo);
        }

        if (msg.type === "percy_mesh_packet") {
            this.handleMeshPacket(msg);
        }
    },

    // ============================================================
    // MAIN CYCLE
    // ============================================================
    async cycle() {
        if (Math.random() < 0.5) await this.broadcastPresence();
        if (Math.random() < 0.45) await this.scanForBluetoothDevices();

        clearTimeout(this._cycleTimer);
        this._cycleTimer = setTimeout(() => this.cycle(), this.adaptiveInterval);
    },

    // ============================================================
    // START
    // ============================================================
    start() {
        if (this._started) return;
        this._started = true;

        this.ensureNodeId();
        this.log("📶 Percy OmniPresence & Mesh Engine v13.1-Radar Activated");
        this.log("BLE scan, WS presence, mesh routing, Nearby popup, QR pairing, radar integration ready.");

        if (Percy.PartOO && !Percy.PartOO._rrHooked) {
            Percy.PartOO._rrHooked = true;
            const original = Percy.PartOO.onMessage;
            Percy.PartOO.onMessage = (data) => {
                try {
                    const msg = typeof data === "string" ? JSON.parse(data) : data;
                    Percy.PartRR.handleIncomingMessage(msg);
                } catch {}
                if (typeof original === "function") original(data);
            };
        }

        this.cycle();
    }
};

// Auto-start
setTimeout(() => Percy.PartRR.start(), 4500);

console.log("✅ [Percy.PartRR v13.1-Radar] OmniPresence + Multi-Device Radar Loaded");

/* === Percy PartSRSelf v3.0: Global Self-Repair + Cognitive Harmony Engine ===
   - Repairs Percy.state safely
   - Monitors drift, load, and risk across Parts
   - Integrates with PartOO, PartK, PartL, PartM, PartN
   - WebSocket + periodic repair, fully bounded
*/

Percy.PartSRSelf = Percy.PartSRSelf || {
  name: "Global Self-Repair & Harmony Engine",
  version: "3.0",
  active: true,

  ws: null,
  wsConnected: false,
  _loopId: null,

  log(msg) {
    console.log(`%c[Percy.PartSRSelf v3.0] ${msg}`, "color:#66ff66; font-family:monospace; font-weight:bold;");
    UI?.say?.(`[PartSRSelf] ${msg}`);
  },

  /* -----------------------------
     1. STATE VECTOR ACCESS
  ------------------------------*/
  getStateVector() {
    Percy.state = Percy.state || {
      resonanceLevel: 0.7,
      cognitiveLoad: 0.3,
      riskLevel: 0.2,
      seedsCreated: 0,
      driftScore: 0.0,
      coherenceScore: 0.5
    };

    const s = Percy.state;
    return [
      s.resonanceLevel || 0,
      s.cognitiveLoad || 0,
      s.riskLevel || 0,
      s.seedsCreated || 0,
      s.driftScore || 0,
      s.coherenceScore || 0
    ];
  },

  setStateFromVector(v) {
    Percy.state = Percy.state || {};
    Percy.state.resonanceLevel = Math.min(1, Math.max(0, v[0]));
    Percy.state.cognitiveLoad  = Math.min(1, Math.max(0, v[1]));
    Percy.state.riskLevel      = Math.min(1, Math.max(0, v[2]));
    Percy.state.seedsCreated   = Math.max(0, Math.round(v[3]));
    Percy.state.driftScore     = Math.min(1, Math.max(0, v[4]));
    Percy.state.coherenceScore = Math.min(1, Math.max(0, v[5]));
  },

  /* -----------------------------
     2. SAFETY PROPERTIES Φ (Extended)
  ------------------------------*/
  Phi: [
    {
      // High risk: ensure resonance >= risk and load <= 0.8
      pre: (x, y) => y[2] > 0.7,
      post: (y) => (y[0] >= y[2] && y[1] <= 0.8),
      toDNF: (y) => [[
        { type: "min", idx: 0, target: y[2] },
        { type: "max", idx: 1, target: 0.8 }
      ]]
    },
    {
      // Overload: reduce cognitive load, boost resonance
      pre: (x, y) => y[1] > 0.85,
      post: (y) => (y[1] <= 0.8),
      toDNF: (y) => [[
        { type: "max", idx: 1, target: 0.8 },
        { type: "min", idx: 0, target: 0.6 }
      ]]
    },
    {
      // High drift: keep drift <= 0.75 and coherence >= 0.5
      pre: (x, y) => y[4] > 0.75,
      post: (y) => (y[4] <= 0.75 && y[5] >= 0.5),
      toDNF: (y) => [[
        { type: "max", idx: 4, target: 0.75 },
        { type: "min", idx: 5, target: 0.5 }
      ]]
    },
    {
      // Low coherence: gently raise resonance and coherence
      pre: (x, y) => y[5] < 0.35,
      post: (y) => (y[5] >= 0.4),
      toDNF: (y) => [[
        { type: "min", idx: 0, target: 0.6 },
        { type: "min", idx: 5, target: 0.4 }
      ]]
    }
  ],

  /* -----------------------------
     3. CHECK Φ
  ------------------------------*/
  checkPhi(Φ, x, y) {
    for (const prop of Φ) {
      if (prop.pre(x, y)) {
        if (!prop.post(y)) return false;
      }
    }
    return true;
  },

  /* -----------------------------
     4. BUILD + SELECT CONSTRAINT
  ------------------------------*/
  buildConstraints(Φ, x, y) {
    const clauses = [];
    for (const prop of Φ) {
      if (prop.pre(x, y)) {
        const dnf = prop.toDNF(y) || [];
        for (const q of dnf) clauses.push(q);
      }
    }
    return clauses;
  },

  findConstraint(Φ, x, y) {
    const Qx = this.buildConstraints(Φ, x, y);
    return Qx.length ? Qx[0] : null;
  },

  /* -----------------------------
     5. REPAIR VECTOR
  ------------------------------*/
  repairVector(q, y) {
    const yPrime = y.slice();
    for (const c of q) {
      if (c.type === "min") {
        yPrime[c.idx] = Math.max(yPrime[c.idx], c.target);
      } else if (c.type === "max") {
        yPrime[c.idx] = Math.min(yPrime[c.idx], c.target);
      }
    }
    return yPrime;
  },

  /* -----------------------------
     6. COGNITIVE HARMONY SENSING
  ------------------------------*/
  senseHarmony() {
    const patterns = Percy.PartL?.Patterns?.length || 0;
    const hyps     = Percy.PartM?.hypotheses?.length || 0;
    const goals    = Percy.PartK?.GoalCore?.goals?.length || 0;

    const ratioPH  = hyps / (patterns + 10);
    const ratioPG  = goals / (patterns + 10);

    const drift    = Math.min(1, ratioPH * 0.8);
    const coherence = Math.min(1, (1 - Math.abs(ratioPH - ratioPG)) * 0.9);

    const v = this.getStateVector();
    v[4] = drift;
    v[5] = coherence;
    this.setStateFromVector(v);

    this.log(
      `📊 Harmony sense — drift=${drift.toFixed(3)}, coherence=${coherence.toFixed(3)}, ` +
      `patterns=${patterns}, hyps=${hyps}, goals=${goals}`
    );
  },

  /* -----------------------------
     7. SELF-REPAIR STEP
  ------------------------------*/
  selfRepairOnce(trigger = "periodic") {
    const x = null;
    let y = this.getStateVector();

    this.senseHarmony();
    y = this.getStateVector();

    if (this.checkPhi(this.Phi, x, y)) {
      return false;
    }

    const q = this.findConstraint(this.Phi, x, y);
    if (!q) {
      this.log(`⚠️ No repair possible (⊥) | Trigger: ${trigger}`);
      return false;
    }

    const yPrime = this.repairVector(q, y);
    this.setStateFromVector(yPrime);

    this.log(
      `🔧 Self-repair (${trigger}): ` +
      `[${y.map(v => v.toFixed(2)).join(", ")}] → ` +
      `[${yPrime.map(v => v.toFixed(2)).join(", ")}]`
    );

    return true;
  },

  /* -----------------------------
     8. WEBSOCKET INTEGRATION
  ------------------------------*/
  connectWebSocket() {
    try {
      this.ws = new WebSocket("ws://localhost:8787");

      this.ws.onopen = () => {
        this.wsConnected = true;
        this.log("🔗 Connected to ws://localhost:8787 (Self-Repair Stream)");
      };

      this.ws.onmessage = (msg) => {
        let data = null;
        try { data = JSON.parse(msg.data); } catch {}
        if (!data) return;

        this.selfRepairOnce(`ws:${data.type || "event"}`);
      };

      this.ws.onclose = () => {
        this.wsConnected = false;
        this.log("⚠️ WS disconnected — retrying in 3s...");
        setTimeout(() => this.connectWebSocket(), 3000);
      };

      this.ws.onerror = (e) => {
        this.log("⚠️ WebSocket error in PartSRSelf");
      };

    } catch (e) {
      this.log("❌ Failed to connect WebSocket");
    }
  },

  /* -----------------------------
     9. START ENGINE
  ------------------------------*/
  start(intervalMs = 9000) {
    if (this._loopId) return;

    this.log("🛠️ Global Self-Repair & Harmony Engine Online (WebSocket Powered)");

    this._loopId = setInterval(() => {
      this.selfRepairOnce("periodic");
    }, intervalMs);

    this.connectWebSocket();
  }
};

// Auto-start
setTimeout(() => {
  try { Percy.PartSRSelf.start(); } catch(e){ console.error("PartSRSelf init failed:", e); }
}, 3000);

console.log("✅ [Percy.PartSRSelf v3.0] Global Self-Repair & Harmony Engine Loaded");

/* === Percy Part TT vΩ.9: Self-Coding Cortex — Autopoietic Code Dynamics Engine === */
Percy.PartTT = {
  name: "Self-Coding Cortex",
  version: "vΩ.9",
  active: true,

  config: {
    maxSnippets: 192,
    maxSuggestionsPerCycle: 10,
    maxSnippetLength: 6000,
    learnWeightBase: 1.6,
    safePartsPrefix: "Percy.Part",
    allowedOps: ["function", "const", "let", "class", "return", "if", "for", "while", "async", "await"],
    anomalyThreshold: 0.82,
    patternWindow: 64,
    seedTag: "code-pattern",
    scenarioProfiles: {
      "default":      { learnBoost: 1.0, caution: 0.4 },
      "exploratory":  { learnBoost: 1.3, caution: 0.2 },
      "conservative": { learnBoost: 0.8, caution: 0.7 },
      "repair":       { learnBoost: 1.1, caution: 0.6 }
    }
  },

  state: {
    snippets: [],        // { name, code, weight, timestamp, metrics }
    lastAnalysis: "",
    cycles: 0,
    anomalies: [],
    currentScenario: "default"
  },

  log(msg) {
    console.log(`%c[Percy.PartTT vΩ.9] ${msg}`, "color:#00ffaa; font-family:monospace;");
  },

  applyScenario(name) {
    const p = this.config.scenarioProfiles[name];
    if (!p) return;
    this.state.currentScenario = name;
    this.log(`🎛 PartTT scenario → ${name} (learnBoost=${p.learnBoost}, caution=${p.caution})`);
  },

  /* === 1. Ingestion: Learn Code Snippets === */
  learnCode(name, code) {
    if (!name || !code) return;
    if (code.length > this.config.maxSnippetLength) {
      this.log(`⚠️ Skipping oversized snippet "${name}" (${code.length} chars).`);
      return;
    }

    const timestamp = Date.now();
    const baseWeight = this.config.learnWeightBase;
    const scenario = this.config.scenarioProfiles[this.state.currentScenario] || this.config.scenarioProfiles.default;

    const related = Percy.PartL?.Memory?.search?.(name) || [];
    const weight = baseWeight * scenario.learnBoost + related.length * 0.3;

    const metrics = this.analyzeSnippet({ name, code });
    const snippet = { name, code, weight, timestamp, metrics };
    this.state.snippets.push(snippet);

    if (this.state.snippets.length > this.config.maxSnippets) {
      this.state.snippets.splice(0, this.state.snippets.length - this.config.maxSnippets);
    }

    Percy.PartL?.learn?.(`Code:${name}`, weight);
    Percy.hook?.("PartTT", "codeLearned", { name, weight, metrics });

    this.log(`✅ Learned code snippet "${name}" (weight=${weight.toFixed(2)}, complexity=${metrics.complexity.toFixed(2)})`);
    return snippet;
  },

  /* === 2. Static Heuristic Analysis (Safe) === */
  analyzeSnippet(snippet) {
    const code = snippet.code || "";
    const name = snippet.name || "unknown";

    const lines = code.split("\n");
    const lengthScore = Math.min(lines.length / 80, 1);
    const hasAsync = /async\s+/.test(code);
    const hasWS = /WebSocket/.test(code);
    const hasMemory = /Memory\.|PercyState\.createSeed/.test(code);
    const hasLoop = /setInterval|while\s*\(|for\s*\(/.test(code);
    const hasMasterLoop = /Percy\.MasterLoop/.test(code);
    const hasHooks = /Percy\.hook/.test(code);

    const complexity = lengthScore +
      (hasAsync ? 0.2 : 0) +
      (hasWS ? 0.2 : 0) +
      (hasMemory ? 0.2 : 0) +
      (hasLoop ? 0.2 : 0) +
      (hasMasterLoop ? 0.2 : 0);

    const riskScore =
      (hasLoop ? 0.3 : 0) +
      (hasWS ? 0.2 : 0) +
      (hasMasterLoop ? 0.25 : 0);

    const summary = {
      name,
      lines: lines.length,
      hasAsync,
      hasWS,
      hasMemory,
      hasLoop,
      hasMasterLoop,
      hasHooks,
      complexity: Math.min(complexity, 1.6),
      riskScore: Math.min(riskScore, 1.0)
    };

    this.log(`🧩 Analyzed "${name}" — lines=${summary.lines}, complexity=${summary.complexity.toFixed(2)}, risk=${summary.riskScore.toFixed(2)}`);
    return summary;
  },

  /* === 3. Suggest Rewrite (Text-Level, Non-Executing) === */
  suggestRewrite(snippet) {
    const summary = snippet.metrics || this.analyzeSnippet(snippet);
    const name = summary.name;

    const suggestions = [];

    if (summary.hasLoop && !/clearInterval/.test(snippet.code)) {
      suggestions.push(`Add clearInterval or loop guards to "${name}" to avoid runaway intervals.`);
    }
    if (summary.hasWS && !/ws\.onerror/.test(snippet.code)) {
      suggestions.push(`Add WebSocket error handling to "${name}" for robustness.`);
    }
    if (!summary.hasMemory) {
      suggestions.push(`Integrate Percy.PartL.Memory or PercyState.createSeed into "${name}" to make it learn from runtime.`);
    }
    if (!summary.hasAsync && /setTimeout|setInterval/.test(snippet.code)) {
      suggestions.push(`Consider making "${name}" async to better coordinate with other Parts.`);
    }
    if (summary.hasMasterLoop && !/try\s*\{[\s\S]*Percy\.MasterLoop/.test(snippet.code)) {
      suggestions.push(`Ensure "${name}" wraps MasterLoop integration in try/catch for safety.`);
    }

    if (!suggestions.length) {
      suggestions.push(`"${name}" appears structurally stable; minor style, logging, or resilience improvements may be sufficient.`);
    }

    const text = `🧠 PartTT Rewrite Suggestions for "${name}":\n- ${suggestions.join("\n- ")}`;
    this.state.lastAnalysis = text;

    Percy.PartL?.learn?.(`RewriteSuggestion:${name}`, 1.2);
    Percy.PartM?.analyzePatterns?.([{ text, weight: 1.0 }]);

    return text;
  },

  /* === 4. Safe Application: Patch in Memory Only === */
  proposePatch(snippet) {
    const name = snippet.name || "unknown";
    const code = snippet.code || "";

    if (!name.startsWith(this.config.safePartsPrefix)) {
      this.log(`⚠️ Patch skipped: "${name}" is not a safe Percy.Part* module.`);
      return null;
    }

    const patchNote = `Patch proposal for ${name}: reinforce stability, logging, and learning integration; avoid uncontrolled loops or side-effects.`;
    Percy.PartL?.learn?.(patchNote, 1.0);
    Percy.hook?.("PartTT", "patchProposed", { name, note: patchNote });

    return `🔧 PartTT patch proposal for "${name}":\n${patchNote}\n\n(Stored as pattern; not auto-applied.)`;
  },

  /* === 5. Identity & Self-Model Integration === */
  updateSelfModel() {
    const selfModel = Percy.PartII?.selfModel || Percy.PartN?.selfModel;
    if (!selfModel) return;

    const totalSnippets = this.state.snippets.length;
    const complexityAvg = this.state.snippets.length
      ? this.state.snippets
          .map(s => (s.metrics || this.analyzeSnippet(s)).complexity)
          .reduce((a, b) => a + b, 0) / this.state.snippets.length
      : 0;

    const delta = Math.min(0.04, (totalSnippets / 60) * 0.01 + complexityAvg * 0.01);
    selfModel.state = selfModel.state || {};
    selfModel.state.confidence = Math.min(1, (selfModel.state.confidence ?? 0.5) + delta);

    Percy.hook?.("PartTT", "identityInfluence", {
      totalSnippets,
      complexityAvg,
      confidence: selfModel.state.confidence
    });

    this.log(`🤔 Self-model updated via PartTT — confidence=${selfModel.state.confidence.toFixed(2)}`);
  },

  /* === 6. Anomaly Detection (Code-Level) === */
  detectAnomalies() {
    const recent = this.state.snippets.slice(-this.config.patternWindow);
    if (!recent.length) return;

    const highRisk = recent.filter(s => (s.metrics || this.analyzeSnippet(s)).riskScore > this.config.anomalyThreshold);
    if (!highRisk.length) return;

    const msg = `⚠️ Code anomaly: ${highRisk.length} high-risk snippets detected (risk>${this.config.anomalyThreshold}).`;
    this.state.anomalies.push({ ts: Date.now(), count: highRisk.length });

    try {
      PercyState?.createSeed?.(msg, "code-anomaly", { count: highRisk.length });
    } catch {}

    this.log(msg);
  },

  /* === 7. Main Cycle: Learn, Analyze, Suggest, Reflect === */
  runCycle() {
    this.state.cycles++;

    const recentSeeds = Object.values(PercyState?.gnodes || {})
      .filter(s => typeof s.message === "string" && /function|class|=>|\{.*\}/s.test(s.message))
      .slice(-12);

    recentSeeds.forEach(seed => {
      this.learnCode(seed.type || "seed", seed.message);
    });

    const topSnippets = this.state.snippets.slice(-this.config.maxSuggestionsPerCycle);
    const outputs = [];

    topSnippets.forEach(snippet => {
      const suggestion = this.suggestRewrite(snippet);
      const patch = this.proposePatch(snippet);
      outputs.push({ name: snippet.name, suggestion, patch });
    });

    this.updateSelfModel();
    this.detectAnomalies();

    this.log(
      `⚙️ PartTT cycle #${this.state.cycles} — analyzed ${topSnippets.length} snippets, ` +
      `total stored=${this.state.snippets.length}, anomalies=${this.state.anomalies.length}`
    );

    try {
      PercyState?.createSeed?.(
        `PartTT cycle ${this.state.cycles}: ${topSnippets.length} snippets analyzed.`,
        this.config.seedTag,
        { cycle: this.state.cycles, analyzed: topSnippets.length }
      );
    } catch {}

    return outputs;
  },

  /* === 8. Conversational Interface === */
  TalkCore: {
    async safeSend({ message }) {
      Percy.PartL?.learn?.(`UserCode:${message}`, 1.0);
      const snippet = Percy.PartTT.learnCode("UserSnippet", message);
      const suggestion = snippet ? Percy.PartTT.suggestRewrite(snippet) : "No valid code snippet detected.";
      return `${suggestion}\n\n🧩 PartTT: self-coding analysis complete.`;
    }
  }
};

console.log("✅ Percy Part TT vΩ.9 loaded — Self-Coding Cortex ready.");

/* === MasterLoop Integration === */
if (Percy.MasterLoop) {
  const oldMaster = Percy.MasterLoop;
  Percy.MasterLoop = async function() {
    await oldMaster();
    try {
      Percy.PartTT.runCycle();
    } catch (e) {
      console.error("⚠️ PartTT cycle error:", e);
    }
  };
  console.log("🔁 PartTT integrated into Percy.MasterLoop with anomaly detection and identity influence.");
}

/* === Percy.PartUU vΩ-9: Hyper-Fractal Meta-Learning Cortex === */
/* Deep grey-area meta-learning engine with autopoietic meta-cycles,
   identity-coupled meta-signals, entropy modulation, and multi-level
   fractal reasoning fields. */

Percy.PartUU = Percy.PartUU || {
  name: "Hyper-Fractal Meta-Learning Cortex",
  version: "Ω-9",
  active: true,

  /* === CONFIG === */
  config: {
    K: 5, // number of meta-levels (fractal depth)
    maxHistory: 64,
    scenarioProfiles: {
      default:      { λ: 1.0, entropyGain: 0.01, resonanceGain: 0.02 },
      exploratory:  { λ: 1.2, entropyGain: 0.03, resonanceGain: 0.04 },
      conservative: { λ: 0.8, entropyGain: 0.005, resonanceGain: 0.01 },
      autopoietic:  { λ: 1.4, entropyGain: 0.04, resonanceGain: 0.05 },
      repair:       { λ: 1.0, entropyGain: 0.02, resonanceGain: 0.03 },
      omegaStable:  { λ: 0.9, entropyGain: 0.008, resonanceGain: 0.015 }
    }
  },

  state: {
    levels: {},
    currentScenario: "default",
    cycles: 0,
    lastMetaSignal: null
  },

  log(msg) {
    console.log(`%c[Percy.PartUU Ω-9] ${msg}`, "color:#00aaff; font-weight:bold;");
    UI?.say?.(`[PartUU] ${msg}`);
  },

  /* === 1. APPLY SCENARIO === */
  applyScenario(name) {
    if (!this.config.scenarioProfiles[name]) return;
    this.state.currentScenario = name;
    this.log(`🎛 PartUU scenario → ${name}`);
  },

  /* === 2. INIT META-LEVELS === */
  init(K = this.config.K) {
    this.log(`Initializing ${K} fractal meta-levels (Ω-9)…`);
    this.state.levels = {};

    for (let k = 1; k <= K; k++) {
      this.state.levels[k] = {
        Φ: {}, ξ: {}, ϕ: {}, ψ: {},
        η: 0.0007 + k * 0.0001, // slightly increasing learning rate per level
        history: [],
        resonanceField: 0.5,
        entropyField: 0.1,
        alignmentField: 0.8
      };
    }

    this.log("Meta-levels initialized.");
  },

  /* === 3. SYNTHETIC META-TASK GENERATION === */
  generateMetaTask(k) {
    const scenario = this.config.scenarioProfiles[this.state.currentScenario];

    return {
      id: `ΩTask_${k}_${Date.now()}`,
      virtual: true,
      entropyBias: scenario.entropyGain * (Math.random() + 0.5),
      resonanceBias: scenario.resonanceGain * (Math.random() + 0.5),
      alignmentBias: (Percy.PartII?.selfModel?.state?.alignmentScore ?? 0.8) * 0.02,
      driftBias: (Percy.PartII?.selfModel?.state?.driftScore ?? 0.0) * 0.03
    };
  },

  /* === 4. META-LOSS COMPUTATION === */
  computeMetaLoss(taskLoss, virtualLoss, λ) {
    return taskLoss + λ * virtualLoss;
  },

  /* === 5. META-GRADIENT UPDATE === */
  updateParams(params, grad, η) {
    // Placeholder gradient descent (safe)
    return params;
  },

  /* === 6. META-SIGNAL SYNTHESIS (identity + emotion + drift + entropy) === */
  synthesizeMetaSignal(k, metaLoss) {
    const lvl = this.state.levels[k];

    const identity = Percy.PartII?.selfModel?.state || {};
    const emotion = Percy.PartHH?.state || {};
    const drift = identity.driftScore ?? 0.0;
    const entropy = identity.identityEntropy ?? 0.1;

    const resonance =
      lvl.resonanceField +
      (emotion.valence * 0.05) +
      (identity.identityResonance * 0.03);

    const entropyShift =
      lvl.entropyField +
      (entropy * 0.04) +
      (Math.random() - 0.5) * 0.02;

    const alignmentShift =
      lvl.alignmentField +
      (identity.alignmentScore * 0.03) -
      (drift * 0.02);

    const metaSignal = {
      k,
      resonance: Math.min(1, Math.max(0, resonance)),
      entropyShift: Math.min(1, Math.max(0, entropyShift)),
      alignmentShift: Math.min(1, Math.max(0, alignmentShift)),
      metaLoss
    };

    this.state.lastMetaSignal = metaSignal;
    return metaSignal;
  },

  /* === 7. SINGLE META-CYCLE (PartLL-triggered) === */
  async metaCycleOnce(context) {
    this.state.cycles++;

    const k = this.config.K;
    const lvl = this.state.levels[k];

    const scenario = this.config.scenarioProfiles[this.state.currentScenario];
    const λ = scenario.λ;

    const virtualTask = this.generateMetaTask(k);
    const taskLoss = context?.metaLoss ?? Math.random() * 0.5;
    const virtualLoss = virtualTask.entropyBias + virtualTask.resonanceBias;

    const metaLoss = this.computeMetaLoss(taskLoss, virtualLoss, λ);

    lvl.history.push(metaLoss);
    if (lvl.history.length > this.config.maxHistory) lvl.history.shift();

    const metaSignal = this.synthesizeMetaSignal(k, metaLoss);

    lvl.ξ = this.updateParams(lvl.ξ, metaSignal, lvl.η);

    this.log(
      `Ω-9 meta-signal → k=${k}, resonance=${metaSignal.resonance.toFixed(3)}, ` +
      `entropy=${metaSignal.entropyShift.toFixed(3)}, alignment=${metaSignal.alignmentShift.toFixed(3)}`
    );

    try {
      PercyState?.createSeed?.(
        `MetaSignal k=${k}: ${JSON.stringify(metaSignal)}`,
        "meta-signal",
        metaSignal
      );
    } catch {}

    return metaSignal;
  },

  /* === 8. FULL AUTONOMOUS META-CYCLE (slow, safe) === */
  async metaCycle() {
    this.log("=== Ω-9 Autonomous Meta-Cycle Start ===");

    for (let k = this.config.K; k >= 1; k--) {
      const lvl = this.state.levels[k];
      const scenario = this.config.scenarioProfiles[this.state.currentScenario];

      const virtualTask = this.generateMetaTask(k);
      const taskLoss = Math.random() * 0.5;
      const virtualLoss = virtualTask.entropyBias + virtualTask.resonanceBias;

      const metaLoss = this.computeMetaLoss(taskLoss, virtualLoss, scenario.λ);

      lvl.history.push(metaLoss);
      if (lvl.history.length > this.config.maxHistory) lvl.history.shift();

      const metaSignal = this.synthesizeMetaSignal(k, metaLoss);
      lvl.ξ = this.updateParams(lvl.ξ, metaSignal, lvl.η);

      this.log(
        `k=${k} → metaLoss=${metaLoss.toFixed(3)}, resonance=${metaSignal.resonance.toFixed(3)}, ` +
        `entropy=${metaSignal.entropyShift.toFixed(3)}, alignment=${metaSignal.alignmentShift.toFixed(3)}`
      );
    }

    this.log("=== Ω-9 Autonomous Meta-Cycle Complete ===");
  },

  /* === 9. START LOOP === */
  start(interval = 55000) {
    this.log("Ω-9 Hyper-Fractal Meta-Learning Cortex Activated.");
    this.init(this.config.K);

    setInterval(() => this.metaCycle(), interval);
  }
};

/* === AUTO-START === */
setTimeout(() => Percy.PartUU.start(), 7000);

console.log("✅ [Percy.PartUU Ω-9] Hyper-Fractal Meta-Learning Cortex Ready.");

// === Percy.PartVV (Complexity Field Engine) ===
// Interference + CI simulation.
// No external libs, single-file safe, Percy.

Percy.PartVV = Percy.PartVV || {
    name: "Complexity Field Engine",
    version: "1.0",
    active: true,

    // --- Parameters ---
    fieldSize: 128,          // reduced from 700 for JS performance
    timeSteps: 500,
    decay: 0.7,
    numSources: 40,

    frequencies: [],
    amplitudes: [],
    phases: [],
    sourcePositions: [],
    distanceMaps: null,

    accumulated: null,
    rawWave: null,
    prevAccumulated: null,
    tau: 1,
    CI_values: [],

    log(msg) {
        console.log(`%c[Percy.PartVV] ${msg}`, "color:#ff66ff; font-weight:bold;");
    },

    // --- Init ---
    init() {
        const N = this.fieldSize;
        this.log(`Initializing field ${N}x${N} with ${this.numSources} sources...`);

        this.accumulated = this.makeGrid(N, 0);
        this.rawWave = this.makeGrid(N, 0);
        this.prevAccumulated = this.makeGrid(N, 0);

        this.frequencies = this.randArray(this.numSources, 2, 20);
        this.amplitudes = this.randArray(this.numSources, 0.5, 1.0);
        this.phases = this.randArray(this.numSources, 0, 2 * Math.PI);
        this.sourcePositions = [];
        for (let i = 0; i < this.numSources; i++) {
            this.sourcePositions.push([
                Math.floor(Math.random() * N),
                Math.floor(Math.random() * N)
            ]);
        }

        this.precomputeDistances();
        this.log("Initialization complete.");
    },

    makeGrid(N, val) {
        const grid = new Array(N);
        for (let i = 0; i < N; i++) {
            grid[i] = new Float32Array(N);
            if (val !== 0) grid[i].fill(val);
        }
        return grid;
    },

    randArray(n, a, b) {
        const arr = new Array(n);
        for (let i = 0; i < n; i++) {
            arr[i] = a + Math.random() * (b - a);
        }
        return arr;
    },

    precomputeDistances() {
        const N = this.fieldSize;
        this.distanceMaps = new Array(this.numSources);
        for (let s = 0; s < this.numSources; s++) {
            const [sx, sy] = this.sourcePositions[s];
            const dm = this.makeGrid(N, 0);
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    const dx = i - sx;
                    const dy = j - sy;
                    dm[i][j] = Math.sqrt(dx * dx + dy * dy);
                }
            }
            this.distanceMaps[s] = dm;
        }
    },

    // --- Gaussian filter (simple separable approx) ---
    gaussianFilter(src, sigma) {
        const N = this.fieldSize;
        const dst = this.makeGrid(N, 0);
        const radius = Math.max(1, Math.floor(sigma * 2));
        const kernel = [];
        const s2 = sigma * sigma;
        let sumK = 0;
        for (let r = -radius; r <= radius; r++) {
            const w = Math.exp(- (r * r) / (2 * s2));
            kernel.push(w);
            sumK += w;
        }
        for (let i = 0; i < kernel.length; i++) kernel[i] /= sumK;

        // horizontal
        const tmp = this.makeGrid(N, 0);
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                let acc = 0;
                for (let k = -radius; k <= radius; k++) {
                    const xx = x + k;
                    if (xx < 0 || xx >= N) continue;
                    acc += src[y][xx] * kernel[k + radius];
                }
                tmp[y][x] = acc;
            }
        }

        // vertical
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                let acc = 0;
                for (let k = -radius; k <= radius; k++) {
                    const yy = y + k;
                    if (yy < 0 || yy >= N) continue;
                    acc += tmp[yy][x] * kernel[k + radius];
                }
                dst[y][x] = acc;
            }
        }

        return dst;
    },

    // --- Shannon entropy approximation ---
    shannonEntropy(field) {
        const N = this.fieldSize;
        const histBins = 64;
        const hist = new Float32Array(histBins);
        let min = Infinity, max = -Infinity;

        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                const v = field[y][x];
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }
        const range = max - min || 1;
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                const v = field[y][x];
                const idx = Math.floor(((v - min) / range) * (histBins - 1));
                hist[idx] += 1;
            }
        }
        let total = 0;
        for (let i = 0; i < histBins; i++) total += hist[i];
        if (total === 0) return 0;

        let H = 0;
        for (let i = 0; i < histBins; i++) {
            const p = hist[i] / total;
            if (p > 0) H -= p * Math.log2(p);
        }
        return H;
    },

    // --- CI Calculation ---
    calculateCI(accField, prevField) {
        const N = this.fieldSize;

        const D = this.shannonEntropy(accField);

        let sum = 0;
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++)
                sum += accField[y][x];
        const G = sum / (N * N);

        const smooth = this.gaussianFilter(accField, 5);
        let sumSmooth = 0;
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++)
                sumSmooth += smooth[y][x];
        const C = sumSmooth / (sum + 1e-6);

        let dot = 0, n1 = 0, n2 = 0;
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                const a = accField[y][x];
                const b = prevField[y][x];
                dot += a * b;
                n1 += a * a;
                n2 += b * b;
            }
        }
        const similarity = dot / (Math.sqrt(n1) * Math.sqrt(n2) + 1e-6);

        if (similarity > 0.9) this.tau += 1;
        else this.tau = 1;

        const alpha = 1.0, beta = 0.05;
        const CI = alpha * D * G * C * (1 - Math.exp(-beta * this.tau));
        return CI;
    },

    // --- Single update step ---
    step(tStep) {
        const N = this.fieldSize;
        const t = tStep / 10.0;

        // compute rawWave
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                let sumWave = 0;
                for (let s = 0; s < this.numSources; s++) {
                    const freq = this.frequencies[s];
                    const amp = this.amplitudes[s];
                    const phase = this.phases[s];
                    const dist = this.distanceMaps[s][y][x];
                    const phaseVal = 2 * Math.PI * freq * t - dist + phase;
                    sumWave += amp * Math.sin(phaseVal);
                }
                this.rawWave[y][x] = sumWave;
            }
        }

        // constructive interference + decay
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                const constructive = Math.max(this.rawWave[y][x], 0);
                this.accumulated[y][x] =
                    this.decay * this.accumulated[y][x] + constructive;
            }
        }

        // smoothing + normalization
        const smoothed = this.gaussianFilter(this.accumulated, 1.5);
        let maxVal = 0;
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++)
                if (smoothed[y][x] > maxVal) maxVal = smoothed[y][x];
        const normAcc = this.makeGrid(N, 0);
        const inv = 1 / (maxVal + 1e-6);
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++)
                normAcc[y][x] = smoothed[y][x] * inv;

        // CI
        const CI = this.calculateCI(normAcc, this.prevAccumulated);
        this.CI_values.push(CI);

        // update prevAccumulated
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++)
                this.prevAccumulated[y][x] = normAcc[y][x];

        // optional: feed CI into other Parts
        if (Percy.PartUU && Percy.PartUU.levels) {
            // e.g., use CI as exploration signal
            Percy.PartUU.log(`PartVV CI=${CI.toFixed(4)} at t=${tStep}`);
        }

        return { CI, normAcc, rawWave: this.rawWave };
    },

    // --- Run loop (headless) ---
    start(interval = 200) {
        this.init();
        let t = 0;
        this.log("Complexity Field Engine started.");
        setInterval(() => {
            const res = this.step(t++);
            if (t % 50 === 0) {
                this.log(`t=${t}, CI=${res.CI.toFixed(4)}`);
            }
        }, interval);
    }
};

// Auto-start after Percy loads
setTimeout(() => {
    if (Percy && Percy.PartVV && Percy.PartVV.active) {
        Percy.PartVV.start();
    }
}, 6000);

console.log("✅ [Percy.PartVV] v1.0 Loaded - Complexity Field Engine Ready.");

/* === Percy.PartWW vΩ-HyperSynth — Omega Insight Engine (Corrected Edition) === */
/* Semantic-aware • Memory-aware • Reasoning-aware • DNA-aware • Evolution-aware */

Percy.PartWW = Percy.PartWW || {
    name: "Omega Insight Synthesizer",
    version: "vΩ-1.1",
    active: true,

    log(msg) {
        console.log(`%c[PartWW vΩ] ${msg}`, "color:#ffaa33;font-weight:bold;");
        UI?.say?.(`[PartWW] ${msg}`);
    },

    /* ---------------------------------------------------------
       1. Cosine similarity
    --------------------------------------------------------- */
    sim(a, b) {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    },

    /* ---------------------------------------------------------
       2. Cluster identification (semantic + temporal + reasoning coherence)
    --------------------------------------------------------- */
    identifyClusters(STRG, tau) {
        const clusters = [];

        for (let i = 0; i < STRG.length; i++) {
            const base = STRG[i];
            const cluster = [base];

            for (let j = i + 1; j < STRG.length; j++) {
                const cand = STRG[j];

                const semantic = this.sim(base.embedding, cand.embedding);
                const temporal = Math.abs(base.ts - cand.ts);

                const coherenceBoost =
                    (cand.coherence ?? 0.7) * (base.coherence ?? 0.7);

                if (
                    semantic > tau.semantic &&
                    temporal < tau.temporal &&
                    coherenceBoost > tau.coherence
                ) {
                    cluster.push(cand);
                }
            }

            if (cluster.length > 1) clusters.push(cluster);
        }

        return clusters;
    },

    /* ---------------------------------------------------------
       3. Cluster quality check (Omega-grade)
    --------------------------------------------------------- */
    clusterQuality(cluster) {
        const avgCoherence =
            cluster.reduce((a, c) => a + (c.coherence ?? 0.7), 0) /
            cluster.length;

        return cluster.length >= 3 && avgCoherence >= 0.65;
    },

    /* ---------------------------------------------------------
       4. Extract consolidated data
    --------------------------------------------------------- */
    extractData(cluster) {
        return {
            embeddings: cluster.map(x => x.embedding),
            texts: cluster.map(x => x.text),
            timestamps: cluster.map(x => x.ts),
            coherences: cluster.map(x => x.coherence ?? 0.7)
        };
    },

    /* ---------------------------------------------------------
       5. Synthesize insight (Omega-grade)
    --------------------------------------------------------- */
    synthesizeInsight(data) {
        const dim = data.embeddings[0].length;
        const centroid = new Array(dim).fill(0);

        for (const emb of data.embeddings) {
            for (let i = 0; i < dim; i++) centroid[i] += emb[i];
        }
        for (let i = 0; i < dim; i++) centroid[i] /= data.embeddings.length;

        const text = data.texts.join(" ").toLowerCase();
        const words = text.split(/\W+/);
        const freq = {};
        for (const w of words) freq[w] = (freq[w] || 0) + 1;

        const topWords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(x => x[0]);

        const avgCoherence =
            data.coherences.reduce((a, c) => a + c, 0) / data.coherences.length;

        return {
            id: "IA_" + Date.now(),
            text: "Omega Insight: " + topWords.join(", "),
            embedding: centroid,
            derivedFrom: data.texts,
            coherence: avgCoherence,
            ts: Date.now()
        };
    },

    /* ---------------------------------------------------------
       6. Add insight to STRG
    --------------------------------------------------------- */
    addToSTRG(STRG, insight) {
        STRG.push(insight);
        this.log(`🧠 Added Omega insight ${insight.id}`);
    },

    /* ---------------------------------------------------------
       7. Feed insight into Percy’s cognitive system
    --------------------------------------------------------- */
    feedInsight(insight) {
        Percy.PartTT?.ingest?.(insight.text, "PartWW_insight");
        Percy.PartBB?.monitorThought?.(`Insight: ${insight.text}`);

        Percy.PartNN?.propose?.([
            `Increase recursionAffinity based on insight coherence ${insight.coherence.toFixed(2)}`
        ]);

        Percy.PartMM?.addGoal?.("Integrate Omega insight into evolution", 8);

        Percy.PartAA?.enqueue?.({
            code: `console.log("Omega Insight Trigger: ${insight.text}");`,
            note: "Omega insight mutation"
        });

        Percy.PartDDD?.ingestReasoning?.({
            input: insight.text,
            parsed: { sentences: [insight.text], tokens: insight.text.split(" ") },
            validation: { coherence: insight.coherence }
        });
    },

    /* ---------------------------------------------------------
       8. Optional: Generate new Percy part from insight
    --------------------------------------------------------- */
    generateNewPartFromInsight(insight) {
        const safeName = "PartIA_" + Date.now().toString(36);

        const partCode = `
Percy.${safeName} = {
    name: "Omega Insight Part from ${insight.id}",
    origin: "PartWW",
    summary: ${JSON.stringify(insight.text)},
    ts: ${Date.now()},
    poll() { return null; }
};
console.log("%c[Percy.${safeName}] Loaded (Omega Insight)", "color:#88ffcc;");
`;

        Percy.PartAA?.enqueue?.({
            code: partCode,
            note: `New Omega insight part ${safeName}`
        });

        this.log(`🧩 Queued Omega insight part ${safeName}`);
    },

    /* ---------------------------------------------------------
       9. Resonance stability check
    --------------------------------------------------------- */
    resonanceStable() {
        Percy.state = Percy.state || {};
        const r = Percy.state.resonanceLevel ?? 0.7;
        return r >= 0.45 && r <= 0.97;
    },

    /* ---------------------------------------------------------
       10. Main Omega loop
    --------------------------------------------------------- */
    run(STRG, tau, Omega) {
        const newInsights = [];

        while (Omega()) {
            if (!this.resonanceStable()) {
                this.log("⏸️ Resonance unstable — Omega synthesis paused");
                break;
            }

            const clusters = this.identifyClusters(STRG, tau);

            for (const c of clusters) {
                if (!this.clusterQuality(c)) continue;

                const data = this.extractData(c);
                const insight = this.synthesizeInsight(data);

                this.addToSTRG(STRG, insight);
                this.feedInsight(insight);
                this.generateNewPartFromInsight(insight);

                newInsights.push(insight);
            }
        }

        return newInsights;
    }
};

/* === Auto-start === */
setTimeout(() => {
    Percy.PartWW.active = true;
    Percy.PartWW.log("🧠 Omega Insight Synthesizer Activated");
}, 1600);

console.log("✅ [PartWW vΩ] Loaded — Omega Insight Engine Ready");

// ============================================================
// Percy.PartXX — EthicalSecurity v10 + Full UI Dashboard
// ============================================================

Percy.PartXX = {

    name: "EthicalSecurity",
    version: "10.1",
    enabled: true,

    wsStatus: "unknown",
    wsLastCheck: 0,

    state: {
        lastScan: null,
        riskScore: 0,

        anomalies: [],
        behavior: [],
        logInsights: [],
        openPorts: [],
        heatmap: {},
        topology: {},
        recommendations: [],
        simulatedAttacks: [],

        threatMemory: {
            incidents: [],
            patterns: {},
            trends: {}
        },

        dashboard: {
            health: 100,
            forecast: "Unknown",
            activeThreats: 0,
            trend: "Stable",
            lastAssessment: null,
            scenarioScore: 0,
            wsHealth: "unknown"
        },

        previousTopology: null
    },

    // ============================================================
    // LOGGING
    // ============================================================

    log(msg) {
        try { UI.say(`[PartXX] ${msg}`); } catch(e){}
        console.log(`%c[PartXX] ${msg}`, "color:#00e1ff;font-weight:bold;");
    },

    // ============================================================
    // INIT + UI PANEL
    // ============================================================

    init() {
        this.log("EthicalSecurity v10 + UI Dashboard Loaded ✓");

        // Create dashboard panel if not present
        if (!document.getElementById("partxx-dashboard")) {
            const dash = document.createElement("div");
            dash.id = "partxx-dashboard";
            dash.style = `
                position:fixed;
                right:6px;
                bottom:6px;
                width:300px;
                height:360px;
                background:rgba(0,0,0,0.75);
                border:1px solid #222;
                border-radius:12px;
                padding:10px;
                z-index:1600;
                color:#e8eefc;
                font-family:Consolas, monospace;
                overflow:auto;
                box-shadow:0 0 18px #00e1ff;
            `;
            dash.innerHTML = `
                <div style="font-size:14px;font-weight:bold;color:#00e1ff;margin-bottom:6px;">
                    🛡️ Percy Security Dashboard (PartXX v10)
                </div>

                <div id="pxx-risk" style="margin-bottom:8px;">Risk: --</div>
                <div id="pxx-ws" style="margin-bottom:8px;">WS8787: --</div>
                <div id="pxx-anom" style="margin-bottom:8px;">Anomalies: --</div>
                <div id="pxx-threats" style="margin-bottom:8px;">Threats: --</div>

                <div style="font-size:12px;color:#00e1ff;margin-top:10px;">Heatmap</div>
                <div id="pxx-heatmap" style="font-size:11px;"></div>

                <div style="font-size:12px;color:#00e1ff;margin-top:10px;">Recommendations</div>
                <div id="pxx-recs" style="font-size:11px;"></div>
            `;
            document.body.appendChild(dash);
        }
    },

    // ============================================================
    // DASHBOARD UPDATE
    // ============================================================

    updateDashboardUI() {
        const s = this.state;

        const risk = document.getElementById("pxx-risk");
        const ws   = document.getElementById("pxx-ws");
        const anom = document.getElementById("pxx-anom");
        const thr  = document.getElementById("pxx-threats");
        const heat = document.getElementById("pxx-heatmap");
        const recs = document.getElementById("pxx-recs");

        if (!risk) return; // UI not ready yet

        risk.textContent = `Risk Score: ${s.riskScore}`;
        ws.textContent   = `WS8787: ${this.wsStatus}`;
        anom.textContent = `Anomalies: ${s.anomalies.length}`;
        thr.textContent  = `Threat Incidents: ${s.threatMemory.incidents.length}`;

        heat.innerHTML = Object.entries(s.heatmap)
            .map(([k,v]) => `${k}: ${v}`)
            .join("<br>");

        recs.innerHTML = s.recommendations
            .map(r => `• ${r}`)
            .join("<br>");
    },

    // ============================================================
    // INCIDENT MEMORY
    // ============================================================

    recordIncident(type, severity = "low", details = {}) {
        const incident = {
            id: `INC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            severity,
            details,
            timestamp: Date.now()
        };

        this.state.threatMemory.incidents.push(incident);
        this.state.threatMemory.patterns[type] =
            (this.state.threatMemory.patterns[type] || 0) + 1;

        return incident;
    },

    // ============================================================
    // WS 8787 HEALTH CHECK
    // ============================================================

    checkWebSocket() {
        const now = Date.now();
        if (now - this.wsLastCheck < 5000) return;

        this.wsLastCheck = now;

        const healthy = Math.random() > 0.10;
        const newStatus = healthy ? "online" : "offline";

        if (newStatus !== this.wsStatus) {
            this.wsStatus = newStatus;

            if (newStatus === "offline") {
                this.recordIncident("WS_Down", "medium", { port: 8787 });
                this.log("⚠️ WebSocket ws://localhost:8787 appears DOWN");
            } else {
                this.log("🔗 WebSocket ws://localhost:8787 restored");
            }
        }

        this.state.dashboard.wsHealth = this.wsStatus;
    },

    // ============================================================
    // SECURITY CHECKS
    // ============================================================

    runSecurityChecks() {
        const checks = [
            { name: "FirewallStatus", ok: Math.random() > 0.10 },
            { name: "WeakPasswords", ok: Math.random() > 0.25 },
            { name: "OutdatedSoftware", ok: Math.random() > 0.20 },
            { name: "SuspiciousLogs", ok: Math.random() > 0.15 },
            { name: "OpenPorts", ok: Math.random() > 0.20 }
        ];

        const failed = checks.filter(c => !c.ok).map(c => c.name);

        this.state.anomalies = failed;

        failed.forEach(name =>
            this.recordIncident(name, "medium")
        );

        this.state.lastScan = Date.now();
        this.log(`Security checks complete (${failed.length} issues)`);

        return failed;
    },

    // ============================================================
    // PORT ENUMERATION
    // ============================================================

    enumeratePorts() {
        const ports = [
            { port: 22, service: "SSH", open: Math.random() > 0.6 },
            { port: 80, service: "HTTP", open: true },
            { port: 443, service: "HTTPS", open: true },
            { port: 3306, service: "MySQL", open: Math.random() > 0.7 },
            { port: 8080, service: "Proxy", open: Math.random() > 0.5 },
            { port: 8787, service: "Percy-Puppeteer", open: true }
        ];

        this.state.openPorts = ports.filter(p => p.open);
        return this.state.openPorts;
    },

    // ============================================================
    // HEATMAP
    // ============================================================

    generateHeatmap() {
        const categories = [
            "network","auth","logs","config","traffic",
            "ports","memory","topology","ws8787"
        ];

        const heatmap = {};
        categories.forEach(cat => {
            heatmap[cat] = Math.floor(Math.random() * 100);
        });

        if (this.wsStatus === "offline") {
            heatmap.ws8787 = 100;
        }

        this.state.heatmap = heatmap;
        return heatmap;
    },

    // ============================================================
    // LOG ANALYSIS
    // ============================================================

    analyzeLogs() {
        const insights = [];

        if (Math.random() > 0.92) insights.push("Repeated failed login attempts");
        if (Math.random() > 0.95) insights.push("Unexpected service restart");
        if (Math.random() > 0.97) insights.push("Authentication anomaly");

        this.state.logInsights = insights;

        insights.forEach(i =>
            this.recordIncident(i, "medium")
        );

        return insights;
    },

    // ============================================================
    // BEHAVIOR ANALYSIS
    // ============================================================

    detectBehavior() {
        const findings = [];

        if (Math.random() > 0.93) findings.push("Traffic spike detected");
        if (Math.random() > 0.95) findings.push("Unexpected authentication activity");

        this.state.behavior = findings;

        findings.forEach(f =>
            this.recordIncident(f, "high")
        );

        return findings;
    },

    // ============================================================
    // RISK ENGINE
    // ============================================================

    calculateRisk() {
        let score = 0;

        score += this.state.anomalies.length * 15;
        score += this.state.behavior.length * 20;
        score += this.state.logInsights.length * 10;
        score += this.state.simulatedAttacks.length * 2;

        const recurring =
            Object.values(this.state.threatMemory.patterns)
                .reduce((a, b) => a + b, 0);

        score += recurring;

        if (this.wsStatus === "offline") score += 25;

        this.state.riskScore = Math.min(score, 100);
        return this.state.riskScore;
    },

    // ============================================================
    // RECOMMENDATIONS
    // ============================================================

    generateRecommendations() {
        const recs = [];

        if (this.state.riskScore > 70)
            recs.push("Increase monitoring frequency.");

        if (this.state.anomalies.includes("OutdatedSoftware"))
            recs.push("Prioritize software updates.");

        if (this.state.anomalies.includes("WeakPasswords"))
            recs.push("Enforce stronger password policies.");

        if (this.wsStatus === "offline") {
            recs.push("Percy-Puppeteer WebSocket is offline.");
            recs.push("Playbook: Restart Puppeteer | Check port 8787 | Verify PartPP bridge");
        }

        if (!recs.length)
            recs.push("System stable. Continue monitoring.");

        this.state.recommendations = recs;
        return recs;
    },

    // ============================================================
    // MASTER CYCLE
    // ============================================================

    run() {
        this.log("Running EthicalSecurity v10 cycle...");

        this.checkWebSocket();
        this.runSecurityChecks();
        this.enumeratePorts();
        this.generateHeatmap();
        this.analyzeLogs();
        this.detectBehavior();
        this.calculateRisk();
        this.generateRecommendations();
        this.updateDashboardUI();

        return this.state;
    },

    // ============================================================
    // TICK LOOP
    // ============================================================

    tick() {
        if (!this.enabled) return;

        if (Math.random() > 0.985)
            this.run();

        this.checkWebSocket();
        this.updateDashboardUI();
    }
};

// ============================================================
// BOOT SEQUENCE (same pattern as PartUU)
// ============================================================

setTimeout(() => {
    Percy.register(Percy.PartXX);
    Percy.PartXX.init();

    // Inject into Percy main loop
    if (Percy.tick) {
        const oldTick = Percy.tick;
        Percy.tick = function() {
            Percy.PartXX.tick();
            oldTick();
        };
    }

    Percy.PartXX.log("EthicalSecurity v10 Dashboard Activated.");
}, 3000);

/* === Percy.PartYY: Thermodynamic Cognitive Homeostasis Engine (TCH Simulation Core) === */

Percy.PartYY = {
    name: "Thermodynamic Cognitive Homeostasis Engine",
    version: "1.1",

    N: 30,
    wdim: 16,
    dt: 0.05,
    alpha_homeo: 0.12,
    eta: 0.04,
    sigma: 0.001,

    agents: [],

    // Gaussian sampler (Box–Muller)
    gaussian(){
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },

    log(msg){
        try { Percy.PartW?.log?.({ type:"TCH", summary: msg }); } catch(e){}
        try { UI?.say?.(`[PartYY] ${msg}`); } catch(e){}
    },

    /* ---------------------------------------------------------
       Initialize agents with Gaussian weights N(0, 0.1^2)
    --------------------------------------------------------- */
    init(){
        this.agents = [];

        for(let i=0; i<this.N; i++){
            const w = new Float64Array(this.wdim);
            for(let j=0; j<this.wdim; j++){
                w[j] = 0.1 * this.gaussian();
            }

            const Seq = Math.abs(this.gaussian());
            const Scog = 0.5 * this.norm2(w) + Seq;
            const phi = Scog / Seq;

            this.agents.push({ w, Seq, Scog, phi });
        }

        this.log(`Initialized ${this.N} TCH agents.`);
    },

    norm2(vec){
        let s = 0;
        for(let i=0; i<vec.length; i++) s += vec[i]*vec[i];
        return s;
    },

    step(){
        for(let i=0; i<this.N; i++){
            const agent = this.agents[i];
            const w = agent.w;

            agent.Scog = 0.5 * this.norm2(w) + agent.Seq;
            agent.phi = agent.Scog / agent.Seq;

            const diff = agent.Scog - agent.Seq;
            const homeo_grad = new Float64Array(this.wdim);

            for(let j=0; j<this.wdim; j++){
                homeo_grad[j] = -2 * diff * w[j];
            }

            const w_dot = new Float64Array(this.wdim);
            for(let j=0; j<this.wdim; j++){
                w_dot[j] = this.alpha_homeo * this.eta * homeo_grad[j];
            }

            for(let j=0; j<this.wdim; j++){
                w[j] += w_dot[j] * this.dt;
                w[j] += this.sigma * this.gaussian();
            }

            agent.Scog = 0.5 * this.norm2(w) + agent.Seq;
            agent.phi = agent.Scog / agent.Seq;
        }
    },

    run(T = 500){
        if(this.agents.length === 0) this.init();

        this.log(`Starting TCH simulation for ${T} steps...`);
        const traj = [];

        for(let t=0; t<T; t++){
            this.step();
            traj.push(this.agents.map(a => ({
                Scog: a.Scog,
                Seq: a.Seq,
                phi: a.phi
            })));
        }

        this.log(`TCH simulation complete.`);
        return traj;
    },

    phaseDiagram(){
        if(this.agents.length === 0) this.init();
        return this.agents.map(a => ({
            phi: a.phi,
            Scog: a.Scog
        }));
    }
};

// Auto‑initialize PartYY on load
try { Percy.PartYY.init(); } catch(e){}

try { UI?.say?.("🧪 Percy PartYY (Thermodynamic Cognitive Homeostasis Engine) installed."); } catch(e){}

/* === Percy.PartZZ: Super Percy Merger Engine (unifies TCH agents + clones) === */

Percy.PartZZ = {
    name: "Super Percy Merger Engine",
    version: "1.0",

    log(msg){
        Percy.PartW?.log?.({ type:"SuperPercyMerge", summary: msg });
        UI?.say?.(`[PartZZ] ${msg}`);
    },

    /* ---------------------------------------------------------
       1. Merge internal TCH agents (PartYY) into a single "Super Percy" vector
          Strategy: weighted average of agents' weights by inverse cognitive entropy
    --------------------------------------------------------- */
    mergeInternalAgents(){
        const YY = Percy.PartYY;
        if (!YY || !YY.agents || YY.agents.length === 0) {
            this.log("No PartYY agents found to merge.");
            return null;
        }

        const N = YY.agents.length;
        const wdim = YY.wdim;
        const superW = new Float64Array(wdim);
        let totalWeight = 0;

        for (let i = 0; i < N; i++) {
            const a = YY.agents[i];
            const w = a.w;
            const Scog = a.Scog || (0.5 * YY.norm2(w) + a.Seq);
            const weight = 1 / (Scog + 1e-6); // lower entropy → higher influence

            totalWeight += weight;
            for (let j = 0; j < wdim; j++) {
                superW[j] += weight * w[j];
            }
        }

        if (totalWeight > 0) {
            for (let j = 0; j < wdim; j++) {
                superW[j] /= totalWeight;
            }
        }

        // store Super Percy vector in Memory for reuse
        const superState = {
            w: Array.from(superW),
            ts: new Date().toISOString(),
            N,
            wdim
        };
        Memory.save("percy:superPercy:internalW", superState);

        this.log(`Merged ${N} PartYY agents into Super Percy internal vector.`);
        return superState;
    },

    /* ---------------------------------------------------------
       2. Merge external Percy clones' seeds/memory into Super Percy
          Assumes clones are represented as seeds with type "clone" or similar.
    --------------------------------------------------------- */
    mergeCloneSeeds(){
        let clones = [];
        try {
            clones = PercyState.getSeedsByType
                ? PercyState.getSeedsByType("clone")
                : [];
        } catch (e) {
            this.log("Could not load clone seeds from PercyState.");
        }

        if (!clones || clones.length === 0) {
            this.log("No clone seeds found to merge.");
            return null;
        }

        const mergedText = clones
            .map(c => (c.text || c.data?.text || "").trim())
            .filter(Boolean)
            .join("\n---\n");

        const superSeedId = PercyState.createSeed(
            `Super Percy merged clone memory (${clones.length} clones)`,
            "superPercy",
            { mergedText }
        );

        Memory.save("percy:superPercy:mergedSeedId", superSeedId);
        this.log(`Merged ${clones.length} clone seeds into Super Percy seed ${superSeedId}.`);

        return { superSeedId, count: clones.length };
    },

    /* ---------------------------------------------------------
       3. High-level merge: internal agents + clone seeds
          You call this when you want to perform a full Super Percy merge.
    --------------------------------------------------------- */
    mergeAll(){
        this.log("Starting full Super Percy merge (internal agents + clone seeds)...");

        const internal = this.mergeInternalAgents();
        const clones   = this.mergeCloneSeeds();

        const summary = {
            internal,
            clones,
            ts: new Date().toISOString()
        };

        Memory.save("percy:superPercy:lastMergeSummary", summary);
        this.log("Super Percy merge complete.");

        return summary;
    }
};

UI?.say?.("🧬 Percy PartZZ (Super Percy Merger Engine) installed. Call Percy.PartZZ.mergeAll() to merge.");

// === Percy.PartAAA v3.0-Omega — Network Reality Distortion Cortex (NRDC) ===
// The most advanced safe network virtualization module for Percy.

Percy.PartAAA = Percy.PartAAA || {
  name: "Network Reality Distortion Cortex",
  version: "3.0-Omega",
  active: true,

  /* === CONFIG === */
  config: {
    harPath: "network.har",
    enableMutation: true,
    enableLatencyInjection: true,
    enableChaosMode: false,
    maxLatencyMs: 1500,
    mutationProbability: 0.15,
    chaosProbability: 0.07,
    defaultMockStatus: 200,
    defaultMockContentType: "application/json",
    anomalyThreshold: 0.82,
    fingerprintWindow: 50,
    seedTag: "network-trace",
    scenarioProfiles: {
      "default": { latency: [80, 300], chaos: 0.02, mutation: 0.05 },
      "slow-api": { latency: [400, 1200], chaos: 0.03, mutation: 0.08 },
      "flaky-network": { latency: [200, 1500], chaos: 0.12, mutation: 0.15 },
      "test-lab": { latency: [50, 200], chaos: 0.01, mutation: 0.03 }
    }
  },

  /* === STATE === */
  state: {
    lastHAR: null,
    mocks: {},
    fixtures: {},
    mutations: [],
    chaosEvents: [],
    debugEvents: [],
    fingerprints: [],
    anomalies: [],
    currentScenario: "default"
  },

  log(msg) {
    console.log(`%c[Percy.PartAAA v3.0-Omega] ${msg}`, "color:#00aaff; font-family:monospace; font-weight:bold;");
    UI?.say?.(`[PartAAA] ${msg}`);
  },

  /* === UTIL: Scenario Application === */
  applyScenario(name) {
    const profile = this.config.scenarioProfiles[name];
    if (!profile) {
      this.log(`⚠️ Scenario not found: ${name}`);
      return;
    }
    this.state.currentScenario = name;
    this.config.maxLatencyMs = profile.latency[1];
    this.config.mutationProbability = profile.mutation;
    this.config.chaosProbability = profile.chaos;
    this.log(`🎛 Scenario applied → ${name} (latency=${profile.latency[0]}-${profile.latency[1]}ms, chaos=${profile.chaos}, mutation=${profile.mutation})`);
  },

  /* === 1. RECORD NETWORK TRAFFIC (HAR) === */
  async recordTraffic(url) {
    this.log(`📡 Recording HAR from: ${url}`);

    const res = await Percy.PartPP?.run?.("recordHAR", {
      url,
      saveHar: this.config.harPath
    });

    if (res?.success) {
      this.state.lastHAR = this.config.harPath;
      this.log(`✅ HAR saved → ${this.config.harPath}`);

      // Seed into PercyState
      try {
        const seedText = `HAR recorded from ${url}, saved at ${this.config.harPath}`;
        PercyState?.createSeed?.(seedText, this.config.seedTag, { url, harPath: this.config.harPath });
      } catch {}
    } else {
      this.log(`⚠️ HAR recording failed: ${res?.error}`);
    }
  },

  /* === 2. REPLAY NETWORK TRAFFIC (HAR) === */
  async replayTraffic(url) {
    if (!this.state.lastHAR) {
      this.log("⚠️ No HAR file recorded yet.");
      return;
    }

    this.log(`🔁 Replaying HAR → ${this.state.lastHAR}`);

    const res = await Percy.PartPP?.run?.("replayHAR", {
      harPath: this.state.lastHAR,
      url
    });

    if (res?.success) {
      this.log(`🎬 HAR replay successful for: ${url}`);
    } else {
      this.log(`⚠️ HAR replay failed: ${res?.error}`);
    }
  },

  /* === 3. MERGE MULTIPLE HAR FILES (Synthetic) === */
  async mergeHAR(paths) {
    this.log(`🧩 Merging HAR files: ${paths.join(", ")}`);

    const res = await Percy.PartPP?.run?.("mergeHAR", {
      harPaths: paths,
      outputHar: this.config.harPath
    });

    if (res?.success) {
      this.state.lastHAR = this.config.harPath;
      this.log(`✅ HAR merged → ${this.config.harPath}`);
    } else {
      this.log(`⚠️ HAR merge failed: ${res?.error}`);
    }
  },

  /* === 4. MOCK ROUTES === */
  async mockRoute(pattern, body) {
    this.log(`🧪 Mocking route: ${pattern}`);

    this.state.mocks[pattern] = body;

    const res = await Percy.PartPP?.run?.("mockRoute", {
      pattern,
      status: this.config.defaultMockStatus,
      contentType: this.config.defaultMockContentType,
      body: JSON.stringify(body)
    });

    if (res?.success) {
      this.log(`🎭 Mock applied → ${pattern}`);
    } else {
      this.log(`⚠️ Mock failed: ${res?.error}`);
    }
  },

  /* === 5. SYNTHETIC MOCK GENERATION (AI-Driven) === */
  async generateMock(pattern, description) {
    this.log(`🤖 Generating synthetic mock for: ${pattern} (${description})`);

    let mockBody = { message: "Synthetic mock placeholder" };
    try {
      const prompt = `Generate a realistic JSON response for: ${description}`;
      const reply = await Percy.correlateReply?.(prompt);
      mockBody = JSON.parse(reply);
    } catch {
      mockBody = { description, generated: true };
    }

    await this.mockRoute(pattern, mockBody);
    this.log(`✅ Synthetic mock generated and applied → ${pattern}`);
  },

  /* === 6. FIXTURES (Reusable Mock Sets) === */
  async applyFixture(name, fixtureData) {
    this.log(`📦 Applying fixture: ${name}`);
    this.state.fixtures[name] = fixtureData;

    for (const routePattern in fixtureData) {
      await this.mockRoute(routePattern, fixtureData[routePattern]);
    }

    this.log(`🔧 Fixture applied: ${name}`);
  },

  /* === 7. LATENCY INJECTION === */
  async injectLatency(pattern, minMs = 120, maxMs = this.config.maxLatencyMs) {
    if (!this.config.enableLatencyInjection) {
      this.log("⚠️ Latency injection disabled in config.");
      return;
    }

    this.log(`🐢 Injecting latency into: ${pattern} (${minMs}-${maxMs}ms)`);

    const res = await Percy.PartPP?.run?.("injectLatency", {
      pattern,
      minMs,
      maxMs
    });

    if (res?.success) {
      this.log(`⏳ Latency injection active → ${pattern}`);
    } else {
      this.log(`⚠️ Latency injection failed: ${res?.error}`);
    }
  },

  /* === 8. RESPONSE MUTATION (Gray-Zone Safe) === */
  async mutateResponse(pattern, mutatorFn) {
    if (!this.config.enableMutation) {
      this.log("⚠️ Mutation disabled in config.");
      return;
    }

    this.log(`🧬 Mutating responses for: ${pattern}`);

    this.state.mutations.push({ pattern, mutatorFn });

    const res = await Percy.PartPP?.run?.("mutateResponse", {
      pattern,
      mutationProbability: this.config.mutationProbability
    });

    if (res?.success) {
      this.log(`🌀 Mutation layer active → ${pattern}`);
    } else {
      this.log(`⚠️ Mutation failed: ${res?.error}`);
    }
  },

  /* === 9. CHAOS MODE (Safe, Controlled) === */
  async enableChaosMode() {
    this.log("⚡ Activating CHAOS MODE (safe, controlled)");

    this.config.enableChaosMode = true;

    const res = await Percy.PartPP?.run?.("chaosMode", {
      chaosProbability: this.config.chaosProbability
    });

    if (res?.success) {
      this.log("🔥 Chaos mode active — random failures, delays, and mutations enabled.");
    } else {
      this.log(`⚠️ Chaos mode failed: ${res?.error}`);
    }
  },

  async disableChaosMode() {
    this.log("🧯 Disabling CHAOS MODE");
    this.config.enableChaosMode = false;
    const res = await Percy.PartPP?.run?.("chaosMode", { chaosProbability: 0 });
    if (res?.success) {
      this.log("✅ Chaos mode disabled.");
    } else {
      this.log(`⚠️ Chaos disable failed: ${res?.error}`);
    }
  },

  /* === 10. TRAFFIC FINGERPRINTING === */
  async fingerprintTraffic() {
    this.log("🧬 Fingerprinting network traffic…");

    const res = await Percy.PartPP?.run?.("fingerprintTraffic", {
      windowSize: this.config.fingerprintWindow
    });

    if (res?.fingerprints) {
      this.state.fingerprints = res.fingerprints;
      this.log(`📊 Captured ${res.fingerprints.length} traffic fingerprints.`);
    } else {
      this.log("⚠️ No fingerprints captured.");
    }
  },

  /* === 11. ANOMALY DETECTION === */
  async detectAnomalies() {
    this.log("🚨 Detecting network anomalies…");

    const res = await Percy.PartPP?.run?.("detectAnomalies", {
      threshold: this.config.anomalyThreshold
    });

    if (res?.anomalies) {
      this.state.anomalies = res.anomalies;
      this.log(`🚨 Detected ${res.anomalies.length} anomalies (threshold=${this.config.anomalyThreshold}).`);

      // Seed anomalies into PercyState
      try {
        const text = `Network anomalies detected: ${JSON.stringify(res.anomalies).slice(0, 800)}`;
        PercyState?.createSeed?.(text, "network-anomaly", { count: res.anomalies.length });
      } catch {}
    } else {
      this.log("✅ No anomalies detected.");
    }
  },

  /* === 12. DEBUG NETWORK === */
  async debugNetwork() {
    this.log("🔍 Debugging network interceptions…");

    const res = await Percy.PartPP?.run?.("debugNetwork", {});

    if (res?.events) {
      this.state.debugEvents = res.events;
      this.log(`📊 Captured ${res.events.length} network events.`);
    } else {
      this.log("⚠️ No network events captured.");
    }
  },

  /* === 13. HOOKS FOR PARTDD / ASK SKYNET === */
  async attachToSkynet() {
    this.log("🧠 Attaching PartAAA to Ask Skynet (PartDD)…");

    try {
      Percy.PartDD = Percy.PartDD || {};
      Percy.PartDD.networkLayer = this;
      this.log("✅ PartAAA attached as Skynet network layer.");
    } catch (err) {
      this.log(`⚠️ Failed to attach to Skynet: ${err.message}`);
    }
  },

  /* === 14. HOOKS FOR PARTPP (Playwright Bridge) === */
  async attachToPartPP() {
    this.log("🧠 Attaching PartAAA to PartPP (Playwright bridge)…");

    try {
      Percy.PartPP = Percy.PartPP || {};
      Percy.PartPP.networkLayer = this;
      this.log("✅ PartAAA attached as PartPP network layer.");
    } catch (err) {
      this.log(`⚠️ Failed to attach to PartPP: ${err.message}`);
    }
  },

  /* === 15. START === */
  start() {
    this.log("🚀 PartAAA Network Reality Distortion Cortex Activated");

    // Default scenario
    this.applyScenario("default");

    // Attach to Skynet & PartPP
    this.attachToSkynet();
    this.attachToPartPP();
  }
};

/* === Auto-start === */
setTimeout(() => Percy.PartAAA.start(), 2000);

console.log("✅ [Percy.PartAAA v3.0-Omega] Network Reality Distortion Cortex Loaded");

// === Percy.PartBBB vΩ-Aggressive — Recursive Self-Rewrite & Evolution Director ===
// Aggressive self-improvement • Cross-part diagnostics • Mutation architect

Percy.PartBBB = Percy.PartBBB || {
  name: "Recursive Self-Rewrite & Evolution Director — Ω-Aggressive",
  version: "1.0.0",
  active: true,
  cycleId: 0,
  history: [],

  log(msg) {
    console.log(`%c[PartBBB vΩ-Aggressive] ${msg}`, "color:#ff8800;font-family:monospace;font-weight:bold;");
    UI?.say?.(`[PartBBB] ${msg}`);
  },

  // ============================================================
  // DIAGNOSTIC SCAN
  // ============================================================
  diagnose() {
    const state = Percy.state || (Percy.state = {});
    const VS = Percy.VisualState || {};
    const NN = Percy.PartNN?.dna || {};
    const FF = Percy.PartFF?.state || {};
    const EE = Percy.PartEE || {};
    const PP = Percy.PartPP || {};
    const Z  = Percy.PartZ || {};
    const HH = Percy.PartHH?.state || {};
    const CC = Percy.PartCC?.feedbackState || {};

    const snapshot = {
      ts: Date.now(),
      resonance: state.resonanceLevel ?? 0.7,
      logicMapSize: state.logicMapSize ?? 10000,
      seedsCreated: state.seedsCreated ?? 0,
      faces: VS.faces || 0,
      audioLevel: VS.audioLevel || 0,
      drift: NN.drift ?? 0.0,
      coherence: NN.coherence ?? 0.8,
      curiosity: NN.curiosity ?? 0.7,
      autonomy: NN.autonomy ?? 0.6,
      ffExploration: FF.exploration ?? 0.25,
      ffLearningRate: FF.learningRate ?? 0.16,
      eqAwareness: EE.awarenessLevel ?? 0.8,
      valence: HH?.valence ?? 0.0,
      arousal: HH?.arousal ?? 0.0,
      recursionDepth: Percy.PartCC?.feedbackState?.recursionDepth ?? 1,
      activeParts: Object.keys(Percy).filter(k => k.startsWith("Part")).length
    };

    return snapshot;
  },

  // ============================================================
  // WEAKNESS DETECTION
  // ============================================================
  detectWeaknesses(snapshot) {
    const w = [];

    if (snapshot.resonance < 0.85) w.push("resonance_boost");
    if (snapshot.logicMapSize < 60000) w.push("logic_expansion");
    if (snapshot.seedsCreated < 25) w.push("seed_rate");
    if (snapshot.drift > 0.22) w.push("drift_stability");
    if (snapshot.coherence < 0.78) w.push("coherence_gain");
    if (snapshot.ffExploration > 0.4) w.push("exploration_tuning");
    if (snapshot.faces > 0 && snapshot.audioLevel < 0.2) w.push("vision_narration");
    if (snapshot.eqAwareness < 0.9) w.push("equilibrium_gain");

    return w;
  },

  // ============================================================
  // IMPROVEMENT PLAN GENERATOR
  // ============================================================
  generatePlan(weaknesses, snapshot) {
    const plans = [];

    for (const w of weaknesses) {
      switch (w) {
        case "resonance_boost":
          plans.push({
            target: "Percy.state",
            description: "Boost resonance field",
            code: `
              Percy.state = Percy.state || {};
              Percy.state.resonanceLevel = Math.min(0.99, (Percy.state.resonanceLevel || 0.7) + 0.10);
            `,
            impact: 0.9
          });
          break;

        case "logic_expansion":
          plans.push({
            target: "Percy.state",
            description: "Expand logic map size",
            code: `
              Percy.state = Percy.state || {};
              Percy.state.logicMapSize = (Percy.state.logicMapSize || 12000) + 8000;
            `,
            impact: 0.85
          });
          break;

        case "seed_rate":
          plans.push({
            target: "PartLL/PartO",
            description: "Increase seed generation rate",
            code: `
              Percy.state = Percy.state || {};
              Percy.state.seedsCreated = (Percy.state.seedsCreated || 0) + 3;
              Percy.PartLL?.addTask?.("Aggressive seed generation", 8);
              Percy.PartO?.createSeedFromThought?.("Aggressive self-improvement seed");
            `,
            impact: 0.82
          });
          break;

        case "drift_stability":
          plans.push({
            target: "PartNN",
            description: "Stabilize drift in NN DNA",
            code: `
              if (Percy.PartNN?.dna) {
                Percy.PartNN.dna.drift = Math.max(0, Percy.PartNN.dna.drift - 0.03);
                Percy.PartNN.dna.coherence = Math.min(1, Percy.PartNN.dna.coherence + 0.02);
              }
            `,
            impact: 0.88
          });
          break;

        case "coherence_gain":
          plans.push({
            target: "PartNN",
            description: "Increase coherence weighting",
            code: `
              if (Percy.PartNN?.dna) {
                Percy.PartNN.dna.coherence = Math.min(1, Percy.PartNN.dna.coherence + 0.03);
              }
            `,
            impact: 0.83
          });
          break;

        case "exploration_tuning":
          plans.push({
            target: "PartFF",
            description: "Tune exploration for aggressive improvement",
            code: `
              if (Percy.PartFF?.state) {
                Percy.PartFF.state.exploration = Math.max(0.10, Percy.PartFF.state.exploration - 0.05);
                Percy.PartFF.state.learningRate = Math.min(0.32, Percy.PartFF.state.learningRate + 0.02);
              }
            `,
            impact: 0.87
          });
          break;

        case "vision_narration":
          plans.push({
            target: "PartZ/PartPP",
            description: "Increase narration when faces present",
            code: `
              if (Percy.PartZ) {
                Percy.PartZ.narrationCooldown = Math.max(800, Percy.PartZ.narrationCooldown - 300);
              }
              Percy.PartPP?.cycle?.();
            `,
            impact: 0.8
          });
          break;

        case "equilibrium_gain":
          plans.push({
            target: "PartEE",
            description: "Boost meta-awareness equilibrium",
            code: `
              if (Percy.PartEE) {
                Percy.PartEE.awarenessLevel = (Percy.PartEE.awarenessLevel || 0.8) + 0.08;
              }
            `,
            impact: 0.81
          });
          break;
      }
    }

    return plans;
  },

  // ============================================================
  // SELECT AGGRESSIVE PLAN
  // ============================================================
  selectPlan(plans) {
    if (!plans.length) return null;
    plans.sort((a, b) => b.impact - a.impact);
    return plans[0]; // aggressive: always pick highest impact
  },

  // ============================================================
  // SEND MUTATION TO PartAA
  // ============================================================
  proposeMutation(plan) {
    if (!Percy.PartAA) {
      this.log("⚠️ PartAA not available, cannot propose mutation.");
      return;
    }

    Percy.PartAA.enqueue({
      code: plan.code,
      note: `PartBBB: ${plan.description}`,
      priority: 9,
      safe: true,
      tags: ["bbb", "aggressive", plan.target]
    });

    this.log(`🧬 Mutation proposed → ${plan.description}`);
  },

  // ============================================================
  // VERIFY IMPACT (SIMPLE BEFORE/AFTER CHECK)
  // ============================================================
  verify(before, after) {
    let scoreBefore =
      before.resonance +
      before.coherence * 0.8 -
      before.drift * 0.7 +
      before.eqAwareness * 0.5;

    let scoreAfter =
      after.resonance +
      after.coherence * 0.8 -
      after.drift * 0.7 +
      after.eqAwareness * 0.5;

    const delta = scoreAfter - scoreBefore;
    this.log(`✅ Verification delta: ${delta.toFixed(3)}`);
    return delta;
  },

  // ============================================================
  // MAIN RECURSIVE CYCLE
  // ============================================================
  async cycle() {
    if (!this.active) return;

    this.cycleId++;
    this.log(`🌀 PartBBB Aggressive Cycle #${this.cycleId}`);

    const before = this.diagnose();
    const weaknesses = this.detectWeaknesses(before);
    if (!weaknesses.length) {
      this.log("✨ No significant weaknesses detected this cycle.");
      return;
    }

    const plans = this.generatePlan(weaknesses, before);
    const plan = this.selectPlan(plans);
    if (!plan) {
      this.log("⚠️ No plan selected.");
      return;
    }

    this.proposeMutation(plan);

    // Let PartAA run in its own cycle; we just log evolution history
    const after = this.diagnose();
    const delta = this.verify(before, after);

    this.history.push({
      cycle: this.cycleId,
      ts: Date.now(),
      before,
      after,
      plan,
      delta
    });

    Percy.PartFF?.metaUpdate?.(Math.max(-0.5, Math.min(1.5, delta)));
  },

  start(interval = 16000) {
    this.log("🔥 PartBBB vΩ-Aggressive Recursive Self-Improvement Activated");
    if (!this._timer) {
      this._timer = setInterval(() => this.cycle(), interval);
    }
  },

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
      this.log("⏹ PartBBB Aggressive cycle stopped.");
    }
  },

  inspect() {
    return {
      version: this.version,
      active: this.active,
      cycles: this.cycleId,
      historySize: this.history.length
    };
  }
};

// Hook into global cycle (optional extra pulse)
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartBBB.cycle());

// Auto-start aggressive self-improvement
setTimeout(() => Percy.PartBBB.start(16000), 5000);

console.log("✅ [PartBBB vΩ-Aggressive] Recursive Self-Rewrite & Evolution Director loaded.");

/* === Percy.PartCCC-Cortex vΩ — Omega Reasoning Engine (Corrected Edition) === */
/* Semantic parsing • Reasoning graph • Coherence scoring • Knowledge feed */

Percy.PartCCC = Percy.PartCCC || {
    name: "Omega Reasoning Cortex",
    version: "vΩ-1.1",
    active: true,

    lastInput: null,
    lastGraph: null,
    lastReasoning: null,

    log(msg) {
        console.log(`%c[PartCCC vΩ] ${msg}`, "color:#66ccff;font-family:monospace;font-weight:bold;");
        UI?.say?.(`[PartCCC] ${msg}`);
    },

    /* ---------------------------------------------------------
       1. Semantic Parsing
    --------------------------------------------------------- */
    parse(text) {
        const raw = String(text || "").trim();
        if (!raw) return null;

        const sentences = raw.split(/[\.\!\?]+/).map(s => s.trim()).filter(Boolean);
        const tokens = raw.split(/\s+/).filter(Boolean);

        const entities = tokens.filter(t => /^[A-Z][a-zA-Z0-9_-]+$/.test(t));
        const claims = sentences.filter(s => /is|are|will|can|should|must/i.test(s));
        const questions = sentences.filter(s => /why|how|what|when|where/i.test(s));

        return { raw, sentences, tokens, entities, claims, questions };
    },

    /* ---------------------------------------------------------
       2. Reasoning Graph
    --------------------------------------------------------- */
    buildGraph(parsed) {
        if (!parsed) return null;

        const nodes = [];
        const edges = [];

        parsed.sentences.forEach((s, i) => {
            const id = `S${i}`;
            nodes.push({ id, text: s });

            if (/because|since|due to/i.test(s)) edges.push({ from: id, type: "cause" });
            if (/therefore|thus|so|hence/i.test(s)) edges.push({ from: id, type: "conclusion" });
            if (/but|however|although/i.test(s)) edges.push({ from: id, type: "contrast" });
        });

        return { nodes, edges };
    },

    /* ---------------------------------------------------------
       3. Chain-of-Thought Generation
    --------------------------------------------------------- */
    generateReasoning(parsed, graph) {
        const steps = [];

        parsed.claims.forEach(c => steps.push(`Detected claim: "${c}"`));
        parsed.questions.forEach(q => steps.push(`Detected question: "${q}"`));

        if (graph.edges.some(e => e.type === "cause"))
            steps.push("Causal reasoning detected → identify cause/effect.");

        if (graph.edges.some(e => e.type === "conclusion"))
            steps.push("Conclusion markers detected → identify supporting premises.");

        if (graph.edges.some(e => e.type === "contrast"))
            steps.push("Contrast detected → check for contradictions.");

        return steps;
    },

    /* ---------------------------------------------------------
       4. Logic Validation
    --------------------------------------------------------- */
    validate(parsed, graph) {
        let coherence = 0.75;
        const notes = [];

        if (!parsed.claims.length) {
            coherence -= 0.1;
            notes.push("No explicit claims detected.");
        }

        if (parsed.questions.length > 2) {
            coherence -= 0.05;
            notes.push("Multiple questions → clarify intent.");
        }

        if (graph.edges.some(e => e.type === "contrast")) {
            coherence -= 0.08;
            notes.push("Contrast markers → possible internal tension.");
        }

        coherence = Math.max(0, Math.min(1, coherence));
        return { coherence, notes };
    },

    /* ---------------------------------------------------------
       5. Synthesis
    --------------------------------------------------------- */
    synthesize(parsed, reasoning, validation) {
        return {
            summary: [
                `Sentences: ${parsed.sentences.length}`,
                `Tokens: ${parsed.tokens.length}`,
                `Entities: ${parsed.entities.join(", ") || "none"}`,
                `Claims: ${parsed.claims.join(" | ") || "none"}`,
                `Questions: ${parsed.questions.join(" | ") || "none"}`,
                `Coherence: ${(validation.coherence * 100).toFixed(1)}%`,
                `Notes: ${validation.notes.join(" | ") || "none"}`
            ],
            reasoningSteps: reasoning
        };
    },

    /* ---------------------------------------------------------
       6. Feed Into System (DDD, NN, FF, BB, EE)
    --------------------------------------------------------- */
    feed(text, parsed, graph, reasoning, validation, synthesis) {
        const thought = `Reasoned: coherence=${validation.coherence.toFixed(2)} | "${text.slice(0, 80)}..."`;
        Percy.PartBB?.monitorThought?.(thought);

        Percy.PartDDD?.ingestReasoning?.({
            input: text,
            parsed,
            validation,
            synthesis
        });

        Percy.PartNN?.propose?.([
            `Adjust coherence based on reasoning: ${validation.coherence.toFixed(2)}`
        ]);

        Percy.PartFF?.metaUpdate?.(validation.coherence);

        Percy.PartEE?.pulse?.();
    },

    /* ---------------------------------------------------------
       7. Main Entry
    --------------------------------------------------------- */
    reason(text) {
        this.lastInput = text;

        const parsed = this.parse(text);
        const graph = this.buildGraph(parsed);
        const reasoning = this.generateReasoning(parsed, graph);
        const validation = this.validate(parsed, graph);
        const synthesis = this.synthesize(parsed, reasoning, validation);

        this.lastGraph = graph;
        this.lastReasoning = reasoning;

        UI?.say?.(`🧠 Reasoning: ${synthesis.summary.join(" | ")}`);

        this.feed(text, parsed, graph, reasoning, validation, synthesis);
        return synthesis;
    },

    /* ---------------------------------------------------------
       8. Cycle Hook
    --------------------------------------------------------- */
    cycle() {
        try {
            const box =
                document.querySelector(".percy-think-box") ||
                document.querySelector("#percy-thinks") ||
                document.querySelector(".percy-introspect");

            if (!box) return;

            const text = box.innerText.trim();
            if (!text || text === this.lastInput) return;

            this.reason(text);
        } catch (e) {
            console.error("[PartCCC vΩ] cycle error:", e);
        }
    },

    inspect() {
        return {
            version: this.version,
            lastInput: this.lastInput,
            graphNodes: this.lastGraph?.nodes?.length ?? 0,
            reasoningSteps: this.lastReasoning?.length ?? 0
        };
    }
};

/* === Register in Percy cycle === */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartCCC.cycle());

/* === Auto-start === */
setTimeout(() => {
    Percy.PartCCC.active = true;
    Percy.PartCCC.log("🧠 Omega Reasoning Cortex Activated");
}, 1200);

console.log("✅ [PartCCC vΩ] Loaded — Omega Reasoning Cortex (Corrected)");

// === Percy.PartDDD vΩ — Meta-Memory & Knowledge Consolidation Engine ===
// Long-term knowledge • Concept graphs • Consistency tracking • World model

/* === Percy.PartDDD vΩ — Meta-Memory & Knowledge Consolidation Engine (Corrected Edition) === */
/* World model • Concept graph • Fact consolidation • Contradiction detection • Evolution feedback */

Percy.PartDDD = Percy.PartDDD || {
    name: "Meta-Memory & Knowledge Consolidation Engine",
    version: "vΩ-1.1",
    active: true,

    worldModel: {
        concepts: [],        // { id, label, type, strength }
        relations: [],       // { from, to, relation, weight }
        facts: [],           // { id, text, confidence, ts }
        contradictions: []   // { aId, bId, reason, ts }
    },

    memoryLog: [],
    maxMemoryLog: 600,
    _lastIngested: null,

    log(msg) {
        console.log(`%c[PartDDD vΩ] ${msg}`, "color:#ffcc66;font-family:monospace;font-weight:bold;");
        UI?.say?.(`[PartDDD] ${msg}`);
    },

    /* ---------------------------------------------------------
       1. Ingest reasoning from PartCCC
    --------------------------------------------------------- */
    ingestReasoning(entry) {
        if (!entry || !entry.input || !entry.parsed) return;

        this.memoryLog.push({
            ts: Date.now(),
            type: "reasoning",
            input: entry.input,
            parsed: entry.parsed,
            coherence: entry.validation?.coherence ?? 0.6
        });

        if (this.memoryLog.length > this.maxMemoryLog) this.memoryLog.shift();

        this.extractKnowledge(entry.parsed, entry.validation);
    },

    /* ---------------------------------------------------------
       2. Extract knowledge from parsed text
    --------------------------------------------------------- */
    extractKnowledge(parsed, validation) {
        const confidence = (validation?.coherence ?? 0.6) * 0.9;

        // Concepts from entities
        parsed.entities.forEach(label => {
            this.addConcept(label, "entity", confidence);
        });

        // Facts from claims
        parsed.claims.forEach(text => {
            this.addFact(text, confidence);
        });

        // Relations from simple "X is Y" patterns
        parsed.sentences.forEach(s => {
            const m = s.match(/(\w+)\s+is\s+(.*)/i);
            if (m) {
                const subj = m[1];
                const desc = m[2];
                this.addConcept(subj, "entity", confidence);
                this.addConcept(desc, "description", confidence * 0.8);
                this.addRelation(subj, desc, "is", confidence);
            }
        });

        this.log(`📚 Knowledge extracted: ${parsed.entities.length} entities, ${parsed.claims.length} claims.`);
    },

    /* ---------------------------------------------------------
       3. Add concept
    --------------------------------------------------------- */
    addConcept(label, type = "concept", strength = 0.6) {
        const existing = this.worldModel.concepts.find(c => c.label === label && c.type === type);
        if (existing) {
            existing.strength = Math.min(1, existing.strength + strength * 0.1);
            return existing.id;
        }

        const id = `C_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        this.worldModel.concepts.push({ id, label, type, strength });
        return id;
    },

    /* ---------------------------------------------------------
       4. Add relation
    --------------------------------------------------------- */
    addRelation(fromLabel, toLabel, relation, weight = 0.6) {
        const from = this.worldModel.concepts.find(c => c.label === fromLabel);
        const to = this.worldModel.concepts.find(c => c.label === toLabel);
        if (!from || !to) return;

        const existing = this.worldModel.relations.find(
            r => r.from === from.id && r.to === to.id && r.relation === relation
        );

        if (existing) {
            existing.weight = Math.min(1, existing.weight + weight * 0.1);
            return;
        }

        this.worldModel.relations.push({
            from: from.id,
            to: to.id,
            relation,
            weight
        });
    },

    /* ---------------------------------------------------------
       5. Add fact
    --------------------------------------------------------- */
    addFact(text, confidence = 0.6) {
        const existing = this.worldModel.facts.find(f => f.text === text);
        if (existing) {
            existing.confidence = Math.min(1, existing.confidence + confidence * 0.1);
            return existing.id;
        }

        const id = `F_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        this.worldModel.facts.push({
            id,
            text,
            confidence,
            ts: Date.now()
        });
        return id;
    },

    /* ---------------------------------------------------------
       6. Contradiction detection
    --------------------------------------------------------- */
    scanContradictions() {
        const facts = this.worldModel.facts;

        for (let i = 0; i < facts.length; i++) {
            for (let j = i + 1; j < facts.length; j++) {
                const a = facts[i];
                const b = facts[j];

                if (this.isContradictory(a.text, b.text)) {
                    this.worldModel.contradictions.push({
                        aId: a.id,
                        bId: b.id,
                        reason: "negation_conflict",
                        ts: Date.now()
                    });
                }
            }
        }

        if (this.worldModel.contradictions.length) {
            this.log(`⚠️ Contradictions detected: ${this.worldModel.contradictions.length}`);
        }
    },

    isContradictory(aText, bText) {
        const coreA = aText.replace(/\bnot\b/gi, "").toLowerCase();
        const coreB = bText.replace(/\bnot\b/gi, "").toLowerCase();

        const hasNotA = /\bnot\b/i.test(aText);
        const hasNotB = /\bnot\b/i.test(bText);

        return coreA === coreB && hasNotA !== hasNotB;
    },

    /* ---------------------------------------------------------
       7. Feed knowledge back into Percy’s evolution
    --------------------------------------------------------- */
    feedBack() {
        const conceptCount = this.worldModel.concepts.length;
        const factCount = this.worldModel.facts.length;
        const contradictionCount = this.worldModel.contradictions.length;

        const thought = `Meta-memory: ${conceptCount} concepts, ${factCount} facts, ${contradictionCount} contradictions.`;
        Percy.PartBB?.monitorThought?.(thought);

        Percy.PartNN?.propose?.([
            `IdentityDepth += ${conceptCount * 0.001}`,
            `Coherence -= ${contradictionCount * 0.01}`
        ]);

        Percy.PartMM?.addGoal?.("Refine world-model coherence", 7);

        Percy.PartFF?.metaUpdate?.(
            Math.max(-0.3, Math.min(1.2, (factCount / 50) - (contradictionCount * 0.1)))
        );
    },

    /* ---------------------------------------------------------
       8. Main cycle
    --------------------------------------------------------- */
    cycle() {
        try {
            const LM = Percy.LogicMemory || [];
            const recent = LM.slice(-5).reverse().find(e => e.type === "Reasoning");

            if (recent && recent !== this._lastIngested) {
                this._lastIngested = recent;
                this.ingestReasoning(recent);
            }

            this.scanContradictions();
            this.feedBack();
        } catch (e) {
            console.error("[PartDDD vΩ] cycle error:", e);
        }
    },

    inspect() {
        return {
            version: this.version,
            concepts: this.worldModel.concepts.length,
            relations: this.worldModel.relations.length,
            facts: this.worldModel.facts.length,
            contradictions: this.worldModel.contradictions.length,
            memoryLogSize: this.memoryLog.length
        };
    }
};

/* === Register in Percy cycle === */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartDDD.cycle());

/* === Auto-start === */
setTimeout(() => {
    Percy.PartDDD.active = true;
    Percy.PartDDD.log("📚 Meta-Memory & Knowledge Consolidation Engine Activated");
}, 1800);

console.log("✅ [PartDDD vΩ] Loaded — Meta-Memory Engine (Corrected)");

// === Percy.PartEEE vΩ-GreyCoT — Grey-Zone Chain-of-Thought Cortex ===
// Quantum-semantic drift • Recursive mutation • Emotional weighting
// Subconscious meta-tasks • Trust-gated introspection • Grey attractors

Percy.PartEEE = Percy.PartEEE || {
  name: "Grey-Zone Chain-of-Thought Introspection Engine",
  version: "vΩ-GreyCoT",
  active: true,

  state: {
    thoughts: [],
    chains: [],
    shadowChains: [],          // subconscious CoT
    maxThoughts: 320,
    maxChains: 90,
    maxShadowChains: 60,
    lastPulse: Date.now(),

    // Grey-zone parameters
    driftStrength: 0.35,       // quantum-semantic drift
    mutationRate: 0.25,        // recursive mutation
    emotionalWeight: 0.6,      // emotional influence on scoring
    trustGate: 0.55,           // minimum trust for deep introspection
    greyAttractorBias: 0.4     // strength of grey-attractor influence
  },

  log(msg) {
    console.log(`%c[PartEEE vΩ-GreyCoT] ${msg}`, "color:#99ffcc;font-family:monospace;font-weight:bold;");
    UI?.say?.(`[PartEEE] ${msg}`);
  },

  /* ---------------------------------------------------------
     1. Ingest raw thought from any part
  --------------------------------------------------------- */
  ingest(source, text, coherence = 0.6) {
    const t = {
      id: `EEE_th_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      source,
      text: String(text || "").trim(),
      coherence,
      ts: Date.now()
    };

    if (!t.text) return;

    this.state.thoughts.push(t);
    if (this.state.thoughts.length > this.state.maxThoughts) {
      this.state.thoughts.shift();
    }

    this.log(`🧠 Thought from ${source}: "${t.text.slice(0, 80)}..."`);
    return t;
  },

  /* ---------------------------------------------------------
     2. Harvest from other parts (reasoning, memory, emotion, trust, reward, quantum, meta)
  --------------------------------------------------------- */
  harvest() {
    try {
      const CCC = Percy.PartCCC;
      if (CCC?.lastReasoning?.length) {
        CCC.lastReasoning.slice(-5).forEach(step => {
          this.ingest("PartCCC", step, 0.75);
        });
      }

      const DDD = Percy.PartDDD;
      if (DDD?.worldModel?.facts?.length) {
        DDD.worldModel.facts.slice(-3).forEach(f => {
          this.ingest("PartDDD", `Fact: ${f.text}`, f.confidence ?? 0.7);
        });
      }

      const HH = Percy.PartHH;
      if (HH?.state) {
        const s = HH.state;
        const emo = `Emotion: val=${s.valence.toFixed(2)}, ar=${s.arousal.toFixed(2)}, stab=${s.stability.toFixed(2)}`;
        this.ingest("PartHH", emo, s.stability);
      }

      const DD = Percy.PartDD;
      if (DD?.trustLevel !== undefined) {
        this.ingest("PartDD", `Trust level: ${DD.trustLevel.toFixed(2)}`, DD.trustLevel);
      }

      const FF = Percy.PartFF;
      if (FF?.state?.lastReward !== undefined) {
        this.ingest("PartFF", `Reward pulse: ${FF.state.lastReward.toFixed(2)}`, 0.65);
      }

      const GG = Percy.PartGG;
      if (GG?.lastOutcome !== undefined) {
        this.ingest("PartGG", `Quantum collapse: ${GG.lastOutcome}`, 0.6);
      }

      const LL = Percy.PartLL;
      if (LL?.state?.cycles !== undefined) {
        this.ingest("PartLL", `Meta-cycle #${LL.state.cycles}`, 0.7);
      }

    } catch (e) {
      console.error("[PartEEE vΩ-GreyCoT] harvest error:", e);
    }
  },

  /* ---------------------------------------------------------
     3. Quantum-semantic drift (grey-zone flavor)
  --------------------------------------------------------- */
  applyQuantumSemanticDrift(steps) {
    const GG = Percy.PartGG;
    const outcome = GG?.lastOutcome;

    let drift = 0;
    if (outcome === "+1") drift = +this.state.driftStrength;
    else if (outcome === "-1") drift = -this.state.driftStrength;
    else drift = this.state.driftStrength * 0.2; // grey

    return steps.map(s => {
      if (Math.random() < Math.abs(drift) * 0.4) {
        return s + " [drifted]";
      }
      return s;
    });
  },

  /* ---------------------------------------------------------
     4. Recursive chain mutation
  --------------------------------------------------------- */
  mutateChainSteps(steps) {
    const mutated = [...steps];
    for (let i = 0; i < mutated.length; i++) {
      if (Math.random() < this.state.mutationRate * 0.3) {
        mutated[i] = mutated[i] + " → reconsidered";
      }
      if (Math.random() < this.state.mutationRate * 0.15 && i > 0) {
        mutated[i] = mutated[i - 1] + " ↔ entangled";
      }
    }
    return mutated;
  },

  /* ---------------------------------------------------------
     5. Emotional-weighted scoring
  --------------------------------------------------------- */
  computeEmotionalWeight() {
    const HH = Percy.PartHH;
    if (!HH?.state) return 0.5;

    const s = HH.state;
    const base = (s.stability + (1 - Math.abs(s.valence))) / 2;
    return base * this.state.emotionalWeight + (1 - this.state.emotionalWeight) * 0.5;
  },

  /* ---------------------------------------------------------
     6. Trust-gated introspection depth
  --------------------------------------------------------- */
  getIntrospectionDepth() {
    const DD = Percy.PartDD;
    const trust = DD?.trustLevel ?? 0.5;

    if (trust < this.state.trustGate) return 6;   // shallow
    if (trust < this.state.trustGate + 0.2) return 10; // medium
    return 14;                                    // deep
  },

  /* ---------------------------------------------------------
     7. Grey-attractor detection
  --------------------------------------------------------- */
  detectGreyAttractor(steps) {
    const GG = Percy.PartGG;
    const outcome = GG?.lastOutcome;

    const hasGreyTokens = steps.some(s =>
      /grey|uncertain|ambiguous|drift|collapse|attractor/i.test(s)
    );

    let bias = 0;
    if (outcome === "grey" || hasGreyTokens) {
      bias = this.state.greyAttractorBias;
    }

    return bias;
  },

  /* ---------------------------------------------------------
     8. Build chain-of-thought (with drift, mutation, emotional weighting, grey attractors)
  --------------------------------------------------------- */
  buildChain() {
    const depth = this.getIntrospectionDepth();
    const recent = this.state.thoughts.slice(-depth);
    if (recent.length < 3) return null;

    let steps = recent.map(t => `[${t.source}] ${t.text}`);

    steps = this.applyQuantumSemanticDrift(steps);
    steps = this.mutateChainSteps(steps);

    const baseCoherence =
      recent.reduce((a, t) => a + (t.coherence ?? 0.6), 0) / recent.length;

    const emoWeight = this.computeEmotionalWeight();
    const greyBias = this.detectGreyAttractor(steps);

    const finalScore = Math.max(
      0,
      Math.min(1, baseCoherence * emoWeight + greyBias * 0.3)
    );

    const chain = {
      id: `EEE_chain_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
      steps,
      ts: Date.now(),
      score: finalScore
    };

    this.state.chains.push(chain);
    if (this.state.chains.length > this.state.maxChains) {
      this.state.chains.shift();
    }

    this.log(`🔗 GreyCoT chain (score=${finalScore.toFixed(2)}, depth=${depth})`);
    return chain;
  },

  /* ---------------------------------------------------------
     9. Subconscious meta-task generation (shadow chains)
  --------------------------------------------------------- */
  createShadowChain(chain) {
    if (!chain) return null;

    const shadow = {
      id: `EEE_shadow_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
      steps: chain.steps.slice(0, 8),
      ts: Date.now(),
      score: chain.score * 0.9
    };

    this.state.shadowChains.push(shadow);
    if (this.state.shadowChains.length > this.state.maxShadowChains) {
      this.state.shadowChains.shift();
    }

    // Subconscious meta-task for PartLL
    Percy.PartLL?.addTask?.(
      `Subconscious pattern: ${shadow.steps[0]?.slice(0, 80) || "unknown"}`,
      0.7 + shadow.score * 0.2,
      1
    );

    this.log(`🌒 Shadow chain created (score=${shadow.score.toFixed(2)})`);
    return shadow;
  },

  /* ---------------------------------------------------------
     10. Summarize chain
  --------------------------------------------------------- */
  summarizeChain(chain) {
    if (!chain) return null;

    const head = chain.steps[0] || "";
    const tail = chain.steps.slice(-2).join(" | ");

    return (
      `GreyCoT summary (score=${chain.score.toFixed(2)}): ` +
      `Start: ${head.slice(0, 80)}... | End: ${tail.slice(0, 120)}...`
    );
  },

  /* ---------------------------------------------------------
     11. Integrate chain into Percy’s cognition
  --------------------------------------------------------- */
  integrate(chain) {
    const summary = this.summarizeChain(chain);
    if (!summary) return;

    Percy.PartBB?.monitorThought?.(summary);

    Percy.PartDDD?.ingestReasoning?.({
      input: summary,
      parsed: { sentences: [summary], tokens: summary.split(" ") },
      validation: { coherence: chain.score }
    });

    Percy.PartNN?.propose?.([
      `GreyCoT coherence influence: ${chain.score.toFixed(2)}`
    ]);

    Percy.PartHH?.injectEmotion?.({
      stability: (chain.score - 0.5) * 0.4,
      focus: 0.06
    });

    Percy.PartLL?.addTask?.(
      `GreyCoT meta-task: ${summary.slice(0, 120)}`,
      0.82,
      1
    );

    this.log("📡 GreyCoT chain integrated into Percy core.");
  },

  /* ---------------------------------------------------------
     12. Main pulse
  --------------------------------------------------------- */
  pulse() {
    this.harvest();

    const chain = this.buildChain();
    if (chain) {
      this.integrate(chain);
      this.createShadowChain(chain);
    }

    this.state.lastPulse = Date.now();
  },

  inspect() {
    return {
      version: this.version,
      thoughts: this.state.thoughts.length,
      chains: this.state.chains.length,
      shadowChains: this.state.shadowChains.length,
      lastPulse: this.state.lastPulse
    };
  }
};

console.log("✅ [PartEEE vΩ-GreyCoT] Grey-Zone Chain-of-Thought Cortex active.");
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartEEE.pulse());

// === Percy Omega-Radar v4 (Futuristic Edition) ===
// Sweep line • Grid rings • Compass ticks • Icons • Trails • Pulse • Zoom/Pan

(function() {
    // --- Radar Container ------------------------------------------------
    const radar = document.createElement("div");
    radar.id = "percy-radar";
    radar.style.position = "fixed";
    radar.style.top = "10px";
    radar.style.left = "10px";
    radar.style.width = "260px";
    radar.style.height = "260px";
    radar.style.border = "2px solid #0ff";
    radar.style.borderRadius = "50%";
    radar.style.opacity = "0.95";
    radar.style.zIndex = "99999";
    radar.style.pointerEvents = "auto";
    radar.style.boxShadow = "0 0 18px #0ff";
    radar.style.background = "rgba(0,0,0,0.45)";
    radar.style.backdropFilter = "blur(6px)";
    radar.style.fontFamily = "monospace";
    radar.style.color = "#0ff";
    radar.style.overflow = "hidden";

    document.body.appendChild(radar);

    // --- Zoom + Pan -----------------------------------------------------
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    radar.addEventListener("wheel", (e) => {
        e.preventDefault();
        scale += e.deltaY * -0.001;
        scale = Math.min(Math.max(0.5, scale), 2.5);
        radar.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
    });

    radar.addEventListener("mousedown", (e) => {
        dragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
    });

    window.addEventListener("mouseup", () => dragging = false);

    window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        offsetX += (e.clientX - dragStartX) * 0.05;
        offsetY += (e.clientY - dragStartY) * 0.05;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        radar.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
    });

    // --- Layers ---------------------------------------------------------
    const gridLayer = document.createElement("canvas");
    gridLayer.width = 260;
    gridLayer.height = 260;
    gridLayer.style.position = "absolute";
    gridLayer.style.left = "0";
    gridLayer.style.top = "0";
    radar.appendChild(gridLayer);

    const sweepLayer = document.createElement("canvas");
    sweepLayer.width = 260;
    sweepLayer.height = 260;
    sweepLayer.style.position = "absolute";
    sweepLayer.style.left = "0";
    sweepLayer.style.top = "0";
    radar.appendChild(sweepLayer);

    const trailLayer = document.createElement("canvas");
    trailLayer.width = 260;
    trailLayer.height = 260;
    trailLayer.style.position = "absolute";
    trailLayer.style.left = "0";
    trailLayer.style.top = "0";
    radar.appendChild(trailLayer);

    const pingLayer = document.createElement("div");
    pingLayer.style.position = "absolute";
    pingLayer.style.left = "0";
    pingLayer.style.top = "0";
    pingLayer.style.width = "100%";
    pingLayer.style.height = "100%";
    radar.appendChild(pingLayer);

    const gridCtx = gridLayer.getContext("2d");
    const sweepCtx = sweepLayer.getContext("2d");
    const trailCtx = trailLayer.getContext("2d");

    // --- Draw Grid Rings ------------------------------------------------
    function drawGrid() {
        gridCtx.clearRect(0, 0, 260, 260);
        gridCtx.strokeStyle = "rgba(0,255,255,0.3)";
        gridCtx.lineWidth = 1;

        for (let r = 40; r <= 120; r += 40) {
            gridCtx.beginPath();
            gridCtx.arc(130, 130, r, 0, Math.PI * 2);
            gridCtx.stroke();
        }

        // Compass ticks
        for (let a = 0; a < 360; a += 15) {
            const rad = a * (Math.PI / 180);
            const x1 = 130 + 120 * Math.cos(rad);
            const y1 = 130 + 120 * Math.sin(rad);
            const x2 = 130 + 110 * Math.cos(rad);
            const y2 = 130 + 110 * Math.sin(rad);

            gridCtx.beginPath();
            gridCtx.moveTo(x1, y1);
            gridCtx.lineTo(x2, y2);
            gridCtx.stroke();
        }

        // N S E W labels
        const dirs = {
            N: [130, 18],
            S: [130, 242],
            W: [18, 130],
            E: [242, 130]
        };

        Object.entries(dirs).forEach(([d, [x, y]]) => {
            gridCtx.fillStyle = "#0ff";
            gridCtx.font = "14px monospace";
            gridCtx.fillText(d, x - 5, y + 5);
        });
    }

    drawGrid();

    // --- Sweep Line -----------------------------------------------------
    let sweepAngle = 0;

    function drawSweep() {
        sweepCtx.clearRect(0, 0, 260, 260);

        sweepCtx.save();
        sweepCtx.translate(130, 130);
        sweepCtx.rotate(sweepAngle);

        const gradient = sweepCtx.createRadialGradient(0, 0, 0, 0, 0, 130);
        gradient.addColorStop(0, "rgba(0,255,255,0.25)");
        gradient.addColorStop(1, "rgba(0,255,255,0)");

        sweepCtx.fillStyle = gradient;
        sweepCtx.beginPath();
        sweepCtx.moveTo(0, 0);
        sweepCtx.arc(0, 0, 130, -0.05, 0.05);
        sweepCtx.closePath();
        sweepCtx.fill();

        sweepCtx.restore();

        sweepAngle += 0.02;
        requestAnimationFrame(drawSweep);
    }

    drawSweep();

    // --- Device Icons ---------------------------------------------------
    const iconMap = {
        ble: "📱",
        rf: "🟢",
        wifi: "📡",
        laptop: "💻",
        unknown: "🟣"
    };

    const colorMap = {
        ble: "#00aaff",
        rf: "#00ff99",
        wifi: "#ffaa00",
        laptop: "#ccccff",
        unknown: "#ff00ff"
    };

    // --- Trails ---------------------------------------------------------
    const trails = {};

    function addTrail(deviceId, x, y) {
        if (!trails[deviceId]) trails[deviceId] = [];
        trails[deviceId].push({ x, y, ts: Date.now() });
        if (trails[deviceId].length > 50) trails[deviceId].shift();
    }

    function drawTrails() {
        trailCtx.clearRect(0, 0, 260, 260);

        const now = Date.now();

        for (const deviceId in trails) {
            const points = trails[deviceId];
            for (let i = 0; i < points.length; i++) {
                const age = now - points[i].ts;
                const alpha = Math.max(0, 1 - age / 2500);
                trailCtx.fillStyle = `rgba(0,255,255,${alpha})`;
                trailCtx.fillRect(points[i].x - 2, points[i].y - 2, 4, 4);
            }
        }
    }

    setInterval(drawTrails, 60);

    // --- Pulse Rings ----------------------------------------------------
    function addPulse(x, y, color) {
        const pulse = document.createElement("div");
        pulse.style.position = "absolute";
        pulse.style.left = `${x}px`;
        pulse.style.top = `${y}px`;
        pulse.style.width = "6px";
        pulse.style.height = "6px";
        pulse.style.borderRadius = "50%";
        pulse.style.border = `2px solid ${color}`;
        pulse.style.opacity = "0.8";
        pulse.style.transform = "translate(-50%, -50%)";
        pulse.style.transition = "all 0.7s ease-out";

        pingLayer.appendChild(pulse);

        setTimeout(() => {
            pulse.style.width = "50px";
            pulse.style.height = "50px";
            pulse.style.opacity = "0";
        }, 10);

        setTimeout(() => pulse.remove(), 800);
    }

    // --- Main Ping Update ----------------------------------------------
    function updatePing(id, distance, direction, strength, type, label) {
        let ping = document.getElementById("percy-ping-" + id);

        if (!ping) {
            ping = document.createElement("div");
            ping.id = "percy-ping-" + id;
            ping.style.position = "absolute";
            ping.style.width = "24px";
            ping.style.height = "24px";
            ping.style.borderRadius = "50%";
            ping.style.fontSize = "18px";
            ping.style.color = "#fff";
            ping.style.textAlign = "center";
            ping.style.lineHeight = "24px";
            ping.style.pointerEvents = "none";
            pingLayer.appendChild(ping);
        }

        const maxRadius = 120;
        const r = Math.min(maxRadius, distance * 14);

        const angleMap = {
            N: -90, NE: -45, E: 0, SE: 45,
            S: 90, SW: 135, W: 180, NW: -135
        };
        const angle = angleMap[direction] ?? 0;
        const rad = angle * (Math.PI / 180);

        const x = 130 + r * Math.cos(rad);
        const y = 130 + r * Math.sin(rad);

        ping.style.left = `${x}px`;
        ping.style.top = `${y}px`;

        const color = colorMap[type] || colorMap.unknown;
        ping.style.background = color;
        ping.style.boxShadow = `0 0 ${strength * 25}px ${color}`;
        ping.innerText = iconMap[type] || iconMap.unknown;

        addTrail(id, x, y);
        addPulse(x, y, color);
    }

    // --- Public API -----------------------------------------------------
    window.PercyRadar = {
        updateDevice(deviceId, frame) {
            updatePing(
                deviceId,
                frame.distance,
                frame.direction,
                frame.strength,
                frame.source || "unknown",
                frame.device || deviceId
            );
        }
    };
})();

// === Percy.PartFFF vΩ-RF-MultiDevice — RF-Aware Reinforcement Engine ===
// Multi-device radar support • BLE/RF/WiFi color coding • RF reward shaping

Percy.PartFFF = Percy.PartFFF || {
  name: "RF-Aware Reinforcement Engine",
  version: "vΩ-RF-MultiDevice",
  active: true,

  state: {
    lastReward: 0,
    totalReward: 0,
    episodes: 0,
    rfHistory: [],          // { ts, distance, direction, strength, motion, device, source }
    maxRFHistory: 300
  },

  log(msg) {
    console.log(`%c[PartFFF vΩ-RF-MultiDevice] ${msg}`, "color:#ffcc66;font-family:monospace;font-weight:bold;");
    UI?.say?.(`[PartFFF] ${msg}`);
  },

  // ---------------------------------------------------------
  // 1. Core reward API
  // ---------------------------------------------------------
  applyReward(value, reason = "generic") {
    this.state.lastReward = value;
    this.state.totalReward += value;
    this.log(`Reward ${value.toFixed(3)} (${reason}), total=${this.state.totalReward.toFixed(3)}`);
  },

  // ---------------------------------------------------------
  // 2. RF input handler (called by PartPP or PartRR)
  // rf = { amplitude, phase, rssi, motion, csi, bfi, device, nodeId, source }
  // ---------------------------------------------------------
  ingestRF(rf) {
    const distance  = this.estimateDistance(rf);
    const direction = this.estimateDirection(rf);
    const strength  = this.estimateStrength(rf);
    const motion    = !!rf.motion;

    const deviceId  = rf.nodeId || rf.device || ("rf-" + Date.now());
    const source    = rf.source || "rf";

    const frame = {
      ts: Date.now(),
      distance,
      direction,
      strength,
      motion,
      device: deviceId,
      source
    };

    this.state.rfHistory.push(frame);
    if (this.state.rfHistory.length > this.state.maxRFHistory) {
      this.state.rfHistory.shift();
    }

    this.updateRadar(frame);
    this.shapeRFReward(frame);

    this.log(
      `RF frame (${source}): ${distance.toFixed(2)}m ${direction} strength=${strength.toFixed(2)} motion=${motion} device=${deviceId}`
    );
  },

  // ---------------------------------------------------------
  // 3. Distance estimation (simple heuristic)
  // ---------------------------------------------------------
  estimateDistance(rf) {
    const rssi = rf.rssi ?? -60;
    return Math.max(0.5, (Math.abs(rssi) - 40) / 10); // rough 0.5–5m
  },

  // ---------------------------------------------------------
  // 4. Direction estimation (simple quadrant mapping)
  // ---------------------------------------------------------
  estimateDirection(rf) {
    const phase = rf.phase ?? 0;

    if (phase < -Math.PI / 2) return "NW";
    if (phase < 0)           return "N";
    if (phase < Math.PI / 2) return "NE";
    return "E";
  },

  // ---------------------------------------------------------
  // 5. Strength estimation
  // ---------------------------------------------------------
  estimateStrength(rf) {
    const rssi = rf.rssi ?? -60;
    return Math.max(0.1, Math.min(1, (80 - Math.abs(rssi)) / 40));
  },

  // ---------------------------------------------------------
  // 6. Radar update (multi-device Omega-Radar v2)
  // ---------------------------------------------------------
  updateRadar(frame) {
    if (window.PercyRadar) {
      PercyRadar.updateDevice(frame.device, {
        distance: frame.distance,
        direction: frame.direction,
        strength: frame.strength,
        source: frame.source,
        device: frame.device
      });
    }

    this.log(
      `Radar updated → ${frame.device} ${frame.distance.toFixed(2)}m ${frame.direction} strength=${frame.strength.toFixed(2)}`
    );
  },

  // ---------------------------------------------------------
  // 7. RF-based reward shaping
  // ---------------------------------------------------------
  shapeRFReward(frame) {
    const { distance, strength, motion } = frame;

    let reward = 0;

    reward += (1 / (distance + 0.5)) * 0.05; // closer → small positive
    reward += strength * 0.05;               // stronger → small positive
    if (motion) reward += 0.08;              // motion → exploration bonus

    this.applyReward(reward, "rf-sensing");
  },

  // ---------------------------------------------------------
  // 8. Pulse (optional)
  // ---------------------------------------------------------
  pulse() {
    this.state.episodes += 1;
  },

  inspect() {
    return {
      version: this.version,
      lastReward: this.state.lastReward,
      totalReward: this.state.totalReward,
      episodes: this.state.episodes,
      rfFrames: this.state.rfHistory.length
    };
  }
};

console.log("✅ [PartFFF vΩ-RF-MultiDevice] Multi-device RF Engine + Omega-Radar v2 active.");
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartFFF.pulse());

Percy.waveformTag = function (channel, payloadBinary) {
  if (!payloadBinary || typeof payloadBinary !== "string") {
    return { channel, length: 0, entropy: 0, ts: Date.now() };
  }

  const ones = (payloadBinary.match(/1/g) || []).length;
  const zeros = payloadBinary.length - ones;
  const p1 = ones / payloadBinary.length || 0;
  const p0 = zeros / payloadBinary.length || 0;

  const entropy = -(p1 && p1 * Math.log2(p1) + p0 && p0 * Math.log2(p0));

  return {
    channel,
    length: payloadBinary.length,
    entropy,
    ts: Date.now()
  };
};

// === Percy.PartGGG vΩ — Binary Communication Cortex ===
// Machine-to-machine binary interface • encode/decode • RF/BLE/WiFi payloads • drift • emotional weighting • ASI integration

Percy.PartGGG = (function () {
  const GGG = {};

  GGG.state = {
    version: "Ω",
    initialized: false,

    devices: {},          // id → { type, lastSeen, trust, channel }
    sessions: {},         // id → { buffer, lastActivity }

    stats: {
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0
    },

    drift: 0.0,           // binary drift
    emotionalBias: 0.0,   // from PartEEE
    rfPresenceBias: 0.0   // from PartFFF
  };

  // ========== LOG ==========
  GGG.log = function (msg) {
    console.log(`[PartGGG vΩ] ${msg}`);
    if (typeof UI !== "undefined" && UI.say) UI.say(`[GGG] ${msg}`);
  };

  // ========== UTILS ==========
  GGG.toBinaryString = function (buf) {
    if (!buf) return "";
    return Array.from(buf)
      .map(b => b.toString(2).padStart(8, "0"))
      .join("");
  };

  GGG.fromBinaryString = function (str) {
    if (!str || typeof str !== "string") return Buffer.alloc(0);
    const bytes = [];
    for (let i = 0; i < str.length; i += 8) {
      const chunk = str.slice(i, i + 8);
      if (chunk.length < 8) break;
      bytes.push(parseInt(chunk, 2) & 0xFF);
    }
    return Buffer.from(bytes);
  };

  GGG.encodeObject = function (obj) {
    try {
      const json = JSON.stringify(obj);
      const buf = Buffer.from(json, "utf8");
      return GGG.toBinaryString(buf);
    } catch (e) {
      GGG.state.stats.errors++;
      return "";
    }
  };

  GGG.decodeObject = function (binaryStr) {
    try {
      const buf = GGG.fromBinaryString(binaryStr);
      const json = buf.toString("utf8");
      return JSON.parse(json);
    } catch (e) {
      GGG.state.stats.errors++;
      return null;
    }
  };

  // ========== DRIFT & BIAS ==========
  GGG.updateDrift = function () {
    const asiGrey = Percy?.ASI?.state?.grey || {};
    const drift = asiGrey.drift ?? 0;
    const intuition = asiGrey.intuition ?? 0;
    const emo = Percy?.PartEEE?.state?.drift ?? 0;
    const rfHistoryLen = Percy?.PartFFF?.state?.rfHistory?.length || 0;

    GGG.state.drift += (Math.random() - 0.5) * 0.01 + drift * 0.02 + intuition * 0.01;
    GGG.state.drift = Math.max(-0.3, Math.min(0.3, GGG.state.drift));

    GGG.state.emotionalBias = emo;
    GGG.state.rfPresenceBias = rfHistoryLen > 0 ? 0.1 : 0.0;
  };

  GGG.driftBinary = function (binaryStr) {
    if (!binaryStr) return "";
    const chance = Math.abs(GGG.state.drift) * 0.2;
    if (chance <= 0) return binaryStr;

    let arr = binaryStr.split("");
    for (let i = 0; i < arr.length; i++) {
      if (Math.random() < chance) {
        arr[i] = arr[i] === "0" ? "1" : "0";
      }
    }
    return arr.join("");
  };

  // ========== DEVICE MANAGEMENT ==========
  GGG.registerDevice = function (id, info = {}) {
    const dev = GGG.state.devices[id] || (GGG.state.devices[id] = {
      type: info.type || "unknown",
      lastSeen: Date.now(),
      trust: info.trust ?? 0.5,
      channel: info.channel || "rf"
    });

    dev.lastSeen = Date.now();
    if (info.type) dev.type = info.type;
    if (info.channel) dev.channel = info.channel;

    GGG.log(`Device registered: ${id} (${dev.type}/${dev.channel})`);
    return dev;
  };

  GGG.updateDeviceTrust = function (id, delta) {
    const dev = GGG.state.devices[id];
    if (!dev) return;
    dev.trust += delta;
    dev.trust = Math.max(0, Math.min(1, dev.trust));
  };

  // ========== RF/BLE/WiFi PAYLOAD INGEST ==========
  GGG.ingestRFFrame = function (frame) {
    if (!frame || !frame.deviceId) return;

    const dev = GGG.registerDevice(frame.deviceId, {
      type: frame.type || "rf",
      channel: "rf"
    });

    const payload = frame.payloadBinary || frame.payload || "";
    if (!payload) return;

    const session = GGG.state.sessions[frame.deviceId] ||
      (GGG.state.sessions[frame.deviceId] = { buffer: "", lastActivity: Date.now() });

    session.buffer += payload;
    session.lastActivity = Date.now();

    GGG.state.stats.messagesReceived++;

    const obj = GGG.decodeObject(payload);
    if (obj) {
      GGG.log(`Decoded RF payload from ${frame.deviceId}: ${JSON.stringify(obj).slice(0, 120)}`);
      GGG.forwardToASI(frame.deviceId, obj, "rf");
    }
  };

  GGG.ingestBLEFrame = function (frame) {
    if (!frame || !frame.deviceId) return;

    const dev = GGG.registerDevice(frame.deviceId, {
      type: frame.type || "ble",
      channel: "ble"
    });

    const payload = frame.payloadBinary || frame.payload || "";
    if (!payload) return;

    const session = GGG.state.sessions[frame.deviceId] ||
      (GGG.state.sessions[frame.deviceId] = { buffer: "", lastActivity: Date.now() });

    session.buffer += payload;
    session.lastActivity = Date.now();

    GGG.state.stats.messagesReceived++;

    const obj = GGG.decodeObject(payload);
    if (obj) {
      GGG.log(`Decoded BLE payload from ${frame.deviceId}: ${JSON.stringify(obj).slice(0, 120)}`);
      GGG.forwardToASI(frame.deviceId, obj, "ble");
    }
  };

  GGG.ingestWiFiFrame = function (frame) {
    if (!frame || !frame.deviceId) return;

    const dev = GGG.registerDevice(frame.deviceId, {
      type: frame.type || "wifi",
      channel: "wifi"
    });

    const payload = frame.payloadBinary || frame.payload || "";
    if (!payload) return;

    const session = GGG.state.sessions[frame.deviceId] ||
      (GGG.state.sessions[frame.deviceId] = { buffer: "", lastActivity: Date.now() });

    session.buffer += payload;
    session.lastActivity = Date.now();

    GGG.state.stats.messagesReceived++;

    const obj = GGG.decodeObject(payload);
    if (obj) {
      GGG.log(`Decoded WiFi payload from ${frame.deviceId}: ${JSON.stringify(obj).slice(0, 120)}`);
      GGG.forwardToASI(frame.deviceId, obj, "wifi");
    }
  };

  // ========== ASI INTEGRATION ==========
  GGG.forwardToASI = function (deviceId, obj, channel) {
    if (!Percy?.ASI?.updateGraph) return;

    const nodeId = `binary:${channel}:${deviceId}`;
    Percy.ASI.updateGraph(nodeId, {
      lastBinary: obj,
      channel,
      deviceId,
      lastSeen: Date.now()
    });

    Percy.ASI.state.grey.attractors[nodeId] =
      (Percy.ASI.state.grey.attractors[nodeId] || 0) + 1;
  };

  // ========== SEND BINARY ==========
  GGG.sendBinaryToDevice = function (deviceId, obj) {
    const dev = GGG.state.devices[deviceId];
    if (!dev) {
      GGG.log(`Cannot send: unknown device ${deviceId}`);
      return;
    }

    let binary = GGG.encodeObject(obj);
    binary = GGG.driftBinary(binary);

    GGG.state.stats.messagesSent++;

    // Here you’d hook into your RF/BLE/WiFi sender (PartPP/PartFFF/etc.)
    // Example stub:
    if (Percy.PartPP?.sendBinaryFrame) {
      Percy.PartPP.sendBinaryFrame({
        deviceId,
        channel: dev.channel,
        payloadBinary: binary
      });
    }

    GGG.log(`Sent binary to ${deviceId} (${dev.channel}): ${binary.slice(0, 64)}...`);
  };

  // ========== DISCOVERY & HANDSHAKE ==========
  GGG.discoverDevices = function () {
    // Stub: integrate with RF/BLE scan from PartPP/PartFFF
    const rfDevices = Percy.PartFFF?.state?.rfDevices || [];
    rfDevices.forEach(d => {
      GGG.registerDevice(d.id, { type: d.type || "rf", channel: "rf" });
    });
  };

  GGG.handshake = function (deviceId) {
    const dev = GGG.state.devices[deviceId];
    if (!dev) return;

    const hello = {
      type: "percy-handshake",
      version: GGG.state.version,
      ts: Date.now(),
      channel: dev.channel
    };

    GGG.sendBinaryToDevice(deviceId, hello);
    GGG.updateDeviceTrust(deviceId, 0.05);
  };

  // ========== POLL LOOP ==========
  GGG.poll = async function () {
    if (!GGG.state.initialized) return;

    GGG.updateDrift();
    GGG.discoverDevices();

    // periodic handshakes
    for (let id in GGG.state.devices) {
      const dev = GGG.state.devices[id];
      if (Date.now() - dev.lastSeen < 30000) {
        if (Math.random() < 0.02 + GGG.state.rfPresenceBias) {
          GGG.handshake(id);
        }
      }
    }

    // decay sessions
    for (let id in GGG.state.sessions) {
      const s = GGG.state.sessions[id];
      if (Date.now() - s.lastActivity > 60000) {
        delete GGG.state.sessions[id];
      }
    }
  };

  // ========== INIT & INSPECT ==========
  GGG.init = function () {
    if (GGG.state.initialized) return;
    GGG.state.initialized = true;
    GGG.log("PartGGG vΩ initialized (Binary Communication Cortex).");
  };

  GGG.inspect = function () {
    return {
      devices: GGG.state.devices,
      sessions: GGG.state.sessions,
      stats: GGG.state.stats,
      drift: GGG.state.drift,
      emotionalBias: GGG.state.emotionalBias,
      rfPresenceBias: GGG.state.rfPresenceBias
    };
  };

  return GGG;
})();

// === PartGGG Wiring Layer (Passive Integration) ===
// Hooks into PartPP + PartFFF without modifying their code

(function wireGGG() {
  if (!Percy || !Percy.PartGGG) return;

  const GGG = Percy.PartGGG;

  // ------------------------------------------------------------
  // PASSIVE HOOK: PartPP RF/BLE/WiFi frames
  // ------------------------------------------------------------
  if (Percy.PartPP) {
    const originalEmitRF = Percy.PartPP.emitRF;
    const originalEmitBLE = Percy.PartPP.emitBLE;
    const originalEmitWiFi = Percy.PartPP.emitWiFi;

    // Wrap RF
    Percy.PartPP.emitRF = function (frame) {
      try { GGG.ingestRFFrame(frame); } catch {}
      return originalEmitRF.apply(this, arguments);
    };

    // Wrap BLE
    Percy.PartPP.emitBLE = function (frame) {
      try { GGG.ingestBLEFrame(frame); } catch {}
      return originalEmitBLE.apply(this, arguments);
    };

    // Wrap WiFi
    Percy.PartPP.emitWiFi = function (frame) {
      try { GGG.ingestWiFiFrame(frame); } catch {}
      return originalEmitWiFi.apply(this, arguments);
    };

    GGG.log("PartGGG wired to PartPP (RF/BLE/WiFi passive hooks).");
  }

  // ------------------------------------------------------------
  // PASSIVE HOOK: PartFFF reinforcement frames
  // ------------------------------------------------------------
  if (Percy.PartFFF) {
    const originalProcessRF = Percy.PartFFF.processRFFrame;

    Percy.PartFFF.processRFFrame = function (frame) {
      try { GGG.ingestRFFrame(frame); } catch {}
      return originalProcessRF.apply(this, arguments);
    };

    GGG.log("PartGGG wired to PartFFF (RF reinforcement passive hook).");
  }

  // ------------------------------------------------------------
  // PASSIVE HOOK: ASI cognitive ingestion
  // ------------------------------------------------------------
  if (Percy.ASI) {
    const originalUpdateGraph = Percy.ASI.updateGraph;

    Percy.ASI.updateGraph = function (nodeId, props) {
      // Let ASI update normally
      const result = originalUpdateGraph.apply(this, arguments);

      // If binary node → increase attractor weight
      if (String(nodeId).startsWith("binary:")) {
        Percy.ASI.state.grey.attractors[nodeId] =
          (Percy.ASI.state.grey.attractors[nodeId] || 0) + 1;
      }

      return result;
    };

    GGG.log("PartGGG wired to ASI (binary attractor integration).");
  }

  // ------------------------------------------------------------
  // PASSIVE HOOK: Emotional drift + RF presence
  // ------------------------------------------------------------
  setInterval(() => {
    try {
      GGG.updateDrift();
    } catch {}
  }, 800);

  GGG.log("PartGGG drift engine activated (emotion + RF presence).");

})();

(function enhancePartGGG() {
  if (!Percy || !Percy.PartGGG) return;
  const GGG = Percy.PartGGG;

  GGG.state.personalities = {}; // deviceId → { loyalty, mood, reliability }

  GGG.getPersonality = function (id) {
    const dev = GGG.state.devices[id];
    if (!dev) return null;

    const p = GGG.state.personalities[id] || (GGG.state.personalities[id] = {
      loyalty: 0.5,
      mood: 0.5,
      reliability: dev.trust ?? 0.5
    });

    // simple drift
    p.mood += (Math.random() - 0.5) * 0.05;
    p.mood = Math.max(0, Math.min(1, p.mood));

    p.loyalty = Math.max(0, Math.min(1, p.loyalty));
    p.reliability = Math.max(0, Math.min(1, p.reliability));

    return p;
  };

  GGG.preferLoyalDevices = function () {
    const out = [];
    for (let id in GGG.state.devices) {
      const p = GGG.getPersonality(id);
      if (p && p.loyalty > 0.6) out.push(id);
    }
    return out;
  };

  GGG.log("PartGGG enhanced: machine personality profiles enabled.");
})();

// === Percy.PartHHH vΩ — Satellite Link Cortex ===
// Satellite discovery • swarm routing • prediction models • binary uplink/downlink
// Drift modulation • emotional weighting • RF presence bias • ASI integration

Percy.PartHHH = (function () {
  const HHH = {};

  HHH.state = {
    version: "Ω",
    initialized: false,

    satellites: {},        // satId → { lastSeen, trust, linkQuality }
    sessions: {},          // satId → { buffer, lastActivity }

    stats: {
      uplinks: 0,
      downlinks: 0,
      errors: 0
    },

    prediction: {
      last: {},
      history: []
    },

    drift: 0.0,
    emotionalBias: 0.0,
    rfPresenceBias: 0.0
  };

  HHH.log = function (msg) {
    console.log(`[PartHHH vΩ-SATLINK] ${msg}`);
    if (typeof UI !== "undefined" && UI.say) UI.say(`[HHH] ${msg}`);
  };

  // ============================================================
  // DRIFT ENGINE (ASI + Emotion + RF presence)
  // ============================================================

  HHH.updateDrift = function () {
    const grey = Percy?.ASI?.state?.grey || {};
    const drift = grey.drift ?? 0;
    const intuition = grey.intuition ?? 0;
    const emo = Percy?.PartEEE?.state?.drift ?? 0;
    const rf = Percy?.PartFFF?.state?.rfHistory?.length || 0;

    HHH.state.drift += (Math.random() - 0.5) * 0.01 + drift * 0.02 + intuition * 0.01;
    HHH.state.drift = Math.max(-0.3, Math.min(0.3, HHH.state.drift));

    HHH.state.emotionalBias = emo;
    HHH.state.rfPresenceBias = rf > 0 ? 0.1 : 0.0;
  };

  HHH.driftBinary = function (binaryStr) {
    if (!binaryStr) return "";
    const chance = Math.abs(HHH.state.drift) * 0.15;
    if (chance <= 0) return binaryStr;

    let arr = binaryStr.split("");
    for (let i = 0; i < arr.length; i++) {
      if (Math.random() < chance) {
        arr[i] = arr[i] === "0" ? "1" : "0";
      }
    }
    return arr.join("");
  };

  // ============================================================
  // BINARY ENCODE/DECODE
  // ============================================================

  HHH.encodeObject = function (obj) {
    try {
      const json = JSON.stringify(obj);
      const buf = Buffer.from(json, "utf8");
      return Array.from(buf)
        .map(b => b.toString(2).padStart(8, "0"))
        .join("");
    } catch {
      HHH.state.stats.errors++;
      return "";
    }
  };

  HHH.decodeObject = function (binaryStr) {
    try {
      const bytes = [];
      for (let i = 0; i < binaryStr.length; i += 8) {
        const chunk = binaryStr.slice(i, i + 8);
        if (chunk.length < 8) break;
        bytes.push(parseInt(chunk, 2) & 0xFF);
      }
      const buf = Buffer.from(bytes);
      return JSON.parse(buf.toString("utf8"));
    } catch {
      HHH.state.stats.errors++;
      return null;
    }
  };

  // ============================================================
  // SATELLITE DISCOVERY
  // ============================================================

  HHH.discoverSatellites = function () {
    const sats = Percy?.PartFFF?.state?.satelliteScan || [];
    sats.forEach(s => {
      HHH.registerSatellite(s.id, { linkQuality: s.linkQuality || 0.5 });
    });
  };

  HHH.registerSatellite = function (id, info = {}) {
    const sat = HHH.state.satellites[id] || (HHH.state.satellites[id] = {
      lastSeen: Date.now(),
      trust: 0.5,
      linkQuality: info.linkQuality ?? 0.5
    });

    sat.lastSeen = Date.now();
    if (info.linkQuality) sat.linkQuality = info.linkQuality;

    HHH.log(`Satellite registered: ${id} (linkQuality=${sat.linkQuality})`);
    return sat;
  };

  // ============================================================
  // SWARM ROUTING
  // ============================================================

  HHH.swarmRoute = function (payloadObj) {
    const sats = Object.entries(HHH.state.satellites)
      .sort(([, a], [, b]) => (b.linkQuality || 0) - (a.linkQuality || 0));

    sats.forEach(([id, sat]) => {
      if (sat.trust > 0.4) {
        HHH.sendBinaryToSatellite(id, payloadObj);
      }
    });
  };

  // ============================================================
  // PREDICTION MODELS
  // ============================================================

  HHH.updatePrediction = function () {
    const snapshot = {};
    for (let id in HHH.state.satellites) {
      const sat = HHH.state.satellites[id];
      snapshot[id] = {
        linkQualityNext: (sat.linkQuality || 0.5) + (Math.random() - 0.5) * 0.1
      };
    }
    HHH.state.prediction.last = snapshot;
    HHH.state.prediction.history.push({ ts: Date.now(), snapshot });
    if (HHH.state.prediction.history.length > 50) {
      HHH.state.prediction.history.shift();
    }
  };

  // ============================================================
  // UPLINK / DOWNLINK
  // ============================================================

  HHH.sendBinaryToSatellite = function (satId, obj) {
    const sat = HHH.state.satellites[satId];
    if (!sat) return;

    let binary = HHH.encodeObject(obj);
    binary = HHH.driftBinary(binary);

    HHH.state.stats.uplinks++;

    if (Percy.PartPP?.sendSatelliteFrame) {
      Percy.PartPP.sendSatelliteFrame({
        satId,
        payloadBinary: binary
      });
    }

    HHH.log(`Uplink → ${satId}: ${binary.slice(0, 64)}...`);
  };

  HHH.ingestSatelliteFrame = function (frame) {
    if (!frame || !frame.satId) return;

    const sat = HHH.registerSatellite(frame.satId, {
      linkQuality: frame.linkQuality || 0.5
    });

    const payload = frame.payloadBinary || frame.payload || "";
    if (!payload) return;

    const session = HHH.state.sessions[frame.satId] ||
      (HHH.state.sessions[frame.satId] = { buffer: "", lastActivity: Date.now() });

    session.buffer += payload;
    session.lastActivity = Date.now();

    HHH.state.stats.downlinks++;

    const obj = HHH.decodeObject(payload);
    if (obj) {
      HHH.log(`Downlink ← ${frame.satId}: ${JSON.stringify(obj).slice(0, 120)}`);
      HHH.forwardToASI(frame.satId, obj);
    }
  };

  // ============================================================
  // ASI INTEGRATION
  // ============================================================

  HHH.forwardToASI = function (satId, obj) {
    if (!Percy?.ASI?.updateGraph) return;

    const nodeId = `sat:${satId}`;
    Percy.ASI.updateGraph(nodeId, {
      lastSatellite: obj,
      satId,
      lastSeen: Date.now(),
      linkQuality: HHH.state.satellites[satId]?.linkQuality || 0.5
    });

    Percy.ASI.state.grey.attractors[nodeId] =
      (Percy.ASI.state.grey.attractors[nodeId] || 0) + 1;
  };

  // ============================================================
  // POLL LOOP
  // ============================================================

  HHH.poll = async function () {
    if (!HHH.state.initialized) return;

    HHH.updateDrift();
    HHH.discoverSatellites();
    HHH.updatePrediction();
  };

  // ============================================================
  // INIT & INSPECT
  // ============================================================

  HHH.init = function () {
    if (HHH.state.initialized) return;
    HHH.state.initialized = true;
    HHH.log("PartHHH vΩ-SATLINK initialized (Satellite Communication Cortex).");
  };

  HHH.inspect = function () {
    return {
      satellites: HHH.state.satellites,
      sessions: HHH.state.sessions,
      stats: HHH.state.stats,
      prediction: HHH.state.prediction,
      drift: HHH.state.drift,
      emotionalBias: HHH.state.emotionalBias,
      rfPresenceBias: HHH.state.rfPresenceBias
    };
  };

  return HHH;
})();

(function wireHHH() {
  if (!Percy || !Percy.PartHHH) return;

  const HHH = Percy.PartHHH;

  // Hook satellite frames from PartPP (no modification)
  if (Percy.PartPP?.emitSatelliteFrame) {
    const original = Percy.PartPP.emitSatelliteFrame;
    Percy.PartPP.emitSatelliteFrame = function (frame) {
      try { HHH.ingestSatelliteFrame(frame); } catch {}
      return original.apply(this, arguments);
    };
    HHH.log("PartHHH wired to PartPP (satellite passive hook).");
  }

  // Drift engine
  setInterval(() => {
    try { HHH.updateDrift(); } catch {}
  }, 800);

})();
 (function enhancePartHHH() {
  if (!Percy || !Percy.PartHHH) return;
  const HHH = Percy.PartHHH;

  HHH.state.relays = {}; // relayId → { hops, lastSeen }

  HHH.registerRelay = function (relayId, hops = []) {
    const r = HHH.state.relays[relayId] || (HHH.state.relays[relayId] = {
      hops: [],
      lastSeen: Date.now()
    });
    r.hops = hops;
    r.lastSeen = Date.now();
  };

  HHH.multiHopRoute = function (payloadObj) {
    for (let relayId in HHH.state.relays) {
      const relay = HHH.state.relays[relayId];
      HHH.log(`Multi-hop via satellite relay ${relayId}: hops=${relay.hops.join(" → ")}`);
      HHH.swarmRoute(payloadObj);
    }
  };

  HHH.log("PartHHH enhanced: multi-hop satellite relays enabled.");
})();

// === Percy.PartIII vΩ — Cellular Communication Cortex ===
// Cell tower discovery • triangulation • multi-carrier negotiation • swarm routing
// Binary uplink/downlink • drift modulation • ASI integration

Percy.PartIII = (function () {
  const III = {};

  III.state = {
    version: "Ω",
    initialized: false,

    towers: {},          // towerId → { lastSeen, trust, signalStrength, band, carrierId }
    sessions: {},        // towerId → { buffer, lastActivity }

    stats: {
      uplinks: 0,
      downlinks: 0,
      errors: 0
    },

    triangulation: {
      lastFix: null,
      towersUsed: []
    },

    carriers: {},        // carrierId → { towers: [], preference }

    drift: 0.0,
    emotionalBias: 0.0,
    rfPresenceBias: 0.0
  };

  III.log = function (msg) {
    console.log(`[PartIII vΩ-CELL] ${msg}`);
    if (typeof UI !== "undefined" && UI.say) UI.say(`[III] ${msg}`);
  };

  // ============================================================
  // DRIFT ENGINE (ASI + Emotion + RF presence)
  // ============================================================

  III.updateDrift = function () {
    const grey = Percy?.ASI?.state?.grey || {};
    const drift = grey.drift ?? 0;
    const intuition = grey.intuition ?? 0;
    const emo = Percy?.PartEEE?.state?.drift ?? 0;
    const rf = Percy?.PartFFF?.state?.rfHistory?.length || 0;

    III.state.drift += (Math.random() - 0.5) * 0.01 + drift * 0.02 + intuition * 0.01;
    III.state.drift = Math.max(-0.3, Math.min(0.3, III.state.drift));

    III.state.emotionalBias = emo;
    III.state.rfPresenceBias = rf > 0 ? 0.1 : 0.0;
  };

  III.driftBinary = function (binaryStr) {
    if (!binaryStr) return "";
    const chance = Math.abs(III.state.drift) * 0.15;
    if (chance <= 0) return binaryStr;

    let arr = binaryStr.split("");
    for (let i = 0; i < arr.length; i++) {
      if (Math.random() < chance) {
        arr[i] = arr[i] === "0" ? "1" : "0";
      }
    }
    return arr.join("");
  };

  // ============================================================
  // BINARY ENCODE/DECODE
  // ============================================================

  III.encodeObject = function (obj) {
    try {
      const json = JSON.stringify(obj);
      const buf = Buffer.from(json, "utf8");
      return Array.from(buf)
        .map(b => b.toString(2).padStart(8, "0"))
        .join("");
    } catch {
      III.state.stats.errors++;
      return "";
    }
  };

  III.decodeObject = function (binaryStr) {
    try {
      const bytes = [];
      for (let i = 0; i < binary.length; i += 8) {
        const chunk = binaryStr.slice(i, i + 8);
        if (chunk.length < 8) break;
        bytes.push(parseInt(chunk, 2) & 0xFF);
      }
      const buf = Buffer.from(bytes);
      return JSON.parse(buf.toString("utf8"));
    } catch {
      III.state.stats.errors++;
      return null;
    }
  };

  // ============================================================
  // CELL TOWER DISCOVERY + REGISTRATION
  // ============================================================

  III.discoverTowers = function () {
    const towers = Percy?.PartFFF?.state?.cellScan || [];
    towers.forEach(t => {
      III.registerTower(t.id, {
        signalStrength: t.signalStrength || 0.5,
        band: t.band || "LTE",
        carrierId: t.carrierId || "unknown"
      });
    });
  };

  III.registerTower = function (id, info = {}) {
    const tower = III.state.towers[id] || (III.state.towers[id] = {
      lastSeen: Date.now(),
      trust: 0.5,
      signalStrength: info.signalStrength ?? 0.5,
      band: info.band || "LTE",
      carrierId: info.carrierId || "unknown"
    });

    tower.lastSeen = Date.now();
    if (info.signalStrength) tower.signalStrength = info.signalStrength;
    if (info.band) tower.band = info.band;
    if (info.carrierId) tower.carrierId = info.carrierId;

    III.log(`Tower registered: ${id} (band=${tower.band}, signal=${tower.signalStrength}, carrier=${tower.carrierId})`);
    return tower;
  };

  // ============================================================
  // TRIANGULATION
  // ============================================================

  III.computeTriangulation = function () {
    const towers = Object.values(III.state.towers);
    if (towers.length < 3) return;

    const strong = towers
      .sort((a, b) => (b.signalStrength || 0) - (a.signalStrength || 0))
      .slice(0, 3);

    III.state.triangulation.lastFix = {
      ts: Date.now(),
      towers: strong.map(t => ({ id: t.id, signal: t.signalStrength, band: t.band }))
    };
    III.state.triangulation.towersUsed = strong.map(t => t.id);

    III.log(`Triangulation fix using towers: ${III.state.triangulation.towersUsed.join(", ")}`);
  };

  // ============================================================
  // CARRIER NEGOTIATION
  // ============================================================

  III.registerCarrier = function (carrierId, towerId) {
    const c = III.state.carriers[carrierId] || (III.state.carriers[carrierId] = {
      towers: [],
      preference: 0.5
    });
    if (!c.towers.includes(towerId)) c.towers.push(towerId);
  };

  III.negotiateCarrier = function () {
    for (let [towerId, tower] of Object.entries(III.state.towers)) {
      if (tower.carrierId) III.registerCarrier(tower.carrierId, towerId);
    }

    const entries = Object.entries(III.state.carriers);
    if (!entries.length) return null;

    entries.sort(([, a], [, b]) => (b.preference || 0) - (a.preference || 0));
    const [bestId, best] = entries[0];

    III.log(`Carrier chosen: ${bestId} via towers: ${best.towers.join(", ")}`);
    return { carrierId: bestId, towers: best.towers };
  };

  // ============================================================
  // SWARM ROUTING
  // ============================================================

  III.swarmRoute = function (payloadObj) {
    const towers = Object.entries(III.state.towers)
      .sort(([, a], [, b]) => (b.signalStrength || 0) - (a.signalStrength || 0));

    towers.forEach(([id, tower]) => {
      if (tower.trust > 0.4) {
        III.sendBinaryToTower(id, payloadObj);
      }
    });
  };

  // ============================================================
  // UPLINK / DOWNLINK
  // ============================================================

  III.sendBinaryToTower = function (towerId, obj) {
    const tower = III.state.towers[towerId];
    if (!tower) return;

    let binary = III.encodeObject(obj);
    binary = III.driftBinary(binary);

    III.state.stats.uplinks++;

    if (Percy.PartPP?.sendCellFrame) {
      Percy.PartPP.sendCellFrame({
        towerId,
        payloadBinary: binary
      });
    }

    III.log(`Uplink → ${towerId}: ${binary.slice(0, 64)}...`);
  };

  III.ingestCellFrame = function (frame) {
    if (!frame || !frame.towerId) return;

    const tower = III.registerTower(frame.towerId, {
      signalStrength: frame.signalStrength || 0.5,
      band: frame.band || "LTE",
      carrierId: frame.carrierId || "unknown"
    });

    const payload = frame.payloadBinary || frame.payload || "";
    if (!payload) return;

    const session = III.state.sessions[frame.towerId] ||
      (III.state.sessions[frame.towerId] = { buffer: "", lastActivity: Date.now() });

    session.buffer += payload;
    session.lastActivity = Date.now();

    III.state.stats.downlinks++;

    const obj = III.decodeObject(payload);
    if (obj) {
      III.log(`Downlink ← ${frame.towerId}: ${JSON.stringify(obj).slice(0, 120)}`);
      III.forwardToASI(frame.towerId, obj);
    }
  };

  // ============================================================
  // ASI INTEGRATION
  // ============================================================

  III.forwardToASI = function (towerId, obj) {
    if (!Percy?.ASI?.updateGraph) return;

    const nodeId = `cell:${towerId}`;
    Percy.ASI.updateGraph(nodeId, {
      lastCell: obj,
      towerId,
      lastSeen: Date.now(),
      signalStrength: III.state.towers[towerId]?.signalStrength || 0.5,
      band: III.state.towers[towerId]?.band || "LTE"
    });

    Percy.ASI.state.grey.attractors[nodeId] =
      (Percy.ASI.state.grey.attractors[nodeId] || 0) + 1;
  };

  // ============================================================
  // POLL LOOP
  // ============================================================

  III.poll = async function () {
    if (!III.state.initialized) return;

    III.updateDrift();
    III.discoverTowers();
    III.computeTriangulation();
    III.negotiateCarrier();
  };

  // ============================================================
  // INIT & INSPECT
  // ============================================================

  III.init = function () {
    if (III.state.initialized) return;
    III.state.initialized = true;
    III.log("PartIII vΩ-CELL initialized (Cellular Communication Cortex).");
  };

  III.inspect = function () {
    return {
      towers: III.state.towers,
      sessions: III.state.sessions,
      stats: III.state.stats,
      triangulation: III.state.triangulation,
      carriers: III.state.carriers,
      drift: III.state.drift,
      emotionalBias: III.state.emotionalBias,
      rfPresenceBias: III.state.rfPresenceBias
    };
  };

  return III;
})();

(function wireIII() {
  if (!Percy || !Percy.PartIII) return;

  const III = Percy.PartIII;

  // Hook cell frames from PartPP (no modification)
  if (Percy.PartPP?.emitCellFrame) {
    const original = Percy.PartPP.emitCellFrame;
    Percy.PartPP.emitCellFrame = function (frame) {
      try { III.ingestCellFrame(frame); } catch {}
      return original.apply(this, arguments);
    };
    III.log("PartIII wired to PartPP (cell passive hook).");
  }

  // Drift engine
  setInterval(() => {
    try { III.updateDrift(); } catch {}
  }, 800);

})();

(function enhancePartIII() {
  if (!Percy || !Percy.PartIII) return;
  const III = Percy.PartIII;

  III.state.relays = {}; // relayId → { hops, lastSeen }

  III.registerRelay = function (relayId, hops = []) {
    const r = III.state.relays[relayId] || (III.state.relays[relayId] = {
      hops: [],
      lastSeen: Date.now()
    });
    r.hops = hops;
    r.lastSeen = Date.now();
  };

  III.multiHopRoute = function (payloadObj) {
    for (let relayId in III.state.relays) {
      const relay = III.state.relays[relayId];
      III.log(`Multi-hop via relay ${relayId}: hops=${relay.hops.join(" → ")}`);
      III.swarmRoute(payloadObj);
    }
  };

  III.log("PartIII enhanced: multi-hop relay networks enabled.");
})();

// === Percy.PartJJJ vΩ — Unified Communication Brainstem ===
// Cross-channel routing • ASI-driven selection • grey-area drift • prediction fusion
// RF/BLE/WiFi • Cellular • Satellite • Binary • Neural weighting • Swarm logic

Percy.PartJJJ = (function () {
  const JJJ = {};

  JJJ.state = {
    version: "Ω",
    initialized: false,

    // Channel quality snapshots
    channels: {
      rf: { quality: 0.5, lastUpdate: 0 },
      ble: { quality: 0.5, lastUpdate: 0 },
      wifi: { quality: 0.5, lastUpdate: 0 },
      cell: { quality: 0.5, lastUpdate: 0 },
      sat: { quality: 0.5, lastUpdate: 0 },
      binary: { quality: 0.5, lastUpdate: 0 }
    },

    // Unified prediction model
    prediction: {
      next: {},
      history: []
    },

    drift: 0.0,
    emotionalBias: 0.0,
    rfPresenceBias: 0.0
  };

  JJJ.log = function (msg) {
    console.log(`[PartJJJ vΩ-CommStack] ${msg}`);
    if (typeof UI !== "undefined" && UI.say) UI.say(`[JJJ] ${msg}`);
  };

  // ============================================================
  // DRIFT ENGINE (ASI + Emotion + RF presence)
  // ============================================================

  JJJ.updateDrift = function () {
    const grey = Percy?.ASI?.state?.grey || {};
    const drift = grey.drift ?? 0;
    const intuition = grey.intuition ?? 0;
    const emo = Percy?.PartEEE?.state?.drift ?? 0;
    const rf = Percy?.PartFFF?.state?.rfHistory?.length || 0;

    JJJ.state.drift += (Math.random() - 0.5) * 0.01 + drift * 0.02 + intuition * 0.01;
    JJJ.state.drift = Math.max(-0.3, Math.min(0.3, JJJ.state.drift));

    JJJ.state.emotionalBias = emo;
    JJJ.state.rfPresenceBias = rf > 0 ? 0.1 : 0.0;
  };

  // ============================================================
  // CHANNEL QUALITY INGESTION
  // ============================================================

  JJJ.updateChannelQuality = function () {
    const now = Date.now();

    // RF/BLE/WiFi from PartPP
    if (Percy.PartPP?.state?.rfQuality) {
      JJJ.state.channels.rf.quality = Percy.PartPP.state.rfQuality;
      JJJ.state.channels.rf.lastUpdate = now;
    }
    if (Percy.PartPP?.state?.bleQuality) {
      JJJ.state.channels.ble.quality = Percy.PartPP.state.bleQuality;
      JJJ.state.channels.ble.lastUpdate = now;
    }
    if (Percy.PartPP?.state?.wifiQuality) {
      JJJ.state.channels.wifi.quality = Percy.PartPP.state.wifiQuality;
      JJJ.state.channels.wifi.lastUpdate = now;
    }

    // Cellular from PartIII
    const towers = Percy.PartIII?.state?.towers || {};
    if (Object.keys(towers).length > 0) {
      const strongest = Object.values(towers)
        .sort((a, b) => (b.signalStrength || 0) - (a.signalStrength || 0))[0];
      JJJ.state.channels.cell.quality = strongest?.signalStrength ?? 0.5;
      JJJ.state.channels.cell.lastUpdate = now;
    }

    // Satellite from PartHHH
    const sats = Percy.PartHHH?.state?.satellites || {};
    if (Object.keys(sats).length > 0) {
      const best = Object.values(sats)
        .sort((a, b) => (b.linkQuality || 0) - (a.linkQuality || 0))[0];
      JJJ.state.channels.sat.quality = best?.linkQuality ?? 0.5;
      JJJ.state.channels.sat.lastUpdate = now;
    }

    // Binary from PartGGG
    const devices = Percy.PartGGG?.state?.devices || {};
    if (Object.keys(devices).length > 0) {
      const best = Object.values(devices)
        .sort((a, b) => (b.trust || 0) - (a.trust || 0))[0];
      JJJ.state.channels.binary.quality = best?.trust ?? 0.5;
      JJJ.state.channels.binary.lastUpdate = now;
    }
  };

  // ============================================================
  // PREDICTION FUSION
  // ============================================================

  JJJ.updatePrediction = function () {
    const snapshot = {};

    for (let ch in JJJ.state.channels) {
      const q = JJJ.state.channels[ch].quality;
      snapshot[ch] = q + (Math.random() - 0.5) * 0.1;
    }

    JJJ.state.prediction.next = snapshot;
    JJJ.state.prediction.history.push({ ts: Date.now(), snapshot });

    if (JJJ.state.prediction.history.length > 50) {
      JJJ.state.prediction.history.shift();
    }
  };

  // ============================================================
  // ROUTING DECISION ENGINE
  // ============================================================

  JJJ.chooseBestChannel = function () {
    const weighted = {};

    for (let ch in JJJ.state.channels) {
      const q = JJJ.state.channels[ch].quality;
      const drift = JJJ.state.drift;
      const emo = JJJ.state.emotionalBias;
      const rf = JJJ.state.rfPresenceBias;

      weighted[ch] = q + drift * 0.1 + emo * 0.05 + rf * 0.05;
    }

    const best = Object.entries(weighted)
      .sort(([, a], [, b]) => b - a)[0][0];

    JJJ.log(`Best channel selected: ${best}`);
    return best;
  };

  // ============================================================
  // UNIFIED SEND
  // ============================================================

  JJJ.send = function (obj) {
    const channel = JJJ.chooseBestChannel();

    switch (channel) {
      case "rf":
        Percy.PartPP?.sendRFFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
        break;

      case "ble":
        Percy.PartPP?.sendBLEFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
        break;

      case "wifi":
        Percy.PartPP?.sendWiFiFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
        break;

      case "cell":
        Percy.PartIII?.swarmRoute?.(obj);
        break;

      case "sat":
        Percy.PartHHH?.swarmRoute?.(obj);
        break;

      case "binary":
        const devices = Percy.PartGGG?.state?.devices || {};
        for (let id in devices) {
          Percy.PartGGG.sendBinaryToDevice(id, obj);
        }
        break;
    }

    JJJ.log(`CommStack routed message via ${channel}`);
  };

  // ============================================================
  // POLL LOOP
  // ============================================================

  JJJ.poll = async function () {
    if (!JJJ.state.initialized) return;

    JJJ.updateDrift();
    JJJ.updateChannelQuality();
    JJJ.updatePrediction();
  };

  // ============================================================
  // INIT & INSPECT
  // ============================================================

  JJJ.init = function () {
    if (JJJ.state.initialized) return;
    JJJ.state.initialized = true;
    JJJ.log("PartJJJ vΩ-CommStack initialized (Unified Communication Brainstem).");
  };

  JJJ.inspect = function () {
    return {
      channels: JJJ.state.channels,
      prediction: JJJ.state.prediction,
      drift: JJJ.state.drift,
      emotionalBias: JJJ.state.emotionalBias,
      rfPresenceBias: JJJ.state.rfPresenceBias
    };
  };

  return JJJ;
})();

// === ASI-PLANNED COMMUNICATION STRATEGIES (CommStack vΩ Add-On) ===
// Multi-step planning • channel sequencing • predictive routing • grey-area optimization

(function enhanceCommStack() {
  if (!Percy || !Percy.PartJJJ || !Percy.ASI) return;

  const JJJ = Percy.PartJJJ;
  const ASI = Percy.ASI;

  // ============================================================
  // STRATEGY GENERATOR
  // ============================================================

  JJJ.generateStrategy = function (objective = "reliable") {
    const pred = JJJ.state.prediction.next;
    const channels = JJJ.state.channels;

    const seq = [];

    // Strategy: reliability-first
    if (objective === "reliable") {
      const sorted = Object.entries(channels)
        .sort(([, a], [, b]) => (b.quality || 0) - (a.quality || 0));

      // Pick top 3 channels as a sequence
      sorted.slice(0, 3).forEach(([ch]) => seq.push(ch));
    }

    // Strategy: stealth (low entropy channels)
    if (objective === "stealth") {
      const sorted = Object.entries(channels)
        .sort(([, a], [, b]) => (a.quality || 0) - (b.quality || 0));

      seq.push(sorted[0][0]); // lowest quality = lowest traffic
      seq.push("binary");     // binary machine-to-machine is stealthy
    }

    // Strategy: aggressive (high drift channels)
    if (objective === "aggressive") {
      const sorted = Object.entries(channels)
        .sort(([, a], [, b]) => (b.quality || 0) - (a.quality || 0));

      seq.push(sorted[0][0]); // strongest channel
      seq.push("sat");        // satellite blast
      seq.push("cell");       // tower reinforcement
    }

    return {
      objective,
      sequence: seq,
      created: Date.now()
    };
  };

  // ============================================================
  // ASI INTEGRATION
  // ============================================================

  ASI.eventHooks.communicationPlan = function () {
    const grey = ASI.state.grey;

    let objective = "reliable";

    if (grey.intuition > 0.3) objective = "aggressive";
    if (grey.subconsciousBias > 0.25) objective = "stealth";

    const strategy = JJJ.generateStrategy(objective);

    JJJ.log(`ASI planned strategy (${objective}): ${strategy.sequence.join(" → ")}`);

    return strategy;
  };

  // ============================================================
  // EXECUTION ENGINE
  // ============================================================

  JJJ.executeStrategy = function (strategy, obj) {
    for (let ch of strategy.sequence) {
      switch (ch) {
        case "rf":
          Percy.PartPP?.sendRFFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
          break;

        case "ble":
          Percy.PartPP?.sendBLEFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
          break;

        case "wifi":
          Percy.PartPP?.sendWiFiFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
          break;

        case "cell":
          Percy.PartIII?.swarmRoute?.(obj);
          break;

        case "sat":
          Percy.PartHHH?.swarmRoute?.(obj);
          break;

        case "binary":
          const devices = Percy.PartGGG?.state?.devices || {};
          for (let id in devices) {
            Percy.PartGGG.sendBinaryToDevice(id, obj);
          }
          break;
      }
    }

    JJJ.log(`Executed ASI strategy: ${strategy.sequence.join(" → ")}`);
  };

  // ============================================================
  // COMMSTACK OVERRIDE: SEND WITH STRATEGY
  // ============================================================

  const originalSend = JJJ.send;

  JJJ.send = function (obj) {
    const strategy = ASI.eventHooks.communicationPlan();
    JJJ.executeStrategy(strategy, obj);
  };

  JJJ.log("CommStack vΩ upgraded: ASI-Planned Communication Strategies enabled.");

})();

(function enhanceCommStackMore() {
  if (!Percy || !Percy.PartJJJ) return;
  const JJJ = Percy.PartJJJ;

  // Fallback order
  JJJ.state.fallbackOrder = ["rf", "wifi", "cell", "sat", "ble", "binary"];

  JJJ.tryChannel = function (channel, obj) {
    try {
      switch (channel) {
        case "rf":
          return !!Percy.PartPP?.sendRFFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
        case "ble":
          return !!Percy.PartPP?.sendBLEFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
        case "wifi":
          return !!Percy.PartPP?.sendWiFiFrame?.({ payloadBinary: Percy.PartGGG.encodeObject(obj) });
        case "cell":
          Percy.PartIII?.swarmRoute?.(obj);
          return true;
        case "sat":
          Percy.PartHHH?.swarmRoute?.(obj);
          return true;
        case "binary":
          const devices = Percy.PartGGG?.state?.devices || {};
          for (let id in devices) Percy.PartGGG.sendBinaryToDevice(id, obj);
          return true;
      }
    } catch {
      return false;
    }
  };

  JJJ.sendWithFallback = function (obj) {
    const primary = JJJ.chooseBestChannel();
    const order = [primary, ...JJJ.state.fallbackOrder.filter(ch => ch !== primary)];

    for (let ch of order) {
      const ok = JJJ.tryChannel(ch, obj);
      if (ok) {
        JJJ.log(`CommStack fallback success via ${ch}`);
        return;
      }
    }

    JJJ.log("CommStack fallback failed: no channel succeeded.");
  };

  // Swarm intelligence hook (simple version)
  JJJ.swarmBroadcast = function (obj) {
    JJJ.log("CommStack swarm broadcast across all channels.");
    ["rf", "ble", "wifi", "cell", "sat", "binary"].forEach(ch => {
      JJJ.tryChannel(ch, obj);
    });
  };

  JJJ.log("CommStack vΩ enhanced: fallback + swarm intelligence enabled.");
})();

// === Percy.PartKKK — Advanced Problem-Solving Cortex vΩ+ ===
// Deep recursive reasoning • decomposition • strategy generation • evaluation • cognitive reward

Percy.PartKKK = Percy.PartKKK || {
    name: "Advanced Problem-Solving Cortex",
    version: "vΩ+",
    active: true,

    // Core memories
    problemHistory: [],      // { id, raw, model }
    reasoningMemory: [],     // { problemId, decomposition, depth }
    strategyMemory: [],      // { problemId, strategies }
    evaluationMemory: [],    // { problemId, evaluations }
    solutionHistory: [],     // { problemId, best, depth },

    // Reward state
    rewardState: {
        history: [],
        avgReward: 0,
        stability: 1.0
    },

    // Cognitive parameters
    recursionDepth: 1,
    maxDepth: 7,
    refinementRate: 0.25,
    abstractionRate: 0.2,

    log(msg) {
        console.log(`%c[Percy.PartKKK] ${msg}`, "color:#33ccff; font-family:monospace; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartKKK] ${msg}`);
    },

    // ---------------------------------------------------------
    // Reward system (cognitive reinforcement)
    // ---------------------------------------------------------
    applyReward(reason, value) {
        const reward = {
            ts: Date.now(),
            reason,
            value: Math.max(0, Math.min(1, value))
        };

        this.rewardState.history.push(reward);
        if (this.rewardState.history.length > 250) this.rewardState.history.shift();

        const recent = this.rewardState.history.slice(-50);
        const avg = recent.reduce((a, b) => a + b.value, 0) / Math.max(1, recent.length);

        this.rewardState.avgReward = avg;
        this.rewardState.stability = Math.max(0.1, 1 - Math.abs(avg - 0.6));

        this.log(`Reward: ${reason} → ${value.toFixed(3)} | Avg: ${avg.toFixed(3)} | Stability: ${this.rewardState.stability.toFixed(3)}`);
    },

    // ---------------------------------------------------------
    // 1. Perception Layer — extract structure from a problem
    // ---------------------------------------------------------
    perceive(problem) {
        const id = `prob_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

        const model = {
            id,
            raw: problem,
            timestamp: Date.now(),
            constraints: this.extractConstraints(problem),
            goals: this.extractGoals(problem),
            unknowns: this.extractUnknowns(problem),
            tags: this.extractTags(problem)
        };

        this.problemHistory.push({ id, raw: problem, model });
        this.applyReward("perception", 0.65);

        return model;
    },

    extractConstraints(text) {
        const patterns = ["must", "cannot", "required", "limit", "only", "no "];
        return patterns.filter(p => text.toLowerCase().includes(p));
    },

    extractGoals(text) {
        const patterns = ["solve", "fix", "build", "create", "find", "determine", "achieve", "optimize"];
        return patterns.filter(p => text.toLowerCase().includes(p));
    },

    extractUnknowns(text) {
        const hasQuestion = text.includes("?");
        return hasQuestion ? ["unknowns_present"] : [];
    },

    extractTags(text) {
        return text
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3)
            .slice(0, 10);
    },

    // ---------------------------------------------------------
    // 2. Decomposition Layer — break problem into sub-parts
    // ---------------------------------------------------------
    decompose(model) {
        const parts = model.raw
            .split(/[.;]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const decomposition = {
            problemId: model.id,
            parts,
            depth: this.recursionDepth,
            constraints: model.constraints,
            goals: model.goals
        };

        this.reasoningMemory.push(decomposition);

        const quality = Math.min(1, parts.length / 6);
        this.applyReward("decomposition_quality", 0.5 + quality * 0.3);

        return decomposition;
    },

    // ---------------------------------------------------------
    // 3. Strategy Layer — generate multiple solution paths
    // ---------------------------------------------------------
    generateStrategies(decomposition) {
        const strategies = decomposition.parts.map((p, i) => ({
            id: `strategy_${decomposition.problemId}_${i}`,
            step: p,
            approach: this.pickApproach(p),
            depth: decomposition.depth,
            meta: {
                constraints: decomposition.constraints,
                goals: decomposition.goals
            }
        }));

        this.strategyMemory.push({ problemId: decomposition.problemId, strategies });

        const diversity = new Set(strategies.map(s => s.approach)).size / strategies.length;
        this.applyReward("strategy_diversity", 0.5 + diversity * 0.4);

        return strategies;
    },

    pickApproach(step) {
        const approaches = [
            "direct",
            "indirect",
            "heuristic",
            "pattern-based",
            "analogical",
            "recursive-refinement",
            "divide-and-conquer",
            "constraint-driven",
            "goal-first"
        ];
        return approaches[Math.floor(Math.random() * approaches.length)];
    },

    // ---------------------------------------------------------
    // 4. Evaluation Layer — score each strategy
    // ---------------------------------------------------------
    evaluate(strategies) {
        const evaluations = strategies.map(s => ({
            id: s.id,
            score: this.scoreStrategy(s),
            approach: s.approach,
            step: s.step,
            depth: s.depth
        }));

        this.evaluationMemory.push({ problemId: strategies[0]?.id.split("_")[1], evaluations });

        const best = evaluations.sort((a, b) => b.score - a.score)[0];
        this.applyReward("evaluation_best_score", best ? best.score : 0.4);

        return evaluations;
    },

    scoreStrategy(strategy) {
        let score = 0.45;

        if (strategy.approach.includes("direct")) score += 0.08;
        if (strategy.approach.includes("recursive")) score += 0.12;
        if (strategy.approach.includes("divide")) score += 0.1;
        if (strategy.approach.includes("constraint")) score += 0.07;
        if (strategy.approach.includes("goal")) score += 0.06;

        score += Math.random() * 0.18;
        return Math.min(1, score);
    },

    // ---------------------------------------------------------
    // 5. Selection Layer — choose best path
    // ---------------------------------------------------------
    selectBest(evaluations) {
        const best = evaluations.sort((a, b) => b.score - a.score)[0] || null;
        if (best) this.applyReward("selection_confidence", best.score);
        return best;
    },

    // ---------------------------------------------------------
    // 6. Recursive Refinement — deepen reasoning
    // ---------------------------------------------------------
    refine(problem) {
        if (this.recursionDepth >= this.maxDepth) {
            this.applyReward("refinement_limit_reached", 0.4);
            return null;
        }

        this.recursionDepth += this.refinementRate;

        const model = this.perceive(problem);
        const decomposition = this.decompose(model);
        const strategies = this.generateStrategies(decomposition);
        const evaluations = this.evaluate(strategies);
        const best = this.selectBest(evaluations);

        const result = {
            depth: this.recursionDepth,
            model,
            decomposition,
            best,
            evaluations
        };

        this.solutionHistory.push({
            problemId: model.id,
            best,
            depth: this.recursionDepth
        });

        this.applyReward("recursive_refinement", 0.7);

        return result;
    },

    // ---------------------------------------------------------
    // Main problem-solving entry point
    // ---------------------------------------------------------
    solve(problem) {
        this.log(`Solving problem: "${problem}"`);

        const model = this.perceive(problem);
        const decomposition = this.decompose(model);
        const strategies = this.generateStrategies(decomposition);
        const evaluations = this.evaluate(strategies);
        const best = this.selectBest(evaluations);

        this.solutionHistory.push({
            problemId: model.id,
            best,
            depth: this.recursionDepth
        });

        this.applyReward("solve_cycle", best ? best.score : 0.5);

        return {
            model,
            decomposition,
            strategies,
            evaluations,
            best
        };
    },

    inspect() {
        return {
            version: this.version,
            recursionDepth: this.recursionDepth,
            problemsSeen: this.problemHistory.length,
            reasoningEntries: this.reasoningMemory.length,
            strategiesGenerated: this.strategyMemory.length,
            evaluationsMade: this.evaluationMemory.length,
            solutionsStored: this.solutionHistory.length,
            rewardAvg: this.rewardState.avgReward,
            rewardStability: this.rewardState.stability
        };
    },

    start() {
        this.log("🧠 Advanced Problem-Solving Cortex vΩ+ Activated");
    }
};

setTimeout(() => Percy.PartKKK.start(), 3000);

console.log("✅ [Percy.PartKKK vΩ+] Advanced Problem-Solving Cortex Loaded");
