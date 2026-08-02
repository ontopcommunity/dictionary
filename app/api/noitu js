const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

const TARGET_URL = 'https://noitu.fun';

app.get('/api', async (req, res) => {
    const targetName = req.query.name;
    if (!targetName) {
        return res.status(400).json({});
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const rt = request.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(rt)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        let responseSent = false;

        page.on('response', async (response) => {
            if (responseSent) return;
            try {
                const rt = response.request().resourceType();
                if (rt === 'fetch' || rt === 'xhr') {
                    const data = await response.json();
                    if (data && data.name !== undefined) {
                        responseSent = true;
                        res.json(data);
                        await browser.close();
                    }
                }
            } catch (e) {}
        });

        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

        await page.waitForSelector('.BaseChat_chatBtnContent__orGdc', { timeout: 10000 });
        await page.evaluate(() => {
            const btn = document.querySelector('.BaseChat_chatBtnContent__orGdc');
            if (btn) {
                const events = ['pointerover', 'pointerenter', 'pointermove', 'pointerdown', 'pointerup', 'mouseover', 'mouseenter', 'mousemove', 'mousedown', 'mouseup', 'click'];
                events.forEach(evt => {
                    try { btn.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true })); } catch (e) {}
                    try { btn.dispatchEvent(new PointerEvent(evt, { bubbles: true, cancelable: true })); } catch (e) {}
                });
                try { btn.click(); } catch (e) {}
                try { HTMLButtonElement.prototype.click.call(btn); } catch (e) {}
            }
        });

        await page.waitForSelector('article.BaseChat_messageRoot__OBIS_', { timeout: 10000 });

        await page.evaluate((name) => {
            const senders = document.querySelectorAll('.BaseChat_messageSender__8eKiI, .user-name_auth__MN7Vj');
            for (let i = senders.length - 1; i >= 0; i--) {
                if (senders[i].textContent.trim().toLowerCase() === name.toLowerCase()) {
                    const article = senders[i].closest('article');
                    if (article) {
                        const img = article.querySelector('.BaseChat_messageAvatar__BR6Gs img, .BaseChat_messageAvatar__BR6Gs');
                        if (img) {
                            const events = ['pointerover', 'pointerenter', 'pointermove', 'pointerdown', 'pointerup', 'mouseover', 'mouseenter', 'mousemove', 'mousedown', 'mouseup', 'click'];
                            events.forEach(evt => {
                                try { img.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true })); } catch (e) {}
                                try { img.dispatchEvent(new PointerEvent(evt, { bubbles: true, cancelable: true })); } catch (e) {}
                            });
                            try { img.click(); } catch (e) {}
                            try { HTMLElement.prototype.click.call(img); } catch (e) {}
                            return;
                        }
                    }
                }
            }
        }, targetName);

        setTimeout(async () => {
            if (!responseSent) {
                responseSent = true;
                res.status(404).json({});
                if (browser) await browser.close();
            }
        }, 15000);

    } catch (error) {
        if (!responseSent && !res.headersSent) {
            responseSent = true;
            res.status(500).json({});
        }
        if (browser) await browser.close();
    }
});

app.listen(3000);
