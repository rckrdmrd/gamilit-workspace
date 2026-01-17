import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentVersionsService } from '../services/content-versions.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Content - Versions')
@Controller('api/v1/content/versions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentVersionsController {
  constructor(private readonly versionsService: ContentVersionsService) {}

  @Get(':contentType/:contentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get versions for content' })
  async findByContent(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
  ) {
    return this.versionsService.findByContent(contentType, contentId);
  }

  @Get(':contentType/:contentId/latest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get latest version' })
  async findLatest(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
  ) {
    return this.versionsService.findLatest(contentType, contentId);
  }

  @Get(':contentType/:contentId/published')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get published version' })
  async findPublished(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
  ) {
    return this.versionsService.findPublished(contentType, contentId);
  }

  @Get('by-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get version by ID' })
  async findOne(@Param('id') id: string) {
    return this.versionsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new version' })
  async create(@Body() data: {
    contentType: string;
    contentId: string;
    contentData: Record<string, unknown>;
    changeSummary?: string;
    changeNotes?: string;
    createdBy?: string;
    tenantId?: string;
  }) {
    return this.versionsService.create(data);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish version' })
  async publish(@Param('id') id: string) {
    return this.versionsService.publish(id);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish version' })
  async unpublish(@Param('id') id: string) {
    return this.versionsService.unpublish(id);
  }

  @Get('compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compare two versions' })
  async compare(@Query('id1') id1: string, @Query('id2') id2: string) {
    return this.versionsService.compare(id1, id2);
  }
}
