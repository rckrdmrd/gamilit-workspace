import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FlaggedContentService } from '../services/flagged-content.service';
import { FlaggedContentStatus, FlaggedContentPriority } from '../entities';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Content - Moderation')
@Controller('api/v1/content/flagged')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlaggedContentController {
  constructor(private readonly flaggedService: FlaggedContentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List flagged content' })
  async findAll(@Query('status') status?: FlaggedContentStatus) {
    return this.flaggedService.findAll(status);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get moderation stats' })
  async getStats() {
    return this.flaggedService.getStats();
  }

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pending items' })
  async findPending() {
    return this.flaggedService.findPending();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get flagged item by ID' })
  async findOne(@Param('id') id: string) {
    return this.flaggedService.findOne(id);
  }

  @Get('content/:contentType/:contentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get flags for specific content' })
  async findByContent(
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
  ) {
    return this.flaggedService.findByContent(contentType, contentId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report content' })
  async create(@Body() data: {
    contentType: string;
    contentId: string;
    contentPreview?: string;
    reportedBy: string;
    reason: string;
    description?: string;
    priority?: FlaggedContentPriority;
  }) {
    return this.flaggedService.create(data);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve flagged content' })
  async approve(
    @Param('id') id: string,
    @Body() body: { reviewerId: string; notes?: string },
  ) {
    return this.flaggedService.approve(id, body.reviewerId, body.notes);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject flag (content is OK)' })
  async reject(
    @Param('id') id: string,
    @Body() body: { reviewerId: string; notes?: string },
  ) {
    return this.flaggedService.reject(id, body.reviewerId, body.notes);
  }

  @Post(':id/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove content' })
  async remove(
    @Param('id') id: string,
    @Body() body: { reviewerId: string; notes?: string },
  ) {
    return this.flaggedService.remove(id, body.reviewerId, body.notes);
  }

  @Patch(':id/priority')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update priority' })
  async updatePriority(
    @Param('id') id: string,
    @Body() body: { priority: FlaggedContentPriority },
  ) {
    return this.flaggedService.updatePriority(id, body.priority);
  }
}
