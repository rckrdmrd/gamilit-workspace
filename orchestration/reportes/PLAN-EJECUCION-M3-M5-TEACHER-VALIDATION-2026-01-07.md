# PLAN DE EJECUCIÓN: CORR-M3M5-001 - Integración M3-M5 con Validación del Maestro

**Agente:** Arquitecto de Soluciones (Claude Opus 4.5)
**Tipo de tarea:** Feature / Documentación
**Prioridad:** P1
**Fecha creación:** 2026-01-07
**Relacionado con:** [EAI-007], [CORR-009], [CORR-AF-001]

---

## 🔍 VERIFICACIÓN DE CATÁLOGO

**Funcionalidades a verificar:**
| Funcionalidad | ¿Aplica? | Catálogo | Acción |
|---------------|----------|----------|--------|
| notificaciones | Sí | @CATALOG_NOTIFY | Ya implementado |
| sesiones | No | - | N/A |
| rate-limit | No | - | N/A |

**Resultado:** ✅ Catálogo verificado - Notificaciones ya implementadas

---

## 🎯 OBJETIVO

Documentar y validar la integración completa de ejercicios M3-M5 con el sistema de validación del maestro, asegurando:
- Flujo correcto: estudiante → mensaje → maestro → rewards → notificación
- Documentación completa según estándares SIMCO
- Validación de scripts de base de datos

**Criterios de Aceptación:**
- [x] 12/13 ejercicios con `requires_manual_grading = TRUE`
- [x] 12/12 componentes muestran mensaje "pendiente de revisión"
- [x] 3 documentos de flujo creados
- [x] Inventario actualizado
- [x] Base de datos validada sin errores

---

## 📋 ANÁLISIS PREVIO

### Contexto
- Los ejercicios M3-M5 requieren evaluación cualitativa del maestro
- El código ya estaba mayormente implementado
- Faltaba documentación formal y corrección de 1 componente

### Estado Actual
- Backend: ✅ 100% implementado
- Frontend: ✅ 99% implementado (1 corrección realizada)
- Database: ✅ 100% implementado
- Documentación: ⚠️ 50% → ✅ 100% (actualizada)

### Anti-Duplicación
```bash
# Verificación de documentos existentes
ls docs/90-transversal/sistema-recompensas/
# Resultado: 02-FLUJO-END-TO-END.md existe (complementario)

# Verificación de RF-M3
ls docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/
# Resultado: RF-M4-001 y RF-M5-001 existen, RF-M3-001 NO existe (crear)
```

---

## 📐 DISEÑO DE SOLUCIÓN

### Approach Seleccionado
Crear documentación nueva complementaria a la existente, corregir único gap de código.

### Componentes Creados/Modificados

**Frontend:**
- [x] `AnalisisFuentesExercise.tsx` - Agregar manejo pending_review (CORR-AF-001)

**Documentación:**
- [x] `03-FLUJO-VALIDACION-MAESTRO-M3-M5.md` - Flujo completo
- [x] `RF-M3-001-ejercicios-m3.md` - Especificaciones M3
- [x] `RESPONSES-M3-M5.md` - Página de respuestas

**Configuración:**
- [x] `DEVENV-MASTER-INVENTORY.yml` - Sección ejercicios_revision_manual

---

## 🔄 CICLOS DE EJECUCIÓN

### CICLO 1: Corrección de Código

**Duración:** 5 minutos
**Objetivo:** Corregir componente AnalisisFuentesExercise

**Tareas:**
1. [x] Leer componente actual
2. [x] Identificar líneas a modificar (243-265)
3. [x] Agregar manejo de `pending_review`
4. [x] Verificar sintaxis

**Artefactos:**
- `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx`

**Validación:**
- [x] Código compila sin errores

---

### CICLO 2: Creación de Documentación

**Duración:** 20 minutos
**Objetivo:** Crear documentación según estándares SIMCO

**Tareas:**
1. [x] Crear `03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`
2. [x] Crear `RF-M3-001-ejercicios-m3.md`
3. [x] Crear directorio `paginas/` si no existe
4. [x] Crear `RESPONSES-M3-M5.md`

**Artefactos:**
- `docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`
- `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M3-001-ejercicios-m3.md`
- `docs/03-fase-extensiones/EXT-001-portal-maestros/paginas/RESPONSES-M3-M5.md`

**Validación:**
- [x] Documentos siguen formato estándar
- [x] Referencias cruzadas correctas

---

### CICLO 3: Actualización de Inventarios

**Duración:** 5 minutos
**Objetivo:** Actualizar inventarios con nueva información

**Tareas:**
1. [x] Agregar sección `ejercicios_revision_manual` a DEVENV-MASTER-INVENTORY.yml
2. [x] Documentar excepción de Quiz TikTok

**Artefactos:**
- `orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml`

**Validación:**
- [x] YAML válido
- [x] Información completa

---

### CICLO 4: Documentación Según Estándares

**Duración:** 15 minutos
**Objetivo:** Crear documentación de análisis y plan según templates SIMCO

**Tareas:**
1. [x] Crear ANALISIS-PRE-EJECUCION según template
2. [x] Crear PLAN-EJECUCION según template
3. [x] Actualizar VALIDACION-EJECUCION

**Artefactos:**
- `orchestration/reportes/ANALISIS-PRE-EJECUCION-M3-M5-TEACHER-VALIDATION-2026-01-07.md`
- `orchestration/reportes/PLAN-EJECUCION-M3-M5-TEACHER-VALIDATION-2026-01-07.md`

---

### CICLO 5: Validación de Base de Datos

**Duración:** 10 minutos
**Objetivo:** Validar que scripts de BD funcionan correctamente

**Tareas:**
1. [x] Verificar que create-database.sh incluye cambios CORR-009
2. [x] Verificar conexión a BD existente (validación sin recreación completa)
3. [x] Verificar carga de seeds M3-M5
4. [x] Verificar triggers existen

**Artefactos:**
- Log de validación en VALIDACION-EJECUCION-M3-M5-2026-01-07.md

**Validación:**
- [x] BD validada correctamente
- [x] Seeds cargados correctamente (12/13 exercises, 12 rubrics)
- [x] Triggers funcionando (3/3 triggers de submission)

---

## 📦 DEPENDENCIAS

### Depende de
- [x] CORR-009 completado (ya incluido en create-database.sh)
- [x] Seeds de M3-M5 existentes

### Bloquea
- Ninguno (documentación y corrección menor)

### Requerimientos Externos
- PostgreSQL disponible para recreación de BD

---

## ⚠️ RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Error en recreación BD | Baja | Alto | Revisar logs detalladamente |
| Inconsistencia de seeds | Baja | Medio | Verificar con queries |
| Documentación incompleta | Baja | Bajo | Revisión cruzada |

---

## ⏱️ ESTIMACIONES

| Fase | Tiempo Estimado | Tiempo Real |
|------|-----------------|-------------|
| Corrección código | 5 min | 3 min |
| Documentación nueva | 20 min | 25 min |
| Actualización inventarios | 5 min | 5 min |
| Documentación estándares | 15 min | 15 min |
| Validación BD | 10 min | 10 min |
| **Total** | **55 min** | **58 min** |

---

## 📝 DOCUMENTACIÓN A GENERAR

### Durante Ejecución
- [x] Reportes de análisis
- [x] Documentos de flujo
- [x] Especificaciones

### Post-Ejecución
- [x] VALIDACION-EJECUCION-M3-M5-2026-01-07.md actualizado con validación de BD
- [ ] Actualizar _MAP.md de directorios afectados (opcional)
- [ ] Registrar en TRAZA-TAREAS correspondiente (opcional)

---

## ✅ CRITERIOS DE ÉXITO

### Código
- [x] AnalisisFuentesExercise corregido
- [x] Sin errores de compilación
- [x] 12/12 componentes con pending_review

### Documentación
- [x] 3 documentos nuevos creados
- [x] Siguen formato SIMCO
- [x] Referencias cruzadas correctas

### Base de Datos
- [x] create-database.sh verificado con CORR-009
- [x] Seeds M3-M5 cargados (validado)
- [x] Triggers funcionando (validado)

### Inventarios
- [x] DEVENV-MASTER-INVENTORY actualizado
- [x] Excepción Quiz TikTok documentada

---

## 📚 REFERENCIAS

### Documentación
- `orchestration/templates/TEMPLATE-ANALISIS.md`
- `orchestration/templates/TEMPLATE-PLAN.md`
- `orchestration/patrones/NOMENCLATURA-UNIFICADA.md`

### Archivos de Referencia
- `apps/database/create-database.sh`
- `docs/90-transversal/sistema-recompensas/02-FLUJO-END-TO-END.md`

---

## 🚀 APROBACIÓN PARA EJECUCIÓN

**Estado de Ciclos:**
- [x] CICLO 1: Corrección de Código - ✅ COMPLETADO
- [x] CICLO 2: Creación de Documentación - ✅ COMPLETADO
- [x] CICLO 3: Actualización de Inventarios - ✅ COMPLETADO
- [x] CICLO 4: Documentación Según Estándares - ✅ COMPLETADO
- [x] CICLO 5: Validación de Base de Datos - ✅ COMPLETADO

**Aprobado por:** Arquitecto de Soluciones
**Fecha:** 2026-01-07

---

*Documento generado según TEMPLATE-PLAN.md del sistema SIMCO*
