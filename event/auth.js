/**
 * @param {import('whatsapp-web.js').Client} client
 */

module.exports = (client) => {
    client.on('authenticated', () => {
        console.log('authenticated to client');
    });

    client.on('auth_failure', () => {
        console.log('Failed to authenticated to client');
    })
}