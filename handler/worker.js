const Database = require("./database");
const Works = require("./work");
const database = new Database();
const worksHandler = new Works();

class Workers {

    async list() {
        const query = "SELECT * FROM workers";
        const result = await database.query(query);
        if (result.length === 0)
            return { status: 404, message: "No Workers", workers: [] };
        return { status: 200, message: "Success", workers: result };
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
            await database.query(query, [value, worker_id]);
            return { status: 200, message: "Worker updated successfully" };
        } catch (error) {
            console.error("Error updating worker:", error);
            return { status: 500, message: "Error updating worker" };
        }
    }

    async deleteWorker(worker_id) {
        try {
            const query = "DELETE FROM workers WHERE id = ?";
            await database.query(query, [worker_id]);
            return { status: 200, message: "Worker deleted successfully" };
        } catch (error) {
            console.error("Error deleting worker:", error);
            return { status: 500, message: "Error deleting worker" };
        }
    }

    async getWorkerData(worker_id) {
        const query = "SELECT * FROM workers WHERE id = ?";
        return await database.query(query, [worker_id]);
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