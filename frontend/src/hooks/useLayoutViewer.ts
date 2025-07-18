import { useReducer, useCallback, useEffect } from 'react';
import { 
  LayoutViewerState, 
  LayoutViewerAction, 
  SelectedStall, 
  CanvasViewport,
  BookingCalculation 
} from '@/types/layout';
import { Layout, StallType, Stall, ExhibitionHall } from '@/types/exhibition';

// Initial state
const initialState: LayoutViewerState = {
  layout: null,
  stallTypes: [],
  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0,
    width: 800,
    height: 600,
  },
  selectedStalls: new Map(),
  hoveredStall: null,
  loading: false,
  error: null,
  showBookingSummary: false,
  filters: {
    stallType: null,
    priceRange: null,
    availableOnly: true,
  },
};

// Reducer function
function layoutViewerReducer(state: LayoutViewerState, action: LayoutViewerAction): LayoutViewerState {
  switch (action.type) {
    case 'SET_LAYOUT':
      return {
        ...state,
        layout: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_STALL_TYPES':
      return {
        ...state,
        stallTypes: action.payload,
      };

    case 'SET_VIEWPORT':
      return {
        ...state,
        viewport: {
          ...state.viewport,
          ...action.payload,
        },
      };

    case 'SELECT_STALL':
      const newSelectedStalls = new Map(state.selectedStalls);
      newSelectedStalls.set(action.payload._id, action.payload);
      return {
        ...state,
        selectedStalls: newSelectedStalls,
      };

    case 'DESELECT_STALL':
      const updatedSelectedStalls = new Map(state.selectedStalls);
      updatedSelectedStalls.delete(action.payload);
      return {
        ...state,
        selectedStalls: updatedSelectedStalls,
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedStalls: new Map(),
      };

    case 'SET_HOVERED_STALL':
      return {
        ...state,
        hoveredStall: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'TOGGLE_BOOKING_SUMMARY':
      return {
        ...state,
        showBookingSummary: !state.showBookingSummary,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

export function useLayoutViewer() {
  const [state, dispatch] = useReducer(layoutViewerReducer, initialState);

  // Set layout data
  const setLayout = useCallback((layout: Layout) => {
    dispatch({ type: 'SET_LAYOUT', payload: layout });
  }, []);

  // Set stall types
  const setStallTypes = useCallback((stallTypes: StallType[]) => {
    dispatch({ type: 'SET_STALL_TYPES', payload: stallTypes });
  }, []);

  // Viewport controls
  const setViewport = useCallback((viewport: Partial<CanvasViewport>) => {
    dispatch({ type: 'SET_VIEWPORT', payload: viewport });
  }, []);

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(state.viewport.zoom * 1.2, 3);
    dispatch({ type: 'SET_VIEWPORT', payload: { zoom: newZoom } });
  }, [state.viewport.zoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(state.viewport.zoom / 1.2, 0.1);
    dispatch({ type: 'SET_VIEWPORT', payload: { zoom: newZoom } });
  }, [state.viewport.zoom]);

  const resetView = useCallback(() => {
    dispatch({ 
      type: 'SET_VIEWPORT', 
      payload: { 
        zoom: 1, 
        panX: 0, 
        panY: 0 
      } 
    });
  }, []);

  const fitToScreen = useCallback(() => {
    if (!state.layout || state.layout.spaces.length === 0) return;
    
    const space = state.layout.spaces[0];
    const padding = 50; // Add some padding around the layout
    const availableWidth = state.viewport.width - padding * 2;
    const availableHeight = state.viewport.height - padding * 2;
    
    const scaleX = availableWidth / space.width;
    const scaleY = availableHeight / space.height;
    const zoom = Math.min(scaleX, scaleY, 1); // Don't scale beyond 100%
    
    // Center the layout in the viewport
    const scaledWidth = space.width * zoom;
    const scaledHeight = space.height * zoom;
    const panX = (state.viewport.width - scaledWidth) / 2;
    const panY = (state.viewport.height - scaledHeight) / 2;
    
    dispatch({ 
      type: 'SET_VIEWPORT', 
      payload: { 
        zoom, 
        panX, 
        panY 
      } 
    });
  }, [state.layout, state.viewport.width, state.viewport.height]);

  // Stall selection
  const selectStall = useCallback((stall: Stall) => {
    if (!state.layout || stall.isBooked) return;
    
    // Find stall type and hall
    const stallType = state.stallTypes.find(st => st._id === stall.stallTypeId);
    const hall = state.layout.halls.find(h => h._id === stall.hallId);
    
    if (!stallType || !hall) {
      console.warn(`⚠️ Cannot select stall ${stall.stallNumber}: missing stallType (${!stallType}) or hall (${!hall})`);
      return;
    }
    
    const selectedStall: SelectedStall = {
      ...stall,
      stallType,
      hallName: hall.name,
    };
    
    // Debug: Log stall selection with pricing info
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Selected stall ${stall.stallNumber}: ${stallType.name} in ${hall.name} - ₹${stall.totalPrice}`);
    }
    
    dispatch({ type: 'SELECT_STALL', payload: selectedStall });
  }, [state.layout, state.stallTypes]);

  const deselectStall = useCallback((stallId: string) => {
    dispatch({ type: 'DESELECT_STALL', payload: stallId });
  }, []);

  const toggleStallSelection = useCallback((stall: Stall) => {
    if (state.selectedStalls.has(stall._id)) {
      deselectStall(stall._id);
    } else {
      selectStall(stall);
    }
  }, [state.selectedStalls, selectStall, deselectStall]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  // Hover management
  const setHoveredStall = useCallback((stallId: string | null) => {
    dispatch({ type: 'SET_HOVERED_STALL', payload: stallId });
  }, []);

  // Loading and error states
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Filter management
  const setFilters = useCallback((filters: Partial<LayoutViewerState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Booking summary
  const toggleBookingSummary = useCallback(() => {
    dispatch({ type: 'TOGGLE_BOOKING_SUMMARY' });
  }, []);

  // Calculate booking total
  const calculateBooking = useCallback((): BookingCalculation => {
    const selectedStalls = Array.from(state.selectedStalls.values());
    const subtotal = selectedStalls.reduce((sum, stall) => {
      const price = typeof stall.totalPrice === 'number' && !isNaN(stall.totalPrice) ? stall.totalPrice : 0;
      return sum + price;
    }, 0);
    const taxes = subtotal * 0.18; // 18% GST
    const total = subtotal + taxes;
    
    const breakdown = selectedStalls.map(stall => ({
      stallId: stall._id,
      stallNumber: stall.stallNumber,
      stallType: stall.stallType.name,
      basePrice: typeof stall.basePrice === 'number' && !isNaN(stall.basePrice) ? stall.basePrice : 0,
      finalPrice: typeof stall.totalPrice === 'number' && !isNaN(stall.totalPrice) ? stall.totalPrice : 0,
    }));
    
    return {
      selectedStalls,
      subtotal,
      taxes,
      total,
      breakdown,
    };
  }, [state.selectedStalls]);

  // Get filtered stalls
  const getFilteredStalls = useCallback((): Stall[] => {
    if (!state.layout) return [];
    
    let stalls = state.layout.stalls;
    
    // Filter by availability
    if (state.filters.availableOnly) {
      stalls = stalls.filter(stall => stall.status === 'available' && !stall.isBooked);
    }
    
    // Filter by stall type
    if (state.filters.stallType) {
      stalls = stalls.filter(stall => stall.stallTypeId === state.filters.stallType);
    }
    
    // Filter by price range
    if (state.filters.priceRange) {
      const [minPrice, maxPrice] = state.filters.priceRange;
      stalls = stalls.filter(stall => 
        stall.totalPrice >= minPrice && stall.totalPrice <= maxPrice
      );
    }
    
    return stalls;
  }, [state.layout, state.filters]);

  // Check if stall is selectable
  const isStallSelectable = useCallback((stall: Stall): boolean => {
    return stall.status === 'available' && !stall.isBooked;
  }, []);

  return {
    state,
    
    // Layout management
    setLayout,
    setStallTypes,
    
    // Viewport controls
    setViewport,
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
    
    // Stall selection
    selectStall,
    deselectStall,
    toggleStallSelection,
    clearSelection,
    
    // Hover management
    setHoveredStall,
    
    // State management
    setLoading,
    setError,
    setFilters,
    toggleBookingSummary,
    
    // Computed values
    calculateBooking,
    getFilteredStalls,
    isStallSelectable,
    
    // Getters
    selectedStallsArray: Array.from(state.selectedStalls.values()),
    selectedStallsCount: state.selectedStalls.size,
    hasSelection: state.selectedStalls.size > 0,
  };
} 