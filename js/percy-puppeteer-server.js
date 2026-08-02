// === percy-puppeteer-server.js Phase 10.0 (Extended Actions + SkynetDD-Compatible) ===
// Unified Percy Puppeteer Control Server (Visit, Click, Type, AutoLearn, Screenshot, ExtractLinks, RunJS, RunJava)
// Now includes: mouse_move, mouse_click, keyboard_type, scroll, dom_click

const WebSocket = require('ws');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = 8787;
const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Percy Puppeteer Server running ws://localhost:${PORT}`);

let browser = null;
let page = null;

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
// SEND TO SKYNET
// ============================================================

function sendSkynet(ws, action, payload) {
  ws.send(JSON.stringify({
    source: "SkynetDD",
    action,
    ...payload
  }));
}

// ============================================================
// MAIN SERVER
// ============================================================

wss.on('connection', ws => {
  console.log('🔗 Percy connected');

  ws.on('message', async message => {
    let payload;
    try { payload = JSON.parse(message); }
    catch { return; }

    const { action, params = {} } = payload;

    try {
      await ensureBrowser(params.headless ?? false);

      switch(action) {

        // ============================================================
        // VISIT
        // ============================================================
        case 'visit': {
          await page.goto(params.url, {
            waitUntil: 'domcontentloaded',
            timeout: 3000
          });

          let pageText = await page.evaluate(() => document.body.innerText || "");
          if (!pageText || pageText.trim().length < 20) {
            pageText = "Percy fallback: minimal text extracted.";
          }

          sendSkynet(ws, "visitResult", { pageText });
          break;
        }

        // ============================================================
        // CLICK (selector-based)
        // ============================================================
        case 'click': {
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);
          await el.click();

          sendSkynet(ws, "clickResult", { result: `Clicked ${params.selector}` });
          break;
        }

        // ============================================================
        // TYPE (selector-based)
        // ============================================================
        case 'type': {
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);
          await el.type(params.text, { delay: 50 });

          sendSkynet(ws, "typeResult", { result: `Typed into ${params.selector}` });
          break;
        }

        // ============================================================
        // AUTOLEARN
        // ============================================================
        case 'autoLearn': {
          if (params.url) {
            await page.goto(params.url, {
              waitUntil: 'domcontentloaded',
              timeout: 3000
            });
          }

          let text = await page.evaluate(() => document.body.innerText.trim());
          if (!text || text.length < 20) {
            text = "Percy fallback: autoLearn minimal text.";
          }

          sendSkynet(ws, "autoLearnResult", { pageText: text });
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

          sendSkynet(ws, "extractLinksResult", { links });
          break;
        }

        // ============================================================
        // RUN JS
        // ============================================================
        case 'runJS': {
          const output = await page.evaluate(params.script);
          sendSkynet(ws, "runJSResult", { output });
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

          break;
        }

        // ============================================================
        // NEW ACTIONS FOR PartPP v20
        // ============================================================

        // MOUSE MOVE
        case 'mouse_move': {
          await page.mouse.move(params.x, params.y);
          sendSkynet(ws, "mouseMoveResult", { result: `Moved mouse to ${params.x}, ${params.y}` });
          break;
        }

        // MOUSE CLICK
        case 'mouse_click': {
          await page.mouse.click(params.x, params.y);
          sendSkynet(ws, "mouseClickResult", { result: `Clicked at ${params.x}, ${params.y}` });
          break;
        }

        // KEYBOARD TYPE
        case 'keyboard_type': {
          await page.keyboard.type(params.text || "", { delay: 50 });
          sendSkynet(ws, "keyboardTypeResult", { result: `Typed text: ${params.text}` });
          break;
        }

        // SCROLL
        case 'scroll': {
          await page.evaluate((dy) => {
            window.scrollBy(0, dy);
          }, params.dy || 200);

          sendSkynet(ws, "scrollResult", { result: `Scrolled by ${params.dy || 200}` });
          break;
        }

        // DOM CLICK
        case 'dom_click': {
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);
          await el.click();

          sendSkynet(ws, "domClickResult", { result: `DOM clicked ${params.selector}` });
          break;
        }

        // ============================================================
        // DEFAULT
        // ============================================================
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

