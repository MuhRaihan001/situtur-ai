const {isLoggedIn, isUser} = require('../../middleware/auth');
const qrcode = require('qrcode');

// Store QR code in memory (in production, use Redis or database)
let currentQR = null;
let qrGenerated = false;

exports.GET = {
    middleware: [isLoggedIn, isUser],
    handler: async function (req, res, next) {
        try {
            // Jika request untuk status (AJAX)
            if (req.headers.accept === 'application/json' || req.query.format === 'json') {
                return res.json({
                    hasQR: !!currentQR,
                    generated: qrGenerated,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Jika request untuk gambar QR
            if (req.query.image === 'true') {
                if (!currentQR) {
                    return res.status(404).json({ error: 'No QR code available' });
                }
                
                const qrImage = await qrcode.toDataURL(currentQR, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                
                const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
                const imgBuffer = Buffer.from(base64Data, 'base64');
                
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': imgBuffer.length
                });
                
                return res.end(imgBuffer);
            }
            
            // Jika request untuk data URL
            if (req.query.data === 'true') {
                if (!currentQR) {
                    return res.status(404).json({ error: 'No QR code available' });
                }
                
                const qrDataUrl = await qrcode.toDataURL(currentQR, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                
                return res.json({ 
                    success: true, 
                    dataUrl: qrDataUrl,
                    generated: qrGenerated
                });
            }
            
            // Default: render halaman QR
            res.render('user/qr', { 
                title: 'WhatsApp QR Code',
                hasQR: !!currentQR,
                generated: qrGenerated,
                username: req.session.user.username
            });
            
        } catch (error) {
            console.error('Error in QR GET:', error);
            res.status(500).json({ error: 'Failed to process QR request' });
        }
    }
};

exports.POST = {
    middleware: [isLoggedIn, isUser],
    handler: async function (req, res, next) {
        try {
            const { qr } = req.body;
            
            if (!qr) {
                return res.status(400).json({ error: 'QR code is required' });
            }
            
            currentQR = qr;
            qrGenerated = true;
            
            console.log('QR code received successfully');
            
            res.json({ 
                success: true, 
                message: 'QR code received successfully',
                qr: qr
            });
            
        } catch (error) {
            console.error('Error in QR POST:', error);
            res.status(500).json({ error: 'Failed to process QR code' });
        }
    }
};

exports.DELETE = {
    middleware: [isLoggedIn, isUser],
    handler: function (req, res, next) {
        try {
            currentQR = null;
            qrGenerated = false;
            
            console.log('QR code reset successfully');
            
            res.json({ success: true, message: 'QR code reset successfully' });
            
        } catch (error) {
            console.error('Error in QR DELETE:', error);
            res.status(500).json({ error: 'Failed to reset QR code' });
        }
    }
};