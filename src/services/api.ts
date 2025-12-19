const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Provide helpful error messages and demo fallback
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Return demo data for development
        if (endpoint.includes('/auth/send-otp')) {
          return {
            success: true,
            data: { expiresIn: 600 },
            message: 'Demo mode: OTP sent (simulated)'
          };
        }
        
        if (endpoint.includes('/auth/verify-otp')) {
          return {
            success: true,
            data: {
              token: 'demo-token-' + Date.now(),
              user: {
                email: 'demo@example.com',
                name: 'Demo User',
                farmSize: 100
              }
            }
          };
        }
        
        if (endpoint.includes('/weather/current')) {
          return {
            success: true,
            data: {
              location: 'Demo Location',
              temperature: 25,
              humidity: 65,
              pressure: 1013,
              windSpeed: 5.2,
              description: 'partly cloudy',
              icon: '02d',
              timestamp: new Date().toISOString()
            }
          };
        }
        
        return {
          success: false,
          error: 'Backend server is not running. Please start the server with: cd server && node server.js'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }


  // Authentication methods
  async sendOTP(email: string): Promise<ApiResponse<{ expiresIn: number }>> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<{
    token: string;
    user: {
      email: string;
      name: string;
      farmSize: number;
    };
  }>> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async register(name: string, email: string, farmSize: number): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, farmSize }),
    });
  }

  async verifyRegistration(email: string, otp: string): Promise<ApiResponse<{
    token: string;
    user: {
      email: string;
      name: string;
      farmSize: number;
    };
  }>> {
    return this.request('/auth/verify-registration', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // Soil health
  async submitSoilReading(payload: {
    fieldId: string;
    sensorId: string;
    crop?: string;
    location?: string;
    samplingFreq?: number;
    readings: {
      moisturePct: number;
      tempC: number;
      humidityPct: number;
      ph: number;
      nitrogenPpm?: number;
      phosphorusPpm?: number;
      potassiumPpm?: number;
      organicMatterPct?: number;
      ecDs?: number;
      texture?: { sandPct?: number; siltPct?: number; clayPct?: number };
      timestamp?: string | Date;
    };
  }): Promise<ApiResponse<{ id: string }>> {
    return this.request('/soil/readings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSoilLatest(fieldId: string): Promise<ApiResponse<any>> {
    return this.request(`/soil/latest?fieldId=${encodeURIComponent(fieldId)}`);
  }

  async getSoilTrends(fieldId: string, metric: string, period = '7d'): Promise<ApiResponse<Array<{ timestamp: string; value: number }>>> {
    const params = new URLSearchParams({ fieldId, metric, period });
    return this.request(`/soil/trends?${params.toString()}`);
  }

  async getSoilInsights(fieldId: string): Promise<ApiResponse<{ insights: Array<{ metric: string; severity: string; message: string }>; latest: any }>> {
    return this.request(`/soil/insights?fieldId=${encodeURIComponent(fieldId)}`);
  }

  // Weather methods
  async getCurrentWeather(lat: number, lon: number): Promise<ApiResponse<{
    location: string;
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    description: string;
    icon: string;
    timestamp: string;
  }>> {
    return this.request(`/weather/current?lat=${lat}&lon=${lon}`);
  }

  async getWeatherForecast(lat: number, lon: number): Promise<ApiResponse<Array<{
    datetime: string;
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
    windSpeed: number;
  }>>> {
    return this.request(`/weather/forecast?lat=${lat}&lon=${lon}`);
  }

  // Geocoding for location search
  async getGeocodingData(location: string): Promise<ApiResponse<{
    lat: number;
    lon: number;
    name: string;
    country: string;
  }>> {
    return this.request(`/weather/geocode?q=${encodeURIComponent(location)}`);
  }

  // Get notifications
  async getNotifications(): Promise<ApiResponse<Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
  }>>> {
    return this.request('/notifications');
  }

  // Mark notification as read
  async markNotificationAsRead(id: number): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  // Get crop health data
  async getCropHealthData(): Promise<ApiResponse<Array<{
    date: string;
    health: number;
    yield: number;
  }>>> {
    return this.request('/crop/health');
  }

  // Get market data
  async getMarketData(): Promise<ApiResponse<Array<{
    commodity: string;
    price: number;
    change: number;
    trend: string;
  }>>> {
    return this.request('/market/data');
  }

  // Get market price data
  async getMarketPriceData(): Promise<ApiResponse<Array<{
    month: string;
    wheat: number;
    rice: number;
    corn: number;
  }>>> {
    return this.request('/market/price-data');
  }

  // Get market demand data
  async getMarketDemandData(): Promise<ApiResponse<Array<{
    week: string;
    demand: number;
  }>>> {
    return this.request('/market/demand-data');
  }

  // Financial Planning APIs
  async getFinancialPlan(farmSize: number, cropType: string, season: string): Promise<ApiResponse<{
    totalInvestment: number;
    expectedRevenue: number;
    netProfit: number;
    profitMargin: number;
    breakEvenPoint: number;
    roi: number;
  }>> {
    return this.request(`/financial/plan?farmSize=${farmSize}&cropType=${cropType}&season=${season}`);
  }

  async getLoanOptions(): Promise<ApiResponse<Array<{
    id: string;
    bank: string;
    loanType: string;
    amount: number;
    interestRate: number;
    tenure: number;
    emi: number;
    eligibility: boolean;
    features: string[];
  }>>> {
    return this.request('/financial/loans');
  }

  async getGovernmentSchemes(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    benefit: string;
    eligibility: string[];
    applicationProcess: string[];
    deadline: string;
    status: string;
  }>>> {
    return this.request('/financial/schemes');
  }

  async getExpenseBreakdown(farmSize: number, cropType: string): Promise<ApiResponse<Array<{
    category: string;
    amount: number;
    percentage: number;
  }>>> {
    return this.request(`/financial/expenses?farmSize=${farmSize}&cropType=${cropType}`);
  }

  // Community APIs
  async getCommunityPosts(): Promise<ApiResponse<Array<{
    id: string;
    author: {
      name: string;
      avatar: string;
      location: string;
      experience: string;
      rating: number;
    };
    title: string;
    content: string;
    images: string[];
    category: string;
    tags: string[];
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    isLiked: boolean;
  }>>> {
    return this.request('/community/posts');
  }

  async getCommunityGroups(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
    category: string;
    isJoined: boolean;
    lastActivity: string;
  }>>> {
    return this.request('/community/groups');
  }

  async getCommunityExperts(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    specialization: string;
    experience: string;
    rating: number;
    consultationFee: number;
    isAvailable: boolean;
  }>>> {
    return this.request('/community/experts');
  }

  async createCommunityPost(post: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }): Promise<ApiResponse<{ success: boolean; postId: string }>> {
    return this.request('/community/posts', {
      method: 'POST',
      body: JSON.stringify(post)
    });
  }

  async likePost(postId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/community/posts/${postId}/like`, { method: 'POST' });
  }

  // Government Schemes APIs
  async getSchemeApplications(): Promise<ApiResponse<Array<{
    id: string;
    schemeId: string;
    schemeName: string;
    applicantName: string;
    applicationDate: string;
    status: string;
    documents: string[];
    remarks: string;
  }>>> {
    return this.request('/government/applications');
  }

  async applyForScheme(schemeId: string, applicationData: {
    applicantName: string;
    documents: string[];
  }): Promise<ApiResponse<{ success: boolean; applicationId: string }>> {
    return this.request(`/government/schemes/${schemeId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async downloadSchemeForm(schemeId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request(`/government/schemes/${schemeId}/form`);
  }

  // Real Government Schemes APIs (integrated with Python fetcher)
  async getGovernmentSchemes(region?: string, ministry?: string): Promise<ApiResponse<Array<{
    id: number;
    scheme_id: string;
    scheme_name: string;
    description: string;
    ministry: string;
    start_date: string;
    eligibility: string;
    region: string;
    last_updated: string;
    created_at: string;
    updated_at: string;
  }>>> {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (ministry) params.append('ministry', ministry);
    
    const queryString = params.toString();
    return this.request(`/schemes${queryString ? `?${queryString}` : ''}`);
  }

  async getSchemeById(id: number): Promise<ApiResponse<{
    id: number;
    scheme_id: string;
    scheme_name: string;
    description: string;
    ministry: string;
    start_date: string;
    eligibility: string;
    region: string;
    last_updated: string;
    created_at: string;
    updated_at: string;
  }>> {
    return this.request(`/schemes/${id}`);
  }

  async getSchemeStatistics(): Promise<ApiResponse<{
    total_schemes: number;
    central_schemes: number;
    state_schemes: number;
    recently_updated: number;
  }>> {
    return this.request('/schemes/stats');
  }

  async triggerSchemeFetch(): Promise<ApiResponse<{ message: string; output: string }>> {
    return this.request('/schemes/fetch', { method: 'POST' });
  }

  async getAvailableStates(): Promise<ApiResponse<string[]>> {
    return this.request('/schemes/states');
  }

  // Market Data APIs (Real-time commodity prices from various markets)
  async getMarketPrices(commodity?: string, market?: string, state?: string): Promise<ApiResponse<Array<{
    id: number;
    commodity: string;
    market_name: string;
    state: string;
    district: string;
    price: number;
    unit: string;
    date: string;
    last_updated: string;
    created_at: string;
  }>>> {
    const params = new URLSearchParams();
    if (commodity) params.append('commodity', commodity);
    if (market) params.append('market', market);
    if (state) params.append('state', state);
    
    const queryString = params.toString();
    return this.request(`/market/prices${queryString ? `?${queryString}` : ''}`);
  }

  async getMarketTrends(commodity?: string, market?: string): Promise<ApiResponse<Array<{
    id: number;
    commodity: string;
    market_name: string;
    price_today: number;
    price_yesterday: number;
    price_change: number;
    change_percentage: number;
    date: string;
    last_updated: string;
    created_at: string;
  }>>> {
    const params = new URLSearchParams();
    if (commodity) params.append('commodity', commodity);
    if (market) params.append('market', market);
    
    const queryString = params.toString();
    return this.request(`/market/trends${queryString ? `?${queryString}` : ''}`);
  }

  async getMarketDemand(commodity?: string, market?: string): Promise<ApiResponse<Array<{
    id: number;
    commodity: string;
    market_name: string;
    demand_level: string;
    supply_level: string;
    arrival_quantity: number;
    unit: string;
    date: string;
    last_updated: string;
    created_at: string;
  }>>> {
    const params = new URLSearchParams();
    if (commodity) params.append('commodity', commodity);
    if (market) params.append('market', market);
    
    const queryString = params.toString();
    return this.request(`/market/demand${queryString ? `?${queryString}` : ''}`);
  }

  async getMarketStatistics(): Promise<ApiResponse<{
    total_prices: number;
    unique_commodities: number;
    unique_markets: number;
    unique_states: number;
    avg_price: number;
    max_price: number;
    min_price: number;
  }>> {
    return this.request('/market/statistics');
  }

  async triggerMarketDataFetch(): Promise<ApiResponse<{ message: string; output: string }>> {
    return this.request('/market/fetch', { method: 'POST' });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
