const qrcode = require('qrcode');

let currentQR = null;
let qrImageBuffer = null;
let qrGenerated = false;

// Store SSE clients for real-time updates
let sseClients = [];

exports.GET = async function (req, res, next) {
    try {
        // SSE Stream untuk real-time updates
        if (req.query.stream === 'true') {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });

            if (currentQR && qrImageBuffer) {
                res.write(`data: ${JSON.stringify({
                    type: 'qr',
                    hasQR: true,
                    generated: qrGenerated,
                    timestamp: new Date().toISOString()
                })}\n\n`);
            } else {
                res.write(`data: ${JSON.stringify({
                    type: 'waiting',
                    hasQR: false,
                    message: 'Waiting for QR code...'
                })}\n\n`);
            }

            const clientId = Date.now();
            const client = { id: clientId, res };
            sseClients.push(client);

            req.on('close', () => {
                sseClients = sseClients.filter(c => c.id !== clientId);
                console.log(`SSE client ${clientId} disconnected. Active clients: ${sseClients.length}`);
            });

            console.log(`SSE client ${clientId} connected. Active clients: ${sseClients.length}`);
            return;
        }
        
        // Return QR code as PNG image
        if (req.query.image === 'true' || req.headers.accept?.includes('image/png')) {
            if (!qrImageBuffer) {
                return res.status(404).json({ error: 'No QR code available' });
            }
            
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': qrImageBuffer.length,
                'Cache-Control': 'no-cache'
            });
            
            return res.end(qrImageBuffer);
        }
        
        // JSON status
        return res.json({
            hasQR: !!currentQR,
            generated: qrGenerated,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in QR GET:', error);
        res.status(500).json({ error: 'Failed to process QR request' });
    }
};

exports.POST = async function (req, res, next) {
    try {
        const { qr } = req.body;
        
        if (!qr) {
            return res.status(400).json({ error: 'QR code is required' });
        }
        
        currentQR = qr;
        qrGenerated = true;
        
        // Generate QR code sebagai PNG buffer
        qrImageBuffer = await qrcode.toBuffer(qr, {
            type: 'png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        console.log('QR code received and generated successfully');
        
        // Broadcast ke semua SSE clients
        broadcastToClients({
            type: 'qr',
            hasQR: true,
            generated: qrGenerated,
            timestamp: new Date().toISOString()
        });
        
        res.json({ 
            success: true, 
            message: 'QR code received and broadcasted successfully'
        });
        
    } catch (error) {
        console.error('Error in QR POST:', error);
        res.status(500).json({ error: 'Failed to process QR code' });
    }
};

exports.DELETE = function (req, res, next) {
    try {
        currentQR = null;
        qrImageBuffer = null;
        qrGenerated = false;
        
        console.log('QR code reset successfully');
        
        broadcastToClients({
            type: 'reset',
            hasQR: false,
            message: 'QR code has been cleared',
            timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, message: 'QR code reset successfully' });
        
    } catch (error) {
        console.error('Error in QR DELETE:', error);
        res.status(500).json({ error: 'Failed to reset QR code' });
    }
};

function broadcastToClients(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    sseClients.forEach((client, index) => {
        try {
            client.res.write(message);
        } catch (error) {
            console.error(`Failed to send to client ${client.id}:`, error.message);
            sseClients.splice(index, 1);
        }
    });
    
    console.log(`Broadcasted to ${sseClients.length} clients`);
}