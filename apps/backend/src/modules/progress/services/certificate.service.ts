import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import {
  Certificate,
  CertificateStatus,
  CertificateType,
  ModuleProgress,
} from '../entities';
import { ProgressStatusEnum } from '@shared/constants/enums.constants';

/**
 * CertificateService
 *
 * @description Servicio para generación y gestión de certificados digitales.
 * Genera PDFs profesionales con código QR para verificación.
 *
 * @see EPIC 10.2 - Digital Certificates System
 */
@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  private readonly certificatesDir: string;
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Certificate, 'progress')
    private readonly certificateRepo: Repository<Certificate>,
    @InjectRepository(ModuleProgress, 'progress')
    private readonly moduleProgressRepo: Repository<ModuleProgress>,
  ) {
    // Configure certificates directory
    this.certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');
    this.baseUrl = process.env.APP_URL || 'http://localhost:3000';

    // Ensure directory exists
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  /**
   * Genera un certificado para un módulo completado
   *
   * @param userId - ID del usuario
   * @param moduleId - ID del módulo
   * @param tenantId - ID del tenant (opcional)
   * @param classroomId - ID del classroom (opcional)
   * @returns Certificado generado con URL de verificación
   */
  async generateModuleCertificate(
    userId: string,
    moduleId: string,
    tenantId?: string,
    classroomId?: string,
  ): Promise<Certificate> {
    this.logger.log(`[EPIC-10.2] Generating certificate for user ${userId} module ${moduleId}`);

    // 1. Verify module is completed
    const moduleProgress = await this.moduleProgressRepo.findOne({
      where: { user_id: userId, module_id: moduleId },
    });

    if (!moduleProgress) {
      throw new NotFoundException(
        `No progress found for user ${userId} in module ${moduleId}`,
      );
    }

    if (moduleProgress.status !== ProgressStatusEnum.COMPLETED) {
      throw new BadRequestException(
        `Module ${moduleId} is not completed. Current status: ${moduleProgress.status}`,
      );
    }

    // 2. Check if certificate already exists
    const existingCert = await this.certificateRepo.findOne({
      where: {
        user_id: userId,
        module_id: moduleId,
        status: CertificateStatus.ISSUED,
      },
    });

    if (existingCert) {
      this.logger.log(`[EPIC-10.2] Certificate already exists: ${existingCert.id}`);
      return existingCert;
    }

    // 3. Get user and module info
    const userQuery = `
      SELECT
        p.full_name,
        p.email,
        t.name as organization_name
      FROM auth_management.profiles p
      LEFT JOIN auth_management.tenants t ON t.id = p.tenant_id
      WHERE p.user_id = $1
    `;
    const userResult = await this.moduleProgressRepo.query(userQuery, [userId]);
    const userInfo = userResult[0] || { full_name: 'Estudiante', organization_name: '' };

    const moduleQuery = `
      SELECT title, description
      FROM educational_content.modules
      WHERE id = $1
    `;
    const moduleResult = await this.moduleProgressRepo.query(moduleQuery, [moduleId]);
    const moduleInfo = moduleResult[0] || { title: 'Módulo', description: '' };

    // 4. Generate verification code
    const verificationCode = this.generateVerificationCode();

    // 5. Create certificate entity
    const certificate = this.certificateRepo.create({
      user_id: userId,
      module_id: moduleId,
      tenant_id: tenantId,
      classroom_id: classroomId,
      certificate_type: CertificateType.MODULE_COMPLETION,
      title: `Certificado de Completación: ${moduleInfo.title}`,
      description: moduleInfo.description,
      student_name: userInfo.full_name,
      achievement_name: moduleInfo.title,
      verification_code: verificationCode,
      verification_url: `${this.baseUrl}/api/v1/certificates/verify/${verificationCode}`,
      final_score: moduleProgress.average_score || 0,
      total_xp_earned: moduleProgress.total_xp_earned,
      total_ml_coins_earned: moduleProgress.total_ml_coins_earned,
      time_spent: moduleProgress.time_spent || '00:00:00',
      exercises_completed: moduleProgress.completed_exercises,
      status: CertificateStatus.PENDING,
      metadata: {
        organization_name: userInfo.organization_name,
        issued_by: 'GAMILIT Platform',
        original_module_id: moduleId,
      },
    });

    const savedCert = await this.certificateRepo.save(certificate);

    // 6. Generate PDF
    try {
      const pdfPath = await this.generateCertificatePDF(savedCert);
      savedCert.pdf_path = pdfPath;
      savedCert.pdf_url = `${this.baseUrl}/uploads/certificates/${path.basename(pdfPath)}`;
      savedCert.pdf_size_bytes = fs.statSync(pdfPath).size;
    } catch (err) {
      this.logger.error(`[EPIC-10.2] Failed to generate PDF: ${err}`);
      // Continue without PDF - certificate is still valid
    }

    // 7. Generate certificate hash for integrity
    savedCert.certificate_hash = this.generateCertificateHash(savedCert);

    // 8. Mark as issued
    savedCert.status = CertificateStatus.ISSUED;
    savedCert.issued_at = new Date();

    await this.certificateRepo.save(savedCert);

    this.logger.log(`[EPIC-10.2] Certificate issued: ${savedCert.id} (${verificationCode})`);

    return savedCert;
  }

  /**
   * Verifica un certificado por código
   *
   * @param verificationCode - Código de verificación
   * @returns Resultado de verificación con datos del certificado
   */
  async verifyCertificate(verificationCode: string): Promise<{
    is_valid: boolean;
    certificate?: Certificate;
    error?: string;
  }> {
    this.logger.log(`[EPIC-10.2] Verifying certificate: ${verificationCode}`);

    const certificate = await this.certificateRepo.findOne({
      where: { verification_code: verificationCode },
    });

    if (!certificate) {
      return {
        is_valid: false,
        error: 'Certificate not found',
      };
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      return {
        is_valid: false,
        error: `Certificate has been revoked. Reason: ${certificate.revocation_reason}`,
      };
    }

    if (certificate.status === CertificateStatus.EXPIRED) {
      return {
        is_valid: false,
        error: 'Certificate has expired',
      };
    }

    if (certificate.expires_at && new Date() > certificate.expires_at) {
      // Mark as expired
      certificate.status = CertificateStatus.EXPIRED;
      await this.certificateRepo.save(certificate);
      return {
        is_valid: false,
        error: 'Certificate has expired',
      };
    }

    // Verify hash integrity
    const currentHash = this.generateCertificateHash(certificate);
    if (certificate.certificate_hash && certificate.certificate_hash !== currentHash) {
      return {
        is_valid: false,
        error: 'Certificate integrity check failed',
      };
    }

    return {
      is_valid: true,
      certificate,
    };
  }

  /**
   * Obtiene certificados de un usuario
   *
   * @param userId - ID del usuario
   * @param status - Filtro opcional por estado
   * @returns Lista de certificados
   */
  async getUserCertificates(
    userId: string,
    status?: CertificateStatus,
  ): Promise<Certificate[]> {
    const whereCondition: Record<string, unknown> = { user_id: userId };

    if (status) {
      whereCondition.status = status;
    } else {
      // Default to showing only issued certificates
      whereCondition.status = CertificateStatus.ISSUED;
    }

    return this.certificateRepo.find({
      where: whereCondition,
      order: { issued_at: 'DESC' },
    });
  }

  /**
   * Obtiene un certificado por ID
   *
   * @param id - ID del certificado
   * @returns Certificado o null
   */
  async getCertificateById(id: string): Promise<Certificate | null> {
    return this.certificateRepo.findOne({ where: { id } });
  }

  /**
   * Obtiene el buffer del PDF de un certificado
   *
   * @param id - ID del certificado
   * @returns Buffer del PDF
   */
  async getCertificatePdfBuffer(id: string): Promise<Buffer> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });

    if (!certificate) {
      throw new NotFoundException(`Certificate ${id} not found`);
    }

    // If PDF exists on disk, read it
    if (certificate.pdf_path && fs.existsSync(certificate.pdf_path)) {
      return fs.readFileSync(certificate.pdf_path);
    }

    // Generate PDF on the fly
    const pdfPath = await this.generateCertificatePDF(certificate);

    // Update certificate with PDF info
    certificate.pdf_path = pdfPath;
    certificate.pdf_url = `${this.baseUrl}/uploads/certificates/${path.basename(pdfPath)}`;
    certificate.pdf_size_bytes = fs.statSync(pdfPath).size;
    await this.certificateRepo.save(certificate);

    return fs.readFileSync(pdfPath);
  }

  /**
   * Revoca un certificado
   *
   * @param id - ID del certificado
   * @param reason - Razón de revocación
   */
  async revokeCertificate(id: string, reason: string): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });

    if (!certificate) {
      throw new NotFoundException(`Certificate ${id} not found`);
    }

    if (certificate.status === CertificateStatus.REVOKED) {
      throw new BadRequestException('Certificate is already revoked');
    }

    certificate.status = CertificateStatus.REVOKED;
    certificate.revoked_at = new Date();
    certificate.revocation_reason = reason;

    return this.certificateRepo.save(certificate);
  }

  /**
   * Obtiene estadísticas de certificados de un tenant
   *
   * @param tenantId - ID del tenant
   * @returns Estadísticas de certificados
   */
  async getTenantCertificateStats(tenantId: string): Promise<Record<string, unknown>> {
    const stats = await this.certificateRepo
      .createQueryBuilder('c')
      .select([
        'COUNT(*) as total_certificates',
        `COUNT(CASE WHEN c.status = '${CertificateStatus.ISSUED}' THEN 1 END) as issued_certificates`,
        `COUNT(CASE WHEN c.status = '${CertificateStatus.REVOKED}' THEN 1 END) as revoked_certificates`,
        `COUNT(CASE WHEN c.status = '${CertificateStatus.PENDING}' THEN 1 END) as pending_certificates`,
        `COUNT(CASE WHEN c.status = '${CertificateStatus.EXPIRED}' THEN 1 END) as expired_certificates`,
        'AVG(c.final_score) as average_final_score',
        'SUM(c.total_xp_earned) as total_xp_awarded',
        'SUM(c.total_ml_coins_earned) as total_ml_coins_awarded',
      ])
      .where('c.tenant_id = :tenantId', { tenantId })
      .getRawOne();

    // Get counts by type
    const typeStats = await this.certificateRepo
      .createQueryBuilder('c')
      .select(['c.certificate_type', 'COUNT(*) as count'])
      .where('c.tenant_id = :tenantId', { tenantId })
      .groupBy('c.certificate_type')
      .getRawMany();

    const certificatesByType: Record<string, number> = {};
    for (const typeStat of typeStats) {
      certificatesByType[typeStat.certificate_type] = parseInt(typeStat.count, 10);
    }

    return {
      tenant_id: tenantId,
      total_certificates: parseInt(stats.total_certificates || '0', 10),
      issued_certificates: parseInt(stats.issued_certificates || '0', 10),
      revoked_certificates: parseInt(stats.revoked_certificates || '0', 10),
      pending_certificates: parseInt(stats.pending_certificates || '0', 10),
      expired_certificates: parseInt(stats.expired_certificates || '0', 10),
      certificates_by_type: certificatesByType,
      average_final_score: parseFloat(stats.average_final_score || '0').toFixed(2),
      total_xp_awarded: parseInt(stats.total_xp_awarded || '0', 10),
      total_ml_coins_awarded: parseInt(stats.total_ml_coins_awarded || '0', 10),
    };
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  /**
   * Genera código de verificación único
   */
  private generateVerificationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CERT-';

    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars[crypto.randomInt(chars.length)];
    }

    return code;
  }

  /**
   * Genera hash del certificado para verificar integridad
   */
  private generateCertificateHash(cert: Certificate): string {
    const data = `${cert.id}|${cert.user_id}|${cert.module_id}|${cert.verification_code}|${cert.issued_at?.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Escapa caracteres HTML para prevenir XSS
   *
   * @param unsafe - String potencialmente inseguro
   * @returns String con caracteres HTML escapados
   */
  private escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Genera PDF del certificado
   */
  private async generateCertificatePDF(cert: Certificate): Promise<string> {
    this.logger.log(`[EPIC-10.2] Generating PDF for certificate ${cert.id}`);

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(cert.verification_url || cert.verification_code, {
      width: 150,
      margin: 1,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    // Create HTML template
    const html = this.getCertificateHTML(cert, qrDataUrl);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfFileName = `certificate-${cert.verification_code}.pdf`;
      const pdfPath = path.join(this.certificatesDir, pdfFileName);

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      this.logger.log(`[EPIC-10.2] PDF generated: ${pdfPath}`);
      return pdfPath;
    } finally {
      await browser.close();
    }
  }

  /**
   * Genera HTML del certificado
   */
  private getCertificateHTML(cert: Certificate, qrDataUrl: string): string {
    const issueDate = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Open Sans', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .certificate {
      width: 1000px;
      height: 700px;
      background: #ffffff;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }

    .border-decoration {
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 3px solid #e94560;
      border-radius: 15px;
      pointer-events: none;
    }

    .corner-decoration {
      position: absolute;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
      clip-path: polygon(0 0, 100% 0, 100% 20%, 20% 20%, 20% 100%, 0 100%);
    }

    .corner-decoration.top-left { top: 0; left: 0; }
    .corner-decoration.top-right { top: 0; right: 0; transform: rotate(90deg); }
    .corner-decoration.bottom-left { bottom: 0; left: 0; transform: rotate(-90deg); }
    .corner-decoration.bottom-right { bottom: 0; right: 0; transform: rotate(180deg); }

    .content {
      padding: 60px 80px;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #e94560;
      letter-spacing: 3px;
      margin-bottom: 10px;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      color: #1a1a2e;
      margin-bottom: 5px;
    }

    .subtitle {
      font-size: 14px;
      color: #666;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }

    .presented-to {
      font-size: 14px;
      color: #666;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      color: #1a1a2e;
      margin-bottom: 20px;
      border-bottom: 2px solid #e94560;
      display: inline-block;
      padding-bottom: 10px;
    }

    .achievement {
      font-size: 16px;
      color: #444;
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto 30px;
    }

    .achievement strong {
      color: #e94560;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 20px;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #e94560;
    }

    .stat-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 20px;
    }

    .signature {
      text-align: center;
    }

    .signature-line {
      width: 200px;
      height: 1px;
      background: #1a1a2e;
      margin-bottom: 5px;
    }

    .signature-name {
      font-size: 12px;
      color: #444;
    }

    .signature-title {
      font-size: 10px;
      color: #888;
    }

    .qr-section {
      text-align: center;
    }

    .qr-code {
      width: 100px;
      height: 100px;
      margin-bottom: 5px;
    }

    .verification-code {
      font-size: 10px;
      color: #888;
      font-family: monospace;
    }

    .date-section {
      text-align: center;
    }

    .date-label {
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .date-value {
      font-size: 14px;
      color: #444;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-decoration"></div>
    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration top-right"></div>
    <div class="corner-decoration bottom-left"></div>
    <div class="corner-decoration bottom-right"></div>

    <div class="content">
      <div class="header">
        <div class="logo">GAMILIT</div>
        <h1 class="title">Certificado de Logro</h1>
        <p class="subtitle">Plataforma de Lectura Gamificada</p>
      </div>

      <div class="body">
        <p class="presented-to">Se otorga a</p>
        <h2 class="student-name">${this.escapeHtml(cert.student_name)}</h2>
        <p class="achievement">
          Por haber completado exitosamente el módulo<br>
          <strong>"${this.escapeHtml(cert.achievement_name)}"</strong><br>
          demostrando dedicación y excelencia en el aprendizaje.
        </p>

        <div class="stats">
          <div class="stat">
            <div class="stat-value">${cert.final_score.toFixed(0)}%</div>
            <div class="stat-label">Puntaje Final</div>
          </div>
          <div class="stat">
            <div class="stat-value">${cert.total_xp_earned}</div>
            <div class="stat-label">XP Ganados</div>
          </div>
          <div class="stat">
            <div class="stat-value">${cert.exercises_completed}</div>
            <div class="stat-label">Ejercicios</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="signature">
          <div class="signature-line"></div>
          <div class="signature-name">GAMILIT Platform</div>
          <div class="signature-title">Certificación Oficial</div>
        </div>

        <div class="date-section">
          <div class="date-label">Fecha de Emisión</div>
          <div class="date-value">${issueDate}</div>
        </div>

        <div class="qr-section">
          <img class="qr-code" src="${qrDataUrl}" alt="QR Verificación">
          <div class="verification-code">${cert.verification_code}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

}
