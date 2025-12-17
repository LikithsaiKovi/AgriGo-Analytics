import React, { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { WeatherMapPage } from "./components/WeatherMapPage";
import { SoilHealthPage } from "./components/SoilHealthPage";
import { CropAnalyticsPage } from "./components/CropAnalyticsPage";
import { MarketTrendsPage } from "./components/MarketTrendsPage";
import { ReportsPage } from "./components/ReportsPage";
import { FinancialPlanning } from "./components/FinancialPlanning";
import { FarmerCommunity } from "./components/FarmerCommunity";
import { GovernmentSchemes } from "./components/GovernmentSchemes";
import { TestGovernmentSchemes } from "./components/TestGovernmentSchemes";
import { Toaster } from "./components/ui/sonner";
import { LanguageProvider } from "./contexts/LanguageContext";
import { LanguageSelector } from "./components/LanguageSelector";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return (
      <LanguageProvider>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </LanguageProvider>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "weather":
        return <WeatherMapPage />;
      case "soil":
        return <SoilHealthPage />;
      case "crop":
        return <CropAnalyticsPage />;
      case "market":
        return <MarketTrendsPage />;
      case "financial":
        return <FinancialPlanning />;
      case "community":
        return <FarmerCommunity />;
      case "government":
        return <GovernmentSchemes />;
      case "reports":
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
          {renderPage()}
        </div>
        <Toaster />
      </div>
    </LanguageProvider>
  );
}
