import React from 'react';
import { Space } from 'antd';
import { LayoutData } from '../types/layout-types';

interface LayoutControlsProps {
  layout: LayoutData | null;
  className?: string;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  layout,
  className = ''
}) => {
  return (
    <div className={`layout-controls ${className}`}>
      {/* Zoom indicator removed */}
    </div>
  );
};

export default LayoutControls; 