// Modules + Setup ---------------------------
import express from "express";
import rateLimit from 'express-rate-limit';
import session from "express-session";
import multer, { diskStorage } from "multer";
import { resolve, join } from "path";
import { stat, rm, unlink, access, mkdir, readdir, readFileSync } from "fs";
import { createServer } from 'https';
import 'dotenv/config';

// Login Config ------------------------------
const USERNAME = 'user';        // <--- Change this
const PASSWORD = 'password';    // <--- Change this

// Dirname fix for ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const app = express();
const PORT = process.env.PORT || 443;
app.disable('x-powered-by')

app.use(session({
    secret: Math.random().toString(),
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("/"));
// Warn if USB_PATH is not set
if (!process.env.USB_PATH) {
    console.error("⚠️  Warning: USB_PATH environment variable is not set. Please set it to the path of your USB drive.");
    process.exit(1);
}
const usbPath = resolve(process.env.USB_PATH);
// Serve static files from USB
app.use("/files", authMiddleware, express.static(usbPath, {
    dotfiles: "allow"
}));


// Multer config for uploads
const storage = diskStorage({
    destination: function (req, file, cb) {
        // Use currentPath sent by frontend or default to root
        const folder = req.body.currentPath || "";
        const dest = join(usbPath, folder);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
// ---------------------------------------------


// Authentication ------------------------------

app.use(express.urlencoded({ extended: true }));

function authMiddleware(req, res, next) {
    if (req.session.loggedIn) {
        next(); // 🚀 you're in
    } else {
        res.redirect('/login');
    }
}


app.get("/", authMiddleware, (req, res) => {
    res.sendFile(join(__dirname, "public/index.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(join(__dirname, "public/login.html"));
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: '😵 Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.post("/login", loginLimiter, express.urlencoded({ extended: true }), (req, res) => {
    const { username, password } = req.body;
    if (username === USERNAME && password === PASSWORD) {
        req.session.loggedIn = true;
        res.redirect("/");
    } else {
        res.send("Login failed 😢");
    }
});
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});
// ---------------------------------------------

const upload = multer({ storage });

// Delete
app.delete("/delete", authMiddleware, (req, res) => {
    const fileName = req.query.name;
    const filePath = join(usbPath, fileName);

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
app.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
    res.send("File uploaded!");
});

// New Folder
app.post("/create-folder", authMiddleware, express.json(), (req, res) => {
    const { folderName, path: currentPath = "" } = req.body;

    if (!folderName) return res.status(400).send("Folder name is required.");

    // Resolve the new folder path safely
    const newFolderPath = join(usbPath, currentPath, folderName);

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
app.get("/list", authMiddleware, (req, res) => {
    const dirParam = req.query.dir || ""; // default to root if no dir passed
    const targetPath = join(usbPath, dirParam);

    // check for path traversal attacks like ../../etc
    if (!targetPath.startsWith(usbPath)) {
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

// HTTPS server setup
const httpsOptions = {
    key: readFileSync('./certificate/key.pem'),
    cert: readFileSync('./certificate/https.pem')
};

createServer(app).listen(PORT, () => {
    console.log(`✅ HTTPS server running at https://localhost:${PORT}/`);
});