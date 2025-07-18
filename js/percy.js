document.addEventListener("DOMContentLoaded", async () => {
  const logicMap = document.getElementById("logic-map");
  const logicNodes = document.getElementById("logic-nodes");
  const messageBox = document.getElementById("percy-message");
  const consoleBox = document.getElementById("percy-console");
  const searchInput = document.getElementById("search-input");

  // === Animated canvas background ===
  const canvas = document.createElement("canvas");
  canvas.id = "logic-canvas";
  logicMap.prepend(canvas);
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = logicMap.offsetWidth;
    canvas.height = logicMap.offsetHeight;
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.002;

    for (let i = 0; i < canvas.width; i += 50) {
      const y = 30 * Math.sin(i * 0.01 + time) + canvas.height / 2;
      ctx.beginPath();
      ctx.arc(i, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(140, 255, 255, 0.25)";
      ctx.fill();
    }

    requestAnimationFrame(animateCanvas);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  animateCanvas();

  // === Dynamic logic nodes loading ===
  const logicData = [];
  for (let i = 80; i <= 800; i++) {
    const id = i < 100 ? `G0${i}` : `G${i}`;
    logicData.push({ id, label: id, ult: false });
  }

  // Manually append ULT-protected seeds (e.g., G800.ULT)
  logicData.push({ id: "G800.ULT", label: "G800.ULT", ult: true });

  // Layout configuration
  const rings = [
    { start: 80, end: 100, radius: 100, color: "#88f" },
    { start: 101, end: 200, radius: 160, color: "#8f8" },
    { start: 201, end: 300, radius: 220, color: "#ff8" },
    { start: 301, end: 400, radius: 280, color: "#f88" },
    { start: 401, end: 500, radius: 340, color: "#f8f" },
    { start: 501, end: 600, radius: 400, color: "#8ff" },
    { start: 601, end: 700, radius: 460, color: "#ccc" },
    { start: 701, end: 800, radius: 520, color: "#c8f" }
  ];

  logicData.forEach((node, index) => {
    const el = document.createElement("div");
    el.className = "logic-node";
    el.textContent = node.label;
    el.dataset.id = node.id;

    if (node.ult) el.classList.add("ult");

    // Get ring configuration
    let ring = rings.find(r => {
      const num = parseInt(node.id.replace(/[^\d]/g, ""));
      return num >= r.start && num <= r.end;
    });

    const angle = (index / logicData.length) * 2 * Math.PI;
    const radius = ring ? ring.radius : 600;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    el.style.left = `calc(50% + ${x}px)`;
    el.style.top = `calc(50% + ${y}px)`;
    if (ring) el.style.borderColor = ring.color;

    // Click behavior
    el.addEventListener("click", () => {
      const msg = node.ult
        ? "This is a ULT-protected logic node. Percy is shielding its inner truth."
        : `You selected ${node.label}. Percy is pondering...`;
      messageBox.textContent = msg;
    });

    logicNodes.appendChild(el);
  });

  // === Zoom ===
  window.zoomLogic = function (scaleFactor) {
    const currentScale =
      parseFloat(logicNodes.style.transform?.match(/scale\(([^)]+)\)/)?.[1]) || 1;
    const newScale = Math.max(0.25, Math.min(currentScale * scaleFactor, 6));
    logicNodes.style.transform = `scale(${newScale})`;
  };

  // === Interpreter ===
  window.interpretLogic = function () {
    const input = document.getElementById("interpreter-input").value.trim();
    const response = input.includes("ULT")
      ? "Access denied. ULT protection in effect."
      : `Percy reflects: "${input}" contains deep resonance.`;
    const p = document.createElement("p");
    p.className = "console-line";
    p.textContent = response;
    consoleBox.appendChild(p);
    consoleBox.scrollTop = consoleBox.scrollHeight;
  };

  // === Search filter ===
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toUpperCase();
    document.querySelectorAll(".logic-node").forEach(node => {
      const id = node.dataset.id.toUpperCase();
      node.style.display = id.includes(query) ? "block" : "none";
    });
  });
});
