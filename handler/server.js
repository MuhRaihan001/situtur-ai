const express = require('express');
const helmet = require('helmet')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const secretKey = process.env.SECRET_KEY || '63f4945d921d599f27ae4fdf5bada3f1'

const Database = require('./database');
const db = new Database();

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
app.use(cookieParser(secretKey));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.locals.db = db;

module.exports = app;
