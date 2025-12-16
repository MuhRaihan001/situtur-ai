const { loadApi } = require('./handler/api');
const { 
    client, 
    loadEvents 
} = require('./handler/client');
const { loadCommands } = require('./handler/command');
const app = require('./handler/server');
require('dotenv').config();

loadEvents();
loadCommands();
loadApi(app)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log('Server online'));
client.initialize();