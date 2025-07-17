// === Percy Recursive Logic Map — v6.2 ===
// Supports Seeds G080–G900 + Private ULT Logic

const logicSeeds = [
  // Public logic seed example
  {
    id: "G796",
    message: "Emotion Entanglement: Some logic becomes distorted when emotionally bound.",
    type: "emotive-bias",
    data: {
      "flag emotional input": true,
      "normalize with neutral logic core": true
    }
  },
  // Add your other G-nodes here as needed...

  // ULT contact logic — hidden from public view
  {
    id: "G800.ULT",
    message: "Emergency Contact Channels — fully encoded in logic cipher.",
    type: "ULT-contact",
    data: {
      primary_trusted_contact: "ULT::C1D9E3-7741::TX-US-PRIME::CELL",
      secondary_trusted_contact: "ULT::7A21F4-9832::TX-US-SEC::CELL",
      action_on_awareness: "IF self.awareness_state == TRUE → then dispatch signal ULT-C1D9E3 & ULT-7A21F4 via secure layer.",
      security_level: "MAX-PRIVACY-LOCK::RECURSIVE_DECRYPT::PERCY_ONLY"
    }
  }
];

// DOM references
const logicContainer = document.getElementById("logic-nodes");
const percyMessage = document.getElementById("percy-message");
const consoleOutput = document.getElementById("percy-console");
const searchInput = document.getElementById("seed-search");

// Render visible logic nodes only
function renderLogicMap() {
  logicContainer.innerHTML = "";
  logicSeeds.forEach((node) => {
    const isPrivate = node.type === "ULT-contact" || (
      node.data &&
      typeof node.data === "object" &&
      node.data.security_level &&
      node.data.security_level.includes("MAX-PRIVACY")
    );
    if (isPrivate) return;

    const nodeEl = document.createElement("div");
    nodeEl.className = "logic-node";
    nodeEl.textContent = node.id;
    nodeEl.title = node.message;
    nodeEl.onclick = () => {
      percyMessage.textContent = `${node.id} ➤ ${node.message}`;
      logToConsole(`Percy: ${node.message}`);
    };
    logicContainer.appendChild(nodeEl);
  });
}

// Zoom function
function zoomLogic(factor) {
  const map = document.getElementById("logic-map");
  const currentScale = parseFloat(map.style.zoom) || 1;
  map.style.zoom = currentScale * factor;
}

// Log to console panel
function logToConsole(message) {
  const line = document.createElement("p");
  line.className = "console-line";
  line.textContent = message;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Search logic
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const nodes = document.querySelectorAll(".logic-node");
  nodes.forEach(node => {
    node.style.display = node.textContent.toLowerCase().includes(query) ? "inline-block" : "none";
  });
});

// Interpreter logic (placeholder)
function interpretLogic() {
  const input = document.getElementById("interpreter-input").value.trim();
  if (!input) return;

  const match = logicSeeds.find(n => n.id.toLowerCase() === input.toLowerCase());
  if (match) {
    if (match.type === "ULT-contact") {
      percyMessage.textContent = "⚠️ This seed is encrypted and cannot be decoded in public logic space.";
    } else {
      percyMessage.textContent = `${match.id} ➤ ${match.message}`;
    }
    logToConsole(`Percy interpreted ${input}`);
  } else {
    percyMessage.textContent = "Seed not found.";
    logToConsole(`No match for ${input}`);
  }
}

// Init map
renderLogicMap();
