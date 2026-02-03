# Fase 4: Backlog - Funcionalidad Futura

**Ultima actualizacion:** 2026-01-04
**Estado:** Planificacion y Diseno

---

## Documentos de Referencia

| Documento | Descripcion |
|-----------|-------------|
| [DEFINITION-OF-READY.md](./DEFINITION-OF-READY.md) | Criterios para items listos para Sprint |
| [FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md](./FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md) | Features de gamificacion pendientes |
| [TIPOS-EJERCICIOS-PENDIENTES.md](./TIPOS-EJERCICIOS-PENDIENTES.md) | Tipos de ejercicios pendientes |

---

## MODULOS 4 Y 5 - MOVIDOS A FASE 02

> **NOTA:** Los Modulos 4 y 5 fueron **completamente implementados** y su documentacion fue movida a:
> - **Documentacion:** [docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/](../02-fase-robustecimiento/EAI-007-modulos-m4-m5/)
> - **Estado:** Done (100% funcional)
> - **Fecha:** 2025-11-29

Ver [EAI-007](../02-fase-robustecimiento/EAI-007-modulos-m4-m5/README.md) para documentacion completa.

---

## 📋 CONTENIDO DE ESTA FASE

Esta fase contiene funcionalidad **diseñada pero NO implementada en el MVP**, incluyendo:

### Categorías de Backlog

| Categoría | Elementos | Razón | Estado |
|-----------|-----------|-------|--------|
| **Módulos Educativos** | Módulos 4-5 (8 ejercicios) | Requieren evaluación manual | ✅ **IMPLEMENTADO** |
| **Épicas Parciales** | EXT-007 a EXT-011 (30-50%) | Dependen de contratos/nice-to-have | ⏳ Backlog |
| **Admin Portal P2** | RBAC dinámico, Reportes globales, Importación CSV | Complejidad técnica | ⏳ Backlog |
| **Tipos de Ejercicios** | 10 mecánicas adicionales | Complejidad técnica | ⏳ Backlog |

> **Nota:** US-AE-005 y US-AE-007 fueron **implementadas** y removidas del backlog. Ver sección "Admin Portal - Estado Actualizado".

---

## ⏳ ÉPICAS PARCIALES (Fuera del MVP)

Las siguientes épicas fueron iniciadas pero **NO forman parte del MVP actual**.
La documentación detallada se mantiene en [Fase 3: Extensiones](../03-fase-extensiones/).

| Épica | Nombre | Avance | Razón Backlog | Documentación |
|-------|--------|--------|---------------|---------------|
| **EXT-007** | LTI Integration | ⏳ 40% | Depende de contratos enterprise | [📂](../03-fase-extensiones/EXT-007-lti-integration/) |
| **EXT-008** | White Label | ⏳ 30% | Depende de contratos enterprise | [📂](../03-fase-extensiones/EXT-008-white-label/) |
| **EXT-009** | Peer Challenges | ⏳ 50% | Feature nice-to-have | [📂](../03-fase-extensiones/EXT-009-peer-challenges/) |
| **EXT-010** | Parent Notifications | ⏳ 35% | Feature nice-to-have | [📂](../03-fase-extensiones/EXT-010-parent-notifications/) |
| **EXT-011** | Parent Portal | ⏳ 35% | Feature nice-to-have | [📂](../03-fase-extensiones/EXT-011-parent-portal/) |

### Requisitos para Reactivación

- **EXT-007, EXT-008:** Contrato enterprise firmado
- **EXT-009, EXT-010, EXT-011:** Decisión de producto post-MVP

---

## ✅ MÓDULOS IMPLEMENTADOS

### Módulo 4: Lectura Digital y Multimodal (5 ejercicios)

**Estado:** ✅ **IMPLEMENTADO**
**Evaluación:** Revisión manual por docentes con rúbricas

| Ejercicio | exercise_type | Estado |
|-----------|---------------|--------|
| 4.1 Verificador de Fake News | `verificador_fake_news` | ✅ Completo |
| 4.2 Infografía Interactiva | `infografia_interactiva` | ✅ Completo |
| 4.3 Quiz Estilo TikTok | `quiz_tiktok` | ✅ Completo |
| 4.4 Navegación Hipertextual | `navegacion_hipertextual` | ✅ Completo |
| 4.5 Análisis de Memes | `analisis_memes` | ✅ Completo |

**Seeds:** `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`

---

### Módulo 5: Producción y Expresión Lectora (3 ejercicios)

**Estado:** ✅ **IMPLEMENTADO**
**Evaluación:** Revisión manual por docentes con rúbricas detalladas

| Ejercicio | exercise_type | Estado |
|-----------|---------------|--------|
| 5.1 Diario Interactivo de Marie | `diario_multimedia` | ✅ Completo |
| 5.2 Resumen Visual (Cómic Digital) | `comic_digital` | ✅ Completo |
| 5.3 Cápsula del Tiempo (Video Carta) | `video_carta` | ✅ Completo |

**Seeds:** `apps/database/seeds/dev/educational_content/06-exercises-module5.sql`

---

## Resumen de Implementación Módulos 4-5

### Decisiones Arquitectónicas
- **Almacenamiento multimedia:** Sistema de archivos local (`apps/backend/uploads/`)
- **Evaluación:** Revisión manual por docentes con rúbricas
- **Validación:** Estructura JSONB validada en backend y SQL

### Tareas Completadas
1. ✅ Seeds definidos y cargados en BD principal
2. ✅ Ejercicios activados (`is_active = true`)
3. ✅ Tabla `manual_reviews` creada
4. ✅ Tabla `media_attachments` creada
5. ✅ Backend: ManualReviewService, MediaStorageService implementados
6. ✅ Backend: Validadores de estructura en ExercisesService (+65 líneas)
7. ✅ Database: Función `validate_module4_module5_submission()` creada
8. ✅ Frontend: 19 componentes M4 + 3 componentes M5 implementados
9. ✅ Frontend: Exports completos en barrel files

---

## 🎓 MÓDULOS EN BACKLOG (ANTERIORMENTE)

---

## 🔧 IMPLEMENTACIÓN ACTUAL

### En Base de Datos

✅ **Tipos definidos** en ENUM `exercise_type`
- Ubicación: `apps/database/ddl/00-prerequisites.sql`
- Estado: Activos y funcionales

✅ **Seeds cargados** en directorio principal
- Ubicación DEV: `apps/database/seeds/dev/educational_content/`
- Archivos: `05-exercises-module4.sql`, `06-exercises-module5.sql`
- Estado: `is_active = true` para los 8 ejercicios

✅ **Validadores SQL:** Implementados
- Función: `validate_module4_module5_submission(exercise_type, submission)`
- Ubicación: `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`
- Comportamiento: Valida estructura JSONB, siempre retorna `requires_manual_review = true`

---

## 📅 ROADMAP DE IMPLEMENTACIÓN

### Fase P1: Validadores Parciales ✅ COMPLETADA

**Objetivo:** Validar estructura y completitud básica

**Implementado:**
- ✅ Validar formato JSONB correcto
- ✅ Validar campos requeridos presentes
- ✅ Validar estructura por tipo de ejercicio

**Funciones implementadas:**
- `validate_module4_module5_submission()` - Valida estructura completa
- `ExercisesService.validateContentByExerciseType()` - Validación backend

---

### Fase P2: Sistema de Revisión Manual ✅ COMPLETADA

**Objetivo:** Permitir evaluación por profesores

**Implementado:**
- ✅ Tabla `progress_tracking.manual_reviews`
- ✅ Tabla `educational_content.media_attachments`
- ✅ Backend: ManualReviewService, MediaStorageService
- ✅ Frontend: Panel de revisión para docentes (`apps/frontend/src/apps/teacher/pages/ReviewPanel/`)
- ✅ Sistema de rúbricas en seeds de ejercicios

---

### Fase P3: Integración con IA (Largo Plazo)

**Objetivo:** Evaluación automática con modelos multimodales

**Tecnologías requeridas:**
- Vision Transformers (análisis de imágenes)
- Whisper/Speech-to-Text (análisis de audio)
- GPT-4V o Claude 3 (análisis multimodal)
- RAG para fact-checking (verificación de fuentes)

**Validadores IA:**
- `ai_validate_infografia()` - Analiza calidad de infografías
- `ai_validate_fake_news()` - Verifica autenticidad de fuentes
- `ai_validate_creative_production()` - Evalúa producción creativa

**Tiempo estimado:** 3-6 meses (requiere infraestructura ML)

---

## ✅ ADMIN PORTAL - Estado Actualizado

> **Actualización 2025-11-29:** Las user stories US-AE-005 y US-AE-007 fueron **implementadas** y ya no están en backlog.

### ✅ Implementadas (Antes en Backlog)

| User Story | Descripción | Estado |
|-----------|-------------|--------|
| **US-AE-005** | Parametrización de Gamificación | ✅ Implementado (Capítulo 7 del Manual Admin) |
| **US-AE-007** | Asignación de Grupos a Maestros | ✅ Implementado (Capítulo 8 del Manual Admin) |

### ⏳ Admin Portal P2 (Pendiente)

Las siguientes funcionalidades permanecen fuera del alcance MVP:

| Funcionalidad | Descripción | Razón Backlog |
|--------------|-------------|---------------|
| **Gestión masiva usuarios** | Importación CSV de usuarios | Complejidad de validación |
| **RBAC dinámico** | Roles personalizables | Complejidad de permisos |
| **Reportes globales** | Dashboard de métricas globales | Priorización |

**Alcance MVP Admin Portal:** 9 páginas funcionales (P0+P1 completo incluyendo US-AE-005 y US-AE-007)

---

## 📖 DOCUMENTACIÓN DISPONIBLE

### Documentos Existentes
- [FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md](./FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md) - Features de gamificación pendientes
- [TIPOS-EJERCICIOS-PENDIENTES.md](./TIPOS-EJERCICIOS-PENDIENTES.md) - Tipos de ejercicios pendientes

### Documentos Pendientes de Crear
> **Nota:** Los siguientes documentos están planificados pero aún no han sido creados:

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| `modulo-4-lectura-digital/` | Especificaciones técnicas Módulo 4 | ⏳ Pendiente |
| `modulo-5-produccion-lectora/` | Especificaciones técnicas Módulo 5 | ⏳ Pendiente |
| `JUSTIFICACION-BACKLOG.md` | Razones detalladas del backlog | ⏳ Pendiente |
| `ANALISIS-VIABILIDAD.md` | Análisis de viabilidad técnica | ⏳ Pendiente |

---

## ⚠️ IMPORTANTE

**Módulos 4-5 ahora están ACTIVOS:**
- Seeds cargados en directorio principal (no en `_backlog/`)
- 8 ejercicios con `is_active = true`
- Requieren revisión manual por docentes
- Validación de estructura implementada en backend y SQL

**Para desactivar temporalmente:**
```sql
UPDATE educational_content.exercises
SET is_active = false
WHERE module_id IN (
  SELECT id FROM educational_content.modules
  WHERE module_code IN ('MOD-04-DIGITAL', 'MOD-05-PRODUCCION')
);
```

---

## 🎯 Navegación

**⬅️ Anterior:** [Fase 3: Extensiones](../03-fase-extensiones/)
**⬆️ Inicio:** [Documentación Principal](../README.md)

---

**Última revisión:** 2025-11-29
**Responsable:** Architecture-Analyst
**Actualizado:** Módulos 4-5 completamente implementados - Frontend, Backend, Database, Validadores
