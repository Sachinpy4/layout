import api, { apiRequest } from '@/lib/api';
import { 
  Exhibition, 
  ExhibitionWithLayout, 
  ExhibitionListParams, 
  ExhibitionListResponse, 
  Layout,
  StallType,
  ExhibitionSpace,
  ExhibitionHall,
  Stall
} from '@/types/exhibition';

// Transform nested backend layout to flat frontend layout
function transformBackendLayoutToFrontend(backendLayout: any, stallTypes: StallType[] = [], exhibition?: Exhibition): Layout {
  const spaces: ExhibitionSpace[] = [];
  const halls: ExhibitionHall[] = [];
  const stalls: Stall[] = [];

  // Helper function to calculate stall price
  const calculateStallPrice = (stall: any, stallTypes: StallType[], exhibition?: Exhibition): { basePrice: number; totalPrice: number } => {
    const stallType = stallTypes.find(st => st._id === (stall.stallType || stall.stallTypeId));
    if (!stallType) {
      return { basePrice: 0, totalPrice: 0 };
    }

    // CRITICAL FIX: Use exhibition's custom stall rates instead of stall type default rate
    let rate = 0;
    if (exhibition?.stallRates && exhibition.stallRates.length > 0) {
      // Find the custom rate for this stall type from exhibition configuration
      const customRate = exhibition.stallRates.find(sr => {
        const stallTypeId = typeof sr.stallTypeId === 'string' ? sr.stallTypeId : sr.stallTypeId;
        return stallTypeId === stallType._id;
      });
      rate = customRate ? customRate.rate : 0;
      console.log(`🎯 Using exhibition custom rate for ${stallType.name}: ₹${rate}/sqm (from stallRates config)`);
    } else {
      // Fallback to stall type default rate if no custom rates configured
      rate = stallType.basePrice || stallType.defaultRate || 0;
      console.log(`⚠️ Using stall type default rate for ${stallType.name}: ₹${rate} (no custom rates configured)`);
    }
    
    const rateType = stallType.rateType || 'per_sqm'; // Default to per_sqm for exhibition custom rates

    // CRITICAL FIX: Backend dimensions are already in meters (following demo-src pattern)
    // No conversion needed - stall.size.width/height are already in meters
    const stallDimensions = stall.dimensions || stall.size || { width: 1, height: 1 };
    const widthInMeters = stallDimensions.width || 1;
    const heightInMeters = stallDimensions.height || 1;
    const areaInSqm = Math.max(0.1, widthInMeters * heightInMeters);

    let basePrice = 0;
    if (exhibition?.stallRates && exhibition.stallRates.length > 0) {
      // Exhibition has custom rates - always treat as per_sqm
      basePrice = rate * areaInSqm;
    } else {
      // Fallback to stall type rate calculation
      switch (rateType) {
        case 'per_sqm':
          basePrice = rate * areaInSqm;
          break;
        case 'per_stall':
          basePrice = rate;
          break;
        case 'per_day':
          // For now, assume 1 day. This could be made configurable
          basePrice = rate;
          break;
        default:
          basePrice = rate;
      }
    }

    // Round to nearest currency unit
    basePrice = Math.round(basePrice * 100) / 100;
    const totalPrice = basePrice; // For now, no additional charges

    return { basePrice, totalPrice };
  };

  // Process spaces and extract nested halls/stalls into flat arrays
  if (backendLayout.spaces && Array.isArray(backendLayout.spaces)) {
    backendLayout.spaces.forEach((space: any) => {
      // Add space to flat array
      spaces.push({
        _id: space.id || space._id,
        name: space.name || 'Main Exhibition Space',
        width: space.size?.width || space.width || 800,
        height: space.size?.height || space.height || 600,
        canvasSettings: {
          zoom: backendLayout.canvas?.zoom?.current || 1,
          panX: space.transform?.x || 0,
          panY: space.transform?.y || 0,
        }
      });

      // Process halls within this space
      if (space.halls && Array.isArray(space.halls)) {
        space.halls.forEach((hall: any) => {
          const hallId = hall.id || hall._id;
          
          // Add hall to flat array
          halls.push({
            _id: hallId,
            name: hall.name,
            spaceId: space.id || space._id,
            position: {
              x: hall.transform?.x || hall.x || 0,
              y: hall.transform?.y || hall.y || 0,
            },
            size: {
              width: hall.size?.width || hall.width || 200,
              height: hall.size?.height || hall.height || 150,
            },
            color: hall.color || '#f6ffed', // Use admin panel default hall color
            stallCount: hall.stalls?.length || 0,
            availableStalls: hall.stalls?.filter((s: any) => s.status === 'available').length || 0,
          });



          // Process stalls within this hall
          if (hall.stalls && Array.isArray(hall.stalls)) {
            hall.stalls.forEach((stall: any) => {
              // CRITICAL: Backend now properly sets dimensions in meters
              // Use the dimensions field if available, otherwise convert from size
              const dimensionsInMeters = stall.dimensions || {
                width: (stall.size?.width || 50) / 50, // Convert pixels to meters if no dimensions
                height: (stall.size?.height || 50) / 50,
                shapeType: 'rectangle' as const
              };
              
              // Calculate proper pricing based on stall type and dimensions
              const pricing = calculateStallPrice(stall, stallTypes, exhibition);
              
              // Get the stall type to include rate information
              const stallType = stallTypes.find(st => st._id === (stall.stallType || stall.stallTypeId));
              
              // CRITICAL FIX: Use exhibition's custom stall rate instead of stall type default rate
              let rate = 0;
              let ratePerSqm = 0;
              
              if (exhibition?.stallRates && exhibition.stallRates.length > 0 && stallType) {
                // Find the custom rate for this stall type from exhibition configuration
                const customRate = exhibition.stallRates.find(sr => {
                  const stallTypeId = typeof sr.stallTypeId === 'string' ? sr.stallTypeId : sr.stallTypeId;
                  return stallTypeId === stallType._id;
                });
                
                if (customRate) {
                  rate = customRate.rate;
                  ratePerSqm = customRate.rate; // Exhibition custom rates are always per_sqm
                  console.log(`✅ Applied exhibition custom rate for stall ${stall.number} (${stallType.name}): ₹${rate}/sqm`);
                } else {
                  // Stall type not configured in exhibition, use default
                  rate = stallType.basePrice || stallType.defaultRate || 0;
                  const rateType = stallType.rateType || 'per_stall';
                  const stallArea = dimensionsInMeters.width * dimensionsInMeters.height;
                  
                  if (rateType === 'per_sqm') {
                    ratePerSqm = rate;
                  } else if (rateType === 'per_stall' && stallArea > 0) {
                    ratePerSqm = rate / stallArea;
                  } else {
                    ratePerSqm = rate;
                  }
                  console.log(`⚠️ Using stall type default rate for stall ${stall.number} (${stallType.name}): ₹${ratePerSqm}/sqm`);
                }
              } else {
                // No exhibition custom rates, use stall type default rate
                rate = stallType ? (stallType.basePrice || stallType.defaultRate || 0) : 0;
                const rateType = stallType ? (stallType.rateType || 'per_stall') : 'per_stall';
                const stallArea = dimensionsInMeters.width * dimensionsInMeters.height;
                
                if (rateType === 'per_sqm') {
                  ratePerSqm = rate;
                } else if (rateType === 'per_stall' && stallArea > 0) {
                  ratePerSqm = rate / stallArea;
                } else {
                  ratePerSqm = rate;
                }
              }
              
              const stallData: any = {
                _id: stall.id || stall._id,
                stallNumber: stall.number || stall.stallNumber,
                hallId: hallId,
                stallTypeId: stall.stallType || stall.stallTypeId || '',
                position: {
                  x: stall.transform?.x || stall.x || 0,
                  y: stall.transform?.y || stall.y || 0,
                },
                size: {
                  width: stall.size?.width || stall.width || 50,
                  height: stall.size?.height || stall.height || 50,
                },
                dimensions: dimensionsInMeters, // CRITICAL: Demo-src pattern dimensions for calculation
                ratePerSqm: Math.round(ratePerSqm * 100) / 100, // Use calculated rate per sqm from exhibition config
                basePrice: pricing.basePrice,
                totalPrice: pricing.totalPrice,
                isBooked: stall.status === 'booked' || stall.isBooked || false,
                bookedBy: stall.bookedBy,
                status: stall.status || 'available',
              };
              
              // Add stallType information for display
              if (stallType) {
                stallData.stallType = {
                  _id: stallType._id,
                  name: stallType.name,
                  category: stallType.category,
                  color: stallType.color
                };
              }
              
              // Fallback to backend-provided stallType info if available  
              stallData.stallTypeName = stall.stallTypeName || stallType?.name;
              
              stalls.push(stallData);
            });
          }
        });
      }
    });
  }

  return {
    _id: backendLayout._id || backendLayout.id,
    exhibitionId: backendLayout.exhibitionId,
    spaces,
    halls,
    stalls,
    version: backendLayout.version || 1,
    isActive: backendLayout.isActive ?? true,
    createdAt: backendLayout.createdAt || new Date().toISOString(),
    updatedAt: backendLayout.updatedAt || new Date().toISOString(),
  };
}

export class ExhibitionService {
  
  // Get list of exhibitions with pagination and filtering
  static async getExhibitions(params: ExhibitionListParams = {}): Promise<ExhibitionListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/exhibitions?${queryParams.toString()}`;

    const response = await apiRequest<ExhibitionListResponse>(() =>
      api.get(url)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch exhibitions');
  }

  // Get active exhibitions only
  static async getActiveExhibitions(): Promise<Exhibition[]> {
    const response = await apiRequest<Exhibition[]>(() =>
      api.get('/exhibitions?status=published&isActive=true')
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch active exhibitions');
  }

  // Get exhibition by ID
  static async getExhibitionById(id: string): Promise<Exhibition> {
    const response = await apiRequest<Exhibition>(() =>
      api.get(`/exhibitions/${id}`)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch exhibition details');
  }

  // Get exhibition with layout and stall types
  static async getExhibitionWithLayout(id: string): Promise<ExhibitionWithLayout> {
    const response = await apiRequest<ExhibitionWithLayout>(() =>
      api.get(`/exhibitions/${id}/full`)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch exhibition with layout');
  }

  // Get exhibition layout
  static async getExhibitionLayout(exhibitionId: string, stallTypes?: StallType[], exhibition?: Exhibition): Promise<Layout> {
    try {
      const response = await apiRequest<any>(() =>
        api.get(`/layout/exhibition/${exhibitionId}`)
      );

      if (response.success && response.data) {
        // If stallTypes not provided, fetch them for price calculation
        let stallTypesForCalculation = stallTypes;
        if (!stallTypesForCalculation) {
          try {
            stallTypesForCalculation = await this.getStallTypes(exhibitionId);
          } catch (error) {
            console.warn('⚠️ Could not fetch stall types for price calculation:', error);
            stallTypesForCalculation = [];
          }
        }
        
        // If exhibition not provided, fetch it for stall rates calculation
        let exhibitionData = exhibition;
        if (!exhibitionData) {
          try {
            exhibitionData = await this.getExhibitionById(exhibitionId);
            console.log('📊 Fetched exhibition data for stall rates:', exhibitionData.stallRates?.length || 0, 'custom rates configured');
          } catch (error) {
            console.warn('⚠️ Could not fetch exhibition data for stall rates:', error);
            exhibitionData = undefined;
          }
        }
        
        // Transform nested backend format to flat frontend format with price calculation
        return transformBackendLayoutToFrontend(response.data, stallTypesForCalculation, exhibitionData);
      }

      throw new Error(response.error || 'Failed to fetch exhibition layout');
    } catch (error: any) {
      // If layout doesn't exist, return a default empty layout
      if (error.message?.includes('Layout not found') || error.message?.includes('404')) {
        console.warn(`No layout found for exhibition ${exhibitionId}, returning empty layout`);
        return {
          _id: 'default',
          exhibitionId,
          spaces: [],
          halls: [],
          stalls: [],
          version: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      throw error;
    }
  }

  // Get stall types for an exhibition
  static async getStallTypes(exhibitionId: string): Promise<StallType[]> {
    const response = await apiRequest<StallType[]>(() =>
      api.get(`/stall-types?exhibitionId=${exhibitionId}`)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch stall types');
  }

  // Get available stalls for an exhibition
  static async getAvailableStalls(exhibitionId: string): Promise<any[]> {
    const response = await apiRequest<any[]>(() =>
      api.get(`/stalls/available?exhibitionId=${exhibitionId}`)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch available stalls');
  }

  // Search exhibitions
  static async searchExhibitions(query: string, filters: Partial<ExhibitionListParams> = {}): Promise<Exhibition[]> {
    const params = {
      search: query,
      status: 'published' as const,
      isActive: true,
      ...filters
    };

    const result = await this.getExhibitions(params);
    return result.exhibitions;
  }

  // Get exhibitions by venue
  static async getExhibitionsByVenue(venue: string): Promise<Exhibition[]> {
    const response = await apiRequest<Exhibition[]>(() =>
      api.get(`/exhibitions?venue=${encodeURIComponent(venue)}&status=published&isActive=true`)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch exhibitions by venue');
  }

  // Get upcoming exhibitions
  static async getUpcomingExhibitions(limit: number = 10): Promise<Exhibition[]> {
    const response = await apiRequest<Exhibition[]>(() =>
      api.get(`/exhibitions/upcoming?limit=${limit}`)
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch upcoming exhibitions');
  }
} 