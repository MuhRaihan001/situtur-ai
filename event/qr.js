/**
 * @param {import('whatsapp-web.js').Client} client
 */

const qrGenerator = require('qrcode-terminal')
const axios = require('axios')
 
module.exports = (client) => {
    client.on('qr', async (qr) => {
        // Display QR in terminal
        qrGenerator.generate(qr, { small: true });
        
        // Send QR to web interface
        try {
            await axios.post('http://127.0.0.1:3000/user/qr', {
                qr: qr
            });
            console.log('QR code sent to web interface');
        } catch (error) {
            console.error('Failed to send QR to web interface:', error.message);
        }
    })
}