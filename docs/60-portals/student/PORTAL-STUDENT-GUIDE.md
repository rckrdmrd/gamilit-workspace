---
titulo: Guía de Desarrollo - Portal Student
tipo: portal
portal: student
ultima_actualizacion: 2026-02-28
---

# Guía de Desarrollo - Portal Student

**Fecha de creación:** 2025-11-29
**Versión:** 2.2.0
**Estado:** VIGENTE
**Última actualización:** 2026-02-21 (M3-M5 teacher-grade exclusivo; Mejoras Sistema de Misiones: exercise_id, auto-start, MissionDetailModal)
**Aplica a:** apps/frontend/src/apps/student/ + apps/backend/src/modules/[progress, gamification, educational]

> **Nota:** Este archivo es el hub de navegación. El contenido detallado está dividido en 5 archivos
> especializados bajo `student-guide/`. Ver índice completo: [student-guide/_INDEX.md](./student-guide/_INDEX.md)

---

## Tabla de Contenidos

| Archivo | Secciones | Descripción |
|---------|-----------|-------------|
| [01-ARQUITECTURA.md](./student-guide/01-ARQUITECTURA.md) | 1-2 | Visión General y Arquitectura del Portal (estructura de carpetas, diagrama de flujo de datos) |
| [02-MODULOS-NAVEGACION.md](./student-guide/02-MODULOS-NAVEGACION.md) | 3-4 | Módulos Principales (Dashboard, Ejercicios, Gamificación, Tienda, Leaderboard, Perfil) y Navegación |
| [03-HOOKS-ESTADO.md](./student-guide/03-HOOKS-ESTADO.md) | 5-7 | Hooks Principales, APIs del Portal Student, Estado y Stores Zustand |
| [04-FEATURES.md](./student-guide/04-FEATURES.md) | 8-10 | Flujos Principales, Sistema de Gamificación Detallado, Responsive Design |
| [05-CALIDAD.md](./student-guide/05-CALIDAD.md) | 11-17 + Changelog | Buenas Prácticas, Testing, Checklist, Troubleshooting, Performance, Seguridad, Referencias |

---

## Resumen Rápido

**Stack:** React 19 + Zustand + React Query + TailwindCSS
**Backend:** NestJS 11 (módulos: progress, gamification, educational, social)
**Temática:** Detective educativo con cultura Maya (rangos, ML Coins, achievements)
**Portales:** Student (principal), Teacher (supervisión), Admin (monitoreo)

**Mecánicas por módulo:**
- **M1** (auto-grade): crucigrama, linea_tiempo, sopa_letras, mapa_conceptual, emparejamiento, verdadero_falso, completar_espacios
- **M2** (auto-grade): detective_textual, construccion_hipotesis, prediccion_narrativa, puzzle_contexto, rueda_inferencias
- **M3-M5** (teacher-grade): revisión manual del maestro, sin auto-scoring

---

**Mantenido por:** Tech Lead - GAMILIT Project
**Última revisión:** 2026-02-21
