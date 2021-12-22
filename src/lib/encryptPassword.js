const bcrypt = require('bcrypt');

exports.encryptPassword = rawPassword => {
    
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(rawPassword, salt)

}