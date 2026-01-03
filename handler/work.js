const Instructor = require("../model/instructions");
const Database = require("./database");
const AuditService = require("./audit");
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
    formatToDateOnly(date) {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    validateDates(startedAt, deadline) {
        if (!startedAt || !deadline) return true;
        const start = new Date(startedAt);
        const end = new Date(deadline);
        // Reset hours to compare only dates
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return start <= end;
    }

    calculateStatus(progress) {
        const p = Number(progress);
        if (p === 0) return 'pending';
        if (p >= 1 && p <= 99) return 'in_progress';
        if (p >= 100) return 'completed';
        return 'pending';
    }

    async list(id_proyek = null) {
        let query = `
            SELECT 
                w.id, 
                w.work_name, 
                w.progress, 
                w.status, 
                w.priority,
                w.started_at , 
                w.finished_at,
                w.deadline,
                w.id_Proyek,
                wk.worker_name as assignee_name,
                p.Nama_Proyek,
                p.due_date as project_deadline
            FROM work w
            LEFT JOIN workers wk ON w.id = wk.current_task
            LEFT JOIN proyek p ON w.id_Proyek = p.ID`;
        
        const params = [];
        if (id_proyek) {
            query += ` WHERE w.id_Proyek = ?`;
            params.push(id_proyek);
        }

        const result = await database.query(query, params);
        
        let teamSize = 0;
        let projectInfo = null;

        if (id_proyek) {
            // Fetch team size
            const teamQuery = `
                SELECT COUNT(DISTINCT wk.id) as team_size
                FROM workers wk
                JOIN work w ON (wk.current_task = w.id OR wk.finished_task = w.id)
                WHERE w.id_Proyek = ?`;
            const teamResult = await database.query(teamQuery, [id_proyek]);
            teamSize = teamResult[0]?.team_size || 0;

            // Fetch project info separately in case there are no works yet
            const projectQuery = `SELECT Nama_Proyek, due_date FROM proyek WHERE ID = ?`;
            const projectResult = await database.query(projectQuery, [id_proyek]);
            if (projectResult.length > 0) {
                projectInfo = {
                    Nama_Proyek: projectResult[0].Nama_Proyek,
                    project_deadline: this.formatToDateOnly(projectResult[0].due_date)
                };
            }
        }

        const response = result.map((work) => {
            return {
                ...work,    
                raw_deadline: work.deadline,
                raw_started_at: work.started_at,
                raw_finished_at: work.finished_at,
                started_at: work.started_at ? this.formatToDateOnly(work.started_at) : null,
                finished_at: work.finished_at ? formatID(work.finished_at) : null,
                deadline: work.deadline ? this.formatToDateOnly(work.deadline) : 'TBD',
                project_deadline: work.project_deadline ? this.formatToDateOnly(work.project_deadline) : (projectInfo ? projectInfo.project_deadline : null)
            }
        });

        return { 
            status: 200, 
            success: true, 
            message: result.length === 0 ? "No Items" : "Success", 
            works: response, 
            team_size: teamSize,
            project: projectInfo
        }
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
            started_at, 
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

            // If we updated a task, recalculate project stats
            if (action.table_name === 'work' && Newaction.matched_task_ids && Newaction.matched_task_ids.length > 0) {
                for (const taskId of Newaction.matched_task_ids) {
                    const [task] = await database.query("SELECT id_Proyek FROM work WHERE id = ?", [taskId]);
                    if (task && task.id_Proyek) {
                        await this.updateProjectStats(task.id_Proyek);
                    }
                }
            }

            await database.query(`DELETE FROM query_actions WHERE id = ?`, [work_id]);

            return { status: 200, message: "Action updated" };

        } catch (error) {
            throw error;
        }
    }

    async addWork({ work_name, deadline, id_Proyek, progress }) {
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

            const currentProgress = progress !== undefined ? Number(progress) : 0;
            const currentStatus = this.calculateStatus(currentProgress);
            
            // Auto-set started_at if progress has started
            let started_at = null;
            if (currentProgress >= 1 || currentStatus !== 'pending') {
                started_at = this.formatToDateOnly(new Date());
            }

            // Validation: started_at <= deadline
            if (started_at && deadline && !this.validateDates(started_at, deadline)) {
                return { status: 400, message: "Started date cannot be later than deadline" };
            }
            
            const query = `INSERT INTO work (work_name, started_at, deadline, id_Proyek, status, progress) VALUES (?, ?, ?, ?, ?, ?)`;
            await database.query(query, [
                work_name, 
                started_at, 
                this.formatToDateOnly(deadline), 
                projectId, 
                currentStatus, 
                currentProgress
            ]);

            // Recalculate project stats
            await this.updateProjectStats(projectId);

            return { status: 201, message: "New work created" };
        } catch (error) {
            throw error;
        }
    }

    async updateWork(work_id, { work_name, deadline, progress }) {
        try {
            // Get current work state to check for status/progress transitions
            const [currentWork] = await database.query(
                "SELECT id_Proyek, started_at, status, progress, deadline FROM work WHERE id = ?", 
                [work_id]
            );
            
            if (!currentWork) return { status: 404, message: "Work not found" };

            const updates = [];
            const params = [];

            if (work_name !== undefined) {
                updates.push("work_name = ?");
                params.push(work_name);
            }

            let newDeadline = deadline !== undefined ? this.formatToDateOnly(deadline) : this.formatToDateOnly(currentWork.deadline);
            if (deadline !== undefined) {
                updates.push("deadline = ?");
                params.push(newDeadline);
            }

            const targetProgress = progress !== undefined ? Number(progress) : currentWork.progress;
            const targetStatus = this.calculateStatus(targetProgress);

            if (progress !== undefined) {
                updates.push("progress = ?");
                params.push(targetProgress);
            }
            
            // Always update status based on progress
            updates.push("status = ?");
            params.push(targetStatus);

            // Auto-set started_at logic
            let currentStartedAt = currentWork.started_at;

            if (!currentStartedAt && (targetProgress >= 1 || (targetStatus !== 'pending' && currentWork.status === 'pending'))) {
                currentStartedAt = this.formatToDateOnly(new Date());
                updates.push("started_at = ?");
                params.push(currentStartedAt);
            }

            // Validation: started_at <= deadline
            if (currentStartedAt && newDeadline && !this.validateDates(currentStartedAt, newDeadline)) {
                return { status: 400, message: "Started date cannot be later than deadline" };
            }

            if (updates.length === 0) return { status: 400, message: "No fields to update" };

            const projectId = currentWork.id_Proyek;

            params.push(work_id);
            const query = `UPDATE work SET ${updates.join(", ")} WHERE id = ?`;
            await database.query(query, params);

            // Recalculate project stats
            if (projectId) {
                await this.updateProjectStats(projectId);
            }

            return { status: 200, message: "Work updated successfully" };
        } catch (error) {
            throw error;
        }
    }

    async updateProjectStats(projectId) {
        try {
            const tasks = await database.query("SELECT status, progress FROM work WHERE id_Proyek = ?", [projectId]);
            if (tasks.length === 0) {
                await database.query("UPDATE proyek SET progress = 0, status = 'Pending' WHERE ID = ?", [projectId]);
                return;
            }

            // Calculate progress based on completion percentage (User formula)
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const avgProgress = Math.round((completedTasks / tasks.length) * 100);

            // Check if any task has progress >= 1% or status is not pending for status transition
            const hasStarted = tasks.some(t => t.progress >= 1 || t.status !== 'pending');

            const [currentProject] = await database.query("SELECT status FROM proyek WHERE ID = ?", [projectId]);
            
            let newStatus = currentProject.status;
            if (hasStarted && currentProject.status === 'Pending') {
                newStatus = 'In Progress';
                
                // Log to audit table
                await AuditService.log({
                    action: 'SYSTEM_UPDATE',
                    tableName: 'proyek',
                    recordId: projectId,
                    oldValues: { status: currentProject.status },
                    newValues: { status: 'In Progress' },
                    reason: 'Automatic status update based on task progress'
                });

                console.log(`[PROJECT LOG] Project ${projectId} status changed from Pending to In Progress due to task activity.`);
            }

            // If progress is 100%, consider auto-completing project (optional but good practice)
            if (avgProgress === 100 && newStatus !== 'Compleated') {
                newStatus = 'Compleated';
            }

            // Update project table
            await database.query(
                "UPDATE proyek SET progress = ?, status = ? WHERE ID = ?",
                [avgProgress, newStatus, projectId]
            );

        } catch (error) {
            console.error(`[PROJECT STATS ERROR] Error updating project ${projectId}:`, error);
        }
    }

    async deleteWork(work_id) {
        try {
            const workData = await database.query("SELECT id_Proyek FROM work WHERE id = ?", [work_id]);
            if (!workData || workData.length === 0) 
                return { status: 404, message: "Work not found" };

            const projectId = workData[0].id_Proyek;

            const query = `DELETE FROM work WHERE id = ?`;
            await database.query(query, [work_id]);

            // Recalculate project stats
            if (projectId) {
                await this.updateProjectStats(projectId);
            }

            return { status: 200, message: "Deleted sucessfully" }
        } catch (error) {
            throw error;
        }
    }


}

module.exports = Works;