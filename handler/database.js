const mysql2 = require('mysql2/promise');

// Konfigurasi SSL untuk Aiven dan layanan cloud MySQL lainnya
const sslConfig = process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false;

const pool = mysql2.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
    ssl: sslConfig,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

class Database {
    async query(query, params = []) {
        const [rows] = await pool.query(query, params);
        return rows;
    }

    async transaction(callback) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const result = await callback(connection);

            await connection.commit();
            return result;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
}

module.exports = Database;