# _MAP: EAI-003-EXT - Gamificacion Social

**Epica:** EAI-003-EXT
**Nombre:** Gamificacion Social (Amigos y Gremios)
**Fase:** 3 - Extensiones
**Story Points:** 39 SP
**Estado:** Backlog
**Ultima actualizacion:** 2026-01-20

---

## Proposito

Implementar las mecanicas sociales de gamificacion: sistema de amigos con leaderboard, sistema de gremios con misiones colaborativas, y multiplicador de ML Coins por rango.

**Impacto:** ALTO - Incrementa engagement mediante interaccion social

---

## Contenido

### Historias de Usuario (6)

| Historia | Titulo | SP | Estado | Prioridad |
|----------|--------|----|--------|-----------|
| **[US-GAM-010](./historias-usuario/US-GAM-010-sistema-amigos.md)** | Sistema de Amigos | 8 | Backlog | P1 |
| **[US-GAM-011](./historias-usuario/US-GAM-011-multiplicador-mlcoins.md)** | Multiplicador ML Coins por Rango | 5 | Backlog | P1 |
| **[US-GAM-012](./historias-usuario/US-GAM-012-leaderboard-amigos.md)** | Leaderboard de Amigos | 5 | Backlog | P1 |
| **[US-GAM-013](./historias-usuario/US-GAM-013-sistema-gremios.md)** | Sistema de Gremios | 8 | Backlog | P2 |
| **[US-GAM-014](./historias-usuario/US-GAM-014-misiones-gremio.md)** | Misiones de Gremio | 8 | Backlog | P2 |
| **[US-GAM-015](./historias-usuario/US-GAM-015-gestion-miembros-gremio.md)** | Gestion de Miembros Gremio | 5 | Backlog | P2 |

**Total:** 39 SP

---

### Requerimientos Funcionales (2)

| ID | Titulo | User Stories | Estado |
|----|--------|--------------|--------|
| **[RF-SOC-001](./requerimientos/RF-SOC-001-sistema-amigos.md)** | Sistema de Amigos y Social | US-GAM-010, US-GAM-011, US-GAM-012 | Especificado |
| **[RF-SOC-002](./requerimientos/RF-SOC-002-gremios.md)** | Sistema de Gremios | US-GAM-013, US-GAM-014, US-GAM-015 | Especificado |

---

### Especificaciones Tecnicas (2)

| ID | Titulo | RF Relacionado | Estado |
|----|--------|----------------|--------|
| **[ET-SOC-001](./especificaciones/ET-SOC-001-sistema-amigos.md)** | Diseno Tecnico Sistema Amigos | RF-SOC-001 | Especificado |
| **[ET-SOC-002](./especificaciones/ET-SOC-002-gremios.md)** | Diseno Tecnico Sistema Gremios | RF-SOC-002 | Especificado |

---

### Tareas Tecnicas (4)

| ID | Titulo | Capa | Estado |
|----|--------|------|--------|
| **[TASK-DB-GAM-003-005](./tareas/TASK-DB-GAM-003-005-tablas-amigos.md)** | Tablas de Amigos | Database | Especificado |
| **[TASK-BE-GAM-002-003](./tareas/TASK-BE-GAM-002-003-friends-api.md)** | API de Amigos | Backend | Especificado |
| **[TASK-FE-GAM-002-003](./tareas/TASK-FE-GAM-002-003-friends-ui.md)** | UI de Amigos | Frontend | Especificado |

Ver [tareas/_MAP.md](./tareas/_MAP.md) para indice completo.

---

## Modulos Funcionales

### 1. Sistema de Amigos
**User Stories:** US-GAM-010, US-GAM-012

**Funcionalidades:**
- Buscar usuarios por nombre/email
- Enviar/aceptar/rechazar solicitudes
- Lista de amigos con actividad
- Leaderboard filtrado de amigos
- Notificaciones de posicion

**Impacto:** Competencia social saludable

---

### 2. Multiplicador ML Coins
**User Stories:** US-GAM-011

**Funcionalidades:**
- Multiplicador 1.0x - 2.0x segun rango
- Aplica a ejercicios y misiones
- Visible en perfil de usuario

**Tabla de multiplicadores:**
| Rango | Nombre | Multiplicador |
|-------|--------|---------------|
| 1 | Semilla de Cacao | 1.0x |
| 2 | Recolector de Frutos | 1.1x |
| 3 | Artesano de Palabras | 1.2x |
| 4 | Escriba del Pueblo | 1.3x |
| 5 | Guardian de Historias | 1.4x |
| 6 | Sabio del Consejo | 1.5x |
| 7 | Chaman de las Letras | 1.6x |
| 8 | Senor del Conocimiento | 1.7x |
| 9 | Gran Sacerdote | 1.8x |
| 10 | K'uk'ulkan | 2.0x |

---

### 3. Sistema de Gremios
**User Stories:** US-GAM-013, US-GAM-015

**Funcionalidades:**
- Crear gremio (nombre, emblema, descripcion)
- Buscar y solicitar union
- Roles: Lider, Oficial, Miembro
- Gestion de solicitudes y miembros
- Transferir liderazgo

**Reglas:**
- Maximo 20 miembros por gremio
- Usuario pertenece a 1 solo gremio
- Nombre unico en plataforma

---

### 4. Misiones de Gremio
**User Stories:** US-GAM-014

**Funcionalidades:**
- Misiones diarias y semanales
- Progreso colaborativo
- Contribucion individual trackeable
- Recompensas proporcionales

**Tipos de misiones:**
- Completar X ejercicios entre todos (diaria)
- Acumular Y XP combinado (semanal)
- Eventos especiales tematicos

---

## Implementacion

### Backend
**Modulo:** `apps/backend/src/modules/gamification/social/`

**Servicios:**
- `friends.service.ts` - Gestion de amigos
- `friend-leaderboard.service.ts` - Leaderboard de amigos
- `guilds.service.ts` - Gestion de gremios
- `guild-missions.service.ts` - Misiones de gremio
- `rank-multiplier.service.ts` - Calculo de multiplicador

---

### Frontend
**Feature:** `apps/frontend/src/features/gamification/social/`

**Paginas:**
- FriendsPage (existente con mockData)
- GuildsPage (existente con mockData)
- GuildDetailPage (nuevo)

**Stores:**
- friendsStore (existente, conectar)
- guildsStore (existente, conectar)

---

### Base de Datos
**Schema:** `social_features`

**Tablas:**
- friendships (relaciones)
- friend_requests (solicitudes)
- guilds (gremios)
- guild_members (miembros)
- guild_join_requests (solicitudes union)
- guild_missions (misiones)
- guild_mission_contributions (contribuciones)

---

## Archivos Clave

| Archivo | Descripcion |
|---------|-------------|
| [README.md](./README.md) | Descripcion general de la epica |
| [_MAP.md](./_MAP.md) | Este archivo - Indice maestro |
| [EPICA-EAI-003-EXT.md](./EPICA-EAI-003-EXT.md) | Documento de epica original |
| [requerimientos/](./requerimientos/) | 2 requerimientos funcionales |
| [especificaciones/](./especificaciones/) | 2 especificaciones tecnicas |
| [historias-usuario/](./historias-usuario/) | 6 user stories |
| [tareas/](./tareas/) | 4 tareas tecnicas (3 documentadas) |
| [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) | Trazabilidad codigo-documentacion |

---

## Dependencias

### Depende de:
- EAI-003 (Gamificacion Base) - Rangos, XP, ML Coins
- NotificationsService - Alertas de amigos/gremios
- UsersService - Perfiles de usuarios

### Habilita:
- Torneos - Requiere sistema de amigos
- Desafios PvP - Competencia directa entre amigos

---

## Metricas

| Metrica | Valor |
|---------|-------|
| **Story Points** | 39 |
| **User Stories** | 6 |
| **Requerimientos** | 2 |
| **Especificaciones** | 2 |
| **Tareas** | 4 |
| **Sprint Estimado** | 9-11 |

---

**Generado:** 2026-01-20
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
**Version:** 1.0.0
