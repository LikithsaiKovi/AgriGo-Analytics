import { Bell, ChevronDown, User, LogOut, AlertTriangle, Droplets, Cloud, TrendingUp, CheckCircle, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiService } from "../services/api";

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, right: 0 });
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = async (id: number) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, unread: false }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, unread: false }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const toggleNotifications = () => {
    if (!isNotificationOpen && bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setNotificationPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Fetch real-time notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiService.getNotifications();
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <nav className="h-12 sm:h-16 border-b bg-card flex items-center justify-between px-2 sm:px-4 lg:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
          <svg
            width="20"
            height="20"
            className="sm:w-6 sm:h-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              fill="white"
              opacity="0.9"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="hidden sm:block">
          <h2 className="text-sm sm:text-base lg:text-lg text-primary font-bold">{t("app.title")}</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">{t("navbar.platform")}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSelector variant="compact" />
        {/* Custom Notification Panel */}
        <div className="relative overflow-visible" ref={notificationRef}>
          <Button 
            ref={bellButtonRef}
            variant="ghost" 
            size="icon" 
            className="relative h-7 w-7 sm:h-8 sm:w-8"
            onClick={toggleNotifications}
          >
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notification Panel */}
          {isNotificationOpen && createPortal(
            <Card 
              ref={notificationRef}
              className="fixed w-72 sm:w-80 z-50 shadow-lg border max-w-[calc(100vw-1rem)]"
              style={{
                top: `${notificationPosition.top}px`,
                right: `${notificationPosition.right}px`
              }}
            >
              <CardContent className="p-0">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{t("navbar.notifications")}</h4>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="text-xs h-6 px-2"
                        >
                          {t('navbar.mark.all.read')}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsNotificationOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {/* Beautiful sleeping bell illustration */}
                      <div className="relative mb-4">
                        <div className="w-16 h-16 mx-auto relative">
                          {/* Bell body */}
                          <div className="w-12 h-12 bg-red-500 rounded-full mx-auto relative">
                            {/* Bell face */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* Closed eyes */}
                              <div className="flex gap-1">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                            </div>
                            {/* Small mouth */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-white rounded-full"></div>
                          </div>
                          {/* Sleeping cap */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-white rounded-t-full">
                            <div className="absolute -top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          {/* Pillow */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-14 h-4 bg-gray-800 rounded-full"></div>
                          {/* Dream dots */}
                          <div className="absolute top-2 -right-2 w-1 h-1 bg-red-400 rounded-full"></div>
                          <div className="absolute top-4 -right-4 w-1 h-1 bg-orange-400 rounded-full"></div>
                          <div className="absolute top-6 -right-2 w-1 h-1 bg-red-400 rounded-full"></div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">NO NOTIFICATIONS</h3>
                      <p className="text-sm text-gray-500">Clutter cleared! We'll notify you when there is something new</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3">
                      {notifications.map((notification) => {
                        const IconComponent = notification.icon;
                        const getTypeColor = (type: string) => {
                          switch (type) {
                            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                            case 'alert': return 'text-red-600 bg-red-50 border-red-200';
                            case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
                            case 'success': return 'text-green-600 bg-green-50 border-green-200';
                            default: return 'text-gray-600 bg-gray-50 border-gray-200';
                          }
                        };
                        
                        return (
                          <div 
                            key={notification.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                              notification.unread ? 'bg-accent/10' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-1 rounded-full ${getTypeColor(notification.type)}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{notification.title}</p>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>,
            document.body
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1 sm:gap-2 h-8">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm">{user?.name || 'Farmer'}</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="font-semibold text-sm">{user?.name || 'Farmer'}</span>
              {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
              {user?.farmSize !== undefined && (
                <span className="text-xs text-muted-foreground">Farm size: {user.farmSize} acres</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("navbar.profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("navbar.farm")}</DropdownMenuItem>
            <DropdownMenuItem>{t("navbar.subscription")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("navbar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
