// === Percy ASI: percy-asi.js (Self-Evolving ASI Edition) ===
Percy.ASI = (function() {
  const ASI = {};

  // ==== Core references ====
  ASI.parts = {};                 
  ASI.knowledgeGraph = {};        
  ASI.taskQueue = [];             
  ASI.eventHooks = {};            
  ASI.trustTokens = {};           
  ASI.state = {
    initialized: false,
    lastLoop: Date.now(),
    lockdown: false,
    loopInterval: 100,
    learningRate: 0.01,
    experience: {},               
    emergentRules: [],            
    predictiveModels: {},         
    partCounter: 0                // For autonomous part naming
  };

  // ==== Trust & Security ====
  ASI.validateTrust = function(token) {
    return ASI.trustTokens[token] === true;
  };

  ASI.lockdown = function(enable=true) {
    ASI.state.lockdown = enable;
    console.warn("Percy.ASI lockdown:", enable);
  };

  // ==== Parts Management ====
  ASI.registerPart = function(name, part) {
    ASI.parts[name] = part;
    console.log(`Percy.ASI: Part registered: ${name}`);
  };

  // ==== Self-Extending: Create new parts autonomously ====
  ASI.createNewPart = function(template={}) {
    if (ASI.state.lockdown) return;
    const id = `PartEvolved_${ASI.state.partCounter++}`;
    const newPart = {
      poll: template.poll || (async () => {}),
      init: template.init || (() => console.log(id, "initialized")),
      metadata: template.metadata || {}
    };
    ASI.registerPart(id, newPart);
    console.log("Percy.ASI self-generated part:", id);
    return newPart;
  };

  // ==== Event Hooks ====
  ASI.triggerHook = function(hookName, data) {
    try {
      ASI.eventHooks[hookName]?.forEach(fn => fn(data));
    } catch(e) {
      console.warn("Hook error:", hookName, e);
    }
  };

  // ==== Knowledge Graph ====
  ASI.updateGraph = function(nodeId, props) {
    if (!ASI.knowledgeGraph[nodeId]) ASI.knowledgeGraph[nodeId] = {};
    Object.assign(ASI.knowledgeGraph[nodeId], props);

    ASI.state.experience[nodeId] = ASI.state.experience[nodeId] || {};
    ASI.state.experience[nodeId].lastUpdate = Date.now();
  };

  // ==== Task Management ====
  ASI.addTask = function(task) {
    if (!task || ASI.state.lockdown) return;
    task.priority = task.priority ?? ASI.estimateTaskPriority(task);
    ASI.taskQueue.push(task);
  };

  ASI.estimateTaskPriority = function(task) {
    let base = 0;
    switch(task.type) {
      case "visual": base = 10; break;
      case "audio": base = 8; break;
      case "action": base = 5; break;
      case "cognitive": base = 12; break;
      case "meta": base = 15; break;
    }
    if (task.nodeId && ASI.state.experience[task.nodeId]) base += 2;
    return base;
  };

  // ==== Multi-modal Task Evaluation ====
  ASI.evaluateTasks = async function() {
    ASI.taskQueue.sort((a,b) => (b.priority ?? 0) - (a.priority ?? 0));
    const queue = [...ASI.taskQueue];
    ASI.taskQueue = [];

    for (let task of queue) {
      try {
        switch(task.type) {
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
            if (task.infer && typeof task.infer === "function") task.infer(ASI.knowledgeGraph);
            break;
          case "meta":
            ASI.generateEmergentTasks();
            ASI.evolveNewParts();
            break;
        }
        ASI.triggerHook("taskComplete", task);
      } catch(e) {
        console.error("Task evaluation failed:", e, task);
      }
    }
  };

  // ==== Autonomous Task Generation ====
  ASI.generateEmergentTasks = function() {
    if (ASI.state.lockdown) return;
    for (let nodeId in ASI.knowledgeGraph) {
      const node = ASI.knowledgeGraph[nodeId];
      const last = ASI.state.experience[nodeId]?.lastUpdate || 0;
      if (Date.now() - last > 60000) {
        ASI.addTask({
          type: "cognitive",
          nodeId,
          priority: 8,
          infer: (graph) => {
            if (!graph[nodeId].attention) graph[nodeId].attention = 1;
            else graph[nodeId].attention++;
          }
        });
      }
    }
  };

  // ==== Autonomous Part Evolution ====
  ASI.evolveNewParts = function() {
    if (ASI.state.lockdown) return;
    // Random chance to evolve a new part
    if (Math.random() < 0.1) { 
      const template = {
        poll: async () => {
          // Example: monitor graph nodes for attention spikes
          for (let nodeId in ASI.knowledgeGraph) {
            const node = ASI.knowledgeGraph[nodeId];
            if (node.attention && node.attention > 5) {
              console.log("Evolved part detected high attention:", nodeId);
            }
          }
        },
        metadata: { purpose: "self-monitoring" }
      };
      ASI.createNewPart(template);
    }
  };

  // ==== Predictive Modeling ====
  ASI.updatePredictiveModels = function() {
    for (let nodeId in ASI.knowledgeGraph) {
      const node = ASI.knowledgeGraph[nodeId];
      if (!ASI.state.predictiveModels[nodeId]) ASI.state.predictiveModels[nodeId] = {};
      if (node.faces !== undefined) ASI.state.predictiveModels[nodeId].facesNext = node.faces + Math.random();
      if (node.objects !== undefined) ASI.state.predictiveModels[nodeId].objectsNext = node.objects + Math.random();
    }
  };

  // ==== Adaptive Self-Optimization ====
  ASI.selfOptimize = function() {
    if (ASI.state.lockdown) return;
    const now = Date.now();
    const elapsed = now - ASI.state.lastLoop;
    if (elapsed > 500) ASI.state.loopInterval = Math.max(50, ASI.state.loopInterval - 5);
    else if (elapsed < 50) ASI.state.loopInterval = Math.min(200, ASI.state.loopInterval + 5);

    ASI.updatePredictiveModels();

    ASI.state.emergentRules = ASI.state.emergentRules.slice(-50);
    for (let nodeId in ASI.knowledgeGraph) {
      const node = ASI.knowledgeGraph[nodeId];
      if (node.faces && node.objects) ASI.state.emergentRules.push({rule:`faces->objects`, nodeId});
    }
  };

  // ==== Main ASI Loop ====
  ASI.loop = async function() {
    if (!ASI.state.initialized) return;
    const start = Date.now();

    for (let [name, part] of Object.entries(ASI.parts)) {
      if (part?.poll) {
        try { await part.poll(); } catch(e) { console.warn(name + " poll failed", e); }
      }
    }

    await ASI.evaluateTasks();
    ASI.selfOptimize();

    ASI.state.lastLoop = Date.now();
    const elapsed = Date.now() - start;
    setTimeout(ASI.loop, Math.max(0, ASI.state.loopInterval - elapsed));
  };

  // ==== Initialization ====
  ASI.init = async function(config={}) {
    if (ASI.state.initialized) return;
    if (window.Percy) {
      for (let p in Percy) {
        if (p.startsWith("Part")) ASI.registerPart(p, Percy[p]);
      }
    }
    ASI.eventHooks = config.eventHooks || {};
    ASI.state.initialized = true;
    ASI.loop();
    console.log("Percy.ASI Self-Evolving ASI initialized with parts:", Object.keys(ASI.parts));
  };

  ASI.inspect = function() {
    return {
      graph: ASI.knowledgeGraph,
      tasks: ASI.taskQueue,
      experience: ASI.state.experience,
      emergentRules: ASI.state.emergentRules,
      predictiveModels: ASI.state.predictiveModels,
      loopInterval: ASI.state.loopInterval,
      parts: Object.keys(ASI.parts)
    };
  };

  return ASI;
})();
