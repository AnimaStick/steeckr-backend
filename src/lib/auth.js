module.exports = {
    sessionChecker: (req, res, next) => {
        if(req.session.user)
            next();
        else
            return res.status(401).json({error:"Não autenticado"});
    }
};