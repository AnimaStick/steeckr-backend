const express = require('express');

const connection = require('./config/database');

const router = express.Router();

const {User} = require("./queries/Queries");

const multer = require('multer');

const uploadProfilePic = multer();

router.get('/getUser', async (request, response) => {
    try{
        const res = await connection.query(`select * from "User"`);
        response.status(200).json(res.rows);
    }catch(e){
        console.log(e);
    }
    

});
router.get("/login", User.login);
router.post("/users", uploadProfilePic.single("profilePic"), User.create);

module.exports = router;