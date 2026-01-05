const { Meta } = require("../../handler/meta")
const Works = require("../../handler/work")
const { isUser } = require("../../middleware/auth");
const Tokenizer = require("../../handler/token");
const workHandler = new Works();
const token = new Tokenizer();

module.exports = {
    middleware: [isUser],
    POST: {
        handler:  async (req, res) => {
            try {
                const db = req.app.locals.db;
                const { work_name, deadline, id_proyek, progress } = req.body;
                
                if (!work_name || !deadline || !id_proyek) {
                    return res.status(400).json({ success: false, error: "Nama tugas, deadline, dan ID Proyek wajib diisi" });
                }

                // Validasi kepemilikan proyek
                const rawData = req.signedCookies.userData;
                const user = await token.verify(rawData);
                const id_user = user.id_user;

                const checkProject = await db.query(
                    "SELECT ID FROM proyek WHERE ID = ? AND Id_User = ?",
                    [id_proyek, id_user]
                );

                if (checkProject.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: "Anda tidak memiliki akses ke proyek ini atau proyek tidak ditemukan."
                    });
                }

                const result = await workHandler.addWork({ 
                    work_name, 
                    deadline, 
                    id_Proyek: id_proyek,
                    progress 
                });
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