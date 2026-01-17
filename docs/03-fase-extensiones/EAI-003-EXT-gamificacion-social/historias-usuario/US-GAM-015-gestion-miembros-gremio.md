---
id: "US-GAM-015"
title: "Gestion de Miembros de Gremio"
type: "User Story"
status: "Backlog"
priority: "P2"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003-EXT"
story_points: 5
sprint: "Sprint 11"
labels: ["gamification", "social_features", "guilds", "admin"]
created_date: "2026-01-17"
updated_date: "2026-01-17"
previous_id: "US-GAM-006"
depends_on: ["US-GAM-013"]
---

# US-GAM-015: Gestion de Miembros de Gremio

> **NOTA:** Este archivo fue renumbrado de US-GAM-006 a US-GAM-015 para resolver
> conflicto de ID duplicado. El ID original US-GAM-006 pertenece a
> "Narrativa Basica" en EAI-003.

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-GAM-015 |
| **Epica** | EAI-003-EXT - Gamificacion Social |
| **Modulo** | gamification_system, social_features |
| **Prioridad** | P2 |
| **Story Points** | 5 |
| **Sprint** | Sprint 11 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent, Frontend-Agent |
| **Depende de** | US-GAM-013 (Sistema de Gremios) |

---

### Historia de Usuario

**Como** lider de un gremio,
**quiero** gestionar los miembros de mi gremio,
**para** mantener un grupo activo y bien organizado.

### Descripcion Detallada

Implementar las herramientas de administracion para lideres de gremio que les permitan gestionar solicitudes de union, expulsar miembros inactivos, promover oficiales y transferir liderazgo.

**Roles de Gremio:**
- **Lider:** Control total, puede transferir liderazgo
- **Oficial:** Puede aprobar solicitudes y expulsar miembros
- **Miembro:** Participa en misiones, sin permisos admin

**Funcionalidades de Gestion:**
1. Ver y gestionar solicitudes de union
2. Expulsar miembros
3. Promover/degradar a oficial
4. Transferir liderazgo
5. Editar configuracion del gremio

---

### Criterios de Aceptacion

**Escenario 1: Gestionar solicitudes de union**
```gherkin
DADO que soy lider u oficial del gremio
CUANDO accedo a "Solicitudes Pendientes"
ENTONCES veo lista de usuarios que quieren unirse
Y puedo ver perfil de cada solicitante (rango, nivel, actividad)
Y puedo aprobar o rechazar cada solicitud
Y el solicitante recibe notificacion de la decision
```

**Escenario 2: Expulsar miembro**
```gherkin
DADO que soy lider del gremio
CUANDO expulso a un miembro
ENTONCES recibo confirmacion: "Expulsar a Maria del gremio?"
Y al confirmar, el miembro deja de pertenecer
Y el miembro recibe notificacion: "Has sido expulsado del gremio"
Y el miembro puede unirse a otro gremio inmediatamente
```

**Escenario 3: Promover a oficial**
```gherkin
DADO que soy lider del gremio
Y tengo miembro activo con > 7 dias en el gremio
CUANDO lo promuevo a oficial
ENTONCES el miembro obtiene permisos de oficial
Y puede aprobar solicitudes y expulsar miembros
Y veo indicador de rol "Oficial" junto a su nombre
```

**Escenario 4: Transferir liderazgo**
```gherkin
DADO que soy lider del gremio
CUANDO selecciono "Transferir liderazgo" a otro miembro
ENTONCES recibo advertencia: "Esta accion es irreversible"
Y debo confirmar con mi contrasena
Y el nuevo lider recibe notificacion
Y yo paso a ser miembro regular
```

**Escenario 5: Editar configuracion**
```gherkin
DADO que soy lider del gremio
CUANDO edito la configuracion del gremio
ENTONCES puedo cambiar: nombre, descripcion, emblema
Y puedo cambiar privacidad (publico/solo invitacion)
Y los cambios se reflejan inmediatamente
```

### Criterios Adicionales

- [ ] Solo lider puede transferir liderazgo
- [ ] Lider no puede expulsarse a si mismo
- [ ] Maximo 3 oficiales por gremio
- [ ] Cooldown de 24h para re-unirse a gremio tras ser expulsado
- [ ] Log de acciones administrativas visible para lider

---

### Tareas Tecnicas

**Database:**
- [ ] DB-GAM-015-A: Agregar columna `role` a `guild_members` (leader, officer, member)
- [ ] DB-GAM-015-B: Crear tabla `social_features.guild_audit_log`
  ```sql
  guild_audit_log (
    id UUID PRIMARY KEY,
    guild_id UUID REFERENCES guilds(id),
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id),
    target_id UUID REFERENCES users(id),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )
  ```
- [ ] DB-GAM-015-C: RLS policies para acciones de admin

**Backend:**
- [ ] BE-GAM-015-A: Endpoints de gestion:
  - GET `/guilds/:id/requests` - Listar solicitudes
  - POST `/guilds/:id/requests/:requestId/approve` - Aprobar
  - POST `/guilds/:id/requests/:requestId/reject` - Rechazar
  - DELETE `/guilds/:id/members/:userId` - Expulsar
  - PATCH `/guilds/:id/members/:userId/role` - Cambiar rol
  - POST `/guilds/:id/transfer-leadership` - Transferir liderazgo
- [ ] BE-GAM-015-B: Guards para validar permisos por rol
- [ ] BE-GAM-015-C: Servicio de auditoria `GuildAuditService`

**Frontend:**
- [ ] FE-GAM-015-A: Tab "Administrar" en GuildDetailPage (solo lideres/oficiales)
- [ ] FE-GAM-015-B: Componente `PendingRequestsList`
- [ ] FE-GAM-015-C: Componente `MemberManagementList`
- [ ] FE-GAM-015-D: Modal `TransferLeadershipModal`
- [ ] FE-GAM-015-E: Componente `GuildSettingsForm`
- [ ] FE-GAM-015-F: Componente `GuildAuditLog` (historial de acciones)

---

### Definition of Done

- [ ] Todas las acciones de gestion funcionan correctamente
- [ ] Permisos por rol validados
- [ ] Auditoria de acciones registrada
- [ ] Notificaciones enviadas a afectados
- [ ] Tests de integracion pasando
- [ ] UI intuitiva para administracion

---

**Creada por:** Requirements-Analyst
**Fecha:** 2026-01-17
