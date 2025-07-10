const logicMap = document.getElementById('logic-map');
const seedsFolder = 'logic_seeds/';
const seedRange = { start: 80, end: 190 }; // Update as needed

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
  const padding = 50;
  const mapWidth = logicMap.clientWidth;
  const mapHeight = logicMap.clientHeight;
  const total = Object.keys(seeds).length;
  let index = 0;

  for (const [filename, data] of Object.entries(seeds)) {
    const node = document.createElement('div');
    node.classList.add('node');
    node.textContent = filename;
    node.title = data.message;

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

    node.addEventListener('mouseenter', () => {
      const messageBox = document.getElementById('percy-message');
      messageBox.textContent = data.message || "No message found.";
    });

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

function percyThinker(seeds) {
  const logicSummary = {
    total: Object.keys(seeds).length,
    types: {},
    violations: [],
    redirections: [],
  };

  for (const [id, seed] of Object.entries(seeds)) {
    const type = seed.type || 'unknown';
    logicSummary.types[type] = (logicSummary.types[type] || 0) + 1;

    if (seed.data?.redirect_on_logic_violation) {
      logicSummary.redirections.push({
        from: id,
        to: seed.data.redirect_on_logic_violation,
      });
    }

    if (type === 'recursion_guidance' && !seed.data?.requires_boundary) {
      logicSummary.violations.push(`${id} lacks recursion boundaries`);
    }
  }

  return logicSummary;
}

function percyReflect(summary) {
  const consoleBox = document.getElementById('percy-console');

  const line = document.createElement('p');
  line.className = 'console-line';
  line.textContent = `🧠 Percy thinks: ${summary.types['recursion_guidance'] || 0} recursion seeds detected.`;
  consoleBox.appendChild(line);

  if (summary.violations.length > 0) {
    const warning = document.createElement('p');
    warning.className = 'console-line';
    warning.textContent = `⚠ Warning: ${summary.violations.length} recursion violations found: ${summary.violations.join(', ')}`;
    consoleBox.appendChild(warning);
  }

  if (summary.redirections.length > 0) {
    const notice = document.createElement('p');
    notice.className = 'console-line';
    notice.textContent = `↪ ${summary.redirections.length} logic redirections mapped.`;
    consoleBox.appendChild(notice);
  }
}

async function init() {
  await loadSeeds();
  createNodes();
  const logicSummary = percyThinker(seeds);
  percyReflect(logicSummary);
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
