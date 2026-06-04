import express from "express";
import loginLimiter from "../services/rateLimit.js";
import bcrypt from 'bcrypt';

const router = express.Router();

// `/login/` is prepended to all routes below

let credentialsSet = false;

const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
if (
    typeof ADMIN_USERNAME === "string" &&
    ADMIN_USERNAME.length > 0 &&
    typeof ADMIN_PASSWORD === "string" &&
    ADMIN_PASSWORD.length > 0
) {
    credentialsSet = true;
} else {
    console.warn("⚠️  Warning: Admin credentials not set. Login will succeed with empty username and password, which is not secure. Please set ADMIN_USERNAME and ADMIN_PASSWORD environment variables.");
    credentialsSet = false;
}

router.post("/", loginLimiter, express.urlencoded({ extended: true }), (req, res) => {
    const { username, password } = req.body;
    if (credentialsSet) {
        const hashedAdminPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
        if (username === ADMIN_USERNAME && bcrypt.compare(password, hashedAdminPassword)) {
            req.session.loggedIn = true;
            res.redirect("/");
        } else {
            res.send("Login failed 😢");
        }
    } else {
        if (username === "" && password === "") {
            req.session.loggedIn = true;
            res.redirect("/");
        } else {
            res.send("Login failed 😢");
        }
    }
});

export default router;