const express = require('express');
const server = express();
const port = process.env.PORT || 3000;
const routes = require('./routes/routes');
const session = require('express-session');
const passport = require('./middlewares/passport-config.js');
const cookieParser = require('cookie-parser')

if (process.env.NODE_ENV !== 'production')
{
    require('dotenv').config();
}

function setupServer()
{
//    server.use(form());
    server.use(cookieParser());
    server.use(localhostHandler);
    server.use(express.json());
    server.use(express.urlencoded( {extended: false} ));
    const sessionConfig = { secret: process.env.SESSION, resave: false, saveUninitialized: true};
    server.use(session(sessionConfig));
    server.use(passport.initialize());
    server.use(passport.session());
    server.use("/api", routes);
}

function localhostHandler(request, response, next)
{
    response.header('Access-Control-Allow-Origin', "*");
    response.header('Access-Control-Allow-Methods', "*");
    response.header('Access-Control-Allow-Headers', "*");
    next();
}

setupServer();
server.listen(port, () => console.log(`[Server] Listening on ${port}... `));