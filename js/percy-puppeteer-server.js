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
          const { topic, urlCandidates = [] } = params;
          console.log(`🌍 Autonomous Learn: ${topic}`);
        
          const searchEngines = [
            { name: 'Google', url: 'https://www.google.com', selector: 'textarea[name="q"], input[name="q"]' },
            { name: 'Bing', url: 'https://www.bing.com', selector: 'input[name="q"]' },
            { name: 'DuckDuckGo', url: 'https://duckduckgo.com', selector: 'input[name="q"]' },
            { name: 'Wikipedia', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`, selector: 'body' }
          ];
        
          let learned = false;
        
          for (const engine of searchEngines) {
            try {
              const tab = await browser.newPage();
              await tab.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
              );
              console.log(`🧭 Visiting ${engine.name}`);
        
              await tab.goto(engine.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
        
              // Try typing the topic if there's a search bar
              const boxExists = await tab.$(engine.selector);
              if (boxExists && !engine.url.includes('wikipedia.org')) {
                await tab.click(engine.selector, { clickCount: 3 });
                await tab.type(engine.selector, topic, { delay: 50 });
                await tab.keyboard.press('Enter');
                await tab.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 25000 });
              }
        
              // Extract main readable text
              const text = await tab.evaluate(() => {
                const body = document.body.innerText;
                return body ? body.replace(/\s+/g, ' ').trim().slice(0, 25000) : '';
              });
        
              if (text.length > 800) {
                ws.send(JSON.stringify({
                  type: 'learnedContent',
                  source: engine.name,
                  topic,
                  snippet: text.slice(0, 1000),
                  fullText: text,
                  success: true
                }));
                console.log(`✅ Learned successfully from ${engine.name}`);
                learned = true;
                await tab.close();
                break;
              }
        
              await tab.close();
            } catch (e) {
              console.warn(`⚠️ ${engine.name} failed: ${e.message}`);
            }
          }
        
          if (!learned) {
            ws.send(JSON.stringify({
              type: 'learnedContent',
              topic,
              success: false,
              error: 'No valid text extracted'
            }));
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
