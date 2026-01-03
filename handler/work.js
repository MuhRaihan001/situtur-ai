const Instructor = require("../model/instructions");
const Database = require("./database");
const database = new Database();
const instruction = new Instructor();

const formatID = date =>
    new Date(date).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

class Works {

    async list(project_id = null) {
        let query = `
        SELECT 
            w.id, 
            w.work_name, 
            w.progress, 
            w.status, 
            w.starterd_at, 
            w.finished_at,
            w.deadline,
            w.id_Proyek,

            wk.worker_name AS assignee_name,

            p.Nama_Proyek,
            p.status AS project_status,
            p.due_date AS project_due_date
        FROM work w
        LEFT JOIN workers wk 
            ON w.id = wk.current_task
        LEFT JOIN proyek p
            ON w.id_Proyek = p.ID
    `;

        const params = [];

        // Tambahkan filter berdasarkan project_id jika ada
        if (project_id) {
            query += ` WHERE w.id_Proyek = ?`;
            params.push(project_id);
        }

        const result = await database.query(query, params);

        if (result.length === 0)
            return { status: 200, message: "No Items", works: [] };

        const response = result.map((work) => ({
            id: work.id,
            work_name: work.work_name,
            progress: work.progress,
            status: work.status,
            assignee_name: work.assignee_name,

            raw_deadline: work.deadline,
            raw_started_at: work.starterd_at,
            raw_finished_at: work.finished_at,

            starterd_at: formatID(work.starterd_at),
            finished_at: work.finished_at ? formatID(work.finished_at) : null,
            deadline: work.deadline ? formatID(work.deadline) : 'TBD',

            project: {
                id: work.id_Proyek,
                name: work.Nama_Proyek,
                status: work.project_status,
                due_date: work.project_due_date
            }
        }));

        return { status: 200, message: "Success", works: response };
    }

    async waitList(work) {
        if (!work || typeof work !== "object") {
            throw new Error("Work object is required");
        }

        const {
            method,
            table,
            columns = [],
            where = [],
            params = [],
            ambiguity_level = "low",
            confidence = 0,
            matched_task_ids = [],
            reason = ""
        } = work;

        const sql = `
        INSERT INTO query_actions (
            method,
            table_name,
            columns,
            whereClause,
            params,
            ambiguity_level,
            confidence,
            matched_task_ids,
            reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            method,
            table,
            JSON.stringify(columns),
            JSON.stringify(where),
            JSON.stringify(params),
            ambiguity_level,
            confidence,
            JSON.stringify(matched_task_ids),
            reason
        ];

        await database.query(sql, values);
        return { status: 201, message: "New wait list created" };
    }

    async getWorkData(work_id) {
        const query = `
        SELECT 
            id, 
            work_name, 
            progress, 
            status, 
            starterd_at, 
            finished_at 
        FROM work WHERE id = ?`;
        const rows = await database.query(query, [work_id]);
        return rows[0];
    }

    async updateWaitlist(work_id, colomn, value) {
        try {
            const query = `UPDATE query_actions SET ${colomn} = ? WHERE id = ?`;
            await database.query(query, [value, work_id]);

            return { status: 200, message: "Updated sucessfully" }

        } catch (error) {
            throw error;
        }
    }

    async acceptUpdate(work_id) {
        try {
            const query = `
            SELECT 
                method,
                table_name,
                columns,
                whereClause,
                params,
                ambiguity_level,
                confidence,
                matched_task_ids,
                reason
            FROM query_actions
            WHERE id = ?
        `;

            const [action] = await database.query(query, [work_id]);

            const Newaction = {
                method: action.method,
                table: action.table_name,
                columns: JSON.parse(action.columns),
                where: JSON.parse(action.whereClause),
                params: JSON.parse(action.params),
                ambiguity_level: action.ambiguity_level,
                confidence: Number(action.confidence),
                matched_task_ids: JSON.parse(action.matched_task_ids),
                reason: action.reason
            };

            const newQuery = instruction.generateMysqlQuery(Newaction);
            console.log("Generated SQL:", newQuery);

            await database.query(newQuery.sql, newQuery.params);
            await database.query(`DELETE FROM query_actions WHERE id = ?`, [work_id]);

            return { status: 200, message: "Action updated" };

        } catch (error) {
            throw error;
        }
    }

    async addWork({ work_name, deadline, id_Proyek }) {
        try {
            if (!work_name || !deadline)
                return { status: 400, message: "Missing required fields" };

            // Ensure we have an id_Proyek
            let projectId = id_Proyek;
            if (!projectId) {
                const projects = await database.query("SELECT ID FROM proyek LIMIT 1");
                if (projects.length > 0) {
                    projectId = projects[0].ID;
                } else {
                    // Create a default project if none exists
                    const result = await database.query("INSERT INTO proyek (Id_User, Nama_Proyek) VALUES (2, 'Default Project')");
                    projectId = result.insertId;
                }
            }

            const starterd_at = Date.now();

            const query = `INSERT INTO work (work_name, starterd_at, deadline, id_Proyek) VALUES (?, ?, ?, ?)`;
            await database.query(query, [work_name, starterd_at, deadline, projectId]);

            return { status: 201, message: "New work created" };
        } catch (error) {
            throw error;
        }
    }

    async updateWork(work_id, { work_name, deadline, progress, status }) {
        try {
            const updates = [];
            const params = [];

            if (work_name !== undefined) {
                updates.push("work_name = ?");
                params.push(work_name);
            }
            if (deadline !== undefined) {
                updates.push("deadline = ?");
                params.push(deadline);
            }
            if (progress !== undefined) {
                updates.push("progress = ?");
                params.push(progress);
            }
            if (status !== undefined) {
                updates.push("status = ?");
                params.push(status);
            }

            if (updates.length === 0) return { status: 400, message: "No fields to update" };

            params.push(work_id);
            const query = `UPDATE work SET ${updates.join(", ")} WHERE id = ?`;
            await database.query(query, params);

            return { status: 200, message: "Work updated successfully" };
        } catch (error) {
            throw error;
        }
    }

    async deleteWork(work_id) {
        try {
            const workData = await this.getWorkData(work_id);
            if (!workData || workData.length === 0)
                return { status: 404, message: "Work not found" };

            const query = `DELETE FROM work WHERE id = ?`;
            await database.query(query, [work_id]);

            return { status: 200, message: "Deleted sucessfully" }
        } catch (error) {
            throw error;
        }
    }


}

module.exports = Works;