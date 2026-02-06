import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * ComodinUse Entity
 *
 * @description Audit trail inmutable de consumo de comodines.
 * Registra cada uso con contexto completo para analytics y compliance.
 * @table gamification_system.comodin_uses
 * @ticket GAP-GAM-001
 * @fix H-017 (Missing entity)
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.COMODIN_USES })
@Index('idx_comodin_uses_user_id', ['userId'])
@Index('idx_comodin_uses_comodin_type', ['comodinType'])
export class ComodinUse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'comodin_type', type: 'varchar' })
  comodinType!: string;

  @Column({ name: 'exercise_id', type: 'uuid', nullable: true })
  exerciseId!: string | null;

  @Column({ name: 'attempt_id', type: 'uuid', nullable: true })
  attemptId!: string | null;

  @Column({ name: 'effect_applied', type: 'varchar', length: 100, nullable: true })
  effectApplied!: string | null;

  @Column({ name: 'value_provided', type: 'jsonb', nullable: true })
  valueProvided!: Record<string, unknown> | null;

  @Column({ name: 'consumed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  consumedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
