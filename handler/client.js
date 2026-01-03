const { Client, LocalAuth } = require('whatsapp-web.js')
const path = require('path');
const fs = require('fs');

const eventFolder = path.join(__dirname, '../event');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'tsumux',
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wppconnect-wa.js',
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});

async function loadEvents() {
    console.log('\x1b[0m Loading event handlers...');

    fs.readdirSync(eventFolder).forEach((file) => {
        console.log(`\x1b[32m✔\x1b[0m Event loaded: \x1b[33m${file}\x1b[0m`);
        require(path.join(eventFolder, file))(client);
    });
    console.log('All events loaded\n');
}

module.exports = {
    client,
    loadEvents
}