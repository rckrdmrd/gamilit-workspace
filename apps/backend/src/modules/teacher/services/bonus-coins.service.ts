import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats } from '@modules/gamification/entities/user-stats.entity';
import { ClassroomMember } from '@modules/social/entities/classroom-member.entity';
import { Classroom } from '@modules/social/entities/classroom.entity';
import { Profile } from '@modules/auth/entities/profile.entity';
import { GrantBonusDto, GrantBonusResponseDto } from '../dto/grant-bonus.dto';

/**
 * BonusCoinsService
 *
 * @description
 * Servicio para gestionar el otorgamiento de bonus de ML Coins por parte de teachers.
 * Incluye validación de acceso (teacher → estudiante) y actualización de balances.
 *
 * @module teacher
 * @since 2025-11-24
 */
@Injectable()
export class BonusCoinsService {
  private readonly logger = new Logger(BonusCoinsService.name);

  constructor(
    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,
    @InjectRepository(ClassroomMember, 'social')
    private readonly classroomMemberRepo: Repository<ClassroomMember>,
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepo: Repository<Classroom>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Otorga bonus de ML Coins a un estudiante
   *
   * @description
   * Valida que:
   * 1. El estudiante existe
   * 2. El teacher tiene acceso al estudiante (está en una de sus clases)
   * 3. Actualiza el balance de ML Coins
   * 4. Registra la transacción en metadata
   *
   * @param teacherId - ID del teacher (profile.id)
   * @param studentId - ID del estudiante (profile.id)
   * @param dto - Datos del bonus (amount, reason)
   * @returns GrantBonusResponseDto con nuevo balance y confirmación
   *
   * @throws NotFoundException - Si el estudiante no existe
   * @throws ForbiddenException - Si el teacher no tiene acceso al estudiante
   */
  async grantBonus(
    teacherId: string,
    studentId: string,
    dto: GrantBonusDto,
  ): Promise<GrantBonusResponseDto> {
    // 1. Validar que el estudiante existe
    const studentProfile = await this.profileRepo.findOne({
      where: { id: studentId },
    });

    if (!studentProfile) {
      throw new NotFoundException(
        `Estudiante con ID ${studentId} no encontrado`,
      );
    }

    // 2. Validar que el teacher tiene acceso al estudiante
    // (el estudiante debe estar en al menos una de las clases del teacher)
    await this.validateTeacherAccess(teacherId, studentId);

    // 3. Obtener o crear user_stats del estudiante
    let userStats = await this.userStatsRepo.findOne({
      where: { user_id: studentId },
    });

    if (!userStats) {
      // Si no existe, crear registro inicial
      this.logger.warn(
        `UserStats not found for student ${studentId}. Creating initial record.`,
      );
      userStats = await this.createInitialUserStats(studentId);
    }

    // 4. Actualizar balance de ML Coins
    const previousBalance = userStats.ml_coins;
    userStats.ml_coins += dto.amount;
    userStats.ml_coins_earned_total += dto.amount;

    // 5. Registrar la transacción en metadata (historial)
    if (!userStats.metadata) {
      userStats.metadata = {};
    }

    if (!userStats.metadata.bonus_history) {
      userStats.metadata.bonus_history = [];
    }

    userStats.metadata.bonus_history.push({
      teacher_id: teacherId,
      amount: dto.amount,
      reason: dto.reason,
      granted_at: new Date().toISOString(),
      previous_balance: previousBalance,
      new_balance: userStats.ml_coins,
    });

    // 6. Guardar cambios
    await this.userStatsRepo.save(userStats);

    this.logger.log(
      `Teacher ${teacherId} granted ${dto.amount} ML Coins to student ${studentId}. ` +
        `New balance: ${userStats.ml_coins}. Reason: ${dto.reason}`,
    );

    // 7. Retornar respuesta
    return {
      success: true,
      newBalance: userStats.ml_coins,
      message: `Bonus de ${dto.amount} ML Coins otorgado exitosamente`,
      amountGranted: dto.amount,
      reason: dto.reason,
    };
  }

  /**
   * Valida que el teacher tenga acceso al estudiante
   *
   * @description
   * Verifica que el estudiante esté en al menos una de las clases del teacher.
   *
   * @param teacherId - ID del teacher
   * @param studentId - ID del estudiante
   * @throws ForbiddenException - Si no tiene acceso
   */
  private async validateTeacherAccess(
    teacherId: string,
    studentId: string,
  ): Promise<void> {
    // Obtener todas las clases del teacher
    const teacherClassrooms = await this.classroomRepo.find({
      where: { teacher_id: teacherId },
    });

    if (teacherClassrooms.length === 0) {
      throw new ForbiddenException(
        'No tienes clases asignadas para otorgar bonus',
      );
    }

    const classroomIds = teacherClassrooms.map((c) => c.id);

    // Verificar que el estudiante esté en al menos una de esas clases
    const membership = await this.classroomMemberRepo
      .createQueryBuilder('member')
      .where('member.student_id = :studentId', { studentId })
      .andWhere('member.classroom_id IN (:...classroomIds)', { classroomIds })
      .getOne();

    if (!membership) {
      throw new ForbiddenException(
        `No tienes acceso a este estudiante. El estudiante debe estar en una de tus clases.`,
      );
    }
  }

  /**
   * Crea un registro inicial de user_stats si no existe
   *
   * @param userId - ID del usuario (profile.id)
   * @returns UserStats creado
   */
  private async createInitialUserStats(userId: string): Promise<UserStats> {
    const newStats = this.userStatsRepo.create({
      user_id: userId,
      level: 1,
      total_xp: 0,
      xp_to_next_level: 100,
      current_rank: 'Ajaw',
      ml_coins: 100, // Balance inicial
      ml_coins_earned_total: 100,
      ml_coins_spent_total: 0,
      ml_coins_earned_today: 0,
      current_streak: 0,
      max_streak: 0,
      days_active_total: 0,
      exercises_completed: 0,
      modules_completed: 0,
      total_score: 0,
      achievements_earned: 0,
      certificates_earned: 0,
      sessions_count: 0,
      metadata: {},
    });

    return await this.userStatsRepo.save(newStats);
  }
}
