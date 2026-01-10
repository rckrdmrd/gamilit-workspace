import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../entities';
import { CreateClassroomDto } from '../dto';

/**
 * ClassroomsService
 *
 * Gestión de aulas virtuales para organizar estudiantes
 * - CRUD de aulas
 * - Validación de códigos únicos de acceso
 * - Control de capacidad y matrícula
 * - Configuración de horarios y ajustes
 * - Gestión de profesores y co-profesores
 */
@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom, 'social')
    private readonly classroomRepo: Repository<Classroom>,
  ) {}

  /**
   * Crea una nueva aula
   * @param dto - Datos para crear el aula
   * @returns Nueva aula creada
   * @throws ConflictException si el código ya existe
   */
  async create(dto: CreateClassroomDto): Promise<Classroom> {
    // Validar código único si se proporciona
    if (dto.code) {
      const existingClassroom = await this.classroomRepo.findOne({
        where: { code: dto.code },
      });

      if (existingClassroom) {
        throw new ConflictException(`Classroom with code ${dto.code} already exists`);
      }
    }

    const classroom = this.classroomRepo.create({
      ...dto,
      current_students_count: 0,
      is_active: true,
      is_archived: false,
      settings: dto.settings || {
        require_approval: true,
        visible_in_directory: true,
        allow_self_enrollment: false,
      },
      schedule: dto.schedule || [],
      metadata: dto.metadata || {},
    });

    return this.classroomRepo.save(classroom);
  }

  /**
   * Obtiene todas las aulas, opcionalmente filtradas por escuela o profesor
   * @param schoolId - ID de la escuela (opcional)
   * @param teacherId - ID del profesor (opcional)
   * @returns Lista de aulas ordenadas por nombre
   */
  async findAll(schoolId?: string, teacherId?: string): Promise<Classroom[]> {
    const whereCondition: any = {};

    if (schoolId) {
      whereCondition.school_id = schoolId;
    }

    if (teacherId) {
      whereCondition.teacher_id = teacherId;
    }

    return this.classroomRepo.find({
      where: whereCondition,
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtiene un aula por ID
   * @param id - ID del aula
   * @returns Aula encontrada
   * @throws NotFoundException si el aula no existe
   */
  async findById(id: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    return classroom;
  }

  /**
   * Obtiene un aula por su código único
   * @param code - Código del aula
   * @returns Aula encontrada
   * @throws NotFoundException si el aula no existe
   */
  async findByCode(code: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { code } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} not found`);
    }

    return classroom;
  }

  /**
   * Actualiza un aula
   * @param id - ID del aula
   * @param dto - Campos a actualizar
   * @returns Aula actualizada
   * @throws NotFoundException si el aula no existe
   * @throws ConflictException si el nuevo código ya existe
   */
  async update(id: string, dto: Partial<CreateClassroomDto>): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    // Si se actualiza el código, validar unicidad
    if (dto.code && dto.code !== classroom.code) {
      const existingClassroom = await this.classroomRepo.findOne({
        where: { code: dto.code },
      });

      if (existingClassroom) {
        throw new ConflictException(`Classroom with code ${dto.code} already exists`);
      }
    }

    // Validar fechas si se proporcionan
    if (dto.start_date && dto.end_date) {
      const startDate = new Date(dto.start_date);
      const endDate = new Date(dto.end_date);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    Object.assign(classroom, dto);
    return this.classroomRepo.save(classroom);
  }

  /**
   * Desactiva un aula (soft delete)
   * @param id - ID del aula
   * @returns Aula desactivada
   * @throws NotFoundException si el aula no existe
   */
  async delete(id: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    classroom.is_active = false;
    return this.classroomRepo.save(classroom);
  }

  /**
   * Obtiene estadísticas de un aula
   * @param id - ID del aula
   * @returns Estadísticas de matrícula, capacidad y promedios
   * @throws NotFoundException si el aula no existe
   */
  async getClassroomStats(id: string): Promise<{
    enrollment_count: number;
    capacity: number;
    capacity_usage_percentage: number;
    is_at_capacity: boolean;
    available_spots: number;
    average_grade: number;
  }> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    const capacityUsage =
      classroom.capacity > 0
        ? (classroom.current_students_count / classroom.capacity) * 100
        : 0;

    const availableSpots = Math.max(
      0,
      classroom.capacity - classroom.current_students_count,
    );

    return {
      enrollment_count: classroom.current_students_count,
      capacity: classroom.capacity,
      capacity_usage_percentage: Number(capacityUsage.toFixed(2)),
      is_at_capacity: classroom.current_students_count >= classroom.capacity,
      available_spots: availableSpots,
      average_grade: 0, // TODO: Calculate from classroom_members when available
    };
  }

  /**
   * Obtiene aulas activas de un profesor
   * @param teacherId - ID del profesor
   * @returns Lista de aulas activas ordenadas por nombre
   */
  async getActiveClassrooms(teacherId: string): Promise<Classroom[]> {
    return this.classroomRepo.find({
      where: {
        teacher_id: teacherId,
        is_active: true,
        is_archived: false,
      },
      order: { name: 'ASC' },
    });
  }

  /**
   * @deprecated FIX-2026-01-08: Este metodo NO debe usarse.
   * El contador current_students_count es manejado automaticamente por el
   * trigger trg_update_classroom_count cuando se insertan/eliminan/actualizan
   * registros en classroom_members.
   *
   * FLUJO CORRECTO para inscribir estudiantes:
   * 1. Usar ClassroomMembersService.create() que inserta en classroom_members
   * 2. El trigger automaticamente incrementa current_students_count
   *
   * Este metodo solo verifica capacidad y retorna el classroom sin modificarlo.
   *
   * @param classroomId - ID del aula
   * @param _studentId - ID del estudiante (no usado, use ClassroomMembersService)
   * @returns Aula sin modificar
   * @throws NotFoundException si el aula no existe
   * @throws BadRequestException si el aula está llena
   */
  async enrollStudent(classroomId: string, _studentId: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id: classroomId } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    // Verificar capacidad
    if (classroom.current_students_count >= classroom.capacity) {
      throw new BadRequestException('Classroom is at maximum capacity');
    }

    // FIX-2026-01-08: NO manipular contador directamente.
    // El trigger trg_update_classroom_count maneja esto automaticamente
    // cuando se crea el registro en classroom_members.
    // Solo retornamos el classroom para verificacion de capacidad.
    return classroom;
  }

  /**
   * @deprecated FIX-2026-01-08: Este metodo NO debe usarse.
   * El contador current_students_count es manejado automaticamente por el
   * trigger trg_update_classroom_count cuando se insertan/eliminan/actualizan
   * registros en classroom_members.
   *
   * FLUJO CORRECTO para retirar estudiantes:
   * 1. Usar ClassroomMembersService.withdraw() o updateStatus()
   * 2. El trigger automaticamente decrementa current_students_count
   *
   * Este metodo solo retorna el classroom sin modificarlo.
   *
   * @param classroomId - ID del aula
   * @param _studentId - ID del estudiante (no usado, use ClassroomMembersService)
   * @returns Aula sin modificar
   * @throws NotFoundException si el aula no existe
   */
  async removeStudent(classroomId: string, _studentId: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id: classroomId } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    // FIX-2026-01-08: NO manipular contador directamente.
    // El trigger trg_update_classroom_count maneja esto automaticamente
    // cuando se actualiza el status en classroom_members.
    // Solo retornamos el classroom.
    return classroom;
  }

  /**
   * Actualiza el horario de un aula
   * @param id - ID del aula
   * @param schedule - Nuevo horario
   * @returns Aula actualizada
   * @throws NotFoundException si el aula no existe
   */
  async updateSchedule(id: string, schedule: any[]): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    classroom.schedule = schedule;
    return this.classroomRepo.save(classroom);
  }
}
