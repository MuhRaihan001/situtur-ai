/**
 * @param {import('whatsapp-web.js').Client} client
 */

const QRCode = require('qrcode')
const axios = require('axios')

// Allow configuring where the QR should be posted (useful when the server isn't on localhost:3000)
const WEB_BASE_URL = process.env.WEB_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`
const QR_ENDPOINT = process.env.QR_ENDPOINT || '/user/qr'
 
module.exports = (client) => {
    client.on('qr', async (qr) => {
        // Send QR to web interface
        try {
            const targetUrl = `${WEB_BASE_URL}${QR_ENDPOINT}`

            const response = await axios.post(targetUrl, {
                qr: qr
            });
            console.log(`QR code sent to web interface (${targetUrl})`, { status: response.status });
        } catch (error) {
            const responseData = error.response?.data;
            console.error('Failed to send QR to web interface:', error.message, responseData ? { responseData } : {});
        }
    })
}