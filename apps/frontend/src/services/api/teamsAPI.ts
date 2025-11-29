/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Teams API Integration
 *
 * API client for team/guild features including team management,
 * members, and team operations.
 *
 * Note: Backend uses "teams" but frontend displays as "guilds"
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';

// ============================================================================
// TYPE DEFINITIONS (aligned with backend DTOs)
// ============================================================================

/**
 * Team DTO from backend
 */
export interface TeamDTO {
  id: string;
  classroom_id: string | null;
  tenant_id: string;
  name: string;
  description: string | null;
  motto: string | null;
  color_primary: string;
  color_secondary: string;
  avatar_url: string | null;
  banner_url: string | null;
  badges: any[];
  creator_id: string;
  leader_id: string | null;
  team_code: string | null;
  max_members: number;
  current_members_count: number;
  is_public: boolean;
  allow_join_requests: boolean;
  require_approval: boolean;
  total_xp: number;
  total_ml_coins: number;
  modules_completed: number;
  achievements_earned: number;
  is_active: boolean;
  is_verified: boolean;
  founded_at: string;
  last_activity_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Team Member DTO from backend
 */
export interface TeamMemberDTO {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  left_at: string | null;
}

/**
 * Create team request payload
 */
export interface CreateTeamRequest {
  classroom_id?: string;
  name: string;
  description?: string;
  motto?: string;
  color_primary?: string;
  color_secondary?: string;
  max_members?: number;
  is_public?: boolean;
  allow_join_requests?: boolean;
  require_approval?: boolean;
}

/**
 * Update team request payload
 */
export type UpdateTeamRequest = Partial<CreateTeamRequest>;

/**
 * Create team member request payload
 */
export interface CreateTeamMemberRequest {
  team_id: string;
  user_id: string;
  role?: string;
}

// ============================================================================
// TEAM API FUNCTIONS
// ============================================================================

/**
 * Get all teams (optionally filtered by classroom)
 *
 * @description Fetches all teams, with optional classroom filter
 *
 * @param classroomId - Optional classroom UUID for filtering
 * @returns Promise<TeamDTO[]>
 *
 * @endpoint GET /api/v1/social/teams?classroomId=...
 *
 * @example
 * ```ts
 * const teams = await teamsAPI.getAllTeams();
 * const classroomTeams = await teamsAPI.getAllTeams('classroom-id');
 * ```
 */
export async function getAllTeams(classroomId?: string): Promise<TeamDTO[]> {
  try {
    const params = classroomId ? { classroomId } : undefined;
    const response = await apiClient.get<TeamDTO[]>('/social/teams', { params });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch teams');
  }
}

/**
 * Get team by ID
 *
 * @description Fetches a specific team by its ID
 *
 * @param teamId - Team UUID
 * @returns Promise<TeamDTO>
 *
 * @endpoint GET /api/v1/social/teams/:id
 *
 * @example
 * ```ts
 * const team = await teamsAPI.getTeamById('990e8400-e29b-41d4-a716-446655440040');
 * ```
 */
export async function getTeamById(teamId: string): Promise<TeamDTO> {
  try {
    const response = await apiClient.get<TeamDTO>(`/social/teams/${teamId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch team');
  }
}

/**
 * Get team by code
 *
 * @description Fetches a team by its unique code
 *
 * @param code - Team code
 * @returns Promise<TeamDTO>
 *
 * @endpoint GET /api/v1/social/teams/code/:code
 *
 * @example
 * ```ts
 * const team = await teamsAPI.getTeamByCode('AGU2025');
 * ```
 */
export async function getTeamByCode(code: string): Promise<TeamDTO> {
  try {
    const response = await apiClient.get<TeamDTO>(`/social/teams/code/${code}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch team by code');
  }
}

/**
 * Create a new team
 *
 * @description Creates a new team
 *
 * @param data - Team creation data
 * @returns Promise<TeamDTO>
 *
 * @endpoint POST /api/v1/social/teams
 *
 * @example
 * ```ts
 * const team = await teamsAPI.createTeam({
 *   name: 'Los Águilas',
 *   description: 'Equipo de lectura avanzada',
 *   max_members: 5
 * });
 * ```
 */
export async function createTeam(data: CreateTeamRequest): Promise<TeamDTO> {
  try {
    const response = await apiClient.post<TeamDTO>('/social/teams', data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create team');
  }
}

/**
 * Update a team
 *
 * @description Updates team information
 *
 * @param teamId - Team UUID
 * @param data - Fields to update
 * @returns Promise<TeamDTO>
 *
 * @endpoint PATCH /api/v1/social/teams/:id
 *
 * @example
 * ```ts
 * const updated = await teamsAPI.updateTeam('team-id', { description: 'New description' });
 * ```
 */
export async function updateTeam(teamId: string, data: UpdateTeamRequest): Promise<TeamDTO> {
  try {
    const response = await apiClient.patch<TeamDTO>(`/social/teams/${teamId}`, data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update team');
  }
}

/**
 * Delete a team
 *
 * @description Permanently deletes a team
 *
 * @param teamId - Team UUID
 * @returns Promise<void>
 *
 * @endpoint DELETE /api/v1/social/teams/:id
 *
 * @example
 * ```ts
 * await teamsAPI.deleteTeam('team-id');
 * ```
 */
export async function deleteTeam(teamId: string): Promise<void> {
  try {
    await apiClient.delete(`/social/teams/${teamId}`);
  } catch (error) {
    throw handleAPIError(error, 'Failed to delete team');
  }
}

/**
 * Get team members
 *
 * @description Fetches all members of a team
 *
 * @param teamId - Team UUID
 * @returns Promise<TeamMemberDTO[]>
 *
 * @endpoint GET /api/v1/social/teams/:teamId/members
 *
 * @example
 * ```ts
 * const members = await teamsAPI.getTeamMembers('team-id');
 * ```
 */
export async function getTeamMembers(teamId: string): Promise<TeamMemberDTO[]> {
  try {
    const response = await apiClient.get<TeamMemberDTO[]>(`/social/teams/${teamId}/members`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch team members');
  }
}

/**
 * Add member to team (join team)
 *
 * @description Adds a user to a team
 *
 * @param teamId - Team UUID
 * @param userId - User UUID
 * @returns Promise<TeamDTO>
 *
 * @endpoint POST /api/v1/social/teams/:teamId/members/:userId
 *
 * @example
 * ```ts
 * const team = await teamsAPI.addTeamMember('team-id', 'user-id');
 * ```
 */
export async function addTeamMember(teamId: string, userId: string): Promise<TeamDTO> {
  try {
    const response = await apiClient.post<TeamDTO>(`/social/teams/${teamId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to add team member');
  }
}

/**
 * Remove member from team (leave team)
 *
 * @description Removes a user from a team
 *
 * @param teamId - Team UUID
 * @param userId - User UUID
 * @returns Promise<TeamDTO>
 *
 * @endpoint DELETE /api/v1/social/teams/:teamId/members/:userId
 *
 * @example
 * ```ts
 * const team = await teamsAPI.removeTeamMember('team-id', 'user-id');
 * ```
 */
export async function removeTeamMember(teamId: string, userId: string): Promise<TeamDTO> {
  try {
    const response = await apiClient.delete<TeamDTO>(`/social/teams/${teamId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to remove team member');
  }
}

/**
 * Update team score
 *
 * @description Updates the total score of a team
 *
 * @param teamId - Team UUID
 * @param score - New score value
 * @returns Promise<TeamDTO>
 *
 * @endpoint PATCH /api/v1/social/teams/:id/score
 *
 * @example
 * ```ts
 * const team = await teamsAPI.updateTeamScore('team-id', 1500);
 * ```
 */
export async function updateTeamScore(teamId: string, score: number): Promise<TeamDTO> {
  try {
    const response = await apiClient.patch<TeamDTO>(`/social/teams/${teamId}/score`, { score });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update team score');
  }
}

/**
 * Add XP to team
 *
 * @description Adds experience points to a team
 *
 * @param teamId - Team UUID
 * @param xp - XP to add
 * @returns Promise<TeamDTO>
 *
 * @endpoint POST /api/v1/social/teams/:id/xp
 *
 * @example
 * ```ts
 * const team = await teamsAPI.addTeamXP('team-id', 250);
 * ```
 */
export async function addTeamXP(teamId: string, xp: number): Promise<TeamDTO> {
  try {
    const response = await apiClient.post<TeamDTO>(`/social/teams/${teamId}/xp`, { xp });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to add team XP');
  }
}

/**
 * Get team statistics
 *
 * @description Fetches detailed statistics for a team
 *
 * @param teamId - Team UUID
 * @returns Promise<any>
 *
 * @endpoint GET /api/v1/social/teams/:id/stats
 *
 * @example
 * ```ts
 * const stats = await teamsAPI.getTeamStats('team-id');
 * ```
 */
export async function getTeamStats(teamId: string): Promise<any> {
  try {
    const response = await apiClient.get<any>(`/social/teams/${teamId}/stats`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch team stats');
  }
}

/**
 * Get teams leaderboard for a classroom
 *
 * @description Fetches the leaderboard of teams in a classroom, ordered by score
 *
 * @param classroomId - Classroom UUID
 * @returns Promise<TeamDTO[]>
 *
 * @endpoint GET /api/v1/social/classrooms/:classroomId/teams/leaderboard
 *
 * @example
 * ```ts
 * const leaderboard = await teamsAPI.getTeamsLeaderboard('classroom-id');
 * ```
 */
export async function getTeamsLeaderboard(classroomId: string): Promise<TeamDTO[]> {
  try {
    const response = await apiClient.get<TeamDTO[]>(
      `/social/classrooms/${classroomId}/teams/leaderboard`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch teams leaderboard');
  }
}

// ============================================================================
// TEAM MEMBERS API FUNCTIONS
// ============================================================================

/**
 * Get teams for a user
 *
 * @description Fetches all teams a user is a member of
 *
 * @param userId - User UUID
 * @returns Promise<TeamMemberDTO[]>
 *
 * @endpoint GET /api/v1/social/team-members/users/:userId
 *
 * @example
 * ```ts
 * const userTeams = await teamsAPI.getUserTeams('user-id');
 * ```
 */
export async function getUserTeams(userId: string): Promise<TeamMemberDTO[]> {
  try {
    const response = await apiClient.get<TeamMemberDTO[]>(`/social/team-members/users/${userId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user teams');
  }
}

/**
 * Get active team members
 *
 * @description Fetches only active members of a team
 *
 * @param teamId - Team UUID
 * @returns Promise<TeamMemberDTO[]>
 *
 * @endpoint GET /api/v1/social/team-members/teams/:teamId/active
 *
 * @example
 * ```ts
 * const activeMembers = await teamsAPI.getActiveTeamMembers('team-id');
 * ```
 */
export async function getActiveTeamMembers(teamId: string): Promise<TeamMemberDTO[]> {
  try {
    const response = await apiClient.get<TeamMemberDTO[]>(
      `/social/team-members/teams/${teamId}/active`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch active team members');
  }
}

/**
 * Update member role
 *
 * @description Updates the role of a team member
 *
 * @param memberId - Team member UUID
 * @param role - New role
 * @returns Promise<TeamMemberDTO>
 *
 * @endpoint PATCH /api/v1/social/team-members/:id/role
 *
 * @example
 * ```ts
 * const member = await teamsAPI.updateMemberRole('member-id', 'admin');
 * ```
 */
export async function updateMemberRole(memberId: string, role: string): Promise<TeamMemberDTO> {
  try {
    const response = await apiClient.patch<TeamMemberDTO>(`/social/team-members/${memberId}/role`, {
      role,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update member role');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Teams API namespace
 *
 * @usage
 * ```ts
 * import { teamsAPI } from '@/services/api/teamsAPI';
 *
 * const teams = await teamsAPI.getAllTeams();
 * const team = await teamsAPI.createTeam({ name: 'My Team' });
 * await teamsAPI.addTeamMember('team-id', 'user-id');
 * ```
 */
export const teamsAPI = {
  // Teams
  getAllTeams,
  getTeamById,
  getTeamByCode,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeamScore,
  addTeamXP,
  getTeamStats,
  getTeamsLeaderboard,

  // Team Members
  getUserTeams,
  getActiveTeamMembers,
  updateMemberRole,
};

export default teamsAPI;
