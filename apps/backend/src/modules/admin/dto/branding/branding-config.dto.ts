import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsString, IsOptional, IsUrl, Matches, ValidateNested } from 'class-validator';

/**
 * Logo Sizes DTO
 * Different sizes for responsive logo display
 */
export class LogoSizesDto {
  @ApiPropertyOptional({
    description: 'Small logo URL (32x32 for favicons)',
    example: 'https://cdn.gamilit.com/branding/tenant-123/logo-small.png',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
    small?: string;

  @ApiPropertyOptional({
    description: 'Medium logo URL (128x128 for navbar)',
    example: 'https://cdn.gamilit.com/branding/tenant-123/logo-medium.png',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
    medium?: string;

  @ApiPropertyOptional({
    description: 'Large logo URL (256x256 for headers)',
    example: 'https://cdn.gamilit.com/branding/tenant-123/logo-large.png',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
    large?: string;

  @ApiPropertyOptional({
    description: 'Original logo URL (full resolution)',
    example: 'https://cdn.gamilit.com/branding/tenant-123/logo-original.png',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
    original?: string;
}

/**
 * Color Palette DTO
 * Brand colors for theming
 */
export class ColorPaletteDto {
  @ApiProperty({
    description: 'Primary brand color (hex)',
    example: '#2563eb',
  })
  @Expose()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Primary color must be a valid hex color (e.g., #2563eb)',
  })
    primary!: string;

  @ApiProperty({
    description: 'Secondary brand color (hex)',
    example: '#10b981',
  })
  @Expose()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Secondary color must be a valid hex color (e.g., #10b981)',
  })
    secondary!: string;

  @ApiPropertyOptional({
    description: 'Accent color (hex)',
    example: '#f59e0b',
  })
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Accent color must be a valid hex color',
  })
    accent?: string;

  @ApiPropertyOptional({
    description: 'Background color (hex)',
    example: '#ffffff',
  })
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Background color must be a valid hex color',
  })
    background?: string;

  @ApiPropertyOptional({
    description: 'Text color (hex)',
    example: '#1f2937',
  })
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Text color must be a valid hex color',
  })
    text?: string;
}

/**
 * BrandingConfigDto - Complete branding configuration
 *
 * @description Response DTO for tenant branding configuration.
 * Used for GET /tenants/:tenantId/branding endpoint.
 *
 * @see EXT-008 White Label System (Tier 1)
 * @see ET-WL-002 Tenant Customization
 */
export class BrandingConfigDto {
  @ApiProperty({
    description: 'Tenant ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @Expose()
    tenantId!: string;

  @ApiProperty({
    description: 'Platform display name',
    example: 'UNAM FES Aragon - GAMILIT',
  })
  @Expose()
    platformName!: string;

  @ApiPropertyOptional({
    description: 'Logo URLs in multiple sizes',
    type: LogoSizesDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => LogoSizesDto)
    logo?: LogoSizesDto;

  @ApiPropertyOptional({
    description: 'Favicon URL',
    example: 'https://cdn.gamilit.com/branding/tenant-123/favicon.ico',
  })
  @Expose()
    favicon?: string;

  @ApiProperty({
    description: 'Brand color palette',
    type: ColorPaletteDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => ColorPaletteDto)
    colors!: ColorPaletteDto;

  @ApiPropertyOptional({
    description: 'Custom CSS for advanced styling (tenant tier dependent)',
    example: '.btn-primary { border-radius: 8px; }',
  })
  @Expose()
    customCss?: string;

  @ApiProperty({
    description: 'Configuration last updated timestamp',
    example: '2026-01-27T12:00:00Z',
  })
  @Expose()
    updatedAt!: Date;
}
