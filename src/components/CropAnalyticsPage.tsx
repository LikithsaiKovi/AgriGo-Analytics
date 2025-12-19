import { useState } from "react";
import { motion } from "motion/react";
import { Plus, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { CropAdvisorySystem } from "./CropAdvisorySystem";
import { useLanguage } from "../contexts/LanguageContext";
import { apiService } from "../services/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const yieldData = [
  { month: "Jan", wheat: 1200, rice: 800, corn: 600 },
  { month: "Feb", wheat: 1350, rice: 900, corn: 700 },
  { month: "Mar", wheat: 1500, rice: 1000, corn: 850 },
  { month: "Apr", wheat: 1800, rice: 1200, corn: 1000 },
  { month: "May", wheat: 2100, rice: 1400, corn: 1200 },
  { month: "Jun", wheat: 2400, rice: 1600, corn: 1400 },
];

const nutrientData = [
  { nutrient: "Nitrogen", value: 82 },
  { nutrient: "Phosphorus", value: 76 },
  { nutrient: "Potassium", value: 88 },
  { nutrient: "Calcium", value: 65 },
  { nutrient: "Magnesium", value: 72 },
];

const diseaseData = [
  { name: "Healthy", value: 75, color: "#2E7D32" },
  { name: "Leaf Rust", value: 12, color: "#FDD835" },
  { name: "Powdery Mildew", value: 8, color: "#FF9800" },
  { name: "Root Rot", value: 5, color: "#d4183d" },
];

export function CropAnalyticsPage() {
  const { t } = useLanguage();
  const [isSensorDialogOpen, setIsSensorDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sensorForm, setSensorForm] = useState({
    fieldId: "",
    sensorId: "",
    name: "",
    type: "",
    crop: "",
    location: "",
    soilMoisture: "",
    temperature: "",
    humidity: "",
    ph: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    samplingFreq: "15",
    notes: "",
    organicMatter: "",
    ec: "",
    sandPct: "",
    siltPct: "",
    clayPct: "",
  });

  const handleSensorChange = (field: string, value: string) => {
    setSensorForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSensorSubmit = async () => {
    const required = [
      "name",
      "type",
      "crop",
      "location",
      "soilMoisture",
      "temperature",
      "humidity",
      "ph",
    ];

    const missing = required.filter((key) => !sensorForm[key as keyof typeof sensorForm]?.trim());

    if (missing.length) {
      toast.error("Please fill the highlighted fields for analytics insights.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.submitSoilReading({
        fieldId: sensorForm.fieldId.trim() || "default-field",
        sensorId: sensorForm.sensorId.trim() || "manual-entry",
        crop: sensorForm.crop.trim(),
        location: sensorForm.location.trim(),
        samplingFreq: Number(sensorForm.samplingFreq) || undefined,
        readings: {
          moisturePct: Number(sensorForm.soilMoisture),
          tempC: Number(sensorForm.temperature),
          humidityPct: Number(sensorForm.humidity),
          ph: Number(sensorForm.ph),
          nitrogenPpm: sensorForm.nitrogen ? Number(sensorForm.nitrogen) : undefined,
          phosphorusPpm: sensorForm.phosphorus ? Number(sensorForm.phosphorus) : undefined,
          potassiumPpm: sensorForm.potassium ? Number(sensorForm.potassium) : undefined,
          organicMatterPct: sensorForm.organicMatter ? Number(sensorForm.organicMatter) : undefined,
          ecDs: sensorForm.ec ? Number(sensorForm.ec) : undefined,
          texture: {
            sandPct: sensorForm.sandPct ? Number(sensorForm.sandPct) : undefined,
            siltPct: sensorForm.siltPct ? Number(sensorForm.siltPct) : undefined,
            clayPct: sensorForm.clayPct ? Number(sensorForm.clayPct) : undefined,
          },
          timestamp: new Date().toISOString(),
        },
      });

      if (!response.success) {
        toast.error(response.error || "Unable to save sensor data.");
        return;
      }

      toast.success("Sensor data captured. Analytics will refresh with the new readings.");
      setIsSensorDialogOpen(false);
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2">{t('sidebar.crop')}</h1>
            <p className="text-muted-foreground">
              {t('advisory.subtitle')}
            </p>
          </div>
          <Dialog open={isSensorDialogOpen} onOpenChange={setIsSensorDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setIsSensorDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('crop.analytics.add.sensor')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('crop.analytics.sensor.dialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('crop.analytics.sensor.dialog.description')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('crop.analytics.field.id')}</Label>
                  <Input
                    placeholder={t('crop.analytics.field.id.placeholder')}
                    value={sensorForm.fieldId}
                    onChange={(e) => handleSensorChange("fieldId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.sensor.id')}</Label>
                  <Input
                    placeholder={t('crop.analytics.sensor.id.placeholder')}
                    value={sensorForm.sensorId}
                    onChange={(e) => handleSensorChange("sensorId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.sensor.name')}</Label>
                  <Input
                    placeholder={t('crop.analytics.sensor.name.placeholder')}
                    value={sensorForm.name}
                    onChange={(e) => handleSensorChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.sensor.type')}</Label>
                  <Input
                    placeholder={t('crop.analytics.sensor.type.placeholder')}
                    value={sensorForm.type}
                    onChange={(e) => handleSensorChange("type", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.crop.monitored')}</Label>
                  <Input
                    placeholder={t('crop.analytics.crop.monitored.placeholder')}
                    value={sensorForm.crop}
                    onChange={(e) => handleSensorChange("crop", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.field.location')}</Label>
                  <Input
                    placeholder={t('crop.analytics.field.location.placeholder')}
                    value={sensorForm.location}
                    onChange={(e) => handleSensorChange("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('crop.analytics.soil.moisture')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 24"
                    value={sensorForm.soilMoisture}
                    onChange={(e) => handleSensorChange("soilMoisture", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.temperature')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 29"
                    value={sensorForm.temperature}
                    onChange={(e) => handleSensorChange("temperature", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.humidity')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 68"
                    value={sensorForm.humidity}
                    onChange={(e) => handleSensorChange("humidity", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.soil.ph')}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 6.4"
                    value={sensorForm.ph}
                    onChange={(e) => handleSensorChange("ph", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('crop.analytics.nitrogen')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 18"
                    value={sensorForm.nitrogen}
                    onChange={(e) => handleSensorChange("nitrogen", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.phosphorus')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={sensorForm.phosphorus}
                    onChange={(e) => handleSensorChange("phosphorus", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.potassium')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 40"
                    value={sensorForm.potassium}
                    onChange={(e) => handleSensorChange("potassium", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.organic.matter')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3.2"
                    value={sensorForm.organicMatter}
                    onChange={(e) => handleSensorChange("organicMatter", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.ec')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1.4"
                    value={sensorForm.ec}
                    onChange={(e) => handleSensorChange("ec", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.sand')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 45"
                    value={sensorForm.sandPct}
                    onChange={(e) => handleSensorChange("sandPct", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.silt')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    value={sensorForm.siltPct}
                    onChange={(e) => handleSensorChange("siltPct", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.clay')}</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 25"
                    value={sensorForm.clayPct}
                    onChange={(e) => handleSensorChange("clayPct", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('crop.analytics.sampling.frequency')}</Label>
                  <Input
                    type="number"
                    min="5"
                    step="5"
                    value={sensorForm.samplingFreq}
                    onChange={(e) => handleSensorChange("samplingFreq", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('crop.analytics.notes')}</Label>
                <Textarea
                  placeholder={t('crop.analytics.notes.placeholder')}
                  value={sensorForm.notes}
                  onChange={(e) => handleSensorChange("notes", e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSensorDialogOpen(false)}>
                  {t('crop.analytics.cancel')}
                </Button>
                <Button onClick={handleSensorSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {isSubmitting ? t('crop.analytics.saving') : t('crop.analytics.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Crop Advisory System */}
        {/* <div className="mb-8">
          <CropAdvisorySystem />
        </div> */}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <span className="text-sm text-primary bg-primary/10 px-2 py-1 rounded">
                    +12%
                  </span>
                </div>
                <h3 className="text-2xl mb-1">2,450 kg/acre</h3>
                <p className="text-sm text-muted-foreground">Average Yield (Current Season)</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-8 w-8 text-secondary" />
                  <span className="text-sm text-secondary bg-secondary/10 px-2 py-1 rounded">
                    Optimal
                  </span>
                </div>
                <h3 className="text-2xl mb-1">85%</h3>
                <p className="text-sm text-muted-foreground">Soil Health Score</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <PieChart className="h-8 w-8 text-green-600" />
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    Low Risk
                  </span>
                </div>
                <h3 className="text-2xl mb-1">25%</h3>
                <p className="text-sm text-muted-foreground">Disease Probability</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Crop Yield Over Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Crop Yield Over Time</CardTitle>
                <CardDescription>Multi-crop yield comparison (kg/acre)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#717182" />
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
                      dataKey="wheat"
                      stroke="#2E7D32"
                      strokeWidth={3}
                      name="Wheat"
                      dot={{ fill: "#2E7D32", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rice"
                      stroke="#0288D1"
                      strokeWidth={3}
                      name="Rice"
                      dot={{ fill: "#0288D1", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="corn"
                      stroke="#FDD835"
                      strokeWidth={3}
                      name="Corn"
                      dot={{ fill: "#FDD835", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Soil Nutrient Balance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Soil Nutrient Balance</CardTitle>
                <CardDescription>Current nutrient levels (% of optimal)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={nutrientData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="nutrient" stroke="#717182" />
                    <YAxis stroke="#717182" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#2E7D32" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Disease Probability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Crop Disease Distribution</CardTitle>
                <CardDescription>Current health status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RePieChart>
                    <Pie
                      data={diseaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {diseaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>Actionable insights for crop improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1">
                      <h4 className="text-sm mb-1">Increase Calcium Levels</h4>
                      <p className="text-sm text-muted-foreground">
                        Apply lime fertilizer to boost calcium from 65% to optimal range (80-90%).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
                    <div className="flex-1">
                      <h4 className="text-sm mb-1">Monitor Leaf Rust</h4>
                      <p className="text-sm text-muted-foreground">
                        12% of crops showing early signs. Apply fungicide treatment within 3 days.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                    <div className="flex-1">
                      <h4 className="text-sm mb-1">Optimize Irrigation</h4>
                      <p className="text-sm text-muted-foreground">
                        Reduce water by 15% in zones with high moisture to prevent root issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                    <div className="flex-1">
                      <h4 className="text-sm mb-1">Harvest Timing</h4>
                      <p className="text-sm text-muted-foreground">
                        Optimal harvest window: 15-20 days. Weather conditions favorable.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-8 right-8"
        >
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setIsSensorDialogOpen(true)}
            aria-label="Add Sensor Data"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
