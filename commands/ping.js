module.exports = {
    name: 'ping',
    description: 'Cek apakah bot aktif',
    adminOnly: false,

    async execute({ client, message, args }) {
        const start = Date.now();

        const reply = await message.reply('🏓 Pong...');
        const latency = Date.now() - start;

        await reply.edit(`🏓 Pong!\n⏱️ ${latency} ms`);
    }
};
