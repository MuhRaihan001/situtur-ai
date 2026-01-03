const { Meta } = require("../../handler/meta");
const Works = require("../../handler/work");
const workHandler = new Works();

module.exports = {
    PUT: {
        handler: async (req, res) => {
            try {
                const { id, work_name, deadline, progress, status } = req.body;
                if (!id) return res.status(400).json({ success: false, error: "Task ID is required." });

                const result = await workHandler.updateWork(id, { work_name, deadline, progress, status });
                return res.status(result.status).json({ 
                    success: result.status === 200, 
                    message: result.message 
                });
            } catch (error) {
                console.error("Error in PUT /works/update:", error);
                return res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Update Task")
            .setDescription("Updates an existing task's details.")
            .setTags("Works")
            .setOperationId("updateWork")
            .addRequestBody({
                description: "Task details to update",
                body: {
                    id: { type: "integer", example: 1 },
                    work_name: { type: "string" },
                    deadline: { type: "TIMESTAMP" },
                    progress: { type: "integer" },
                    status: { type: "string" }
                }
            })
            .addSuccessResponse("Task updated successfully")
            .addBadRequestResponse("Missing ID")
            .addServerErrorResponse()
            .build()
    }
};
