/**
 * 🚀 HIGH-PERFORMANCE SPATIAL INDEXING SYSTEM
 * 
 * R-Tree implementation for efficient spatial queries with 1000+ stalls per hall
 * - O(log n) search complexity instead of O(n)
 * - Optimized for viewport culling and collision detection
 * - Memory-efficient with bounding box caching
 * - Supports dynamic updates during drag operations
 */

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface SpatialNode {
  id: string;
  type: 'stall' | 'hall' | 'fixture' | 'space';
  bbox: BoundingBox;
  data: any;
  children?: SpatialNode[];
  isLeaf?: boolean;
}

interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export class SpatialIndex {
  private root: SpatialNode | null = null;
  private maxEntries = 16; // Optimal for most use cases
  private nodeCache = new Map<string, SpatialNode>();
  private bboxCache = new Map<string, BoundingBox>();

  constructor(maxEntries = 16) {
    this.maxEntries = maxEntries;
  }

  // Insert a new spatial object
  insert(id: string, type: 'stall' | 'hall' | 'fixture' | 'space', x: number, y: number, width: number, height: number, data: any): void {
    const bbox = this.createBoundingBox(x, y, width, height);
    const node: SpatialNode = {
      id,
      type,
      bbox,
      data,
      isLeaf: true
    };

    // Cache the node and bbox
    this.nodeCache.set(id, node);
    this.bboxCache.set(id, bbox);

    if (!this.root) {
      this.root = this.createNode([node]);
    } else {
      this.insertNode(this.root, node);
    }
  }

  // Update an existing spatial object
  update(id: string, x: number, y: number, width: number, height: number, data: any): void {
    // Remove old entry
    this.remove(id);
    
    // Get cached node info
    const cachedNode = this.nodeCache.get(id);
    if (cachedNode) {
      // Insert updated entry
      this.insert(id, cachedNode.type, x, y, width, height, data);
    }
  }

  // Remove a spatial object
  remove(id: string): void {
    if (!this.root) return;

    const node = this.nodeCache.get(id);
    if (node) {
      this.removeNode(this.root, node);
      this.nodeCache.delete(id);
      this.bboxCache.delete(id);
    }
  }

  // Efficient viewport culling query
  queryViewport(viewport: ViewportBounds): SpatialNode[] {
    if (!this.root) return [];

    const viewportBbox = this.createBoundingBox(
      viewport.x,
      viewport.y,
      viewport.width,
      viewport.height
    );

    // Add padding for smooth scrolling
    const padding = Math.max(viewport.width, viewport.height) * 0.1;
    viewportBbox.minX -= padding;
    viewportBbox.minY -= padding;
    viewportBbox.maxX += padding;
    viewportBbox.maxY += padding;

    return this.queryRange(viewportBbox);
  }

  // Range query for collision detection
  queryRange(bbox: BoundingBox): SpatialNode[] {
    if (!this.root) return [];

    const result: SpatialNode[] = [];
    this.searchNode(this.root, bbox, result);
    return result;
  }

  // Point query for click detection
  queryPoint(x: number, y: number): SpatialNode[] {
    const pointBbox = this.createBoundingBox(x, y, 1, 1);
    return this.queryRange(pointBbox);
  }

  // Get all nodes of a specific type
  queryByType(type: 'stall' | 'hall' | 'fixture' | 'space'): SpatialNode[] {
    const result: SpatialNode[] = [];
    if (this.root) {
      this.getAllNodes(this.root, result, type);
    }
    return result;
  }

  // Clear all data
  clear(): void {
    this.root = null;
    this.nodeCache.clear();
    this.bboxCache.clear();
  }

  // Get performance statistics
  getStats(): {
    totalNodes: number;
    leafNodes: number;
    internalNodes: number;
    maxDepth: number;
    cacheSize: number;
  } {
    if (!this.root) {
      return {
        totalNodes: 0,
        leafNodes: 0,
        internalNodes: 0,
        maxDepth: 0,
        cacheSize: 0
      };
    }

    const stats = {
      totalNodes: 0,
      leafNodes: 0,
      internalNodes: 0,
      maxDepth: 0,
      cacheSize: this.nodeCache.size
    };

    this.calculateStats(this.root, stats, 0);
    return stats;
  }

  // Private helper methods
  private createBoundingBox(x: number, y: number, width: number, height: number): BoundingBox {
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
  }

  private createNode(children: SpatialNode[]): SpatialNode {
    return {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'space', // Internal nodes don't have a specific type
      bbox: this.calculateBoundingBox(children),
      data: null,
      children,
      isLeaf: false
    };
  }

  private calculateBoundingBox(nodes: SpatialNode[]): BoundingBox {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    const bbox = { ...nodes[0].bbox };
    for (let i = 1; i < nodes.length; i++) {
      const nodeBbox = nodes[i].bbox;
      bbox.minX = Math.min(bbox.minX, nodeBbox.minX);
      bbox.minY = Math.min(bbox.minY, nodeBbox.minY);
      bbox.maxX = Math.max(bbox.maxX, nodeBbox.maxX);
      bbox.maxY = Math.max(bbox.maxY, nodeBbox.maxY);
    }

    return bbox;
  }

  private insertNode(node: SpatialNode, item: SpatialNode): void {
    if (node.isLeaf) {
      node.children = node.children || [];
      node.children.push(item);
      
      if (node.children.length > this.maxEntries) {
        this.splitNode(node);
      }
    } else {
      const bestChild = this.chooseBestChild(node, item);
      this.insertNode(bestChild, item);
    }

    // Update bounding box
    node.bbox = this.calculateBoundingBox(node.children || []);
  }

  private chooseBestChild(node: SpatialNode, item: SpatialNode): SpatialNode {
    if (!node.children || node.children.length === 0) {
      throw new Error('Cannot choose best child from empty node');
    }

    let bestChild = node.children[0];
    let bestEnlargement = this.calculateEnlargement(bestChild.bbox, item.bbox);

    for (let i = 1; i < node.children.length; i++) {
      const child = node.children[i];
      const enlargement = this.calculateEnlargement(child.bbox, item.bbox);
      
      if (enlargement < bestEnlargement) {
        bestEnlargement = enlargement;
        bestChild = child;
      }
    }

    return bestChild;
  }

  private calculateEnlargement(bbox1: BoundingBox, bbox2: BoundingBox): number {
    const combinedBbox = this.combineBoundingBoxes(bbox1, bbox2);
    const originalArea = this.calculateArea(bbox1);
    const combinedArea = this.calculateArea(combinedBbox);
    return combinedArea - originalArea;
  }

  private combineBoundingBoxes(bbox1: BoundingBox, bbox2: BoundingBox): BoundingBox {
    return {
      minX: Math.min(bbox1.minX, bbox2.minX),
      minY: Math.min(bbox1.minY, bbox2.minY),
      maxX: Math.max(bbox1.maxX, bbox2.maxX),
      maxY: Math.max(bbox1.maxY, bbox2.maxY)
    };
  }

  private calculateArea(bbox: BoundingBox): number {
    return (bbox.maxX - bbox.minX) * (bbox.maxY - bbox.minY);
  }

  private splitNode(node: SpatialNode): void {
    if (!node.children || node.children.length <= this.maxEntries) return;

    const children = node.children;
    const [group1, group2] = this.splitChildren(children);

    // Create new nodes
    const newNode1 = this.createNode(group1);
    const newNode2 = this.createNode(group2);

    // Replace current node with new nodes
    node.children = [newNode1, newNode2];
    node.isLeaf = false;
  }

  private splitChildren(children: SpatialNode[]): [SpatialNode[], SpatialNode[]] {
    // Simple split along the longest axis
    const bbox = this.calculateBoundingBox(children);
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;

    if (width > height) {
      // Split along X axis
      children.sort((a, b) => (a.bbox.minX + a.bbox.maxX) / 2 - (b.bbox.minX + b.bbox.maxX) / 2);
    } else {
      // Split along Y axis
      children.sort((a, b) => (a.bbox.minY + a.bbox.maxY) / 2 - (b.bbox.minY + b.bbox.maxY) / 2);
    }

    const splitIndex = Math.floor(children.length / 2);
    return [children.slice(0, splitIndex), children.slice(splitIndex)];
  }

  private removeNode(node: SpatialNode, item: SpatialNode): boolean {
    if (node.isLeaf) {
      if (node.children) {
        const index = node.children.findIndex(child => child.id === item.id);
        if (index !== -1) {
          node.children.splice(index, 1);
          node.bbox = this.calculateBoundingBox(node.children);
          return true;
        }
      }
      return false;
    } else {
      if (node.children) {
        for (const child of node.children) {
          if (this.removeNode(child, item)) {
            node.bbox = this.calculateBoundingBox(node.children);
            return true;
          }
        }
      }
      return false;
    }
  }

  private searchNode(node: SpatialNode, bbox: BoundingBox, result: SpatialNode[]): void {
    if (!this.intersects(node.bbox, bbox)) return;

    if (node.isLeaf) {
      if (node.children) {
        for (const child of node.children) {
          if (this.intersects(child.bbox, bbox)) {
            result.push(child);
          }
        }
      }
    } else {
      if (node.children) {
        for (const child of node.children) {
          this.searchNode(child, bbox, result);
        }
      }
    }
  }

  private intersects(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
    return !(bbox1.maxX < bbox2.minX || 
             bbox1.minX > bbox2.maxX || 
             bbox1.maxY < bbox2.minY || 
             bbox1.minY > bbox2.maxY);
  }

  private getAllNodes(node: SpatialNode, result: SpatialNode[], type?: string): void {
    if (node.isLeaf) {
      if (node.children) {
        for (const child of node.children) {
          if (!type || child.type === type) {
            result.push(child);
          }
        }
      }
    } else {
      if (node.children) {
        for (const child of node.children) {
          this.getAllNodes(child, result, type);
        }
      }
    }
  }

  private calculateStats(node: SpatialNode, stats: any, depth: number): void {
    stats.totalNodes++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (node.isLeaf) {
      stats.leafNodes++;
    } else {
      stats.internalNodes++;
      if (node.children) {
        for (const child of node.children) {
          this.calculateStats(child, stats, depth + 1);
        }
      }
    }
  }
}

// Export singleton instance
export const spatialIndex = new SpatialIndex(16); 