---
id: "US-GAM-013"
title: "Sistema de Gremios"
type: "User Story"
status: "Backlog"
priority: "P2"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-003-EXT"
story_points: 8
sprint: "Sprint 10-11"
labels: ["gamification", "social_features", "guilds"]
created_date: "2026-01-17"
updated_date: "2026-01-17"
previous_id: "US-GAM-004"
---

# US-GAM-013: Sistema de Gremios (Crear/Unirse)

> **NOTA:** Este archivo fue renumbrado de US-GAM-004 a US-GAM-013 para resolver
> conflicto de ID duplicado. El ID original US-GAM-004 pertenece a
> "Sistema de Ayudas" en EAI-003.

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-GAM-013 |
| **Epica** | EAI-003-EXT - Gamificacion Social |
| **Modulo** | gamification_system, social_features |
| **Prioridad** | P2 |
| **Story Points** | 8 |
| **Sprint** | Sprint 10-11 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent, Frontend-Agent |

---

### Historia de Usuario

**Como** estudiante motivado,
**quiero** crear o unirme a un gremio con otros estudiantes,
**para** colaborar en objetivos grupales y sentir pertenencia a un grupo.

### Descripcion Detallada

Implementar el sistema de gremios que permite a los estudiantes formar grupos colaborativos. Los gremios tienen nombre, emblema, descripcion y miembros con diferentes roles.

**Funcionalidades:**
1. Crear nuevo gremio (nombre, descripcion, emblema)
2. Buscar gremios existentes
3. Solicitar union a gremio
4. Ver detalles de gremio
5. Salir de gremio

**Reglas de Negocio:**
- Maximo 20 miembros por gremio
- Usuario puede pertenecer a 1 solo gremio
- Creador es automaticamente lider
- Nombre de gremio unico en la plataforma
- Minimo 3 caracteres, maximo 30 para nombre

---

### Criterios de Aceptacion

**Escenario 1: Crear gremio**
```gherkin
DADO que no pertenezco a ningun gremio
CUANDO creo un gremio con nombre "Los Lectores Mayas"
Y selecciono emblema de la galeria disponible
Y escribo descripcion de hasta 200 caracteres
ENTONCES el gremio se crea exitosamente
Y soy asignado como lider automaticamente
Y el gremio aparece en busqueda publica
```

**Escenario 2: Buscar y solicitar union**
```gherkin
DADO que busco gremios con el termino "Lectores"
CUANDO veo la lista de resultados
ENTONCES veo nombre, emblema, miembros actuales y descripcion
Y puedo enviar solicitud de union a gremios abiertos
Y no puedo unirme si el gremio esta lleno (20/20)
```

**Escenario 3: Union a gremio**
```gherkin
DADO que envie solicitud de union a "Los Lectores Mayas"
CUANDO el lider aprueba mi solicitud
ENTONCES me convierto en miembro del gremio
Y recibo notificacion: "Bienvenido a Los Lectores Mayas!"
Y ya no puedo solicitar union a otros gremios
```

**Escenario 4: Salir de gremio**
```gherkin
DADO que soy miembro (no lider) de un gremio
CUANDO decido salir del gremio
ENTONCES recibo confirmacion: "Estas seguro de salir?"
Y al confirmar, dejo de ser miembro
Y puedo unirme a otro gremio inmediatamente
```

**Escenario 5: Lider abandona gremio**
```gherkin
DADO que soy lider del gremio con otros miembros
CUANDO intento salir del gremio
ENTONCES debo transferir liderazgo a otro miembro primero
O disolver el gremio si soy el unico miembro
```

### Criterios Adicionales

- [ ] Gremios inactivos (sin actividad 30 dias) se marcan
- [ ] Emblemas predefinidos (galeria de 20 opciones)
- [ ] Nombre filtrado por palabras inapropiadas
- [ ] Historial de gremios anteriores visible

---

### Tareas Tecnicas

**Database:**
- [ ] DB-GAM-013-A: Crear tabla `social_features.guilds`
  ```sql
  guilds (
    id UUID PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    emblem_id INTEGER REFERENCES guild_emblems(id),
    leader_id UUID REFERENCES users(id),
    member_count INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_activity_at TIMESTAMP
  )
  ```
- [ ] DB-GAM-013-B: Crear tabla `social_features.guild_members`
  ```sql
  guild_members (
    guild_id UUID REFERENCES guilds(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP,
    PRIMARY KEY (guild_id, user_id)
  )
  ```
- [ ] DB-GAM-013-C: Crear tabla `social_features.guild_join_requests`
- [ ] DB-GAM-013-D: RLS policies para privacidad de gremios

**Backend:**
- [ ] BE-GAM-013-A: Crear modulo `GuildsModule`
- [ ] BE-GAM-013-B: Entidades: `Guild`, `GuildMember`, `GuildJoinRequest`
- [ ] BE-GAM-013-C: Endpoints CRUD:
  - POST `/guilds` - Crear gremio
  - GET `/guilds` - Listar/buscar gremios
  - GET `/guilds/:id` - Detalle de gremio
  - POST `/guilds/:id/join` - Solicitar union
  - DELETE `/guilds/:id/leave` - Salir de gremio
- [ ] BE-GAM-013-D: Validaciones de negocio (limite miembros, etc)

**Frontend:**
- [ ] FE-GAM-013-A: Pagina `GuildsPage` (base existente)
- [ ] FE-GAM-013-B: Componente `CreateGuildModal`
- [ ] FE-GAM-013-C: Componente `GuildCard`
- [ ] FE-GAM-013-D: Componente `GuildSearchList`
- [ ] FE-GAM-013-E: Vista `GuildDetailPage`
- [ ] FE-GAM-013-F: Store `guildsStore` (existente, conectar)

---

### Definition of Done

- [ ] CRUD de gremios funcional
- [ ] Flujo de solicitud/aceptacion funcionando
- [ ] Validaciones de negocio implementadas
- [ ] RLS policies verificadas
- [ ] Tests de integracion pasando
- [ ] UI responsiva y accesible

---

**Creada por:** Requirements-Analyst
**Fecha:** 2026-01-17
