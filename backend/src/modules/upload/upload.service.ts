import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';


@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private directoriesInitialized = false;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get('APP_URL', 'http://localhost:3001');
    
    // Initialize directories asynchronously without blocking startup
    this.initializeDirectoriesAsync();
  }

  /**
   * Initialize upload directories asynchronously
   */
  private async initializeDirectoriesAsync(): Promise<void> {
    try {
      await this.ensureUploadDirectories();
      this.directoriesInitialized = true;
      this.logger.log('Upload directories initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize upload directories:', error.message);
      // Don't throw error - let the app start and handle directory creation on-demand
    }
  }

  /**
   * Ensure all required upload directories exist
   */
  private async ensureUploadDirectories(): Promise<void> {
    const directories = [
      'images/exhibitions/headers',
      'images/exhibitions/sponsors', 
      'images/exhibitions/footers',
      'images/users/avatars',
      'images/exhibitors/logos',
      'images/exhibitors/documents',
      'images/system',
      'documents/exhibitions',
      'documents/bookings'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.uploadDir, dir);
      try {
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
          this.logger.log(`Created directory: ${fullPath}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to create directory ${fullPath}: ${error.message}`);
        // Continue with other directories
      }
    }
  }

  /**
   * Ensure a specific directory exists (on-demand creation)
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.log(`Created directory on-demand: ${dirPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create directory ${dirPath}: ${error.message}`);
      throw new BadRequestException(`Upload directory is not accessible: ${error.message}`);
    }
  }

  /**
   * Upload and process exhibition header logo
   */
  async uploadHeaderLogo(file: Express.Multer.File, exhibitionId: string): Promise<string> {
    return this.processImage(file, 'images/exhibitions/headers', `${exhibitionId}-header`, {
      width: 400,
      height: 160,
      quality: 90
    });
  }

  /**
   * Upload and process exhibition sponsor logo
   */
  async uploadSponsorLogo(file: Express.Multer.File, exhibitionId: string, index: number): Promise<string> {
    return this.processImage(file, `images/exhibitions/sponsors`, `${exhibitionId}-sponsor-${index}`, {
      width: 300,
      height: 120,
      quality: 85
    });
  }

  /**
   * Upload and process exhibition footer logo
   */
  async uploadFooterLogo(file: Express.Multer.File, exhibitionId: string): Promise<string> {
    return this.processImage(file, `images/exhibitions/footers`, `${exhibitionId}-footer`, {
      width: 300,
      height: 100,
      quality: 85
    });
  }

  /**
   * Upload and process user avatar
   */
  async uploadUserAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    return this.processImage(file, `images/users/avatars`, `${userId}-avatar`, {
      width: 200,
      height: 200,
      quality: 80
    });
  }

  /**
   * Upload and process exhibitor logo
   */
  async uploadExhibitorLogo(file: Express.Multer.File, exhibitorId: string): Promise<string> {
    return this.processImage(file, `images/exhibitors/logos`, `${exhibitorId}-logo`, {
      width: 250,
      height: 250,
      quality: 85
    });
  }

  /**
   * Upload and process system header logo
   */
  async uploadSystemHeaderLogo(file: Express.Multer.File): Promise<string> {
    return this.processImage(file, 'images/system', `system-header-logo`, {
      width: 200,
      height: 80,
      quality: 90
    });
  }

  /**
   * Generic image processing method
   */
  private async processImage(
    file: Express.Multer.File,
    subDir: string,
    baseName: string,
    options: {
      width: number;
      height: number;
      quality: number;
    }
  ): Promise<string> {
    try {
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('File must be an image');
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size must be less than 10MB');
      }

      const uploadPath = path.join(this.uploadDir, subDir);
      
      // Ensure directory exists before writing (on-demand creation)
      await this.ensureDirectoryExists(uploadPath);
      
      // Determine output format and extension based on input format
      // Preserve transparency for PNG and WebP, convert others to JPEG
      const isTransparentFormat = file.mimetype === 'image/png' || file.mimetype === 'image/webp';
      const outputFormat = isTransparentFormat ? 'png' : 'jpeg';
      const fileExtension = isTransparentFormat ? 'png' : 'jpg';
      
      const fileName = `${baseName}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadPath, fileName);

      console.log('=== UPLOAD DEBUG ===');
      console.log('Upload directory:', uploadPath);
      console.log('File path:', filePath);
      console.log('Sub directory:', subDir);
      console.log('Original format:', file.mimetype);
      console.log('Output format:', outputFormat);
      console.log('Preserving transparency:', isTransparentFormat);

      // Process image with sharp, preserving transparency when needed
      const sharpInstance = sharp(file.buffer)
        .resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Apply format-specific processing
      if (isTransparentFormat) {
        // Preserve transparency - use PNG
        await sharpInstance
          .png({
            quality: options.quality,
            progressive: true,
            compressionLevel: 6 // Good balance between size and quality
          })
          .toFile(filePath);
      } else {
        // Convert to JPEG for non-transparent formats
        await sharpInstance
          .jpeg({
            quality: options.quality,
            progressive: true
          })
          .toFile(filePath);
      }

      // Return URL path
      return `/uploads/${subDir}/${fileName}`;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new BadRequestException(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error for file deletion failures
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filePath: string): Promise<any> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          exists: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      }
      return { exists: false };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  /**
   * Convert base64 to file (for migration from existing data)
   */
  async convertBase64ToFile(
    base64Data: string,
    subDir: string,
    baseName: string,
    options: {
      width: number;
      height: number;
      quality: number;
    }
  ): Promise<string> {
    try {
      // Extract mime type from data URL if present
      const mimeTypeMatch = base64Data.match(/^data:image\/([a-z]+);base64,/);
      const detectedMimeType = mimeTypeMatch ? `image/${mimeTypeMatch[1]}` : 'image/jpeg';
      
      // Remove data URL prefix if present
      const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      
      const uploadPath = path.join(this.uploadDir, subDir);
      
      // Ensure directory exists before writing (on-demand creation)
      await this.ensureDirectoryExists(uploadPath);
      
      // Determine output format based on detected/assumed format
      const isTransparentFormat = detectedMimeType === 'image/png' || detectedMimeType === 'image/webp';
      const fileExtension = isTransparentFormat ? 'png' : 'jpg';
      
      const fileName = `${baseName}-converted-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadPath, fileName);

      console.log('=== BASE64 CONVERSION DEBUG ===');
      console.log('Detected format:', detectedMimeType);
      console.log('Preserving transparency:', isTransparentFormat);
      console.log('Output extension:', fileExtension);

      // Process with sharp, preserving transparency when needed
      const sharpInstance = sharp(buffer)
        .resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Apply format-specific processing
      if (isTransparentFormat) {
        // Preserve transparency - use PNG
        await sharpInstance
          .png({
            quality: options.quality,
            progressive: true,
            compressionLevel: 6
          })
          .toFile(filePath);
      } else {
        // Convert to JPEG for non-transparent formats
        await sharpInstance
          .jpeg({
            quality: options.quality,
            progressive: true
          })
          .toFile(filePath);
      }

      return `/uploads/${subDir}/${fileName}`;
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      throw new BadRequestException(`Failed to convert image: ${error.message}`);
    }
  }
} 