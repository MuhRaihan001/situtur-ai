const fs = require("fs");
const path = require("path");
const Database = require("../handler/database");
const Model = require("./ai");

const database = new Database();
const model = new Model();

const PROMPT_TEMPLATE = fs.readFileSync(
    path.join(__dirname, "prompt/sql.txt"),
    "utf-8"
);

class Instructor {

    async updateDatabase(command) {
        console.log(`Generating stuructured action for: "${command}"`);

        const { columns, tasks } = await this.#fetchWorkData();
        const prompt = this.#buildPrompt({ columns, tasks, command });

        const aiResponse = await model.response(prompt);
        return this.#parseAndValidate(aiResponse.text());
    }

    isAmbigu(meta) {
        const { ambiguity_level, confidence } = meta;

        const lowConfidence = confidence < 0.8;
        const ambiguousMatch = ambiguity_level === "medium" || ambiguity_level === "high";

        return lowConfidence || ambiguousMatch;
    }

    async #fetchWorkData() {
        return database.transaction(async (conn) => {
            const [[columns], [tasks]] = await Promise.all([
                conn.query("SHOW COLUMNS FROM work"),
                conn.query("SELECT * FROM work")
            ]);

            return {
                columns: columns.map(({ Field }) => Field),
                tasks
            };
        });
    }

    #buildPrompt({ columns, tasks, command }) {
        return PROMPT_TEMPLATE
            .replace("{{COLUMNS}}", columns.join(", "))
            .replace("{{TASKS}}", JSON.stringify(tasks, null, 2))
            .replace("{{COMMAND}}", command)
            .replace("{{TIMESTAMPT}}", Date.now());
    }

    #parseAndValidate(text) {
        const result = this.#safeJSONParse(text);

        if (!Array.isArray(result.actions) || result.actions.length === 0) {
            throw new Error("queries must be a non-empty array");
        }

        return result;
    }

    generateMysqlQuery(action) {
        if (!action || typeof action !== "object") {
            throw new Error("Action object is required");
        }

        const {
            method,
            table,
            columns = [],
            where = [],
            params = [],
            ambiguity_level = "low",
            confidence = 0,
            matched_task_ids = [],
            reason = ""
        } = action;

        if (!method || !table) {
            throw new Error("method and table are required");
        }

        let sql = "";
        let sqlParams = [];

        switch (method.toLowerCase()) {

            case "select": {
                const selectCols = columns.length ? columns.join(", ") : "*";
                sql = `SELECT ${selectCols} FROM ${table}`;

                if (where.length) {
                    sql += " WHERE " + where.map(c => `${c} = ?`).join(" AND ");
                    sqlParams = params;
                }
                break;
            }

            case "insert": {
                if (!columns.length || !params.length) {
                    throw new Error("INSERT requires columns and params");
                }

                const placeholders = columns.map(() => "?").join(", ");
                sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
                sqlParams = params;
                break;
            }

            case "update": {
                if (!columns.length || !where.length) {
                    throw new Error("UPDATE requires columns and where");
                }

                const setClause = columns.map(c => `${c} = ?`).join(", ");
                const whereClause = where.map(c => `${c} = ?`).join(" AND ");

                sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
                sqlParams = params;
                break;
            }

            case "delete": {
                if (!where.length) {
                    throw new Error("DELETE requires where");
                }

                sql = `DELETE FROM ${table} WHERE ${where.map(c => `${c} = ?`).join(" AND ")}`;
                sqlParams = params;
                break;
            }

            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        return {
            sql,
            params: sqlParams,
            meta: {
                method,
                table,
                ambiguity_level,
                confidence,
                matched_task_ids,
                reason
            }
        };
    }



    #safeJSONParse(text) {
        try {
            return JSON.parse(text);
        } catch {
            throw new Error("AI returned invalid JSON");
        }
    }

}

module.exports = Instructor;
