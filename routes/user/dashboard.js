const {isLoggedIn, isUser} = require('../../middleware/auth');

exports.middleware = [isLoggedIn, isUser];

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
        console.log('[API DASHBOARD] Fetching JSON data for user:', req.session.user);
        const db = req.app.locals.db;
        const user = req.session.user;
        
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

        // 2. Tasks Pending
        const tasksPendingRows = await db.query(
            'SELECT COUNT(*) as count FROM work w JOIN proyek p ON w.id_Proyek = p.ID WHERE p.Id_User = ? AND w.progress < 100',
            [id_user]
        );
        const tasksPending = tasksPendingRows[0] ? tasksPendingRows[0].count : 0;

        // 3. Completed Tasks
        const completedTasksRows = await db.query(
            'SELECT COUNT(*) as count FROM work w JOIN proyek p ON w.id_Proyek = p.ID WHERE p.Id_User = ? AND w.progress = 100',
            [id_user]
        );
        const completedTasks = completedTasksRows[0] ? completedTasksRows[0].count : 0;

        // 4. Priority Tasks
        const priorityTasksRows = await db.query(
            'SELECT w.id, w.work_name as name, w.status as priority, p.Nama_Proyek as project, w.progress ' +
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
            ongoingProjects,
            hoursWorked: (completedTasks * 2.5).toFixed(1),
            safetyAlerts: 0
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

        const monthlyData = [
            Math.floor(completedTasks * 0.5),
            Math.floor(completedTasks * 0.6),
            Math.floor(completedTasks * 0.55),
            Math.floor(completedTasks * 0.7),
            Math.floor(completedTasks * 0.65),
            Math.floor(completedTasks * 0.8),
            Math.floor(completedTasks * 0.85),
            Math.floor(completedTasks * 0.82),
            Math.floor(completedTasks * 0.9),
            Math.floor(completedTasks * 0.88),
            Math.floor(completedTasks * 0.92),
            completedTasks
        ];

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
