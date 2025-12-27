require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const app = require('./handler/server');
const { client, loadEvents } = require('./handler/client');
const { loadCommands } = require('./handler/command');
const { loadApi } = require('./handler/api');

const PORT = process.env.PORT || 3000;
const SWAGGER_PATH = path.join(__dirname, 'docs', 'swagger.yml');

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
        loadEvents();
        loadCommands();

        await loadApi(app, {
            routeDir: path.join(__dirname, "routes"),
            generateOpenAPI: true,
            openAPIPath: SWAGGER_PATH,
            openAPIOptions: {
                title: "Situtur API Documentation",
                version: "BETA",
                servers: [{ url: `http://localhost:${PORT}` }]
            }
        });

        setupSwagger(app);

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📄 Documentation available at http://localhost:${PORT}/api-docs`);
        });

        await client.initialize();
        
    } catch (error) {
        console.error('❌ Error during server startup:', error);
        process.exit(1);
    }
}

bootstrap();