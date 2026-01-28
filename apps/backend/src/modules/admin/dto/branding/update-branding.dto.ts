import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
  ValidateNested,
  IsObject,
} from 'class-validator';

/**
 * Update Color Palette DTO
 * All fields optional for partial updates
 */
export class UpdateColorPaletteDto {
  @ApiPropertyOptional({
    description: 'Primary brand color (hex)',
    example: '#2563eb',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Primary color must be a valid hex color (e.g., #2563eb)',
  })
    primary?: string;

  @ApiPropertyOptional({
    description: 'Secondary brand color (hex)',
    example: '#10b981',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Secondary color must be a valid hex color (e.g., #10b981)',
  })
    secondary?: string;

  @ApiPropertyOptional({
    description: 'Accent color (hex)',
    example: '#f59e0b',
  })
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
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Text color must be a valid hex color',
  })
    text?: string;
}

/**
 * UpdateBrandingDto - Update branding configuration
 *
 * @description Request DTO for updating tenant branding.
 * All fields are optional for partial updates.
 *
 * @see EXT-008 White Label System (Tier 1)
 * @see PATCH /tenants/:tenantId/branding
 */
export class UpdateBrandingDto {
  @ApiPropertyOptional({
    description: 'Platform display name (1-100 characters)',
    example: 'UNAM FES Aragon - GAMILIT',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Platform name must be at least 1 character' })
  @MaxLength(100, { message: 'Platform name cannot exceed 100 characters' })
    platformName?: string;

  @ApiPropertyOptional({
    description: 'Brand color palette',
    type: UpdateColorPaletteDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateColorPaletteDto)
    colors?: UpdateColorPaletteDto;

  @ApiPropertyOptional({
    description: 'Custom CSS for advanced styling (requires tier 2+)',
    example: '.btn-primary { border-radius: 8px; }',
    maxLength: 10000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000, { message: 'Custom CSS cannot exceed 10000 characters' })
    customCss?: string;
}
