const Database = require("./database");
const Works = require("./work");
const database = new Database();
const worksHandler = new Works();

class Workers {

    async list() {
        const query = `
            SELECT 
                wk.*, 
                w.work_name as current_task_name,
                p.Nama_Proyek as current_project_name
            FROM workers wk
            LEFT JOIN work w ON wk.current_task = w.id
            LEFT JOIN proyek p ON w.id_Proyek = p.ID
        `;
        const result = await database.query(query);
        
        // Calculate stats
        const totalWorkers = result.length;
        const currentlyOnSite = result.filter(w => w.status === 'Active').length;
        const onLeave = result.filter(w => w.status === 'Not active').length;
        
        // Growth calculation for Total Workers
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let growth = "0.0%";
        try {
            // Check if created_at exists (it might not be in the schema yet)
            const columns = await database.query("SHOW COLUMNS FROM workers LIKE 'created_at'");
            if (columns.length > 0) {
                const lastMonthWorkersRows = await database.query(
                    'SELECT COUNT(*) as count FROM workers WHERE created_at < ?',
                    [firstDayThisMonth]
                );
                const lastMonthWorkers = lastMonthWorkersRows[0] ? lastMonthWorkersRows[0].count : 0;
                const growthVal = lastMonthWorkers === 0 ? 0 : ((totalWorkers - lastMonthWorkers) / lastMonthWorkers * 100).toFixed(1);
                growth = (growthVal >= 0 ? '+' : '') + growthVal + '%';
            }
        } catch (e) {
            console.warn("Could not calculate worker growth:", e.message);
        }

        const stats = {
            totalWorkers,
            currentlyOnSite,
            onLeave,
            tasksPending: result.filter(w => w.current_task).length, // Estimate
            growth: growth
        };

        if (result.length === 0)
            return { status: 200, message: "No Workers", workers: [], stats };
        return { status: 200, message: "Success", workers: result, stats };
    }

    async addWorker(phone_number, name) {
        const waId = phone =>
            `62${phone.replace(/[^0-9]/g, "").replace(/^(\+?62|0)/, "")}@c.us`;

        const query = "INSERT INTO workers (worker_name, phone_number) VALUES (?, ?)";
        await database.query(query, [name, waId(phone_number)]);
        return { status: 201, message: "Worker added successfully" };
    }   

    async updateWorkerData(worker_id, column, value) {
        try {
            const query = `UPDATE workers SET ${column} = ? WHERE id = ?`;
            const result = await database.query(query, [value, worker_id]);
            return { 
                status: 200, 
                message: "Worker updated successfully",
                affectedRows: result.affectedRows 
            };
        } catch (error) {
            console.error("Error updating worker:", error);
            return { status: 500, message: "Error updating worker" };
        }
    }

    async deleteWorker(worker_id) {
        try {
            const query = "DELETE FROM workers WHERE id = ?";
            const result = await database.query(query, [worker_id]);
            return { 
                status: 200, 
                message: "Worker deleted successfully",
                affectedRows: result.affectedRows
            };
        } catch (error) {
            console.error("Error deleting worker:", error);
            return { status: 500, message: "Error deleting worker" };
        }
    }

    async getWorkerData(worker_id) {
        const query = "SELECT * FROM workers WHERE id = ?";
        return await database.query(query, [worker_id]);
    }

    async workerDataByPhone(phone_number) {
        const query = "SELECT id, worker_name, phone_number, current_task FROM workers WHERE phone_number = ?";
        const rows = await database.query(query, [phone_number]);
        return rows[0];
    }

    async setWorkerTask(worker_id, task_id) {
        const workerData = await this.getWorkerData(worker_id);
        if (!workerData || workerData.length === 0)
            return { status: 404, message: "Worker not found" };

        const taskData = await worksHandler.getWorkData(task_id);
        if (!taskData || taskData.length === 0)
            return { status: 404, message: "Task not found" };

        const query = "UPDATE workers SET current_task = ? WHERE id = ?";
        await database.query(query, [task_id, worker_id]);
        return { status: 200, message: "Worker task updated successfully" };
    }

    async getTopWorker() {
        const query = 'SELECT worker_name, phone_number, finished_task FROM workers ORDER BY finished_task DESC LIMIT 10';
        const rows = await database.query(query);
        return { status: 200, message: "Top workers sent to client", data: rows };
    }


}

module.exports = Workers;