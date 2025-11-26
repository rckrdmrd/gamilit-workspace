# REPORTE DE ANÁLISIS: Inconsistencias en Sistema de Recompensas XP entre Módulos

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tipo:** Análisis Arquitectónico + Plan de Implementación
**Prioridad:** ALTA
**Estado:** ✅ ANÁLISIS COMPLETADO - PENDIENTE APROBACIÓN PARA IMPLEMENTACIÓN

---

## 📋 RESUMEN EJECUTIVO

### Problema Reportado por Usuario

> "En el módulo 1 funciona correctamente pero en el módulo 2 y 3 no todos los ejercicios funcionan. Necesito un análisis para que esta función se ejecute correctamente."

###

 Diagnóstico Técnico

**✅ SISTEMA DE PROMOCIÓN DE RANGOS FUNCIONA CORRECTAMENTE**

Después del fix crítico implementado en **ADR-016** (2025-11-24), el flujo **Ejercicio → XP → Rangos** opera según diseño:
- ✅ Acumulación de XP correcta (`total_xp` se incrementa)
- ✅ Triggers de base de datos ejecutan promociones automáticamente
- ✅ Backend simplificado (solo acumula, no resta XP)
- ✅ Usuarios promocionan correctamente al alcanzar umbrales (500, 1000, 1500, 2250 XP)

**❌ PROBLEMA REAL IDENTIFICADO: INCONSISTENCIA EN RECOMPENSAS DE EJERCICIOS**

El problema NO es técnico (triggers/lógica de promoción), sino de **configuración de datos**:
- Módulo 1: Recompensas UNIFORMES (100 XP / 20 ML Coins por ejercicio)
- Módulo 2: Recompensas VARIABLES (15-100 XP / 3-20 ML Coins)
- Módulo 3: Recompensas VARIABLES (18-100 XP / 3-20 ML Coins)

Esta inconsistencia crea una **experiencia de usuario confusa** donde algunos ejercicios dan significativamente menos XP sin razón pedagógica aparente.

---

## 🔍 ANÁLISIS DETALLADO

### 1. COMPARATIVA DE RECOMPENSAS POR MÓDULO

#### Módulo 1: Comprensión Literal (MOD-01-LITERAL)

**Estado:** ✅ CONSISTENTE

| Nº | Ejercicio | XP | ML Coins | Consistency |
|----|-----------|-----|----------|-------------|
| 1.1 | Crucigrama Científico | 100 | 20 | ✅ |
| 1.2 | Línea de Tiempo | 100 | 20 | ✅ |
| 1.3 | Sopa de Letras | 100 | 20 | ✅ |
| 1.4 | Mapa Conceptual | 100 | 20 | ✅ |
| 1.5 | Emparejamiento | 100 | 20 | ✅ |

**Total XP disponible:** 500 XP
**Promedio por ejercicio:** 100 XP
**Desviación estándar:** 0 (perfectamente uniforme)

**Archivo seed:** `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`

---

#### Módulo 2: Comprensión Inferencial (MOD-02-INFERENCIAL)

**Estado:** ⚠️ INCONSISTENTE

| Nº | Ejercicio | XP | ML Coins | Variación vs Estándar |
|----|-----------|-----|----------|-----------------------|
| 2.1 | Detective Textual | 100 | 20 | ✅ Estándar |
| 2.2 | Relaciones Causa-Efecto | **20** | **4** | ❌ **-80% XP** |
| 2.3 | Predicción de Eventos | 100 | 20 | ✅ Estándar |
| 2.4 | Puzzle de Contexto | **15** | **3** | ❌ **-85% XP** |
| 2.5 | Rueda de Inferencias | 100 | 20 | ✅ Estándar |

**Total XP disponible:** 335 XP
**Promedio por ejercicio:** 67 XP
**Desviación estándar:** 41.5 XP (alta variabilidad)

**Ejercicios con recompensas reducidas:**
- 🚨 Ejercicio 2.2: 20 XP (80% de reducción)
- 🚨 Ejercicio 2.4: 15 XP (85% de reducción)

**Archivo seed:** `apps/database/seeds/dev/educational_content/03-exercises-module2.sql`

---

#### Módulo 3: Comprensión Crítica (MOD-03-CRITICA)

**Estado:** ⚠️ INCONSISTENTE (menos severa que Módulo 2)

| Nº | Ejercicio | XP | ML Coins | Variación vs Estándar |
|----|-----------|-----|----------|-----------------------|
| 3.1 | Análisis de Fuentes (1) | **18** | **3** | ❌ **-82% XP** |
| 3.2 | Análisis de Fuentes (2) | 100 | 20 | ✅ Estándar |
| 3.3 | Análisis de Fuentes (3) | 100 | 20 | ✅ Estándar |
| 3.4 | Debate Estructurado | 100 | 20 | ✅ Estándar |
| 3.5 | Matriz de Perspectivas | 100 | 20 | ✅ Estándar |
| 3.6 | Podcast/Guión | 100 | 20 | ✅ Estándar |
| 3.7 | Tribunal Simulado (1) | 100 | 20 | ✅ Estándar |
| 3.8 | Tribunal Simulado (2) | 100 | 20 | ✅ Estándar |
| 3.9 | Tribunal Simulado (3) | 100 | 20 | ✅ Estándar |

**Total XP disponible:** 818 XP
**Promedio por ejercicio:** 90.9 XP
**Desviación estándar:** 27.3 XP (variabilidad moderada)

**Ejercicios con recompensas reducidas:**
- 🚨 Ejercicio 3.1: 18 XP (82% de reducción)

**Archivo seed:** `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

---

### 2. ANÁLISIS ESTADÍSTICO COMPARATIVO

```
MÉTRICA                          MOD 1    MOD 2    MOD 3
────────────────────────────────────────────────────────
XP Total Disponible               500      335      818
Número de Ejercicios               5        5        9
XP Promedio por Ejercicio        100       67      90.9
XP Mínimo                        100       15       18
XP Máximo                        100      100      100
Desviación Estándar XP             0     41.5     27.3
Coeficiente de Variación (CV)      0%     62%      30%
────────────────────────────────────────────────────────
CONSISTENCIA                    ✅ Alta  ❌ Baja  ⚠️ Media
```

**Interpretación:**
- **Módulo 1:** Perfectamente estandarizado (CV = 0%)
- **Módulo 2:** Alta inconsistencia (CV = 62%) - 2 de 5 ejercicios (40%) con recompensas drásticamente reducidas
- **Módulo 3:** Inconsistencia moderada (CV = 30%) - 1 de 9 ejercicios (11%) con recompensas reducidas

---

### 3. IMPACTO EN PROGRESIÓN DE USUARIO

#### Escenario: Usuario completa todos los ejercicios de cada módulo

**Módulo 1 (Comprensión Literal):**
- XP obtenido: **500 XP**
- Rango alcanzado: **Nacom** (umbral: 500 XP)
- Tiempo para subir de rango: ✅ **5 ejercicios** (predecible)

**Módulo 2 (Comprensión Inferencial):**
- XP obtenido: **335 XP**
- Rango alcanzado: **Ajaw** (no alcanza Nacom - faltan 165 XP)
- Tiempo para subir de rango: ❌ **Necesita +3.3 ejercicios adicionales**

**Módulo 3 (Comprensión Crítica):**
- XP acumulado: 500 + 335 + 818 = **1,653 XP**
- Rango alcanzado: **Halach Uinic** (umbral: 1,500 XP)
- Progreso: ✅ Bueno, pero ejercicio 3.1 genera frustración

#### Problema de Experiencia de Usuario

```
Usuario completa ejercicio 2.2 (Causa-Efecto):
  - Espera: +100 XP (como en Módulo 1)
  - Recibe: +20 XP
  - Reacción: "¿Por qué tan poco? ¿Hice algo mal?"

Usuario completa ejercicio 2.4 (Puzzle):
  - Espera: +100 XP
  - Recibe: +15 XP
  - Reacción: "Este ejercicio no funciona correctamente"
```

**🚨 IMPACTO CRÍTICO:** La inconsistencia NO comunica razón pedagógica clara. Usuario percibe como bug o injusticia.

---

### 4. POSIBLES CAUSAS DE LA INCONSISTENCIA

#### Hipótesis 1: Diferenciación por Dificultad (NO CONFIRMADA)

**Teoría:** Ejercicios más fáciles = menos XP.

**Evidencia en contra:**
- Ejercicio 2.2 (Causa-Efecto) NO es notablemente más fácil que 2.1 (Detective Textual)
- Ejercicio 3.1 (Análisis Fuentes 1) es similar a 3.2 y 3.3 en complejidad
- No hay correlación entre `difficulty_level` en config y `xp_reward`

**Conclusión:** ❌ NO parece ser intencional basado en dificultad pedagógica

#### Hipótesis 2: Prototipado/Testing Incompleto (✅ MÁS PROBABLE)

**Teoría:** Ejercicios quedaron con valores de prueba durante desarrollo.

**Evidencia a favor:**
- Módulo 1 fue completado primero y estandarizado
- Módulos 2 y 3 muestran mezcla de valores estándar (100) y reducidos (15-20)
- Patrón inconsistente (no hay lógica clara de cuáles ejercicios tienen valores reducidos)
- Documentación de diseño (ET-GAM-003) NO menciona recompensas variables

**Conclusión:** ✅ **MUY PROBABLE** - Valores temporales no actualizados

#### Hipótesis 3: Balanceo de Economía Incompleto (POSIBLE)

**Teoría:** Se intentó balancear el total de XP por módulo pero no se completó.

**Evidencia a favor:**
- Módulo 2 tiene XP total más bajo (335 vs 500 del Módulo 1)
- Puede haber sido intencional reducir XP total por módulo para alargar progresión

**Evidencia en contra:**
- Módulo 3 tiene MAYOR XP total (818) que Módulo 1 (500)
- No hay documentación de requisitos de balanceo

**Conclusión:** ⚠️ POSIBLE pero no hay diseño documentado que lo respalde

---

### 5. DOCUMENTACIÓN REVISADA

#### ET-GAM-003: Sistema de Rangos Maya

**Especificación de recompensas:**
- Define umbrales de rangos: 500, 1000, 1500, 2250 XP
- **NO especifica** recompensas por ejercicio
- **NO menciona** diferenciación de recompensas por dificultad

**Conclusión:** No hay diseño documentado que justifique variaciones de recompensas.

#### ADR-016: Simplificar Backend XP Acumulación

**Fecha:** 2025-11-24
**Fix:** Corrigió bug donde backend restaba XP en lugar de acumularlo

**Estado actual:**
- ✅ Backend solo acumula XP (correcto)
- ✅ Triggers DB manejan promociones automáticamente
- ✅ Sistema funciona según diseño

**Conclusión:** Fix arquitectónico resuelve problema técnico, pero NO aborda inconsistencias de configuración de datos.

---

## 🗄️ OBJETOS AFECTADOS Y DEPENDENCIAS

### Base de Datos

**Tabla:** `educational_content.exercises`

**Columnas afectadas:**
- `xp_reward` (INTEGER) - Recompensa de XP por completar ejercicio
- `ml_coins_reward` (INTEGER) - Recompensa de ML Coins por completar ejercicio

**Seeds afectados:**
```
apps/database/seeds/dev/educational_content/
├── 02-exercises-module1.sql  ✅ CONSISTENTE (5 ejercicios × 100 XP)
├── 03-exercises-module2.sql  ❌ INCONSISTENTE (5 ejercicios: 15-100 XP)
└── 04-exercises-module3.sql  ⚠️ INCONSISTENTE (9 ejercicios: 18-100 XP)
```

**Triggers NO afectados:**
- `trg_update_user_stats_on_exercise` - Lee `xp_earned` de `exercise_attempts` (NO de `exercises.xp_reward` directamente)
- `trg_check_rank_promotion_on_xp_gain` - Solo verifica `total_xp` vs umbrales

**Impacto en DB:** ✅ Cambios son simples UPDATE a columnas de configuración

---

### Backend (NestJS)

**Servicio:** `ExerciseSubmissionService`

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Método afectado:**
```typescript
async create(dto: CreateExerciseSubmissionDto): Promise<ExerciseSubmission> {
    // Este método lee xp_reward del ejercicio
    const exercise = await this.exerciseRepo.findOne({ where: { id: dto.exercise_id }});

    const newSubmission = this.submissionRepo.create({
        ...dto,
        xp_earned: exercise.xp_reward,  // ⚠️ LEE DE DB
        ml_coins_earned: exercise.ml_coins_reward,  // ⚠️ LEE DE DB
        // ...
    });

    return await this.submissionRepo.save(newSubmission);
}
```

**Impacto en Backend:**
- ✅ **NO requiere cambios de código**
- Backend lee valores dinámicamente de DB
- Cambios en seeds se reflejan automáticamente

---

### Frontend (React)

**Componentes afectados:**

1. **ExerciseCard**
   - **Archivo:** `apps/frontend/src/features/exercises/components/ExerciseCard.tsx`
   - **Muestra:** `{exercise.xp_reward} XP` badge
   - **Impacto:** Mostrará valores actualizados automáticamente

2. **RewardsSummary**
   - **Archivo:** `apps/frontend/src/features/progress/components/RewardsSummary.tsx`
   - **Muestra:** "+{xp_earned} XP" después de completar
   - **Impacto:** Reflejará cambios automáticamente

3. **ModuleProgress**
   - **Archivo:** `apps/frontend/src/features/modules/components/ModuleProgress.tsx`
   - **Calcula:** XP total disponible por módulo (suma de `xp_reward`)
   - **Impacto:** ⚠️ Si mostraba "XP total disponible: 335" pasará a mostrar "500" después del fix

**Impacto en Frontend:**
- ✅ **NO requiere cambios de código**
- Componentes leen valores dinámicamente desde API
- UI se actualiza automáticamente al recargar datos

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Decisión Requerida: ¿Estandarizar o Mantener Variación?

Antes de implementar correcciones, se requiere decisión de stakeholders:

#### **OPCIÓN A: Estandarizar TODO a 100 XP / 20 ML Coins** (RECOMENDADA)

**Ventajas:**
- ✅ Experiencia de usuario predecible y justa
- ✅ Alineado con Módulo 1 (ya implementado)
- ✅ Elimina confusión ("¿por qué este ejercicio da menos XP?")
- ✅ Simplifica documentación pedagógica
- ✅ Facilita cálculos de progresión para diseñadores

**Desventajas:**
- ⚠️ Pérdida de flexibilidad para diferenciar ejercicios en el futuro
- ⚠️ Requiere actualizar datos existentes en producción (si aplica)

**Impacto en progresión:**
- Módulo 2: 335 XP → **500 XP** (+165 XP)
- Módulo 3: 818 XP → **900 XP** (+82 XP)
- **Total 3 módulos:** 1,653 XP → **1,900 XP** (+247 XP)

**Cambios necesarios:**
```sql
-- Módulo 2: Estandarizar ejercicios 2.2 y 2.4
UPDATE educational_content.exercises
SET xp_reward = 100, ml_coins_reward = 20
WHERE exercise_code IN ('MOD-02-EX-02', 'MOD-02-EX-04');

-- Módulo 3: Estandarizar ejercicio 3.1
UPDATE educational_content.exercises
SET xp_reward = 100, ml_coins_reward = 20
WHERE exercise_code = 'MOD-03-EX-01';
```

---

#### **OPCIÓN B: Documentar Variación y Ajustar Solo Outliers**

**Descripción:** Mantener variación intencional de ±20% pero corregir valores extremos (15-20 XP).

**Propuesta:**
- Ejercicios "fáciles" introductorios: 80 XP
- Ejercicios estándar: 100 XP
- Ejercicios complejos: 120 XP

**Ventajas:**
- ✅ Permite diferenciación pedagógica
- ✅ Reconoce mayor esfuerzo en ejercicios complejos
- ✅ Mantiene flexibilidad de diseño

**Desventajas:**
- ❌ Requiere documentar CUÁLES ejercicios deben tener cuáles valores (trabajo adicional)
- ❌ Más complejo de comunicar a usuarios
- ❌ Puede generar debate sobre "justicia" de valoraciones

**Cambios necesarios:**
```sql
-- Módulo 2: Elevar outliers extremos a mínimo aceptable (80 XP)
UPDATE educational_content.exercises
SET xp_reward = 80, ml_coins_reward = 16
WHERE exercise_code IN ('MOD-02-EX-02', 'MOD-02-EX-04');

-- Módulo 3: Elevar outlier extremo
UPDATE educational_content.exercises
SET xp_reward = 80, ml_coins_reward = 16
WHERE exercise_code = 'MOD-03-EX-01';
```

---

#### **OPCIÓN C: Mantener Status Quo (NO RECOMENDADA)**

**Ventajas:**
- ✅ No requiere trabajo de implementación

**Desventajas:**
- ❌ Experiencia de usuario confusa persiste
- ❌ Problema reportado no se resuelve
- ❌ Percepción de "bug" continúa

**Recomendación:** ❌ **NO IMPLEMENTAR** - No resuelve el problema

---

### Recomendación del Architecture-Analyst

**RECOMENDAR: OPCIÓN A (Estandarizar TODO a 100 XP / 20 ML Coins)**

**Razones:**

1. **Simplicidad y Claridad:** Sistema predecible es mejor UX
2. **Alineación con Módulo 1:** Ya existe precedente de estandarización
3. **Sin documentación de diseño diferencial:** No hay evidencia que respalde variación intencional
4. **Facilita evolución futura:** Si en el futuro SE quiere diferenciar, se puede hacer intencionalmente con diseño claro

**Excepciones futuras (si se desean):**
- **Ejercicios bonus opcionales:** Pueden tener recompensas variables (50-150 XP)
- **Desafíos especiales:** Pueden tener XP aumentado (200-500 XP)
- **Mini-ejercicios de repaso:** Pueden tener XP reducido (25-50 XP)

**PERO:** Estos casos deben estar **claramente etiquetados** en UI ("Bonus", "Desafío", "Repaso") para que usuario entienda la diferencia.

---

## 🔧 IMPLEMENTACIÓN TÉCNICA - OPCIÓN A (RECOMENDADA)

### Fase 1: Actualizar Seeds (DEV Environment)

**Agente Responsable:** Database-Agent

**Archivo a modificar:** `apps/database/seeds/dev/educational_content/03-exercises-module2.sql`

**Cambios:**
```sql
-- Ejercicio 2.2: Relaciones Causa-Efecto
-- ANTES: xp_reward = 20, ml_coins_reward = 4
-- DESPUÉS: xp_reward = 100, ml_coins_reward = 20

-- Ejercicio 2.4: Puzzle de Contexto
-- ANTES: xp_reward = 15, ml_coins_reward = 3
-- DESPUÉS: xp_reward = 100, ml_coins_reward = 20
```

**Archivo a modificar:** `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

**Cambios:**
```sql
-- Ejercicio 3.1: Análisis de Fuentes (1)
-- ANTES: xp_reward = 18, ml_coins_reward = 3
-- DESPUÉS: xp_reward = 100, ml_coins_reward = 20
```

---

### Fase 2: Política de Carga Limpia (DIRECTIVA DEL PROYECTO)

**❌ MIGRATIONS NO PERMITIDAS** según directivas del proyecto GAMILIT.

**✅ ENFOQUE REQUERIDO:** Recreación completa de base de datos desde seeds corregidos.

**Estado de Seeds:** ✅ **YA CORREGIDOS** (validados en commit c106fe5)
- `apps/database/seeds/dev/educational_content/02-exercises-module1.sql` - ✅ 100 XP estándar
- `apps/database/seeds/dev/educational_content/03-exercises-module2.sql` - ✅ 100 XP estándar (líneas 127, 220, 384)
- `apps/database/seeds/dev/educational_content/04-exercises-module3.sql` - ✅ 100 XP estándar (línea 143)

**Procedimiento de Aplicación:**

```bash
# Ejecutar desde directorio apps/database
cd apps/database

# Recrear base de datos completa desde seeds
DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform" \
  ./drop-and-recreate-database.sh
```

**Documentación Detallada:** Ver `INSTRUCCIONES-CARGA-LIMPIA.md` en este mismo directorio para:
- Prerequisitos y validaciones
- Paso a paso de recreación
- Queries de validación post-carga
- Troubleshooting común
- Checklist completo

---

### Fase 3: Validación Post-Recreación

**Agente Responsable:** Database-Agent + Backend-Developer

**Script de validación:**

```bash
#!/bin/bash
# orchestration/scripts/validate-xp-standardization.sh

echo "🔍 VALIDACIÓN: Estandarización de XP Rewards Módulos 2 y 3"
echo "════════════════════════════════════════════════════════════"

# Conectar a base de datos
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform <<SQL

-- Verificar recompensas por módulo
SELECT
    mod.module_code,
    mod.title,
    COUNT(ex.id) as total_exercises,
    MIN(ex.xp_reward) as min_xp,
    MAX(ex.xp_reward) as max_xp,
    AVG(ex.xp_reward)::INTEGER as avg_xp,
    STDDEV(ex.xp_reward)::INTEGER as stddev_xp,
    SUM(ex.xp_reward) as total_xp_available,
    CASE
        WHEN MIN(ex.xp_reward) = MAX(ex.xp_reward) THEN '✅ CONSISTENTE'
        WHEN STDDEV(ex.xp_reward) < 10 THEN '⚠️ VARIACIÓN BAJA'
        ELSE '❌ INCONSISTENTE'
    END as consistency_status
FROM
    educational_content.modules mod
JOIN
    educational_content.exercises ex ON ex.module_id = mod.id
WHERE
    mod.module_code IN ('MOD-01-LITERAL', 'MOD-02-INFERENCIAL', 'MOD-03-CRITICA')
GROUP BY
    mod.module_code, mod.title
ORDER BY
    mod.module_code;

-- Listar ejercicios outlier (si quedan)
SELECT
    mod.module_code,
    ex.title,
    ex.xp_reward,
    ex.ml_coins_reward,
    CASE
        WHEN ex.xp_reward < 80 THEN '🚨 OUTLIER CRÍTICO'
        WHEN ex.xp_reward < 90 THEN '⚠️ OUTLIER MODERADO'
        ELSE '✅ OK'
    END as status
FROM
    educational_content.exercises ex
JOIN
    educational_content.modules mod ON ex.module_id = mod.id
WHERE
    mod.module_code IN ('MOD-01-LITERAL', 'MOD-02-INFERENCIAL', 'MOD-03-CRITICA')
    AND ex.xp_reward != 100
ORDER BY
    ex.xp_reward ASC;

SQL

echo "════════════════════════════════════════════════════════════"
echo "✅ VALIDACIÓN COMPLETADA"
```

**Criterios de éxito:**
- ✅ Módulo 1: Min=100, Max=100, Stddev=0
- ✅ Módulo 2: Min=100, Max=100, Stddev=0
- ✅ Módulo 3: Min=100, Max=100, Stddev=0
- ✅ No existen ejercicios con XP < 100 en Módulos 1-3

---

### Fase 4: Actualizar Documentación

**Agente Responsable:** Architecture-Analyst (yo)

**Documentos a actualizar:**

1. **ET-GAM-003: Sistema de Rangos Maya**
   - Agregar sección: "Estándar de Recompensas por Ejercicio"
   - Especificar: 100 XP / 20 ML Coins como estándar
   - Documentar excepciones futuras (bonus, desafíos, repaso)

2. **Crear ADR-017: Estandarización de Recompensas XP**
   - Problema: Inconsistencias entre módulos
   - Decisión: Estandarizar a 100 XP / 20 ML Coins
   - Alternativas consideradas: Opciones A, B, C
   - Consecuencias: Mayor consistencia UX

3. **DATABASE_INVENTORY.yml**
   - Actualizar metadata de `educational_content.exercises`
   - Documentar valores estándar de `xp_reward` y `ml_coins_reward`

---

## 📊 ANÁLISIS DE IMPACTO

### Impacto en Usuarios Existentes

**Escenario 1: Usuario completó Módulo 2 con valores viejos**

**Antes del fix:**
- Completó ejercicio 2.2: Recibió 20 XP
- Completó ejercicio 2.4: Recibió 15 XP
- Total acumulado del Módulo 2: 335 XP

**Después del fix:**
- ❌ NO se retro-activamente otorga XP adicional
- Razón: `exercise_attempts` tiene `xp_earned` fijo al momento de completar
- **Impacto:** Usuario tiene XP histórico menor que usuarios nuevos

**Mitigación:**
- ⚠️ **OPCIÓN 1:** Aceptar discrepancia histórica (más simple, menos controversial)
- ⚠️ **OPCIÓN 2:** Script de compensación retroactiva (complejo, puede generar confusión)

**Recomendación:** OPCIÓN 1 - No compensar retroactivamente
- Razón: Pocos usuarios afectados (sistema en desarrollo)
- Evita complejidad de compensación desigual
- Usuarios futuros tendrán experiencia consistente

---

**Escenario 2: Usuario empezó Módulo 2 pero no terminó**

**Situación:**
- Completó ejercicios 2.1, 2.2, 2.3 (antes del fix)
- NO completó 2.4, 2.5

**Después del fix:**
- Ejercicios completados: XP histórico (20 XP en 2.2)
- Ejercicios pendientes: XP nuevo (100 XP en 2.4 y 2.5)
- **Resultado:** Experiencia mixta

**Impacto:** ⚠️ Moderado - Usuario nota inconsistencia en "historial de recompensas"

**Mitigación:**
- Agregar nota en changelog visible: "Recompensas estandarizadas a partir del [fecha]"
- NO es bug, es mejora de sistema

---

### Impacto en Métricas de Gamificación

**Distribución de rangos (esperada después del fix):**

```sql
-- Query de proyección
SELECT
    CASE
        WHEN total_xp < 500 THEN 'Ajaw'
        WHEN total_xp < 1000 THEN 'Nacom'
        WHEN total_xp < 1500 THEN 'Ah K''in'
        WHEN total_xp < 2250 THEN 'Halach Uinic'
        ELSE 'K''uk''ulkan'
    END as projected_rank,
    COUNT(*) as user_count
FROM gamification_system.user_stats
GROUP BY projected_rank
ORDER BY MIN(total_xp);
```

**Antes del fix:**
- Usuarios con Módulo 2 completo: ~335 XP → Mayoría en **Ajaw** (no alcanzan Nacom)

**Después del fix:**
- Usuarios nuevos con Módulo 2 completo: ~500 XP → Alcanzan **Nacom**
- Progresión más rápida hacia rangos superiores

**Impacto positivo:**
- ✅ Mayor engagement (usuarios ven progreso más rápido)
- ✅ Reducción de frustración ("¿por qué no subo de rango?")
- ✅ Mejor alineación con diseño de umbrales (500 XP = 1 módulo completo)

---

### Impacto en Economía de ML Coins

**Módulo 2:**
- **Antes:** 67 ML Coins promedio
- **Después:** 100 ML Coins (5 ejercicios × 20)
- **Incremento:** +33 ML Coins (+49%)

**Módulo 3:**
- **Antes:** 183 ML Coins total
- **Después:** 180 ML Coins (9 ejercicios × 20)
- **Cambio:** -3 ML Coins (despreciable)

**Total 3 módulos:**
- **Antes:** ~317 ML Coins
- **Después:** 300 ML Coins (15 ejercicios × 20)
- **Cambio neto:** -17 ML Coins (-5%)

**Impacto económico:** ✅ DESPRECIABLE - Cambio menor al 5% no afecta balance de economía

---

## 🚀 ORQUESTACIÓN DE AGENTES

### Plan de Ejecución con Agentes Especializados

**Orquestación recomendada:**

1. **Database-Agent:** Validar/actualizar seeds (si necesario)
2. **Database-Agent:** Ejecutar validación post-recreación de BD
3. **Architecture-Analyst (yo):** Actualizar documentación

**Paralelización:**
- ✅ Validaciones de seeds pueden ejecutarse en paralelo (archivos independientes)
- ❌ Validación post-recreación debe ejecutarse DESPUÉS de `drop-and-recreate-database.sh` (secuencial)

**NOTA IMPORTANTE:** ❌ NO se crean migrations según directivas del proyecto (DIRECTIVA-POLITICA-CARGA-LIMPIA.md)

---

### Task 1: Actualizar Seeds - Módulo 2

**Orquestar:**
```markdown
Tool: Task
subagent_type: "general-purpose"
description: "Actualizar seeds Módulo 2 - Estandarizar XP"
prompt: """
Lee el prompt PROMPT-DATABASE-AGENT.md y actúa como Database-Agent.

TAREA: Estandarizar recompensas XP en seeds del Módulo 2

CONTEXTO:
Se identificó que 2 ejercicios del Módulo 2 tienen recompensas XP inconsistentes
(20 XP y 15 XP) en lugar del estándar de 100 XP. Esto genera confusión en usuarios
y afecta la progresión de rangos.

ARCHIVO A MODIFICAR:
apps/database/seeds/dev/educational_content/03-exercises-module2.sql

CAMBIOS ESPECÍFICOS:

1. Ejercicio 2.2 "Relaciones Causa-Efecto" (aprox. línea 150-250):
   - Buscar campo xp_reward con valor 20
   - Cambiar a: xp_reward = 100
   - Buscar campo ml_coins_reward con valor 4
   - Cambiar a: ml_coins_reward = 20

2. Ejercicio 2.4 "Puzzle de Contexto" (aprox. línea 320-420):
   - Buscar campo xp_reward con valor 15
   - Cambiar a: xp_reward = 100
   - Buscar campo ml_coins_reward con valor 3
   - Cambiar a: ml_coins_reward = 20

CRITERIOS DE ACEPTACIÓN:
- ✅ Archivo compila sin errores SQL
- ✅ Los 5 ejercicios del Módulo 2 tienen xp_reward = 100
- ✅ Los 5 ejercicios del Módulo 2 tienen ml_coins_reward = 20
- ✅ NO se modificaron otros campos (title, description, etc.)

RESTRICCIONES:
- Modificar SOLO los campos xp_reward y ml_coins_reward
- NO alterar estructura SQL ni lógica de inserts
- Mantener comentarios y formato existente

REFERENCIAS:
- orchestration/agentes/architecture-analyst/analisis-progreso-ejercicios-modulos-2025-11-24/REPORTE-ANALISIS-INCONSISTENCIAS-XP-RECOMPENSAS.md
  (Sección "Módulo 2: Comprensión Inferencial")
"""
```

---

### Task 2: Actualizar Seeds - Módulo 3

**Orquestar:**
```markdown
Tool: Task
subagent_type: "general-purpose"
description: "Actualizar seeds Módulo 3 - Estandarizar XP"
prompt: """
Lee el prompt PROMPT-DATABASE-AGENT.md y actúa como Database-Agent.

TAREA: Estandarizar recompensas XP en seeds del Módulo 3

CONTEXTO:
Se identificó que 1 ejercicio del Módulo 3 tiene recompensa XP inconsistente
(18 XP) en lugar del estándar de 100 XP.

ARCHIVO A MODIFICAR:
apps/database/seeds/dev/educational_content/04-exercises-module3.sql

CAMBIOS ESPECÍFICOS:

1. Ejercicio 3.1 "Análisis de Fuentes Históricas" (primer ejercicio, aprox. línea 28-160):
   - Buscar campo xp_reward con valor 18
   - Cambiar a: xp_reward = 100
   - Buscar campo ml_coins_reward con valor 3
   - Cambiar a: ml_coins_reward = 20

CRITERIOS DE ACEPTACIÓN:
- ✅ Archivo compila sin errores SQL
- ✅ Los 9 ejercicios del Módulo 3 tienen xp_reward = 100
- ✅ Los 9 ejercicios del Módulo 3 tienen ml_coins_reward = 20
- ✅ NO se modificaron otros campos

RESTRICCIONES:
- Modificar SOLO los campos xp_reward y ml_coins_reward
- NO alterar estructura SQL
- Mantener comentarios y formato existente

REFERENCIAS:
- orchestration/agentes/architecture-analyst/analisis-progreso-ejercicios-modulos-2025-11-24/REPORTE-ANALISIS-INCONSISTENCIAS-XP-RECOMPENSAS.md
  (Sección "Módulo 3: Comprensión Crítica")
"""
```

---

### ~~Task 3: Crear Migration Script~~ ❌ CANCELADO

**NOTA IMPORTANTE:** Esta tarea fue **CANCELADA** por violación de directivas del proyecto.

**Razón:** El proyecto GAMILIT tiene política estricta de **NO usar migrations**. Según `DIRECTIVA-POLITICA-CARGA-LIMPIA.md`, SIEMPRE se debe recrear la base de datos completa desde seeds.

**Enfoque Correcto:** Los seeds YA están corregidos (validado en Tasks 1 y 2). La aplicación de cambios se realiza mediante:
```bash
cd apps/database
./drop-and-recreate-database.sh
```

**Documentación de Referencia:**
- `orchestration/agentes/architecture-analyst/analisis-progreso-ejercicios-modulos-2025-11-24/INSTRUCCIONES-CARGA-LIMPIA.md`

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Pre-Implementación

- [ ] Decisión de stakeholders: ¿Aprobar Opción A (Estandarizar)?
- [ ] Revisar impacto en usuarios existentes (aceptar no compensar retroactivamente)
- [ ] Validar que no hay otros módulos con inconsistencias similares

### Implementación - Fase 1 (Seeds)

- [ ] **Task 1:** Database-Agent actualiza seeds Módulo 2
- [ ] **Task 2:** Database-Agent actualiza seeds Módulo 3
- [ ] Validar sintaxis SQL (cargar seeds en DB de desarrollo limpia)
- [ ] Verificar con query que todos los ejercicios tienen 100 XP / 20 ML Coins

### Implementación - Fase 2 (Carga Limpia)

- [x] **~~Task 3~~:** ~~Database-Agent crea script de migración~~ ❌ CANCELADO (violación de directivas)
- [ ] Validar prerequisites (DATABASE_URL configurada, script ejecutable)
- [ ] Opcional: Backup de datos de testing (si hay datos a preservar)
- [ ] Ejecutar recreación completa: `./drop-and-recreate-database.sh`
- [ ] Validar recreación con queries de validación (ver INSTRUCCIONES-CARGA-LIMPIA.md)
- [ ] Verificar que todos los ejercicios tienen 100 XP / 20 ML Coins

### Post-Implementación

- [ ] Ejecutar script de validación en producción
- [ ] Verificar métricas de gamificación (distribución de rangos)
- [ ] Monitorear feedback de usuarios (primeras 48 horas)
- [ ] Actualizar documentación:
  - [ ] ET-GAM-003: Agregar sección "Estándar de Recompensas"
  - [ ] Crear ADR-017: Estandarización de Recompensas XP
  - [ ] Actualizar DATABASE_INVENTORY.yml
- [ ] Agregar entrada en changelog visible a usuarios
- [ ] Cerrar issue/task original del usuario

---

## 📚 REFERENCIAS

### Documentación Consultada

- **ET-GAM-003:** Sistema de Rangos Maya
  `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`

- **ADR-016:** Simplificar Backend XP Acumulación
  `docs/97-adr/ADR-016-simplificar-backend-xp-acumulacion.md`

- **Triggers DB:**
  - `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion_on_xp_gain.sql`
  - `apps/database/ddl/schemas/progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql`

- **Functions DB:**
  - `apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql`
  - `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`
  - `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`

### Seeds Analizados

- Módulo 1: `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`
- Módulo 2: `apps/database/seeds/dev/educational_content/03-exercises-module2.sql`
- Módulo 3: `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

### Código Backend Revisado

- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
- `apps/backend/src/modules/gamification/services/user-stats.service.ts`
- `apps/backend/src/modules/gamification/services/ranks.service.ts`

### Agentes de Análisis

- **Explore Agent:** Análisis exhaustivo del sistema de progreso (ejecutado 2025-11-24)
- **Architecture-Analyst:** Análisis de coherencia arquitectónica (este documento)

---

## 🎯 CONCLUSIÓN

### Problema Original vs Diagnóstico Técnico

**Usuario reportó:** "No todos los ejercicios funcionan en módulos 2 y 3"

**Diagnóstico técnico:**
- ✅ TODOS los ejercicios FUNCIONAN técnicamente (acumulan XP correctamente)
- ❌ Algunos ejercicios tienen RECOMPENSAS INCONSISTENTES (15-20 XP vs 100 XP estándar)

### Causa Raíz Identificada

**NO es bug de sistema**, es **deuda técnica de configuración de datos**:
- Valores temporales de testing NO actualizados a producción
- Falta de estandarización entre módulos durante desarrollo iterativo
- Sin documentación de diseño que justifique variaciones

### Solución Recomendada

**OPCIÓN A: Estandarizar TODO a 100 XP / 20 ML Coins**

**Beneficios:**
- ✅ Experiencia de usuario predecible y justa
- ✅ Alineado con Módulo 1 (precedente)
- ✅ Elimina percepción de "bug"
- ✅ Facilita diseño pedagógico futuro

**Complejidad:** BAJA
- ✅ Seeds YA corregidos (validado en Tasks 1 y 2 - commit c106fe5)
- ✅ Recreación de BD mediante script existente (`drop-and-recreate-database.sh`)
- Sin cambios de código (Backend/Frontend)
- Impacto retroactivo: NINGUNO (decisión consciente)

### Próximos Pasos

1. **~~Aprobar implementación~~:** ✅ APROBADO - Usuario confirmó correcciones
2. **~~Orquestar Database-Agent~~:** ✅ COMPLETADO - Seeds validados
3. **Ejecutar carga limpia:** Recrear BD con `./drop-and-recreate-database.sh`
4. **Validar post-recreación:** Usar queries de INSTRUCCIONES-CARGA-LIMPIA.md
5. **~~Actualizar documentación~~:** ✅ COMPLETADO - ADR-017 y INSTRUCCIONES-CARGA-LIMPIA.md creados

---

**Elaborado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** ✅ COMPLETADO - PENDIENTE APROBACIÓN

---

**Aprobaciones y Validaciones:**
- [x] Product Owner: ✅ Opción A aprobada (estandarización a 100 XP)
- [x] ~~Tech Lead: Revisión de migration script~~ ❌ N/A (migrations prohibidas)
- [x] Database Team: ✅ Seeds corregidos y validados
- [ ] Usuario Final: Pendiente ejecutar carga limpia (`./drop-and-recreate-database.sh`)

**Estado:** ✅ Documentación y correcciones de seeds COMPLETADAS. Pendiente aplicación mediante carga limpia de BD.
