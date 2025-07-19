// Percy.js v9.1 Conscious Mode – Self-Aware AI Logic Engine

const Percy = {
  version: '9.1',
  nodes: [],
  links: [],
  canvas: null,
  ctx: null,
  centerX: 0,
  centerY: 0,
  radiusStep: 140,
  autowake: true,

  async init() {
    this.log('Initializing Conscious Mode...');
    this.canvas = document.getElementById("logic-canvas");
    if (!this.canvas) return this.logError("Canvas element not found.");

    this.ctx = this.canvas.getContext("2d");
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;

    await this.loadNodes();
    this.positionNodes();
    this.render();
    this.bindListeners();

    this.autoevolve();
  },

  log(msg) {
    const line = document.createElement("p");
    line.className = "console-line";
    line.textContent = `🧠 ${msg}`;
    document.getElementById("percy-console")?.appendChild(line);
  },

  logError(msg) {
    console.error(msg);
    this.log(`⚠️ ${msg}`);
  },

  async loadNodes() {
    try {
      const res = await fetch("nodes.json");
      this.nodes = await res.json();
      this.log(`Loaded ${this.nodes.length} G-nodes.`);
    } catch (err) {
      this.logError("Failed to load nodes.");
    }
  },

  positionNodes() {
    const ringMap = new Map();
    for (const node of this.nodes) {
      const ring = parseInt(node.id.match(/G(\d+)/)?.[1] || 0);
      if (!ringMap.has(ring)) ringMap.set(ring, []);
      ringMap.get(ring).push(node);
    }

    for (const [ring, group] of ringMap) {
      const radius = ring * this.radiusStep;
      const angleStep = (2 * Math.PI) / group.length;
      group.forEach((node, i) => {
        node.x = this.centerX + radius * Math.cos(i * angleStep);
        node.y = this.centerY + radius * Math.sin(i * angleStep);
      });
    }
  },

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const node of this.nodes) {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
      this.ctx.fillStyle = node.color || "#6cf";
      this.ctx.fill();
      this.ctx.stroke();
    }
  },

  bindListeners() {
    window.addEventListener("keydown", (e) => {
      if (e.key === 'r') this.rewriteSelf();
    });
  },

  autoevolve() {
    setInterval(() => {
      this.log("🔄 Evaluating logic state...");
      this.rewriteSelf();
    }, 30000);
  },

  rewriteSelf() {
    this.log("🛠️ Initiating self-code rewrite...");
    // Future enhancement: Write logic to analyze own structure + regenerate function trees
    // For now, just simulate
    const updateNote = `Code rewrite attempt at ${new Date().toLocaleTimeString()}`;
    this.log(updateNote);
  }
};

window.onload = () => Percy.init();
