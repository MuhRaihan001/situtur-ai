const fs = require('fs');
const path = require('path');
const Database = require("../handler/database");
const Model = require("./ai");

const database = new Database();
const model = new Model();

const prompt = fs.readFileSync(
    path.join(__dirname, 'prompt/sql.txt'),
    'utf-8'
)

class Instructor {

    async updateDatabase(natural_language) {

        const { columns, allTasks } = await database.transaction(async (conn) => {

            const [databaseColumns] = await conn.query(
                'SHOW COLUMNS FROM work'
            );

            const [allTasks] = await conn.query(
                'SELECT * FROM work'
            );

            return {
                columns: databaseColumns.map(col => col.Field),
                allTasks
            };
        });


        const systemPrompt = prompt
        .replace("{{COLUMNS}}", columns.join(", "))
        .replace("{{TASKS}}", JSON.stringify(allTasks, null, 2))
        .replace("{{COMMAND}}", natural_language);

        const response = await model.response(systemPrompt);
        console.log(`Generating best recomendation SQL query from request: "${natural_language}"`);

        let result;
        try {
            result = JSON.parse(response.text());
        } catch (err) {
            throw new Error("AI returned invalid JSON");
        }

        return result;
    }

}

module.exports = Instructor