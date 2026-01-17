import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ModerationRule,
  ModerationRuleType,
  ModerationTargetEntity,
  ModerationAction,
  ModerationSeverity,
} from '../entities';

/**
 * ModerationRulesService
 *
 * @description Gestión de reglas automáticas de moderación.
 * Define patrones, keywords y acciones a tomar automáticamente.
 */
@Injectable()
export class ModerationRulesService {
  constructor(
    @InjectRepository(ModerationRule, 'content')
    private readonly ruleRepo: Repository<ModerationRule>,
  ) {}

  async findAll(): Promise<ModerationRule[]> {
    return this.ruleRepo.find({
      order: { priority: 'ASC', ruleName: 'ASC' },
    });
  }

  async findActive(): Promise<ModerationRule[]> {
    return this.ruleRepo.find({
      where: { isActive: true },
      order: { priority: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ModerationRule> {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Moderation rule ${id} no encontrada`);
    }
    return rule;
  }

  async findByTarget(target: ModerationTargetEntity): Promise<ModerationRule[]> {
    return this.ruleRepo.find({
      where: { targetEntity: target, isActive: true },
      order: { priority: 'ASC' },
    });
  }

  async findByType(type: ModerationRuleType): Promise<ModerationRule[]> {
    return this.ruleRepo.find({
      where: { ruleType: type, isActive: true },
      order: { priority: 'ASC' },
    });
  }

  async create(data: {
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
  }): Promise<ModerationRule> {
    const rule = this.ruleRepo.create({
      ...data,
      severity: data.severity || ModerationSeverity.MEDIUM,
      autoExecute: data.autoExecute ?? false,
      requireReview: data.requireReview ?? true,
      priority: data.priority ?? 0,
      isActive: true,
    });
    return this.ruleRepo.save(rule);
  }

  async update(id: string, data: Partial<ModerationRule>): Promise<ModerationRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, data);
    return this.ruleRepo.save(rule);
  }

  async activate(id: string): Promise<ModerationRule> {
    const rule = await this.findOne(id);
    rule.isActive = true;
    return this.ruleRepo.save(rule);
  }

  async deactivate(id: string): Promise<ModerationRule> {
    const rule = await this.findOne(id);
    rule.isActive = false;
    return this.ruleRepo.save(rule);
  }

  async delete(id: string): Promise<void> {
    const result = await this.ruleRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Moderation rule ${id} no encontrada`);
    }
  }

  async getActiveRulesForEntity(entity: ModerationTargetEntity): Promise<ModerationRule[]> {
    return this.ruleRepo.find({
      where: { targetEntity: entity, isActive: true, autoExecute: true },
      order: { severity: 'DESC', priority: 'ASC' },
    });
  }
}
