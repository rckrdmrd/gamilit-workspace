import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

import { TenantConfiguration } from '../entities/tenant-configuration.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import {
  BrandingConfigDto,
  ColorPaletteDto,
  LogoSizesDto,
} from '../dto/branding/branding-config.dto';
import { UpdateBrandingDto } from '../dto/branding/update-branding.dto';
import {
  ImageProcessingService,
  LOGO_SIZES,
  FAVICON_SIZES,
  MAX_LOGO_SIZE,
  MAX_FAVICON_SIZE,
  ALLOWED_IMAGE_TYPES,
} from '@shared/services';

/**
 * Branding configuration key in tenant_configurations
 */
const BRANDING_CONFIG_KEY = 'branding';

/**
 * Default branding colors
 */
const DEFAULT_COLORS: ColorPaletteDto = {
  primary: '#2563eb',
  secondary: '#10b981',
  accent: '#f59e0b',
  background: '#ffffff',
  text: '#1f2937',
};

/**
 * Default platform name
 */
const DEFAULT_PLATFORM_NAME = 'GAMILIT';

/**
 * BrandingService
 *
 * @description Service for managing tenant branding configuration.
 * Handles logo/favicon uploads, color schemes, and CSS variable generation.
 *
 * @see EXT-008 White Label System (Tier 1)
 * @see ET-WL-002 Tenant Customization
 */
@Injectable()
export class BrandingService {
  private readonly logger = new Logger(BrandingService.name);
  private readonly uploadBasePath: string;

  constructor(
    @InjectRepository(TenantConfiguration, 'auth')
    private readonly configRepo: Repository<TenantConfiguration>,
    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepo: Repository<Tenant>,
    private readonly imageProcessingService: ImageProcessingService,
  ) {
    this.uploadBasePath = path.join(process.cwd(), 'uploads', 'branding');
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadBasePath);
    } catch {
      await fs.mkdir(this.uploadBasePath, { recursive: true });
    }
  }

  /** Validate tenantId format and resolve safe directory path */
  private resolveTenantDir(tenantId: string): string {
    if (!/^[0-9a-f-]{36}$/i.test(tenantId)) {
      throw new BadRequestException('Invalid tenant ID format');
    }
    const tenantDir = path.resolve(this.uploadBasePath, tenantId);
    if (!tenantDir.startsWith(path.resolve(this.uploadBasePath))) {
      throw new BadRequestException('Invalid path');
    }
    return tenantDir;
  }

  /**
   * Get branding configuration for a tenant
   *
   * @param tenantId - Tenant UUID
   * @returns BrandingConfigDto with complete branding configuration
   * @throws NotFoundException if tenant does not exist
   */
  async getBrandingConfig(tenantId: string): Promise<BrandingConfigDto> {
    // Verify tenant exists
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Get branding configuration
    const config = await this.configRepo.findOne({
      where: {
        tenant_id: tenantId,
        config_key: BRANDING_CONFIG_KEY,
      },
    });

    // Return config or defaults
    const brandingValue = config?.config_value as Record<string, unknown> | undefined;

    return {
      tenantId,
      platformName: (brandingValue?.platformName as string) || tenant.name || DEFAULT_PLATFORM_NAME,
      logo: brandingValue?.logo as LogoSizesDto | undefined,
      favicon: brandingValue?.favicon as string | undefined,
      colors: (brandingValue?.colors as ColorPaletteDto) || DEFAULT_COLORS,
      customCss: brandingValue?.customCss as string | undefined,
      updatedAt: config?.updated_at || new Date(),
    };
  }

  /**
   * Update branding configuration for a tenant
   *
   * @param tenantId - Tenant UUID
   * @param dto - Update data
   * @returns Updated BrandingConfigDto
   * @throws NotFoundException if tenant does not exist
   */
  async updateBrandingConfig(
    tenantId: string,
    dto: UpdateBrandingDto,
  ): Promise<BrandingConfigDto> {
    // Verify tenant exists
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Get existing configuration or create new
    let config = await this.configRepo.findOne({
      where: {
        tenant_id: tenantId,
        config_key: BRANDING_CONFIG_KEY,
      },
    });

    const existingValue = (config?.config_value || {}) as Record<string, unknown>;

    // Merge colors if provided
    let updatedColors = existingValue.colors as ColorPaletteDto | undefined;
    if (dto.colors) {
      updatedColors = {
        ...DEFAULT_COLORS,
        ...(updatedColors || {}),
        ...dto.colors,
      };
    }

    // Build updated value
    const updatedValue: Record<string, unknown> = {
      ...existingValue,
      ...(dto.platformName !== undefined && { platformName: dto.platformName }),
      ...(updatedColors && { colors: updatedColors }),
      ...(dto.customCss !== undefined && { customCss: dto.customCss }),
    };

    if (config) {
      // Update existing
      config.config_value = updatedValue;
      await this.configRepo.save(config);
    } else {
      // Create new
      config = this.configRepo.create({
        tenant_id: tenantId,
        config_key: BRANDING_CONFIG_KEY,
        config_type: 'branding',
        config_value: updatedValue,
        is_overridable: true,
      });
      await this.configRepo.save(config);
    }

    this.logger.log(`Updated branding config for tenant ${tenantId}`);

    return this.getBrandingConfig(tenantId);
  }

  /**
   * Upload and process a logo image
   *
   * @param tenantId - Tenant UUID
   * @param file - Uploaded file (Multer)
   * @returns URL of the uploaded logo (medium size)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Express.Multer.File requires @types/multer
  async uploadLogo(tenantId: string, file: any): Promise<string> {
    // Validate tenant
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Validate file
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    // Validate image
    const validation = await this.imageProcessingService.validateImage(
      file.buffer,
      MAX_LOGO_SIZE,
      ALLOWED_IMAGE_TYPES,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Generate versions
    const versions = await this.imageProcessingService.generateVersions(
      file.buffer,
      LOGO_SIZES,
    );

    // Save files (path-traversal safe)
    const tenantDir = this.resolveTenantDir(tenantId);
    await fs.mkdir(tenantDir, { recursive: true });

    const logoUrls: LogoSizesDto = {};

    for (const [sizeName, processedImage] of Object.entries(versions)) {
      const filename = `logo-${sizeName}.png`;
      const filePath = path.join(tenantDir, filename);
      await fs.writeFile(filePath, processedImage.buffer);

      // Build URL (relative path for now, can be configured for CDN)
      const relativePath = `/uploads/branding/${tenantId}/${filename}`;
      (logoUrls as Record<string, string>)[sizeName] = relativePath;
    }

    // Update configuration
    await this.updateLogoInConfig(tenantId, logoUrls);

    // Also update tenant.logo_url
    tenant.logo_url = logoUrls.medium || logoUrls.original || null;
    await this.tenantRepo.save(tenant);

    this.logger.log(`Uploaded logo for tenant ${tenantId}`);

    return logoUrls.medium || logoUrls.original || '';
  }

  /**
   * Upload and process a favicon
   *
   * @param tenantId - Tenant UUID
   * @param file - Uploaded file (Multer)
   * @returns URL of the uploaded favicon
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Express.Multer.File requires @types/multer
  async uploadFavicon(tenantId: string, file: any): Promise<string> {
    // Validate tenant
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Validate file
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    // Validate image with favicon-specific limits
    const validation = await this.imageProcessingService.validateImage(
      file.buffer,
      MAX_FAVICON_SIZE,
      ALLOWED_IMAGE_TYPES,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Generate favicon versions
    const versions = await this.imageProcessingService.generateVersions(
      file.buffer,
      FAVICON_SIZES,
    );

    // Save files (path-traversal safe)
    const tenantDir = this.resolveTenantDir(tenantId);
    await fs.mkdir(tenantDir, { recursive: true });

    // Save the ico-sized version as main favicon
    const icoVersion = versions['ico'] || Object.values(versions)[0];
    const filename = 'favicon.png';
    const filePath = path.join(tenantDir, filename);
    await fs.writeFile(filePath, icoVersion.buffer);

    // Also save apple-touch-icon if generated
    if (versions['apple']) {
      const applePath = path.join(tenantDir, 'apple-touch-icon.png');
      await fs.writeFile(applePath, versions['apple'].buffer);
    }

    const faviconUrl = `/uploads/branding/${tenantId}/${filename}`;

    // Update configuration
    await this.updateFaviconInConfig(tenantId, faviconUrl);

    this.logger.log(`Uploaded favicon for tenant ${tenantId}`);

    return faviconUrl;
  }

  /**
   * Generate CSS variables string from branding config
   *
   * @param config - Branding configuration
   * @returns CSS string with :root variables
   */
  async generateCssVariables(config: BrandingConfigDto): Promise<string> {
    const colors = config.colors || DEFAULT_COLORS;

    // Generate CSS variables
    let css = `:root {\n`;
    css += `  /* Brand Colors - Tenant: ${config.tenantId} */\n`;
    css += `  --brand-primary: ${colors.primary};\n`;
    css += `  --brand-secondary: ${colors.secondary};\n`;

    if (colors.accent) {
      css += `  --brand-accent: ${colors.accent};\n`;
    }
    if (colors.background) {
      css += `  --brand-background: ${colors.background};\n`;
    }
    if (colors.text) {
      css += `  --brand-text: ${colors.text};\n`;
    }

    // Generate RGB versions for transparency support
    css += `\n  /* RGB variants for rgba() usage */\n`;
    css += `  --brand-primary-rgb: ${this.hexToRgb(colors.primary)};\n`;
    css += `  --brand-secondary-rgb: ${this.hexToRgb(colors.secondary)};\n`;

    css += `}\n`;

    // Add custom CSS if provided
    if (config.customCss) {
      css += `\n/* Custom CSS */\n`;
      css += config.customCss;
      css += `\n`;
    }

    return css;
  }

  /**
   * Convert hex color to RGB string
   */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '0, 0, 0';
  }

  /**
   * Update logo URLs in branding configuration
   */
  private async updateLogoInConfig(tenantId: string, logoUrls: LogoSizesDto): Promise<void> {
    let config = await this.configRepo.findOne({
      where: {
        tenant_id: tenantId,
        config_key: BRANDING_CONFIG_KEY,
      },
    });

    const existingValue = (config?.config_value || {}) as Record<string, unknown>;
    const updatedValue = {
      ...existingValue,
      logo: logoUrls,
    };

    if (config) {
      config.config_value = updatedValue;
      await this.configRepo.save(config);
    } else {
      config = this.configRepo.create({
        tenant_id: tenantId,
        config_key: BRANDING_CONFIG_KEY,
        config_type: 'branding',
        config_value: updatedValue,
        is_overridable: true,
      });
      await this.configRepo.save(config);
    }
  }

  /**
   * Update favicon URL in branding configuration
   */
  private async updateFaviconInConfig(tenantId: string, faviconUrl: string): Promise<void> {
    let config = await this.configRepo.findOne({
      where: {
        tenant_id: tenantId,
        config_key: BRANDING_CONFIG_KEY,
      },
    });

    const existingValue = (config?.config_value || {}) as Record<string, unknown>;
    const updatedValue = {
      ...existingValue,
      favicon: faviconUrl,
    };

    if (config) {
      config.config_value = updatedValue;
      await this.configRepo.save(config);
    } else {
      config = this.configRepo.create({
        tenant_id: tenantId,
        config_key: BRANDING_CONFIG_KEY,
        config_type: 'branding',
        config_value: updatedValue,
        is_overridable: true,
      });
      await this.configRepo.save(config);
    }
  }

  /**
   * Delete branding assets for a tenant
   *
   * @param tenantId - Tenant UUID
   * @param assetType - Type of asset to delete ('logo' | 'favicon' | 'all')
   */
  async deleteAsset(
    tenantId: string,
    assetType: 'logo' | 'favicon' | 'all',
  ): Promise<void> {
    const tenantDir = path.join(this.uploadBasePath, tenantId);

    try {
      if (assetType === 'all') {
        // Delete entire tenant directory
        await fs.rm(tenantDir, { recursive: true, force: true });
      } else if (assetType === 'logo') {
        // Delete logo files
        const logoFiles = ['logo-small.png', 'logo-medium.png', 'logo-large.png', 'logo-original.png'];
        for (const file of logoFiles) {
          try {
            await fs.unlink(path.join(tenantDir, file));
          } catch {
            // Ignore if file doesn't exist
          }
        }
      } else if (assetType === 'favicon') {
        // Delete favicon files
        try {
          await fs.unlink(path.join(tenantDir, 'favicon.png'));
          await fs.unlink(path.join(tenantDir, 'apple-touch-icon.png'));
        } catch {
          // Ignore if files don't exist
        }
      }

      // Update configuration
      const config = await this.configRepo.findOne({
        where: {
          tenant_id: tenantId,
          config_key: BRANDING_CONFIG_KEY,
        },
      });

      if (config) {
        const value = config.config_value as Record<string, unknown>;
        if (assetType === 'all' || assetType === 'logo') {
          delete value.logo;
        }
        if (assetType === 'all' || assetType === 'favicon') {
          delete value.favicon;
        }
        config.config_value = value;
        await this.configRepo.save(config);
      }

      this.logger.log(`Deleted ${assetType} assets for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to delete ${assetType} assets for tenant ${tenantId}`, error);
      throw new BadRequestException(`Failed to delete ${assetType} assets`);
    }
  }
}
