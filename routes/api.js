import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API 🚀' });
});

router.get('/status', (req, res) => {
    res.json({ uptime: process.uptime(), status: 'OK', time: new Date() });
});

// -----------------------------------------

// Modules + Setup -------------------------
import multer, { diskStorage } from "multer";
import { resolve, join } from "path";
import { stat, rm, unlink, access, mkdir, readdir, readFileSync } from "fs";
import authMiddleware from "../services/authMiddleware.js";

const SHARE_PATH = process.env.SHARE_PATH; 

// Multer config for uploads
const storage = diskStorage({
    destination: function (req, file, cb) {
        // Use currentPath sent by frontend or default to root
        const folder = req.body.currentPath || "";
        const dest = join(SHARE_PATH, folder);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// -----------------------------------------

// `/api/` is prepended to all routes below

// Delete
router.delete("/delete", authMiddleware, (req, res) => {
    const fileName = req.query.name;
    const filePath = join(SHARE_PATH, fileName);

    stat(filePath, (err, stats) => {
        if (err) return res.status(500).send("File or folder not found.");

        if (stats.isDirectory()) {
            // Delete folder recursively
            rm(filePath, { recursive: true, force: true }, (err) => {
                if (err) return res.status(500).send("Could not delete folder.");
                res.send("Folder deleted!");
            });
        } else {
            // Delete file
            unlink(filePath, (err) => {
                if (err) return res.status(500).send("Could not delete file.");
                res.send("File deleted!");
            });
        }
    });
});


// Upload
router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
    res.send("File uploaded!");
});

// New Folder
router.post("/create-folder", authMiddleware, express.json(), (req, res) => {
    const { folderName, path: currentPath = "" } = req.body;

    if (!folderName) return res.status(400).send("Folder name is required.");

    // Resolve the new folder path safely
    const newFolderPath = join(SHARE_PATH, currentPath, folderName);

    // Check if folder already exists to avoid overwriting
    access(newFolderPath, (err) => {
        if (!err) return res.status(400).send("Folder already exists.");

        // Create the folder
        mkdir(newFolderPath, (err) => {
            if (err) return res.status(500).send("Failed to create folder.");
            res.send("Folder created!");
        });
    });
});

// List
router.get("/list", authMiddleware, (req, res) => {
    const dirParam = req.query.dir || ""; // default to root if no dir passed
    const targetPath = join(SHARE_PATH, dirParam);

    // check for path traversal attacks like ../../etc
    if (!targetPath.startsWith(SHARE_PATH)) {
        return res.status(400).send("Invalid path!");
    }

    readdir(targetPath, { withFileTypes: true }, (err, entries) => {
        if (err) return res.status(500).send("Error reading folder");

        const files = entries.map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? "folder" : "file"
        }));

        res.json({ current: dirParam, items: files });
    });
});

// -----------------------------------------

export default router;