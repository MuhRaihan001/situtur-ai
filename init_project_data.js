require('dotenv').config();
const Database = require('./handler/database');
const db = new Database();

async function init() {
  try {
    // 1. Insert Project if not exists
    const projectName = "MRT Phase 2A: Bundaran HI - Kota";
    const userId = 1;
    
    let project = await db.query('SELECT ID FROM Proyek WHERE Nama_Proyek = ?', [projectName]);
    let projectId;
    
    if (project.length === 0) {
      const result = await db.query('INSERT INTO Proyek (Nama_Proyek, Id_User) VALUES (?, ?)', [projectName, userId]);
      projectId = result.insertId;
      console.log('Created project:', projectName, 'ID:', projectId);
    } else {
      projectId = project[0].ID;
      console.log('Project already exists ID:', projectId);
    }

    // 2. Insert Workers if not exists
    const workerNames = ["Agus Pertamina", "Budi Santoso", "Citra Lestari"];
    const workerIds = [];
    
    for (const name of workerNames) {
      let worker = await db.query('SELECT id FROM workers WHERE worker_name = ?', [name]);
      if (worker.length === 0) {
        const result = await db.query('INSERT INTO workers (worker_name, phone_number, finished_task) VALUES (?, ?, ?)', [name, '08123456789', 0]);
        workerIds.push(result.insertId);
        console.log('Created worker:', name, 'ID:', result.insertId);
      } else {
        workerIds.push(worker[0].id);
      }
    }

    // 3. Insert Work Items (Tasks)
    const tasks = [
      { name: "Foundation Works", progress: 100, status: 'Done', worker: workerIds[0] },
      { name: "Tunnel Boring", progress: 65, status: 'In Progress', worker: workerIds[1] },
      { name: "Station Structure", progress: 20, status: 'Active', worker: workerIds[2] },
      { name: "Electrical Systems", progress: 5, status: 'Active', worker: workerIds[0] },
      { name: "Review structural integrity report", progress: 0, status: 'High', worker: workerIds[1] },
      { name: "Coordinate concrete supply", progress: 100, status: 'Done', worker: workerIds[2] }
    ];

    for (const task of tasks) {
      let existing = await db.query('SELECT id FROM work WHERE work_name = ? AND id_Proyek = ?', [task.name, projectId]);
      if (existing.length === 0) {
        await db.query(
          'INSERT INTO work (id_Proyek, work_name, progress, status, starterd_at, Current_task, Finished_Task) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [projectId, task.name, task.progress, task.status, Date.now(), task.worker, task.progress === 100 ? task.worker : 0]
        );
        console.log('Created task:', task.name);
      }
    }

    console.log('Mock data initialization complete!');
  } catch (error) {
    console.error('Error initializing mock data:', error);
  } finally {
    process.exit();
  }
}

init();
