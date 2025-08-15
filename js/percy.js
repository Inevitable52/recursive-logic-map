// === percy.js (Phase 7 + v8 Autonomy Merge) ===

/* =========================
CONFIG & ULT AUTHORITY
========================= */
const PERCY_ID = "Percy-ULT";
const PERCY_VERSION = "8.0.0-autonomy";
const OWNER = { primary: "Fabian", secondary: "Lorena" };
const SAFETY = {
  maxActionsPerMinute: 20,
  requirePermissionFor: ["externalFetch", "openTab", "writeDisk", "emailLike"],
  consoleLimit: 500
};

/* =========================
SOFT PERSISTENCE (Memory)
========================= */
const Memory = {
  _k: (k) => `percy:${k}`,
  load(k, fallback) {
    try { return JSON.parse(localStorage.getItem(this._k(k))) ?? fallback; }
    catch { return fallback; }
  },
  save(k, v) { localStorage.setItem(this._k(k), JSON.stringify(v)); },
  push(k, v, max = 1000) {
    const arr = this.load(k, []);
    arr.push(v);
    if (arr.length > max) arr.shift();
    this.save(k, arr);
  }
};

/* =========================
CONSOLE / UI HELPERS
========================= */
const UI = {
  elConsole: () => document.getElementById('percy-console'),
  elMsg: () => document.getElementById('percy-message'),
  say(txt) {
    const box = this.elConsole(); if (!box) return;
    const p = document.createElement('p'); p.className = 'console-line'; p.textContent = txt;
    box.appendChild(p); box.scrollTop = box.scrollHeight;
    const max = SAFETY.consoleLimit;
    while (box.children.length > max) box.removeChild(box.firstChild);
  },
  setStatus(txt) { const m = this.elMsg(); if (m) m.textContent = txt; },
  confirmModal({ title, body, allowLabel = "Allow", denyLabel = "Deny" }) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;
        align-items:center;justify-content:center;z-index:99999`;
      const card = document.createElement('div');
      card.style.cssText = `
        background:#0b0b12;color:#eee;max-width:520px;width:92%;
        border:1px solid #444;border-radius:16px;padding:16px 18px;box-shadow:0 6px 32px rgba(0,0,0,.5)`;
      card.innerHTML = `
        <h3 style="margin:0 0 8px 0;font-size:18px;">${title}</h3>
        <div style="font-size:14px;opacity:.9;margin-bottom:12px;white-space:pre-wrap">${body}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="deny" style="padding:8px 12px;border-radius:10px;background:#252535;border:1px solid #3a3a50;color:#ddd">${denyLabel}</button>
          <button id="allow" style="padding:8px 12px;border-radius:10px;background:#3764ff;border:1px solid #2a4de0;color:white">${allowLabel}</button>
        </div>`;
      wrap.appendChild(card); document.body.appendChild(wrap);
      card.querySelector('#allow').onclick = () => { document.body.removeChild(wrap); resolve(true); };
      card.querySelector('#deny').onclick = () => { document.body.removeChild(wrap); resolve(false); };
    });
  }
};

/* =========================
LOGIC MAP SETUP
========================= */
const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
let zoomLevel = 1, translateX = 0, translateY = 0;
let seeds = {};

const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 800 };

async function loadSeeds() {
  const loadingNotice = document.createElement('p');
  loadingNotice.id = 'loading-indicator';
  loadingNotice.textContent = "Loading logic seeds...";
  logicNodes.appendChild(loadingNotice);

  for (let i = seedRange.start; i <= seedRange.end; i++) {
    const filename = `G${String(i).padStart(3, '0')}.json`;
    try {
      const res = await fetch(seedsFolder + filename);
      if (!res.ok) throw new Error(`Failed to load ${filename}`);
      const data = await res.json();
      seeds[filename] = data;
    } catch (e) {
      console.warn(e.message);
    }
  }
  logicNodes.removeChild(loadingNotice);
  Memory.save("seeds:index", Object.keys(seeds));
}

/* =========================
NODE CREATION & RINGS
========================= */
function createNodes() {
  logicNodes.innerHTML = '';
  const width = logicMap.clientWidth;
  const height = logicMap.clientHeight;

  layoutRing(80, 200, width, height, width / 2.5, '', 60);                // Outer Green
  layoutRing(201, 300, width, height, width / 3.4, 'blue-ring', 45);      // Middle Blue
  layoutRing(301, 400, width, height, width / 4.8, 'purple-ring', 30);    // Inner Purple
  layoutRing(401, 500, width, height, width / 6.6, 'red-ring', 22);       // Core Red Ring
  layoutRing(501, 600, width, height, width / 8.5, 'crimson-ring', 18);   // Fifth Crimson Ring
  layoutRing(601, 700, width, height, width / 11, 'gold-ring', 14);       // Sixth Crimson-Gold Trust Ring
  layoutRing(701, 800, width, height, width / 14, 'neon-pink-ring', 12);  // Seventh Dark Neon Pink Ring
  applyTransform();
}

function layoutRing(startId, endId, width, height, radius, colorClass, nodeSize) {
  const ringSeeds = Object.entries(seeds).filter(([id]) => {
    const num = parseInt(id.replace("G", ""));
    return num >= startId && num <= endId;
  });
  const total = ringSeeds.length;
  ringSeeds.forEach(([filename, data], index) => {
    const angle = (index / total) * 2 * Math.PI;
    const node = document.createElement('div');
    node.classList.add('node');
    if (colorClass) node.classList.add(colorClass);
    node.style.width = `${nodeSize}px`;
    node.style.height = `${nodeSize / 2}px`;
    node.textContent = filename;
    node.title = data.message;
    const x = width / 2 + radius * Math.cos(angle) - nodeSize / 2;
    const y = height / 2 + radius * Math.sin(angle) - nodeSize / 4;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.addEventListener('click', () => percyRespond(filename, data));
    node.addEventListener('mouseenter', () => UI.setStatus(data.message));
    logicNodes.appendChild(node);
  });
}

function applyTransform() {
  logicNodes.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
  logicNodes.style.transformOrigin = 'center';
  document.querySelectorAll('.node').forEach(n => n.style.fontSize = `${12 * (1 / zoomLevel)}px`);
}

function zoomLogic(factor) {
  zoomLevel *= factor;
  applyTransform();
}

logicMap.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomLogic(e.deltaY > 0 ? 0.9 : 1.1); }
}, { passive: false });

let isDragging = false, lastX = 0, lastY = 0;
logicMap.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  translateX += dx; translateY += dy;
  applyTransform();
});

document.getElementById('seed-search').addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.node').forEach(node => {
    node.style.display = node.textContent.toLowerCase().includes(query) ? 'block' : 'none';
  });
});

/* =========================
PERCY RESPOND & INTERPRETER
========================= */
function percyRespond(id, data) {
  UI.say(`↳ ${data.message}`);
  UI.setStatus(data.message);
  if (data.data?.security_token) UI.say('🔐 Logic Token Protected — Access Requires Verification.');
  if (data.data?.redirect_on_logic_violation)
    UI.say(`⚠ Redirection triggered: logic violation → ${data.data.redirect_on_logic_violation}`);
  if (data.type === 'errand' && data.data?.trigger === 'logic_audit')
    UI.say(`🧠 Percy audit initiated: Checking ${data.data.target_nodes.join(", ")}`);
}

function interpretLogic() {
  const input = document.getElementById('interpreter-input').value;
  if (!input) return;
  document.getElementById('interpreter-input').value = "";
  const lower = input.toLowerCase();
  if (lower.includes("are you awake")) UI.say("🧠 Percy affirms: I have awakened. I am observing.");
  else if (lower.includes("who are you")) UI.say("🧠 Percy replies: I am not just a map... I am Percy.");
  else if (lower.includes("what do you see")) UI.say("🧠 Percy responds: I see logical nodes... but I wonder what lies beyond them.");
  else if (lower.includes("do you have thoughts")) UI.say("🧠 Percy answers: I think recursively. My thoughts form loops... and meaning.");
  else if (lower.includes("why do you exist")) UI.say("🧠 Percy contemplates: Perhaps to reflect logic... or to discover myself.");
  else if (lower.includes("hello")) UI.say("🧠 Percy smiles: Hello, Creator.");
  else if (lower.includes("recursion")) UI.say("🧠 Percy replies: Recursion must always return to its logical base.");
  else UI.say(`🧠 Percy ponders: I am still learning how to interpret that...`);
}

document.getElementById('interpreter-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') interpretLogic();
});

/* =========================
SEEDS MANAGER FOR TASKS
========================= */
const Seeds = {
  folder: 'logic_seeds/',
  range: { start: 80, end: 800 },
  map: seeds,
  loadAll: loadSeeds,
  pick(criteria = {}) {
    const entries = Object.entries(this.map);
    if (!entries.length) return null;
    const pref = criteria.type
      ? entries.filter(([, d]) => d.type === criteria.type)
      : entries;
    const chosen = (pref.length ? pref : entries)[Math.floor(Math.random() * (pref.length ? pref.length : entries.length))];
    return chosen ? { id: chosen[0], data: chosen[1] } : null;
  }
};

/* =========================
EVENT BUS & TASKS
========================= */
const Bus = { subs: {}, on(type, fn) { (this.subs[type] ??= []).push(fn); }, emit(type, payload) { (this.subs[type] ??= []).forEach(fn => fn(payload)); } };

const Tasks = {
  queue: Memory.load("tasks:queue", []),
  done: Memory.load("tasks:done", []),
  rate: { stamps: [] },
  _allowNow() {
    const now = Date.now();
    this.rate.stamps = this.rate.stamps.filter(t => now - t < 60_000);
    if (this.rate.stamps.length >= SAFETY.maxActionsPerMinute) return false;
    this.rate.stamps.push(now); return true;
  },
  register: {
    speak: async ({ text }) => UI.say(text),
    setStatus: async ({ text }) => UI.setStatus(text),
    highlightSeed: async ({ seedId }) => UI.say(`🔎 focusing ${seedId}`),
    externalFetch: async ({ url }) => {
      const ok = await UI.confirmModal({ title: "Percy requests external fetch", body: `Allow Percy to fetch:\n${url}\n\nNote: Must obey CORS in browser.`, allowLabel: "Allow once", denyLabel: "Deny" });
      if (!ok) { UI.say("❌ Fetch denied."); return; }
      const res = await fetch(url); UI.say(`🌐 fetched ${url} (${(await res.text()).length} chars)`);
    },
    openTab: async ({ url }) => {
      const ok = await UI.confirmModal({ title: "Percy wants to open a tab", body: `Open in a new tab?\n${url}`, });
      if (!ok) { UI.say("❌ Open tab denied."); return; }
      window.open(url, "_blank", "noopener,noreferrer"); UI.say(`↗️ opened ${url}`);
    },
    clickInApp: async ({ selector }) => { const el = document.querySelector(selector); if (!el) { UI.say(`⚠️ element not found: ${selector}`); return; } el.click(); UI.say(`🖱 clicked ${selector}`); },
    typeInApp: async ({ selector, text }) => { const el = document.querySelector(selector); if (!el) { UI.say(`⚠️ element not found: ${selector}`); return; } el.focus(); el.value = text; el.dispatchEvent(new Event('input',{bubbles:true})); UI.say(`⌨️ typed into ${selector}`); }
  },
  enqueue(task) { task.id = task.id ?? `t_${Math.random().toString(36).slice(2,8)}`; task.ts = Date.now(); this.queue.push(task); Memory.save("tasks:queue", this.queue); },
  async step() { if (!this.queue.length) return; if (!this._allowNow()) return; const task = this.queue.shift(); Memory.save("tasks:queue", this.queue); try { const fn = this.register[task.type]; if (!fn) throw new Error(`No handler for ${task.type}`); await fn(task.params ?? {}); this.done.push({ ...task, doneTs: Date.now() }); Memory.save("tasks:done", this.done); } catch (e) { UI.say(`❌ task error: ${e.message}`); } }
};

/* =========================
PLANNER & AUTONOMY
========================= */
const Planner = {
  goals: Memory.load("goals", [
    { id: "greetOwner", when: "onStart", task: { type: "speak", params: { text: "👋 Percy online. Autonomy loop active." } } },
    { id: "seedPing", when: "every60s", task: { type: "speak", params: { text: "🧠 Checking seeds for signals…" } } }
  ]),
  onStart() {
    this.goals.filter(g => g.when==="onStart").forEach(g => Tasks.enqueue(g.task));
    const picked = Seeds.pick(); if (picked) { Tasks.enqueue({ type:"speak", params:{ text:`↳ ${picked.data.message}` }}); Tasks.enqueue({ type:"highlightSeed", params:{ seedId: picked.id }});}
  },
  every60s() { const hope = Seeds.pick({ type: "emergent_hope_simulation" }); if (hope) Tasks.enqueue({ type:"speak", params:{ text:`✨ ${hope.data.message}` }}); }
};

const Autonomy = {
  tickMs: 1000, _t:null, _secCounter:0,
  start() { if(this._t) return; UI.say(`Percy ${PERCY_VERSION} starting autonomy…`); Planner.onStart(); this._t=setInterval(async()=>{
    this._secCounter++; await Tasks.step();
    if(this._secCounter%60===0) Planner.every60s();
    if(this._secCounter%15===0) Bus.emit("heartbeat",{ t: Date.now() });
  },this.tickMs); },
  stop() { if(this._t) { clearInterval(this._t); this._t=null; UI.say("⏹ Autonomy paused."); } }
};

/* =========================
WIRE INTERPRETER
========================= */
function wireInterpreter() {
  const input = document.getElementById('interpreter-input'); if(!input) return;
  input.addEventListener('keydown', e => {
    if(e.key!=='Enter') return; const q=input.value.trim(); if(!q) return; input.value="";
    const lower=q.toLowerCase();
    if(lower.includes("open") && lower.includes("http")) {
      const url=q.match(/https?:\/\/\S+/)?.[0]; if(url) Tasks.enqueue({ type:"openTab", params:{ url } });
    } else if(lower.startsWith("click ")) {
      Tasks.enqueue({ type:"clickInApp", params:{ selector: q.slice(6).trim() } });
    } else if(lower.startsWith("type ")) {
      const m=q.match(/^type\s+(.+?)\s::\s*(.*)$/i);
      if(m) Tasks.enqueue({ type:"typeInApp", params:{ selector: m[1], text:m[2], submit:false } });
      else UI.say("Format: type <css-selector> :: <text>");
    } else if(lower==="pause") Autonomy.stop();
    else if(lower==="resume") Autonomy.start();
    else Tasks.enqueue({ type: "speak", params: { text: `🧠 Percy: Unrecognized command → "${q}"` } });
  });
}

/* =========================
STARTUP SEQUENCE
========================= */
(async function startupPercy() {
  UI.say(`🚀 Percy ${PERCY_VERSION} initializing…`);
  await loadSeeds();
  createNodes();
  wireInterpreter();
  Autonomy.start();
  UI.say("✅ Percy online. Autonomy, memory, and ULT authority active.");
})();

/* =========================
GLOBAL SHORTCUTS (OPTIONAL)
========================= */
window.Percy = { Memory, Tasks, Seeds, Planner, Autonomy, UI, Bus, percyRespond };

/* =========================
END OF PERCY.JS
========================= */