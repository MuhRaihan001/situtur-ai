const { Meta } = require("../../../handler/meta");
const Workers = require("../../../handler/worker");

const workersHandler = new Workers();

module.exports = {
    POST: {
        handler: async function (req, res) {
            try {
                const { worker_id, work_id } = req.body;

                if (!worker_id || !work_id)
                    return res.status(400).json({ error: "worker_id and work_id are required." });

                const result = await workersHandler.setWorkerTask(worker_id, work_id);
                res.status(result.status).json({ message: result.message });
            } catch (error) {
                console.error("Error in POST /workers/task/set:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Set Worker Task")
            .setDescription("Assigns a specific task to a worker based on the provided worker_id and work_id.")
            .setTags("Workers")
            .setOperationId("setWorkerTask")
            .addRequestBody({
                description: "Set Worker Task",
                body: {
                    worker_id: { type: "integer", example: 1 },
                    work_id: { type: "integer", example: 1 }
                }
            })
            .addSuccessResponse("Worker task set successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Worker task updated successfully" }
                }
            })
            .addBadRequestResponse("Missing or invalid parameters")
            .addServerErrorResponse()
            .build()
    }
}