import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { FileText, CheckCircle2, Clock, AlertCircle, Filter, Search, ExternalLink, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { apiService } from "../services/api";

// Government schemes data from agriwelfare.gov.in
const centralSchemes = [
  {
    id: 1,
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Direct Benefit Transfer",
    amount: "₹6,000/year",
    eligibility: "All landholding farmer families",
    status: "Active",
    deadline: "Open year-round",
    description: "Direct income support of ₹6,000 per year to all landholding farmer families in three equal installments of ₹2,000 each.",
    benefits: ["Direct cash transfer", "No application fee", "Quick processing", "Transparent system"],
    documents: ["Aadhaar Card", "Land Ownership Papers", "Bank Account Details", "Income Certificate"],
    eligible: true,
    category: "Central"
  },
  {
    id: 2,
    name: "Agriculture Infrastructure Fund",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Infrastructure Development",
    amount: "Up to ₹2 Crore",
    eligibility: "Farmers, FPOs, Cooperatives, Startups",
    status: "Active",
    deadline: "March 31, 2026",
    description: "Financial support for development of agricultural infrastructure including cold storage, warehouses, and processing units.",
    benefits: ["Interest subvention", "Credit guarantee", "Infrastructure development", "Modern facilities"],
    documents: ["Project Proposal", "Land Documents", "Financial Statements", "Technical Details"],
    eligible: true,
    category: "Central"
  },
  {
    id: 3,
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Irrigation Development",
    amount: "Up to ₹5 Lakh per hectare",
    eligibility: "All farmers",
    status: "Active",
    deadline: "March 31, 2026",
    description: "Enhance physical access to water on farms and expand cultivable areas under assured irrigation to improve water use efficiency.",
    benefits: ["Water conservation", "Irrigation facilities", "Drip irrigation", "Micro irrigation"],
    documents: ["Land Records", "Aadhaar Card", "Bank Account", "Water Source Details"],
    eligible: true,
    category: "Central"
  },
  {
    id: 4,
    name: "ATMA (Agricultural Technology Management Agency)",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Technology Transfer",
    amount: "Free training and support",
    eligibility: "All farmers",
    status: "Active",
    deadline: "Ongoing",
    description: "Strengthening agricultural extension services and promoting decentralized farmer-driven extension services at district level.",
    benefits: ["Technology transfer", "Training programs", "Extension services", "Knowledge sharing"],
    documents: ["Aadhaar Card", "Farmer ID", "Land Details"],
    eligible: true,
    category: "Central"
  },
  {
    id: 5,
    name: "AGMARKNET",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Market Information",
    amount: "Free service",
    eligibility: "All farmers and traders",
    status: "Active",
    deadline: "Open registration",
    description: "Agricultural marketing information network to facilitate dissemination of market information to farmers, traders, and policymakers.",
    benefits: ["Market information", "Price discovery", "Transparent trading", "Online platform"],
    documents: ["Aadhaar Card", "Mobile Number", "Email ID"],
    eligible: true,
    category: "Central"
  },
  {
    id: 6,
    name: "DBT in Agriculture (Direct Benefit Transfer)",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Benefit Transfer",
    amount: "Various subsidies",
    eligibility: "All eligible farmers",
    status: "Active",
    deadline: "Ongoing",
    description: "Direct transfer of subsidies and benefits to farmers' bank accounts to ensure transparency and reduce leakages.",
    benefits: ["Direct transfer", "Transparent system", "No intermediaries", "Quick processing"],
    documents: ["Aadhaar Card", "Bank Account", "Land Records"],
    eligible: true,
    category: "Central"
  },
  {
    id: 7,
    name: "Horticulture Development Program",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Development Support",
    amount: "Up to ₹1 Lakh per hectare",
    eligibility: "Horticulture farmers",
    status: "Active",
    deadline: "March 31, 2026",
    description: "Comprehensive development of horticulture sector through various programs and subsidies for fruits, vegetables, and flowers.",
    benefits: ["Subsidy support", "Technology transfer", "Market linkage", "Quality improvement"],
    documents: ["Land Records", "Aadhaar Card", "Bank Account", "Crop Details"],
    eligible: true,
    category: "Central"
  },
  {
    id: 8,
    name: "Online Pesticide Registration",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Registration Service",
    amount: "Registration fee as applicable",
    eligibility: "Pesticide manufacturers and traders",
    status: "Active",
    deadline: "Ongoing",
    description: "Streamlined online registration system for pesticides to ensure quality and timely availability of agricultural inputs.",
    benefits: ["Online registration", "Quality assurance", "Timely availability", "Transparent process"],
    documents: ["Company Registration", "Technical Data", "Test Reports", "Manufacturing License"],
    eligible: false,
    category: "Central"
  },
  {
    id: 9,
    name: "Plant Quarantine Clearance",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Import/Export Service",
    amount: "Service charges as applicable",
    eligibility: "Importers and exporters",
    status: "Active",
    deadline: "Ongoing",
    description: "Regulation of import and export of plants and plant products to prevent introduction and spread of exotic pests and diseases.",
    benefits: ["Disease prevention", "Quality assurance", "Export facilitation", "Import regulation"],
    documents: ["Import/Export License", "Phytosanitary Certificate", "Product Details", "Origin Certificate"],
    eligible: false,
    category: "Central"
  },
  {
    id: 10,
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Crop Insurance",
    amount: "2% premium for Kharif, 1.5% for Rabi",
    eligibility: "All farmers",
    status: "Active",
    deadline: "Before sowing season",
    description: "Comprehensive crop insurance scheme providing financial support to farmers in case of crop loss due to natural calamities, pests, and diseases.",
    benefits: ["Low premium", "High coverage", "Quick settlement", "Comprehensive protection"],
    documents: ["Aadhaar Card", "Land Records", "Bank Account", "Sowing Certificate"],
    eligible: true,
    category: "Central"
  },
  {
    id: 11,
    name: "Kisan Credit Card (KCC)",
    department: "NABARD",
    type: "Credit Facility",
    amount: "Up to ₹3 Lakh",
    eligibility: "Farmers with land records",
    status: "Active",
    deadline: "Apply anytime",
    description: "Short-term credit for crop cultivation and other agriculture needs at subsidized interest rates with flexible repayment options.",
    benefits: ["7% interest rate", "Flexible repayment", "Insurance coverage", "Quick approval"],
    documents: ["Land Records", "Aadhaar Card", "Passport Photo", "Income Proof"],
    eligible: true,
    category: "Central"
  },
  {
    id: 12,
    name: "Soil Health Card Scheme",
    department: "Ministry of Agriculture & Farmers Welfare",
    type: "Soil Testing Service",
    amount: "Free",
    eligibility: "All farmers",
    status: "Active",
    deadline: "Ongoing",
    description: "Free soil testing and health card to help farmers improve productivity through proper fertilizer usage and soil management.",
    benefits: ["Free soil testing", "Detailed nutrient analysis", "Fertilizer recommendations", "Soil health monitoring"],
    documents: ["Aadhaar Card", "Land Details", "Contact Information"],
    eligible: true,
    category: "Central"
  },
];

// State-wise schemes data
const stateSchemes = [
  {
    id: 101,
    name: "Maharashtra Krishi Pump Yojana",
    department: "Maharashtra Agriculture Department",
    type: "Irrigation Support",
    amount: "Up to ₹50,000",
    eligibility: "Maharashtra farmers",
    status: "Active",
    deadline: "March 31, 2025",
    description: "Financial assistance for purchase of agricultural pumps and irrigation equipment for Maharashtra farmers.",
    benefits: ["Subsidy on pumps", "Irrigation support", "Water conservation", "Modern equipment"],
    documents: ["Aadhaar Card", "Land Records", "Bank Account", "Pump Quotation"],
    eligible: true,
    category: "State",
    state: "Maharashtra"
  },
  {
    id: 102,
    name: "Punjab Kisan Credit Card Scheme",
    department: "Punjab Agriculture Department",
    type: "Credit Support",
    amount: "Up to ₹3 Lakh",
    eligibility: "Punjab farmers",
    status: "Active",
    deadline: "December 31, 2024",
    description: "Easy credit facility for Punjab farmers with low interest rates and flexible repayment options.",
    benefits: ["Low interest rates", "Easy credit access", "Flexible repayment", "Quick approval"],
    documents: ["Aadhaar Card", "Land Records", "Income Certificate", "Bank Statements"],
    eligible: true,
    category: "State",
    state: "Punjab"
  },
  {
    id: 103,
    name: "Karnataka Raitha Siri Scheme",
    department: "Karnataka Agriculture Department",
    type: "Crop Insurance",
    amount: "Premium subsidy up to 90%",
    eligibility: "Karnataka farmers",
    status: "Active",
    deadline: "Ongoing",
    description: "Comprehensive crop insurance scheme for Karnataka farmers with high premium subsidy.",
    benefits: ["High premium subsidy", "Comprehensive coverage", "Quick claim settlement", "Weather protection"],
    documents: ["Aadhaar Card", "Land Records", "Crop Details", "Bank Account"],
    eligible: true,
    category: "State",
    state: "Karnataka"
  },
  {
    id: 104,
    name: "Tamil Nadu Chief Minister's Solar Pump Scheme",
    department: "Tamil Nadu Agriculture Department",
    type: "Solar Energy",
    amount: "Up to ₹1 Lakh subsidy",
    eligibility: "Tamil Nadu farmers",
    status: "Active",
    deadline: "March 31, 2025",
    description: "Solar pump installation with high subsidy for Tamil Nadu farmers to reduce electricity costs.",
    benefits: ["High subsidy", "Solar energy", "Cost savings", "Environment friendly"],
    documents: ["Aadhaar Card", "Land Records", "Solar Pump Quotation", "Bank Account"],
    eligible: true,
    category: "State",
    state: "Tamil Nadu"
  },
  {
    id: 105,
    name: "Gujarat Krishi Vikas Yojana",
    department: "Gujarat Agriculture Department",
    type: "Development Support",
    amount: "Up to ₹25,000 per hectare",
    eligibility: "Gujarat farmers",
    status: "Active",
    deadline: "March 31, 2025",
    description: "Comprehensive agricultural development scheme for Gujarat farmers with multiple benefits.",
    benefits: ["Development support", "Modern farming", "Technology adoption", "Infrastructure development"],
    documents: ["Aadhaar Card", "Land Records", "Project Proposal", "Bank Account"],
    eligible: true,
    category: "State",
    state: "Gujarat"
  }
];

// Combine all schemes
const schemes = [...centralSchemes, ...stateSchemes];

// Application data for government schemes from agriwelfare.gov.in
const applications = [
  {
    scheme: "PM-KISAN",
    appliedDate: "Jan 15, 2025",
    status: "Approved",
    amount: "₹2,000",
    nextInstallment: "Feb 2025",
  },
  {
    scheme: "Agriculture Infrastructure Fund",
    appliedDate: "Dec 20, 2024",
    status: "Under Review",
    amount: "₹50,00,000",
    nextInstallment: "-",
  },
  {
    scheme: "PMKSY Irrigation",
    appliedDate: "Nov 10, 2024",
    status: "Approved",
    amount: "₹2,50,000",
    nextInstallment: "-",
  },
  {
    scheme: "ATMA Training",
    appliedDate: "Oct 5, 2024",
    status: "Completed",
    amount: "Free",
    nextInstallment: "-",
  },
  {
    scheme: "AGMARKNET Registration",
    appliedDate: "Sep 15, 2024",
    status: "Active",
    amount: "Free",
    nextInstallment: "-",
  },
  {
    scheme: "Horticulture Development",
    appliedDate: "Dec 5, 2024",
    status: "Processing",
    amount: "₹75,000",
    nextInstallment: "-",
  },
  {
    scheme: "PMFBY Insurance",
    appliedDate: "Aug 20, 2024",
    status: "Active",
    amount: "₹2,400",
    nextInstallment: "-",
  },
  {
    scheme: "Kisan Credit Card",
    appliedDate: "Dec 10, 2024",
    status: "Processing",
    amount: "₹3,00,000",
    nextInstallment: "-",
  },
  {
    scheme: "Soil Health Card",
    appliedDate: "Oct 5, 2024",
    status: "Completed",
    amount: "Free",
    nextInstallment: "-",
  },
];

export function GovernmentSchemes() {
  const [schemesData, setSchemesData] = useState(schemes);
  const [applicationsData, setApplicationsData] = useState(applications);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState(schemes);
  const [activeTab, setActiveTab] = useState("central");

  // Filter schemes based on search, type, state, and tab
  useEffect(() => {
    let filtered = schemesData;

    // Filter by tab (Central or State)
    if (activeTab === "central") {
      filtered = filtered.filter(scheme => scheme.category === "Central");
    } else if (activeTab === "state") {
      filtered = filtered.filter(scheme => scheme.category === "State");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(scheme =>
        scheme.type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    // Filter by state
    if (stateFilter !== "all") {
      filtered = filtered.filter(scheme =>
        scheme.department.toLowerCase().includes(stateFilter.toLowerCase()) ||
        scheme.name.toLowerCase().includes(stateFilter.toLowerCase()) ||
        (scheme.state && scheme.state.toLowerCase().includes(stateFilter.toLowerCase()))
      );
    }

    setFilteredSchemes(filtered);
  }, [schemesData, searchTerm, typeFilter, stateFilter, activeTab]);

  const knownStates = [
    'Maharashtra','Punjab','Tamil Nadu','Karnataka','Gujarat','Uttar Pradesh','Bihar','West Bengal','Rajasthan','Madhya Pradesh','Andhra Pradesh','Telangana','Kerala','Odisha','Assam','Jharkhand','Chhattisgarh','Haryana','Delhi','Himachal Pradesh','Uttarakhand','Jammu and Kashmir','Ladakh','Goa','Sikkim','Manipur','Meghalaya','Mizoram','Nagaland','Tripura','Arunachal Pradesh'
  ];

  const detectState = (text: string, states: string[]) => {
    if (!text) return "";
    const lower = text.toLowerCase();
    return states.find((state) => lower.includes(state.toLowerCase())) || "";
  };

  const categorizeType = (payload: { name?: string; description?: string; eligibility?: string }) => {
    const blob = `${payload.name || ""} ${payload.description || ""} ${payload.eligibility || ""}`.toLowerCase();
    if (blob.match(/insurance|bima/)) return "crop insurance";
    if (blob.match(/loan|credit|finance|kcc/)) return "credit facility";
    if (blob.match(/irrigation|water|drip|sprinkler/)) return "irrigation development";
    if (blob.match(/pump|solar|infrastructure|construction|renovation/)) return "infrastructure development";
    if (blob.match(/direct benefit|dbt|income support|investment support|transfer/)) return "direct benefit transfer";
    if (blob.match(/registration|certificate/)) return "registration service";
    if (blob.match(/soil/)) return "soil testing service";
    return "development support";
  };

  // Fetch real government schemes data
  useEffect(() => {
    const fetchSchemesData = async () => {
      try {
        // Fetch real data from backend
        const [schemesRes, statesRes] = await Promise.all([
          apiService.getGovernmentSchemes(),
          apiService.getAvailableStates()
        ]);

        const stateChoices = statesRes.success && Array.isArray(statesRes.data) && statesRes.data.length > 0
          ? statesRes.data
          : knownStates;

        if (schemesRes.success && Array.isArray(schemesRes.data)) {
          // Map API fields to UI schema
          const mapped = schemesRes.data.map((item: any) => ({
            id: item.id ?? item.scheme_id ?? Math.random(),
            name: item.scheme_name ?? item.name ?? "Scheme",
            department: item.ministry ?? item.department ?? "",
            type: categorizeType({ name: item.scheme_name, description: item.description, eligibility: item.eligibility }),
            amount: "",
            eligibility: item.eligibility ? String(item.eligibility) : "",
            status: "Active",
            deadline: "",
            description: item.description ?? "",
            benefits: [],
            documents: [],
            eligible: true,
            // Derive state from ministry/scheme/eligibility; fall back to region flag
            state: detectState(
              `${item.ministry || ""} ${item.scheme_name || ""} ${item.eligibility || ""} ${item.description || ""}`,
              stateChoices
            ),
            category: (() => {
              const region = (item.region || "").toLowerCase();
              const derivedState = detectState(
                `${item.ministry || ""} ${item.scheme_name || ""} ${item.eligibility || ""} ${item.description || ""}`,
                stateChoices
              );
              if (derivedState) return "State";
              if (region.includes("state")) return "State";
              return "Central";
            })()
          }));

          setSchemesData(mapped);
        } else {
          // Fallback to local mock
          setSchemesData(schemes);
        }

        setAvailableStates(stateChoices);

        // Demo applications remain static for now
        setApplicationsData(applications);
      } catch (error) {
        console.error('Schemes fetch failed, using mock data', error);
        setSchemesData(schemes);
        setApplicationsData(applications);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemesData();
  }, []);

  console.log('GovernmentSchemes component rendering, isLoading:', isLoading, 'schemesData length:', schemesData.length);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading government schemes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-2 sm:p-4 lg:p-8 max-w-[1600px] mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Government Schemes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore and apply for government schemes and subsidies
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-2xl mb-1 font-bold">24</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Available Schemes</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-2xl mb-1 font-bold">18</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Eligible For You</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-2xl mb-1 font-bold">3</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Applications Pending</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-2xl mb-1 font-bold">₹8,000</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Benefits Received</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="browse" className="mb-4 sm:mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="browse" className="text-xs sm:text-sm">Browse Schemes</TabsTrigger>
            <TabsTrigger value="applications" className="text-xs sm:text-sm">My Applications</TabsTrigger>
            <TabsTrigger value="eligibility" className="text-xs sm:text-sm">Check Eligibility</TabsTrigger>
          </TabsList>

          {/* Browse Schemes Tab */}
          <TabsContent value="browse">
            {/* Central/State Tabs */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold">
                    {activeTab === "central" ? "Central Government Schemes" : "State-wise Schemes"}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {activeTab === "central" 
                      ? "National schemes by Ministry of Agriculture & Farmers Welfare" 
                      : "State-specific agricultural schemes and programs"
                    }
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {filteredSchemes.length} schemes available
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="central" className="text-xs sm:text-sm">Central Schemes</TabsTrigger>
                  <TabsTrigger value="state" className="text-xs sm:text-sm">State-wise Schemes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Filters */}
            <div className="mb-4 sm:mb-6">
              <Card>
                <CardContent className="p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search schemes..." 
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="direct benefit transfer">Direct Benefit Transfer</SelectItem>
                          <SelectItem value="infrastructure development">Infrastructure Development</SelectItem>
                          <SelectItem value="irrigation development">Irrigation Development</SelectItem>
                          <SelectItem value="technology transfer">Technology Transfer</SelectItem>
                          <SelectItem value="market information">Market Information</SelectItem>
                          <SelectItem value="benefit transfer">Benefit Transfer</SelectItem>
                          <SelectItem value="development support">Development Support</SelectItem>
                          <SelectItem value="registration service">Registration Service</SelectItem>
                          <SelectItem value="import/export service">Import/Export Service</SelectItem>
                          <SelectItem value="crop insurance">Crop Insurance</SelectItem>
                          <SelectItem value="credit facility">Credit Facility</SelectItem>
                          <SelectItem value="soil testing service">Soil Testing Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={stateFilter} onValueChange={setStateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          {availableStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setTypeFilter("all");
                          setStateFilter("all");
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Schemes List */}
            <div className="space-y-4">
              {filteredSchemes.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No schemes found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or filters to find relevant schemes.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setTypeFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredSchemes.map((scheme, index) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3>{scheme.name}</h3>
                                {scheme.eligible && (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Eligible
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{scheme.department}</span>
                                <span>•</span>
                                <Badge variant="outline">{scheme.type}</Badge>
                                <span>•</span>
                                <span className="text-primary">{scheme.amount}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">
                            {scheme.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Key Benefits</Label>
                              <ul className="mt-1 space-y-1">
                                {scheme.benefits.slice(0, 2).map((benefit, i) => (
                                  <li key={i} className="text-sm flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Required Documents</Label>
                              <p className="text-sm mt-1">
                                {scheme.documents.length} documents needed
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Application Deadline</Label>
                              <p className="text-sm mt-1">{scheme.deadline}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button className="bg-primary text-primary-foreground">
                              Apply Now
                            </Button>
                            <Button variant="outline">
                              View Details
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download Form
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="applications">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>Track your scheme applications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {applicationsData.map((app, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="mb-1">{app.scheme}</h4>
                            <p className="text-sm text-muted-foreground">
                              Applied on {app.appliedDate}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              app.status === "Approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : app.status === "Processing"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>{" "}
                            <span>{app.amount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Update:</span>{" "}
                            <span>{app.nextInstallment}</span>
                          </div>
                        </div>
                        {app.status === "Processing" && (
                          <div className="mt-3">
                            <Progress value={60} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              Under verification
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm">
                              Keep all documents ready before starting application
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm">
                              Ensure Aadhaar is linked with bank account
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm">
                              Submit applications before deadline for timely processing
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Application Guidelines
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Helpline Numbers
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Download FAQs
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* Eligibility Checker Tab */}
          <TabsContent value="eligibility">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Check Your Eligibility</CardTitle>
                    <CardDescription>
                      Answer a few questions to find schemes you qualify for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Land Ownership</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">Own Land</SelectItem>
                          <SelectItem value="lease">Leased Land</SelectItem>
                          <SelectItem value="tenant">Tenant Farmer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Land Size (acres)</Label>
                      <Input type="number" placeholder="Enter land size" />
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Crop</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="rice">Rice</SelectItem>
                          <SelectItem value="corn">Corn</SelectItem>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Annual Income</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Below ₹2 Lakh</SelectItem>
                          <SelectItem value="medium">₹2-5 Lakh</SelectItem>
                          <SelectItem value="high">Above ₹5 Lakh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full bg-primary text-primary-foreground">
                      Check Eligibility
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Eligible Schemes</CardTitle>
                    <CardDescription>Based on your profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-green-900">PM-KISAN</h4>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700 mb-2">
                        You are eligible for ₹6,000/year direct benefit
                      </p>
                      <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                        Apply Now
                      </Button>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-green-900">Kisan Credit Card</h4>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700 mb-2">
                        Credit facility up to ₹3 Lakh at 7% interest
                      </p>
                      <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                        Apply Now
                      </Button>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-green-900">PMFBY Crop Insurance</h4>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700 mb-2">
                        Protect your crops with 2% premium
                      </p>
                      <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                        Apply Now
                      </Button>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-amber-900">PM Kusum</h4>
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="text-sm text-amber-700 mb-2">
                        Additional documentation required
                      </p>
                      <Button size="sm" variant="outline">
                        View Requirements
                      </Button>
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