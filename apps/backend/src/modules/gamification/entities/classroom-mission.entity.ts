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
import { MissionObjective, MissionRewards } from './mission.entity';

/**
 * Classroom Mission Metadata Schema
 * @description Additional settings for classroom-specific missions
 */
export interface ClassroomMissionMetadata {
  custom_instructions?: string;
  difficulty_override?: string;
  unlock_date?: string;
  auto_assign_to_new_students?: boolean;
  [key: string]: string | boolean | undefined;
}

/**
 * ClassroomMission Entity
 *
 * @description Manages mission assignments to specific classrooms.
 * Allows teachers to assign missions with custom rewards and configuration.
 * @table gamification_system.classroom_missions
 * @fields 15 main fields + audit fields
 *
 * Características:
 * - Asignación de misiones a aulas específicas
 * - Bonificaciones adicionales de XP y ML Coins por aula
 * - Configuración personalizada por aula
 * - Control de misiones obligatorias vs opcionales
 * - Soporte para fechas de vencimiento
 * - Tracking de quién asignó la misión
 *
 * Relaciones:
 * - classroom_id → social_features.classrooms
 * - assigned_by → auth_management.profiles
 * - mission_template_id → referencia a template_id en missions
 *
 * @see DDL: /apps/database/ddl/schemas/gamification_system/tables/16-classroom_missions.sql
 * @see Reference: educational_content.classroom_modules
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.CLASSROOM_MISSIONS })
@Index('idx_classroom_missions_classroom', ['classroom_id'], {
  where: 'is_active = TRUE',
})
@Index('idx_classroom_missions_template', ['mission_template_id'], {
  where: 'is_active = TRUE',
})
@Index('idx_classroom_missions_due_date', ['due_date'], {
  where: 'is_active = TRUE AND due_date IS NOT NULL',
})
@Index('idx_classroom_missions_assigned_by', ['assigned_by', 'assigned_at'])
@Index('idx_classroom_missions_type', ['mission_type'], {
  where: 'is_active = TRUE',
})
@Index('idx_classroom_missions_classroom_type', ['classroom_id', 'mission_type'], {
  where: 'is_active = TRUE',
})
@Check('"bonus_xp" >= 0')
@Check('"bonus_coins" >= 0')
export class ClassroomMission {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid' })
  @Index()
    classroom_id!: string;

  @Column({ type: 'uuid' })
  @Index()
    mission_template_id!: string;

  @Column({ type: 'uuid' })
    assigned_by!: string;

  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
    assigned_at!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
    due_date!: Date | null;

  @Column({ type: 'boolean', default: false })
    is_mandatory!: boolean;

  @Column({ type: 'integer', default: 0 })
    bonus_xp!: number;

  @Column({ type: 'integer', default: 0 })
    bonus_coins!: number;

  // Denormalized mission details for flexibility
  @Column({ type: 'text' })
    title!: string;

  @Column({ type: 'text', nullable: true })
    description!: string | null;

  @Column({ type: 'text' })
    mission_type!: 'daily' | 'weekly' | 'special';

  @Column({ type: 'jsonb' })
    objectives!: MissionObjective[];

  @Column({ type: 'jsonb' })
    base_rewards!: MissionRewards;

  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  @Column({ type: 'jsonb', default: {} })
    metadata!: ClassroomMissionMetadata;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;

  // Relaciones (opcional, comentadas por ahora)
  // @ManyToOne(() => Classroom, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'classroom_id' })
  // classroom?: Classroom;

  // @ManyToOne(() => Profile, { onDelete: 'RESTRICT' })
  // @JoinColumn({ name: 'assigned_by' })
  // assigner?: Profile;
}
