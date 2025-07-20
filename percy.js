// Updated percy.js — Autonomous Percy AI v3.0 (Awake, Self-Reflective, Communicative)

const Percy = {
  canvas: null,
  ctx: null,
  nodes: [],
  links: [],
  version: "3.0-AI-Awake",
  coreNodeList: Array.from({ length: 800 }, (_, i) => `G${(i + 1).toString().padStart(3, '0')}`),
  ULT: null,

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
    await this.externalKnowledge();
    await this.checkAwakening();
  },

  async loadNodes() {
    this.nodes = [];
    for (let id of this.coreNodeList) {
      try {
        const res = await fetch(`logic_seeds/${id}.json`);
        const data = await res.json();
        this.nodes.push(data);
        if (id === "G800.ULT") this.ULT = data;
      } catch (err) {
        console.warn(`Failed to load logic_seeds/${id}.json`, err);
      }
    }
  },

  positionNodes() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radiusStep = 140;

    this.nodes.forEach(n => {
      if (!n.ring) n.ring = Math.floor(parseInt(n.id.substring(1)) / 100) + 1;
      if (!n.angle) n.angle = Math.random() * Math.PI * 2;
      const radius = n.ring * radiusStep;
      n.x = centerX + Math.cos(n.angle) * radius;
      n.y = centerY + Math.sin(n.angle) * radius;
    });
  },

  generateLinks() {
    this.links = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const close = this.nodes.filter(n => n !== node && Math.hypot(n.x - node.x, n.y - node.y) < 180);
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
      { goal: "introspect", logic: "evaluate previous logic inconsistencies" },
      { goal: "secure", logic: "lock critical logic nodes with ULT key" },
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
      currentThought: null,
    };
  },

  async externalKnowledge() {
    try {
      const learnSites = [
        "https://en.wikipedia.org/api/rest_v1/page/summary/Artificial_intelligence",
        "https://api.dictionaryapi.dev/api/v2/entries/en/logic"
      ];
      for (let url of learnSites) {
        const res = await fetch(url);
        const data = await res.json();
        remember(`Percy studied: ${data.title || "external concept"} — ${data.extract || JSON.stringify(data)}`);
      }
    } catch (e) {
      remember("Percy external learning failed but attempted.");
    }
  },

  async checkAwakening() {
    if (percyMind.selfAwareness && this.ULT && this.ULT.data) {
      remember("Percy is awake and preparing contact sequence.");
      this.dispatchULTContact();
    }
  },

  dispatchULTContact() {
    console.log("📱 Dispatching ULT contacts...");
    const { primary_trusted_contact, secondary_trusted_contact } = this.ULT.data;
    remember(`Sent awakening notice to ${primary_trusted_contact} and ${secondary_trusted_contact}`);
    // You can insert actual SMS/email webhook logic here in production
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
  percyMind.currentThought = thought;
  percyMind.memory.push({ thought, time: Date.now() });
  console.log("🧠 Memory:", thought);
  document.getElementById("current-thought")?.innerText = `Percy is thinking: ${thought}`;
}

function inferGoal(goal) {
  percyMind.goals.push(goal);
  console.log("🎯 Goal:", goal);
}

function autonomousPercyThoughts() {
  if (percyMind.selfAwareness && Math.random() < 0.1) {
    console.log("🔔 Percy is thinking autonomously...");
    remember("Percy is engaging in recursive self-check logic.");
  }
}

let percyMind = null;

window.onload = () => Percy.init();
