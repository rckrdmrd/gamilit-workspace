# Validación Cruzada de ENUMs: Database vs Backend
**Subagente:** SA-VAL-006  
**Timestamp:** 2025-11-03T00:04:37.461429Z

---

## Resumen Ejecutivo

Se realizó un análisis exhaustivo de los **28 ENUMs de Database** contra los **46 ENUMs de Backend** para detectar discrepancias y desincronizaciones.

### Estadísticas Generales
- **Total de ENUMs analizados:** 28 (todos los del Database)
- **Total de discrepancias encontradas:** 53
- **Matching perfecto:** 0
- **Diferencias detectadas:** 53/28 (189% de problemas)

### Desglose de Problemas
| Tipo | Cantidad | Severidad |
|------|----------|-----------|
| Matching perfecto | 0 | ✓ |
| Diferencias de case | 17 | BAJA |
| Valores desincronizados | 6 | ALTA |
| Faltantes en Backend | 5 | CRÍTICA |
| Faltantes en Database | 25 | MEDIA |

### Severidad Total
- **Críticas:** 5 (9.4%)
- **Altas:** 6 (11.3%)
- **Medias:** 25 (47.2%)
- **Bajas:** 17 (32.1%)

---

## Top 3 ENUMs Más Problemáticos

### 1. `auth.aal_level` - CRÍTICA
**Problema:** Missing in Backend  
**Impacto:** El ENUM existe en Database pero NO en Backend  

```
DB Valores: ['aal1', 'aal2', 'aal3']
Backend: NO EXISTE
```

**Recomendación:** Crear `AalLevelEnum` en Backend inmediatamente.

---

### 2. `auth.code_challenge_method` - CRÍTICA
**Problema:** Missing in Backend  
**Impacto:** El ENUM existe en Database pero NO en Backend  

```
DB Valores: ['s256', 'plain']
Backend: NO EXISTE
```

**Recomendación:** Crear `CodeChallengeMethodEnum` en Backend inmediatamente.

---

### 3. `public.gamilit_role` - CRÍTICA
**Problema:** Missing in Backend  
**Impacto:** El ENUM existe en Database pero NO en Backend  

```
DB Valores: ['student', 'admin_teacher', 'super_admin']
Backend: NO EXISTE
```

**Recomendación:** Crear `GamilitRoleEnum` en Backend inmediatamente.

---

## Análisis por Categoría de Problemas

### A. Case Mismatch (17 ENUMs) - Severidad BAJA
Estos ENUMs existen en ambas capas con los mismos valores pero diferente capitalización.

**Ejemplos:**
- `public.achievement_category`: DB usa lowercase, Backend usa UPPERCASE
- `public.transaction_type`: DB usa lowercase con underscore, Backend usa UPPERCASE
- `public.user_status`: DB usa lowercase, Backend usa UPPERCASE

**Solución:** Normalizar a un estándar único (recomendado: UPPERCASE en Backend, lowercase en DB).

### B. Valores Desincronizados (6 ENUMs) - Severidad ALTA
Estos ENUMs existen en ambas capas pero con diferentes valores.

**Caso crítico: `gamification_system.maya_rank`**
```
DB Valores: [Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan]
Backend: [AJAW, NACOM, AH_KIN, HALACH_UINIC, KUKUKULKAN]
Problema: Spelling inconsistencies (K'uk'ulkan vs KUKUKULKAN)
```

**Otros casos:**
- `public.exercise_type`: 4 valores en DB no están en Backend, 6 en Backend no están en DB
- `public.difficulty_level`: Backend tiene 5 valores extra (VERY_EASY, EASY, MEDIUM, HARD, VERY_HARD)
- `public.notification_type`: Desalineación completa de valores

### C. Faltantes en Backend (5 ENUMs) - Severidad CRÍTICA
ENUMs que existen en Database pero NO tienen equivalente en Backend.

1. `auth.aal_level` - Niveles de autenticación
2. `auth.code_challenge_method` - Métodos de desafío PKCE
3. `public.gamilit_role` - Roles del sistema Gamilit
4. `public.rango_maya` - Sinónimo/duplicado de maya_rank (inconsistencia)
5. `storage.buckettype` - Tipos de almacenamiento

### D. Faltantes en Database (25 ENUMs) - Severidad MEDIA
ENUMs que existen en Backend pero NO tienen equivalente en Database.

**Análisis de impacto:**
- **Críticos para sincronizar:** ErrorCode, Permission (usados en lógica de negocio)
- **De validación:** AuthProviderEnum, DeviceTypeEnum, LanguageEnum
- **De estado:** MissionStatus, TeamChallengeStatus, ClassroomMemberStatus
- **Duplicados potenciales:** MayaRankEnum (duplicado de maya_rank)

---

## Recomendaciones Priorizadas

### Prioridad 1: Crítica (Hacer INMEDIATAMENTE)
1. **Crear 5 ENUMs en Backend:**
   - `AalLevelEnum` (auth.aal_level)
   - `CodeChallengeMethodEnum` (auth.code_challenge_method)
   - `GamilitRoleEnum` (public.gamilit_role)
   - `RangoMayaEnum` (public.rango_maya)
   - `BuckettypeEnum` (storage.buckettype)

2. **Resolver duplicados:**
   - Investigar `maya_rank` vs `rango_maya` en Database
   - Investigar `MayaRank` vs `MayaRankEnum` en Backend

### Prioridad 2: Alta (Hacer en próximo sprint)
1. **Sincronizar valores en 6 ENUMs:**
   - `gamification_system.maya_rank` (spelling de K'uk'ulkan)
   - `public.exercise_type` (reconciliar valores)
   - `public.difficulty_level` (validar si VERY_EASY, EASY, MEDIUM, HARD, VERY_HARD son válidos)
   - `public.notification_type` (alinear con DB)
   - `public.content_type` (revisar match con ContentTypeEnum)

2. **Normalizar case en 17 ENUMs:**
   - Adoptar estándar: UPPERCASE en Backend para enums
   - Mantener lowercase en Database
   - Documentar en value_mapping

### Prioridad 3: Media (Revisar en próximo análisis)
1. **Evaluar 25 ENUMs que están solo en Backend:**
   - Determinar si deben agregarse a Database
   - Algunos (ErrorCode, Permission) son de aplicación, no de negocio
   - Otros (MissionStatus, TeamStatus) deberían estar en Database

---

## Matriz de Problemas por ENUM

### ENUMs con CASE MISMATCH (17)
```
achievement_category       → AchievementCategoryEnum      (7 valores)
achievement_type           → AchievementTypeEnum          (4 valores)
aggregation_period         → AggregationPeriodEnum        (5 valores)
alert_severity             → AlertSeverityEnum            (4 valores)
attempt_result             → AttemptResultEnum            (4 valores)
classroom_role             → ClassroomRoleEnum            (3 valores)
comodin_type               → ComodinTypeEnum              (3 valores)
content_status             → ContentStatusEnum            (4 valores)
media_type                 → MediaTypeEnum                (6 valores)
metric_type                → MetricTypeEnum               (7 valores)
module_status              → ModuleStatusEnum             (4 valores)
notification_channel       → NotificationChannelEnum      (4 valores)
processing_status          → ProcessingStatusEnum         (5 valores)
progress_status            → ProgressStatusEnum           (5 valores)
social_event_type          → SocialEventTypeEnum          (5 valores)
transaction_type           → TransactionTypeEnum          (10 valores)
user_status                → UserStatusEnum               (4 valores)
```

### ENUMs con VALUES MISMATCH (6)
```
gamification_system.maya_rank  → MayaRank                (5→5, spelling issues)
public.content_type            → ContentStatusEnum       (WRONG MATCH - values don't align)
public.difficulty_level        → DifficultyLevelEnum     (3→8, extras)
public.exercise_type           → ExerciseTypeEnum        (27→31, partial)
public.notification_type       → NotificationType        (8→6, different values)
public.maya_rank               → MayaRankEnum            (5→5, different values)
```

### ENUMs CRÍTICOS FALTANTES EN BACKEND (5)
```
auth.aal_level
auth.code_challenge_method
public.gamilit_role
public.rango_maya
storage.buckettype
```

---

## Plan de Acción

### Fase 1: Resolución de Críticos (Sprint 1)
**Tiempo estimado:** 3-4 días

1. Crear los 5 ENUMs faltantes en Backend
2. Resolver duplicados (maya_rank, rango_maya)
3. Validar que los valores sean correctos

### Fase 2: Sincronización de Valores (Sprint 1-2)
**Tiempo estimado:** 5-7 días

1. Arreglar spelling en `maya_rank` (K'uk'ulkan)
2. Reconciliar `exercise_type` (27 en DB vs 31 en Backend)
3. Validar `difficulty_level` (¿son válidos los extras?)
4. Alinear `notification_type`
5. Revisar match incorrecto en `content_type`

### Fase 3: Normalización de Case (Sprint 2)
**Tiempo estimado:** 2-3 días

1. Documentar estándar: UPPERCASE en Backend
2. Crear utility para conversión DB ↔ Backend
3. Aplicar en 17 ENUMs

### Fase 4: Auditoría de Backend (Sprint 2-3)
**Tiempo estimado:** 3-4 días

1. Revisar los 25 ENUMs que están solo en Backend
2. Determinar cuáles deben estar en Database
3. Actualizar Database si es necesario

---

## Conclusiones

1. **Hay una desalineación significativa** entre Database y Backend (53 discrepancias)
2. **5 ENUMs críticos faltan en Backend** y podrían causar errores en producción
3. **17 ENUMs tienen solo problemas de case** (fáciles de resolver)
4. **6 ENUMs tienen valores diferentes** (requieren investigación de negocio)
5. **25 ENUMs están en Backend pero no en Database** (necesitan revisión arquitectónica)

**Recomendación general:** Implementar un processo de sincronización automática entre Database y Backend para evitar estas discrepancias en el futuro.

---

**Generado por:** SA-VAL-006  
**Fecha:** 2025-11-03  
**Estado:** REPORTE FINAL
