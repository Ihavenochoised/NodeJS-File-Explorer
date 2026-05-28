# Node JS Cloud Explorer

A secure Express.js web application for managing and exploring files on a local drive or USB with authentication and rate limiting.

> Built with Node.js, Express.js, and modern security best practices

## ✨ Features

- 🔐 **Session-based Authentication** - Secure login protection with session management
- 📁 **File Management** - Upload, download, delete files, and create folders
- ⚡ **Rate Limiting** - Brute-force protection on login endpoint (5 attempts per 15 minutes)
- 🔒 **HTTPS Support** - Encrypted connections with SSL/TLS certificates
- 🛡️ **Security Headers** - Helmet.js for comprehensive HTTP header protection
- 📊 **Path Traversal Protection** - Safe directory navigation with validation
- 🚀 **Static File Serving** - Serve files from any accessible directory with authentication
- 🔑 **Bcrypt Password Hashing** - Industry-standard password encryption

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **HTTPS certificates** (`certificate/key.pem` and `certificate/https.pem`)
- **Accessible directory** (USB drive, local folder, etc.) to serve files from

> [!NOTE]
> **This project was made for Linux systems!**
> For Windows systems, it should work the same, just replace Linux directory paths with Windows (C:\\)
> 
> It is recommended for Windows users to use the setup script "node setup.js" 

## 🚀 Installation

### Option 1: Automated Setup (Recommended)

1. Clone or download the project:
```bash
git clone https://github.com/Ihavenochoised/NodeJS-File-Explorer.git
cd NodeJS-File-Explorer
```

2. Run the setup script to automatically install dependencies and configure the project:

```bash
node setup.js
```

This will:
- Install all npm dependencies
- Run the initial configuration script
- Prepare the application for running

### Option 2: Manual Installation

1. Clone or download the project:
```bash
git clone https://github.com/Ihavenochoised/NodeJS-File-Explorer.git
cd NodeJS-File-Explorer
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root (optional):

```env
PORT=443
SHARE_PATH=/path/to/your/directory
ADMIN_USERNAME=yourusername
ADMIN_PASSWORD=yourpassword
```

## 🎯 Usage

### Start the Server

```bash
npm start
```

Or directly:

```bash
node index.js
```

The application will be accessible at `https://localhost:443/` (or the port specified in the `PORT` environment variable).

### Web Interface

1. Navigate to `https://localhost:443/`
2. Log in with your configured credentials
3. Browse, upload, and manage files in the configured directory
4. Create new folders and organize your files

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home page / file browser |
| GET | `/login` | Login page |
| POST | `/api/login` | Authenticate user (rate limited) |
| POST | `/api/logout` | End user session |
| GET | `/api/files` | List files in directory |
| POST | `/api/upload` | Upload new file |
| DELETE | `/api/files/:path` | Delete file or folder |
| POST | `/api/mkdir` | Create new directory |
| GET | `/api/download/:path` | Download file |

## 📁 Project Structure

```
NodeJS-File-Explorer/
├── index.js                    # Main application entry point
├── setup.js                    # Initial setup script
├── script.js                   # Utility scripts
├── package.json                # Project dependencies
├── public/                     # Static files
│   ├── index.html             # File browser UI
│   ├── login.html             # Login page
│   ├── 404.html               # Error page
│   ├── javascripts/
│   │   └── index.js           # Frontend logic
│   └── stylesheets/
│       ├── index.css          # Main styles
│       └── login.css          # Login page styles
├── routes/
│   ├── api.js                 # API route handlers
│   └── routes.js              # Web route handlers
├── services/
│   ├── authMiddleware.js      # Authentication middleware
│   ├── login.js               # Login logic
│   └── rateLimit.js           # Rate limiting configuration
└── certificate/               # HTTPS certificates (not included)
    ├── key.pem
    └── https.pem
```

## 🐛 Troubleshooting

### HTTPS Certificate Error
If you see certificate-related errors:
```bash
# Generate self-signed certificates (development only)
openssl req -nodes -new -x509 -keyout certificate/key.pem -out certificate/https.pem -days 365
```

### Port Already in Use
If port 443 is in use:
```bash
export PORT=8443
npm start
```

### Permission Denied (HTTPS certificates)
Ensure certificates exist and are readable:
```bash
ls -la certificate/
chmod 644 certificate/*.pem
```

### Cannot Access Shared Folder
Verify the folder exists and the path is correct:
```bash
export SHARE_PATH=/path/to/your/directory
npm start
```

## 📝 Development

To run the project in development mode with environment variable support:

```bash
node setup.js  # Run setup if needed
node index.js  # Start the server
```

## 📄 License

ISC

## 👤 Author

Tian Tian

## Security Notes

⚠️ **Important**: This application has hardcoded credentials. For production use:
- Implement proper user database
- Regularly rotate SSL/TLS certificates
- Real HTTPS certificates

- **Login**: `https://localhost:443/login` - Authenticate with credentials
- **File Explorer**: `https://localhost:443/` - Browse and manage files (requires authentication)
- **Logout**: `https://localhost:443/logout` - End session

## Environment Variables

- `PORT` - Server port (default: 443)
- `USB_PATH` - Path to directory containing files to serve (required)
