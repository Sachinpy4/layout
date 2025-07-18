/**
 * 🚀 HIGH-PERFORMANCE OBJECT POOLING SYSTEM
 * 
 * Object pooling for 1000+ stalls to reduce garbage collection pressure
 * - Reuses objects instead of creating new ones
 * - Reduces memory allocation and GC pauses
 * - Optimized for Konva.js shape reuse
 * - Automatic pool size management
 */

interface PooledObject {
  id: string;
  inUse: boolean;
  lastUsed: number;
  object: any;
}

interface PoolConfig {
  initialSize: number;
  maxSize: number;
  cleanupInterval: number;
  maxIdleTime: number;
}

export class ObjectPool<T> {
  private pool: PooledObject[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private destroyFn?: (obj: T) => void;
  private config: PoolConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private stats = {
    created: 0,
    reused: 0,
    destroyed: 0,
    currentSize: 0,
    maxSizeReached: 0
  };

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    destroyFn?: (obj: T) => void,
    config: Partial<PoolConfig> = {}
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.destroyFn = destroyFn;
    this.config = {
      initialSize: config.initialSize || 10,
      maxSize: config.maxSize || 1000,
      cleanupInterval: config.cleanupInterval || 30000, // 30 seconds
      maxIdleTime: config.maxIdleTime || 60000 // 1 minute
    };

    this.initialize();
    this.startCleanupTimer();
  }

  private initialize(): void {
    // Pre-populate pool with initial objects
    for (let i = 0; i < this.config.initialSize; i++) {
      this.pool.push({
        id: `pooled_${i}`,
        inUse: false,
        lastUsed: Date.now(),
        object: this.createFn()
      });
    }
    this.stats.created = this.config.initialSize;
    this.stats.currentSize = this.config.initialSize;
  }

  acquire(): T {
    // Find an available object in the pool
    for (const pooled of this.pool) {
      if (!pooled.inUse) {
        pooled.inUse = true;
        pooled.lastUsed = Date.now();
        this.resetFn(pooled.object);
        this.stats.reused++;
        return pooled.object;
      }
    }

    // No available objects, create a new one if under limit
    if (this.pool.length < this.config.maxSize) {
      const newObject = this.createFn();
      const pooled: PooledObject = {
        id: `pooled_${this.pool.length}`,
        inUse: true,
        lastUsed: Date.now(),
        object: newObject
      };
      
      this.pool.push(pooled);
      this.stats.created++;
      this.stats.currentSize++;
      
      if (this.stats.currentSize > this.stats.maxSizeReached) {
        this.stats.maxSizeReached = this.stats.currentSize;
      }
      
      return newObject;
    }

    // Pool is full, return a new object (will be garbage collected)
    console.warn('Object pool is full, creating temporary object');
    return this.createFn();
  }

  release(obj: T): void {
    const pooled = this.pool.find(p => p.object === obj);
    if (pooled) {
      pooled.inUse = false;
      pooled.lastUsed = Date.now();
      this.resetFn(obj);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const toRemove: number[] = [];

    for (let i = 0; i < this.pool.length; i++) {
      const pooled = this.pool[i];
      if (!pooled.inUse && (now - pooled.lastUsed) > this.config.maxIdleTime) {
        toRemove.push(i);
      }
    }

    // Remove from end to start to maintain indices
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const index = toRemove[i];
      const pooled = this.pool[index];
      
      if (this.destroyFn) {
        this.destroyFn(pooled.object);
      }
      
      this.pool.splice(index, 1);
      this.stats.destroyed++;
      this.stats.currentSize--;
    }
  }

  getStats() {
    return {
      ...this.stats,
      availableObjects: this.pool.filter(p => !p.inUse).length,
      inUseObjects: this.pool.filter(p => p.inUse).length,
      totalObjects: this.pool.length
    };
  }

  clear(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    if (this.destroyFn) {
      for (const pooled of this.pool) {
        this.destroyFn(pooled.object);
      }
    }

    this.pool = [];
    this.stats = {
      created: 0,
      reused: 0,
      destroyed: 0,
      currentSize: 0,
      maxSizeReached: 0
    };
  }
}


// Stall shape pool
export const stallShapePool = new ObjectPool(
  () => ({
    group: null as any,
    rect: null as any,
    text: null as any,
    typeIcon: null as any,
    priceText: null as any,
    statusRect: null as any,
    dimensionText: null as any,
    selectionRect: null as any
  }),
  (obj) => {
    // Reset object properties
    if (obj.group) {
      obj.group.visible(true);
      obj.group.opacity(1);
      obj.group.listening(true);
    }
    if (obj.rect) {
      obj.rect.fill('#52c41a');
      obj.rect.stroke('#389e0d');
      obj.rect.strokeWidth(1);
      obj.rect.opacity(0.85);
    }
    if (obj.text) {
      obj.text.text('');
      obj.text.fontSize(10);
      obj.text.fill('#000');
    }
  },
  (obj) => {
    // Destroy Konva objects
    if (obj.group) obj.group.destroy();
    if (obj.rect) obj.rect.destroy();
    if (obj.text) obj.text.destroy();
    if (obj.typeIcon) obj.typeIcon.destroy();
    if (obj.priceText) obj.priceText.destroy();
    if (obj.statusRect) obj.statusRect.destroy();
    if (obj.dimensionText) obj.dimensionText.destroy();
    if (obj.selectionRect) obj.selectionRect.destroy();
  },
  {
    initialSize: 50,
    maxSize: 2000,
    cleanupInterval: 30000,
    maxIdleTime: 120000
  }
);

// Hall shape pool
export const hallShapePool = new ObjectPool(
  () => ({
    group: null as any,
    rect: null as any,
    text: null as any,
    dimensionText: null as any,
    stallCountText: null as any,
    selectionRect: null as any,
    grid: [] as any[]
  }),
  (obj) => {
    // Reset hall object properties
    if (obj.group) {
      obj.group.visible(true);
      obj.group.opacity(1);
    }
    if (obj.rect) {
      obj.rect.fill('#f6ffed');
      obj.rect.stroke('#52c41a');
      obj.rect.strokeWidth(2);
    }
    obj.grid = [];
  },
  (obj) => {
    // Destroy Konva objects
    if (obj.group) obj.group.destroy();
    if (obj.rect) obj.rect.destroy();
    if (obj.text) obj.text.destroy();
    if (obj.dimensionText) obj.dimensionText.destroy();
    if (obj.stallCountText) obj.stallCountText.destroy();
    if (obj.selectionRect) obj.selectionRect.destroy();
    obj.grid.forEach(line => line.destroy());
  },
  {
    initialSize: 10,
    maxSize: 100,
    cleanupInterval: 30000,
    maxIdleTime: 120000
  }
);

// Texture pool for repeated patterns
export const texturePool = new ObjectPool(
  () => ({
    canvas: document.createElement('canvas'),
    context: null as CanvasRenderingContext2D | null,
    pattern: null as any,
    size: { width: 0, height: 0 }
  }),
  (obj) => {
    if (obj.context) {
      obj.context.clearRect(0, 0, obj.size.width, obj.size.height);
    }
    obj.pattern = null;
    obj.size = { width: 0, height: 0 };
  },
  (obj) => {
    // Canvas cleanup is handled by browser
    obj.canvas = null as any;
    obj.context = null;
    obj.pattern = null;
  },
  {
    initialSize: 5,
    maxSize: 50,
    cleanupInterval: 60000,
    maxIdleTime: 300000
  }
);

// Performance monitoring
export class PoolManager {
  private static instance: PoolManager;
  private pools: Map<string, ObjectPool<any>> = new Map();
  private performanceTimer?: NodeJS.Timeout;

  static getInstance(): PoolManager {
    if (!PoolManager.instance) {
      PoolManager.instance = new PoolManager();
    }
    return PoolManager.instance;
  }

  registerPool(name: string, pool: ObjectPool<any>): void {
    this.pools.set(name, pool);
  }

  getGlobalStats() {
    const stats = {
      totalCreated: 0,
      totalReused: 0,
      totalDestroyed: 0,
      totalCurrentSize: 0,
      totalMaxSizeReached: 0,
      pools: {} as any
    };

    for (const [name, pool] of this.pools) {
      const poolStats = pool.getStats();
      stats.totalCreated += poolStats.created;
      stats.totalReused += poolStats.reused;
      stats.totalDestroyed += poolStats.destroyed;
      stats.totalCurrentSize += poolStats.currentSize;
      stats.totalMaxSizeReached += poolStats.maxSizeReached;
      stats.pools[name] = poolStats;
    }

    return stats;
  }

  startPerformanceMonitoring(interval = 10000): void {
    this.performanceTimer = setInterval(() => {
      const stats = this.getGlobalStats();
      const reuseRatio = stats.totalReused / (stats.totalCreated + stats.totalReused);
      
      console.log('🔄 Object Pool Performance:', {
        reuseRatio: `${(reuseRatio * 100).toFixed(1)}%`,
        totalObjects: stats.totalCurrentSize,
        memoryEfficiency: `${((1 - (stats.totalDestroyed / stats.totalCreated)) * 100).toFixed(1)}%`,
        pools: Object.keys(stats.pools).length
      });
    }, interval);
  }

  stopPerformanceMonitoring(): void {
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
    }
  }

  clearAllPools(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    this.pools.clear();
  }
}

// Initialize pool manager
export const poolManager = PoolManager.getInstance();
poolManager.registerPool('stallShapes', stallShapePool);
poolManager.registerPool('hallShapes', hallShapePool);
poolManager.registerPool('textures', texturePool);

// Start performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  poolManager.startPerformanceMonitoring(15000);
} 