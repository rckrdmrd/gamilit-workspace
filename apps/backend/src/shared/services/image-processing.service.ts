import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import sharp from 'sharp';

/**
 * Image size configuration
 */
export interface ImageSize {
  name: string;
  width: number;
  height: number;
  fit?: keyof sharp.FitEnum;
}

/**
 * Processed image result
 */
export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Image versions with different sizes
 */
export interface ImageVersions {
  [sizeName: string]: ProcessedImage;
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
  valid: boolean;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

/**
 * Default logo sizes for branding
 */
export const LOGO_SIZES: ImageSize[] = [
  { name: 'small', width: 32, height: 32, fit: 'contain' },
  { name: 'medium', width: 128, height: 128, fit: 'contain' },
  { name: 'large', width: 256, height: 256, fit: 'contain' },
];

/**
 * Default favicon sizes
 */
export const FAVICON_SIZES: ImageSize[] = [
  { name: 'ico', width: 32, height: 32, fit: 'contain' },
  { name: 'apple', width: 180, height: 180, fit: 'contain' },
];

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FAVICON_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * ImageProcessingService
 *
 * @description Provides image processing capabilities for branding assets.
 * Uses sharp library for efficient image manipulation.
 *
 * Features:
 * - Resize images to multiple sizes
 * - Optimize images for web
 * - Validate image dimensions and types
 * - Generate multiple versions from single upload
 *
 * @see EXT-008 White Label System
 * @see TASK-WL-004 ImageProcessingService
 */
@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  /**
   * Validate an image buffer
   *
   * @param buffer - Image buffer to validate
   * @param maxSize - Maximum allowed file size in bytes
   * @param allowedTypes - Allowed MIME types
   * @returns Validation result with image metadata
   */
  async validateImage(
    buffer: Buffer,
    maxSize: number = MAX_LOGO_SIZE,
    allowedTypes: readonly string[] = ALLOWED_IMAGE_TYPES,
  ): Promise<ImageValidationResult> {
    try {
      // Check file size
      if (buffer.length > maxSize) {
        return {
          valid: false,
          error: `File size (${(buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
        };
      }

      // Get image metadata using sharp
      const metadata = await sharp(buffer).metadata();

      if (!metadata.format) {
        return {
          valid: false,
          error: 'Unable to determine image format',
        };
      }

      // Map sharp format to MIME type
      const formatToMime: Record<string, string> = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        svg: 'image/svg+xml',
      };

      const mimeType = formatToMime[metadata.format] || `image/${metadata.format}`;

      if (!allowedTypes.includes(mimeType)) {
        return {
          valid: false,
          error: `Image format "${metadata.format}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
      }

      return {
        valid: true,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      };
    } catch (error) {
      this.logger.error('Image validation failed', error);
      return {
        valid: false,
        error: 'Invalid or corrupted image file',
      };
    }
  }

  /**
   * Resize an image to specified dimensions
   *
   * @param buffer - Original image buffer
   * @param width - Target width
   * @param height - Target height
   * @param fit - Fit mode (cover, contain, fill, inside, outside)
   * @returns Processed image
   */
  async resize(
    buffer: Buffer,
    width: number,
    height: number,
    fit: keyof sharp.FitEnum = 'contain',
  ): Promise<ProcessedImage> {
    try {
      const processed = await sharp(buffer)
        .resize(width, height, {
          fit,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer({ resolveWithObject: true });

      return {
        buffer: processed.data,
        width: processed.info.width,
        height: processed.info.height,
        format: processed.info.format,
        size: processed.data.length,
      };
    } catch (error) {
      this.logger.error(`Resize failed for ${width}x${height}`, error);
      throw new BadRequestException('Failed to resize image');
    }
  }

  /**
   * Optimize an image for web (reduce file size)
   *
   * @param buffer - Original image buffer
   * @param format - Output format (png, jpeg, webp)
   * @param quality - Quality level (1-100)
   * @returns Optimized image buffer
   */
  async optimize(
    buffer: Buffer,
    format: 'png' | 'jpeg' | 'webp' = 'png',
    quality: number = 80,
  ): Promise<ProcessedImage> {
    try {
      let sharpInstance = sharp(buffer);

      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        case 'png':
        default:
          sharpInstance = sharpInstance.png({
            quality,
            compressionLevel: 9,
          });
          break;
      }

      const processed = await sharpInstance.toBuffer({ resolveWithObject: true });

      return {
        buffer: processed.data,
        width: processed.info.width,
        height: processed.info.height,
        format: processed.info.format,
        size: processed.data.length,
      };
    } catch (error) {
      this.logger.error('Optimization failed', error);
      throw new BadRequestException('Failed to optimize image');
    }
  }

  /**
   * Generate multiple size versions of an image
   *
   * @param buffer - Original image buffer
   * @param sizes - Array of size configurations
   * @returns Object with processed images keyed by size name
   */
  async generateVersions(
    buffer: Buffer,
    sizes: ImageSize[] = LOGO_SIZES,
  ): Promise<ImageVersions> {
    const versions: ImageVersions = {};

    // Validate original image first
    const validation = await this.validateImage(buffer);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Process each size in parallel
    const processingPromises = sizes.map(async (size) => {
      try {
        const processed = await this.resize(
          buffer,
          size.width,
          size.height,
          size.fit || 'contain',
        );
        return { name: size.name, image: processed };
      } catch (error) {
        this.logger.error(`Failed to generate ${size.name} version`, error);
        throw error;
      }
    });

    const results = await Promise.all(processingPromises);

    for (const result of results) {
      versions[result.name] = result.image;
    }

    // Also include optimized original
    try {
      versions['original'] = await this.optimize(buffer);
    } catch (error) {
      this.logger.warn('Failed to optimize original, using as-is');
      const metadata = await sharp(buffer).metadata();
      versions['original'] = {
        buffer,
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
      };
    }

    return versions;
  }

  /**
   * Generate favicon from image
   *
   * @param buffer - Original image buffer
   * @returns Favicon versions (ICO format not directly supported, using PNG)
   */
  async generateFavicon(buffer: Buffer): Promise<ImageVersions> {
    // Validate with favicon-specific limits
    const validation = await this.validateImage(buffer, MAX_FAVICON_SIZE);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    return this.generateVersions(buffer, FAVICON_SIZES);
  }

  /**
   * Convert image to specific format
   *
   * @param buffer - Original image buffer
   * @param targetFormat - Target format
   * @returns Converted image
   */
  async convert(
    buffer: Buffer,
    targetFormat: 'png' | 'jpeg' | 'webp',
  ): Promise<ProcessedImage> {
    return this.optimize(buffer, targetFormat);
  }

  /**
   * Get image metadata without processing
   *
   * @param buffer - Image buffer
   * @returns Image metadata
   */
  async getMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return sharp(buffer).metadata();
  }
}
