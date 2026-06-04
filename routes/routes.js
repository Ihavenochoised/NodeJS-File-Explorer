import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authMiddleware from "../services/authMiddleware.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public");

// Additional routes
router.get("/", authMiddleware, (req, res) => {
    res.sendFile(path.join(root, "index.html"));
});
router.get("/login", (req, res) => {
    res.sendFile(path.join(root, "login.html"));
});
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;