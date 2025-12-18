const { Client, LocalAuth } = require('whatsapp-web.js')
const path = require('path');
const fs = require('fs');

const eventFolder = path.join(__dirname, '../event');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'tsumux',
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
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