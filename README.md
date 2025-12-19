# 🌾 Smart Farming Analytics

A comprehensive, production-ready web application for agricultural data analysis and monitoring with real-time weather integration, OTP authentication, and responsive design.

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Create .env file in server/ with your credentials
# (See Step 3 below for complete setup)

# 3. Terminal 1: Start backend
cd server
node server.js

# 4. Terminal 2: Start frontend
npm run dev

# 5. Open http://localhost:3000
```

## 🚀 Setup - Manual Steps (Tested & Error-Free)

### **Prerequisites**
- Node.js v14+ installed
- npm installed (comes with Node.js)
- MongoDB connection string (from MongoDB Atlas or local)

### **Step 1: Install Frontend Dependencies**
```bash
npm install
```

### **Step 2: Install Backend Dependencies**
```bash
cd server
npm install
cd ..
```

### **Step 3: Create Environment File (CRITICAL - Don't Skip!)**
⚠️ **Important**: Create a `.env` file (NOT `config.env`) in the `server/` directory

Edit or create `server/.env` with your credentials:

```env
# Email Configuration (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# MongoDB Connection (REQUIRED)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# OpenWeather API (comes with default)
OPENWEATHER_API_KEY=2170cf9f72b3eee31fdac25765223afd

# JWT Secret (keep this secure)
JWT_SECRET=your-super-secret-jwt-key-for-agroanalytics-2024

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
```

**For Gmail SMTP:**
- Use your Gmail account with 2-Factor Authentication enabled
- Generate an App Password (not your regular password)
- Copy the 16-character password to `SMTP_PASS`

**For MongoDB:**
- Get free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Use format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### **Step 4: Start Backend Server (Open Terminal 1)**
```bash
cd server
node server.js
```

**Expected Output:**
```
Config loaded: {
  smtp: { host: 'smtp.gmail.com', port: 587, user: 'your-email@gmail.com', pass: '***' }
  ...
}
SMTP Config: { host: 'smtp.gmail.com', port: 587, user: 'your-email@gmail.com', pass: '***hidden***' }
MongoDB connected
Server running on port 5000
Health check: http://localhost:5000/api/health
✅ SMTP Server is ready to send emails
```

**If you see errors:**
- ❌ "MONGO_URI is required" → Check `.env` file exists in `server/` directory with `MONGO_URI` value
- ❌ "Cannot connect to MongoDB" → Verify MongoDB URI is correct and your IP is whitelisted in MongoDB Atlas
- ❌ "SMTP issues" → Verify email credentials and App Password is set correctly

### **Step 5: Start Frontend Server (Open Terminal 2)**
From project root directory:
```bash
npm run dev
```

**Expected Output:**
```
VITE v6.3.5 ready in 255 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**If you see errors:**
- ❌ Port 3000 in use → Run `netstat -ano | findstr :3000` to find process and kill it

### **Step 6: Open Application in Browser**
Navigate to: **http://localhost:3000**

✅ Application is now running!

## 🌟 Features

- 🔐 OTP Email Verification - Secure authentication
- 🌤️ Real-Time Weather - Live data from OpenWeather API
- 📊 Analytics Dashboard - Crop and soil health monitoring
- 📱 Responsive Design - Mobile, tablet, and desktop
- 💾 Cloud Database - MongoDB with data persistence
- ⚡ Real-Time Updates - WebSocket integration

## 🎯 Usage

### **Sign Up / Login**
1. Open http://localhost:3000
2. Click "Sign Up" or "Login"
3. Enter email address
4. Verify with OTP (check email)
5. Access dashboard

### **Features Available**
- Real-time weather data
- Crop analytics
- Soil health monitoring
- Market trends
- Weather forecasts
- Government schemes

## 🔧 Configuration (Optional Customization)

The `.env` file in `server/` directory contains all configuration:

```env
# Email Setup (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Weather API (free tier available)
OPENWEATHER_API_KEY=your-api-key

# Database Connection
MONGO_URI=your-mongodb-connection-string

# Server Settings
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=your-jwt-secret-key
```

**Note:** The `.env` file is loaded automatically by the server when it starts. Changes require server restart.

## 🏗️ Architecture

**Frontend**: React 18 + TypeScript + Tailwind CSS  
**Backend**: Node.js + Express + MongoDB  
**Database**: MongoDB with Mongoose ODM  
**Real-time**: WebSocket integration  
**Authentication**: JWT + OTP verification  

## 📁 Project Structure

```
├── server/              # Backend
│   ├── server.js       # Main server
│   ├── database.js     # Database setup
│   ├── config.env      # Configuration
│   └── config.js       # Config loader
├── src/                # Frontend
│   ├── components/     # React components
│   ├── services/       # API services
│   └── styles/         # CSS styles
├── setup-local.bat     # Setup script
├── start-everything.bat # Start script
└── README.md           # This file
```

## ✅ What Works

- ✅ User authentication with OTP
- ✅ Real-time weather data
- ✅ Responsive dashboard
- ✅ Data persistence
- ✅ Email notifications
- ✅ Mobile support

## 🚀 Troubleshooting Guide

### **Backend Server Won't Start**

**Error: "MONGO_URI is required to connect to MongoDB"**
```
✅ Solution:
1. Verify `.env` file exists in `server/` directory (NOT `config.env`)
2. Check MONGO_URI value is present and correct
3. Ensure MongoDB Atlas IP whitelist includes your computer
4. Restart the server: cd server && node server.js
```

**Error: "Cannot connect to MongoDB"**
```
✅ Solution:
1. Test MongoDB connection string format
2. Check MongoDB Atlas cluster is running
3. Verify username/password in connection string
4. Whitelist your IP address in MongoDB Atlas Network Access
```

**Error: "Port 5000 already in use"**
```bash
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env file to 5001
```

### **Frontend Server Won't Start**

**Error: "Port 3000 already in use"**
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or modify Vite config to use different port
```

**Error: "npm dependencies missing"**
```bash
npm cache clean --force
rm -r node_modules
npm install
cd server && npm install
```

### **Email/OTP Issues**

**Error: "SMTP authentication failed"**
```
✅ Solution:
1. Use Gmail App Password (16 characters), NOT regular password
2. Enable 2-Factor Authentication on Gmail account
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Verify SMTP_USER and SMTP_PASS in .env file
```

**OTP not arriving in email:**
```
✅ Check:
1. Gmail account has 2FA enabled
2. SMTP credentials are correct in .env
3. Check spam/junk folder
4. Server is showing: "✅ SMTP Server is ready to send emails"
```

### **Database Issues**

**Error: "Database not initialized"**
```
✅ Solution:
1. Verify MONGO_URI in .env file
2. Check MongoDB Atlas connection status
3. Ensure database exists in MongoDB Atlas
4. Check collections are created
```

### **Environment Setup Issues**

**Multiple terminals showing different errors:**
```bash
# Ensure each terminal is in correct directory:

# Terminal 1 (Backend) - must be in server/ directory
cd server
node server.js

# Terminal 2 (Frontend) - must be in project root
npm run dev
```

### **Still Having Issues?**

Try the complete reset:
```bash
# Stop both servers (Ctrl+C in each terminal)

# Clean up
cd server
npm cache clean --force
rm -r node_modules package-lock.json

cd ..
npm cache clean --force
rm -r node_modules package-lock.json

# Reinstall
npm install
cd server && npm install

# Verify .env file exists and has all values
cat .env

# Start fresh
# Terminal 1
cd server && node server.js

# Terminal 2 (new terminal)
npm run dev
```

## 📄 License

MIT License - Open source

---

**Application ready at http://localhost:3000** 🌾