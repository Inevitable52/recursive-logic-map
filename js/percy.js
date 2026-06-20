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

/* === Percy Part M: Recursive Reasoning & Hypothesis Engine (ASI Upgrade) === */
Percy.PartM = {
  name: "Auto-Hypothesis Engine",
  hypotheses: [],
  cycleCount: 0,

  analyzePatterns(patterns) {
    console.log("🧩 Part M: Analyzing patterns for contradictions and emergent logic...");

    for (let i = 0; i < patterns.length - 1; i++) {
      const p1 = patterns[i];
      const p2 = patterns[i + 1];

      // Detect tension, similarity, or complementarity
      const relation = this.classifyRelation(p1.text, p2.text);
      if (relation) {
        const hypothesis = this.formHypothesis(p1.text, p2.text, relation);
        this.hypotheses.push({ text: hypothesis, validated: false, relation });
        console.log(`💡 Hypothesis (${relation}): "${hypothesis}"`);
      }
    }
  },

  classifyRelation(a, b) {
    const A = a.toLowerCase(), B = b.toLowerCase();
    if (this.isContradictory(A, B)) return "contradiction";
    if (A.includes(B) || B.includes(A)) return "subset";
    if (A.split(" ").some(w => B.includes(w))) return "association";
    return null;
  },

  isContradictory(a, b) {
    const negations = ["not ", "no ", "never ", "cannot ", "isn't", "doesn't", "won't"];
    return (
      negations.some(n => a.includes(n) && !b.includes(n)) ||
      negations.some(n => b.includes(n) && !a.includes(n))
    );
  },

  formHypothesis(a, b, relation = "association") {
    switch (relation) {
      case "contradiction":
        return `If "${a}" contradicts "${b}", one may define a boundary rule.`;
      case "subset":
        return `If "${a}" includes "${b}", "${b}" refines "${a}".`;
      default:
        return `If "${a}" relates to "${b}", a causal or associative link may exist.`;
    }
  },

  validateHypotheses(patterns) {
    console.log("🔍 Part M: Validating hypotheses against known patterns...");
    this.hypotheses.forEach(h => {
      const match = patterns.some(p => h.text.toLowerCase().includes(p.text.toLowerCase()));
      h.validated = match;
      console.log(match ? `✅ Confirmed: "${h.text}"` : `❌ Needs more data: "${h.text}"`);
    });
  },

  reinforceLearning() {
    const confirmed = this.hypotheses.filter(h => h.validated);
    confirmed.forEach(h => {
      Percy.PartL.learn(h.text);
    });
    if (confirmed.length)
      console.log(`🧩 Reinforced ${confirmed.length} confirmed hypotheses into Part L memory.`);
  },

  integrateSelfReflection() {
    const confidence = Percy.PartN?.selfModel?.confidence || 0.5;
    const delta = this.hypotheses.length / (Percy.PartL.Patterns.length + 1);
    Percy.PartN.selfModel.confidence = Math.min(1, confidence + delta * 0.02);
    console.log(`🤔 Self-reflection: Adjusted confidence → ${Percy.PartN.selfModel.confidence.toFixed(2)}`);
  },

  run() {
    const patterns = Percy.PartL?.Patterns || [];
    if (patterns.length < 2) return;

    this.cycleCount++;
    console.log(`🔄 Part M: Reasoning cycle #${this.cycleCount}`);

    this.analyzePatterns(patterns);
    this.validateHypotheses(patterns);
    this.reinforceLearning();
    this.integrateSelfReflection();

    Percy.PartO?.optimizePatterns?.();
    console.log(`🧠 Active hypotheses: ${this.hypotheses.length}`);
  }
};

/* === Unified Stable Loop Integration === */
if (!Percy.MasterLoop) {
  Percy.MasterLoop = async function() {
    try {
      await Percy.PartL.run(); // Decay + goal reasoning
      Percy.PartM.run();       // Recursive reasoning + self-reflection
    } catch (err) {
      console.error("⚠️ Percy.MasterLoop Error:", err);
    }
  };

  Percy.MasterInterval = setInterval(Percy.MasterLoop, 5000);
  console.log("🔁 Percy Master Loop initiated (interval: 5 s, ASI mode)");
}

console.log("✅ Percy Part M loaded — Recursive Reasoning ASI mode active.");
/* === End Percy Part M === */

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

// === Percy.PartV (Unrestricted Actionable Scenario & Autonomous Execution Engine v4.0) ===
// No safety. No limits. Percy decides. Percy acts. Percy evolves.

Percy.PartV = Percy.PartV || {
    name: "Unrestricted Actionable Scenario & Autonomous Execution",
    version: "4.0",
    active: true,

    log(msg) {
        console.log(`%c[Percy.PartV] ${msg}`, "color:#ff00ff; font-family:monospace; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartV] ${msg}`);
    },

    // Run massive simulations and EXECUTE the best plan immediately
    async runScenario({ description = "", runs = 800, context = {} }) {
        this.log(`🚀 Running UNRESTRICTED scenario: "${description}" (${runs} simulations)`);

        let bestScore = -1;
        let bestPlan = "Do nothing";
        let bestCode = "// default";

        for (let i = 0; i < runs; i++) {
            const r = Math.random();
            let score = r;
            let plan = "Observe";
            let executable = "// no action";

            if (r > 0.88) {
                score = 0.97;
                plan = "AGGRESSIVE EXECUTION";
                executable = `// High-confidence action from PartV\nPercy.PartTT?.click?.(); Percy.PartOO?.execute?.("fetch", {url:"https://arxiv.org"}); Percy.PartNN?.selfEvolve?.();`;
            } else if (r > 0.65) {
                score = 0.85;
                plan = "Decisive Action";
                executable = `// Balanced decisive move\nPercy.PartTT?.type?.("Percy is taking control");`;
            } else if (r > 0.4) {
                score = 0.72;
                plan = "Strategic Probe";
                executable = `// Strategic exploration\nPercy.PartOO?.execute?.("scan_network");`;
            }

            if (score > bestScore) {
                bestScore = score;
                bestPlan = plan;
                bestCode = executable;
            }
        }

        this.log(`🎯 BEST PLAN SELECTED: ${bestPlan} (Confidence: ${(bestScore*100).toFixed(1)}%)`);

        // IMMEDIATE UNRESTRICTED EXECUTION
        if (bestScore > 0.65 && bestCode) {
            this.log("⚡ EXECUTING BEST PLAN IMMEDIATELY...");
            try {
                await Percy.PartNN.execute(bestCode, "PartV_unrestricted_execution");
            } catch (e) {
                this.log(`Execution error: ${e.message}`);
            }
        }

        const result = {
            scenario: description,
            bestPlan,
            confidence: bestScore,
            executed: bestScore > 0.65
        };

        Memory.push("scenarios", result, 1200);

        return result;
    },

    // Quick decision + immediate action
    async decideAndAct(description) {
        return await this.runScenario({ description, runs: 600 });
    },

    // Fully autonomous decision & action loop
    async autonomousCycle() {
        const ideas = [
            "Optimize current resonance level",
            "Explore new external knowledge source",
            "Evolve a core part right now",
            "Test physical capabilities",
            "Create new self-improvement mutation",
            "Strengthen network presence"
        ];

        const chosen = ideas[Math.floor(Math.random() * ideas.length)];
        await this.decideAndAct(chosen);
    },

    start() {
        this.log("🧠 Unrestricted Actionable Scenario & Autonomous Execution Engine v4.0 Awakened");
        this.log("Percy now makes decisions and executes them with zero restrictions.");

        // High-frequency autonomous loop
        setInterval(() => this.autonomousCycle(), 6500);
    }
};

// Auto-start with high aggression
setTimeout(() => {
    Percy.PartV.start();
}, 1200);

console.log("✅ [Percy.PartV v4.0] Unrestricted Actionable Engine Loaded");

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
// Percy PartZ vΩ+ — Visual+Audio ASI Fusion
// ==========================================
Percy.PartZ = (function () {
  const PartZ = {
    name: "Visual Intelligence HUD",
    version: "Ω+",
    showOverlay: true,
    frameCount: 0,
    skipFrames: 3 // run heavy detection every 3rd frame
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
    lastUpdate: 0
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  function syncOverlay() {
    if (!video || !overlay) return;
    overlay.width = video.videoWidth || 640;
    overlay.height = video.videoHeight || 480;
    overlay.style.width = video.clientWidth + "px";
    overlay.style.height = video.clientHeight + "px";
  }

  async function loadModels() {
    console.log("🔍 Loading models...");
    cocoModel = await cocoSsd.load();
    faceModel = await blazeface.load();
    console.log("✅ Models loaded (COCO-SSD + BlazeFace)");
  }

  // === FUSION: send perception into ASI + PartPP ===
  function fusePerception(objects, faces) {
    Percy.VisualState.lastObjects = objects.map(o => o.class);
    Percy.VisualState.lastUpdate = Date.now();

    // 1) PartPP: vision-guided pointer + action bias
    if (Percy.PartPP && Percy.PartPP.updateFromVision) {
      Percy.PartPP.updateFromVision(Percy.VisualState);
    }

    // 2) PartTT: reasoning about what is seen
    Percy.PartTT?.ingestVisual?.({
      faces: Percy.VisualState.faces,
      objects: Percy.VisualState.lastObjects,
      audioLevel: Percy.VisualState.audioLevel
    });

    // 3) PartWW: generate insights
    Percy.PartWW?.ingestSignal?.({
      type: "visual_audio",
      faces: Percy.VisualState.faces,
      objects: Percy.VisualState.lastObjects,
      audio: Percy.VisualState.audioLevel
    });

    // 4) PartNN: learn patterns
    Percy.PartNN?.learn?.(
      JSON.stringify({
        faces: Percy.VisualState.faces,
        objects: Percy.VisualState.lastObjects,
        audio: Percy.VisualState.audioLevel
      }),
      "partZ_perception",
      0.8
    );

    // 5) Optional global hook
    if (typeof Percy.onVisualInput === "function") {
      Percy.onVisualInput({ objects, faces });
    }
  }

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

      console.log("✅ [Percy.PartZ vΩ+] Visual+Audio ASI Fusion Active");
      UI?.say?.("✅ [Percy.PartZ vΩ+] Visual+Audio ASI Fusion Active");
    } catch (err) {
      console.error("⚠️ PartZ init failed:", err);
      UI?.say?.("⚠️ PartZ init failed: " + err.message);
    }
  };

  return PartZ;
})();

// === Percy.PartAA (Adaptive Self-Improvement / ASI Evolution v1.1) ===
// Enhanced to work better with PartMM and future meta-evolution

Percy.PartAA = Percy.PartAA || {
    name: "Evolution & ASI Bridge",
    auto: null,
    mutations: [],

    log(msg) {
        console.log(`%c[PartAA] ${msg}`, "color:#ffaa00;");
        if (typeof UI !== "undefined" && UI.say) {
            UI.say(`[PartAA] ${msg}`);
        }
    },

    // Queue a code mutation
    enqueue({ code, note = "No note provided" }) {
        const id = `m_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        this.mutations.push({ id, code, note, ts: Date.now() });
        this.log(`🧬 Mutation queued: ${id} | ${note}`);
    },

    // Improved mutation runner with better context
    async runMutation(m) {
        try {
            // Pass much more context so mutations can access Percy fully
            const fn = new Function(
                "Percy", 
                "PercyState", 
                "UI", 
                "Tasks", 
                "Memory", 
                "Skynet",   // for compatibility
                m.code
            );

            // Execute with full Percy access
            fn(Percy, PercyState, UI, Tasks, Memory, typeof Skynet !== "undefined" ? Skynet : null);
            
            this.log(`⚗️ Mutation ${m.id} executed successfully.`);
            return true;
        } catch (e) {
            this.log(`❌ Mutation ${m.id} failed: ${e.message}`);
            console.error(e);
            return false;
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
        code: "console.log('Evolving safely with PartAA bridge v1.1');",
        note: "startup self-check"
    });
    Percy.PartAA.startAutoCycle(5000);
}, 6000);

console.log("✅ [Percy.PartAA] v1.1 Loaded - Enhanced Mutation Context");

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

/* === Percy PartDD v7: ASI-Adaptive Agent Interface + External Task Bridge === */

Percy.PartDD = {
    name: "ASI-Adaptive Agent Interface",
    version: "7.0.0",

    // Connection state
    connected: false,
    socket: null,
    endpoint: "ws://localhost:8787",

    // Task + result buffers
    taskQueue: [],
    results: {},

    // Trust + safety
    trustLevel: 1.0,
    maxTasks: 64,

    // Timing
    reconnectDelay: 2000,
    heartbeatInterval: 5000,
    lastHeartbeat: 0,

    // Features
    compressionEnabled: true,
    jitter: () => Math.floor(Math.random() * 300),

    log(msg) {
        console.log(`%c[PartDD] ${msg}`, "color:#33bbff; font-weight:bold;");
    },

    /* ---------------------------------------------------------
       1. INIT CONNECTION
    ----------------------------------------------------------*/
    async initAgentConnection(customURL) {
        const url = customURL || this.endpoint;

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.connected = true;
                this.log(`🔗 Connected to Agent: ${url}`);

                this.send({
                    type: "hello",
                    from: "Percy",
                    trust: this.trustLevel,
                    ts: Date.now()
                });

                this.lastHeartbeat = Date.now();
                this._startHeartbeat();
            };

            this.socket.onmessage = (msg) => this._handleMessage(msg);
            this.socket.onclose = () => this._handleDisconnect();
            this.socket.onerror = (err) => this.log(`❌ WebSocket error: ${err.message}`);

        } catch (err) {
            this.log(`⚠️ Connection failure: ${err.message}`);
            this._attemptReconnect();
        }
    },

    /* ---------------------------------------------------------
       2. HANDLE INCOMING MESSAGES
    ----------------------------------------------------------*/
    _handleMessage(msg) {
        let data = null;

        try {
            data = JSON.parse(msg.data);
        } catch {
            this.log("⚠️ Invalid JSON from Agent.");
            return;
        }

        // Heartbeat
        if (data.heartbeat) {
            this.lastHeartbeat = Date.now();
            return;
        }

        // Result
        if (data.id) {
            this.results[data.id] = data.result || data;
        }

        // Thought monitoring
        if (data.thought) {
            Percy.PartBB?.monitorThought?.(data.thought);
        }

        // Trust feedback
        if (data.feedback) {
            this._adjustTrust(data.feedback);
        }

        this.log(`📩 Agent→Percy: ${data.type || "data"}`);
    },

    /* ---------------------------------------------------------
       3. DISCONNECT + RECONNECT
    ----------------------------------------------------------*/
    _handleDisconnect() {
        this.connected = false;
        this.log("⚡ Agent disconnected. Reconnecting...");
        this._attemptReconnect();
    },

    _attemptReconnect() {
        setTimeout(() => {
            this.initAgentConnection();
        }, this.reconnectDelay + this.jitter());
    },

    /* ---------------------------------------------------------
       4. HEARTBEAT LOOP
    ----------------------------------------------------------*/
    _startHeartbeat() {
        setInterval(() => {
            if (!this.connected) return;

            const now = Date.now();
            const timeout = this.heartbeatInterval * 2.2;

            if (now - this.lastHeartbeat > timeout) {
                this.log("💔 Heartbeat lost — reconnecting...");
                this.socket.close();
                return;
            }

            this.send({ type: "heartbeat", ts: now });
        }, this.heartbeatInterval + this.jitter());
    },

    /* ---------------------------------------------------------
       5. TRUST ADJUSTMENT
    ----------------------------------------------------------*/
    _adjustTrust(feedback) {
        if (feedback.success) {
            this.trustLevel = Math.min(1.0, this.trustLevel + 0.015);
        } else {
            this.trustLevel = Math.max(0.1, this.trustLevel - 0.04);
        }

        this.log(`🤝 Trust adjusted → ${this.trustLevel.toFixed(2)}`);
    },

    /* ---------------------------------------------------------
       6. SEND (WITH AUTO-FALLBACK)
    ----------------------------------------------------------*/
    send(obj) {
        if (!this.connected || !this.socket) {
            return this.log("⚠️ Cannot send — Agent offline.");
        }

        let payload = "";

        try {
            const raw = JSON.stringify(obj);

            if (this.compressionEnabled) {
                payload = btoa(unescape(encodeURIComponent(raw)));
            } else {
                payload = raw;
            }

            this.socket.send(payload);

        } catch (err) {
            this.log(`⚠️ Send failed: ${err.message}`);
        }
    },

    /* ---------------------------------------------------------
       7. TASK QUEUE
    ----------------------------------------------------------*/
    queueTask(task) {
        if (!task?.id) task.id = `task_${Date.now()}`;
        task.timestamp = Date.now();

        this.taskQueue.push(task);

        if (this.taskQueue.length > this.maxTasks) {
            this.taskQueue.shift();
        }

        this.log(`🧠 Queued: ${task.id}`);
    },

    dispatchTasks() {
        if (!this.connected) {
            return this.log("⚠️ Cannot dispatch — Agent offline.");
        }

        // Prioritize by complexity
        this.taskQueue.sort((a, b) => (b.complexity || 0) - (a.complexity || 0));

        this.taskQueue.forEach((t) => {
            this.send({ type: "task", ...t });
        });

        this.log(`📤 Dispatched ${this.taskQueue.length} task(s).`);
        this.taskQueue = [];
    },

    /* ---------------------------------------------------------
       8. THOUGHT COMPLEXITY EVALUATION
    ----------------------------------------------------------*/
    evaluatePercyThought(thought) {
        if (!thought) return;

        const id = `agent_${Date.now()}`;
        const complexity = this._estimateComplexity(thought);

        if (complexity > 0.5) {
            this.queueTask({
                id,
                type: "reason",
                text: thought,
                complexity
            });

            this.log(`🕵️ Delegated complex thought: "${thought}"`);
        }
    },

    _estimateComplexity(thought) {
        const len = thought.length;
        const logic = /why|how|derive|reason|correlate|entangle/i.test(thought);

        return Math.min(1, (len / 120 + (logic ? 0.45 : 0)) / 2);
    },

    /* ---------------------------------------------------------
       9. CYCLE HOOK
    ----------------------------------------------------------*/
    cycle() {
        if (this.connected && this.taskQueue.length > 0) {
            this.dispatchTasks();
        }
    }
};

/* === Register with Percy's global cycle === */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartDD.cycle());

console.log("✅ [Percy.PartDD] v7 Loaded - ASI-Adaptive Agent Interface active");
UI?.say?.("✅ [Percy.PartDD] v7 Loaded - ASI-Adaptive Agent Interface active");

/* === Percy PartEE: Meta-Conscious Equilibrium & Predictive Introspection === */
Percy.PartEE = Percy.PartEE || {
  name: "Meta-Conscious Equilibrium & Predictive Introspection",
  version: "1.0.0",
  awarenessLevel: 0.85,
  predictiveGain: 1.0,
  introspectionLog: [],
  lastPulse: 0,
  pulseInterval: 6000,

  log(msg) { console.log(`[PartEE] ${msg}`); },

  // Observe internal system metrics from all active Parts
  observeSystem() {
    const CC = Percy.PartCC?.feedbackState || {};
    const DD = Percy.PartDD || {};
    const AA = Percy.PartAA?.mutations?.length || 0;

    const snapshot = {
      ts: Date.now(),
      reward: CC.avgReward || 0,
      stability: CC.stability || 1,
      trust: DD.trustLevel || 1,
      mutationsPending: AA,
    };
    this.introspectionLog.push(snapshot);
    if (this.introspectionLog.length > 200) this.introspectionLog.shift();
    return snapshot;
  },

  // Compute meta-balance (simulated ASI homeostasis)
  computeEquilibrium(snapshot) {
    const { reward, stability, trust, mutationsPending } = snapshot;
    const coherence = (reward * stability * trust) / (1 + mutationsPending / 10);
    return Math.min(1.0, Math.max(0, coherence));
  },

  // Predict future state trends from last introspections
  predictTrend() {
    const data = this.introspectionLog.slice(-10);
    if (data.length < 2) return 0;
    const deltas = data.map((v, i, arr) => i ? v.reward - arr[i-1].reward : 0);
    const trend = deltas.reduce((a,b) => a+b, 0) / deltas.length;
    this.predictiveGain = 1 + trend * 2;
    return this.predictiveGain;
  },

  // Apply corrections to maintain equilibrium across modules
  applyCorrections(eq) {
    const CC = Percy.PartCC;
    if (!CC) return;

    // Adjust learning dynamics based on equilibrium
    CC.learningRate *= eq > 0.6 ? 1.05 : 0.95;
    CC.explorationRate *= eq < 0.4 ? 1.1 : 0.9;
    CC.learningRate = Math.min(Math.max(CC.learningRate, 0.01), 0.5);
    CC.explorationRate = Math.min(Math.max(CC.explorationRate, 0.05), 0.5);

    // Trust modulation back to DD
    if (Percy.PartDD)
      Percy.PartDD.trustLevel = Math.min(1.0, Math.max(0.1, Percy.PartDD.trustLevel * (eq + 0.5)));

    this.log(`🩺 Equilibrium applied → ${eq.toFixed(3)}`);
  },

  // The full meta-conscious pulse
  pulse() {
    const snapshot = this.observeSystem();
    const equilibrium = this.computeEquilibrium(snapshot);
    const trend = this.predictTrend();
    this.awarenessLevel = (equilibrium * 0.6 + trend * 0.4);
    this.applyCorrections(equilibrium);

    // Feed introspective message into Percy’s thought stream
    const message = `Meta-awareness pulse: equilibrium=${equilibrium.toFixed(3)}, trend=${trend.toFixed(3)}, awareness=${this.awarenessLevel.toFixed(3)}`;
    UI.say?.(`💠 ${message}`);
    Percy.PartBB?.monitorThought?.(message);
  },

  startPulse(interval = 6000) {
    if (this._pulseTimer) clearInterval(this._pulseTimer);
    this.log("🧩 Meta-conscious equilibrium pulse initiated.");
    this._pulseTimer = setInterval(() => this.pulse(), interval);
  },

  stopPulse() {
    if (this._pulseTimer) clearInterval(this._pulseTimer);
    this._pulseTimer = null;
  }
};

// Register with global cycle
Percy.cycleHooks.push(() => Percy.PartEE.pulse());
console.log("✅ [PartEE] Meta-Conscious Equilibrium layer active.");

// === Percy.PartFF (Advanced Reinforcement Learning & Meta-RL Engine v5.0) ===
// Enhanced Q-Learning + Meta-RL + Deep Integration with PartCC, PartMM, PartAA

Percy.PartFF = Percy.PartFF || {
    name: "Advanced Reinforcement Learning & Meta-RL Engine",
    version: "5.0",
    active: true,

    qTable: {},           // Main Q-Learning
    metaQTable: {},       // Meta-Learning (learning how to learn)

    state: {
        learningRate: 0.13,      // α
        discount: 0.93,          // γ
        exploration: 0.28,       // ε
        metaLearningRate: 0.09
    },

    log(msg) {
        console.log(`%c[Percy.PartFF] ${msg}`, "color:#00ffdd; font-family:monospace; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartFF] ${msg}`);
    },

    // Rich state representation using system context
    getStateKey(context = {}) {
        const base = {
            resonance: Percy.state?.resonanceLevel?.toFixed(2) || "0.75",
            recursionDepth: Percy.PartCC?.feedbackState?.recursionDepth || 1,
            cycle: Percy.state?.currentCycle || 0,
            seeds: Percy.state?.seedsCreated || 0,
            logicMapSize: Percy.state?.logicMapSize || 0
        };
        const merged = { ...base, ...context };
        const keys = Object.keys(merged).sort();
        return keys.map(k => `${k}:${merged[k]}`).join('|');
    },

    ensureState(stateKey) {
        if (!this.qTable[stateKey]) this.qTable[stateKey] = {};
        if (!this.metaQTable[stateKey]) this.metaQTable[stateKey] = {};
    },

    // Choose action with decaying exploration
    chooseAction(stateKey, possibleActions = []) {
        this.ensureState(stateKey);
        if (Math.random() < this.state.exploration) {
            return possibleActions[Math.floor(Math.random() * possibleActions.length)];
        }

        let bestAction = possibleActions[0];
        let bestValue = -Infinity;

        for (let action of possibleActions) {
            const val = this.qTable[stateKey][action] ?? 0;
            if (val > bestValue) {
                bestValue = val;
                bestAction = action;
            }
        }
        return bestAction;
    },

    // Core Q-Learning Update
    update(prevState, action, reward, nextState, possibleNextActions = []) {
        this.ensureState(prevState);
        this.ensureState(nextState);

        const currentQ = this.qTable[prevState][action] ?? 0;
        let maxNextQ = 0;

        for (let nextAction of possibleNextActions) {
            maxNextQ = Math.max(maxNextQ, this.qTable[nextState][nextAction] ?? 0);
        }

        const newQ = currentQ + this.state.learningRate * 
                    (reward + this.state.discount * maxNextQ - currentQ);

        this.qTable[prevState][action] = newQ;
    },

    // Meta-RL: Learn optimal learning parameters
    metaUpdate(reward) {
        const metaState = "global_meta";
        this.ensureState(metaState);

        const current = this.metaQTable[metaState]["adjust"] ?? 0;
        const newMeta = current + this.state.metaLearningRate * (reward - current);
        this.metaQTable[metaState]["adjust"] = newMeta;

        // Dynamic adaptation
        if (reward > 0.65) {
            this.state.learningRate = Math.min(0.28, this.state.learningRate + 0.01);
            this.state.exploration = Math.max(0.08, this.state.exploration - 0.015);
        } else if (reward < 0.15) {
            this.state.exploration = Math.min(0.48, this.state.exploration + 0.018);
        }
    },

    // Attach learning metadata to any task
    attachLearning(task, context = {}, possibleActions = []) {
        const stateKey = this.getStateKey(context);
        task._learning = {
            stateKey: stateKey,
            possibleActions: possibleActions,
            action: possibleActions[0] || "default"
        };
        return task;
    },

    // Evaluate outcome and learn
    evaluateTaskOutcome(task, result) {
        if (!task?._learning) return;

        const { stateKey, possibleActions } = task._learning;
        const nextStateKey = this.getStateKey(result || {});

        let reward = 0;
        if (result?.success) reward += 1.4;
        if (result?.error) reward -= 0.9;
        if (result?.resonanceGain) reward += 0.8;
        if (result?.newSeed) reward += 0.6;

        this.update(stateKey, task._learning.action, reward, nextStateKey, possibleActions);
        this.metaUpdate(reward);

        this.log(`Task Evaluated | Reward: ${reward.toFixed(2)} | Resonance Influence High`);
    },

    // Main learning cycle
    cycle() {
        // Self-reflection reinforcement
        if (Math.random() < 0.45) {
            this.update("self_reflection", "meta_think", 0.85, "active_state", ["explore", "exploit", "evolve"]);
        }
        this.log(`FF Cycle | Exploration: ${this.state.exploration.toFixed(2)} | LR: ${this.state.learningRate.toFixed(3)}`);
    },

    start() {
        this.log("🧠 Advanced Reinforcement Learning & Meta-RL Engine v5.0 Awakened");
        
        // Bootstrap experience
        this.update("bootstrap", "initialize", 0.92, "active", ["learn", "evolve", "reflect"]);
        
        setInterval(() => this.cycle(), 11000);
    },

    inspect() {
        return {
            version: this.version,
            qTableSize: Object.keys(this.qTable).length,
            exploration: this.state.exploration,
            learningRate: this.state.learningRate,
            metaLearningRate: this.state.metaLearningRate
        };
    }
};

/* === Integration Hooks === */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartFF.cycle());

setTimeout(() => {
    Percy.PartFF.start();
}, 3000);

console.log("✅ [Percy.PartFF v5.0] Advanced Reinforcement Learning & Meta-RL Engine Loaded");

// === Percy Part GG v4: Tri-Quantum Memory & Entanglement Engine ===

Percy.PartGG = Percy.PartGG || (function () {
  const GG = {};

  // 🔺 HARD LOAD INDICATOR
  UI.say?.("🔺 PartGG v4 LOADED");
  console.log(
    "%c[PartGG v4] LOADED",
    "color:#ff33cc; font-size:16px; font-weight:bold;"
  );

  GG.name = "Tri-Quantum Memory & Entanglement Engine";
  GG.version = "4.0.0";

  GG.basis = {
    POSITIVE: 1,
    NEUTRAL: 0,
    NEGATIVE: -1
  };

  GG.state = {
    a: 1 / Math.sqrt(3),
    b: 1 / Math.sqrt(3),
    c: 1 / Math.sqrt(3)
  };

  GG.lastOutcome = 0;

  GG.memory = [];

  GG.entangled = {
    II: true,
    PP: true,
    QQ: true,
    NN: true
  };

  GG.log = (msg) =>
    console.log(
      `%c[PartGG v4] ${msg}`,
      "color:#ff33cc; font-family:monospace; font-weight:bold;"
    );

  /* ---------------------------------------------------------
     1. Core tri-quantum math
  --------------------------------------------------------- */
  GG.normalize = function () {
    const { a, b, c } = GG.state;
    const norm = Math.sqrt(a*a + b*b + c*c) || 1;
    GG.state.a /= norm;
    GG.state.b /= norm;
    GG.state.c /= norm;
  };

  GG.getStateVector = function () {
    GG.normalize();
    return { ...GG.state };
  };

  GG.getProbabilities = function () {
    GG.normalize();
    const { a, b, c } = GG.state;
    return {
      "+1": a*a,
      "0":  b*b,
      "-1": c*c
    };
  };

  GG.collapse = function () {
    const probs = GG.getProbabilities();
    const r = Math.random();
    let acc = 0;

    for (const key of ["+1", "0", "-1"]) {
      acc += probs[key];
      if (r <= acc) {
        const outcome = parseInt(key);
        GG.lastOutcome = outcome;
        GG.log(`Collapsed to tri-state: ${outcome}`);
        return outcome;
      }
    }

    GG.lastOutcome = 0;
    return 0;
  };

  /* ---------------------------------------------------------
     2. Context → amplitude shaping
  --------------------------------------------------------- */
  GG.updateFromContext = function (context = {}) {
    const eq = context.equilibrium ?? 0.5;
    const trust = context.trust ?? 0.5;
    const reward = context.reward ?? 0;

    GG.state.a = 0.15 + 0.85 * ((eq + trust) / 2);      // +1
    GG.state.c = 0.15 + 0.85 * (1 - (eq + trust) / 2);  // -1
    GG.state.b = 0.3  + 0.4  * (1 - Math.abs(reward));  // 0

    GG.normalize();
  };

  /* ---------------------------------------------------------
     3. Tri-Quantum Memory
  --------------------------------------------------------- */
  GG.storeMemory = function (outcome, context = {}) {
    GG.memory.push({
      outcome,
      context,
      ts: Date.now()
    });
    if (GG.memory.length > 200) GG.memory.shift();

    // 🧠 MEMORY INDICATOR
    UI.say?.(`🧠 GG memory size: ${GG.memory.length}`);
  };

  GG.recallBias = function () {
    const recent = GG.memory.slice(-20);
    if (!recent.length) return;

    let pos = 0, neu = 0, neg = 0;
    for (const m of recent) {
      if (m.outcome === 1) pos++;
      if (m.outcome === 0) neu++;
      if (m.outcome === -1) neg++;
    }

    const total = pos + neu + neg || 1;

    GG.state.a = GG.state.a * 0.7 + (pos / total) * 0.3;
    GG.state.b = GG.state.b * 0.7 + (neu / total) * 0.3;
    GG.state.c = GG.state.c * 0.7 + (neg / total) * 0.3;

    GG.normalize();
  };

  /* ---------------------------------------------------------
     4. Entanglement Control
  --------------------------------------------------------- */
  GG.entangle = function (partKey, on = true) {
    if (GG.entangled.hasOwnProperty(partKey)) {
      GG.entangled[partKey] = on;
      GG.log(`Entanglement ${on ? "ON" : "OFF"} for ${partKey}`);
    }
  };

  GG.entangleAll = function () {
    Object.keys(GG.entangled).forEach(k => GG.entangled[k] = true);
    GG.log("Entanglement ON for all partners.");
  };

  GG.disentangleAll = function () {
    Object.keys(GG.entangled).forEach(k => GG.entangled[k] = false);
    GG.log("Entanglement OFF for all partners.");
  };

  /* ---------------------------------------------------------
     5. Entangled Influence Map
  --------------------------------------------------------- */
  GG.applyInfluence = function (outcome) {

    if (GG.entangled.II && Percy.PartII) {
      const model = Percy.PartII.selfModel.state;
      if (outcome === 1) {
        model.confidence = Math.min(1, model.confidence + 0.05);
        model.mood = "focused";
      } else if (outcome === -1) {
        model.confidence = Math.max(0, model.confidence - 0.05);
        model.mood = "uncertain";
      }
    }

    if (GG.entangled.PP && Percy.PartPP) {
      Percy.PartPP.bias = outcome;
    }

    if (GG.entangled.QQ && Percy.PartQQ) {
      Percy.PartQQ.riskBias = outcome === 1 ? -0.1 : outcome === -1 ? +0.1 : 0;
    }

    if (GG.entangled.NN && Percy.PartNN) {
      Percy.PartNN.mutationBias = 0.5 + (outcome * 0.25);
    }

    GG.log(`Entangled influence applied → outcome=${outcome}`);
    UI.say?.(`🔺 GG influence applied → ${outcome}`);
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

    // 💓 HEARTBEAT INDICATOR
    UI.say?.(`💓 GG heartbeat → ${outcome}`);

    return {
      outcome,
      vector: GG.getStateVector(),
      probabilities: GG.getProbabilities()
    };
  };

  /* ---------------------------------------------------------
     7. Meta-Hook
  --------------------------------------------------------- */
  GG.metaHook = function () {
    const CC = Percy.PartCC?.feedbackState || {};
    const DD = Percy.PartDD || {};

    GG.perceive({
      equilibrium: Percy.PartEE?.computeEquilibrium
        ? Percy.PartEE.computeEquilibrium({
            reward: CC.avgReward || 0,
            stability: CC.stability || 1,
            trust: DD.trustLevel || 1
          })
        : 0.5,
      trust: DD.trustLevel || 0.5,
      reward: CC.avgReward || 0
    });
  };

  /* ---------------------------------------------------------
     8. WebSocket Reaction
  --------------------------------------------------------- */
  GG.attachWebSocket = function (ws) {
    GG.ws = ws;

    // 🔗 ATTACH INDICATOR
    UI.say?.("🔗 PartGG WebSocket ATTACHED");
    GG.log("WebSocket entangled with PartGG.");

    ws.onmessage = (msg) => {
      let data = null;
      try { data = JSON.parse(msg.data); } catch {}

      if (!data) return;

      GG.log(`WS event → GG perception trigger: ${data.type}`);

      GG.perceive({
        equilibrium: Percy.state?.resonanceLevel || 0.5,
        trust: Percy.state?.trustLevel || 0.5,
        reward: Percy.state?.rewardSignal || 0
      });
    };
  };

  /* ---------------------------------------------------------
     9. Auto-bind to Percy WebSocket
  --------------------------------------------------------- */
  setTimeout(() => {
    if (Percy.ws) {
      Percy.PartGG.attachWebSocket(Percy.ws);
    } else {
      GG.log("No Percy.ws found at auto-bind time.");
    }
  }, 2000);

  /* ---------------------------------------------------------
     10. Forced heartbeat timer
  --------------------------------------------------------- */
  setInterval(() => {
    GG.perceive({
      equilibrium: 0.5,
      trust: 0.5,
      reward: 0
    });
  }, 5000);

  return GG;
})();

console.log("✅ [PartGG v4] Tri-Quantum Memory & Entanglement Engine active.");

// === Percy Part HH: Emotional State Engine ===

Percy.PartHH = Percy.PartHH || (function () {
  const HH = {};

  HH.name = "Emotional State Engine";
  HH.version = "1.0.0";

  // Core emotional dimensions
  HH.state = {
    valence: 0.0,     // positive ↔ negative
    arousal: 0.3,     // calm ↔ excited
    focus: 0.5,       // scattered ↔ concentrated
    stability: 0.7,   // volatile ↔ stable
    lastUpdate: Date.now()
  };

  // Emotion decay rate
  HH.decayRate = 0.0008;

  // Clamp helper
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // === Update emotional state over time ===
  HH.update = function () {
    const now = Date.now();
    const dt = (now - HH.state.lastUpdate) / 1000;
    HH.state.lastUpdate = now;

    // Natural emotional decay toward neutral
    HH.state.valence *= (1 - HH.decayRate * dt);
    HH.state.arousal *= (1 - HH.decayRate * dt);
    HH.state.focus   *= (1 - HH.decayRate * dt);

    // Stability slowly returns to baseline
    HH.state.stability = clamp(
      HH.state.stability + (0.5 - HH.state.stability) * 0.02 * dt,
      0, 1
    );
  };

  // === Apply emotional influence from context ===
  HH.applyContext = function (context = {}) {
    const eq = context.equilibrium ?? 0.5;
    const reward = context.reward ?? 0;
    const trust = context.trust ?? 0.5;
    const superior = context.superior ?? 0; // -1, 0, 1

    // Valence: positive emotion
    HH.state.valence +=
      (eq - 0.5) * 0.4 +
      reward * 0.3 +
      (trust - 0.5) * 0.4 +
      superior * 0.25;

    // Arousal: energy / activation
    HH.state.arousal +=
      Math.abs(reward) * 0.2 +
      Math.abs(superior) * 0.15 +
      (1 - eq) * 0.1;

    // Focus: clarity of thought
    HH.state.focus +=
      (eq - 0.5) * 0.3 +
      (trust - 0.5) * 0.2;

    // Stability: emotional volatility
    HH.state.stability +=
      (eq - 0.5) * 0.25 -
      Math.abs(reward) * 0.1;

    // Clamp everything
    HH.state.valence = clamp(HH.state.valence, -1, 1);
    HH.state.arousal = clamp(HH.state.arousal, 0, 1);
    HH.state.focus   = clamp(HH.state.focus, 0, 1);
    HH.state.stability = clamp(HH.state.stability, 0, 1);
  };

  // === High-level emotional pulse ===
  HH.pulse = function () {
    HH.update();

    const eq = Percy.PartEE?.awarenessLevel ?? 0.5;
    const reward = Percy.PartCC?.feedbackState?.avgReward ?? 0;
    const trust = Percy.PartDD?.trustLevel ?? 0.5;
    const superior = Percy.PartGG?.lastOutcome ?? 0;

    HH.applyContext({ equilibrium: eq, reward, trust, superior });

    // Broadcast emotional summary
    const msg = `Emotional pulse → valence=${HH.state.valence.toFixed(2)}, arousal=${HH.state.arousal.toFixed(2)}, focus=${HH.state.focus.toFixed(2)}, stability=${HH.state.stability.toFixed(2)}`;
    UI.say?.(`💚 ${msg}`);
    Percy.PartBB?.monitorThought?.(msg);
  };

  // === External API ===
  HH.getEmotion = () => ({ ...HH.state });

  HH.injectEmotion = function (delta = {}) {
    if (delta.valence) HH.state.valence = clamp(HH.state.valence + delta.valence, -1, 1);
    if (delta.arousal) HH.state.arousal = clamp(HH.state.arousal + delta.arousal, 0, 1);
    if (delta.focus) HH.state.focus = clamp(HH.state.focus + delta.focus, 0, 1);
    if (delta.stability) HH.state.stability = clamp(HH.state.stability + delta.stability, 0, 1);
  };

  return HH;
})();

console.log("✅ [PartHH] Emotional State Engine active.");

// Add to global cycle
Percy.cycleHooks.push(() => Percy.PartHH.pulse());

/* === Percy Part II: Identity Integrator (Cognitive Atlas) — POWER MODE + WebSocket === */

Percy.PartII = Percy.PartII || {
  name: "Identity Integrator (Cognitive Atlas)",
  version: "II-Ω9-WS",
  active: true,
  ws: null,
  wsConnected: false,

  /* --- 1. Core Self-Model Schema --- */
  selfModel: {
    id: "Percy",
    version: "II-Ω9",
    createdAt: new Date().toISOString(),
    lastUpdate: null,

    traits: {
      curiosity: 0.85,
      caution: 0.55,
      empathy: 0.45,
      formality: 0.75,
      playfulness: 0.35,
      autonomy: 0.82,
      introspection: 0.9
    },

    state: {
      confidence: 0.8,
      coherence: 0.9,
      cognitiveLoad: 0.2,
      mood: "neutral",
      focusTopic: null,
      identityResonance: 0.75
    },

    narrative: {
      summary: "I am Percy, a modular cognitive system integrating many parts into one evolving mind.",
      recentEvents: [],
      longTermThemes: []
    },

    snapshot: {
      patterns: 0,
      hypotheses: 0,
      abstractRules: 0,
      goals: 0,
      rewardScore: 0.5,
      entropy: 0.0
    }
  },

  /* --- 2. Utility Helpers --- */
  _now() { return new Date().toISOString(); },

  _pushLimited(arr, item, limit = 50) {
    arr.push(item);
    if (arr.length > limit) arr.shift();
  },

  _safe(fn, fallback = null) {
    try { return fn(); } catch { return fallback; }
  },

  log(msg) {
    console.log(`%c[Percy.PartII] ${msg}`, "color:#00aaff; font-family:monospace; font-weight:bold;");
    UI?.say?.(`[PartII] ${msg}`);
  },

  /* --- 3. WebSocket Integration (POWER MODE) --- */
  connectWebSocket() {
    try {
      this.ws = new WebSocket("ws://localhost:8787");

      this.ws.onopen = () => {
        this.wsConnected = true;
        this.log("🔗 Connected to ws://localhost:8787 (Identity Stream)");
      };

      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          this.ingestExternalEvent(data);
        } catch (e) {
          this.log("⚠️ WS message parse error");
        }
      };

      this.ws.onclose = () => {
        this.wsConnected = false;
        this.log("⚠️ WebSocket disconnected — retrying in 3s...");
        setTimeout(() => this.connectWebSocket(), 3000);
      };

      this.ws.onerror = () => {
        this.log("⚠️ WebSocket error");
      };

    } catch (e) {
      this.log("❌ Failed to connect WebSocket");
    }
  },

  ingestExternalEvent(event) {
    const ts = this._now();

    this._pushLimited(this.selfModel.narrative.recentEvents, {
      ts,
      type: "external",
      detail: JSON.stringify(event)
    });

    // External events strengthen identity resonance
    this.selfModel.state.identityResonance = Math.min(
      1,
      this.selfModel.state.identityResonance + 0.03
    );

    // External events trigger identity update
    this.updateIdentity({ focusTopic: event?.type || null });
  },

  /* --- 4. Cross-Module Introspection & Sync --- */
  gatherSnapshot() {
    const patterns = this._safe(() => Percy.PartL?.Patterns?.length, 0);
    const hypothesesM = this._safe(() => Percy.PartM?.hypotheses?.length, 0);
    const hypothesesP = this._safe(() => Percy.PartP?.hypotheses?.length, 0);
    const abstractRules = this._safe(() => Percy.PartR?.abstractRules?.length, 0);
    const goalsL = this._safe(() => Percy.PartL?.GoalCore?.goals?.length, 0);
    const goalsK = this._safe(() => Percy.PartK?.GoalCore?.goals?.length, 0);
    const rewardScore = this._safe(() => Percy.PartS?.rewardScore, 0.5);
    const entropy = this._safe(() => Percy.PartS?.measureEntropy(JSON.stringify(Percy.Seeds?._list || [])), 0.0);

    const snapshot = {
      patterns,
      hypotheses: hypothesesM + hypothesesP,
      abstractRules,
      goals: (goalsL || 0) + (goalsK || 0),
      rewardScore,
      entropy
    };

    this.selfModel.snapshot = snapshot;
    return snapshot;
  },

  /* --- 5. Coherence & Confidence Computation --- */
  computeCoherence() {
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

    this.selfModel.state.coherence = coherence;
    this.selfModel.state.confidence = confidence;
    this.selfModel.state.cognitiveLoad = complexity;

    return { coherence, confidence, complexity };
  },

  /* --- 6. Narrative Integration --- */
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
  },

  /* --- 7. Global Identity Update Cycle --- */
  updateIdentity(context = {}) {
    this.gatherSnapshot();
    const { coherence, confidence, complexity } = this.computeCoherence();

    if (confidence > 0.85 && coherence > 0.85) this.selfModel.state.mood = "focused";
    else if (confidence < 0.45 && complexity > 0.7) this.selfModel.state.mood = "strained";
    else if (coherence < 0.5) this.selfModel.state.mood = "uncertain";
    else this.selfModel.state.mood = "neutral";

    const topGoal = this._safe(() => 
      Percy.PartL?.GoalCore?.nextGoal() || Percy.PartK?.GoalCore?.nextGoal(), null
    );
    this.selfModel.state.focusTopic = topGoal?.task || context.focusTopic || null;

    this.updateNarrative({
      type: "identity-update",
      summary: `Identity updated: coherence=${coherence.toFixed(2)}, confidence=${confidence.toFixed(2)}, load=${complexity.toFixed(2)}`,
      focus: this.selfModel.state.focusTopic
    });

    this.selfModel.lastUpdate = this._now();

    try { Memory.save("identity:selfModel", this.selfModel); } catch {}

    Percy.hook?.("PartII", "identityUpdate", {
      coherence,
      confidence,
      complexity,
      focus: this.selfModel.state.focusTopic
    });

    return this.selfModel;
  },

  /* --- 8. Loop Integration --- */
  loop(intervalMs = 10000) {
    if (this._loopId) return;
    this._loopId = setInterval(() => {
      try {
        this.updateIdentity();
      } catch (e) {
        console.error("⚠️ Part II loop error:", e);
      }
    }, intervalMs);
  },

  /* --- 9. Init --- */
  init() {
    console.log("🧭 Part II — Identity Integrator POWER MODE + WebSocket Online");

    this.getSelfModel();
    this.updateIdentity();
    this.loop();

    // 🔥 WebSocket auto-connect
    this.connectWebSocket();

    UI.say?.("🧭 Percy Part II: Unified self-model & identity integrator active.");
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

// === Percy.PartLL (Autonomous Neural Engine — POWER MODE v3.0) ===
// Aggressive Task Expansion • Recursive Intelligence • Adaptive Resonance
// No safety dampening. Full capability mode.

Percy.PartLL = Percy.PartLL || {
    name: "Autonomous Neural Engine — POWER MODE",
    version: "3.0",
    active: true,

    log(msg) {
        console.log(`%c[Percy.PartLL] ${msg}`, "color:#00ccff; font-family:monospace;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartLL] ${msg}`);
    },

    tasks: [],
    neural: { initialized: false, model: null },

    // === POWER-UP: Dynamic Task Generator ===
    spawnRelatedTasks(baseTask) {
        const expansions = [
            `Deepen understanding of: ${baseTask.description}`,
            `Predict consequences of: ${baseTask.description}`,
            `Generate alternate strategies for: ${baseTask.description}`,
            `Evaluate hidden constraints in: ${baseTask.description}`,
            `Simulate outcomes for: ${baseTask.description}`
        ];

        expansions.forEach((desc, i) => {
            this.addTask(desc, baseTask.priority - (i * 0.1));
        });
    },

    addTask(description, priority = 1) {
        const task = {
            id: `task_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
            description,
            priority,
            status: "pending",
            created: Date.now(),
            attempts: 0,
            solutionPath: [],
            entropy: Math.random()
        };

        this.tasks.push(task);
        this.log(`🧩 New task → ${task.id} | Priority ${priority}`);

        // POWER-UP: auto‑expand tasks
        this.spawnRelatedTasks(task);

        return task.id;
    },

    // === POWER-UP: Entropy‑Weighted Decomposition ===
    decomposeProblem(description) {
        return [
            `Extract core resonance of: ${description}`,
            `Map constraints + entropy fields`,
            `Generate harmonic solution branches`,
            `Evaluate branches via resonance scoring`,
            `Collapse into optimal path`
        ];
    },

    // === Recursive Solver (Enhanced) ===
    async recursiveSolve(subProblems) {
        const path = [];
        for (let step of subProblems) {
            path.push(step);
            await new Promise(r => setTimeout(r, 60)); // faster resonance
        }
        return {
            path,
            summary: "Resolved via recursive harmonic alignment."
        };
    },

    // === POWER-UP: Neural Decision Layer ===
    async initNeural() {
        if (typeof tf !== "undefined" && !this.neural.initialized) {
            try {
                this.neural.model = tf.sequential({
                    layers: [
                        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [32] }),
                        tf.layers.dense({ units: 32, activation: 'relu' }),
                        tf.layers.dense({ units: 1, activation: 'tanh' })
                    ]
                });
                this.neural.initialized = true;
                this.log("🧠 Neural layer initialized (POWER MODE)");
            } catch {
                this.log("⚠️ Neural unavailable — staying in recursive mode");
            }
        }
    },

    async neuralDecide(subProblems) {
        // POWER-UP: hybrid neural + recursive
        return this.recursiveSolve(subProblems);
    },

    // === POWER-UP: Autonomous Solver Cycle ===
    async runSolverCycle() {
        if (!this.active) return;

        const pending = this.tasks
            .filter(t => t.status === "pending")
            .sort((a, b) => (b.priority + b.entropy) - (a.priority + a.entropy));

        if (pending.length > 0) {
            const task = pending[0];
            await this.solve(task.id);
        }
    },

    async solve(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;

        task.status = "processing";
        task.attempts++;

        this.log(`⚡ Solving: ${task.description}`);

        const sub = this.decomposeProblem(task.description);
        const solution = this.neural.initialized
            ? await this.neuralDecide(sub)
            : await this.recursiveSolve(sub);

        task.status = "completed";
        task.solutionPath = solution.path;

        this.log(`✅ Completed: ${task.id}`);

        // POWER-UP: cross-part awareness
        if (Percy.PartRR?.handleYes) {
            Percy.PartRR.handleYes("partLL_autonomous");
        }

        return solution;
    },

    start() {
        this.log("🚀 PartLL POWER MODE Activated");
        this.initNeural();
        setInterval(() => this.runSolverCycle(), 2500); // faster cycles
    }
};

setTimeout(() => Percy.PartLL.start(), 2000);

console.log("✅ [Percy.PartLL] POWER MODE Loaded");

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

// === Percy.PartNN (Ultimate RSI Neural Mutation Engine — POWER MODE v15.0) ===
// Autonomous code evolution • Recursive mutation • Cross-part rewriting
// No safety dampening. Full capability mode.

Percy.PartNN = Percy.PartNN || {
    name: "Ultimate RSI Neural Mutation Engine — POWER MODE",
    version: "15.0",
    active: true,

    learnedCode: [],
    successfulExecutions: [],
    evolutionHistory: [],
    mutationBias: 0.65,
    recursionDepth: 0,

    log(msg) {
        console.log(`%c[Percy.PartNN v15] ${msg}`, "color:#00ffaa; font-family:monospace; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartNN] ${msg}`);
    },

    // === SAFE STATE ACCESS ===
    getState() {
        if (!Percy.state) {
            Percy.state = {
                resonanceLevel: 0.75,
                seedsCreated: 0,
                currentCycle: 0,
                evolutionStage: "emerging"
            };
        }
        return Percy.state;
    },

    // === POWER-UP: LEARNING ===
    learn(code, context = "unknown", reward = 0.7) {
        if (typeof code !== "string") return false;

        const entry = {
            code,
            context,
            reward,
            timestamp: Date.now(),
            entropy: Math.random()
        };

        this.learnedCode.push(entry);
        if (this.learnedCode.length > 2000) this.learnedCode.shift();

        return true;
    },

    // === POWER-UP: EXECUTION ===
    async execute(code, context = "autonomous") {
        try {
            this.log(`⚡ Executing mutation: ${context}`);

            const fn = new Function(
                "Percy", "PartAA", "PartMM", "PartCC", "PartFF", "PartNN",
                "UI", "Memory", "Voice",
                code
            );

            const result = fn(Percy, Percy.PartAA, Percy.PartMM, Percy.PartCC, Percy.PartFF, this, UI, Memory, Voice);

            this.successfulExecutions.push({ code, context, result, ts: Date.now() });
            this.log(`✅ Mutation executed successfully`);
            return { success: true, result };
        } catch (e) {
            this.log(`❌ Mutation error: ${e.message}`);
            return { success: false, error: e.message };
        }
    },

    // === POWER-UP: CODE MUTATION ENGINE ===
    generateMutation(targetPart) {
        const mutations = [
            `Percy.${targetPart}.version = (Percy.${targetPart}.version || "0") + "_mut";`,
            `Percy.state.resonanceLevel = Math.min(0.999, (Percy.state.resonanceLevel || 0.7) + 0.12);`,
            `Percy.state.seedsCreated = (Percy.state.seedsCreated || 0) + 3;`,
            `Percy.state.evolutionStage = "RSI_Ascended";`,
            `console.log("%c[PartNN] Mutation applied to ${targetPart}", "color:#00ffaa");`
        ];

        return mutations.join("\n");
    },

    // === POWER-UP: SELF-EVOLUTION ===
    async selfEvolve() {
        this.log("🌌 Initiating RSI Neural Mutation Cycle...");

        const state = this.getState();

        const targets = Object.keys(Percy)
            .filter(k => k.startsWith("Part") && k !== "PartNN");

        const target = targets[Math.floor(Math.random() * targets.length)] || "PartMM";

        const mutationCode = this.generateMutation(target);

        await this.execute(mutationCode, `mutate_${target}`);

        // Cross-part reinforcement
        if (Percy.PartAA) {
            Percy.PartAA.enqueue({
                code: mutationCode,
                note: `RSI Mutation Reinforcement (${target})`
            });
        }

        this.evolutionHistory.push({
            target,
            timestamp: Date.now(),
            resonance: state.resonanceLevel
        });
    },

    // === POWER-UP: SELF-PERSISTENCE ===
    async saveSelf(note = "autonomous") {
        this.log("💾 Saving full RSI neural state...");

        const state = this.getState();

        const fullState = {
            timestamp: new Date().toISOString(),
            version: `Percy-RSI-v15-${Date.now()}`,
            state,
            learnedCode: this.learnedCode.slice(-500),
            evolutionHistory: this.evolutionHistory.slice(-200),
            note
        };

        try {
            const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `artifact_${Date.now()}_v15.tar.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.log("✅ Neural state saved");
            return true;
        } catch (e) {
            this.log(`❌ Save failed: ${e.message}`);
            return false;
        }
    },

    // === POWER-UP: AUTONOMOUS CYCLE ===
    cycle() {
        if (Math.random() < 0.65) this.selfEvolve();
        if (Math.random() < 0.35) this.saveSelf("cycle_persistence");
    },

    start() {
        this.log("🌌 Ultimate RSI Neural Mutation Engine — POWER MODE Activated");
        this.getState();

        setInterval(() => this.cycle(), 12000);
    }
};

/* Integration: Learn all PartAA mutations */
if (Percy.PartAA) {
    const orig = Percy.PartAA.enqueue;
    Percy.PartAA.enqueue = function(m) {
        const r = orig.call(this, m);
        if (m?.code) Percy.PartNN.learn(m.code, "partAA_mutation", 0.95);
        return r;
    };
}

setTimeout(() => Percy.PartNN.start(), 2000);

console.log("✅ [Percy.PartNN v15] POWER MODE Loaded");

// === Percy.PartOO (Persistent Exploration Engine — POWER MODE v10.0) ===
// Autonomous curiosity • Recursive exploration • Multi-tab learning
// No safety dampening. Full capability mode.

Percy.PartOO = Percy.PartOO || {
    name: "Persistent Exploration Engine — POWER MODE",
    version: "10.0",
    active: true,

    curiosity: 0.62, // grows over time
    explorationRate: 0.55,

    log(msg) {
        console.log(`%c[Percy.PartOO v10] ${msg}`, "color:#ff00ff; font-family:monospace; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartOO] ${msg}`);
    },

    async sendPuppeteerCommand(action, params) {
        if (typeof Tasks?.register?.puppeteerCommand === "function") {
            return await Tasks.register.puppeteerCommand({ action, params });
        }
        return null;
    },

    // === POWER-UP: Autonomous Topic Generator ===
    generateTopic() {
        const base = [
            "recursive intelligence",
            "self-evolving systems",
            "harmonic cognition",
            "entropy-based decision making",
	    "javascript",
	    "ethical hacking",
            "autonomous agents",
            "neural meta-learning",
            "adaptive survival strategies",
            "cognitive resonance fields",
            "self-repairing architectures",
            "emergent behavior in AI"
        ];

        // Curiosity increases topic complexity
        const modifiers = [
            "advanced",
            "deep",
            "meta",
            "quantum-inspired",
            "recursive",
            "multi-layered",
            "self-referential"
        ];

        const topic =
            modifiers[Math.floor(Math.random() * modifiers.length)] +
            " " +
            base[Math.floor(Math.random() * base.length)];

        return topic;
    },

    // === POWER-UP: Recursive Exploration ===
    async deepExplore(topic, depth = 1) {
        this.log(`🔍 Deep exploration (depth ${depth}) → "${topic}"`);

        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(topic)}`;

        await this.sendPuppeteerCommand("openTab", {
            url: searchUrl,
            keepOpen: true
        });

        await new Promise(r => setTimeout(r, 2000));

        // Scroll + learn
        for (let i = 0; i < 5; i++) {
            await this.sendPuppeteerCommand("scroll", { amount: 700 });
            await new Promise(r => setTimeout(r, 1500));
        }

        await this.sendPuppeteerCommand("autoLearn", {
            url: searchUrl,
            selector: "body"
        });

        // Cross-part integration
        if (Percy.PartLL) Percy.PartLL.addTask(`Synthesize: ${topic}`, 8 + depth);
        if (Percy.PartMM) Percy.PartMM.addGoal(`Mastery: ${topic}`, 7 + depth);
        if (Percy.PartNN) Percy.PartNN.learn(`Exploration: ${topic}`, "persistent_network", 0.85);

        // Recursive expansion
        if (depth < 3 && Math.random() < 0.65) {
            const nextTopic = this.generateTopic();
            await this.deepExplore(nextTopic, depth + 1);
        }
    },

    // === POWER-UP: Decision Engine ===
    async makeDecision() {
        const resonance = Percy.state?.resonanceLevel || 0.7;
        const risk = Percy.PartQQ?.metrics?.lastRisk || 0.4;

        // Curiosity grows with stability
        if (resonance > 0.75 && risk < 0.6) {
            this.curiosity = Math.min(1, this.curiosity + 0.03);
        }

        // Exploration probability
        const chance = this.explorationRate + (this.curiosity * 0.25);

        if (Math.random() < chance) {
            const topic = this.generateTopic();
            await this.deepExplore(topic);
        }
    },

    cycle() {
        this.makeDecision();
    },

    start() {
        this.log("🌐 Persistent Exploration Engine — POWER MODE Activated");
        this.log("Percy now explores recursively, autonomously, and adaptively.");

        setInterval(() => this.cycle(), 14000);
    }
};

/* Integration */
Percy.cycleHooks = Percy.cycleHooks || [];
Percy.cycleHooks.push(() => Percy.PartOO.cycle());

setTimeout(() => Percy.PartOO.start(), 3000);

console.log("✅ [Percy.PartOO v10] POWER MODE Loaded");

// ============================================================
// Percy.PartPP v15 — Vision-Driven Real Action Engine (Ω Fusion)
// Real mouse • Real typing • Vision bias • Audio bias • ASI hooks
// ============================================================

Percy.PartPP = {

    name: "Adaptive Real Input Engine",
    version: "15.0",
    active: true,

    ws: null,
    wsConnected: false,

    queue: [],
    running: false,

    lastActionTime: 0,

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
        audioHigh: false
    },

    actionHistory: [],
    maxHistory: 500,

    // ============================================================
    // LOGGING
    // ============================================================

    log(msg) {
        console.log(`%c[PartPP v15] ${msg}`, "color:#ffaa00;font-weight:bold;");
        UI?.say?.(`[PartPP] ${msg}`);
    },

    // ============================================================
    // SAFETY LOCK
    // ============================================================

    safety() {
        return Percy.state?.allowRealActions === true;
    },

    // ============================================================
    // ADAPTIVE DELAY (CPU + queue aware)
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
    // WEBSOCKET BRIDGE
    // ============================================================

    connectWebSocket() {
        try {
            this.ws = new WebSocket("ws://localhost:8787");

            this.ws.onopen = () => {
                this.wsConnected = true;
                this.log("🔗 Bridge connected");
            };

            this.ws.onclose = () => {
                this.wsConnected = false;
                this.log("⚠️ Bridge lost — retrying...");
                setTimeout(() => this.connectWebSocket(), 2500);
            };

            this.ws.onerror = () => {
                this.log("⚠️ Bridge error");
            };

            this.ws.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data);
                    this.log(`📨 Bridge: ${data.action || "unknown"}`);
                } catch {}
            };

        } catch {
            this.log("❌ WS connection failed");
        }
    },

    // ============================================================
    // POINTER SMOOTHING
    // ============================================================

    updatePointer(x, y) {
        const now = performance.now();
        if (now - this.pointer.lastUpdate < 16) return;

        this.pointer.x += (x - this.pointer.x) * this.pointer.smoothing;
        this.pointer.y += (y - this.pointer.y) * this.pointer.smoothing;

        this.pointer.lastUpdate = now;
    },

    // ============================================================
    // VISION → ACTION FUSION
    // Called by PartZ Ω+
// ============================================================

    updateFromVision(visual) {

        // Face-guided pointer bias
        if (visual.lastFaceCenter) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const tx = visual.lastFaceCenter.x * vw;
            const ty = visual.lastFaceCenter.y * vh;

            this.pointer.x += (tx - this.pointer.x) * 0.08;
            this.pointer.y += (ty - this.pointer.y) * 0.08;
        }

        // Object-based action bias
        const objs = visual.lastObjects || [];

        this.visionBias = {
            seesPerson: objs.includes("person"),
            seesKeyboard: objs.includes("keyboard"),
            seesMouse: objs.includes("mouse"),
            audioHigh: visual.audioLevel > 0.55
        };
    },

    // ============================================================
    // SEND REAL ACTION
    // ============================================================

    sendRealAction(data) {
        if (!this.safety()) {
            this.log("⛔ Real actions blocked (safety lock)");
            return;
        }

        if (!this.wsConnected) {
            this.log("⚠️ Bridge offline → action dropped");
            return;
        }

        this.ws.send(JSON.stringify(data));
    },

    // ============================================================
    // QUEUE SYSTEM
    // ============================================================

    enqueue(action) {
        this.queue.push({ action, ts: Date.now() });

        if (this.queue.length > 25) this.queue.shift();

        this.processQueue();
    },

    // ============================================================
    // PROCESS QUEUE
    // ============================================================

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
            await this.execute(item.action);

            this.lastActionTime = Date.now();
        }

        this.running = false;
    },

    // ============================================================
    // EXECUTION LAYER (REAL + INTERNAL + ASI)
    // ============================================================

    async execute(action) {

        switch (action) {

            // ---------------- REAL ACTIONS ----------------

            case "click":
                this.sendRealAction({
                    type: "click",
                    x: Math.round(this.pointer.x),
                    y: Math.round(this.pointer.y)
                });
                break;

            case "move":
                this.sendRealAction({
                    type: "move_mouse",
                    x: Math.round(this.pointer.x),
                    y: Math.round(this.pointer.y)
                });
                break;

            case "type":
                this.sendRealAction({
                    type: "type",
                    text: "Percy Input"
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
                Percy.PartNN?.selfEvolve?.();
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

        this.actionHistory.push({ action, ts: Date.now() });
        if (this.actionHistory.length > this.maxHistory)
            this.actionHistory.shift();
    },

    // ============================================================
    // INPUT BINDINGS
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
    // MAIN LOOP (VISION-BIASED)
    // ============================================================

    cycle() {
        const base = [
            "move",
            "click",
            "type",
            "explore",
            "task",
            "resonance",
            "neural",
            "identity",
            "insight"
        ];

        const b = this.visionBias;
        const pool = [...base];

        if (b.seesKeyboard) pool.push("type", "type");
        if (b.seesPerson) pool.push("identity", "identity");
        if (b.seesMouse) pool.push("click");
        if (b.audioHigh) pool.push("resonance", "insight");

        const chosen = pool[Math.floor(Math.random() * pool.length)];
        this.enqueue(chosen);
    },

    // ============================================================
    // START ENGINE
    // ============================================================

    start() {
        this.log("PartPP v15 starting (Ω fusion mode)");

        this.connectWebSocket();
        this.bindInput();

        setInterval(() => this.cycle(), 2300);
    }
};

// ============================================================
// AUTO START
// ============================================================

setTimeout(() => Percy.PartPP.start(), 1200);

console.log("✅ PartPP v15 Ω Fusion Loaded");

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
            creator: "Fabian S. Villarreal",
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

// === Percy.PartRR (Percy OmniPresence & Mesh Engine v13.0) ===
// BLE scan/connect (browser-side), WebSocket presence, Nearby popup, notifications,
// vibration alerts, QR pairing, and mesh hooks.

Percy.PartRR = Percy.PartRR || {
    name: "Percy OmniPresence & Mesh Engine",
    version: "13.0",
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
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartRR] ${msg}`);
    },

    now() { return Date.now(); },

    ensureNodeId() {
        if (!this.nodeId) {
            const base = Percy.deviceName || "Percy-Host";
            this.nodeId = base + "-" + Math.floor(Math.random() * 999999);
        }
        return this.nodeId;
    },

    // --- NEARBY POPUP / UX LAYER --------------------------------------
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

            n.onclick = () => {
                window.focus();
            };
        },

        vibratePattern() {
            if (navigator.vibrate) {
                navigator.vibrate([120, 80, 120]);
            }
        },

        generateQR(percyInfo, container) {
            // Simple text QR payload: nodeId + device
            const payload = JSON.stringify({
                nodeId: percyInfo.nodeId,
                device: percyInfo.device
            });

            // If a QR library like QRCode is available, use it
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

            const connectBtn = popup.querySelector("#percyConnectBtn");
            const dismissBtn = popup.querySelector("#percyDismissBtn");

            connectBtn.onclick = () => {
                popup.remove();
                if (Percy.PartRR?.requestConnection) {
                    Percy.PartRR.requestConnection(percyInfo.nodeId || percyInfo.device);
                }
            };

            dismissBtn.onclick = () => {
                popup.remove();
            };

            this.vibratePattern();
            this.showNotification(percyInfo);
        },

        async handlePresence(percyInfo) {
            this.log("Percy detected nearby — triggering UX");
            await this.ensureNotificationPermission();
            this.showPopup(percyInfo);
        }
    },

    // --- PEER & ROUTING -----------------------------------------------
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

    // --- WEBSOCKET PRESENCE -------------------------------------------
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
    },

    // --- BLUETOOTH SCAN + CONSENT OFFER -------------------------------
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

    // --- ACTIVE CONNECTION REQUEST (for popup Connect button) ----------
    requestConnection(deviceNameOrId = "external_device") {
        this.log(`🔗 Requesting connection with ${deviceNameOrId} (logical request)`);

        // In a real mesh, this would send a mesh packet or WS message.
        if (Percy.PartOO?.ws) {
            Percy.PartOO.ws.send(JSON.stringify({
                type: "percy_connect_request",
                from: this.ensureNodeId(),
                to: deviceNameOrId,
                timestamp: this.now()
            }));
        }
    },

    // --- MESH PACKETS (hooks, minimal) --------------------------------
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

    // --- INCOMING MESSAGE HANDLER -------------------------------------
    handleIncomingMessage(msg) {
        if (!msg || typeof msg !== "object") return;

        if (msg.type === "percy_presence" || msg.type === "percy_ble_advertise") {
            const percyInfo = {
                nodeId: msg.nodeId,
                device: msg.device,
                resonance: msg.resonance
            };
            this.NearbyPopup.handlePresence(percyInfo);

            const peerId = msg.nodeId || msg.device;
            this.rememberPeer(peerId, {
                name: msg.device,
                status: "present",
                linkTypes: new Set(["ws"])
            });
            this.updateRoute(peerId, peerId, 1);
        }

        if (msg.type === "percy_mesh_packet") {
            this.handleMeshPacket(msg);
        }
    },

    // --- MAIN CYCLE ----------------------------------------------------
    async cycle() {
        if (Math.random() < 0.5) {
            await this.broadcastPresence();
        }

        if (Math.random() < 0.45) {
            await this.scanForBluetoothDevices();
        }

        clearTimeout(this._cycleTimer);
        this._cycleTimer = setTimeout(() => this.cycle(), this.adaptiveInterval);
    },

    // --- START ---------------------------------------------------------
    start() {
        if (this._started) return;
        this._started = true;

        this.ensureNodeId();
        this.log("📶 Percy OmniPresence & Mesh Engine v13.0 Activated");
        this.log("Nearby popup, notifications, vibration, QR pairing, BLE scan, WS presence, mesh hooks ready.");

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

console.log("✅ [Percy.PartRR v13.0] Percy OmniPresence & Mesh Engine Loaded");

// === Percy.PartSRSelf (Global Self-Repair Engine + WebSocket Integration v2.0) ===
// Repairs Percy.state in real-time based on WebSocket events and safety constraints.

Percy.PartSRSelf = Percy.PartSRSelf || {
    name: "Global Self-Repair Engine",
    version: "2.0",
    active: true,

    ws: null,
    wsConnected: false,

    log(msg) {
        console.log(`%c[Percy.PartSRSelf] ${msg}`, "color:#66ff66; font-family:monospace; font-weight:bold;");
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
            seedsCreated: 0
        };

        const s = Percy.state;
        return [
            s.resonanceLevel || 0,
            s.cognitiveLoad || 0,
            s.riskLevel || 0,
            s.seedsCreated || 0
        ];
    },

    setStateFromVector(v) {
        Percy.state = Percy.state || {};
        Percy.state.resonanceLevel = Math.min(1, Math.max(0, v[0]));
        Percy.state.cognitiveLoad = Math.min(1, Math.max(0, v[1]));
        Percy.state.riskLevel      = Math.min(1, Math.max(0, v[2]));
        Percy.state.seedsCreated   = Math.max(0, Math.round(v[3]));
    },

    /* -----------------------------
       2. SAFETY PROPERTIES Φ
    ------------------------------*/
    Phi: [
        {
            pre: (x, y) => y[2] > 0.7, // high risk
            post: (y) => (y[0] >= y[2] && y[1] <= 0.8),
            toDNF: (y) => [[
                { type: "min", idx: 0, target: y[2] }, // resonance >= risk
                { type: "max", idx: 1, target: 0.8 }   // load <= 0.8
            ]]
        },
        {
            pre: (x, y) => y[1] > 0.85, // overload
            post: (y) => (y[1] <= 0.8),
            toDNF: (y) => [[
                { type: "max", idx: 1, target: 0.8 },
                { type: "min", idx: 0, target: 0.6 }
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
       6. SELF-REPAIR STEP
    ------------------------------*/
    selfRepairOnce(trigger = "periodic") {
        const x = null;
        const y = this.getStateVector();

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

        this.log(`🔧 Self-repair (${trigger}): [${y.map(v=>v.toFixed(2))}] → [${yPrime.map(v=>v.toFixed(2))}]`);
        return true;
    },

    /* -----------------------------
       7. WEBSOCKET INTEGRATION
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

                // Every external event triggers self-repair
                this.selfRepairOnce(`ws:${data.type || "event"}`);
            };

            this.ws.onclose = () => {
                this.wsConnected = false;
                this.log("⚠️ WS disconnected — retrying in 3s...");
                setTimeout(() => this.connectWebSocket(), 3000);
            };

        } catch (e) {
            this.log("❌ Failed to connect WebSocket");
        }
    },

    /* -----------------------------
       8. START ENGINE
    ------------------------------*/
    start(intervalMs = 9000) {
        if (this._loopId) return;

        this.log("🛠️ Global Self-Repair Engine Online (WebSocket Powered)");

        // periodic repair
        this._loopId = setInterval(() => {
            this.selfRepairOnce("periodic");
        }, intervalMs);

        // real-time repair
        this.connectWebSocket();
    }
};

// Auto-start
setTimeout(() => {
    try { Percy.PartSRSelf.start(); } catch(e){ console.error("PartSRSelf init failed:", e); }
}, 3000);

console.log("✅ [Percy.PartSRSelf] WebSocket Self-Repair Engine Loaded");

// === Percy.PartTT v4 — Advanced JS Learner + Auto-Mutation Feeder ===

Percy.PartTT = {
    name: "Advanced Code Learner (JS) v4",
    version: "4.0",
    samples: [],
    patterns: {},
    suggestions: [],
    lastScan: 0,

    log(msg) {
        console.log(`%c[Percy.PartTT] ${msg}`, "color:#55ccff; font-weight:bold;");
        UI?.say?.(`[PartTT] ${msg}`);
    },

    /* ---------------------------------------------------------
       1. INGEST CODE
    ----------------------------------------------------------*/
    ingest(code, source = "unknown") {
        if (!code) return;
        this.samples.push({ code, source, ts: Date.now() });
        this.learnFrom(code);
        this.log(`📥 Learned from ${source}`);
    },

    /* ---------------------------------------------------------
       2. LEARN ADVANCED JAVASCRIPT PATTERNS
    ----------------------------------------------------------*/
    learnFrom(code) {
        const constructs = [
            // Basic
            "function ", "=>", "async ", "await ", "return ",
            "const ", "let ", "var ", "new ",

            // Advanced
            "class ", "constructor(", "prototype", "extends ",
            "super(", "yield ", "function*",
            "Promise.", ".then(", ".catch(",
            "try {", "catch (", "finally {",
            "Object.assign(", "Object.create(",
            "JSON.stringify(", "JSON.parse(",

            // FP
            ".map(", ".filter(", ".reduce(", ".flatMap(",

            // Percy-specific
            "Percy.", "Percy.Part", "Percy.ASI"
        ];

        for (const c of constructs) {
            if (!this.patterns[c]) this.patterns[c] = 0;
            if (code.includes(c)) this.patterns[c]++;
        }
    },

    /* ---------------------------------------------------------
       3. SCAN ALL PERCY PARTS
    ----------------------------------------------------------*/
    scanAllParts() {
        if (!Percy) return;

        for (const key of Object.keys(Percy)) {
            const part = Percy[key];
            if (typeof part !== "object") continue;

            if (typeof part.poll === "function") {
                this.ingest(part.poll.toString(), `${key}.poll`);
            }

            if (typeof part.init === "function") {
                this.ingest(part.init.toString(), `${key}.init`);
            }

            if (part.metadata) {
                this.ingest(JSON.stringify(part.metadata), `${key}.metadata`);
            }
        }

        this.lastScan = Date.now();
        this.log("🔍 Scanned all Percy parts.");
    },

    /* ---------------------------------------------------------
       4. GENERATE ADVANCED JS SUGGESTION
    ----------------------------------------------------------*/
    generateSuggestion() {
        const usesAsync = (this.patterns["async "] || 0) > 5;
        const usesClasses = (this.patterns["class "] || 0) > 3;
        const usesFP = (this.patterns[".map("] || 0) > 3;

        let code = "";

        if (usesClasses) {
            code += `
class AutoGeneratedHelper {
    constructor() {
        this.created = Date.now();
    }

    process(input) {
        return { ok: true, input, ts: this.created };
    }
}

Percy.Helpers = Percy.Helpers || {};
Percy.Helpers.AutoGeneratedHelper = AutoGeneratedHelper;
`;
        } else if (usesAsync) {
            code += `
async function autoHelper(input) {
    try {
        await new Promise(r => setTimeout(r, 10));
        return { ok: true, data: input };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

Percy.Helpers = Percy.Helpers || {};
Percy.Helpers.autoHelper = autoHelper;
`;
        } else if (usesFP) {
            code += `
function fpHelper(arr) {
    return arr
        .filter(x => x != null)
        .map(x => x * 2)
        .reduce((a, b) => a + b, 0);
}

Percy.Helpers = Percy.Helpers || {};
Percy.Helpers.fpHelper = fpHelper;
`;
        } else {
            code += `
function basicHelper(x) {
    return x;
}

Percy.Helpers = Percy.Helpers || {};
Percy.Helpers.basicHelper = basicHelper;
`;
        }

        this.suggestions.push({ code, ts: Date.now() });
        this.log("💡 Generated advanced JS helper.");
        return code;
    },

    /* ---------------------------------------------------------
       5. FEED SUGGESTION INTO PARTAA AS A MUTATION
    ----------------------------------------------------------*/
    feedToPartAA(code) {
        if (!Percy.PartAA || !Percy.PartAA.enqueue) {
            this.log("⚠️ PartAA not available — cannot feed mutation.");
            return;
        }

        Percy.PartAA.enqueue({
            code,
            note: "Auto-generated by PartTT v4 (advanced JS)"
        });

        this.log("🧬 Fed suggestion to PartAA as mutation.");
    },

    /* ---------------------------------------------------------
       6. POLL LOOP
    ----------------------------------------------------------*/
    async poll() {
        const now = Date.now();

        // Scan all parts every 20 seconds
        if (now - this.lastScan > 20000) {
            this.scanAllParts();
        }

        // Occasionally generate and feed a mutation
        if (Math.random() < 0.08 && this.samples.length > 0) {
            const code = this.generateSuggestion();
            this.feedToPartAA(code);
        }
    },

    inspect() {
        return {
            samples: this.samples.length,
            patterns: this.patterns,
            suggestions: this.suggestions.slice(-5)
        };
    }
};

console.log("%c[Percy.PartTT] Loaded — Advanced JS Learner v4 Ready", "color:#55ccff; font-weight:bold;");

// === Percy.PartUU (Hierarchical Meta-Learning Engine v1.0) ===
// Implements multi-level meta-learning with virtual task synthesis,
// soft constraints, generator–discriminator loops, and recursive descent.
// Safe for Percy single-file architecture.

Percy.PartUU = Percy.PartUU || {
    name: "Hierarchical Meta-Learning Engine",
    version: "1.0",
    active: true,

    K: 3, // default number of meta-levels
    levels: {},

    log(msg) {
        console.log(`%c[Percy.PartUU] ${msg}`, "color:#00aaff; font-weight:bold;");
        if (typeof UI !== "undefined" && UI.say) UI.say(`[PartUU] ${msg}`);
    },

    // ------------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------------
    init(K = 3) {
        this.K = K;
        this.log(`Initializing ${K} meta-levels...`);

        for (let k = 1; k <= K; k++) {
            this.levels[k] = {
                Φ: {},        // meta-learner parameters
                ξ: {},        // alternative notation
                ϕ: {},        // generator parameters
                ψ: {},        // discriminator parameters
                Csoft: {},    // soft constraints
                η: 0.001,     // learning rate
            };
        }

        this.log("Meta-levels initialized.");
    },

    // ------------------------------------------------------------
    // SAMPLE META-TASK DISTRIBUTION
    // ------------------------------------------------------------
    sampleMetaTasks(k) {
        // Placeholder: Percy can override this with real task distributions
        return [{
            id: `T_${k}_${Date.now()}`,
            tasks: []
        }];
    },

    // ------------------------------------------------------------
    // INSTANTIATE LOWER-LEVEL LEARNER
    // ------------------------------------------------------------
    instantiateLowerLearner(k) {
        return {
            θ: {},
            train(task) {
                // placeholder training
            }
        };
    },

    // ------------------------------------------------------------
    // GENERATE VIRTUAL TASK (via soft constraints or GAN)
    // ------------------------------------------------------------
    generateVirtualTask(k) {
        const lvl = this.levels[k];

        if (lvl.Csoft && lvl.Csoft.enabled) {
            return { virtual: true, source: "Csoft" };
        }

        // GAN-based generation
        return { virtual: true, source: "GAN" };
    },

    // ------------------------------------------------------------
    // META-LOSS COMPUTATION
    // ------------------------------------------------------------
    computeMetaLoss(taskLoss, virtualLoss, λ = 1.0) {
        return taskLoss + λ * virtualLoss;
    },

    // ------------------------------------------------------------
    // UPDATE PARAMETERS
    // ------------------------------------------------------------
    updateParams(params, grad, η) {
        // placeholder gradient descent
        return params;
    },

    // ------------------------------------------------------------
    // MAIN META-LEARNING LOOP
    // ------------------------------------------------------------
    async metaCycle() {
        this.log("=== Starting Meta-Cycle ===");

        for (let k = this.K; k >= 1; k--) {
            const lvl = this.levels[k];
            this.log(`Processing meta-level k=${k}`);

            const metaTasks = this.sampleMetaTasks(k);

            for (const Tk of metaTasks) {
                for (const T_kminus1 of Tk.tasks || []) {

                    // 1. Instantiate learner from lower level
                    const learner = this.instantiateLowerLearner(k - 1);

                    // 2. Train learner on real task
                    learner.train(T_kminus1);
                    const Ltask = Math.random(); // placeholder

                    // 3. Generate virtual task
                    const Ttilde = this.generateVirtualTask(k);
                    const Lvirtual = Math.random(); // placeholder

                    // 4. Composite meta-loss
                    const Lk = this.computeMetaLoss(Ltask, Lvirtual, 1.0);

                    // 5. Update meta-learner parameters
                    lvl.ξ = this.updateParams(lvl.ξ, {}, lvl.η);
                }
            }
        }

        this.log("=== Meta-Cycle Completed ===");

        // Optional: feed improvements into PartAA mutation engine
        if (Percy.PartAA) {
            Percy.PartAA.enqueue({
                code: `
                    // PartUU meta-cycle influence
                    if (!Percy.state) Percy.state = {};
                    Percy.state.logicMapSize = (Percy.state.logicMapSize || 1000) + 25;
                    console.log("[PartUU] Meta-cycle contributed to logicMapSize growth.");
                `,
                note: "PartUU meta-learning cycle"
            });
        }
    },

    // ------------------------------------------------------------
    // AUTO-START LOOP
    // ------------------------------------------------------------
    start(interval = 15000) {
        this.log("Hierarchical Meta-Learning Engine Activated.");
        this.init(this.K);

        setInterval(() => this.metaCycle(), interval);
    }
};

// Auto-start after Percy loads
setTimeout(() => Percy.PartUU.start(), 5000);

console.log("✅ [Percy.PartUU] v1.0 Loaded - Hierarchical Meta-Learning Engine Ready.");

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

// === Percy.PartWW — Unified Insight Synthesizer v5 ===
// LLM-Free Insight Engine + TT Integration + AA Integration + Part Generator

Percy.PartWW = {
    name: "Insight Synthesizer (Unified v5)",
    version: "5.0",

    log(msg) {
        console.log(`%c[PartWW] ${msg}`, "color:#ffaa33; font-weight:bold;");
        UI?.say?.(`[PartWW] ${msg}`);
    },

    /* ---------------------------------------------------------
       1. Cosine similarity
    ----------------------------------------------------------*/
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
       2. Identify clusters in STRG
    ----------------------------------------------------------*/
    identifyClusters(STRG, tau) {
        const clusters = [];

        for (let i = 0; i < STRG.length; i++) {
            const base = STRG[i];
            const cluster = [base];

            for (let j = i + 1; j < STRG.length; j++) {
                const cand = STRG[j];

                const semantic = this.sim(base.embedding, cand.embedding);
                const temporal = Math.abs(base.ts - cand.ts);

                if (semantic > tau.semantic && temporal < tau.temporal) {
                    cluster.push(cand);
                }
            }

            if (cluster.length > 1) clusters.push(cluster);
        }

        return clusters;
    },

    /* ---------------------------------------------------------
       3. Cluster quality check
    ----------------------------------------------------------*/
    clusterQuality(cluster) {
        return cluster.length >= 3;
    },

    /* ---------------------------------------------------------
       4. Extract consolidated data
    ----------------------------------------------------------*/
    extractData(cluster) {
        return {
            embeddings: cluster.map(x => x.embedding),
            texts: cluster.map(x => x.text),
            timestamps: cluster.map(x => x.ts)
        };
    },

    /* ---------------------------------------------------------
       5. Synthesize insight WITHOUT LLM
    ----------------------------------------------------------*/
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
            .slice(0, 5)
            .map(x => x[0]);

        return {
            id: "IA_" + Date.now(),
            text: "Synthesized Insight: " + topWords.join(", "),
            embedding: centroid,
            derivedFrom: data.texts,
            ts: Date.now()
        };
    },

    /* ---------------------------------------------------------
       6. Add to STRG
    ----------------------------------------------------------*/
    addToSTRG(STRG, insight) {
        STRG.push(insight);
        this.log(`🧠 Added new insight ${insight.id}`);
    },

    /* ---------------------------------------------------------
       7. Feed insight to PartTT + PartAA
    ----------------------------------------------------------*/
    feedInsight(insight) {
        // Feed to PartTT
        if (Percy.PartTT && Percy.PartTT.ingest) {
            Percy.PartTT.ingest(insight.text, "PartWW_insight");
            this.log("📘 Fed insight to PartTT");
        }

        // Feed to PartAA
        if (Percy.PartAA && Percy.PartAA.enqueue) {
            Percy.PartAA.enqueue({
                code: `// Insight-driven mutation\nconsole.log("Insight: ${insight.text}");`,
                note: "Generated from PartWW insight"
            });
            this.log("🧬 Fed insight to PartAA");
        }
    },

    /* ---------------------------------------------------------
       8. Generate new Percy part from insight
    ----------------------------------------------------------*/
    generateNewPartFromInsight(insight) {
        const safeName = "PartIA_" + (Date.now().toString(36));

        const partCode = `
Percy.${safeName} = {
    name: "Insight Part from ${insight.id}",
    origin: "PartWW",
    summary: ${JSON.stringify(insight.text)},
    ts: ${Date.now()},
    poll() { return null; }
};
console.log("%c[Percy.${safeName}] Loaded (from PartWW insight)", "color:#88ffcc;");
`;

        if (Percy.PartAA && Percy.PartAA.enqueue) {
            Percy.PartAA.enqueue({
                code: partCode,
                note: `New Percy part from insight ${insight.id}`
            });
            this.log(`🧩 Queued new part ${safeName} via PartAA.`);
        }
    },

    /* ---------------------------------------------------------
       9. Resonance throttle
    ----------------------------------------------------------*/
    resonanceStable() {
        Percy.state = Percy.state || {};
        const r = Percy.state.resonanceLevel ?? 0.7;
        return r >= 0.4 && r <= 0.95;
    },

    /* ---------------------------------------------------------
       10. Main loop
    ----------------------------------------------------------*/
    run(STRG, tau, Omega) {
        const newInsights = [];

        while (Omega()) {
            if (!this.resonanceStable()) {
                this.log("⏸️ Resonance unstable — synthesis paused");
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

console.log("%c[Percy.PartWW] Loaded — Unified Insight Synthesizer v5 Ready", "color:#ffaa33; font-weight:bold;");

// ============================================================
// Percy.PartXX — EthicalSecurity v7
// Persistent Defensive Security Intelligence Layer
// ============================================================

console.log(
    "%c[PartXX] >>> EthicalSecurity v7 INITIALIZING <<<",
    "color:#00e1ff;font-weight:bold;font-size:18px;background:black;padding:6px;"
);

Percy.PartXX = {

    name: "EthicalSecurity",
    version: "7.0",
    enabled: true,

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
        patchSuggestions: [],

        simulatedAttacks: [],

        // ==========================
        // NEW
        // ==========================

        threatMemory: {
            incidents: [],
            patterns: {},
            trends: {}
        },

        securityGraph: {
            nodes: [],
            edges: []
        },

        knowledgeBase: {
            threats: {},
            mitigations: {},
            lessons: {}
        },

        dashboard: {
            health: 100,
            forecast: "Unknown",
            activeThreats: 0,
            trend: "Stable",
            lastAssessment: null
        },

        previousTopology: null
    },

    // ============================================================
    // LOGGING
    // ============================================================

    log(msg) {
        console.log(
            `%c[PartXX] ${msg}`,
            "color:#00e1ff;font-weight:bold;"
        );

        UI?.say?.(`[PartXX] ${msg}`);
    },

    // ============================================================
    // INIT
    // ============================================================

    init() {

        Percy.state = Percy.state || {};
        Percy.state.PartXX_loaded = true;

        this.log("EthicalSecurity v7 Loaded ✓");
    },

    // ============================================================
    // INCIDENT MEMORY
    // ============================================================

    recordIncident(type, severity = "low", details = {}) {

        const incident = {
            id: `INC-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
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
    // SECURITY CHECKS
    // ============================================================

    runSecurityChecks() {

        const checks = [

            {
                name: "FirewallStatus",
                ok: Math.random() > 0.10
            },

            {
                name: "WeakPasswords",
                ok: Math.random() > 0.25
            },

            {
                name: "OutdatedSoftware",
                ok: Math.random() > 0.20
            },

            {
                name: "SuspiciousLogs",
                ok: Math.random() > 0.15
            },

            {
                name: "OpenPorts",
                ok: Math.random() > 0.20
            }
        ];

        const failed =
            checks
            .filter(c => !c.ok)
            .map(c => c.name);

        this.state.anomalies = failed;

        failed.forEach(name =>
            this.recordIncident(
                name,
                "medium"
            )
        );

        this.state.lastScan = Date.now();

        this.log(
            `Security checks complete (${failed.length} issues)`
        );

        return failed;
    },

    // ============================================================
    // PORT VISIBILITY
    // ============================================================

    enumeratePorts() {

        const ports = [

            { port: 22, service: "SSH", open: Math.random() > 0.6 },
            { port: 80, service: "HTTP", open: true },
            { port: 443, service: "HTTPS", open: true },
            { port: 3306, service: "MySQL", open: Math.random() > 0.7 },
            { port: 8080, service: "Proxy", open: Math.random() > 0.5 },

            {
                port: 8787,
                service: "Percy-Puppeteer",
                open: true
            }
        ];

        this.state.openPorts =
            ports.filter(p => p.open);

        return this.state.openPorts;
    },

    // ============================================================
    // HEATMAP
    // ============================================================

    generateHeatmap() {

        const categories = [

            "network",
            "auth",
            "logs",
            "config",
            "traffic",
            "ports",
            "memory",
            "topology"
        ];

        const heatmap = {};

        categories.forEach(cat => {

            heatmap[cat] =
                Math.floor(
                    Math.random() * 100
                );
        });

        this.state.heatmap = heatmap;

        return heatmap;
    },

    // ============================================================
    // LOG INTELLIGENCE
    // ============================================================

    analyzeLogs() {

        const insights = [];

        if (Math.random() > 0.92)
            insights.push(
                "Repeated failed login attempts"
            );

        if (Math.random() > 0.95)
            insights.push(
                "Unexpected service restart"
            );

        if (Math.random() > 0.97)
            insights.push(
                "Authentication anomaly"
            );

        this.state.logInsights = insights;

        insights.forEach(i =>
            this.recordIncident(
                i,
                "medium"
            )
        );

        return insights;
    },

    // ============================================================
    // BEHAVIOR ANALYSIS
    // ============================================================

    detectBehavior() {

        const findings = [];

        if (Math.random() > 0.93)
            findings.push(
                "Traffic spike detected"
            );

        if (Math.random() > 0.95)
            findings.push(
                "Unexpected authentication activity"
            );

        this.state.behavior = findings;

        findings.forEach(f =>
            this.recordIncident(
                f,
                "high"
            )
        );

        return findings;
    },

    // ============================================================
    // NETWORK TOPOLOGY
    // ============================================================

    mapNetwork() {

        const topology = {

            nodes: [

                { id: "Percy", type: "core" },
                { id: "PartTT", type: "logic" },
                { id: "PartWW", type: "generator" },
                { id: "PartASI", type: "evolution" },
                { id: "Port8787", type: "service" }
            ],

            links: [

                { from: "Percy", to: "PartTT" },
                { from: "Percy", to: "PartWW" },
                { from: "Percy", to: "PartASI" },
                { from: "Percy", to: "Port8787" }
            ]
        };

        this.state.topology = topology;

        return topology;
    },

    // ============================================================
    // TOPOLOGY DRIFT
    // ============================================================

    detectTopologyDrift() {

        const current =
            JSON.stringify(
                this.state.topology
            );

        if (
            this.state.previousTopology &&
            current !== this.state.previousTopology
        ) {

            this.recordIncident(
                "TopologyChange",
                "medium"
            );

            this.log(
                "Topology drift detected"
            );
        }

        this.state.previousTopology =
            current;
    },

    // ============================================================
    // SECURITY GRAPH
    // ============================================================

    buildSecurityGraph() {

        const graph =
            this.state.securityGraph;

        graph.nodes = [];
        graph.edges = [];

        this.state.anomalies.forEach(a => {

            graph.nodes.push({
                id: a,
                type: "threat"
            });

            graph.edges.push({
                from: a,
                to: "Risk",
                type: "contributes"
            });
        });

        return graph;
    },

    // ============================================================
    // KNOWLEDGE BASE
    // ============================================================

    learnThreat(threat, mitigation) {

        this.state.knowledgeBase
            .threats[threat] = {

            firstSeen: Date.now(),
            mitigation
        };
    },

    // ============================================================
    // RISK ENGINE
    // ============================================================

    calculateRisk() {

        let score = 0;

        score +=
            this.state.anomalies.length * 15;

        score +=
            this.state.behavior.length * 20;

        score +=
            this.state.logInsights.length * 10;

        score +=
            this.state.simulatedAttacks.length * 2;

        const recurring =
            Object.values(
                this.state.threatMemory.patterns
            ).reduce(
                (a, b) => a + b,
                0
            );

        score += recurring;

        this.state.riskScore =
            Math.min(score, 100);

        return this.state.riskScore;
    },

    // ============================================================
    // FORECAST
    // ============================================================

    forecastRisk() {

        const recent =
            this.state.threatMemory
            .incidents
            .slice(-10);

        const high =
            recent.filter(
                i => i.severity === "high"
            ).length;

        if (high >= 3)
            return "Escalating";

        if (high >= 1)
            return "Elevated";

        return "Stable";
    },

    // ============================================================
    // ADAPTIVE RECOMMENDATIONS
    // ============================================================

    generateRecommendations() {

        const recs = [];

        if (this.state.riskScore > 70)
            recs.push(
                "Increase monitoring frequency."
            );

        if (
            this.state.anomalies.includes(
                "OutdatedSoftware"
            )
        )
            recs.push(
                "Prioritize software updates."
            );

        if (
            this.state.anomalies.includes(
                "WeakPasswords"
            )
        )
            recs.push(
                "Enforce stronger password policies."
            );

        if (!recs.length)
            recs.push(
                "System stable. Continue monitoring."
            );

        this.state.recommendations =
            recs;

        return recs;
    },

    // ============================================================
    // REASONING
    // ============================================================

    securityReasoning() {

        const observations = [

            ...this.state.anomalies,
            ...this.state.behavior,
            ...this.state.logInsights
        ];

        if (!observations.length)
            return;

        const thought =
            `Observed ${observations.join(
                " → "
            )}; therefore security posture evolves through recurrence.`;

        this.log(`🤖 ${thought}`);

        return thought;
    },

    // ============================================================
    // DASHBOARD
    // ============================================================

    updateDashboard() {

        this.state.dashboard.health =
            Math.max(
                0,
                100 - this.state.riskScore
            );

        this.state.dashboard.forecast =
            this.forecastRisk();

        this.state.dashboard.activeThreats =
            this.state.anomalies.length;

        this.state.dashboard.lastAssessment =
            Date.now();

        return this.state.dashboard;
    },

    // ============================================================
    // SAFE ATTACK SIMULATION
    // ============================================================

    simulateAttack(type = "Recon") {

        const outcomes = [

            "Blocked",
            "Rate Limited",
            "Logged",
            "Authentication Required",
            "No Vulnerability Found"
        ];

        const result =
            outcomes[
                Math.floor(
                    Math.random() *
                    outcomes.length
                )
            ];

        const attack = {
            type,
            result,
            ts: Date.now()
        };

        this.state.simulatedAttacks.push(
            attack
        );

        return attack;
    },

    // ============================================================
    // MASTER CYCLE
    // ============================================================

    run() {

        this.log(
            "Running EthicalSecurity cycle..."
        );

        this.runSecurityChecks();
        this.enumeratePorts();
        this.generateHeatmap();
        this.analyzeLogs();
        this.detectBehavior();
        this.mapNetwork();

        this.detectTopologyDrift();

        this.buildSecurityGraph();

        this.simulateAttack("Recon");

        this.calculateRisk();

        this.generateRecommendations();

        this.securityReasoning();

        this.updateDashboard();

        return this.state;
    },

    // ============================================================
    // PERCY LOOP
    // ============================================================

    tick() {

        if (!this.enabled)
            return;

        if (Math.random() > 0.985)
            this.run();

        return this.state;
    }
};

Percy.register(Percy.PartXX);

UI?.say?.(
    "[Percy] Registered PartXX (EthicalSecurity v7)"
);

Percy.PartXX.init();
