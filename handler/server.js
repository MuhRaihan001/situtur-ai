const express = require('express');
const helmet = require('helmet')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'aman bang',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 60000 * 60 // 1 jam
    }
}));
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

module.exports = app;