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
   */
  async findAll(): Promise<Module[]> {
    return await this.moduleRepo.find({
      order: { order_index: 'ASC' },
    });
  }

  /**
   * Obtener un módulo por ID
   */
  async findById(id: string): Promise<Module | null> {
    return await this.moduleRepo.findOne({ where: { id } });
  }

  /**
   * Crear un nuevo módulo
   */
  async create(moduleData: Partial<Module>): Promise<Module> {
    const module = this.moduleRepo.create(moduleData);
    return await this.moduleRepo.save(module);
  }

  /**
   * Actualizar un módulo existente
   */
  async update(id: string, moduleData: Partial<Module>): Promise<Module | null> {
    await this.moduleRepo.update(id, moduleData);
    return await this.findById(id);
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
    return await this.moduleRepo.find({
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

    return await this.moduleRepo
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
      return await this.findAll();
    }

    const searchTerm = `%${keyword.toLowerCase()}%`;

    return await this.moduleRepo
      .createQueryBuilder('module')
      .where('LOWER(module.title) LIKE :searchTerm', { searchTerm })
      .orWhere('LOWER(module.subtitle) LIKE :searchTerm', { searchTerm })
      .orWhere('LOWER(module.description) LIKE :searchTerm', { searchTerm })
      .orderBy('module.order_index', 'ASC')
      .getMany();
  }
}
