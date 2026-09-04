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

    async getProjectTasks(id_proyek) {
        try {
            // Get Project Details
            const projectQuery = `SELECT * FROM Proyek WHERE ID = ?`;
            const project = await database.query(projectQuery, [id_proyek]);
            
            if (project.length === 0) return { status: 404, message: "Project not found" };

            // Get Tasks (work items) for this project
            const tasksQuery = `
                SELECT 
                    w.id, 
                    w.work_name, 
                    w.progress, 
                    w.status, 
                    w.priority,
                    w.category,
                    w.deadline,
                    w.created_at,
                    wr1.worker_name as current_worker,
                    wr2.worker_name as finished_worker
                FROM work w
                LEFT JOIN workers wr1 ON w.Current_task = wr1.id
                LEFT JOIN workers wr2 ON w.Finished_Task = wr2.id
                WHERE w.id_Proyek = ?
            `;
            const tasks = await database.query(tasksQuery, [id_proyek]);

            // Calculate overall progress
            const totalTasks = tasks.length;
            const overallProgress = totalTasks > 0 
                ? Math.round(tasks.reduce((acc, task) => acc + (task.progress || 0), 0) / totalTasks)
                : 0;

            return {
                status: 200,
                message: "Success",
                data: {
                    project: project[0],
                    tasks: tasks.map(t => ({
                        ...t,
                        deadline: t.deadline ? formatID(t.deadline) : null,
                        created_at: t.created_at ? formatID(t.created_at) : null
                    })),
                    overallProgress,
                    totalTasks,
                    completedTasks: tasks.filter(t => t.progress === 100).length
                }
            };
        } catch (error) {
            console.error("Error in getProjectTasks:", error);
            throw error;
        }
    }

    async list() {
        const query = `
            SELECT 
                id, 
                work_name, 
                progress, 
                status, 
                starterd_at, 
                finished_at 
            FROM work`
        const result = await database.query(query);
        if (result.length === 0)
            return { status: 404, message: "No Items", works: [] };

        const response = result.map((work) => {

            return {
                ...work,

                starterd_at: formatID(work.starterd_at),
                finished_at: formatID(work.finished_at)
            }
        });
        return { status: 200, message: "Success", works: response }
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

    async addWork({ work_name, deadline }) {
        try {
            if (!work_name || !deadline) 
                return { status: 400, message: "Missing required fields" };

            const starterd_at = Date.now();
            
            const query = `INSERT INTO work (work_name, starterd_at, deadline) VALUE (?, ?, ?)`;
            await database.query(query, [work_name, starterd_at, deadline]);

            return { status: 201, message: "New work created" };
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