import React from 'react';
import { Stall, StallType } from '@/types/exhibition';

interface StallTooltipProps {
  stall: Stall | null;
  stallType: StallType | null;
  mousePosition: { x: number; y: number } | null;
  visible: boolean;
}

export default function StallTooltip({ stall, stallType, mousePosition, visible }: StallTooltipProps) {
  if (!visible || !stall || !stallType || !mousePosition) {
    return null;
  }

  // Calculate dimensions in meters (assuming the size is already in meters or needs conversion)
  const widthInMeters = Math.round(stall.dimensions?.width / 50) || Math.round(stall.size.width / 50);
  const heightInMeters = Math.round(stall.dimensions?.height / 50) || Math.round(stall.size.height / 50);
  
  const tooltipText = `${stallType.name} - ${widthInMeters}m x ${heightInMeters}m`;
  
  // Position tooltip directly above the center of the hovered stall
  const tooltipStyle = {
    position: 'fixed' as const,
    left: mousePosition.x,
    top: mousePosition.y - 50, // Position above the stall with some margin
    zIndex: 1000,
    pointerEvents: 'none' as const,
    transform: 'translateX(-50%)', // Center horizontally above the stall
  };

  return (
    <div
      style={tooltipStyle}
      className="bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg text-sm font-medium whitespace-nowrap"
    >
      {tooltipText}
      {/* Small arrow pointing down to the stall center */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
    </div>
  );
} 