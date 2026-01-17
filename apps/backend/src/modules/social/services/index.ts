/**
 * Social Features Module - Services Barrel Export
 *
 * @description Exporta todos los servicios del módulo de características sociales.
 * Centraliza las importaciones para facilitar el uso en controladores y otros módulos.
 *
 * @module social/services
 */

export { FriendshipsService } from './friendships.service';
export { SchoolsService } from './schools.service';
export { ClassroomsService } from './classrooms.service';
export { ClassroomMembersService } from './classroom-members.service';
export { TeamsService } from './teams.service';
export { TeamMembersService } from './team-members.service';
export { TeamChallengesService } from './team-challenges.service';
export { PeerChallengesService } from './peer-challenges.service'; // ✨ NUEVO - P2 (Epic EXT-009)
export { ChallengeParticipantsService } from './challenge-participants.service'; // ✨ NUEVO - P2 (Epic EXT-009)
export { UserActivitiesService } from './user-activities.service'; // ✨ NUEVO - P2 (Activity Feed - TASK 2.5)
export { UserFollowsService } from './user-follows.service'; // ✨ NUEVO - P1 (EAI-005 - User Follows)
