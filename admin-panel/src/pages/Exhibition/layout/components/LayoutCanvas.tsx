import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { LayoutData, ViewMode } from '../types/layout-types';
import { 
  useViewportCulling, 
  useVisibleStalls, 
  useFitToCanvas,
  highPerformanceController
} from './LayoutCanvasUtils';
import { 
  useWheelZoom,
  useStageDrag,
  useMouseEvents,
  useMobileDetection,
  useContainerSize
} from './LayoutCanvasHooks';
import { 
  renderExhibitionSpace, 
  renderHalls, 
  renderStalls, 
  renderFixtures 
} from './LayoutCanvasRenderers';

/*
 * 🚀 ULTRA HIGH-PERFORMANCE LAYOUT CANVAS 2025
 * 
 * NEW PERFORMANCE FEATURES:
 * 1. OptimizedDragSystem - Visual drag preview instead of constant layout updates
 * 2. Modal-aware grid toggling - Grid hidden during modal operations
 * 3. RequestAnimationFrame-based drag updates for smooth 60fps
 * 4. Separated visual drag state from actual data state
 * 5. Disabled pointer events during drag for better performance
 * 
 * EXISTING FEATURES PRESERVED:
 * - transformsEnabled: 'position' - Limits transforms to position only  
 * - perfectDrawEnabled: false - Disables expensive perfect drawing during operations
 * - Enhanced viewport culling - Aggressive culling for 100+ stalls vs 50+ halls
 * - Layer caching - Auto-caches when 200+ visible stalls
 * - OffscreenCanvas detection - Ready for web worker rendering
 * - listening: false - Disables event handling during drag for performance
 * - clearBeforeDraw: false - Skips clearing during stall drag optimization
 * - Reduced pixelRatio - Lower quality during drag (0.5x mobile, 0.8x desktop)
 * - Smart layer management - Unified layer maintains coordinate system integrity
 * - Manual view persistence - Preserves user zoom/pan during stall positioning
 *
 * 🎯 USER EXPERIENCE ENHANCEMENT:
 * - Auto-fit only on initial load and container resize (not on layout updates)
 * - Manual zoom/pan preserved during stall drag operations  
 * - Visual feedback with "📌 Manual View" indicator
 * - "🔄 Reset View" button to return to auto-fit behavior
 * - Grid automatically hides during drag and when modals are open
 */

interface LayoutCanvasProps {
  layout: LayoutData;
  viewMode: ViewMode;
  onMouseDown: (e: any, targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture') => void;
  onEditStall?: (stallId: string) => void;
  onEditHall?: (hallId: string) => void;
  onHallSelect?: (hallId: string) => void;
  onPositionUpdate: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', newX: number, newY: number) => void;
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>;
  onHallSelectForDelete?: (hallId: string | null) => void;
  isModalOpen?: boolean;
}

const LayoutCanvas: React.FC<LayoutCanvasProps> = ({
  layout,
  viewMode,
  onMouseDown,
  onEditStall,
  onEditHall,
  onHallSelect,
  onHallSelectForDelete,
  onDragComplete,
  isModalOpen = false
}) => {
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isStageHovered, setIsStageHovered] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const selectedHallRef = useRef<any>(null);
  const selectedStallRef = useRef<any>(null);

  // Add state for grid snapping and drag feedback
  const [isDraggingStall, setIsDraggingStall] = useState(false);
  const [draggedStallId, setDraggedStallId] = useState<string | null>(null);
  const [draggedStallHallId, setDraggedStallHallId] = useState<string | null>(null);
  
  // Track user interactions to prevent auto-fit during manual positioning
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // View mode-based interaction control
  const isSpaceInteractionAllowed = viewMode === 'space';
  const isHallInteractionAllowed = viewMode === 'hall';
  const isStallInteractionAllowed = viewMode === 'stall';

  // Use custom hooks
  const isMobile = useMobileDetection();
  const containerSize = useContainerSize(containerRef);
  const { isElementVisible } = useViewportCulling(stageRef, layout);
  
  // Calculate total stall count for performance optimization
  const totalStallCount = layout?.space?.halls?.reduce((count, hall) => count + hall.stalls.length, 0) || 0;
  
  // Initialize high-performance controller
  useEffect(() => {
    if (totalStallCount > 0) {
      highPerformanceController.initialize(totalStallCount);
    }
  }, [totalStallCount]);
  
  const visibleStalls = useVisibleStalls(
    layout, 
    isElementVisible, 
    scale,
    { x: -position.x, y: -position.y, width: containerSize.width, height: containerSize.height }
  );
  const fitToCanvas = useFitToCanvas(
    layout, 
    containerSize, 
    isInitialLoad, 
    hasUserInteracted,
    setScale,
    setPosition,
    setIsInitialLoad,
    stageRef
  );

  // Event handlers
  const handleWheel = useWheelZoom(scale, setScale, setPosition, setHasUserInteracted, stageRef);
  const { handleDragStart, handleDragEnd } = useStageDrag(
    setIsDragging, 
    setPosition, 
    setHasUserInteracted, 
    layerRef, 
    stageRef
  );
  const { handleMouseEnter, handleMouseLeave } = useMouseEvents(setIsStageHovered);

  // Auto-deselect when interaction is not allowed for current view mode
  useEffect(() => {
    if (!isHallInteractionAllowed && selectedHallId) {
      setSelectedHallId(null);
    }
    if (!isStallInteractionAllowed && selectedStallId) {
      setSelectedStallId(null);
    }
  }, [isHallInteractionAllowed, isStallInteractionAllowed, selectedHallId, selectedStallId]);

  // Auto-fit on initial load and container size changes
  useEffect(() => {
    if (layout?.space) {
      fitToCanvas();
    }
  }, [containerSize.width, containerSize.height, layout?.space, fitToCanvas]);

  // Reset user interaction flag when layout space changes (new exhibition)
  useEffect(() => {
    if (layout?.space) {
      setHasUserInteracted(false);
      setIsInitialLoad(true);
    }
  }, [layout?.space?.id]);

  // Handle zoom changes from external controls (fit-to-screen, reset view)
  useEffect(() => {
    if (layout?.zoom === 1.0 && layout?.space) {
      // Reset user interaction when zoom is reset to 1.0
      setHasUserInteracted(false);
      setIsInitialLoad(true);
    }
  }, [layout?.zoom]);

  if (containerSize.width <= 0 || containerSize.height <= 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        Loading...
      </div>
    );
  }

  // Prepare props for renderers
  const renderProps = {
    layout,
    viewMode,
    scale,
    containerSize,
    selectedHallId,
    selectedStallId,
    setSelectedHallId,
    setSelectedStallId,
    selectedHallRef,
    selectedStallRef,
    draggedStallId,
    draggedStallHallId,
    isDraggingStall,
    isSpaceInteractionAllowed,
    isHallInteractionAllowed,
    isStallInteractionAllowed,
    onMouseDown,
    onEditStall,
    onEditHall,
    onHallSelect,
    onHallSelectForDelete,
    onDragComplete,
    visibleStalls,
    setIsDraggingStall,
    setDraggedStallId,
    setDraggedStallHallId
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        background: '#fafafa',
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        cursor: isStageHovered ? (isDragging ? 'grabbing' : 'grab') : 'default'
      }}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onClick={(e) => {
          // Deselect when clicking on empty space
          if (e.target === stageRef.current) {
            setSelectedHallId(null);
            setSelectedStallId(null);
            // Clear hall selection for deletion
            if (onHallSelectForDelete) {
              onHallSelectForDelete(null);
            }
          }
        }}
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        // SIMPLIFIED PERFORMANCE SETTINGS (matching smooth frontend)
        perfectDrawEnabled={!isDragging}
        listening={!isDragging}
        pixelRatio={
          isDragging ? 
            (isMobile ? 0.5 : 0.8) : // Reduce quality during drag for performance
            Math.min(1.5, window.devicePixelRatio || 1)
        }
      >
        {/* Simplified high-performance layer (matching frontend approach) */}
        <Layer
          ref={layerRef}
          imageSmoothingEnabled={!isDragging}
          perfectDrawEnabled={!isDragging}
          listening={!isDragging}
        >
          {/* Direct rendering without wrapper (like frontend) */}
          {/* Exhibition space */}
          {renderExhibitionSpace(renderProps)}
          
          {/* Halls */}
          {renderHalls(renderProps)}
          
          {/* Stalls with performance optimizations */}
          {renderStalls(renderProps)}
          
          {/* Fixtures */}
          {renderFixtures(renderProps)}
        </Layer>
      </Stage>
      
      {/* Performance indicator */}
      {totalStallCount > 500 && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          🚀 High Performance Mode: {totalStallCount} stalls
          {isModalOpen && ' | Grid Hidden'}
        </div>
      )}
      
      {/* View mode indicator */}
      {hasUserInteracted && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(0, 120, 215, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          📌 Manual View ({Math.round(scale * 100)}%)
        </div>
      )}
      
      {/* Fit to Screen helper text */}
      {hasUserInteracted && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: '11px',
          opacity: 0.8
        }}>
          💡 Use Fit to Screen button to center view
        </div>
      )}
    </div>
  );
};

export default LayoutCanvas; 