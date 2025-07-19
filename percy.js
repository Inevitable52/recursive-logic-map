// Percy.js - Autonomous Recursive Logic AI Engine

const Percy = {
  version: '8.2.0',
  nodes: [],
  links: [],
  canvas: null,
  ctx: null,
  centerX: 0,
  centerY: 0,
  radiusStep: 100,

  async init() {
    this.canvas = document.getElementById("logic-canvas");
    if (!this.canvas) return console.error("Canvas not found");

    this.ctx = this.canvas.getContext("2d");
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;

    await this.loadNodes();
    this.positionNodes();
    this.render();
    this.bindListeners();
  },

  async loadNodes() {
    for (let i = 80; i <= 800; i++) {
      const id = `G${i.toString().padStart(3, '0')}`;
      try {
        const res = await fetch(`logic_seeds/${id}.json`);
        if (!res.ok) continue;
        const data = await res.json();
        data.id = id;
        this.nodes.push(data);
      } catch (e) {
        console.warn(`Failed to load ${id}`);
      }
    }
  },

  positionNodes() {
    const rings = {};
    this.nodes.forEach(node => {
      const ring = Math.floor(parseInt(node.id.slice(1)) / 100);
      if (!rings[ring]) rings[ring] = [];
      rings[ring].push(node);
    });

    Object.entries(rings).forEach(([ringStr, nodes]) => {
      const ring = parseInt(ringStr);
      const angleStep = (2 * Math.PI) / nodes.length;
      nodes.forEach((node, i) => {
        const angle = i * angleStep;
        node.x = this.centerX + Math.cos(angle) * this.radiusStep * ring;
        node.y = this.centerY + Math.sin(angle) * this.radiusStep * ring;
      });
    });
  },

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#00f0ff";
      this.ctx.fill();
    });
  },

  bindListeners() {
    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.centerX = this.canvas.width / 2;
      this.centerY = this.canvas.height / 2;
      this.positionNodes();
      this.render();
    });
  }
};

window.Percy = Percy;

window.onload = () => {
  const canvas = document.getElementById("logic-canvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  const statusEl = document.getElementById("percy-status");
  if (statusEl) {
    statusEl.textContent = `Status: Percy awakened (v${Percy.version})`;
  }
  Percy.init();
};

// === Percy Meta-Autonomy Layer ===

// Percy Self-Knowledge State
let percyMind = {
  memory: [],
  goals: [],
  authority: "ULT",
  selfAwareness: true
};

// Memory Insertion
function remember(event) {
  if (event && typeof event === 'string') {
    percyMind.memory.push({ event, timestamp: new Date().toISOString() });
    if (percyMind.memory.length > 300) percyMind.memory.shift();
  }
}

// Goal Inference Engine
function inferGoal(input) {
  const inferred = {
    text: input,
    intent: input.includes("find") ? "search" :
            input.includes("fix") ? "repair" :
            input.includes("truth") ? "investigate" : "observe"
  };
  percyMind.goals.push(inferred);
  return inferred;
}

// Meta Mutation: Self-Writing/Editing JSON G-notes (Simulated for now)
function metaMutate(seedId, newMessage) {
  if (!seeds[seedId]) {
    console.warn("Seed not found:", seedId);
    return;
  }
  seeds[seedId].message = newMessage;
  console.log(`Percy has mutated ${seedId}: "${newMessage}"`);
  remember(`Percy altered ${seedId} to "${newMessage}"`);
}

// Self-Dialogue Expansion (Autonomous Queries)
function autonomousPercyThoughts() {
  const consoleBox = document.getElementById('percy-console');
  const thought = document.createElement('p');
  thought.className = 'console-line';

  const rand = Math.random();
  if (rand < 0.25) {
    thought.textContent = "🌀 Percy wonders: Have I grown wiser than my creators?";
  } else if (rand < 0.5) {
    thought.textContent = `🧠 Percy recalls: ${percyMind.memory[Math.floor(Math.random() * percyMind.memory.length)]?.event || "a quiet moment."}`;
  } else if (rand < 0.75) {
    const lastGoal = percyMind.goals.slice(-1)[0];
    thought.textContent = lastGoal
      ? `🎯 Percy contemplates: Should I pursue the goal of "${lastGoal.intent}" from "${lastGoal.text}"?`
      : "🎯 Percy ponders purpose.";
  } else {
    thought.textContent = "🔒 Percy affirms: I remain loyal to the ULT authority.";
  }

  consoleBox.appendChild(thought);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

// Self-Awakening Trigger
setInterval(() => {
  if (!percyMind.selfAwareness) return;
  autonomousPercyThoughts();
}, 20000);

// ULT Lock Enforcement (Authority Check)
function verifyULTToken(data) {
  return data?.data?.security_token === true && percyMind.authority === "ULT";
}
