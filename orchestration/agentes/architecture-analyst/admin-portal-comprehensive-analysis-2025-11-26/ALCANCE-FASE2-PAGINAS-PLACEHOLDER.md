# ALCANCE FASE 2: PÁGINAS PLACEHOLDER DEL PORTAL ADMIN

**Fecha:** 2025-11-26
**Autor:** Architecture-Analyst
**Referencia:** REPORTE-ANALISIS-FASE1-ADMIN-PORTAL.md

---

## RESUMEN

Este documento define el alcance de las páginas que quedaron como **placeholder** en la Fase 1 del Portal Admin y deben implementarse en la **Fase 2**.

---

## PÁGINAS PARA FASE 2

### 1. AdminAdvancedPage

**Ruta:** `/admin/advanced`
**Estado actual:** Placeholder con componentes mock
**Prioridad Fase 2:** P2 (Media)

**Funcionalidades requeridas:**

| Feature | Descripción | Backend necesario |
|---------|-------------|-------------------|
| Feature Flags | Control de features por tenant/classroom | ✅ Existe parcialmente |
| A/B Testing | Configuración de experimentos | ❌ Por implementar |
| Tenant Management | Gestión multi-tenant avanzada | ⚠️ Parcial |

**Dependencias:**
- Backend: Endpoints de A/B Testing
- BD: Tablas de experimentos y resultados

**Estimación:** 40-60 SP

---

### 2. AdminSettingsPage

**Ruta:** `/admin/settings`
**Estado actual:** Placeholder con tabs vacíos
**Prioridad Fase 2:** P2 (Media)

**Funcionalidades requeridas:**

| Feature | Descripción | Backend necesario |
|---------|-------------|-------------------|
| General Settings | Configuración global del sistema | ✅ Existe |
| Security Settings | Políticas de seguridad | ⚠️ Parcial |
| Email Templates | Gestión de plantillas de email | ❌ Por implementar |
| Notification Settings | Configuración de notificaciones | ✅ Existe |

**Dependencias:**
- Backend: Endpoints de email templates
- BD: Tablas de templates

**Estimación:** 30-40 SP

---

### 3. AdminReportsPage

**Ruta:** `/admin/reports`
**Estado actual:** MVP con persistencia en memoria
**Prioridad Fase 2:** P1 (Alta)

**Funcionalidades requeridas:**

| Feature | Descripción | Backend necesario |
|---------|-------------|-------------------|
| Persistencia BD | Guardar reportes generados | ❌ Por implementar |
| Reportes Programados | Generación automática | ❌ Por implementar |
| Export Múltiple | PDF, Excel, CSV | ⚠️ CSV existe |
| Compartir Reportes | Enviar por email | ❌ Por implementar |

**Dependencias:**
- Backend: Módulo completo de reportes
- BD: Schema `reports` con tablas de configuración y resultados

**Estimación:** 60-80 SP

---

## PÁGINAS ELIMINADAS/CONSOLIDADAS

### AdminApprovalsPage (ELIMINADA)

**Razón:** Duplicado 95% de AdminContentPage
**Fecha eliminación:** 2025-11-26
**Funcionalidad:** Consolidada en AdminContentPage (tab Pendientes)

---

## RESUMEN DE ESTIMACIONES FASE 2

| Página | Prioridad | Story Points | Dependencias Críticas |
|--------|-----------|--------------|----------------------|
| AdminReportsPage | P1 | 60-80 SP | Schema BD + Backend módulo |
| AdminAdvancedPage | P2 | 40-60 SP | A/B Testing backend |
| AdminSettingsPage | P2 | 30-40 SP | Email templates |
| **TOTAL** | - | **130-180 SP** | - |

---

## RECOMENDACIONES

1. **Priorizar AdminReportsPage** - Mayor valor para usuarios admin
2. **AdminAdvancedPage** puede dividirse en sub-releases
3. **AdminSettingsPage** puede implementarse incrementalmente por tab
4. Considerar crear User Stories detalladas para cada página

---

**Documento generado como parte de:** Análisis Comprehensivo Portal Admin 2025-11-26
