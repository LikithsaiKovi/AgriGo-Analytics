import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, MapPin, Clock, Bell, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface MarketPrice {
  commodity: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  market: string;
  state: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  volume: string;
  quality: 'A' | 'B' | 'C';
}

interface PriceAlert {
  id: string;
  commodity: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

export function MarketPriceIntelligence() {
  const { t } = useLanguage();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('wheat');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real implementation, this would come from APIs
  const mockPrices: MarketPrice[] = [
    {
      commodity: 'wheat',
      currentPrice: 2950,
      previousPrice: 2850,
      change: 100,
      changePercent: 3.51,
      market: 'Delhi',
      state: 'Delhi',
      lastUpdated: '2 hours ago',
      trend: 'up',
      volume: '12,500 tons',
      quality: 'A'
    },
    {
      commodity: 'rice',
      currentPrice: 3750,
      previousPrice: 3800,
      change: -50,
      changePercent: -1.32,
      market: 'Mumbai',
      state: 'Maharashtra',
      lastUpdated: '1 hour ago',
      trend: 'down',
      volume: '8,200 tons',
      quality: 'A'
    },
    {
      commodity: 'corn',
      currentPrice: 2100,
      previousPrice: 2050,
      change: 50,
      changePercent: 2.44,
      market: 'Bangalore',
      state: 'Karnataka',
      lastUpdated: '3 hours ago',
      trend: 'up',
      volume: '15,800 tons',
      quality: 'B'
    },
    {
      commodity: 'soybean',
      currentPrice: 4200,
      previousPrice: 4300,
      change: -100,
      changePercent: -2.33,
      market: 'Indore',
      state: 'Madhya Pradesh',
      lastUpdated: '4 hours ago',
      trend: 'down',
      volume: '6,400 tons',
      quality: 'A'
    },
    {
      commodity: 'cotton',
      currentPrice: 6800,
      previousPrice: 6750,
      change: 50,
      changePercent: 0.74,
      market: 'Ahmedabad',
      state: 'Gujarat',
      lastUpdated: '2 hours ago',
      trend: 'up',
      volume: '4,200 tons',
      quality: 'A'
    }
  ];

  const priceHistory = [
    { date: 'Jan 1', wheat: 2800, rice: 3600, corn: 2000 },
    { date: 'Jan 8', wheat: 2850, rice: 3650, corn: 2050 },
    { date: 'Jan 15', wheat: 2900, rice: 3700, corn: 2080 },
    { date: 'Jan 22', wheat: 2880, rice: 3680, corn: 2100 },
    { date: 'Jan 29', wheat: 2920, rice: 3720, corn: 2120 },
    { date: 'Feb 5', wheat: 2950, rice: 3750, corn: 2100 }
  ];

  useEffect(() => {
    setPrices(mockPrices);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const createPriceAlert = (commodity: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      commodity,
      targetPrice,
      condition,
      isActive: true
    };
    setAlerts([...alerts, newAlert]);
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const getCommodityName = (commodity: string) => {
    const names: { [key: string]: string } = {
      'wheat': t('market.wheat'),
      'rice': t('market.rice'),
      'corn': t('market.corn'),
      'soybean': t('market.soybean'),
      'cotton': t('market.cotton')
    };
    return names[commodity] || commodity;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('market.intelligence.title')}</h2>
          <p className="text-muted-foreground">{t('market.intelligence.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('market.last.updated')}: 2 hours ago</span>
        </div>
      </div>

      {/* Price Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {prices.map((price, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">{getCommodityName(price.commodity)}</CardTitle>
                <Badge variant={price.quality === 'A' ? 'default' : 'secondary'}>
                  {price.quality} Grade
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {price.market}, {price.state}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">₹{price.currentPrice.toLocaleString()}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(price.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(price.trend)}`}>
                      {price.changePercent > 0 ? '+' : ''}{price.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <div>Volume: {price.volume}</div>
                  <div>Updated: {price.lastUpdated}</div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => createPriceAlert(price.commodity, price.currentPrice, 'above')}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    {t('market.set.alert')}
                  </Button>
                  <Button size="sm" variant="outline">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {t('market.buy.now')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('market.price.trends')}</CardTitle>
          <CardDescription>{t('market.trends.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#717182" />
              <YAxis stroke="#717182" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `₹${value.toLocaleString()}`, 
                  getCommodityName(name)
                ]}
              />
              <Line type="monotone" dataKey="wheat" stroke="#FDD835" strokeWidth={2} name="wheat" />
              <Line type="monotone" dataKey="rice" stroke="#0288D1" strokeWidth={2} name="rice" />
              <Line type="monotone" dataKey="corn" stroke="#4CAF50" strokeWidth={2} name="corn" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('market.price.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div>
                      <span className="font-medium">{getCommodityName(alert.commodity)}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {t('market.alert.when')} {alert.condition === 'above' ? '>' : '<'} ₹{alert.targetPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                      {alert.isActive ? t('market.alert.active') : t('market.alert.inactive')}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAlert(alert.id)}
                    >
                      {alert.isActive ? t('market.alert.disable') : t('market.alert.enable')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>{t('market.insights.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">{t('market.insights.best.selling')}</h4>
              <p className="text-sm text-green-700 mt-1">{t('market.insights.best.selling.desc')}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">{t('market.insights.price.trend')}</h4>
              <p className="text-sm text-blue-700 mt-1">{t('market.insights.price.trend.desc')}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800">{t('market.insights.weather.impact')}</h4>
              <p className="text-sm text-orange-700 mt-1">{t('market.insights.weather.impact.desc')}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">{t('market.insights.government.schemes')}</h4>
              <p className="text-sm text-purple-700 mt-1">{t('market.insights.government.schemes.desc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
