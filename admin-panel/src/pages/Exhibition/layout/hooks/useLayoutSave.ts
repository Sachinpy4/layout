import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { App } from 'antd';
import { LayoutService } from '../../../../services/layout.service';
import { LayoutData } from '../types/layout-types';
import { transformFrontendToBackend, testTransformation } from '../utils/data-transformers';

const layoutService = new LayoutService();

export const useLayoutSave = (
  layout: LayoutData | null,
  layoutExistsInBackend: boolean,
  setLayoutExistsInBackend: (exists: boolean) => void
) => {
  const { id } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();

  const handleSave = async () => {
    if (!layout || !id) return;
    
    try {
      setSaving(true);
      
      if (layoutExistsInBackend) {
        // Layout exists in backend, always update
        const backendLayout = transformFrontendToBackend(layout, false);
        await layoutService.update(id, backendLayout);
        message.success('Layout saved successfully');
      } else {
        // Layout doesn't exist in backend, create new one
        const backendLayout = transformFrontendToBackend(layout, true);
        await layoutService.create(id, backendLayout);
        setLayoutExistsInBackend(true);
        message.success('Layout created and saved successfully');
      }
    } catch (error) {
      message.error('Failed to save layout');
      console.error('Error saving layout:', error);
    } finally {
      setSaving(false);
    }
  };

  const autoSave = async (updatedLayout: LayoutData) => {
    if (!id) return;
    
    try {
      if (layoutExistsInBackend) {
        const backendLayout = transformFrontendToBackend(updatedLayout, false);
        console.log('Auto-saving layout update for exhibition:', id);
        await layoutService.update(id, backendLayout);
      } else {
        const backendLayout = transformFrontendToBackend(updatedLayout, true);
        console.log('Auto-saving layout creation for exhibition:', id);
        await layoutService.create(id, backendLayout);
        setLayoutExistsInBackend(true);
      }
    } catch (error: any) {
      console.error('Error auto-saving layout:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // More specific error messages for users
      if (error.response?.status === 400) {
        message.warning('Layout validation failed. Please check your stall and fixture configurations.');
      } else if (error.response?.status === 404) {
        message.warning('Exhibition not found. Please refresh the page.');
      } else {
        message.warning('Auto-save failed. Please save manually.');
      }
    }
  };

  return {
    handleSave,
    autoSave,
    saving
  };
}; 