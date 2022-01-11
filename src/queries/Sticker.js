const connection = require('../config/database');
const FileActions = require("../lib/fileActions");
const QueryBuilder = require("../lib/queryBuilder");
const fs = require("fs");
const User = require('./User');

const STICKER_ATTR_ORDER = [
    "id_user", 
]

module.exports = {
    createAnimation(req, res) {
        const {
            id_user,
            title,
            description,
            path
        } = req.body
    
        //VERIFICAÇÕES OBRIGATÓRIAS
        if(!title) return res.status(400).json({message: "title vazio"})
        if(!description) return res.status(400).json({message: "description vazio"})
            
        //MONTAGEM DO INSERT
        const animationInsert = new QueryBuilder(
            `"id_user","title","description","animation_path"`,
            "$1, $2, $3, $4",
            5,
            "Animation",
            [id_user, title, description, path]
        )
    
        //EXECUÇÃO DA QUERY
        connection.query(animationInsert.query).then(result => {
            if (result.rowCount) return res.status(201).json({ message: "Animation criado com sucesso" })
            else{
                if(req.file) FileActions.deleteFiles([filePath])
                return res.status(400).json({ error: "Animation não inserido, favor tentar novamente" })
            }
        }).catch(error => {
            console.log(error)
            if(req.file) FileActions.deleteFiles([filePath])
            return res.status(400).json({error: error})
        })
    },

    uploadFile(req,res){
        
        let splittedFile = req.file.originalname.split(".")
        let path = FileActions.writeProfilePic(req.session.profile.id, req.file.buffer,splittedFile[splittedFile.length-1],"animations")
        return res.status(200).send(path)
    },

    async turnAnimationsSticker(req, res){
        let i = 1;
        try{
            for(let i = 1; i < 5; i++){
                const {rows} = await connection.query(
                    `update "Animation" as "animation" set price=anima."priceCalc", rarity=${i} from 
                        (select id,(count("like".id_animation)*0.7 + 0.3*"anim"."views") as "priceCalc",price from "Animation" as "anim" 
                            left join "Like" as "like" on "like".id_animation="anim".id where "anim".price is null
                                group by "anim".id order by "priceCalc" desc limit ${Math.ceil(i/2)}) as "anima" 
                                    where "anima".id=animation.id`);
            }
            
            const {rows} = await connection.query(
                `update "Animation" as "animation" set price=anima."priceCalc", rarity=${5} from 
                    (select id,(count("like".id_animation)*0.7 + 0.3*"anim"."views") as "priceCalc",price from "Animation" as "anim" 
                        left join "Like" as "like" on "like".id_animation="anim".id where "anim".price is null
                            group by "anim".id order by "priceCalc" desc limit ${4}) as "anima" 
                                where "anima".id=animation.id`);

            return res.status(200).json({ message: "Figurinhas criadas com sucesso!" })        
        }catch(e){
            console.log(e);
            return res.status(500).json({error: `Figurinhas de raridade ${i} ou acima não foram geradas com sucesso.`});
        }
    },
    async showAllAnimations(req, res) {
        try{
            const {rows} = await connection.query(`
            select id, title, views, description, animation_path from "Animation" where price is null
                    order by creation_date desc
                `)
            return res.json(rows)
        } catch (e) { console.log(e) }
    },
    async dropAllAnimations(req, res) {
        try{
            await connection.query(`delete from "Animation" where "id" >= 0`)
            return res.json({message: "droppado"})
        } catch (e) { console.log(e) }
    },
    async getAnimation(req,res){
        const id = req.params.id
        try {
            const user = await connection.query(`
                select a.*, count(l.id_animation) as "likes", count(c.id_animation) as "comments" from "Animation" as a 
                left join "Like" as l on l.id_animation=a.id
                    left join "Comment" as c on c.id_animation=a.id
                        where a.id=$1
                            group by a.id
                `,[id]);
            return res.json(user.rows)
        } catch (e) {console.log(e)}
    },
    async getAnimations(req,res){
        const title = req.params.title
        try {
            const search = await connection.query(`select * from "Animation" where lower("title")~lower($1)`,[title]);
            return res.json(search.rows)
        } catch (e) {console.log(e)}
    },

    //////////////// STICKER STUFF /////////////////
    
    createSticker(req, res) {
        const {
            id_user,
            animation_path,
            title,
            description,
            views,
            creation_date,
            price,
            rarity
        } = req.body
    
        //VERIFICAÇÕES OBRIGATÓRIAS
        if(!animation_path) return res.status(400).json({message: "animation_path vazio"})
        if(!title) return res.status(400).json({message: "title vazio"})
        if(!description) return res.status(400).json({message: "description vazio"})
            
        //MONTAGEM DO INSERT
        const stickerInsert = new QueryBuilder(
            `"id_user","animation_path","title","description","views","creation_date","price","rarity"`,
            "$1, $2, $3, $4, $5, $6, $7, $8",
            9,
            "Animation",
            [id_user, animation_path, title, description, views, creation_date, price, rarity]
        )
    
        //EXECUÇÃO DA QUERY
        connection.query(stickerInsert.query).then(result => {
            if (result.rowCount) return res.status(201).json({ message: "Animation criado com sucesso" })
            else{
                if(req.file) FileActions.deleteFiles([filePath])
                return res.status(400).json({ error: "Animation não inserido, favor tentar novamente" })
            }
        }).catch(error => {
            console.log(error)
            if(req.file) FileActions.deleteFiles([filePath])
            return res.status(400).json({error: error})
        })
    },
    async showUserStickers(req, res) {
        const id = req.params.id
        try{
            const {rows} = await connection.query(`
            select id, title, views, description, animation_path, price, rarity from "Animation" where ("price" is not null) and ("id_user" = $1)`, [id])
            return res.json(rows)
        } catch (e) { console.log(e) }
    }
}