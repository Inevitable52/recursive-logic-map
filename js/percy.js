// === percy.js (Phase 5 – Full Expansion with Purple Ring) ===
const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 399 };

let seeds = {};
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;

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
}

function createNodes() {
  logicNodes.innerHTML = '';
  const width = logicMap.clientWidth;
  const height = logicMap.clientHeight;

  layoutRing(80, 200, width, height, width / 2.8, '', 60);       // Outer Green
  layoutRing(201, 300, width, height, width / 3.6, 'blue-ring', 45);  // Middle Blue
  layoutRing(301, 399, width, height, width / 5, 'purple-ring', 30); // Inner Purple
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
    node.addEventListener('mouseenter', () => document.getElementById('percy-message').textContent = data.message);
    logicNodes.appendChild(node);
  });
}

function applyTransform() {
  logicNodes.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
  logicNodes.style.transformOrigin = 'center';
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
    auditLine.textContent = `🧠 Percy audit initiated: Checking ${data.data.target_nodes.join(", ")}`;
    consoleBox.appendChild(auditLine);
  }

  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function interpretLogic() {
  const input = document.getElementById('interpreter-input').value;
  const consoleBox = document.getElementById('percy-console');
  const response = document.createElement('p');
  response.className = 'console-line';
  if (input.toLowerCase().includes("recursion")) {
    response.textContent = `🧠 Percy replies: Recursion must always return to its logical base.`;
  } else {
    response.textContent = `🧠 Percy ponders: I am still learning how to interpret that...`;
  }
  consoleBox.appendChild(response);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

// Zoom and Drag Logic
logicMap.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    zoomLogic(e.deltaY > 0 ? 0.9 : 1.1);
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
  console.log("Percy initialized. Click a node.");
})();
