const fs = require('fs');
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


module.exports = { generateFileId, getKeyData };