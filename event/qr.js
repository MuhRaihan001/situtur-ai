/**
 * @param {import('whatsapp-web.js').Client} client
 */

const qrGenerator = require('qrcode-terminal')
 
module.exports = (client) => {
    client.on('qr', (qr) => {
        qrGenerator.generate(qr, { small: true });
    })
}