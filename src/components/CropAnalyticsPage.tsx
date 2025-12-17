import { motion } from "motion/react";
import { Plus, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { CropAdvisorySystem } from "./CropAdvisorySystem";
import { useLanguage } from "../contexts/LanguageContext";
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
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Sensor Data
          </Button>
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
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
