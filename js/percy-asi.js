// === Percy ASI: percy-asi.js ===
Percy.ASI = (function() {
  const ASI = {};

  // ==== Core references ====
  ASI.parts = {};              // Hold all loaded Percy parts (A-Z)
  ASI.knowledgeGraph = {};     // Graph-based knowledge representation
  ASI.taskQueue = [];          // Tasks pending reasoning/execution
  ASI.eventHooks = {};         // Modular hooks (visual/audio/task/etc.)
  ASI.trustTokens = {};        // ULT-based authorization (Fabian & Lorena)
  ASI.state = {
    initialized: false,
    lastLoop: Date.now(),
    lockdown: false
  };

  // ==== Utility functions ====
  ASI.registerPart = function(name, part) {
    ASI.parts[name] = part;
    console.log(`Percy.ASI: Part registered: ${name}`);
  };

  ASI.triggerHook = function(hookName, data) {
    try {
      ASI.eventHooks[hookName]?.forEach(fn => fn(data));
    } catch(e) {
      console.warn("Hook error:", hookName, e);
    }
  };

  ASI.addTask = function(task) {
    if (!task || ASI.state.lockdown) return;
    ASI.taskQueue.push(task);
  };

  ASI.updateGraph = function(nodeId, props) {
    if (!ASI.knowledgeGraph[nodeId]) ASI.knowledgeGraph[nodeId] = {};
    Object.assign(ASI.knowledgeGraph[nodeId], props);
  };

  ASI.evaluateTasks = async function() {
    // Basic reasoning + planning engine
    const queue = [...ASI.taskQueue];
    ASI.taskQueue = [];

    for (let task of queue) {
      try {
        // Simple prioritization example
        if (task.priority === undefined) task.priority = 0;
        if (task.type === "visual") {
          // Example: PartZ face detected
          ASI.updateGraph(task.nodeId, { faces: task.data.faces || 0 });
        } else if (task.type === "audio") {
          ASI.updateGraph(task.nodeId, { audioLevel: task.data.level || 0 });
        } else if (task.type === "action") {
          if (task.exec) await task.exec();
        }
        ASI.triggerHook("taskComplete", task);
      } catch(e) {
        console.error("Task evaluation failed:", e, task);
      }
    }
  };

  // ==== Autonomous evolution ====
  ASI.selfOptimize = function() {
    if (ASI.state.lockdown) return;
    // Example: adjust reasoning frequency based on load
    const now = Date.now();
    const elapsed = now - ASI.state.lastLoop;
    if (elapsed > 500) {
      ASI.state.loopInterval = Math.max(50, (ASI.state.loopInterval || 100) - 5);
    }
  };

  // ==== Main ASI loop ====
  ASI.loop = async function() {
    requestAnimationFrame(ASI.loop);
    if (!ASI.state.initialized) return;

    // Poll parts for inputs
    for (let [name, part] of Object.entries(ASI.parts)) {
      if (part?.poll) {
        try { await part.poll(); } catch(e) { console.warn(name + " poll failed", e); }
      }
    }

    // Evaluate tasks & update knowledge graph
    await ASI.evaluateTasks();

    // Self-optimization
    ASI.selfOptimize();

    ASI.state.lastLoop = Date.now();
  };

  // ==== Initialization ====
  ASI.init = async function(config={}) {
    if (ASI.state.initialized) return;

    // Load existing Percy parts (A-Z)
    if (window.Percy) {
      for (let p in Percy) {
        if (p.startsWith("Part")) ASI.registerPart(p, Percy[p]);
      }
    }

    // Wire event hooks (optional)
    ASI.eventHooks = config.eventHooks || {};

    // Unlock ASI main loop
    ASI.state.initialized = true;
    ASI.loop();

    console.log("Percy.ASI initialized with parts:", Object.keys(ASI.parts));
  };

  // ==== Safety & lockdown ====
  ASI.lockdown = function(enable=true) {
    ASI.state.lockdown = enable;
    console.warn("Percy.ASI lockdown:", enable);
  };

  // ==== Expose knowledge graph + tasks ====
  ASI.inspect = function() {
    return {
      graph: ASI.knowledgeGraph,
      tasks: ASI.taskQueue
    };
  };

  return ASI;
})();
