'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { LayoutControls } from '@/components/layout/LayoutControls';
import { BookingSummary } from '@/components/layout/BookingSummary';
import StallTooltip from '@/components/layout/StallTooltip';
import { getExhibitionUrl } from '../../../../utils/format'; // Added for slug-based URLs

// Dynamically import LayoutCanvas to avoid SSR issues with Konva.js
const LayoutCanvas = dynamic(
  () => import('@/components/layout/LayoutCanvas').then((mod) => ({ default: mod.LayoutCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading layout canvas...</p>
        </div>
      </div>
    ),
  }
);
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLayoutViewer } from '@/hooks/useLayoutViewer';
import { ExhibitionService } from '@/services/exhibition.service';
import { Exhibition, StallType } from '@/types/exhibition';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { useBooking } from '@/contexts/BookingContext';
import { useRouter } from 'next/navigation';

export default function LayoutViewerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-6">
        <LayoutViewer />
      </main>
    </div>
  );
}

function LayoutViewer() {
  const { id } = useParams();
  const router = useRouter();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { setSelectedStalls, setCurrentBooking, selectedStalls: bookingStalls } = useBooking();
  
  const {
    state,
    setLayout,
    setStallTypes,
    setViewport,
    zoomIn,
    zoomOut,
    fitToScreen,
    toggleStallSelection,
    deselectStall,
    clearSelection,
    setHoveredStall,
    setLoading,
    setError,
    setFilters,
    calculateBooking,
    selectedStallsArray,
    hasSelection,
  } = useLayoutViewer();

  // Load layout data
  useEffect(() => {
    loadLayoutData();
  }, [id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const loadLayoutData = async () => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading layout data for exhibition:', id);
      
      // Load exhibition and stall types first, then layout with proper pricing
      const [exhibitionData, stallTypesData] = await Promise.all([
        ExhibitionService.getExhibition(id), // Changed to slug-aware method
        ExhibitionService.getStallTypes(id),
      ]);
      
      // Now load layout with stall types and exhibition data for proper price calculation with custom rates
      const layoutData = await ExhibitionService.getExhibitionLayout(id, stallTypesData, exhibitionData);
      
      console.log('✅ Exhibition data loaded:', exhibitionData);
      console.log('✅ Layout data loaded:', layoutData);
      console.log('📊 Layout structure:', {
        spaces: layoutData.spaces?.length || 0,
        halls: layoutData.halls?.length || 0,
        stalls: layoutData.stalls?.length || 0
      });
      console.log('✅ Stall types loaded:', stallTypesData.length);
      
      setExhibition(exhibitionData);
      setLayout(layoutData);
      setStallTypes(stallTypesData);
      
      // Auto-fit to screen once layout is loaded
      setTimeout(() => {
        fitToScreen();
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Failed to load layout data:', error);
      const errorMessage = error.message || 'Failed to load exhibition layout';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Get booking calculation
  const bookingCalculation = calculateBooking();

  // Handle stall click
  const handleStallClick = (stall: any) => {
    if (stall.status === 'available' && !stall.isBooked) {
      toggleStallSelection(stall);
    } else {
      toast({
        title: "Stall Unavailable",
        description: "This stall is already booked or not available for booking.",
        variant: "destructive",
      });
    }
  };

  // Handle stall hover with debouncing to prevent blinking
  const handleStallHover = useCallback((stallId: string | null, mousePos?: { x: number; y: number }) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (stallId) {
      // Immediately show hover state for responsiveness
      setHoveredStall(stallId);
      setMousePosition(mousePos || null);
    } else {
      // Delay hiding the tooltip slightly to prevent blinking
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredStall(null);
        setMousePosition(null);
      }, 50); // Small delay to prevent rapid on/off
    }
  }, [setHoveredStall]);

  // Get hovered stall data for tooltip
  const hoveredStallData = state.hoveredStall ? 
    state.layout?.stalls?.find(stall => stall._id === state.hoveredStall) || null : null;
  const hoveredStallType = hoveredStallData ? 
    state.stallTypes.find(type => type._id === hoveredStallData.stallTypeId) || null : null;

  // Initial loading state - show loading until data is fetched
  if (isInitialLoading || state.loading) {
    return <LayoutViewerSkeleton />;
  }

  // Error state
  if (state.error || !exhibition) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Layout</h3>
          <p className="text-gray-600 mb-4">
            {state.error || 'Unable to load the exhibition layout. Please try again.'}
          </p>
          <div className="space-x-2">
            <Button onClick={loadLayoutData}>Try Again</Button>
            <Link href={`/exhibitions/${id}` as any}>
              <Button variant="outline">Back to Exhibition</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header Section */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link href={"/exhibitions" as any} className="hover:text-gray-700">Exhibitions</Link>
            <span className="mx-2">/</span>
            <Link href={getExhibitionUrl(exhibition) as any} className="hover:text-gray-700">
              {exhibition.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Layout & Booking</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exhibition.name}</h1>
              <p className="text-gray-600">Select stalls from the interactive layout below</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Layout Canvas Section */}
        <div className="flex-1 flex flex-col relative">
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-10">
            <LayoutControls
              viewport={state.viewport}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onFitToScreen={fitToScreen}
            />
          </div>



          {/* Legend - REMOVED FROM HERE */}
          {/* Legend moved to sidebar below booking summary */}

          {/* Canvas */}
          <LayoutCanvas
            layout={state.layout}
            stallTypes={state.stallTypes}
            viewport={state.viewport}
            selectedStalls={new Set(state.selectedStalls.keys())}
            hoveredStall={state.hoveredStall}
            onStallClick={handleStallClick}
            onStallHover={handleStallHover}
            onViewportChange={setViewport}
            className="flex-1"
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 space-y-4">
            <BookingSummary
              selectedStalls={selectedStallsArray}
              bookingCalculation={bookingCalculation}
              exhibitionId={exhibition._id}
              exhibition={exhibition} // CRITICAL ADDITION: Pass exhibition config for proper pricing
              onRemoveStall={deselectStall}
              onClearSelection={clearSelection}
            />

            {/* Stall Status Legend */}
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Stall Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 border rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 border rounded"></div>
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 border rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 border rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-300 border rounded"></div>
                  <span>Hovered</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Stall Tooltip */}
      <StallTooltip
        stall={hoveredStallData}
        stallType={hoveredStallType}
        mousePosition={mousePosition}
        visible={!!state.hoveredStall && !!mousePosition}
      />
    </div>
  );
}

function LayoutViewerSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-1"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-1"></div>
              <div className="h-4 bg-gray-200 rounded w-28"></div>
            </div>
            
            {/* Title and description skeleton */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-96 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-80"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 flex">
        {/* Canvas area */}
        <div className="flex-1 relative bg-gray-100">
          {/* Controls skeleton */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white rounded-lg shadow-md p-2 animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-6 w-12 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Legend skeleton */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading message in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Exhibition Layout</h3>
              <p className="text-gray-600 mb-4">Please wait while we prepare the interactive layout...</p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-80 bg-white border-l p-4">
          <div className="animate-pulse space-y-4">
            {/* Booking summary skeleton */}
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 