import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  MapPin, 
  Search, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Navigation,
  CheckCircle,
  XCircle,
  Loader2,
  Layers,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  Info,
  AlertCircle,
  Sprout,
  Map,
  Satellite
} from "lucide-react";
import { apiService } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

// OpenWeatherMap API Key
const OPENWEATHER_API_KEY = "2170cf9f72b3eee31fdac25765223afd";

// Weather layer types
interface WeatherLayer {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  url: string;
  opacity: number;
  visible: boolean;
}

export function WeatherMapPage() {
  const { t } = useLanguage();
  
  // Map state
  const [lat, setLat] = useState(17.3850); // Hyderabad coordinates
  const [lon, setLon] = useState(78.4867);
  const [zoom, setZoom] = useState(10);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [weatherPrediction, setWeatherPrediction] = useState<any>(null);
  const [agriculturalAdvice, setAgriculturalAdvice] = useState<any>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');
  const [isSwitchingMap, setIsSwitchingMap] = useState(false);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{name:string;country:string;state?:string;lat:number;lon:number}>>([]);
  
  // Weather layers state
  const [weatherLayers, setWeatherLayers] = useState<WeatherLayer[]>([
    {
      id: 'clouds',
      name: 'Cloud Coverage',
      icon: Cloud,
      url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.9,
      visible: false
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: Thermometer,
      url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.7,
      visible: false
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      icon: CloudRain,
      url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.8,
      visible: false
    },
    {
      id: 'wind',
      name: 'Wind Speed',
      icon: Wind,
      url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.6,
      visible: false
    }
  ]);
  
  // Map container ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRefs = useRef<{ [key: string]: any }>({});
  
  // Auto-refresh weather data every 2 minutes for real-time movement
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWeatherLayers();
    }, 2 * 60 * 1000); // 2 minutes for real-time movement
    
    return () => clearInterval(interval);
  }, []);
  
  
  
  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, []);

  // Switch map layers when map type changes
  useEffect(() => {
    if (mapRef.current) {
      setIsSwitchingMap(true);
      
      // Use requestAnimationFrame for smoother switching
      requestAnimationFrame(() => {
        // Remove existing base layer more efficiently
        const layersToRemove: any[] = [];
        mapRef.current.eachLayer((layer: any) => {
          if (layer._url && (layer._url.includes('openstreetmap') || layer._url.includes('arcgisonline'))) {
            layersToRemove.push(layer);
          }
        });
        
        layersToRemove.forEach(layer => {
          mapRef.current.removeLayer(layer);
        });

        // Add new base layer based on map type
        import('leaflet').then((L) => {
          let newBaseLayer;
          if (mapType === 'satellite') {
            newBaseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
              maxZoom: 19,
              keepBuffer: 2 // Keep some tiles in buffer for smoother switching
            });
          } else {
            newBaseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
              keepBuffer: 2
            });
          }
          
          newBaseLayer.addTo(mapRef.current);
        });
        
        // Reset switching state quickly
        setTimeout(() => {
          setIsSwitchingMap(false);
        }, 200);
      });
    }
  }, [mapType]);
  
  // Initialize Leaflet map
  const initializeMap = useCallback(() => {
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icons for Leaflet
      if (typeof window !== 'undefined' && (L as any).Icon && (L as any).Icon.Default) {
        delete ((L as any).Icon.Default.prototype as any)._getIconUrl;
        (L as any).Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      }
      
      // Create map instance
      const map = L.map(mapContainerRef.current!, {
        center: [lat, lon],
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });
      
      // Add base map layer based on selected map type
      let baseLayer;
      if (mapType === 'satellite') {
        baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
          maxZoom: 19
        });
      } else {
        // Roadmap
        baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        });
      }
      
      baseLayer.addTo(map);
      
      // Store map reference
      mapRef.current = map;
      setIsMapReady(true);
      
      // Fetch initial weather predictions
      setTimeout(() => {
        fetchWeatherPrediction();
      }, 1000);
      
      // Add event listeners
      map.on('moveend', () => {
        const center = map.getCenter();
        setLat(center.lat);
        setLon(center.lng);
        setZoom(map.getZoom());
      });
      
    }).catch((error) => {
      console.error('Failed to load Leaflet:', error);
      setMapError('Failed to load map library');
    });
  }, [lat, lon, zoom]);
  
  // Toggle weather layer visibility
  const toggleWeatherLayer = useCallback((layerId: string) => {
    setWeatherLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newVisible = !layer.visible;
        
        if (mapRef.current) {
        if (newVisible) {
          // Add layer to map
          import('leaflet').then((L) => {
            const tileLayer = L.tileLayer(layer.url, {
              attribution: '© OpenWeatherMap',
              opacity: layer.opacity,
              maxZoom: 18
            });
            
            
            
            tileLayer.addTo(mapRef.current);
            layerRefs.current[layerId] = tileLayer;
          });
          } else {
            // Remove layer from map
            if (layerRefs.current[layerId]) {
              mapRef.current.removeLayer(layerRefs.current[layerId]);
              delete layerRefs.current[layerId];
            }
          }
        }
        
        return { ...layer, visible: newVisible };
      }
      return layer;
    }));
  }, []);
  
  // Function to fetch weather forecast and generate agricultural predictions
  const fetchWeatherPrediction = useCallback(async () => {
    try {
      // Fetch 5-day weather forecast
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
      const forecastData = await response.json();
      
      if (forecastData && forecastData.list) {
        // Process forecast data for agricultural predictions
        const predictions = processAgriculturalForecast(forecastData.list);
        setWeatherPrediction(predictions);
        
        // Generate agricultural advice
        const advice = generateAgriculturalAdvice(predictions);
        setAgriculturalAdvice(advice);
      }
    } catch (error) {
      console.error('Failed to fetch weather prediction:', error);
    }
  }, [lat, lon]);

  // Function to process forecast data for agricultural predictions
  const processAgriculturalForecast = (forecastList: any[]) => {
    const predictions = {
      next5Days: [] as any[],
      temperature: { min: 999, max: -999, avg: 0 },
      rainfall: { total: 0, days: 0 },
      humidity: { min: 999, max: -999, avg: 0 },
      wind: { max: 0, avg: 0 },
      soilMoisture: 'Unknown',
      cropRisk: 'Low',
      irrigationNeed: 'Normal'
    };

    let tempSum = 0;
    let humiditySum = 0;
    let windSum = 0;
    let rainDays = 0;

    // Process each forecast entry
    forecastList.slice(0, 40).forEach((entry, index) => { // 5 days * 8 entries per day
      const date = new Date(entry.dt * 1000);
      const temp = entry.main.temp;
      const humidity = entry.main.humidity;
      const wind = entry.wind.speed;
      const rain = entry.rain?.['3h'] || 0;
      const description = entry.weather[0].description;

      // Update temperature stats
      predictions.temperature.min = Math.min(predictions.temperature.min, temp);
      predictions.temperature.max = Math.max(predictions.temperature.max, temp);
      tempSum += temp;

      // Update humidity stats
      predictions.humidity.min = Math.min(predictions.humidity.min, humidity);
      predictions.humidity.max = Math.max(predictions.humidity.max, humidity);
      humiditySum += humidity;

      // Update wind stats
      predictions.wind.max = Math.max(predictions.wind.max, wind);
      windSum += wind;

      // Update rainfall stats
      if (rain > 0) {
        predictions.rainfall.total += rain;
        rainDays++;
      }

      // Group by day
      const dayKey = date.toDateString();
      if (!predictions.next5Days.find(day => day.date === dayKey)) {
        predictions.next5Days.push({
          date: dayKey,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          temperature: { min: temp, max: temp, avg: temp },
          humidity: humidity,
          wind: wind,
          rainfall: rain,
          description: description,
          icon: entry.weather[0].icon
        });
      } else {
        const dayIndex = predictions.next5Days.findIndex(day => day.date === dayKey);
        const day = predictions.next5Days[dayIndex];
        day.temperature.min = Math.min(day.temperature.min, temp);
        day.temperature.max = Math.max(day.temperature.max, temp);
        day.temperature.avg = (day.temperature.avg + temp) / 2;
        day.humidity = (day.humidity + humidity) / 2;
        day.wind = Math.max(day.wind, wind);
        day.rainfall += rain;
      }
    });

    // Calculate averages
    predictions.temperature.avg = tempSum / forecastList.length;
    predictions.humidity.avg = humiditySum / forecastList.length;
    predictions.wind.avg = windSum / forecastList.length;
    predictions.rainfall.days = rainDays;

    // Determine soil moisture based on rainfall and humidity
    if (predictions.rainfall.total > 20) {
      predictions.soilMoisture = 'High';
    } else if (predictions.rainfall.total > 5) {
      predictions.soilMoisture = 'Moderate';
    } else if (predictions.humidity.avg > 70) {
      predictions.soilMoisture = 'Moderate';
    } else {
      predictions.soilMoisture = 'Low';
    }

    // Determine crop risk
    if (predictions.temperature.max > 40 || predictions.temperature.min < 5) {
      predictions.cropRisk = 'High';
    } else if (predictions.wind.max > 15 || predictions.rainfall.total > 50) {
      predictions.cropRisk = 'Medium';
    } else {
      predictions.cropRisk = 'Low';
    }

    // Determine irrigation need
    if (predictions.soilMoisture === 'Low' && predictions.rainfall.total < 5) {
      predictions.irrigationNeed = 'High';
    } else if (predictions.soilMoisture === 'High') {
      predictions.irrigationNeed = 'Low';
    } else {
      predictions.irrigationNeed = 'Normal';
    }

    return predictions;
  };

  // Function to generate agricultural advice based on weather predictions
  const generateAgriculturalAdvice = (predictions: any) => {
    const advice = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
      cropSpecific: [] as string[],
      general: [] as string[]
    };

    // Immediate advice (next 24 hours)
    if (predictions.next5Days[0]) {
      const today = predictions.next5Days[0];
      
      if (today.rainfall > 10) {
        advice.immediate.push("🌧️ Heavy rain expected - avoid field work and protect crops from waterlogging");
      } else if (today.rainfall > 0) {
        advice.immediate.push("🌦️ Light rain expected - good for soil moisture, avoid spraying");
      }
      
      if (today.temperature.max > 35) {
        advice.immediate.push("🌡️ High temperature expected - ensure adequate irrigation and shade");
      }
      
      if (today.wind > 10) {
        advice.immediate.push("💨 Strong winds expected - avoid spraying and protect young plants");
      }
    }

    // Short-term advice (next 3 days)
    const next3Days = predictions.next5Days.slice(0, 3);
    const avgTemp = next3Days.reduce((sum, day) => sum + day.temperature.avg, 0) / next3Days.length;
    const totalRain = next3Days.reduce((sum, day) => sum + day.rainfall, 0);

    if (totalRain > 30) {
      advice.shortTerm.push("🌧️ Heavy rainfall expected - prepare drainage and avoid waterlogging");
    } else if (totalRain > 10) {
      advice.shortTerm.push("🌦️ Moderate rainfall expected - good for crop growth");
    } else if (totalRain < 2) {
      advice.shortTerm.push("☀️ Dry conditions expected - increase irrigation frequency");
    }

    if (avgTemp > 30) {
      advice.shortTerm.push("🌡️ Hot weather expected - increase irrigation and provide shade");
    } else if (avgTemp < 15) {
      advice.shortTerm.push("❄️ Cool weather expected - protect sensitive crops from cold");
    }

    // Long-term advice (next 5 days)
    if (predictions.rainfall.total > 50) {
      advice.longTerm.push("🌧️ Wet period expected - focus on drainage and disease prevention");
    } else if (predictions.rainfall.total < 5) {
      advice.longTerm.push("☀️ Dry period expected - plan irrigation schedule and water conservation");
    }

    if (predictions.temperature.max > 40) {
      advice.longTerm.push("🌡️ Heat wave expected - implement heat stress management");
    }

    // Crop-specific advice
    if (predictions.soilMoisture === 'High') {
      advice.cropSpecific.push("🌱 High soil moisture - suitable for rice, sugarcane, and water-loving crops");
    } else if (predictions.soilMoisture === 'Low') {
      advice.cropSpecific.push("🌾 Low soil moisture - suitable for wheat, barley, and drought-resistant crops");
    }

    if (predictions.temperature.avg > 25) {
      advice.cropSpecific.push("🌽 Warm weather - ideal for maize, cotton, and summer crops");
    } else if (predictions.temperature.avg < 20) {
      advice.cropSpecific.push("🥬 Cool weather - suitable for leafy vegetables and winter crops");
    }

    // General advice
    if (predictions.cropRisk === 'High') {
      advice.general.push("⚠️ High risk conditions - monitor crops closely and take protective measures");
    } else if (predictions.cropRisk === 'Medium') {
      advice.general.push("⚡ Medium risk conditions - stay alert for weather changes");
    } else {
      advice.general.push("✅ Favorable conditions - good time for planting and field activities");
    }

    return advice;
  };


  
  
  // Refresh all weather layers
  const refreshWeatherLayers = useCallback(() => {
    if (mapRef.current) {
      // Remove all existing weather layers
      Object.values(layerRefs.current).forEach(layer => {
        mapRef.current.removeLayer(layer);
      });
      layerRefs.current = {};
      
      // Re-add visible layers with fresh data
      weatherLayers.forEach(layer => {
        if (layer.visible) {
          import('leaflet').then((L) => {
            const tileLayer = L.tileLayer(layer.url, {
              attribution: '© OpenWeatherMap',
              opacity: layer.opacity,
              maxZoom: 18
            });
            
            tileLayer.addTo(mapRef.current);
            layerRefs.current[layer.id] = tileLayer;
          });
        }
      });
    }
  }, [weatherLayers]);
  
  // Use current location
  const useMyLocation = useCallback(() => {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLon = position.coords.longitude;
          
          setLat(newLat);
          setLon(newLon);
          setZoom(12);
          
          if (mapRef.current) {
            mapRef.current.setView([newLat, newLon], 12);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);
  
  // Handle location search
  const handleLocationSelect = (location: {name:string;country:string;state?:string;lat:number;lon:number}) => {
    setLat(location.lat);
    setLon(location.lon);
    setZoom(12);
    setSuggestions([]);
    setSearchTerm(location.name);
    
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lon], 12);
    }
  };

  // Fetch location suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.map((item: any) => ({
          name: item.name,
          country: item.country,
          state: item.state,
          lat: item.lat,
          lon: item.lon
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSuggestions(searchTerm.trim());
      } else {
        setSuggestions([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);
  
  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);
  
  // Reset map view
  const resetMapView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView([17.3850, 78.4867], 10);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-1 sm:p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Weather Map & Analytics
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Interactive weather map with real-time overlays and agricultural predictions
          </p>
        </div>

        {/* Main Layout - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {/* Main Content - Map and Predictions */}
          <div className="lg:col-span-3 space-y-4">
            {/* Map Container */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base lg:text-lg">Interactive Weather Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Map Container */}
                <div className="relative w-full aspect-square max-w-[600px] mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    ref={mapContainerRef}
                    className="w-full h-full"
                    style={{ minHeight: '400px' }}
                  />
                  
                  {/* Loading Overlay */}
                  {!isMapReady && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-600">Loading interactive map...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Switching Overlay */}
                  {isSwitchingMap && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="text-center bg-white p-4 rounded-lg shadow-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Switching map view...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Map Info */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Current Location</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Lat: {lat.toFixed(4)}, Lon: {lon.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Zoom: {zoom} | Last Update: {lastUpdate.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agricultural Weather Prediction - Compact */}
            {weatherPrediction && agriculturalAdvice && (
              <Card>
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <Cloud className="h-3 w-3" />
                    Agricultural Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  {/* Compact Weather Summary */}
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    <div className="bg-blue-50 p-1 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Thermometer className="h-2 w-2 text-blue-500" />
                        <span className="text-xs font-medium">Temp</span>
                      </div>
                      <p className="text-xs font-bold text-blue-600">
                        {weatherPrediction.temperature.avg.toFixed(1)}°C
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-1 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CloudRain className="h-2 w-2 text-green-500" />
                        <span className="text-xs font-medium">Rain</span>
                      </div>
                      <p className="text-xs font-bold text-green-600">
                        {weatherPrediction.rainfall.total.toFixed(1)}mm
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-1 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Wind className="h-2 w-2 text-purple-500" />
                        <span className="text-xs font-medium">Wind</span>
                      </div>
                      <p className="text-xs font-bold text-purple-600">
                        {weatherPrediction.wind.avg.toFixed(1)}m/s
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 p-1 rounded text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Cloud className="h-2 w-2 text-orange-500" />
                        <span className="text-xs font-medium">Soil</span>
                      </div>
                      <p className="text-xs font-bold text-orange-600">
                        {weatherPrediction.soilMoisture}
                      </p>
                    </div>
                  </div>

                  {/* Essential Predictions Only */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Today:</span>
                      <span className="text-green-600 font-medium">
                        {agriculturalAdvice.immediate[0] || "Ideal conditions"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Next 3 days:</span>
                      <span className="text-blue-600 font-medium">
                        {agriculturalAdvice.shortTerm[0] || "Good weather"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Crops:</span>
                      <span className="text-orange-600 font-medium">
                        {agriculturalAdvice.cropSpecific[0] || "Rice, Wheat"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">Risk:</span>
                      <span className="text-green-600 font-medium">
                        {agriculturalAdvice.general[0] || "Low"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Controls and Info */}
          <div className="lg:col-span-1 space-y-2 sm:space-y-4">
            {/* Search and Location Controls */}
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm">Location & Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {/* Search */}
                <div className="search-container">
                  <Label htmlFor="search" className="text-xs sm:text-sm font-medium">
                    Search Location:
                  </Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Enter city name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 text-xs h-8"
                    />
                  {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-24 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-xs"
                            onClick={() => handleLocationSelect(suggestion)}
                          >
                            {suggestion.name}, {suggestion.country}
                            {suggestion.state && `, ${suggestion.state}`}
                          </div>
                      ))}
                    </div>
                  )}
                </div>
                </div>

                {/* Current Location */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={useMyLocation}
                  className="w-full flex items-center justify-center gap-1 h-8 text-xs"
                >
                  <MapPin className="h-3 w-3" />
                  My Location
                </Button>
              </CardContent>
            </Card>

            {/* Map Controls */}
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm">Map Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {/* Map Type Selector */}
                <div>
                  <Label className="text-xs font-medium mb-1 block">
                    Map Type:
                  </Label>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant={mapType === 'roadmap' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMapType('roadmap')}
                      disabled={isSwitchingMap}
                      className="flex items-center gap-1 h-8 text-xs"
                    >
                      <Map className="h-3 w-3" />
                      {isSwitchingMap && mapType === 'roadmap' ? 'Switching...' : 'Road'}
                    </Button>
                    <Button
                      variant={mapType === 'satellite' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMapType('satellite')}
                      disabled={isSwitchingMap}
                      className="flex items-center gap-1 h-8 text-xs"
                    >
                      <Satellite className="h-3 w-3" />
                      {isSwitchingMap && mapType === 'satellite' ? 'Switching...' : 'Satellite'}
                    </Button>
                  </div>
                </div>

                {/* Weather Controls */}
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsUpdating(true);
                      refreshWeatherLayers();
                      setLastUpdate(new Date());
                      setTimeout(() => setIsUpdating(false), 2000);
                    }}
                    className="w-full flex items-center justify-center gap-1 h-8 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
                    {isUpdating ? 'Updating...' : 'Refresh Weather'}
                  </Button>
                  
                </div>
              </CardContent>
            </Card>

            {/* Weather Layers */}
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm">Weather Layers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weatherLayers.map((layer) => (
                    <div key={layer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <layer.icon className="h-3 w-3" />
                        <span className="text-xs font-medium">{layer.name}</span>
                    </div>
                      <Button
                        variant={layer.visible ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleWeatherLayer(layer.id)}
                        className="h-6 w-6 p-0"
                      >
                        {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}