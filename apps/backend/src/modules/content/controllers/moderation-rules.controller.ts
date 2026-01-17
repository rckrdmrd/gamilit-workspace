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
import { ModerationRulesService } from '../services/moderation-rules.service';
import {
  ModerationRuleType,
  ModerationTargetEntity,
  ModerationAction,
  ModerationSeverity,
} from '../entities';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Content - Moderation Rules')
@Controller('api/v1/content/moderation-rules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModerationRulesController {
  constructor(private readonly rulesService: ModerationRulesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all rules' })
  async findAll() {
    return this.rulesService.findAll();
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List active rules' })
  async findActive() {
    return this.rulesService.findActive();
  }

  @Get('target/:target')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rules by target entity' })
  async findByTarget(@Param('target') target: ModerationTargetEntity) {
    return this.rulesService.findByTarget(target);
  }

  @Get('type/:type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rules by type' })
  async findByType(@Param('type') type: ModerationRuleType) {
    return this.rulesService.findByType(type);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rule by ID' })
  async findOne(@Param('id') id: string) {
    return this.rulesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create rule' })
  async create(@Body() data: {
    ruleName: string;
    ruleType: ModerationRuleType;
    targetEntity: ModerationTargetEntity;
    ruleConfig: Record<string, unknown>;
    action: ModerationAction;
    severity?: ModerationSeverity;
    autoExecute?: boolean;
    requireReview?: boolean;
    priority?: number;
    createdBy?: string;
  }) {
    return this.rulesService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update rule' })
  async update(@Param('id') id: string, @Body() data: Partial<{
    ruleName: string;
    ruleConfig: Record<string, unknown>;
    action: ModerationAction;
    severity: ModerationSeverity;
    autoExecute: boolean;
    requireReview: boolean;
    priority: number;
  }>) {
    return this.rulesService.update(id, data);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate rule' })
  async activate(@Param('id') id: string) {
    return this.rulesService.activate(id);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate rule' })
  async deactivate(@Param('id') id: string) {
    return this.rulesService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete rule' })
  async delete(@Param('id') id: string) {
    await this.rulesService.delete(id);
  }
}
