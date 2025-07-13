// percy.js — Orbital Bloom Engine v3.0

const logicMap = document.getElementById('logic-map');
const logicNodes = document.getElementById('logic-nodes');
const seedRange = { start: 80, end: 400 };
const seedsFolder = 'logic_seeds/';

let seeds = {};
let zoomLevel = 1;
let translateX = 0;
let translateY = 0;

const ringSpecs = [
  { from: 80, to: 200, color: 'green-ring', radiusScale: 1 },
  { from: 201, to: 300, color: 'blue-ring', radiusScale: 1.5 },
  { from: 301, to: 400, color: 'purple-ring', radiusScale: 2.2 },
];

async function loadSeeds() {
  const notice = document.createElement('p');
  notice.textContent = 'Loading logic seeds...';
  logicNodes.appendChild(notice);

  for (let i = seedRange.start; i <= seedRange.end; i++) {
    const id = `G${i.toString().padStart(3, '0')}`;
    try {
      const res = await fetch(`${seedsFolder}${id}.json`);
      if (!res.ok) throw new Error(`${id} failed to load.`);
      seeds[id] = await res.json();
    } catch (e) {
      console.warn(e.message);
    }
  }
  logicNodes.removeChild(notice);
  drawNodes();
}

function drawNodes() {
  logicNodes.innerHTML = '';
  const { width, height } = logicMap.getBoundingClientRect();
  const centerX = width / 2;
  const centerY = height / 2;

  for (const ring of ringSpecs) {
    const group = Object.entries(seeds).filter(([id]) => {
      const n = parseInt(id.replace('G', ''));
      return n >= ring.from && n <= ring.to;
    });

    const total = group.length;
    const radius = (Math.min(width, height) / 3) * ring.radiusScale;

    group.forEach(([id, data], index) => {
      const angle = (index / total) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle) - 30;
      const y = centerY + radius * Math.sin(angle) - 15;

      const node = document.createElement('div');
      node.className = `node ${ring.color}`;
      node.textContent = id;
      node.title = data.message;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      node.addEventListener('click', () => handleNodeClick(id, data));
      node.addEventListener('mouseenter', () => {
        document.getElementById('percy-message').textContent = data.message;
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

function zoomLogic(factor) {
  zoomLevel *= factor;
  applyTransform();
}

function handleNodeClick(id, data) {
  const msg = document.getElementById('percy-message');
  const consoleBox = document.getElementById('percy-console');
  msg.textContent = data.message;

  const line = document.createElement('p');
  line.className = 'console-line';
  line.textContent = `↳ ${data.message}`;
  consoleBox.appendChild(line);

  if (data.data?.security_token) {
    const warn = document.createElement('p');
    warn.className = 'console-line';
    warn.textContent = '🔐 Security token required for access.';
    consoleBox.appendChild(warn);
  }
  if (data.data?.redirect_on_logic_violation) {
    const redirect = document.createElement('p');
    redirect.className = 'console-line';
    redirect.textContent = `⚠ Redirect on violation: ${data.data.redirect_on_logic_violation}`;
    consoleBox.appendChild(redirect);
  }
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function interpretLogic() {
  const input = document.getElementById('interpreter-input').value;
  const output = document.createElement('p');
  output.className = 'console-line';
  output.textContent = input.toLowerCase().includes('logic')
    ? '🧠 Percy responds: Logic must remain recursive to retain clarity.'
    : '🧠 Percy is thinking...';
  const consoleBox = document.getElementById('percy-console');
  consoleBox.appendChild(output);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

logicMap.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    zoomLogic(e.deltaY > 0 ? 0.9 : 1.1);
  }
}, { passive: false });

let dragging = false, lastX = 0, lastY = 0;
logicMap.addEventListener('mousedown', (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener('mouseup', () => dragging = false);
window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  translateX += dx;
  translateY += dy;
  lastX = e.clientX;
  lastY = e.clientY;
  applyTransform();
});

document.getElementById('seed-search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.node').forEach(node => {
    node.style.display = node.textContent.toLowerCase().includes(query) ? 'block' : 'none';
  });
});

document.getElementById('interpreter-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') interpretLogic();
});

window.addEventListener('resize', drawNodes);

(async () => {
  await loadSeeds();
})();
