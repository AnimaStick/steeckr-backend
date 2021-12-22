const fs = require("fs");

module.exports = {
    /**
     * 
     * @param {String[]} files 
     */
    deleteFiles: function(files){
        for(let i = 0; i < files.length; i++){
            try{
                fs.unlinkSync(files[i]);
            }catch(e){
                console.log(e);
            }
        }
    }
};