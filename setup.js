#!/usr/bin/env node

// Script will be executed before actual setup-script.js, makes sure important modules are present for setup-script.js
import { spawn } from 'child_process';

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

async function startSetup() {
    try {
        console.log(':: Installing dependencies...');
        await runCommand('npm install');
        console.log(':: Dependencies installed successfully. Starting setup script...');
        await runCommand('node script.js');
        console.log('Setup completed successfully. You can now start the server with "npm start".');
    } catch (error) {
        console.error('==> Setup failed:', error);
        process.exit(1);
    }
}

startSetup()
