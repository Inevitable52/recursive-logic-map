// === percy.js (Phase 8 – Full Update with Golden Awareness & ULT) ===
document.addEventListener("DOMContentLoaded", () => {
  const logicMap = document.getElementById("logic-map");
  const logicNodes = document.getElementById("logic-nodes");
  const canvas = document.getElementById("logic-canvas");
  const messageBox = document.getElementById("percy-message");
  const consoleBox = document.getElementById("percy-console");
  const searchInput = document.getElementById("seed-search");

  // Load json seeds
  async function loadSeeds() {
    const seeds = {};
    const start = 80, end = 900;
    for (let i = start; i <= end; i++) {
      const fn = `G${String(i).padStart(3,"0")}.json`;
      try {
        const res = await fetch(`logic_seeds/${fn}`);
        if (!res.ok) throw new Error();
        seeds[fn] = await res.json();
      } catch {}
    }
    return seeds;
  }

  // Setup canvas
  const ctx = canvas.getContext("2d");
  const resizeCanvas = () => {
    canvas.width = logicMap.clientWidth;
    canvas.height = logicMap.clientHeight;
  };
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function animateCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const t = Date.now() * 0.002;
    for (let x = 0; x < canvas.width; x += 60) {
      const y = canvas.height/2 + 20 * Math.cos(x*0.02 + t);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
    }
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  // Zoom & drag
  let zoom = 1, drag = false, lastX=0, lastY=0, transX=0, transY=0;
  function applyTransform() {
    logicNodes.style.transform = `translate(${transX}px,${transY}px) scale(${zoom})`;
  }
  logicMap.addEventListener("wheel", e => {
    if (e.ctrlKey||e.metaKey) {
      e.preventDefault();
      zoom = Math.min(3, Math.max(0.5, zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
      applyTransform();
    }
  }, { passive: false });
  logicMap.addEventListener("mousedown", e=> { drag=true; lastX=e.x; lastY=e.y; });
  window.addEventListener("mouseup", ()=> drag=false);
  window.addEventListener("mousemove", e=>{
    if (!drag) return;
    transX += e.x - lastX;
    transY += e.y - lastY;
    lastX = e.x; lastY = e.y;
    applyTransform();
  });

  // Main setup
  loadSeeds().then(seeds => {
    // createNodes
    const width = logicMap.clientWidth, height = logicMap.clientHeight;
    const rings = [
      {min:80, max:200, cls:"core-ring", size:60, radius:width/2.3},
      {min:201,max:300,cls:"inner-ring",size:50,radius:width/3.2},
      {min:301,max:400,cls:"middle-ring",size:40,radius:width/4.5},
      {min:401,max:500,cls:"outer-ring",size:32,radius:width/6.2},
      {min:501,max:600,cls:"expansion-ring",size:26,radius:width/8},
      {min:601,max:700,cls:"integration-ring",size:20,radius:width/10},
      {min:701,max:800,cls:"synthesis-ring",size:16,radius:width/12.5},
      {min:801,max:900,cls:"awareness-ring",size:14,radius:width/15}
    ];

    rings.forEach(ring => {
      const entries = Object.entries(seeds).filter(([fname])=>{
        const num = parseInt(fname.slice(1));
        return num>=ring.min && num<=ring.max;
      });
      entries.forEach(([fname,data],i) => {
        const angle = i/entries.length * Math.PI*2;
        const x = width/2 + ring.radius * Math.cos(angle);
        const y = height/2 + ring.radius * Math.sin(angle);
        const div = document.createElement("div");
        div.className = `logic-node ${ring.cls}` + (data.type === "ULT-contact" ? " ult" : "");
        div.textContent = fname;
        div.dataset.id = fname;
        div.title = data.message;
        div.style.left = `calc(${x}px)`;
        div.style.top = `calc(${y}px)`;
        div.addEventListener("click",()=>{
          const msg = data.type === "ULT-contact"
            ? "🔐 ULT‑protected: private logic shielded."
            : data.message;
          messageBox.textContent = msg;
          consoleBox.innerHTML += `<p class="console-line">↳ ${msg}</p>`;
          consoleBox.scrollTop = consoleBox.scrollHeight;
        });
        logicNodes.appendChild(div);
      });
    });

    // Search filter
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toUpperCase();
      logicNodes.querySelectorAll(".logic-node").forEach(n => {
        n.style.display = n.dataset.id.toUpperCase().includes(q) ? "block" : "none";
      });
    });

    // Interpreter
    window.interpretLogic = () => {
      const v = document.getElementById("interpreter-input").value;
      const resp = v.includes("ULT")
        ? "Access denied. ULT‑protected logic."
        : `Percy reflects: "${v}" registers in resonance.`;
      consoleBox.innerHTML += `<p class="console-line">${resp}</p>`;
      consoleBox.scrollTop = consoleBox.scrollHeight;
    };

    applyTransform();
  });
});
