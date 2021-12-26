const express = require('express');

const router = express.Router();

const {User} = require("./queries/Queries");

const multer = require('multer');

const uploadProfilePic = multer();

const auth = require("./lib/auth");

//USER ROUTES
router.post("/login", User.login);
router.post("/users", uploadProfilePic.single("profilePic"), User.create);
//TEST AUTHENTICATION
router.get("/auth", auth.sessionChecker, async (req, res) => {return res.status(200).json({message:req.session.user})});

module.exports = router;