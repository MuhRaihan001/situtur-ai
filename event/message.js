const { commands } = require('../handler/command');
const Database = require('../handler/database');
const Workers = require('../handler/worker');
const Instructor = require('../model/instructions');
const Works = require('../handler/work');

const prefix = process.env.PREFIX || '!'
const instructions = new Instructor();
const workers = new Workers();
const works = new Works();
const db = new Database();

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


        // Use full WhatsApp ID for lookup (e.g., 6281234567890@c.us)
        const workerData = await workers.workerDataByPhone(message.from);
        if (!workerData) return;

        try {
            const instructionsList = await instructions.generateInstruction(message.body, workerData);

            if (!instructionsList.actions || instructionsList.actions.length === 0) return;

            for (const inst of instructionsList.actions) {
                console.log(`Instruction for worker ${workerData.worker_name}:\n`, inst);;

                if (!inst.method) {
                    console.log("Skipping non-database action:", inst.reason);
                    return;
                }

                const isUnclear = inst.ambiguity_level !== "low" || inst.confidence < 0.8;
                if (isUnclear) {
                    await works.waitList(inst);
                    continue;
                }

                await works.executeAIAction(inst);
            }
        } catch (error) {
            console.error("AI Error:", error);
        }
    })
}