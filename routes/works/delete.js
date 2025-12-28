const Works = require("../../handler/work");
const { Meta } = require("../../handler/meta")
const workHandler = new Works();

module.exports = {
    DELETE: {
        handler: async (req, res) => {
            try {
                const { work_id } = req.body;
                const result = await workHandler.deleteWork(work_id);
                return res.status(result.status).json({ message: result.message });
            } catch (error) {
                console.error("Error in DELETE /works/delete:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Delete Work from list")
            .setDescription("This endpoint deletes a work item from the list based on the provided work_id.")
            .setTags("Works")
            .setOperationId("deleteWork")
            .addRequestBody({
                description: "Work ID to be deleted",
                body: {
                    work_id: { type: "integer", example: 1 }
                }
            })
            .addSuccessResponse("deleted successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Deleted successfully" }
                }
            })
            .addNotFoundResponse("Work not found")
            .addServerErrorResponse()
            .build()
    }
}