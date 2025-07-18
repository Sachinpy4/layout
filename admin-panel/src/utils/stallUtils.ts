interface StallDimensions {
  width: number;
  height: number;
  shapeType?: 'rectangle' | 'l-shape';
  lShape?: {
    rect1Width: number;
    rect1Height: number;
    rect2Width: number;
    rect2Height: number;
    orientation: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'horizontal' | 'vertical';
  };
}

/**
 * Calculate the total area of a stall (rectangle or L-shape)
 * Following demo-src pattern exactly
 */
export const calculateStallArea = (dimensions: StallDimensions): number => {
  if (!dimensions) return 0;
  
  const shapeType = dimensions.shapeType || 'rectangle';
  
  if (shapeType === 'rectangle') {
    return dimensions.width * dimensions.height;
  }
  
  if (shapeType === 'l-shape' && dimensions.lShape) {
    const { rect1Width, rect1Height, rect2Width, rect2Height } = dimensions.lShape;
    return (rect1Width * rect1Height) + (rect2Width * rect2Height);
  }
  
  // Fallback to rectangle
  return dimensions.width * dimensions.height;
};

/**
 * Format stall dimensions for display (handles both rectangle and L-shape)
 */
export const formatStallDimensions = (dimensions: StallDimensions): string => {
  if (!dimensions) return '-';
  
  const shapeType = dimensions.shapeType || 'rectangle';
  
  if (shapeType === 'l-shape' && dimensions.lShape) {
    const { rect1Width, rect1Height, rect2Width, rect2Height } = dimensions.lShape;
    return `L-Shape (${rect1Width}×${rect1Height} + ${rect2Width}×${rect2Height})`;
  }
  
  // Rectangle or fallback
  return `${dimensions.width}×${dimensions.height}m`;
};

/**
 * Calculate base amount for a stall following demo-src pattern
 * Base amount = Rate per square meter × Actual Area
 */
export const calculateBaseAmount = (stall: { dimensions: StallDimensions; ratePerSqm: number }): number => {
  const area = calculateStallArea(stall.dimensions);
  return Math.round(stall.ratePerSqm * area * 100) / 100;
}; 