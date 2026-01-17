import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MediaMetadataService } from '../services/media-metadata.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Content - Media Metadata')
@Controller('api/v1/content/media-metadata')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaMetadataController {
  constructor(private readonly metadataService: MediaMetadataService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get metadata by ID' })
  async findOne(@Param('id') id: string) {
    return this.metadataService.findOne(id);
  }

  @Get('media-file/:mediaFileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get metadata by media file' })
  async findByMediaFile(@Param('mediaFileId') mediaFileId: string) {
    return this.metadataService.findByMediaFile(mediaFileId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create metadata' })
  async create(@Body() data: {
    mediaFileId: string;
    durationSeconds?: number;
    width?: number;
    height?: number;
    resolution?: string;
    bitrate?: number;
    codec?: string;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    copyrightInfo?: string;
    exifData?: Record<string, unknown>;
  }) {
    return this.metadataService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update metadata' })
  async update(@Param('id') id: string, @Body() data: Partial<{
    altText: string;
    caption: string;
    copyrightInfo: string;
    thumbnailUrl: string;
  }>) {
    return this.metadataService.update(id, data);
  }

  @Post('upsert/:mediaFileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert metadata for media file' })
  async upsert(
    @Param('mediaFileId') mediaFileId: string,
    @Body() data: Partial<{
      durationSeconds: number;
      width: number;
      height: number;
      resolution: string;
      bitrate: number;
      codec: string;
      thumbnailUrl: string;
      altText: string;
      caption: string;
      copyrightInfo: string;
      exifData: Record<string, unknown>;
    }>,
  ) {
    return this.metadataService.upsertByMediaFile(mediaFileId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete metadata' })
  async delete(@Param('id') id: string) {
    await this.metadataService.delete(id);
  }
}
