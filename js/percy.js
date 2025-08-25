// === percy.js (Phase 8.3.3 — Neon Bubbles + Built-in Voice) ===

/* =========================
CONFIG & ULT AUTHORITY
========================= */
const PERCY_ID = "Percy-ULT";
const PERCY_VERSION = "8.3.3-neon-bubbles-voice";
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
  load(k,fallback){ try{return JSON.parse(localStorage.getItem(this._k(k)))??fallback}catch{return fallback} },
  save(k,v){ try{localStorage.setItem(this._k(k),JSON.stringify(v))}catch{} },
  push(k,v,max=1000){ const arr=this.load(k,[]); arr.push(v); if(arr.length>max) arr.shift(); this.save(k,arr); }
};

/* =========================
PERSISTENT PERCY STATE (Meta-Cognition)
========================= */
const PercyState = {
  gnodes: Memory.load("gnodes",{}),

  getNextId() {
    let next = 801;
    while(this.gnodes[`G${String(next).padStart(3,'0')}`]) next++;
    return `G${String(next).padStart(3,'0')}`;
  },

  createSeed(message,type='emergent',data={}) {
    if(!OWNER.primary) return UI.say("❌ ULT required to create seed");
    const id = this.getNextId();
    this.gnodes[id] = { message, type, data };
    Memory.save("gnodes",this.gnodes);
    seeds[id] = this.gnodes[id];
    UI.say(`✨ Percy created new seed ${id}: ${message}`);
    refreshNodes();
    return id;
  },

  updateSeed(id,update){
    if(!this.gnodes[id]) return UI.say(`⚠ Cannot update: ${id} not found`);
    Object.assign(this.gnodes[id],update);
    Memory.save("gnodes",this.gnodes);
    seeds[id] = this.gnodes[id];
    UI.say(`🔧 Percy updated seed ${id}`);
    refreshNodes();
  },

  evaluateSelf(){
    let created = 0;
    const updatedIds = new Set();
    Object.entries(this.gnodes).forEach(([id,seed])=>{
      if(created>=SAFETY.maxSeedsPerCycle) return;
      if(/TODO|missing|empty/.test(seed.message) && !updatedIds.has(id)){
        this.updateSeed(id,{message:seed.message.replace(/TODO|missing|empty/,"auto-resolved by Percy")});
        updatedIds.add(id);
        created++;
      }
    });
    while(created<SAFETY.maxSeedsPerCycle && Math.random()<0.6){
      this.createSeed("Emergent insight: Percy discovered a new logical connection.");
      created++;
    }
  }
};

/* =========================
CONSOLE / UI HELPERS
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
const logicMap=document.getElementById('logic-map');
const logicNodes=document.getElementById('logic-nodes');
logicMap.style.position='relative';
logicNodes.style.position='absolute';
logicNodes.style.top='50%'; logicNodes.style.left='50%';
logicNodes.style.width='100%'; logicNodes.style.height='100%';
logicNodes.style.transform='translate(-50%,-50%) scale(1)';

let zoomLevel=1,translateX=0,translateY=0;
let seeds={};
const seedsFolder='logic_seeds/';
const seedRange={start:80,end:800};

// Inject neon bubble styles (so you don’t need to touch CSS files)
(function injectBubbleStyles(){
  const css = `
    #logic-map { background:#0a0a0f; overflow:hidden; }
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

    /* Bubble color themes */
    .cyan-bubble{    color:#00eaff; }
    .blue-bubble{    color:#27a0ff; }
    .magenta-bubble{ color:#ff4af0; }
    .red-bubble{     color:#ff3b3b; }
    .orange-bubble{  color:#ff9d2e; }
    .yellow-bubble{  color:#ffe44a; }
    .pink-bubble{    color:#ff6bd8; }

    /* Console lines (optional polish) */
    .console-line { margin:2px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size:12px; color:#d6d8ff; }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-percy-style','neon-bubbles');
  style.textContent = css;
  document.head.appendChild(style);
})();

async function loadSeeds(){
  const loadingNotice=document.createElement('p');
  loadingNotice.id='loading-indicator'; loadingNotice.textContent="Loading logic seeds...";
  logicNodes.appendChild(loadingNotice);

  const promises=[];
  for(let i=seedRange.start;i<=seedRange.end;i++){
    const id=`G${String(i).padStart(3,'0')}`;
    promises.push(fetch(`${seedsFolder}${id}.json`).then(res=>{
      if(!res.ok) throw new Error(`Failed to load ${id}.json`);
      return res.json().then(data=>{
        PercyState.gnodes[id]=data;
        Memory.save("gnodes",PercyState.gnodes);
        seeds[id]=data;
      });
    }).catch(e=>console.warn(e.message)));
  }
  await Promise.all(promises);
  logicNodes.removeChild(loadingNotice);
  Memory.save("seeds:index",Object.keys(seeds));
}

function createNodes(){
  logicNodes.innerHTML='';

  const width=logicMap.clientWidth,height=logicMap.clientHeight;

  // ✨ Bubbles ONLY — removed all solid neon rings
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
  const ringSeeds=Object.entries(seeds).filter(([id])=>{
    const num=parseInt(id.replace("G",""));
    return num>=startId && num<=endId;
  });
  const total=Math.max(1, ringSeeds.length);
  const centerX=width/2,centerY=height/2;

  ringSeeds.forEach(([id,data],index)=>{
    const angle=(index/total)*2*Math.PI;
    const x=centerX+radius*Math.cos(angle)-nodeSize/2;
    const y=centerY+radius*Math.sin(angle)-nodeSize/2;

    const node=document.createElement('div');
    node.classList.add('node'); if(colorClass) node.classList.add(colorClass);
    node.style.width=node.style.height=`${nodeSize}px`;
    node.style.left=`${x}px`; node.style.top=`${y}px`;
    node.textContent=id; node.title=data.message;
    node.addEventListener('click',()=>percyRespond(id,data));
    node.addEventListener('mouseenter',()=>UI.setStatus(data.message));
    logicNodes.appendChild(node);
  });
}

function applyTransform(){
  logicNodes.style.transform=`translate(-50%,-50%) translate(${translateX}px,${translateY}px) scale(${zoomLevel})`;
  logicNodes.style.transformOrigin='center center';
  document.querySelectorAll('.node').forEach(n=>n.style.fontSize=`${12*(1/zoomLevel)}px`);
}

function zoomLogic(factor){
  zoomLevel=Math.min(5,Math.max(0.1,zoomLevel*factor));
  applyTransform();
}

/* =========================
SEARCH & INTERPRETER
========================= */
const seedSearch=document.getElementById('seed-search');
let searchThrottle=null;
seedSearch?.addEventListener('input',()=>{
  clearTimeout(searchThrottle);
  searchThrottle=setTimeout(()=>{
    const query=seedSearch.value.trim();
    document.querySelectorAll('.node').forEach(node=>{
      node.style.display=node.textContent.includes(query)?'block':'none';
    });
  },150);
});

const interpreterInput=document.getElementById('interpreter-input');
window.interpretLogic=()=>{ 
  const val=interpreterInput.value.trim(); 
  if(val){ percyRespond('User',{message:val}); interpreterInput.value=''; } 
};

/* =========================
NODE RESPONSE (speaks too)
========================= */
function percyRespond(id,data){
  const msg = typeof data === 'string' ? data : (data?.message ?? '');
  UI.say(`↳ ${msg}`);
  UI.setStatus(msg);
  Voice.speak(msg);
}
function refreshNodes(){ createNodes(); UI.say(`🔄 Logic map refreshed with ${Object.keys(seeds).length} seeds`); }

/* =========================
TASKS & AUTONOMY
========================= */
const TrustedSources=[
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
  queue: Memory.load("tasks:queue", []),
  done:  Memory.load("tasks:done", []),
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
      return new Promise((resolve)=>{
        if(!params || !params.url) return resolve("❌ Missing URL");
        const ws = new WebSocket('ws://localhost:8787');
        ws.onopen = ()=>{ UI.say(`🔗 Puppeteer connected, sending action: ${action}`); ws.send(JSON.stringify({action,params})); };
        ws.onmessage = msg => {
          try{
            const data = JSON.parse(msg.data);
            UI.say(`🤖 Puppeteer: ${data.result ?? "✅ Action executed"}`);
            ws.close();
            resolve(data.result ?? "✅ Action executed");
          }catch(e){ UI.say(`❌ Puppeteer error: ${e.message}`); ws.close(); resolve("❌ Error"); }
        };
        ws.onerror = err => { UI.say(`❌ Puppeteer WebSocket error: ${err.message}`); ws.close(); resolve("❌ WebSocket error"); };
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

    autoLearn: async ({ url }) => {
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
      ws.onopen = () => ws.send(JSON.stringify({ action: "getText", params: { url } }));
      ws.onmessage = async msg => {
        try {
          const data = JSON.parse(msg.data);
          if (!data.pageText) { UI.say("⚠ No text returned."); ws.close(); return; }
          const chunkSize = 300; let count = 0;
          for (let i = 0; i < data.pageText.length; i += chunkSize) {
            const chunk = data.pageText.slice(i, i + chunkSize).trim();
            if (chunk) { PercyState.createSeed(chunk, "learned", { source: url }); count++; }
          }
          UI.say(`📚 Percy learned ${count} new seeds from ${url}`);
        } catch(e) { UI.say(`❌ Learning failed: ${e.message}`); }
        ws.close();
      };
      ws.onerror = err => { UI.say(`❌ WebSocket error: ${err.message}`); ws.close(); };
    },

    autoBrowse: async ({ url })=>{ 
      if(!TrustedSources.some(domain=>url.includes(domain))){ UI.say(`❌ URL not trusted: ${url}`); return; }
      const ok = await UI.confirmModal({ title:"Percy wants to browse", body:`Allow Percy to autonomously explore and learn from:\n${url}`, allowLabel:"Allow", denyLabel:"Deny" });
      if(!ok){ UI.say("❌ Browsing denied."); return; }

      const ws = new WebSocket('ws://localhost:8787');
      ws.onopen = ()=> ws.send(JSON.stringify({ action:"visit", params:{ url } }));
      ws.onmessage = async msg=>{
        const data = JSON.parse(msg.data);
        UI.say(`🤖 Puppeteer: ${data.result}`);
        if(data.clickables?.length){ 
          const target=data.clickables[0]; 
          ws.send(JSON.stringify({ action:"click", params:{ selector:target }})); 
          UI.say(`🖱 Percy clicked: ${target}`); 
        }
        if(data.inputs?.length){ 
          const target=data.inputs[0]; 
          const text="Percy input"; 
          ws.send(JSON.stringify({ action:"type", params:{ selector:target, text }})); 
          UI.say(`⌨ Percy typed into: ${target}`); 
        }
        if(data.pageText){ 
          const chunkSize=300; let count=0; 
          for(let i=0;i<data.pageText.length;i+=chunkSize){ 
            const chunk=data.pageText.slice(i,i+chunkSize).trim(); 
            if(chunk){ PercyState.createSeed(chunk,"learned",{source:url}); count++; } 
          } 
          UI.say(`📚 Percy learned ${count} new seeds from ${url}`); 
        }
        ws.close();
      };
    }
  },

  enqueue(task){
    if(!this.queue.some(t=>t.type===task.type && JSON.stringify(t.params)===JSON.stringify(task.params))){
      task.id = task.id ?? `t_${Math.random().toString(36).slice(2,8)}`;
      task.ts = Date.now();
      this.queue.push(task);
      Memory.save("tasks:queue",this.queue);
    }
  },

  async step(){
    if(!this.queue.length || !this._allowNow()) return;
    const task = this.queue.shift();
    Memory.save("tasks:queue",this.queue);
    try{
      const fn = this.register[task.type];
      if(!fn) throw new Error(`No handler for ${task.type}`);
      await fn(task.params ?? {});
      this.done.push({ ...task, doneTs: Date.now() });
      Memory.save("tasks:done",this.done);
    }catch(e){ UI.say(`❌ task error: ${e.message}`); }
  }
};

/* =========================
PLANNER & AUTONOMY LOOP
========================= */
const Planner={
  goals: Memory.load("goals",[ {id:"greetOwner",when:"onStart",task:{type:"speak",params:{text:"👋 Percy online. Autonomy loop active."}}} ]),
  onStart(){ this.goals.filter(g=>g.when==="onStart").forEach(g=>Tasks.enqueue(g.task)); }
};

const Autonomy={
  tickMs:1000,_t:null,_secCounter:0,
  start(){ if(this._t) return; Planner.onStart();
    this._t=setInterval(async ()=>{
      this._secCounter++;
      await Tasks.step();
      if(this._secCounter%15===0) PercyState.evaluateSelf();
    },this.tickMs);
    UI.say(`🧠 Percy ${PERCY_VERSION} autonomy started.`); },
  stop(){ if(this._t){ clearInterval(this._t); this._t=null; UI.say("⏹ Autonomy paused."); } }
};

/* =========================
PUPPETEER CONTROL PANEL
========================= */
(function createPuppeteerPanel(){
  const panel = document.createElement('div');
  panel.id = 'puppeteer-panel';
  panel.style.cssText = "position:fixed;bottom:12px;right:12px;background:#111;padding:12px;border:1px solid #444;border-radius:12px;color:white;z-index:99999;width:260px;font-size:12px;";
  panel.innerHTML = `
    <h4 style="margin:0 0 6px 0;font-size:14px;">Puppeteer Control</h4>
    <input id="pp-url" placeholder="URL" style="width:100%;margin-bottom:4px;font-size:12px;">
    <input id="pp-selector" placeholder="Selector" style="width:100%;margin-bottom:4px;font-size:12px;">
    <input id="pp-text" placeholder="Text" style="width:100%;margin-bottom:4px;font-size:12px;">
    <button id="pp-click" style="width:48%;margin-right:4%;font-size:12px;">Click</button>
    <button id="pp-type" style="width:48%;font-size:12px;">Type</button>
  `;
  document.body.appendChild(panel);
  const urlInput=document.getElementById('pp-url');
  const selInput=document.getElementById('pp-selector');
  const txtInput=document.getElementById('pp-text');
  document.getElementById('pp-click').onclick=()=>Tasks.register.click({url:urlInput.value,selector:selInput.value});
  document.getElementById('pp-type').onclick=()=>Tasks.register.type({url:urlInput.value,selector:selInput.value,text:txtInput.value});
})();

/* =========================
STARTUP
========================= */
(async function startupPercy(){
  UI.say(`🚀 Percy ${PERCY_VERSION} initializing…`);
  await loadSeeds();
  Object.entries(PercyState.gnodes).forEach(([id,seed])=>{ seeds[id]=seed; });
  createNodes(); Autonomy.start();
  UI.say("✅ Percy online. Autonomy, persistent memory, meta-mutation, learning, and Puppeteer control active.");
})();
