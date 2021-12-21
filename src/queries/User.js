const connection = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const validate = require('../lib/Validate');
const mmm = require('mmmagic'),
Magic = mmm.Magic;

let magic = new Magic(mmm.MAGIC_MIME_TYPE);

function createUser(req, res){
    const {
        username,
        email,
        password, 
        birthday,
        description
    } = req.body;

    // const hashedPassword = bcrypt.hashSync(password);

    //VERIFICAÇÕES OBRIGATÓRIAS
    if(!username)
        return res.status(400).json({message: "usuário vazio"});
    if(!email || !validate.validateEmail(email))
        return res.status(400).json({message: "email incorreto"});
    if(!password)
        return res.status(400).json({message: "senha vazia"});

    let minimumAge = new Date();
    minimumAge.setFullYear(minimumAge.getFullYear()-18);
    let dateFields = birthday.split("-");
    let birthDayDate = new Date(dateFields[2], dateFields[1], dateFields[0]);
    if(!birthday || birthDayDate > minimumAge)
        return res.status(400).json({message: "data de nascimento vazia/incorreta!"});

    //MONTAGEM DO INSERT
    let insertQueryFields = `INSERT INTO "User" ("username", "email", "password", birthday`;
    let insertQueryValues = `VALUES ('${username}', '${email}', '${password}', '${birthday}'`;
    if(description){
        insertQueryFields += ",description";
        insertQueryValues += `,'${description}'`;
    }
    if(req.file){
        console.log(req.file);
        fs.writeFileSync(`${__dirname}/files/${req.file.originalname}`,req.file.buffer);
        insertQueryFields += `,"picture_path"`;
        insertQueryValues += `, '${req.file.originalname}'`;
    }
    insertQueryFields += ")";
    insertQueryValues += ")";

    connection.query(`${insertQueryFields} ${insertQueryValues}`).then(result => {
        return res.status(201).json(result);
    })


}

module.exports = {

    async login(req, res){

        // const {email, password} = req.query;

        // const hashedPassword = bcrypt.hash(password);

        // const {rows} = connection.query(
        //     `SELECT id FROM "User" 
        //     WHERE email=${email} AND password=${hashedPassword}`);

        // if(rows.length == 0){
        //     return res.status(404).json({message:"Usuário/senha incorretos"});
        // }

    },
    create(req, res){
        const profilePic = req.file;
        if(req.file){
            magic.detect(profilePic.buffer, (err, result) => {
                if(err) throw err;
                if(!result.includes("image")){
                    return res.status(400).json({message: "Imagem inválida"});
                }
                createUser(req, res);
            });
        }
        else{
            createUser(req, res);
        }
        
        
    }
};