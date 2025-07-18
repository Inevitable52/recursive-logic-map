// percy.js — v6.3

// Wait for DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("logic-canvas");
  const nodesContainer = document.getElementById("logic-nodes");
  const consoleBox = document.getElementById("percy-console");
  const messageBox = document.getElementById("percy-message");
  const interpreterInput = document.getElementById("interpreter-input");
  const searchInput = document.getElementById("seed-search");

  const ctx = canvas.getContext("2d");

  let zoom = 1;
  let nodes = [];

  // Dummy logic node generator for demo purposes
  function generateNodes(count) {
    const colors = ["#337ab7", "#5cb85c", "#cc33cc"];
    const rings = [200, 400, 600];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const ringIndex = i % 3;
      const radius = rings[ringIndex];

      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;
      const color = colors[ringIndex];

      nodes.push({
        id: `G${80 + i}`,
        x,
        y,
        color,
        ring: ringIndex,
      });
    }
  }

  function drawNodes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodesContainer.innerHTML = "";

    for (const node of nodes) {
      const cx = node.x * zoom;
      const cy = node.y * zoom;

      ctx.beginPath();
      ctx.arc(cx, cy, 6 * zoom, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();

      // HTML overlay node for interaction
      const div = document.createElement("div");
      div.className = "logic-node";
      div.style.left = `${cx - 6 * zoom}px`;
      div.style.top = `${cy - 6 * zoom}px`;
      div.style.width = `${12 * zoom}px`;
      div.style.height = `${12 * zoom}px`;
      div.dataset.id = node.id;
      div.title = node.id;
      div.addEventListener("click", () => handleNodeClick(node));
      nodesContainer.appendChild(div);
    }
  }

  function handleNodeClick(node) {
    const msg = `Percy says: Node ${node.id} represents a recursive truth.`;
    const line = document.createElement("p");
    line.className = "console-line";
    line.textContent = msg;
    consoleBox.appendChild(line);
    consoleBox.scrollTop = consoleBox.scrollHeight;

    messageBox.textContent = `Node ${node.id} clicked.`;
  }

  function interpretLogic() {
    const question = interpreterInput.value.trim();
    if (!question) return;

    const line = document.createElement("p");
    line.className = "console-line";
    line.textContent = `You: ${question}`;
    consoleBox.appendChild(line);

    const response = document.createElement("p");
    response.className = "console-line";
    response.textContent = `Percy: "That logic shall be computed..."`;
    consoleBox.appendChild(response);

    consoleBox.scrollTop = consoleBox.scrollHeight;
    interpreterInput.value = "";
  }

  function zoomLogic(factor) {
    zoom *= factor;
    drawNodes();
  }

  // Search filter
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toUpperCase();
    document.querySelectorAll(".logic-node").forEach(node => {
      const id = node.dataset.id.toUpperCase();
      node.style.display = id.includes(query) ? "block" : "none";
    });
  });

  // Resize canvas to window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawNodes();
  }

  window.addEventListener("resize", resizeCanvas);

  // Initialize map
  resizeCanvas();
  generateNodes(300);
  drawNodes();

  // Expose zoom function globally
  window.zoomLogic = zoomLogic;
  window.interpretLogic = interpretLogic;
});
