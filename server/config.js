// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

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

  // Email provider switch (smtp | emailjs)
  emailProvider: (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase(),
  emailjs: {
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    fromName: process.env.EMAILJS_FROM_NAME || 'AgroAnalytics'
  },

  // OpenWeather API
  openweather: {
    // Require a real key to avoid accidental default calls
    apiKey: process.env.OPENWEATHER_API_KEY || '',
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
  smtp: { ...config.smtp, auth: { user: config.smtp.auth.user, pass: '***' } },
  emailjs: { ...config.emailjs, publicKey: config.emailjs.publicKey ? '***' : undefined }
});

module.exports = config;
