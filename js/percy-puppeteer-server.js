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

       // === Fetch and Learn (Percy Part J 7.0 — Full Autonomous Browser AI Mode) ===
case 'fetchAndLearn': {
  const { topic } = params;
  console.log(`🌐 [Percy] Beginning autonomous fetch-and-learn for topic: "${topic}"`);

  try {
    // --- Step 1: Launch visible browser ---
    await ensureBrowser(false); // forces visible (non-headless) Chrome

    const tab = await browser.newPage();
    await tab.setViewport({ width: 1366, height: 768 });
    await tab.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // --- Step 2: Go to Google manually ---
    console.log('🚀 Navigating to Google...');
    let loaded = false;
    for (let i = 0; i < 3; i++) {
      try {
        await tab.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 25000 });
        loaded = true;
        break;
      } catch {
        console.log(`⚠️ Retry Google load attempt ${i + 1}`);
        await wait(2500);
      }
    }
    if (!loaded) throw new Error('Google did not load after retries.');

    // --- Step 3: Accept cookies or terms if needed ---
    const consentSelector = 'button[aria-label*="Accept"], button[aria-label*="agree"], button:has-text("I agree")';
    const hasConsent = await tab.$(consentSelector);
    if (hasConsent) {
      console.log('🟢 Accepting cookies...');
      await tab.click(consentSelector).catch(() => {});
      await wait(1500);
    }

    // --- Step 4: Type the topic in Google search ---
    await tab.waitForSelector("textarea[name='q'], input[name='q']", { timeout: 15000 });
    console.log(`⌨️ Typing query: "${topic}"`);
    await tab.click("textarea[name='q'], input[name='q']", { clickCount: 3 });
    await tab.type("textarea[name='q'], input[name='q']", topic, { delay: 70 });
    await tab.keyboard.press('Enter');

    // --- Step 5: Wait until real content appears ---
    console.log('🔎 Waiting for results...');
    await tab.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
    await tab.waitForFunction(
      () => document.querySelector('div#search, .v7W49e, #rso'),
      { timeout: 20000 }
    );

    // --- Step 6: Extract readable text ---
    console.log('📖 Extracting readable knowledge...');
    const snippet = await tab.evaluate(() => {
      const blocks = Array.from(document.querySelectorAll('div#search div, .v7W49e, #rso div'));
      const text = blocks.map(div => div.innerText).join('\n\n').replace(/\s+/g, ' ').trim();
      return text.slice(0, 2500);
    });

    // --- Step 7: Send back learned text to Percy ---
    if (snippet && snippet.length > 200) {
      ws.send(JSON.stringify({
        type: 'learnedContent',
        success: true,
        topic,
        source: 'Google',
        summary: snippet
      }));
      console.log('✅ Percy learned successfully.');
    } else {
      throw new Error('No readable content extracted.');
    }

    await tab.close();
  } catch (err) {
    console.error('❌ fetchAndLearn error:', err.message);
    ws.send(JSON.stringify({
      type: 'learnedContent',
      success: false,
      topic,
      error: err.message
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
