// const connection = require('../config/database');
// const fileActions = require('../lib/fileActions');
// const mmm = require('mmmagic'),
// Magic = mmm.Magic;
// let magic = new Magic(mmm.MAGIC_MIME_TYPE);

// function createAnimation(req, res, fileExtension){
//     const animation = req.file;
//     const {
//         id_user,
//         title,
//         description
//     } = req.body;
//     let filePath;
//     if(animation){
//         const filePath = writeProfilePic(username, animation, fileExtension);
//         if(!filePath)
//             return res.status(500).json({error: "erro interno"});
//         userInsert.insertValue("picture_path", filePath);
//     }
//     const animationInsert = new QueryBuilder(
//         `"animation_path","title","description","id_user","views","price","rarity"`,
//         "$1, $2, $3, $4, $5, $6, $7",
//         8,
//         "Sticker",
//         [animation_path, title, description, likes, views, price, rarity]
//     )
// }

// module.exports = {
//     create(req, res){
//         const animation = req.file;
//         //DETECÇÃO SE IMAGEM DE PERFIL FOI ENVIADA
//         if(req.file){
//             //DETECÇÃO SE ARQUIVO É UMA IMAGEM
//             magic.detect(animation.buffer, (err, result) => {
//                 if(err) throw err;
//                 let nameAndExtension = result.split("/");
//                 console.log(nameAndExtension);
//                 if(!nameAndExtension[0] === "image" && !nameAndExtension[0] === "video"){
//                     return res.status(400).json({message: "Imagem inválida"});
//                 }
//                 return createAnimation(req, res, nameAndExtension[1]);
//             });
//         }
//         else{
//             return createAnimation(req, res, "");
//         }
//     }
// }