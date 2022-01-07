const connection = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const validate = require('../lib/validate');
const mmm = require('mmmagic'),
Magic = mmm.Magic;
let magic = new Magic(mmm.MAGIC_MIME_TYPE);
const { encryptPassword } = require('../lib/encryptPassword');
const FileActions = require("../lib/fileActions");
const QueryBuilder = require("../lib/queryBuilder");
const { validateEmail, validateBirthDate } = require('../lib/validate');
const { writeProfilePic } = require('../lib/fileActions');
const UpdateBuilder = require('../lib/updateBuilder');

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
    if(!validateBirthDate(birthday))
        return res.status(400).json({message: "data de nascimento vazia/incorreta/não atingiu a idade mínima"});
    //MONTAGEM DO INSERT
    const userInsert = new QueryBuilder(
        `"username","email","password",birthday`,
        "$1, $2, $3, $4",
        5,
        "User",
        [username, email, hashedPassword, birthday]
    );

    if(description)
        userInsert.insertValue("description", description);

    //SALVANDO IMAGEM EM /files/profile E ADICIONANDO NO INSERT O CAMINHO DELA
    let filePath;
    if(req.file){
        const filePath = writeProfilePic(username, req.file.buffer, fileExtension);
        if(!filePath)
            return res.status(500).json({error: "erro interno"});
        userInsert.insertValue("picture_path", filePath);
    }
    //EXECUÇÃO DA QUERY
    connection.query(userInsert.query).then(result => {
        if (result.rowCount > 0)
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

async function updateUser(req, res, fileExtension){
    const id = req.params.id;
    if(!id)
        return res.status(400).json({error: "id inválido"});

    const profilePic = req.file;

    const {
        username,
        email,
        password, 
        birthday,
        description
    } = req.body;  

    const updateBuilder = new UpdateBuilder("User");

    if(username)
        updateBuilder.insertValue("username", username);
    if(email){
        if(!validateEmail(email))
            return res.status(400).json({error:"email inválido!"});
        updateBuilder.insertValue("email", email);  
    }
    if(password){
        const hashedPassword = await encryptPassword(password);
        updateBuilder.insertValue("password", hashedPassword);
    }
    if(birthday){
        if(validateBirthDate(birthday))
            updateBuilder.insertValue("birthday", birthday);
        else
            return res.status(400).json({error: "data de nascimento inválida"});
    }
    if(description)
        updateBuilder.insertValue("description", description);   
    
    let oldProfilePath, filePath;  
    if(profilePic){
        const { rows } = await connection.query(`select picture_path, username from "User" where id=$1`, [id]);
        oldProfilePath = rows[0].picture_path;
        const pictureUsername = username ? username : rows[0].username;
        
        filePath = await writeProfilePic(pictureUsername, profilePic.buffer, fileExtension);
        if (!filePath)
            return res.status(500).json({ error: "erro interno" });
        updateBuilder.insertValue("picture_path", filePath);
    }
        
    updateBuilder.values.push(id);
    try{
        const {rows} = await connection.query(updateBuilder.updateQuery);
        if(rows.length > 0){
            if(oldProfilePath){
                try{
                    await fs.unlinkSync(oldProfilePath);
                }catch(e){
                    console.log(e);
                    return res.status(200).json({message: "usuário atualizado com sucesso!", error: "erro interno ocorreu, imagem antiga reside no server"});
                }
            }
            return res.status(200).json({message: "usuário atualizado com sucesso!"});
        }
        else{
            if(filePath){
                try {
                    await fs.unlinkSync(filePath);
                }catch (e) {
                    console.log(e);
                    return res.status(500).json({ error: "erro interno ocorreu, imagem nova reside no server" });
                }
            } 
            return res.status(500).json({ error: "erro interno" });
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({error: "erro interno"});
    }
}

module.exports = {

    async login(req, res){

        const {email, password} = req.body;
   
        if(!email || !password)
            return res.status(400).json({error:"email e/ou senha vazios/inválidos"});
        try{
            const query = {
                text: `SELECT id, password FROM "User"
                WHERE email=$1`,
                values: [email]
            }
            const {rows} = await connection.query(query);
    
            if(rows.length == 0){
                return res.status(404).json({message:"Usuário/senha incorretos"});
            }
            else{
                const validPass = await bcrypt.compare(password, rows[0].password);
                if(validPass){
                    req.session.profile = {id: rows[0].id};
                    return res.status(200).json({message:"logado"});
                }
                else
                    return res.status(404).json({message:"Usuário/senha incorretos"});
            }
        }catch(e){
            console.log(e);
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
            return createUser(req, res, "");
        }
        
        
    },
    update(req, res){
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
                updateUser(req, res, nameAndExtension[1]).then(res => {return res});
            });
        }
        else{
            updateUser(req, res, "").then(res => {return res});
        }
        
    },
    async delete(req, res){
        const id = req.params.id;
        try{
            parseInt(id);
        }catch(e){
            return res.status(400).json({message: `Id inválido, favor tentar novamente`});
        }
        const {rows} = await connection.query(`select picture_path from "User" where "id"=$1`,[id]);
        let queryRes;
        try{
            queryRes = await connection.query(`delete from "User" where "id"=$1 RETURNING id`, [id]);
        }catch(e){
            console.log(e);
            return res.status(500).json({message: `Erro interno, favor tentar novamente`});
        }
        if(queryRes.rowCount > 0){
            if(rows[0].picture_path){
                await fs.unlinkSync(rows[0].picture_path);
            }
            return res.status(200).json({message: `Usuário de id ${id} deletado com sucesso`});
        }
        else
            return res.status(404).json({message: "Usuário não existe"});
    },
    async showAll(req, res) {
        try{
            const {rows} = await connection.query(`select * from "User"`)
            return res.json(rows)
        } catch (e) { console.log(e) }
    },
    async dropAll(req, res) {
        try{
            await connection.query(`delete from "User" where "id" >= 0`)
            return res.json({message: "droppado"})
        } catch (e) { console.log(e) }
    },
    async getUser(req,res){
        const id = req.params.id
        try {
            const user = await connection.query(`select * from "User" where "id"=$1`,[id]);
            return res.json(user.rows)
        } catch (e) {console.log(e)}
    }
};