class Meta {
  constructor() {
    this.data = {
      responses: {
        200: { description: "Success" }
      }
    };
  }

  setSummary(summary) {
    this.data.summary = summary;
    return this;
  }

  setDescription(description) {
    this.data.description = description;
    return this;
  }

  setTags(tags) {
    this.data.tags = Array.isArray(tags) ? tags : [tags];
    return this;
  }

  addTag(tag) {
    if (!this.data.tags) {
      this.data.tags = [];
    }
    this.data.tags.push(tag);
    return this;
  }

  setRequestBody(content, description = "Request body", required = true) {
    this.data.requestBody = {
      description,
      required,
      content: {
        "application/json": {
          schema: content
        }
      }
    };
    return this;
  }

  addParameter(name, options = {}) {
    if (!this.data.parameters) {
      this.data.parameters = [];
    }

    this.data.parameters.push({
      name,
      in: options.in || "query",
      required: options.required || false,
      schema: options.schema || { type: "string" },
      description: options.description || `${name} parameter`
    });
    return this;
  }

  addQueryParam(name, schema = { type: "string" }, description, required = false) {
    return this.addParameter(name, {
      in: "query",
      required,
      schema,
      description
    });
  }

  addRequestBody(input) {
    if (!input || typeof input !== "object") return this;

    if (!input.body && !input.properties) {
      this.data.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: inferSchema(input)
          }
        }
      };
      return this;
    }

    const {
      description = "Request body",
      required = true,
      body,
      properties
    } = input;

    this.data.requestBody = {
      description,
      required,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: body || properties
          }
        }
      }
    };

    return this;
  }


  addHeaderParam(name, schema = { type: "string" }, description, required = false) {
    return this.addParameter(name, {
      in: "header",
      required,
      schema,
      description
    });
  }

  addPathParam(name, schema = { type: "string" }, description) {
    return this.addParameter(name, {
      in: "path",
      required: true,
      schema,
      description
    });
  }

  setResponse(statusCode, description, schema = null) {
    if (!this.data.responses) {
      this.data.responses = {};
    }

    this.data.responses[statusCode] = {
      description
    };

    if (schema) {
      this.data.responses[statusCode].content = {
        "application/json": {
          schema
        }
      };
    }

    return this;
  }

  addSuccessResponse(description = "Success", schema = null) {
    return this.setResponse(200, description, schema);
  }

  addCreatedResponse(description = "Created", schema = null) {
    return this.setResponse(201, description, schema);
  }

  addBadRequestResponse(description = "Bad Request") {
    return this.setResponse(400, description);
  }

  addUnauthorizedResponse(description = "Unauthorized") {
    return this.setResponse(401, description);
  }

  addForbiddenResponse(description = "Forbidden") {
    return this.setResponse(403, description);
  }

  addNotFoundResponse(description = "Not Found") {
    return this.setResponse(404, description);
  }

  addServerErrorResponse(description = "Internal Server Error") {
    return this.setResponse(500, description);
  }

  setSecurity(securitySchemes) {
    this.data.security = Array.isArray(securitySchemes)
      ? securitySchemes
      : [securitySchemes];
    return this;
  }

  addBearerAuth() {
    if (!this.data.security) {
      this.data.security = [];
    }
    this.data.security.push({ bearerAuth: [] });
    return this;
  }

  setDeprecated(isDeprecated = true) {
    this.data.deprecated = isDeprecated;
    return this;
  }

  setOperationId(operationId) {
    this.data.operationId = operationId;
    return this;
  }

  build() {
    return this.data;
  }
}

global.Meta = Meta;
module.exports = { Meta };