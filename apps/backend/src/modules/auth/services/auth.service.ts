import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, Profile, UserSession, AuthAttempt, Tenant } from '../entities';
import {
  RegisterUserDto,
  UserResponseDto,
      UpdateProfileDto,
} from '../dto';
import { GamilityRoleEnum, UserStatusEnum } from '@shared/constants';

// Gamification entities
import { UserStats } from '@/modules/gamification/entities/user-stats.entity';
import { UserRank } from '@/modules/gamification/entities/user-rank.entity';
import { UserAchievement } from '@/modules/gamification/entities/user-achievement.entity';
import { Achievement } from '@/modules/gamification/entities/achievement.entity';
import { MLCoinsTransaction } from '@/modules/gamification/entities/ml-coins-transaction.entity';
import { InventoryService } from '@/modules/gamification/services/inventory.service';

// Progress tracking entities
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';

/** User statistics returned by getUserStatistics */
interface UserStatistics {
  total_xp: number;
  total_ml_coins: number;
  total_exercises: number;
  total_achievements: number;
  current_rank: string;
  modules_completed: number;
  login_streak: number;
  achievements_earned: number;
}

/**
 * AuthService
 *
 * @description Servicio de autenticación principal.
 * Maneja registro, login, logout y validación de usuarios.
 *
 * @responsibilities
 * - Registro de nuevos usuarios en tenant principal (GAMILIT Platform)
 * - Autenticación con JWT (access + refresh tokens)
 * - Logging de intentos (exitosos y fallidos)
 * - Gestión de sesiones activas
 *
 * @security
 * - Passwords hasheados con bcrypt (cost 10)
 * - Refresh tokens hasheados en DB (SHA256)
 * - Rate limiting en service layer
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User, 'auth')
    private readonly userRepository: Repository<User>,

    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,

    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepository: Repository<Tenant>,

    @InjectRepository(UserSession, 'auth')
    private readonly sessionRepository: Repository<UserSession>,

    @InjectRepository(AuthAttempt, 'auth')
    private readonly attemptRepository: Repository<AuthAttempt>,

    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepository: Repository<UserStats>,

    @InjectRepository(UserRank, 'gamification')
    private readonly userRanksRepository: Repository<UserRank>,

    @InjectRepository(UserAchievement, 'gamification')
    private readonly userAchievementsRepository: Repository<UserAchievement>,

    @InjectRepository(Achievement, 'gamification')
    private readonly achievementsRepository: Repository<Achievement>,

    @InjectRepository(MLCoinsTransaction, 'gamification')
    private readonly mlCoinsTransactionsRepository: Repository<MLCoinsTransaction>,

    @InjectRepository(ExerciseSubmission, 'progress')
    private readonly exerciseSubmissionsRepository: Repository<ExerciseSubmission>,

    private readonly inventoryService: InventoryService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async register(
    dto: RegisterUserDto,
    ip?: string,
    userAgent?: string,
  ): Promise<{ user: UserResponseDto; accessToken: string; refreshToken: string }> {
    // 1. Validar email único
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email ya registrado');
    }

    // 2. Hashear password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Obtener tenant principal de GAMILIT
    // FIX-2026-01-08: Corregido slug de 'gamilit-prod' a 'gamilit-platform'
    let mainTenant = await this.tenantRepository.findOne({
      where: { slug: 'gamilit-platform', is_active: true },
    });

    // Fallback: buscar primer tenant activo
    if (!mainTenant) {
      mainTenant = await this.tenantRepository.findOne({
        where: { is_active: true },
        order: { created_at: 'ASC' },
      });
    }

    // Validar que existe un tenant
    if (!mainTenant) {
      throw new Error('No hay tenants activos en el sistema. Contacte al administrador.');
    }

    // 4. Crear usuario (sin status ya que no existe en la tabla)
    const user = this.userRepository.create({
      email: dto.email,
      encrypted_password: hashedPassword,
      role: GamilityRoleEnum.STUDENT,
      // status: UserStatusEnum.ACTIVE, // Campo no existe en auth.users
      // email_verified: false, // Campo no existe en auth.users (se usa email_confirmed_at)
      // tenant_id: tenant.id, // Campo no existe en auth.users
    });
    await this.userRepository.save(user);

    // 5. Crear perfil con tenant principal
    // CRITICAL FIX: profiles.id MUST equal auth.users.id for FK consistency
    // This matches the pattern used in seeds and eliminates ID conversion bugs
    const profile = this.profileRepository.create({
      id: user.id,             // ✅ profiles.id = auth.users.id (same UUID)
      user_id: user.id,        // ✅ self-reference for consistency
      tenant_id: mainTenant.id, // ✅ Usa tenant principal
      email: user.email,
      first_name: dto.first_name || null,
      last_name: dto.last_name || null,
      school_id: dto.school_id || null, // ✅ Asignar escuela si se proporciona
      role: GamilityRoleEnum.STUDENT,
      status: UserStatusEnum.ACTIVE,
      email_verified: false,
    });
    await this.profileRepository.save(profile);

    // 5.1 P0-003: Verificar que triggers de gamificación ejecutaron correctamente
    // El trigger initialize_user_stats debería haber creado user_stats automáticamente
    // DB-125: user_stats.user_id apunta a profiles.id, usar profile.id para buscar
    const userStatsCreated = await this.userStatsRepository.findOne({
      where: { user_id: profile.id },
    });

    if (!userStatsCreated) {
      // Log el problema pero NO bloquear el registro
      // El trigger debería haber registrado el error en pending_user_initialization
      console.warn(
        `[P0-003] Gamification initialization may have failed for profile ${profile.id}. ` +
        `Check audit_logging.pending_user_initialization for details.`
      );
      // Nota: No lanzamos excepción porque el usuario ya está creado
      // El admin puede verificar y reinicializar manualmente si es necesario
    }

    // 6. Registrar intento exitoso
    await this.logAuthAttempt(user.id, dto.email, true, ip, userAgent);

    // 7. Generar tokens JWT (auto-login después del registro)
    // DB-125: JWT sub debe ser profile.id para consistencia con FKs de gamification
    // Nota: En registro, profile.id = user.id por diseño, pero usamos profile.id por claridad
    const payload = { sub: profile.id, email: user.email, role: profile.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 8. Crear sesión en la base de datos
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const sessionToken = crypto.randomBytes(32).toString('hex'); // Generar session token único
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const session = this.sessionRepository.create({
      user_id: profile.id, // IMPORTANT: user_id references profiles.id, not users.id
      tenant_id: profile.tenant_id,
      session_token: sessionToken,
      refresh_token: hashedRefreshToken,
      ip_address: ip || null,
      user_agent: userAgent || null,
      device_type: this.detectDeviceType(userAgent),
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
      expires_at: expiresAt,
      last_activity_at: new Date(),
      is_active: true,
    });
    await this.sessionRepository.save(session);

    // 9. Actualizar last_sign_in_at del usuario
    user.last_sign_in_at = new Date();
    await this.userRepository.save(user);

    // 10. Retornar usuario con tokens (P1-003: incluir profile)
    // Nuevo usuario no tiene items equipados
    return {
      user: this.toUserResponse(user, profile, mainTenant, {}),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login de usuario
   */
  async login(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ user: UserResponseDto; accessToken: string; refreshToken: string }> {
    // 1. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // 2. Constant-time password validation (prevents timing attack / user enumeration)
    // Always run bcrypt.compare regardless of whether user exists
    const dummyHash = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.encrypted_password || dummyHash,
    );

    if (!user || !isPasswordValid) {
      await this.logAuthAttempt(
        user?.id || null,
        email,
        false,
        ip,
        userAgent,
        !user ? 'Usuario no encontrado' : 'Password incorrecto',
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Validar estado activo (usando deleted_at ya que status no existe en la tabla)
    if (user.deleted_at) {
      await this.logAuthAttempt(user.id, email, false, ip, userAgent, 'Usuario inactivo (eliminado)');
      throw new UnauthorizedException('Usuario no activo');
    }

    // 4. Registrar intento exitoso
    await this.logAuthAttempt(user.id, email, true, ip, userAgent);

    // 5. Buscar perfil del usuario para obtener tenant_id
    const profile = await this.profileRepository.findOne({
      where: { user_id: user.id },
    });

    if (!profile) {
      throw new UnauthorizedException('Perfil de usuario no encontrado');
    }

    // 6. Generar tokens
    // DB-125: JWT sub debe ser profile.id (usado por gamification, progress, etc.)
    // NO user.id (auth.users.id) para consistencia con FKs de la BD
    const payload = { sub: profile.id, email: user.email, role: profile.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 7. Crear sesión en la base de datos
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const sessionToken = crypto.randomBytes(32).toString('hex'); // Generar session token único
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const session = this.sessionRepository.create({
      user_id: profile.id, // IMPORTANT: user_id references profiles.id, not users.id
      tenant_id: profile.tenant_id,
      session_token: sessionToken,
      refresh_token: hashedRefreshToken,
      ip_address: ip || null,
      user_agent: userAgent || null,
      device_type: this.detectDeviceType(userAgent),
      browser: this.detectBrowser(userAgent),
      os: this.detectOS(userAgent),
      expires_at: expiresAt,
      last_activity_at: new Date(),
      is_active: true,
    });
    await this.sessionRepository.save(session);

    // 8. Actualizar last_sign_in_at del usuario
    user.last_sign_in_at = new Date();
    await this.userRepository.save(user);

    // Obtener items equipados (skins)
    const equippedItems = await this.inventoryService.getEquippedItemsMap(profile.id);

    // 9. Retornar (P1-003: incluir profile con tenant_id)
    return {
      user: this.toUserResponse(user, profile, undefined, equippedItems),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validar usuario por ID
   * @param userAuthId - auth.users.id (NOT profile.id). Use req.user.user_id from controllers.
   */
  async validateUser(userAuthId: string): Promise<User | null> {
    // E7-FIX: Parameter must be auth.users.id for auth.users table lookup
    const user = await this.userRepository.findOne({
      where: { id: userAuthId },
    });
    // Verificar que no esté eliminado
    if (user && user.deleted_at) {
      return null;
    }
    return user;
  }

  /**
   * Logout de usuario
   */
  async logout(userId: string, sessionId: string): Promise<void> {
    await this.sessionRepository.delete({ id: sessionId, user_id: userId });
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // 1. Verificar y decodificar refresh token
      const payload = this.jwtService.verify(refreshToken);

      // 2. DB-125: payload.sub ahora es profile.id, buscar profile directamente
      const profile = await this.profileRepository.findOne({
        where: { id: payload.sub },
      });
      if (!profile) {
        throw new UnauthorizedException('Perfil no encontrado');
      }

      // 2.1 Validar que el usuario de auth.users esté activo
      if (!profile.user_id) {
        throw new UnauthorizedException('Perfil sin usuario asociado');
      }
      const user = await this.userRepository.findOne({
        where: { id: profile.user_id },
      });
      if (!user || user.deleted_at) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      // 3. Hashear refresh token para buscar sesión
      const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // 4. Buscar sesión activa con este refresh token
      // DB-125: session.user_id es profile.id
      const session = await this.sessionRepository.findOne({
        where: {
          user_id: profile.id,
          refresh_token: hashedRefreshToken,
        },
      });

      if (!session) {
        throw new UnauthorizedException('Sesión no encontrada o refresh token inválido');
      }

      // 5. Validar que la sesión no haya expirado
      if (new Date() > session.expires_at) {
        await this.sessionRepository.delete({ id: session.id });
        throw new UnauthorizedException('Sesión expirada');
      }

      // 6. Generar nuevos tokens
      // DB-125: JWT sub debe ser profile.id para consistencia con FKs
      const newPayload = { sub: profile.id, email: user.email, role: profile.role };
      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // 7. Actualizar sesión con nuevo refresh token
      const newHashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      session.refresh_token = newHashedRefreshToken;
      session.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
      session.last_activity_at = new Date();
      await this.sessionRepository.save(session);

      // 8. Retornar nuevos tokens
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Error de JWT (token inválido, expirado, malformado, etc.)
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Cambiar contraseña de usuario autenticado
   *
   * @description
   * Permite a un usuario autenticado cambiar su contraseña.
   * Requiere proporcionar la contraseña actual para validación de seguridad.
   *
   * @param userAuthId - auth.users.id (NOT profile.id). Use req.user.user_id from controllers.
   * @param currentPassword - Contraseña actual del usuario
   * @param newPassword - Nueva contraseña (mínimo 8 caracteres)
   *
   * @returns Mensaje de confirmación
   *
   * @throws NotFoundException - Usuario no encontrado
   * @throws BadRequestException - Contraseña actual incorrecta
   * @throws BadRequestException - Nueva contraseña muy corta
   * @throws BadRequestException - Nueva contraseña igual a la actual
   *
   * @security
   * - Valida contraseña actual con bcrypt.compare
   * - Hash nueva contraseña con bcrypt cost 10
   * - No invalida sesiones existentes (mejora futura)
   *
   * @see PasswordController.changePassword
   * @see ChangePasswordDto
   */
  async changePassword(
    userAuthId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // E8-FIX: userAuthId must be auth.users.id for auth.users table lookup
    // 1. Obtener usuario
    const user = await this.userRepository.findOne({ where: { id: userAuthId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.encrypted_password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // 3. Validar nueva contraseña
    if (newPassword.length < 8) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 8 caracteres');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    // 4. Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Actualizar contraseña
    await this.userRepository.update(
      { id: userAuthId },
      { encrypted_password: hashedPassword },
    );

    // 6. Opcional: Invalidar otras sesiones
    // await this.sessionService.revokeAllExceptCurrent(userId, currentSessionId);
    // TODO: Implementar en mejora futura para mayor seguridad

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Actualizar perfil del usuario
   * @param userAuthId - auth.users.id (NOT profile.id). Use req.user.user_id from controllers.
   */
  async updateUserProfile(userAuthId: string, dto: UpdateProfileDto): Promise<User> {
    // E9-FIX: userAuthId must be auth.users.id for auth.users + profiles.user_id lookups
    // 1. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: userAuthId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 2. Buscar perfil asociado (profiles.user_id = auth.users.id)
    const profile = await this.profileRepository.findOne({
      where: { user_id: userAuthId },
    });

    if (!profile) {
      throw new BadRequestException('Perfil no encontrado');
    }

    // 3. Actualizar campos del perfil que vienen en el DTO
    if (dto.display_name !== undefined) profile.display_name = dto.display_name;
    if (dto.full_name !== undefined) profile.full_name = dto.full_name;
    if (dto.first_name !== undefined) profile.first_name = dto.first_name;
    if (dto.last_name !== undefined) profile.last_name = dto.last_name;
    if (dto.avatar_url !== undefined) profile.avatar_url = dto.avatar_url;
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.phone !== undefined) profile.phone = dto.phone;
    if (dto.date_of_birth !== undefined) {
      profile.date_of_birth = typeof dto.date_of_birth === 'string'
        ? new Date(dto.date_of_birth)
        : dto.date_of_birth;
    }
    if (dto.grade_level !== undefined) profile.grade_level = dto.grade_level;
    if (dto.student_id !== undefined) profile.student_id = dto.student_id;
    if (dto.school_id !== undefined) profile.school_id = dto.school_id;
    if (dto.preferences !== undefined) profile.preferences = dto.preferences;
    if (dto.metadata !== undefined) profile.metadata = dto.metadata;

    // 4. Actualizar email en user si cambió (requiere re-verificación)
    if (dto.email !== undefined && dto.email !== user.email) {
      // Verificar que el nuevo email no esté en uso
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== userAuthId) {
        throw new ConflictException('Email ya está en uso');
      }

      user.email = dto.email;
      profile.email = dto.email;
      profile.email_verified = false; // Requiere re-verificación
      await this.userRepository.save(user);
    }

    // 5. Guardar perfil actualizado
    await this.profileRepository.save(profile);

    // 6. Retornar usuario actualizado
    const updatedUser = await this.userRepository.findOne({
      where: { id: userAuthId },
    });

    if (!updatedUser) {
      throw new UnauthorizedException('Usuario no encontrado después de actualización');
    }

    return updatedUser;
  }

  /**
   * Obtener preferencias del usuario
   */
  async getUserPreferences(userId: string): Promise<Record<string, unknown>> {
    // E3-FIX: userId is profile.id (from JWT sub), search by PK not user_id
    const profile = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!profile) {
      throw new UnauthorizedException('Perfil no encontrado');
    }

    return profile.preferences || {};
  }

  /**
   * Actualizar preferencias del usuario
   */
  async updateUserPreferences(userId: string, preferences: Record<string, unknown>): Promise<Record<string, unknown>> {
    // E3b-FIX: userId is profile.id (from JWT sub), search by PK not user_id
    const profile = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!profile) {
      throw new UnauthorizedException('Perfil no encontrado');
    }

    profile.preferences = preferences;
    await this.profileRepository.save(profile);

    return profile.preferences;
  }

  /**
   * Subir avatar del usuario
   */
  async uploadUserAvatar(userId: string, file: { originalname: string }): Promise<string> {
    // TODO: Implementar lógica de almacenamiento de archivos (S3, local storage, etc.)
    // Por ahora, retornamos una URL de ejemplo
    const avatarUrl = `/avatars/${userId}_${Date.now()}_${file.originalname}`;

    // E3c-FIX: userId is profile.id (from JWT sub), search by PK not user_id
    const profile = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!profile) {
      throw new UnauthorizedException('Perfil no encontrado');
    }

    profile.avatar_url = avatarUrl;
    await this.profileRepository.save(profile);

    return avatarUrl;
  }

  /**
   * Obtener estadísticas del usuario
   *
   * @description Obtiene estadísticas reales desde las tablas de gamificación y progreso.
   * Reemplaza la implementación mock con consultas a base de datos.
   *
   * @param userId - UUID del usuario
   * @returns UserStatistics con datos reales de la base de datos
   *
   * @implements GAP-008 - Real database queries for user statistics
   *
   * Estadísticas calculadas:
   * - total_ml_coins: Balance actual de ML Coins (user_stats.ml_coins_balance - actualizado por triggers)
   * - total_xp: Total XP acumulada (user_stats.total_xp)
   * - current_rank: Rango Maya actual (user_ranks.current_rank)
   * - achievements_earned: Total de logros desbloqueados (user_achievements.is_completed = true)
   * - total_achievements: Total de logros disponibles en el sistema
   * - total_exercises: Ejercicios completados (user_stats.exercises_completed - incluye autocorregibles)
   * - modules_completed: Módulos completados (user_stats.modules_completed)
   * - login_streak: Racha de días consecutivos (user_stats.current_streak)
   *
   * IMPORTANTE: Los ejercicios tienen arquitectura dual:
   * - exercise_attempts → Ejercicios autocorregibles (requires_manual_grading = false)
   * - exercise_submissions → Ejercicios con calificación manual (requires_manual_grading = true)
   * El trigger trg_update_user_stats_on_exercise actualiza exercises_completed automáticamente.
   */
  async getUserStatistics(userId: string): Promise<UserStatistics> {
    // Query 1: User Stats (XP, ML Coins, exercises, modules, streak)
    // Single query to get ALL core stats from user_stats table
    // These values are maintained by database triggers for accuracy
    const userStats = await this.userStatsRepository.findOne({
      where: { user_id: userId },
    });

    // Use trigger-maintained values from user_stats (more reliable than counting)
    const total_xp = userStats?.total_xp || 0;
    const total_ml_coins = userStats?.ml_coins || 0; // ml_coins = balance actual
    const total_exercises = userStats?.exercises_completed || 0;
    const modules_completed = userStats?.modules_completed || 0;
    const login_streak = userStats?.current_streak || 0;

    // Query 2: Current Rank (Maya rank system)
    // Gets the current active rank for the user
    const userRank = await this.userRanksRepository.findOne({
      where: { user_id: userId, is_current: true },
    });

    // Default to 'Ajaw' (lowest rank) if user has no rank yet
    const current_rank = userRank?.current_rank || 'Ajaw';

    // Query 3: Achievements Earned (unlocked achievements)
    // Counts user_achievements where is_completed = true
    const achievements_earned = await this.userAchievementsRepository.count({
      where: { user_id: userId, is_completed: true },
    });

    // Query 4: Total Achievements Available
    // Counts all active achievements in the system
    const total_achievements = await this.achievementsRepository.count({
      where: { is_active: true },
    });

    // Return matching frontend UserStatistics interface
    // IMPORTANT: Field names MUST match frontend expectations
    return {
      total_xp,
      total_ml_coins,
      total_exercises,
      total_achievements,
      current_rank,
      modules_completed,
      login_streak,
      achievements_earned, // Optional field for additional frontend usage
    };
  }

  /**
   * Search users by display name or username
   *
   * @param query - Search query string
   * @param currentUserId - Current user ID to exclude from results
   * @param limit - Maximum results to return (default 20)
   * @returns Array of matching user profiles
   */
  async searchUsers(
    query: string,
    currentUserId: string,
    limit: number = 20,
  ): Promise<Array<{ id: string; displayName: string; avatarUrl: string | null; username: string }>> {
    const profiles = await this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.id != :currentUserId', { currentUserId })
      .andWhere(
        '(LOWER(profile.display_name) LIKE :query OR LOWER(profile.first_name) LIKE :query OR LOWER(profile.last_name) LIKE :query OR LOWER(profile.email) LIKE :query)',
        { query: `%${query.toLowerCase()}%` }
      )
      .take(limit)
      .getMany();

    return profiles.map(p => ({
      id: p.id,
      displayName: p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
      avatarUrl: p.avatar_url,
      username: p.email?.split('@')[0] || 'unknown',
    }));
  }

  /**
   * Helper: Registrar intento de autenticación
   */
  private async logAuthAttempt(
    _userId: string | null,
    email: string,
    success: boolean,
    ip?: string,
    userAgent?: string,
    failureReason?: string,
  ): Promise<void> {
    const attempt = this.attemptRepository.create({
      email,
      success,
      ip_address: ip || '0.0.0.0',
      user_agent: userAgent || null,
      failure_reason: failureReason || null,
    });
    await this.attemptRepository.save(attempt);
  }

  /**
   * Helper: Convertir User a UserResponseDto con campos derivados
   *
   * @description Transforma User entity a DTO seguro para el cliente.
   * Calcula campos derivados para coherencia con Frontend:
   * - emailVerified: true si email_confirmed_at tiene valor
   * - isActive: true si NO está deleted_at ni banned_until activo
   *
   * P1-003: Incluye campos de Profile y Organization cuando se proporciona profile
   *
   * @param user - User entity de la base de datos
   * @param profile - (Opcional) Profile entity para incluir campos adicionales
   * @param tenant - (Opcional) Tenant entity para incluir organization info
   * @param equippedItems - (Opcional) Mapa de items equipados
   * @returns UserResponseDto con campos derivados calculados
   */
  public toUserResponse(
    user: User,
    profile?: Profile,
    _tenant?: Tenant,
    equippedItems?: Record<string, unknown>,
  ): UserResponseDto {
    const { encrypted_password: _encrypted_password, ...userWithoutPassword } = user;

    // Calcular campos derivados para coherencia Frontend-Backend
    const emailVerified = !!user.email_confirmed_at;
    const now = new Date();
    const isActive = !user.deleted_at &&
      (!user.banned_until || user.banned_until < now);

    // P0-006: Incluir campos de Profile si está disponible
    const profileFields = profile ? {
      first_name: profile.first_name,
      last_name: profile.last_name,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      status: profile.status,
      tenant_id: profile.tenant_id,
    } : {};

    // P0-005: Serializar dates a ISO string para consistencia Frontend
    const dateFields = {
      email_confirmed_at: user.email_confirmed_at?.toISOString(),
      phone_confirmed_at: user.phone_confirmed_at?.toISOString(),
      banned_until: user.banned_until?.toISOString(),
      last_sign_in_at: user.last_sign_in_at?.toISOString(),
      created_at: user.created_at?.toISOString() ?? new Date().toISOString(),
      updated_at: user.updated_at?.toISOString() ?? new Date().toISOString(),
    };

    return {
      ...userWithoutPassword,
      id: profile?.id ?? user.id, // E1-FIX: Ensure response id is profile.id (consistent with JWT sub)
      emailVerified,
      isActive,
      ...profileFields,
      ...dateFields,
      equipped_items: equippedItems || {},
    } as UserResponseDto;
  }

  /**
   * Helper: Detectar tipo de dispositivo desde user agent
   */
  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) {
      return 'desktop';
    }

    const ua = userAgent.toLowerCase();

    // Mobile
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return 'mobile';
    }

    // Tablet
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }

    // Desktop (default)
    return 'desktop';
  }

  /**
   * Helper: Detectar navegador desde user agent
   */
  private detectBrowser(userAgent?: string): string | null {
    if (!userAgent) {
      return null;
    }

    const ua = userAgent.toLowerCase();

    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';

    return 'Unknown';
  }

  /**
   * Helper: Detectar sistema operativo desde user agent
   */
  private detectOS(userAgent?: string): string | null {
    if (!userAgent) {
      return null;
    }

    const ua = userAgent.toLowerCase();

    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os')) return 'MacOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';

    return 'Unknown';
  }
}
