import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import loginRouter from './services/login.js';
import pageRouter from './routes/routes.js';
import apiRouter from './routes/api.js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import authMiddleware from './services/authMiddleware.js';

// Dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middleware
app.disable('x-powered-by')
app.use(session({
    secret: Math.random().toString(),
    resave: false,
    saveUninitialized: false
}));

const SHARE_PATH = process.env.SHARE_PATH;
if (!process.env.SHARE_PATH) {
    console.error("❌  Warning: SHARE_PATH environment variable is not set. Please set it to the path of your share directory.");
    process.exit(1);
}
app.use(express.urlencoded({ extended: true }));
app.use("/files", authMiddleware, express.static(SHARE_PATH, {
    dotfiles: "allow"
}));

// 🧩 Routers
app.use('/', pageRouter);
app.use('/login', loginRouter);
app.use('/api', express.json(), apiRouter);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// 404 fallback
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/public/404.html'));
});

const certPath = path.join(__dirname, 'certificate');
const keyFile = path.join(certPath, 'key.pem');
const certFile = path.join(certPath, 'https.pem');

const PORT = process.env.PORT || (fs.existsSync(keyFile) && fs.existsSync(certFile) ? 443 : 80); 

if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
    console.warn('⚠️  Warning: SSL certificate files not found. Please generate "key.pem" and "https.pem" in the "certificate" directory for HTTPS to work.');
    console.log('📍  Starting HTTP server instead...');
    http.createServer(app).listen(PORT, () => {
        console.log(`✅  HTTP server running at http://localhost:${PORT}/`);
    });
} else {
    console.log('✅  SSL certificates found. Starting HTTPS server...');
    const httpsOptions = {
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(certFile)
    };
    https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log(`✅  HTTPS server running at https://localhost:${PORT}/`);
    });
}
if (process.env.DEBUG_CWD) {
    console.log(`File is running in ${process.cwd()}`);
}
