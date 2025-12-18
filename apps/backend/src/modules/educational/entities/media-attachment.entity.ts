import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { Exercise } from './exercise.entity';

/**
 * MediaAttachment Entity (educational_content.media_attachments)
 *
 * @description Archivos multimedia adjuntos a ejercicios creativos (Módulos 4 y 5)
 * @schema educational_content
 * @table media_attachments
 *
 * IMPORTANTE:
 * - Almacenamiento local de archivos (no cloud)
 * - Soporta: image, video, audio, document
 * - Puede asociarse a submission (entrega estudiante) o exercise (material de referencia)
 * - file_path es relativo desde uploads/ (ej: "exercises/module5/diario/student123.mp4")
 *
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/09-media_attachments.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.MEDIA_ATTACHMENTS })
@Index('idx_media_attachments_submission', ['submissionId'])
@Index('idx_media_attachments_exercise', ['exerciseId'])
@Index('idx_media_attachments_user', ['userId'])
@Index('idx_media_attachments_type', ['fileType'])
export class MediaAttachment {
  /**
   * Identificador único del attachment (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del submission si el archivo es parte de una entrega de estudiante (FK → progress_tracking.exercise_submissions)
   * Nullable: puede ser null si es material de referencia del ejercicio
   */
  @Column({ name: 'submission_id', type: 'uuid', nullable: true })
    submissionId?: string | null;

  /**
   * ID del ejercicio si el archivo es material de referencia (FK → educational_content.exercises)
   * Nullable: puede ser null si es parte de un submission
   */
  @Column({ name: 'exercise_id', type: 'uuid', nullable: true })
    exerciseId?: string | null;

  /**
   * Usuario que subió el archivo (FK → auth_management.profiles)
   * Puede ser estudiante o docente
   */
  @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

  // =====================================================
  // FILE INFORMATION
  // =====================================================

  /**
   * Nombre original del archivo
   */
  @Column({ name: 'file_name', type: 'varchar', length: 255 })
    fileName!: string;

  /**
   * Ruta relativa desde uploads/
   * Ejemplo: "exercises/module5/diario/student123_20251129.mp4"
   */
  @Column({ name: 'file_path', type: 'text' })
    filePath!: string;

  /**
   * Tipo de archivo
   * Valores: image, video, audio, document
   */
  @Column({ name: 'file_type', type: 'varchar', length: 50 })
    fileType!: 'image' | 'video' | 'audio' | 'document';

  /**
   * Tamaño del archivo en bytes
   */
  @Column({ name: 'file_size', type: 'bigint' })
    fileSize!: number;

  /**
   * MIME type del archivo
   * Ejemplos: video/mp4, image/jpeg, audio/mpeg, application/pdf
   */
  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
    mimeType!: string;

  // =====================================================
  // METADATA (type-specific)
  // =====================================================

  /**
   * Duración en segundos (para audio/video)
   */
  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
    durationSeconds?: number | null;

  /**
   * Ancho en píxeles (para imágenes y videos)
   */
  @Column({ type: 'int', nullable: true })
    width?: number | null;

  /**
   * Alto en píxeles (para imágenes y videos)
   */
  @Column({ type: 'int', nullable: true })
    height?: number | null;

  /**
   * Ruta a thumbnail generado automáticamente
   * Para videos e imágenes grandes
   */
  @Column({ name: 'thumbnail_path', type: 'text', nullable: true })
    thumbnailPath?: string | null;

  // =====================================================
  // PROCESSING STATUS
  // =====================================================

  /**
   * Indica si el archivo fue procesado
   * (ej: thumbnail generado, video transcodificado)
   */
  @Column({ name: 'is_processed', type: 'boolean', default: false })
    isProcessed!: boolean;

  /**
   * Mensaje de error si hubo problema en procesamiento
   */
  @Column({ name: 'processing_error', type: 'text', nullable: true })
    processingError?: string | null;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora de subida del archivo
   */
  @Column({
    name: 'uploaded_at',
    type: 'timestamptz',
    default: () => 'gamilit.now_mexico()',
  })
    uploadedAt!: Date;

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * Relación con Exercise (opcional)
   * NOTA: No se define relación con ExerciseSubmission porque está
   * en otra conexión de TypeORM (progress). Se usa solo submissionId.
   */
  @ManyToOne(() => Exercise, { nullable: true })
  @JoinColumn({ name: 'exercise_id' })
    exercise?: Exercise | null;
}
