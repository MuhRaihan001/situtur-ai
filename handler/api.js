const fs = require("fs").promises;
const path = require("path");
const express = require("express");
const yaml = require("js-yaml");
const rateLimit = require("express-rate-limit");

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "ALL"];
const DEFAULT_OPENAPI_VERSION = "3.0.3";
const DEFAULT_API_VERSION = "1.0.0";

function createRateLimiter(limit, windowMs = 60000) {
  return rateLimit({
    windowMs,
    max: limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${limit} requests per ${windowMs / 1000} seconds allowed.`
    },
    handler: (req, res) => {
      const retryAfter = Math.ceil(req.rateLimit.resetTime.getTime() / 1000 - Date.now() / 1000);
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
        limit: req.rateLimit.limit,
        remaining: 0,
        resetTime: req.rateLimit.resetTime
      });
    }
  });
}

async function getFilesRecursively(dir) {
  const results = [];

  try {
    const files = await fs.readdir(dir);

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file);

        try {
          const stat = await fs.stat(filePath);

          if (stat.isDirectory()) {
            const subFiles = await getFilesRecursively(filePath);
            results.push(...subFiles);
          } else if (file.endsWith(".js")) {
            results.push(filePath);
          }
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error.message);
        }
      })
    );
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return results;
}

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

const normalizeToArray = (value) => Array.isArray(value) ? value : [value];

function filePathToRoutePath(routeDir, filePath) {
  const relativePath = path.relative(routeDir, filePath);
  const normalizedPath = relativePath.split(path.sep).join("/");

  return `/${normalizedPath.replace(/\.js$/, "").replace(/index$/, "")}`;
}

const convertExpressParamsToOpenAPI = (expressPath) =>
  expressPath.replace(/:(\w+)/g, "{$1}");

function extractPathParameters(expressPath) {
  const params = [];
  const regex = /:(\w+)/g;
  let match;

  while ((match = regex.exec(expressPath)) !== null) {
    params.push({
      name: match[1],
      in: "path",
      required: true,
      schema: { type: "string" },
      description: `${match[1]} parameter`
    });
  }

  return params;
}

const buildFullRoutePath = (routePath, paramPath = "") =>
  `${routePath}${paramPath}`.replace(/\/$/, "") || "/";

function registerMethodHandler(router, method, handler, routePath, openAPICollector) {
  const lowerMethod = method.toLowerCase();
  const httpMethod = method.toUpperCase();

  if (handler?.params) {
    const fullRoutePath = buildFullRoutePath(routePath, handler.params);
    const middlewares = handler.middleware ? normalizeToArray(handler.middleware) : [];
    
    if (handler.limit) {
      const rateLimiter = createRateLimiter(handler.limit, handler.window || 60000);
      middlewares.unshift(rateLimiter);
    }

    router[lowerMethod](handler.params, ...middlewares, handler.handler);
    logRoute(httpMethod, fullRoutePath, middlewares.length > 0, handler.limit, handler.window);

    if (openAPICollector && handler.meta) {
      collectOpenAPIData(openAPICollector, fullRoutePath, lowerMethod, handler, middlewares, handler.limit, handler.window);
    }
    return;
  }

  if (typeof handler === "function") {
    const fullRoutePath = routePath || "/";
    router[lowerMethod]("/", handler);
    logRoute(httpMethod, fullRoutePath, false);
    return;
  }

  if (handler?.handler) {
    const fullRoutePath = routePath || "/";
    const middlewares = handler.middleware ? normalizeToArray(handler.middleware) : [];
    
    if (handler.limit) {
      const rateLimiter = createRateLimiter(handler.limit, handler.window || 60000);
      middlewares.unshift(rateLimiter);
    }

    router[lowerMethod]("/", ...middlewares, handler.handler);
    logRoute(httpMethod, fullRoutePath, middlewares.length > 0, handler.limit, handler.window);

    if (openAPICollector && handler.meta) {
      collectOpenAPIData(openAPICollector, fullRoutePath, lowerMethod, handler, middlewares, handler.limit, handler.window);
    }
  }
}

const logRoute = (method, path, hasMiddleware, limit, window) => {
  const middlewareInfo = hasMiddleware ? " (with middleware)" : "";
  const limitInfo = limit ? ` [Rate Limit: ${limit}/${window ? window / 1000 : 60}s]` : "";
  console.log(`✅ | Route: ${method} ${path} Loaded${middlewareInfo}${limitInfo}`);
};

function collectOpenAPIData(collector, routePath, method, handler, middlewares, limit, window) {
  const openAPIPath = convertExpressParamsToOpenAPI(routePath);

  if (!collector.paths[openAPIPath]) {
    collector.paths[openAPIPath] = {};
  }

  const operation = { ...handler.meta };

  const pathParams = extractPathParameters(routePath);
  if (pathParams.length > 0) {
    operation.parameters = operation.parameters || [];

    for (const pathParam of pathParams) {
      const exists = operation.parameters.some(
        p => p.name === pathParam.name && p.in === "path"
      );
      if (!exists) {
        operation.parameters.push(pathParam);
      }
    }
  }

  const hasAuthMiddleware = middlewares.some(
    mw => mw.name && (mw.name.includes("auth") || mw.name.includes("Auth"))
  );

  if (hasAuthMiddleware && !operation.security) {
    operation.security = [{ bearerAuth: [] }];
  }

  if (!operation.tags || operation.tags.length === 0) {
    const tag = routePath.split("/").filter(Boolean)[0] || "default";
    operation.tags = [tag.charAt(0).toUpperCase() + tag.slice(1)];
  }

  if (!operation.responses) {
    operation.responses = {
      200: { description: "Success" }
    };
  }

  if (limit) {
    const windowSeconds = window ? window / 1000 : 60;
    operation.description = operation.description 
      ? `${operation.description}\n\n**Rate Limit:** ${limit} requests per ${windowSeconds} seconds`
      : `**Rate Limit:** ${limit} requests per ${windowSeconds} seconds`;
    
    if (!operation.responses['429']) {
      operation.responses['429'] = {
        description: "Too Many Requests - Rate limit exceeded",
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Too Many Requests' },
                message: { type: 'string', example: 'Rate limit exceeded. Try again in 45 seconds.' },
                retryAfter: { type: 'integer', example: 45 },
                limit: { type: 'integer', example: limit },
                remaining: { type: 'integer', example: 0 }
              }
            }
          }
        },
        headers: {
          'RateLimit-Limit': {
            description: 'Request limit per window',
            schema: { type: 'integer' }
          },
          'RateLimit-Remaining': {
            description: 'Remaining requests in current window',
            schema: { type: 'integer' }
          },
          'RateLimit-Reset': {
            description: 'Time when the rate limit resets (Unix timestamp)',
            schema: { type: 'integer' }
          },
          'Retry-After': {
            description: 'Number of seconds to wait before retrying',
            schema: { type: 'integer' }
          }
        }
      };
    }
  }

  collector.paths[openAPIPath][method] = operation;
}

function generateOpenAPISpec(collector, options = {}) {
  return {
    openapi: DEFAULT_OPENAPI_VERSION,
    info: {
      title: options.title || "API Documentation",
      version: options.version || DEFAULT_API_VERSION,
      description: options.description || "Auto-generated API documentation from route files",
      contact: options.contact || {},
      license: options.license || {}
    },
    servers: options.servers || [
      {
        url: "http://localhost:3000",
        description: "Development server"
      }
    ],
    paths: collector.paths,
    components: {
      schemas: options.schemas || {},
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token"
        },
        ...(options.securitySchemes || {})
      },
      ...(options.components || {})
    },
    tags: options.tags || []
  };
}

async function saveOpenAPISpec(spec, outputPath) {
  const dir = path.dirname(outputPath);

  if (!(await pathExists(dir))) {
    await fs.mkdir(dir, { recursive: true });
  }

  const ext = path.extname(outputPath);
  const content = ext === ".json"
    ? JSON.stringify(spec, null, 2)
    : yaml.dump(spec, { indent: 2, lineWidth: -1, noRefs: true });

  await fs.writeFile(outputPath, content, "utf8");
  console.log(`\n📄 OpenAPI specification generated: ${outputPath}`);
}

async function loadRouteModule(app, routePath, routeBasePath, openAPICollector) {
  try {
    const routeModule = require(routePath);
    const router = express.Router();

    if (routeModule.middleware) {
      router.use(...normalizeToArray(routeModule.middleware));
    }

    for (const [key, value] of Object.entries(routeModule)) {
      const methodName = key.toUpperCase();
      if (HTTP_METHODS.includes(methodName)) {
        registerMethodHandler(router, methodName, value, routeBasePath, openAPICollector);
      }
    }

    app.use(routeBasePath, router);
  } catch (error) {
    console.error(`❌ Failed to load route file: ${routePath}`);
    console.error(`   Error: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }
  }
}

async function loadApi(app, options = {}) {
  const routeDir = options.routeDir || path.join(__dirname, "../routes");

  if (!(await pathExists(routeDir))) {
    console.warn(`⚠️  API directory not found: ${routeDir}`);
    return null;
  }

  const routeFiles = await getFilesRecursively(routeDir);

  if (routeFiles.length === 0) {
    console.warn(`⚠️  No API files found in directory: ${routeDir}`);
    return null;
  }

  console.log("🚀 Initiating API route loading...\n");

  const openAPICollector = options.generateOpenAPI ? { paths: {} } : null;

  await Promise.all(
    routeFiles.map(async (routePath) => {
      const routeBasePath = filePathToRoutePath(routeDir, routePath);
      await loadRouteModule(app, routePath, routeBasePath, openAPICollector);
    })
  );

  console.log("\n✅ All routes loaded successfully.");

  if (options.generateOpenAPI && openAPICollector) {
    const spec = generateOpenAPISpec(openAPICollector, options.openAPIOptions || {});
    const outputPath = options.openAPIPath || "./docs/openapi.yml";
    await saveOpenAPISpec(spec, outputPath);
    return spec;
  }

  return null;
}

module.exports = { loadApi };