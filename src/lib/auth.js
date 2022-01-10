const connection = require("../config/database");

module.exports = {
    sessionChecker: (req, res, next) => {
        if(req.session.profile && Date.now()<req.session.cookie._expires)
            next();
        else
            return res.status(401).json({error:"Não autenticado"});
    },
    adminChecker: (req, res, next) => {
        console.log(req.session);
        connection.query(`select "isAdm" from "User" where "id" = $1`, [req.session.profile.id]).then(result => {
            if(result.rowCount > 0 && result.rows[0].isAdm)
                next();
            else
                return res.status(403).json({error: "Não autorizado"});
        });
    },
    checkNoAdmAccess: (req, res, next) => {
        console.log(req.session);
        if(req.params.id == req.session.profile.id)
            next();
        else {
            connection.query(`select "isAdm" from "User" where "id" = $1`, [req.session.profile.id]).then(result => {
                if(result.rowCount > 0 && result.rows[0].isAdm)
                    next();
                else
                    return res.status(403).json({error: "Não autorizado"});
            });
        }
    }
};