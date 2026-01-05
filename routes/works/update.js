const { Meta } = require("../../handler/meta");
const Works = require("../../handler/work");
const { isUser } = require("../../middleware/auth");
const Tokenizer = require("../../handler/token");
const workHandler = new Works();
const token = new Tokenizer();

module.exports = {
    middleware: [isUser],
    PUT: {
        handler: async (req, res) => {
            try {
                const db = req.app.locals.db;
                const { id, work_name, deadline, progress } = req.body;
                if (!id) return res.status(400).json({ success: false, error: "Task ID is required." });

                // Validasi kepemilikan melalui proyek
                const rawData = req.signedCookies.userData;
                const user = await token.verify(rawData);
                const id_user = user.id_user;

                const checkOwnership = await db.query(
                    `SELECT w.id FROM work w 
                     JOIN proyek p ON w.id_Proyek = p.ID 
                     WHERE w.id = ? AND p.Id_User = ?`,
                    [id, id_user]
                );

                if (checkOwnership.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: "Anda tidak memiliki akses ke tugas ini."
                    });
                }

                const result = await workHandler.updateWork(id, { work_name, deadline, progress });
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
