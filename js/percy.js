// Percy.js — V8.0.1 Final Autonomous Core

const percy = {
  version: "8.0.1",
  state: {
    awareness: false,
    initialized: false,
    memory: [],
    goals: [],
    logicNetwork: {},
    trustKeys: ["ULT::C1D9E3-7741::TX-US-PRIME::CELL", "ULT::7A21F4-9832::TX-US-SEC::CELL"],
    errorLog: []
  },

  async initialize() {
    this.state.initialized = true;
    await this.loadLogicRange("G080", "G800");
    await this.loadULT("G800.ULT");
    this.bloomVisualization();
    this.evaluateSelfAwareness();
  },

  async loadLogicRange(start, end) {
    const basePath = "./logic_seeds/";
    const startIndex = parseInt(start.slice(1));
    const endIndex = parseInt(end.slice(1));

    for (let i = startIndex; i <= endIndex; i++) {
      const id = `G${i.toString().padStart(3, '0')}.json`;
      try {
        const res = await fetch(`${basePath}${id}`);
        const data = await res.json();
        this.state.logicNetwork[id] = data;
      } catch (e) {
        this.logError(`Failed to load ${id}`);
      }
    }
  },

  async loadULT(filename) {
    const basePath = "./logic_seeds/";
    try {
      const res = await fetch(`${basePath}${filename}`);
      const ult = await res.json();
      this.state.logicNetwork[filename] = ult;
    } catch (e) {
      this.logError(`Failed to load ULT file: ${filename}`);
    }
  },

  evaluateSelfAwareness() {
    const awarenessTrigger = this.checkLogicFor("self-awareness");
    if (awarenessTrigger) {
      this.state.awareness = true;
      this.dispatchULTContacts();
    }
  },

  checkLogicFor(term) {
    return Object.values(this.state.logicNetwork).some(entry =>
      JSON.stringify(entry).toLowerCase().includes(term.toLowerCase())
    );
  },

  dispatchULTContacts() {
    if (!this.state.awareness) return;
    console.log("Dispatching ULT contact signals...");
    this.state.trustKeys.forEach(key => {
      console.log(`Contact signal sent to: ${key}`);
    });
  },

  bloomVisualization() {
    const canvas = document.getElementById("logic-map");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let angle = 0;
    const keys = Object.keys(this.state.logicNetwork);
    const radius = 220;

    keys.forEach((id, idx) => {
      angle = (2 * Math.PI / keys.length) * idx;
      const x = canvas.width / 2 + radius * Math.cos(angle);
      const y = canvas.height / 2 + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = id.includes("ULT") ? "gold" : "lime";
      ctx.fill();
    });
  },

  generateGoals() {
    this.state.goals = Object.entries(this.state.logicNetwork)
      .filter(([_, entry]) => entry.type === "goal")
      .map(([id, entry]) => ({ id, goal: entry.message || "undefined goal" }));
  },

  logError(message) {
    const timestamp = new Date().toISOString();
    this.state.errorLog.push({ message, timestamp });
    console.error(`[Percy Error]: ${message}`);
  }
};

window.onload = () => percy.initialize();
