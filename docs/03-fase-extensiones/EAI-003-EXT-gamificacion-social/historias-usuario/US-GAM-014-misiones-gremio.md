---
id: "US-GAM-014"
title: "Misiones de Gremio"
type: "User Story"
status: "Backlog"
priority: "P2"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003-EXT"
story_points: 8
sprint: "Sprint 11"
labels: ["gamification", "social_features", "guilds", "missions"]
created_date: "2026-01-17"
updated_date: "2026-01-17"
previous_id: "US-GAM-005"
depends_on: ["US-GAM-013"]
---

# US-GAM-014: Misiones de Gremio

> **NOTA:** Este archivo fue renumbrado de US-GAM-005 a US-GAM-014 para resolver
> conflicto de ID duplicado. El ID original US-GAM-005 pertenece a
> "Insignias Basicas" en EAI-003.

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-GAM-014 |
| **Epica** | EAI-003-EXT - Gamificacion Social |
| **Modulo** | gamification_system, social_features |
| **Prioridad** | P2 |
| **Story Points** | 8 |
| **Sprint** | Sprint 11 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent, Frontend-Agent |
| **Depende de** | US-GAM-013 (Sistema de Gremios) |

---

### Historia de Usuario

**Como** miembro de un gremio,
**quiero** participar en misiones grupales con mis companeros de gremio,
**para** colaborar hacia objetivos comunes y ganar recompensas compartidas.

### Descripcion Detallada

Implementar misiones especiales que requieren contribucion de multiples miembros del gremio. El progreso es acumulativo entre todos los miembros y las recompensas se distribuyen a todos los participantes.

**Tipos de Misiones de Gremio:**
1. **Diarias de Gremio:** Completar X ejercicios entre todos (24h)
2. **Semanales de Gremio:** Acumular Y puntos de XP entre todos (7 dias)
3. **Eventos Especiales:** Desafios tematicos con tiempo limitado

**Ejemplos de Misiones:**
- "Completar 50 ejercicios entre todos los miembros" (diaria)
- "Acumular 10,000 XP combinado" (semanal)
- "Que 5 miembros suban de rango esta semana" (semanal)

---

### Criterios de Aceptacion

**Escenario 1: Ver misiones de gremio activas**
```gherkin
DADO que pertenezco al gremio "Los Lectores Mayas"
CUANDO accedo a la seccion "Misiones del Gremio"
ENTONCES veo lista de misiones activas
Y cada mision muestra: objetivo, progreso actual, tiempo restante
Y veo contribucion individual de cada miembro
```

**Escenario 2: Contribuir a mision de gremio**
```gherkin
DADO que mi gremio tiene mision "Completar 50 ejercicios"
Y el progreso actual es 35/50
CUANDO completo un ejercicio
ENTONCES el progreso se actualiza a 36/50
Y mi contribucion personal se incrementa en 1
Y los demas miembros ven la actualizacion en tiempo real
```

**Escenario 3: Completar mision de gremio**
```gherkin
DADO que mi gremio completa una mision
CUANDO se alcanza el objetivo (50/50 ejercicios)
ENTONCES todos los miembros que contribuyeron reciben recompensa
Y la recompensa es proporcional a contribucion (minimo 20%)
Y se registra en historial del gremio
```

**Escenario 4: Mision expira sin completar**
```gherkin
DADO que una mision de gremio tiene 0 horas restantes
Y el progreso es 40/50
CUANDO expira el tiempo
ENTONCES la mision se marca como "No completada"
Y nadie recibe recompensas
Y se genera nueva mision al dia siguiente
```

### Criterios Adicionales

- [ ] Minimo 20% contribucion para recibir recompensa completa
- [ ] Contribucion < 20% recibe 50% de recompensa
- [ ] Bonus del 10% si todos los miembros contribuyeron
- [ ] Historial de misiones completadas visible

---

### Tareas Tecnicas

**Database:**
- [ ] DB-GAM-014-A: Crear tabla `social_features.guild_missions`
  ```sql
  guild_missions (
    id UUID PRIMARY KEY,
    guild_id UUID REFERENCES guilds(id),
    mission_template_id UUID REFERENCES mission_templates(id),
    objective_target INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP
  )
  ```
- [ ] DB-GAM-014-B: Crear tabla `social_features.guild_mission_contributions`
  ```sql
  guild_mission_contributions (
    guild_mission_id UUID REFERENCES guild_missions(id),
    user_id UUID REFERENCES users(id),
    contribution_count INTEGER DEFAULT 0,
    last_contribution_at TIMESTAMP,
    PRIMARY KEY (guild_mission_id, user_id)
  )
  ```
- [ ] DB-GAM-014-C: Crear funcion `generate_daily_guild_missions()`

**Backend:**
- [ ] BE-GAM-014-A: Servicio `GuildMissionsService`
  - Generar misiones diarias/semanales
  - Registrar contribuciones
  - Calcular y distribuir recompensas
- [ ] BE-GAM-014-B: Endpoints:
  - GET `/guilds/:id/missions` - Listar misiones activas
  - GET `/guilds/:id/missions/:missionId` - Detalle con contribuciones
  - POST `/guilds/:id/missions/:missionId/claim` - Reclamar recompensa
- [ ] BE-GAM-014-C: Job para generar misiones diarias (CRON)
- [ ] BE-GAM-014-D: Integracion con ExerciseRewardsService

**Frontend:**
- [ ] FE-GAM-014-A: Componente `GuildMissionCard`
- [ ] FE-GAM-014-B: Componente `GuildMissionProgress` (barra + contribuidores)
- [ ] FE-GAM-014-C: Componente `ContributorsList`
- [ ] FE-GAM-014-D: Vista `GuildMissionsTab` en GuildDetailPage
- [ ] FE-GAM-014-E: Notificaciones de progreso en tiempo real (WebSocket)

---

### Definition of Done

- [ ] Misiones de gremio se generan automaticamente
- [ ] Contribuciones se registran correctamente
- [ ] Recompensas se distribuyen proporcionalmente
- [ ] UI muestra progreso en tiempo real
- [ ] Tests de integracion pasando
- [ ] Documentacion de endpoints actualizada

---

**Creada por:** Requirements-Analyst
**Fecha:** 2026-01-17
