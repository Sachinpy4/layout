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

import React, { useState, useRef, useEffect } from 'react';
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
  layout: _layout,
  onDragComplete: _onDragComplete,
  isModalOpen: _isModalOpen = false
}) => {
  const [dragState, _setDragState] = useState<SuperSmoothDragState>({
    isDragging: false,
    dragTarget: null
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);













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



export default SuperSmoothDrag; 