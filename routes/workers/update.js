const { Meta } = require("../../handler/meta");
const Workers = require("../../handler/worker");

const workersHandler = new Workers();

module.exports = {
    PUT: {
        handler: async function (req, res) {
            try {
                const { id, worker_name, phone_number } = req.body;
                if (!id) return res.status(400).json({ success: false, error: "Worker ID is required." });

                if (worker_name) {
                    await workersHandler.updateWorkerData(id, 'worker_name', worker_name);
                }
                if (phone_number) {
                    const waId = phone => `62${phone.replace(/[^0-9]/g, "").replace(/^(\+?62|0)/, "")}@c.us`;
                    await workersHandler.updateWorkerData(id, 'phone_number', waId(phone_number));
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
