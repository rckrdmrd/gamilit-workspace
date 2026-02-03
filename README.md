# GAMILIT - Workspace Independiente

**Versión:** 4.5.0 (V2 Compliant)
**Última actualización:** 2026-02-03
**Estado:** ✅ INTEGRACIÓN WORKSPACE V2 COMPLETADA

---

## 📚 Qué es GAMILIT

**GAMILIT** (Gamificación Maya para la Lectoescritura en Tecnología) es una plataforma educativa de alto rendimiento que integra la cultura maya con inteligencia artificial adaptativa para mejorar las habilidades de lectoescritura.

Este repositorio es un **Workspace Independiente** con redundancia total, siguiendo los estándares de arquitectura y gobernanza del **Workspace V2**.

---

## 🗂️ Estructura del Workspace (V2)

```
/projects/gamilit/
├── docs/                      # Documentación Estándar V2
│   ├── 00-vision-general/     # Visión, glosario, objetivos
│   ├── 10-arquitectura/       # Arquitectura, modelado, stack
│   ├── 30-directivas/         # Principios SIMCO, CAPVED
│   ├── 50-requerimientos/     # Requerimientos migrados (Alcance, Extensiones)
│   └── ... (ver docs/_MAP.md)
│
├── orchestration/             # Orquestación de Agentes (SIMCO v4.3+)
│   ├── directivas/            # Directivas SIMCO locales
│   ├── scrum/                 # Gestión ágil (Backlog, Sprints)
│   ├── features/              # Control de funcionalidades
│   ├── planes/                # Planificación de integración V2
│   ├── tareas/                # Trazabilidad de tareas CAPVED
│   └── templates/             # Plantillas estandarizadas
│
├── apps/                      # Aplicaciones Core
│   ├── backend/               # NestJS API
│   ├── frontend/              # React/Next.js SPA
│   └── database/              # PostgreSQL (DDL, Migraciones)
│
├── artifacts/                 # Artefactos y Reportes
│   └── reports/tasks/         # Reportes detallados de integración
│
└── scripts/                   # Automatización y mantenimiento
```

---

## 🚀 Inicio Rápido

### Para Desarrolladores y Agentes

1.  **Carga de Contexto:** Consultar `orchestration/BOOTLOADER.md` para inicializar sesión.
2.  **Guía de Documentación:** Ver `docs/_MAP.md` para el nuevo mapa de conocimiento V2.
3.  **Tareas:** Consultar `orchestration/tareas/_INDEX.yml` para el historial de integración.

### Documentación Principal

| Documento | Descripción |
|-----------|-------------|
| [docs/_MAP.md](./docs/_MAP.md) | **Mapa Maestro de Documentación V2** |
| [orchestration/_INDEX.yml](./orchestration/_INDEX.yml) | Índice de Orquestación y Gobernanza |
| [orchestration/TRACEABILITY.yml](./orchestration/TRACEABILITY.yml) | Historial de versiones e integración |

---

## 🛠️ Stack Tecnológico (Sincronizado V2)

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Backend** | NestJS + TypeORM | 11.x |
| **Frontend** | React + Next.js + Tailwind | 19.x |
| **Database** | PostgreSQL | 16.x |
| **Orquestación** | SIMCO / NEXUS | 4.3 / 4.0 |

---

## 🔐 Gobernanza y Estándares

El proyecto sigue estrictamente el ciclo **CAPVED** y los principios **SIMCO**:
1.  **C**ontexto definido antes de actuar.
2.  **A**nálisis de impacto y riesgos.
3.  **P**laneación modular.
4.  **V**alidación (Gate) obligatoria.
5.  **E**jecución con tests y build.
6.  **D**ocumentación en carpeta de tarea.

---

## 🚢 Reporte de Integración Reciente

Se ha completado la migración estructural desde el modelo Legacy al modelo Workspace V2.
Ver reporte detallado en: [orchestration/reports/tasks/TASK-GAM-INTEGRATION-V2/REPORT-TASK-GAM-INTEGRATION-V2.md](./orchestration/reports/tasks/TASK-GAM-INTEGRATION-V2/REPORT-TASK-GAM-INTEGRATION-V2.md)

---

**Generado:** 2026-02-03
**Responsable:** Meta-Orquestador
**Política:** REPLICA_COMPLETA