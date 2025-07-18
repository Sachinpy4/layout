/**
 * 🚀 OPTIMIZED DRAG SYSTEM
 * 
 * This system dramatically improves drag performance by:
 * 1. Using visual drag preview instead of constant layout updates
 * 2. Hiding grid during drag operations
 * 3. Separating visual drag state from actual data state
 * 4. Reducing render complexity during drag
 * 5. Implementing modal-aware grid toggling
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Group, Rect, Line } from 'react-konva';
import { LayoutData } from '../types/layout-types';

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
}

export const OptimizedDragSystem: React.FC<OptimizedDragSystemProps> = ({
  layout,
  children,
  onDragComplete,
  isModalOpen = false
}) => {
  const [dragState, setDragState] = useState<DragPreviewState>({
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
  const stageRef = useRef<any>(null);

  // High-performance drag start handler
  const handleDragStart = useCallback((
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture',
    element: any,
    initialX: number,
    initialY: number
  ) => {
    // Store original element data for preview
    const draggedElement = {
      id: targetId,
      type: targetType,
      x: initialX,
      y: initialY,
      width: element.width || 0,
      height: element.height || 0,
      color: element.color || '#e6f3ff',
      name: element.name || ''
    };

    setDragState({
      isDragging: true,
      dragTargetId: targetId,
      dragTargetType: targetType,
      dragPreviewX: initialX,
      dragPreviewY: initialY,
      originalX: initialX,
      originalY: initialY,
      draggedElement
    });

    // Disable pointer events on other elements during drag for better performance
    document.body.style.pointerEvents = 'none';
    
    // Re-enable pointer events on the canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.pointerEvents = 'auto';
    }
  }, []);

  // High-performance drag move handler with requestAnimationFrame
  const handleDragMove = useCallback((newX: number, newY: number) => {
    if (!dragState.isDragging) return;

    // Cancel previous animation frame
    if (dragUpdateRef.current) {
      cancelAnimationFrame(dragUpdateRef.current);
    }

    // Use requestAnimationFrame for smooth 60fps updates
    dragUpdateRef.current = requestAnimationFrame(() => {
      // Apply grid snapping if enabled (1 meter grid)
      let snappedX = newX;
      let snappedY = newY;
      
      if (layout.showGrid && layout.pixelsPerSqm > 0) {
        const meterInPixels = layout.pixelsPerSqm;
        snappedX = Math.round(newX / meterInPixels) * meterInPixels;
        snappedY = Math.round(newY / meterInPixels) * meterInPixels;
      }

      // Apply bounds checking
      if (dragState.dragTargetType === 'stall' && layout.space) {
        // Find parent hall for stall bounds
        for (const hall of layout.space.halls) {
          const stall = hall.stalls.find(s => s.id === dragState.dragTargetId);
          if (stall) {
            const maxX = hall.width - stall.width;
            const maxY = hall.height - stall.height;
            snappedX = Math.max(0, Math.min(maxX, snappedX));
            snappedY = Math.max(0, Math.min(maxY, snappedY));
            break;
          }
        }
      } else if (dragState.dragTargetType === 'hall' && layout.space) {
        const hall = layout.space.halls.find(h => h.id === dragState.dragTargetId);
        if (hall) {
          const maxX = layout.space.width - hall.width;
          const maxY = layout.space.height - hall.height;
          snappedX = Math.max(0, Math.min(maxX, snappedX));
          snappedY = Math.max(0, Math.min(maxY, snappedY));
        }
      }

      // Update drag preview position (no layout state update)
      setDragState(prev => ({
        ...prev,
        dragPreviewX: snappedX,
        dragPreviewY: snappedY
      }));
    });
  }, [dragState.isDragging, dragState.dragTargetType, dragState.dragTargetId, layout]);

  // High-performance drag end handler
  const handleDragEnd = useCallback(async () => {
    if (!dragState.isDragging || !dragState.dragTargetId || !dragState.dragTargetType) return;

    // Cancel any pending animation frame
    if (dragUpdateRef.current) {
      cancelAnimationFrame(dragUpdateRef.current);
    }

    // Restore pointer events
    document.body.style.pointerEvents = '';

    // Only now update the actual layout data
    try {
      await onDragComplete(
        dragState.dragTargetId,
        dragState.dragTargetType,
        dragState.dragPreviewX,
        dragState.dragPreviewY
      );
    } catch (error) {
      console.error('Drag complete error:', error);
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      dragTargetId: null,
      dragTargetType: null,
      dragPreviewX: 0,
      dragPreviewY: 0,
      originalX: 0,
      originalY: 0,
      draggedElement: null
    });
  }, [dragState, onDragComplete]);

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
    if (!layout.showGrid || dragState.isDragging || isModalOpen || !layout.space) {
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
  layout: LayoutData,
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
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