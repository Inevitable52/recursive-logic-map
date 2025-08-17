// =========================
// Percy Puppeteer WebSocket Server
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

      if (action === "visit") {
        await page.goto(params.url, { waitUntil: "domcontentloaded" });
        ws.send(JSON.stringify({ 
          result: `Visited ${params.url}`, 
          pageText: await page.evaluate(() => document.body.innerText), 
          clickables: await page.evaluate(() => Array.from(document.querySelectorAll('a,button')).map(el=>el.tagName==="A"?el.href:el.textContent)), 
          inputs: await page.evaluate(() => Array.from(document.querySelectorAll('input,textarea')).map(el=>el.name || el.id || el.type))
        }));
      }

      else if (action === "click") {
        await page.click(params.selector);
        ws.send(JSON.stringify({ result: `Clicked ${params.selector}` }));
      }

      else if (action === "type") {
        await page.type(params.selector, params.text);
        ws.send(JSON.stringify({ result: `Typed into ${params.selector}` }));
      }

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
