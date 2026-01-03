const mysql2 = require('mysql2/promise');

const poolConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable SSL if configured in environment
    ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : undefined
};

const pool = mysql2.createPool(poolConfig);

class Database {
    /**
     * Execute a SQL query with performance monitoring and audit logging capability
     * @param {string} sql - SQL query string
     * @param {Array} params - Query parameters for SQL injection protection
     * @param {Object} options - Additional options (e.g., userId for auditing)
     */
    async query(sql, params = [], options = {}) {
        const start = Date.now();
        try {
            const [rows] = await pool.query(sql, params);
            const duration = Date.now() - start;
            
            // Log performance if it's slow (e.g., > 100ms)
            if (duration > 100) {
                console.warn(`[PERF] Slow Query (${duration}ms): ${sql.substring(0, 100)}...`);
            }
            return rows;
        } catch (err) {
            console.error(`[DB ERROR] Query: ${sql}`);
            console.error(`[DB ERROR] Message: ${err.message}`);
            throw err;
        }
    }

    /**
     * Execute operations within a database transaction for atomicity
     * @param {Function} callback - Async function receiving connection
     */
    async transaction(callback) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // Wrap the connection query method for monitoring within transaction
            const originalQuery = connection.query.bind(connection);
            connection.safeQuery = async (sql, params = []) => {
                const start = Date.now();
                try {
                    const [rows] = await originalQuery(sql, params);
                    const duration = Date.now() - start;
                    if (duration > 100) console.warn(`[PERF-TX] Slow Query (${duration}ms): ${sql}`);
                    return rows;
                } catch (err) {
                    console.error(`[DB-TX ERROR] ${err.message}`);
                    throw err;
                }
            };

            const result = await callback(connection);

            await connection.commit();
            return result;
        } catch (err) {
            await connection.rollback();
            console.error('[DB TX] Transaction rolled back due to error:', err.message);
            throw err;
        } finally {
            connection.release();
        }
    }

    /**
     * Helper for pagination
     * @param {string} baseQuery - The base SELECT query
     * @param {Array} params - Base query params
     * @param {number} page - Current page (1-based)
     * @param {number} limit - Items per page
     */
    async queryWithPagination(baseQuery, params = [], page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        // Count total records
        const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as subquery`;
        const countResult = await this.query(countQuery, params);
        const total = countResult[0].total;

        // Fetch paginated data
        const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
        const data = await this.query(paginatedQuery, [...params, limit, offset]);

        return {
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = Database;