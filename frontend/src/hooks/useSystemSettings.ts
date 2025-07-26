'use client';

import { useState, useEffect } from 'react';
import { SettingsService, PublicSystemSettings } from '@/services/settings.service';

interface UseSystemSettingsReturn {
  settings: PublicSystemSettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSystemSettings = (): UseSystemSettingsReturn => {
  const [settings, setSettings] = useState<PublicSystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSettings = await SettingsService.getPublicSystemSettings();
      setSettings(fetchedSettings);
    } catch (err: any) {
      console.error('Failed to fetch system settings:', err);
      setError(err.message || 'Failed to fetch system settings');
      
      // Set default settings on error to prevent app from breaking
      setSettings({
        siteName: 'ExhibitBook',
        registrationEnabled: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refresh,
  };
}; 