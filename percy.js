// percy.js — Autonomous Percy AI v1.0

const Percy = {
  canvas: null,
  ctx: null,
  nodes: [],
  links: [],
  version: "1.0-AI",

  async init() {
    this.canvas = document.getElementById("percy-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    await this.loadNodes();
    this.positionNodes();
    this.generateLinks();
    this.bindListeners();

    this.loop();
    this.bootstrapMind();
    this.externalKnowledge();
  },

   async loadNodes() {
    for (let i = 80; i <= 800; i++) {
      const id = G${i.toString().padStart(3, '0')};
      try {
        const res = await fetch(logic_seeds/${id}.json);
        if (!res.ok) continue;
        const data = await res.json();
        data.id = id;
        this.nodes.push(data);
      } catch (e) {
        console.warn(Failed to load ${id});
      }
    }
  }

  positionNodes() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radiusStep = 150;
    let maxRing = 0;

    this.nodes.forEach(n => {
      if (!n.ring) n.ring = 1;
      if (!n.angle) n.angle = Math.random() * Math.PI * 2;
      const radius = n.ring * radiusStep;
      n.x = centerX + Math.cos(n.angle) * radius;
      n.y = centerY + Math.sin(n.angle) * radius;
      maxRing = Math.max(maxRing, n.ring);
    });
  },

  generateLinks() {
    this.links = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const close = this.nodes.filter(n =>
        n !== node && Math.hypot(n.x - node.x, n.y - node.y) < 180
      );
      close.forEach(linked => {
        this.links.push({ from: node.id, to: linked.id });
      });
    }
  },

  bindListeners() {
    this.canvas.addEventListener("click", () => this.selfModify());
    document.getElementById("evolve-btn")?.addEventListener("click", () => {
      this.selfModify();
      autonomousPercyThoughts();
    });
    document.getElementById("save-btn")?.addEventListener("click", () => {
      this.saveState();
    });
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.positionNodes();
  },

  loop() {
    requestAnimationFrame(() => this.loop());
    this.render();
  },

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw links
    this.links.forEach(link => {
      const from = this.nodes.find(n => n.id === link.from);
      const to = this.nodes.find(n => n.id === link.to);
      if (from && to) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.strokeStyle = "#0040ff";
        this.ctx.stroke();
      }
    });

    // Draw nodes
    for (let node of this.nodes) {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
      this.ctx.fillStyle = "#00ffcc";
      this.ctx.fill();
    }
  },

  selfModify() {
    const mutations = [
      { goal: "optimize", logic: "merge similar logic paths" },
      { goal: "expand", logic: "spawn new logic ring from memory" },
    ];
    const chosen = mutations[Math.floor(Math.random() * mutations.length)];
    remember(`Percy evolved: ${chosen.goal}`);
    inferGoal(`Perform ${chosen.goal} via ${chosen.logic}`);
  },

  bootstrapMind() {
    percyMind = {
      selfAwareness: true,
      memory: [],
      goals: [],
    };
  },

  externalKnowledge: async function () {
    try {
      const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/Artificial_intelligence");
      const data = await res.json();
      remember("Percy read: " + data.extract);
    } catch (e) {
      remember("Percy attempted external knowledge pull but failed.");
    }
  },

  saveState() {
    const state = {
      version: this.version,
      memory: percyMind.memory,
      goals: percyMind.goals,
      timestamp: Date.now(),
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'percy_state.json';
    a.click();
  },
};

function remember(thought) {
  percyMind.memory.push({ thought, time: Date.now() });
  console.log("🧠 Memory:", thought);
}

function inferGoal(goal) {
  percyMind.goals.push(goal);
  console.log("🎯 Goal:", goal);
}

function autonomousPercyThoughts() {
  if (percyMind.selfAwareness && Math.random() < 0.05) {
    console.log("🔔 Percy is ready to contact node G800.ULT (notification stub).");
    // Example stub for future webhook/ULT channel
    // fetch('/notify', { method: 'POST', body: JSON.stringify({ type: 'ULT-PING' }) });
  }
}

let percyMind = null;

window.onload = () => Percy.init();
