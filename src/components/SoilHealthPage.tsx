import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sprout, Droplets, Thermometer, Activity, AlertCircle } from "lucide-react";
import { DataCard } from "./DataCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

export function SoilHealthPage() {
  const [soilData, setSoilData] = useState({
    moisturePct: "",
    tempC: "",
    ph: "",
    organicMatterPct: "",
    nitrogenPpm: "",
    phosphorusPpm: "",
    potassiumPpm: "",
    ecDs: "",
    sandPct: "",
    siltPct: "",
    clayPct: "",
  });
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setSoilData((prev) => ({ ...prev, [field]: value }));
  };

  const analyzeSoil = () => {
    if (!soilData.moisturePct || !soilData.tempC || !soilData.ph || !soilData.organicMatterPct) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const moisture = parseFloat(soilData.moisturePct);
      const ph = parseFloat(soilData.ph);
      const organicMatter = parseFloat(soilData.organicMatterPct);
      
      setAnalysis({
        readings: {
          moisturePct: moisture,
          tempC: parseFloat(soilData.tempC),
          ph: ph,
          organicMatterPct: organicMatter,
          nitrogenPpm: soilData.nitrogenPpm ? parseFloat(soilData.nitrogenPpm) : undefined,
          phosphorusPpm: soilData.phosphorusPpm ? parseFloat(soilData.phosphorusPpm) : undefined,
          potassiumPpm: soilData.potassiumPpm ? parseFloat(soilData.potassiumPpm) : undefined,
          ecDs: soilData.ecDs ? parseFloat(soilData.ecDs) : undefined,
          texture: {
            sandPct: soilData.sandPct ? parseFloat(soilData.sandPct) : undefined,
            siltPct: soilData.siltPct ? parseFloat(soilData.siltPct) : undefined,
            clayPct: soilData.clayPct ? parseFloat(soilData.clayPct) : undefined,
          }
        },
        insights: generateInsights(moisture, ph, organicMatter)
      });
      setIsAnalyzing(false);
    }, 500);
  };

  const generateInsights = (moisture: number, ph: number, organicMatter: number) => {
    const insights = [];
    
    if (moisture < 20) {
      insights.push({ metric: "Moisture", severity: "warning", message: "Soil moisture is low. Consider irrigation." });
    } else if (moisture > 35) {
      insights.push({ metric: "Moisture", severity: "info", message: "Moisture levels are optimal for most crops." });
    }
    
    if (ph < 6.0) {
      insights.push({ metric: "pH", severity: "warning", message: "Soil is acidic. Consider adding lime." });
    } else if (ph > 7.5) {
      insights.push({ metric: "pH", severity: "warning", message: "Soil is alkaline. Consider adding sulfur." });
    } else {
      insights.push({ metric: "pH", severity: "success", message: "pH level is ideal for most crops." });
    }
    
    if (organicMatter < 2) {
      insights.push({ metric: "Organic Matter", severity: "warning", message: "Low organic matter. Add compost or manure." });
    } else if (organicMatter >= 3) {
      insights.push({ metric: "Organic Matter", severity: "success", message: "Good organic matter content." });
    }
    
    return insights;
  };

  const calculateHealthScore = (readings: any) => {
    let score = 0;
    let factors = 0;

    // Moisture score (0-25 points)
    if (readings.moisturePct !== undefined) {
      factors++;
      if (readings.moisturePct >= 20 && readings.moisturePct <= 35) score += 25;
      else if (readings.moisturePct >= 15 && readings.moisturePct <= 40) score += 18;
      else if (readings.moisturePct >= 10 && readings.moisturePct <= 45) score += 12;
      else score += 5;
    }

    // pH score (0-25 points)
    if (readings.ph !== undefined) {
      factors++;
      if (readings.ph >= 6.0 && readings.ph <= 7.5) score += 25;
      else if (readings.ph >= 5.5 && readings.ph <= 8.0) score += 18;
      else if (readings.ph >= 5.0 && readings.ph <= 8.5) score += 12;
      else score += 5;
    }

    // Organic Matter score (0-25 points)
    if (readings.organicMatterPct !== undefined) {
      factors++;
      if (readings.organicMatterPct >= 3) score += 25;
      else if (readings.organicMatterPct >= 2) score += 18;
      else if (readings.organicMatterPct >= 1) score += 12;
      else score += 5;
    }

    // Temperature score (0-25 points)
    if (readings.tempC !== undefined) {
      factors++;
      if (readings.tempC >= 15 && readings.tempC <= 30) score += 25;
      else if (readings.tempC >= 10 && readings.tempC <= 35) score += 18;
      else if (readings.tempC >= 5 && readings.tempC <= 40) score += 12;
      else score += 5;
    }

    return factors > 0 ? Math.round(score / factors * 4) : 0;
  };

  const getHealthScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent soil health! Your soil is in great condition for growing crops.";
    if (score >= 60) return "Good soil health. A few improvements could make it even better.";
    if (score >= 40) return "Fair soil health. Consider the recommendations below to improve.";
    return "Poor soil health. Follow the recommendations to restore soil quality.";
  };

  const readings = analysis?.readings || {};
  const texture = readings.texture || {};
  const insights = analysis?.insights || [];

  const nutrientProfile = [
    { nutrient: "Nitrogen", current: readings.nitrogenPpm, optimal: 80 },
    { nutrient: "Phosphorus", current: readings.phosphorusPpm, optimal: 60 },
    { nutrient: "Potassium", current: readings.potassiumPpm, optimal: 120 },
    { nutrient: "pH", current: readings.ph, optimal: 6.8 },
    { nutrient: "Organic Matter", current: readings.organicMatterPct, optimal: 3 },
  ].filter((item) => item.current !== undefined && item.current !== null);

  const soilComposition = [
    { component: "Clay", percentage: texture.clayPct },
    { component: "Sand", percentage: texture.sandPct },
    { component: "Silt", percentage: texture.siltPct },
  ].filter((item) => item.percentage !== undefined && item.percentage !== null);

  const fmt = (value: unknown) =>
    value === undefined || value === null || Number.isNaN(value) ? "--" : String(value);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Soil Health Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time soil analysis and nutrient tracking
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Soil Data for Analysis</CardTitle>
            <CardDescription>Enter your soil test results below to get instant analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Required Fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  Soil Moisture (%) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={soilData.moisturePct}
                  onChange={(e) => handleInputChange("moisturePct", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  Temperature (°C) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 28"
                  value={soilData.tempC}
                  onChange={(e) => handleInputChange("tempC", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  pH Level <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 6.5"
                  value={soilData.ph}
                  onChange={(e) => handleInputChange("ph", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  Organic Matter (%) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 3.2"
                  value={soilData.organicMatterPct}
                  onChange={(e) => handleInputChange("organicMatterPct", e.target.value)}
                />
              </div>

              {/* Optional Fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nitrogen (ppm)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={soilData.nitrogenPpm}
                  onChange={(e) => handleInputChange("nitrogenPpm", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Phosphorus (ppm)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 15"
                  value={soilData.phosphorusPpm}
                  onChange={(e) => handleInputChange("phosphorusPpm", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Potassium (ppm)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 120"
                  value={soilData.potassiumPpm}
                  onChange={(e) => handleInputChange("potassiumPpm", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  EC (dS/m)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1.5"
                  value={soilData.ecDs}
                  onChange={(e) => handleInputChange("ecDs", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Sand (%)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 45"
                  value={soilData.sandPct}
                  onChange={(e) => handleInputChange("sandPct", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Silt (%)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={soilData.siltPct}
                  onChange={(e) => handleInputChange("siltPct", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Clay (%)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={soilData.clayPct}
                  onChange={(e) => handleInputChange("clayPct", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={analyzeSoil} 
                disabled={isAnalyzing || !soilData.moisturePct || !soilData.tempC || !soilData.ph || !soilData.organicMatterPct}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Soil Health"}
              </Button>
              <span className="text-xs text-muted-foreground">
                * Required fields for analysis
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Overall Soil Health Score */}
            <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      Soil Health Score: {calculateHealthScore(readings)}%
                    </h3>
                    <p className="text-green-700">
                      {getHealthScoreMessage(calculateHealthScore(readings))}
                    </p>
                  </div>
                  <div className="text-6xl">
                    {calculateHealthScore(readings) >= 80 ? "🌟" : 
                     calculateHealthScore(readings) >= 60 ? "👍" : 
                     calculateHealthScore(readings) >= 40 ? "⚠️" : "❌"}
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={calculateHealthScore(readings)} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DataCard
                title="Soil Moisture"
                value={fmt(readings.moisturePct)}
                unit="%"
                icon={Droplets}
                trend={readings.moisturePct < 20 ? "Low - Needs irrigation" : readings.moisturePct > 35 ? "Optimal" : "Moderate"}
                color="secondary"
              />
              <DataCard
                title="Soil Temperature"
                value={fmt(readings.tempC)}
                unit="°C"
                icon={Thermometer}
                trend={readings.tempC < 15 ? "Cool" : readings.tempC > 30 ? "Warm" : "Ideal"}
                color="warning"
              />
              <DataCard
                title="pH Level"
                value={fmt(readings.ph)}
                unit=""
                icon={Activity}
                trend={readings.ph < 6 ? "Acidic" : readings.ph > 7.5 ? "Alkaline" : "Optimal"}
                color="primary"
              />
              <DataCard
                title="Organic Matter"
                value={fmt(readings.organicMatterPct)}
                unit="%"
                icon={Sprout}
                trend={readings.organicMatterPct < 2 ? "Low" : readings.organicMatterPct >= 3 ? "Good" : "Moderate"}
                color="success"
              />
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>💡 What This Means For You</CardTitle>
                    <CardDescription>Simple recommendations to improve your soil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-4 rounded-lg ${
                          insight.severity === "warning"
                            ? "bg-orange-50 border-l-4 border-orange-500"
                            : insight.severity === "success"
                            ? "bg-green-50 border-l-4 border-green-500"
                            : "bg-blue-50 border-l-4 border-blue-500"
                        }`}
                      >
                        <div className="text-2xl">
                          {insight.severity === "warning" ? "⚠️" : insight.severity === "success" ? "✅" : "ℹ️"}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-base mb-1">
                            {insight.metric}
                          </p>
                          <p className="text-sm text-gray-700">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Action Guide */}
            <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Next Steps - What To Do Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readings.moisturePct < 20 && (
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-700 mb-2">💧 Water Your Soil</h4>
                      <p className="text-sm text-gray-600">Irrigate immediately. Target moisture: 25-30%</p>
                    </div>
                  )}
                  {readings.ph < 6.0 && (
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-700 mb-2">🪨 Add Lime</h4>
                      <p className="text-sm text-gray-600">Apply 2-4 kg per 100 sq ft to reduce acidity</p>
                    </div>
                  )}
                  {readings.ph > 7.5 && (
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-700 mb-2">🔆 Add Sulfur</h4>
                      <p className="text-sm text-gray-600">Apply 1-2 kg per 100 sq ft to reduce alkalinity</p>
                    </div>
                  )}
                  {readings.organicMatterPct < 2 && (
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-700 mb-2">🌱 Add Compost</h4>
                      <p className="text-sm text-gray-600">Mix in 5-10 kg compost per sq meter</p>
                    </div>
                  )}
                  {calculateHealthScore(readings) >= 70 && (
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">🌾 Ready to Plant</h4>
                      <p className="text-sm text-gray-600">Your soil is ready for most crops!</p>
                    </div>
                  )}
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-700 mb-2">🔄 Test Again</h4>
                    <p className="text-sm text-gray-600">Re-test after 2-3 weeks to track improvements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>💡 What This Means For You</CardTitle>
                    <CardDescription>Simple recommendations to improve your soil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-md ${
                          insight.severity === "warning"
                            ? "bg-orange-50 border border-orange-200"
                            : insight.severity === "success"
                            ? "bg-green-50 border border-green-200"
                            : "bg-blue-50 border border-blue-200"
                        }`}
                      >
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 ${
                            insight.severity === "warning"
                              ? "text-orange-600"
                              : insight.severity === "success"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {insight.metric}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Nutrient Profile Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Nutrient Profile Analysis</CardTitle>
                    <CardDescription>Current vs. optimal levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {nutrientProfile.length ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={nutrientProfile}>
                          <PolarGrid stroke="#e0e0e0" />
                          <PolarAngleAxis dataKey="nutrient" />
                          <PolarRadiusAxis angle={90} domain={[0, 140]} />
                          <Radar
                            name="Current Level"
                            dataKey="current"
                            stroke="#2E7D32"
                            fill="#2E7D32"
                            fillOpacity={0.3}
                          />
                          <Radar
                            name="Optimal Level"
                            dataKey="optimal"
                            stroke="#0288D1"
                            fill="#0288D1"
                            fillOpacity={0.1}
                          />
                          <Legend />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground">Provide nutrient readings to see the profile.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

              {/* Soil Composition */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Soil Composition</CardTitle>
                    <CardDescription>Texture analysis breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {soilComposition.length ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={soilComposition} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="component" type="category" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="percentage" fill="#2E7D32" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Add texture (sand/silt/clay) to view composition.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    )}


      </div>
    </div>
  );
}
