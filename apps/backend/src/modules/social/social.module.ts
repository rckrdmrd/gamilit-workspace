import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_SCHEMAS } from '@/shared/constants';
import * as entities from './entities';
import * as services from './services';
import * as controllers from './controllers';

/**
 * SocialModule
 *
 * @description Módulo de características sociales de Gamilit.
 * Gestiona amistades, escuelas, aulas, equipos y desafíos colaborativos.
 *
 * @entities
 * - Friendship: Relaciones de amistad entre usuarios
 * - School: Instituciones educativas
 * - Classroom: Aulas virtuales
 * - ClassroomMember: Membresía de estudiantes en aulas
 * - Team: Equipos colaborativos
 * - TeamMember: Membresía de usuarios en equipos
 * - TeamChallenge: Desafíos asignados a equipos
 *
 * @services
 * - FriendshipsService: Gestión de amistades y bloqueos
 * - SchoolsService: CRUD de instituciones educativas
 * - ClassroomsService: CRUD de aulas virtuales
 * - ClassroomMembersService: Gestión de membresía en aulas
 * - TeamsService: CRUD de equipos colaborativos
 * - TeamMembersService: Gestión de membresía en equipos
 * - TeamChallengesService: Gestión de desafíos de equipos
 *
 * @controllers
 * - FriendshipsController: 10 endpoints para amistades
 * - SchoolsController: 8 endpoints para escuelas
 * - ClassroomsController: 12 endpoints para aulas
 * - ClassroomMembersController: 10 endpoints para miembros de aulas
 * - TeamsController: 13 endpoints para equipos
 * - TeamMembersController: 8 endpoints para miembros de equipos
 * - TeamChallengesController: 9 endpoints para desafíos
 *
 * @totalEndpoints 70 endpoints RESTful con documentación Swagger completa
 */
@Module({
  imports: [
    // Connection 'social' handles schema 'social_features'
    TypeOrmModule.forFeature(
      [
        entities.Friendship,
        entities.School,
        entities.Classroom,
        entities.ClassroomMember,
        entities.Team,
        entities.TeamMember,
        entities.TeamChallenge,
      ],
      'social',
    ),
  ],
  providers: [
    services.FriendshipsService,
    services.SchoolsService,
    services.ClassroomsService,
    services.ClassroomMembersService,
    services.TeamsService,
    services.TeamMembersService,
    services.TeamChallengesService,
  ],
  controllers: [
    controllers.FriendshipsController,
    controllers.SchoolsController,
    controllers.ClassroomsController,
    controllers.ClassroomMembersController,
    controllers.TeamsController,
    controllers.TeamMembersController,
    controllers.TeamChallengesController,
  ],
  exports: [
    services.FriendshipsService,
    services.SchoolsService,
    services.ClassroomsService,
    services.ClassroomMembersService,
    services.TeamsService,
    services.TeamMembersService,
    services.TeamChallengesService,
  ],
})
export class SocialModule {}
