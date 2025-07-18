import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { exhibitionService } from '../../../../services/exhibition.service';
import { LayoutService } from '../../../../services/layout.service';
import { Exhibition } from '../../../../types/index';
import { LayoutData, createDefaultLayout } from '../types/layout-types';
import { transformBackendToFrontend } from '../utils/data-transformers';

const layoutService = new LayoutService();

export const useLayoutData = () => {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition>({} as Exhibition);
  const [layout, setLayout] = useState<LayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutExistsInBackend, setLayoutExistsInBackend] = useState(false);

  const loadExhibitionAndLayout = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Load exhibition data
      const exhibitionResponse = await exhibitionService.getExhibition(id);
      const exhibitionData = exhibitionResponse.data;
      setExhibition(exhibitionData);

      // Try to load existing layout
      try {
        const layoutResponse = await layoutService.getByExhibitionId(id);
        const layoutData = transformBackendToFrontend(layoutResponse, exhibitionData);
        setLayout(layoutData);
        setLayoutExistsInBackend(true);
      } catch (layoutError) {
        // Layout doesn't exist yet, create a default one
        const defaultLayout = createDefaultLayout(exhibitionData);
        setLayout(defaultLayout);
        setLayoutExistsInBackend(false);
      }
    } catch (error) {
      console.error('Error loading exhibition or layout:', error);
      message.error('Failed to load exhibition data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExhibitionAndLayout();
  }, [id]);

  return {
    exhibition,
    layout,
    setLayout,
    loading,
    layoutExistsInBackend,
    setLayoutExistsInBackend,
    reload: loadExhibitionAndLayout
  };
}; 