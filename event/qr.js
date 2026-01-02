/**
 * @param {import('whatsapp-web.js').Client} client
 */

const QRCode = require('qrcode')

// Allow configuring where the QR should be posted
const WEB_BASE_URL = process.env.WEB_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`
const QR_ENDPOINT = process.env.QR_ENDPOINT || '/user/qr'

module.exports = (client) => {
    client.on('qr', async (qr) => {
        // Generate QR code as data URL
        try {
            const qrDataUrl = await QRCode.toDataURL(qr, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            const targetUrl = `${WEB_BASE_URL}${QR_ENDPOINT}`;

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qr: qr,
                    qrDataUrl: qrDataUrl,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            console.log(`QR code sent to web interface (${targetUrl})`, { status: response.status });
        } catch (error) {
            console.error('Failed to send QR to web interface:', error.message);
        }
    });

}