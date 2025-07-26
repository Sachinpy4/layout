import { useCallback, useEffect, useState } from 'react';
import { LayoutData } from '../types/layout-types';
import { snapStallToGrid } from './LayoutCanvasUtils';

// Custom hook for handling wheel zoom functionality
export const useWheelZoom = (
  scale: number,
  setScale: (scale: number) => void,
  setPosition: (position: { x: number; y: number }) => void,
  setHasUserInteracted: (hasUserInteracted: boolean) => void,
  stageRef: React.RefObject<any>
) => {
  return useCallback((e: any) => {
    e.evt.preventDefault();
    if (!stageRef.current) return;

    // Mark that user has manually interacted with zoom
    setHasUserInteracted(true);

    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.15;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.min(Math.max(0.1, newScale), 20);

    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    };

    setScale(limitedScale);
    setPosition(newPos);
  }, [scale, setScale, setPosition, setHasUserInteracted, stageRef]);
};

// Custom hook for handling stage drag functionality
export const useStageDrag = (
  setIsDragging: (isDragging: boolean) => void,
  setPosition: (position: { x: number; y: number }) => void,
  setHasUserInteracted: (hasUserInteracted: boolean) => void,
  layerRef: React.RefObject<any>,
  stageRef: React.RefObject<any>
) => {
  const handleDragStart = useCallback((e: any) => {
    if (e.target === stageRef.current) {
      setIsDragging(true);
      if (layerRef.current) {
        layerRef.current.listening(false); // Replaced hitGraphEnabled
      }
    }
  }, [setIsDragging, layerRef, stageRef]);

  const handleDragEnd = useCallback((e: any) => {
    if (e.target === stageRef.current) {
      setHasUserInteracted(true);
      setPosition({ x: e.target.x(), y: e.target.y() });
      setIsDragging(false);
      if (layerRef.current) {
        layerRef.current.listening(true); // Replaced hitGraphEnabled
      }
    }
  }, [setIsDragging, layerRef, stageRef, setHasUserInteracted, setPosition]);

  return { handleDragStart, handleDragEnd };
};

// Custom hook for handling stall drag functionality
export const useStallDrag = (
  layout: LayoutData,
  setIsDraggingStall: (isDragging: boolean) => void,
  setDraggedStallId: (id: string | null) => void,
  setDraggedStallHallId: (hallId: string | null) => void,
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
) => {
  const handleStallDragStart = useCallback((e: any, stall: any) => {
    e.cancelBubble = true;
    setIsDraggingStall(true);
    setDraggedStallId(stall.id);
    setDraggedStallHallId(stall.hallId);
  }, [setIsDraggingStall, setDraggedStallId, setDraggedStallHallId]);

  const handleStallDragMove = useCallback((e: any, stall: any) => {
    e.cancelBubble = true;
    const node = e.target;
    const localX = node.x() - stall.absoluteX + stall.x; // Convert to hall-relative coordinates
    const localY = node.y() - stall.absoluteY + stall.y;

    // Find the parent hall to constrain movement
    const hall = layout.space?.halls.find(h => h.id === stall.hallId);
    if (hall) {
      // Apply grid snapping during drag
      const snapped = snapStallToGrid(localX, localY, stall.hallId, layout);
      const boundedX = Math.max(0, Math.min(snapped.x, hall.width - stall.width));
      const boundedY = Math.max(0, Math.min(snapped.y, hall.height - stall.height));
      
      // Convert back to absolute coordinates
      node.x(stall.absoluteX - stall.x + boundedX);
      node.y(stall.absoluteY - stall.y + boundedY);
    }
  }, [layout]);

  const handleStallDragEnd = useCallback((e: any, stall: any) => {
    e.cancelBubble = true;
    
    // Reset drag state
    setIsDraggingStall(false);
    setDraggedStallId(null);
    setDraggedStallHallId(null);
    
    // Calculate final position relative to the parent hall
    const finalX = e.target.x() - stall.absoluteX + stall.x;
    const finalY = e.target.y() - stall.absoluteY + stall.y;
    
    // Apply final grid snapping
    const snappedFinal = snapStallToGrid(finalX, finalY, stall.hallId, layout);
    
    // Update position and trigger auto-save
    onDragComplete(stall.id, 'stall', snappedFinal.x, snappedFinal.y);
  }, [layout, setIsDraggingStall, setDraggedStallId, setDraggedStallHallId, onDragComplete]);

  return { handleStallDragStart, handleStallDragMove, handleStallDragEnd };
};

// Custom hook for handling hall drag functionality
export const useHallDrag = (
  layout: LayoutData,
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
) => {
  const handleHallDragMove = useCallback((e: any, hall: any) => {
    e.cancelBubble = true;
    const node = e.target;
    const localX = node.x();
    const localY = node.y();

    if (layout.space) {
      const boundedX = Math.max(0, Math.min(localX, layout.space.width - hall.width));
      const boundedY = Math.max(0, Math.min(localY, layout.space.height - hall.height));
      node.x(Math.round(boundedX));
      node.y(Math.round(boundedY));
    }
  }, [layout]);

  const handleHallDragEnd = useCallback((e: any, hall: any) => {
    e.cancelBubble = true;
    const finalX = e.target.x();
    const finalY = e.target.y();
    
    // Update position and trigger auto-save
    onDragComplete(hall.id, 'hall', finalX, finalY);
  }, [onDragComplete]);

  return { handleHallDragMove, handleHallDragEnd };
};

// Custom hook for handling fixture drag functionality
export const useFixtureDrag = (
  layout: LayoutData,
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>
) => {
  const handleFixtureDragMove = useCallback((e: any, fixture: any) => {
    e.cancelBubble = true;
    const node = e.target;
    const localX = node.x();
    const localY = node.y();

    // Constrain fixtures within exhibition space
    if (layout.space) {
      const boundedX = Math.max(0, Math.min(localX, layout.space.width - fixture.width));
      const boundedY = Math.max(0, Math.min(localY, layout.space.height - fixture.height));
      node.x(Math.round(boundedX));
      node.y(Math.round(boundedY));
    }
  }, [layout]);

  const handleFixtureDragEnd = useCallback((e: any, fixture: any) => {
    e.cancelBubble = true;
    const finalX = e.target.x();
    const finalY = e.target.y();
    
    // Update position and trigger auto-save
    onDragComplete(fixture.id, 'fixture', finalX, finalY);
  }, [onDragComplete]);

  return { handleFixtureDragMove, handleFixtureDragEnd };
};

// Custom hook for handling mouse events
export const useMouseEvents = (
  setIsStageHovered: (isHovered: boolean) => void
) => {
  const handleMouseEnter = useCallback(() => {
    setIsStageHovered(true);
  }, [setIsStageHovered]);

  const handleMouseLeave = useCallback(() => {
    setIsStageHovered(false);
  }, [setIsStageHovered]);

  return { handleMouseEnter, handleMouseLeave };
};

// Custom hook for mobile detection
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};

// Custom hook for container size management
export const useContainerSize = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({ 
          width: Math.max(300, clientWidth), 
          height: Math.max(200, clientHeight)
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  return containerSize;
}; 