const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { createServer } = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const config = require('./config');
const { db, initDatabase } = require('./database');
const EmailService = require('./emailService');
const WeatherService = require('./weatherService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const emailService = new EmailService();
const weatherService = new WeatherService();

// Initialize database
initDatabase().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

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
    const stmt = db.prepare(`
      INSERT INTO otps (email, otp, expires_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(normalizedEmail, otp, expiresAt.toISOString());
    stmt.finalize();

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
    db.get(`
      SELECT * FROM otps 
      WHERE email = ? AND otp = ? AND julianday(expires_at) > julianday('now') AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `, [normalizedEmail, normalizedOtp], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log('Found login OTP row:', row);

      if (!row) {
        console.log('No valid OTP found for email:', normalizedEmail);
        return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
      }

      // Atomically mark OTP as used (guard against duplicate submissions)
      db.run('UPDATE otps SET used = 1 WHERE id = ? AND used = 0', [row.id], function(err) {
        if (err) {
          console.error('Error marking OTP as used:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          console.log('OTP already used for email:', normalizedEmail);
          return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
        }

        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], async (err, user) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (!user) {
            return res.status(400).json({ error: 'User not found. Please register first.' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { email: normalizedEmail, userId: user.id },
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
                farmSize: user.farm_size
              }
            }
          });
        });
      });
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

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please use a different email or try logging in.' });
      }

      // Generate 6-digit OTP for registration
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store registration data and OTP in database
      const stmt = db.prepare(`
        INSERT INTO registration_otps (email, name, farm_size, otp, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(normalizedEmail, name, farmSize, otp, expiresAt.toISOString(), async (err) => {
        if (err) {
          console.error('Error storing registration OTP:', err);
          return res.status(500).json({ error: 'Failed to store registration data' });
        }
        stmt.finalize();
        console.log('Registration OTP stored for:', normalizedEmail, 'OTP:', otp);

        // Send OTP via email
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
      });
    });
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

    // Find valid registration OTP
    db.get(`
      SELECT * FROM registration_otps 
      WHERE email = ? AND otp = ? AND julianday(expires_at) > julianday('now') AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `, [normalizedEmail, normalizedOtp], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log('Found registration OTP row:', row);

      if (!row) {
        console.log('No valid OTP found for email:', normalizedEmail);
        return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
      }

      // Mark OTP as used
      db.run('UPDATE registration_otps SET used = 1 WHERE id = ?', [row.id], (err) => {
        if (err) {
          console.error('Error marking OTP as used:', err);
        }
      });

      // Check if user already exists (double check)
      db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], async (err, existingUser) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingUser) {
          console.log('User already exists:', existingUser);
          return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        // Create new user
        const stmt = db.prepare(`
          INSERT INTO users (email, name, farm_size)
          VALUES (?, ?, ?)
        `);
        stmt.run(normalizedEmail, row.name, row.farm_size, function(err) {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Failed to create user account' });
          }
          
          const newUserId = this.lastID; // Get the ID of the newly created user
          stmt.finalize();

          // Send welcome email
          emailService.sendWelcomeEmail(normalizedEmail, row.name).catch(emailError => {
            console.log('Welcome email not sent:', emailError.message);
          });

          // Generate JWT token for immediate login using the new user ID
          const token = jwt.sign(
            { email: normalizedEmail, userId: newUserId },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
          );

          console.log('User created successfully:', email);
          res.json({
            success: true,
            message: 'Account created successfully!',
            data: {
              token,
              user: {
                email: normalizedEmail,
                name: row.name,
                farmSize: row.farm_size
              }
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Error verifying registration OTP:', error);
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

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
