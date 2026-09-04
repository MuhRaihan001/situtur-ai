const { Meta } = require("../../../handler/meta");
const Works = require("../../../handler/work");
const { isLoggedIn, isUser } = require("../../../middleware/auth");

const work = new Works();

module.exports = {
    middleware: [isLoggedIn, isUser],
    GET: {
        handler: async function (req, res, next) {
            const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
            if (isHtmlRequest && !req.headers.accept.includes('application/json') && !req.xhr) {
                return next();
            }

            try {
                const db = req.app.locals.db;
                const id_user = req.session.user.id_user;
                let id_proyek = req.query.id_proyek;

                // If no id_proyek, get the first project of the user
                if (!id_proyek) {
                    const firstProject = await db.query(
                        'SELECT ID FROM Proyek WHERE Id_User = ? LIMIT 1',
                        [id_user]
                    );
                    if (firstProject.length > 0) {
                        id_proyek = firstProject[0].ID;
                    }
                }

                if (!id_proyek) {
                    return res.status(404).json({ success: false, message: "No project found for this user" });
                }

                const result = await work.getProjectTasks(id_proyek);
                
                // Fetch stats for the specific project
                const stats = {
                    daysLeft: 142, // Placeholder
                    teamSize: 48,  // Placeholder
                    attachments: [
                        { name: "Site_Plan_Revision_V4.pdf", size: "2.4 MB", date: "2 hrs ago", type: "pdf" },
                        { name: "Station_Electrical.dwg", size: "15.8 MB", date: "Yesterday", type: "dwg" },
                        { name: "Q3_Budget_Estimation.xlsx", size: "1.2 MB", date: "Oct 25", type: "xls" },
                        { name: "Foundation Framework.png", size: "9.8 MB", date: "Sep 25", type: "png" }
                    ]
                };

                res.status(result.status).json({
                    success: true,
                    data: {
                        ...result.data,
                        stats
                    }
                });

            } catch (error) {
                console.error("Error in GET /user/works/list:", error);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        },

        meta: new Meta()
            .setSummary("Mengambil daftar karya")
            .setDescription(
                "Endpoint ini digunakan untuk mengambil seluruh data karya yang tersimpan dalam sistem."
            )
            .setTags("Works")
            .setOperationId("getWorksList")

            .addSuccessResponse("Berhasil mengambil daftar karya", {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1
                        },
                        work_name: {
                            type: "string",
                            example: "Pembuatan API OpenAI"
                        },
                        progress: {
                            type: "integer",
                            example: 80
                        },
                        status: {
                            type: "string",
                            example: "on_progress"
                        },
                        starterd_at: {
                            type: "string",
                            example: "25 Desember 2025 10.00.00"
                        },
                        finished_at: {
                            type: "string",
                            example: "30 Desember 2025 18.00.00"
                        }
                    }
                }
            })

            .addNotFoundResponse("Tidak ada data karya")
            .addServerErrorResponse()
            .build()
            
    }
    
};
