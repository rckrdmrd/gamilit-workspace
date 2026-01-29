/**
 * ParentAuthService
 *
 * EXT-011 Parent Portal - Authentication Service
 *
 * @description Handles parent account registration, login, and student linking.
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import {
  ParentAccount,
  NotificationFrequency,
  ReportFormat,
} from '@/modules/auth/entities/parent-account.entity';
import {
  ParentStudentLink,
  LinkStatus,
} from '@/modules/auth/entities/parent-student-link.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';

import { ParentRegisterDto } from '../dto/parent-register.dto';
import { ParentLoginDto } from '../dto/parent-login.dto';
import { LinkStudentDto, VerifyLinkDto } from '../dto/link-student.dto';
import {
  ParentAuthResponseDto,
  ParentAuthTokensDto,
  ParentAccountResponseDto,
  LinkedStudentDto,
} from '../dto/parent-response.dto';
import { ParentJwtPayload } from '../guards/parent-auth.guard';

@Injectable()
export class ParentAuthService {
  private readonly logger = new Logger(ParentAuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(ParentAccount, 'auth')
    private readonly parentAccountRepo: Repository<ParentAccount>,
    @InjectRepository(ParentStudentLink, 'auth')
    private readonly linkRepo: Repository<ParentStudentLink>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectDataSource('auth')
    private readonly authDataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new parent account
   */
  async register(dto: ParentRegisterDto): Promise<ParentAuthResponseDto> {
    this.logger.log(`Registering parent: ${dto.email}`);

    // Check if email already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya esta registrado');
    }

    // Use transaction for atomic operations
    return await this.authDataSource.transaction(async (manager) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

      // Create user record
      // Note: Parents use STUDENT role but with parent metadata
      const user = manager.create(User, {
        email: dto.email.toLowerCase(),
        encrypted_password: hashedPassword,
        role: GamilityRoleEnum.STUDENT, // Parents use STUDENT role with metadata flag
        status: 'active',
        raw_user_meta_data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          registeredAs: 'parent',
          isParent: true,
        },
      });

      await manager.save(user);

      // Create profile record
      const profile = manager.create(Profile, {
        user_id: user.id,
        display_name: `${dto.firstName} ${dto.lastName}`,
        first_name: dto.firstName,
        last_name: dto.lastName,
        avatar_url: null,
        is_active: true,
      });

      await manager.save(profile);

      // Create parent account
      const parentAccount = manager.create(ParentAccount, {
        profileId: profile.id,
        relationshipType: dto.relationshipType || null,
        notificationFrequency: NotificationFrequency.WEEKLY,
        preferredReportFormat: ReportFormat.EMAIL,
        preferredLanguage: dto.preferredLanguage || 'es-MX',
        isVerified: false,
        isActive: true,
        alertOnLowPerformance: true,
        alertOnInactivityDays: 7,
        alertOnAchievementUnlocked: true,
        alertOnRankPromotion: true,
        canViewDetailedProgress: true,
        canViewExerciseAttempts: true,
        canReceiveAlerts: true,
        canDownloadReports: true,
        dashboardWidgets: ['progress', 'achievements', 'activity', 'recommendations'],
      });

      await manager.save(parentAccount);

      this.logger.log(`Parent account created: ${parentAccount.id}`);

      // Generate tokens
      const tokens = this.generateTokens(profile.id, user.email, parentAccount.id);

      return {
        tokens,
        account: this.mapToAccountResponse(parentAccount, profile, user.email),
      };
    });
  }

  /**
   * Login parent account
   */
  async login(dto: ParentLoginDto): Promise<ParentAuthResponseDto> {
    this.logger.log(`Parent login attempt: ${dto.email}`);

    // Find user
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.encrypted_password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Get profile
    const profile = await this.profileRepo.findOne({
      where: { user_id: user.id },
    });

    if (!profile) {
      throw new UnauthorizedException('Perfil no encontrado');
    }

    // Get parent account
    const parentAccount = await this.parentAccountRepo.findOne({
      where: { profileId: profile.id },
    });

    if (!parentAccount) {
      throw new UnauthorizedException('No tienes una cuenta de padre registrada');
    }

    if (!parentAccount.isActive) {
      throw new UnauthorizedException('Tu cuenta de padre esta inactiva');
    }

    // Update last login
    await this.parentAccountRepo.update(parentAccount.id, {
      lastLoginAt: new Date(),
    });

    this.logger.log(`Parent logged in: ${parentAccount.id}`);

    // Generate tokens
    const tokens = this.generateTokens(profile.id, user.email, parentAccount.id);

    return {
      tokens,
      account: this.mapToAccountResponse(parentAccount, profile, user.email),
    };
  }

  /**
   * Link a student to parent account
   */
  async linkStudent(
    parentAccountId: string,
    dto: LinkStudentDto,
  ): Promise<ParentStudentLink> {
    this.logger.log(`Linking student to parent ${parentAccountId}: code ${dto.studentCode}`);

    // Find student by student_id (code)
    const student = await this.profileRepo.findOne({
      where: {
        student_id: dto.studentCode,
        status: 'active' as any,
      },
    });

    if (!student) {
      throw new NotFoundException('Codigo de estudiante no encontrado');
    }

    // Check if link already exists
    const existingLink = await this.linkRepo.findOne({
      where: {
        parentAccountId,
        studentId: student.id,
      },
    });

    if (existingLink) {
      if (existingLink.linkStatus === LinkStatus.ACTIVE) {
        throw new ConflictException('Ya tienes un vinculo activo con este estudiante');
      }
      if (existingLink.linkStatus === LinkStatus.PENDING) {
        throw new ConflictException('Ya tienes una solicitud pendiente para este estudiante');
      }
    }

    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    // Create link
    const link = this.linkRepo.create({
      parentAccountId,
      studentId: student.id,
      relationshipType: dto.relationshipType,
      linkStatus: LinkStatus.PENDING,
      isVerified: false,
      verificationCode,
      verificationCodeExpiresAt: expiresAt,
      verificationAttempts: 0,
      studentApprovalRequired: dto.requireStudentApproval || false,
      canViewProgress: true,
      canViewGrades: true,
      canReceiveNotifications: true,
      canContactTeachers: false,
    });

    await this.linkRepo.save(link);

    this.logger.log(`Student link created: ${link.id} (pending verification)`);

    // TODO: Send verification email to parent with code

    return link;
  }

  /**
   * Verify student link with code
   */
  async verifyLink(
    parentAccountId: string,
    dto: VerifyLinkDto,
  ): Promise<ParentStudentLink> {
    const link = await this.linkRepo.findOne({
      where: {
        id: dto.linkId,
        parentAccountId,
        linkStatus: LinkStatus.PENDING,
      },
    });

    if (!link) {
      throw new NotFoundException('Solicitud de vinculo no encontrada');
    }

    // Check expiration
    if (link.verificationCodeExpiresAt && new Date() > link.verificationCodeExpiresAt) {
      throw new BadRequestException('El codigo de verificacion ha expirado');
    }

    // Check attempts
    if (link.verificationAttempts >= 5) {
      throw new BadRequestException('Demasiados intentos fallidos. Solicita un nuevo codigo.');
    }

    // Verify code
    if (link.verificationCode !== dto.verificationCode) {
      await this.linkRepo.update(link.id, {
        verificationAttempts: link.verificationAttempts + 1,
      });
      throw new BadRequestException('Codigo de verificacion incorrecto');
    }

    // Check if student approval is required
    if (link.studentApprovalRequired && !link.studentApproved) {
      // Mark as verified but keep pending until student approves
      await this.linkRepo.update(link.id, {
        isVerified: true,
        verifiedAt: new Date(),
        verificationCode: null,
        verificationCodeExpiresAt: null,
      });

      return this.linkRepo.findOneOrFail({ where: { id: link.id } });
    }

    // Activate link
    await this.linkRepo.update(link.id, {
      linkStatus: LinkStatus.ACTIVE,
      isVerified: true,
      verifiedAt: new Date(),
      activatedAt: new Date(),
      verificationCode: null,
      verificationCodeExpiresAt: null,
    });

    this.logger.log(`Student link verified and activated: ${link.id}`);

    return this.linkRepo.findOneOrFail({ where: { id: link.id } });
  }

  /**
   * Get linked students for a parent
   */
  async getLinkedStudents(parentAccountId: string): Promise<LinkedStudentDto[]> {
    const links = await this.linkRepo.find({
      where: {
        parentAccountId,
        linkStatus: LinkStatus.ACTIVE,
      },
      relations: ['student'],
    });

    return links.map((link) => ({
      studentId: link.studentId,
      linkId: link.id,
      displayName: link.student?.display_name || 'Unknown',
      avatarUrl: link.student?.avatar_url || undefined,
      relationshipType: link.relationshipType,
      linkStatus: link.linkStatus,
      canViewProgress: link.canViewProgress,
      canViewGrades: link.canViewGrades,
      canReceiveNotifications: link.canReceiveNotifications,
      canContactTeachers: link.canContactTeachers,
      linkedAt: link.activatedAt || link.createdAt,
    }));
  }

  /**
   * Verify email for parent account
   */
  async verifyEmail(token: string): Promise<void> {
    // TODO: Implement email verification logic
    this.logger.log(`Verifying email with token: ${token}`);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      this.logger.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // TODO: Generate reset token and send email
    this.logger.log(`Password reset requested for: ${email}`);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ParentAuthTokensDto> {
    try {
      const payload = await this.jwtService.verifyAsync<ParentJwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET') ||
          'dev-refresh-secret',
      });

      if (payload.type !== 'parent') {
        throw new UnauthorizedException('Token invalido');
      }

      // Verify parent account still active
      const parentAccount = await this.parentAccountRepo.findOne({
        where: {
          id: payload.parentAccountId,
          isActive: true,
        },
      });

      if (!parentAccount) {
        throw new UnauthorizedException('Cuenta de padre no encontrada o inactiva');
      }

      return this.generateTokens(payload.sub, payload.email, payload.parentAccountId);
    } catch {
      throw new UnauthorizedException('Token de refresco invalido o expirado');
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(
    profileId: string,
    email: string,
    parentAccountId: string,
  ): ParentAuthTokensDto {
    const payload: Omit<ParentJwtPayload, 'iat' | 'exp'> = {
      sub: profileId,
      email,
      parentAccountId,
      type: 'parent',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET') ||
        'dev-refresh-secret',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Generate 6-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Map parent account to response DTO
   */
  private mapToAccountResponse(
    account: ParentAccount,
    profile: Profile,
    email: string,
  ): ParentAccountResponseDto {
    return {
      id: account.id,
      profileId: account.profileId,
      displayName: profile.display_name || profile.full_name || profile.email,
      email,
      avatarUrl: profile.avatar_url || undefined,
      relationshipType: account.relationshipType || undefined,
      notificationFrequency: account.notificationFrequency,
      preferredReportFormat: account.preferredReportFormat,
      isVerified: account.isVerified,
      isActive: account.isActive,
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt || undefined,
    };
  }
}
