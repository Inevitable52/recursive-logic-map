// Percy.js - Autonomous Recursive Logic AI Engine (Updated with original style and ring structure)

const Percy = {
  version: '7.18.25',
  nodes: [],
  links: [],
  canvas: null,
  ctx: null,
  centerX: 0,
  centerY: 0,
  radiusStep: 150, // original-ish ring spacing

  // Initialize Percy
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

    // Placeholder: Start autonomous logic loop or code mutation here
    // this.startAutonomy();
  },

  // Load all nodes from G080.json through G800.json from local logic_seeds folder
  async loadNodes() {
    for (let i = 80; i <= 800; i++) {
      const id = `G${i.toString().padStart(3, '0')}`;
      try {
        const res = await fetch(`logic_seeds/${id}.json`);
        if (!res.ok) {
          console.warn(`Failed to load ${id}: HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        data.id = id;
        this.nodes.push(data);
      } catch (e) {
        console.warn(`Failed to load ${id}`, e);
      }
    }
  },

  // Position nodes in rings by layer property
  positionNodes() {
    const rings = {};
    this.nodes.forEach(node => {
      const layer = node.layer || 1;
      if (!rings[layer]) rings[layer] = [];
      rings[layer].push(node);
    });

    Object.entries(rings).forEach(([layer, nodes]) => {
      const radius = this.radiusStep * layer;
      const angleStep = (2 * Math.PI) / nodes.length;
      nodes.forEach((node, index) => {
        const angle = index * angleStep;
        node.x = this.centerX + radius * Math.cos(angle);
        node.y = this.centerY + radius * Math.sin(angle);
        node.layer = +layer;
      });
    });
  },

  // Render canvas links and DOM nodes
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderLinks();
    this.renderNodes();
  },

  // Draw lines between linked nodes
  renderLinks() {
    this.nodes.forEach(source => {
      if (!source.links) return;
      source.links.forEach(targetId => {
        const target = this.nodes.find(n => n.id === targetId);
        if (target) {
          this.ctx.beginPath();
          this.ctx.moveTo(source.x, source.y);
          this.ctx.lineTo(target.x, target.y);
          this.ctx.strokeStyle = '#66fcf199';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
        }
      });
    });
  },

  // Create divs for each node positioned absolutely
  renderNodes() {
    const container = document.body;
    document.querySelectorAll(".node").forEach(n => n.remove());

    this.nodes.forEach(node => {
      const div = document.createElement("div");
      div.className = `node ring-${node.layer}`;
      div.style.position = 'absolute';
      div.style.left = `${node.x}px`;
      div.style.top = `${node.y}px`;
      div.style.transform = 'translate(-50%, -50%)';
      div.textContent = node.label || node.id;

      div.addEventListener("click", () => {
        alert(`Node: ${node.id}\nLogic: ${node.logic || 'No logic defined'}`);
      });

      container.appendChild(div);
    });
  },

  // Bind window resize to reposition and redraw
  bindListeners() {
    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.centerX = this.canvas.width / 2;
      this.centerY = this.canvas.height / 2;
      this.positionNodes();
      this.render();
    });
  },

  // Placeholder for autonomous self-coding and recursive logic upgrades
  // startAutonomy() {
  //   // Here you could add code for introspection, dynamic node updates, goal inference, etc.
  // }
};

window.Percy = Percy; // expose globally

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
