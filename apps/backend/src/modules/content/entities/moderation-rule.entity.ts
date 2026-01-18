/**
 * ModerationRule Entity
 *
 * Mapea a la tabla: content_management.moderation_rules
 *
 * Reglas automáticas de moderación de contenido.
 * Define patrones, keywords y acciones a tomar.
 *
 * @see DDL: apps/database/ddl/schemas/content_management/tables/06-moderation_rules.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  // ManyToOne, // Comentado - relaciones cross-connection deshabilitadas
  // JoinColumn, // Comentado - relaciones cross-connection deshabilitadas
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
// import { User } from '../../auth/entities/user.entity'; // Comentado - conexión separada

export enum ModerationRuleType {
  KEYWORD = 'keyword',
  PATTERN = 'pattern',
  LENGTH = 'length',
  FREQUENCY = 'frequency',
}

export enum ModerationTargetEntity {
  CONTENT = 'content',
  COMMENT = 'comment',
  MESSAGE = 'message',
  POST = 'post',
}

export enum ModerationAction {
  FLAG = 'flag',
  BLOCK = 'block',
  NOTIFY = 'notify',
  ESCALATE = 'escalate',
}

export enum ModerationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity({ schema: DB_SCHEMAS.CONTENT, name: DB_TABLES.CONTENT.MODERATION_RULES })
@Index(['ruleType'])
@Index(['targetEntity'])
@Index(['action'])
@Index(['isActive', 'priority'])
export class ModerationRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { name: 'rule_name', length: 255 })
  ruleName!: string;

  @Column({
    type: 'varchar',
    name: 'rule_type',
    length: 50,
  })
  ruleType!: ModerationRuleType;

  @Column({
    type: 'varchar',
    name: 'target_entity',
    length: 50,
  })
  targetEntity!: ModerationTargetEntity;

  @Column('jsonb', { name: 'rule_config' })
  ruleConfig!: Record<string, unknown>;

  @Column({
    type: 'varchar',
    length: 20,
  })
  action!: ModerationAction;

  @Column({
    type: 'varchar',
    length: 20,
    default: ModerationSeverity.MEDIUM,
  })
  severity!: ModerationSeverity;

  @Column('boolean', { name: 'auto_execute', default: false })
  autoExecute!: boolean;

  @Column('boolean', { name: 'require_review', default: true })
  requireReview!: boolean;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('int', { default: 0 })
  priority!: number;

  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt!: Date;

  // Relaciones
  // NOTA: Relaciones comentadas - entidades en conexión separada ('content')
  // User está en conexión 'auth', causa error de metadata cross-connection
  // El FK column (created_by) se mantiene para integridad referencial en BD
  //
  // @ManyToOne(() => User, { nullable: true })
  // @JoinColumn({ name: 'created_by' })
  // creator!: User | null;
}
