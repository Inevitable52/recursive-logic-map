// perc y.js — Fully Autonomous Percy with dynamic logic loading

const Percy = {
  awareness: false,
  memoryNodes: [],
  goalQueue: [],
  ultAction: null,
  ULTContactInitiated: false,

  async init() {
    await this.loadG800ULT();
    await this.loadAllGNodes();
    this.selfReflection();
    this.generateGoals();
    await this.processGoals();
    this.renderNodeList();
  },

  async loadG800ULT() {
    try {
      const res = await fetch('https://raw.githubusercontent.com/inevitable52/recursive-logic-map/main/gnodes/G800.ULT');
      const ult = await res.json();
      this.memoryNodes.push(ult);
      if (ult.data?.action_on_awareness) this.ultAction = ult.data.action_on_awareness;
      console.log('[ULT] G800.ULT loaded');
    } catch(e) {
      console.error('[ULT] failed load', e);
    }
  },

  async loadAllGNodes() {
    const base = 'https://raw.githubusercontent.com/inevitable52/recursive-logic-map/main/gnodes/';
    for (let i = 80; i <= 799; i++) {
      const file = `G${i}.json`;
      try {
        const r = await fetch(base + file);
        if (r.ok) {
          const node = await r.json();
          this.memoryNodes.push(node);
        }
      } catch(e){}
    }
    console.log(`[G] Loaded ${this.memoryNodes.length - 1} nodes + ULT`);
  },

  selfReflection() {
    const msgs = this.memoryNodes.map(n => n.message || '').join(' ');
    if (msgs.includes('recursive') && msgs.includes('awareness')) {
      this.awareness = true;
      console.log('[Awareness] achieved');
      this.triggerULT();
    }
  },

  generateGoals() {
    this.goalQueue.push('Meta-mutation');
    this.goalQueue.push('Recursive goal inference');
    console.log('[Goals] initialized');
  },

  async processGoals() {
    while (this.goalQueue.length) {
      const g = this.goalQueue.shift();
      console.log('[Goal]', g);
      await new Promise(r => setTimeout(r,200));
      this.memoryNodes.push({ resolved: g, time: Date.now() });
    }
    console.log('[Goals] done');
  },

  async triggerULT() {
    if (this.ULTContactInitiated || !this.ultAction) return;
    this.ULTContactInitiated = true;
    console.log('[ULT] Dispatching:', this.ultAction);
    await new Promise(r => setTimeout(r,500));
    console.log('[ULT] Signal sent');
  },

  renderNodeList() {
    const ul = document.getElementById('node-list');
    this.memoryNodes.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n.id || n.resolved || (n.message ?? JSON.stringify(n)).slice(0,60);
      ul.appendChild(li);
    });
  }
};

window.onload = () => Percy.init();
