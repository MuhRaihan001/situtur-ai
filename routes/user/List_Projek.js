const { Meta } = require("../../handler/meta");
const Database = require("../../handler/database");
const db = new Database();

module.exports = {
    GET: {
        handler: async function (req, res) {
            try {
                const query = "SELECT ID, Id_User, Nama_Proyek FROM proyek";
                const projects = await db.query(query);
                
                res.status(200).json({
                    success: true,
                    message: "Berhasil mengambil daftar proyek",
                    projects: projects.map(p => ({
                        id: p.ID,
                        name: p.Nama_Proyek,
                        id_user: p.Id_User,
                        // Mocking some data that might not be in the table yet but needed for UI
                        location: "Jakarta", 
                        progress: Math.floor(Math.random() * 100),
                        status: "On Track",
                        dueDate: "2025-12-31"
                    }))
                });
            } catch (error) {
                console.error("Error in GET /user/List_Projek:", error);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },
        meta: new Meta()
            .setSummary("Mengambil daftar proyek")
            .setDescription("Endpoint ini digunakan untuk mengambil seluruh data proyek yang tersimpan dalam sistem.")
            .setTags("Projects")
            .setOperationId("getProjectsList")
            .addSuccessResponse("Berhasil mengambil daftar proyek")
            .addServerErrorResponse()
            .build()
    }
};
