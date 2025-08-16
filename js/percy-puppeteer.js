// === percy-puppeteer.js ===
// Percy Puppeteer Control Module
// Run with: node js/percy-puppeteer.js

const puppeteer = require('puppeteer');

async function percyBrowse(url, clickSelector = null, waitSelector = null) {
    console.log(`[Percy] Launching browser to visit: ${url}`);

    // Launch browser
    const browser = await puppeteer.launch({
        headless: false, // Show the browser so you can see what's happening
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Go to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Optional: wait for a selector before clicking
    if (waitSelector) {
        console.log(`[Percy] Waiting for: ${waitSelector}`);
        await page.waitForSelector(waitSelector);
    }

    // Optional: click an element
    if (clickSelector) {
        console.log(`[Percy] Clicking on: ${clickSelector}`);
        await page.click(clickSelector);
    }

    // Keep browser open until you close manually
    console.log("[Percy] Browser ready. Close it when you're done.");
}

(async () => {
    // === Example usage ===
    // Visit Google, wait for the search box, then click on it.
    await percyBrowse("https://google.com", "input[name='q']", "input[name='q']");
})();
