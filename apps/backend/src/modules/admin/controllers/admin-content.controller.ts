import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminContentService } from '../services/admin-content.service';
import {
  ListContentDto,
  ApproveContentDto,
  RejectContentDto,
  ContentDto,
  PaginatedContentDto,
  ListMediaDto,
  PaginatedMediaDto,
} from '../dto/content';
import { MediaFileResponseDto } from '@modules/content/dto/media-file-response.dto';

@ApiTags('Admin - Content')
@Controller('admin/content')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminContentController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get('pending')
  @ApiOperation({
    summary: 'Get pending content for approval',
    description:
      'Retrieve a paginated list of content (modules, exercises, templates) pending approval or review',
  })
  async getPendingContent(
    @Query() query: ListContentDto,
  ): Promise<PaginatedContentDto> {
    return await this.adminContentService.getPendingContent(query);
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Approve content',
    description:
      'Approve content by ID. Changes status to published and optionally publishes immediately.',
  })
  async approveContent(
    @Param('id') id: string,
    @Body() approvalDto: ApproveContentDto,
    @Request() req: any,
  ): Promise<ContentDto> {
    const adminId = req.user?.id || req.user?.sub;
    return await this.adminContentService.approveContent(
      id,
      approvalDto,
      adminId,
    );
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Reject content with reason',
    description:
      'Reject content by ID. Changes status back to draft and stores rejection reason.',
  })
  async rejectContent(
    @Param('id') id: string,
    @Body() rejectionDto: RejectContentDto,
    @Request() req: any,
  ): Promise<ContentDto> {
    const adminId = req.user?.id || req.user?.sub;
    return await this.adminContentService.rejectContent(
      id,
      rejectionDto,
      adminId,
    );
  }

  @Get('media')
  @ApiOperation({
    summary: 'Get media library',
    description:
      'Retrieve a paginated list of media files with optional filters',
  })
  async getMediaLibrary(
    @Query() query: ListMediaDto,
  ): Promise<PaginatedMediaDto> {
    return await this.adminContentService.getMediaLibrary(query);
  }

  @Delete('media/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete media file',
    description:
      'Delete a media file by ID. This will soft-delete the file (set is_active = false).',
  })
  async deleteMediaFile(@Param('id') id: string): Promise<void> {
    await this.adminContentService.deleteMediaFile(id);
  }
}
