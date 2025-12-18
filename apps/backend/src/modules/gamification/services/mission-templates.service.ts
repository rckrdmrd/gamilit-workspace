import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  MissionTemplate,
  MissionTemplateTypeEnum,
  MissionTemplateDifficultyEnum,
} from '../entities/mission-template.entity';
import {
  CreateMissionTemplateDto,
  UpdateMissionTemplateDto,
  MissionTemplateFilterDto,
} from '../dto/mission-templates';

/**
 * MissionTemplatesService
 *
 * @description Gestión completa del sistema de templates de misiones
 *
 * Características principales:
 * - CRUD completo de templates
 * - Filtrado avanzado por tipo, categoría, dificultad
 * - Selección inteligente de templates por nivel de usuario
 * - Sistema de prioridades para selección
 * - Seeding de templates iniciales
 *
 * @see Entity: MissionTemplate
 * @see DDL: /apps/database/ddl/schemas/gamification_system/tables/20-mission_templates.sql
 */
@Injectable()
export class MissionTemplatesService {
  private readonly logger = new Logger(MissionTemplatesService.name);

  constructor(
    @InjectRepository(MissionTemplate, 'gamification')
    private readonly templatesRepo: Repository<MissionTemplate>,
  ) {}

  /**
   * Crea un nuevo template de misión
   *
   * @param dto - Datos del template
   * @param createdBy - ID del usuario creador (opcional)
   * @returns Template creado
   *
   * @throws {BadRequestException} Si max_level < min_level
   */
  async create(dto: CreateMissionTemplateDto, createdBy?: string): Promise<MissionTemplate> {
    // Validar que max_level >= min_level si está definido
    if (dto.max_level && dto.min_level && dto.max_level < dto.min_level) {
      throw new BadRequestException('max_level must be greater than or equal to min_level');
    }

    const template = this.templatesRepo.create({
      ...dto,
      created_by: createdBy || null,
    });

    const saved = await this.templatesRepo.save(template);

    this.logger.log(`Mission template created: ${saved.id} - ${saved.name}`);

    return saved;
  }

  /**
   * Obtiene todos los templates con filtros opcionales
   *
   * @param filters - Filtros de búsqueda
   * @returns Lista de templates con total count
   */
  async findAll(filters: MissionTemplateFilterDto): Promise<{
    data: MissionTemplate[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const where: FindOptionsWhere<MissionTemplate> = {};

    // Aplicar filtros
    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const queryBuilder = this.templatesRepo.createQueryBuilder('template');

    // Aplicar condiciones WHERE
    if (Object.keys(where).length > 0) {
      queryBuilder.where(where);
    }

    // Filtro por nivel de usuario (templates que el usuario puede usar)
    if (filters.user_level !== undefined) {
      queryBuilder.andWhere('template.min_level <= :userLevel', { userLevel: filters.user_level });
      queryBuilder.andWhere(
        '(template.max_level IS NULL OR template.max_level >= :userLevel)',
        { userLevel: filters.user_level },
      );
    }

    // Ordenar por prioridad (descendente) y luego por nombre
    queryBuilder.orderBy('template.priority', 'DESC');
    queryBuilder.addOrderBy('template.name', 'ASC');

    // Paginación
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    queryBuilder.take(limit);
    queryBuilder.skip(offset);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  /**
   * Obtiene un template por ID
   *
   * @param id - ID del template
   * @returns Template encontrado
   *
   * @throws {NotFoundException} Si no existe
   */
  async findOne(id: string): Promise<MissionTemplate> {
    const template = await this.templatesRepo.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Mission template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Actualiza un template existente
   *
   * @param id - ID del template
   * @param dto - Datos a actualizar
   * @returns Template actualizado
   *
   * @throws {NotFoundException} Si no existe
   * @throws {BadRequestException} Si max_level < min_level
   */
  async update(id: string, dto: UpdateMissionTemplateDto): Promise<MissionTemplate> {
    const template = await this.findOne(id);

    // Validar max_level si se está actualizando
    const newMinLevel = dto.min_level ?? template.min_level;
    const newMaxLevel = dto.max_level ?? template.max_level;

    if (newMaxLevel && newMaxLevel < newMinLevel) {
      throw new BadRequestException('max_level must be greater than or equal to min_level');
    }

    Object.assign(template, dto);

    const updated = await this.templatesRepo.save(template);

    this.logger.log(`Mission template updated: ${updated.id} - ${updated.name}`);

    return updated;
  }

  /**
   * Elimina (soft delete) un template
   *
   * @param id - ID del template
   * @returns Template desactivado
   *
   * @throws {NotFoundException} Si no existe
   */
  async remove(id: string): Promise<MissionTemplate> {
    const template = await this.findOne(id);

    template.is_active = false;

    const deactivated = await this.templatesRepo.save(template);

    this.logger.log(`Mission template deactivated: ${deactivated.id} - ${deactivated.name}`);

    return deactivated;
  }

  /**
   * Obtiene templates activos por tipo
   *
   * @param type - Tipo de misión (daily, weekly, etc.)
   * @param userLevel - Nivel del usuario para filtrar (opcional)
   * @returns Lista de templates activos
   */
  async getActiveByType(
    type: MissionTemplateTypeEnum,
    userLevel?: number,
  ): Promise<MissionTemplate[]> {
    const queryBuilder = this.templatesRepo
      .createQueryBuilder('template')
      .where('template.type = :type', { type })
      .andWhere('template.is_active = :active', { active: true });

    // Filtrar por nivel si se proporciona
    if (userLevel !== undefined) {
      queryBuilder.andWhere('template.min_level <= :userLevel', { userLevel });
      queryBuilder.andWhere(
        '(template.max_level IS NULL OR template.max_level >= :userLevel)',
        { userLevel },
      );
    }

    // Ordenar por prioridad
    queryBuilder.orderBy('template.priority', 'DESC');
    queryBuilder.addOrderBy('template.name', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Selecciona N templates aleatorios de una lista
   *
   * @param templates - Lista de templates
   * @param count - Cantidad a seleccionar
   * @returns Templates seleccionados aleatoriamente
   */
  selectRandom(templates: MissionTemplate[], count: number): MissionTemplate[] {
    if (templates.length <= count) {
      return templates;
    }

    // Algoritmo de selección ponderada por prioridad
    const selected: MissionTemplate[] = [];
    const available = [...templates];

    for (let i = 0; i < count && available.length > 0; i++) {
      // Calcular peso total (suma de prioridades)
      const totalWeight = available.reduce((sum, t) => sum + Math.max(1, t.priority), 0);

      // Seleccionar random basado en peso
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;

      for (let j = 0; j < available.length; j++) {
        random -= Math.max(1, available[j].priority);
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }

      selected.push(available[selectedIndex]);
      available.splice(selectedIndex, 1);
    }

    return selected;
  }

  /**
   * Siembra templates iniciales en la base de datos
   *
   * @description Crea los templates hardcodeados actuales como templates configurables
   * @returns Número de templates creados
   */
  async seed(): Promise<{ created: number; skipped: number; message: string }> {
    const seedTemplates: CreateMissionTemplateDto[] = [
      // DAILY MISSIONS (3)
      {
        name: 'Completar ejercicios',
        description: 'Completa 3 ejercicios hoy',
        type: MissionTemplateTypeEnum.DAILY,
        category: 'exercise',
        target_type: 'complete_exercises',
        target_value: 3,
        xp_reward: 50,
        ml_coins_reward: 25,
        difficulty: MissionTemplateDifficultyEnum.EASY,
        priority: 10,
        icon: 'book',
        color: '#4CAF50',
      },
      {
        name: 'Ganar 100 XP',
        description: 'Acumula 100 puntos de experiencia hoy',
        type: MissionTemplateTypeEnum.DAILY,
        category: 'xp',
        target_type: 'earn_xp',
        target_value: 100,
        xp_reward: 30,
        ml_coins_reward: 15,
        difficulty: MissionTemplateDifficultyEnum.NORMAL,
        priority: 8,
        icon: 'star',
        color: '#FFC107',
      },
      {
        name: 'Usar un comodín',
        description: 'Usa al menos un comodín en un ejercicio',
        type: MissionTemplateTypeEnum.DAILY,
        category: 'comodin',
        target_type: 'use_comodines',
        target_value: 1,
        xp_reward: 40,
        ml_coins_reward: 20,
        difficulty: MissionTemplateDifficultyEnum.EASY,
        priority: 5,
        icon: 'lightbulb',
        color: '#2196F3',
      },

      // WEEKLY MISSIONS (2)
      {
        name: 'Maratón de ejercicios',
        description: 'Completa 15 ejercicios esta semana',
        type: MissionTemplateTypeEnum.WEEKLY,
        category: 'exercise',
        target_type: 'complete_exercises',
        target_value: 15,
        xp_reward: 200,
        ml_coins_reward: 100,
        difficulty: MissionTemplateDifficultyEnum.NORMAL,
        priority: 10,
        icon: 'trophy',
        color: '#FF6B00',
      },
      {
        name: 'Racha semanal',
        description: 'Estudia 5 días consecutivos esta semana',
        type: MissionTemplateTypeEnum.WEEKLY,
        category: 'streak',
        target_type: 'daily_streak',
        target_value: 5,
        xp_reward: 300,
        ml_coins_reward: 150,
        difficulty: MissionTemplateDifficultyEnum.HARD,
        priority: 8,
        icon: 'fire',
        color: '#F44336',
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const templateData of seedTemplates) {
      // Verificar si ya existe un template similar
      const existing = await this.templatesRepo.findOne({
        where: {
          name: templateData.name,
          type: templateData.type,
        },
      });

      if (existing) {
        this.logger.log(`Skipping existing template: ${templateData.name}`);
        skipped++;
        continue;
      }

      await this.create(templateData);
      created++;
    }

    const message = `Seed completed: ${created} templates created, ${skipped} skipped`;
    this.logger.log(message);

    return { created, skipped, message };
  }
}
