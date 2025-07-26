import { useState, useCallback, useRef } from 'react';
import { LayoutData } from '../types/layout-types';
import { spatialIndex } from '../utils/SpatialIndex';
import { highPerformanceController } from '../components/LayoutCanvasUtils';

interface DragState {
  isDragging: boolean;
  dragTargetId: string | null;
  dragTargetType: 'space' | 'hall' | 'stall' | 'fixture' | null;
  dragStartPosition: { x: number; y: number } | null;
  initialTargetPosition: { x: number; y: number } | null;
  containerElement: HTMLElement | null;
  // Add temporary drag position for smooth visual feedback
  tempPosition: { x: number; y: number } | null;
}

// 🚀 HIGH-PERFORMANCE DRAG SYSTEM
// Throttled drag updates with visual feedback optimization
export const useLayoutInteractions = (
  layout: LayoutData | null,
  setLayout: (layout: LayoutData) => void,
  autoSave: (layout: LayoutData) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragTargetId: null,
    dragTargetType: null,
    dragStartPosition: null,
    initialTargetPosition: null,
    containerElement: null,
    tempPosition: null
  });

  // Performance optimization: throttle drag updates
  const dragUpdateThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const lastDragUpdateRef = useRef<number>(0);
  const autoSaveThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const DRAG_UPDATE_THROTTLE = 16; // ~60fps
  const AUTO_SAVE_DEBOUNCE = 1000; // 1 second

  // Helper function to calculate canvas coordinates (MUST MATCH LayoutCanvas.tsx)
  const getCanvasCoordinates = useCallback((containerElement: HTMLElement) => {
    if (!layout?.space) {
      const containerWidth = Math.max(300, containerElement.clientWidth - 40);
      const containerHeight = Math.max(200, containerElement.clientHeight - 40);
      return {
        autoZoom: 1,
        offsetX: containerWidth / 2 - 200,
        offsetY: containerHeight / 2 - 150,
        effectiveZoom: 1,
        containerWidth,
        containerHeight,
        spaceWidth: 400,
        spaceHeight: 300
      };
    }

    const PADDING = 60; // MUST MATCH LayoutCanvas.tsx
    const containerWidth = Math.max(300, containerElement.clientWidth - 40);
    const containerHeight = Math.max(200, containerElement.clientHeight - 40);

    const { space } = layout;
    const availableWidth = containerWidth - (PADDING * 2);
    const availableHeight = containerHeight - (PADDING * 2);

    // Calculate auto zoom to fit space optimally (MUST MATCH LayoutCanvas.tsx)
    const zoomX = availableWidth / space.width;
    const zoomY = availableHeight / space.height;
    const autoZoom = Math.min(zoomX, zoomY) * 0.9; // MUST MATCH LayoutCanvas.tsx

    const spaceWidth = space.width * autoZoom;
    const spaceHeight = space.height * autoZoom;

    // Center the space in the canvas (MUST MATCH LayoutCanvas.tsx)
    const effectiveZoom = autoZoom * layout.zoom;

    // Calculate actual display coordinates with user zoom (MUST MATCH LayoutCanvas.tsx)
    const actualSpaceWidth = spaceWidth * layout.zoom;
    const actualSpaceHeight = spaceHeight * layout.zoom;

    // Ensure the zoomed space doesn't exceed container bounds (MUST MATCH LayoutCanvas.tsx)
    const maxWidth = containerWidth - 40;
    const maxHeight = containerHeight - 40;
    
    const constrainedWidth = Math.min(actualSpaceWidth, maxWidth);
    const constrainedHeight = Math.min(actualSpaceHeight, maxHeight);
    
    // Recalculate center position with constrained dimensions (MUST MATCH LayoutCanvas.tsx)
    const actualOffsetX = Math.max(20, (containerWidth - constrainedWidth) / 2);
    const actualOffsetY = Math.max(20, (containerHeight - constrainedHeight) / 2);

    return {
      autoZoom,
      offsetX: actualOffsetX,
      offsetY: actualOffsetY,
      effectiveZoom,
      containerWidth,
      containerHeight,
      spaceWidth: constrainedWidth,
      spaceHeight: constrainedHeight
    };
  }, [layout]);

  // Helper function to get current position of a target
  const getCurrentPosition = useCallback((targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture') => {
    if (!layout) return { x: 0, y: 0 };

    try {
      if (targetType === 'space' && layout.space) {
        return { x: layout.space.x || 0, y: layout.space.y || 0 };
      } else if (targetType === 'hall' && layout.space) {
        const hall = layout.space.halls.find(h => h.id === targetId);
        if (!hall) return { x: 0, y: 0 };
        return { x: hall.x || 0, y: hall.y || 0 };
      } else if (targetType === 'stall' && layout.space) {
        for (const hall of layout.space.halls) {
          const stall = hall.stalls.find(s => s.id === targetId);
          if (stall) return { x: stall.x || 0, y: stall.y || 0 };
        }
      } else if (targetType === 'fixture') {
        const fixture = layout.fixtures.find(f => f.id === targetId);
        if (!fixture) return { x: 0, y: 0 };
        return { x: fixture.x || 0, y: fixture.y || 0 };
      }
    } catch (error) {
      console.error('Error getting current position:', error);
    }

    return { x: 0, y: 0 };
  }, [layout]);

  // Helper function to find the canvas container element
  const findCanvasContainer = useCallback((element: HTMLElement): HTMLElement | null => {
    let current = element;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (current && attempts < maxAttempts) {
      // Look for the div that contains the SVG and has the specific styling
      if (current.tagName === 'DIV' && 
          current.querySelector('svg') && 
          current.style.overflow === 'hidden') {
        return current;
      }
      
      current = current.parentElement as HTMLElement;
      attempts++;
    }

    return null;
  }, []);

  // Throttled position update function
  const throttledPositionUpdate = useCallback((
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture',
    newX: number,
    newY: number
  ) => {
    const now = Date.now();
    
    // Skip if we're updating too frequently
    if (now - lastDragUpdateRef.current < DRAG_UPDATE_THROTTLE) {
      return;
    }
    
    lastDragUpdateRef.current = now;

    if (!layout) return;

    // Create optimized layout update
    const updatedLayout = { ...layout };

    if (targetType === 'space' && updatedLayout.space) {
      updatedLayout.space = {
        ...updatedLayout.space,
        x: newX,
        y: newY
      };
    } else if (targetType === 'hall' && updatedLayout.space) {
      // Find and update only the specific hall
      const hallIndex = updatedLayout.space.halls.findIndex(h => h.id === targetId);
      if (hallIndex !== -1) {
        updatedLayout.space.halls[hallIndex] = {
          ...updatedLayout.space.halls[hallIndex],
          x: newX,
          y: newY
        };
        
        // Update spatial index for the hall
        spatialIndex.update(
          targetId,
          newX,
          newY,
          updatedLayout.space.halls[hallIndex].width,
          updatedLayout.space.halls[hallIndex].height,
          updatedLayout.space.halls[hallIndex]
        );
      }
    } else if (targetType === 'stall' && updatedLayout.space) {
      // Find and update only the specific stall
      for (const hall of updatedLayout.space.halls) {
        const stallIndex = hall.stalls.findIndex(s => s.id === targetId);
        if (stallIndex !== -1) {
          hall.stalls[stallIndex] = {
            ...hall.stalls[stallIndex],
            x: newX,
            y: newY
          };
          
          // Update spatial index for the stall
          spatialIndex.update(
            targetId,
            hall.x + newX,
            hall.y + newY,
            hall.stalls[stallIndex].width,
            hall.stalls[stallIndex].height,
            hall.stalls[stallIndex]
          );
          break;
        }
      }
    } else if (targetType === 'fixture') {
      const fixtureIndex = updatedLayout.fixtures.findIndex(f => f.id === targetId);
      if (fixtureIndex !== -1) {
        updatedLayout.fixtures[fixtureIndex] = {
          ...updatedLayout.fixtures[fixtureIndex],
          x: newX,
          y: newY
        };
        
        // Update spatial index for the fixture
        spatialIndex.update(
          targetId,
          newX,
          newY,
          updatedLayout.fixtures[fixtureIndex].width,
          updatedLayout.fixtures[fixtureIndex].height,
          updatedLayout.fixtures[fixtureIndex]
        );
      }
    }

    setLayout(updatedLayout);
  }, [layout, setLayout]);

  // Debounced auto-save function
  const debouncedAutoSave = useCallback((layoutToSave: LayoutData) => {
    // Clear existing timeout
    if (autoSaveThrottleRef.current) {
      clearTimeout(autoSaveThrottleRef.current);
    }

    // Set new timeout
    autoSaveThrottleRef.current = setTimeout(() => {
      autoSave(layoutToSave);
    }, AUTO_SAVE_DEBOUNCE);
  }, [autoSave]);

  const handleMouseDown = useCallback((
    e: any, // Changed from React.MouseEvent to any to handle both React and Konva events
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture'
  ) => {
    // Safely handle preventDefault for both React and Konva events
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    // For Konva events, use cancelBubble
    if (e && e.cancelBubble !== undefined) {
      e.cancelBubble = true;
    }

    // For Konva events, we need to get the actual DOM event and container differently
    let containerElement: HTMLElement | null = null;
    let mouseX = 0;
    let mouseY = 0;

    // Handle React MouseEvent
    if (e && e.currentTarget && e.clientX !== undefined) {
      containerElement = findCanvasContainer(e.currentTarget as HTMLElement);
      if (containerElement) {
        const rect = containerElement.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      }
    } 
    // Handle Konva event
    else if (e && e.target) {
      // For Konva events, we need to traverse up to find the container
      const stage = e.target.getStage();
      if (stage) {
        containerElement = stage.container() as HTMLElement;
        if (containerElement) {
          // Get mouse position relative to the stage
          const pointerPos = stage.getPointerPosition();
          if (pointerPos) {
            mouseX = pointerPos.x;
            mouseY = pointerPos.y;
          }
        }
      }
    }

    if (!containerElement) {
      console.error('Could not find canvas container element');
      return;
    }

    const initialPosition = getCurrentPosition(targetId, targetType);

    setDragState({
      isDragging: true,
      dragTargetId: targetId,
      dragTargetType: targetType,
      dragStartPosition: { x: mouseX, y: mouseY },
      initialTargetPosition: initialPosition,
      containerElement,
      tempPosition: initialPosition
    });

    // Notify high-performance controller about drag start
    if (targetType === 'stall') {
      highPerformanceController.updateStallCount(
        layout?.space?.halls?.reduce((count, hall) => count + hall.stalls.length, 0) || 0
      );
    }
  }, [findCanvasContainer, getCurrentPosition, layout]);

  const handleMouseMove = useCallback((e: any) => { // Changed from React.MouseEvent to any
    if (!dragState.isDragging || 
        !dragState.dragTargetId || 
        !dragState.dragStartPosition || 
        !dragState.initialTargetPosition || 
        !dragState.containerElement || 
        !layout) return;

    try {
      let currentMouseX = 0;
      let currentMouseY = 0;

      // Handle React MouseEvent
      if (e && e.clientX !== undefined && e.clientY !== undefined) {
        const rect = dragState.containerElement.getBoundingClientRect();
        currentMouseX = e.clientX - rect.left;
        currentMouseY = e.clientY - rect.top;
      }
      // Handle Konva event
      else if (e && e.target) {
        const stage = e.target.getStage();
        if (stage) {
          const pointerPos = stage.getPointerPosition();
          if (pointerPos) {
            currentMouseX = pointerPos.x;
            currentMouseY = pointerPos.y;
          }
        }
      }

      // Calculate mouse delta in screen coordinates
      const deltaMouseX = currentMouseX - dragState.dragStartPosition.x;
      const deltaMouseY = currentMouseY - dragState.dragStartPosition.y;

      // Get canvas coordinates using the cached container element
      const { effectiveZoom, containerWidth, containerHeight } = getCanvasCoordinates(dragState.containerElement);

      // Convert delta to SVG coordinates
      const deltaSvgX = deltaMouseX / effectiveZoom;
      const deltaSvgY = deltaMouseY / effectiveZoom;

      // Calculate new position
      let newX = dragState.initialTargetPosition.x + deltaSvgX;
      let newY = dragState.initialTargetPosition.y + deltaSvgY;

      // Apply bounds checking based on target type
      if (dragState.dragTargetType === 'space') {
        // For exhibition space: allow movement within a reasonable range relative to the canvas center
        const maxOffset = Math.min(containerWidth, containerHeight) * 0.3;
        newX = Math.max(-maxOffset, Math.min(maxOffset, newX));
        newY = Math.max(-maxOffset, Math.min(maxOffset, newY));
      } else if (layout.space) {
        // For other elements: constrain within exhibition space or parent element
        const minX = 0;
        const minY = 0;
        let maxX = layout.space.width;
        let maxY = layout.space.height;

        if (dragState.dragTargetType === 'hall') {
          const hall = layout.space.halls.find(h => h.id === dragState.dragTargetId);
          if (hall) {
            maxX = Math.max(0, layout.space.width - hall.width);
            maxY = Math.max(0, layout.space.height - hall.height);
          }
        } else if (dragState.dragTargetType === 'stall') {
          // Find the parent hall for the stall
          for (const hall of layout.space.halls) {
            const stall = hall.stalls.find(s => s.id === dragState.dragTargetId);
            if (stall) {
              maxX = Math.max(0, hall.width - stall.width);
              maxY = Math.max(0, hall.height - stall.height);
              break;
            }
          }
        } else if (dragState.dragTargetType === 'fixture') {
          const fixture = layout.fixtures.find(f => f.id === dragState.dragTargetId);
          if (fixture) {
            maxX = Math.max(0, layout.space.width - fixture.width);
            maxY = Math.max(0, layout.space.height - fixture.height);
          }
        }

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        // Grid snapping ONLY for objects inside the exhibition space
        if (layout.showGrid && layout.gridSize > 0) {
          const gridSize = layout.gridSize;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }
      }

      // Update temporary position for visual feedback
      setDragState(prev => ({
        ...prev,
        tempPosition: { x: newX, y: newY }
      }));

      // Throttled layout update
      if (dragState.dragTargetId && dragState.dragTargetType) {
        throttledPositionUpdate(
          dragState.dragTargetId,
          dragState.dragTargetType,
          newX,
          newY
        );
      }

    } catch (error) {
      console.error('Error during mouse move:', error);
    }
  }, [dragState, layout, getCanvasCoordinates, throttledPositionUpdate]);

  const handleMouseUp = useCallback(async () => {
    if (!dragState.isDragging || !layout) return;

    try {
      // Clear any pending throttled updates
      if (dragUpdateThrottleRef.current) {
        clearTimeout(dragUpdateThrottleRef.current);
      }

      // Ensure final position is committed
      if (dragState.tempPosition && dragState.dragTargetId && dragState.dragTargetType) {
        throttledPositionUpdate(
          dragState.dragTargetId,
          dragState.dragTargetType,
          dragState.tempPosition.x,
          dragState.tempPosition.y
        );
      }

      // Debounced auto-save
      debouncedAutoSave(layout);

    } catch (error) {
      console.error('Error during mouse up:', error);
    }

    setDragState({
      isDragging: false,
      dragTargetId: null,
      dragTargetType: null,
      dragStartPosition: null,
      initialTargetPosition: null,
      containerElement: null,
      tempPosition: null
    });
  }, [dragState, layout, throttledPositionUpdate, debouncedAutoSave]);

  const handleWheel = useCallback((e: any) => { // Changed from React.WheelEvent to any
    // Safely handle preventDefault
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    if (!layout) return;
    
    // Get deltaY from different event types
    const deltaY = e?.deltaY || e?.wheelDelta || 0;
    const zoomDelta = deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(3.0, Math.max(0.2, layout.zoom + zoomDelta));
    setLayout({ ...layout, zoom: newZoom });
  }, [layout, setLayout]);



  const handleCenterView = useCallback(() => {
    // Access layout through closure but don't depend on it in deps array
    // This prevents infinite loops while still accessing current layout state
    if (!layout?.space) return;
    
    // This will trigger the auto-fit logic in LayoutCanvas
    // by resetting user interaction flag
    setLayout({ ...layout, zoom: 1.0 });
  }, [setLayout]); // Remove layout dependency to prevent infinite loops

  // Add position update callbacks for LayoutCanvas drag handlers
  const handlePositionUpdate = useCallback((
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture',
    newX: number,
    newY: number
  ) => {
    throttledPositionUpdate(targetId, targetType, newX, newY);
  }, [throttledPositionUpdate]);

  const handleDragComplete = useCallback(async (
    targetId: string,
    targetType: 'space' | 'hall' | 'stall' | 'fixture',
    finalX: number,
    finalY: number
  ) => {
    if (!layout) return;

    // Ensure final position is committed
    throttledPositionUpdate(targetId, targetType, finalX, finalY);

    // Debounced auto-save
    debouncedAutoSave(layout);
  }, [layout, throttledPositionUpdate, debouncedAutoSave]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (dragUpdateThrottleRef.current) {
      clearTimeout(dragUpdateThrottleRef.current);
    }
    if (autoSaveThrottleRef.current) {
      clearTimeout(autoSaveThrottleRef.current);
    }
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleCenterView,
    handlePositionUpdate,
    handleDragComplete,
    cleanup,
    // Export drag state for visual feedback
    dragState,
    isDragging: dragState.isDragging
  };
}; 