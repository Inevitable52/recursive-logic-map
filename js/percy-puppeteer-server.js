// =========================
// Percy Puppeteer WebSocket Server (Improved + AutoLearn Full Page)
// =========================
const WebSocket = require('ws');
const puppeteer = require('puppeteer');

const wss = new WebSocket.Server({ port: 8787 });
console.log("🚀 Percy Puppeteer WS server running on ws://localhost:8787");

wss.on('connection', ws => {
  let browser, page;

  ws.on('message', async msg => {
    let payload;
    try { payload = JSON.parse(msg); } 
    catch(e){ 
      ws.send(JSON.stringify({ result: `Error: Invalid JSON` })); 
      return; 
    }

    const { action, params } = payload;

    try {
      if (!browser) browser = await puppeteer.launch({ headless: false });
      if (!page) page = await browser.newPage();

      // =========================
      // Visit Action
      // =========================
      if (action === "visit") {
        await page.goto(params.url, { waitUntil: "networkidle2" });
        await page.waitForTimeout(2000);

        const pageText = await page.evaluate(() => document.body.innerText);
        const clickables = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a,button')).map(el => (el.href || el.textContent))
        );
        const inputs = await page.evaluate(() =>
          Array.from(document.querySelectorAll('input,textarea'))
            .map(el => el.name || el.id || el.type)
        );

        ws.send(JSON.stringify({ result: `Visited ${params.url}`, pageText, clickables, inputs }));
      }

      // =========================
      // Click Action
      // =========================
      else if (action === "click") {
        const el = await page.$(params.selector);
        if (!el) throw new Error(`Selector not found: ${params.selector}`);
        await el.click();
        await page.waitForTimeout(500);
        ws.send(JSON.stringify({ result: `Clicked ${params.selector}` }));
      }

      // =========================
      // Type Action
      // =========================
      else if (action === "type") {
        const el = await page.$(params.selector);
        if (!el) throw new Error(`Selector not found: ${params.selector}`);
        await el.type(params.text);
        await page.waitForTimeout(500);
        ws.send(JSON.stringify({ result: `Typed into ${params.selector}` }));
      }

      // =========================
      // AutoLearn Action (full page or optional selector)
      // =========================
      else if (action === "autoLearn") {
        if (params.url) await page.goto(params.url, { waitUntil: "networkidle2" });
        await page.waitForTimeout(2000);

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

        if (!text) {
          ws.send(JSON.stringify({ result: `⚠ No text returned` }));
        } else {
          ws.send(JSON.stringify({ result: `AutoLearn succeeded`, text }));
        }
      }

      // =========================
      // Unknown Action
      // =========================
      else {
        ws.send(JSON.stringify({ result: `Unknown action: ${action}` }));
      }

    } catch(e){
      ws.send(JSON.stringify({ result: `Error: ${e.message}` }));
    }
  });

  ws.on('close', async () => { 
    if (browser) await browser.close(); 
  });
});
