import { motion } from "motion/react";
import { Thermometer, Droplets, Wind, CloudRain, TrendingUp, AlertCircle } from "lucide-react";
import { DataCard } from "./DataCard";
import { AlertCard } from "./AlertCard";
import { RealTimeWeather } from "./RealTimeWeather";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { VoiceInterface } from "./VoiceInterface";

type WeatherTrendPoint = { time: string; temp: number; humidity: number };

// Crop health data will be fetched from API

export function Dashboard() {
  const { t } = useLanguage();
  const [trendData, setTrendData] = useState<WeatherTrendPoint[]>([]);
  const [cropHealthData, setCropHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lon: -74.0060 });
  
  // Real-time weather data state
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    rainfall: 5.2,
    temperatureTrend: '+2°C from yesterday',
    humidityTrend: 'Normal range',
    windTrend: 'Light breeze',
    rainfallTrend: 'Last 24 hours'
  });
  
  const [isRealTimeData, setIsRealTimeData] = useState(false);

  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getWeatherForecast(userLocation.lat, userLocation.lon);
      if (res.success && res.data) {
        const mapped: WeatherTrendPoint[] = res.data.map((p: any) => ({
          time: new Date(p.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(p.temperature),
          humidity: p.humidity,
        }));
        setTrendData(mapped);
      }
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      setTrendData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCropHealthData = async () => {
    try {
      const response = await apiService.getCropHealthData();
      if (response.success && response.data) {
        setCropHealthData(response.data);
      }
    } catch (error) {
      console.error('Error fetching crop health data:', error);
    }
  };

  const loadCurrentWeather = async () => {
    try {
      console.log('Fetching weather data for:', userLocation);
      
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No authentication token, using fallback data');
        setCurrentWeather({
          temperature: 28,
          humidity: 65,
          windSpeed: 12,
          rainfall: 5.2,
          temperatureTrend: '+2°C from yesterday',
          humidityTrend: 'Normal range',
          windTrend: 'Light breeze',
          rainfallTrend: 'Last 24 hours'
        });
        return;
      }
      
      const response = await apiService.getCurrentWeather(userLocation.lat, userLocation.lon);
      console.log('Weather API response:', response);
      
      if (response.success && response.data) {
        const weather = response.data;
        console.log('Setting real weather data:', weather);
        setCurrentWeather({
          temperature: Math.round(weather.temperature || 0),
          humidity: Math.round(weather.humidity || 0),
          windSpeed: Math.round(weather.windSpeed || 0),
          rainfall: Math.round((weather.rainfall || 0) * 10) / 10,
          temperatureTrend: weather.temperature > 25 ? 'Above average' : 'Normal range',
          humidityTrend: weather.humidity > 70 ? 'High humidity' : 'Normal range',
          windTrend: weather.windSpeed > 15 ? 'Strong winds' : 'Light breeze',
          rainfallTrend: weather.rainfall > 5 ? 'Heavy rainfall' : 'Light rain'
        });
        setIsRealTimeData(true);
      } else {
        console.log('API failed, using fallback data');
        // Use fallback data if API fails
        setCurrentWeather({
          temperature: 28,
          humidity: 65,
          windSpeed: 12,
          rainfall: 5.2,
          temperatureTrend: '+2°C from yesterday',
          humidityTrend: 'Normal range',
          windTrend: 'Light breeze',
          rainfallTrend: 'Last 24 hours'
        });
        setIsRealTimeData(false);
      }
    } catch (error) {
      console.error('Error fetching current weather:', error);
      // Set fallback data if API fails
      setCurrentWeather({
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        rainfall: 5.2,
        temperatureTrend: '+2°C from yesterday',
        humidityTrend: 'Normal range',
        windTrend: 'Light breeze',
        rainfallTrend: 'Last 24 hours'
      });
      setIsRealTimeData(false);
    }
  };

  useEffect(() => {
    loadForecast();
    loadCropHealthData();
    loadCurrentWeather();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(() => {
      loadCurrentWeather();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [userLocation]);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Keep default location
        }
      );
    }
  }, []);
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-2 sm:p-4 lg:p-8 max-w-[1600px] mx-auto">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{t("dashboard.title")}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("dashboard.overview")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isRealTimeData ? (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Live Data</span>
                  <span className="sm:hidden">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="hidden sm:inline">Demo Data</span>
                  <span className="sm:hidden">Demo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weather Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <DataCard
            title={t("dashboard.temperature")}
            value={currentWeather.temperature.toString()}
            unit="°C"
            icon={Thermometer}
            trend={currentWeather.temperatureTrend}
            color="warning"
          />
          <DataCard
            title={t("dashboard.humidity")}
            value={currentWeather.humidity.toString()}
            unit="%"
            icon={Droplets}
            trend={currentWeather.humidityTrend}
            color="secondary"
          />
          <DataCard
            title={t("dashboard.wind")}
            value={currentWeather.windSpeed.toString()}
            unit="km/h"
            icon={Wind}
            trend={currentWeather.windTrend}
            color="primary"
          />
          <DataCard
            title="Rainfall"
            value={currentWeather.rainfall.toString()}
            unit="mm"
            icon={CloudRain}
            trend={currentWeather.rainfallTrend}
            color="success"
          />
        </div>

        {/* Real-Time Weather */}
        <div className="mb-6 sm:mb-8">
          <RealTimeWeather lat={userLocation.lat} lon={userLocation.lon} />
        </div>

        {/* Voice Interface */}
        {/* <div className="mb-4 sm:mb-6 lg:mb-8">
          <VoiceInterface />
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Main Charts Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("dashboard.weather")}</CardTitle>
                      <CardDescription>{t("dashboard.temperature")} and {t("dashboard.humidity")} monitoring</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadForecast} disabled={isLoading}>Refresh</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="time" stroke="#717182" />
                      <YAxis stroke="#717182" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#FDD835"
                        strokeWidth={3}
                        name={t("dashboard.temperature") + " (°C)"}
                        dot={{ fill: "#FDD835", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#0288D1"
                        strokeWidth={3}
                        name={t("dashboard.humidity") + " (%)"}
                        dot={{ fill: "#0288D1", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Crop Health Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Crop Health & Yield Index</CardTitle>
                  <CardDescription>6-month performance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cropHealthData}>
                      <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#66BB6A" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#66BB6A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" stroke="#717182" />
                      <YAxis stroke="#717182" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="health"
                        stroke="#2E7D32"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorHealth)"
                        name="Health Score"
                      />
                      <Area
                        type="monotone"
                        dataKey="yield"
                        stroke="#66BB6A"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorYield)"
                        name="Yield Index"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Prediction Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>AI Yield Prediction</CardTitle>
                  </div>
                  <CardDescription>Estimated harvest for current season</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-8">
                    <div>
                      <p className="text-muted-foreground mb-2">Predicted Yield</p>
                      <h2 className="text-primary">2,450 kg/acre</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        +15% compared to last season
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2">Confidence</p>
                      <h3 className="text-primary">94%</h3>
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-2">Key Factors</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          Optimal soil pH
                        </span>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          Good rainfall
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Panel - Alerts */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Alerts & Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AlertCard
                    type="warning"
                    title="Irrigation Required"
                    message="Field A shows low soil moisture. Consider irrigation within 24 hours."
                    time="2h ago"
                  />
                  <AlertCard
                    type="warning"
                    title="Fertilizer Alert"
                    message="Nitrogen levels predicted to drop below optimal in 3 days."
                    time="5h ago"
                  />
                  <AlertCard
                    type="success"
                    title="Optimal Conditions"
                    message="Field B has perfect moisture and nutrient balance."
                    time="1d ago"
                  />
                  <AlertCard
                    type="info"
                    title="Weather Update"
                    message="Moderate rainfall expected in 2 days. Plan harvesting accordingly."
                    time="1d ago"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Soil Sensors */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Real-Time Soil Sensors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Moisture Level</span>
                      <span className="text-sm">68%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: "68%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">pH Level</span>
                      <span className="text-sm">6.8</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Nitrogen (N)</span>
                      <span className="text-sm">82%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: "82%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Phosphorus (P)</span>
                      <span className="text-sm">76%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "76%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
