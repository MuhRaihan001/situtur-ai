const { isLoggedIn, isUser } = require("../../middleware/auth");

module.exports = {
  middleware: [isLoggedIn, isUser],
  GET: {
    handler: async function (req, res, next) {
      const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');
      if (isHtmlRequest && !req.headers.accept.includes('application/json') && !req.xhr) {
        return next();
      }

      try {
        const db = req.app.locals.db;
        const id_user = req.session.user.id_user;

        // Fetch projects for this user
        const projects = await db.query(`
          SELECT 
            p.ID as id, 
            p.Nama_Proyek as name,
            COUNT(w.id) as totalTasks,
            SUM(CASE WHEN w.progress = 100 THEN 1 ELSE 0 END) as completedTasks,
            AVG(w.progress) as overallProgress
          FROM Proyek p
          LEFT JOIN work w ON w.id_Proyek = p.ID
          WHERE p.Id_User = ?
          GROUP BY p.ID
        `, [id_user]);

        // Get some stats for projects
        const totalProjects = projects.length;
        const completedProjects = projects.filter(p => p.overallProgress === 100).length;
        const ongoingProjects = totalProjects - completedProjects;

        const stats = {
          totalProjects,
          completedProjects,
          ongoingProjects,
          activeTasks: projects.reduce((acc, p) => acc + (p.totalTasks - p.completedTasks), 0)
        };

        res.json({
          success: true,
          stats,
          projects: projects.map(p => ({
            id: p.id,
            name: p.name,
            location: "Jakarta, Indonesia", // Placeholder since not in DB
            totalTasks: p.totalTasks || 0,
            completedTasks: p.completedTasks || 0,
            progress: Math.round(p.overallProgress || 0),
            status: p.overallProgress === 100 ? 'Completed' : (p.overallProgress > 75 ? 'On Track' : 'Delayed'),
            statusClass: p.overallProgress === 100 ? 'completed' : (p.overallProgress > 75 ? 'on-track' : 'delayed'),
            dueDate: "Dec 2025", // Placeholder since not in DB
            teamCount: 5 // Placeholder since not in DB
          }))
        });

      } catch (error) {
        console.error("Error in GET /user/List_Projek:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
      }
    }
  }
};
