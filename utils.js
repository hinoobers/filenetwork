const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

function generateFileId() {
    let id = uuid.v4();
    while(fs.existsSync(`./uploads/${id}`)) {
        id = uuid.v4();
    }
    return id;
}

function getKeyData(key) {
    const keys = fs.readFileSync('./keys.json');
    const keyData = JSON.parse(keys);
    for(const k of keyData) {
        if(k.key === key) {
            return k;
        }
    }
    return null;
}

function deleteDirectory(directory) {
    if(fs.existsSync(directory)) { 
        fs.readdirSync(directory).forEach((file) => {
            const filePath = path.join(directory, file);
            if(fs.lstatSync(filePath).isDirectory()) {
                deleteDirectory(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        });
        fs.rmdirSync(directory);
    }
}


module.exports = { generateFileId, getKeyData, deleteDirectory };