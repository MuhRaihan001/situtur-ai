const { isLoggedIn, isUser } = require("../../../middleware/auth");

module.exports = {
  middleware: [isLoggedIn, isUser],
  GET: {
    handler: async function (req, res, next) {
      // Jika request adalah navigasi browser (HTML), biarkan React Router yang handle di frontend
      const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
      if (isHtmlRequest && !req.headers.accept.includes('application/json') && !req.xhr) {
        return next();
      }

      try {
        const db = req.app.locals.db;

        // Query Stats
        const totalWorkersRows = await db.query('SELECT COUNT(*) as count FROM workers');
        const totalWorkers = totalWorkersRows[0] ? totalWorkersRows[0].count : 0;

        // Mock stats for now based on total
        const stats = {
          totalWorkers,
          currentlyOnSite: Math.floor(totalWorkers * 0.7),
          onLeave: Math.floor(totalWorkers * 0.1),
          tasksPending: Math.floor(totalWorkers * 0.2)
        };

        // Query Workers list with current task/project if available
        const workersRows = await db.query(`
          SELECT 
            w.id,
            w.worker_name as name,
            w.phone_number,
            p.Nama_Proyek as currentProject,
            wk.work_name as currentTask,
            wk.status as status
          FROM workers w
          LEFT JOIN work wk ON wk.id = w.Current_task
          GROUP BY w.id
        `);

        const workers = workersRows.map(worker => ({
          id: `ID-${String(worker.id).padStart(3, '0')}`,
          name: worker.name,
          joinedDate: 'Joined 2021', 
          role: worker.id % 2 === 0 ? 'Foreman' : 'Mandor', 
          currentProject: worker.currentProject || 'Unassigned',
          status: worker.status || 'Active',
          statusClass: (worker.status || 'Active').toLowerCase().replace(' ', '-')
        }));

        res.json({ 
          success: true, 
          stats, 
          workers 
        });

      } catch (error) {
        console.error("Error in GET /user/workers/list:", error);
        res.status(500).json({ 
          success: false, 
          error: "Internal Server Error" 
        });
      }
    }
  }
}