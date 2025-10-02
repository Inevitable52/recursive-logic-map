// === percy-puppeteer-server.js Phase 9.0 ===
// Unified Percy Puppeteer Control Server (Visit, Click, Type, AutoLearn, Screenshot, ExtractLinks, RunJS, RunJava)

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

        // === NEW: Run Java Action ===
        case 'runJava': {
  const code = params.code ? String(params.code) : "";
  if (!code) {
    ws.send(JSON.stringify({success:false,error:"Missing Java code"}));
    break;
  }

  // Temp directory for this run
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'percy-java-'));

  // Try to detect class name from code
  let className;
  const match = code.match(/class\s+([A-Za-z_]\w*)/);
  if (match) {
    className = match[1]; // Use actual class name from the code
  } else {
    className = `PercyTool${Date.now()}`;
  }

  const javaFilePath = path.join(tmpDir, `${className}.java`);

  // Wrap if no class declared
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

    // Compile
    exec(`javac "${javaFilePath}"`, { cwd: tmpDir, timeout: 20000 }, (compileErr, _, compileStderr) => {
      if (compileErr) {
        ws.send(JSON.stringify({success:false,error:`Compile Error: ${compileStderr}`}));
        try { fs.rmSync(tmpDir, {recursive:true, force:true}); } catch {}
        return;
      }

      // Run using the detected className
      exec(`java -cp "${tmpDir}" ${className}`, { cwd: tmpDir, timeout: 20000, maxBuffer: 1024*1024 }, (runErr, runStdout, runStderr) => {
        if (runErr) {
          ws.send(JSON.stringify({success:false,error:`Runtime Error: ${runStderr}`}));
        } else {
          ws.send(JSON.stringify({success:true,result:'Java executed',output:String(runStdout).trim()}));
        }
        try { fs.rmSync(tmpDir, {recursive:true, force:true}); } catch {}
      });
    });
  } catch (err) {
    ws.send(JSON.stringify({success:false,error:`Internal Error: ${err.message}`}));
    try { fs.rmSync(tmpDir, {recursive:true, force:true}); } catch {}
  }

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
