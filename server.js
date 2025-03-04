const express = require("express");
const app = express();
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const {generateFileId, getKeyData, deleteDirectory, getFolderSize} = require('./utils');

// Settings
const PORT = 3000;
const UPLOAD_DIR = './uploads';
const MAX_UPLOADS_SIZE = 50 * 1e+9; // 50 GB, before we refuse any uploads
const BASE_URL = "http://localhost:3000";

console.log("Current used space by uploads: ", `${(getFolderSize(UPLOAD_DIR) / 1e+6)} mb`);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const id = generateFileId();
        const p = path.join(UPLOAD_DIR, id);
        fs.mkdirSync(p, {recursive: true});
        cb(null, p);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage, limits: {fileSize: 107374182400} });
app.use(express.static("public/"));

const keyCheck = (req, res, next) => {
    const key = req.headers.authorization || "FREE";
    if(!key) {
        return res.status(403).send({error: "No key provided"});
    }

    if(getKeyData(key) === null) {
        return res.status(403).send({error: "Invalid key"});
    } else {
        req.authKey = key;
        
        const maxSize = getKeyData(key).maxSize;
        if(req.headers["content-length"] > maxSize) {
            return res.status(413).send({error: "File too large"});
        }
        next();
    }
};

app.post("/upload", keyCheck, upload.single("file"), (req, res) => {
    if(!req.file) {
        return res.status(400).send({error: "No file uploaded"});
    }

    if(getFolderSize(UPLOAD_DIR) > MAX_UPLOADS_SIZE) {
        return res.status(413).send({error: "Server storage is full"});
    }

    const fileId = path.basename(req.file.destination);
    const fileDirectory = path.join(UPLOAD_DIR, fileId);

    const fileInfo = {
        id: fileId,
        name: req.file.originalname,
        size: req.file.size,
        mime: req.file.mimetype,
        uploaded: Date.now(),
        downloads: 0,
        key: req.authKey
    };
    fs.writeFileSync(path.join(fileDirectory, "info.json"), JSON.stringify(fileInfo));
    
    if(req.query.viewOnly) {
        // ShareX Support
        return res.send(`${BASE_URL}/view/${fileId}`);
    }
    res.send({id: fileId, downloadURL: `${BASE_URL}/download/${fileId}`, viewURL: `${BASE_URL}/view/${fileId}`});
});

app.get("/download/:id", (req, res) => {
    const fileId = req.params.id;
    if(!fileId) {
        return res.status(400).send({error: "No file ID provided"});
    }

    const fileDirectory = path.join(UPLOAD_DIR, fileId);
    if(!fs.existsSync(fileDirectory)) {
        return res.status(404).send({error: "File not found"});
    }

    const fileInfo = JSON.parse(fs.readFileSync(path.join(fileDirectory, "info.json")));
    fileInfo.downloads++;
    let del = Date.now() > fileInfo.uploaded + (getKeyData(fileInfo.key).expires * 3.6e+6);
    if(getKeyData(fileInfo.key).expires < 0) {
        del = false;
    }
    
    if(fileInfo.downloads < getKeyData(fileInfo.key).maxDownloads) {
        fs.writeFileSync(path.join(fileDirectory, "info.json"), JSON.stringify(fileInfo));
    } else {
        del = true;
    }

    res.download(path.join(fileDirectory, fileInfo.name), fileInfo.name);
    if(del) {
        deleteDirectory(fileDirectory);
    }
});

app.get("/view/:id", (req, res) => {
    const fileId = req.params.id;
    if(!fileId) {
        return res.status(400).send({error: "No file ID provided"});
    }

    const fileDirectory = path.join(UPLOAD_DIR, fileId);
    if(!fs.existsSync(fileDirectory)) {
        return res.status(404).send({error: "File not found"});
    }

    const fileInfo = JSON.parse(fs.readFileSync(path.join(fileDirectory, "info.json")));
    const mime = fileInfo.mime;

    if(["image/jpeg", "image/png", "image/gif", "text/plain"].includes(mime)) {
        res.setHeader('Content-Type', mime);
        res.sendFile(path.join(fileDirectory, fileInfo.name), {root: __dirname});
    } else {
        res.status(400).send({error: "File is not viewable"});
    }
});


app.listen(PORT, () => {
    console.log("Server running on port 3000");
});