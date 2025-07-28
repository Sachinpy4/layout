/**
 * PDF Cache Service
 * 
 * Handles caching of generated PDF documents to improve performance.
 * Implements a file-based cache with cleanup and management functions.
 */

import { join } from 'path';
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import crypto from 'crypto';
import { cpus } from 'os';

// Cache directory for PDFs
export const PDF_CACHE_DIR = join(process.cwd(), 'pdf-cache');

// Set cache retention period - default 30 days
export const PDF_CACHE_MAX_AGE = parseInt(process.env.PDF_CACHE_MAX_AGE || '2592000000', 10); // 30 days in ms

// Set maximum cache size - default 500MB
export const PDF_CACHE_MAX_SIZE = parseInt(process.env.PDF_CACHE_MAX_SIZE || '524288000', 10); // 500MB in bytes

// Limit concurrent PDF generation to avoid memory issues
export const MAX_CONCURRENT_PDF_GENERATIONS = Math.max(1, Math.min(2, Math.floor(cpus().length / 2)));
let currentPdfGenerations = 0;
const pdfGenerationQueue: Array<() => void> = [];

/**
 * Generates a cache key from invoice data
 */
export const generateCacheKey = (invoice: any): string => {
  try {
    // Extract required entities
    const bookingId = invoice.bookingId;
    const exhibition = bookingId?.exhibitionId;
    
    // Create data fingerprint with updatedAt timestamps from all relevant entities
    const dataToHash = {
      id: invoice._id?.toString(),
      bookingId: bookingId?._id?.toString(),
      amount: invoice.amount,
      status: invoice.status,
      updatedAt: invoice.updatedAt?.toString(),
      // Include these timestamps to detect changes in related data
      exhibitionId: exhibition?._id?.toString(),
      exhibitionUpdatedAt: exhibition?.updatedAt?.toString(),
      bookingUpdatedAt: bookingId?.updatedAt?.toString()
    };
    
    const hash = crypto.createHash('md5').update(JSON.stringify(dataToHash)).digest('hex');
    
    return hash;
  } catch (error) {
    console.error('[ERROR] Failed to generate cache key:', error);
    // Fallback to a simpler key in case of error
    return crypto.createHash('md5').update(invoice._id.toString() + Date.now()).digest('hex');
  }
};

/**
 * Gets a cached PDF if available and still valid
 */
export const getCachedPDF = (cacheKey: string, invoice: any, ignoreTimestamp = false): Buffer | null => {
  const cachePath = join(PDF_CACHE_DIR, `${cacheKey}.pdf`);
  const metaPath = join(PDF_CACHE_DIR, `${cacheKey}.json`);
  
  try {
    // Check if cache file exists
    if (!existsSync(cachePath) || !existsSync(metaPath)) {
      return null;
    }
    
    // Read metadata
    const metaJson = readFileSync(metaPath, 'utf8');
    const metadata = JSON.parse(metaJson);
    
    // Check if cache is still valid (within retention period)
    const now = Date.now();
    const cacheTime = metadata.timestamp || 0;
    
    // Skip timestamp validation if ignoreTimestamp is true - use for emergency fallback
    if (!ignoreTimestamp && now - cacheTime > PDF_CACHE_MAX_AGE) {
      // Delete expired files
      try {
        unlinkSync(cachePath);
        unlinkSync(metaPath);
      } catch (err) {
        console.error(`[ERROR] Failed to delete expired cache files: ${err}`);
      }
      return null;
    }
    
    // Check if invoice data has changed - only if we have the necessary data and not ignoring timestamps
    if (!ignoreTimestamp && invoice.updatedAt) {
      const invoiceUpdatedTime = new Date(invoice.updatedAt).getTime();
      
      // If the invoice was updated after the cache was created
      if (invoiceUpdatedTime > cacheTime) {
        return null;
      }
      
      // Also check if related booking or exhibition was updated
      if (metadata.bookingUpdatedAt && invoice.bookingId?.updatedAt) {
        const bookingUpdatedTime = new Date(invoice.bookingId.updatedAt).getTime();
        if (bookingUpdatedTime > cacheTime) {
          return null;
        }
      }
      
      // Check if exhibition was updated
      if (metadata.exhibitionUpdatedAt && invoice.bookingId?.exhibitionId?.updatedAt) {
        const exhibitionUpdatedTime = new Date(invoice.bookingId.exhibitionId.updatedAt).getTime();
        if (exhibitionUpdatedTime > cacheTime) {
          return null;
        }
      }
    }
    
    // All checks passed, read and return the cached PDF
    return readFileSync(cachePath);
  } catch (err) {
    console.error(`[ERROR] Error reading from cache:`, err);
    return null;
  }
};

/**
 * Caches a generated PDF
 */
export const cachePDF = (cacheKey: string, pdfBuffer: Buffer, invoice: any): void => {
  try {
    // Ensure cache directory exists
    if (!existsSync(PDF_CACHE_DIR)) {
      mkdirSync(PDF_CACHE_DIR, { recursive: true });
    }
    
    // Write PDF file
    const cachePath = join(PDF_CACHE_DIR, `${cacheKey}.pdf`);
    writeFileSync(cachePath, pdfBuffer);
    
    // Write metadata including timestamps for later validation
    const metaPath = join(PDF_CACHE_DIR, `${cacheKey}.json`);
    
    const bookingId = invoice.bookingId;
    const exhibition = bookingId?.exhibitionId;
    
    const metadata = {
      invoiceId: invoice._id.toString(),
      bookingId: bookingId?._id.toString(),
      exhibitionId: exhibition?._id.toString(),
      timestamp: Date.now(),
      invoiceUpdatedAt: invoice.updatedAt?.toString(),
      bookingUpdatedAt: bookingId?.updatedAt?.toString(),
      exhibitionUpdatedAt: exhibition?.updatedAt?.toString()
    };
    
    writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error(`[ERROR] Failed to cache PDF:`, error);
    // Continue without caching - non-critical error
  }
};

/**
 * Clean up old cache files
 */
export const cleanupPdfCache = () => {
  try {
    if (!existsSync(PDF_CACHE_DIR)) {
      return;
    }
    
    const now = Date.now();
    const files = readdirSync(PDF_CACHE_DIR);
    let totalSize = 0;
    const fileDetails = [];
    
    // Collect file info
    for (const file of files) {
      try {
        const filePath = join(PDF_CACHE_DIR, file);
        const stats = statSync(filePath);
        totalSize += stats.size;
        
        // Only process PDF files and their metadata
        if (file.endsWith('.pdf') || file.endsWith('.json')) {
          fileDetails.push({
            path: filePath,
            name: file,
            size: stats.size,
            lastAccessed: stats.atimeMs,
            lastModified: stats.mtimeMs
          });
        }
      } catch (err) {
        console.error(`[ERROR] Failed to process cache file: ${file}`, err);
      }
    }
    
    // Remove files by age
    for (const file of fileDetails) {
      if (now - file.lastModified > PDF_CACHE_MAX_AGE) {
        try {
          unlinkSync(file.path);
        } catch (err) {
          console.error(`[ERROR] Failed to remove expired cache file: ${file.name}`, err);
        }
      }
    }
    
    // Recalculate size and check if we need to clean up more
    let currentSize = 0;
    const remainingFiles = fileDetails
      .filter(file => existsSync(file.path))
      .map(file => {
        try {
          const stats = statSync(file.path);
          return {
            ...file,
            size: stats.size,
            lastAccessed: stats.atimeMs
          };
        } catch (err) {
          return file;
        }
      })
      .sort((a, b) => a.lastAccessed - b.lastAccessed); // Sort by last accessed (oldest first)
    
    for (const file of remainingFiles) {
      currentSize += file.size;
    }
    
    // If still over limit, remove oldest accessed files until under limit
    if (currentSize > PDF_CACHE_MAX_SIZE) {
      for (const file of remainingFiles) {
        if (currentSize <= PDF_CACHE_MAX_SIZE) break;
        
        try {
          if (existsSync(file.path)) {
            unlinkSync(file.path);
            currentSize -= file.size;
          }
        } catch (err) {
          console.error(`[ERROR] Failed to remove cache file: ${file.name}`, err);
        }
      }
    }
  } catch (error) {
    console.error('[ERROR] Failed to clean up PDF cache:', error);
  }
};

/**
 * Queue system for PDF generation to limit concurrent operations
 */
export const queuePdfGeneration = async (generateFn: () => Promise<Buffer>): Promise<Buffer> => {
  // If we can process immediately, do so
  if (currentPdfGenerations < MAX_CONCURRENT_PDF_GENERATIONS) {
    currentPdfGenerations++;
    try {
      return await generateFn();
    } catch (error) {
      console.error('[ERROR] PDF generation failed in queue processor:', error);
      throw error;
    } finally {
      currentPdfGenerations--;
      
      // Process next item in queue if any
      if (pdfGenerationQueue.length > 0) {
        const nextItem = pdfGenerationQueue.shift();
        if (nextItem) nextItem();
      }
    }
  }
  
  // If too many concurrent generations, add to queue with timeout
  return new Promise((resolve, reject) => {
    // Add timeout to prevent indefinite waiting
    const timeoutMs = 120000; // 2 minutes timeout
    const timeout = setTimeout(() => {
      // Remove from queue if still there
      const index = pdfGenerationQueue.indexOf(processItem);
      if (index > -1) {
        pdfGenerationQueue.splice(index, 1);
      }
      reject(new Error(`PDF generation queue timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    
    // Function to execute when this item's turn comes
    const processItem = async () => {
      clearTimeout(timeout);
      currentPdfGenerations++;
      try {
        const result = await generateFn();
        resolve(result);
      } catch (error) {
        console.error('[ERROR] Queued PDF generation failed:', error);
        reject(error);
      } finally {
        currentPdfGenerations--;
        
        // Process next item in queue
        if (pdfGenerationQueue.length > 0) {
          const nextItem = pdfGenerationQueue.shift();
          if (nextItem) nextItem();
        }
      }
    };
    
    // Add to processing queue
    pdfGenerationQueue.push(processItem);
  });
};

// Initialize the cache directory and set up cleanup task
export const initializeCache = () => {
  try {
    if (!existsSync(PDF_CACHE_DIR)) {
      mkdirSync(PDF_CACHE_DIR, { recursive: true });
    }
    
    // Run cleanup on startup
    cleanupPdfCache();
    
    // Schedule cleanup to run every 24 hours
    setInterval(cleanupPdfCache, 24 * 60 * 60 * 1000);
    
    return true;
  } catch (error) {
    console.error('[ERROR] Error creating PDF cache directory:', error);
    return false;
  }
}; 