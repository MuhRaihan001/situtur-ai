const fs = require("fs");
const path = require("path");

function getFilesRecursively(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
        } else if (file.endsWith(".js")) {
            results.push(filePath);
        }
    }

    return results;
}

///

/**
 * Dynamically loads API routes into Express app
 * @param {import("express").Express} app
 */
async function loadApi(app) {

    const routeDir = path.join(__dirname, "../routes");
    if (!fs.existsSync(routeDir))
        return console.warn(`API directory not found: ${routeDir}`);

    const routeFiles = getFilesRecursively(routeDir);
    if (routeFiles.length === 0)
        return console.warn(`No API files found in directory: ${routeDir}`);

    console.log("Initiate API route loading...");

    for (const routePath of routeFiles) {
        const relativePath = path
            .relative(routeDir, routePath)
            .replace(/\\/g, "/");

        const routeBasePath = `/${relativePath.replace(/\.js$/, "").replace("index", "")}`;

        try {
            const routeModule = require(routePath);
            app.use(routeBasePath, routeModule.default || routeModule);

            console.log(`✅ | Route : ${routeBasePath} Loaded`);
        } catch (error) {
            console.error(`Failed to load route file: ${routePath}`, error);
        }
    }
    console.log('All Routes Loaded...\n')
}

module.exports = { loadApi };