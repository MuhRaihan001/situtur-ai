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