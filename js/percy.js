const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 400 };
let seeds = {}, zoomLevel = 1, translateX = 0, translateY = 0;

const ringSpecs = [
  { from: 80, to: 200, class: 'green-ring', scale: 1 },
  { from: 201, to:300, class: 'blue-ring', scale: 1.4 },
  { from:301, to:400, class: 'purple-ring', scale: 1.9 }
];

async function loadSeeds() {
  logicNodes.innerHTML = '<p id="loading">Loading logic seeds…</p>';
  for (let i = seedRange.start; i <= seedRange.end; i++) {
    const fname = `G${String(i).padStart(3,'0')}.json`;
    try {
      const res = await fetch(seedsFolder + fname);
      if (res.ok) seeds[fname] = await res.json();
      else console.warn(`Failed to load ${fname}`);
    } catch(e){ console.warn(e); }
  }
  document.getElementById('loading')?.remove();
}

function createNodes(){
  logicNodes.innerHTML = '';
  const w = logicMap.clientWidth, h = logicMap.clientHeight, cx = w/2, cy = h/2;

  ringSpecs.forEach(spec => {
    const list = Object.entries(seeds).filter(([id]) => {
      const num = parseInt(id.slice(1)); return num >= spec.from && num <= spec.to;
    });
    const total = list.length, radius = (Math.min(w,h)/3) * spec.scale;
    list.forEach(([fname,data], idx) => {
      const ang = (idx/total) * 2*Math.PI;
      const x = cx + radius * Math.cos(ang) - 25;
      const y = cy + radius * Math.sin(ang) - 15;
      const node = document.createElement('div');
      node.className = 'node ' + spec.class;
      node.textContent = fname;
      node.title = data.message;
      node.style.left = `${x}px`;
      node.style.top  = `${y}px`;
      node.addEventListener('click', () => percyRespond(fname,data));
      node.addEventListener('mouseenter', () => {
        document.getElementById('percy-message').textContent = data.message;
      });
      logicNodes.appendChild(node);
    });
  });

  applyTransform();
}

function applyTransform(){
  logicNodes.style.transform = `translate(${translateX}px,${translateY}px) scale(${zoomLevel})`;
  document.querySelectorAll('.node').forEach(n => {
    n.style.fontSize = `${12 * (1/zoomLevel)}px`;
  });
}

function zoomLogic(factor){
  zoomLevel *= factor; applyTransform();
}

function percyRespond(id,data){
  const mb = document.getElementById('percy-message'),
        cb = document.getElementById('percy-console'),
        p = document.createElement('p');
  p.className='console-line';
  p.textContent = `↳ ${data.message}`;
  cb.appendChild(p); mb.textContent = data.message;

  if (data.data?.security_token){
    const warn = document.createElement('p');
    warn.className='console-line';
    warn.textContent='🔐 Logic Token Protected — Access Requires Verification.';
    cb.appendChild(warn);
  }
  if (data.data?.redirect_on_logic_violation){
    const redir = document.createElement('p');
    redir.className='console-line';
    redir.textContent = `⚠ Redirection triggered: logic violation → ${data.data.redirect_on_logic_violation}`;
    cb.appendChild(redir);
  }
  if (data.type==='errand'&&data.data?.trigger==='logic_audit'){
    const audit = document.createElement('p');
    audit.className='console-line';
    audit.textContent = `🧠 Percy audit initiated: checking ${data.data.target_nodes.join(', ')}`;
    cb.appendChild(audit);
  }
  cb.scrollTop = cb.scrollHeight;
}

function interpretLogic(){
  const input = document.getElementById('interpreter-input')?.value || '',
        cb = document.getElementById('percy-console'),
        resp = document.createElement('p');
  resp.className='console-line';
  resp.textContent = input.toLowerCase().includes('recursion')
    ? '🧠 Percy replies: Recursion must always return to its logical base.'
    : '🧠 Percy ponders: I am still learning how to interpret that…';
  cb.appendChild(resp); cb.scrollTop = cb.scrollHeight;
}

logicMap.addEventListener('wheel', e => {
  if (e.ctrlKey||e.metaKey){ e.preventDefault();
    zoomLevel *= (e.deltaY>0 ? 0.9 : 1.1); applyTransform();
  }
}, { passive:false });

let dragging=false, lastX=0, lastY=0;
logicMap.addEventListener('mousedown', e => (dragging=true, lastX=e.clientX, lastY=e.clientY));
window.addEventListener('mouseup', () => dragging = false);
window.addEventListener('mousemove', e => {
  if (!dragging) return;
  translateX += e.clientX - lastX;
  translateY += e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  applyTransform();
});

document.getElementById('seed-search').addEventListener('input', e => {
  const q=e.target.value.toLowerCase();
  document.querySelectorAll('.node').forEach(n => {
    n.style.display = n.textContent.toLowerCase().includes(q)? 'block':'none';
  });
});

window.addEventListener('resize', createNodes);

(async () => {
  await loadSeeds();
  createNodes();
  console.log('Percy initialized. Click a node.');
})();
