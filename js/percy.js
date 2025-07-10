// percy.js — with Phase 3 Upgrade

const logicMap = document.getElementById('logic-map');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 200 }; // Extend as needed

let seeds = {};
let logicMemory = []; // Phase 3: Memory
const memoryLimit = 7;

async function loadSeeds() {
  const loadingNotice = document.createElement('p');
  loadingNotice.id = 'loading-indicator';
  loadingNotice.textContent = "Loading logic seeds...";
  logicMap.appendChild(loadingNotice);

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
  logicMap.removeChild(loadingNotice);
}

function createNodes() {
  const mapWidth = logicMap.clientWidth;
  const mapHeight = logicMap.clientHeight;
  const total = Object.keys(seeds).length;
  let index = 0;

  for (const [filename, data] of Object.entries(seeds)) {
    const node = document.createElement('div');
    node.classList.add('node');
    node.textContent = filename;
    node.title = data.message;

    const angle = (index / total) * 2 * Math.PI;
    const radius = Math.min(mapWidth, mapHeight) / 3;
    const x = mapWidth / 2 + radius * Math.cos(angle) - 30;
    const y = mapHeight / 2 + radius * Math.sin(angle) - 15;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    node.addEventListener('click', () => percyRespond(filename, data));

    logicMap.appendChild(node);
    index++;
  }
}

function percyRespond(id, data) {
  const messageBox = document.getElementById('percy-message');
  const consoleBox = document.getElementById('percy-console');

  messageBox.textContent = data.message;

  const line = document.createElement('p');
  line.className = 'console-line';
  line.textContent = `↳ ${data.message}`;
  consoleBox.appendChild(line);

  // 🔐 Token protection
  if (data.data?.security_token === true) {
    const warn = document.createElement('p');
    warn.className = 'console-line';
    warn.textContent = '🔐 Logic Token Protected — Access Requires Verification.';
    consoleBox.appendChild(warn);
  }

  // ⚠ Redirect logic
  if (data.data?.redirect_on_logic_violation) {
    const redir = document.createElement('p');
    redir.className = 'console-line';
    redir.textContent = `⚠ Redirection triggered: logic violation → ${data.data.redirect_on_logic_violation}`;
    consoleBox.appendChild(redir);
  }

  // 📚 Memory logic
  logicMemory.push({ id, message: data.message });
  if (logicMemory.length > memoryLimit) logicMemory.shift();

  // 🔁 Loop detection
  const recentIds = logicMemory.map(item => item.id);
  const duplicates = recentIds.filter((v, i, a) => a.indexOf(v) !== i);
  if (duplicates.length > 0) {
    const loopMsg = document.createElement('p');
    loopMsg.className = 'console-line';
    loopMsg.textContent = `🔁 Recursive Loop Detected: ${[...new Set(duplicates)].join(', ')}`;
    consoleBox.appendChild(loopMsg);
  }

  // ⚠ Contradiction detection
  if (logicMemory.length >= 2) {
    const [prev, curr] = logicMemory.slice(-2);
    if (
      prev.message.toLowerCase().includes('truth') &&
      curr.message.toLowerCase().includes('distortion')
    ) {
      const conflict = document.createElement('p');
      conflict.className = 'console-line';
      conflict.textContent = '⚠ Logic Tension: Truth vs. Distortion in recent nodes.';
      consoleBox.appendChild(conflict);
    }
  }

  // 🧠 Memory Echo
  const memEcho = document.createElement('p');
  memEcho.className = 'console-line';
  memEcho.textContent = `🧠 Memory: [${logicMemory.map(m => m.id).join(', ')}]`;
  consoleBox.appendChild(memEcho);

  consoleBox.scrollTop = consoleBox.scrollHeight;
}

async function init() {
  await loadSeeds();
  createNodes();
  console.log("Percy initialized. Click a node.");
}

window.addEventListener('resize', () => {
  logicMap.innerHTML = '';
  createNodes();
});

init();

document.getElementById('seed-search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const nodes = document.querySelectorAll('.node');
  nodes.forEach(node => {
    const match = node.textContent.toLowerCase().includes(query);
    node.style.display = match ? 'block' : 'none';
  });
});
