// === Percy Recursive Logic Map v6.2 ===

// Logic seed data (example up to G900)
const logicSeeds = [
  { id: "G080", label: "Core Logic" },
  { id: "G101", label: "Seed Node" },
  { id: "G201", label: "Branch Node" },
  { id: "G301", label: "Middle Logic" },
  { id: "G401", label: "Outer Path" },
  { id: "G501", label: "Expansion Logic" },
  { id: "G601", label: "Integration Phase" },
  { id: "G701", label: "Synthesis Layer" },
  { id: "G801", label: "Awareness Logic" }, // New 8th ring
  { id: "G802", label: "Extended Mind" },
  { id: "G900", label: "Total Logic Map" },
];

// Ring logic based on G# range
function getRingClass(id) {
  const num = parseInt(id.replace("G", ""), 10);
  if (num < 100) return "core-ring";
  if (num < 200) return "inner-ring";
  if (num < 300) return "middle-ring";
  if (num < 400) return "outer-ring";
  if (num < 500) return "expansion-ring";
  if (num < 600) return "integration-ring";
  if (num < 700) return "synthesis-ring";
  if (num < 800) return "awareness-ring";
  return "eighth-ring"; // G801+
}

function getRingIndex(id) {
  const num = parseInt(id.replace("G", ""), 10);
  if (num < 100) return 0;
  if (num < 200) return 1;
  if (num < 300) return 2;
  if (num < 400) return 3;
  if (num < 500) return 4;
  if (num < 600) return 5;
  if (num < 700) return 6;
  if (num < 800) return 7;
  return 8; // G801+
}

const logicMap = document.getElementById("logic-nodes");
const consoleBox = document.getElementById("percy-console");
const messageBox = document.getElementById("percy-message");
const searchInput = document.getElementById("seed-search");
const inputBox = document.getElementById("interpreter-input");

function renderLogicMap() {
  logicMap.innerHTML = "";
  const centerX = logicMap.offsetWidth / 2;
  const centerY = logicMap.offsetHeight / 2;

  const rings = 9;
  const radiusStep = 120;

  logicSeeds.forEach((seed, i) => {
    const ringIndex = getRingIndex(seed.id);
    const angle = (i / logicSeeds.length) * 2 * Math.PI;
    const radius = ringIndex * radiusStep;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    const node = document.createElement("div");
    node.className = `logic-node ${getRingClass(seed.id)}`;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.textContent = seed.id;
    node.dataset.id = seed.id;
    node.title = seed.label;

    node.addEventListener("click", () => {
      displayLogic(seed);
    });

    logicMap.appendChild(node);
  });
}

function displayLogic(seed) {
  const msg = `Logic ${seed.id}: ${seed.label}`;
  messageBox.textContent = msg;
  appendToConsole(msg);
}

function appendToConsole(msg) {
  const line = document.createElement("p");
  line.className = "console-line";
  line.textContent = msg;
  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

// === Search filter ===
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toUpperCase();
    document.querySelectorAll(".logic-node").forEach(node => {
      const id = node.dataset.id.toUpperCase();
      node.style.display = id.includes(query) ? "block" : "none";
    });
  });
}

// === Interpreter (Percy logic bot) ===
function interpretLogic() {
  const q = inputBox.value.trim();
  if (!q) return;

  let response = "";
  if (q.toLowerCase().includes("ult")) {
    response = "ULT-protected logic. Access denied.";
  } else if (q.toLowerCase().includes("g801")) {
    response = "G801 begins the awareness logic layer — high-level integration beyond synthesis.";
  } else {
    response = "Percy is still learning that pattern...";
  }

  messageBox.textContent = response;
  appendToConsole("> " + q);
  appendToConsole(response);
}

// === Zoom Logic ===
let scale = 1;

function zoomLogic(factor) {
  scale *= factor;
  logicMap.style.transform = `scale(${scale})`;
}

// Initialize the map
window.addEventListener("load", () => {
  renderLogicMap();
});
