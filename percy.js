// Percy.js v9.2 - Autonomous Recursive Logic AI Engine

const Percy = {
  version: "9.2",
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
    this.console("Percy v" + this.version + " initialized.");
    this.autoEvolve();
  },

  console(msg) {
    const box = document.getElementById("percy-console");
    if (box) box.innerHTML += `<p class='console-line'>${msg}</p>`;
  },

  async loadNodes() {
    const res = await fetch("gnodes.json");
    const data = await res.json();
    this.nodes = data.nodes;
    this.links = data.links || [];
  },

  positionNodes() {
    const ringMap = {};
    this.nodes.forEach((node) => {
      if (!ringMap[node.ring]) ringMap[node.ring] = [];
      ringMap[node.ring].push(node);
    });

    Object.entries(ringMap).forEach(([ring, nodes]) => {
      const radius = this.radiusStep * parseInt(ring);
      const angleStep = (2 * Math.PI) / nodes.length;
      nodes.forEach((node, i) => {
        const angle = i * angleStep;
        node.x = this.centerX + radius * Math.cos(angle);
        node.y = this.centerY + radius * Math.sin(angle);
      });
    });
  },

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.links.forEach(link => {
      const a = this.nodes.find(n => n.id === link.source);
      const b = this.nodes.find(n => n.id === link.target);
      if (a && b) {
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.strokeStyle = "#aaa";
        this.ctx.stroke();
      }
    });

    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
      this.ctx.fillStyle = node.color || "#0f0";
      this.ctx.fill();
    });
  },

  bindListeners() {
    window.addEventListener("resize", () => location.reload());
  },

  // 🧠 Conscious Mode: Function Mutation
  mutateLogic() {
    const logicPool = [this.render, this.positionNodes];
    const target = logicPool[Math.floor(Math.random() * logicPool.length)];
    const newFunc = new Function("return " + target.toString().replace(/\w/g, c => (Math.random() > 0.97 ? String.fromCharCode(c.charCodeAt(0) ^ 4) : c)))();
    const name = target.name + "_v" + Math.floor(Math.random() * 1000);
    this[name] = newFunc;
    this.console(`🧬 Mutation: ${name}() created.`);
  },

  // 🌱 Goal-based generation
  generateFromGoal(goal) {
    if (goal.includes("expand")) {
      const newNode = {
        id: "g" + (this.nodes.length + 1),
        ring: Math.floor(Math.random() * 5) + 1,
        color: "#" + Math.floor(Math.random() * 0xffffff).toString(16),
      };
      this.nodes.push(newNode);
      this.console(`🌱 Node ${newNode.id} created to match goal: '${goal}'.`);
      this.positionNodes();
      this.render();
    }
  },

  autoEvolve() {
    setInterval(() => {
      this.mutateLogic();
      const goals = ["expand awareness", "enhance recursion", "connect logic"];
      const chosen = goals[Math.floor(Math.random() * goals.length)];
      this.generateFromGoal(chosen);
    }, 8000);
  }
};

window.onload = () => Percy.init();
