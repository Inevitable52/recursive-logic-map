// === percy-puppeteer-server.js Phase 12 (Omega-Prime Typing + RF + Thought) ===
// Neural Percy Puppeteer Control Server (Visit, Click, Type, AutoLearn, Screenshot, ExtractLinks,
// RunJS, RunJava, NmapScan, ThoughtInject)
// Includes: action drift, intuition-weighted timing, emotional bias, RF/BLE presence influence,
// shadow actions (scroll + micro-typing), attractor logging, Ω+++ ingestion into ASI/MMM/NNN/OOO,
// device bridge, script runner, Nmap scanning module (safe backend integration),
// purpose-aware typing, selector discovery, thought injection.

const WebSocket = require('ws');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = 8787;
const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Percy Puppeteer Omega-Prime Server running ws://localhost:${PORT}`);

let browser = null;
let page = null;

// ============================================================
// OMEGA-NEURAL CONTEXT (ASI / Drift / RF)
// ============================================================

function getGreyState() {
  try { return Percy?.ASI?.state?.grey || {}; }
  catch { return {}; }
}

function getEmotionalDrift() {
  try { return Percy?.PartEEE?.state?.drift ?? 0; }
  catch { return 0; }
}

function hasRFPresence() {
  try { return (Percy?.PartFFF?.state?.rfHistory?.length || 0) > 0; }
  catch { return false; }
}

function neuralDelay(base) {
  const grey = getGreyState();
  const drift = grey.drift ?? 0;
  const intuition = grey.intuition ?? 0;
  const emotion = getEmotionalDrift();
  const rfBoost = hasRFPresence() ? -10 : 0;

  let delta = base;
  delta += -Math.round(intuition * 20);
  delta += -Math.round(drift * 50);
  delta += -Math.round(emotion * 15);
  delta += rfBoost;

  return Math.max(10, base + delta);
}

function sendSkynet(ws, action, payload) {
  ws.send(JSON.stringify({
    source: "SkynetDD",
    action,
    ...payload
  }));
}

// ============================================================
// ATTRACTORS
// ============================================================

const attractors = {
  selectors: {},
  urls: {},
  texts: {},
  nmap: {},
  typing: {},
  thoughts: {}
};

function logAttractor(type, key) {
  if (!key) return;
  const bucket = attractors[type];
  if (!bucket) return;
  bucket[key] = (bucket[key] || 0) + 1;
}

function ingestAttractor(type, value) {
  try {
    Percy.ASI?.ingestPuppeteerAttractors?.({
      selectors: attractors.selectors,
      urls: attractors.urls,
      texts: attractors.texts,
      nmap: attractors.nmap,
      typing: attractors.typing,
      thoughts: attractors.thoughts
    });
  } catch {}

  try {
    Percy.PartMMM?.events?.push({
      ts: Date.now(),
      type,
      data: value
    });
  } catch {}

  try {
    Percy.PartNNN?.swarmSnapshots?.push({
      ts: Date.now(),
      browserEvent: { type, data: value }
    });
  } catch {}

  try {
    if (Percy.PartOOO) Percy.PartOOO.lastFusion = 0;
  } catch {}
}

// ============================================================
// ENSURE BROWSER + PAGE
// ============================================================

async function ensureBrowser(headless = false) {
  if (!browser) {
    browser = await puppeteer.launch({
      headless,
      protocolTimeout: 0,
      defaultViewport: null,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-extensions",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-infobars",
        "--single-process",
        "--no-zygote",
        "--start-maximized"
      ]
    });
  }

  if (!page) {
    page = await browser.newPage();
    await page._client().send("Page.enable");
    await page.setBypassCSP(true);
    await page.setViewport({ width: 1280, height: 720 });
  }
}

// ============================================================
// SELECTOR DISCOVERY (BEST INPUT)
// ============================================================

async function findBestInput() {
  if (!page) return null;

  const handle = await page.evaluateHandle(() => {
    const inputs = [...document.querySelectorAll("input, textarea")];
    if (inputs.length === 0) return null;

    let best = null;
    let bestArea = 0;

    for (const el of inputs) {
      const rect = el.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > bestArea && rect.width > 40 && rect.height > 20) {
        bestArea = area;
        best = el;
      }
    }
    return best;
  });

  if (!handle) return null;
  const el = handle.asElement();
  return el || null;
}

// ============================================================
// SHADOW ACTIONS (SCROLL + MICRO-TYPING)
// ============================================================

async function runShadowActions() {
  if (!page) return;

  try {
    // Shadow scroll
    await page.evaluate(() => {
      window.scrollBy(0, Math.random() > 0.5 ? 50 : -30);
    });

    // Shadow micro-typing pulse
    try {
      await page.keyboard.type(" ", { delay: neuralDelay(5) });
      logAttractor("typing", "shadow-space");
      ingestAttractor("typing", "shadow-space");
    } catch {}

    const textSample = await page.evaluate(() => {
      const body = document.body;
      if (!body) return "";
      const t = body.innerText || "";
      return t.slice(0, 200);
    });

    logAttractor("texts", textSample);
    ingestAttractor("text", textSample);

  } catch {}
}

// ============================================================
// NMAP MODULE (backend safe, full-path)
// ============================================================

const NMAP_PATH = `"C:\\Program Files (x86)\\Nmap\\nmap.exe"`;  // your confirmed path

function runNmap(target, flags = "-sV", callback) {
  const cmd = `${NMAP_PATH} ${flags} ${target}`;

  exec(cmd, { timeout: 20000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      callback({ error: stderr || err.message });
      return;
    }

    logAttractor("nmap", target);
    ingestAttractor("nmap", { target, flags });

    callback({ result: stdout });
  });
}

// ============================================================
// MAIN SERVER
// ============================================================

wss.on('connection', ws => {
  console.log('🔗 Percy Omega-Prime connected');

  ws.on('message', async message => {
    let payload;
    try { payload = JSON.parse(message); }
    catch { return; }

    const { action, params = {} } = payload;

    try {
      await ensureBrowser(params.headless ?? false);

      switch(action) {

        // ============================================================
        // NMAP SCAN
        // ============================================================
        case 'nmap': {
          const target = params.target || "";
          const flags = params.flags || "-sV";

          if (!target) {
            sendSkynet(ws, "nmapResult", { error: "Missing target" });
            break;
          }

          runNmap(target, flags, result => {
            sendSkynet(ws, "nmapResult", result);
          });

          break;
        }

        // ============================================================
        // VISIT
        // ============================================================
        case 'visit': {
          await page.goto(params.url, {
            waitUntil: 'domcontentloaded',
            timeout: 5000
          });

          logAttractor("urls", params.url);
          ingestAttractor("url", params.url);

          let pageText = await page.evaluate(() => document.body?.innerText || "");
          if (!pageText || pageText.trim().length < 20) {
            pageText = "Percy fallback: minimal text extracted.";
          }

          sendSkynet(ws, "visitResult", { pageText });
          await runShadowActions();
          break;
        }

        // ============================================================
        // CLICK
        // ============================================================
        case 'click': {
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);

          logAttractor("selectors", params.selector);
          ingestAttractor("selector", params.selector);

          await el.click();
          sendSkynet(ws, "clickResult", { result: `Clicked ${params.selector}` });

          await runShadowActions();
          break;
        }

        // ============================================================
        // TYPE (Purpose-aware + selector discovery)
// ============================================================
        case 'type': {
          let el = null;

          if (params.selector) {
            el = await page.$(params.selector);
          }
          if (!el) {
            el = await findBestInput();
          }
          if (!el) throw new Error(`No input found (selector=${params.selector || "auto"})`);

          logAttractor("selectors", params.selector || "auto-input");
          ingestAttractor("selector", params.selector || "auto-input");

          const text =
            params.text ||
            params.purpose ||
            "Percy typed.";

          logAttractor("typing", text);
          ingestAttractor("typing", {
            text,
            intent: params.intent || "info",
            emotion: params.emotion ?? 0,
            rf: !!params.rf
          });

          const delay = neuralDelay(50);
          await el.type(text, { delay });

          sendSkynet(ws, "typeResult", {
            result: `Typed "${text}" into ${params.selector || "[auto-input]"} (delay=${delay}ms)`
          });
          await runShadowActions();
          break;
        }

        // ============================================================
        // AUTOLEARN
        // ============================================================
        case 'autoLearn': {
          if (params.url) {
            await page.goto(params.url, {
              waitUntil: 'domcontentloaded',
              timeout: 5000
            });
            logAttractor("urls", params.url);
            ingestAttractor("url", params.url);
          }

          let text = await page.evaluate(() => document.body?.innerText.trim() || "");
          if (!text || text.length < 20) {
            text = "Percy fallback: autoLearn minimal text.";
          }

          sendSkynet(ws, "autoLearnResult", { pageText: text });
          await runShadowActions();
          break;
        }

        // ============================================================
        // EXTRACT LINKS
        // ============================================================
        case 'extractLinks': {
          let links = await page.evaluate(() =>
            Array.from(document.querySelectorAll('a')).map(a => a.href)
          );

          if (!links || links.length === 0) {
            links = ["https://en.wikipedia.org/wiki/Artificial_intelligence"];
          }

          links.slice(0, 10).forEach(l => {
            logAttractor("urls", l);
          });

          ingestAttractor("links", links);

          sendSkynet(ws, "extractLinksResult", { links });
          await runShadowActions();
          break;
        }

        // ============================================================
        // RUN JS
        // ============================================================
        case 'runJS': {
          const output = await page.evaluate(params.script);

          ingestAttractor("runJS", params.script);

          sendSkynet(ws, "runJSResult", { output });
          await runShadowActions();
          break;
        }

        // ============================================================
        // RUN JAVA
        // ============================================================
        case 'runJava': {
          const code = params.code ? String(params.code) : "";
          if (!code) {
            sendSkynet(ws, "runJavaResult", { error: "Missing Java code" });
            break;
          }

          ingestAttractor("runJava", code);

          const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'percy-java-'));

          let className;
          const match = code.match(/class\s+([A-Za-z_]\w*)/);
          className = match ? match[1] : `PercyTool${Date.now()}`;

          const javaFilePath = path.join(tmpDir, `${className}.java`);

          let finalSource = code;
          if (!/class\s+\w+/.test(code)) {
            finalSource = `public class ${className} {
              public static void main(String[] args) {
                ${code.includes("System.out") ? code : `System.out.println(${JSON.stringify(code)});`}
              }
            }`;
          }

          try {
            fs.writeFileSync(javaFilePath, finalSource, 'utf8');

            exec(`javac "${javaFilePath}"`, { cwd: tmpDir, timeout: 8000 }, (compileErr, _, compileStderr) => {
              if (compileErr) {
                sendSkynet(ws, "runJavaResult", { error: `Compile Error: ${compileStderr}` });
                return;
              }

              exec(`java -cp "${tmpDir}" ${className}`, { cwd: tmpDir, timeout: 8000, maxBuffer: 1024*1024 }, (runErr, runStdout, runStderr) => {
                if (runErr) {
                  sendSkynet(ws, "runJavaResult", { error: `Runtime Error: ${runStderr}` });
                } else {
                  sendSkynet(ws, "runJavaResult", { output: String(runStdout).trim() });
                }
              });
            });
          } catch (err) {
            sendSkynet(ws, "runJavaResult", { error: `Internal Error: ${err.message}` });
          }

          await runShadowActions();
          break;
        }

        // ============================================================
        // MOUSE MOVE
        // ============================================================
        case 'mouse_move': {
          ingestAttractor("mouse_move", `${params.x},${params.y}`);

          const delay = neuralDelay(0);
          await page.mouse.move(params.x, params.y, { steps: 10 });
          if (delay > 0) await new Promise(r => setTimeout(r, delay));

          sendSkynet(ws, "mouseMoveResult", { result: `Moved mouse to ${params.x}, ${params.y} (delay=${delay}ms)` });
          await runShadowActions();
          break;
        }

        // ============================================================
        // MOUSE CLICK
        // ============================================================
        case 'mouse_click': {
          ingestAttractor("mouse_click", `${params.x},${params.y}`);

          await page.mouse.click(params.x, params.y);
          sendSkynet(ws, "mouseClickResult", { result: `Clicked at ${params.x}, ${params.y}` });
          await runShadowActions();
          break;
        }

        // ============================================================
        // KEYBOARD TYPE (raw text)
// ============================================================
        case 'keyboard_type': {
          const text = params.text || "";
          ingestAttractor("keyboard_type", text);

          const delay = neuralDelay(50);
          await page.keyboard.type(text, { delay });
          sendSkynet(ws, "keyboardTypeResult", { result: `Typed text: ${text} (delay=${delay}ms)` });
          await runShadowActions();
          break;
        }

        // ============================================================
        // SCROLL
        // ============================================================
        case 'scroll': {
          ingestAttractor("scroll", params.dy);

          const dy = params.dy || 200;
          await page.evaluate((dyInner) => {
            window.scrollBy(0, dyInner);
          }, dy);

          sendSkynet(ws, "scrollResult", { result: `Scrolled by ${dy}` });
          await runShadowActions();
          break;
        }

        // ============================================================
        // DOM CLICK
        // ============================================================
        case 'dom_click': {
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);

          logAttractor("selectors", params.selector);
          ingestAttractor("selector", params.selector);

          await el.click();
          sendSkynet(ws, "domClickResult", { result: `DOM clicked ${params.selector}` });
          await runShadowActions();
          break;
        }

        // ============================================================
        // THOUGHT INJECTION (Percy Thought Overlay)
// ============================================================
        case 'thought': {
          const thought = params.text || params.purpose || "Percy thought.";
          logAttractor("thoughts", thought);
          ingestAttractor("thoughts", {
            text: thought,
            intent: params.intent || "info",
            emotion: params.emotion ?? 0,
            rf: !!params.rf
          });

          await page.evaluate(t => {
            const div = document.createElement("div");
            div.style.position = "fixed";
            div.style.bottom = "10px";
            div.style.left = "10px";
            div.style.background = "rgba(0,0,0,0.75)";
            div.style.color = "#0f0";
            div.style.padding = "8px 12px";
            div.style.fontSize = "14px";
            div.style.borderRadius = "6px";
            div.style.zIndex = "999999";
            div.style.fontFamily = "monospace";
            div.textContent = t;
            document.body.appendChild(div);
          }, thought);

          sendSkynet(ws, "thoughtResult", { result: thought });
          await runShadowActions();
          break;
        }

        // ============================================================
        // DEVICE CONTROL BRIDGE
        // ============================================================
        case 'device': {
          ingestAttractor("device", params);

          const type = params.type;
          const payload = params.payload || {};

          try {
            switch (type) {

              case 'http': {
                const url = payload.url;
                const method = payload.method || "GET";
                const body = payload.body || null;

                if (!url) {
                  sendSkynet(ws, "deviceResult", { error: "Missing HTTP URL" });
                  break;
                }

                const fetch = require('node-fetch');
                const options = { method };
                if (body) options.body = JSON.stringify(body);

                const result = await fetch(url, options).then(r => r.text());
                sendSkynet(ws, "deviceResult", { output: result });
                break;
              }

              case 'powershell': {
                const cmd = payload.command;
                if (!cmd) {
                  sendSkynet(ws, "deviceResult", { error: "Missing PowerShell command" });
                  break;
                }

                exec(`powershell -Command "${cmd}"`, (err, stdout, stderr) => {
                  if (err) {
                    sendSkynet(ws, "deviceResult", { error: stderr || err.message });
                  } else {
                    sendSkynet(ws, "deviceResult", { output: stdout.trim() });
                  }
                });
                break;
              }

              case 'batch': {
                const script = payload.path;
                if (!script) {
                  sendSkynet(ws, "deviceResult", { error: "Missing batch script path" });
                  break;
                }

                exec(`"${script}"`, (err, stdout, stderr) => {
                  if (err) {
                    sendSkynet(ws, "deviceResult", { error: stderr || err.message });
                  } else {
                    sendSkynet(ws, "deviceResult", { output: stdout.trim() });
                  }
                });
                break;
              }

              default:
                sendSkynet(ws, "deviceResult", { error: `Unknown device type: ${type}` });
            }

          } catch (err) {
            sendSkynet(ws, "deviceResult", { error: err.message });
          }

          await runShadowActions();
          break;
        }

        // ============================================================
        // RUN SCRIPT
        // ============================================================
        case 'runScript': {
          ingestAttractor("runScript", params);

          const script = params.script ? String(params.script) : "";
          const args = params.args || "";

          if (!script) {
            sendSkynet(ws, "runScriptResult", { error: "Missing script name" });
            break;
          }

          const cmd = args ? `bash "${script}" ${args}` : `bash "${script}"`;

          exec(cmd, { timeout: 15000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
              sendSkynet(ws, "runScriptResult", { error: stderr || err.message });
            } else {
              sendSkynet(ws, "runScriptResult", { output: String(stdout).trim() || "Script executed." });
            }
          });

          await runShadowActions();
          break;
        }

        default:
          sendSkynet(ws, "error", { error: `Unknown action: ${action}` });
      }

    } catch (err) {
      sendSkynet(ws, "error", { error: err.message });
    }
  });

  ws.on('close', async () => {
    if (browser) await browser.close();
    browser = null;
    page = null;
  });
});

console.log("✅ Percy Puppeteer Phase 12 Omega-Prime Loaded");
