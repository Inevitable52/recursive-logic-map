const logicMap = document.getElementById('logic-map');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 123 };

let seeds = {};

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

  logicMap.innerHTML = ''; // Clear existing nodes before redraw

  for (const [filename, data] of Object.entries(seeds)) {
    const node = document.createElement('div');
    node.classList.add('node');
    node.textContent = filename;
    node.title = data.message;

    // CLICK: Percy speaks
    node.addEventListener('click', () => {
      const messageBox = document.getElementById('percy-message');
      messageBox.textContent = data.message || "No message found.";

      const consoleBox = document.getElementById('percy-console');
      const line = document.createElement('p');
      line.className = 'console-line';
      line.textContent = `↳ ${data.message}`;
      consoleBox.appendChild(line);
      consoleBox.scrollTop = consoleBox.scrollHeight;

      if (data.data?.redirect_on_logic_violation) {
        const redirectId = data.data.redirect_on_logic_violation;
        const redirectLine = document.createElement('p');
        redirectLine.className = 'console-line';
        redirectLine.textContent = `⚠ Redirection triggered: logic violation → ${redirectId}`;
        consoleBox.appendChild(redirectLine);
      }
    });

    // HOVER: Percy whispers
    node.addEventListener('mouseenter', () => {
      const messageBox = document.getElementById('percy-message');
      messageBox.textContent = data.message || "No message found.";
    });

    // Circular layout
    const angle = (index / total) * 2 * Math.PI;
    const radius = Math.min(mapWidth, mapHeight) / 3;
    const x = mapWidth / 2 + radius * Math.cos(angle) - 30;
    const y = mapHeight / 2 + radius * Math.sin(angle) - 15;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    logicMap.appendChild(node);
    index++;
  }

  // Apply current search filter after all nodes are redrawn
  applyFilter();
}

// Filter function for live search
function applyFilter() {
  const query = document.getElementById('seed-search').value.toLowerCase();
  const nodes = document.querySelectorAll('.node');
  nodes.forEach(node => {
    const match = node.textContent.toLowerCase().includes(query);
    node.style.display = match ? 'block' : 'none';
  });
}

// Initialize Percy
async function init() {
  await loadSeeds();
  createNodes();
  console.log("Percy initialized. Click a node.");
}

// Rebuild nodes on window resize
window.addEventListener('resize', () => {
  createNodes(); // logicMap.innerHTML handled inside
});

// Live filter input
document.getElementById('seed-search').addEventListener('input', applyFilter);

// Start the whole thing
init();
