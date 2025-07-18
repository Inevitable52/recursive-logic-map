document.addEventListener("DOMContentLoaded", () => {
  const logicMap = document.getElementById("logic-map");
  const logicNodes = document.getElementById("logic-nodes");
  const messageBox = document.getElementById("percy-message");
  const consoleBox = document.getElementById("percy-console");

  // Sample logic nodes (G791-G800 with ULT)
  const logicData = [
    { id: "G791", label: "G791", ult: false },
    { id: "G792", label: "G792", ult: false },
    { id: "G793", label: "G793", ult: false },
    { id: "G794", label: "G794", ult: false },
    { id: "G795", label: "G795", ult: false },
    { id: "G796", label: "G796", ult: false },
    { id: "G797", label: "G797", ult: false },
    { id: "G798", label: "G798", ult: false },
    { id: "G799", label: "G799", ult: false },
    { id: "G800", label: "G800", ult: false },
    { id: "G800.ULT", label: "G800.ULT", ult: true }
  ];

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.id = "logic-canvas";
  logicMap.prepend(canvas);
  const ctx = canvas.getContext("2d");

  // Resize canvas
  const resizeCanvas = () => {
    canvas.width = logicMap.offsetWidth;
    canvas.height = logicMap.offsetHeight;
  };
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Animate logic effect
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
  animateCanvas();

  // Add logic nodes
  logicData.forEach((node, index) => {
    const el = document.createElement("div");
    el.className = "logic-node";
    el.textContent = node.label;
    el.dataset.id = node.id;

    if (node.ult) el.classList.add("ult");

    // Position: radial pattern
    const angle = (index / logicData.length) * 2 * Math.PI;
    const radius = 180 + (node.ult ? 80 : 0);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    el.style.left = `calc(50% + ${x}px)`;
    el.style.top = `calc(50% + ${y}px)`;

    // Click logic
    el.addEventListener("click", () => {
      const msg = node.ult
        ? "This is a ULT-protected logic node. Percy is shielding its inner truth."
        : `You selected ${node.label}. Percy is pondering...`;
      messageBox.textContent = msg;
    });

    logicNodes.appendChild(el);
  });

  // Zoom logic
  window.zoomLogic = function (scaleFactor) {
    const currentScale =
      parseFloat(logicNodes.style.transform?.match(/scale\(([^)]+)\)/)?.[1]) || 1;
    const newScale = Math.max(0.5, Math.min(currentScale * scaleFactor, 3));
    logicNodes.style.transform = `scale(${newScale})`;
  };

  // Interpreter
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
});
