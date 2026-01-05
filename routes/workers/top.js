const { Meta } = require("../../handler/meta");
const Workers = require("../../handler/worker");
const { isUser } = require("../../middleware/auth");

const workersHandler = new Workers();
module.exports = {
    middleware: [isUser],
    GET: {
        handler: async function (req, res) {
            try {
                const topWorker = await workersHandler.getTopWorker();
                res.status(topWorker.status).json({ message: topWorker.message, data: topWorker.data });
            } catch (error) {
                console.error("Error in GET /workers/top:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Get Top Worker")
            .setDescription("Retrieves the worker with the highest performance metrics.")
            .setTags("Workers")
            .setOperationId("getTopWorker")
            .addSuccessResponse("Top worker retrieved successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Success" },
                    data: {
                        type: "object",
                        properties: {
                            worker_name: { type: "string", example: "John Doe" },
                            phone_number: { type: "string", example: "+6281234567890" },
                            finished_task: { type: "number", example: 42 }
                        }
                    }
                }
            })
            .addNotFoundResponse("No workers found")
            .addServerErrorResponse()
            .build()
    }
}