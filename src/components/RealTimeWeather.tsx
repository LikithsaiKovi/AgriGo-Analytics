import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Eye, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiService } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  timestamp: string;
}

interface RealTimeWeatherProps {
  lat?: number;
  lon?: number;
}

export function RealTimeWeather({ lat = 40.7128, lon = -74.0060 }: RealTimeWeatherProps) {
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, weatherData: wsWeatherData, subscribeToWeather } = useWebSocket();
  const [currentLat, setCurrentLat] = useState<number>(lat);
  const [currentLon, setCurrentLon] = useState<number>(lon);
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initialize with geolocation if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLon(pos.coords.longitude);
        },
        () => {
          // keep defaults on failure
        }
      );
    }
  }, []);

  // Keep state in sync with props changes
  useEffect(() => {
    setCurrentLat(lat);
    setCurrentLon(lon);
  }, [lat, lon]);

  // Fetch weather data when coords change
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getCurrentWeather(currentLat, currentLon);
        if (response.success && response.data) {
          setWeatherData(response.data);
        } else {
          setError(response.error || 'Failed to fetch weather data');
        }
      } catch (err) {
        // If backend is not available, show mock data
        console.log('Backend not available, showing mock data');
        setWeatherData({
          location: 'New York, NY',
          temperature: 22,
          humidity: 65,
          pressure: 1013,
          windSpeed: 12,
          description: 'Partly cloudy',
          icon: '02d',
          timestamp: new Date().toISOString()
        });
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [currentLat, currentLon]);

  const searchLocationWeather = async () => {
    if (!searchLocation.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      // Use geocoding to get coordinates for the location
      const response = await apiService.getGeocodingData(searchLocation);
      
      if (response.success && response.data) {
        const { lat, lon, name } = response.data;
        setCurrentLat(lat);
        setCurrentLon(lon);
        setSearchLocation('');
        
        // Fetch weather for the new location
        const weatherResponse = await apiService.getCurrentWeather(lat, lon);
        if (weatherResponse.success && weatherResponse.data) {
          setWeatherData(weatherResponse.data);
        }
      } else {
        setError('Location not found');
      }
    } catch (err) {
      setError('Error searching location');
      console.error('Location search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLat(position.coords.latitude);
          setCurrentLon(position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get current location');
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getCurrentWeather(currentLat, currentLon);
      if (response.success && response.data) {
        setWeatherData(response.data);
      } else {
        setError(response.error || 'Failed to fetch weather data');
      }
    } catch (e) {
      setError('Network error. Please check if backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (isConnected) {
      subscribeToWeather(currentLat, currentLon);
    }
  }, [isConnected, currentLat, currentLon, subscribeToWeather]);

  // Update weather data when WebSocket data arrives
  useEffect(() => {
    if (wsWeatherData) {
      setWeatherData(wsWeatherData);
    }
  }, [wsWeatherData]);

  const getWeatherIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[icon] || '🌤️';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Real-Time Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Real-Time Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load weather data</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Real-Time Weather
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Live" : "Offline"}
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Search */}
        {/* <div className="flex gap-2 mb-4">
          <Input
            placeholder={t('weather.search.location')}
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocationWeather()}
            className="flex-1"
          />
          <Button
            onClick={searchLocationWeather}
            disabled={isSearching || !searchLocation.trim()}
            size="sm"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={getCurrentLocation}
            variant="outline"
            size="sm"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div> */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{weatherData.location}</h3>
            <p className="text-muted-foreground capitalize">{weatherData.description}</p>
          </div>
          <div className="text-4xl">{getWeatherIcon(weatherData.icon)}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Thermometer className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-lg font-semibold">{Math.round(weatherData.temperature)}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-lg font-semibold">{weatherData.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Wind className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="text-lg font-semibold">{weatherData.windSpeed} m/s</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Eye className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pressure</p>
              <p className="text-lg font-semibold">{weatherData.pressure} hPa</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(weatherData.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
