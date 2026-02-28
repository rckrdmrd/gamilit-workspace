---
titulo: "ET-GAM-008: Missions System"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-GAM-008: Missions System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-008 |
| **Modulo** | Gamificacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 95% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-GAM-008: Daily and Weekly Missions

### User Stories
- US-GAM-008: Mission System for Engagement

---

## Descripcion Funcional

Sistema de misiones gamificadas:
- Misiones diarias (3 por dia)
- Misiones semanales (2 por semana)
- Misiones especiales (eventos)
- Objetivos multi-paso
- Recompensas (XP, ML Coins)
- Auto-generacion desde templates

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - MissionsWidget (dashboard)                            |
|  - MissionCard                                           |
|  - MissionProgress                                       |
|  - ClaimRewardButton                                     |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - MissionsController                                    |
|  - MissionsService                                       |
|  - MissionGeneratorService                               |
|  - MissionProgressService                                |
|  - MissionClaimService                                   |
|  - MissionTemplatesService                               |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - gamification_system.missions                          |
|  - gamification_system.mission_templates                 |
|  - gamification_system.classroom_missions                |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Backend - Mission Entity

**Ubicacion:** `apps/backend/src/modules/gamification/entities/mission.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: 'missions' })
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column('uuid', { nullable: true })
  template_id?: string;

  @Column({ type: 'enum', enum: MissionTypeEnum })
  mission_type!: MissionTypeEnum;

  @Column('text')
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'jsonb' })
  objectives!: MissionObjective[];

  @Column({ type: 'jsonb' })
  rewards!: MissionRewards;

  @Column('int', { default: 0 })
  current_progress!: number;

  @Column('int')
  target_progress!: number;

  @Column({ type: 'enum', enum: MissionStatusEnum })
  status!: MissionStatusEnum;

  @Column('timestamp with time zone')
  expires_at!: Date;

  @Column('timestamp with time zone', { nullable: true })
  completed_at?: Date;

  @Column('timestamp with time zone', { nullable: true })
  claimed_at?: Date;
}

interface MissionObjective {
  id: string;
  type: 'complete_exercises' | 'earn_xp' | 'use_comodin' | 'login_streak';
  target: number;
  current: number;
  completed: boolean;
}

interface MissionRewards {
  xp: number;
  ml_coins: number;
  achievement_id?: string;
}
```

### Backend - MissionsService

**Ubicacion:** `apps/backend/src/modules/gamification/services/missions.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class MissionsService {
  /**
   * Obtiene misiones activas del usuario
   */
  async getActiveMissions(userId: string): Promise<Mission[]>;

  /**
   * Genera misiones diarias (3 misiones)
   */
  async generateDailyMissions(userId: string): Promise<Mission[]>;

  /**
   * Genera misiones semanales (2 misiones)
   */
  async generateWeeklyMissions(userId: string): Promise<Mission[]>;

  /**
   * Actualiza progreso de mision
   */
  async updateProgress(
    userId: string,
    missionId: string,
    progress: number
  ): Promise<Mission>;

  /**
   * Reclama recompensa de mision completada
   */
  async claimReward(userId: string, missionId: string): Promise<ClaimResult>;

  /**
   * Marca misiones expiradas
   */
  async markExpiredMissions(): Promise<number>;

  /**
   * Obtiene estadisticas de misiones
   */
  async getMissionStats(userId: string): Promise<MissionStatsDto>;
}
```

### Backend - MissionGeneratorService

**Ubicacion:** `apps/backend/src/modules/gamification/services/missions/mission-generator.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class MissionGeneratorService {
  /**
   * Genera mision desde template
   * Ajusta dificultad segun nivel del usuario
   */
  async generateFromTemplate(
    userId: string,
    template: MissionTemplate,
    userLevel: number
  ): Promise<Mission>;

  /**
   * Selecciona templates aleatorios
   * Evita repetir misiones recientes
   */
  async selectTemplates(
    type: MissionTypeEnum,
    count: number,
    excludeRecent: string[]
  ): Promise<MissionTemplate[]>;

  /**
   * Ajusta target segun nivel
   */
  private calculateTarget(baseTarget: number, level: number): number;
}
```

### Backend - MissionTemplatesService

**Ubicacion:** `apps/backend/src/modules/gamification/services/mission-templates.service.ts`

**Estado:** COMPLETO (100%)

### Database - Mission Templates (Seeds)

**Ubicacion:** `apps/database/seeds/dev/gamification_system/10-mission_templates.sql`

**Estado:** COMPLETO (100%)

```sql
-- Misiones Diarias
INSERT INTO gamification_system.mission_templates VALUES
('MT-D-001', 'daily', 'Explorador', 'Completa 5 ejercicios',
 '[{"type": "complete_exercises", "target": 5}]',
 '{"xp": 50, "ml_coins": 10}', true),

('MT-D-002', 'daily', 'Estudiante Dedicado', 'Gana 100 XP',
 '[{"type": "earn_xp", "target": 100}]',
 '{"xp": 30, "ml_coins": 15}', true),

('MT-D-003', 'daily', 'Maestro del Tiempo', 'Usa un comodin',
 '[{"type": "use_comodin", "target": 1}]',
 '{"xp": 20, "ml_coins": 5}', true);

-- Misiones Semanales
INSERT INTO gamification_system.mission_templates VALUES
('MT-W-001', 'weekly', 'Maraton', 'Completa 30 ejercicios esta semana',
 '[{"type": "complete_exercises", "target": 30}]',
 '{"xp": 200, "ml_coins": 50}', true),

('MT-W-002', 'weekly', 'Constancia', 'Conectate 5 dias seguidos',
 '[{"type": "login_streak", "target": 5}]',
 '{"xp": 150, "ml_coins": 40}', true);
```

### Frontend - MissionCard

**Ubicacion:** `apps/frontend/src/features/gamification/missions/components/MissionCard.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface MissionCardProps {
  mission: Mission;
  onClaim?: (missionId: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onClaim,
}) => {
  return (
    <div className="mission-card">
      <div className="mission-header">
        <MissionTypeIcon type={mission.mission_type} />
        <h3>{mission.title}</h3>
        <TimeRemaining expiresAt={mission.expires_at} />
      </div>

      <p className="mission-description">{mission.description}</p>

      <ProgressBar
        current={mission.current_progress}
        target={mission.target_progress}
      />

      <div className="mission-rewards">
        <RewardBadge type="xp" amount={mission.rewards.xp} />
        <RewardBadge type="coins" amount={mission.rewards.ml_coins} />
      </div>

      {mission.status === 'completed' && (
        <button onClick={() => onClaim?.(mission.id)}>
          Reclamar Recompensa
        </button>
      )}
    </div>
  );
};
```

---

## Tipos de Misiones

### Diarias (3 por dia)
| Template | Objetivo | Recompensa |
|----------|----------|------------|
| Explorador | 5 ejercicios | 50 XP, 10 Coins |
| Estudiante Dedicado | 100 XP | 30 XP, 15 Coins |
| Maestro del Tiempo | 1 comodin | 20 XP, 5 Coins |

### Semanales (2 por semana)
| Template | Objetivo | Recompensa |
|----------|----------|------------|
| Maraton | 30 ejercicios | 200 XP, 50 Coins |
| Constancia | 5 dias streak | 150 XP, 40 Coins |

---

## Flujo de Generacion

```
Cron Job (00:01 diario)
        |
        v
MissionGeneratorService.generateDailyMissions()
        |
        v
Para cada usuario activo:
  1. Obtener nivel del usuario
  2. Seleccionar 3 templates (evitar recientes)
  3. Ajustar targets segun nivel
  4. Crear misiones con expiracion 24h
        |
        v
Notificar via WebSocket: "Nuevas misiones disponibles"
```

---

## Lo que Falta para Completar (5%)

### 1. Classroom Missions (5%)

```typescript
// services/classroom-missions.service.ts (PARCIAL)
@Injectable()
export class ClassroomMissionsService {
  /**
   * Asigna mision a todo el aula
   */
  async assignToClassroom(
    classroomId: string,
    missionData: CreateMissionDto
  ): Promise<ClassroomMission>;

  /**
   * Obtiene progreso del aula
   */
  async getClassroomProgress(
    classroomId: string,
    missionId: string
  ): Promise<ClassroomMissionProgress>;
}
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/missions/active` | Misiones activas |
| GET | `/missions/daily` | Misiones diarias |
| GET | `/missions/weekly` | Misiones semanales |
| GET | `/missions/stats` | Estadisticas |
| POST | `/missions/:id/claim` | Reclamar recompensa |
| POST | `/missions/generate/daily` | Forzar generacion (admin) |

---

## Criterios de Aceptacion

### Funcionales
- [x] 3 misiones diarias generadas automaticamente
- [x] 2 misiones semanales generadas automaticamente
- [x] Progreso se actualiza en tiempo real
- [x] Recompensas reclamables al completar
- [x] Expiracion automatica
- [x] Dificultad ajustada por nivel
- [ ] Misiones de aula asignadas por profesor

### No Funcionales
- [x] Generacion batch performante
- [x] Cache de misiones activas
- [x] Notificaciones WebSocket

---

## Dependencias

### Bloqueado Por
- MissionTemplate Seeds (COMPLETO)
- UserStats Service (COMPLETO)
- MLCoins Service (COMPLETO)

### Bloquea
- Guild Missions
- Special Event Missions
- Achievement Integration

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| ClassroomMissionsService | 4h |
| Classroom UI | 3h |
| Tests | 2h |
| **Total** | **9h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-GAM-008-missions.md*
*Generado: 2026-01-27*
