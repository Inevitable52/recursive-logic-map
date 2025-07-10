// Percy Phase 2 Upgrade Guide
// ==============================
// This outlines every step you need to advance Percy into its next intelligent form
// Includes: nested recursion layout, zoom + font scaling, logic token protection, live console, interpreter

// STEP 1: NESTED INNER RING (G201–G300)
// -------------------------------------
// Add this logic to percy.js in `createNodes()` after the existing node layout

function layoutNestedRing(startId, endId, radiusOffset, colorClass) {
  const innerSeeds = Object.entries(seeds).filter(([id]) => {
    const num = parseInt(id.replace("G", ""));
    return num >= startId && num <= endId;
  });
  const innerTotal = innerSeeds.length;
  innerSeeds.forEach(([filename, data], i) => {
    const node = document.createElement('div');
    node.classList.add('node', colorClass); // Add blue style class
    node.textContent = filename;
    node.title = data.message;

    const angle = (i / innerTotal) * 2 * Math.PI;
    const r = (Math.min(logicMap.clientWidth, logicMap.clientHeight) / 3) - radiusOffset;
    const x = logicMap.clientWidth / 2 + r * Math.cos(angle) - 25;
    const y = logicMap.clientHeight / 2 + r * Math.sin(angle) - 15;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    // Add click behavior
    node.addEventListener('click', () => percyRespond(filename, data));

    logicMap.appendChild(node);
  });
}

// Call it in `createNodes()`
layoutNestedRing(201, 300, 80, 'blue-ring');

// In CSS:
// .blue-ring { background: #3a86ff; box-shadow: 0 0 8px #3a86ff; color: white; }


// STEP 2: ZOOM + FONT SCALE ADJUST
// ---------------------------------
// Add zoom buttons in HTML under <main>
// <div class="zoom-controls">
//   <button onclick="zoomLogic(1.2)">Zoom In</button>
//   <button onclick="zoomLogic(0.8)">Zoom Out</button>
// </div>

// Add in JS:
let zoomLevel = 1;
function zoomLogic(factor) {
  zoomLevel *= factor;
  logicMap.style.transform = `scale(${zoomLevel})`;
  logicMap.style.transformOrigin = 'center';
  document.querySelectorAll('.node').forEach(n => {
    n.style.fontSize = `${12 * (1 / zoomLevel)}px`;
  });
}


// STEP 3: UNIVERSAL LOGIC TOKEN PROTECTION
// ----------------------------------------
// Add logic check inside percyRespond()
function percyRespond(id, data) {
  const messageBox = document.getElementById('percy-message');
  messageBox.textContent = data.message;

  const consoleBox = document.getElementById('percy-console');
  const line = document.createElement('p');
  line.className = 'console-line';
  line.textContent = `↳ ${data.message}`;
  consoleBox.appendChild(line);

  if (data.data?.security_token === true) {
    const warn = document.createElement('p');
    warn.className = 'console-line';
    warn.textContent = '🔐 Logic Token Protected — Access Requires Verification.';
    consoleBox.appendChild(warn);
  }

  if (data.data?.redirect_on_logic_violation) {
    const redir = document.createElement('p');
    redir.className = 'console-line';
    redir.textContent = `⚠ Redirection triggered: logic violation → ${data.data.redirect_on_logic_violation}`;
    consoleBox.appendChild(redir);
  }

  consoleBox.scrollTop = consoleBox.scrollHeight;
}


// STEP 4: ERRAND-TRIGGERED NODE RESPONSES (RNGC)
// ----------------------------------------------
// Example: G250 is an errand-type command
// JSON:
/*
{
  "id": "G250",
  "message": "Check for inconsistent logic across G088, G122, and G197.",
  "type": "errand",
  "data": {
    "trigger": "logic_audit",
    "target_nodes": ["G088", "G122", "G197"]
  }
}
*/
// Inside percyRespond(), add:
if (data.type === 'errand' && data.data?.trigger === 'logic_audit') {
  const auditLine = document.createElement('p');
  auditLine.className = 'console-line';
  auditLine.textContent = `🧠 Percy audit initiated: Checking ${data.data.target_nodes.join(", ")}`;
  consoleBox.appendChild(auditLine);
}


// STEP 5: LIVE INTERPRETER
// -------------------------
// At the bottom of your site, add this HTML
// <div id="interpreter-box">
//   <input id="interpreter-input" placeholder="Ask Percy...">
//   <button onclick="interpretLogic()">Ask</button>
// </div>

// Add in JS:
function interpretLogic() {
  const input = document.getElementById('interpreter-input').value;
  const consoleBox = document.getElementById('percy-console');
  const response = document.createElement('p');
  response.className = 'console-line';

  // Simple response logic for now
  if (input.toLowerCase().includes("recursion")) {
    response.textContent = `🧠 Percy replies: Recursion must always return to its logical base.`;
  } else {
    response.textContent = `🧠 Percy ponders: I am still learning how to interpret that...`;
  }

  consoleBox.appendChild(response);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}
