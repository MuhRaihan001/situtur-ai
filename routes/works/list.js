const { Meta } = require("../../handler/meta");
const Works = require("../../handler/work");

const work = new Works();

module.exports = {
    GET: {
        handler: async function (req, res) {
            try {
                const project_id = req.query.project_id || null;
                const works = await work.list(project_id);
                res.status(works.status).json({
                    success: true,
                    works: works.works
                });
            } catch (error) {
                console.error("Error in GET /works/list:", error);
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
            .addQueryParam("project_id", "Filter berdasarkan ID proyek", false, "integer") // Tambah param ini
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
