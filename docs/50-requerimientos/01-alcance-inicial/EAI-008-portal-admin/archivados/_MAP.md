# Archivados - EAI-008

**EPIC:** EAI-008 - Portal de Administracion
**Fecha archivo:** 2026-01-04
**Razon:** Reestructuracion a formato SCRUM estandar

---

## Contenido

### modulos-legacy/

Estructura original de documentacion organizada por modulos de funcionalidad.

```
modulos-legacy/
+-- 00-analisis-inicial/      # Analisis y planeacion inicial
|   +-- README.md
|   +-- RESUMEN-EJECUTIVO-IMPLEMENTACION.md
|   +-- REPORTE-ANALISIS-PORTAL-ADMIN.md
|   +-- PLAN-IMPLEMENTACION-INFRAESTRUCTURA-DB-DISPONIBLE.md
+-- 01-modulo-alertas/        # Modulo de Alertas
|   +-- backend/
|   +-- frontend/
+-- 02-modulo-analiticas/     # Modulo de Analiticas
|   +-- backend/
|   +-- frontend/
+-- 03-modulo-progreso/       # Modulo de Progreso
|   +-- backend/
|   +-- frontend/
+-- 04-modulo-monitoreo/      # Modulo de Monitoreo
|   +-- backend/
|   +-- frontend/
+-- 05-otros-componentes/     # Roles, Reports, Settings
+-- 99-reportes-progreso/     # Reportes finales
    +-- REPORTE-FINAL-PORTAL-ADMIN-COMPLETO-2025-11-24.md
    +-- REPORTE-ANALISIS-COMPREHENSIVO-2025-11-26.md
    +-- REPORTE-CORRECCIONES-2025-11-26.md
```

### reportes-raiz-legacy/

Reportes que estaban en la raiz de la EPIC.

```
reportes-raiz-legacy/
+-- ACTUALIZACION-INVENTARIOS-2025-11-24.md
+-- CORRECCION-REPORTE-COHERENCIA-2025-11-24.md
+-- INDEX-DOCUMENTACION-2025-11-26.md
+-- MIGRACION-DOCUMENTACION-2025-11-24.md
+-- PLAN-CORRECCIONES-COHERENCIA-2025-11-24.md
+-- REPORTE-COHERENCIA-ARQUITECTONICA-2025-11-24.md
+-- RESUMEN-COMPLETO-COHERENCIA-2025-11-24.md
```

---

## Documentos Clave

| Documento | Proposito |
|-----------|-----------|
| 00-analisis-inicial/RESUMEN-EJECUTIVO-IMPLEMENTACION.md | Vision ejecutiva |
| 00-analisis-inicial/PLAN-IMPLEMENTACION-*.md | Plan tecnico detallado |
| 99-reportes-progreso/REPORTE-FINAL-*.md | Reporte final de implementacion |
| 0X-modulo-*/backend/IMPLEMENTATION-REPORT-*.md | Especificaciones backend |
| 0X-modulo-*/frontend/IMPLEMENTATION-REPORT-*.md | Especificaciones frontend |

---

## Navegacion

- **Especificaciones Backend:** Buscar en `modulos-legacy/0X-modulo-*/backend/`
- **Especificaciones Frontend:** Buscar en `modulos-legacy/0X-modulo-*/frontend/`
- **Reportes de Progreso:** Ver `modulos-legacy/99-reportes-progreso/`
- **Analisis Inicial:** Ver `modulos-legacy/00-analisis-inicial/`

---

**Nota:** Esta documentacion se preserva para referencia historica. La nueva estructura SCRUM esta en la raiz de la EPIC.
