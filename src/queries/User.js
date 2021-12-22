const connection = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const validate = require('../lib/validate');
const path = require('path');
const mmm = require('mmmagic'),
Magic = mmm.Magic;
let magic = new Magic(mmm.MAGIC_MIME_TYPE);
const { encryptPassword } = require('../lib/encryptPassword');
const FileActions = require("../lib/fileActions");

function createUser(req, res, fileExtension){
    const {
        username,
        email,
        password, 
        birthday,
        description
    } = req.body;

    const hashedPassword = encryptPassword(password);

    //VERIFICAÇÕES OBRIGATÓRIAS
    if(!username)
        return res.status(400).json({message: "usuário vazio"});
    if(!email || !validate.validateEmail(email))
        return res.status(400).json({message: "email incorreto"});
    if(!password || password.length > 30)
        return res.status(400).json({message: "senha vazia/senha muito grande (o limite é 30 caracteres)"});
    //VERIFICAÇÃO IDADE > 18
    let minimumAge = new Date();
    minimumAge.setFullYear(minimumAge.getFullYear()-18);
    let dateFields = birthday.split("-");
    let birthDayDate = new Date(dateFields[0], dateFields[1], dateFields[2]);
    if(!birthday || birthDayDate > minimumAge)
        return res.status(400).json({message: "data de nascimento vazia/incorreta/não atingiu a idade mínima"});

    //MONTAGEM DO INSERT
    let insertQueryFields = `INSERT INTO "User" ("username", "email", "password", birthday`;
    let insertQueryValues = `VALUES ('${username}', '${email}', '${hashedPassword}', '${birthday}'`;
    if(description){
        insertQueryFields += ",description";
        insertQueryValues += `,'${description}'`;
    }
    //SALVANDO IMAGEM EM /files/profile E ADICIONANDO NO INSERT O PATH
    let filePath;
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

    //EXECUÇÃO DA QUERY
    connection.query(`${insertQueryFields} ${insertQueryValues}`).then(result => {
        if (result.rowCount)
            return res.status(201).json({ message: "Usuário criado com sucesso" });
        else{
            if(req.file)
                FileActions.deleteFiles([filePath]);
            return res.status(400).json({ error: "Usuário não inserido, favor tentar novamente" });
        }
    }).catch(error => {
        console.log(error);
        if(req.file)
            FileActions.deleteFiles([filePath]);
        return res.status(400).json({error: error});
    });
}

module.exports = {

    async login(req, res){

        const {email, password} = req.body;
   
        if(!email || !password)
            return res.status(400).json({error:"email e/ou senha vazios/inválidos"});
        try{
            const {rows} = await connection.query(
                `SELECT password FROM "User" 
                WHERE email='${email}'`);
    
            if(rows.length == 0){
                return res.status(404).json({message:"Usuário/senha incorretos"});
            }
            else{
                const validPass = await bcrypt.compare(password, rows[0].password);
                if(validPass)
                    return res.status(200).json({message:"logado"});
                else
                    return res.status(404).json({message:"Usuário/senha incorretos"});
            }
        }catch(e){
            return res.status(400).json({error:"Erro interno"});
        }
        

    },
    create(req, res){
        const profilePic = req.file;
        //DETECÇÃO SE IMAGEM DE PERFIL FOI ENVIADA
        if(req.file){
            //DETECÇÃO SE ARQUIVO É UMA IMAGEM
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