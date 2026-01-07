# ÉPICA: EAI-003-EXT - Gamificación Social (Amigos y Gremios)

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | EAI-003-EXT |
| **Nombre** | Gamificación Social: Sistema de Amigos y Gremios |
| **Módulo** | gamification_system, social_features |
| **Fase** | Fase 3 - Extensiones |
| **Prioridad** | P1 |
| **Estado** | Backlog |
| **Story Points** | 39 |
| **Sprint(s)** | Sprint 9-11 |

### Descripción

Implementar las mecánicas sociales de gamificación que complementan el sistema individual: sistema de amigos con leaderboard entre amigos, y sistema de gremios/grupos con misiones colaborativas. Adicionalmente, implementar el multiplicador de ML Coins por rango documentado en v6.1.

### Objetivo de Negocio

- Incrementar engagement mediante competencia social saludable
- Fomentar colaboración entre estudiantes
- Completar la visión original de gamificación documentada

### Stakeholders

| Rol | Nombre/Equipo | Responsabilidad |
|-----|---------------|-----------------|
| Product Owner | Isem | Aprobación de criterios |
| Tech Lead | Backend-Agent | Validación técnica |
| Usuarios | Estudiantes | Interacción social |

---

### Historias de Usuario

| ID | Historia | Prioridad | SP | Estado |
|----|----------|-----------|-----|--------|
| US-GAM-001 | Como estudiante avanzado, quiero ganar más ML Coins por mi rango | P1 | 5 | Backlog |
| US-GAM-010 | Como estudiante, quiero agregar amigos para competir | P1 | 8 | Backlog |
| US-GAM-003 | Como estudiante, quiero ver leaderboard de mis amigos | P1 | 5 | Backlog |
| US-GAM-004 | Como estudiante, quiero crear/unirme a un gremio | P2 | 8 | Backlog |
| US-GAM-005 | Como miembro de gremio, quiero completar misiones grupales | P2 | 8 | Backlog |
| US-GAM-006 | Como líder de gremio, quiero gestionar miembros | P2 | 5 | Backlog |

**Total Story Points:** 39

---

### Criterios de Aceptación de la Épica

**Funcionales:**
- [ ] Multiplicador ML Coins aplica según rango (1.0x - 2.0x)
- [ ] Sistema de solicitudes de amistad funcional
- [ ] Leaderboard de amigos muestra ranking personalizado
- [ ] Gremios soportan hasta 20 miembros
- [ ] Misiones de gremio otorgan bonus a todos los miembros

**No Funcionales:**
- [ ] Performance: Leaderboard carga < 2s
- [ ] Seguridad: Privacidad de perfiles respetada
- [ ] Usabilidad: Flujos intuitivos de social

**Técnicos:**
- [ ] Cobertura de tests > 70%
- [ ] RLS policies para privacidad
- [ ] Integración con notificaciones

---

### Dependencias

**Esta épica depende de:**
| Épica/Módulo | Estado | Bloqueante |
|--------------|--------|------------|
| EAI-003 Gamificación Base | Done | Sí |
| EAI-007 M4-M5 | In Progress | No |
| NotificationsService | Done | No |

**Esta épica bloquea:**
| Épica/Módulo | Razón |
|--------------|-------|
| Torneos | Requiere sistema de amigos |
| Desafíos PvP | Requiere sistema de amigos |

---

### Desglose Técnico

**Database:**
- [ ] Schema: gamification_system, social_features
- [ ] Tablas: friendships (nueva), friend_requests (nueva), guilds (nueva), guild_members (nueva), guild_missions (nueva)
- [ ] Funciones: 5 nuevas (CRUD amigos, gremios)
- [ ] RLS Policies: 8 nuevas

**Backend:**
- [ ] Módulo: gamification (extensión)
- [ ] Entities: 5 nuevas
- [ ] Endpoints: 15 nuevos
- [ ] Tests: 20 esperados

**Frontend:**
- [ ] Páginas: FriendsPage (existente con mockData), GuildsPage (existente con mockData)
- [ ] Componentes: 20 (actualmente vacíos)
- [ ] Stores: friendsStore, guildsStore (existentes, conectar)

---

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cyberbullying | Media | Alto | Reportes, moderación |
| Spam de solicitudes | Media | Bajo | Rate limiting |
| Gremios inactivos | Alta | Bajo | Cleanup automático |

---

### Definition of Ready (DoR)

- [x] Historias de usuario definidas
- [x] Criterios de aceptación claros
- [x] Dependencias identificadas
- [x] Estimación completada
- [ ] Diseño técnico aprobado
- [x] Sin bloqueadores activos

### Definition of Done (DoD)

- [ ] Código implementado y revisado
- [ ] Tests pasando (unit, integration, e2e)
- [ ] Documentación actualizada
- [ ] Inventarios actualizados
- [ ] Trazas registradas
- [ ] Demo realizada
- [ ] Product Owner aprobó

---

### Documentación Relacionada

- Diseño: `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
- Backlog: `docs/04-fase-backlog/FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md`
- Frontend mockData: `apps/frontend/src/features/gamification/social/mockData/`

---

### Historial

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creación de épica | Requirements-Analyst |

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Última actualización:** 2025-12-05
