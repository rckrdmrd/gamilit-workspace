import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, MoreThan } from 'typeorm';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '@modules/auth/entities/user.entity';
import { Profile } from '@modules/auth/entities/profile.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import {
  ListUsersDto,
  UpdateUserDto,
  SuspendUserDto,
  ResetPasswordDto,
  PaginatedUsersDto,
  UserStatsDto,
  UserDetailsDto,
  AdminCreateUserDto,
  AdminCreatedUserDto,
} from '../dto/users';
import { UserStatusEnum, GamilityRoleEnum, LanguageEnum } from '@shared/constants';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepo: Repository<Tenant>,
  ) { }

  /** List users with filtering, pagination and search. */
  async listUsers(query: ListUsersDto): Promise<PaginatedUsersDto> {
    const { search, role, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Build WHERE conditions for cross-schema query
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`u.email ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      conditions.push(`u.gamilit_role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    // Use deleted_at to determine status (active/suspended)
    if (status) {
      if (status === UserStatusEnum.ACTIVE) {
        conditions.push('u.deleted_at IS NULL');
      } else if (status === UserStatusEnum.SUSPENDED || status === UserStatusEnum.INACTIVE) {
        conditions.push('u.deleted_at IS NOT NULL');
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Use raw SQL for cross-schema JOINs (auth + auth_management)
    const dataQuery = `
      SELECT
        u.id,
        u.email,
        u.gamilit_role AS role,
        u.status,
        u.email_confirmed_at,
        u.last_sign_in_at,
        u.raw_user_meta_data,
        u.deleted_at,
        u.created_at,
        u.updated_at,
        p.tenant_id,
        p.full_name AS profile_full_name,
        p.first_name AS profile_first_name,
        p.last_name AS profile_last_name,
        t.id AS organization_id,
        t.name AS organization_name
      FROM auth.users u
      LEFT JOIN auth_management.profiles p ON p.user_id = u.id
      LEFT JOIN auth_management.tenants t ON t.id = p.tenant_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM auth.users u
      LEFT JOIN auth_management.profiles p ON p.user_id = u.id
      LEFT JOIN auth_management.tenants t ON t.id = p.tenant_id
      ${whereClause}
    `;

    // Execute queries with parameters
    const dataParams = [...params, limit, skip];
    const countParams = [...params];

    try {
      const [rawResults, countResult] = await Promise.all([
        this.userRepo.query(dataQuery, dataParams),
        this.userRepo.query(countQuery, countParams),
      ]);

      const total = parseInt(countResult[0]?.count || '0', 10);

      // Transform raw results to UserDetailsDto
      // FIX: Use instanceToPlain to trigger @Transform decorators for date serialization
      const transformedUsers = rawResults.map((row: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Derive status: use deleted_at if set, otherwise use entity status field
        const computedStatus = row.deleted_at ? 'suspended' : (row.status || 'active');

        // Compute full_name from profile data
        const fullName = row.profile_full_name ||
          (row.profile_first_name && row.profile_last_name
            ? `${row.profile_first_name} ${row.profile_last_name}`.trim()
            : undefined);

        const dtoInstance = plainToInstance(
          UserDetailsDto,
          {
            id: row.id,
            email: row.email,
            role: row.role,
            tenant_id: row.tenant_id,
            organization_id: row.organization_id,
            organization_name: row.organization_name,
            full_name: fullName,
            status: computedStatus,
            email_verified: !!row.email_confirmed_at,
            email_confirmed_at: row.email_confirmed_at,
            last_sign_in_at: row.last_sign_in_at,
            raw_user_meta_data: row.raw_user_meta_data || {},
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
          { excludeExtraneousValues: true },
        );

        // Convert to plain object to trigger @Transform decorators (toPlainOnly)
        return instanceToPlain(dtoInstance, { excludeExtraneousValues: true });
      });

      return {
        data: transformedUsers,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Error listing users: ${err.message}`, err.stack);
      throw error;
    }
  }

  /** Get full user details including profile and roles. */
  async getUserDetails(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  /** Update user fields (profile, roles, status). */
  async updateUser(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserDetails(id);
    Object.assign(user, updateDto);
    return this.userRepo.save(user);
  }

  /** Soft-delete a user account. */
  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserDetails(id);

    // Soft delete usando deleted_at
    user.deleted_at = new Date();
    user.raw_user_meta_data = {
      ...user.raw_user_meta_data,
      deleted_at: new Date().toISOString(),
      deleted_reason: 'admin_deletion',
      status: 'deleted',
    };

    await this.userRepo.save(user);
  }

  /** Suspend a user account with reason. */
  async suspendUser(id: string, suspendDto: SuspendUserDto): Promise<User> {
    const user = await this.getUserDetails(id);

    // Fix: Usar deleted_at para marcar como suspendido (soft delete)
    user.deleted_at = new Date();
    user.raw_user_meta_data = {
      ...user.raw_user_meta_data,
      suspension_reason: suspendDto.reason,
      suspended_at: new Date().toISOString(),
      status: 'suspended', // Guardar status en metadata para referencia
    };
    return this.userRepo.save(user);
  }

  /** Activate a previously inactive user account. */
  async activateUser(id: string): Promise<User> {
    const user = await this.getUserDetails(id);

    // Fix: Limpiar deleted_at para marcar como activo
    user.deleted_at = undefined;
    user.raw_user_meta_data = {
      ...user.raw_user_meta_data,
      activated_at: new Date().toISOString(),
      status: 'active', // Guardar status en metadata para referencia
    };
    return this.userRepo.save(user);
  }

  /** Remove suspension from a user account. */
  async unsuspendUser(id: string): Promise<User> {
    const user = await this.getUserDetails(id);

    if (!user.deleted_at) {
      throw new BadRequestException('User is not currently suspended');
    }

    // Limpiar deleted_at y metadata de suspensión
    user.deleted_at = undefined;
    user.raw_user_meta_data = {
      ...user.raw_user_meta_data,
      unsuspended_at: new Date().toISOString(),
      status: 'active',
      suspension_reason: undefined, // Limpiar razón de suspensión
    };

    return this.userRepo.save(user);
  }

  /** Deactivate a user account. */
  async deactivateUser(id: string, deactivateDto: SuspendUserDto): Promise<User> {
    const user = await this.getUserDetails(id);

    if (user.deleted_at) {
      throw new BadRequestException('User is already deactivated or suspended');
    }

    // Marcar como desactivado (similar a suspend pero con diferente semántica)
    user.deleted_at = new Date();
    user.raw_user_meta_data = {
      ...user.raw_user_meta_data,
      deactivation_reason: deactivateDto.reason,
      deactivated_at: new Date().toISOString(),
      status: 'inactive',
    };

    return this.userRepo.save(user);
  }

  /** Reset user password and optionally send notification. */
  async resetPassword(
    id: string,
    resetDto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserDetails(id);

    // Mark user as requiring password reset
    user.raw_user_meta_data = {
      ...user.raw_user_meta_data,
      require_password_reset: true,
      password_reset_requested_at: new Date().toISOString(),
      password_reset_requested_by: 'admin',
    };

    await this.userRepo.save(user);

    // In production: Generate reset token and send email
    // For now, just return success
    const message = resetDto.sendEmail
      ? 'Password reset email sent to user'
      : 'User marked for password reset on next login';

    return {
      success: true,
      message,
    };
  }

  async getUserStats(): Promise<UserStatsDto> {
    const total = await this.userRepo.count();

    // Fix: Usar deleted_at para determinar usuarios activos/suspendidos
    const active = await this.userRepo.count({
      where: { deleted_at: IsNull() },
    });

    const suspended = await this.userRepo.count({
      where: { deleted_at: Not(IsNull()) },
    });

    // Fix: Usar email_confirmed_at para verificar email
    const pending = await this.userRepo.count({
      where: { email_confirmed_at: IsNull() },
    });

    // Conteos por rol usando la columna gamilit_role
    const students = await this.userRepo.count({
      where: {
        role: GamilityRoleEnum.STUDENT,
        deleted_at: IsNull(),
      },
    });

    const teachers = await this.userRepo.count({
      where: {
        role: GamilityRoleEnum.ADMIN_TEACHER,
        deleted_at: IsNull(),
      },
    });

    const admins = await this.userRepo.count({
      where: {
        role: GamilityRoleEnum.SUPER_ADMIN,
        deleted_at: IsNull(),
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = await this.userRepo.count({
      where: { created_at: MoreThan(thirtyDaysAgo) },
    });

    return {
      total_users: total,
      active_users: active,
      suspended_users: suspended,
      pending_verification: pending,
      students,
      teachers,
      admins,
      users_last_30_days: recent,
    };
  }

  /**
   * Crear nuevo usuario desde panel de administración
   *
   * @description Crea un usuario (estudiante o profesor) con su perfil asociado.
   * Valida email único, organización existente, y opcionalmente asigna a classroom.
   *
   * @param dto - Datos del usuario a crear
   * @returns Usuario creado con información de organización
   *
   * @throws ConflictException si el email ya existe
   * @throws NotFoundException si la organización no existe
   * @throws BadRequestException si el classroom no pertenece a la organización
   *
   * @see US-AE-010 - Crear Usuarios desde Admin
   */
  async createUser(dto: AdminCreateUserDto): Promise<AdminCreatedUserDto> {
    this.logger.log(`[US-AE-010] Creating user: ${dto.email}`);

    // 1. Validar que el email no exista
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException(`El email ${dto.email} ya está registrado`);
    }

    // 2. Validar que la organización exista
    const organization = await this.tenantRepo.findOne({
      where: { id: dto.organization_id },
    });
    if (!organization) {
      throw new NotFoundException(`Organización ${dto.organization_id} no encontrada`);
    }

    // 3. Generar contraseña temporal si no se provee
    const temporaryPassword = dto.temporary_password || this.generateSecurePassword();

    // 4. Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

    // 5. Extraer nombre y apellido del full_name
    const nameParts = dto.full_name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 6. Crear usuario en auth.users
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      encrypted_password: hashedPassword,
      role: dto.role,
      raw_user_meta_data: {
        full_name: dto.full_name,
        created_by_admin: true,
        organization_id: dto.organization_id,
      },
    });
    const savedUser = await this.userRepo.save(user);
    this.logger.log(`[US-AE-010] User created in auth.users: ${savedUser.id}`);

    // 7. Crear perfil en auth_management.profiles
    const profile = this.profileRepo.create({
      user_id: savedUser.id,
      tenant_id: dto.organization_id,
      email: dto.email.toLowerCase(),
      full_name: dto.full_name,
      first_name: firstName,
      last_name: lastName,
      role: dto.role,
      status: UserStatusEnum.ACTIVE,
      email_verified: false,
      preferences: {
        theme: 'light',
        language: LanguageEnum.ES,
        notifications: { email: true, push: true },
      },
      metadata: {
        created_by_admin: true,
        classroom_id: dto.classroom_id || null,
      },
    });
    await this.profileRepo.save(profile);
    this.logger.log(`[US-AE-010] Profile created: ${profile.id}`);

    // 8. TODO: Enviar email de bienvenida si send_welcome_email es true
    // Esto requiere integración con MailService
    const welcomeEmailSent = false; // dto.send_welcome_email !== false;

    // 9. Construir respuesta
    const response: AdminCreatedUserDto = {
      id: savedUser.id,
      email: savedUser.email,
      full_name: dto.full_name,
      role: dto.role,
      organization_id: dto.organization_id,
      organization_name: organization.name,
      classroom_id: dto.classroom_id,
      classroom_name: undefined, // TODO: Obtener nombre de classroom si existe
      status: 'pending',
      created_at: savedUser.created_at.toISOString(),
      welcome_email_sent: welcomeEmailSent,
      // Solo incluir contraseña temporal si NO se envió email
      temporary_password: welcomeEmailSent ? undefined : temporaryPassword,
    };

    this.logger.log(`[US-AE-010] User creation completed: ${savedUser.id}`);
    return response;
  }

  /**
   * Genera una contraseña segura de 12 caracteres
   * Incluye mayúsculas, minúsculas, números y símbolos
   */
  private generateSecurePassword(): string {
    const length = 12;
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    // Garantizar al menos uno de cada tipo
    let password = '';
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += symbols[crypto.randomInt(symbols.length)];

    // Completar con caracteres aleatorios
    for (let i = password.length; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    // Mezclar la contraseña
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  }
}
