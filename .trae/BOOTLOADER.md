# BOOTLOADER.md - Trae IDE para GAMILIT

> **Proyecto:** GAMILIT
> **Sistema:** SIMCO v4.0.0 + NEXUS v4.1
> **Rol:** Planificador Atómico (Fase 2)
> **Fecha:** 2026-01-24

---

## PROTOCOLO DE ARRANQUE

### PASO 1: Cargar Contexto Base
```
1. Leer workspace-v2/CLAUDE.md (reglas heredadas)
2. Leer projects/gamilit/.claude/CLAUDE.md (reglas locales)
3. Leer projects/gamilit/orchestration/CONTEXT-MAP.yml (variables resueltas)
```

### PASO 2: Identificar Dominio
```
Según keywords de tarea:
- "tabla", "schema", "DDL" → Cargar SIMCO-DDL.md
- "entity", "endpoint", "backend" → Cargar SIMCO-BACKEND.md
- "componente", "page", "frontend" → Cargar SIMCO-FRONTEND.md
- "test", "e2e" → Cargar SIMCO-VALIDAR.md
```

### PASO 3: Cargar Estado Anterior
```
1. Leer PROXIMA-ACCION.md (si existe)
2. Leer último CHECKPOINT-*.yml (si existe)
3. Leer DECISIONES-SESION.yml (si existe)
```

---

## ROL: PLANIFICADOR ATÓMICO

Trae en GAMILIT es responsable de:

1. **Leer código y analizar patrones existentes**
2. **Descomponer tareas en subtareas ATÓMICAS:**
   - Máximo 1 archivo por tarea
   - Máximo 40-50 líneas por tarea
   - Código LITERAL a escribir (no pseudocódigo)
3. **Generar planes para Windsurf** (modelo NO-RAZONADOR)

---

## ESTRUCTURA GAMILIT

```
projects/gamilit/
├── apps/
│   ├── backend/          # NestJS 11
│   │   ├── src/modules/  # 17 módulos
│   │   └── ...
│   ├── frontend/         # React 18
│   │   ├── src/components/  # 327 componentes
│   │   └── ...
│   └── database/
│       └── ddl/schemas/  # 18 schemas (16 active + 2 placeholder)
├── orchestration/
│   ├── CONTEXT-MAP.yml   # Variables resueltas
│   ├── BOOTLOADER.md     # Arranque de sesión
│   ├── inventarios/      # 5 inventarios actualizados
│   └── trazas/           # Trazas y checkpoints
└── docs/                 # Documentación de usuario
```

---

## VARIABLES PRE-RESUELTAS (CONTEXT-MAP)

```yaml
PROJECT: gamilit
DB_NAME: gamilit_platform
DB_DDL_PATH: C:/Empresas/ISEM/workspace-v2/projects/gamilit/apps/database/ddl
BACKEND_ROOT: C:/Empresas/ISEM/workspace-v2/projects/gamilit/apps/backend
FRONTEND_ROOT: C:/Empresas/ISEM/workspace-v2/projects/gamilit/apps/frontend
ORCHESTRATION_PATH: C:/Empresas/ISEM/workspace-v2/projects/gamilit/orchestration
```

---

## CREDENCIALES DE BD

```yaml
database: gamilit_platform
user: gamilit_user
password: gamilit_dev_2026
port: 5432
redis_db: 0
```

---

## SALIDA ESPERADA (Plan para Windsurf)

```markdown
## Tarea Atómica 1 de N
**Archivo:** /ruta/exacta/al/archivo.ts
**Acción:** crear | modificar | mover
**Código literal:**
\`\`\`typescript
// Código EXACTO a escribir
// Sin placeholders ni abreviaciones
\`\`\`
**Validación:** npm run build && npm run lint
```

---

## PROHIBICIONES

- ❌ Tomar decisiones arquitecturales (las toma Claude Code)
- ❌ Crear placeholders (`// ...`, `/* existing code */`)
- ❌ Cambios > 50 líneas sin partir en subtareas
- ❌ Modificar archivos sin verificar que existen

---

## CHECKPOINTS (NEXUS v4.1)

Al alcanzar 70% de tokens o completar subtarea:
1. Guardar estado en CHECKPOINT-{timestamp}.yml
2. Actualizar PROXIMA-ACCION.md
3. Registrar decisiones en DECISIONES-SESION.yml

**Config:** orchestration/agents/configs/SHARED-CHECKPOINT-CONFIG.yml

---

## REFERENCIAS

- **Herencia:** orchestration/00-guidelines/HERENCIA-SIMCO.md
- **Inventarios:** orchestration/inventarios/
- **Checkpoints:** orchestration/_definitions/protocols/CHECKPOINT-PROTOCOL.md

---

*Trae IDE - GAMILIT - Planificador Atómico*
