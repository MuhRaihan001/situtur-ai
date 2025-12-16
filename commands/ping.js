module.exports = {
    name: 'ping',
    description: 'Test latency bot',
    execute({ message }) {
        message.reply('pong 🏓');
    }
};
