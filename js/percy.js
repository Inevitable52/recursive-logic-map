// === percy.js (Phase 8.3.2 — Autonomous Browsing + Puppeteer Panel, no solid rings) ===

/* =========================
CONFIG & ULT AUTHORITY
========================= */
const PERCY_ID = "Percy-ULT";
const PERCY_VERSION = "8.3.2-meta";
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
    UI.say(`✨ Created seed ${id}`);
    refreshNodes();
    return id;
  },

  updateSeed(id,update){
    if(!this.gnodes[id]) return UI.say(`⚠ Cannot update: ${id} not found`);
    Object.assign(this.gnodes[id],update);
    Memory.save("gnodes",this.gnodes);
    seeds[id] = this.gnodes[id];
    UI.say(`🔧 Updated seed ${id}`);
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
LOGIC MAP & NODE VISUALIZATION  (no solid rings)
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

// NOTE: removed the SVG ring drawing entirely

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
        seeds[id]=data;
      });
    }).catch(e=>console.warn(e.message)));
  }
  await Promise.all(promises);
  logicNodes.removeChild(loadingNotice);
  Memory.save("gnodes",PercyState.gnodes);
  Memory.save("seeds:index",Object.keys(seeds));
}

function createNodes(){
  logicNodes.innerHTML='';
  const width=logicMap.clientWidth,height=logicMap.clientHeight;

  // keep concentric placement (invisible rings), just positions
  layoutRing(80,200,width,height,width/2.5,'',60);
  layoutRing(201,300,width,height,width/3.4,'',45);
  layoutRing(301,400,width,height,width/4.8,'',30);
  layoutRing(401,500,width,height,width/6.6,'',22);
  layoutRing(501,600,width,height,width/8.5,'',18);
  layoutRing(601,700,width,height,width/11,'',14);
  layoutRing(701,800,width,height,width/14,'',12);

  applyTransform();
}

function layoutRing(startId,endId,width,height,radius,colorClass,nodeSize){
  const ringSeeds=Object.entries(seeds).filter(([id])=>{
    const num=parseInt(id.replace("G",""));
    return num>=startId && num<=endId;
  });
  const total=ringSeeds.length || 1;
  const centerX=width/2,centerY=height/2;

  ringSeeds.forEach(([id,data],index)=>{
    const angle=(index/total)*2*Math.PI;
    const x=centerX+radius*Math.cos(angle)-nodeSize/2;
    const y=centerY+radius*Math.sin(angle)-nodeSize/2;

    const node=document.createElement('div');
    node.classList.add('node');
    node.style.width=node.style.height=`${nodeSize}px`;
    node.style.left=`${x}px`; node.style.top=`${y}px`;
    node.style.position='absolute'; node.style.borderRadius='50%';
    node.style.border="1px solid #384057";
    node.style.background="radial-gradient(ellipse at center, #182031 0%, #0f1524 70%)";
    node.style.boxShadow="0 2px 10px rgba(0,0,0,.35)";
    node.style.display="grid"; node.style.placeItems="center";
    node.style.color="#cfe3ff"; node.style.fontFamily="ui-monospace, Menlo, monospace";
    node.textContent=id; node.title=data.message || id;
    node.addEventListener('click',()=>percyRespond(id,data));
    node.addEventListener('mouseenter',()=>UI.setStatus(data.message || id));
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
seedSearch.addEventListener('input',()=>{
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
NODE RESPONSE
========================= */
function percyRespond(id,data){ UI.say(`↳ ${data.message || id}`); UI.setStatus(data.message || id); }
function refreshNodes(){ createNodes(); UI.say(`🔄 Map refreshed with ${Object.keys(seeds).length} seeds`); }

/* =========================
TASKS, AUTONOMY & AUTOLEARN
========================= */
const TrustedSources=[
  "https://www.dictionary.com",
  "https://www.merriam-webster.com",
  "https://en.wikipedia.org",
  "https://developer.mozilla.org",
  "https://gemini.google.com",
  "https://chatgpt.com"
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
    speak: async ({ text }) => UI.say(text),
    highlightSeed: async ({ seedId }) => UI.say(`🔎 focusing ${seedId}`),

    // Centralized WS command (no forced url for non-visit)
    puppeteerCommand: async ({ action, params = {} }) => {
      return new Promise((resolve) => {
        if (action === "visit" && !params.url) {
          UI.say("❌ visit requires a URL");
          return resolve("❌ visit requires a URL");
        }
        const ws = new WebSocket('ws://localhost:8787');
        let settled = false;

        const safeResolve = (val) => { if (!settled) { settled = true; try{ws.close()}catch{} resolve(val); } };

        ws.onopen = ()=>{ 
          UI.say(`🔗 Puppeteer connected → ${action}`); 
          ws.send(JSON.stringify({action, params})); 
        };
        ws.onmessage = (msg) => {
          try{
            const data = JSON.parse(msg.data);
            if (data.pageText) {
              // optional: stream a small preview
              UI.say(`📄 Received text (${Math.min(data.pageText.length,120)} chars)…`);
            }
            UI.say(`🤖 Puppeteer: ${data.result ?? "✅ OK"}`);
            safeResolve(data);
          }catch(e){
            UI.say(`❌ Puppeteer parse error: ${e.message}`);
            safeResolve({ result: "❌ Error parsing message" });
          }
        };
        ws.onerror = (err) => { UI.say(`❌ WS error: ${err.message||err}`); safeResolve({ result: "❌ WebSocket error" }); };
        ws.onclose = () => safeResolve({ result: "WS closed" });
      });
    },

    // simple helpers
    click: async ({ selector }) => { 
      if(!selector) return UI.say("❌ Click failed: missing selector");
      await Tasks.register.puppeteerCommand({ action: "click", params: { selector } }); 
    },
    type: async ({ selector, text }) => { 
      if(!selector || !text) return UI.say("❌ Type failed: missing params");
      await Tasks.register.puppeteerCommand({ action: "type", params: { selector, text } }); 
    },

    // ✅ FIXED: uses "autoLearn" action (not getText), accepts pageText or text
    autoLearn: async ({ url, selector = "body" }) => {
      if (!TrustedSources.some(domain => url.includes(domain))) { UI.say(`❌ URL not trusted: ${url}`); return; }

      const ok = await UI.confirmModal({
        title: "Percy requests to learn",
        body: `Allow Percy to fetch text from:\n${url}\n\nSelector: ${selector}`,
        allowLabel: "Allow once",
        denyLabel: "Deny"
      });
      if (!ok) { UI.say("❌ Learning denied."); return; }

      const resp = await Tasks.register.puppeteerCommand({ action: "autoLearn", params: { url, selector } });
      const raw = resp.pageText || resp.text || "";
      if (!raw) { UI.say("⚠ No text returned."); return; }

      const chunkSize = 300; let count = 0;
      for (let i = 0; i < raw.length; i += chunkSize) {
        const chunk = raw.slice(i, i + chunkSize).trim();
        if (chunk) { PercyState.createSeed(chunk, "learned", { source: url, selector }); count++; }
      }
      UI.say(`📚 Learned ${count} new seeds from ${url}`);
    },

    // Simpler auto-browse: visit + learn (no auto-click because server returns objects, not selectors)
    autoBrowse: async ({ url }) => { 
      if(!TrustedSources.some(domain=>url.includes(domain))){ UI.say(`❌ URL not trusted: ${url}`); return; }
      const ok = await UI.confirmModal({ title:"Percy wants to browse", body:`Allow Percy to visit and learn from:\n${url}`, allowLabel:"Allow", denyLabel:"Deny" });
      if(!ok){ UI.say("❌ Browsing denied."); return; }

      const data = await Tasks.register.puppeteerCommand({ action:"visit", params:{ url } });
      if (data.pageText) {
        const chunkSize=300; let count=0; 
        for(let i=0;i<data.pageText.length;i+=chunkSize){ 
          const chunk=data.pageText.slice(i,i+chunkSize).trim(); 
          if(chunk){ PercyState.createSeed(chunk,"learned",{source:url}); count++; } 
        }
        UI.say(`📚 Learned ${count} new seeds from ${url}`); 
      } else {
        UI.say("⚠ No text received from visit.");
      }
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
    <input id="pp-selector" placeholder="Selector (default: body)" style="width:100%;margin-bottom:4px;font-size:12px;">
    <input id="pp-text" placeholder="Text" style="width:100%;margin-bottom:4px;font-size:12px;">
    <div style="display:flex;gap:6px;margin-top:6px;">
      <button id="pp-visit" style="flex:1;font-size:12px;">Visit</button>
      <button id="pp-learn" style="flex:1;font-size:12px;">AutoLearn</button>
    </div>
    <div style="display:flex;gap:6px;margin-top:6px;">
      <button id="pp-click" style="flex:1;font-size:12px;">Click</button>
      <button id="pp-type" style="flex:1;font-size:12px;">Type</button>
    </div>
  `;
  document.body.appendChild(panel);
  const urlInput=document.getElementById('pp-url');
  const selInput=document.getElementById('pp-selector');
  const txtInput=document.getElementById('pp-text');

  document.getElementById('pp-visit').onclick=()=>Tasks.register.puppeteerCommand({ action:"visit", params:{ url:urlInput.value } });
  document.getElementById('pp-learn').onclick=()=>Tasks.register.autoLearn({ url:urlInput.value, selector: selInput.value || "body" });
  document.getElementById('pp-click').onclick=()=>Tasks.register.click({ selector: selInput.value || "body a, body button" });
  document.getElementById('pp-type').onclick=()=>Tasks.register.type({ selector: selInput.value, text: txtInput.value });
})();

/* =========================
STARTUP
========================= */
(async function startupPercy(){
  UI.say(`🚀 Percy ${PERCY_VERSION} initializing…`);
  await loadSeeds();
  Object.entries(PercyState.gnodes).forEach(([id,seed])=>{ seeds[id]=seed; });
  createNodes(); Autonomy.start();
  UI.say("✅ Percy online with autonomy, memory, learning, and Puppeteer control.");
})();
