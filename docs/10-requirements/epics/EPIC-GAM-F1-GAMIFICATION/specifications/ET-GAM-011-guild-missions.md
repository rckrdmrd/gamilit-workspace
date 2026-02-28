---
titulo: "ET-GAM-011: Guild Missions System"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-GAM-011: Guild Missions System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-011 |
| **Modulo** | Gamificacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 40% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-GAM-014: Guild Missions

### User Stories
- US-GAM-014: Collaborative Guild Missions

---

## Descripcion Funcional

Sistema de misiones colaborativas para gremios:
- Misiones de gremio con objetivos compartidos
- Contribuciones individuales al objetivo comun
- Recompensas para todo el gremio al completar
- Leaderboard entre gremios
- Bonificaciones por participacion

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - GuildMissionsWidget                                   |
|  - GuildMissionCard                                      |
|  - GuildContributors                                     |
|  - GuildLeaderboard                                      |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - GuildsController                                      |
|  - GuildMissionsService                                  |
|  - GuildContributionsService                             |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - social_features.guilds                                |
|  - (FALTANTE) social_features.guild_missions             |
|  - (FALTANTE) social_features.guild_contributions        |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Database - Guilds (Teams)

**Ubicacion:** `apps/backend/src/modules/social/entities/team.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'teams' })
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('uuid')
  leader_id!: string;

  @Column('text', { nullable: true })
  emblem_url?: string;

  @Column('int', { default: 0 })
  total_xp!: number;

  @Column('int', { default: 1 })
  level!: number;

  @Column('int', { default: 0 })
  members_count!: number;

  @Column('int', { default: 10 })
  max_members!: number;

  @Column('boolean', { default: false })
  is_private!: boolean;
}
```

### Backend - TeamsService

**Ubicacion:** `apps/backend/src/modules/social/services/teams.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class TeamsService {
  async create(leaderId: string, data: CreateTeamDto): Promise<Team>;
  async findById(id: string): Promise<Team>;
  async findByMember(userId: string): Promise<Team | null>;
  async addMember(teamId: string, userId: string): Promise<TeamMember>;
  async removeMember(teamId: string, userId: string): Promise<void>;
  async updateLeader(teamId: string, newLeaderId: string): Promise<Team>;
  async getLeaderboard(limit: number): Promise<TeamRanking[]>;
}
```

### Frontend - Guilds Page

**Ubicacion:** `apps/frontend/src/apps/student/pages/GuildsPage.tsx`

**Estado:** COMPLETO (100%)

---

## Lo que Falta para Completar (60%)

### 1. Database Schema (15%)

```sql
-- tables/guild_missions.sql (NUEVO)
CREATE TABLE social_features.guild_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES social_features.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objective_type TEXT NOT NULL, -- 'collective_xp', 'collective_exercises', 'collective_streak'
  target_value INT NOT NULL,
  current_value INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'expired'
  rewards JSONB NOT NULL, -- {"guild_xp": 500, "individual_coins": 50}
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guild_missions_guild ON social_features.guild_missions(guild_id);
CREATE INDEX idx_guild_missions_status ON social_features.guild_missions(status);

-- tables/guild_contributions.sql (NUEVO)
CREATE TABLE social_features.guild_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES social_features.guild_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  contribution_value INT NOT NULL,
  contributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mission_id, user_id, contributed_at::DATE) -- Una contribucion por dia por usuario
);

CREATE INDEX idx_guild_contributions_mission ON social_features.guild_contributions(mission_id);
CREATE INDEX idx_guild_contributions_user ON social_features.guild_contributions(user_id);
```

### 2. GuildMissionsService (20%)

```typescript
// services/guild-missions.service.ts (NUEVO)
@Injectable()
export class GuildMissionsService {
  /**
   * Crea mision de gremio
   */
  async createMission(
    guildId: string,
    data: CreateGuildMissionDto
  ): Promise<GuildMission>;

  /**
   * Lista misiones activas del gremio
   */
  async getActiveMissions(guildId: string): Promise<GuildMission[]>;

  /**
   * Registra contribucion de miembro
   */
  async addContribution(
    missionId: string,
    userId: string,
    value: number
  ): Promise<Contribution>;

  /**
   * Obtiene top contributors de mision
   */
  async getTopContributors(
    missionId: string,
    limit: number
  ): Promise<Contributor[]>;

  /**
   * Verifica y completa misiones
   */
  async checkMissionCompletion(missionId: string): Promise<boolean>;

  /**
   * Distribuye recompensas al completar
   */
  async distributeRewards(missionId: string): Promise<void>;

  /**
   * Genera misiones semanales para gremios
   */
  @Cron('0 0 * * 1') // Lunes 00:00
  async generateWeeklyMissions(): Promise<void>;
}

interface GuildMission {
  id: string;
  guildId: string;
  title: string;
  description: string;
  objectiveType: 'collective_xp' | 'collective_exercises' | 'collective_streak';
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100%
  status: 'active' | 'completed' | 'expired';
  rewards: {
    guildXp: number;
    individualCoins: number;
    bonusItem?: string;
  };
  topContributors: Contributor[];
  expiresAt: Date;
}

interface Contributor {
  userId: string;
  displayName: string;
  avatarUrl: string;
  contribution: number;
  percentage: number;
}
```

### 3. Frontend Components (15%)

```typescript
// components/GuildMissionCard.tsx (NUEVO)
interface GuildMissionCardProps {
  mission: GuildMission;
  userContribution: number;
  onContribute?: () => void;
}

export const GuildMissionCard: React.FC<GuildMissionCardProps>;

// components/GuildContributors.tsx (NUEVO)
interface GuildContributorsProps {
  contributors: Contributor[];
  totalTarget: number;
}

export const GuildContributors: React.FC<GuildContributorsProps>;

// components/GuildMissionsWidget.tsx (NUEVO)
interface GuildMissionsWidgetProps {
  guildId: string;
  limit?: number;
}

export const GuildMissionsWidget: React.FC<GuildMissionsWidgetProps>;
```

### 4. Integration with Progress (10%)

```typescript
// Trigger contribution when member completes exercise
// In ExerciseSubmissionService
async onExerciseComplete(userId: string, xpEarned: number): Promise<void> {
  const guild = await this.teamsService.findByMember(userId);
  if (guild) {
    const activeMissions = await this.guildMissionsService.getActiveMissions(guild.id);

    for (const mission of activeMissions) {
      if (mission.objectiveType === 'collective_xp') {
        await this.guildMissionsService.addContribution(
          mission.id,
          userId,
          xpEarned
        );
      }
    }
  }
}
```

---

## Tipos de Misiones de Gremio

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| collective_xp | XP combinado del gremio | "Ganen 10,000 XP esta semana" |
| collective_exercises | Ejercicios completados | "Completen 500 ejercicios entre todos" |
| collective_streak | Suma de streaks | "Mantengan 100 dias de streak combinados" |
| first_to_complete | Competencia | "Primer gremio en completar 1000 ejercicios" |

---

## Recompensas

### Para el Gremio
| Tipo | Descripcion |
|------|-------------|
| Guild XP | XP para subir nivel del gremio |
| Guild Emblem | Emblema exclusivo |
| Guild Boost | Multiplicador temporal para todos |

### Para Miembros
| Tipo | Descripcion |
|------|-------------|
| ML Coins | Coins individuales |
| Bonus XP | XP por participar |
| Participation Badge | Badge por contribuir |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/guilds/:id/missions` | Misiones del gremio |
| GET | `/guilds/:id/missions/:missionId` | Detalle de mision |
| GET | `/guilds/:id/missions/:missionId/contributors` | Top contributors |
| POST | `/guilds/:id/missions` | Crear mision (lider) |
| GET | `/guilds/leaderboard/missions` | Ranking por misiones |

---

## Criterios de Aceptacion

### Funcionales
- [x] Gremios (teams) implementados
- [x] Miembros pueden unirse/salir
- [ ] Misiones de gremio asignables
- [ ] Contribuciones rastreadas
- [ ] Recompensas distribuidas al completar
- [ ] Leaderboard de gremios por misiones
- [ ] Generacion automatica semanal

### No Funcionales
- [ ] Contribuciones en tiempo real
- [ ] Notificaciones de progreso
- [ ] Cache de leaderboard

---

## Dependencias

### Bloqueado Por
- Teams Service (COMPLETO)
- Missions Service (COMPLETO)
- MLCoins Service (COMPLETO)

### Bloquea
- Guild Wars
- Guild Tournaments
- Cross-Guild Challenges

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Database Schema | 4h |
| GuildMissionsService | 10h |
| GuildContributionsService | 6h |
| Frontend Components | 8h |
| Integration with Progress | 4h |
| Tests | 4h |
| **Total** | **36h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-GAM-011-guild-missions.md*
*Generado: 2026-01-27*
