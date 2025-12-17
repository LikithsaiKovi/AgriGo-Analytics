import { motion } from "motion/react";
import { DollarSign, TrendingUp, PiggyBank, Calculator, FileText, AlertCircle, CreditCard, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { DataCard } from "./DataCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

// TODO: Replace with your database queries
const monthlyExpenses = [
  { month: "Jan", seeds: 5000, fertilizer: 8000, labor: 12000, equipment: 6000 },
  { month: "Feb", seeds: 4500, fertilizer: 7500, labor: 12000, equipment: 5500 },
  { month: "Mar", seeds: 6000, fertilizer: 9000, labor: 13000, equipment: 7000 },
  { month: "Apr", seeds: 5500, fertilizer: 8500, labor: 12500, equipment: 6500 },
  { month: "May", seeds: 7000, fertilizer: 10000, labor: 14000, equipment: 8000 },
  { month: "Jun", seeds: 6500, fertilizer: 9500, labor: 13500, equipment: 7500 },
];

// TODO: Replace with your database queries
const revenueProjection = [
  { month: "Jan", actual: 45000, projected: 42000 },
  { month: "Feb", actual: 48000, projected: 45000 },
  { month: "Mar", actual: 52000, projected: 50000 },
  { month: "Apr", actual: 55000, projected: 53000 },
  { month: "May", actual: 58000, projected: 56000 },
  { month: "Jun", actual: 62000, projected: 60000 },
];

// TODO: Replace with your database queries
const budgetAllocation = [
  { category: "Seeds & Inputs", value: 25, color: "#2E7D32" },
  { category: "Labor", value: 35, color: "#0288D1" },
  { category: "Equipment", value: 20, color: "#FDD835" },
  { category: "Utilities", value: 10, color: "#66BB6A" },
  { category: "Misc", value: 10, color: "#81C784" },
];

// TODO: Replace with your database queries
const loanDetails = [
  { type: "Equipment Loan", amount: 250000, remaining: 180000, rate: "8.5%", emi: 12500 },
  { type: "Working Capital", amount: 150000, remaining: 95000, rate: "10.2%", emi: 8200 },
];

export function FinancialPlanning() {
  // TODO: Add useEffect hooks to fetch data from your database
  // TODO: Add state management for form inputs and calculations
  // TODO: Implement calculator logic for ROI, Break-even, Subsidy, and EMI

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Financial Planning</h1>
          <p className="text-muted-foreground">
            Manage budgets, track expenses, and plan your agricultural investments
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DataCard
            title="Total Revenue (YTD)"
            value="320,000"
            unit="₹"
            icon={DollarSign}
            trend="+18% vs last year"
            color="success"
          />
          <DataCard
            title="Total Expenses"
            value="185,000"
            unit="₹"
            icon={Wallet}
            trend="Within budget"
            color="primary"
          />
          <DataCard
            title="Net Profit"
            value="135,000"
            unit="₹"
            icon={TrendingUp}
            trend="+22% growth"
            color="success"
          />
          <DataCard
            title="Savings"
            value="75,000"
            unit="₹"
            icon={PiggyBank}
            trend="Target: ₹100,000"
            color="accent"
          />
        </div>

        <Tabs defaultValue="budget" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="budget">Budget Planner</TabsTrigger>
            <TabsTrigger value="calculator">Calculators</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
          </TabsList>

          {/* Budget Planner Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Expenses Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Expense Breakdown</CardTitle>
                    <CardDescription>Category-wise spending analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyExpenses}>
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
                        <Bar dataKey="seeds" stackId="a" fill="#2E7D32" name="Seeds" />
                        <Bar dataKey="fertilizer" stackId="a" fill="#0288D1" name="Fertilizer" />
                        <Bar dataKey="labor" stackId="a" fill="#FDD835" name="Labor" />
                        <Bar dataKey="equipment" stackId="a" fill="#66BB6A" name="Equipment" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Budget Allocation */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Allocation</CardTitle>
                    <CardDescription>Annual budget distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={budgetAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {budgetAllocation.map((entry, index) => (
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
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Revenue vs Projection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue: Actual vs Projected</CardTitle>
                    <CardDescription>6-month comparison (₹)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueProjection}>
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
                          dataKey="actual"
                          stroke="#2E7D32"
                          strokeWidth={3}
                          name="Actual Revenue"
                          dot={{ fill: "#2E7D32", r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="projected"
                          stroke="#0288D1"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          name="Projected Revenue"
                          dot={{ fill: "#0288D1", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Calculators Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ROI Calculator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      <CardTitle>ROI Calculator</CardTitle>
                    </div>
                    <CardDescription>Calculate return on investment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="investment">Total Investment (₹)</Label>
                      <Input
                        id="investment"
                        type="number"
                        placeholder="e.g., 100000"
                        defaultValue="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="returns">Expected Returns (₹)</Label>
                      <Input
                        id="returns"
                        type="number"
                        placeholder="e.g., 135000"
                        defaultValue="135000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (months)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="e.g., 6"
                        defaultValue="6"
                      />
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground">
                      Calculate ROI
                    </Button>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">ROI Percentage</span>
                        <span className="text-2xl text-primary">35%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Profit</span>
                        <span className="text-xl">₹35,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Break-even Calculator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-secondary" />
                      <CardTitle>Break-even Calculator</CardTitle>
                    </div>
                    <CardDescription>Find your break-even point</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fixed-cost">Fixed Costs (₹)</Label>
                      <Input
                        id="fixed-cost"
                        type="number"
                        placeholder="e.g., 50000"
                        defaultValue="50000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variable-cost">Variable Cost per Unit (₹)</Label>
                      <Input
                        id="variable-cost"
                        type="number"
                        placeholder="e.g., 20"
                        defaultValue="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selling-price">Selling Price per Unit (₹)</Label>
                      <Input
                        id="selling-price"
                        type="number"
                        placeholder="e.g., 45"
                        defaultValue="45"
                      />
                    </div>
                    <Button className="w-full bg-secondary text-secondary-foreground">
                      Calculate Break-even
                    </Button>
                    <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Break-even Units</span>
                        <span className="text-2xl text-secondary">2,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Break-even Revenue</span>
                        <span className="text-xl">₹90,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Subsidy Calculator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent" />
                      <CardTitle>Subsidy Calculator</CardTitle>
                    </div>
                    <CardDescription>Estimate government subsidies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="equipment-cost">Equipment Cost (₹)</Label>
                      <Input
                        id="equipment-cost"
                        type="number"
                        placeholder="e.g., 200000"
                        defaultValue="200000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subsidy-percent">Subsidy Percentage (%)</Label>
                      <Input
                        id="subsidy-percent"
                        type="number"
                        placeholder="e.g., 40"
                        defaultValue="40"
                      />
                    </div>
                    <Button className="w-full bg-accent text-accent-foreground">
                      Calculate Subsidy
                    </Button>
                    <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Subsidy Amount</span>
                        <span className="text-2xl">₹80,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Your Investment</span>
                        <span className="text-xl">₹120,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Loan EMI Calculator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle>Loan EMI Calculator</CardTitle>
                    </div>
                    <CardDescription>Calculate monthly installments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
                      <Input
                        id="loan-amount"
                        type="number"
                        placeholder="e.g., 500000"
                        defaultValue="500000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest-rate">Interest Rate (% p.a.)</Label>
                      <Input
                        id="interest-rate"
                        type="number"
                        placeholder="e.g., 8.5"
                        defaultValue="8.5"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenure">Tenure (years)</Label>
                      <Input
                        id="tenure"
                        type="number"
                        placeholder="e.g., 5"
                        defaultValue="5"
                      />
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground">
                      Calculate EMI
                    </Button>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Monthly EMI</span>
                        <span className="text-2xl text-primary">₹10,260</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Interest</span>
                        <span className="text-xl">₹115,600</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Active Loans */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Loans</CardTitle>
                      <CardDescription>Your current loan obligations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loanDetails.map((loan, index) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="mb-1">{loan.type}</h4>
                              <p className="text-sm text-muted-foreground">
                                EMI: ₹{loan.emi.toLocaleString()} | Rate: {loan.rate}
                              </p>
                            </div>
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Remaining: ₹{loan.remaining.toLocaleString()}</span>
                              <span>
                                {Math.round((loan.remaining / loan.amount) * 100)}% left
                              </span>
                            </div>
                            <Progress
                              value={((loan.amount - loan.remaining) / loan.amount) * 100}
                              className="h-2"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Original: ₹{loan.amount.toLocaleString()}</span>
                              <span>
                                Paid: ₹{(loan.amount - loan.remaining).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Loan Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Loan Products</CardTitle>
                      <CardDescription>Based on your farm profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-green-900">Kisan Credit Card</h4>
                            <p className="text-sm text-green-700">
                              Up to ₹3 lakh at 7% interest
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="bg-white">
                            Apply
                          </Button>
                        </div>
                        <p className="text-sm text-green-700">
                          Flexible short-term credit for crop cultivation
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-blue-900">Equipment Finance</h4>
                            <p className="text-sm text-blue-700">
                              Up to ₹10 lakh at 9.5% interest
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="bg-white">
                            Apply
                          </Button>
                        </div>
                        <p className="text-sm text-blue-700">
                          Purchase tractors and modern farming equipment
                        </p>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-amber-900">Land Development Loan</h4>
                            <p className="text-sm text-amber-700">
                              Up to ₹5 lakh at 8% interest
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="bg-white">
                            Apply
                          </Button>
                        </div>
                        <p className="text-sm text-amber-700">
                          Improve irrigation and land infrastructure
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Loan Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Loan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Outstanding</p>
                      <h3 className="text-2xl">₹2,75,000</h3>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
                      <h3 className="text-2xl">₹20,700</h3>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Debt-to-Income</p>
                      <h3 className="text-2xl">18.5%</h3>
                      <Progress value={18.5} className="h-2 mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">Healthy ratio</p>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="mb-3">Financial Health Tips</h4>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            Maintain 3-6 months emergency fund
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            Keep debt-to-income below 30%
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            Consider crop insurance
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}