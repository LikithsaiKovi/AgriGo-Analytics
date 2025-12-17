import React from "react";
import {
  LayoutDashboard,
  Cloud,
  Sprout,
  LineChart,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Building2,
  LogOut,
} from "lucide-react";
import { cn } from "./ui/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "./ui/button";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: "dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { id: "weather", label: t("sidebar.weather"), icon: Cloud },
    { id: "soil", label: t("sidebar.soil"), icon: Sprout },
    { id: "crop", label: t("sidebar.crop"), icon: LineChart },
    { id: "market", label: t("sidebar.market"), icon: TrendingUp },
    { id: "financial", label: t("sidebar.financial"), icon: DollarSign },
    { id: "community", label: t("sidebar.community"), icon: Users },
    { id: "government", label: t("sidebar.government"), icon: Building2 },
    { id: "reports", label: t("sidebar.reports"), icon: FileText },
  ];
  
  return (
    <aside className="w-48 sm:w-56 lg:w-64 border-r bg-sidebar h-[calc(100vh-3rem)] sm:h-[calc(100vh-4rem)] sticky top-12 sm:top-16 overflow-y-auto flex flex-col">
      <div className="p-2 sm:p-4 border-b">
        <LanguageSelector />
      </div>
      <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Sign Out Button at Bottom */}
      {onLogout && (
        <div className="p-2 sm:p-4 border-t">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground text-xs sm:text-sm"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">{t("navbar.logout")}</span>
          </Button>
        </div>
      )}
    </aside>
  );
}
