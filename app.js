const { 
    client, 
    loadEvents 
} = require('./handler/client');
const { loadCommands } = require('./handler/command');
const express = require('express');
const bodyParser = require('body-parser');
const { helmet } = require('helmet');
const { loadApi } = require('./handler/api');
const app = express();

app.use(bodyParser.json());
app.use(helmet())
app.use(express.json());

loadApi(app);

loadEvents();
loadCommands();
client.initialize();