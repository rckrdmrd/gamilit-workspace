# MAPA DE ORQUESTACION: GAMILIT

**Proyecto:** GAMILIT - Plataforma de Gamificacion Educativa
**Sistema:** NEXUS v4.0 + SIMCO
**Nivel:** STANDALONE (workspace autónomo con herencia de workspace-v1)
**Última actualización:** 2026-01-04

---

## Estructura de Orquestación

```
orchestration/
├── 00-guidelines/           # Contexto del proyecto y herencia
├── CONTEXT-MAP.yml          # Mapa de contexto automático (NEXUS v4.0)
├── PROXIMA-ACCION.md        # Estado actual y siguiente paso
├── agentes/                 # Reportes y logs de agentes
├── analisis/                # Análisis técnicos
├── directivas/              # Directivas locales del proyecto
├── environment/             # Configuración de entorno
├── errores/                 # Registro de errores (CAPVED++)
├── estados/                 # Estados del sistema
├── inventarios/             # Inventarios de artefactos
├── migracion-consolidado-2025-12/  # Documentación de migración
├── prompts/                 # Prompts de agentes específicos
├── reportes/                # Reportes de ejecución
├── roadmap/                 # Planificación estratégica
├── scripts/                 # Scripts de orquestación
├── scrum/                   # Sprints y backlog (NEXUS v4.0)
├── templates/               # Templates locales
└── trazas/                  # Trazabilidad de tareas
```

---

## Archivos Críticos NEXUS v4.0

| Archivo | Propósito | Obligatorio |
|---------|-----------|-------------|
| `CONTEXT-MAP.yml` | Resolución automática de contexto por nivel/tarea | Sí |
| `PROXIMA-ACCION.md` | Estado actual del proyecto | Sí |
| `errores/REGISTRO-ERRORES.yml` | Historial de errores para CAPVED++ | Sí |
| `scrum/SPRINT-ACTUAL.yml` | Sprint backlog activo | Sí |
| `inventarios/MASTER_INVENTORY.yml` | Estado de todos los artefactos | Sí |
| `trazas/TRAZA-TAREAS-*.md` | Trazabilidad por dominio | Sí |

---

## Sistema NEXUS v4.0 - Gamilit Standalone

### Niveles de Contexto

| Nivel | Tokens | Contenido |
|-------|--------|-----------|
| **L0 Sistema** | ~4500 | Principios CAPVED++, directivas globales |
| **L1 Proyecto** | ~3000 | CONTEXTO-PROYECTO.md, PROXIMA-ACCION.md, MASTER_INVENTORY |
| **L2 Operación** | ~2500 | SIMCO por operación (CREAR/MODIFICAR/VALIDAR) y dominio (DDL/BE/FE) |
| **L3 Tarea** | max 8000 | docs/ específicos, código similar, histórico |

### Límites de Tokens

```yaml
limite_absoluto: 25000
limite_seguro: 18000
limite_alerta: 20000
presupuesto_base: 10000  # L0 + L1
disponible_tarea: 8000   # L2 + L3
```

---

## Principios NEXUS v4.0 (Heredados)

Los siguientes principios se heredan del workspace-v1:

| Principio | Archivo | Propósito |
|-----------|---------|-----------|
| CAPVED++ | `PRINCIPIO-CAPVED.md` | Ciclo de vida con gates |
| Doc-Primero | `PRINCIPIO-DOC-PRIMERO.md` | Documentación antes de código |
| Anti-Duplicación | `PRINCIPIO-ANTI-DUPLICACION.md` | Verificar catálogo |
| Validación Obligatoria | `PRINCIPIO-VALIDACION-OBLIGATORIA.md` | Build/lint deben pasar |
| Economía Tokens | `PRINCIPIO-ECONOMIA-TOKENS.md` | Límites de contexto |
| No Asumir | `PRINCIPIO-NO-ASUMIR.md` | Preguntar si falta info |

**Path herencia:** `/home/isem/workspace-v1/orchestration/directivas/principios/`

---

## Directivas SIMCO Disponibles

### Directivas Globales (workspace-v1)

| Directiva | Cuándo Usar |
|-----------|-------------|
| `SIMCO-CREAR.md` | Crear nuevos artefactos |
| `SIMCO-MODIFICAR.md` | Modificar artefactos existentes |
| `SIMCO-VALIDAR.md` | Validar coherencia/calidad |
| `SIMCO-DELEGACION.md` | Delegar a subagentes |
| `SIMCO-DDL.md` | Tareas de base de datos |
| `SIMCO-BACKEND.md` | Tareas de backend NestJS |
| `SIMCO-FRONTEND.md` | Tareas de frontend React |
| `SIMCO-CAPVED-PLUS.md` | Ciclo extendido con gates |
| `SIMCO-ERROR-RECURRENTE.md` | Manejo de errores repetidos |
| `SIMCO-SCRUM-INTEGRATION.md` | Integración Scrum |

**Path:** `/home/isem/workspace-v1/orchestration/directivas/simco/`

### Directivas Locales (gamilit)

| Directiva | Propósito |
|-----------|-----------|
| `DIRECTIVA-DISENO-BASE-DATOS.md` | Diseño BD 16 schemas |
| `DIRECTIVA-POLITICA-CARGA-LIMPIA.md` | DDL-first, sin migraciones |
| `ESTANDARES-API-ROUTES.md` | Convenciones REST |

**Path:** `/home/isem/workspace-v1/projects/gamilit/orchestration/directivas/`

---

## Integración con docs/

El sistema NEXUS v4.0 se integra con la carpeta docs/ del proyecto:

| Recurso docs/ | Uso en NEXUS |
|---------------|--------------|
| `docs/_MAP.md` | Navegación de documentación |
| `docs/90-transversal/arquitectura/` | Referencia arquitectónica |
| `docs/90-transversal/api/API.md` | Contratos de API |
| `docs/95-guias-desarrollo/` | Guías de implementación |
| `docs/01-fase-*/EAI-*/` | Especificaciones por EPIC |
| `docs/04-fase-backlog/` | Features pendientes |
| `docs/97-adr/` | Decisiones arquitectónicas |

---

## Inventarios

| Inventario | Contenido | Path |
|------------|-----------|------|
| `MASTER_INVENTORY.yml` | Estado consolidado | `inventarios/` |
| `DATABASE_INVENTORY.yml` | 16 schemas, 123 tablas | `inventarios/` |
| `BACKEND_INVENTORY.yml` | Módulos, services, controllers | `inventarios/` |
| `FRONTEND_INVENTORY.yml` | Componentes, páginas | `inventarios/` |

---

## Trazas

| Traza | Dominio | Path |
|-------|---------|------|
| `TRAZA-TAREAS-DATABASE.md` | DDL, seeds, índices | `trazas/` |
| `TRAZA-TAREAS-BACKEND.md` | NestJS, API | `trazas/` |
| `TRAZA-TAREAS-FRONTEND.md` | React, UI | `trazas/` |

---

## Prompts de Agentes

| Prompt | Especialización |
|--------|-----------------|
| `PROMPT-DATABASE-AGENT.md` | PostgreSQL, DDL, RLS |
| `PROMPT-DATABASE-AUDITOR.md` | Auditoría de BD |
| `PROMPT-BACKEND-AGENT.md` | NestJS, TypeORM |
| `PROMPT-FRONTEND-AGENT.md` | React, Zustand |
| `PROMPT-ARCHITECTURE-ANALYST.md` | Análisis arquitectónico |

**Path:** `prompts/`

---

## SCRUM (NEXUS v4.0)

| Archivo | Propósito |
|---------|-----------|
| `scrum/SPRINT-ACTUAL.yml` | Sprint backlog activo |
| (workspace) `TEMPLATE-SPRINT-BACKLOG.yml` | Template de sprint |
| (workspace) `TEMPLATE-HISTORIA-USUARIO.md` | Template de HU |
| (workspace) `TEMPLATE-RETROSPECTIVA.yml` | Template retrospectiva |

---

## Registro de Errores

| Archivo | Propósito |
|---------|-----------|
| `errores/REGISTRO-ERRORES.yml` | Historial local de errores |
| (workspace) `REGISTRO-ERRORES.yml` | Historial global |

---

## Herencia de Workspace

Gamilit hereda configuración de workspace-v1 pero opera como standalone:

```yaml
herencia:
  tipo: STANDALONE
  hereda_de:
    - /home/isem/workspace-v1/orchestration/directivas/
    - /home/isem/workspace-v1/orchestration/templates/
    - /home/isem/workspace-v1/shared/catalog/
  autonomia:
    - Puede contener copias de directivas críticas
    - CONTEXT-MAP.yml resuelve todo localmente
    - Inventarios y trazas son locales
```

---

## Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Schemas PostgreSQL | 16 |
| Tablas | 123 |
| Endpoints API | 417 |
| Políticas RLS | 185 |
| EPICs documentadas | 19 |
| ADRs | 20 |

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Backend + Frontend
npm run validate:all           # Todas las validaciones

# Base de datos
./apps/database/drop-and-recreate-database.sh  # Recrear BD

# Testing
npm run test                   # Todos los tests
```

---

**Actualizado:** 2026-01-04
**Sistema:** NEXUS v4.0 + SIMCO
