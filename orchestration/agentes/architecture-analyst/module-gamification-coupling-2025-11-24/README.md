# Análisis: Acoplamiento Módulos-Gamificación

**Fecha:** 2025-11-24
**Architecture-Analyst:** IA Assistant
**Problema:** Correcciones en módulos causan errores recurrentes en gamificación

---

## 📁 Documentos en este Análisis

### 1. 01-ANALISIS-ACOPLAMIENTO-CRITICO.md
**Tamaño:** ~18K líneas
**Contenido:**
- Identificación de 9 puntos de acoplamiento (3 críticos, 4 altos, 2 medios)
- Análisis detallado de cada problema con código fuente
- Evidencia de ocurrencias recientes (archivos backup 23-24 Nov)
- 6 banderas rojas arquitectónicas identificadas
- Impacto estimado por tipo de corrección

**Leer si necesitas:** Entender QUÉ está mal y POR QUÉ pasa

---

### 2. 02-PLAN-CORRECCION-ARQUITECTONICA.md
**Tamaño:** ~12K líneas
**Contenido:**
- Plan de corrección en 4 fases (P0, P1, P2, P3)
- Cambios específicos con código SQL/TypeScript
- Cronograma de implementación (6 semanas)
- Criterios de éxito y mitigación de riesgos
- Documentación requerida

**Leer si necesitas:** Saber CÓMO corregirlo paso a paso

---

### 3. 03-SCRIPT-VALIDACION-INTEGRIDAD.sql
**Tamaño:** ~300 líneas SQL
**Contenido:**
- 11 secciones de validación
- Detecta exercise_attempts huérfanos
- Detecta submissions huérfanos
- Detecta inconsistencias en user_stats
- Identifica módulos con status inconsistente
- Queries de limpieza (comentadas)

**Ejecutar si necesitas:** Diagnosticar el ESTADO ACTUAL de la BD

---

### 4. README.md (este archivo)
Guía rápida de navegación

---

## 🚀 INICIO RÁPIDO

### Paso 1: Validar Estado Actual

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Conectar a la BD
export DATABASE_URL="postgresql://gamilit_user:3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q@localhost:5432/gamilit_platform"

# Ejecutar script de validación
PGPASSWORD='3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q' psql \
  -h localhost \
  -U gamilit_user \
  -d gamilit_platform \
  -f orchestration/agentes/architecture-analyst/module-gamification-coupling-2025-11-24/03-SCRIPT-VALIDACION-INTEGRIDAD.sql
```

**Duración estimada:** 30-60 segundos

**Salida esperada:** Resumen de integridad referencial

---

### Paso 2: Revisar Problemas Críticos

Leer secciones específicas según resultado:

| Si el script reporta... | Leer en 01-ANALISIS... | Severidad |
|------------------------|------------------------|-----------|
| exercise_attempts huérfanos > 0 | Problema #1 | 🔴 CRÍTICA |
| comodin_usage_tracking huérfanos > 0 | Problema #2 | 🔴 CRÍTICA |
| user_stats inconsistentes | Problema #3 + #5 | 🔴 CRÍTICA |
| Módulos status != is_published | Problema #4 + Red Flag #3 | 🟠 ALTA |
| Ejercicios inactivos en módulos publicados | Problema #4 | 🟠 ALTA |

---

### Paso 3: Decidir Acción

**Opción A: Corrección Inmediata (Fase 1 - P0)**
- Duración: 3 días
- Impacto: Evita pérdida de datos futura
- Leer: `02-PLAN-CORRECCION-ARQUITECTONICA.md` → Sección "FASE 1"

**Opción B: Corrección Completa (Fases 1+2)**
- Duración: 2 semanas
- Impacto: Resuelve problema completamente
- Leer: `02-PLAN-CORRECCION-ARQUITECTONICA.md` → Secciones "FASE 1" y "FASE 2"

**Opción C: Solo Limpieza de Datos**
- Duración: 1 hora
- Impacto: Temporal (problema reaparecerá)
- Ver: `03-SCRIPT-VALIDACION-INTEGRIDAD.sql` → Sección 11 (queries de limpieza)

---

## 📊 RESUMEN DE PROBLEMAS

### 🔴 Críticos (3)

1. **CASCADE DELETE** borra progreso de usuarios cuando ejercicios se modifican
2. **Comodin tracking** sin FK permite IDs inválidos
3. **Trigger** usa valores hardcodeados en lugar de consultar ejercicio real

### 🟠 Altos (4)

4. **Status de módulos** inconsistente rompe cálculo de progreso
5. **Servicios backend** no validan existencia de exercise_id
6. **Exercise submissions** con CASCADE DELETE (mismo problema #1)
7. **Module progress** con CASCADE DELETE (mismo problema #1)

### 🟡 Medios (2)

8. **Cache** no se invalida cuando ejercicios cambian
9. **Misiones** con referencias implícitas pueden fallar

---

## 🎯 CAUSA RAÍZ

**NO es un problema de datos corruptos.**

**ES un problema de DISEÑO ARQUITECTÓNICO:**

- ❌ Acoplamiento directo sin abstracción
- ❌ CASCADE DELETE agresivo
- ❌ Sin validación de existencia
- ❌ Sin estrategia de migración de contenido
- ❌ Triggers con lógica hardcodeada

---

## 💡 SOLUCIÓN PROPUESTA

### Enfoque Estratégico

1. **Soft Delete** en lugar de CASCADE DELETE
2. **Foreign Keys** en TODAS las referencias
3. **Validation Layer** en servicios backend
4. **Content Versioning** para rastrear cambios
5. **Cache Invalidation** hooks en operaciones críticas

### Impacto Esperado

**Después de Fase 1 (P0):**
- ✅ 0 pérdida de progreso en correcciones futuras
- ✅ Referencias válidas garantizadas por FK
- ✅ Rewards correctos en gamificación

**Después de Fase 2 (P1):**
- ✅ 0 errores de "exercise not found"
- ✅ Progreso de módulos calculado correctamente
- ✅ Cache siempre actualizado

---

## 📞 PRÓXIMOS PASOS

### Para Product Owner
1. Leer: `01-ANALISIS-ACOPLAMIENTO-CRITICO.md` → Sección "CONCLUSIÓN"
2. Leer: `02-PLAN-CORRECCION-ARQUITECTONICA.md` → Sección "RESUMEN"
3. Decidir: ¿Aprobar Fase 1 (3 días) o Fase 1+2 (2 semanas)?

### Para Tech Lead
1. Ejecutar: `03-SCRIPT-VALIDACION-INTEGRIDAD.sql`
2. Revisar: Problemas #1, #2, #3 (críticos)
3. Estimar: Esfuerzo real vs. estimado (3 días Fase 1)

### Para Database Team
1. Ejecutar script de validación
2. Analizar: Cantidad de registros huérfanos
3. Preparar: Plan de limpieza de datos existentes

### Para Backend Team
1. Leer: `02-PLAN-CORRECCION-ARQUITECTONICA.md` → Fase 2.1
2. Revisar: ExerciseAttemptService, ExerciseSubmissionService
3. Estimar: Complejidad de agregar validación

---

## 📚 DOCUMENTACIÓN RELACIONADA

**En este proyecto:**
- `orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md` - Política de carga limpia
- `docs/97-adr/ADR-012-validacion-alternativas-ejercicio-completar-espacios.md` - Ejemplo de ADR

**A crear:**
- `docs/97-adr/ADR-013-desacoplamiento-modulos-gamificacion.md` - ADR de esta corrección
- `docs/guides/GUIA-MODIFICACION-EJERCICIOS-SEGURA.md` - Guía para PO/Contenido

---

## ⚠️ ADVERTENCIAS

### NO Ejecutar Sin Revisar

Los queries de limpieza en `03-SCRIPT-VALIDACION-INTEGRIDAD.sql` Sección 11 están **COMENTADOS** por seguridad.

**NUNCA ejecutar en producción sin:**
1. Backup completo de la BD
2. Validación en ambiente DEV
3. Aprobación de Tech Lead

### Archivos Críticos

**NO modificar directamente estos archivos sin leer el plan:**
- `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`
- `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`
- `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`

---

**Análisis generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Estado:** ✅ **COMPLETO - PENDIENTE DE APROBACIÓN**
