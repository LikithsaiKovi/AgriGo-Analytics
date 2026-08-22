import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Eye, MapPin, RefreshCw, AlertCircle, Search } from 'lucide-react';
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

async function fetchOpenMeteoWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const current = json.current;
    
    let locName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      if (geoRes.ok) {
        const geoJson = await geoRes.json();
        if (geoJson && geoJson.address) {
          const a = geoJson.address;
          locName = `${a.city || a.town || a.village || a.county || a.state || 'Local Region'}, ${a.country || ''}`;
        }
      }
    } catch (e) {
      // fallback to lat, lon
    }

    const codeDesc: { [key: number]: { desc: string; icon: string } } = {
      0: { desc: 'Clear sky', icon: '01d' },
      1: { desc: 'Mainly clear', icon: '02d' },
      2: { desc: 'Partly cloudy', icon: '02d' },
      3: { desc: 'Overcast', icon: '04d' },
      45: { desc: 'Foggy', icon: '50d' },
      48: { desc: 'Depositing rime fog', icon: '50d' },
      51: { desc: 'Light drizzle', icon: '09d' },
      61: { desc: 'Slight rain', icon: '10d' },
      63: { desc: 'Moderate rain', icon: '10d' },
      65: { desc: 'Heavy rain', icon: '10d' },
      80: { desc: 'Slight rain showers', icon: '09d' },
      95: { desc: 'Thunderstorm', icon: '11d' }
    };

    const info = codeDesc[current.weather_code] || { desc: 'Cloudy', icon: '03d' };

    return {
      location: locName,
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      pressure: Math.round(current.surface_pressure),
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      description: info.desc,
      icon: info.icon,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return null;
  }
}

export function RealTimeWeather({ lat, lon }: RealTimeWeatherProps) {
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, weatherData: wsWeatherData, subscribeToWeather } = useWebSocket();
  const [currentLat, setCurrentLat] = useState<number | null>(lat ?? null);
  const [currentLon, setCurrentLon] = useState<number | null>(lon ?? null);
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initialize with browser geolocation if coordinates not explicitly passed
  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      setCurrentLat(lat);
      setCurrentLon(lon);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLon(pos.coords.longitude);
        },
        () => {
          // Default to Hyderabad if geolocation denied/unavailable
          setCurrentLat(17.3850);
          setCurrentLon(78.4867);
        }
      );
    } else {
      setCurrentLat(17.3850);
      setCurrentLon(78.4867);
    }
  }, [lat, lon]);

  // Fetch weather data when coords change
  useEffect(() => {
    if (currentLat === null || currentLon === null) return;

    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try backend API first
        const response = await apiService.getCurrentWeather(currentLat, currentLon);
        if (response.success && response.data) {
          setWeatherData(response.data);
          return;
        }

        // Live Open-Meteo keyless fallback for 100% real weather anywhere in the world
        const liveFallback = await fetchOpenMeteoWeather(currentLat, currentLon);
        if (liveFallback) {
          setWeatherData(liveFallback);
        } else {
          setError('Failed to fetch weather data');
        }
      } catch (err) {
        const liveFallback = await fetchOpenMeteoWeather(currentLat, currentLon);
        if (liveFallback) {
          setWeatherData(liveFallback);
        } else {
          setError('Failed to load real-time weather');
        }
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
      
      // Use geocoding to get coordinates for the search location
      const response = await apiService.getGeocodingData(searchLocation);
      
      if (response.success && response.data) {
        const { lat, lon } = response.data;
        setCurrentLat(lat);
        setCurrentLon(lon);
        setSearchLocation('');
      } else {
        // Direct Nominatim geocoding fallback
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchLocation)}&format=json&limit=1`);
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          if (geoJson && geoJson.length > 0) {
            setCurrentLat(parseFloat(geoJson[0].lat));
            setCurrentLon(parseFloat(geoJson[0].lon));
            setSearchLocation('');
            return;
          }
        }
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
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLat(position.coords.latitude);
          setCurrentLon(position.coords.longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to get current location');
          setIsLoading(false);
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
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search city (e.g. Hyderabad, London, New York)..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLocationWeather()}
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
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={getCurrentLocation}
            variant="outline"
            size="sm"
            title="Use My Location"
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
          </Button>
        </div>
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
