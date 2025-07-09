const logicMap = document.getElementById('logic-map');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 114 };

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

    const angle = (index / total) * 2 * Math.PI;
    const radius = Math.min(mapWidth, mapHeight) / 3;
    const x = mapWidth / 2 + radius * Math.cos(angle) - 30;
    const y = mapHeight / 2 + radius * Math.sin(angle) - 15;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    node.title = data.message;

    logicMap.appendChild(node);
    index++;
  }
}

async function init() {
  await loadSeeds();
  console.log("Percy initialized. Waiting for seeds...");
  console.log(`Loaded ${Object.keys(seeds).length} seeds.`);
  createNodes();
}

window.addEventListener('load', init);

window.addEventListener('resize', () => {
  logicMap.innerHTML = '';
  createNodes();
});
