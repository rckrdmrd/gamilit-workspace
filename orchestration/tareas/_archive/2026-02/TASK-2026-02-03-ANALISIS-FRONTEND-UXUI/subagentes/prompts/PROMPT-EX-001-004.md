# PROMPTS DE EXPLORACIÓN INICIAL (FASE-C)

**Tarea:** TASK-2026-02-03-ANALISIS-FRONTEND-UXUI
**Fecha:** 2026-02-03
**Sprint:** Exploración (Pre-Sprint 1)

---

## SUBAGENTE EX-001: Explorar Estructura Frontend

### Perfil Utilizado
- **Tipo:** Explore (Compact)
- **Herramientas:** Glob, Grep, Read
- **Tokens estimados:** ~250 tokens perfil

### Prompt Enviado

```
Explore the GAMILIT frontend structure in apps/frontend/src/.
I need to understand:

1. Total number of TypeScript/TSX files
2. Total lines of code
3. Directory structure (main folders: shared, features, apps, services)
4. Component distribution:
   - shared/components/ count
   - features/*/components/ counts
   - apps/*/components/ counts
5. Hook distribution (hooks files)
6. Store distribution (Zustand stores)
7. Service/API distribution
8. Type definition files

Provide counts and key file paths for each area.
This is for a comprehensive frontend audit.
```

### Contexto Proporcionado

```yaml
proyecto: gamilit
ubicacion: apps/frontend/src/
objetivo: Mapear estructura completa del frontend
entregable_esperado:
  - Conteo de archivos por área
  - Estructura de directorios
  - Componentes catalogados
  - Hooks identificados
  - Stores mapeados
```

### Resultado Obtenido

- 1,014 archivos TypeScript/TSX analizados
- 245,704 líneas de código identificadas
- 495+ componentes catalogados
- 60+ rutas documentadas
- 32 stores Zustand identificados

---

## SUBAGENTE EX-002: Explorar Documentación Orchestration

### Perfil Utilizado
- **Tipo:** Explore (Compact)
- **Herramientas:** Glob, Grep, Read
- **Tokens estimados:** ~250 tokens perfil

### Prompt Enviado

```
Explore the GAMILIT orchestration documentation structure.
Focus on:

1. orchestration/tareas/ - How many tasks? What states?
2. orchestration/inventarios/ - Which inventories exist?
   - MASTER_INVENTORY.yml version and key metrics
   - FRONTEND_INVENTORY.yml structure
   - DATABASE_INVENTORY.yml key counts
3. orchestration/scrum/ - BACKLOG.yml epics and user stories count
4. docs/50-requerimientos/ - ET files and US files count

Return:
- Total completed tasks
- Total user stories identified
- Total epics (completed vs backlog)
- MVP status percentage
```

### Contexto Proporcionado

```yaml
proyecto: gamilit
ubicaciones:
  - orchestration/tareas/
  - orchestration/inventarios/
  - orchestration/scrum/
  - docs/50-requerimientos/
objetivo: Entender estado de documentación y planificación
```

### Resultado Obtenido

- 50 tareas completadas documentadas
- 138 historias de usuario identificadas
- 22 épicas (17 completadas, 5 en backlog)
- Estado MVP: 95%

---

## SUBAGENTE EX-003: Explorar DDL y Schema BD

### Perfil Utilizado
- **Tipo:** Explore (Compact)
- **Herramientas:** Glob, Grep, Read
- **Tokens estimados:** ~250 tokens perfil

### Prompt Enviado

```
Explore the GAMILIT database DDL structure in apps/database/ddl/.
I need:

1. Total number of schemas
2. List of all schemas with table counts
3. Total functions and triggers
4. RLS policies count
5. ENUMs defined

Focus on:
- apps/database/ddl/schemas/*/tables/
- apps/database/ddl/schemas/*/functions/
- apps/database/ddl/schemas/*/rls-policies/

Return summary with counts per schema.
```

### Contexto Proporcionado

```yaml
proyecto: gamilit
ubicacion: apps/database/ddl/
objetivo: Mapear modelo de datos completo
inventario_referencia: DATABASE_INVENTORY.yml v5.0.0
```

### Resultado Obtenido

- 16 schemas identificados
- 140 tablas catalogadas
- 159 funciones documentadas
- 282 RLS policies
- 35 ENUMs

---

## SUBAGENTE EX-004: Explorar Docs Usuario

### Perfil Utilizado
- **Tipo:** Explore (Compact)
- **Herramientas:** Glob, Grep, Read
- **Tokens estimados:** ~250 tokens perfil

### Prompt Enviado

```
Explore the GAMILIT user documentation in docs/.
Focus on:

1. docs/00-vision-general/ - Vision documents, design docs
2. docs/50-requerimientos/ - Requirements structure
   - Count ET files (especificaciones técnicas)
   - Count US files (historias de usuario)
   - Epic structure (EAI-*, EXT-*)
3. docs/40-estandares/ - Standards available

Return:
- Key vision documents identified
- ET files count by epic
- US files count by epic
- Standards list
```

### Contexto Proporcionado

```yaml
proyecto: gamilit
ubicacion: docs/
objetivo: Mapear documentación de requerimientos y visión
areas:
  - 00-vision-general
  - 50-requerimientos
  - 40-estandares
```

### Resultado Obtenido

- Visión y alcance documentados
- 5 módulos educativos especificados
- Sistema de gamificación Maya documentado
- Flujos de usuario definidos
- 92+ ET files identificados

---

## NOTAS DE EJECUCIÓN

### Paralelización
Los 4 subagentes EX-001 a EX-004 fueron ejecutados en paralelo usando el Task tool con múltiples invocaciones simultáneas.

### Tiempo de Ejecución
- EX-001: ~4 minutos
- EX-002: ~3 minutos
- EX-003: ~3 minutos
- EX-004: ~3 minutos
- **Total paralelo:** ~4 minutos

### Herramientas Utilizadas
Todos los subagentes utilizaron:
- `Glob` para encontrar archivos por patrón
- `Grep` para buscar contenido específico
- `Read` para leer archivos relevantes

---

**Documentado:** 2026-02-04
**Sistema:** SIMCO v4.3.0
