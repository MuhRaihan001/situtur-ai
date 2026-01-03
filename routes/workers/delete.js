const { Meta } = require("../../handler/meta");
const Workers = require("../../handler/worker");

const workersHandler = new Workers();

module.exports = {
    DELETE: {
        handler: async function (req, res) {
            try {
                const { id } = req.body;
                if (!id) return res.status(400).json({ success: false, error: "Worker ID is required." });

                const result = await workersHandler.deleteWorker(id);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: "Worker not found" });
                }
                res.status(result.status).json({ success: result.status === 200, message: result.message });
            } catch (error) {
                console.error("Error in DELETE /workers/delete:", error);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Delete Worker")
            .setDescription("Deletes a worker from the system by ID.")
            .setTags("Workers")
            .setOperationId("deleteWorker")
            .addRequestBody({
                description: "Worker ID to delete",
                body: {
                    id: { type: "integer", example: 1 }
                }
            })
            .addSuccessResponse("Worker deleted successfully")
            .addBadRequestResponse("Missing ID")
            .addServerErrorResponse()
            .build()
    }
};
