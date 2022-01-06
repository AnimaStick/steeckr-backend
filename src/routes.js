const express = require('express');

const router = express.Router();

const {User, Sticker} = require("./queries/Queries");

const multer = require('multer');

const uploadProfilePic = multer();

const auth = require("./lib/auth");
const { query } = require('express');

//TESTES Stickers
router.post("/stickers", Sticker.create);
router.get("/stickers", Sticker.showAll);
router.get("/dropstickers", Sticker.dropAll);

//USER ROUTES
router.post("/login", User.login);
router.post("/users", uploadProfilePic.single("profilePic"), User.create);
router.get("/users", User.showAll);
router.get("/dropusers", User.dropAll);
//TEST AUTHENTICATION
router.get("/auth", auth.sessionChecker, async (req, res) => {return res.status(200).json({message:req.session.user})});

module.exports = router;