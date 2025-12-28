const { isLoggedIn, isAdmin, isUser } = require('../../middleware/auth');
const db = require('../../config/database'); // Sesuaikan dengan konfigurasi database Anda

exports.GET = {
    middleware: [isLoggedIn, isUser],
    handler: async function (req, res, next) {
        try {
            const userId = req.session.user.id;
            const username = req.session.user.username;

            // Query untuk statistik
            const statsQuery = await db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM work WHERE id_User = ? AND status = 'pending') as tasksPending,
                    (SELECT COUNT(*) FROM work WHERE id_User = ? AND DATE(created_at) = CURDATE()) as newTasks,
                    (SELECT COUNT(DISTINCT id_Proyek) FROM work WHERE id_User = ? AND status = 'in_progress') as ongoingProjects,
                    (SELECT COALESCE(SUM(Finished_Task), 0) FROM work WHERE id_User = ? AND WEEK(created_at) = WEEK(CURDATE())) as hoursWorked,
                    (SELECT COALESCE(SUM(Finished_Task), 0) FROM work WHERE id_User = ? AND WEEK(created_at) = WEEK(CURDATE() - INTERVAL 1 WEEK)) as lastWeekHours,
                    (SELECT COUNT(*) FROM query_actions WHERE id_user = ? AND ambiguity_level IN ('medium', 'high') AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as safetyAlerts
            `, [userId, userId, userId, userId, userId, userId]);

            const stats = {
                tasksPending: statsQuery[0][0].tasksPending,
                newTasks: statsQuery[0][0].newTasks,
                ongoingProjects: statsQuery[0][0].ongoingProjects,
                hoursWorked: statsQuery[0][0].hoursWorked.toFixed(1),
                hoursIncrease: (statsQuery[0][0].hoursWorked - statsQuery[0][0].lastWeekHours).toFixed(1),
                safetyAlerts: statsQuery[0][0].safetyAlerts
            };

            // Query untuk chart Tahun Proyek (5 tahun terakhir)
            const yearChartQuery = await db.query(`
                SELECT 
                    YEAR(p.created_at) as year,
                    COUNT(*) as count
                FROM Proyek p
                WHERE p.id_User = ?
                AND YEAR(p.created_at) >= YEAR(CURDATE()) - 4
                GROUP BY YEAR(p.created_at)
                ORDER BY year ASC
            `, [userId]);

            const chartData = {
                years: yearChartQuery[0].map(row => row.year),
                values: yearChartQuery[0].map(row => row.count),
                totalProjects: yearChartQuery[0].reduce((sum, row) => sum + row.count, 0),
                trend: 8.5 // Hitung trend sebenarnya jika perlu
            };

            // Query untuk Priority Tasks
            const tasksQuery = await db.query(`
                    SELECT 
                        w.work_name as name,
                        p.Nama_Proyek as project,
                        w.status,
                        w.created_at as dueDate,
                        CASE 
                            WHEN w.status = 'urgent' THEN 'High Priority'
                            WHEN w.status = 'in_progress' THEN 'Logistics'
                            WHEN w.status = 'pending' THEN 'Routine'
                            ELSE 'Admin'
                        END as priority
                    FROM work w
                    JOIN Proyek p ON w.id_Proyek = p.ID
                    WHERE w.id_User = ?
                    AND w.status IN ('pending', 'in_progress', 'urgent')
                    ORDER BY 
                        CASE w.status
                            WHEN 'urgent' THEN 1
                            WHEN 'in_progress' THEN 2
                            WHEN 'pending' THEN 3
                            ELSE 4
                        END,
                        w.created_at DESC
                    LIMIT 4
            `, [userId]);

            const tasks = tasksQuery[0].map(task => {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                let dueDateText = 'Today';
                if (dueDate.toDateString() === tomorrow.toDateString()) {
                    dueDateText = 'Tomorrow';
                } else if (dueDate > tomorrow) {
                    dueDateText = dueDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
                }

                return {
                    name: task.name,
                    project: task.project,
                    priority: task.priority,
                    dueDate: dueDateText,
                    dueTime: dueDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                };
            });

            // Query untuk Recent Updates
            const updatesQuery = await db.query(`
                SELECT 
                    qa.method as type,
                    qa.table_name as title,
                    qa.reason as description,
                    qa.created_at,
                    TIMESTAMPDIFF(MINUTE, qa.created_at, NOW()) as minutesAgo
                FROM query_actions qa
                WHERE qa.id_user = ?
                ORDER BY qa.created_at DESC
                LIMIT 3
            `, [userId]);

            const updates = updatesQuery[0].map(update => {
                let timeAgo;
                const minutes = update.minutesAgo;
                
                if (minutes < 60) {
                    timeAgo = `${minutes} mins ago`;
                } else if (minutes < 1440) {
                    timeAgo = `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) > 1 ? 's' : ''} ago`;
                } else {
                    timeAgo = `${Math.floor(minutes / 1440)} day${Math.floor(minutes / 1440) > 1 ? 's' : ''} ago`;
                }

                // Mapping type untuk icon
                let iconType = 'delivery';
                if (update.type === 'insert') iconType = 'delivery';
                else if (update.type === 'update') iconType = 'approved';
                else if (update.type === 'delete') iconType = 'alert';

                return {
                    type: iconType,
                    title: update.title.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    description: update.description,
                    timeAgo: timeAgo
                };
            });

            // Query untuk line chart (Proyek Selesai per bulan)
            const monthlyCompletionQuery = await db.query(`
                SELECT 
                    MONTH(w.created_at) as month,
                    COUNT(*) as completed
                FROM work w
                WHERE w.id_User = ?
                AND w.status = 'completed'
                AND YEAR(w.created_at) = YEAR(CURDATE())
                GROUP BY MONTH(w.created_at)
                ORDER BY month ASC
            `, [userId]);

            const monthlyData = Array(12).fill(0);
            monthlyCompletionQuery[0].forEach(row => {
                monthlyData[row.month - 1] = row.completed;
            });

            // Format tanggal saat ini
            const currentDate = new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });

            res.render('user/dashboard', {
                title: 'Situtur | Dashboard',
                username: username,
                currentDate: currentDate,
                stats: stats,
                chartData: chartData,
                monthlyData: monthlyData,
                tasks: tasks,
                updates: updates
            });

        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Terjadi kesalahan saat memuat dashboard',
                error: error
            });
        }
    }
};