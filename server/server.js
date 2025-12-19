const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const config = require('./config');
const { initDatabase, models } = require('./database');
const { User, Otp, RegistrationOtp, SoilReading } = models;
const EmailService = require('./emailService');
const WeatherService = require('./weatherService');

const app = express();
const server = createServer(app);
const allowedOrigins = config.clientOrigin
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
};

const io = new Server(server, { cors: corsOptions });

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize services
const emailService = new EmailService();
const weatherService = new WeatherService();

// DB initialized at bottom before listen
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      used: false
    });

    console.log('Login OTP generated for:', normalizedEmail, 'OTP:', otp);

    // Send OTP via email
    const emailResult = await emailService.sendOTP(normalizedEmail, otp);

    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: 'OTP sent successfully to your email',
        data: { expiresIn: 600 } // 10 minutes in seconds
      });
    } else {
      console.error('Email sending failed:', emailResult.error);
        res.status(500).json({ 
          error: 'Failed to send OTP email. Please check your email configuration.' 
        });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP and login
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    if (!normalizedEmail || !normalizedOtp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    console.log('Verifying login OTP for:', normalizedEmail, 'with OTP:', normalizedOtp);

    // Check OTP validity with strict validation
    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      otp: normalizedOtp,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    console.log('Found login OTP doc:', otpDoc);

    if (!otpDoc) {
      console.log('No valid OTP found for email:', normalizedEmail);
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
    }

    const updateResult = await Otp.updateOne(
      { _id: otpDoc._id, used: false },
      { $set: { used: true } }
    );
    if (updateResult.modifiedCount === 0) {
      console.log('OTP already used for email:', normalizedEmail);
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'User not found. Please register first.' });
    }

    const token = jwt.sign(
      { email: normalizedEmail, userId: user._id.toString() },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          farmSize: user.farmSize
        }
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new user - Step 1: Send OTP for verification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, farmSize } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!name || !normalizedEmail || farmSize === undefined) {
      return res.status(400).json({ error: 'Name, email, and farm size are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please use a different email or try logging in.' });
    }

    // Generate 6-digit OTP for registration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await RegistrationOtp.create({
      email: normalizedEmail,
      name,
      farmSize,
      otp,
      expiresAt,
      used: false
    });
    console.log('Registration OTP stored for:', normalizedEmail, 'OTP:', otp);

    const emailResult = await emailService.sendRegistrationOTP(normalizedEmail, name, otp);

    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: 'OTP sent to your email for account verification',
        data: { expiresIn: 600 } // 10 minutes in seconds
      });
    } else {
      console.error('Email sending failed:', emailResult.error);
      res.status(500).json({ 
        error: 'Failed to send registration OTP email. Please check your email configuration.' 
      });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify registration OTP and create account
app.post('/api/auth/verify-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    if (!normalizedEmail || !normalizedOtp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    console.log('Verifying registration OTP for:', normalizedEmail, 'with OTP:', normalizedOtp);

    const regOtp = await RegistrationOtp.findOne({
      email: normalizedEmail,
      otp: normalizedOtp,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    console.log('Found registration OTP doc:', regOtp);

    if (!regOtp) {
      console.log('No valid OTP found for email:', normalizedEmail);
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
    }

    await RegistrationOtp.updateOne(
      { _id: regOtp._id },
      { $set: { used: true } }
    );

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = await User.create({
      email: normalizedEmail,
      name: regOtp.name,
      farmSize: regOtp.farmSize
    });

    emailService.sendWelcomeEmail(normalizedEmail, regOtp.name).catch(emailError => {
      console.log('Welcome email not sent:', emailError.message);
    });

    const token = jwt.sign(
      { email: normalizedEmail, userId: newUser._id.toString() },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    console.log('User created successfully:', normalizedEmail);
    res.json({
      success: true,
      message: 'Account created successfully!',
      data: {
        token,
        user: {
          email: normalizedEmail,
          name: regOtp.name,
          farmSize: regOtp.farmSize
        }
      }
    });
  } catch (error) {
    console.error('Error verifying registration OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Soil health endpoints
const parsePeriodToDate = (period = '7d') => {
  const match = String(period).match(/^(\d+)([dh])$/i);
  if (!match) return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const ms = unit === 'h' ? amount * 60 * 60 * 1000 : amount * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms);
};

const allowedMetrics = new Set([
  'moisturePct',
  'tempC',
  'humidityPct',
  'ph',
  'nitrogenPpm',
  'phosphorusPpm',
  'potassiumPpm',
  'organicMatterPct',
  'ecDs'
]);

const buildInsights = (reading) => {
  const insights = [];
  const r = reading.readings || {};

  const add = (metric, severity, message) => insights.push({ metric, severity, message });

  if (r.moisturePct !== undefined) {
    if (r.moisturePct < 20) add('moisturePct', 'high', 'Soil is dry; schedule irrigation soon.');
    else if (r.moisturePct > 45) add('moisturePct', 'medium', 'Soil moisture is high; watch for waterlogging.');
    else add('moisturePct', 'low', 'Moisture is in the optimal band.');
  }

  if (r.ph !== undefined) {
    if (r.ph < 6) add('ph', 'medium', 'Soil is acidic; consider liming to raise pH.');
    else if (r.ph > 7.5) add('ph', 'medium', 'Soil is alkaline; apply sulfur/organic matter to lower pH.');
    else add('ph', 'low', 'pH is suitable for most field crops.');
  }

  if (r.nitrogenPpm !== undefined) {
    if (r.nitrogenPpm < 15) add('nitrogenPpm', 'medium', 'Nitrogen is low; plan a nitrogen top-dress.');
    else add('nitrogenPpm', 'low', 'Nitrogen is within a healthy range.');
  }

  if (r.phosphorusPpm !== undefined) {
    if (r.phosphorusPpm < 10) add('phosphorusPpm', 'medium', 'Phosphorus is low; consider P fertilizer placement.');
    else add('phosphorusPpm', 'low', 'Phosphorus looks adequate.');
  }

  if (r.potassiumPpm !== undefined) {
    if (r.potassiumPpm < 80) add('potassiumPpm', 'medium', 'Potassium is low; add K to strengthen stress tolerance.');
    else add('potassiumPpm', 'low', 'Potassium is adequate.');
  }

  if (r.organicMatterPct !== undefined) {
    if (r.organicMatterPct < 2) add('organicMatterPct', 'medium', 'Low organic matter; add compost or cover crops.');
    else add('organicMatterPct', 'low', 'Organic matter level is healthy.');
  }

  if (r.ecDs !== undefined) {
    if (r.ecDs > 2) add('ecDs', 'high', 'High salinity risk; flush salts and review irrigation water.');
    else add('ecDs', 'low', 'Salinity is acceptable.');
  }

  return insights;
};

app.post('/api/soil/readings', async (req, res) => {
  try {
    const { fieldId, sensorId, crop, location, samplingFreq, readings } = req.body;

    const normalizedFieldId = String(fieldId || 'default-field').trim();
    const normalizedSensorId = String(sensorId || 'manual-entry').trim();

    if (!readings) {
      return res.status(400).json({ error: 'readings are required' });
    }

    const requiredReadings = ['moisturePct', 'tempC', 'humidityPct', 'ph'];
    const missing = requiredReadings.filter(key => readings[key] === undefined || readings[key] === null);
    if (missing.length) {
      return res.status(400).json({ error: `Missing readings: ${missing.join(', ')}` });
    }

    const numericReadings = { ...readings };
    Object.keys(numericReadings).forEach((key) => {
      if (key === 'texture') return;
      if (numericReadings[key] !== undefined && numericReadings[key] !== null) {
        numericReadings[key] = Number(numericReadings[key]);
      }
    });

    if (!numericReadings.timestamp) {
      numericReadings.timestamp = new Date();
    } else {
      numericReadings.timestamp = new Date(numericReadings.timestamp);
    }

    const soilReading = await SoilReading.create({
      fieldId: normalizedFieldId,
      sensorId: normalizedSensorId,
      crop,
      location,
      samplingFreq,
      readings: numericReadings
    });

    res.json({ success: true, data: { id: soilReading._id } });
  } catch (error) {
    console.error('Error saving soil reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/soil/latest', async (req, res) => {
  try {
    const { fieldId } = req.query;
    const targetField = String(fieldId || 'default-field').trim();

    const latest = await SoilReading.findOne({ fieldId: targetField })
      .sort({ 'readings.timestamp': -1, createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ error: 'No readings found for this field' });
    }

    res.json({ success: true, data: latest });
  } catch (error) {
    console.error('Error fetching latest soil reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/soil/trends', async (req, res) => {
  try {
    const { fieldId, metric = 'moisturePct', period = '7d' } = req.query;
    const targetField = String(fieldId || 'default-field').trim();
    if (!allowedMetrics.has(metric)) return res.status(400).json({ error: 'Invalid metric' });

    const since = parsePeriodToDate(period);
    const readings = await SoilReading.find({
      fieldId: targetField,
      'readings.timestamp': { $gte: since }
    })
      .sort({ 'readings.timestamp': 1 })
      .lean();

    const series = readings
      .map((doc) => ({
        timestamp: doc.readings?.timestamp,
        value: doc.readings ? doc.readings[metric] : undefined
      }))
      .filter(point => point.timestamp !== undefined && point.value !== undefined);

    res.json({ success: true, data: series });
  } catch (error) {
    console.error('Error fetching soil trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/soil/insights', async (req, res) => {
  try {
    const { fieldId } = req.query;
    const targetField = String(fieldId || 'default-field').trim();

    const latest = await SoilReading.findOne({ fieldId: targetField })
      .sort({ 'readings.timestamp': -1, createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ error: 'No readings found for this field' });
    }

    const insights = buildInsights(latest);
    res.json({ success: true, data: { insights, latest } });
  } catch (error) {
    console.error('Error building soil insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Weather endpoints
app.get('/api/weather/current', authenticateToken, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await weatherService.getCurrentWeather(lat, lon);
    res.json(result);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/weather/forecast', authenticateToken, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await weatherService.getWeatherForecast(lat, lon);
    res.json(result);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Geocoding endpoint
app.get('/api/weather/geocode', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query is required' });
    const result = await weatherService.geocode(q.toString());
    res.json(result);
  } catch (error) {
    console.error('Error during geocoding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple image proxy to avoid external image loading issues (CORS/Referrer)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).send('Invalid URL');
    }
    const response = await axios.get(url.toString(), { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(502).send('Failed to fetch image');
  }
});

// OpenWeather tile proxy (keeps API key on server)
app.get('/api/weather/tile/:layer/:z/:x/:y', async (req, res) => {
  try {
    const { layer, z, x, y } = req.params;
    const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${config.openweather.apiKey}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (error) {
    console.error('Tile proxy error:', error.message);
    res.status(502).send('Failed to fetch tile');
  }
});

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('subscribe-weather', (data) => {
    const { lat, lon } = data;
    console.log(`User ${socket.id} subscribed to weather updates for ${lat}, ${lon}`);
    
    // Send initial weather data
    weatherService.getCurrentWeather(lat, lon).then(result => {
      if (result.success) {
        socket.emit('weather-update', result.data);
      }
    });

    // Set up periodic weather updates (every 5 minutes)
    const weatherInterval = setInterval(async () => {
      const result = await weatherService.getCurrentWeather(lat, lon);
      if (result.success) {
        socket.emit('weather-update', result.data);
      }
    }, 5 * 60 * 1000);

    socket.on('disconnect', () => {
      clearInterval(weatherInterval);
      console.log('User disconnected:', socket.id);
    });
  });
});

// Government Schemes endpoints
const { spawn } = require('child_process');
const path = require('path');

// Get all government schemes with optional filtering
app.get('/api/schemes', authenticateToken, async (req, res) => {
  try {
    const { region, ministry, state } = req.query;
    
    // Use Python script to fetch schemes from database
    const pythonScript = path.join(__dirname, 'gov_schemes_fetcher.py');
    const args = ['get_schemes', '--region', region || '', '--ministry', ministry || '', '--state', state || ''];
    
    const pythonProcess = spawn('python', [pythonScript, ...args]);
    let data = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const schemes = JSON.parse(data);
          res.json({
            success: true,
            data: schemes,
            total: schemes.length
          });
        } catch (parseError) {
          console.error('Error parsing schemes data:', parseError);
          res.status(500).json({ error: 'Failed to parse schemes data' });
        }
      } else {
        console.error('Python script error:', error);
        res.status(500).json({ error: 'Failed to fetch schemes data' });
      }
    });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scheme by ID
app.get('/api/schemes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const pythonScript = path.join(__dirname, 'gov_schemes_fetcher.py');
    const args = ['get_scheme', '--id', id];
    
    const pythonProcess = spawn('python', [pythonScript, ...args]);
    let data = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const scheme = JSON.parse(data);
          res.json({
            success: true,
            data: scheme
          });
        } catch (parseError) {
          console.error('Error parsing scheme data:', parseError);
          res.status(500).json({ error: 'Failed to parse scheme data' });
        }
      } else {
        console.error('Python script error:', error);
        res.status(500).json({ error: 'Failed to fetch scheme data' });
      }
    });
  } catch (error) {
    console.error('Error fetching scheme:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scheme statistics
app.get('/api/schemes/stats', authenticateToken, async (req, res) => {
  try {
    const pythonScript = path.join(__dirname, 'gov_schemes_fetcher.py');
    const args = ['get_stats'];
    
    const pythonProcess = spawn('python', [pythonScript, ...args]);
    let data = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const stats = JSON.parse(data);
          res.json({
            success: true,
            data: stats
          });
        } catch (parseError) {
          console.error('Error parsing stats data:', parseError);
          res.status(500).json({ error: 'Failed to parse stats data' });
        }
      } else {
        console.error('Python script error:', error);
        res.status(500).json({ error: 'Failed to fetch stats data' });
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available states for filtering
app.get('/api/schemes/states', authenticateToken, async (req, res) => {
  try {
    const pythonScript = path.join(__dirname, 'gov_schemes_fetcher.py');
    const args = ['get_states'];
    
    const pythonProcess = spawn('python', [pythonScript, ...args]);
    let data = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const states = JSON.parse(data);
          res.json({
            success: true,
            data: states
          });
        } catch (parseError) {
          console.error('Error parsing states data:', parseError);
          res.status(500).json({ error: 'Failed to parse states data' });
        }
      } else {
        console.error('Python script error:', error);
        res.status(500).json({ error: 'Failed to fetch states data' });
      }
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger manual schemes fetch (admin only)
app.post('/api/schemes/fetch', authenticateToken, async (req, res) => {
  try {
    const pythonScript = path.join(__dirname, 'gov_schemes_fetcher.py');
    const args = ['fetch_schemes'];
    
    const pythonProcess = spawn('python', [pythonScript, ...args]);
    let data = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(data);
          res.json({
            success: true,
            message: 'Schemes fetch completed',
            data: result
          });
        } catch (parseError) {
          console.error('Error parsing fetch result:', parseError);
          res.status(500).json({ error: 'Failed to parse fetch result' });
        }
      } else {
        console.error('Python script error:', error);
        res.status(500).json({ error: 'Failed to fetch schemes' });
      }
    });
  } catch (error) {
    console.error('Error triggering schemes fetch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server after DB connection
const PORT = config.port;
initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
