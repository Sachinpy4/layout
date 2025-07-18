/**
 * 🚀 ULTRA SIMPLE DRAG SYSTEM
 * 
 * This is the simplest possible drag implementation that:
 * 1. Updates Konva objects directly (no state management)
 * 2. No throttling whatsoever
 * 3. Minimal coordinate calculations
 * 4. Direct position updates
 * 5. Grid hidden during drag
 * 6. Only commits to layout state on drag end
 */

import { useRef, useCallback } from 'react';
import { LayoutData } from '../types/layout-types';

// Hook for ultra-simple drag
export const useUltraSimpleDrag = (
  layout: LayoutData,
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
) => {
  const isDraggingRef = useRef<boolean>(false);
  const currentTargetRef = useRef<{
    id: string;
    type: 'space' | 'hall' | 'stall' | 'fixture';
    element: any;
    konvaNode: any;
  } | null>(null);

  // Ultra-fast grid snapping
  const snapToGrid = useCallback((x: number, y: number) => {
    if (!layout.showGrid || !layout.pixelsPerSqm) return { x, y };
    
    const grid = layout.pixelsPerSqm;
    return {
      x: Math.round(x / grid) * grid,
      y: Math.round(y / grid) * grid
    };
  }, [layout.showGrid, layout.pixelsPerSqm]);

  // Ultra-fast bounds checking
  const applyBounds = useCallback((x: number, y: number, element: any, targetType: string) => {
    if (!layout.space) return { x, y };
    
    let maxX = layout.space.width - element.width;
    let maxY = layout.space.height - element.height;
    
    if (targetType === 'stall') {
      // Find parent hall bounds
      const hall = layout.space.halls.find(h => h.id === element.hallId);
      if (hall) {
        maxX = hall.width - element.width;
        maxY = hall.height - element.height;
      }
    }
    
    return {
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y))
    };
  }, [layout.space]);

  // Ultra-simple drag start
  const handleDragStart = useCallback((e: any, targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', element: any) => {
    e.cancelBubble = true;
    
    isDraggingRef.current = true;
    currentTargetRef.current = {
      id: targetId,
      type: targetType,
      element,
      konvaNode: e.target
    };

    // Disable hit detection for better performance
    const stage = e.target.getStage();
    if (stage) {
      stage.listening(false);
    }
  }, []);

  // Ultra-simple drag move (no throttling)
  const handleDragMove = useCallback((e: any) => {
    if (!isDraggingRef.current || !currentTargetRef.current) return;
    
    e.cancelBubble = true;
    
    const node = e.target;
    const rawX = node.x();
    const rawY = node.y();
    
    // Apply grid snapping and bounds in one operation
    const snapped = snapToGrid(rawX, rawY);
    const bounded = applyBounds(snapped.x, snapped.y, currentTargetRef.current.element, currentTargetRef.current.type);
    
    // Update Konva node position directly
    node.x(bounded.x);
    node.y(bounded.y);
  }, [snapToGrid, applyBounds]);

  // Ultra-simple drag end
  const handleDragEnd = useCallback(async (e: any) => {
    if (!isDraggingRef.current || !currentTargetRef.current) return;
    
    e.cancelBubble = true;
    
    const node = e.target;
    const finalX = node.x();
    const finalY = node.y();
    
    // Re-enable hit detection
    const stage = node.getStage();
    if (stage) {
      stage.listening(true);
    }
    
    // Commit to layout state
    try {
      await onDragComplete(
        currentTargetRef.current.id,
        currentTargetRef.current.type,
        finalX,
        finalY
      );
    } catch (error) {
      console.error('Drag complete error:', error);
    }
    
    // Reset drag state
    isDraggingRef.current = false;
    currentTargetRef.current = null;
  }, [onDragComplete]);

  return {
    isDragging: isDraggingRef.current,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  };
};

export default useUltraSimpleDrag; 