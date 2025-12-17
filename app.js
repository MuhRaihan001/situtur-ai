const { loadApi } = require('./handler/api');
const { 
    client, 
    loadEvents 
} = require('./handler/client');
const { loadCommands } = require('./handler/command');
const app = require('./handler/server');
require('dotenv').config();
const database = require('./handler/database');

loadEvents();
loadCommands();
loadApi(app);
app.locals.db = database;


const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log('Server online'));
client.initialize();