/**
 * 🚀 SUPER SMOOTH DRAG SYSTEM
 * 
 * This system achieves maximum drag performance by:
 * 1. NO THROTTLING - Updates at native 60fps+
 * 2. NO layout state updates during drag
 * 3. Visual preview only during drag
 * 4. Minimal coordinate calculations
 * 5. Cached element references
 * 6. Disabled all non-essential operations
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { LayoutData } from '../types/layout-types';

interface SuperSmoothDragState {
  isDragging: boolean;
  dragTarget: {
    id: string;
    type: 'space' | 'hall' | 'stall' | 'fixture';
    element: any;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;
}

interface SuperSmoothDragProps {
  layout: LayoutData;
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>;
  isModalOpen?: boolean;
}

export const SuperSmoothDrag: React.FC<SuperSmoothDragProps> = ({
  layout,
  onDragComplete,
  isModalOpen = false
}) => {
  const [dragState, setDragState] = useState<SuperSmoothDragState>({
    isDragging: false,
    dragTarget: null
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  // Cache bounds for super fast calculations
  const bounds = useMemo(() => {
    if (!layout.space) return null;
    
    return {
      space: {
        width: layout.space.width,
        height: layout.space.height
      },
      halls: layout.space.halls.map(hall => ({
        id: hall.id,
        x: hall.x,
        y: hall.y,
        width: hall.width,
        height: hall.height
      })),
      pixelsPerSqm: layout.pixelsPerSqm
    };
  }, [layout.space, layout.pixelsPerSqm]);

  // Super fast grid snapping (no conditionals)
  const snapToGrid = useCallback((x: number, y: number) => {
    if (!bounds) return { x, y };
    
    const grid = bounds.pixelsPerSqm;
    return {
      x: Math.round(x / grid) * grid,
      y: Math.round(y / grid) * grid
    };
  }, [bounds]);

  // Lightning fast bounds checking
  const applyBounds = useCallback((x: number, y: number, element: any) => {
    if (!bounds) return { x, y };
    
    const minX = 0;
    const minY = 0;
    let maxX = bounds.space.width - element.width;
    let maxY = bounds.space.height - element.height;
    
    if (element.type === 'stall') {
      // Find parent hall bounds
      const hall = bounds.halls.find(h => h.id === element.hallId);
      if (hall) {
        maxX = hall.width - element.width;
        maxY = hall.height - element.height;
      }
    }
    
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }, [bounds]);

  // Ultimate performance drag start
  const startDrag = useCallback((
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture',
    element: any,
    startX: number,
    startY: number
  ) => {
    // Disable all non-essential operations
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    
    // Re-enable on canvas
    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = 'auto';
    }

    setDragState({
      isDragging: true,
      dragTarget: {
        id: targetId,
        type: targetType,
        element: { ...element, type: targetType },
        startX,
        startY,
        currentX: startX,
        currentY: startY
      }
    });
  }, []);

  // Ultra-smooth drag move (no throttling)
  const moveDrag = useCallback((newX: number, newY: number) => {
    if (!dragState.isDragging || !dragState.dragTarget) return;

    // Apply grid snapping and bounds in one operation
    const snapped = snapToGrid(newX, newY);
    const bounded = applyBounds(snapped.x, snapped.y, dragState.dragTarget.element);

    // Update drag state immediately
    setDragState(prev => ({
      ...prev,
      dragTarget: prev.dragTarget ? {
        ...prev.dragTarget,
        currentX: bounded.x,
        currentY: bounded.y
      } : null
    }));

    // Update visual preview immediately
    if (dragPreviewRef.current) {
      dragPreviewRef.current.style.transform = `translate(${bounded.x}px, ${bounded.y}px)`;
    }
  }, [dragState.isDragging, dragState.dragTarget, snapToGrid, applyBounds]);

  // Lightning fast drag end
  const endDrag = useCallback(async () => {
    if (!dragState.isDragging || !dragState.dragTarget) return;

    // Restore normal operations
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';

    // Complete the drag
    const { id, type, currentX, currentY } = dragState.dragTarget;
    
    try {
      await onDragComplete(id, type, currentX, currentY);
    } catch (error) {
      console.error('Drag complete error:', error);
    }

    // Reset state
    setDragState({
      isDragging: false,
      dragTarget: null
    });
  }, [dragState, onDragComplete]);

  // Render ultra-light drag preview
  const renderDragPreview = () => {
    if (!dragState.isDragging || !dragState.dragTarget) return null;

    const { element, currentX, currentY } = dragState.dragTarget;

    return (
      <div
        ref={dragPreviewRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: element.width,
          height: element.height,
          background: element.color || '#e6f3ff',
          border: '2px dashed #007acc',
          borderRadius: 4,
          opacity: 0.8,
          transform: `translate(${currentX}px, ${currentY}px)`,
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'none' // Remove any CSS transitions
        }}
      />
    );
  };

  // Super fast cleanup
  useEffect(() => {
    return () => {
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };
  }, []);

  return (
    <div ref={canvasRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {renderDragPreview()}
    </div>
  );
};

// Hook for the super smooth drag system
export const useSuperSmoothDrag = (
  layout: LayoutData,
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
) => {
  const dragSystemRef = useRef<any>(null);
  
  const startDrag = useCallback((
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture',
    element: any,
    startX: number,
    startY: number
  ) => {
    if (dragSystemRef.current) {
      dragSystemRef.current.startDrag(targetId, targetType, element, startX, startY);
    }
  }, []);

  const moveDrag = useCallback((newX: number, newY: number) => {
    if (dragSystemRef.current) {
      dragSystemRef.current.moveDrag(newX, newY);
    }
  }, []);

  const endDrag = useCallback(() => {
    if (dragSystemRef.current) {
      dragSystemRef.current.endDrag();
    }
  }, []);

  return {
    dragSystemRef,
    startDrag,
    moveDrag,
    endDrag
  };
};

export default SuperSmoothDrag; 