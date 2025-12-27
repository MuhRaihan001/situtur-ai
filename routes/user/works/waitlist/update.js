const { Meta } = require("../../../../handler/meta");
const Works = require("../../../../handler/work");

const worksHandler = new Works();

module.exports = {
    POST: {
        handler: async function (req, res) {
            try {
                const { work_id, column, value } = req.body;

                if (!work_id || !column || value === undefined) {
                    return res.status(400).json({ error: "work_id, column, and value are required." });
                }

                const result = await worksHandler.updateWaitlist(work_id, column, value);
                res.status(result.status).json({ message: result.message });
            } catch (error) {
                console.error("Error in POST /works/waitlist/update:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Update Work Waitlist")
            .setDescription("Updates the specified column of a work item in the waitlist.")
            .setTags("Works")
            .setOperationId("updateWorkWaitlist")
            .addRequestBody({
                description: "Update Work Waitlist",
                body: {
                    work_id: { type: "integer", example: 1 },
                    column: { type: "string" },
                    value: { type: "string" }
                }
            })

            .addSuccessResponse("Work waitlist updated successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Updated successfully" }
                }
            })
            .addBadRequestResponse("Missing or invalid parameters")
            .addServerErrorResponse()
            .build()
    }
}