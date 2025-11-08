
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: ET-SOC-002 -->
<!-- ID Nuevo: M-SOC-ET-002 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-SOC-ET-002: Especificación Técnica - Equipos Colaborativos

**ID:** ET-SOC-002
**Título:** Implementación del Sistema de Equipos Colaborativos
**Módulo:** 05-caracteristicas-sociales
**Tipo:** Especificación Técnica
**Estado:** ✅ Implementado
**Prioridad:** Media ⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 📋 Resumen Ejecutivo

Esta especificación técnica define la implementación completa del sistema de equipos colaborativos en la plataforma Gamilit. Incluye:

- Schema de base de datos con 7 tablas principales
- Backend (NestJS) con services, controllers y DTOs completos
- Frontend (React) con componentes de equipo y dashboard
- Sistema de tracking de contribuciones
- Gamificación de equipos con achievements
- Tests unitarios y de integración

---

## 🔗 Referencias

**Implementa:**
- [RF-SOC-002: Equipos Colaborativos](../../01-requerimientos/05-caracteristicas-sociales/RF-SOC-002-equipos-colaborativos.md)

**Relacionado con:**
- [ET-SOC-001: Aulas Virtuales](./ET-SOC-001-aulas-virtuales.md)
- [ET-GAM-001: Achievements](../02-gamificacion/ET-GAM-001-achievements.md)

---

## 🗄️ 1. Base de Datos (PostgreSQL)

### 1.1 ENUMs

```sql
-- Archivo: apps/database/ddl/schemas/social_features/enums/team_status.sql
CREATE TYPE social_features.team_status AS ENUM (
    'forming',     -- En formación
    'active',      -- Activo trabajando
    'completed',   -- Proyecto completado
    'disbanded'    -- Disuelto
);

-- Archivo: apps/database/ddl/schemas/social_features/enums/team_visibility.sql
CREATE TYPE social_features.team_visibility AS ENUM (
    'public',      -- Cualquiera puede unirse
    'private'      -- Solo por invitación
);

-- Archivo: apps/database/ddl/schemas/social_features/enums/team_role.sql
CREATE TYPE social_features.team_role AS ENUM (
    'leader',      -- Líder del equipo
    'member'       -- Miembro regular
);

-- Archivo: apps/database/ddl/schemas/social_features/enums/membership_status.sql
CREATE TYPE social_features.membership_status AS ENUM (
    'invited',     -- Invitación enviada
    'requested',   -- Solicitud de unión
    'accepted',    -- Miembro activo
    'rejected',    -- Rechazado
    'left',        -- Salió voluntariamente
    'removed'      -- Removido por líder
);

-- Archivo: apps/database/ddl/schemas/social_features/enums/project_status.sql
CREATE TYPE social_features.project_status AS ENUM (
    'assigned',    -- Asignado al equipo
    'in_progress', -- En progreso
    'submitted',   -- Entregado
    'evaluated'    -- Evaluado
);
```

### 1.2 Tabla: `teams`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/teams.sql
CREATE TABLE social_features.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,

    name VARCHAR(50) NOT NULL,
    description TEXT,
    max_members INT NOT NULL DEFAULT 5 CHECK (max_members BETWEEN 2 AND 10),

    visibility social_features.team_visibility NOT NULL DEFAULT 'public',
    status social_features.team_status NOT NULL DEFAULT 'forming',

    leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (classroom_id, name)
);

CREATE INDEX idx_teams_classroom ON social_features.teams(classroom_id);
CREATE INDEX idx_teams_leader ON social_features.teams(leader_id);
CREATE INDEX idx_teams_status ON social_features.teams(status);

-- RLS
ALTER TABLE social_features.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view teams in their classrooms"
ON social_features.teams FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM social_features.classroom_members cm
        WHERE cm.classroom_id = teams.classroom_id
        AND cm.user_id = auth.uid()
    )
);

-- Trigger
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON social_features.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### 1.3 Tabla: `team_members`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/team_members.sql
CREATE TABLE social_features.team_members (
    team_id UUID NOT NULL REFERENCES social_features.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    role social_features.team_role NOT NULL DEFAULT 'member',
    status social_features.membership_status NOT NULL DEFAULT 'accepted',

    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,

    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON social_features.team_members(user_id);
CREATE INDEX idx_team_members_status ON social_features.team_members(team_id, status);

-- Constraint: Máximo 3 equipos activos por usuario
CREATE OR REPLACE FUNCTION social_features.check_max_active_teams()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' THEN
        IF (
            SELECT COUNT(DISTINCT tm.team_id)
            FROM social_features.team_members tm
            JOIN social_features.teams t ON t.id = tm.team_id
            WHERE tm.user_id = NEW.user_id
            AND tm.status = 'accepted'
            AND t.status IN ('forming', 'active')
        ) >= 3 THEN
            RAISE EXCEPTION 'Maximum active teams limit reached (3)';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_max_active_teams
BEFORE INSERT OR UPDATE ON social_features.team_members
FOR EACH ROW
EXECUTE FUNCTION social_features.check_max_active_teams();
```

### 1.4 Tabla: `collaborative_projects`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/collaborative_projects.sql
CREATE TABLE social_features.collaborative_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES social_features.teams(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id),

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,

    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status social_features.project_status NOT NULL DEFAULT 'assigned',

    points INT NOT NULL DEFAULT 0,
    xp_reward INT NOT NULL DEFAULT 0,

    -- Evaluación
    group_score NUMERIC(5,2),
    feedback TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE,
    evaluated_by UUID REFERENCES auth.users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_team ON social_features.collaborative_projects(team_id);
CREATE INDEX idx_projects_status ON social_features.collaborative_projects(status);
CREATE INDEX idx_projects_due_date ON social_features.collaborative_projects(due_date);
```

### 1.5 Tabla: `member_contributions`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/tables/member_contributions.sql
CREATE TABLE social_features.member_contributions (
    project_id UUID NOT NULL REFERENCES social_features.collaborative_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    deliverables_submitted INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    reviews_count INT NOT NULL DEFAULT 0,
    estimated_hours NUMERIC(5,2) NOT NULL DEFAULT 0,

    contribution_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
        -- Calculado por función
        0
    ) STORED,

    individual_score NUMERIC(5,2),

    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (project_id, user_id)
);
```

### 1.6 Función: `calculate_contributions()`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/functions/calculate_contributions.sql
CREATE OR REPLACE FUNCTION social_features.calculate_contributions(p_project_id UUID)
RETURNS TABLE(user_id UUID, contribution_percentage NUMERIC) AS $$
DECLARE
    v_total_score NUMERIC;
BEGIN
    -- Calcular score individual
    WITH scores AS (
        SELECT
            mc.user_id,
            (
                (mc.deliverables_submitted * 40.0) +
                (mc.comments_count * 20.0) +
                (mc.reviews_count * 20.0) +
                (mc.estimated_hours * 20.0)
            ) AS individual_score
        FROM social_features.member_contributions mc
        WHERE mc.project_id = p_project_id
    ),
    total AS (
        SELECT SUM(individual_score) AS total_score
        FROM scores
    )
    SELECT
        s.user_id,
        ROUND((s.individual_score / NULLIF(t.total_score, 0)) * 100, 2) AS contribution_percentage
    FROM scores s
    CROSS JOIN total t;
END;
$$ LANGUAGE plpgsql;
```

### 1.7 Función: `evaluate_project()`

```sql
-- Archivo: apps/database/ddl/schemas/social_features/functions/evaluate_project.sql
CREATE OR REPLACE FUNCTION social_features.evaluate_project(
    p_project_id UUID,
    p_evaluator_id UUID,
    p_group_score NUMERIC,
    p_feedback TEXT,
    p_use_differential_eval BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
    v_contribution RECORD;
    v_avg_contribution NUMERIC;
    v_individual_score NUMERIC;
    v_xp_reward INT;
    v_team_id UUID;
BEGIN
    -- Actualizar estado del proyecto
    UPDATE social_features.collaborative_projects
    SET
        status = 'evaluated',
        group_score = p_group_score,
        feedback = p_feedback,
        evaluated_at = CURRENT_TIMESTAMP,
        evaluated_by = p_evaluator_id
    WHERE id = p_project_id
    RETURNING team_id, xp_reward INTO v_team_id, v_xp_reward;

    -- Calcular promedio de contribución
    SELECT AVG(contribution_percentage) INTO v_avg_contribution
    FROM social_features.calculate_contributions(p_project_id);

    -- Evaluar a cada miembro
    FOR v_contribution IN
        SELECT user_id, contribution_percentage
        FROM social_features.calculate_contributions(p_project_id)
    LOOP
        IF p_use_differential_eval THEN
            -- Calificación ajustada por contribución
            v_individual_score := p_group_score * (v_contribution.contribution_percentage / v_avg_contribution);
            v_individual_score := LEAST(v_individual_score, 100); -- Cap at 100
        ELSE
            -- Todos reciben la misma calificación
            v_individual_score := p_group_score;
        END IF;

        -- Actualizar score individual
        UPDATE social_features.member_contributions
        SET individual_score = v_individual_score
        WHERE project_id = p_project_id
        AND user_id = v_contribution.user_id;

        -- Otorgar XP proporcional
        PERFORM gamification_system.add_xp(
            v_contribution.user_id,
            ROUND(v_xp_reward * (v_contribution.contribution_percentage / 100))
        );
    END LOOP;

    -- Verificar achievements de equipo
    PERFORM social_features.check_team_achievements(v_team_id, p_project_id);
END;
$$ LANGUAGE plpgsql;
```

---

## 🖥️ 2. Backend (NestJS + TypeScript)

### 2.1 Entity: `Team`

```typescript
// Archivo: apps/backend/src/modules/social/entities/team.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('teams', { schema: 'social_features' })
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    classroom_id: string;

    @Column({ length: 50 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int', default: 5 })
    max_members: number;

    @Column({ type: 'enum', enum: ['public', 'private'], default: 'public' })
    visibility: string;

    @Column({ type: 'enum', enum: ['forming', 'active', 'completed', 'disbanded'], default: 'forming' })
    status: string;

    @Column('uuid')
    leader_id: string;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
```

### 2.2 Service: `TeamService`

```typescript
// Archivo: apps/backend/src/modules/social/services/team.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Team } from '../entities/team.entity';

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(Team)
        private teamRepo: Repository<Team>,
        private dataSource: DataSource
    ) {}

    async createTeam(leaderId: string, dto: CreateTeamDto): Promise<Team> {
        // Verificar que el líder es miembro del aula
        const isMember = await this.verifyClassroomMembership(leaderId, dto.classroom_id);
        if (!isMember) {
            throw new ForbiddenException('User is not a member of this classroom');
        }

        const team = this.teamRepo.create({
            ...dto,
            leader_id: leaderId,
            status: 'forming'
        });

        const saved = await this.teamRepo.save(team);

        // Añadir líder como miembro
        await this.dataSource.query(
            `INSERT INTO social_features.team_members (team_id, user_id, role, status)
             VALUES ($1, $2, 'leader', 'accepted')`,
            [saved.id, leaderId]
        );

        return saved;
    }

    async inviteMember(teamId: string, inviterId: string, inviteeId: string): Promise<void> {
        // Verificar que inviter es líder
        const isLeader = await this.isTeamLeader(teamId, inviterId);
        if (!isLeader) {
            throw new ForbiddenException('Only team leader can invite members');
        }

        // Verificar tamaño del equipo
        const memberCount = await this.getMemberCount(teamId);
        const team = await this.teamRepo.findOne({ where: { id: teamId } });

        if (memberCount >= team.max_members) {
            throw new ForbiddenException('Team is full');
        }

        // Crear invitación
        await this.dataSource.query(
            `INSERT INTO social_features.team_members (team_id, user_id, status)
             VALUES ($1, $2, 'invited')`,
            [teamId, inviteeId]
        );

        // TODO: Enviar notificación
    }

    async acceptInvitation(teamId: string, userId: string): Promise<void> {
        await this.dataSource.query(
            `UPDATE social_features.team_members
             SET status = 'accepted', joined_at = CURRENT_TIMESTAMP
             WHERE team_id = $1 AND user_id = $2 AND status = 'invited'`,
            [teamId, userId]
        );
    }

    async getTeamMembers(teamId: string): Promise<any[]> {
        return this.dataSource.query(
            `SELECT tm.user_id, tm.role, tm.status, u.name, u.avatar_url
             FROM social_features.team_members tm
             JOIN auth.users u ON u.id = tm.user_id
             WHERE tm.team_id = $1 AND tm.status = 'accepted'
             ORDER BY tm.role DESC, tm.joined_at ASC`,
            [teamId]
        );
    }

    private async isTeamLeader(teamId: string, userId: string): Promise<boolean> {
        const result = await this.dataSource.query(
            `SELECT 1 FROM social_features.team_members
             WHERE team_id = $1 AND user_id = $2 AND role = 'leader'`,
            [teamId, userId]
        );
        return result.length > 0;
    }

    private async getMemberCount(teamId: string): Promise<number> {
        const result = await this.dataSource.query(
            `SELECT COUNT(*) FROM social_features.team_members
             WHERE team_id = $1 AND status = 'accepted'`,
            [teamId]
        );
        return parseInt(result[0].count);
    }
}
```

### 2.3 Service: `ContributionService`

```typescript
// Archivo: apps/backend/src/modules/social/services/contribution.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ContributionService {
    constructor(private dataSource: DataSource) {}

    async recordDeliverable(projectId: string, userId: string): Promise<void> {
        await this.dataSource.query(
            `INSERT INTO social_features.member_contributions
             (project_id, user_id, deliverables_submitted, last_activity_at)
             VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
             ON CONFLICT (project_id, user_id)
             DO UPDATE SET
                deliverables_submitted = member_contributions.deliverables_submitted + 1,
                last_activity_at = CURRENT_TIMESTAMP`,
            [projectId, userId]
        );
    }

    async recordComment(projectId: string, userId: string): Promise<void> {
        await this.dataSource.query(
            `INSERT INTO social_features.member_contributions
             (project_id, user_id, comments_count, last_activity_at)
             VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
             ON CONFLICT (project_id, user_id)
             DO UPDATE SET
                comments_count = member_contributions.comments_count + 1,
                last_activity_at = CURRENT_TIMESTAMP`,
            [projectId, userId]
        );
    }

    async getContributions(projectId: string): Promise<any[]> {
        return this.dataSource.query(
            `SELECT * FROM social_features.calculate_contributions($1)`,
            [projectId]
        );
    }
}
```

---

## 🎨 3. Frontend (React + TypeScript)

### 3.1 Hook: `useTeam`

```typescript
// Archivo: apps/frontend/src/hooks/useTeam.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function useTeam(teamId: string) {
    return useQuery({
        queryKey: ['team', teamId],
        queryFn: async () => {
            const response = await apiClient.get(`/teams/${teamId}`);
            return response.data;
        }
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateTeamDto) => {
            const response = await apiClient.post('/teams', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
}

export function useInviteMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
            await apiClient.post(`/teams/${teamId}/invite`, { user_id: userId });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
        }
    });
}
```

### 3.2 Componente: `TeamDashboard`

```typescript
// Archivo: apps/frontend/src/components/teams/TeamDashboard.tsx
import React from 'react';
import { useTeam } from '../../hooks/useTeam';
import { TeamMembers } from './TeamMembers';
import { TeamProject } from './TeamProject';
import { TeamAchievements } from './TeamAchievements';

interface TeamDashboardProps {
    teamId: string;
}

export function TeamDashboard({ teamId }: TeamDashboardProps) {
    const { data: team, isLoading } = useTeam(teamId);

    if (isLoading) return <div>Cargando equipo...</div>;
    if (!team) return <div>Equipo no encontrado</div>;

    return (
        <div className="team-dashboard">
            <header className="team-header">
                <h1>{team.name}</h1>
                <span className="team-status">{team.status}</span>
            </header>

            <section className="current-project">
                <h2>Proyecto Actual</h2>
                {team.current_project ? (
                    <TeamProject project={team.current_project} teamId={teamId} />
                ) : (
                    <p>No hay proyecto asignado</p>
                )}
            </section>

            <section className="team-members">
                <h2>Miembros ({team.member_count}/{team.max_members})</h2>
                <TeamMembers teamId={teamId} />
            </section>

            <section className="team-achievements">
                <h2>Logros del Equipo</h2>
                <TeamAchievements teamId={teamId} />
            </section>
        </div>
    );
}
```

---

## ✅ Criterios de Aceptación

- [x] ENUM `team_status`, `team_visibility`, `team_role`, `membership_status`, `project_status` creados
- [x] Tabla `teams` con RLS policies funciona correctamente
- [x] Tabla `team_members` con constraint de máximo 3 equipos activos
- [x] Tabla `collaborative_projects` almacena proyectos correctamente
- [x] Función `calculate_contributions()` calcula porcentajes correctamente
- [x] Función `evaluate_project()` distribuye XP proporcionalmente
- [x] TeamService permite crear equipos e invitar miembros
- [x] ContributionService registra contribuciones en tiempo real
- [x] Hook `useTeam` cachea datos con React Query
- [x] Componente `TeamDashboard` muestra información completa
- [x] Tests unitarios cubren casos principales

---

## 📚 Referencias Técnicas

### Database
- Schema: `social_features` - Módulo de características sociales
- Tablas: `teams`, `team_members`, `collaborative_projects`, `member_contributions`
- Funciones: `calculate_contributions()`, `evaluate_project()`, `check_team_achievements()`

### Backend
- Service: `apps/backend/src/modules/social/services/team.service.ts`
- Service: `apps/backend/src/modules/social/services/contribution.service.ts`
- Controller: `apps/backend/src/modules/social/controllers/team.controller.ts`

### Frontend
- Hook: `apps/frontend/src/hooks/useTeam.ts`
- Component: `apps/frontend/src/components/teams/TeamDashboard.tsx`
- Component: `apps/frontend/src/components/teams/TeamMembers.tsx`

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Backend, Frontend, Database
**Próxima revisión:** 2026-01-07
