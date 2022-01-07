const express = require('express');

const router = express.Router();

const {User, Sticker} = require("./queries/Queries");

const multer = require('multer');

const uploadProfilePic = multer();

const {sessionChecker, adminChecker, checkNoAdmAccess} = require("./lib/auth");

//TESTES Stickers
router.post("/stickers", Sticker.create);
router.get("/stickers", Sticker.showAll);
router.get("/dropstickers", Sticker.dropAll);

//USER ROUTES
//ALGUMAS TEM sessionChecker e adminChecker para checar primeiro se está logado e depois se é adm
//
router.post("/login", User.login);
router.post("/users", uploadProfilePic.single("profilePic"), User.create);
router.get("/users", sessionChecker, adminChecker, User.showAll);
router.get("/dropusers",sessionChecker, adminChecker, User.dropAll);
router.delete("/users/:id", checkNoAdmAccess, User.delete);
router.put("/users/:id", checkNoAdmAccess, uploadProfilePic.single("profilePic"), User.update);
//TEST AUTHENTICATION
router.get("/auth", sessionChecker, async (req, res) => {return res.status(200).json({message:req.session.user})});
module.exports = router;