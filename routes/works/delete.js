const Works = require("../../handler/work");
const { Meta } = require("../../handler/meta")
const { isUser } = require("../../middleware/auth");
const Tokenizer = require("../../handler/token");
const workHandler = new Works();
const token = new Tokenizer();

module.exports = {
    middleware: [isUser],
    DELETE: {
        handler: async (req, res) => {
            try {
                const db = req.app.locals.db;
                const { work_id } = req.body;
                if (!work_id) return res.status(400).json({ success: false, error: "Task ID is required." });

                // Validasi kepemilikan melalui proyek
                const rawData = req.signedCookies.userData;
                const user = await token.verify(rawData);
                const id_user = user.id_user;

                const checkOwnership = await db.query(
                    `SELECT w.id FROM work w 
                     JOIN proyek p ON w.id_Proyek = p.ID 
                     WHERE w.id = ? AND p.Id_User = ?`,
                    [work_id, id_user]
                );

                if (checkOwnership.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: "Anda tidak memiliki akses ke tugas ini."
                    });
                }

                const result = await workHandler.deleteWork(work_id);
                return res.status(result.status).json({ 
                    success: result.status === 200, 
                    message: result.message 
                });
            } catch (error) {
                console.error("Error in DELETE /works/delete:", error);
                return res.status(500).json({ success: false, error: "Internal Server Error" });
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