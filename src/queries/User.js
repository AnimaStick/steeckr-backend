const connection = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const validate = require('../lib/Validate');
const path = require('path');
const mmm = require('mmmagic'),
Magic = mmm.Magic;
let magic = new Magic(mmm.MAGIC_MIME_TYPE);

const FileActions = require("../lib/FileActions");

function createUser(req, res, fileExtension){
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
    let birthDayDate = new Date(dateFields[0], dateFields[1], dateFields[2]);
    if(!birthday || birthDayDate > minimumAge)
        return res.status(400).json({message: "data de nascimento vazia/incorreta/não atingiu a idade mínima"});

    //MONTAGEM DO INSERT
    let insertQueryFields = `INSERT INTO "User" ("username", "email", "password", birthday`;
    let insertQueryValues = `VALUES ('${username}', '${email}', '${password}', '${birthday}'`;
    if(description){
        insertQueryFields += ",description";
        insertQueryValues += `,'${description}'`;
    }

    let filePath;
    let realPath;
    if(req.file){
        let fileName = `${Date.now()}-${username}.${fileExtension}`;
        filePath = `./files/profile/${fileName}`;
        try{
            fs.writeFileSync(filePath, req.file.buffer);
        }catch(e){
            console.log(e);
            return res.status(400).json({error: "Erro interno, favor tentar novamente"});
        }
        insertQueryFields += `,"picture_path"`;
        insertQueryValues += `, '${filePath}'`;
    }

    insertQueryFields += ")";
    insertQueryValues += ")";
    connection.query(`${insertQueryFields} ${insertQueryValues}`).then(result => {
        if (result.rowCount)
            return res.status(201).json({ message: "Usuário criado com sucesso" });
        else{
            if(req.file)
                FileActions.deleteFiles([filePath]);
            return res.status(400).json({ error: "Usuário não inserido, favor tentar novamente" });
        }
    }).catch(error => {
        if(req.file)
            FileActions.deleteFiles([filePath]);
        return res.status(400).json({error: error});
    });
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
                let nameAndExtension = result.split("/");
                if(!nameAndExtension[0] === "image"){
                    return res.status(400).json({message: "Imagem inválida"});
                }
                return createUser(req, res, nameAndExtension[1]);
            });
        }
        else{
            return createUser(req, res, fileExtension);
        }
        
        
    }
};