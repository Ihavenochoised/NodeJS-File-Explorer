# Cloud Explorer

A secure Express.js web application for managing files on a USB drive with authentication and rate limiting.

## Features

- 🔐 **Session-based Authentication** - Login protection with hardcoded credentials
- 📁 **File Management** - Upload, download, delete files and create folders
- ⚡ **Rate Limiting** - Brute-force protection on login endpoint (5 attempts per 15 minutes)
- 🔒 **HTTPS Support** - Secure connections with SSL/TLS certificates
- 📊 **Path Traversal Protection** - Safe directory navigation with validation
- 🚀 **Static File Serving** - Serve files from USB drive with authentication

## Prerequisites

- Node.js and npm
- HTTPS certificates (`certificate/key.pem` and `certificate/https.pem`)
- USB drive or accessible directory to serve files from

## Installation

```bash
npm install
```

## Configuration

Set the `USB_PATH` environment variable to point to the directory you want to serve:

```bash
export USB_PATH=/path/to/usb/drive
```

Update default credentials in `index.js`:
```javascript
const USERNAME = 'user';
const PASSWORD = 'password';
```

## Usage

Start the server:
```bash
node index.js
```

The application runs on `https://localhost:443/` by default (or the port specified in `PORT` environment variable).

### Web Interface

- **Login**: `https://localhost:443/login` - Authenticate with credentials
- **File Explorer**: `https://localhost:443/` - Browse and manage files (requires authentication)
- **Logout**: `https://localhost:443/logout` - End session

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Submit login credentials (rate limited)
- `GET /logout` - Destroy session and redirect to login

### File Operations
- `GET /list?dir=path` - List files and folders in directory
- `POST /upload` - Upload a file (requires authentication)
- `POST /create-folder` - Create a new folder (requires authentication)
- `DELETE /delete?name=file` - Delete a file or folder (requires authentication)

### Static Files
- `GET /files/*` - Download files from USB drive (requires authentication)

## Security Notes

⚠️ **Important**: This application has hardcoded credentials. For production use:
- Implement proper user database
- Use environment variables for credentials
- Consider implementing more robust session management
- Regularly rotate SSL/TLS certificates

## File Structure

```
.
├── index.js           # Main Express application
└── public/            # Static web interface
```

## Environment Variables

- `PORT` - Server port (default: 443)
- `USB_PATH` - Path to directory containing files to serve (required)
