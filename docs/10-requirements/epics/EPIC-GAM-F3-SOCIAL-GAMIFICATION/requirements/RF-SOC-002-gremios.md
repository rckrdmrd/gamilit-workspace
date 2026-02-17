---
id: "RF-SOC-002"
title: "Sistema de Gremios"
type: "Requerimiento Funcional"
status: "Especificado"
priority: "P2"
epic: "EAI-003-EXT"
module: "social_features"
labels: ["gamification", "social", "guilds", "missions", "collaborative"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-SOC-002: Sistema de Gremios

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | RF-SOC-002 |
| **Epic** | EAI-003-EXT - Gamificacion Social |
| **Fase** | 3 - Extensiones |
| **Prioridad** | P2 |
| **Estado** | Especificado |
| **Tipo** | Feature - Sistema de Gremios |

---

## Descripcion

Sistema de grupos colaborativos (gremios) que permite a estudiantes formar equipos para completar misiones grupales y obtener recompensas compartidas.

**Componentes:**
1. Creacion y gestion de gremios
2. Sistema de roles y permisos
3. Misiones colaborativas de gremio
4. Recompensas proporcionales

---

## Objetivo

Proporcionar a los estudiantes herramientas para:
- Formar grupos colaborativos (gremios)
- Completar objetivos grupales (misiones)
- Sentir pertenencia a una comunidad

---

## User Stories Relacionadas

| ID | Titulo | SP | Prioridad |
|----|--------|----|-----------|
| **[US-GAM-013](../user-stories/US-GAM-013/US-GAM-013-sistema-gremios.md)** | Sistema de Gremios | 8 | P2 |
| **[US-GAM-014](../user-stories/US-GAM-014/US-GAM-014-misiones-gremio.md)** | Misiones de Gremio | 8 | P2 |
| **[US-GAM-015](../user-stories/US-GAM-015/US-GAM-015-gestion-miembros-gremio.md)** | Gestion de Miembros Gremio | 5 | P2 |

**Total:** 21 SP

---

## Actores

- **Estudiante**: Crea/une a gremios, participa en misiones
- **Lider de Gremio**: Gestiona miembros, aprueba solicitudes
- **Oficial de Gremio**: Ayuda con gestion de solicitudes
- **Sistema**: Genera misiones, calcula recompensas

---

## Requerimientos Funcionales

### RF-SOC-002.1: Crear Gremio

**Descripcion:** Permitir a estudiantes crear nuevos gremios.

**Criterios:**
- Nombre unico (3-30 caracteres)
- Descripcion opcional (hasta 200 caracteres)
- Seleccionar emblema de galeria (20 opciones)
- Creador es automaticamente lider
- Gremio visible en busqueda publica
- Filtro de palabras inapropiadas en nombre

---

### RF-SOC-002.2: Buscar Gremios

**Descripcion:** Buscar gremios existentes para unirse.

**Criterios:**
- Buscar por nombre
- Mostrar: nombre, emblema, miembros actuales/max, descripcion
- Indicar si gremio esta lleno (20/20)
- Ordenar por actividad reciente

---

### RF-SOC-002.3: Solicitar Union

**Descripcion:** Enviar solicitud para unirse a un gremio.

**Criterios:**
- Solo si no pertenece a otro gremio
- Solo si gremio no esta lleno
- Solo si no hay solicitud pendiente
- Notificar a lider/oficiales

---

### RF-SOC-002.4: Gestionar Solicitudes

**Descripcion:** Lideres y oficiales gestionan solicitudes de union.

**Criterios:**
- Ver lista de solicitudes pendientes
- Ver perfil de solicitante (rango, nivel, actividad)
- Aprobar o rechazar solicitud
- Notificar resultado al solicitante

---

### RF-SOC-002.5: Salir de Gremio

**Descripcion:** Miembro abandona el gremio voluntariamente.

**Criterios:**
- Confirmacion antes de salir
- Puede unirse a otro inmediatamente
- Si es lider: debe transferir liderazgo primero
- Si es ultimo miembro: gremio se disuelve

---

### RF-SOC-002.6: Sistema de Roles

**Descripcion:** Jerarquia de permisos dentro del gremio.

**Roles:**

| Rol | Permisos |
|-----|----------|
| **Lider** | Todo: gestionar miembros, aprobar solicitudes, promover, expulsar, transferir liderazgo, editar config |
| **Oficial** | Parcial: aprobar solicitudes, expulsar miembros (no oficiales) |
| **Miembro** | Basico: participar en misiones, ver informacion del gremio |

**Limites:**
- Maximo 3 oficiales por gremio
- Solo lider puede promover a oficial
- Oficial no puede expulsar a otro oficial

---

### RF-SOC-002.7: Expulsar Miembro

**Descripcion:** Lider/oficial remueve miembro del gremio.

**Criterios:**
- Confirmacion antes de expulsar
- Miembro recibe notificacion
- Puede unirse a otro gremio inmediatamente
- Cooldown de 24h para re-unirse al mismo gremio
- Registrar en log de auditoria

---

### RF-SOC-002.8: Transferir Liderazgo

**Descripcion:** Lider transfiere su rol a otro miembro.

**Criterios:**
- Solo lider puede transferir
- Requiere confirmacion con contrasena
- Accion irreversible
- Lider anterior pasa a miembro regular
- Registrar en log de auditoria

---

### RF-SOC-002.9: Editar Configuracion

**Descripcion:** Lider modifica configuracion del gremio.

**Criterios:**
- Cambiar: nombre, descripcion, emblema
- Cambiar privacidad: publico/solo invitacion
- Cambios reflejados inmediatamente

---

### RF-SOC-002.10: Misiones de Gremio

**Descripcion:** Objetivos colaborativos para todos los miembros.

**Tipos de Misiones:**

| Tipo | Duracion | Ejemplo |
|------|----------|---------|
| Diaria | 24 horas | "Completar 50 ejercicios entre todos" |
| Semanal | 7 dias | "Acumular 10,000 XP combinado" |
| Evento | Variable | "5 miembros suban de rango" |

**Criterios:**
- Misiones se generan automaticamente (CRON job)
- Progreso acumulativo entre miembros
- Ver contribucion individual de cada miembro
- Actualizaciones en tiempo real (WebSocket)

---

### RF-SOC-002.11: Contribucion a Misiones

**Descripcion:** Progreso individual hacia objetivo grupal.

**Criterios:**
- Actividad del estudiante incrementa progreso
- Contribucion trackeable por miembro
- Timestamp de ultima contribucion
- Ver lista de top contribuidores

---

### RF-SOC-002.12: Recompensas de Mision

**Descripcion:** Distribucion de recompensas al completar mision.

**Criterios:**
- Completar mision = todos los que contribuyeron reciben recompensa
- Minimo 20% contribucion = recompensa completa
- Contribucion < 20% = 50% de recompensa
- Bonus 10% si TODOS los miembros contribuyeron
- Mision expira sin completar = nadie recibe recompensa

---

### RF-SOC-002.13: Log de Auditoria

**Descripcion:** Registro de acciones administrativas del gremio.

**Criterios:**
- Registrar: expulsiones, promociones, transferencias
- Solo visible para lider
- Incluir: actor, objetivo, accion, timestamp

---

## Modelo de Datos

### Tabla: `social_features.guilds`

```sql
CREATE TABLE social_features.guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    emblem_id INTEGER REFERENCES guild_emblems(id),
    leader_id UUID REFERENCES auth.users(id),
    member_count INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Tabla: `social_features.guild_members`

```sql
CREATE TABLE social_features.guild_members (
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('leader', 'officer', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guild_id, user_id)
);
```

---

### Tabla: `social_features.guild_join_requests`

```sql
CREATE TABLE social_features.guild_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id),
    UNIQUE(guild_id, user_id)
);
```

---

### Tabla: `social_features.guild_missions`

```sql
CREATE TABLE social_features.guild_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    mission_template_id UUID REFERENCES mission_templates(id),
    objective_target INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'failed')),
    reward_ml_coins INTEGER NOT NULL,
    reward_xp INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

---

### Tabla: `social_features.guild_mission_contributions`

```sql
CREATE TABLE social_features.guild_mission_contributions (
    guild_mission_id UUID REFERENCES guild_missions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contribution_count INTEGER DEFAULT 0,
    last_contribution_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (guild_mission_id, user_id)
);
```

---

### Tabla: `social_features.guild_audit_log`

```sql
CREATE TABLE social_features.guild_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    target_id UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Acciones registradas:**
- `member_kicked` - Miembro expulsado
- `member_promoted` - Miembro promovido a oficial
- `member_demoted` - Oficial degradado a miembro
- `leadership_transferred` - Liderazgo transferido
- `settings_updated` - Configuracion modificada

---

## Flujos de Trabajo

### Flujo 1: Crear Gremio

```
Estudiante → Verificar no pertenece a gremio
          → Elegir nombre y emblema
          → Escribir descripcion (opcional)
          → Crear gremio
          → Estudiante = lider
          → Gremio visible en busqueda
```

### Flujo 2: Unirse a Gremio

```
Estudiante → Buscar gremio
          → Enviar solicitud
          → Lider/oficial aprueba
          → Estudiante = miembro
          → Notificacion de bienvenida
```

### Flujo 3: Completar Mision de Gremio

```
Sistema genera mision diaria → Miembros completan ejercicios
                            → Progreso incrementa
                            → Al llegar a objetivo:
                            → Calcular contribuciones
                            → Distribuir recompensas
                            → Registrar en historial
```

### Flujo 4: Expulsar Miembro

```
Lider/Oficial → Seleccionar miembro
             → Confirmar expulsion
             → Miembro removido
             → Notificar a miembro
             → Registrar en auditoria
```

---

## Seguridad y RLS

### `guilds`
- Lectura publica (gremios publicos)
- Solo lider puede editar

### `guild_members`
- Miembros ven solo su gremio
- Solo lider/oficial pueden modificar

### `guild_missions`
- Miembros del gremio pueden ver
- Solo sistema modifica progreso

### `guild_audit_log`
- Solo lider puede ver

---

## Endpoints Requeridos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/guilds` | Crear gremio |
| GET | `/api/v1/guilds` | Listar/buscar gremios |
| GET | `/api/v1/guilds/:id` | Detalle de gremio |
| PATCH | `/api/v1/guilds/:id` | Editar configuracion |
| DELETE | `/api/v1/guilds/:id/leave` | Salir de gremio |
| POST | `/api/v1/guilds/:id/join` | Solicitar union |
| GET | `/api/v1/guilds/:id/requests` | Listar solicitudes |
| POST | `/api/v1/guilds/:id/requests/:reqId/approve` | Aprobar solicitud |
| POST | `/api/v1/guilds/:id/requests/:reqId/reject` | Rechazar solicitud |
| DELETE | `/api/v1/guilds/:id/members/:userId` | Expulsar miembro |
| PATCH | `/api/v1/guilds/:id/members/:userId/role` | Cambiar rol |
| POST | `/api/v1/guilds/:id/transfer-leadership` | Transferir liderazgo |
| GET | `/api/v1/guilds/:id/missions` | Misiones activas |
| GET | `/api/v1/guilds/:id/missions/:missionId` | Detalle mision |
| POST | `/api/v1/guilds/:id/missions/:missionId/claim` | Reclamar recompensa |
| GET | `/api/v1/guilds/:id/audit-log` | Log de auditoria |

---

## Componentes UI Requeridos

| Componente | Descripcion |
|------------|-------------|
| GuildCard | Tarjeta de gremio con info basica |
| GuildSearchList | Lista de gremios para busqueda |
| CreateGuildModal | Modal para crear gremio |
| GuildDetailPage | Pagina de detalle del gremio |
| GuildMissionCard | Tarjeta de mision con progreso |
| GuildMissionProgress | Barra de progreso + contribuidores |
| ContributorsList | Lista de contribuidores ordenada |
| PendingRequestsList | Solicitudes pendientes |
| MemberManagementList | Lista de miembros con acciones |
| TransferLeadershipModal | Modal de transferencia |
| GuildSettingsForm | Formulario de configuracion |
| GuildAuditLog | Historial de acciones admin |

---

## Especificacion Tecnica Relacionada

- **[ET-SOC-002](../specifications/ET-SOC-002-gremios.md)** - Diseno tecnico detallado

---

## Referencias

- User Stories: US-GAM-013, US-GAM-014, US-GAM-015
- Documento de Diseno v6.1 (sistema de gremios)

---

**Creado:** 2026-01-20
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
