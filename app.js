require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const app = require('./handler/server');
const { loadApi } = require('./handler/api');

const PORT = process.env.PORT || 3000;
const SWAGGER_PATH = path.join(__dirname, 'docs', 'swagger.yml');
const ENABLE_WHATSAPP = process.env.ENABLE_WHATSAPP === 'true';

const setupSwagger = (expressApp) => {
    try {
        if (fs.existsSync(SWAGGER_PATH)) {
            const swaggerDocument = yaml.load(fs.readFileSync(SWAGGER_PATH, 'utf8'));
            expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        }
    } catch (error) {
        console.error('Failed to load Swagger documentation:', error.message);
    }
};

async function bootstrap() {
    try {
        // Load WhatsApp bot only if explicitly enabled
        if (ENABLE_WHATSAPP) {
            console.log('📱 WhatsApp bot enabled, initializing...');
            const { client, loadEvents } = require('./handler/client');
            const { loadCommands } = require('./handler/command');
            loadEvents();
            loadCommands();
            // Initialize WhatsApp client after server starts
            app.once('listening', async () => {
                try {
                    await client.initialize();
                    console.log('✅ WhatsApp client initialized.');
                } catch (err) {
                    console.error('⚠️ WhatsApp client failed to initialize:', err.message);
                }
            });
        } else {
            console.log('📵 WhatsApp bot disabled (ENABLE_WHATSAPP != true). Skipping...');
        }

        await loadApi(app, {
            routeDir: path.join(__dirname, "routes"),
            generateOpenAPI: true,
            openAPIPath: SWAGGER_PATH,
            openAPIOptions: {
                title: "Situtur API Documentation",
                version: "BETA",
                servers: [{ url: process.env.APP_URL || `http://localhost:${PORT}` }]
            }
        });

        setupSwagger(app);

        // Catch-all route for React SPA
        app.get('*any', (req, res, next) => {
            // Jika request adalah file statis (punya ekstensi), abaikan.
            if (req.path.includes('.')) {
                return next();
            }
            res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📄 Documentation available at http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error('❌ Error during server startup:', error);
        process.exit(1);
    }
}

bootstrap();