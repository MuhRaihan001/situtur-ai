const { 
    client, 
    loadEvents 
} = require('./handler/client');
const { loadCommands } = require('./handler/command');

loadEvents();
loadCommands();
client.initialize();