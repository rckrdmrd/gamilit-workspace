# Plan de Corrección de ENUMs - Base de Datos Gamilit

**Fecha:** 2025-11-07
**Fuente de verdad:** `/docs/03-desarrollo/base-de-datos/TIPOS-Y-ENUMS.md`
**Estado:** ⚠️ REQUIERE APROBACIÓN

---

## 🎯 Objetivo

Sincronizar TODOS los ENUMs del código con la **documentación oficial** como fuente de verdad única.

---

## 📊 Estado Actual vs Documentación

### Resumen
- **Documentación oficial:** 17 ENUMs completamente documentados
- **Documentación menciona:** 24 ENUMs totales
- **Código tiene:** 37 ENUMs únicos (25 en prerequisites + 12 adicionales)

---

## 🔴 CONFLICTO CRÍTICO: maya_rank vs rango_maya

### Situación Actual (CÓDIGO)
```sql
-- En 00-prerequisites.sql (INCORRECTO)
CREATE TYPE maya_rank AS ENUM (
    'Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan'
);

-- En public/enums/maya_rank.sql (INCORRECTO)
CREATE TYPE public.maya_rank AS ENUM (
    'NACOM', 'BATAB', 'HOLCATTE', 'GUERRERO', 'MERCENARIO'
);

-- En public/enums/rango_maya.sql (PARCIALMENTE CORRECTO)
CREATE TYPE public.rango_maya AS ENUM (
    'nacom', 'batab', 'holcatte', 'guerrero', 'mercenario'
);
```

### Documentación Oficial (CORRECTO)
```sql
CREATE TYPE rango_maya AS ENUM (
    'nacom',
    'batab',
    'holcatte',
    'guerrero',
    'mercenario'
);
```

### ⚠️ DISCREPANCIA DETECTADA EN DOCUMENTACIÓN

**PROBLEMA:** La documentación muestra **DOS sistemas diferentes de rangos**:

1. **En la definición del ENUM (línea 94-100):**
   - Nombre: `rango_maya`
   - Valores: 'nacom', 'batab', 'holcatte', 'guerrero', 'mercenario' (5 valores)

2. **En la tabla de descripción (línea 105-111):**
   - Menciona: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
   - Ejemplo de cálculo (línea 123-128) usa: "Rango Ajaw", "Rango Nacom", "Rango K'uk'ulkan"

**¿Cuál es el correcto?**
- ❓ ¿'nacom', 'batab', 'holcatte', 'guerrero', 'mercenario'? (5 valores)
- ❓ ¿'Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan'? (5 valores con nombres mayas históricos)

**DECISIÓN REQUERIDA DEL USUARIO**

---

## 📋 ENUMs a Corregir (Basados en Documentación Oficial)

### 1. ✅ ENUMs Correctos (No requieren cambio)

| ENUM | Valores Código | Valores Documentación | Estado |
|------|---------------|----------------------|--------|
| `gamilit_role` | 3 valores | 3 valores | ✅ Coincide |
| `achievement_category` | 7 valores | 7 valores | ✅ Coincide |
| `comodin_type` | 3 valores | 3 valores | ✅ Coincide |
| `difficulty_level` | 8 valores | 8 valores | ✅ Coincide |
| `transaction_type` | 10 valores (individual) | 10 valores | ✅ Coincide |

### 2. ❌ ENUMs con Diferencias (Requieren corrección)

#### 2.1 `user_status`
**Código (prerequisites):**
```sql
'active', 'inactive', 'suspended', 'banned', 'pending' -- 5 valores
```
**Código (public/enums/):**
```sql
'active', 'inactive', 'suspended', 'banned' -- 4 valores (FALTA 'pending')
```
**Documentación oficial:**
```sql
'active', 'inactive', 'suspended', 'banned', 'pending' -- 5 valores
```
**✅ ACCIÓN:** Usar versión de documentación (5 valores con 'pending')

---

#### 2.2 `exercise_type`
**Código (prerequisites):**
```sql
31 valores (crucigrama, linea_tiempo, sopa_letras, ... resumen_visual)
```
**Código (public/enums/):**
```sql
31 valores (mismos que prerequisites)
```
**Documentación oficial:**
```sql
27 valores (multiple_choice, multiple_selection, ... data_analysis)
```

**🚨 DISCREPANCIA:** Código tiene 31 valores, documentación tiene 27.

**Valores en código pero NO en documentación:**
- 'crucigrama'
- 'linea_tiempo'
- 'sopa_letras'
- 'mapa_conceptual'
- ... (4 valores adicionales)

**¿Son valores legacy o nuevos?**
**DECISIÓN REQUERIDA DEL USUARIO:** ¿Usar 27 de documentación o 31 de código?

---

#### 2.3 `module_status` y `content_status`
**Código (prerequisites):**
```sql
CREATE TYPE module_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');
```
**Código (public/enums/):**
```sql
CREATE TYPE module_status AS ENUM ('draft', 'published', 'archived', 'under_review');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'under_review');
```
**Documentación oficial:**
```sql
CREATE TYPE module_status AS ENUM ('draft', 'published', 'archived', 'under_review');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'under_review');
```
**✅ ACCIÓN:** Usar 'under_review' (no 'review') según documentación

---

#### 2.4 `media_type`
**Código (prerequisites):**
```sql
'image', 'video', 'audio', 'document', 'interactive' -- 5 valores
```
**Código (public/enums/):**
```sql
'image', 'video', 'audio', 'document', 'interactive', 'animation' -- 6 valores
```
**Documentación oficial:**
```sql
'image', 'video', 'audio', 'document', 'animation', '3d_model' -- 6 valores
```

**🚨 DISCREPANCIA:**
- Código tiene 'interactive'
- Documentación tiene '3d_model'

**✅ ACCIÓN PROPUESTA:** Usar documentación ('animation', '3d_model' en lugar de 'interactive')

---

#### 2.5 `processing_status`
**Código (prerequisites):**
```sql
'pending', 'processing', 'completed', 'failed' -- 4 valores
```
**Código (public/enums/):**
```sql
'pending', 'uploading', 'processing', 'ready', 'completed', 'failed', 'error', 'optimizing' -- 8 valores
```
**Documentación oficial:**
```sql
'uploading', 'processing', 'ready', 'error', 'optimizing' -- 5 valores
```

**🚨 DISCREPANCIA:** Código público tiene 8 valores, documentación 5.
- Código tiene: 'pending', 'completed', 'failed' (no en documentación)
- Documentación tiene todos excepto esos 3

**✅ ACCIÓN PROPUESTA:** Usar 5 valores de documentación

---

#### 2.6 `progress_status`
**Código (prerequisites):**
```sql
'not_started', 'in_progress', 'completed', 'mastered', 'needs_review' -- 5 valores
```
**Código (public/enums/):**
```sql
'not_started', 'in_progress', 'completed', 'mastered', 'needs_review' -- 5 valores
```
**Documentación oficial:**
```sql
'not_started', 'in_progress', 'completed', 'locked' -- 4 valores
```

**🚨 DISCREPANCIA:** Código tiene 'mastered' y 'needs_review', documentación tiene 'locked'.

**DECISIÓN REQUERIDA:** ¿Usar 4 valores de documentación o 5 de código?

---

#### 2.7 `classroom_role`
**Código (prerequisites):**
```sql
'teacher', 'student', 'assistant', 'observer' -- 4 valores
```
**Código (public/enums/):**
```sql
'teacher', 'student', 'assistant' -- 3 valores
```
**Documentación oficial:**
```sql
'teacher', 'student', 'assistant' -- 3 valores
```
**✅ ACCIÓN:** Eliminar 'observer' de prerequisites

---

#### 2.8 `friendship_status`
**Código (prerequisites):**
```sql
'pending', 'accepted', 'blocked' -- 3 valores
```
**Código (public/enums/):**
```sql
'pending', 'accepted', 'rejected', 'blocked' -- 4 valores
```
**Documentación:** No documentado explícitamente

**DECISIÓN REQUERIDA:** ¿3 o 4 valores?

---

#### 2.9 `team_role`
**Código (prerequisites):**
```sql
'leader', 'member', 'coordinator' -- 3 valores
```
**Código (public/enums/):**
```sql
'leader', 'member', 'coordinator', 'observer', 'substitute' -- 5 valores
```
**Documentación:** No documentado explícitamente

**DECISIÓN REQUERIDA:** ¿3 o 5 valores?

---

### 3. ❓ ENUMs No Documentados (Requieren decisión)

Los siguientes ENUMs existen en el código pero NO están documentados:

1. `auth_provider` - Solo en prerequisites
2. `notification_type` - En prerequisites
3. `notification_priority` - En prerequisites
4. `cognitive_level` - En prerequisites
5. `attempt_status` - En prerequisites
6. `setting_type` - En prerequisites
7. `log_level` - En prerequisites
8. `audit_action` - En prerequisites
9. `alert_status` - En prerequisites
10. `aggregation_period` - Solo en archivos individuales
11. `metric_type` - Solo en archivos individuales
12. `notification_channel` - Solo en archivos individuales
13. `social_event_type` - Solo en archivos individuales
14. `aal_level` - En auth schema
15. `code_challenge_method` - En auth schema
16. `buckettype` - En storage schema

**DECISIÓN REQUERIDA:**
- ¿Mantenerlos como están?
- ¿Eliminarlos si no están documentados?
- ¿Documentarlos?

---

## 🔧 Plan de Acción Propuesto

### Fase 1: Resolución de Discrepancias en Documentación (REQUIERE USUARIO)

**Preguntas críticas:**
1. **`rango_maya`:** ¿Cuál es el sistema correcto?
   - A) 'nacom', 'batab', 'holcatte', 'guerrero', 'mercenario'
   - B) 'Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan'

2. **`exercise_type`:** ¿27 o 31 valores?
   - A) 27 valores (documentación)
   - B) 31 valores (código actual)

3. **`progress_status`:** ¿4 o 5 valores?
   - A) 4 valores con 'locked' (documentación)
   - B) 5 valores con 'mastered', 'needs_review' (código)

4. **ENUMs no documentados:** ¿Qué hacer con ellos?
   - A) Mantenerlos (son funcionales)
   - B) Eliminar los que no se usen
   - C) Documentarlos todos

### Fase 2: Correcciones Automáticas (DESPUÉS de Fase 1)

Una vez respondidas las preguntas, ejecutar:

1. ✅ Eliminar `maya_rank` completamente
2. ✅ Mantener solo `rango_maya` (con valores decididos)
3. ✅ Actualizar `user_status` a 5 valores
4. ✅ Corregir `module_status` y `content_status` ('under_review')
5. ✅ Actualizar `media_type` según documentación
6. ✅ Actualizar `processing_status` según decisión
7. ✅ Corregir `classroom_role` (eliminar 'observer')
8. ✅ Sincronizar prerequisites con archivos individuales

### Fase 3: Validación Post-Corrección

1. ✅ Verificar que no hay conflictos
2. ✅ Verificar que tablas que usan los ENUMs siguen funcionando
3. ✅ Ejecutar Fase 1 de validación nuevamente
4. ✅ Actualizar documentación si es necesario

---

## 📝 Decisiones Pendientes

| # | Pregunta | Opciones | Decisión |
|---|----------|----------|----------|
| 1 | ¿Sistema de rangos Maya correcto? | A) nacom/batab... B) Ajaw/Nacom... | ⏳ |
| 2 | ¿Cuántos valores en exercise_type? | A) 27  B) 31 | ⏳ |
| 3 | ¿Cuántos valores en progress_status? | A) 4  B) 5 | ⏳ |
| 4 | ¿Qué hacer con ENUMs no documentados? | A) Mantener B) Eliminar C) Documentar | ⏳ |
| 5 | ¿media_type debe tener 'interactive'? | A) Sí B) No (usar 3d_model) | ⏳ |
| 6 | ¿processing_status cuántos valores? | A) 5 (doc) B) 8 (código) | ⏳ |
| 7 | ¿friendship_status cuántos valores? | A) 3 B) 4 | ⏳ |
| 8 | ¿team_role cuántos valores? | A) 3 B) 5 | ⏳ |

---

## ⚠️ Riesgos

1. **Cambiar ENUMs puede romper datos existentes** si hay valores en tablas que ya no son válidos
2. **Tablas con foreign keys** a ENUMs modificados pueden fallar
3. **Código backend** puede estar usando valores que se eliminen

**Mitigación:**
- Revisar tablas que usan cada ENUM antes de modificar
- Hacer backup de base de datos
- Probar en ambiente de desarrollo primero

---

**Creado:** 2025-11-07
**Estado:** ⏳ ESPERANDO DECISIONES DEL USUARIO
