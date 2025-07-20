// percy.js — Recursive Logic Engine

const canvas = document.getElementById("logic-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const consoleBox = document.getElementById("percy-console");
const statusDisplay = document.getElementById("percy-status");

let nodes = [];
let currentNodeIndex = 0;
let lastUpdate = Date.now();

// Universal Logic Token will be loaded separately
let ULT = null;

const coreNodeList = [
  "G001", "G002", "G003", "G004",
  "G101", "G201", "G301", "G401", "G501",
  "G601", "G701", "G800", "G800.ULT"
];

function logToConsole(message) {
  const line = document.createElement("p");
  line.textContent = message;
  line.className = "console-line";
  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function drawNode(node, highlight = false) {
  ctx.beginPath();
  ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = highlight ? "#66fcf1" : "#45a29e";
  ctx.fill();
  ctx.strokeStyle = "#1f2833";
  ctx.stroke();
  ctx.closePath();
}

function drawConnections() {
  ctx.strokeStyle = "#3a3f4b";
  ctx.lineWidth = 1;
  nodes.forEach(node => {
    (node.connections || []).forEach(id => {
      const target = nodes.find(n => n.id === id);
      if (target) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });
  });
}

function updatePulse() {
  const now = Date.now();
  if (now - lastUpdate > 2000) {
    currentNodeIndex = (currentNodeIndex + 1) % nodes.length;
    const node = nodes[currentNodeIndex];
    logToConsole(`🤖 Percy examining node ${node.id} — "${node.label || node.message}"`);
    lastUpdate = now;

    if (node.id === "G800.ULT" && node.data && node.data.action_on_awareness) {
      logToConsole("🚨 ULT Triggered: Dispatching signal to trusted channels.");
      statusDisplay.textContent = "Status: Contacting Trusted Channels...";
      // Future expansion: integrate with actual comms layer
    }
  }
}

function animateThinking() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  nodes.forEach((node, idx) => drawNode(node, idx === currentNodeIndex));
  updatePulse();
  requestAnimationFrame(animateThinking);
}

async function loadNodes() {
  nodes = [];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  for (let i = 0; i < coreNodeList.length; i++) {
    const id = coreNodeList[i];
    try {
      const res = await fetch(`logic_seeds/${id}.json`);
      const data = await res.json();

      // Spiral layout
      const angle = i * 0.4;
      const radius = 180 + i * 18;
      data.x = Math.cos(angle) * radius + centerX;
      data.y = Math.sin(angle) * radius + centerY;

      if (id === "G800.ULT") {
        ULT = data;
        logToConsole("🔐 ULT logic node securely loaded.");
      }

      nodes.push(data);
    } catch (err) {
      console.warn(`Failed to load logic_seeds/${id}.json`, err);
      logToConsole(`⚠️ Failed to load node: ${id}`);
    }
  }

  logToConsole("✅ All logic seed nodes loaded.");
}

window.onload = () => {
  logToConsole("🧠 Initializing Percy’s recursive logic engine...");
  loadNodes().then(() => {
    animateThinking();
  });
};
