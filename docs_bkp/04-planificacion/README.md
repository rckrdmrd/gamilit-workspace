# 04-planificacion/

**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Versión:** 2.0 (RFC-0001)
**Última actualización:** 2025-11-02
**Estado:** ✅ Reestructurado según alcance real

---

## 📋 Propósito

Esta carpeta contiene toda la **planificación** del proyecto GAMILIT, reorganizada según las fases reales de desarrollo:

1. **Alcance Inicial:** 5 módulos base ($110,000 MXN, Mes 1)
2. **Migración BD:** Robustecimiento técnico ($50,000 MXN, Mes 2)
3. **Extensiones:** 6 módulos adicionales ($155,000 MXN, Mes 3)
4. **Futuras:** Extensiones pendientes

---

## 📁 Estructura

### 01-alcance-inicial/ ($110,000 MXN, 230 SP) ✅

**5 épicas del alcance cotizado original:**

| Épica | Módulo | Presupuesto | SP | Historias |
|-------|--------|-------------|----|-----------|
| **EAI-001** | Fundamentos | $22,000 | 60 | 15-20 |
| **EAI-002** | Actividades | $22,000 | 45 | 12-15 |
| **EAI-003** | Gamificación | $22,000 | 40 | 10-12 |
| **EAI-004** | Analytics | $22,000 | 35 | 8-10 |
| **EAI-005** | Admin Base | $22,000 | 50 | 12-15 |

**Ver:** [01-alcance-inicial/README.md](./01-alcance-inicial/README.md)

---

### 02-migracion-robustecimiento/ ($50,000 MXN, 80 SP) ✅

**1 épica técnica de Fase 2:**

| Épica | Objetivo | Presupuesto | SP | Tareas |
|-------|----------|-------------|----|-----------|
| **EMR-001** | Migración BD | $50,000 | 80 | 25-30 |

**Entregables:** 89 tablas, 15 migraciones, API completa (75 endpoints)

**Ver:** [02-migracion-robustecimiento/EMR-001-migracion-bd/README.md](./02-migracion-robustecimiento/EMR-001-migracion-bd/README.md)

---

### 03-extensiones/ ($155,000 MXN, 305 SP) ✅

**6 épicas de extensiones (Mes 3):**

| Épica | Módulo | Presupuesto | SP | Sprint | Historias |
|-------|--------|-------------|----| -------|-----------|
| **EXT-001** | Portal Maestros | $35,000 | 60 | 1-2 | 15-18 |
| **EXT-002** | Admin Extendido | $30,000 | 70 | 1-2 | 18-20 |
| **EXT-003** | Notificaciones | $25,000 | 45 | 3 | 10-12 |
| **EXT-004** | Perfiles | $20,000 | 35 | 4 | 8-10 |
| **EXT-005** | Reportes | $25,000 | 50 | 4 | 12-15 |
| **EXT-006** | Contenido | $20,000 | 45 | 4 | 10-12 |

**Ver:** [03-extensiones/README.md](./03-extensiones/README.md)

---

### 04-futuras-extensiones/ (Pendiente planificación) ⚪

**2 épicas identificadas para futuro:**

| Épica | Módulo | Presupuesto Est. | SP Est. | Estado |
|-------|--------|------------------|---------|--------|
| **EXT-007** | Social Completo | $30,000 | 50 | ⚪ Pendiente |
| **EXT-008** | DevOps Cloud | $25,000 | 40 | ⚪ Pendiente |

---

### Carpetas Compartidas

```
04-planificacion/
├── sprints/ - Planificación de sprints (12 sprints)
├── roadmap/ - Roadmap general del proyecto
├── metricas/ - KPIs, burndown, presupuesto
├── correcciones/ - Issues críticos y soluciones
└── features/ - Features implementadas/pendientes
```

---

## 🎯 Guía de Navegación

### Para Product Owners
1. Ver [01-alcance-inicial/](./01-alcance-inicial/) - Alcance cotizado original
2. Ver [03-extensiones/](./03-extensiones/) - Extensiones aprobadas
3. Ver [metricas/presupuesto.md](./metricas/presupuesto.md) - Estado presupuestario

### Para Tech Leads
1. Ver [02-migracion-robustecimiento/](./02-migracion-robustecimiento/) - Deuda técnica
2. Ver [roadmap/](./roadmap/) - Timeline y dependencias
3. Ver [correcciones/](./correcciones/) - Issues P0-P3

### Para Desarrolladores
1. Buscar épica correspondiente a feature
2. Revisar historias en `historias/`
3. Ver criterios de aceptación

---

## 📊 Resumen del Proyecto

### Fases Completadas ✅

| Fase | Periodo | Presupuesto | SP | Estado |
|------|---------|-------------|----| -------|
| **Fase 1** | Mes 1 (Ago 2024) | $110,000 | 230 | ✅ 100% |
| **Fase 2** | Mes 2 (Sep 2024) | $50,000 | 80 | ✅ 100% |
| **Fase 3** | Mes 3 (Oct-Nov 2024) | $155,000 | 305 | ✅ 100% |
| **TOTAL** | **3 meses** | **$265,000** | **615 SP** | **✅ Completado** |

### Proyección Futura ⚪

| Fase | Extensiones | Presupuesto Est. | SP Est. | Estado |
|------|-------------|------------------|---------|--------|
| **Fase 4** | EXT-007 + EXT-008 | $55,000 | 90 | ⚪ Pendiente aprobación |

---

## 🔗 Interdependencias

### Alcance Inicial → Extensiones
- EAI-001 (Fundamentos) es prerrequisito para todas las extensiones
- EAI-005 (Admin Base) es base para EXT-002 (Admin Extendido)

### Migración → Todo
- EMR-001 (Migración BD) es crítico para escalabilidad
- Desbloqueó implementación de extensiones complejas

---

## 📝 Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| [roadmap/ROADMAP-GENERAL.md](./roadmap/ROADMAP-GENERAL.md) | Roadmap completo del proyecto |
| [metricas/presupuesto.md](./metricas/presupuesto.md) | Análisis presupuestario detallado |
| [correcciones/ISSUES-CRITICOS.md](./correcciones/ISSUES-CRITICOS.md) | 66+ issues documentados |
| [sprints/](./sprints/) | Planificación de 12 sprints |

---

## 📖 Convenciones

### Nomenclatura de Épicas
- **EAI-XXX:** Épicas de Alcance Inicial
- **EMR-XXX:** Épicas de Migración y Robustecimiento
- **EXT-XXX:** Épicas de Extensiones

### Nomenclatura de User Stories
- **US-XXX-YY-nombre.md** donde:
  - XXX = Número de épica origen
  - YY = Número de historia
  - nombre = Descripción corta

---

## 🔄 Historial de Reestructuración

**2025-11-02:** Reestructuración completa
- Reorganización de 11 épicas antiguas (EP001-EP011) a 12 nuevas (EAI/EMR/EXT)
- Redistribución de 189 archivos según alcance real
- Modularización de archivos >400 líneas
- Creación de nueva estructura navegable

**Ver detalles:** `/docs-analysis/.../artifacts/REESTRUCTURACION-EPICAS.md`

---

**Última actualización:** 2025-11-02
**Mantenedores:** @product-owner @tech-lead @scrum-master
**Estado:** ✅ Reestructurado - Listo para uso
