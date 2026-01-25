# BOOTLOADER - GAMILIT

**Sistema:** NEXUS v4.0 - Protocolo de Arranque Local
**Proyecto:** GAMILIT
**Version:** 1.0.0
**Fecha:** 2026-01-24

---

## 1. Proposito

Este BOOTLOADER define la secuencia de arranque especifica para el proyecto GAMILIT.
Extiende el BOOTLOADER del workspace con contexto local.

---

## 2. Secuencia de Arranque (5 Pasos)

```
┌─────────────────────────────────────────────────────────────────────────┐
│               BOOTLOADER GAMILIT - 5 PASOS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PASO 1: Cargar L0 (Sistema - Workspace)                               │
│  ════════════════════════════════════════                               │
│  ├── Leer workspace-v2/CLAUDE.md                                       │
│  ├── Verificar aliases del workspace disponibles                       │
│  └── Tokens: ~4000                                                     │
│                         │                                              │
│                         ▼                                              │
│  PASO 2: Cargar L1 (Proyecto - GAMILIT)                                │
│  ════════════════════════════════════════                               │
│  ├── Leer .claude/CLAUDE.md (este archivo de instrucciones)            │
│  ├── Leer orchestration/CONTEXT-MAP.yml (variables resueltas)          │
│  ├── Leer orchestration/PROXIMA-ACCION.md (estado anterior)            │
│  └── Tokens: ~3000                                                     │
│                         │                                              │
│                         ▼                                              │
│  PASO 3: Determinar Dominio                                            │
│  ════════════════════════════════════════                               │
│  ├── Clasificar tarea (DDL, Backend, Frontend, Docs)                   │
│  ├── Cargar SIMCO del dominio                                          │
│  └── Cargar inventario del dominio                                     │
│                         │                                              │
│                         ▼                                              │
│  PASO 4: Verificar Estado                                              │
│  ════════════════════════════════════════                               │
│  ├── git fetch origin && git status                                    │
│  ├── Verificar si hay trabajo en progreso                              │
│  └── Verificar estado de builds                                        │
│                         │                                              │
│                         ▼                                              │
│  PASO 5: Iniciar Tarea                                                 │
│  ════════════════════════════════════════                               │
│  ├── Crear carpeta de tarea si no existe                               │
│  ├── Ejecutar FASE C de CAPVED                                         │
│  └── Proceder con la tarea                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Archivos a Cargar por Paso

### PASO 1: L0 Sistema (~4000 tokens)
```yaml
obligatorio:
  - path: "../../CLAUDE.md"
    proposito: "Instrucciones del workspace"
    tokens: 4000
```

### PASO 2: L1 Proyecto (~3000 tokens)
```yaml
obligatorio:
  - path: "../.claude/CLAUDE.md"
    proposito: "Instrucciones locales GAMILIT"
    tokens: 1500

  - path: "CONTEXT-MAP.yml"
    proposito: "Variables y aliases resueltos"
    tokens: 800

  - path: "PROXIMA-ACCION.md"
    proposito: "Estado anterior y siguiente paso"
    tokens: 500

  - path: "inventarios/MASTER_INVENTORY.yml"
    proposito: "Estado de artefactos"
    tokens: 200
```

### PASO 3: L2 Operacion (variable, ~2500 tokens)
```yaml
por_dominio:
  DDL:
    - "directivas/simco/SIMCO-DDL.md"                      # LOCAL
    - "inventarios/DATABASE_INVENTORY.yml"

  Backend:
    - "directivas/simco/SIMCO-BACKEND.md"                  # LOCAL
    - "inventarios/BACKEND_INVENTORY.yml"

  Frontend:
    - "directivas/simco/SIMCO-FRONTEND.md"                 # LOCAL
    - "inventarios/FRONTEND_INVENTORY.yml"

  Documentacion:
    - "directivas/simco/SIMCO-DOCUMENTAR.md"               # LOCAL
```

> **Nota:** Desde 2026-01-25, todas las directivas SIMCO estan replicadas
> localmente en orchestration/directivas/. Ya no se requiere acceso al workspace.

---

## 4. Variables Pre-Resueltas

Las siguientes variables estan pre-resueltas en CONTEXT-MAP.yml:

```yaml
# Paths principales
PROJECT_ROOT:        projects/gamilit
BACKEND_SRC:         projects/gamilit/apps/backend/src
FRONTEND_SRC:        projects/gamilit/apps/frontend/src
DDL_PATH:            projects/gamilit/apps/database/ddl
SEEDS_PATH:          projects/gamilit/apps/database/seeds

# Base de datos
DB_NAME:             gamilit_platform
DB_USER:             gamilit_user
DB_PASSWORD:         gamilit_dev_2026
DB_PORT:             5432

# Auth
AUTH_SCHEMA:         auth_management
```

---

## 5. Recuperacion de Sesion

Si detectas compactacion o reinicio de sesion:

```
1. Ejecutar PASO 1 (L0 siempre)
         │
         ▼
2. Leer orchestration/PROXIMA-ACCION.md
         │
         ▼
3. Verificar "Contexto Critico" listado
         │
         ▼
4. Cargar archivos criticos
         │
         ▼
5. Verificar git status
         │
         ▼
6. Continuar desde "Siguiente Paso"
```

**Tiempo esperado de recuperacion:** < 2 minutos

---

## 6. Checklist de Arranque

### Al Iniciar Sesion en GAMILIT

- [ ] PASO 1: workspace-v2/CLAUDE.md leido
- [ ] PASO 2: .claude/CLAUDE.md leido
- [ ] PASO 2: CONTEXT-MAP.yml cargado
- [ ] PASO 2: PROXIMA-ACCION.md verificado
- [ ] PASO 3: Dominio identificado
- [ ] PASO 3: SIMCO del dominio cargado
- [ ] PASO 3: Inventario del dominio verificado
- [ ] PASO 4: git fetch ejecutado
- [ ] PASO 4: Estado limpio verificado
- [ ] PASO 5: Listo para trabajar

### Presupuesto de Tokens

| Nivel | Tokens | Descripcion |
|-------|--------|-------------|
| L0 Sistema | 4,000 | Workspace CLAUDE.md |
| L1 Proyecto | 3,000 | GAMILIT local |
| L2 Operacion | 2,500 | SIMCO + inventario |
| L3 Tarea | 8,000 | Contexto especifico |
| **Total base** | **9,500** | Sin tarea |
| **Total maximo** | **17,500** | Con tarea |

---

## 7. Errores Comunes

| Error | Causa | Solucion |
|-------|-------|----------|
| Alias @GAMILIT no reconocido | L1 no cargado | Ejecutar PASO 2 |
| Variables DB incorrectas | CONTEXT-MAP no cargado | Leer CONTEXT-MAP.yml |
| Estado perdido | Compactacion | Seguir seccion 5 |
| Path apps/ no encontrado | Estructura diferente | GAMILIT usa apps/ no carpetas raiz |

---

## 8. Referencias

- **BOOTLOADER Global:** `directivas/simco/SIMCO-BOOTLOADER.md` (LOCAL)
- **CONTEXT-MAP:** `CONTEXT-MAP.yml`
- **PROXIMA-ACCION:** `PROXIMA-ACCION.md`
- **Herencia:** `_inheritance.yml`
- **Agentes:** `agents/`
- **Directivas SIMCO:** `directivas/simco/`
- **Definiciones:** `_definitions/`

---

*BOOTLOADER GAMILIT v1.1.0 - Sistema NEXUS v4.0 + REPLICA_COMPLETA*
*Actualizado: 2026-01-25 - Sincronizacion orchestration/*
