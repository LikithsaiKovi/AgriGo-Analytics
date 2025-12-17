// Load environment variables
require('dotenv').config();

const config = {
  // Email Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  // OpenWeather API
  openweather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '2170cf9f72b3eee31fdac25765223afd',
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  },
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '24h'
  },

  // Client origin for CORS/WebSocket
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
};

console.log('Config loaded:', {
  ...config,
  smtp: { ...config.smtp, auth: { user: config.smtp.auth.user, pass: '***' } }
});

module.exports = config;
