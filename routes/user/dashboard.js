const Tokenizer = require('../../handler/token');
const { isLoggedIn, isUser } = require('../../middleware/auth');
const tokenHandler = new Tokenizer();


exports.GET = async function (req, res, next) {
    // Jika request mengharapkan HTML (dari browser langsung/refresh), 
    // biarkan lanjut ke middleware berikutnya (catch-all SPA di app.js)
    const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
    const isJsonRequest = req.headers.accept && req.headers.accept.includes('application/json');
    const isXhr = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';

    if (isHtmlRequest && !isJsonRequest && !isXhr) {
        console.log('[API DASHBOARD] HTML request detected, passing to SPA handler');
        return next();
    }

    try {
        const rawData = req.signedCookies.userData;
        const db = req.app.locals.db;
        const user = await tokenHandler.verify(rawData);
        console.log('[API DASHBOARD] Fetching JSON data for user:', user);

        if (!user || !user.id_user) {
            console.error('[API DASHBOARD] No user session or id_user found');
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const id_user = user.id_user;
        const username = user.nama_depan || user.username || 'User';

        // Data profil untuk Header
        const profile = {
            id_user: user.id_user,
            username: user.username,
            email: user.email,
            role: user.role,
            nama_lengkap: `${user.nama_depan || ''} ${user.nama_belakang || ''}`.trim() || user.username,
            role_display: user.role === 'user' ? 'Site Manager' : user.role.charAt(0).toUpperCase() + user.role.slice(1)
        };

        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const currentDate = now.toLocaleDateString('id-ID', options);

        // 1. Ongoing Projects
        const ongoingProjectsRows = await db.query(
            'SELECT COUNT(*) as count FROM proyek WHERE Id_User = ?',
            [id_user]
        );
        const ongoingProjects = ongoingProjectsRows[0] ? ongoingProjectsRows[0].count : 0;

        // 1b. Growth for Ongoing Projects
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const lastMonthProjectsRows = await db.query(
            'SELECT COUNT(*) as count FROM proyek WHERE Id_User = ? AND created_at < ?',
            [id_user, firstDayThisMonth]
        );
        const lastMonthProjects = lastMonthProjectsRows[0] ? lastMonthProjectsRows[0].count : 0;
        const projectGrowth = lastMonthProjects === 0 ? 0 : ((ongoingProjects - lastMonthProjects) / lastMonthProjects * 100).toFixed(1);

        // 2. Tasks Pending
        const tasksPendingRows = await db.query(
            'SELECT COUNT(*) as count FROM work w JOIN proyek p ON w.id_Proyek = p.ID WHERE p.Id_User = ? AND w.progress < 100',
            [id_user]
        );
        const tasksPending = tasksPendingRows[0] ? tasksPendingRows[0].count : 0;

        // 2b. Growth for Tasks Pending
        const lastMonthTasksRows = await db.query(
            'SELECT COUNT(*) as count FROM work w JOIN proyek p ON w.id_Proyek = p.ID WHERE p.Id_User = ? AND w.progress < 100 AND w.created_at < ?',
            [id_user, firstDayThisMonth]
        );
        const lastMonthTasks = lastMonthTasksRows[0] ? lastMonthTasksRows[0].count : 0;
        const tasksGrowth = lastMonthTasks === 0 ? 0 : ((tasksPending - lastMonthTasks) / lastMonthTasks * 100).toFixed(1);

        // 3. Completed Tasks
        const completedTasksRows = await db.query(
            'SELECT COUNT(*) as count FROM proyek WHERE Id_User = ? AND status = "Compleated"',
            [id_user]
        );
        const completedTasks = completedTasksRows[0] ? completedTasksRows[0].count : 0;

        // 3b. Growth for Hours Worked (based on completed tasks)
        const lastMonthCompletedRows = await db.query(
            'SELECT COUNT(*) as count FROM proyek WHERE Id_User = ? AND status = "Compleated" AND finished_at < ?',
            [id_user, firstDayThisMonth]
        );
        const lastMonthCompleted = lastMonthCompletedRows[0] ? lastMonthCompletedRows[0].count : 0;
        const hoursGrowth = lastMonthCompleted === 0 ? 0 : ((completedTasks - lastMonthCompleted) / lastMonthCompleted * 100).toFixed(1);

        // 4. Priority Tasks
        const priorityTasksRows = await db.query(
            'SELECT w.id, w.work_name as name, w.priority, p.Nama_Proyek as project, w.progress, w.deadline ' +
            'FROM work w JOIN proyek p ON w.id_Proyek = p.ID ' +
            'WHERE p.Id_User = ? ORDER BY w.id DESC LIMIT 5',
            [id_user]
        );

        const priorityTasks = priorityTasksRows.map(task => ({
            id: task.id,
            name: task.name,
            priority: task.progress < 50 ? 'High Priority' : 'Routine',
            priorityClass: task.progress < 50 ? 'high' : 'routine',
            project: task.project,
            dueDate: 'Today', 
            dueTime: '5:00 PM',
            completed: task.progress === 100
        }));

        // 5. Recent Updates (from query_actions)
        const recentUpdatesRows = await db.query(
            'SELECT reason as title, table_name as category, created_at as time ' +
            'FROM query_actions ORDER BY created_at DESC LIMIT 5'
        );

        const recentUpdates = recentUpdatesRows.map(update => ({
            title: update.title,
            description: update.category.charAt(0).toUpperCase() + update.category.slice(1),
            time: new Date(update.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' today',
            icon: update.category === 'work' ? 'ClipboardList' : 'LayoutDashboard',
            color: update.category === 'work' ? 'text-blue-600' : 'text-orange-600'
        }));

        const stats = {
            tasksPending,
            tasksGrowth: (tasksGrowth >= 0 ? '+' : '') + tasksGrowth + '%',
            ongoingProjects,
            projectGrowth: (projectGrowth >= 0 ? '+' : '') + projectGrowth + '%',
            hoursWorked: (completedTasks * 2.5).toFixed(1),
            hoursGrowth: (hoursGrowth >= 0 ? '+' : '') + hoursGrowth + '%',
            safetyAlerts: 0,
            safetyGrowth: '+0%'
        };

        const currentYear = now.getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        const values = [
            Math.floor(ongoingProjects * 0.2),
            Math.floor(ongoingProjects * 0.4),
            Math.floor(ongoingProjects * 0.6),
            Math.floor(ongoingProjects * 0.8),
            ongoingProjects
        ];

        const chartData = {
            years,
            values,
            totalProjects: ongoingProjects,
            trend: 12.5
        };
        
        // 6. Monthly Data (Completed Projects per month for current year)
        const monthlyDataRows = await db.query(
            'SELECT MONTH(finished_at) as month, COUNT(*) as count ' +
            'FROM proyek WHERE Id_User = ? AND status = "Compleated" AND YEAR(finished_at) = ? ' +
            'GROUP BY MONTH(finished_at)',
            [id_user, currentYear]
        );

        const monthlyData = Array(12).fill(0);
        monthlyDataRows.forEach(row => {
            if (row.month >= 1 && row.month <= 12) {
                monthlyData[row.month - 1] = row.count;
            }
        });

        res.json({
            success: true,
            data: {
                profile,
                username,
                currentDate,
                stats,
                chartData,
                monthlyData,
                priorityTasks,
                recentUpdates
            }
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
    }
}
