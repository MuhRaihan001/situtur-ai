const { Meta } = require("../../handler/meta");
const Workers = require("../../handler/worker");

const workersHandler = new Workers();

module.exports = {
    POST: {
        handler: async function (req, res) {
            try {
                const { worker_name, phone_number } = req.body;
                if (!worker_name || !phone_number) 
                    return res.status(400).json({ error: "worker_name and phone_number are required." });

                const result = await workersHandler.addWorker(phone_number, worker_name);
                res.status(result.status).json({ success: result.status === 201, message: result.message });
            } catch (error) {
                console.error("Error in POST /workers/add:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        },

        meta: new Meta()
            .setSummary("Add New Worker")
            .setDescription("Adds a new worker to the system with the provided name and phone number.")
            .setTags("Workers")
            .setOperationId("addNewWorker")
            .addRequestBody({
                description: "Add New Worker",
                body: {
                    worker_name: { type: "string", example: "Jane Doe" },
                    phone_number: { type: "string", example: "+6281234567890" }
                }
            })
            .addSuccessResponse("Worker added successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Worker added successfully" }
                }
            })
            .addBadRequestResponse("Missing or invalid parameters")
            .addServerErrorResponse()
            .build()
    }
}