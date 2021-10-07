const express = require('express');

const connection = require('./config/database');

const router = express.Router();

router.get('/getUser', async (request, response) => {
    try{
        const res = await connection.query(`select * from "User" where name ~ 'inha'`);
        response.status(200).json(res.rows);
    }catch(e){
        console.log(e);
    }
    

})

module.exports = router;