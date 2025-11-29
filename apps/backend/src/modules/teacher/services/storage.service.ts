/**
 * Storage Service
 *
 * Service for managing local file storage for teacher reports.
 * Handles saving, retrieving, and deleting report files from the filesystem.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

export interface SaveFileResult {
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
}

/**
 * Service for local file storage operations
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  private readonly baseUploadDir: string;

  constructor() {
    // Configure base upload directory
    // Uses environment variable or defaults to 'uploads/reports' in project root
    this.baseUploadDir = process.env.REPORTS_UPLOAD_DIR || 'uploads/reports';
    this.ensureDirectoryExists(this.baseUploadDir);
  }

  /**
   * Ensure the upload directory exists
   *
   * @param dirPath - Directory path to create if not exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
        this.logger.log(`Created upload directory: ${dirPath}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create upload directory: ${errorMessage}`);
    }
  }

  /**
   * Save a file buffer to the local filesystem
   *
   * @param buffer - The file buffer to save
   * @param fileName - Original file name
   * @param subDirectory - Optional subdirectory (e.g., 'teacher-id-here')
   * @returns SaveFileResult with file path and metadata
   */
  async saveFile(
    buffer: Buffer,
    fileName: string,
    subDirectory?: string,
  ): Promise<SaveFileResult> {
    // Build the full directory path
    const targetDir = subDirectory
      ? path.join(this.baseUploadDir, subDirectory)
      : this.baseUploadDir;

    await this.ensureDirectoryExists(targetDir);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = this.sanitizeFileName(fileName);
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = path.join(targetDir, uniqueFileName);

    try {
      await fs.writeFile(filePath, buffer);
      const stats = await fs.stat(filePath);

      this.logger.log(`File saved successfully: ${filePath} (${stats.size} bytes)`);

      return {
        filePath,
        fileName: uniqueFileName,
        fileSizeBytes: stats.size,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to save file: ${errorMessage}`);
      throw new Error(`Failed to save file: ${errorMessage}`);
    }
  }

  /**
   * Retrieve a file buffer from the local filesystem
   *
   * @param filePath - The path to the file to retrieve
   * @returns Buffer containing the file contents
   * @throws NotFoundException if file does not exist
   */
  async getFile(filePath: string): Promise<Buffer> {
    // Security check: ensure path is within upload directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(this.baseUploadDir)) {
      this.logger.warn(`Attempted path traversal: ${filePath}`);
      throw new NotFoundException('File not found');
    }

    try {
      if (!existsSync(normalizedPath)) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }

      const buffer = await fs.readFile(normalizedPath);
      this.logger.log(`File retrieved successfully: ${filePath} (${buffer.length} bytes)`);

      return buffer;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to retrieve file: ${errorMessage}`);
      throw new Error(`Failed to retrieve file: ${errorMessage}`);
    }
  }

  /**
   * Delete a file from the local filesystem
   *
   * @param filePath - The path to the file to delete
   */
  async deleteFile(filePath: string): Promise<void> {
    // Security check: ensure path is within upload directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(this.baseUploadDir)) {
      this.logger.warn(`Attempted path traversal on delete: ${filePath}`);
      throw new NotFoundException('File not found');
    }

    try {
      if (!existsSync(normalizedPath)) {
        this.logger.warn(`File not found for deletion: ${filePath}`);
        return; // File already doesn't exist, consider it deleted
      }

      await fs.unlink(normalizedPath);
      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete file: ${errorMessage}`);
      throw new Error(`Failed to delete file: ${errorMessage}`);
    }
  }

  /**
   * Get file metadata without reading the file
   *
   * @param filePath - The path to the file
   * @returns File stats or null if file doesn't exist
   */
  async getFileStats(filePath: string): Promise<{ size: number; created: Date; modified: Date } | null> {
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(this.baseUploadDir)) {
      return null;
    }

    try {
      if (!existsSync(normalizedPath)) {
        return null;
      }

      const stats = await fs.stat(normalizedPath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch {
      return null;
    }
  }

  /**
   * Sanitize filename to prevent security issues
   *
   * @param fileName - Original filename
   * @returns Sanitized filename
   */
  private sanitizeFileName(fileName: string): string {
    // Remove path separators and special characters
    return fileName
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_')
      .replace(/\.+/g, '.')
      .replace(/-+/g, '-')
      .substring(0, 100); // Limit filename length
  }

  /**
   * Get the MIME type based on file extension
   *
   * @param filePath - File path with extension
   * @returns MIME type string
   */
  getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.csv': 'text/csv',
      '.html': 'text/html',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
