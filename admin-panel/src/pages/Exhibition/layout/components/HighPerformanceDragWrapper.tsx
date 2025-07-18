/**
 * 🚀 HIGH-PERFORMANCE DRAG WRAPPER
 * 
 * Optimizes drag operations for 1000+ stalls without breaking existing functionality
 * - Throttles drag updates to 60fps
 * - Implements visual feedback during drag
 * - Debounces auto-save operations
 * - Updates spatial index efficiently
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { spatialIndex } from '../utils/SpatialIndex';
import { highPerformanceController } from './LayoutCanvasUtils';

interface HighPerformanceDragWrapperProps {
  targetId: string;
  targetType: 'space' | 'hall' | 'stall' | 'fixture';
  onMouseDown: (e: any, targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture') => void;
  onPositionUpdate: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', newX: number, newY: number) => void;
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>;
  children: React.ReactNode;
  layout: any;
  disabled?: boolean;
}

export const HighPerformanceDragWrapper: React.FC<HighPerformanceDragWrapperProps> = ({
  targetId,
  targetType,
  onMouseDown,
  onPositionUpdate,
  onDragComplete,
  children,
  layout,
  disabled = false
}) => {
  const dragUpdateThrottleRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);
  const currentPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Enhanced mouse down handler
  const handleMouseDown = useCallback((e: any) => {
    if (disabled) return;
    
    // Get current position
    let currentPos = { x: 0, y: 0 };
    if (targetType === 'space' && layout?.space) {
      currentPos = { x: layout.space.x || 0, y: layout.space.y || 0 };
    } else if (targetType === 'hall' && layout?.space) {
      const hall = layout.space.halls.find((h: any) => h.id === targetId);
      if (hall) {
        currentPos = { x: hall.x || 0, y: hall.y || 0 };
      }
    } else if (targetType === 'stall' && layout?.space) {
      for (const hall of layout.space.halls) {
        const stall = hall.stalls.find((s: any) => s.id === targetId);
        if (stall) {
          currentPos = { x: stall.x || 0, y: stall.y || 0 };
          break;
        }
      }
    } else if (targetType === 'fixture' && layout?.fixtures) {
      const fixture = layout.fixtures.find((f: any) => f.id === targetId);
      if (fixture) {
        currentPos = { x: fixture.x || 0, y: fixture.y || 0 };
      }
    }
    
    isDraggingRef.current = true;
    initialPositionRef.current = currentPos;
    currentPositionRef.current = currentPos;
    
    // Notify performance controller
    if (targetType === 'stall') {
      const totalStalls = layout?.space?.halls?.reduce((count: number, hall: any) => count + hall.stalls.length, 0) || 0;
      highPerformanceController.updateStallCount(totalStalls);
    }
    
    // Call original mouse down
    onMouseDown(e, targetId, targetType);
  }, [disabled, targetId, targetType, layout, onMouseDown]);



  // Enhanced mouse up handler
  const handleMouseUp = useCallback(async () => {
    if (!isDraggingRef.current || disabled) return;
    
    isDraggingRef.current = false;
    
    // Cancel any pending updates
    if (dragUpdateThrottleRef.current) {
      cancelAnimationFrame(dragUpdateThrottleRef.current);
      dragUpdateThrottleRef.current = null;
    }
    
    // Ensure final position is committed
    if (currentPositionRef.current) {
      const finalPos = currentPositionRef.current;
      
      // Final position update
      onPositionUpdate(targetId, targetType, finalPos.x, finalPos.y);
      
      // Debounced drag complete
      setTimeout(async () => {
        try {
          await onDragComplete(targetId, targetType, finalPos.x, finalPos.y);
        } catch (error) {
          console.error('Error in drag complete:', error);
        }
      }, 100);
    }
    
    // Reset refs
    initialPositionRef.current = null;
    currentPositionRef.current = null;
  }, [disabled, targetId, targetType, onPositionUpdate, onDragComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragUpdateThrottleRef.current) {
        cancelAnimationFrame(dragUpdateThrottleRef.current);
      }
    };
  }, []);

  // Enhanced visual feedback during drag
  const isDragging = isDraggingRef.current;
  const dragStyle = isDragging ? {
    opacity: 0.8,
    transform: 'scale(1.02)',
    transition: 'none',
    cursor: 'grabbing',
    zIndex: 1000
  } : {};

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        ...dragStyle,
        cursor: disabled ? 'not-allowed' : 'grab',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};

// Hook to use the high-performance drag system
export const useHighPerformanceDrag = (
  targetId: string,
  targetType: 'space' | 'hall' | 'stall' | 'fixture',
  layout: any,
  onPositionUpdate: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', newX: number, newY: number) => void,
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
) => {
  const dragUpdateThrottleRef = useRef<number | null>(null);
  const lastDragUpdateRef = useRef<number>(0);
  const DRAG_UPDATE_THROTTLE = 16; // ~60fps

  // Throttled position update
  const throttledPositionUpdate = useCallback((x: number, y: number) => {
    const now = Date.now();
    
    if (now - lastDragUpdateRef.current < DRAG_UPDATE_THROTTLE) {
      return;
    }
    
    lastDragUpdateRef.current = now;
    
    // Update spatial index
    if (targetType === 'stall' && layout?.space) {
      for (const hall of layout.space.halls) {
        const stall = hall.stalls.find((s: any) => s.id === targetId);
        if (stall) {
          spatialIndex.update(
            targetId,
            hall.x + x,
            hall.y + y,
            stall.width,
            stall.height,
            stall
          );
          break;
        }
      }
    }
    
    onPositionUpdate(targetId, targetType, x, y);
  }, [targetId, targetType, layout, onPositionUpdate]);

  // Debounced drag complete
  const debouncedDragComplete = useCallback(async (finalX: number, finalY: number) => {
    // Clear any pending updates
    if (dragUpdateThrottleRef.current) {
      cancelAnimationFrame(dragUpdateThrottleRef.current);
    }
    
    // Ensure final position is committed
    throttledPositionUpdate(finalX, finalY);
    
    // Delay drag complete to allow position update to finish
    setTimeout(async () => {
      try {
        await onDragComplete(targetId, targetType, finalX, finalY);
      } catch (error) {
        console.error('Error in drag complete:', error);
      }
    }, 50);
  }, [targetId, targetType, throttledPositionUpdate, onDragComplete]);

  return {
    throttledPositionUpdate,
    debouncedDragComplete
  };
};

export default HighPerformanceDragWrapper; 