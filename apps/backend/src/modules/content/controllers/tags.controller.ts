import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { TagCategory } from '../entities';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Content - Tags')
@Controller('api/v1/content/tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all tags' })
  async findAll() {
    return this.tagsService.findAll();
  }

  @Get('popular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get popular tags' })
  async getPopular(@Query('limit') limit?: number) {
    return this.tagsService.getPopular(limit || 10);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search tags' })
  async search(@Query('q') query: string) {
    return this.tagsService.search(query);
  }

  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tags by category' })
  async findByCategory(@Param('category') category: TagCategory) {
    return this.tagsService.findByCategory(category);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tag by ID' })
  async findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tag' })
  async create(@Body() data: {
    tagName: string;
    tagSlug: string;
    tagCategory: TagCategory;
    description?: string;
  }) {
    return this.tagsService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tag' })
  async update(@Param('id') id: string, @Body() data: Partial<{
    tagName: string;
    description: string;
    isActive: boolean;
  }>) {
    return this.tagsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate tag' })
  async deactivate(@Param('id') id: string) {
    await this.tagsService.deactivate(id);
  }
}
