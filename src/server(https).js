const express = require('express');
const session = require('express-session');
const connection = require('./config/database');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();
const cors = require('cors');
const routes = require('./routes');
const https = require('https');
const fs = require('fs');
const path = require('path');
const key = fs.readFileSync(path.resolve(__dirname, "../cert/CA/localhost/localhost.decrypted.key"));
const cert = fs.readFileSync(path.resolve(__dirname, "../cert/CA/localhost/localhost.crt"));

const app = express();

const pgSessionStore = new pgSession({
    pool: connection,
    tableName: "Session",
    createTableIfMissing:true
});
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false, 
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        secure:true /*set to false if https is not enabled*/ }, // 1 day
    store: pgSessionStore
}))

app.use(cors({
    origin:`${process.env.APPLICATION_HOST}:${process.env.APPLICATION_PORT}` 
    //se quiser, pode comentar essa linha acima para testar se não estiver funcionando
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

const PORT = process.env.PORT || 3001;

const server = https.createServer({ key, cert }, app);

server.listen(PORT, () => console.log(`API running on port ${PORT} - DB HOST ${process.env.DB_HOST}`));