# _MAP: EAI-005 - Admin Base

**Epica:** EAI-005
**Nombre:** Administracion Base (Portal de Maestros - Alcance Base)
**Fase:** 1 - Alcance Inicial
**Presupuesto:** $18,800 MXN
**Story Points:** 47 SP
**Estado:** Completado

> **Nota de Auditoria (2026-01-10):** Valores corregidos de 42 SP/$16,800 a 47 SP/$18,800.
> La diferencia (+5 SP, +$2,000) corresponde a complejidad adicional en US-ADM-001 y US-ADM-002.

**IMPORTANTE:** Esta epica documenta funcionalidad implementada en **Portal de Maestros** (`/teacher/*`), NO en Portal Admin (`/admin/*`). Ver README.md para detalles.

**NOTA:** US-ADM-003 (Dashboard Maestro) fue movida a EXT-001 como US-PM-000 (8 SP), ya que es funcionalidad v2 (Portal Maestros)

---

## Contenido

### Historias de Usuario

| ID | Titulo | SP | Estado |
|----|--------|---:|--------|
| [US-ADM-001](./historias-usuario/US-ADM-001-gestion-aulas-crud.md) | Gestion de Aulas (CRUD Basico) | 8 | Done |
| [US-ADM-002](./historias-usuario/US-ADM-002-gestion-estudiantes-aula.md) | Gestion de Estudiantes en Aula | 10 | Done |
| [US-ADM-003](./historias-usuario/US-ADM-003-dashboard-maestro.md) | Dashboard de Maestro | 8 | Done |
| [US-ADM-004](./historias-usuario/US-ADM-004-asignacion-modulos.md) | Asignacion Basica de Modulos | 10 | Done |
| [US-ADM-005](./historias-usuario/US-ADM-005-gestion-grupos.md) | Gestion de Grupos Basica | 7 | Done |
| [US-ADM-006](./historias-usuario/US-ADM-006-configuracion-basica-aula.md) | Configuracion Basica de Aula | 6 | Done |
| [US-ADM-007](./historias-usuario/US-ADM-007-vista-actividad-aula.md) | Vista de Actividad de Aula | 6 | Done |

**Total:** 7 User Stories, 47 SP

---

### Requerimientos Funcionales

| ID | Titulo | US Relacionadas | Estado |
|----|--------|-----------------|--------|
| [RF-ADM-001](./requerimientos/RF-ADM-001-gestion-aulas.md) | Gestion de Aulas | US-ADM-001, US-ADM-006 | Implementado |
| [RF-ADM-002](./requerimientos/RF-ADM-002-gestion-estudiantes.md) | Gestion de Estudiantes | US-ADM-002, US-ADM-005 | Implementado |
| [RF-ADM-003](./requerimientos/RF-ADM-003-dashboard-maestro.md) | Dashboard de Maestro | US-ADM-003, US-ADM-007 | Implementado |
| [RF-ADM-004](./requerimientos/RF-ADM-004-asignacion-modulos.md) | Asignacion de Modulos | US-ADM-004 | Implementado |

**Total:** 4 Requerimientos Funcionales

---

### Especificaciones Tecnicas

| ID | Titulo | RF Padre | Estado |
|----|--------|----------|--------|
| [ET-ADM-001](./especificaciones/ET-ADM-001-gestion-aulas.md) | Implementacion de Gestion de Aulas | RF-ADM-001 | Implementado |
| [ET-ADM-002](./especificaciones/ET-ADM-002-gestion-estudiantes.md) | Implementacion de Gestion de Estudiantes | RF-ADM-002 | Implementado |
| [ET-ADM-003](./especificaciones/ET-ADM-003-dashboard-maestro.md) | Implementacion de Dashboard de Maestro | RF-ADM-003 | Implementado |
| [ET-ADM-004](./especificaciones/ET-ADM-004-asignacion-modulos.md) | Implementacion de Asignacion de Modulos | RF-ADM-004 | Implementado |

**Total:** 4 Especificaciones Tecnicas

---

### Implementacion

- [TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) - Trazabilidad de implementacion

---

## Estructura de Carpetas

```
EAI-005-admin-base/
├── _MAP.md                          <- ESTE ARCHIVO
├── README.md                        <- Descripcion de la EPIC
├── historias-usuario/
│   ├── US-ADM-001-gestion-aulas-crud.md
│   ├── US-ADM-002-gestion-estudiantes-aula.md
│   ├── US-ADM-003-dashboard-maestro.md
│   ├── US-ADM-004-asignacion-modulos.md
│   ├── US-ADM-005-gestion-grupos.md
│   ├── US-ADM-006-configuracion-basica-aula.md
│   └── US-ADM-007-vista-actividad-aula.md
├── requerimientos/
│   ├── _MAP.md
│   ├── RF-ADM-001-gestion-aulas.md
│   ├── RF-ADM-002-gestion-estudiantes.md
│   ├── RF-ADM-003-dashboard-maestro.md
│   └── RF-ADM-004-asignacion-modulos.md
├── especificaciones/
│   ├── ET-ADM-001-gestion-aulas.md
│   ├── ET-ADM-002-gestion-estudiantes.md
│   ├── ET-ADM-003-dashboard-maestro.md
│   └── ET-ADM-004-asignacion-modulos.md
├── implementacion/
│   └── TRACEABILITY.yml
└── tareas/
    └── _MAP.md
```

---

## Matriz de Trazabilidad

```
US-ADM-001 ──┬──> RF-ADM-001 ──> ET-ADM-001
US-ADM-006 ──┘

US-ADM-002 ──┬──> RF-ADM-002 ──> ET-ADM-002
US-ADM-005 ──┘

US-ADM-003 ──┬──> RF-ADM-003 ──> ET-ADM-003
US-ADM-007 ──┘

US-ADM-004 ────> RF-ADM-004 ──> ET-ADM-004
```

---

## Resumen de Cobertura

| Tipo | Total | Documentados |
|------|------:|-------------:|
| User Stories | 7 | 7 (100%) |
| Requerimientos | 4 | 4 (100%) |
| Especificaciones | 4 | 4 (100%) |

---

## Referencias

- **README:** [README.md](./README.md)
- **Trazabilidad:** [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml)
- **Portal Admin Avanzado:** `docs/97-adr/ADR-017-admin-portal-avanzado-vs-alcance-inicial.md`

---

**Ultima actualizacion:** 2026-01-20
**Generado por:** Documentation Analyst
