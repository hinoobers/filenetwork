const fs = require('fs');

function generateFileId() {
    let id = Math.floor(Math.random() * 1000000).toString();
    while(fs.existsSync(`./uploads/${id}`)) {
        id = Math.floor(Math.random() * 1000000).toString();
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