const express = require('express');

const router = express.Router();

router.get('/getUser', (request, response) => {
    
    response.status(200).json({message:"Não há usuário especificado"});
})

module.exports = router;