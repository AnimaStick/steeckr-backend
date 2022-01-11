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
    },
    writeProfilePic: function(username, fileBuffer, fileExtension,folder = "profile"){
        let fileName = `${Date.now()}-${username}.${fileExtension}`;
        filePath = `./files/${folder}/${fileName}`;
        try{
            fs.writeFileSync(filePath, fileBuffer);
        }catch(e){
            console.log(e);
            return;
        }
        return filePath;
    }
};