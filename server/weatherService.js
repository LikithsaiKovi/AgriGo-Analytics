const axios = require('axios');
const config = require('./config');
const { models } = require('./database');

class WeatherService {
  constructor() {
    this.apiKey = config.openweather.apiKey;
    this.baseUrl = config.openweather.baseUrl;
  }

  async getCurrentWeather(lat, lon) {
    if (!this.apiKey) {
      return { success: false, error: 'OpenWeather API key is missing. Set OPENWEATHER_API_KEY in server/config.env.' };
    }
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const weatherData = {
        location: `${response.data.name}, ${response.data.sys.country}`,
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        timestamp: new Date().toISOString()
      };

      // Store in database
      this.storeWeatherData(weatherData);

      return { success: true, data: weatherData };
    } catch (error) {
      console.error('Error fetching weather data:', error.message || error);
      const friendly = error.response?.status === 401
        ? 'OpenWeather rejected the API key (401). Update OPENWEATHER_API_KEY in server/config.env with a valid key.'
        : error.message;
      return { success: false, error: friendly };
    }
  }

  async getWeatherForecast(lat, lon) {
    if (!this.apiKey) {
      return { success: false, error: 'OpenWeather API key is missing. Set OPENWEATHER_API_KEY in server/config.env.' };
    }
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const forecast = response.data.list.slice(0, 8).map(item => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        windSpeed: item.wind.speed
      }));

      return {
        success: true,
        data: forecast
      };
    } catch (error) {
      console.error('Error fetching weather forecast:', error.message || error);
      const friendly = error.response?.status === 401
        ? 'OpenWeather rejected the API key (401). Update OPENWEATHER_API_KEY in server/config.env with a valid key.'
        : error.message;
      return { success: false, error: friendly };
    }
  }

  async geocode(query) {
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct`;
      const response = await axios.get(url, {
        params: {
          q: query,
          limit: 5,
          appid: this.apiKey
        }
      });

      const results = response.data.map((item) => ({
        name: item.name,
        country: item.country,
        state: item.state || '',
        lat: item.lat,
        lon: item.lon
      }));

      return { success: true, data: results };
    } catch (error) {
      console.error('Error during geocoding:', error);
      return { success: false, error: error.message };
    }
  }

  async storeWeatherData(weatherData) {
    try {
      await models.WeatherData.create({
        location: weatherData.location,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        pressure: weatherData.pressure,
        wind_speed: weatherData.windSpeed,
        description: weatherData.description,
        icon: weatherData.icon
      });
    } catch (error) {
      console.error('Error storing weather data:', error.message);
    }
  }

  async getHistoricalWeather(location, days = 7) {
    try {
      const weatherRecords = await models.WeatherData
        .find({ location })
        .sort({ createdAt: -1 })
        .limit(days)
        .lean();
      return weatherRecords;
    } catch (error) {
      console.error('Error fetching historical weather:', error.message);
      throw error;
    }
  }
}

module.exports = WeatherService;
