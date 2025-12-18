import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Mission Template Type Enum
 * @description Types of mission templates available
 */
export enum MissionTemplateTypeEnum {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special',
  CLASSROOM = 'classroom',
}

/**
 * Mission Template Difficulty Enum
 * @description Difficulty levels for missions
 */
export enum MissionTemplateDifficultyEnum {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EPIC = 'epic',
}

/**
 * Mission Template Entity
 *
 * @description Templates for generating missions with predefined configurations
 * @table gamification_system.mission_templates
 * @fields 19 campos según DDL
 *
 * Características:
 * - Templates configurables para misiones diarias, semanales, especiales y de aula
 * - Sistema de recompensas flexible (XP, ML Coins, badges)
 * - Restricciones por nivel y módulo
 * - Prioridades y categorías para selección inteligente
 * - Metadata extensible en JSONB
 *
 * Validaciones críticas:
 * - type en lista permitida (daily, weekly, special, classroom)
 * - difficulty en lista permitida (easy, normal, hard, epic)
 * - target_value > 0
 * - max_level >= min_level (si está definido)
 *
 * @see DDL: /apps/database/ddl/schemas/gamification_system/tables/20-mission_templates.sql
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.MISSION_TEMPLATES })
@Index('idx_mission_templates_type', ['type'])
@Index('idx_mission_templates_active', ['is_active'])
@Index('idx_mission_templates_category', ['category'])
@Index('idx_mission_templates_difficulty', ['difficulty'])
@Check('"target_value" > 0')
@Check('"xp_reward" >= 0')
@Check('"ml_coins_reward" >= 0')
@Check('"min_level" >= 1')
@Check('("max_level" IS NULL) OR ("max_level" >= "min_level")')
export class MissionTemplate {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // Identification
  @Column({ type: 'varchar', length: 100 })
    name!: string;

  @Column({ type: 'text' })
    description!: string;

  // Type and frequency
  @Column({
    type: 'enum',
    enum: MissionTemplateTypeEnum,
  })
    type!: MissionTemplateTypeEnum;

  @Column({ type: 'varchar', length: 50, nullable: true })
    category!: string | null;

  // Objective configuration
  @Column({ type: 'varchar', length: 50 })
    target_type!: string;

  @Column({ type: 'integer' })
    target_value!: number;

  // Rewards
  @Column({ type: 'integer', default: 0 })
    xp_reward!: number;

  @Column({ type: 'integer', default: 0 })
    ml_coins_reward!: number;

  @Column({ type: 'uuid', nullable: true })
    badge_id!: string | null;

  // Configuration
  @Column({
    type: 'enum',
    enum: MissionTemplateDifficultyEnum,
    default: MissionTemplateDifficultyEnum.NORMAL,
  })
    difficulty!: MissionTemplateDifficultyEnum;

  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  @Column({ type: 'integer', default: 0 })
    priority!: number;

  // Restrictions
  @Column({ type: 'integer', default: 1 })
    min_level!: number;

  @Column({ type: 'integer', nullable: true })
    max_level!: number | null;

  @Column({ type: 'integer', nullable: true })
    required_module!: number | null;

  // Metadata
  @Column({ type: 'varchar', length: 50, nullable: true })
    icon!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
    color!: string | null;

  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  // Audit
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;

  @Column({ type: 'uuid', nullable: true })
    created_by!: string | null;

  // Foreign Key Relations (commented until needed)
  // @ManyToOne(() => User, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'created_by' })
  // creator?: User;

  // @ManyToOne(() => Badge, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'badge_id' })
  // badge?: Badge;
}
