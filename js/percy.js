// percy.js (Phase 5 — Multi-Ring Zoom Blossom Expansion)
const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 320 }; // Extended for purple ring

let seeds = {};
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;

async function loadSeeds() {
  const loadingNotice = document.createElement('p');
  loadingNotice.id = 'loading-indicator';
  loadingNotice.textContent = 'Loading logic seeds...';
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
}

function createNodes() {
  logicNodes.innerHTML = '';
  const mapWidth = logicMap.clientWidth;
  const mapHeight = logicMap.clientHeight;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;

  layoutRing(80, 200, centerX, centerY, mapWidth / 2.5, 'node'); // Green
  layoutRing(201, 300, centerX, centerY, mapWidth / 3.5, 'node blue-ring'); // Blue
  layoutRing(301, 320, centerX, centerY, mapWidth / 5.5, 'node purple-ring'); // Purple

  applyTransform();
}

function layoutRing(startId, endId, cx, cy, radius, cssClass) {
  const ringSeeds = Object.entries(seeds).filter(([id]) => {
    const num = parseInt(id.replace('G', ''));
    return num >= startId && num <= endId;
  });
  const total = ringSeeds.length;
  ringSeeds.forEach(([filename, data], i) => {
    const angle = (i / total) * 2 * Math.PI;
    const x = cx + radius * Math.cos(angle) - 25;
    const y = cy + radius * Math.sin(angle) - 15;

    const node = document.createElement('div');
    node.className = cssClass;
    node.textContent = filename;
    node.title = data.message;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    node.addEventListener('click', () => percyRespond(filename, data));
    node.addEventListener('mouseenter', () => document.getElementById('percy-message').textContent = data.message);
    logicNodes.appendChild(node);
  });
}

function applyTransform() {
  logicNodes.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
  logicNodes.style.transformOrigin = 'center center';
  document.querySelectorAll('.node').forEach(n => {
    n.style.fontSize = `${12 * (1 / zoomLevel)}px`;
  });
}

function zoomLogic(factor) {
  zoomLevel *= factor;
  applyTransform();
}

function percyRespond(id, data) {
  const messageBox = document.getElementById('percy-message');
  const consoleBox = document.getElementById('percy-console');
  const line = document.createElement('p');
  line.className = 'console-line';
  line.textContent = `↳ ${data.message}`;
  consoleBox.appendChild(line);
  messageBox.textContent = data.message;

  if (data.data?.security_token === true) {
    const warn = document.createElement('p');
    warn.className = 'console-line';
    warn.textContent = '🔐 Logic Token Protected — Access Requires Verification.';
    consoleBox.appendChild(warn);
  }

  if (data.data?.redirect_on_logic_violation) {
    const redir = document.createElement('p');
    redir.className = 'console-line';
    redir.textContent = `⚠ Redirection triggered: logic violation → ${data.data.redirect_on_logic_violation}`;
    consoleBox.appendChild(redir);
  }

  if (data.type === 'errand' && data.data?.trigger === 'logic_audit') {
    const auditLine = document.createElement('p');
    auditLine.className = 'console-line';
    auditLine.textContent = `🧠 Percy audit initiated: Checking ${data.data.target_nodes.join(', ')}`;
    consoleBox.appendChild(auditLine);
  }

  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function interpretLogic() {
  const input = document.getElementById('interpreter-input').value;
  const consoleBox = document.getElementById('percy-console');
  const response = document.createElement('p');
  response.className = 'console-line';
  if (input.toLowerCase().includes('recursion')) {
    response.textContent = `🧠 Percy replies: Recursion must always return to its logical base.`;
  } else {
    response.textContent = `🧠 Percy ponders: I am still learning how to interpret that...`;
  }
  consoleBox.appendChild(response);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

logicMap.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    zoomLevel *= e.deltaY > 0 ? 0.9 : 1.1;
    applyTransform();
  }
}, { passive: false });

let isDragging = false, lastX = 0, lastY = 0;
logicMap.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  translateX += dx;
  translateY += dy;
  applyTransform();
});

document.getElementById('seed-search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.node').forEach(node => {
    const match = node.textContent.toLowerCase().includes(query);
    node.style.display = match ? 'block' : 'none';
  });
});

document.getElementById('interpreter-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') interpretLogic();
});

window.addEventListener('resize', () => createNodes());

(async () => {
  await loadSeeds();
  createNodes();
})();
