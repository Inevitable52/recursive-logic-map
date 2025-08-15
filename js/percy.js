// === percy.js (Phase 8.3 Fixed Full Version) ===

/* =========================
CONFIG & ULT AUTHORITY
========================= */
const PERCY_ID = "Percy-ULT";
const PERCY_VERSION = "8.3.0-meta-fixed"; 
const OWNER = { primary: "Fabian", secondary: "Lorena" };
const SAFETY = {
  maxActionsPerMinute: 20,
  maxSeedsPerCycle: 3,
  requirePermissionFor: ["externalFetch","openTab","writeDisk","emailLike"],
  consoleLimit: 500
};

/* =========================
SOFT PERSISTENCE (Memory)
========================= */
const Memory = {
  _k: k => `percy:${k}`,
  load(k,fallback){ try{ return JSON.parse(localStorage.getItem(this._k(k)))??fallback; } catch{ return fallback; } },
  save(k,v){ try{ localStorage.setItem(this._k(k),JSON.stringify(v)); } catch{} },
  push(k,v,max=1000){ const arr=this.load(k,[]); arr.push(v); if(arr.length>max) arr.shift(); this.save(k,arr); }
};

/* =========================
PERSISTENT PERCY STATE
========================= */
const PercyState = {
  gnodes: Memory.load("gnodes",{}),
  getNextId(){ let next=801; while(this.gnodes[`G${String(next).padStart(3,'0')}`]) next++; return `G${String(next).padStart(3,'0')}`; },
  createSeed(message,type='emergent',data={}){ 
    if(!OWNER.primary) return UI.say("❌ ULT required to create seed");
    const id=this.getNextId();
    this.gnodes[id]={message,type,data};
    Memory.save("gnodes",this.gnodes);
    seeds[id]=this.gnodes[id];
    UI.say(`✨ Percy created new seed ${id}: ${message}`);
    refreshNodes(); 
    return id;
  },
  updateSeed(id,update){
    if(!this.gnodes[id]) return UI.say(`⚠ Cannot update: ${id} not found`);
    Object.assign(this.gnodes[id],update);
    Memory.save("gnodes",this.gnodes);
    seeds[id]=this.gnodes[id];
    UI.say(`🔧 Percy updated seed ${id}`);
    refreshNodes();
  },
  evaluateSelf(){
    let created=0;
    const updatedIds=new Set();
    Object.entries(this.gnodes).forEach(([id,seed])=>{
      if(created>=SAFETY.maxSeedsPerCycle) return;
      if(/TODO|missing|empty/.test(seed.message) && !updatedIds.has(id)){
        this.updateSeed(id,{message:seed.message.replace(/TODO|missing|empty/,"auto-resolved by Percy")});
        updatedIds.add(id); created++;
      }
    });
    while(created<SAFETY.maxSeedsPerCycle && Math.random()<0.5){
      this.createSeed("Emergent insight: Percy discovered a new logical connection.");
      created++;
    }
  }
};

/* =========================
CONSOLE / UI
========================= */
const UI = {
  elConsole: () => document.getElementById('percy-console'),
  elMsg: () => document.getElementById('percy-message'),
  say(txt){
    const box=this.elConsole(); if(!box) return;
    const p=document.createElement('p'); p.className='console-line'; p.textContent=txt;
    box.appendChild(p); box.scrollTop=box.scrollHeight;
    const max=SAFETY.consoleLimit;
    while(box.children.length>max) box.removeChild(box.firstChild);
  },
  setStatus(txt){ const m=this.elMsg(); if(m) m.textContent=txt; },
  confirmModal({title, body, allowLabel="Allow", denyLabel="Deny"}){
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
LOGIC MAP & NODES
========================= */
const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
logicMap.style.position='relative';
logicNodes.style.position='absolute';
logicNodes.style.top='50%';
logicNodes.style.left='50%';
logicNodes.style.width='100%';
logicNodes.style.height='100%';

let zoomLevel=1, translateX=0, translateY=0;
let seeds={};

/* =========================
LOAD SEEDS
========================= */
const seedsFolder='logic_seeds/';
const seedRange={start:80,end:800};

async function loadSeeds(){
  const loadingNotice=document.createElement('p');
  loadingNotice.id='loading-indicator';
  loadingNotice.textContent="Loading logic seeds...";
  logicNodes.appendChild(loadingNotice);

  const promises=[];
  for(let i=seedRange.start;i<=seedRange.end;i++){
    const filename=`G${String(i).padStart(3,'0')}.json`;
    promises.push(fetch(seedsFolder+filename).then(res=>{
      if(!res.ok) throw new Error(`Failed to load ${filename}`);
      return res.json().then(data=>{
        const id=filename.slice(0,filename.length-5);
        PercyState.gnodes[id]=data;
        seeds[id]=data;
      });
    }).catch(e=>console.warn(e.message)));
  }
  await Promise.all(promises);
  logicNodes.removeChild(loadingNotice);
  Memory.save("gnodes",PercyState.gnodes);
}

/* =========================
NODE CREATION & LAYOUT
========================= */
function createNodes(){
  logicNodes.innerHTML='';
  const width=logicMap.clientWidth, height=logicMap.clientHeight;

  // Ring radii and colors
  const rings=[
    {start:80,end:200,radius:width/2.5,class:'',nodeSize:60},
    {start:201,end:300,radius:width/3.4,class:'blue-ring',nodeSize:45},
    {start:301,end:400,radius:width/4.8,class:'purple-ring',nodeSize:30},
    {start:401,end:500,radius:width/6.6,class:'red-ring',nodeSize:22},
    {start:501,end:600,radius:width/8.5,class:'crimson-ring',nodeSize:18},
    {start:601,end:700,radius:width/11,class:'gold-ring',nodeSize:14},
    {start:701,end:800,radius:width/14,class:'neon-pink-ring',nodeSize:12}
  ];

  rings.forEach(ring=>{
    layoutRing(ring.start,ring.end,width,height,ring.radius,ring.class,ring.nodeSize);
  });

  applyTransform();
}

function layoutRing(startId,endId,width,height,radius,colorClass,nodeSize){
  const ringSeeds=Object.entries(seeds).filter(([id])=>{
    const num=parseInt(id.replace("G",""));
    return num>=startId && num<=endId;
  });
  const total=ringSeeds.length;
  const centerX=width/2, centerY=height/2;

  ringSeeds.forEach(([id,data],index)=>{
    const angle=(index/total)*2*Math.PI;
    const x=centerX + radius*Math.cos(angle) - nodeSize/2 + (Math.random()*4-2);
    const y=centerY + radius*Math.sin(angle) - nodeSize/2 + (Math.random()*4-2);

    const node=document.createElement('div');
    node.className='node';
    if(colorClass) node.classList.add(colorClass);
    node.style.width=node.style.height=`${nodeSize}px`;
    node.style.left=`${x}px`;
    node.style.top=`${y}px`;
    node.textContent=id;
    node.title=data.message;
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

/* =========================
ZOOM
========================= */
function zoomLogic(factor){ zoomLevel=Math.min(5,Math.max(0.1,zoomLevel*factor)); applyTransform(); }

/* =========================
REFRESH
========================= */
function refreshNodes(){ createNodes(); UI.say(`🔄 Logic map refreshed with ${Object.keys(seeds).length} seeds`); }

/* =========================
PERCY RESPOND
========================= */
async function percyRespond(id,data){
  const msg=(data.message||'').trim();
  UI.say(`↳ ${msg}`);
  UI.setStatus(msg);
}

/* =========================
TASKS & AUTONOMY
========================= */
const Tasks={
  queue: Memory.load("tasks:queue",[]),
  done: Memory.load("tasks:done",[]),
  rate:{stamps:[]},
  _allowNow(){ const now=Date.now(); this.rate.stamps=this.rate.stamps.filter(t=>now-t<60000); if(this.rate.stamps.length>=SAFETY.maxActionsPerMinute) return false; this.rate.stamps.push(now); return true; },
  register:{},
  enqueue(task){ if(!this.queue.some(t=>t.type===task.type && JSON.stringify(t.params)===JSON.stringify(task.params))){ task.id=task.id??`t_${Math.random().toString(36).slice(2,8)}`; task.ts=Date.now(); this.queue.push(task); Memory.save("tasks:queue",this.queue); } },
  async step(){ if(!this.queue.length || !this._allowNow()) return; const task=this.queue.shift(); Memory.save("tasks:queue",this.queue); try{ const fn=this.register[task.type]; if(!fn) throw new Error(`No handler for ${task.type}`); await fn(task.params??{}); this.done.push({...task,doneTs:Date.now()}); Memory.save("tasks:done",this.done); }catch(e){ UI.say(`❌ task error: ${e.message}`); } }
};

/* =========================
STARTUP
========================= */
(async function startupPercy(){
  UI.say(`🚀 Percy v${PERCY_VERSION} initializing…`);
  await loadSeeds();
  createNodes();
  UI.say(`✅ Percy online with ${Object.keys(seeds).length} seeds loaded.`);
})();