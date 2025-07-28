/**
 * Cleanup Service
 * 
 * Responsible for scheduling automatic cleanup tasks for:
 * - Temporary email attachment files
 * 
 * This service ensures that cleanup jobs run automatically at scheduled intervals
 * without requiring external cron jobs or scheduled tasks.
 */

import * as fs from 'fs';
import * as path from 'path';

// Root directory and temp directories to check
const ROOT_DIR = path.resolve(process.cwd());
const TEMP_DIRS = [
  ROOT_DIR,  // Main project directory
  path.join(ROOT_DIR, 'temp'),  // /temp directory
  path.join(ROOT_DIR, 'src', 'temp'),  // /src/temp directory
  path.join(ROOT_DIR, 'dist', 'temp')  // /dist/temp directory
];

// Log with timestamp
const log = (message: string): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Find and remove old temporary invoice files
export const cleanupTempFiles = async (): Promise<void> => {
  try {
    log('[INFO] Starting temporary email attachment files cleanup');
    
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    let deletedCount = 0;
    let errorCount = 0;
    
    // Process each directory where temp files might be found
    for (const dir of TEMP_DIRS) {
      // Skip if directory doesn't exist
      if (!fs.existsSync(dir)) {
        log(`[INFO] Directory doesn't exist, skipping: ${dir}`);
        continue;
      }
      
      log(`[INFO] Checking directory: ${dir}`);
      
      // Read directory contents
      const files = await fs.promises.readdir(dir);
      
      // Process each file
      for (const file of files) {
        // Check if file is a temporary invoice file
        const isTempInvoice = file.startsWith('temp-invoice-') && file.endsWith('.pdf');
        const isInvoice = file.startsWith('invoice-') && file.endsWith('.pdf');
        
        // Only process temp directories for regular 'invoice-*.pdf' files to avoid deleting important invoices
        const shouldProcess = isTempInvoice || 
          (isInvoice && dir !== ROOT_DIR); // Only delete invoice-*.pdf in temp directories
        
        if (shouldProcess) {
          const filePath = path.join(dir, file);
          
          try {
            // Get file stats
            const stats = await fs.promises.stat(filePath);
            
            // Check if file is older than one day
            if (now - stats.mtime.getTime() > ONE_DAY_MS) {
              // Delete the file
              await fs.promises.unlink(filePath);
              log(`[INFO] Deleted old temporary file: ${filePath}`);
              deletedCount++;
            } else {
              log(`[DEBUG] Skipping file that is not old enough: ${filePath} (Modified: ${stats.mtime.toISOString()})`);
            }
          } catch (fileError) {
            log(`[ERROR] Error processing file ${filePath}: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
            errorCount++;
          }
        }
      }
    }
    
    log(`[INFO] Email attachment cleanup completed. Deleted ${deletedCount} files. Encountered ${errorCount} errors.`);
    
    // Return a summary for logging
    return Promise.resolve();
  } catch (error) {
    log(`[ERROR] Error during email attachment cleanup: ${error instanceof Error ? error.message : String(error)}`);
    return Promise.reject(error);
  }
};

/**
 * Initialize the cleanup service and schedule recurring cleanup tasks
 */
export const initializeCleanupService = (): void => {
  try {
    log('[INFO] Initializing cleanup service...');
    
    // Run cleanup on startup
    cleanupTempFiles()
      .then(() => {
        log('[INFO] Initial email attachment cleanup completed successfully.');
      })
      .catch(error => {
        log(`[ERROR] Initial email attachment cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
      });
    
    // Schedule cleanup to run every 24 hours (at midnight)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    setInterval(() => {
      cleanupTempFiles()
        .then(() => {
          log('[INFO] Scheduled email attachment cleanup completed successfully.');
        })
        .catch(error => {
          log(`[ERROR] Scheduled email attachment cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
        });
    }, TWENTY_FOUR_HOURS);
    
    // Calculate time until next midnight
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
    
    // Schedule first cleanup at midnight
    setTimeout(() => {
      cleanupTempFiles()
        .then(() => {
          log('[INFO] Midnight email attachment cleanup completed successfully.');
        })
        .catch(error => {
          log(`[ERROR] Midnight email attachment cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
        });
    }, timeUntilMidnight);
    
    log(`[INFO] Cleanup service initialized. First scheduled cleanup at midnight (${nextMidnight.toISOString()})`);
  } catch (error) {
    log(`[ERROR] Failed to initialize cleanup service: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export default {
  initializeCleanupService,
  cleanupTempFiles
}; 