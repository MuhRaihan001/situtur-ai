const { Meta } = require("../../handler/meta");
const Workers = require("../../handler/worker");
const { isUser } = require("../../middleware/auth");

const workersHandler = new Workers();

module.exports = {
    middleware: [isUser],
    PUT: {
        handler: async function (req, res) {
            try {
                const { id, worker_name, phone_number } = req.body;
                if (!id) return res.status(400).json({ success: false, error: "Worker ID is required." });

                let affectedRows = 0;
                let lastError = null;

                if (worker_name) {
                    const result = await workersHandler.updateWorkerData(id, 'worker_name', worker_name);
                    if (result.status === 200) affectedRows += (result.affectedRows || 1);
                    else lastError = result.message;
                }
                
                if (phone_number) {
                    const result = await workersHandler.updateWorkerData(id, 'phone_number', phone_number);
                    if (result.status === 200) affectedRows += (result.affectedRows || 1);
                    else lastError = result.message;
                }

                if (lastError && affectedRows === 0) {
                    return res.status(400).json({ success: false, message: lastError });
                }

                if (affectedRows === 0) {
                    return res.status(404).json({ success: false, message: "Worker not found or no changes made" });
                }

                res.status(200).json({ success: true, message: "Worker updated successfully" });
            } catch (error) {
                console.error("Error in PUT /workers/update:", error);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Update Worker")
            .setDescription("Updates worker information including name and phone number.")
            .setTags("Workers")
            .setOperationId("updateWorker")
            .addRequestBody({
                description: "Worker data to update",
                body: {
                    id: { type: "integer", example: 1 },
                    worker_name: { type: "string", example: "Jane Doe" },
                    phone_number: { type: "string", example: "+6281234567890" }
                }
            })
            .addSuccessResponse("Worker updated successfully")
            .addBadRequestResponse("Missing ID")
            .addServerErrorResponse()
            .build()
    }
};
