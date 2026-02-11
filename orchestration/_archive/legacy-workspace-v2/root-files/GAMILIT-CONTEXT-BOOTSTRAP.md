# GAMILIT - Bootstrap de Contexto para Nuevos Agentes

**Version:** 1.0.0
**Actualizado:** 2026-01-30
**Proposito:** Resumen ejecutivo para agentes que inician trabajo en gamilit

---

## ESTADO ACTUAL

| Metrica | Valor | Fecha Validacion |
|---------|-------|------------------|
| **MVP Completitud** | 95% | 2026-01-27 |
| **Estado** | Produccion Activa | - |
| **Usuarios Reales** | Si | - |
| **Tareas Completadas** | 51 | 2026-01-30 |
| **Tareas Pendientes** | 0 | - |

---

## METRICAS POR CAPA

### Base de Datos
| Metrica | Valor |
|---------|-------|
| Schemas | 16 |
| Tablas | 147 |
| Funciones | 232 |
| Triggers | 109 |
| RLS Policies | 282 |
| Foreign Keys | 241 |
| ENUMs | 39 |

### Backend
| Metrica | Valor |
|---------|-------|
| Modulos | 18 |
| Entities | 137 |
| DTOs | 366 |
| Services | 121 |
| Controllers | 86 |
| Endpoints | 750 |
| Coherencia DDL | 100% |

### Frontend
| Metrica | Valor |
|---------|-------|
| Componentes | 398 |
| Paginas | 67 |
| Stores Zustand | 32 |
| Hooks | 104 |
| API Services | 48 |
| Mechanics | 40 |
| Coherencia Backend | 95.3% |

---

## EPICAS COMPLETADAS (17/22)

Los siguientes modulos estan 100% implementados:

1. **EAI-001:** Autenticacion y Usuarios
2. **EAI-002:** Sistema Educativo (M1-M5)
3. **EAI-003:** Gamificacion (XP, Rangos, Logros, Economia)
4. **EAI-004:** Social (Amigos, Guilds, Leaderboards)
5. **EAI-005:** Portal Estudiante
6. **EAI-006:** Portal Maestro
7. **EAI-008:** Portal Administrador
8. **EXT-001 a EXT-006:** Extensiones base

---

## EPICAS PARCIALES (5/22) - EN BACKLOG

| Epica | Nombre | % Avance | Estado |
|-------|--------|----------|--------|
| EXT-007 | LTI Integration | 30% | Backlog |
| EXT-008 | White-Label | 40% | Backlog |
| EXT-009 | Peer Challenges | 50% | Backlog |
| EXT-010 | Parent Portal | 30% | Backlog |
| EXT-011 | Parent Notifications | 40% | Backlog |

---

## QUE NO HACER

### Prohibiciones Absolutas
1. **NO re-implementar M1-M5** - Los 5 modulos educativos estan 100% completos
2. **NO modificar arquitectura BD** - Estable desde 2026-01-27, solo agregar
3. **NO crear stores sin verificar** - Ya existen 32 stores, verificar duplicados
4. **NO crear entities sin verificar DDL** - Coherencia al 100%, mantener

### Verificaciones Obligatorias
- Antes de crear componente: Verificar en FRONTEND_INVENTORY.yml
- Antes de crear entity: Verificar tabla existe en DDL
- Antes de crear endpoint: Verificar no duplicado en Swagger

---

## FUENTES DE VERDAD (SSOT)

### Para Metricas Actuales
```
LEER DE: projects/gamilit/orchestration/inventarios/
  - DATABASE_INVENTORY.yml (v5.0.0)
  - BACKEND_INVENTORY.yml (v3.14.0)
  - FRONTEND_INVENTORY.yml (v4.10.0)
  - MASTER_INVENTORY.yml (v5.1.0)
```

### NO Leer De
```
EVITAR: workspace-v2/orchestration/inventarios/
  → Son REFERENCIAS agregadas, pueden estar desactualizadas
```

---

## ARCHIVOS CLAVE PARA CARGAR

### Al Iniciar Sesion (Obligatorios)
1. `orchestration/PROXIMA-ACCION.md` - Estado actual
2. `orchestration/GAMILIT-CONTEXT-BOOTSTRAP.md` - Este archivo
3. `orchestration/inventarios/MASTER_INVENTORY.yml` - Metricas

### Segun Tarea
- **BD:** `apps/database/ddl/`, DATABASE_INVENTORY.yml
- **Backend:** `apps/backend/src/`, BACKEND_INVENTORY.yml
- **Frontend:** `apps/frontend/src/`, FRONTEND_INVENTORY.yml

---

## TAREAS RECIENTES COMPLETADAS (Referencia)

### 2026-01-27 (Ultimo sprint)
- TASK-022: Modelado Integral BD - 10 fixes P0-P2
- TASK-025-029: Gaps P1/P2, Admin/Teacher Portals al 100%
- Seeds P1-P3 y RLS expansion

### Resultado
- Backend: 95% -> 98%
- MVP: 88% -> 95%
- Coherencia DDL-Backend: 100%

---

## CONTACTO Y ESCALAMIENTO

- **Workspace:** workspace-v2 (C:\Empresas\ISEM\workspace-v2)
- **Submodulo:** projects/gamilit
- **Sistema:** NEXUS v4.0 (especializacion de SIMCO)

---

**IMPORTANTE:** Este documento es el punto de entrada para nuevos agentes.
Si encuentras discrepancias con la realidad, actualiza este archivo primero.
