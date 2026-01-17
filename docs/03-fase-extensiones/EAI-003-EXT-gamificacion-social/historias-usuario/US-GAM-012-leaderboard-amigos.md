---
id: "US-GAM-012"
title: "Leaderboard de Amigos"
type: "User Story"
status: "Backlog"
priority: "P1"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003-EXT"
story_points: 5
sprint: "Sprint 10"
labels: ["gamification", "social_features", "leaderboard"]
created_date: "2026-01-17"
updated_date: "2026-01-17"
previous_id: "US-GAM-003"
depends_on: ["US-GAM-010"]
---

# US-GAM-012: Leaderboard de Amigos

> **NOTA:** Este archivo fue renumbrado de US-GAM-003 a US-GAM-012 para resolver
> conflicto de ID duplicado. El ID original US-GAM-003 pertenece a
> "Monedas Lectoras" en EAI-003.

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-GAM-012 |
| **Epica** | EAI-003-EXT - Gamificacion Social |
| **Modulo** | gamification_system, social_features |
| **Prioridad** | P1 |
| **Story Points** | 5 |
| **Sprint** | Sprint 10 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent, Frontend-Agent |
| **Depende de** | US-GAM-010 (Sistema de Amigos) |

---

### Historia de Usuario

**Como** estudiante con amigos en la plataforma,
**quiero** ver un leaderboard que muestre solo a mis amigos,
**para** competir de forma cercana con companeros que conozco.

### Descripcion Detallada

Implementar una vista de leaderboard filtrada que muestre unicamente a los amigos del usuario actual. Esta vista complementa el leaderboard global existente y permite competencia mas personal y motivadora.

**Funcionalidades:**
1. Ver ranking de amigos ordenado por XP total
2. Ver posicion propia entre amigos
3. Filtrar por periodo (semanal, mensual, historico)
4. Ver progreso de amigos (modulo actual, ultimo ejercicio)
5. Notificaciones cuando un amigo te supera

---

### Criterios de Aceptacion

**Escenario 1: Ver leaderboard de amigos**
```gherkin
DADO que tengo 8 amigos en la plataforma
CUANDO accedo a la seccion "Leaderboard de Amigos"
ENTONCES veo lista ordenada por XP total (mayor a menor)
Y veo mi posicion destacada (ej: "Posicion 3 de 9")
Y puedo ver avatar, nombre, rango, nivel y XP de cada amigo
```

**Escenario 2: Filtrar por periodo**
```gherkin
DADO que estoy en el leaderboard de amigos
CUANDO selecciono filtro "Esta Semana"
ENTONCES veo ranking basado en XP ganado esta semana
Y el orden puede cambiar respecto al historico
Y veo etiqueta indicando periodo seleccionado
```

**Escenario 3: Notificacion de superacion**
```gherkin
DADO que estoy en posicion 2 del leaderboard de amigos
CUANDO un amigo en posicion 3 me supera en XP
ENTONCES recibo notificacion: "Maria te ha superado en el ranking!"
Y la notificacion incluye link al leaderboard
```

**Escenario 4: Usuario sin amigos**
```gherkin
DADO que no tengo amigos en la plataforma
CUANDO intento ver el leaderboard de amigos
ENTONCES veo mensaje: "Agrega amigos para ver este ranking"
Y veo boton "Buscar amigos" que lleva a la pagina de amigos
```

### Criterios Adicionales

- [ ] Cache de 5 minutos para leaderboard (performance)
- [ ] Maximo 100 amigos mostrados
- [ ] Incluir usuario actual siempre (aunque no este en top)
- [ ] Animacion al subir/bajar posiciones

---

### Tareas Tecnicas

**Database:**
- [ ] DB-GAM-012-A: Crear vista materializada `friend_leaderboard_view`
  ```sql
  CREATE MATERIALIZED VIEW friend_leaderboard_view AS
  SELECT
    f.user_id,
    f.friend_id,
    us.total_xp,
    us.current_rank,
    p.display_name,
    p.avatar_url
  FROM friendships f
  JOIN user_stats us ON f.friend_id = us.user_id
  JOIN profiles p ON f.friend_id = p.user_id;
  ```
- [ ] DB-GAM-012-B: Crear indice para consultas de leaderboard

**Backend:**
- [ ] BE-GAM-012-A: Endpoint GET `/leaderboards/friends`
  - Query params: `period` (weekly, monthly, all_time)
  - Response: `{ friends: [...], my_position: number, total: number }`
- [ ] BE-GAM-012-B: Implementar cache Redis para resultados
- [ ] BE-GAM-012-C: Agregar evento `friend_position_changed` para notificaciones

**Frontend:**
- [ ] FE-GAM-012-A: Tab "Amigos" en LeaderboardPage existente
- [ ] FE-GAM-012-B: Componente `FriendLeaderboardList`
- [ ] FE-GAM-012-C: Selector de periodo (semanal/mensual/historico)
- [ ] FE-GAM-012-D: Estado vacio con CTA para agregar amigos

---

### Definition of Done

- [ ] Leaderboard muestra solo amigos correctamente
- [ ] Filtros de periodo funcionan
- [ ] Notificaciones de posicion implementadas
- [ ] Performance < 2s para carga
- [ ] Tests de integracion pasando
- [ ] Documentacion de API actualizada

---

**Creada por:** Requirements-Analyst
**Fecha:** 2026-01-17
