const { Meta } = require("../../handler/meta")
const Works = require("../../handler/work")
const workHandler = new Works();

module.exports = {
    POST: {
        handler:  async (req, res) => {
            try {
                const { work_name, deadline, id_Proyek } = req.body;
                if (!work_name || !deadline) return res.status(400).json({ success: false, error: "Missing required fields" });

                const result = await workHandler.addWork({ work_name, deadline, id_Proyek });
                return res.status(result.status).json({ 
                    success: result.status === 201 || result.status === 200,
                    message: result.message 
                });
            } catch (error) {
                console.error("Error in POST /works/add:", error);
                return res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Add New Work")
            .setDescription("This endpoint adds a new work item to the list with the provided details.")
            .setTags("Works")
            .setOperationId("addWork")
            .addRequestBody({
                description: "Details of the work to be added",
                body: {
                    work_name: { type: "string", example: "Develop New Feature" },
                    deadline: { type: "TIMESTAMP", example: "2026-01-01 12:00:00" }
                }
            })
            .addSuccessResponse("New work created successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "New work created successfully" }
                }
            })
            .addBadRequestResponse("Missing required fields")
            .addServerErrorResponse()
            .build()
    }
}