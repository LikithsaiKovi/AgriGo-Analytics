# 🚀 Setup Instructions - Manual

## Prerequisites
- Node.js v14 or higher
- npm (comes with Node.js)
- **MongoDB Connection String** (Required)
  - Free: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - Local: `mongodb://localhost:27017/agrianalytics`

## Step-by-Step Setup

### Step 1: Install Frontend Dependencies
```bash
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### Step 3: Configure MongoDB Connection
Edit `server/config.env` and add your MongoDB URI:

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agrianalytics?retryWrites=true&w=majority
```

**For Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/agrianalytics
```

### Step 4: Configure Email (Optional - for OTP)
Edit `server/config.env` to add email credentials:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 5: Configure Other Settings (Optional)
```env
PORT=5000
NODE_ENV=development
OPENWEATHER_API_KEY=2170cf9f72b3eee31fdac25765223afd
JWT_SECRET=your-super-secret-jwt-key
CLIENT_ORIGIN=http://localhost:3000
```

### Step 6: Start Backend Server
Open **Terminal 1** and run:
```bash
cd server
node server.js
```

**You should see:**
```
Config loaded: {...}
MongoDB connected
Database initialized successfully
Server running on port 5000
```

### Step 7: Start Frontend Server
Open **Terminal 2** (from project root) and run:
```bash
npm run dev
```

**You should see:**
```
VITE v... ready in ... ms
➜  Local:   http://localhost:3000/
```

### Step 8: Open Application
Open your browser and go to: `http://localhost:3000`

## Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** MongoDB (configured in MONGO_URI)

## Database Information
- **Type:** MongoDB
- **ODM:** Mongoose
- **Collections:**
  - Users (user accounts and profiles)
  - OTPs (login verification codes)
  - Registration OTPs (signup verification codes)
  - Schemes (government schemes)
  - Weather Data (historical weather information)

## Stop the Servers
Press `Ctrl + C` in each terminal to stop the servers

## Troubleshooting

**Error: MONGO_URI is required**
```
❌ MONGO_URI is not set in server/config.env
✅ Add your MongoDB connection string to server/config.env
```

**Error: Cannot connect to MongoDB**
- Verify MONGO_URI is correct
- Check internet connection (for MongoDB Atlas)
- Ensure MongoDB server is running (for local MongoDB)

**Error: Cannot find module 'mongoose'**
```bash
cd server
npm install mongoose
```

**Port 5000 already in use?**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Port 3000 already in use?**
Change the port:
```bash
npm run dev -- --port 3001
```

**Dependencies not installing?**
```bash
npm cache clean --force
rm -r node_modules
npm install
cd server
npm install
```

## MongoDB Atlas Setup (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project
4. Create a cluster (free tier)
5. Create a database user with a password
6. Add your IP to network access (0.0.0.0/0 for development)
7. Copy the connection string
8. Replace `<password>` and `<username>` in the string
9. Paste into `server/config.env` as `MONGO_URI`

## 🔧 Features Implemented

### ✅ Authentication System
- **OTP-based Login**: Secure email-based authentication
- **User Registration**: New user signup with farm details
- **JWT Tokens**: Secure session management
- **Email Integration**: SMTP email service for OTP delivery

### ✅ Real-time Features
- **WebSocket Connection**: Real-time weather updates
- **Live Weather Data**: OpenWeather API integration
- **Auto-refresh**: Weather data updates every 5 minutes
- **Connection Status**: Live/Offline indicators

### ✅ Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Flexible Layouts**: Adaptive grid systems
- **Touch-friendly**: Mobile-optimized interactions
- **Progressive Enhancement**: Works on all devices

### ✅ Weather Integration
- **Current Weather**: Real-time temperature, humidity, pressure
- **Weather Forecast**: 8-hour weather predictions
- **Location-based**: GPS coordinates support
- **Visual Indicators**: Weather icons and status badges

## 📱 How to Use

### 1. Login Process
1. Open `http://localhost:3000`
2. Enter your email address
3. Click "Send OTP to my email"
4. Check your email for the 6-digit OTP
5. Enter the OTP and click "Get Started"

### 2. Registration Process
1. Switch to "Sign Up" tab
2. Fill in your details (Name, Email, Farm Size)
3. Click "Create Account"
4. You'll receive an OTP via email
5. Enter the OTP to complete registration

### 3. Dashboard Features
- **Real-time Weather**: Live weather updates
- **Weather Trends**: 24-hour temperature and humidity charts
- **Crop Analytics**: Health and yield tracking
- **AI Predictions**: Yield forecasting
- **Soil Sensors**: Real-time soil monitoring
- **Alerts**: Smart notifications and recommendations

## 🔧 Technical Details

### Backend API Endpoints
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/register` - Register new user
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast
- `GET /api/health` - Health check

### WebSocket Events
- `subscribe-weather` - Subscribe to weather updates
- `weather-update` - Receive real-time weather data

### Database
- SQLite database with tables for users, OTPs, weather data, and crop analytics
- Automatic database initialization on first run

## 🎨 UI/UX Features

### Design System
- **Modern UI**: Clean, professional interface
- **Consistent Branding**: AgroAnalytics theme
- **Accessibility**: WCAG compliant components
- **Dark/Light Mode**: Theme support ready

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚨 Troubleshooting

### Backend Issues
1. Check if port 5000 is available
2. Ensure all dependencies are installed
3. Verify environment variables
4. Check server logs for errors

### Frontend Issues
1. Ensure backend is running on port 5000
2. Check browser console for errors
3. Verify API endpoints are accessible
4. Clear browser cache if needed

### Email Issues
1. Update SMTP settings in server configuration
2. Use Gmail App Password for Gmail SMTP
3. Check email spam folder for OTPs
4. Verify email service is working

## 📞 Support

For technical support or questions:
- Check the console logs for error messages
- Verify all services are running
- Ensure proper network connectivity
- Check API endpoint accessibility

## 🎯 Next Steps

The application is now fully functional with:
- ✅ Real-time weather data
- ✅ OTP authentication
- ✅ Responsive design
- ✅ WebSocket integration
- ✅ Database management
- ✅ Email notifications

You can now access the application at `http://localhost:3000` and start using the Smart Farming Analytics platform!
