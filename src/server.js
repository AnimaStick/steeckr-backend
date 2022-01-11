const express = require('express');
const session = require('express-session');
const connection = require('./config/database');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();
const cors = require('cors');
const routes = require('./routes');
const {encryptPassword} = require("./lib/encryptPassword");
const path = require('path');
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
        maxAge: 24 * 60 * 60 * 1000
    }, // 1 day
    store: pgSessionStore
}))

app.use( cors({
    origin:`${process.env.APPLICATION_HOST}:${process.env.APPLICATION_PORT}` ,
    credentials:true
}));

// app.use('*', corsConfigured);

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", `${process.env.APPLICATION_HOST}:${process.env.APPLICATION_PORT}`);
//     res.header("Access-Control-Allow-Credentials", true);
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"),
//     next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

//CRIAÇÃO DE UMA CONTA DE ADMINISTRADOR, DE ACORDO COM VALORES DO .ENV
// connection.query(`delete from "User" where "isAdm"=true`).then(res => {
//     connection.query(`insert into "User"(username,email,"password",birthday, "isAdm") values ($1,$2,$3,$4, $5)`, [
//         process.env.USERNAME, process.env.EMAIL, encryptPassword(process.env.PASSWORD), process.env.BIRTHDAY, true
//     ]).catch(e => {
//         console.log("ADM account not created");
//         console.log(e);
//     });
// }).catch(e => {
//     console.log("ADM account not created");
//     console.log(e);
// });

app.use("/files",express.static(path.join(__dirname, '../files')));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`API running on port ${PORT} - DB HOST ${process.env.DB_HOST} celsoportioli`));