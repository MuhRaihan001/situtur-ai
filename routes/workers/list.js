const { Meta } = require("../../handler/meta");
const Workers = require("../../handler/worker");

const workersHandler = new Workers();

module.exports = {
    GET: {
        handler: async function (req, res) {
            try {
                const workers = await workersHandler.list();
                res.status(workers.status).json({ 
                    success: true,
                    message: workers.message, 
                    workers: workers.workers,
                    stats: workers.stats
                });
            } catch (error) {
                console.error("Error in GET /workers/list:", error);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("List All Workers")
            .setDescription("Retrieves a list of all workers with their names, phone numbers, and current tasks.")
            .setTags("Workers")
            .setOperationId("listAllWorkers")
            .addSuccessResponse("List of workers retrieved successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Success" },
                    workers: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                worker_name: { type: "string", example: "John Doe" },
                                phone_number: { type: "string", example: "+6281234567890" },
                                current_task: { type: "integer", example: 1 }
                            }
                        }
                    }
                }
            })
            .addNotFoundResponse("No workers found")
            .addServerErrorResponse()
            .build()
    }
}