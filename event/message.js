const { commands } = require('../handler/command');
const Database = require('../handler/database');
const Workers = require('../handler/worker');
const Instructor = require('../model/instructions');
const Works = require('../handler/work');

const prefix = process.env.PREFIX || '!'
const instructions = new Instructor();
const workers = new Workers();
const db = new Database();
const works = new Works();

/**
 * @param {import('whatsapp-web.js').Client} client
 */

module.exports = (client) => {
    client.on('message_create', async (message) => {
        if (message.body.startsWith(prefix)) {
            const [cmd, ...args] = message.body
                .slice(1)
                .trim()
                .split(/\s+/);

            const command = commands.get(cmd.toLowerCase());
            if (!command) return;

            if (command.adminOnly && !message.fromMe) {
                return message.reply('Khusus admin ❌');
            }

            try {
                await command.execute({
                    client,
                    message,
                    args
                });
            } catch (err) {
                console.error(err);
                message.reply('Command error ❌');
            }
        }

        console.log(`${message.from}: ${message.body}`);
        const workerData = await workers.workerDataByPhone(message.from);
        if (!workerData || workerData.current_task === null) return;

        const instructionsList = await instructions.generateInsturction(message.body);
        console.log(instructionsList)

        for (const inst of instructionsList.actions) {

            console.log(`Instruction for worker ${workerData.worker_name}:`, inst);

            const isUnclear = inst.ambiguity_level !== "low" || inst.confidence < 0.8;
            if (isUnclear) {
                await works.waitList(inst);
                continue;
            }

            const { sql, params } = instructions.generateMysqlQuery(inst);
            await db.query(sql, params);
        }
    })
}