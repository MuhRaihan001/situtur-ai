const Database = require("./database");
const Tokenizer = require("./token");
const db = new Database();
const token = new Tokenizer();

class AuditService {
    /**
     * Log a CRUD operation
     * @param {Object} data - Audit data
     * @param {number} data.userId - ID of the user performing action
     * @param {string} data.action - Action type (CREATE, UPDATE, DELETE)
     * @param {string} data.tableName - Affected table
     * @param {string|number} data.recordId - Affected record ID
     * @param {Object} data.oldValues - Previous state
     * @param {Object} data.newValues - New state
     * @param {Object} req - Express request object for IP and UA
     */
    static async log(data, req = null) {
        try {
            const sql = `
                INSERT INTO audit_logs (
                    user_id, action, table_name, record_id, 
                    old_values, new_values, ip_address, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const rawData = req.signedCookies.userData;
            const user = await token.verify(rawData);
            const params = [
                data.userId || (user?.id_user) || null,
                data.action,
                data.tableName,
                data.recordId || null,
                data.oldValues ? JSON.stringify(data.oldValues) : null,
                data.newValues ? JSON.stringify(data.newValues) : null,
                req?.ip || null,
                req?.headers?.['user-agent'] || null
            ];

            await db.query(sql, params);
        } catch (error) {
            console.error('[AUDIT LOG ERROR]', error.message);
            // Don't throw to avoid breaking the main operation
        }
    }
}

module.exports = AuditService;