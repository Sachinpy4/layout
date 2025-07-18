import React from 'react';
import { Group, Rect, Text } from 'react-konva';

// Memoized Stall Component for Performance
const MemoizedStall = React.memo(({ 
  stall, 
  isSelected, 
  isDragged, 
  scale, 
  isStallInteractionAllowed,
  onStallClick,
  onStallDoubleClick,
  onStallDragStart,
  onStallDragMove,
  onStallDragEnd
}: {
  stall: any;
  isSelected: boolean;
  isDragged: boolean;
  scale: number;
  isStallInteractionAllowed: boolean;
  onStallClick: (e: any) => void;
  onStallDoubleClick: (e: any) => void;
  onStallDragStart: (e: any) => void;
  onStallDragMove: (e: any) => void;
  onStallDragEnd: (e: any) => void;
}) => {
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
      x={stall.absoluteX}
      y={stall.absoluteY}
      draggable={isStallInteractionAllowed}
      onClick={onStallClick}
      onDblClick={onStallDoubleClick}
      onDragStart={onStallDragStart}
      onDragMove={onStallDragMove}
      onDragEnd={onStallDragEnd}
      transformsEnabled="position" // 2025 Performance: Only enable position transforms
      perfectDrawEnabled={false} // 2025 Performance: Disable for better performance
    >
      {/* Main stall rectangle with drag enhancement */}
      <Rect
        width={stall.width}
        height={stall.height}
        fill={fillColor}
        stroke={
          isDragged ? '#52c41a' : 
          (isSelected ? '#1890ff' : (isStallInteractionAllowed ? strokeColor : '#d9d9d9'))
        }
        strokeWidth={
          isDragged ? 3 / scale : 
          (isSelected ? 2 / scale : 1 / scale)
        }
        opacity={isStallInteractionAllowed ? opacity : opacity * 0.4}
        shadowColor={isDragged ? "rgba(82, 196, 26, 0.3)" : "rgba(0,0,0,0.1)"}
        shadowBlur={
          isDragged ? 8 / scale : 
          (isSelected ? 4 / scale : 2 / scale)
        }
        shadowOffset={{ x: 1 / scale, y: 1 / scale }}
        shadowOpacity={
          isDragged ? 0.8 : 
          (isSelected ? 0.6 : 0.3)
        }
        cornerRadius={2 / scale}
        perfectDrawEnabled={false} // 2025 Performance: Disable perfect drawing
        transformsEnabled="position" // 2025 Performance: Only position transforms
        listening={!isDragged} // 2025 Performance: Disable listening during drag
      />
      
      {/* Selection highlight - only render when selected */}
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
      
      {/* Simplified rendering during drag for performance */}
      {!isDragged && (
        <>
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
              fill={fillColor}
              cornerRadius={1 / scale}
              listening={false}
            />
          )}
        </>
      )}
      
      {/* Stall number (always visible) */}
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
    </Group>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  return (
    prevProps.stall.id === nextProps.stall.id &&
    prevProps.stall.x === nextProps.stall.x &&
    prevProps.stall.y === nextProps.stall.y &&
    prevProps.stall.absoluteX === nextProps.stall.absoluteX &&
    prevProps.stall.absoluteY === nextProps.stall.absoluteY &&
    prevProps.stall.status === nextProps.stall.status &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragged === nextProps.isDragged &&
    prevProps.scale === nextProps.scale &&
    prevProps.isStallInteractionAllowed === nextProps.isStallInteractionAllowed
  );
});

export default MemoizedStall; 