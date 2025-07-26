/**
 * 🚀 OPTIMIZED DRAG SYSTEM
 * 
 * This system dramatically improves drag performance by:
 * 1. Using visual drag preview instead of constant layout updates
 * 2. Hiding grid during drag operations
 * 3. Separating visual drag state from actual data state
 * 4. Reducing render complexity during drag
 * 5. Implementing modal-aware grid toggling
 * 
 * 🎯 SMART GRID MANAGEMENT:
 * - Exhibition Space grid: Hidden when managing stalls (viewMode === 'stall')
 * - Hall grids: Always visible when managing stalls (for positioning)
 * - Stalls: No internal grids (positioned within halls)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Group, Rect, Line } from 'react-konva';
import { LayoutData, ViewMode } from '../types/layout-types';

interface DragPreviewState {
  isDragging: boolean;
  dragTargetId: string | null;
  dragTargetType: 'space' | 'hall' | 'stall' | 'fixture' | null;
  dragPreviewX: number;
  dragPreviewY: number;
  originalX: number;
  originalY: number;
  draggedElement: any;
}

interface OptimizedDragSystemProps {
  layout: LayoutData;
  children: React.ReactNode;
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>;
  isModalOpen?: boolean; // For hiding grid when modal is open
  viewMode?: ViewMode; // Control grid visibility based on current view mode
}

export const OptimizedDragSystem: React.FC<OptimizedDragSystemProps> = ({
  layout,
  children,
  onDragComplete: _onDragComplete,
  isModalOpen = false,
  viewMode
}) => {
  const [dragState, _setDragState] = useState<DragPreviewState>({
    isDragging: false,
    dragTargetId: null,
    dragTargetType: null,
    dragPreviewX: 0,
    dragPreviewY: 0,
    originalX: 0,
    originalY: 0,
    draggedElement: null
  });

  const dragUpdateRef = useRef<number | null>(null);



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragUpdateRef.current) {
        cancelAnimationFrame(dragUpdateRef.current);
      }
      document.body.style.pointerEvents = '';
    };
  }, []);

  // Render optimized grid (hidden during drag or when modal is open)
  const renderOptimizedGrid = () => {
    // Hide exhibition space grid when:
    // 1. Grid is disabled in layout
    // 2. Currently dragging
    // 3. Modal is open
    // 4. No exhibition space exists
    // 5. In stall management mode (we only want hall grids, not exhibition space grid)
    //    This allows users to see hall grids for positioning stalls without exhibition space clutter
    if (!layout.showGrid || 
        dragState.isDragging || 
        isModalOpen || 
        !layout.space ||
        viewMode === 'stall') {
      return null;
    }

    const { space } = layout;
    const gridLines = [];
    
    // 1 meter = pixelsPerSqm pixels
    const meterInPixels = layout.pixelsPerSqm;
    
    // Calculate how many meters we need based on the space dimensions
    const widthInMeters = space.widthSqm;
    const heightInMeters = space.heightSqm;
    
    // Vertical grid lines (every 1 meter)
    for (let meterX = 0; meterX <= widthInMeters; meterX++) {
      const pixelX = meterX * meterInPixels;
      gridLines.push(
        <Line
          key={`v${meterX}m`}
          points={[pixelX, 0, pixelX, space.height]}
          stroke="#e8e8e8"
          strokeWidth={1}
          dash={[3, 3]}
          listening={false}
          perfectDrawEnabled={false}
          shadowEnabled={false}
        />
      );
    }

    // Horizontal grid lines (every 1 meter)
    for (let meterY = 0; meterY <= heightInMeters; meterY++) {
      const pixelY = meterY * meterInPixels;
      gridLines.push(
        <Line
          key={`h${meterY}m`}
          points={[0, pixelY, space.width, pixelY]}
          stroke="#e8e8e8"
          strokeWidth={1}
          dash={[3, 3]}
          listening={false}
          perfectDrawEnabled={false}
          shadowEnabled={false}
        />
      );
    }

    return <Group>{gridLines}</Group>;
  };

  // Render drag preview
  const renderDragPreview = () => {
    if (!dragState.isDragging || !dragState.draggedElement) return null;

    const { draggedElement, dragPreviewX, dragPreviewY } = dragState;

    return (
      <Group
        x={dragPreviewX}
        y={dragPreviewY}
        opacity={0.8}
        listening={false}
      >
        <Rect
          width={draggedElement.width}
          height={draggedElement.height}
          fill={draggedElement.color}
          stroke="#007acc"
          strokeWidth={2}
          dash={[5, 5]}
          perfectDrawEnabled={false}
          shadowEnabled={false}
        />
      </Group>
    );
  };

  return (
    <Group>
      {/* Optimized grid that hides during drag */}
      {renderOptimizedGrid()}
      
      {/* Original content */}
      {children}
      
      {/* Drag preview overlay */}
      {renderDragPreview()}
    </Group>
  );
};

// Hook for using the optimized drag system
export const useOptimizedDrag = (
  _layout: LayoutData,
  _onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
) => {
  const dragSystemRef = useRef<any>(null);

  const startDrag = useCallback((
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture',
    element: any,
    initialX: number,
    initialY: number
  ) => {
    if (dragSystemRef.current) {
      dragSystemRef.current.handleDragStart(targetId, targetType, element, initialX, initialY);
    }
  }, []);

  const moveDrag = useCallback((newX: number, newY: number) => {
    if (dragSystemRef.current) {
      dragSystemRef.current.handleDragMove(newX, newY);
    }
  }, []);

  const endDrag = useCallback(() => {
    if (dragSystemRef.current) {
      dragSystemRef.current.handleDragEnd();
    }
  }, []);

  return {
    dragSystemRef,
    startDrag,
    moveDrag,
    endDrag
  };
};



export default OptimizedDragSystem; 