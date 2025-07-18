/**
 * 🚀 LEVEL-OF-DETAIL (LOD) SYSTEM
 * 
 * Dynamic rendering optimization based on zoom level and stall size
 * - Renders simplified versions when zoomed out
 * - Detailed versions when zoomed in
 * - Automatic detail level switching
 * - Batch rendering for similar LOD levels
 */

export enum LODLevel {
  HIDDEN = 0,     // Not visible, don't render
  BASIC = 1,      // Just a colored rectangle
  SIMPLE = 2,     // Rectangle + number
  STANDARD = 3,   // Rectangle + number + type indicator
  DETAILED = 4,   // All elements including price, status, etc.
  FULL = 5        // All elements + animations + effects
}

export interface LODThresholds {
  hidden: number;     // Below this scale, don't render
  basic: number;      // Basic colored rectangle
  simple: number;     // Add stall number
  standard: number;   // Add type indicator
  detailed: number;   // Add price, status indicators
  full: number;       // Full detail with effects
}

export interface LODRenderData {
  level: LODLevel;
  stallSize: { width: number; height: number };
  scale: number;
  showNumber: boolean;
  showType: boolean;
  showPrice: boolean;
  showStatus: boolean;
  showDimensions: boolean;
  showEffects: boolean;
  fontSize: number;
  strokeWidth: number;
  cornerRadius: number;
  shadowBlur: number;
}

export class LevelOfDetailManager {
  private static instance: LevelOfDetailManager;
  private thresholds: LODThresholds = {
    hidden: 0.05,     // Below 5% scale
    basic: 0.1,       // 10% scale
    simple: 0.3,      // 30% scale
    standard: 0.6,    // 60% scale
    detailed: 1.0,    // 100% scale
    full: 1.5         // 150% scale and above
  };

  private lastFrameTime = 0;
  private frameTime = 0;
  private targetFPS = 60;
  private adaptiveThresholds = false;
  private performanceMode = false;

  static getInstance(): LevelOfDetailManager {
    if (!LevelOfDetailManager.instance) {
      LevelOfDetailManager.instance = new LevelOfDetailManager();
    }
    return LevelOfDetailManager.instance;
  }

  // Calculate LOD level based on scale and stall size
  calculateLOD(scale: number, stallWidth: number, stallHeight: number): LODRenderData {
    const effectiveScale = scale;
    const stallSize = { width: stallWidth * scale, height: stallHeight * scale };
    
    // Determine base LOD level
    let level = LODLevel.HIDDEN;
    if (effectiveScale >= this.thresholds.full) {
      level = LODLevel.FULL;
    } else if (effectiveScale >= this.thresholds.detailed) {
      level = LODLevel.DETAILED;
    } else if (effectiveScale >= this.thresholds.standard) {
      level = LODLevel.STANDARD;
    } else if (effectiveScale >= this.thresholds.simple) {
      level = LODLevel.SIMPLE;
    } else if (effectiveScale >= this.thresholds.basic) {
      level = LODLevel.BASIC;
    }

    // Performance mode adjustments
    if (this.performanceMode) {
      level = Math.max(LODLevel.HIDDEN, level - 1);
    }

    // Adaptive adjustments based on frame time
    if (this.adaptiveThresholds && this.frameTime > (1000 / this.targetFPS)) {
      level = Math.max(LODLevel.HIDDEN, level - 1);
    }

    return this.createRenderData(level, stallSize, effectiveScale);
  }

  private createRenderData(level: LODLevel, stallSize: { width: number; height: number }, scale: number): LODRenderData {
    const baseData: LODRenderData = {
      level,
      stallSize,
      scale,
      showNumber: false,
      showType: false,
      showPrice: false,
      showStatus: false,
      showDimensions: false,
      showEffects: false,
      fontSize: 8,
      strokeWidth: 1,
      cornerRadius: 0,
      shadowBlur: 0
    };

    switch (level) {
      case LODLevel.HIDDEN:
        return baseData;

      case LODLevel.BASIC:
        return {
          ...baseData,
          strokeWidth: 0.5 / scale,
          cornerRadius: 1 / scale
        };

      case LODLevel.SIMPLE:
        return {
          ...baseData,
          showNumber: true,
          fontSize: Math.max(6, 8 / scale),
          strokeWidth: 0.5 / scale,
          cornerRadius: 1 / scale
        };

      case LODLevel.STANDARD:
        return {
          ...baseData,
          showNumber: true,
          showType: stallSize.width > 40 && stallSize.height > 30,
          fontSize: Math.max(8, 10 / scale),
          strokeWidth: 1 / scale,
          cornerRadius: 2 / scale
        };

      case LODLevel.DETAILED:
        return {
          ...baseData,
          showNumber: true,
          showType: true,
          showPrice: stallSize.width > 60 && stallSize.height > 40,
          showStatus: true,
          fontSize: Math.max(8, 10 / scale),
          strokeWidth: 1 / scale,
          cornerRadius: 2 / scale,
          shadowBlur: 2 / scale
        };

      case LODLevel.FULL:
        return {
          ...baseData,
          showNumber: true,
          showType: true,
          showPrice: true,
          showStatus: true,
          showDimensions: true,
          showEffects: true,
          fontSize: Math.max(8, 10 / scale),
          strokeWidth: 2 / scale,
          cornerRadius: 2 / scale,
          shadowBlur: 4 / scale
        };

      default:
        return baseData;
    }
  }

  // Batch stalls by LOD level for efficient rendering
  batchStallsByLOD(stalls: any[], scale: number): Map<LODLevel, { stalls: any[], renderData: LODRenderData }> {
    const batches = new Map<LODLevel, { stalls: any[], renderData: LODRenderData }>();

    for (const stall of stalls) {
      const renderData = this.calculateLOD(scale, stall.width, stall.height);
      
      if (renderData.level === LODLevel.HIDDEN) continue;

      if (!batches.has(renderData.level)) {
        batches.set(renderData.level, { stalls: [], renderData });
      }

      batches.get(renderData.level)!.stalls.push(stall);
    }

    return batches;
  }

  // Update performance metrics
  updatePerformanceMetrics(frameTime: number): void {
    this.frameTime = frameTime;
    this.lastFrameTime = performance.now();

    // Enable performance mode if FPS drops below threshold
    const fps = 1000 / frameTime;
    this.performanceMode = fps < (this.targetFPS * 0.7); // 70% of target FPS
  }

  // Enable/disable adaptive thresholds
  setAdaptiveThresholds(enabled: boolean): void {
    this.adaptiveThresholds = enabled;
  }

  // Set performance mode manually
  setPerformanceMode(enabled: boolean): void {
    this.performanceMode = enabled;
  }

  // Update thresholds (for fine-tuning)
  updateThresholds(newThresholds: Partial<LODThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Get current settings
  getSettings() {
    return {
      thresholds: this.thresholds,
      performanceMode: this.performanceMode,
      adaptiveThresholds: this.adaptiveThresholds,
      currentFPS: this.frameTime > 0 ? 1000 / this.frameTime : 0,
      targetFPS: this.targetFPS
    };
  }

  // Calculate optimal render order for batched rendering
  getOptimalRenderOrder(batches: Map<LODLevel, any>): LODLevel[] {
    const levels = Array.from(batches.keys());
    
    // Sort by LOD level (render simpler first for better performance)
    return levels.sort((a, b) => a - b);
  }

  // Determine if stall should use instanced rendering
  shouldUseInstancedRendering(stallCount: number, level: LODLevel): boolean {
    // Use instanced rendering for large numbers of simple stalls
    if (level <= LODLevel.SIMPLE && stallCount > 50) return true;
    if (level <= LODLevel.BASIC && stallCount > 100) return true;
    return false;
  }

  // Get simplified color palette for performance
  getSimplifiedColor(originalColor: string, level: LODLevel): string {
    if (level <= LODLevel.SIMPLE) {
      // Use simplified color palette
      const colorMap: { [key: string]: string } = {
        '#52c41a': '#5c5', // Available - green
        '#ff4d4f': '#f44', // Booked - red
        '#8c8c8c': '#888', // Blocked - gray
        '#faad14': '#fa4', // Maintenance - orange
        '#1890ff': '#18f', // Selected - blue
      };
      return colorMap[originalColor] || originalColor;
    }
    return originalColor;
  }

  // Calculate visibility culling bounds
  calculateVisibilityBounds(viewport: { x: number, y: number, width: number, height: number }, scale: number) {
    const padding = Math.max(viewport.width, viewport.height) * 0.2; // 20% padding
    
    return {
      minX: viewport.x - padding,
      minY: viewport.y - padding,
      maxX: viewport.x + viewport.width + padding,
      maxY: viewport.y + viewport.height + padding
    };
  }

  // Check if stall is visible in viewport
  isStallVisible(stall: any, bounds: any): boolean {
    return !(
      stall.absoluteX > bounds.maxX ||
      stall.absoluteX + stall.width < bounds.minX ||
      stall.absoluteY > bounds.maxY ||
      stall.absoluteY + stall.height < bounds.minY
    );
  }
}

// Specialized LOD configurations for different scenarios
export const LODConfigurations = {
  // High-performance mode for 1000+ stalls
  HighPerformance: {
    hidden: 0.08,
    basic: 0.15,
    simple: 0.4,
    standard: 0.8,
    detailed: 1.2,
    full: 2.0
  },

  // Balanced mode for general use
  Balanced: {
    hidden: 0.05,
    basic: 0.1,
    simple: 0.3,
    standard: 0.6,
    detailed: 1.0,
    full: 1.5
  },

  // Quality mode for detailed work
  Quality: {
    hidden: 0.03,
    basic: 0.05,
    simple: 0.2,
    standard: 0.4,
    detailed: 0.7,
    full: 1.0
  }
};

// Export singleton instance
export const lodManager = LevelOfDetailManager.getInstance();

// Performance utilities
export class LODPerformanceMonitor {
  private renderTimes: number[] = [];
  private maxSamples = 60; // 1 second at 60fps

  recordRenderTime(time: number): void {
    this.renderTimes.push(time);
    if (this.renderTimes.length > this.maxSamples) {
      this.renderTimes.shift();
    }
  }

  getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    return this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
  }

  getMaxRenderTime(): number {
    return Math.max(...this.renderTimes);
  }

  getFPS(): number {
    const avgTime = this.getAverageRenderTime();
    return avgTime > 0 ? 1000 / avgTime : 0;
  }

  shouldReduceLOD(): boolean {
    const avgTime = this.getAverageRenderTime();
    return avgTime > 16.67; // More than 16.67ms (60fps threshold)
  }

  getPerformanceScore(): number {
    const fps = this.getFPS();
    return Math.min(100, (fps / 60) * 100);
  }
}

export const lodPerformanceMonitor = new LODPerformanceMonitor(); 