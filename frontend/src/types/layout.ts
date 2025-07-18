import { Layout, Stall, ExhibitionHall, ExhibitionSpace, StallType } from './exhibition';

// Canvas viewport and interaction types
export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// Stall selection and booking types
export interface SelectedStall extends Stall {
  stallType: StallType;
  hallName: string;
}

export interface StallSelection {
  stallId: string;
  stall: SelectedStall;
  selected: boolean;
}

export interface BookingCalculation {
  selectedStalls: SelectedStall[];
  subtotal: number;
  taxes: number;
  total: number;
  breakdown: {
    stallId: string;
    stallNumber: string;
    stallType: string;
    basePrice: number;
    finalPrice: number;
  }[];
}

// Layout rendering types
export interface LayoutRenderData {
  layout: Layout;
  spaces: ExhibitionSpace[];
  halls: ExhibitionHall[];
  stalls: Stall[];
  stallTypes: StallType[];
  selectedStalls: Set<string>;
  hoveredStall: string | null;
}

export interface StallRenderInfo {
  stall: Stall;
  stallType: StallType;
  hall: ExhibitionHall;
  isSelected: boolean;
  isHovered: boolean;
  isAvailable: boolean;
  displayPosition: CanvasPoint;
  displaySize: { width: number; height: number };
}

// Canvas interaction types
export interface CanvasInteraction {
  type: 'click' | 'hover' | 'drag' | 'zoom';
  position: CanvasPoint;
  stallId?: string;
  target?: 'stall' | 'hall' | 'space' | 'background';
}

export interface LayoutControls {
  canZoomIn: boolean;
  canZoomOut: boolean;
  canReset: boolean;
  zoomLevel: number;
  minZoom: number;
  maxZoom: number;
}

// Layout viewer state
export interface LayoutViewerState {
  layout: Layout | null;
  stallTypes: StallType[];
  viewport: CanvasViewport;
  selectedStalls: Map<string, SelectedStall>;
  hoveredStall: string | null;
  loading: boolean;
  error: string | null;
  showBookingSummary: boolean;
  filters: {
    stallType: string | null;
    priceRange: [number, number] | null;
    availableOnly: boolean;
  };
}

// Action types for state management
export type LayoutViewerAction =
  | { type: 'SET_LAYOUT'; payload: Layout }
  | { type: 'SET_STALL_TYPES'; payload: StallType[] }
  | { type: 'SET_VIEWPORT'; payload: Partial<CanvasViewport> }
  | { type: 'SELECT_STALL'; payload: SelectedStall }
  | { type: 'DESELECT_STALL'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_HOVERED_STALL'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_BOOKING_SUMMARY' }
  | { type: 'SET_FILTERS'; payload: Partial<LayoutViewerState['filters']> };

// Export utility types
export interface LayoutExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'pdf';
  quality: number;
  includeSelection: boolean;
  includeLabels: boolean;
  scale: number;
}

export interface LayoutShareData {
  exhibitionId: string;
  selectedStalls: string[];
  viewport: CanvasViewport;
  shareUrl: string;
} 