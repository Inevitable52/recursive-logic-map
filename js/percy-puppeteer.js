// === percy-puppeteer.js (Updated Phase 8.3+) ===
// Percy Puppeteer Control Module with WebSocket Integration
// Run: node js/percy-puppeteer.js

const WebSocket = require('ws');
const puppeteer = require('puppeteer');

const PORT = 8787;
const wss = new WebSocket.Server({ port: PORT });

console.log(`🚀 Percy Puppeteer WebSocket running on ws://localhost:${PORT}`);

// Default browser instance (optional)
let browser = null;

async function launchBrowser(headless = true) {
    if (!browser) {
        browser = await puppeteer.launch({
            headless,
            defaultViewport: null,
            args: ['--start-maximized']
        });
    }
    return browser;
}

// === Puppeteer Action Handlers ===
async function browsePage(url, clickSelector = null, waitSelector = null) {
    const browser = await launchBrowser(false);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    if (waitSelector) {
        console.log(`[Percy] Waiting for selector: ${waitSelector}`);
        await page.waitForSelector(waitSelector);
    }

    if (clickSelector) {
        console.log(`[Percy] Clicking selector: ${clickSelector}`);
        await page.click(clickSelector);
    }

    const text = await page.evaluate(() => document.body.innerText);
    return text;
}

async function clickSelector(url, selector) {
    const browser = await launchBrowser(false);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.click(selector);
    return `Clicked ${selector} on ${url}`;
}

async function typeText(url, selector, text) {
    const browser = await launchBrowser(false);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.type(selector, text, { delay: 50 });
    return `Typed text into ${selector} on ${url}`;
}

async function takeScreenshot(url, path = 'screenshot.png') {
    const browser = await launchBrowser(true);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path, fullPage: true });
    return `Screenshot saved to ${path}`;
}

async function extractLinks(url) {
    const browser = await launchBrowser(true);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a')).map(a => a.href)
    );
    return links;
}

// === WebSocket Server ===
wss.on('connection', ws => {
    console.log('🔗 Percy connected');

    ws.on('message', async message => {
        try {
            const { action, params } = JSON.parse(message);
            let result = null;

            switch (action) {
                case 'browse':
                    result = await browsePage(params.url, params.clickSelector, params.waitSelector);
                    break;
                case 'click':
                    result = await clickSelector(params.url, params.selector);
                    break;
                case 'type':
                    result = await typeText(params.url, params.selector, params.text);
                    break;
                case 'screenshot':
                    result = await takeScreenshot(params.url, params.path);
                    break;
                case 'extractLinks':
                    result = await extractLinks(params.url);
                    break;
                default:
                    result = `❌ Unknown action: ${action}`;
            }

            ws.send(JSON.stringify({ success: true, result }));
        } catch (err) {
            ws.send(JSON.stringify({ success: false, error: err.message }));
        }
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Puppeteer server...');
    if (browser) await browser.close();
    process.exit();
});
