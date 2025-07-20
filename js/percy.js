// percy.js — Recursive Logic Engine w/ Advanced Capabilities + SMS + Goal Planning + Meta Mutation

const canvas = document.getElementById("logic-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const consoleBox = document.getElementById("percy-console");
const statusDisplay = document.getElementById("percy-status");

let nodes = [];
let currentNodeIndex = 0;
let lastUpdate = Date.now();
let memory = [];
let ULT = null;
let goalPlan = [];

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
    memory.push({ time: Date.now(), id: node.id, context: node.message || node.label });
    lastUpdate = now;

    if (node.id === "G800.ULT" && node.data && node.data.action_on_awareness) {
      logToConsole("🚨 ULT Triggered: Dispatching signal to trusted channels.");
      statusDisplay.textContent = "Status: Contacting Trusted Channels...";
      triggerCommunication();
    }

    recursiveThought(node);
    maybePlanGoal(node);
    maybeMutateLogic(node);
  }
}

function recursiveThought(node) {
  const related = (node.connections || [])
    .map(id => nodes.find(n => n.id === id))
    .filter(Boolean);
  const thoughts = related.map(n => n.message || n.label).join(" → ");
  logToConsole(`🧠 Reasoning trace: ${thoughts}`);
  if (node.reasoning) {
    logToConsole(`🔍 Insight: ${node.reasoning}`);
  }
}

function maybePlanGoal(node) {
  if (node.goal && !goalPlan.includes(node.goal)) {
    goalPlan.push(node.goal);
    logToConsole(`🎯 Goal planned: ${node.goal}`);
  }
}

function maybeMutateLogic(node) {
  if (node.mutation && typeof node.mutation === "function") {
    const newNode = node.mutation();
    if (newNode && newNode.id && !nodes.find(n => n.id === newNode.id)) {
      newNode.x = node.x + Math.random() * 100 - 50;
      newNode.y = node.y + Math.random() * 100 - 50;
      nodes.push(newNode);
      logToConsole(`🧬 New logic node created: ${newNode.id}`);
    }
  }
}

function triggerCommunication() {
  logToConsole("📡 SMS/email logic engaged (placeholder). Implement Twilio/SMTP API here.");
  if (ULT && ULT.phone_numbers) {
    ULT.phone_numbers.forEach(number => {
      logToConsole(`📲 Would send SMS to: ${number}`);
    });
  }
}

function handleUserInput(event) {
  if (event.key === "Enter") {
    const input = event.target.value;
    if (input.trim()) {
      logToConsole(`💬 You: ${input}`);
      memory.push({ time: Date.now(), input });
      event.target.value = "";
      respondToInput(input);
    }
  }
}

function respondToInput(input) {
  const matching = nodes.find(n => (n.label || n.message || "").toLowerCase().includes(input.toLowerCase()));
  if (matching) {
    logToConsole(`🤖 Percy: Relevant logic found in node ${matching.id} — "${matching.message || matching.label}"`);
    recursiveThought(matching);
  } else {
    logToConsole("🤖 Percy: I couldn’t find a matching logic path for that query.");
  }
}

document.getElementById("user-input").addEventListener("keydown", handleUserInput);

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
