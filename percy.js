// percy.js - Updated for DOM safety and visual ring structure

const Percy = {
  version: '7.19.25',
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
    const container = document.getElementById("graph-container");
    if (!container) return console.error("Graph container not found");

    this.centerX = container.clientWidth / 2;
    this.centerY = container.clientHeight / 2;

    await this.loadNodes();
    this.positionNodes();
    this.render();
    this.bindListeners();

    this.log(`🔁 Percy v${this.version} initialized.`);
  },

  async loadNodes() {
    // For testing: generate dummy nodes if not loaded externally
    if (this.nodes.length === 0) {
      for (let i = 0; i < 60; i++) {
        this.nodes.push({ id: `G${i + 1}`, layer: Math.floor(i / 10) });
      }
    }
  },

  positionNodes() {
    const layerCounts = {};
    this.nodes.forEach(node => {
      const layer = node.layer ?? 0;
      layerCounts[layer] = (layerCounts[layer] || 0) + 1;
    });

    const layerOffsets = {};
    for (let layer in layerCounts) {
      const count = layerCounts[layer];
      layerOffsets[layer] = 0;
    }

    this.nodes.forEach(node => {
      const layer = node.layer ?? 0;
      const count = layerCounts[layer];
      const index = layerOffsets[layer]++;
      const angle = (2 * Math.PI * index) / count;
      const radius = this.radiusStep * (layer + 1);
      node.x = this.centerX + radius * Math.cos(angle);
      node.y = this.centerY + radius * Math.sin(angle);
    });
  },

  render() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Links
    this.ctx.strokeStyle = "#aaa";
    this.links.forEach(link => {
      const from = this.nodes.find(n => n.id === link.from);
      const to = this.nodes.find(n => n.id === link.to);
      if (from && to) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
      }
    });

    // Nodes
    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#66f";
      this.ctx.fill();
      this.ctx.strokeStyle = "#333";
      this.ctx.stroke();

      // Label
      this.ctx.font = "12px sans-serif";
      this.ctx.fillStyle = "#000";
      this.ctx.fillText(node.id, node.x + 12, node.y);
    });
  },

  bindListeners() {
    const loadButton = document.getElementById("loadButton");
    if (loadButton) {
      loadButton.addEventListener("click", async () => {
        await this.loadNodes();
        this.positionNodes();
        this.render();
      });
    }

    window.addEventListener("resize", () => {
      const container = document.getElementById("graph-container");
      if (container) {
        this.centerX = container.clientWidth / 2;
        this.centerY = container.clientHeight / 2;
        this.positionNodes();
        this.render();
      }
    });
  },

  log(message) {
    const status = document.getElementById("percy-status");
    const consoleBox = document.getElementById("percy-console");
    if (status) status.textContent = `Status: ${message}`;
    if (consoleBox) {
      const line = document.createElement("p");
      line.className = "console-line";
      line.textContent = message;
      consoleBox.appendChild(line);
    }
  }
};

// Wait for DOM to load before running Percy
document.addEventListener("DOMContentLoaded", () => Percy.init());
