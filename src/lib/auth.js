const connection = require("../config/database");

module.exports = {
    sessionChecker: (req, res, next) => {
        if(req.session.user)
            next();
        else
            return res.status(401).json({error:"Não autenticado"});
    },
    adminChecker: (req, res, next) => {
        connection.query(`select "isAdm" from "User" where "id" = $1`, [req.session.user.id]).then(result => {
            if(result.rowCount > 0 && result.rows[0].isAdm)
                next();
            else
                return res.status(403).json({error: "Não autorizado"});
        });
    },
    checkNoAdmAccess: (req, res, next) => {
        if(req.params.id == req.session.user.id)
            next();
        else {
            connection.query(`select "isAdm" from "User" where "id" = $1`, [req.session.user.id]).then(result => {
                if(result.rowCount > 0 && result.rows[0].isAdm)
                    next();
                else
                    return res.status(403).json({error: "Não autorizado"});
            });
        }
    }
};