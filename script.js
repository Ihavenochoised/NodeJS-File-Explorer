// Setup script for the project

import { spawn } from 'child_process';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import readline from 'readline';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to run a command and return a promise
function runCommand(command) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, {
            shell: true,
            stdio: 'inherit'
        });
        child.on('error', (error) => {
            reject(`Error: ${error.message}`);
        });
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(`Process exited with code ${code}`);
            }
        });
    });
}

// Initialise readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Report errors
process.on('SIGINT', () => {
    console.log('\nCaught SIGINT');
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log('\nCaught SIGTERM');
    process.exit(1);
});
process.on('SIGQUIT', () => {
    console.log('\nCaught SIGQUIT');
    process.exit(1);
})
rl.on('SIGINT', () => {
    console.log('\nCaught SIGINT');
    process.exit(1);
});
rl.on('SIGTERM', () => {
    console.log('\nCaught SIGTERM');
    process.exit(1);
});
rl.on('SIGQUIT', () => {
    console.log('\nCaught SIGQUIT');
    process.exit(1);
})

// Function to set up the project
async function setupProject() {
    try {
        let envContents;
        let finalPort;
        let finalSharePath;
        let finalAdminUsername;
        let finalAdminPassword;

        console.log(':: Setting up environment variables...');
        const envPath = path.join(__dirname, '.env');
        if (!existsSync(envPath)) {
            let answer = await ask('==> Do you want to create a .env file with default values? (y/N) ');
            if (answer.toLowerCase() === 'y') {
                envContents = 'PORT=3000\nSHARE_PATH=./share';
                console.log('.env file created with default values. Please review and update as needed.');
            } else {
                let port = await ask('==> Please enter the PORT number the server will run on (default 3000): ');
                finalPort = port || '3000';
                let sharePath = await ask('==> Please enter the SHARE_PATH (default ./share): ');
                finalSharePath = sharePath || './share';
                let adminUsername = await ask('==> Please enter the ADMIN_USERNAME (optional): ');
                finalAdminUsername = adminUsername || '';
                let adminPassword = await ask('==> Please enter the ADMIN_PASSWORD (optional): ');
                finalAdminPassword = adminPassword || '';
                let hashedPassword = await bcrypt.hash(finalAdminPassword, 10);
                envContents = `PORT=${finalPort}\nSHARE_PATH=${finalSharePath}\nADMIN_USERNAME=${finalAdminUsername}\nADMIN_PASSWORD=${hashedPassword}`;
                console.log(':: Saving your configuration...');
                writeFileSync(envPath, envContents);
                console.log(':: .env file saved successfully.');
            }
        } else {
            console.log(':: .env file already exists. Skipping creation.');
            finalSharePath = process.env.SHARE_PATH;
        }

        let sslAnswer = await ask('==> Do you want to set up SSL certificates for HTTPS? (y/N) ');
        if (sslAnswer.toLowerCase() === 'y') {
            if (!existsSync(path.join(__dirname, 'certificate'))) {
                console.log(':: Creating certificate directory...');
                mkdirSync(path.join(__dirname, 'certificate'), { recursive: true });
            }
            console.log(':: Generating self-signed SSL certificates using OpenSSL...');
            try {
                await runCommand('openssl req -x509 -newkey rsa:4096 -keyout certificate/key.pem -out certificate/https.pem -days 365 -nodes -subj "/CN=localhost"');
                console.log(':: SSL certificates generated successfully in the "certificate" directory.');
            } catch (sslError) {
                console.error(`==> Error generating SSL certificates: ${sslError} (do you have openssl installed?)`);
                console.log(':: You can still try generating certificates from https://www.cryptool.org/en/cto/openssl/ (not affiliated)')
            }
        } else {
            console.log(':: Skipping SSL certificate generation. The server will run in HTTP mode.');
        }

        console.log(':: Initialising share directory...');
        const sharePath = finalSharePath || './share';
        if (!existsSync(sharePath)) {
            mkdirSync(sharePath, { recursive: true });
            console.log(`:: Share directory created at ${sharePath}.`);
        } else {
            console.log(':: Share directory already exists. Skipping creation.');
        }
        rl.close();
    } catch (error) {
        console.error(`==> Setup failed: ${error}`);
        process.exit(1);
    }
}

// Run the setup
setupProject();