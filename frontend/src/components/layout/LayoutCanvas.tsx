'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Stage, Layer, Group, Rect, Text, Circle, Line } from 'react-konva';
import Konva from 'konva';
import { Layout, Stall, ExhibitionHall, StallType, ExhibitionSpace } from '@/types/exhibition';
import { CanvasViewport } from '@/types/layout';

interface LayoutCanvasProps {
  layout: Layout | null;
  stallTypes: StallType[];
  viewport: CanvasViewport;
  selectedStalls: Set<string>;
  hoveredStall: string | null;
  onStallClick: (stall: Stall) => void;
  onStallHover: (stallId: string | null) => void;
  onViewportChange: (viewport: Partial<CanvasViewport>) => void;
  className?: string;
}

/*
 * 🚀 KONVA.JS 2025 PERFORMANCE FEATURES IMPLEMENTED:
 * Matching admin panel's exact coordinate system and rendering approach
 */

// Memoized Stall Component for Performance
const MemoizedStall = React.memo(({ 
  stall, 
  stallType, 
  hall,
  isSelected, 
  isHovered, 
  isAvailable,
  scale,
  onStallClick 
}: {
  stall: Stall;
  stallType: StallType | undefined;
  hall: ExhibitionHall;
  isSelected: boolean;
  isHovered: boolean;
  isAvailable: boolean;
  scale: number;
  onStallClick: (stall: Stall) => void;
}) => {
  const handleClick = useCallback(() => {
    onStallClick(stall);
  }, [stall, onStallClick]);

  if (!stallType) return null;

  // Calculate absolute position: hall position + stall relative position
  const absoluteX = hall.position.x + stall.position.x;
  const absoluteY = hall.position.y + stall.position.y;

  // Determine stall appearance
  let fillColor = stallType.color;
  let borderColor = '#374151';
  let lineWidth = 1 / scale;
  
  if (!isAvailable) {
    fillColor = '#E5E7EB'; // Gray for unavailable
    borderColor = '#9CA3AF';
  } else if (isSelected) {
    fillColor = '#3B82F6'; // Blue for selected
    borderColor = '#1D4ED8';
    lineWidth = 3 / scale;
  } else if (isHovered) {
    fillColor = '#60A5FA'; // Light blue for hovered
    borderColor = '#2563EB';
    lineWidth = 2 / scale;
  }

  return (
    <Group x={absoluteX} y={absoluteY}>
      <Rect
        width={stall.size.width}
        height={stall.size.height}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={lineWidth}
        onClick={handleClick}
        onTap={handleClick}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={isSelected ? 8 / scale : 5 / scale}
        shadowOffset={{ x: 1 / scale, y: 1 / scale }}
        shadowOpacity={0.5}
        cornerRadius={2 / scale}
        // 🚀 Konva 2025 Performance Optimizations
        transformsEnabled="position"
        perfectDrawEnabled={false}
      />
      
      {/* Stall Number (Main) */}
      <Text
        x={stall.size.width / 2}
        y={stall.size.height / 2 - 8 / scale}
        text={stall.stallNumber}
        fontSize={Math.max(10 / scale, 12 / scale)}
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fontStyle="bold"
        fill={isAvailable ? '#FFFFFF' : '#6B7280'}
        align="center"
        verticalAlign="middle"
        offsetX={stall.stallNumber.length * 6 / scale}
        offsetY={6 / scale}
        listening={false} // 🚀 Konva 2025: Disable events for text
      />
      
      {/* Stall Type Name (if space allows) */}
      {(stall.size.width > 80 && stall.size.height > 60) && stallType && (
        <Text
          x={stall.size.width / 2}
          y={stall.size.height / 2 + 8 / scale}
          text={stallType.name}
          fontSize={Math.max(6 / scale, 8 / scale)}
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill={isAvailable ? '#E5E7EB' : '#9CA3AF'}
          align="center"
          verticalAlign="middle"
          offsetX={stallType.name.length * 3 / scale}
          offsetY={4 / scale}
          listening={false}
        />
      )}
      
      {/* Premium/Special Type Indicator (top left) */}
      {stallType && ['premium', 'corner', 'island', 'vip'].includes(stallType.name.toLowerCase()) && (
        <Circle
          x={8 / scale}
          y={8 / scale}
          radius={3 / scale}
          fill="#FFD700"
          stroke="#FF8C00"
          strokeWidth={1 / scale}
          listening={false}
        />
      )}
      
      {/* Stall Dimensions (bottom right, if space allows) */}
      {(stall.size.width > 60 && stall.size.height > 40) && (
        <Text
          x={stall.size.width - 4 / scale}
          y={stall.size.height - 4 / scale}
          text={`${Math.round(stall.size.width / 50)}×${Math.round(stall.size.height / 50)}m`}
          fontSize={Math.max(5 / scale, 7 / scale)}
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fill={isAvailable ? '#D1D5DB' : '#6B7280'}
          align="right"
          verticalAlign="bottom"
          offsetX={`${Math.round(stall.size.width / 50)}×${Math.round(stall.size.height / 50)}m`.length * 2.5 / scale}
          offsetY={3 / scale}
          opacity={0.8}
          listening={false}
        />
      )}
      
      {/* Stall Price (top right, if selected or hovered and space allows) */}
      {(isSelected || isHovered) && (stall.size.width > 80 && stall.size.height > 50) && stall.totalPrice > 0 && (
        <Text
          x={stall.size.width - 4 / scale}
          y={4 / scale}
          text={`₹${Math.round(stall.totalPrice).toLocaleString()}`}
          fontSize={Math.max(6 / scale, 8 / scale)}
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fontStyle="bold"
          fill={isSelected ? '#FEF3C7' : '#F3F4F6'}
          align="right"
          offsetX={`₹${Math.round(stall.totalPrice).toLocaleString()}`.length * 3 / scale}
          offsetY={0}
          listening={false}
        />
      )}
      
      {/* Selection Indicator (adjusted position if premium indicator exists) */}
      {isSelected && (
        <Circle
          x={stall.size.width - 8 / scale}
          y={8 / scale}
          radius={4 / scale}
          fill="#FFFFFF"
          stroke="#1D4ED8"
          strokeWidth={2 / scale}
          listening={false} // 🚀 Konva 2025: Disable events for indicators
        />
      )}
    </Group>
  );
});

MemoizedStall.displayName = 'MemoizedStall';

// Memoized Hall Component
const MemoizedHall = React.memo(({ hall, scale }: { hall: ExhibitionHall; scale: number }) => {
  // Proper color handling to match admin panel
  const hallColor = hall.color || '#f6ffed'; // Default hall color from admin panel
  const borderColor = '#52c41a'; // Green border matching admin panel
  
  return (
    <Group x={hall.position.x} y={hall.position.y}>
      <Rect
        width={hall.size.width}
        height={hall.size.height}
        fill={hallColor} // Use full opacity color from admin panel
        stroke={borderColor}
        strokeWidth={2 / scale}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={5 / scale}
        shadowOffset={{ x: 2 / scale, y: 2 / scale }}
        shadowOpacity={0.5}
        cornerRadius={4 / scale}
        listening={false} // 🚀 Konva 2025: Halls are display-only
        transformsEnabled="position"
        perfectDrawEnabled={false}
      />
      
      {/* Hall name */}
      <Text
        x={hall.size.width / 2}
        y={hall.size.height / 2}
        text={hall.name}
        fontSize={14 / scale}
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fill="#52c41a" // Green text matching admin panel
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        offsetX={hall.name.length * 7 / scale}
        offsetY={7 / scale}
        listening={false} // 🚀 Konva 2025: Disable events for text
      />
      
      {/* Hall dimensions label */}
      <Text
        x={hall.size.width / 2}
        y={hall.size.height / 2 + 20 / scale}
        text={`${Math.round(hall.size.width / 50)}m × ${Math.round(hall.size.height / 50)}m`}
        fontSize={10 / scale}
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fill="#666"
        align="center"
        verticalAlign="middle"
        offsetX={`${Math.round(hall.size.width / 50)}m × ${Math.round(hall.size.height / 50)}m`.length * 3 / scale}
        offsetY={5 / scale}
        opacity={0.8}
        listening={false} // 🚀 Konva 2025: Disable events for text
      />
      
      {/* Hall grid (subtle, matching admin panel) */}
      <Group>
        {(() => {
          const gridLines = [];
          const meterInPixels = 50; // 50 pixels per meter to match admin panel
          const hallWidthInMeters = Math.floor(hall.size.width / meterInPixels);
          const hallHeightInMeters = Math.floor(hall.size.height / meterInPixels);
          
          // Vertical grid lines (every meter)
          for (let meterX = 0; meterX <= hallWidthInMeters; meterX++) {
            const pixelX = meterX * meterInPixels;
            if (pixelX <= hall.size.width) {
              gridLines.push(
                <Line
                  key={`v${meterX}m`}
                  points={[pixelX, 0, pixelX, hall.size.height]}
                  stroke="#ddd"
                  strokeWidth={1 / scale}
                  dash={[2 / scale, 2 / scale]}
                  opacity={0.5}
                  listening={false}
                />
              );
            }
          }
          
          // Horizontal grid lines (every meter)
          for (let meterY = 0; meterY <= hallHeightInMeters; meterY++) {
            const pixelY = meterY * meterInPixels;
            if (pixelY <= hall.size.height) {
              gridLines.push(
                <Line
                  key={`h${meterY}m`}
                  points={[0, pixelY, hall.size.width, pixelY]}
                  stroke="#ddd"
                  strokeWidth={1 / scale}
                  dash={[2 / scale, 2 / scale]}
                  opacity={0.5}
                  listening={false}
                />
              );
            }
          }
          
          return gridLines;
        })()}
      </Group>

      {/* Stall count indicator */}
      <Text
        text={`${hall.stallCount || 0} stalls`}
        fontSize={9 / scale}
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fill="#999"
        x={hall.size.width - 10 / scale}
        y={hall.size.height - 15 / scale}
        align="right"
        offsetX={`${hall.stallCount || 0} stalls`.length * 3 / scale}
        opacity={0.7}
        listening={false} // 🚀 Konva 2025: Disable events for text
      />
    </Group>
  );
});

MemoizedHall.displayName = 'MemoizedHall';

export const LayoutCanvas: React.FC<LayoutCanvasProps> = ({
  layout,
  stallTypes,
  viewport,
  selectedStalls,
  hoveredStall,
  onStallClick,
  onStallHover,
  onViewportChange,
  className = '',
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update container size
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
      
      onViewportChange({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [onViewportChange]);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  // Sync local state with external viewport changes (for reset view and fit to screen)
  useEffect(() => {
    setScale(viewport.zoom);
    setPosition({ x: viewport.panX, y: viewport.panY });
  }, [viewport.zoom, viewport.panX, viewport.panY]);

  // Auto-fit layout when loaded
  useEffect(() => {
    if (layout && layout.spaces && layout.spaces.length > 0 && containerSize.width > 0) {
      const space = layout.spaces[0];
      const padding = 100;
      const availableWidth = containerSize.width - padding;
      const availableHeight = containerSize.height - padding;
      
      const scaleX = availableWidth / space.width;
      const scaleY = availableHeight / space.height;
      const fitScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1
      
      const centerX = (containerSize.width - space.width * fitScale) / 2;
      const centerY = (containerSize.height - space.height * fitScale) / 2;
      
      setScale(fitScale);
      setPosition({ x: centerX, y: centerY });
      
      // Update viewport state
      onViewportChange({
        zoom: fitScale,
        panX: centerX,
        panY: centerY,
      });
    }
  }, [layout, containerSize, onViewportChange]);

  // Memoized stall data with performance optimizations and hall lookup
  const memoizedStallData = useMemo(() => {
    if (!layout || !layout.stalls || !Array.isArray(layout.stalls)) return [];
    
    return layout.stalls.map(stall => {
      const stallType = stallTypes.find(st => st._id === stall.stallTypeId);
      const hall = layout.halls?.find(h => h._id === stall.hallId);
      const isSelected = selectedStalls.has(stall._id);
      const isHovered = hoveredStall === stall._id;
      const isAvailable = stall.status === 'available' && !stall.isBooked;
      
      return {
        stall,
        stallType,
        hall,
        isSelected,
        isHovered,
        isAvailable,
        key: `${stall._id}-${isSelected}-${isHovered}-${isAvailable}` // Memoization key
      };
    }).filter(item => item.hall); // Only include stalls that have a valid hall
  }, [layout, stallTypes, selectedStalls, hoveredStall]);

  // Grid rendering function (matching admin panel approach)
  const renderGrid = useCallback(() => {
    if (!layout || !layout.spaces || layout.spaces.length === 0) return null;

    const space = layout.spaces[0];
    const gridLines = [];
    
    // Use 50 pixels per meter (matching admin panel default)
    const pixelsPerMeter = 50;
    const widthInMeters = Math.ceil(space.width / pixelsPerMeter);
    const heightInMeters = Math.ceil(space.height / pixelsPerMeter);
    
    // Vertical grid lines (every 1 meter)
    for (let meterX = 0; meterX <= widthInMeters; meterX++) {
      const pixelX = meterX * pixelsPerMeter;
      gridLines.push(
        <Line
          key={`v${meterX}m`}
          points={[pixelX, 0, pixelX, space.height]}
          stroke="#e8e8e8"
          strokeWidth={1 / scale}
          dash={[3 / scale, 3 / scale]}
          listening={false}
        />
      );
    }

    // Horizontal grid lines (every 1 meter)
    for (let meterY = 0; meterY <= heightInMeters; meterY++) {
      const pixelY = meterY * pixelsPerMeter;
      gridLines.push(
        <Line
          key={`h${meterY}m`}
          points={[0, pixelY, space.width, pixelY]}
          stroke="#e8e8e8"
          strokeWidth={1 / scale}
          dash={[3 / scale, 3 / scale]}
          listening={false}
        />
      );
    }

    return gridLines;
  }, [layout, scale]);

  // Exhibition space rendering (matching admin panel)
  const renderExhibitionSpace = useCallback(() => {
    if (!layout || !layout.spaces || layout.spaces.length === 0) {
      return (
        <Group>
          <Rect
            x={containerSize.width / 2 - 200}
            y={containerSize.height / 2 - 150}
            width={400}
            height={300}
            fill="transparent"
            stroke="#d9d9d9"
            strokeWidth={2}
            dash={[10, 5]}
          />
          <Text
            x={containerSize.width / 2}
            y={containerSize.height / 2}
            text="No layout available"
            fontSize={16}
            fill="#999"
            align="center"
            offsetX={75}
            offsetY={8}
          />
        </Group>
      );
    }

    const space = layout.spaces[0];

    return (
      <Group x={0} y={0}>
        {/* Exhibition Space Background */}
        <Rect
          width={space.width}
          height={space.height}
          fill="#ffffff"
          stroke="#1890ff"
          strokeWidth={3 / scale}
          shadowColor="rgba(0,0,0,0.1)"
          shadowBlur={10 / scale}
          shadowOffset={{ x: 0, y: 0 }}
          shadowOpacity={0.5}
          cornerRadius={4 / scale}
        />

        {/* Grid lines inside exhibition space */}
        <Group>
          {renderGrid()}
        </Group>


      </Group>
    );
  }, [layout, containerSize, scale, renderGrid]);

  // Handle wheel zoom (matching admin panel)
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const scaleBy = 1.15;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.min(Math.max(0.1, newScale), 5);

    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    };

    setScale(limitedScale);
    setPosition(newPos);

    // Update viewport state
    onViewportChange({
      zoom: limitedScale,
      panX: newPos.x,
      panY: newPos.y,
    });
  }, [scale, position, onViewportChange]);

  // Handle drag events for panning
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const newPos = { x: e.target.x(), y: e.target.y() };
    setPosition(newPos);
    
    // Update viewport state
    onViewportChange({
      panX: newPos.x,
      panY: newPos.y,
    });
  }, [onViewportChange]);

  // Handle stall hover - improved with absolute positioning
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDragging) return;

    const target = e.target;
    const stage = target.getStage();
    if (!stage) return;
    
    // Check if hovering over a stall rectangle
    if (target.getClassName() === 'Rect' && target.parent?.parent) {
      const group = target.parent;
      if (group && group.getClassName() === 'Group') {
        // Get the group's absolute position
        const groupPos = group.getAbsolutePosition();
        
        // Find the stall based on absolute position
        const hoveredStall = memoizedStallData.find(({ stall, hall }) => {
          if (!hall) return false;
          
          const stallAbsoluteX = hall.position.x + stall.position.x;
          const stallAbsoluteY = hall.position.y + stall.position.y;
          
          // Calculate the expected absolute position considering stage transform
          const expectedX = (stallAbsoluteX * scale) + position.x;
          const expectedY = (stallAbsoluteY * scale) + position.y;
          
          return Math.abs(groupPos.x - expectedX) < 5 && Math.abs(groupPos.y - expectedY) < 5;
        });
        
        onStallHover(hoveredStall?.stall._id || null);
      }
    } else {
      onStallHover(null);
    }
  }, [isDragging, memoizedStallData, scale, position, onStallHover]);

  // Show loading until client-side rendering is ready
  if (!isClient || !layout) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center bg-gray-50 ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">
            {!isClient ? 'Initializing canvas...' : 'Loading layout...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ 
        overflow: 'hidden',
        background: '#fafafa',
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        perfectDrawEnabled={!isDragging}
        listening={!isDragging}
        // 🚀 Konva 2025: Performance optimizations
        pixelRatio={
          isDragging ? 
            (isMobile ? 0.5 : 0.8) : // Reduce quality during drag for performance
            Math.min(1.5, window.devicePixelRatio || 1)
        }
      >
        {/* Unified high-performance layer with 2025 optimizations */}
        <Layer 
          ref={layerRef}
          imageSmoothingEnabled={!isDragging}
          perfectDrawEnabled={!isDragging}
          listening={!isDragging}
        >
          {renderExhibitionSpace()}
          
          {/* Exhibition Halls */}
          {layout.halls && Array.isArray(layout.halls) && 
            layout.halls.map(hall => (
              <MemoizedHall key={hall._id} hall={hall} scale={scale} />
            ))
          }

          {/* Exhibition Stalls with Absolute Positioning */}
          {memoizedStallData.map(({ stall, stallType, hall, isSelected, isHovered, isAvailable, key }) => (
            <MemoizedStall
              key={key}
              stall={stall}
              stallType={stallType}
              hall={hall!} // We filtered out null halls above
              isSelected={isSelected}
              isHovered={isHovered}
              isAvailable={isAvailable}
              scale={scale}
              onStallClick={onStallClick}
            />
          ))}
        </Layer>
      </Stage>


    </div>
  );
}; 