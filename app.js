const { 
    client, 
    loadEvents 
} = require('./client');
const { loadCommands } = require('./command');

loadEvents();
loadCommands();
client.initialize();