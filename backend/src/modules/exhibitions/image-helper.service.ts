import { Injectable } from '@nestjs/common';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ImageHelperService {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Check if a string is base64 data
   */
  isBase64(data: string): boolean {
    if (!data || typeof data !== 'string') return false;
    
    // Check if it starts with data URL
    if (data.startsWith('data:image/')) return true;
    
    // Check if it looks like base64 (length multiple of 4, contains only base64 chars)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return data.length % 4 === 0 && base64Regex.test(data) && data.length > 100;
  }

  /**
   * Check if a string is a file path
   */
  isFilePath(data: string): boolean {
    if (!data || typeof data !== 'string') return false;
    
    // Check if it starts with /uploads/
    return data.startsWith('/uploads/') || data.startsWith('uploads/');
  }

  /**
   * Get the image URL for display (handles both base64 and file paths)
   */
  getImageUrl(data: string, baseUrl?: string): string {
    if (!data) return '';
    
    if (this.isBase64(data)) {
      return data; // Return base64 as-is for immediate display
    }
    
    if (this.isFilePath(data)) {
      // Return full URL for file paths
      const cleanPath = data.startsWith('/') ? data : `/${data}`;
      return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
    }
    
    return data; // Return as-is if format is unknown
  }

  /**
   * Convert base64 images to files during exhibition update
   */
  async migrateExhibitionImages(
    exhibitionId: string, 
    imageData: {
      headerLogo?: string;
      sponsorLogos?: string[];
      footerLogo?: string;
    }
  ): Promise<{
    headerLogo?: string;
    sponsorLogos?: string[];
    footerLogo?: string;
  }> {
    const result: any = {};

    try {
      // Handle header logo
      if (imageData.headerLogo && this.isBase64(imageData.headerLogo)) {
        console.log('Converting header logo from base64 to file');
        result.headerLogo = await this.uploadService.convertBase64ToFile(
          imageData.headerLogo,
          'images/exhibitions/headers',
          `${exhibitionId}-header`,
          { width: 400, height: 160, quality: 90 }
        );
      } else if (imageData.headerLogo) {
        result.headerLogo = imageData.headerLogo; // Keep existing file path
      }

      // Handle sponsor logos
      if (imageData.sponsorLogos && Array.isArray(imageData.sponsorLogos)) {
        result.sponsorLogos = [];
        for (let i = 0; i < imageData.sponsorLogos.length; i++) {
          const logo = imageData.sponsorLogos[i];
          if (this.isBase64(logo)) {
            console.log(`Converting sponsor logo ${i} from base64 to file`);
            const filePath = await this.uploadService.convertBase64ToFile(
              logo,
              'images/exhibitions/sponsors',
              `${exhibitionId}-sponsor-${i}`,
              { width: 300, height: 120, quality: 85 }
            );
            result.sponsorLogos.push(filePath);
          } else {
            result.sponsorLogos.push(logo); // Keep existing file path
          }
        }
      }

      // Handle footer logo
      if (imageData.footerLogo && this.isBase64(imageData.footerLogo)) {
        console.log('Converting footer logo from base64 to file');
        result.footerLogo = await this.uploadService.convertBase64ToFile(
          imageData.footerLogo,
          'images/exhibitions/footers',
          `${exhibitionId}-footer`,
          { width: 300, height: 100, quality: 85 }
        );
      } else if (imageData.footerLogo) {
        result.footerLogo = imageData.footerLogo; // Keep existing file path
      }

    } catch (error) {
      console.error('Error migrating exhibition images:', error);
      // Return original data if migration fails
      return imageData;
    }

    return result;
  }

  /**
   * Clean up old files when updating images
   */
  async cleanupOldImages(oldData: {
    headerLogo?: string;
    sponsorLogos?: string[];
    footerLogo?: string;
  }): Promise<void> {
    try {
      if (oldData.headerLogo && this.isFilePath(oldData.headerLogo)) {
        await this.uploadService.deleteFile(oldData.headerLogo);
      }

      if (oldData.sponsorLogos && Array.isArray(oldData.sponsorLogos)) {
        for (const logo of oldData.sponsorLogos) {
          if (this.isFilePath(logo)) {
            await this.uploadService.deleteFile(logo);
          }
        }
      }

      if (oldData.footerLogo && this.isFilePath(oldData.footerLogo)) {
        await this.uploadService.deleteFile(oldData.footerLogo);
      }
    } catch (error) {
      console.error('Error cleaning up old images:', error);
      // Don't throw error for cleanup failures
    }
  }

  /**
   * Prepare exhibition data for API response
   */
  prepareExhibitionResponse(exhibition: any, baseUrl?: string): any {
    const result = { ...exhibition };

    if (result.headerLogo) {
      result.headerLogo = this.getImageUrl(result.headerLogo, baseUrl);
    }

    if (result.sponsorLogos && Array.isArray(result.sponsorLogos)) {
      result.sponsorLogos = result.sponsorLogos.map((logo: string) => 
        this.getImageUrl(logo, baseUrl)
      );
    }

    if (result.footerLogo) {
      result.footerLogo = this.getImageUrl(result.footerLogo, baseUrl);
    }

    return result;
  }
} 