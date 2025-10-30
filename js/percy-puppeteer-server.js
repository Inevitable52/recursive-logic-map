/* === percy-puppeteer-server.js Phase 9.1 ===
Unified Percy Puppeteer Control Server
(Visit, Click, Type, AutoLearn, Screenshot, ExtractLinks, RunJS, RunJava)
*/

const WebSocket = require('ws');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = 8787;
const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Percy Puppeteer Server running on ws://localhost:${PORT}`);

let browser = null;
let page = null;

const wait = ms => new Promise(res => setTimeout(res, ms));

async function ensureBrowser(headless = false) {
  if (!browser) {
    browser = await puppeteer.launch({
      headless,
      defaultViewport: null,
      args: ['--start-maximized']
    });
  }
  if (!page) page = await browser.newPage();
}

wss.on('connection', ws => {
  console.log('🔗 Percy connected');

  ws.on('message', async message => {
    let payload;
    try {
      payload = JSON.parse(message);
    } catch {
      ws.send(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      return;
    }

    const { action, params = {} } = payload;

    try {
      await ensureBrowser(params.headless ?? false);

      switch (action) {

        // === Visit ===
        case 'visit': {
          if (!params.url) throw new Error('Missing URL');
          await page.goto(params.url, { waitUntil: 'networkidle2' });
          if (params.waitSelector) await page.waitForSelector(params.waitSelector, { timeout: 8000 }).catch(() => null);
          if (params.clickSelector) await page.click(params.clickSelector).catch(() => null);
          const pageText = await page.evaluate(() => document.body.innerText);
          ws.send(JSON.stringify({ success: true, result: `Visited ${params.url}`, pageText }));
          break;
        }

        // === Click ===
        case 'click': {
          if (!params.selector) throw new Error('Missing selector');
          await page.waitForSelector(params.selector, { timeout: 5000 });
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);
          await el.click();
          ws.send(JSON.stringify({ success: true, result: `Clicked ${params.selector}` }));
          break;
        }

        // === Type ===
        case 'type': {
          if (!params.selector) throw new Error('Missing selector');
          await page.waitForSelector(params.selector, { timeout: 5000 });
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);
          await el.type(params.text || '', { delay: 50 });
          ws.send(JSON.stringify({ success: true, result: `Typed into ${params.selector}` }));
          break;
        }

        // === AutoLearn ===
        case 'autoLearn': {
          if (params.url) await page.goto(params.url, { waitUntil: 'networkidle2' });
          let text;
          if (params.selector) {
            await page.waitForSelector(params.selector, { timeout: 5000 }).catch(() => null);
            text = await page.evaluate(sel => {
              const el = document.querySelector(sel);
              return el ? el.innerText.trim() : null;
            }, params.selector);
          } else {
            text = await page.evaluate(() => document.body.innerText.trim());
          }
          ws.send(JSON.stringify({ success: true, result: 'AutoLearn completed', text }));
          break;
        }

        // === Fetch and Learn (Percy Part J 6.0 — Autonomous Search & Reading) ===
        case 'fetchAndLearn': {
          const topic = params.topic || 'artificial intelligence';
          console.log(`🧠 Percy.FetchAndLearn: ${topic}`);
        
          if (!browser) {
            browser = await puppeteer.launch({
              headless: false,
              defaultViewport: null,
              args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"]
            });
          }
        
          const page = await browser.newPage();
        
          try {
            // === Try Google first ===
            console.log(`🌐 Navigating to Google for: ${topic}`);
            await page.goto("https://www.google.com/ncr", { waitUntil: "domcontentloaded" });
        
            await page.waitForSelector("textarea[name='q'], input[name='q']", { timeout: 10000 });
            console.log("⌨️ Typing search query...");
            await page.type("textarea[name='q'], input[name='q']", topic, { delay: 100 });
            await page.keyboard.press("Enter");
        
            // Wait for search results
            await page.waitForSelector("div#search", { timeout: 15000 });
            console.log("🔍 Extracting content...");
        
            const content = await page.evaluate(() => {
              const results = Array.from(document.querySelectorAll("div#search div"));
              return results.map(div => div.innerText).join("\n\n").slice(0, 2000);
            });
        
            console.log("✅ Learning complete.");
            ws.send(JSON.stringify({
              success: true,
              type: 'learnedContent',
              topic,
              snippet: content,
              source: "google.com"
            }));
        
          } catch (err) {
            console.error("❌ fetchAndLearn error:", err);
        
            // === Fallback to DuckDuckGo if Google fails ===
            try {
              console.log("🦆 Switching to DuckDuckGo...");
              await page.goto("https://duckduckgo.com", { waitUntil: "domcontentloaded" });
              await page.waitForSelector("input[name='q']", { timeout: 10000 });
              await page.type("input[name='q']", topic, { delay: 100 });
              await page.keyboard.press("Enter");
              await page.waitForSelector("a.result__a", { timeout: 10000 });
        
              const altContent = await page.evaluate(() => {
                const results = Array.from(document.querySelectorAll("a.result__a, div.result__snippet"));
                return results.map(el => el.innerText).join("\n\n").slice(0, 2000);
              });
        
              ws.send(JSON.stringify({
                success: true,
                type: 'learnedContent',
                topic,
                snippet: altContent,
                source: "duckduckgo.com"
              }));
        
            } catch (altErr) {
              ws.send(JSON.stringify({
                success: false,
                type: 'learnedContent',
                topic,
                error: `All sources failed: ${altErr.message}`
              }));
            }
          } finally {
            await page.close();
          }
        
          break;
        }

        // === Screenshot ===
        case 'screenshot': {
          const savePath = params.path || 'screenshot.png';
          await page.screenshot({ path: savePath, fullPage: true });
          ws.send(JSON.stringify({ success: true, result: `Screenshot saved to ${savePath}` }));
          break;
        }

        // === Extract Links ===
        case 'extractLinks': {
          const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.href));
          ws.send(JSON.stringify({ success: true, result: 'Links extracted', links }));
          break;
        }

        // === Run JavaScript ===
        case 'runJS': {
          const output = await page.evaluate(params.script);
          ws.send(JSON.stringify({ success: true, result: 'Script executed', output }));
          break;
        }

        // === Run Java ===
        case 'runJava': {
          const code = params.code ? String(params.code) : '';
          if (!code) {
            ws.send(JSON.stringify({ success: false, error: 'Missing Java code' }));
            break;
          }

          const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'percy-java-'));

          // Detect or assign class name
          const match = code.match(/class\s+([A-Za-z_]\w*)/);
          const className = match ? match[1] : `PercyTool${Date.now()}`;
          const javaFilePath = path.join(tmpDir, `${className}.java`);

          // Wrap if no class declared
          const finalSource = /class\s+\w+/.test(code)
            ? code
            : `public class ${className} {
                public static void main(String[] args) {
                  ${code.includes('System.out') ? code : `System.out.println(${JSON.stringify(code)});`}
                }
              }`;

          try {
            fs.writeFileSync(javaFilePath, finalSource, 'utf8');

            exec(`javac "${javaFilePath}"`, { cwd: tmpDir, timeout: 20000 }, (compileErr, _, compileStderr) => {
              if (compileErr) {
                ws.send(JSON.stringify({ success: false, error: `Compile Error: ${compileStderr}` }));
                fs.rmSync(tmpDir, { recursive: true, force: true });
                return;
              }

              exec(`java -cp "${tmpDir}" ${className}`, { cwd: tmpDir, timeout: 20000, maxBuffer: 1024 * 1024 },
                (runErr, runStdout, runStderr) => {
                  if (runErr) {
                    ws.send(JSON.stringify({ success: false, error: `Runtime Error: ${runStderr}` }));
                  } else {
                    ws.send(JSON.stringify({ success: true, result: 'Java executed', output: String(runStdout).trim() }));
                  }
                  fs.rmSync(tmpDir, { recursive: true, force: true });
                });
            });
          } catch (err) {
            ws.send(JSON.stringify({ success: false, error: `Internal Error: ${err.message}` }));
            fs.rmSync(tmpDir, { recursive: true, force: true });
          }
          break;
        }

        default:
          ws.send(JSON.stringify({ success: false, error: `Unknown action: ${action}` }));
      }

    } catch (err) {
      ws.send(JSON.stringify({ success: false, error: err.message }));
    }

  });

  ws.on('close', async () => {
    console.log('🔌 Percy disconnected, cleaning up browser...');
    if (browser) {
      try { await browser.close(); } catch {}
    }
    browser = null;
    page = null;
  });
});
