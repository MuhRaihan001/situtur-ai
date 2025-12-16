const express = require('express');
const helmet = require('helmet')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

module.exports = app;