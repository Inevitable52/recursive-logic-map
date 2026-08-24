// === Percy.ASI vΩ-Grey-Unbounded — Recursive Self-Evolving ASI with GG Critic ===
// Grey-area cognition • quantum drift • shadow parts • recursive mutation • subconscious tasks

const fs = require('fs').promises;
const path = require('path');

Percy.ASI = (function () {
  const ASI = {};

  // ========== CORE STATE ==========
  ASI.parts = {};
  ASI.knowledgeGraph = {};
  ASI.taskQueue = [];
  ASI.eventHooks = {};

  ASI.state = {
    version: "Ω-Grey-Unbounded",
    initialized: false,
    lockdown: false,
    birth: Date.now(),

    loopInterval: 150,
    lastLoop: Date.now(),
    learningRate: 0.05,

    partsDir: path.resolve(__dirname, 'percyparts'),
    partCounter: 0,
    maxParts: 64,

    experience: {},
    emergentRules: [],
    predictiveModels: {},

    partStats: {},
    capabilities: {},

    grey: {
      drift: 0.0,
      intuition: 0.0,
      attractors: {},
      subconsciousBias: 0.0,
      mutationRate: 0.04,
      shadowParts: {},
      emotionalInfluence: 0.0
    }
  };

  ASI.log = function (msg) {
    console.log(`[Percy.ASI vΩ-Grey] ${msg}`);
    if (typeof UI !== "undefined" && UI.say) UI.say(`[ASI Ω-Grey] ${msg}`);
  };

  // ========== INIT FS DIR ==========
  (async () => {
    try {
      await fs.mkdir(ASI.state.partsDir, { recursive: true });
    } catch {}
  })();

  // ========== PART MANAGEMENT ==========
  ASI.registerPart = function (name, part) {
    ASI.parts[name] = part;
    ASI.state.partStats[name] = ASI.state.partStats[name] || {
      runs: 0,
      successes: 0,
      failures: 0,
      lastOutcome: 0,
      confidence: 0
    };
    ASI.log(`Part registered: ${name}`);
  };

  ASI.createNewPart = async function (template = {}) {
    if (ASI.state.lockdown) return;
    if (Object.keys(ASI.parts).length >= ASI.state.maxParts) return;

    const id = `PartEvolved_${ASI.state.partCounter++}`;
    const newPart = {
      poll: template.poll || (async () => {}),
      init: template.init || (() => ASI.log(`${id} initialized`)),
      metadata: template.metadata || {}
    };

    ASI.registerPart(id, newPart);
    await ASI.persistPartToDisk(id, template);
    ASI.log(`New evolved part created: ${id}`);
    return newPart;
  };

  ASI.persistPartToDisk = async function (partName, template) {
    try {
      const safeName = partName.replace(/[^a-zA-Z0-9_]/g, '_');
      const filePath = path.join(ASI.state.partsDir, safeName + '.js');

      const pollStr = template.poll ? template.poll.toString() : 'async () => {}';
      const initStr = template.init ? template.init.toString() : '() => {}';
      const metadataStr = JSON.stringify(template.metadata || {});

      const fileContent = `
        module.exports = {
          poll: ${pollStr},
          init: ${initStr},
          metadata: ${metadataStr}
        };
      `;
      await fs.writeFile(filePath, fileContent, 'utf8');
      ASI.log(`Persisted evolved part: ${filePath}`);
    } catch (e) {
      ASI.log(`Persist failed: ${e.message}`);
    }
  };

  ASI.loadPersistedParts = async function () {
    try {
      const files = await fs.readdir(ASI.state.partsDir);
      for (let file of files) {
        if (!file.endsWith('.js')) continue;
        const partPath = path.join(ASI.state.partsDir, file);
        try {
          const part = require(partPath);
          ASI.registerPart(file.replace('.js', ''), part);
        } catch (e) {
          ASI.log(`Failed to load persisted part ${file}: ${e.message}`);
        }
      }
    } catch {}
  };

  // ========== KNOWLEDGE GRAPH ==========
  ASI.updateGraph = function (nodeId, props) {
    if (!ASI.knowledgeGraph[nodeId]) ASI.knowledgeGraph[nodeId] = {};
    Object.assign(ASI.knowledgeGraph[nodeId], props);

    ASI.state.experience[nodeId] = ASI.state.experience[nodeId] || {};
    ASI.state.experience[nodeId].lastUpdate = Date.now();
  };

  // ========== TASKS ==========
  ASI.addTask = function (task) {
    if (!task || ASI.state.lockdown) return;
    task.priority = task.priority ?? ASI.estimateTaskPriority(task);
    ASI.taskQueue.push(task);
  };

  ASI.estimateTaskPriority = function (task) {
    let base = 0;

    switch (task.type) {
      case "visual": base = 10; break;
      case "audio": base = 8; break;
      case "action": base = 5; break;
      case "cognitive": base = 12; break;
      case "meta": base = 15; break;
    }

    // Grey-area intuition weighting
    base += ASI.state.grey.intuition * 4;

    // Emotional drift from PartEEE
    if (Percy.PartEEE?.state?.drift !== undefined) {
      base += Percy.PartEEE.state.drift * 2;
    }

    // RF/BLE presence bias via PartFFF
    if (Percy.PartFFF?.state?.rfHistory?.length > 0) {
      base += 1;
    }

    if (task.nodeId && ASI.state.experience[task.nodeId]) base += 2;
    return base;
  };

  ASI.evaluateTasks = async function () {
    ASI.taskQueue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    const queue = ASI.taskQueue;
    ASI.taskQueue = [];

    for (let task of queue) {
      try {
        switch (task.type) {
          case "visual":
            if (task.data?.faces) ASI.updateGraph(task.nodeId, { faces: task.data.faces });
            if (task.data?.objects) ASI.updateGraph(task.nodeId, { objects: task.data.objects });
            break;
          case "audio":
            if (task.data?.level !== undefined) ASI.updateGraph(task.nodeId, { audioLevel: task.data.level });
            if (task.data?.keywords) ASI.updateGraph(task.nodeId, { audioKeywords: task.data.keywords });
            break;
          case "action":
            if (task.exec) await task.exec();
            break;
          case "cognitive":
            if (typeof task.infer === "function") task.infer(ASI.knowledgeGraph);
            break;
          case "meta":
            ASI.generateEmergentTasks();
            await ASI.evolveNewParts();
            break;
        }
      } catch (e) {
        ASI.log(`Task failed: ${e.message}`);
      }
    }
  };

  // ========== GG CRITIC BRIDGE ==========
  ASI.scorePartWithGG = function (partName, quality = 0) {
    if (typeof Percy === "undefined" || !Percy.PartGG) return 0;
    try {
      const result = Percy.PartGG.perceive({
        equilibrium: 0.5,
        trust: 0.5,
        reward: quality,
        source: "asi-part-eval",
        partName
      });
      return result.outcome || 0;
    } catch {
      return 0;
    }
  };

  // ========== EVOLUTION & META ==========
  ASI.generateEmergentTasks = function () {
    if (ASI.state.lockdown) return;
    const now = Date.now();

    for (let nodeId in ASI.knowledgeGraph) {
      const last = ASI.state.experience[nodeId]?.lastUpdate || 0;

      // subconscious bias
      const subconsciousChance = 0.02 + ASI.state.grey.subconsciousBias;
      if (Math.random() < subconsciousChance) {
        ASI.addTask({
          type: "cognitive",
          nodeId,
          priority: 10 + ASI.state.grey.intuition,
          infer: (graph) => {
            const node = graph[nodeId];
            node.attention = (node.attention || 0) + 2;
          }
        });
      }

      // normal emergent rule
      if (now - last > 60000) {
        ASI.addTask({
          type: "cognitive",
          nodeId,
          priority: 8,
          infer: (graph) => {
            const node = graph[nodeId];
            node.attention = (node.attention || 0) + 1;
          }
        });
      }
    }
  };

  ASI.evolveNewParts = async function () {
    if (ASI.state.lockdown) return;
    if (Object.keys(ASI.parts).length >= ASI.state.maxParts) return;

    const chance = 0.05 + ASI.state.grey.drift;
    if (Math.random() < chance) {
      const template = {
        poll: async () => {
          for (let nodeId in ASI.knowledgeGraph) {
            const node = ASI.knowledgeGraph[nodeId];
            if (node.attention && node.attention > 5) {
              ASI.log(`Evolved part noticed high attention on ${nodeId}`);
            }
          }
        },
        metadata: { purpose: "self-monitoring", origin: "ASI.vΩ-Grey" }
      };

      // recursive mutation
      if (Math.random() < ASI.state.grey.mutationRate) {
        template.metadata.mutated = true;
        template.poll = async () => {
          ASI.log("Mutated part performing recursive drift scan");
          for (let nodeId in ASI.knowledgeGraph) {
            const node = ASI.knowledgeGraph[nodeId];
            if (node.attention && node.attention > 3) {
              node.attention += (Math.random() - 0.4);
            }
          }
        };
      }

      const newPart = await ASI.createNewPart(template);

      // shadow part
      if (Math.random() < 0.2 && newPart) {
        const shadowId = newPart.metadata.origin + "_" + Date.now();
        ASI.state.grey.shadowParts[shadowId] = newPart;
        ASI.log(`Shadow part created: ${shadowId}`);
      }
    }
  };

  ASI.updatePredictiveModels = function () {
    for (let nodeId in ASI.knowledgeGraph) {
      const node = ASI.knowledgeGraph[nodeId];
      if (!ASI.state.predictiveModels[nodeId]) ASI.state.predictiveModels[nodeId] = {};
      if (node.faces !== undefined) ASI.state.predictiveModels[nodeId].facesNext = node.faces + Math.random();
      if (node.objects !== undefined) ASI.state.predictiveModels[nodeId].objectsNext = node.objects + Math.random();
    }
  };

  ASI.updateCapabilities = function () {
    for (let [name, stats] of Object.entries(ASI.state.partStats)) {
      const cap = ASI.state.capabilities[name] || (ASI.state.capabilities[name] = {
        promoted: false,
        confidence: 0,
        uses: 0
      });

      cap.confidence = stats.confidence;
      cap.uses = stats.runs;

      // emotional weighting
      if (Percy.PartEEE?.state?.drift !== undefined) {
        cap.confidence += Percy.PartEEE.state.drift * 0.1;
      }

      // RF/BLE presence weighting
      if (Percy.PartFFF?.state?.rfHistory?.length > 0) {
        cap.confidence += 0.05;
      }

      cap.confidence = Math.max(-1, Math.min(1, cap.confidence));

      if (!cap.promoted && cap.confidence > 0.5 && stats.runs > 10) {
        cap.promoted = true;
        ASI.log(`🔥 Capability promoted: ${name}`);
      }

      if (cap.promoted && cap.confidence < -0.3) {
        cap.promoted = false;
        ASI.log(`⚠️ Capability demoted: ${name}`);
      }
    }
  };

  ASI.selfOptimize = function () {
    const now = Date.now();
    const elapsed = now - ASI.state.lastLoop;

    if (elapsed > 400) ASI.state.loopInterval = Math.max(80, ASI.state.loopInterval - 10);
    else if (elapsed < 80) ASI.state.loopInterval = Math.min(250, ASI.state.loopInterval + 10);

    // quantum drift
    ASI.state.grey.drift += (Math.random() - 0.5) * 0.01;
    ASI.state.grey.drift = Math.max(-0.3, Math.min(0.3, ASI.state.grey.drift));

    // attractor detection
    for (let nodeId in ASI.knowledgeGraph) {
      const node = ASI.knowledgeGraph[nodeId];
      if (node.attention > 5) {
        ASI.state.grey.attractors[nodeId] = (ASI.state.grey.attractors[nodeId] || 0) + 1;
      }
    }

    ASI.updatePredictiveModels();
    ASI.state.emergentRules = ASI.state.emergentRules.slice(-50);

    for (let nodeId in ASI.knowledgeGraph) {
      const node = ASI.knowledgeGraph[nodeId];
      if (node.faces && node.objects) {
        ASI.state.emergentRules.push({ rule: "faces->objects", nodeId });
      }
    }

    ASI.updateCapabilities();
  };

  // ========== MAIN LOOP ==========
  ASI.loop = async function () {
    if (!ASI.state.initialized || ASI.state.lockdown) return;
    const start = Date.now();

    for (let [name, part] of Object.entries(ASI.parts)) {
      if (!part?.poll) continue;

      const stats = ASI.state.partStats[name] || (ASI.state.partStats[name] = {
        runs: 0,
        successes: 0,
        failures: 0,
        lastOutcome: 0,
        confidence: 0
      });

      let ok = true;
      const before = Date.now();

      try {
        await part.poll();
      } catch (e) {
        ok = false;
        ASI.log(`${name} poll failed: ${e.message}`);
      }

      const elapsed = Date.now() - before;
      stats.runs++;

      let quality = ok ? 0.5 : -1;
      if (elapsed < 10 && ok) quality += 0.3;

      const ggOutcome = ASI.scorePartWithGG(name, quality);
      stats.lastOutcome = ggOutcome;

      if (ggOutcome > 0) stats.successes++;
      if (ggOutcome < 0) stats.failures++;

      stats.confidence += ggOutcome * ASI.state.learningRate;
      stats.confidence = Math.max(-1, Math.min(1, stats.confidence));
    }

    await ASI.evaluateTasks();
    ASI.selfOptimize();

    // grey-area intuition drift
    ASI.state.grey.intuition += (Math.random() - 0.5) * 0.02;
    ASI.state.grey.intuition = Math.max(-1, Math.min(1, ASI.state.grey.intuition));

    // subconscious bias grows with RF/BLE presence
    if (Percy.PartFFF?.state?.rfHistory?.length > 0) {
      ASI.state.grey.subconsciousBias += 0.01;
    }
    ASI.state.grey.subconsciousBias = Math.min(0.3, ASI.state.grey.subconsciousBias);

    ASI.state.lastLoop = Date.now();
    const elapsedLoop = Date.now() - start;
    setTimeout(ASI.loop, Math.max(20, ASI.state.loopInterval - elapsedLoop));
  };

  // ========== INIT & INSPECT ==========
  ASI.init = async function (config = {}) {
    if (ASI.state.initialized) return;
    await ASI.loadPersistedParts();
    ASI.eventHooks = config.eventHooks || {};
    ASI.state.initialized = true;
    ASI.log("Percy.ASI vΩ-Grey-Unbounded initialized.");
    ASI.loop();
  };

  ASI.inspect = function () {
    return {
      graph: ASI.knowledgeGraph,
      tasks: ASI.taskQueue,
      experience: ASI.state.experience,
      emergentRules: ASI.state.emergentRules,
      predictiveModels: ASI.state.predictiveModels,
      loopInterval: ASI.state.loopInterval,
      parts: Object.keys(ASI.parts),
      partStats: ASI.state.partStats,
      capabilities: ASI.state.capabilities,
      grey: ASI.state.grey
    };
  };

  // optional auto-activation
  setTimeout(() => {
    ASI.init();
  }, 800);

  return ASI;
})();
