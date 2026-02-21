import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { CertificateStatus, CertificateType } from '@/modules/progress/enums/certificate.enums';

export { CertificateStatus, CertificateType };

/**
 * Certificate Entity (progress_tracking.certificates)
 *
 * @description Certificados digitales emitidos a estudiantes por completar
 * módulos, cursos o lograr hitos específicos. Incluye verificación QR.
 *
 * @schema progress_tracking
 * @table certificates
 *
 * @see EPIC 10.2 - Digital Certificates System
 */
@Entity({ schema: DB_SCHEMAS.PROGRESS, name: DB_TABLES.PROGRESS.CERTIFICATES })
@Index('idx_certificates_user_id', ['user_id'])
@Index('idx_certificates_module_id', ['module_id'])
@Index('idx_certificates_verification_code', ['verification_code'], { unique: true })
@Index('idx_certificates_status', ['status'])
@Index('idx_certificates_issued_at', ['issued_at'])
export class Certificate {
  /**
   * Identificador único del certificado (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del usuario que recibe el certificado
   */
  @Column({ type: 'uuid' })
  user_id!: string;

  /**
   * ID del módulo completado (nullable para certificados de curso)
   */
  @Column({ type: 'uuid', nullable: true })
  module_id?: string;

  /**
   * ID del tenant/organización
   */
  @Column({ type: 'uuid', nullable: true })
  tenant_id?: string;

  /**
   * ID del classroom (si aplica)
   */
  @Column({ type: 'uuid', nullable: true })
  classroom_id?: string;

  // =====================================================
  // CERTIFICATE INFORMATION
  // =====================================================

  /**
   * Tipo de certificado
   */
  @Column({
    type: 'enum',
    enum: CertificateType,
    default: CertificateType.MODULE_COMPLETION,
  })
  certificate_type!: CertificateType;

  /**
   * Título del certificado
   */
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  /**
   * Descripción o logro específico
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Nombre completo del estudiante (snapshot al momento de emisión)
   */
  @Column({ type: 'varchar', length: 255 })
  student_name!: string;

  /**
   * Nombre del módulo/curso completado
   */
  @Column({ type: 'varchar', length: 255 })
  achievement_name!: string;

  // =====================================================
  // VERIFICATION
  // =====================================================

  /**
   * Código único de verificación (para QR)
   * Formato: CERT-XXXX-XXXX-XXXX
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  verification_code!: string;

  /**
   * URL pública de verificación
   */
  @Column({ type: 'text', nullable: true })
  verification_url?: string;

  /**
   * Hash del certificado para integridad
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  certificate_hash?: string;

  // =====================================================
  // PERFORMANCE DATA
  // =====================================================

  /**
   * Puntaje final obtenido (0-100)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  final_score!: number;

  /**
   * Total de XP ganados
   */
  @Column({ type: 'integer', default: 0 })
  total_xp_earned!: number;

  /**
   * Total de ML Coins ganados
   */
  @Column({ type: 'integer', default: 0 })
  total_ml_coins_earned!: number;

  /**
   * Tiempo total dedicado (formato interval)
   */
  @Column({ type: 'varchar', length: 50, default: '00:00:00' })
  time_spent!: string;

  /**
   * Número de ejercicios completados
   */
  @Column({ type: 'integer', default: 0 })
  exercises_completed!: number;

  // =====================================================
  // STATUS & DATES
  // =====================================================

  /**
   * Estado del certificado
   */
  @Column({
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status!: CertificateStatus;

  /**
   * Fecha de emisión
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  issued_at?: Date;

  /**
   * Fecha de expiración (si aplica)
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at?: Date;

  /**
   * Fecha de revocación (si fue revocado)
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  revoked_at?: Date;

  /**
   * Razón de revocación
   */
  @Column({ type: 'text', nullable: true })
  revocation_reason?: string;

  // =====================================================
  // PDF STORAGE
  // =====================================================

  /**
   * URL del PDF generado
   */
  @Column({ type: 'text', nullable: true })
  pdf_url?: string;

  /**
   * Ruta local del PDF (si se almacena localmente)
   */
  @Column({ type: 'text', nullable: true })
  pdf_path?: string;

  /**
   * Tamaño del PDF en bytes
   */
  @Column({ type: 'integer', nullable: true })
  pdf_size_bytes?: number;

  // =====================================================
  // METADATA
  // =====================================================

  /**
   * Metadata adicional (JSONB)
   * - issuer_name: Nombre del emisor
   * - issuer_title: Título del emisor
   * - template_id: ID del template usado
   * - custom_fields: Campos personalizados
   */
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
