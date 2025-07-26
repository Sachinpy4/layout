export interface SystemSettings {
  siteName: string;
  headerLogo?: string;
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications?: boolean;
  newBookingAlerts?: boolean;
  paymentNotifications?: boolean;
  systemAlerts?: boolean;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemSettingsResponse {
  success: boolean;
  message: string;
  data: SystemSettings;
} 