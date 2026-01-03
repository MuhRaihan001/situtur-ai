const { Meta } = require("../../../handler/meta");
const Works = require("../../../handler/work");
const { isAdmin } = require("../../../middleware/auth");

const worksHandler = new Works();
module.exports = {
    POST: {
        middleware: isAdmin,
        handler: async function (req, res) {
            try {
                const { work_id } = req.body;
                if (!work_id)
                    return res.status(400).json({ error: "work_id is required." });

                const result = await worksHandler.acceptUpdate(work_id);
                res.status(result.status).json({ message: result.message });

            } catch (error) {
                console.error("Error in POST /works/waitlist/accept:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        },

        meta: new Meta()
            .setSummary("Accept Work Update from Waitlist")
            .setDescription("Accepts a work update request from the waitlist based on the provided work_id.")
            .setTags("Works")
            .setOperationId("acceptWorkUpdateWaitlist")
            .addRequestBody({
                description: "Accept Work Update from Waitlist",
                body: {
                    work_id: { type: "integer", example: 1 }
                }
            })
            .addSuccessResponse("Work update accepted successfully", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Action updated." }
                }
            })
            .addBadRequestResponse("Missing or invalid work_id")
            .addServerErrorResponse()
            .build()    
    }
}