# _MAP: EAI-004 - Analytics

**Epica:** EAI-004
**Nombre:** Analytics y Metricas Basicas
**Fase:** 1 - Alcance Inicial
**Presupuesto:** $22,000 MXN
**Story Points:** 35 SP
**Estado:** Done
**Sprint:** Mes 1, Semana 3-4

---

## Contenido

### Requerimientos Funcionales (3)
- [RF-ANA-001](./requerimientos/RF-ANA-001-visualizacion-progreso.md) - Visualizacion de Progreso del Estudiante
- [RF-ANA-002](./requerimientos/RF-ANA-002-metricas-gamificacion.md) - Metricas de Elementos de Gamificacion
- [RF-ANA-003](./requerimientos/RF-ANA-003-reportes-docente.md) - Reportes para Docentes y Administradores

### Especificaciones Tecnicas (3)
- [ET-ANA-001](./especificaciones/ET-ANA-001-dashboard-estudiante.md) - Dashboard del Estudiante y Vistas de Progreso
- [ET-ANA-002](./especificaciones/ET-ANA-002-api-metricas.md) - API de Metricas y Tracking de Actividad
- [ET-ANA-003](./especificaciones/ET-ANA-003-exportacion-datos.md) - Exportacion de Datos y Generacion de Reportes

### Historias de Usuario (6)
Total: 35 SP
- [US-ANA-001](./historias-usuario/US-ANA-001-dashboard-clase-basico.md) - Dashboard de Clase Basico - 6 SP
- [US-ANA-002](./historias-usuario/US-ANA-002-tabla-estudiantes-metricas.md) - Tabla de Estudiantes con Metricas - 5 SP
- [US-ANA-003](./historias-usuario/US-ANA-003-vista-estudiante-individual.md) - Vista de Estudiante Individual - 6 SP
- [US-ANA-004](./historias-usuario/US-ANA-004-reporte-basico-progreso.md) - Reporte Basico de Progreso - 5 SP
- [US-ANA-005](./historias-usuario/US-ANA-005-tracking-actividad.md) - Tracking de Actividad - 5 SP
- [US-ANA-006](./historias-usuario/US-ANA-006-identificacion-rezagados.md) - Identificacion de Estudiantes Rezagados - 8 SP

### Implementacion
- [TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) - Trazabilidad completa

**Modulos afectados:**
- **BD:** `analytics` schema, `progress_tracking` schema
- **Backend:** `teacher-analytics` module
- **Frontend:** `teacher/analytics` feature

---

## Trazabilidad Requerimientos -> Historias de Usuario

| Requerimiento | Historias de Usuario |
|---------------|----------------------|
| RF-ANA-001 | US-ANA-001, US-ANA-002, US-ANA-003 |
| RF-ANA-002 | US-ANA-005, US-ANA-006 |
| RF-ANA-003 | US-ANA-004 |

---

## Trazabilidad Especificaciones -> Requerimientos

| Especificacion | Requerimiento |
|----------------|---------------|
| ET-ANA-001 | RF-ANA-001 |
| ET-ANA-002 | RF-ANA-002 |
| ET-ANA-003 | RF-ANA-003 |

---

## Dependencias

### Dependencias Internas
- **EAI-003 (Gamificacion):** Genera eventos de XP, logros, niveles que se trackean
- **EAI-001 (Auth):** Autenticacion y roles de profesor

### Dependencias Externas
- Ninguna

---

## Documentacion Relacionada

### README de la Epica
- [README.md](./README.md) - Descripcion general de la epica

### Documentacion de Referencia
- EAI-003 (Gamificacion) como modelo de estructura

---

## Changelog

| Fecha | Version | Cambios |
|-------|---------|---------|
| 2026-01-20 | 1.0 | Creacion de requerimientos RF-ANA-001, RF-ANA-002, RF-ANA-003 |
| 2026-01-20 | 1.0 | Creacion de especificaciones ET-ANA-001, ET-ANA-002, ET-ANA-003 |
| 2026-01-20 | 1.0 | Actualizacion de _MAP.md con nueva estructura |

---

Ver [README.md](./README.md) para descripcion general de la epica.
