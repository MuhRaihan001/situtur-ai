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

    async generateInstruction(command, workerContext = null) {
        console.log(`Generating structured action for: "${command}"`);

        const context = await this.#fetchSchemaContext();
        const prompt = this.#buildPrompt({ context, command, workerContext });

        const aiResponse = await model.response(prompt);
        return this.#parseAndValidate(aiResponse.text());
    }

    isAmbigu(meta) {
        const { ambiguity_level, confidence } = meta;

        const lowConfidence = confidence < 0.8;
        const ambiguousMatch = ambiguity_level === "medium" || ambiguity_level === "high";

        return lowConfidence || ambiguousMatch;
    }

    async #fetchSchemaContext() {
        return database.transaction(async (conn) => {
            const [proyek, work, workers] = await Promise.all([
                conn.query("SELECT * FROM proyek"),
                conn.query("SELECT * FROM work"),
                conn.query("SELECT * FROM workers")
            ]);

            return {
                proyek,
                work,
                workers
            };
        });
    }

    #buildPrompt({ context, command, workerContext }) {
        let prompt = PROMPT_TEMPLATE
            .replace("{{CONTEXT}}", JSON.stringify(context, null, 2))
            .replace("{{COMMAND}}", command)
            .replace("{{TIMESTAMPT}}", Date.now());

        if (workerContext) {
            const contextStr = `
            WORKER CONTEXT:
            - Name: ${workerContext.worker_name}
            - Current Task ID: ${workerContext.current_task}
            - Current Task Name: ${workerContext.current_task_name}
            
            If the worker mentions a task but doesn't specify which one, assume they are talking about their "Current Task" unless context strongly suggests otherwise.
            `;
            prompt = prompt.replace("{{WORKER_CONTEXT}}", contextStr);
        } else {
            prompt = prompt.replace("{{WORKER_CONTEXT}}", "");
        }

        return prompt;
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
            // Bersihkan teks dari blok kode markdown jika ada
            let cleanedText = text;
            if (text.includes("```")) {
                const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (match && match[1]) {
                    cleanedText = match[1].trim();
                }
            }
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error("AI RAW RESPONSE:", text);
            console.error("JSON PARSE ERROR:", error.message);
            throw new Error("AI returned invalid JSON");
        }
    }

}

module.exports = Instructor;
