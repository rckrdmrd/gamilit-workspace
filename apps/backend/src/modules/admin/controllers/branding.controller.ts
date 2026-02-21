import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { BrandingService } from '../services/branding.service';
import { BrandingConfigDto } from '../dto/branding/branding-config.dto';
import { UpdateBrandingDto } from '../dto/branding/update-branding.dto';

/**
 * BrandingController
 *
 * @description REST API endpoints for tenant branding management.
 * Part of the EXT-008 White Label System.
 *
 * Endpoints:
 * - GET    /tenants/:tenantId/branding         - Get branding config
 * - PATCH  /tenants/:tenantId/branding         - Update branding config
 * - POST   /tenants/:tenantId/branding/logo    - Upload logo
 * - POST   /tenants/:tenantId/branding/favicon - Upload favicon
 * - GET    /tenants/:tenantId/branding/css     - Get CSS variables
 * - DELETE /tenants/:tenantId/branding/assets  - Delete branding assets
 *
 * @see EXT-008 White Label System
 * @see TASK-WL-001 BrandingController
 */
@ApiTags('Branding', 'admin-public')
@Controller('tenants/:tenantId/branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  /**
   * Get branding configuration for a tenant
   * Public endpoint - no auth required for initial page load
   */
  @Get()
  @ApiOperation({
    summary: 'Get branding configuration',
    description: 'Retrieve the complete branding configuration for a tenant including logo, colors, and custom CSS.',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Branding configuration retrieved successfully',
    type: BrandingConfigDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found',
  })
  async getBranding(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ): Promise<BrandingConfigDto> {
    return this.brandingService.getBrandingConfig(tenantId);
  }

  /**
   * Update branding configuration
   * Requires admin authentication
   */
  @Patch()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update branding configuration',
    description: 'Update platform name, colors, and custom CSS. Requires admin permissions.',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Branding configuration updated successfully',
    type: BrandingConfigDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found',
  })
  async updateBranding(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() updateDto: UpdateBrandingDto,
  ): Promise<BrandingConfigDto> {
    return this.brandingService.updateBrandingConfig(tenantId, updateDto);
  }

  /**
   * Upload logo image
   * Requires admin authentication
   */
  @Post('logo')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload logo',
    description: 'Upload a logo image. Supports PNG, JPG, WEBP, GIF formats. Max size 5MB. Image will be processed into multiple sizes.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (PNG, JPG, WEBP, GIF)',
        },
      },
      required: ['file'],
    },
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Logo uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL of the uploaded logo' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file too large',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadLogo(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @UploadedFile() file: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Express.Multer.File requires @types/multer
  ): Promise<{ url: string; message: string }> {
    const url = await this.brandingService.uploadLogo(tenantId, file);
    return {
      url,
      message: 'Logo uploaded successfully',
    };
  }

  /**
   * Upload favicon image
   * Requires admin authentication
   */
  @Post('favicon')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload favicon',
    description: 'Upload a favicon image. Supports PNG, ICO, JPG formats. Max size 1MB. Will be processed into favicon format.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Favicon image file (PNG, ICO, JPG)',
        },
      },
      required: ['file'],
    },
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Favicon uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL of the uploaded favicon' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file too large',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadFavicon(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @UploadedFile() file: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Express.Multer.File requires @types/multer
  ): Promise<{ url: string; message: string }> {
    const url = await this.brandingService.uploadFavicon(tenantId, file);
    return {
      url,
      message: 'Favicon uploaded successfully',
    };
  }

  /**
   * Get CSS variables for branding
   * Public endpoint for stylesheet loading
   */
  @Get('css')
  @ApiOperation({
    summary: 'Get CSS variables',
    description: 'Get CSS :root variables for the tenant branding. Can be included as a stylesheet link.',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'CSS variables returned',
    content: {
      'text/css': {
        schema: { type: 'string' },
      },
    },
  })
  async getCssVariables(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Res() res: Response,
  ): Promise<void> {
    const config = await this.brandingService.getBrandingConfig(tenantId);
    const css = await this.brandingService.generateCssVariables(config);

    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.send(css);
  }

  /**
   * Delete branding assets
   * Requires admin authentication
   */
  @Delete('assets')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete branding assets',
    description: 'Delete logo, favicon, or all branding assets for a tenant.',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'type',
    description: 'Type of asset to delete',
    enum: ['logo', 'favicon', 'all'],
    required: false,
  })
  @ApiResponse({
    status: 204,
    description: 'Assets deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteAssets(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('type') assetType: 'logo' | 'favicon' | 'all' = 'all',
  ): Promise<void> {
    await this.brandingService.deleteAsset(tenantId, assetType);
  }
}
