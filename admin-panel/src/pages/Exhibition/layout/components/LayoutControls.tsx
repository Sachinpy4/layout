import React from 'react';
import { LayoutData } from '../types/layout-types';

interface LayoutControlsProps {
  layout: LayoutData | null;
  className?: string;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  layout: _layout,
  className = ''
}) => {
  return (
    <div className={`layout-controls ${className}`}>
      {/* Zoom indicator removed */}
    </div>
  );
};

export default LayoutControls; 