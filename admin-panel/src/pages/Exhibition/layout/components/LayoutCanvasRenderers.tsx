import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import { LayoutData, Hall, Fixture, ViewMode } from '../types/layout-types';
import MemoizedStall from './StallComponent';
import { useHallDrag, useStallDrag, useFixtureDrag } from './LayoutCanvasHooks';

interface RenderProps {
  layout: LayoutData;
  viewMode: ViewMode;
  scale: number;
  containerSize: { width: number; height: number };
  selectedHallId: string | null;
  selectedStallId: string | null;
  setSelectedHallId: (id: string | null) => void;
  setSelectedStallId: (id: string | null) => void;
  selectedHallRef: React.RefObject<any>;
  selectedStallRef: React.RefObject<any>;
  draggedStallId: string | null;
  draggedStallHallId: string | null;
  isDraggingStall: boolean;
  isSpaceInteractionAllowed: boolean;
  isHallInteractionAllowed: boolean;
  isStallInteractionAllowed: boolean;
  onMouseDown: (e: any, targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture') => void;
  onEditStall?: (stallId: string) => void;
  onEditHall?: (hallId: string) => void;
  onHallSelect?: (hallId: string) => void;
  onHallSelectForDelete?: (hallId: string | null) => void;
  onDragComplete: (targetId: string, targetType: 'space' | 'hall' | 'stall' | 'fixture', finalX: number, finalY: number) => Promise<void>;
  visibleStalls: any[];
  setIsDraggingStall: (isDragging: boolean) => void;
  setDraggedStallId: (id: string | null) => void;
  setDraggedStallHallId: (hallId: string | null) => void;
}

// Grid rendering is now handled by OptimizedDragSystem for better performance
// This function is kept for backward compatibility but returns null
export const renderGrid = (layout: LayoutData, scale: number) => {
  return null; // Grid rendering moved to OptimizedDragSystem
};

// Exhibition space rendering
export const renderExhibitionSpace = (props: RenderProps) => {
  const { layout, scale, containerSize, isSpaceInteractionAllowed, onMouseDown } = props;
  
  if (!layout.space) {
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
          text="Click 'Create Exhibition Space' to start"
          fontSize={16}
          fill="#999"
          align="center"
          offsetX={150}
          offsetY={8}
        />
      </Group>
    );
  }

  const { space } = layout;

  return (
    <Group
      x={0}
      y={0}
      onClick={(e) => {
        e.cancelBubble = true;
        if (isSpaceInteractionAllowed) {
          onMouseDown(e, space.id, 'space');
        }
      }}
    >
      {/* Exhibition Space Background */}
      <Rect
        width={space.width}
        height={space.height}
        fill="#ffffff"
        stroke={isSpaceInteractionAllowed ? "#1890ff" : "#d9d9d9"}
        strokeWidth={3 / scale}
        opacity={isSpaceInteractionAllowed ? 1 : 0.4}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={10 / scale}
        shadowOffset={{ x: 0, y: 0 }}
        shadowOpacity={0.5}
        cornerRadius={4 / scale}
      />

      {/* Grid lines inside exhibition space */}
      <Group>
        {renderGrid(layout, scale)}
      </Group>

      {/* Exhibition Space Title */}
      <Text
        text={space.name}
        fontSize={16 / scale}
        fill="#1890ff"
        fontStyle="bold"
        x={space.width / 2}
        y={20 / scale}
        align="center"
        offsetX={space.width / 4}
      />

      {/* Dimensions label */}
      <Text
        text={`${space.widthSqm}m × ${space.heightSqm}m`}
        fontSize={12 / scale}
        fill="#666"
        x={space.width / 2}
        y={40 / scale}
        align="center"
        offsetX={space.width / 4}
      />
    </Group>
  );
};

// Hall rendering with selection and enhanced interactions
export const renderHalls = (props: RenderProps) => {
  const { 
    layout, 
    viewMode, 
    scale, 
    selectedHallId, 
    setSelectedHallId, 
    selectedHallRef, 
    isDraggingStall, 
    draggedStallHallId,
    isHallInteractionAllowed,
    onMouseDown,
    onEditHall,
    onHallSelect,
    onHallSelectForDelete,
    onDragComplete
  } = props;

  if (!layout.space) return null;

  const { handleHallDragMove, handleHallDragEnd } = useHallDrag(layout, onDragComplete);

  const halls = layout.space.halls.map((hall: Hall) => {
    const isSelected = selectedHallId === hall.id;
    
    return (
      <Group
        key={hall.id}
        ref={isSelected ? selectedHallRef : null}
        x={hall.x}
        y={hall.y}
        draggable={isHallInteractionAllowed}
        onClick={(e) => {
          e.cancelBubble = true;
          if (isHallInteractionAllowed) {
            setSelectedHallId(hall.id);
            onMouseDown(e, hall.id, 'hall');
            // Also set for deletion functionality
            if (onHallSelectForDelete) {
              onHallSelectForDelete(hall.id);
            }
          } else if (viewMode === 'stall' && onHallSelect) {
            // In stall mode, allow hall selection for stall creation
            setSelectedHallId(hall.id);
            onHallSelect(hall.id);
          }
        }}
        onDblClick={(e) => {
          e.cancelBubble = true;
          if (isHallInteractionAllowed && onEditHall) {
            onEditHall(hall.id);
          }
        }}
        onDragMove={(e) => handleHallDragMove(e, hall)}
        onDragEnd={(e) => handleHallDragEnd(e, hall)}
      >
        {/* Hall background with selection highlight */}
        <Rect
          width={hall.width}
          height={hall.height}
          fill={hall.color || '#f6ffed'}
          stroke={isSelected ? "#1890ff" : (isHallInteractionAllowed ? "#52c41a" : "#d9d9d9")}
          strokeWidth={isSelected ? 3 / scale : 2 / scale}
          opacity={isHallInteractionAllowed ? 1 : (viewMode === 'stall' ? 0.8 : 0.4)}
          shadowColor="rgba(0,0,0,0.1)"
          shadowBlur={isSelected ? 8 / scale : 5 / scale}
          shadowOffset={{ x: 2 / scale, y: 2 / scale }}
          shadowOpacity={isSelected ? 0.8 : 0.5}
        />
        
        {/* Selection border glow effect */}
        {isSelected && (
          <Rect
            width={hall.width + 4 / scale}
            height={hall.height + 4 / scale}
            x={-2 / scale}
            y={-2 / scale}
            fill="transparent"
            stroke="#1890ff"
            strokeWidth={1 / scale}
            dash={[4 / scale, 4 / scale]}
            opacity={0.6}
            listening={false}
          />
        )}
        
        {/* Enhanced Hall grid with drag feedback */}
        <Group opacity={isDraggingStall && draggedStallHallId === hall.id ? 0.9 : (isSelected ? 0.7 : 0.4)}>
          {(() => {
            const meterInPixels = layout.pixelsPerSqm;
            const hallWidthInMeters = Math.floor(hall.width / meterInPixels);
            const hallHeightInMeters = Math.floor(hall.height / meterInPixels);
            const gridLines = [];
            
            // Enhanced grid only for the hall containing the dragged stall
            const isActiveHallForDrag = isDraggingStall && draggedStallHallId === hall.id;
            if (isActiveHallForDrag) {
              // Half-meter grid lines (0.5m intervals) - lighter
              for (let halfMeterX = 0.5; halfMeterX <= hallWidthInMeters; halfMeterX += 1) {
                const pixelX = halfMeterX * meterInPixels;
                if (pixelX <= hall.width) {
                  gridLines.push(
                    <Line
                      key={`hv${halfMeterX}hm`}
                      points={[pixelX, 0, pixelX, hall.height]}
                      stroke="#52c41a"
                      strokeWidth={0.5 / scale}
                      dash={[1 / scale, 2 / scale]}
                      opacity={0.6}
                      listening={false}
                    />
                  );
                }
              }
              
              for (let halfMeterY = 0.5; halfMeterY <= hallHeightInMeters; halfMeterY += 1) {
                const pixelY = halfMeterY * meterInPixels;
                if (pixelY <= hall.height) {
                  gridLines.push(
                    <Line
                      key={`hh${halfMeterY}hm`}
                      points={[0, pixelY, hall.width, pixelY]}
                      stroke="#52c41a"
                      strokeWidth={0.5 / scale}
                      dash={[1 / scale, 2 / scale]}
                      opacity={0.6}
                      listening={false}
                    />
                  );
                }
              }
            }
            
            // Full meter grid lines (1m intervals) - main grid
            for (let meterX = 0; meterX <= hallWidthInMeters; meterX++) {
              const pixelX = meterX * meterInPixels;
              if (pixelX <= hall.width) {
                gridLines.push(
                  <Line
                    key={`hv${meterX}m`}
                    points={[pixelX, 0, pixelX, hall.height]}
                    stroke={isActiveHallForDrag ? "#52c41a" : (isSelected ? "#1890ff" : "#ddd")}
                    strokeWidth={isActiveHallForDrag ? 2 / scale : 1 / scale}
                    dash={isActiveHallForDrag ? [3 / scale, 1 / scale] : [2 / scale, 2 / scale]}
                    listening={false}
                  />
                );
              }
            }
            
            for (let meterY = 0; meterY <= hallHeightInMeters; meterY++) {
              const pixelY = meterY * meterInPixels;
              if (pixelY <= hall.height) {
                gridLines.push(
                  <Line
                    key={`hh${meterY}m`}
                    points={[0, pixelY, hall.width, pixelY]}
                    stroke={isActiveHallForDrag ? "#52c41a" : (isSelected ? "#1890ff" : "#ddd")}
                    strokeWidth={isActiveHallForDrag ? 2 / scale : 1 / scale}
                    dash={isActiveHallForDrag ? [3 / scale, 1 / scale] : [2 / scale, 2 / scale]}
                    listening={false}
                  />
                );
              }
            }
            
            return gridLines;
          })()}
        </Group>
        
        {/* Hall name */}
        <Text
          text={hall.name}
          fontSize={14 / scale}
          fill={isSelected ? "#1890ff" : "#52c41a"}
          fontStyle="bold"
          x={hall.width / 2}
          y={15 / scale}
          align="center"
          offsetX={hall.width / 4}
        />
        
        {/* Hall dimensions */}
        <Text
          text={`${hall.widthSqm || Math.round(hall.width / layout.pixelsPerSqm)}m × ${hall.heightSqm || Math.round(hall.height / layout.pixelsPerSqm)}m`}
          fontSize={10 / scale}
          fill={isSelected ? "#1890ff" : "#666"}
          x={hall.width / 2}
          y={35 / scale}
          align="center"
          offsetX={hall.width / 4}
          opacity={0.8}
        />
        
        {/* Stall count indicator */}
        {hall.stalls.length > 0 && (
          <Text
            text={`${hall.stalls.length} stalls`}
            fontSize={9 / scale}
            fill={isSelected ? "#1890ff" : "#999"}
            x={hall.width - 10 / scale}
            y={hall.height - 15 / scale}
            align="right"
            offsetX={hall.width / 4}
            opacity={0.7}
          />
        )}
      </Group>
    );
  });

  return halls;
};

// Enhanced stall rendering with selection and type-based visuals
export const renderStalls = (props: RenderProps) => {
  const { 
    layout,
    scale,
    selectedStallId,
    setSelectedStallId,
    selectedStallRef,
    draggedStallId,
    visibleStalls,
    isStallInteractionAllowed,
    onMouseDown,
    onEditStall,
    onDragComplete,
    setIsDraggingStall,
    setDraggedStallId,
    setDraggedStallHallId
  } = props;

  const { handleStallDragStart, handleStallDragMove, handleStallDragEnd } = useStallDrag(
    layout,
    setIsDraggingStall,
    setDraggedStallId,
    setDraggedStallHallId,
    onDragComplete
  );

  return visibleStalls.map((stall) => {
    const isSelected = selectedStallId === stall.id;
    const isDragged = draggedStallId === stall.id;
    
    // Status-based colors with type color integration
    let fillColor = stall.color || '#52c41a';
    let strokeColor = '#389e0d';
    let opacity = 0.85;
    
    switch (stall.status) {
      case 'booked':
        fillColor = '#ff4d4f';
        strokeColor = '#cf1322';
        break;
      case 'blocked':
        fillColor = '#8c8c8c';
        strokeColor = '#595959';
        opacity = 0.6;
        break;
      case 'maintenance':
        fillColor = '#faad14';
        strokeColor = '#d48806';
        break;
      default:
        fillColor = stall.color || '#52c41a';
        strokeColor = isSelected ? '#1890ff' : '#389e0d';
    }

    // Type-based visual enhancements
    const getTypeIndicator = () => {
      const typeStyles = {
        premium: { pattern: 'diagonal', icon: '★' },
        corner: { pattern: 'corner', icon: '◢' },
        island: { pattern: 'island', icon: '◆' },
        food: { pattern: 'food', icon: '🍽' },
        meeting: { pattern: 'meeting', icon: '👥' }
      };
      return typeStyles[stall.type as keyof typeof typeStyles] || { icon: '' };
    };

    const typeInfo = getTypeIndicator();

    return (
      <Group
        key={stall.id}
        ref={isSelected ? selectedStallRef : null}
        x={stall.absoluteX}
        y={stall.absoluteY}
        draggable={isStallInteractionAllowed}
        onClick={(e) => {
          e.cancelBubble = true;
          if (isStallInteractionAllowed) {
            setSelectedStallId(stall.id);
            onMouseDown(e, stall.id, 'stall');
          }
        }}
        onDblClick={(e) => {
          e.cancelBubble = true;
          if (isStallInteractionAllowed && onEditStall) {
            onEditStall(stall.id);
          }
        }}
        onDragStart={(e) => handleStallDragStart(e, stall)}
        onDragMove={(e) => handleStallDragMove(e, stall)}
        onDragEnd={(e) => handleStallDragEnd(e, stall)}
      >
        {/* Main stall rectangle with drag enhancement */}
        <Rect
          width={stall.width}
          height={stall.height}
          fill={fillColor}
          stroke={
            draggedStallId === stall.id ? '#52c41a' : 
            (isSelected ? '#1890ff' : (isStallInteractionAllowed ? strokeColor : '#d9d9d9'))
          }
          strokeWidth={
            draggedStallId === stall.id ? 3 / scale : 
            (isSelected ? 2 / scale : 1 / scale)
          }
          opacity={isStallInteractionAllowed ? opacity : opacity * 0.4}
          shadowColor={draggedStallId === stall.id ? "rgba(82, 196, 26, 0.3)" : "rgba(0,0,0,0.1)"}
          shadowBlur={
            draggedStallId === stall.id ? 8 / scale : 
            (isSelected ? 4 / scale : 2 / scale)
          }
          shadowOffset={{ x: 1 / scale, y: 1 / scale }}
          shadowOpacity={
            draggedStallId === stall.id ? 0.8 : 
            (isSelected ? 0.6 : 0.3)
          }
          cornerRadius={2 / scale}
        />
        
        {/* Selection highlight */}
        {isSelected && (
          <Rect
            width={stall.width + 2 / scale}
            height={stall.height + 2 / scale}
            x={-1 / scale}
            y={-1 / scale}
            fill="transparent"
            stroke="#1890ff"
            strokeWidth={1 / scale}
            dash={[3 / scale, 3 / scale]}
            opacity={0.8}
            listening={false}
          />
        )}
        
        {/* Type indicator (top-left corner) */}
        {stall.type !== 'standard' && typeInfo.icon && (
          <Text
            text={typeInfo.icon}
            fontSize={8 / scale}
            fill={isSelected ? '#1890ff' : '#666'}
            x={3 / scale}
            y={3 / scale}
            opacity={0.8}
            listening={false}
          />
        )}
        
        {/* Stall number (center) */}
        <Text
          text={stall.number}
          fontSize={Math.max(8 / scale, 10 / scale)}
          fill={stall.status === 'available' ? '#000' : '#fff'}
          fontStyle="bold"
          x={stall.width / 2}
          y={stall.height / 2}
          align="center"
          offsetX={stall.width / 4}
          offsetY={6 / scale}
          listening={false}
        />
        
        {/* Price (bottom center, only if selected or large enough) */}
        {(isSelected || (stall.width > 60 && stall.height > 40)) && (stall.price || 0) > 0 && (
          <Text
            text={`$${(stall.price || 0).toLocaleString()}`}
            fontSize={Math.max(6 / scale, 8 / scale)}
            fill={isSelected ? '#1890ff' : '#666'}
            x={stall.width / 2}
            y={stall.height - 8 / scale}
            align="center"
            offsetX={stall.width / 4}
            opacity={0.8}
            listening={false}
          />
        )}
        
        {/* Status indicator (top-right corner) */}
        {stall.status !== 'available' && (
          <Rect
            width={8 / scale}
            height={8 / scale}
            x={stall.width - 10 / scale}
            y={2 / scale}
            fill={strokeColor}
            cornerRadius={1 / scale}
            listening={false}
          />
        )}
        
        {/* Dimensions (bottom-left, only if selected) */}
        {isSelected && (
          <Text
            text={`${stall.widthSqm || Math.round(stall.width / layout.pixelsPerSqm * 10) / 10}×${stall.heightSqm || Math.round(stall.height / layout.pixelsPerSqm * 10) / 10}m`}
            fontSize={6 / scale}
            fill="#1890ff"
            x={2 / scale}
            y={stall.height - 8 / scale}
            opacity={0.8}
            listening={false}
          />
        )}
      </Group>
    );
  });
};

// Fixture rendering
export const renderFixtures = (props: RenderProps) => {
  const { layout, scale, onMouseDown, onDragComplete } = props;

  const { handleFixtureDragMove, handleFixtureDragEnd } = useFixtureDrag(layout, onDragComplete);

  return layout.fixtures
    .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
    .map((fixture: Fixture) => (
      <Group
        key={fixture.id}
        x={fixture.x}
        y={fixture.y}
        draggable={true}
        onClick={(e) => {
          e.cancelBubble = true;
          onMouseDown(e, fixture.id, 'fixture');
        }}
        onDragMove={(e) => handleFixtureDragMove(e, fixture)}
        onDragEnd={(e) => handleFixtureDragEnd(e, fixture)}
      >
        <Rect
          width={fixture.width}
          height={fixture.height}
          fill={fixture.color || '#f9f0ff'}
          stroke="#fa541c"
          strokeWidth={1 / scale}
          opacity={0.7}
          cornerRadius={4 / scale}
        />
        <Text
          text={fixture.name}
          fontSize={9 / scale}
          fill="#000"
          fontStyle="bold"
          x={fixture.width / 2}
          y={fixture.height / 2}
          align="center"
          offsetX={fixture.width / 4}
          offsetY={4 / scale}
        />
      </Group>
    ));
}; 