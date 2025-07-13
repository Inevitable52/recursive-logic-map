const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 400 };

let seeds = {};
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;

const ringSpecs = [
  { from: 80, to: 200, color: 'green-ring', radiusScale: 1 },
  { from: 201, to: 300, color: 'blue-ring', radiusScale: 1.4 },
  { from: 301, to: 400, color: 'purple-ring', radiusScale: 1.9 },
];

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

  for (const { from, to, color, radiusScale } of ringSpecs) {
    const filtered = Object.entries(seeds).filter(([id]) => {
      const num = parseInt(id.replace("G", ""));
      return num >= from && num <= to;
    });

    const total = filtered.length;
    const radius = (Math.min(mapWidth, mapHeight) / 3) * radiusScale;

    filtered.forEach(([filename, data], index) => {
      const angle = (index / total) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle) - 30;
      const y = centerY + radius * Math.sin(angle) - 15;

      const node = document.createElement('div');
      node.classList.add('node', color);
      node.textContent = filename;
      node.title = data.message || 'No message';
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      node.addEventListener('click', () => percyRespond(filename, data));
      node.addEventListener('mouseenter', () => {
        document.getElementById('percy-message').textContent = data.message || 'No message';
      });

      logicNodes.appendChild(node);
    });
  }

  applyTransform();
}

function applyTransform() {
  logicNodes.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
  logicNodes.style.transformOrigin = 'center';
  document.querySelectorAll('.node').forEach(n => {
    n.style.fontSize = `${12 * (1 / zoomLevel)}px`;
  });
}

function zoomLogic(scaleFactor) {
  zoomLevel *= scaleFactor;
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

  if (data.data?.security_token) {
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
  const input = document.getElementById('interpreter-input').value.trim();
  const consoleBox = document.getElementById('percy-console');
  const response = document.createElement('p');
  response.className = 'console-line';

  if (input.toLowerCase().includes("recursion")) {
    response.textContent = '🧠 Percy replies: Recursion must always return to its logical base.';
  } else {
    response.textContent = '🧠 Percy ponders: I am still learning how to interpret that...';
  }

  consoleBox.appendChild(response);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

// Drag & Zoom
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

// Search Input
document.getElementById('seed-search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.node').forEach(node => {
    const match = node.textContent.toLowerCase().includes(query);
    node.style.display = match ? 'block' : 'none';
  });
});

// Enter Key on Ask Percy
document.getElementById('interpreter-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') interpretLogic();
});

// Resize Handler
window.addEventListener('resize', () => {
  requestAnimationFrame(() => createNodes());
});

// Initialize Percy Map
(async () => {
  await loadSeeds();
  requestAnimationFrame(() => {
    createNodes();
    console.log("✅ Percy logic map rendered.");
  });
})();
