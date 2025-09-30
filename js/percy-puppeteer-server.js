// === percy-puppeteer-server.js Phase 9.0 ===
// Unified Percy Puppeteer Control Server (Visit, Click, Type, AutoLearn, Screenshot, ExtractLinks, RunJS)

const WebSocket = require('ws');
const puppeteer = require('puppeteer');

const PORT = 8787;
const wss = new WebSocket.Server({ port: PORT });
console.log(`🚀 Percy Puppeteer Server running ws://localhost:${PORT}`);

let browser = null;
let page = null;

const wait = ms => new Promise(res => setTimeout(res, ms));

async function ensureBrowser(headless = false) {
  if (!browser) browser = await puppeteer.launch({
    headless,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  if (!page) page = await browser.newPage();
}

wss.on('connection', ws => {
  console.log('🔗 Percy connected');

  ws.on('message', async message => {
    let payload;
    try { payload = JSON.parse(message); }
    catch { ws.send(JSON.stringify({success:false,error:'Invalid JSON'})); return; }

    const { action, params = {} } = payload;

    try {
      await ensureBrowser(params.headless ?? false);

      switch(action) {

        case 'visit': {
          await page.goto(params.url, {waitUntil:'networkidle2'});
          if (params.waitSelector) await page.waitForSelector(params.waitSelector);
          if (params.clickSelector) await page.click(params.clickSelector);
          const pageText = await page.evaluate(()=>document.body.innerText);
          ws.send(JSON.stringify({success:true,result:`Visited ${params.url}`,pageText}));
          break;
        }

        case 'click': {
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);
          await el.click();
          ws.send(JSON.stringify({success:true,result:`Clicked ${params.selector}`}));
          break;
        }

        case 'type': {
          const el = await page.$(params.selector);
          if (!el) throw new Error(`Selector not found: ${params.selector}`);
          await el.type(params.text, {delay:50});
          ws.send(JSON.stringify({success:true,result:`Typed into ${params.selector}`}));
          break;
        }

        case 'autoLearn': {
          if (params.url) await page.goto(params.url,{waitUntil:'networkidle2'});
          let text;
          if (params.selector) {
            await page.waitForSelector(params.selector,{timeout:5000}).catch(()=>null);
            text = await page.evaluate(sel=>{
              const el=document.querySelector(sel);return el?el.innerText.trim():null;
            },params.selector);
          } else {
            text = await page.evaluate(()=>document.body.innerText.trim());
          }
          ws.send(JSON.stringify({success:true,result:'AutoLearn succeeded',text}));
          break;
        }

        case 'screenshot': {
          const path = params.path || 'screenshot.png';
          await page.screenshot({path,fullPage:true});
          ws.send(JSON.stringify({success:true,result:`Screenshot saved to ${path}`}));
          break;
        }

        case 'extractLinks': {
          const links = await page.evaluate(()=>Array.from(document.querySelectorAll('a')).map(a=>a.href));
          ws.send(JSON.stringify({success:true,result:'Links extracted',links}));
          break;
        }

        case 'runJS': {
          const output = await page.evaluate(params.script);
          ws.send(JSON.stringify({success:true,result:'Script executed',output}));
          break;
        }

        default:
          ws.send(JSON.stringify({success:false,error:`Unknown action: ${action}`}));
      }

    } catch (err) {
      ws.send(JSON.stringify({success:false,error:err.message}));
    }
  });

  ws.on('close', async()=>{
    if (browser) await browser.close();
    browser=null;page=null;
  });
});
