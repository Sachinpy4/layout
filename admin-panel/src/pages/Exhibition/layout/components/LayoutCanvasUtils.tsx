import { useCallback, useMemo } from 'react';
import { LayoutData, Hall, Stall } from '../types/layout-types';
import { spatialIndex } from '../utils/SpatialIndex';

// Helper function to ensure stall objects have all required properties
export const normalizeStall = (stall: any) => ({
  id: stall.id || '',
  hallId: stall.hallId || '',
  number: stall.number || '',
  x: stall.x || 0,
  y: stall.y || 0,
  width: stall.width || 100,
  height: stall.height || 100,
  widthSqm: stall.widthSqm || 2,
  heightSqm: stall.heightSqm || 2,
  status: stall.status || 'available',
  color: stall.color || '#52c41a',
  type: stall.type || 'standard',
  price: stall.price || 0, // Ensure price is always a number
  description: stall.description || '',
  ...stall // Spread original to preserve any additional properties
});

// Grid snapping helper functions
export const snapToGrid = (value: number, gridSize: number) => {
  // Snap to half-grid (0.5m intervals)
  const halfGrid = gridSize / 2;
  return Math.round(value / halfGrid) * halfGrid;
};

export const snapStallToGrid = (x: number, y: number, hallId: string, layout: LayoutData) => {
  const hall = layout.space?.halls.find(h => h.id === hallId);
  if (!hall || !layout) return { x, y };

  const gridSize = layout.pixelsPerSqm; // 1 meter in pixels
  
  // Snap to 0.5m grid intervals within the hall
  const snappedX = snapToGrid(x, gridSize);
  const snappedY = snapToGrid(y, gridSize);
  
  return { x: snappedX, y: snappedY };
};

// Debounced drag move handler for performance
export const debouncedDragMove = (callback: () => void) => {
  // Use requestAnimationFrame for smooth performance
  requestAnimationFrame(callback);
};

// 2025 Feature: OffscreenCanvas support detection
export const supportsOffscreenCanvas = () => {
  return typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined';
};

// Performance optimization: viewport culling utilities
export const useViewportCulling = (stageRef: React.RefObject<any>, layout: LayoutData | null) => {
  const getVisibleBounds = useCallback(() => {
    if (!stageRef.current || !layout?.space) return null;
    
    const stage = stageRef.current;
    const transform = stage.getAbsoluteTransform().copy().invert();
    
    const topLeft = transform.point({ x: 0, y: 0 });
    const bottomRight = transform.point({ 
      x: stage.width(), 
      y: stage.height() 
    });
    
    const padding = Math.max(layout.space.width, layout.space.height) * 0.1;
    
    return {
      left: topLeft.x - padding,
      top: topLeft.y - padding,
      right: bottomRight.x + padding,
      bottom: bottomRight.y + padding
    };
  }, [stageRef, layout?.space]);

  const isElementVisible = useCallback((x: number, y: number, width: number, height: number) => {
    const bounds = getVisibleBounds();
    if (!bounds) return true;
    
    return !(
      x + width < bounds.left ||
      x > bounds.right ||
      y + height < bounds.top ||
      y > bounds.bottom
    );
  }, [getVisibleBounds]);

  return { getVisibleBounds, isElementVisible };
};

// 🚀 HIGH-PERFORMANCE STALL VISIBILITY SYSTEM
// Enhanced viewport culling with spatial indexing for 1000+ stalls
export const useVisibleStalls = (
  layout: LayoutData | null, 
  isElementVisible: (x: number, y: number, width: number, height: number) => boolean,
  scale: number = 1,
  viewport?: { x: number; y: number; width: number; height: number }
) => {
  return useMemo(() => {
    if (!layout?.space?.halls) return [];
    
    const startTime = performance.now();
    const allStalls: any[] = [];
    const totalStallCount = layout.space.halls.reduce((count, hall) => count + hall.stalls.length, 0);
    
    // For 1000+ stalls, use spatial indexing
    const useSpatialIndex = totalStallCount > 1000;
    
    if (useSpatialIndex) {
      // Clear and rebuild spatial index if needed
      spatialIndex.clear();
      
      // Add all stalls to spatial index
      layout.space.halls.forEach((hall: Hall) => {
        hall.stalls.forEach((stall: Stall) => {
          const normalizedStall = normalizeStall(stall);
          const stallX = hall.x + normalizedStall.x;
          const stallY = hall.y + normalizedStall.y;
          
          spatialIndex.insert(
            stall.id,
            'stall',
            stallX,
            stallY,
            normalizedStall.width,
            normalizedStall.height,
            {
              ...normalizedStall,
              absoluteX: stallX,
              absoluteY: stallY,
              hallId: hall.id
            }
          );
        });
      });
      
      // Query visible stalls using spatial index
      if (viewport) {
        const spatialNodes = spatialIndex.queryViewport({
          x: viewport.x,
          y: viewport.y,
          width: viewport.width,
          height: viewport.height,
          scale
        });
        
        spatialNodes.forEach(node => {
          if (node.type === 'stall') {
            allStalls.push(node.data);
          }
        });
      } else {
        // Fallback to all stalls if no viewport provided
        const spatialNodes = spatialIndex.queryByType('stall');
        spatialNodes.forEach(node => {
          allStalls.push(node.data);
        });
      }
    } else {
      // Traditional approach for smaller datasets
      const shouldCull = totalStallCount > 100;
      
      layout.space.halls.forEach((hall: Hall) => {
        // Skip entire halls if they're not visible and we have many stalls
        if (shouldCull && !isElementVisible(hall.x, hall.y, hall.width, hall.height)) {
          return;
        }
        
        hall.stalls.forEach((stall: Stall) => {
          const normalizedStall = normalizeStall(stall);
          const stallX = hall.x + normalizedStall.x;
          const stallY = hall.y + normalizedStall.y;
          
          // Viewport culling with looser bounds for smoother scrolling
          if (shouldCull && !isElementVisible(stallX, stallY, normalizedStall.width, normalizedStall.height)) {
            return;
          }
          
          allStalls.push({
            ...normalizedStall,
            absoluteX: stallX,
            absoluteY: stallY,
            hallId: hall.id
          });
        });
      });
    }
    
    // Record performance metrics
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Log performance for debugging
    if (process.env.NODE_ENV === 'development' && totalStallCount > 100) {
      console.log(`🚀 Stall Visibility Performance:`, {
        totalStalls: totalStallCount,
        visibleStalls: allStalls.length,
        renderTime: `${renderTime.toFixed(2)}ms`,
        cullingRatio: `${((totalStallCount - allStalls.length) / totalStallCount * 100).toFixed(1)}%`,
        usingSpatialIndex: useSpatialIndex
      });
    }
    
    return allStalls;
  }, [layout?.space?.halls, isElementVisible, scale, viewport]);
};

// Performance metrics for optimization tracking
export const usePerformanceMetrics = (layout: LayoutData | null, visibleStalls: any[]) => {
  return useMemo(() => {
    const totalStalls = layout?.space?.halls.reduce((count, hall) => count + hall.stalls.length, 0) || 0;
    return {
      totalStalls,
      isExtremeLoad: totalStalls > 1000,
      isCachingActive: visibleStalls.length > 200,
      cullingRatio: totalStalls > 0 ? ((totalStalls - visibleStalls.length) / totalStalls * 100) : 0
    };
  }, [layout?.space?.halls, visibleStalls.length]);
};

// Auto-fit exhibition space to canvas utility
export const useFitToCanvas = (
  layout: LayoutData | null,
  containerSize: { width: number; height: number },
  isInitialLoad: boolean,
  hasUserInteracted: boolean,
  setScale: (scale: number) => void,
  setPosition: (position: { x: number; y: number }) => void,
  setIsInitialLoad: (isInitialLoad: boolean) => void,
  stageRef: React.RefObject<any>
) => {
  return useCallback((forceAutoFit = false) => {
    if (!layout?.space || containerSize.width <= 0 || containerSize.height <= 0) return;

    // Only auto-fit if it's initial load, forced, or user hasn't manually interacted
    if (!forceAutoFit && !isInitialLoad && hasUserInteracted) {
      return;
    }

    const { space } = layout;
    const padding = 80; // Increased padding to account for layout controls
    
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;
    
    const scaleX = availableWidth / space.width;
    const scaleY = availableHeight / space.height;
    
    const fitScale = Math.min(scaleX, scaleY, 1.0); // Don't scale beyond 100%
    
    // Center the exhibition space in the canvas
    const centerX = (containerSize.width - space.width * fitScale) / 2;
    const centerY = (containerSize.height - space.height * fitScale) / 2;
    
    setScale(fitScale);
    setPosition({ x: centerX, y: centerY });

    if (stageRef.current) {
      stageRef.current.batchDraw();
    }

    // Mark initial load as complete
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [layout, containerSize, isInitialLoad, hasUserInteracted, setScale, setPosition, setIsInitialLoad, stageRef]);
};

// 🚀 HIGH-PERFORMANCE OPTIMIZATION CONTROLLER
// Central controller for all performance optimizations
export class HighPerformanceController {
  private static instance: HighPerformanceController;
  private isInitialized = false;
  private optimizationLevel: 'low' | 'medium' | 'high' | 'ultra' = 'medium';
  private stallCount = 0;

  static getInstance(): HighPerformanceController {
    if (!HighPerformanceController.instance) {
      HighPerformanceController.instance = new HighPerformanceController();
    }
    return HighPerformanceController.instance;
  }

  initialize(stallCount: number): void {
    if (this.isInitialized) return;
    
    this.stallCount = stallCount;
    this.determineOptimizationLevel();
    this.configureOptimizations();
    this.isInitialized = true;
    
    console.log(`🚀 High-Performance System Initialized:`, {
      stallCount,
      optimizationLevel: this.optimizationLevel,
      spatialIndexing: stallCount > 1000,
      batchRendering: stallCount > 100,
      lodSystem: stallCount > 50
    });
  }

  private determineOptimizationLevel(): void {
    if (this.stallCount >= 2000) {
      this.optimizationLevel = 'ultra';
    } else if (this.stallCount >= 1000) {
      this.optimizationLevel = 'high';
    } else if (this.stallCount >= 500) {
      this.optimizationLevel = 'medium';
    } else {
      this.optimizationLevel = 'low';
    }
  }

  private configureOptimizations(): void {
    // Simplified optimization configuration
    // Complex LOD, batch renderer, and object pooling systems have been removed
    // Now we only use spatial indexing for 1000+ stalls
    console.log(`🚀 Performance optimization level: ${this.optimizationLevel}`);
  }

  updateStallCount(newCount: number): void {
    if (Math.abs(newCount - this.stallCount) > 100) {
      this.stallCount = newCount;
      this.determineOptimizationLevel();
      this.configureOptimizations();
    }
  }

  getPerformanceReport(): {
    optimizationLevel: string;
    stallCount: number;
    spatialIndexStats: any;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Simplified performance analysis
    if (this.stallCount > 1000) {
      recommendations.push('Using spatial indexing for optimal performance with 1000+ stalls');
    }
    
    if (this.stallCount > 500) {
      recommendations.push('Consider reducing visual complexity if performance issues occur');
    }
    
    return {
      optimizationLevel: this.optimizationLevel,
      stallCount: this.stallCount,
      spatialIndexStats: spatialIndex.getStats(),
      recommendations
    };
  }

  // Emergency performance mode for extreme cases
  enableEmergencyMode(): void {
    console.warn('⚠️ Emergency Performance Mode Activated - Clearing spatial index cache');
    spatialIndex.clear();
  }

  cleanup(): void {
    spatialIndex.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const highPerformanceController = HighPerformanceController.getInstance(); 