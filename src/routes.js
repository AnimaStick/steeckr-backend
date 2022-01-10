const express = require('express');

const router = express.Router();

const {User, Sticker} = require("./queries/Queries");

const multer = require('multer');

const uploadProfilePic = multer();

const {sessionChecker, adminChecker, checkNoAdmAccess} = require("./lib/auth");

//ANIMATION
// router.post("/animations", sessionChecker, Animation.create);

//TESTES Stickers

router.post("/stickers", checkNoAdmAccess, Sticker.create);
router.get("/stickers", Sticker.showAll);
router.get("/sticker/:id", Sticker.getSticker)
router.delete("/dropstickers", sessionChecker, adminChecker, Sticker.dropAll);
router.get("/getDailyPacket/:id", sessionChecker, User.getDailyStickerPack);
router.get("/turnAnimationSticker", sessionChecker,adminChecker, Sticker.turnAnimationsSticker);

//USER ROUTES
//ALGUMAS TEM sessionChecker e adminChecker para checar primeiro se está logado e depois se é adm
//
router.post("/login", User.login);
router.post("/users", uploadProfilePic.single("profilePic"), User.create);
router.get("/users", sessionChecker, User.showAll);
router.get("/user/:id",User.getUser)
router.delete("/dropusers",sessionChecker, adminChecker, User.dropAll);
router.delete("/users/:id", checkNoAdmAccess, User.delete);
router.put("/users/:id", checkNoAdmAccess, uploadProfilePic.single("profilePic"), User.update);
//TEST AUTHENTICATION
router.get("/auth", sessionChecker, async (req, res) => {return res.status(200).json(req.session.profile)});

module.exports = router;