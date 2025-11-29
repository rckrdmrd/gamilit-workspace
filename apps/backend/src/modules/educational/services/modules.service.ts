import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../entities';
import { DB_SCHEMAS } from '@shared/constants';
import { DifficultyLevelEnum } from '@shared/constants/enums.constants';

/**
 * ModulesService
 *
 * Servicio para gestionar módulos educativos.
 * Proporciona operaciones CRUD básicas y lógica de negocio especializada.
 */
@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module, 'educational')
    private readonly moduleRepo: Repository<Module>,
  ) {}

  /**
   * Obtener todos los módulos ordenados por índice
   * FILTRO: Módulos publicados O módulos en backlog (en construcción)
   * - Módulos publicados: is_published = true AND status = 'published'
   * - Módulos backlog: status = 'backlog' (para mostrar "En Construcción")
   */
  async findAll(): Promise<Module[]> {
    return this.moduleRepo
      .createQueryBuilder('module')
      .where(
        '(module.is_published = :published AND module.status = :publishedStatus) OR module.status = :backlogStatus',
        {
          published: true,
          publishedStatus: 'published',
          backlogStatus: 'backlog',
        },
      )
      .orderBy('module.order_index', 'ASC')
      .getMany();
  }

  /**
   * Obtener un módulo por ID
   */
  async findById(id: string): Promise<Module | null> {
    return this.moduleRepo.findOne({ where: { id } });
  }

  /**
   * Crear un nuevo módulo
   */
  async create(moduleData: Partial<Module>): Promise<Module> {
    const module = this.moduleRepo.create(moduleData);
    return this.moduleRepo.save(module);
  }

  /**
   * Actualizar un módulo existente
   */
  async update(id: string, moduleData: Partial<Module>): Promise<Module | null> {
    await this.moduleRepo.update(id, moduleData);
    return this.findById(id);
  }

  /**
   * Eliminar un módulo
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.moduleRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Obtener módulos filtrados por nivel de dificultad
   */
  async findByDifficulty(
    difficulty: DifficultyLevelEnum,
  ): Promise<Module[]> {
    return this.moduleRepo.find({
      where: { difficulty_level: difficulty },
      order: { order_index: 'ASC' },
    });
  }

  /**
   * Obtener los módulos prerequisitos de un módulo específico
   * Retorna los módulos que deben completarse antes del módulo actual
   */
  async getPrerequisites(moduleId: string): Promise<Module[]> {
    const module = await this.findById(moduleId);
    if (!module || !module.prerequisites || module.prerequisites.length === 0) {
      return [];
    }

    return this.moduleRepo
      .createQueryBuilder('module')
      .where('module.id IN (:...ids)', { ids: module.prerequisites })
      .orderBy('module.order_index', 'ASC')
      .getMany();
  }

  /**
   * Buscar módulos por palabra clave
   * Busca en título, subtítulo y descripción
   *
   * @param keyword - Palabra clave a buscar
   * @returns Módulos que coinciden con la búsqueda
   */
  async search(keyword: string): Promise<Module[]> {
    if (!keyword || keyword.trim().length === 0) {
      return this.findAll();
    }

    const searchTerm = `%${keyword.toLowerCase()}%`;

    return this.moduleRepo
      .createQueryBuilder('module')
      .where('LOWER(module.title) LIKE :searchTerm', { searchTerm })
      .orWhere('LOWER(module.subtitle) LIKE :searchTerm', { searchTerm })
      .orWhere('LOWER(module.description) LIKE :searchTerm', { searchTerm })
      .orderBy('module.order_index', 'ASC')
      .getMany();
  }

  /**
   * Obtener módulos con progreso del usuario
   *
   * IMPORTANTE: Arquitectura dual de ejercicios
   * - exercise_attempts: Ejercicios autocorregibles (requires_manual_grading = false)
   * - exercise_submissions: Ejercicios con calificación manual (requires_manual_grading = true)
   *
   * El query debe consultar AMBAS tablas para obtener el conteo correcto de ejercicios completados.
   * Preferimos usar module_progress.completed_exercises que es actualizado por triggers.
   *
   * @param userId - ID del usuario
   * @param classroomId - ID del classroom para filtrar módulos (opcional)
   * @returns Módulos con información de progreso incluida
   */
  async getUserModules(userId: string, classroomId?: string): Promise<any[]> {
    // Si se proporciona classroomId, filtrar por módulos asignados a ese classroom
    const classroomFilter = classroomId
      ? `AND EXISTS (
          SELECT 1 FROM educational_content.classroom_modules cm
          WHERE cm.module_id = m.id
            AND cm.classroom_id = $2
            AND cm.is_active = true
        )`
      : '';

    const query = `
      SELECT
        m.id,
        m.title,
        m.description,
        m.difficulty_level as difficulty,
        m.estimated_duration_minutes as "estimatedTime",
        m.xp_reward as "xpReward",
        m.ml_coins_reward as "mlCoinsReward",
        m.order_index,
        m.thumbnail_url as icon,
        m.subjects as category,
        m.status as module_status,
        -- Usar module_progress si existe, sino calcular de ambas tablas
        COALESCE(mp.progress_percentage,
          CASE
            WHEN total_ex.total > 0 THEN (CAST(completed_ex.completed AS DECIMAL) / total_ex.total) * 100
            ELSE 0
          END, 0) as progress,
        -- Usar module_progress.completed_exercises si existe, sino calcular
        COALESCE(mp.completed_exercises, completed_ex.completed, 0) as "completedExercises",
        COALESCE(mp.total_exercises, total_ex.total, 0) as "totalExercises",
        CASE
          WHEN mp.status = 'completed' THEN 'completed'
          WHEN mp.status = 'in_progress' THEN 'in_progress'
          WHEN COALESCE(mp.completed_exercises, completed_ex.completed, 0) > 0 THEN 'in_progress'
          WHEN mp.status IS NULL OR mp.status = 'not_started' THEN 'available'
          ELSE 'available'
        END as status
      FROM educational_content.modules m
      LEFT JOIN progress_tracking.module_progress mp
        ON m.id = mp.module_id AND mp.user_id = $1
      LEFT JOIN LATERAL (
        SELECT COUNT(*) as total
        FROM educational_content.exercises e
        WHERE e.module_id = m.id AND e.is_active = true
      ) total_ex ON true
      LEFT JOIN LATERAL (
        -- Contar ejercicios completados de AMBAS tablas (arquitectura dual)
        SELECT COUNT(DISTINCT exercise_id) as completed
        FROM (
          -- Ejercicios autocorregibles correctos (exercise_attempts)
          SELECT ea.exercise_id
          FROM progress_tracking.exercise_attempts ea
          INNER JOIN educational_content.exercises e ON e.id = ea.exercise_id
          WHERE ea.user_id = $1
            AND e.module_id = m.id
            AND e.is_active = true
            AND ea.is_correct = true
          UNION
          -- Ejercicios con calificación manual calificados (exercise_submissions)
          SELECT es.exercise_id
          FROM progress_tracking.exercise_submissions es
          INNER JOIN educational_content.exercises e ON e.id = es.exercise_id
          WHERE es.user_id = $1
            AND e.module_id = m.id
            AND e.is_active = true
            AND es.status = 'graded'
        ) all_completed
      ) completed_ex ON true
      WHERE (m.is_published = true OR m.status = 'backlog')
        ${classroomFilter}
      ORDER BY m.order_index ASC
    `;

    const params = classroomId ? [userId, classroomId] : [userId];
    return this.moduleRepo.query(query, params);
  }
}
