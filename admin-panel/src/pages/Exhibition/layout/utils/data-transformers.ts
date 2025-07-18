import { Exhibition } from '../../../../types/index';
import { LayoutData, ExhibitionSpace } from '../types/layout-types';
import { toHexColor } from './color-utils';

// Transformation functions between frontend and backend formats
export const transformBackendToFrontend = (backendLayout: any, exhibition: Exhibition): LayoutData => {
  // Get the first space (frontend assumes single space for now)
  const firstSpace = backendLayout.spaces && backendLayout.spaces.length > 0 ? backendLayout.spaces[0] : null;
  
  let frontendSpace: ExhibitionSpace | null = null;
  if (firstSpace) {
    frontendSpace = {
      id: firstSpace.id,
      name: firstSpace.name,
      widthSqm: firstSpace.size.width / 50, // Convert pixels to square meters (assuming 50px = 1m)
      heightSqm: firstSpace.size.height / 50,
      x: firstSpace.transform.x,
      y: firstSpace.transform.y,
      width: firstSpace.size.width,
      height: firstSpace.size.height,
      color: firstSpace.color,
      halls: firstSpace.halls.map((hall: any) => ({
        id: hall.id,
        spaceId: firstSpace.id,
        name: hall.name,
        x: hall.transform.x,
        y: hall.transform.y,
        width: hall.size.width,
        height: hall.size.height,
        color: hall.color,
        stalls: hall.stalls.map((stall: any) => {
          // Calculate dimensions once and cache
          const widthSqm = stall.widthSqm || Math.round((stall.size.width / 50) * 10) / 10;
          const heightSqm = stall.heightSqm || Math.round((stall.size.height / 50) * 10) / 10;
          
          // Log only once per stall if calculation was needed
          if (!stall.widthSqm || !stall.heightSqm) {
            console.log(`Fixed dimensions for stall ${stall.number}: ${widthSqm}m × ${heightSqm}m`);
          }
          
          return {
            id: stall.id,
            hallId: hall.id,
            number: stall.number,
            x: stall.transform.x,
            y: stall.transform.y,
            width: stall.size.width,
            height: stall.size.height,
            status: stall.status,
            color: stall.color,
            // Map backend stallType to frontend fields
            stallType: stall.stallType,
            type: stall.stallType, // Also map to type for form compatibility
            // Use calculated dimensions
            widthSqm,
            heightSqm,
            price: stall.price || 0,
            description: stall.description || '',
          };
        }),
      })),
    };
  }

  return {
    id: backendLayout.id || `layout-${exhibition.id}`,
    exhibitionId: exhibition.id,
    canvasWidth: backendLayout.canvas.size.width,
    canvasHeight: backendLayout.canvas.size.height,
    backgroundColor: backendLayout.canvas.backgroundColor,
    gridSize: backendLayout.canvas.grid.size,
    showGrid: backendLayout.canvas.grid.enabled,
    zoom: backendLayout.canvas.zoom.current,
    pixelsPerSqm: 50, // Fixed at 50 pixels per square meter
    space: frontendSpace,
    fixtures: backendLayout.fixtures.map((fixture: any) => ({
      id: fixture.id,
      name: fixture.name,
      type: fixture.fixtureType, // This might need adjustment based on fixture type structure
      x: fixture.transform.x,
      y: fixture.transform.y,
      width: fixture.size.width,
      height: fixture.size.height,
      color: fixture.color,
    })),
  };
};

// Test function to verify transformation output
export const testTransformation = (frontendLayout: LayoutData): void => {
  console.log('=== TRANSFORMATION TEST ===');
  console.log('Frontend Layout:', frontendLayout);
  
  const backendData = transformFrontendToBackend(frontendLayout, false);
  console.log('Backend Data (Update):', JSON.stringify(backendData, null, 2));
  
  // Verify structure
  console.log('Validation checks:');
  console.log('- Has canvas:', !!backendData.canvas);
  console.log('- Canvas has required fields:', !!(backendData.canvas?.size && backendData.canvas?.backgroundColor && backendData.canvas?.grid && backendData.canvas?.zoom));
  console.log('- Has spaces:', Array.isArray(backendData.spaces));
  console.log('- Has fixtures:', Array.isArray(backendData.fixtures));
  console.log('- Has settings:', !!backendData.settings);
  
  if (backendData.spaces && backendData.spaces.length > 0) {
    const space = backendData.spaces[0];
    console.log('- Space has required fields:', !!(space.name && space.transform && space.size));
    
    if (space.halls && space.halls.length > 0) {
      const hall = space.halls[0];
      console.log('- Hall has required fields:', !!(hall.name && hall.transform && hall.size));
      
      if (hall.stalls && hall.stalls.length > 0) {
        const stall = hall.stalls[0];
        console.log('- Stall has required fields:', !!(stall.number && stall.transform && stall.size));
        console.log('- Stall has stallTypeId:', !!stall.stallTypeId);
      }
    }
  }
  
  console.log('=== END TRANSFORMATION TEST ===');
};

export const transformFrontendToBackend = (frontendLayout: LayoutData, isCreate: boolean = false): any => {
  const { space } = frontendLayout;
  
  // Helper function to generate unique IDs
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  // Transform spaces with proper validation - only include DTO fields
  const spaces = space ? [{
    id: space.id || generateId(),
    name: space.name || 'Main Exhibition Space',
    description: `Exhibition space of ${space.widthSqm || 0}m × ${space.heightSqm || 0}m`,
    transform: {
      x: space.x || 0,
      y: space.y || 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
    size: {
      width: Math.max(1, space.width || 400),
      height: Math.max(1, space.height || 300),
    },
    color: toHexColor(space.color) || '#E6F7FF',
    borderColor: '#1890FF',
    borderWidth: 2,
    isLocked: false,
    isVisible: true,
    halls: (space.halls || []).map(hall => ({
      id: hall.id || generateId(),
      name: hall.name || 'Unnamed Hall',
      description: `Hall within ${space.name || 'Exhibition Space'}`,
      transform: {
        x: hall.x || 0,
        y: hall.y || 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      size: {
        width: Math.max(1, hall.width || 200),
        height: Math.max(1, hall.height || 150),
      },
      color: toHexColor(hall.color) || '#F6FFED',
      borderColor: '#52C41A',
      borderWidth: 2,
      isLocked: false,
      isVisible: true,
      stalls: (hall.stalls || []).map(stall => {
        const stallData: any = {
          id: stall.id || generateId(),
          number: stall.number || 'S001',
          name: `Stall ${stall.number || 'S001'}`,
          transform: {
            x: stall.x || 0,
            y: stall.y || 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          size: {
            width: Math.max(1, stall.width || 100),
            height: Math.max(1, stall.height || 100),
          },
          status: stall.status || 'available',
          color: toHexColor(stall.color) || '#FFF7E6',
          borderColor: '#FA8C16',
          borderWidth: 1,
          isLocked: false,
          isVisible: true,
          amenities: [],
          // Preserve important stall data fields
          widthSqm: stall.widthSqm,
          heightSqm: stall.heightSqm,
          price: stall.price || 0,
          description: stall.description || '',
        };
        
        // Only include stallTypeId if it has a valid value
        const stallTypeId = stall.stallType || stall.type;
        if (stallTypeId && stallTypeId.trim() !== '') {
          stallData.stallTypeId = stallTypeId;
        }
        
        return stallData;
      }),
    })),
  }] : [];

  // Transform fixtures with proper validation - only include DTO fields
  const fixtures = (frontendLayout.fixtures || []).map(fixture => {
    const fixtureData: any = {
      id: fixture.id || generateId(),
      name: fixture.name || 'Unnamed Fixture',
      transform: {
        x: fixture.x || 0,
        y: fixture.y || 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      size: {
        width: Math.max(1, fixture.width || 50),
        height: Math.max(1, fixture.height || 50),
      },
      color: toHexColor(fixture.color) || '#F9F0FF',
      borderColor: '#722ED1',
      borderWidth: 1,
      isLocked: false,
      isVisible: true,
      properties: {
        type: fixture.type || 'generic',
      },
    };
    
    // Only include fixtureTypeId if it has a valid value
    if (fixture.type && fixture.type.trim() !== '') {
      fixtureData.fixtureTypeId = fixture.type;
    }
    
    return fixtureData;
  });

  // Required canvas settings with proper validation
  const canvas = {
    size: {
      width: Math.max(400, frontendLayout.canvasWidth || 1200),
      height: Math.max(300, frontendLayout.canvasHeight || 800),
    },
    backgroundColor: toHexColor(frontendLayout.backgroundColor) || '#FFFFFF',
    grid: {
      enabled: frontendLayout.showGrid !== false,
      size: Math.max(1, Math.min(100, frontendLayout.gridSize || 20)),
      color: '#E0E0E0',
      opacity: 0.5,
    },
    zoom: {
      min: 0.1,
      max: 5.0,
      default: 1.0,
      current: Math.max(0.1, Math.min(5.0, frontendLayout.zoom || 1.0)),
    },
  };

  // Layout settings with defaults
  const settings = {
    snapToGrid: true,
    showGuides: true,
    autoSave: true,
  };

  const result: any = {
    name: 'Main Layout',
    canvas,
    spaces,
    fixtures,
    settings,
  };

  // Only include exhibitionId when creating (not updating)
  if (isCreate) {
    result.exhibitionId = frontendLayout.exhibitionId;
  }

  return result;
}; 