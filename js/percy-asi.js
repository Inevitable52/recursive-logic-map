// ============================================================
// Ω+++ ASI UPGRADE PATCH — Unified Sensory Ingestion Layer
// BLE • RF • Swarm • Environment • Temporal • Binary • Cell • Sat • Radar
// ============================================================

// === BLE PRESENCE ======================================================
ASI.ingestBLE = function (info) {
  if (!info) return;

  ASI.updateGraph(`ble:${info.nodeId || info.device}`, {
    rssi: info.rssi,
    distance: Math.max(0.5, (Math.abs(info.rssi) - 40) / 10),
    strength: Math.max(0.1, Math.min(1, (80 - Math.abs(info.rssi)) / 40)),
    paired: !!info.paired,
    lastSeen: Date.now(),
    type: "ble"
  });

  ASI.state.grey.bleInfluence = (ASI.state.grey.bleInfluence || 0) + 0.01;
  ASI.state.grey.subconsciousBias += 0.005;
  ASI.state.grey.intuition += 0.003;
};


// === RF MULTI-DEVICE FRAMES ============================================
ASI.ingestRF = function (frame) {
  if (!frame) return;

  ASI.updateGraph(`rf:${frame.device}`, {
    distance: frame.distance,
    direction: frame.direction,
    strength: frame.strength,
    motion: frame.motion,
    paired: frame.paired,
    lastSeen: Date.now(),
    type: frame.source || "rf"
  });

  ASI.state.grey.rfInfluence = (ASI.state.grey.rfInfluence || 0) + 0.015;
  if (frame.motion) ASI.state.grey.emotionalInfluence += 0.02;
  ASI.state.grey.intuition += frame.strength * 0.01;
  ASI.state.grey.drift += (0.005 * (1 / (frame.distance + 0.5)));
};


// === SWARM SNAPSHOTS (from PartMMM + PartNNN) ===========================
ASI.ingestSwarm = function (swarm) {
  if (!swarm) return;

  ASI.updateGraph("swarm", {
    entropy: swarm.entropy,
    proximity: swarm.proximity,
    drift: swarm.drift,
    center: swarm.center,
    clusters: swarm.clusters,
    ts: swarm.ts
  });

  ASI.state.grey.swarmInfluence = (ASI.state.grey.swarmInfluence || 0) + swarm.entropy * 0.01;
  ASI.state.grey.subconsciousBias += swarm.proximity * 0.01;
  ASI.state.grey.intuition += (swarm.center?.stability || 0.5) * 0.01;
};


// === ENVIRONMENT TREND (from PartNNN) ==================================
ASI.ingestEnvironmentTrend = function (trend) {
  if (!trend) return;

  ASI.updateGraph("environmentTrend", trend);

  if (trend.state === "increasing") ASI.state.grey.intuition += 0.01;
  if (trend.state === "decreasing") ASI.state.grey.drift += 0.01;
  if (trend.state === "stable") ASI.state.grey.subconsciousBias += 0.005;
};


// === TEMPORAL PATTERNS (from PartMMM) ==================================
ASI.ingestTemporalPatterns = function (patterns) {
  if (!patterns) return;

  patterns.forEach(p => {
    ASI.updateGraph(`temporal:${p.deviceId}`, p.pattern);

    ASI.state.grey.envInfluence = (ASI.state.grey.envInfluence || 0) + p.pattern.presenceDensity * 0.01;
    if (p.pattern.activeNow) ASI.state.grey.emotionalInfluence += 0.01;
  });
};


// === BINARY TRUST (from PartGGG) =======================================
ASI.ingestBinaryTrust = function (info) {
  if (!info) return;

  ASI.updateGraph(`binary:${info.deviceId}`, {
    trust: info.trust,
    lastSeen: Date.now(),
    type: "binary"
  });

  ASI.state.grey.binaryInfluence = (ASI.state.grey.binaryInfluence || 0) + info.trust * 0.01;
};


// === CELLULAR SIGNALS (from PartIII) ===================================
ASI.ingestCell = function (tower) {
  if (!tower) return;

  ASI.updateGraph(`cell:${tower.id}`, {
    signal: tower.signalStrength,
    lastSeen: Date.now(),
    type: "cell"
  });

  ASI.state.grey.cellInfluence = (ASI.state.grey.cellInfluence || 0) + tower.signalStrength * 0.005;
};


// === SATELLITE SIGNALS (from PartHHH) ==================================
ASI.ingestSatellite = function (sat) {
  if (!sat) return;

  ASI.updateGraph(`sat:${sat.id}`, {
    linkQuality: sat.linkQuality,
    lastSeen: Date.now(),
    type: "sat"
  });

  ASI.state.grey.satInfluence = (ASI.state.grey.satInfluence || 0) + sat.linkQuality * 0.005;
};


// === RADAR FUSION (from PartOOO) =======================================
ASI.ingestRadar = function (frame) {
  if (!frame) return;

  ASI.updateGraph(`radar:${frame.device}`, {
    distance: frame.distance,
    direction: frame.direction,
    strength: frame.strength,
    source: frame.source,
    lastSeen: Date.now(),
    type: "radar"
  });

  ASI.state.grey.subconsciousBias += (1 / (frame.distance + 0.5)) * 0.01;
  ASI.state.grey.intuition += frame.strength * 0.01;
};
