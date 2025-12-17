import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, Droplets, Sun, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';

interface CropAdvisory {
  crop: string;
  season: string;
  plantingDate: string;
  harvestingDate: string;
  growthStage: string;
  currentTasks: string[];
  upcomingTasks: string[];
  weatherAlerts: string[];
  pestAlerts: string[];
  diseaseAlerts: string[];
  irrigationSchedule: string[];
  fertilizerSchedule: string[];
  expectedYield: string;
  marketPrice: number;
  profitEstimate: number;
}

interface AdvisoryTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  category: 'planting' | 'irrigation' | 'fertilizer' | 'pest-control' | 'harvest';
}

export function CropAdvisorySystem() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [advisory, setAdvisory] = useState<CropAdvisory | null>(null);
  const [tasks, setTasks] = useState<AdvisoryTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const crops = [
    { id: 'wheat', name: t('crop.wheat'), season: t('crop.season.rabi') },
    { id: 'rice', name: t('crop.rice'), season: t('crop.season.kharif') },
    { id: 'corn', name: t('crop.corn'), season: t('crop.season.kharif') },
    { id: 'cotton', name: t('crop.cotton'), season: t('crop.season.kharif') },
    { id: 'sugarcane', name: t('crop.sugarcane'), season: t('crop.season.year-round') }
  ];

  // Mock advisory data
  const mockAdvisory: CropAdvisory = {
    crop: 'wheat',
    season: 'Rabi',
    plantingDate: '2024-11-15',
    harvestingDate: '2025-04-15',
    growthStage: 'Vegetative (30-45 days)',
    currentTasks: [
      'Monitor soil moisture levels',
      'Apply first dose of nitrogen fertilizer',
      'Check for aphid infestation',
      'Prepare for irrigation scheduling'
    ],
    upcomingTasks: [
      'Second fertilizer application (next week)',
      'Pest monitoring and control',
      'Weed management',
      'Irrigation scheduling'
    ],
    weatherAlerts: [
      'Heavy rainfall expected in 3 days - prepare drainage',
      'Temperature drop to 5°C expected - protect young plants'
    ],
    pestAlerts: [
      'Aphid population increasing - consider organic control',
      'Armyworm detected in nearby fields - monitor closely'
    ],
    diseaseAlerts: [
      'Powdery mildew risk due to high humidity',
      'Rust disease conditions favorable - apply preventive fungicide'
    ],
    irrigationSchedule: [
      'Today: Light irrigation (5mm)',
      'Next irrigation: 3 days (10mm)',
      'Weekly schedule: 15mm every 7 days'
    ],
    fertilizerSchedule: [
      'Completed: Basal dose (NPK 20:20:20)',
      'Due: First top dressing (Urea 50kg/acre)',
      'Scheduled: Second top dressing (Urea 25kg/acre) in 2 weeks'
    ],
    expectedYield: '45-50 quintals per acre',
    marketPrice: 2950,
    profitEstimate: 85000
  };

  const mockTasks: AdvisoryTask[] = [
    {
      id: '1',
      title: t('task.fertilizer.application'),
      description: t('task.fertilizer.application.desc'),
      priority: 'high',
      dueDate: '2024-12-20',
      status: 'pending',
      category: 'fertilizer'
    },
    {
      id: '2',
      title: t('task.irrigation.scheduling'),
      description: t('task.irrigation.scheduling.desc'),
      priority: 'medium',
      dueDate: '2024-12-18',
      status: 'in-progress',
      category: 'irrigation'
    },
    {
      id: '3',
      title: t('task.pest.monitoring'),
      description: t('task.pest.monitoring.desc'),
      priority: 'high',
      dueDate: '2024-12-15',
      status: 'completed',
      category: 'pest-control'
    },
    {
      id: '4',
      title: t('task.weed.management'),
      description: t('task.weed.management.desc'),
      priority: 'medium',
      dueDate: '2024-12-22',
      status: 'pending',
      category: 'planting'
    }
  ];

  useEffect(() => {
    setAdvisory(mockAdvisory);
    setTasks(mockTasks);
  }, [selectedCrop]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planting':
        return <Sprout className="h-4 w-4" />;
      case 'irrigation':
        return <Droplets className="h-4 w-4" />;
      case 'fertilizer':
        return <Sun className="h-4 w-4" />;
      case 'pest-control':
        return <AlertTriangle className="h-4 w-4" />;
      case 'harvest':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus as any } : task
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('advisory.title')}</h2>
          <p className="text-muted-foreground">{t('advisory.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {crops.map((crop) => (
            <Button
              key={crop.id}
              variant={selectedCrop === crop.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCrop(crop.id)}
            >
              {crop.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Crop Overview */}
      {advisory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('advisory.growth.stage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{advisory.growthStage}</div>
              <div className="text-sm text-muted-foreground">{advisory.season} Season</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('advisory.expected.yield')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{advisory.expectedYield}</div>
              <div className="text-sm text-muted-foreground">Per acre</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('advisory.market.price')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{advisory.marketPrice.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Per quintal</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('advisory.profit.estimate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{advisory.profitEstimate.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Per acre</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advisory Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">{t('advisory.tasks')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('advisory.alerts')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('advisory.schedule')}</TabsTrigger>
          <TabsTrigger value="recommendations">{t('advisory.recommendations')}</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getCategoryIcon(task.category)}
                      {task.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{task.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Due: {task.dueDate}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        disabled={task.status === 'completed'}
                      >
                        {task.status === 'pending' ? t('task.start') : t('task.continue')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        disabled={task.status === 'completed'}
                      >
                        {t('task.complete')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weather Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  {t('advisory.weather.alerts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {advisory?.weatherAlerts.map((alert, index) => (
                    <div key={index} className="p-2 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm">{alert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pest Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t('advisory.pest.alerts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {advisory?.pestAlerts.map((alert, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm">{alert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Disease Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t('advisory.disease.alerts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {advisory?.diseaseAlerts.map((alert, index) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm">{alert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Irrigation Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  {t('advisory.irrigation.schedule')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {advisory?.irrigationSchedule.map((schedule, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm">{schedule}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fertilizer Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  {t('advisory.fertilizer.schedule')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {advisory?.fertilizerSchedule.map((schedule, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded-lg">
                      <p className="text-sm">{schedule}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('advisory.current.recommendations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advisory?.currentTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <p className="text-sm">{task}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('advisory.upcoming.tasks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {advisory?.upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-blue-500 mt-1" />
                      <p className="text-sm">{task}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

