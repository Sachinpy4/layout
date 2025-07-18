import { Exhibition } from '../../../../types/index';

export type LayoutToolType = 'select' | 'space' | 'hall' | 'stall' | 'fixture' | 'pan' | 'zoom';
export type ViewMode = 'selection' | 'space' | 'hall' | 'stall' | 'fixture';

export interface ExhibitionSpace {
  id: string;
  name: string;
  widthSqm: number;
  heightSqm: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  halls: Hall[];
}

export interface Hall {
  id: string;
  spaceId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widthSqm: number;  // Dimensions in meters
  heightSqm: number; // Dimensions in meters
  color: string;
  description?: string;
  stalls: Stall[];
}

export interface Stall {
  id: string;
  hallId: string;
  number: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widthSqm: number;   // Dimensions in meters
  heightSqm: number;  // Dimensions in meters
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  color: string;
  type?: 'standard' | 'premium' | 'corner' | 'island' | 'food' | 'meeting' | string;
  stallType?: string; // ObjectId reference to StallType from database
  price: number;      // Price per event in USD
  description?: string;
}

export interface Fixture {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  zIndex?: number;
}

export interface LayoutData {
  id: string;
  exhibitionId: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  gridSize: number;
  showGrid: boolean;
  zoom: number;
  pixelsPerSqm: number;
  space: ExhibitionSpace | null;
  fixtures: Fixture[];
}

export const createDefaultLayout = (exhibition: Exhibition): LayoutData => ({
  id: `layout-${exhibition.id}`,
  exhibitionId: exhibition.id,
  canvasWidth: 1200,
  canvasHeight: 800,
  backgroundColor: '#fafafa',
  gridSize: 50,
  showGrid: true,
  zoom: 1.0,
  pixelsPerSqm: 50,
  space: null,
  fixtures: []
}); 