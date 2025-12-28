const { Meta } = require("../../handler/meta")
const Works = require("../../handler/work")
const workHandler = new Works();

module.exports = {
    POST: {
        handler:  async (req, res) => {
            try {
                const { work_name, deadline } = req.body;
                const result = await workHandler.addWork({ work_name, deadline });
                return res.status(result.status).json({ message: result.message });
            } catch (error) {
                console.error("Error in POST /works/add:", error);
                return res.status(500).json({ error: "Internal Server Error" });
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
                    deadline: { type: "integer", example: 1704067200000 }
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