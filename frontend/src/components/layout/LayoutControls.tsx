'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CanvasViewport } from '@/types/layout';

interface LayoutControlsProps {
  viewport: CanvasViewport;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  className?: string;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  viewport,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  className = '',
}) => {
  const zoomPercentage = Math.round(viewport.zoom * 100);
  const canZoomIn = viewport.zoom < 3;
  const canZoomOut = viewport.zoom > 0.1;

  return (
    <Card className={`p-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Zoom Out */}
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          title="Zoom Out"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </Button>

        {/* Zoom Level Display */}
        <div className="min-w-[60px] text-center text-sm font-medium text-gray-600">
          {zoomPercentage}%
        </div>

        {/* Zoom In */}
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          title="Zoom In"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300" />

        {/* Fit to Screen */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFitToScreen}
          title="Fit to Screen"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}; 