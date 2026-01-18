# 📋 PLAN DE REORGANIZACIÓN DE DOCUMENTACIÓN

**Fecha:** 2025-11-29
**Versión:** 1.0
**Estado:** ✅ COMPLETADO (Validado 2025-11-29)
**Responsable:** Architecture-Analyst

---

## 🎯 OBJETIVO

Reorganizar y sintetizar la documentación de `/docs/` para reflejar los alcances reales del MVP:
- **Módulos educativos:** Solo 1-3 en alcance, 4-5 al backlog
- **Portal Student:** Funcionalidad core completa
- **Portal Teacher:** 5-6 páginas funcionales
- **Portal Admin:** 7 páginas funcionales (P0+P1)
- **Extensiones parciales (EXT-007 a EXT-011):** Mover a backlog

---

## 📊 ESTADO ACTUAL vs ESTADO OBJETIVO

### Estructura Actual
```
docs/
├── 00-vision-general/          # ✅ OK - Referencia
├── 01-fase-alcance-inicial/    # ✅ OK - MVP Core
├── 02-fase-robustecimiento/    # ✅ OK - MVP Core
├── 03-fase-extensiones/        # ⚠️ PROBLEMA: Mezcla MVP + Backlog
├── 04-fase-backlog/            # ⚠️ INCOMPLETO: Faltan referencias
├── 90-transversal/             # ✅ OK - Referencia
├── 95-guias-desarrollo/        # ✅ OK - Referencia
├── 96-quick-reference/         # ✅ OK - Referencia
├── 97-adr/                     # ✅ OK - Referencia
├── 98-standards/               # ✅ OK - Referencia
├── student-portal/             # ✅ OK - MVP Core
├── database/                   # ✅ OK - Referencia
├── sistema-recompensas/        # ✅ OK - MVP Core
└── README.md                   # ⚠️ DESACTUALIZADO
```

### Estructura Objetivo
```
docs/
├── 00-vision-general/          # Sin cambios
├── 01-fase-alcance-inicial/    # Sin cambios (MVP Core)
├── 02-fase-robustecimiento/    # Sin cambios (MVP Core)
├── 03-fase-extensiones/        # ACTUALIZAR: Solo EXT-001 a EXT-006
├── 04-fase-backlog/            # AMPLIAR: EXT-007 a EXT-011, Módulos 4-5
├── 90-transversal/             # Sin cambios
├── 95-guias-desarrollo/        # Sin cambios
├── 96-quick-reference/         # Sin cambios
├── 97-adr/                     # Sin cambios
├── 98-standards/               # Sin cambios
├── student-portal/             # Sin cambios
├── database/                   # Sin cambios
├── sistema-recompensas/        # Sin cambios
└── README.md                   # ACTUALIZAR: Reflejar alcances reales
```

---

## 📝 TAREAS DE REORGANIZACIÓN

### GRUPO 1: Actualización de README Principal
**Prioridad:** P0 - Crítica
**Esfuerzo:** 30 min

| # | Tarea | Archivo | Acción |
|---|-------|---------|--------|
| 1.1 | Actualizar README principal | `docs/README.md` | Reflejar alcances reales del MVP |
| 1.2 | Agregar sección Fase 4 Backlog | `docs/README.md` | Incluir navegación a backlog |
| 1.3 | Clarificar épicas MVP vs Backlog | `docs/README.md` | Separar EXT-001-006 de EXT-007-011 |

---

### GRUPO 2: Reorganización de Fase 3 (Extensiones)
**Prioridad:** P0 - Crítica
**Esfuerzo:** 45 min

| # | Tarea | Archivo | Acción |
|---|-------|---------|--------|
| 2.1 | Actualizar README Fase 3 | `docs/03-fase-extensiones/README.md` | Clarificar que EXT-007 a EXT-011 son backlog |
| 2.2 | Agregar nota en EXT-007 | `docs/03-fase-extensiones/EXT-007-lti-integration/README.md` | Marcar como BACKLOG |
| 2.3 | Agregar nota en EXT-008 | `docs/03-fase-extensiones/EXT-008-white-label/README.md` | Marcar como BACKLOG |
| 2.4 | Agregar nota en EXT-009 | `docs/03-fase-extensiones/EXT-009-peer-challenges/README.md` | Marcar como BACKLOG |
| 2.5 | Agregar nota en EXT-010 | `docs/03-fase-extensiones/EXT-010-parent-notifications/README.md` | Marcar como BACKLOG |
| 2.6 | Agregar nota en EXT-011 | `docs/03-fase-extensiones/EXT-011-parent-portal/_MAP.md` | Marcar como BACKLOG |

---

### GRUPO 3: Ampliación de Fase 4 (Backlog)
**Prioridad:** P0 - Crítica
**Esfuerzo:** 1 hora

| # | Tarea | Archivo | Acción |
|---|-------|---------|--------|
| 3.1 | Actualizar README Backlog | `docs/04-fase-backlog/README.md` | Incluir sección de épicas parciales |
| 3.2 | Crear sección Épicas Backlog | `docs/04-fase-backlog/EPICAS-BACKLOG.md` | Documentar EXT-007 a EXT-011 |
| 3.3 | Consolidar Módulo 4 | `docs/04-fase-backlog/` | Verificar documentación completa |
| 3.4 | Consolidar Módulo 5 | `docs/04-fase-backlog/` | Verificar documentación completa |

---

### GRUPO 4: Actualización de Alcances en Visión General
**Prioridad:** P1 - Alta
**Esfuerzo:** 30 min

| # | Tarea | Archivo | Acción |
|---|-------|---------|--------|
| 4.1 | Actualizar VISION.md | `docs/00-vision-general/VISION.md` | Clarificar alcance MVP M1-M3 |
| 4.2 | Agregar nota en guías M4-M5 | `docs/00-vision-general/` | Marcar como backlog si existen |

---

### GRUPO 5: Limpieza de Documentación Transversal
**Prioridad:** P2 - Media
**Esfuerzo:** 30 min

| # | Tarea | Archivo | Acción |
|---|-------|---------|--------|
| 5.1 | Revisar archivos históricos | `docs/90-transversal/archivos-historicos/` | Verificar que están archivados correctamente |
| 5.2 | Actualizar roadmap | `docs/90-transversal/roadmap/` | Reflejar estado actual del backlog |

---

## 🎯 ALCANCE MVP DEFINIDO (POST-REORGANIZACIÓN)

### ✅ EN ALCANCE MVP

**Módulos Educativos:**
- Módulo 1: Comprensión Literal (5 ejercicios) ✅
- Módulo 2: Comprensión Inferencial (5 ejercicios) ✅
- Módulo 3: Lectura Crítica (5 ejercicios) ✅

**Portales:**
- Student Portal: 10 páginas funcionales ✅
- Teacher Portal: 10 páginas funcionales ✅ (US-PM-000 a US-PM-006)
- Admin Portal: 7 páginas funcionales ✅ (P0+P1: AE-000 a AE-008)

**Épicas de Extensiones:**
- EXT-001: Portal Maestros ✅ 100%
- EXT-002: Admin Extendido ✅ 100%
- EXT-003: Notificaciones ✅ 100%
- EXT-004: Perfiles Avanzados ✅ 100%
- EXT-005: Reportes ✅ 100%
- EXT-006: Gestión Contenido ✅ 100%

**Sistemas Core:**
- Sistema de Recompensas v2.3.0 ✅
- Gamificación (Rangos Maya, ML Coins, Achievements) ✅
- Base de Datos Modular (14 schemas) ✅

---

### ⏳ EN BACKLOG (FUERA DEL MVP)

**Módulos Educativos:**
- Módulo 4: Alfabetización Digital (5 ejercicios) ⏳
- Módulo 5: Producción y Expresión (3 ejercicios) ⏳

**Épicas de Extensiones:**
- EXT-007: LTI Integration (40%) ⏳
- EXT-008: White Label (30%) ⏳
- EXT-009: Peer Challenges (50%) ⏳
- EXT-010: Parent Notifications (35%) ⏳
- EXT-011: Parent Portal (35%) ⏳

**Admin Portal (P2):**
- US-AE-005: Parametrización Gamificación ⏳
- US-AE-007: Asignación de Grupos a Maestros ⏳

**Tipos de Ejercicios Pendientes:**
- 10 tipos de ejercicios adicionales ⏳

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Antes | Después | Objetivo |
|---------|-------|---------|----------|
| Documentos actualizados | 0 | 15+ | 15+ |
| Claridad alcance MVP | ⚠️ Confuso | ✅ Claro | Claro |
| Navegación a backlog | ❌ Incompleta | ✅ Completa | Completa |
| Épicas correctamente clasificadas | 11/16 | 16/16 | 16/16 |

---

## 🔄 ORDEN DE EJECUCIÓN

```
GRUPO 1 (README Principal)
    ↓
GRUPO 2 (Fase 3 - Extensiones)  ← Paralelo con GRUPO 3
    ↓                              ↓
GRUPO 3 (Fase 4 - Backlog)      ← Paralelo con GRUPO 2
    ↓
GRUPO 4 (Visión General)
    ↓
GRUPO 5 (Transversal)
```

**Tiempo Total Estimado:** 3-4 horas

---

## ✅ CRITERIOS DE ACEPTACIÓN

1. ✅ README principal refleja alcances reales del MVP
2. ✅ Fase 3 claramente documenta qué épicas son MVP vs Backlog
3. ✅ Fase 4 incluye todas las épicas parciales y módulos pendientes
4. ✅ Navegación clara desde cualquier punto de la documentación
5. ✅ Módulos 4-5 claramente marcados como backlog
6. ✅ EXT-007 a EXT-011 claramente marcados como backlog
7. ✅ No hay inconsistencias entre documentos

---

## 📎 REFERENCIAS

- Análisis de exploración: 10 agentes paralelos
- Documentos analizados: 400+ archivos
- Líneas de documentación revisadas: 50,000+

---

**Documento generado por:** Architecture-Analyst
**Fecha de creación:** 2025-11-29
**Próxima revisión:** Post-ejecución
