const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const CONFIG = {
    DATABASE: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    },
    FILES: {
        NOTIFICATION: path.join(__dirname, 'Notification.txt'),
        WORKERS: path.join(__dirname, 'List worker.txt'),
        TASKS: path.join(__dirname, 'To Do List.txt'),
        PROJECTS: path.join(__dirname, 'list projek.txt'),
        LOG: path.join(__dirname, 'sync.log'),
        BACKUP_DIR: path.join(__dirname, 'backups')
    },
    INTERVALS: {
        SYNC: 3000, // 3 seconds
        BACKUP: 24 * 60 * 60 * 1000 // 24 hours
    }
};

// Logger
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(CONFIG.FILES.LOG, logMessage, 'utf8');
}

// Date Formatter
function formatDate(date, includeTime = true) {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    if (!includeTime) return `${day}-${month}-${year}`;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

async function syncFiles() {
    let connection;
    try {
        connection = await mysql.createConnection(CONFIG.DATABASE);

        // 1. Notification.txt
        // Based on query_actions or a notification table if exists. 
        // SQL dump shows query_actions which acts like a log/notification.
        const [notifications] = await connection.execute('SELECT id, created_at, reason FROM query_actions ORDER BY created_at DESC LIMIT 50');
        let notificationContent = '';
        notifications.forEach(n => {
            notificationContent += `[${n.id}] [${formatDate(n.created_at)}] [${n.reason}]\r\n`;
        });
        fs.writeFileSync(CONFIG.FILES.NOTIFICATION, notificationContent, { encoding: 'utf8' });

        // 2. List worker.txt
        const [workers] = await connection.execute('SELECT id, worker_name, phone_number FROM workers');
        let workerContent = 'ID Worker\tNama\tDepartemen\tStatus (Aktif/Non-Aktif)\r\n';
        workers.forEach(w => {
            workerContent += `${w.id}\t${w.worker_name}\tLapangan\tAktif\r\n`;
        });
        fs.writeFileSync(CONFIG.FILES.WORKERS, workerContent, { encoding: 'utf8' });

        // 3. To Do List.txt
        const [tasks] = await connection.execute('SELECT id, work_name, deadline, progress, status FROM work');
        let taskContent = 'Task ID | Deskripsi | Deadline (DD-MM-YYYY HH:mm) | Prioritas (1-5) | Status\r\n';
        tasks.forEach(t => {
            const priority = t.progress < 50 ? '1' : '3'; // Logical mapping
            const statusMap = { 'pending': 'Pending', 'in_progress': 'On Progress', 'completed': 'Completed' };
            const status = statusMap[t.status] || 'Pending';
            taskContent += `${t.id} | ${t.work_name} | ${formatDate(t.deadline)} | ${priority} | ${status}\r\n`;
        });
        fs.writeFileSync(CONFIG.FILES.TASKS, taskContent, { encoding: 'utf8' });

        // 4. list projek.txt
        const [projects] = await connection.execute('SELECT p.ID, p.Nama_Proyek, p.Id_User FROM proyek p');
        let projectContent = 'Kode Proyek | Nama Proyek | PIC | Tanggal Mulai (DD-MM-YYYY) | Tanggal Selesai (DD-MM-YYYY) | Progress (0-100%)\r\n';
        projects.forEach(p => {
            projectContent += `${p.ID} | ${p.Nama_Proyek} | ${p.Id_User} | - | - | 0%\r\n`;
        });
        fs.writeFileSync(CONFIG.FILES.PROJECTS, projectContent, { encoding: 'utf8' });

        log('Synchronization completed successfully.');
    } catch (error) {
        log(`Sync Error: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            log('Database connection failed.');
        }
    } finally {
        if (connection) await connection.end();
    }
}

// Backup Mechanism
function performBackup() {
    try {
        if (!fs.existsSync(CONFIG.FILES.BACKUP_DIR)) {
            fs.mkdirSync(CONFIG.FILES.BACKUP_DIR);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(CONFIG.FILES.BACKUP_DIR, `backup-${timestamp}`);
        fs.mkdirSync(backupPath);

        Object.values(CONFIG.FILES).forEach(filePath => {
            if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
                fs.copyFileSync(filePath, path.join(backupPath, path.basename(filePath)));
            }
        });
        log('Automatic backup completed.');
    } catch (error) {
        log(`Backup Error: ${error.message}`);
    }
}

// Start processes
log('Starting Situtur Data Sync Service...');
setInterval(syncFiles, CONFIG.INTERVALS.SYNC);
setInterval(performBackup, CONFIG.INTERVALS.BACKUP);

// Initial run
syncFiles();
performBackup();
