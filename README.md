# 🌾 Smart Farming Analytics

A comprehensive, production-ready web application for agricultural data analysis and monitoring with real-time weather integration, OTP authentication, and responsive design.

## 🚀 Setup - Manual Steps

### **Prerequisites**
- Node.js v14+ installed
- npm installed (comes with Node.js)

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

### **Step 3: Configure Backend (Optional - for Email OTP)**
Edit `server/config.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Step 4: Start Backend Server (Open Terminal 1)**
```bash
cd server
node server.js
```
**Expected Output:**
```
Config loaded: {...}
Database initialized successfully
Server running on port 5000
```

### **Step 5: Start Frontend Server (Open Terminal 2)**
From project root:
```bash
npm run dev
```
**Expected Output:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:3000/
```

### **Step 6: Open Application**
Open browser: `http://localhost:3000`

## 🌟 Features

- 🔐 OTP Email Verification - Secure authentication
- 🌤️ Real-Time Weather - Live data from OpenWeather API
- 📊 Analytics Dashboard - Crop and soil health monitoring
- 📱 Responsive Design - Mobile, tablet, and desktop
- 💾 Local Database - SQLite with data persistence
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

## 🔧 Configuration (Optional)

Edit `server/config.env` to customize:

```env
# Email Setup (Optional - for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Weather API (Default included)
OPENWEATHER_API_KEY=2170cf9f72b3eee31fdac25765223afd

# Server
PORT=5000
NODE_ENV=development
```

## 🏗️ Architecture

**Frontend**: React 18 + TypeScript + Tailwind CSS  
**Backend**: Node.js + Express + SQLite  
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

## 🚀 Troubleshooting

**Port in use?**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Email not working?**
- Check `server/config.env` credentials
- Use Gmail App Password (not regular password)
- Enable 2-Factor Authentication on Gmail

**Dependencies missing?**
```bash
npm cache clean --force
npm install
cd server && npm install
```

## 📄 License

MIT License - Open source

---

**Application ready at http://localhost:3000** 🌾