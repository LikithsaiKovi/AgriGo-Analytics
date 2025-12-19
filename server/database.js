const mongoose = require('mongoose');

const initDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required to connect to MongoDB');
  }

  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected');
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    farmSize: { type: Number }
  },
  { timestamps: true }
);

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const registrationOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    farmSize: { type: Number, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const soilReadingSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true, index: true },
    sensorId: { type: String, required: true, index: true },
    crop: { type: String },
    location: { type: String },
    samplingFreq: { type: Number },
    readings: {
      moisturePct: { type: Number, required: true },
      tempC: { type: Number, required: true },
      humidityPct: { type: Number, required: true },
      ph: { type: Number, required: true },
      nitrogenPpm: { type: Number },
      phosphorusPpm: { type: Number },
      potassiumPpm: { type: Number },
      organicMatterPct: { type: Number },
      ecDs: { type: Number },
      texture: {
        sandPct: { type: Number },
        siltPct: { type: Number },
        clayPct: { type: Number }
      },
      timestamp: { type: Date, required: true }
    }
  },
  { timestamps: true }
);

const schemeSchema = new mongoose.Schema(
  {
    schemeId: { type: String, unique: true, index: true },
    schemeName: String,
    description: String,
    ministry: String,
    startDate: Date,
    eligibility: String,
    region: String,
    state: String,
    lastUpdated: Date
  },
  { timestamps: true }
);

const marketPriceSchema = new mongoose.Schema(
  {
    commodity: String,
    marketName: String,
    state: String,
    district: String,
    price: Number,
    unit: String,
    date: Date,
    lastUpdated: Date
  },
  { timestamps: true }
);

const weatherDataSchema = new mongoose.Schema(
  {
    location: { type: String, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    pressure: { type: Number, required: true },
    wind_speed: { type: Number, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Otp = mongoose.model('Otp', otpSchema);
const RegistrationOtp = mongoose.model('RegistrationOtp', registrationOtpSchema);
const Scheme = mongoose.model('Scheme', schemeSchema);
const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);
const SoilReading = mongoose.model('SoilReading', soilReadingSchema);
const WeatherData = mongoose.model('WeatherData', weatherDataSchema);

module.exports = {
  initDatabase,
  models: {
    User,
    Otp,
    RegistrationOtp,
    Scheme,
    MarketPrice,
    SoilReading,
    WeatherData
  }
};

