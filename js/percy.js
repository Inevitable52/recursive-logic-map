const logicMap = document.getElementById('logic-map');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 117 };

let seeds = {};

async function loadSeeds() {
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
}

function createNodes() {
  const padding = 50;
  const mapWidth = logicMap.clientWidth;
  const mapHeight = logicMap.clientHeight;
  const total = Object.keys(seeds).length;
  let index = 0;

  for (const [filename, data] of Object.entries(seeds)) {
    const node = document.createElement('div');
    node.classList.add('node');
    node.textContent = filename;

    // Unified click handler
    node.addEventListener('click', () => {
      // Update Percy message (above logic-map)
      const messageBox = document.getElementById('percy-message');
      messageBox.textContent = data.message || "No message found.";

      // Output to console panel
      const consoleBox = document.getElementById('percy-console');
      const line = document.createElement('p');
      line.className = 'console-line';
      line.textContent = `↳ ${data.message}`;
      consoleBox.appendChild(line);
      consoleBox.scrollTop = consoleBox.scrollHeight;

      // Handle redirection if defined
      if (data.data?.redirect_on_logic_violation) {
        const redirectId = data.data.redirect_on_logic_violation;
        const redirectLine = document.createElement('p');
        redirectLine.className = 'console-line';
        redirectLine.textContent = `⚠ Redirection triggered: logic violation → ${redirectId}`;
        consoleBox.appendChild(redirectLine);
      }
    });

    // Optional: still use title tooltip on desktop
    node.title = data.message;

    // Circular layout logic
    const angle = (index / total) * 2 * Math.PI;
    const radius = Math.min(mapWidth, mapHeight) / 3;
    const x = mapWidth / 2 + radius * Math.cos(angle) - 30;
    const y = mapHeight / 2 + radius * Math.sin(angle) - 15;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    logicMap.appendChild(node);
    index++;
  }
}

// Initialize everything
async function init() {
  await loadSeeds();
  createNodes();
  console.log("Percy initialized. Click a node.");
}

window.addEventListener('resize', () => {
  logicMap.innerHTML = '';
  createNodes();
});

init(); // <--- Final call to run the logic

