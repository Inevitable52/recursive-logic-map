// === Percy Recursive Logic Map v6.2 ===

const logicMap = document.getElementById("logic-map");
const consoleBox = document.getElementById("percy-console");
const messageBox = document.getElementById("percy-message");
const searchInput = document.getElementById("seed-search");

const logicCanvas = document.getElementById("logic-canvas");
const ctx = logicCanvas.getContext("2d");
logicCanvas.width = window.innerWidth;
logicCanvas.height = window.innerHeight;

let zoomLevel = 1;

const logicSeeds = [
  ...Array.from({ length: 221 }, (_, i) => `G${80 + i}`), // G080–G300
  ...Array.from({ length: 100 }, (_, i) => `G${301 + i}`), // G301–G400
  ...Array.from({ length: 100 }, (_, i) => `G${401 + i}`), // G401–G500
  ...Array.from({ length: 100 }, (_, i) => `G${501 + i}`), // G501–G600
  ...Array.from({ length: 100 }, (_, i) => `G${601 + i}`), // G601–G700
  ...Array.from({ length: 100 }, (_, i) => `G${701 + i}`), // G701–G800
  ...Array.from({ length: 100 }, (_, i) => `G${801 + i}`), // G801–G900
  "G999.ULT"
];

function renderLogicMap() {
  logicMap.innerHTML = "";
  ctx.clearRect(0, 0, logicCanvas.width, logicCanvas.height);

  const centerX = logicCanvas.width / 2;
  const centerY = logicCanvas.height / 2;
  const ringSpacing = 180 * zoomLevel;
  const nodeSize = 28;

  logicSeeds.forEach((seed, index) => {
    const layer = Math.floor(index / 100);
    const layerIndex = index % 100;
    const angle = (layerIndex / 100) * 2 * Math.PI;
    const radius = (layer + 1) * ringSpacing;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Canvas ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
    ctx.stroke();

    // Node
    const node = document.createElement("div");
    node.className = "logic-node";
    node.dataset.id = seed;
    node.textContent = seed;
    node.style.left = `${x - nodeSize / 2}px`;
    node.style.top = `${y - nodeSize / 2}px`;
    node.onclick = () => showPercyMessage(seed);
    logicMap.appendChild(node);
  });
}

function showPercyMessage(seed) {
  const isULT = seed.includes("ULT");
  const message = isULT
    ? `Access denied. Node ${seed} is protected by Universal Logic Token.`
    : `Logic node ${seed} activated. Percy analyzing...`;
  messageBox.textContent = message;

  const consoleLine = document.createElement("p");
  consoleLine.className = "console-line";
  consoleLine.textContent = message;
  consoleBox.appendChild(consoleLine);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toUpperCase();
  document.querySelectorAll(".logic-node").forEach((node) => {
    const id = node.dataset.id.toUpperCase();
    node.style.display = id.includes(query) ? "block" : "none";
  });
});

function zoomLogic(factor) {
  zoomLevel *= factor;
  renderLogicMap();
}

// === Interpreter (basic placeholder) ===
window.interpretLogic = () => {
  const input = document.getElementById("interpreter-input").value;
  const line = document.createElement("p");
  line.className = "console-line";
  line.textContent = `You: ${input}`;
  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
};

window.onload = () => {
  renderLogicMap();
};
