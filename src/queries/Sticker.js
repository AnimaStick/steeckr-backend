const connection = require('../config/database');
const FileActions = require("../lib/fileActions");
const QueryBuilder = require("../lib/queryBuilder");

module.exports = {
    create(req, res) {
        const {
            animation_path,
            title,
            description, 
            likes,
            views,
            price,
            rarity
        } = req.body
    
        //VERIFICAÇÕES OBRIGATÓRIAS
        if(!animation_path) return res.status(400).json({message: "animation_path vazio"})
        if(!title) return res.status(400).json({message: "title vazio"})
        if(!description) return res.status(400).json({message: "description vazio"})
            
        //MONTAGEM DO INSERT
        const stickerInsert = new QueryBuilder(
            `"animation_path","title","description","likes","views","price","rarity"`,
            "$1, $2, $3, $4, $5, $6, $7",
            8,
            "Sticker",
            [animation_path, title, description, likes, views, price, rarity]
        )
    
        //EXECUÇÃO DA QUERY
        connection.query(stickerInsert.query).then(result => {
            if (result.rowCount) return res.status(201).json({ message: "Sticker criado com sucesso" })
            else{
                if(req.file) FileActions.deleteFiles([filePath])
                return res.status(400).json({ error: "Sticker não inserido, favor tentar novamente" })
            }
        }).catch(error => {
            console.log(error)
            if(req.file) FileActions.deleteFiles([filePath])
            return res.status(400).json({error: error})
        })
    },
    async turnAnimationsSticker(req, res){
        const {rows} = await connection.query(
            `select "st".id_user,"st".animation_path,"st".title,"st".description,"st"."views",(count("like".id_animation)*0.7 + 0.3*"st"."views") as "price",  from "Sticker" as "st" 
                left join "Like" as "like" where "like".id_animation="st".id_animation 
                order by "price" limit 10`);
        let rarity = 1;
        let stickerQuery = `insert into "Sticker"(id_user,animation_path,title,description,"views", price, rarity) values`;
        let stickerValues = [];
        for (let i = 0; i < rows.length; i++) {
            let j = 1;
            stickerQuery += "(";
            for(j = 1; j < 8; j++){
                stickerQuery += `$${i+j}`;
                stickerValues.push()
                if(j != 7)
                stickerQuery += ",";
            }
            stickerQuery += ")";
            if(i != (rows.length - 1))
            stickerQuery += ",\n";
        }
    },
    async showAll(req, res) {
        try{
            const {rows} = await connection.query(`select * from "Sticker"`)
            return res.json(rows)
        } catch (e) { console.log(e) }
    },
    async dropAll(req, res) {
        try{
            await connection.query(`delete from "Sticker" where "id" >= 0`)
            return res.json({message: "droppado"})
        } catch (e) { console.log(e) }
    }
}