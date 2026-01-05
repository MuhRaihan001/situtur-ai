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

        console.log(`${message.from}: ${message.body}`);
        
        // Cek trigger AI (Mendukung "Pak ", "AI ", "Halo ")
        const triggers = ["PAK ", "AI ", "HALO ", " PAK"," ,PAK"];
        const upperMessage = message.body.toUpperCase();
        const matchedTrigger = triggers.find(t => upperMessage.startsWith(t));
        
        // Jika tidak ada trigger, jangan jalankan AI (menghindari "sembarangan" jalan)
        if (!matchedTrigger) return;

        // Ambil perintah setelah trigger (Case-insensitive removal)
        const cleanCommand = message.body.slice(matchedTrigger.length).trim();
        if (!cleanCommand) return;

        // Use full WhatsApp ID for lookup (e.g., 6281234567890@c.us)
        const workerData = await workers.workerDataByPhone(message.from);
        if (!workerData || workerData.current_task === null) return;

        try {
            const instructionsList = await instructions.generateInstruction(cleanCommand, workerData);
            console.log('Instructions generated:', instructionsList);

            if (!instructionsList.actions || instructionsList.actions.length === 0) return;

            for (const inst of instructionsList.actions) {
                console.log(`Instruction for worker ${workerData.worker_name}:`, inst);

                // Jika ini adalah aksi assignment atau update dari "siap pak", beri balasan konfirmasi
                const isAssignment = inst.context_type === 'assignment';
                const isSiapPak = cleanCommand.toUpperCase().includes("SIAP PAK");

                if (isSiapPak || isAssignment) {
                    message.reply(`Baik, instruksi diterima: "${inst.reason}". Saya akan segera mengerjakannya. ✅`);
                }

                // Jika AI mendeteksi ini bukan instruksi database (method null), jangan proses
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