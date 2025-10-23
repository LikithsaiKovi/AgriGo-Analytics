# 🌾 Smart Farming Analytics

A comprehensive, production-ready web application for agricultural data analysis and monitoring with real-time weather integration, OTP authentication, and responsive design.

## 🚀 Quick Start

### **Option 1: Automatic Start (Recommended)**
```bash
start-everything.bat
```

### **Option 2: Alternative Start**
```bash
START_NOW.bat
```

### **Option 3: Manual Start**
```bash
# Terminal 1 - Backend Server
cd server
node server.js

# Terminal 2 - Frontend Server  
npm run dev
```

### **Option 4: Check Status**
```bash
check-status.bat
```

## 🌟 Features

### 🔐 **Real-Time Authentication**
- **OTP Email Verification**: Secure email-based authentication
- **Two-Step Registration**: Email verification during signup
- **JWT Token Management**: Secure session handling
- **Email Uniqueness**: Prevents duplicate accounts
- **Real-Time OTP**: No demo mode - actual email verification

### 🌤️ **Advanced Weather Analytics**
- **Real-Time Weather**: Live data from OpenWeather API
- **Geolocation Support**: Automatic location detection
- **Weather Forecast**: 24-hour trend analysis
- **Weather Map**: Interactive map with layer toggles
- **Current Location**: Accurate weather for your area
- **Image Proxy**: CORS-free external image loading

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all devices
- **Tablet Support**: Perfect for field use
- **Desktop Experience**: Full-featured dashboard
- **Modern UI**: shadcn/ui component library
- **Accessibility**: Screen reader friendly

### 📊 **Analytics Dashboard**
- **Real-Time Data**: Live weather and sensor data
- **Interactive Charts**: Weather trends and forecasts
- **Crop Analytics**: Health monitoring and insights
- **Soil Health**: Comprehensive soil analysis
- **Market Trends**: Agricultural market data
- **Reports & Insights**: Downloadable analytics

## 🎯 How to Use

### **Step 1: Start the Application**
```bash
start-everything.bat
```

### **Step 2: Access the Application**
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`

### **Step 3: Authentication**
1. **Sign Up**: Enter your details and verify with OTP
2. **Login**: Use your email and OTP from your inbox
3. **Dashboard**: Explore all features and analytics

## 🔧 Configuration

### **Email Setup (Required for OTP)**
To enable real email OTP verification:

1. **Run Email Setup**:
   ```bash
   setup-email.bat
   ```

2. **Update `server/.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   OPENWEATHER_API_KEY=2170cf9f72b3eee31fdac25765223afd
   JWT_SECRET=your-super-secret-jwt-key-for-agroanalytics-2024
   PORT=5000
   NODE_ENV=development
   ```

3. **Gmail Setup**:
   - Enable 2-Factor Authentication
   - Generate App Password (Security > 2-Step Verification > App passwords)
   - Use the app password (not your regular password)

4. **Restart Backend**:
   ```bash
   cd server
   node server.js
   ```

### **Environment Variables**
| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Your Gmail address | Required |
| `SMTP_PASS` | Gmail App Password | Required |
| `OPENWEATHER_API_KEY` | Weather API key | Included |
| `JWT_SECRET` | JWT signing secret | Included |
| `PORT` | Backend server port | `5000` |

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **Charts**: Recharts for data visualization

### **Backend (Node.js + Express)**
- **Runtime**: Node.js with Express
- **Database**: SQLite3 for data persistence
- **Authentication**: JWT tokens with OTP verification
- **Email Service**: Nodemailer with SMTP
- **Weather API**: OpenWeatherMap integration
- **WebSocket**: Real-time data updates

### **Database Schema**
- **Users**: User accounts and profiles
- **OTPs**: Login verification codes
- **Registration OTPs**: Signup verification codes
- **Weather Data**: Historical weather information

## 📁 Project Structure

```
Smart-Farming-Analytics/
├── 📁 server/                 # Backend application
│   ├── 📄 server.js           # Main server file
│   ├── 📄 database.js          # Database setup
│   ├── 📄 emailService.js      # Email functionality
│   ├── 📄 weatherService.js    # Weather API integration
│   ├── 📄 config.js           # Configuration
│   └── 📄 .env                # Environment variables
├── 📁 src/                    # Frontend application
│   ├── 📁 components/         # React components
│   │   ├── 📁 ui/             # UI component library
│   │   └── 📄 *.tsx           # Page components
│   ├── 📁 services/           # API services
│   ├── 📁 hooks/              # Custom React hooks
│   └── 📁 styles/             # CSS styles
├── 📄 start-everything.bat    # Main startup script
├── 📄 START_NOW.bat           # Alternative startup
├── 📄 check-status.bat        # Server status checker
├── 📄 setup-email.bat         # Email configuration helper
└── 📄 README.md               # This file
```

## 🎉 Success!

**Your Smart Farming Analytics application includes:**
- ✅ **Real-Time OTP Authentication**
- ✅ **Weather Analytics with Geolocation**
- ✅ **Interactive Weather Map**
- ✅ **Responsive Dashboard**
- ✅ **Crop & Soil Analytics**
- ✅ **Market Trends**
- ✅ **Reports & Insights**
- ✅ **Image Proxy System**
- ✅ **Sign Out Functionality**
- ✅ **Production-Ready Code**

**Access your application at: `http://localhost:3000`**

## 🚀 Deployment

### **Local Development**
```bash
# Start both servers
start-everything.bat

# Check status
check-status.bat
```

### **Production Deployment**
1. **Configure Environment**: Set up production `.env` variables
2. **Database**: Ensure SQLite database is accessible
3. **Email Service**: Configure production SMTP settings
4. **Build Frontend**: `npm run build`
5. **Start Backend**: `node server.js`

## 📧 Support & Troubleshooting

### **Common Issues**
1. **Port Already in Use**: Kill existing Node processes
2. **Email Not Sending**: Check SMTP credentials in `.env`
3. **Weather Data Missing**: Verify OpenWeather API key
4. **Database Errors**: Check SQLite file permissions

### **Debug Commands**
```bash
# Check server status
check-status.bat

# Restart servers
start-everything.bat

# Check logs in terminal output
```

### **Getting Help**
1. **Check Status**: Run `check-status.bat`
2. **Restart Servers**: Run `start-everything.bat`
3. **Check Logs**: Look at terminal output
4. **Verify Configuration**: Check `.env` file settings

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Your Smart Farming Analytics application is ready for production!** 🌾🚀

**GitHub Repository**: [https://github.com/LikithsaiKovi/Smart-Farming-Analytics.git](https://github.com/LikithsaiKovi/Smart-Farming-Analytics.git)