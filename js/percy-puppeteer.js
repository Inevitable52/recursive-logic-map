// Run this with: node percy-puppeteer.js
const puppeteer = require('puppeteer');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8787 });
console.log("Percy Puppeteer server running on ws://localhost:8787");

wss.on('connection', ws => {
  ws.on('message', async message => {
    const { action, params } = JSON.parse(message.toString());
    console.log("Percy command:", action, params);

    if (action === "visitSite") {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto(params.url, { waitUntil: 'domcontentloaded' });
      ws.send(JSON.stringify({ status: "done", result: `Visited ${params.url}` }));
    }

    if (action === "clickElement") {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto(params.url, { waitUntil: 'domcontentloaded' });
      await page.click(params.selector);
      ws.send(JSON.stringify({ status: "done", result: `Clicked ${params.selector} on ${params.url}` }));
    }
  });
});
