const express = require('express');
const session = require('express-session');
const connection = require('./config/database');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();
const cors = require('cors');
const routes = require('./routes');
const {encryptPassword} = require("./lib/encryptPassword");

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

app.use(cors({
    origin:`${process.env.APPLICATION_HOST}:${process.env.APPLICATION_PORT}` 
    //se quiser, pode comentar essa linha acima para testar se não estiver funcionando
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

connection.query(`delete from "User" where "isAdm"=true`).then(res => {
    connection.query(`insert into "User"(username,email,"password",birthday, "isAdm") values ($1,$2,$3,$4, $5)`, [
        process.env.USERNAME, process.env.EMAIL, encryptPassword(process.env.PASSWORD), process.env.BIRTHDAY, true
    ]).catch(e => {
        console.log("ADM account not created");
        console.log(e);
    });
}).catch(e => {
    console.log("ADM account not created");
    console.log(e);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`API running on port ${PORT} - DB HOST ${process.env.DB_HOST}`));