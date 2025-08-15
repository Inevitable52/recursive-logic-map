// === percy.js (Phase 8 + Self-Writing / Meta-Mutation + Auto-Learn + Search & Zoom) ===

/* =========================
CONFIG & ULT AUTHORITY
========================= */
const PERCY_ID = "Percy-ULT";
const PERCY_VERSION = "8.0.4-meta";
const OWNER = { primary: "Fabian", secondary: "Lorena" };
const SAFETY = {
  maxActionsPerMinute: 20,
  maxSeedsPerCycle: 3,
  requirePermissionFor: ["externalFetch", "openTab", "writeDisk", "emailLike"],
  consoleLimit: 500
};

/* =========================
SOFT PERSISTENCE (Memory)
========================= */
const Memory = {
  _k: (k) => `percy:${k}`,
  load(k, fallback) { try { return JSON.parse(localStorage.getItem(this._k(k))) ?? fallback; } catch { return fallback; } },
  save(k, v) { localStorage.setItem(this._k(k), JSON.stringify(v)); },
  push(k, v, max = 1000) { const arr = this.load(k, []); arr.push(v); if(arr.length>max) arr.shift(); this.save(k, arr); }
};

/* =========================
CONSOLE / UI HELPERS
========================= */
const UI = {
  elConsole: () => document.getElementById('percy-console'),
  elMsg: () => document.getElementById('percy-message'),
  say(txt) {
    const box = this.elConsole(); if(!box) return;
    const p = document.createElement('p'); p.className='console-line'; p.textContent=txt;
    box.appendChild(p); box.scrollTop=box.scrollHeight;
    const max = SAFETY.consoleLimit;
    while(box.children.length>max) box.removeChild(box.firstChild);
  },
  setStatus(txt){ const m=this.elMsg(); if(m) m.textContent=txt; },
  confirmModal({title, body, allowLabel="Allow", denyLabel="Deny"}) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:99999`;
      const card = document.createElement('div');
      card.style.cssText = `background:#0b0b12;color:#eee;max-width:520px;width:92%;border:1px solid #444;border-radius:16px;padding:16px 18px;box-shadow:0 6px 32px rgba(0,0,0,.5)`;
      card.innerHTML = `<h3 style="margin:0 0 8px 0;font-size:18px;">${title}</h3>
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
LOGIC MAP & SEEDS
========================= */
const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
logicMap.style.position='relative';
logicNodes.style.position='absolute';
logicNodes.style.top='0';
logicNodes.style.left='0';
logicNodes.style.width='100%';
logicNodes.style.height='100%';

let zoomLevel = 1, translateX = 0, translateY = 0;
let seeds = {};
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 800 };

async function loadSeeds() {
  const loadingNotice = document.createElement('p');
  loadingNotice.id='loading-indicator';
  loadingNotice.textContent="Loading logic seeds...";
  logicNodes.appendChild(loadingNotice);

  for(let i=seedRange.start;i<=seedRange.end;i++){
    const filename=`G${String(i).padStart(3,'0')}.json`;
    try{
      const res = await fetch(seedsFolder+filename);
      if(!res.ok) throw new Error(`Failed to load ${filename}`);
      const data = await res.json();
      seeds[filename]=data;
      Memory.save(`seed:${filename}`, data);
    } catch(e){ console.warn(e.message); }
  }
  logicNodes.removeChild(loadingNotice);
  Memory.save("seeds:index", Object.keys(seeds));
}

/* =========================
NODE CREATION & VISUALIZATION
========================= */
function createNodes() {
  logicNodes.innerHTML='';
  const width = logicMap.clientWidth;
  const height = logicMap.clientHeight;

  layoutRing(80,200,width,height,width/2.5,'',60);
  layoutRing(201,300,width,height,width/3.4,'blue-ring',45);
  layoutRing(301,400,width,height,width/4.8,'purple-ring',30);
  layoutRing(401,500,width,height,width/6.6,'red-ring',22);
  layoutRing(501,600,width,height,width/8.5,'crimson-ring',18);
  layoutRing(601,700,width,height,width/11,'gold-ring',14);
  layoutRing(701,800,width,height,width/14,'neon-pink-ring',12);

  applyTransform();
}

function layoutRing(startId,endId,width,height,radius,colorClass,nodeSize){
  const ringSeeds = Object.entries(seeds).filter(([id])=>{
    const num=parseInt(id.replace("G",""));
    return num>=startId && num<=endId;
  });
  const total=ringSeeds.length;
  const centerX=width/2;
  const centerY=height/2;

  ringSeeds.forEach(([filename,data],index)=>{
    const angle=(index/total)*2*Math.PI;
    const x=centerX+radius*Math.cos(angle)-nodeSize/2;
    const y=centerY+radius*Math.sin(angle)-nodeSize/2;

    const node=document.createElement('div');
    node.classList.add('node');
    if(colorClass) node.classList.add(colorClass);
    node.style.width=`${nodeSize}px`;
    node.style.height=`${nodeSize/2}px`;
    node.style.left=`${x}px`;
    node.style.top=`${y}px`;
    node.style.position='absolute';
    node.textContent=filename;
    node.title=data.message;
    node.addEventListener('click',()=>percyRespond(filename,data));
    node.addEventListener('mouseenter',()=>UI.setStatus(data.message));
    logicNodes.appendChild(node);
  });
}

function applyTransform(){
  logicNodes.style.transform=`translate(${translateX}px,${translateY}px) scale(${zoomLevel})`;
  logicNodes.style.transformOrigin='center';
  document.querySelectorAll('.node').forEach(n=>n.style.fontSize=`${12*(1/zoomLevel)}px`);
}

/* =========================
ZOOM FUNCTION
========================= */
function zoomLogic(factor){
  zoomLevel *= factor;
  if(zoomLevel<0.1) zoomLevel=0.1;
  if(zoomLevel>5) zoomLevel=5;
  applyTransform();
}

/* =========================
LOGIC SEED SEARCH
========================= */
const seedSearch = document.getElementById('seed-search');
seedSearch.addEventListener('input', ()=>{
  const query = seedSearch.value.trim();
  document.querySelectorAll('.node').forEach(node=>{
    node.style.display = node.textContent.includes(query)? 'block':'none';
  });
});

/* =========================
ASK PERCY HTML INPUT
========================= */
const interpreterInput = document.getElementById('interpreter-input');
window.interpretLogic = ()=>{
  const val = interpreterInput.value.trim();
  if(val){
    percyRespond('User',{message:val});
    interpreterInput.value='';
  }
};

/* =========================
MUTATION ENGINE (SELF-WRITING)
========================= */
const Mutation = {
  generateId(){ let next=801; while(seeds[`G${String(next).padStart(3,'0')}`]) next++; return `G${String(next).padStart(3,'0')}`; },
  createSeed(message,type='emergent',data={}){ 
    if(!OWNER.primary) return UI.say("❌ ULT required to create seed");
    const id=this.generateId();
    const newSeed={message,type,data};
    seeds[id]=newSeed;
    Memory.save(`seed:${id}`,newSeed);
    UI.say(`✨ Percy created new seed ${id}: ${message}`);
    refreshNodes(); return id;
  },
  updateSeed(id,update){ if(!seeds[id]) return UI.say(`⚠ Cannot update: ${id} not found`);
    Object.assign(seeds[id],update); Memory.save(`seed:${id}`,seeds[id]); UI.say(`🔧 Percy updated seed ${id}`); refreshNodes();
  },
  validateSeed(id){ const seed=seeds[id]; return !!(seed && seed.message); }
};

function metaMutationCycle(){
  const maxPerCycle=SAFETY.maxSeedsPerCycle;
  let created=0;
  Object.entries(seeds).forEach(([id,seed])=>{
    if(created>=maxPerCycle) return;
    if(/TODO|missing|empty/.test(seed.message)){
      Mutation.updateSeed(id,{message:seed.message.replace(/TODO|missing|empty/,"auto-resolved by Percy")});
      created++;
    }
  });
  while(created<maxPerCycle && Math.random()<0.5){
    Mutation.createSeed("Emergent insight: Percy discovered a new logical connection.");
    created++;
  }
}

/* =========================
VISUAL REFRESH
========================= */
function refreshNodes(){ createNodes(); UI.say(`🔄 Logic map refreshed with ${Object.keys(seeds).length} seeds`); }

/* =========================
PERCY RESPOND
========================= */
function percyRespond(id,data){ UI.say(`↳ ${data.message}`); UI.setStatus(data.message); }

/* =========================
AUTONOMY + PLANNER
========================= */
const Tasks = {
  queue: Memory.load("tasks:queue",[]),
  done: Memory.load("tasks:done",[]),
  rate:{stamps:[]},
    _allowNow() {
    const now = Date.now();
    this.rate.stamps = this.rate.stamps.filter(t => now - t < 60_000);
    if(this.rate.stamps.length >= SAFETY.maxActionsPerMinute) return false;
    this.rate.stamps.push(now);
    return true;
  },
  register: {
    speak: async ({ text }) => UI.say(text),
    highlightSeed: async ({ seedId }) => UI.say(`🔎 focusing ${seedId}`)
  },
  enqueue(task) {
    task.id = task.id ?? `t_${Math.random().toString(36).slice(2,8)}`;
    task.ts = Date.now();
    this.queue.push(task);
    Memory.save("tasks:queue", this.queue);
  },
  async step() {
    if(!this.queue.length || !this._allowNow()) return;
    const task = this.queue.shift();
    Memory.save("tasks:queue", this.queue);
    try {
      const fn = this.register[task.type];
      if(!fn) throw new Error(`No handler for ${task.type}`);
      await fn(task.params ?? {});
      this.done.push({...task, doneTs: Date.now()});
      Memory.save("tasks:done", this.done);
    } catch(e){ UI.say(`❌ task error: ${e.message}`); }
  }
};

/* =========================
AUTONOMOUS LEARNING
========================= */
const TrustedSources = [
  "https://www.dictionary.com",
  "https://www.merriam-webster.com",
  "https://en.wikipedia.org"
];

Tasks.register.autoLearn = async ({ url }) => {
  if(!TrustedSources.some(domain => url.includes(domain))) {
    UI.say(`❌ URL not trusted for learning: ${url}`);
    return;
  }

  const ok = await UI.confirmModal({
    title: "Percy requests to learn from a website",
    body: `Allow Percy to fetch and learn from:\n${url}`,
    allowLabel: "Allow once",
    denyLabel: "Deny"
  });

  if(!ok) { UI.say("❌ Learning denied."); return; }

  try {
    const res = await fetch(url);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const content = doc.body.innerText;
    const chunkSize = 300;
    let count = 0;
    for(let i=0; i<content.length; i+=chunkSize) {
      const chunk = content.slice(i, i+chunkSize).trim();
      if(chunk) { Mutation.createSeed(chunk, "learned", { source: url }); count++; }
    }
    UI.say(`📚 Percy learned ${count} new seeds from ${url}`);
  } catch(e){
    UI.say(`❌ Learning failed: ${e.message}`);
  }
};

/* =========================
PLANNER & AUTONOMY LOOP
========================= */
const Planner = {
  goals: Memory.load("goals", [
    { id: "greetOwner", when: "onStart", task: { type: "speak", params: { text: "👋 Percy online. Autonomy loop active." } } }
  ]),
  onStart() {
    this.goals.filter(g => g.when==="onStart").forEach(g => Tasks.enqueue(g.task));
  }
};

const Autonomy = {
  tickMs: 1000, _t:null, _secCounter:0,
  start() {
    if(this._t) return;
    Planner.onStart();
    this._t = setInterval(async ()=>{
      this._secCounter++;
      await Tasks.step();
      if(this._secCounter % 15 === 0) metaMutationCycle();
    }, this.tickMs);
    UI.say(`🧠 Percy ${PERCY_VERSION} autonomy started.`);
  },
  stop() {
    if(this._t){ clearInterval(this._t); this._t=null; UI.say("⏹ Autonomy paused."); }
  }
};

/* =========================
STARTUP
========================= */
(async function startupPercy() {
  UI.say(`🚀 Percy ${PERCY_VERSION} initializing…`);
  await loadSeeds();
  createNodes();
  Autonomy.start();
  UI.say("✅ Percy online. Autonomy, memory, meta-mutation, and learning active.");
})();

/* =========================
GLOBAL SHORTCUTS
========================= */
window.Percy = {
  Memory,
  Tasks,
  Planner,
  Autonomy,
  UI,
  Mutation,
  metaMutationCycle,
  refreshNodes,
  percyRespond,
  seeds,
  zoomLogic
};

