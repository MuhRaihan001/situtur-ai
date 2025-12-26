/**
 *  @param { import('whatsapp-web.js').Client } client
 */

module.exports = (client) => {
    client.on('ready', () => {
        console.log('✅ Connected Succesfully');
    });

    client.on('disconnected', (reason) => {
        console.log('😴 Client Disconected due to: ', reason);
    })
}