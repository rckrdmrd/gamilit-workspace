---
titulo: "ADR-021: Estandarizacion de Recompensas XP en Ejercicios"
tipo: adr
fecha_creacion: "2025-11-24"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-021: Estandarización de Recompensas XP en Ejercicios

**Estado:** Aceptada e Implementada
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**Relacionado con:**
- ADR-016: Simplificar Backend XP Acumulación
- ET-GAM-003: Sistema de Rangos Maya
- RF-GAM-003: Requerimiento Funcional Rangos

---

## Contexto

### Problema Reportado

Usuario reportó que "en el módulo 1 funciona correctamente pero en el módulo 2 y 3 no todos los ejercicios funcionan" en relación al sistema de progresión de rangos.

### Diagnóstico Técnico

Después de análisis arquitectónico exhaustivo, se identificó que:

**✅ Sistema de Promoción de Rangos Funciona Correctamente**
- Acumulación de XP funciona (gracias a ADR-016)
- Triggers de base de datos ejecutan promociones automáticamente
- Usuarios promocionan correctamente al alcanzar umbrales (500, 1000, 1500, 2250 XP)

**❌ Problema Real: Inconsistencia en Configuración de Recompensas**

El problema NO es técnico, sino de **datos inconsistentes** en configuración de ejercicios:

| Módulo | Consistencia | Detalle |
|--------|--------------|---------|
| **Módulo 1** | ✅ Perfecto | Todos: 100 XP / 20 ML Coins |
| **Módulo 2** | ❌ Inconsistente | 3 ejercicios: 100 XP / 2 ejercicios: 15-20 XP |
| **Módulo 3** | ⚠️ Inconsistente | 8 ejercicios: 100 XP / 1 ejercicio: 18 XP |

**Ejercicios con recompensas reducidas:**
- 🚨 Módulo 2.2 "Relaciones Causa-Efecto": 20 XP (80% reducción)
- 🚨 Módulo 2.4 "Puzzle de Contexto": 15 XP (85% reducción)
- 🚨 Módulo 3.1 "Análisis de Fuentes": 18 XP (82% reducción)

### Impacto en Experiencia de Usuario

```
Usuario completa Módulo 1:
→ 5 ejercicios × 100 XP = 500 XP
→ Alcanza rango NACOM ✅
→ Experiencia: "Todo funciona perfecto"

Usuario completa Módulo 2:
→ 3 ejercicios × 100 XP = 300 XP
→ 2 ejercicios × 15-20 XP = 35 XP
→ Total: 335 XP (NO alcanza NACOM - faltan 165 XP)
→ Experiencia: "¿Por qué no subo de rango? ¿Está roto?"
```

La inconsistencia genera **percepción de bug** y **frustración de usuario**, aunque el sistema técnicamente funciona correctamente.

### Causa Raíz

**Teoría más probable:** Valores temporales de testing/prototipado NO actualizados a producción.

**Evidencia:**
- Módulo 1 completado primero y estandarizado
- Módulos 2 y 3 muestran mezcla de valores (15-20-100 XP)
- NO hay documentación de diseño que justifique variaciones
- Patrón inconsistente sin lógica pedagógica clara

---

## Decisión

**Estandarizar TODAS las recompensas de ejercicios a 100 XP / 20 ML Coins**

### Especificación del Estándar

Todos los ejercicios regulares de los módulos 1-3 tendrán:
- **xp_reward:** 100 XP
- **ml_coins_reward:** 20 ML Coins

### Excepción: Módulo 2 - Comprensión Inferencial

**Actualizado 2025-11-28:** El Módulo 2 tiene recompensas diferenciadas para reconocer la mayor complejidad de ejercicios de inferencia:

- **xp_reward:** 150 XP
- **ml_coins_reward:** 30 ML Coins

**Razón:** Los ejercicios del Módulo 2 (Detective Textual, Rueda de Inferencias, etc.) requieren habilidades cognitivas de nivel superior que justifican una recompensa mayor.

**Excepciones futuras permitidas (si se implementan):**
- **Ejercicios bonus opcionales:** 50-150 XP (claramente etiquetados como "Bonus")
- **Desafíos especiales:** 200-500 XP (etiquetados como "Desafío")
- **Mini-ejercicios de repaso:** 25-50 XP (etiquetados como "Repaso")

**IMPORTANTE:** Cualquier excepción debe estar **claramente comunicada** en UI para que usuarios entiendan la diferencia.

### Implementación

**Fase 1: Seeds Actualizados** (Ejecutado por Database-Agent)
- ✅ Módulo 2: Ejercicios 2.2 y 2.4 → 100 XP / 20 ML Coins
- ✅ Módulo 3: Ejercicio 3.1 → 100 XP / 20 ML Coins

**Fase 2: Política de Carga Limpia** (DIRECTIVA-POLITICA-CARGA-LIMPIA.md)
- ✅ Seeds corregidos - Listos para carga limpia
- ❌ Migrations NO PERMITIDAS por directivas del proyecto
- ✅ Enfoque: SIEMPRE recrear base de datos desde seeds

**Fase 3: Recreación de Base de Datos** (Pendiente)
- ⏳ Ejecutar `./drop-and-recreate-database.sh`
- ⏳ Validar con queries de verificación

---

## Razones

### 1. **Simplicidad y Claridad para Usuarios**

**Problema con variación:**
Usuario no entiende por qué un ejercicio da 15 XP y otro 100 XP sin explicación clara.

**Beneficio de estandarización:**
- Experiencia predecible: "cada ejercicio = 100 XP"
- Cálculos mentales simples: "5 ejercicios = 500 XP = subir rango"
- Elimina percepción de bug o injusticia

### 2. **Alineación con Módulo 1 Existente**

Módulo 1 ya establece el precedente de 100 XP uniforme. Estandarizar 2 y 3 mantiene consistencia.

### 3. **Sin Documentación de Diseño Diferencial**

- ET-GAM-003 NO menciona recompensas variables
- NO hay ADR que justifique diferenciación
- NO hay correlación documentada entre dificultad y XP

**Conclusión:** Variación no es intencional, es deuda técnica.

### 4. **Facilita Diseño Pedagógico Futuro**

Con estándar claro (100 XP), diseñadores saben:
- Cuántos ejercicios por módulo para alcanzar un rango
- XP total esperado por fase de aprendizaje
- Balance de economía predecible

Si en el futuro SE DESEA diferenciar, se puede hacer intencionalmente con diseño documentado.

### 5. **Impacto Técnico Mínimo**

- ✅ NO requiere cambios de código (Backend/Frontend)
- ✅ Solo actualización de configuración de datos
- ✅ Complejidad BAJA

---

## Consecuencias

### Positivas ✅

1. **Experiencia de usuario predecible y justa**
   - Elimina confusión ("¿por qué tan poco XP?")
   - Elimina percepción de bug
   - Progresión transparente

2. **Alineación con diseño de rangos**
   - 500 XP (5 ejercicios) = 1 rango (Ajaw → Nacom)
   - 1,000 XP (10 ejercicios) = 2 rangos (→ Ah K'in)
   - Matemática simple y predecible

3. **Código más simple de mantener**
   - Sin lógica especial para ejercicios "excepcionales"
   - Documentación más clara
   - Menos casos edge

4. **Facilita evolución futura**
   - Si en el futuro se quiere diferenciar, se puede hacer intencionalmente
   - Con diseño claro y comunicación explícita

### Negativas/Trade-offs ⚠️

1. **Pérdida de flexibilidad para diferenciar**
   - **Impacto:** SI en el futuro se quiere reconocer ejercicios más complejos con más XP
   - **Mitigación:** Se puede implementar después con diseño intencional (ej: badge "Desafío" con 150 XP)

2. **Requiere recreación de base de datos (Política de Carga Limpia)**
   - **Impacto:** Base de datos existente se ELIMINA y recrea completamente
   - **Razón:** DIRECTIVA-POLITICA-CARGA-LIMPIA - NO se permiten migrations
   - **Consecuencia:** Todos los datos de testing/desarrollo se pierden (esperado)
   - **Mitigación:** Proyecto en desarrollo, sin datos de producción críticos

3. **No compensación retroactiva (N/A - carga limpia)**
   - **Impacto:** Al recrear DB, NO hay usuarios con datos históricos
   - **Razón:** Carga limpia implica estado inicial limpio
   - **Ventaja:** Todos los usuarios nuevos tendrán experiencia consistente desde el inicio

### Riesgos Mitigados 🛡️

- ✅ **Inconsistencias de estado:** Carga limpia garantiza estado determinístico
- ✅ **Regresiones:** Seeds versionados con git, fácil rollback si necesario
- ✅ **Datos obsoletos:** Recreación elimina cualquier dato corrupto o desactualizado
- ✅ **Complejidad de migrations:** NO usar migrations = arquitectura más simple

---

## Alternativas Consideradas

### Alternativa 1: Mantener Variación pero Documentarla

**Descripción:** Aceptar diferenciación de recompensas (80-100-120 XP) según dificultad percibida, pero documentar claramente.

**Pros:**
- ✅ Permite reconocer ejercicios más complejos
- ✅ Flexibilidad de diseño pedagógico

**Cons:**
- ❌ Requiere documentar CUÁLES ejercicios tienen cuáles valores (trabajo adicional)
- ❌ Más complejo de comunicar a usuarios
- ❌ Puede generar debate sobre "justicia" de valoraciones
- ❌ NO resuelve problema reportado (usuarios seguirán confundidos)

**Razón de rechazo:** No resuelve el problema principal (confusión de usuario) y añade complejidad sin beneficio claro.

---

### Alternativa 2: Ajustar Solo Outliers Extremos (elevar a 80 XP)

**Descripción:** Mantener variación leve (80-100-120 XP) pero eliminar valores extremos (15-20 XP).

**Pros:**
- ✅ Elimina outliers más problemáticos
- ✅ Mantiene algo de flexibilidad

**Cons:**
- ❌ Solución parcial (aún hay inconsistencia 80 vs 100)
- ❌ Usuarios seguirán preguntando "¿por qué este da 80 y este 100?"
- ❌ NO hay diseño documentado que justifique diferencia

**Razón de rechazo:** Solución a medias que no resuelve el problema de raíz.

---

### Alternativa 3: No Hacer Nada (Status Quo)

**Pros:**
- ✅ Sin trabajo de implementación

**Cons:**
- ❌ Problema reportado NO se resuelve
- ❌ Percepción de "bug" persiste
- ❌ Experiencia de usuario sigue siendo confusa
- ❌ Deuda técnica permanece

**Razón de rechazo:** No aceptable - problema afecta UX y percepción de calidad del sistema.

---

## Implementación

### Archivos Modificados/Creados

**Seeds (DEV y PROD):**
```
apps/database/seeds/dev/educational_content/
├── 03-exercises-module2.sql  [✅ VALIDADO - Correcto]
└── 04-exercises-module3.sql  [✅ VALIDADO - Correcto]

apps/database/seeds/prod/educational_content/
├── 03-exercises-module2.sql  [✅ VALIDADO - Correcto]
└── 04-exercises-module3.sql  [✅ VALIDADO - Correcto]
```

**Documentación:**
```
docs/90-adr/
└── ADR-017-estandarizacion-recompensas-xp-ejercicios.md  [ESTE ARCHIVO]

orchestration/agentes/architecture-analyst/
└── analisis-progreso-ejercicios-modulos-2025-11-24/
    └── REPORTE-ANALISIS-INCONSISTENCIAS-XP-RECOMPENSAS.md  [CREADO]

orchestration/agentes/database/
└── estandarizacion-xp-modulo2-2025-11-24/
    ├── README.md
    ├── REPORTE-VALIDACION-COMPLETA.md
    └── COMANDOS-VALIDACION.sh
```

**NOTA IMPORTANTE:** Siguiendo la **DIRECTIVA-POLITICA-CARGA-LIMPIA**, NO se crearon migrations. La base de datos SIEMPRE se recrea desde seeds actualizados.

### Código Específico

**Cambios en Seeds (líneas exactas):**

Módulo 2 (`03-exercises-module2.sql`):
```sql
-- Todos los ejercicios actualizados a:
-- 150, 30,  ✅ VALORES DIFERENCIADOS (2025-11-28)
```

Módulo 3 (`04-exercises-module3.sql`):
```sql
-- Ejercicio 3.1 (línea 143):
-- ANTES: 18, 3,
-- DESPUÉS: 100, 20,  ✅ CORREGIDO
```

**Script de Recreación de Base de Datos:**
```bash
# Política de Carga Limpia (DIRECTIVA-POLITICA-CARGA-LIMPIA.md)
# SIEMPRE recrear base de datos desde seeds, NO usar migrations

cd apps/database
./drop-and-recreate-database.sh

# El script ejecuta automáticamente:
# 1. DROP DATABASE (si existe)
# 2. CREATE DATABASE
# 3. Ejecuta DDL (schemas, tables, functions, triggers)
# 4. Carga seeds (con valores corregidos de 100 XP / 20 ML Coins)
# 5. Valida integridad
```

---

## Validación

### Criterios de Éxito

- [x] Seeds actualizados con valores estándar (100 XP / 20 ML Coins)
- [x] Seeds validados en ambos ambientes (DEV y PROD)
- [ ] **Base de datos recreada desde seeds actualizados** (única opción permitida)
- [ ] Query de validación confirma: min_xp = max_xp = 100 en todos los módulos
- [ ] Testing funcional: Usuarios reciben 100 XP al completar cualquier ejercicio
- [ ] Testing de progresión: Usuario alcanza Nacom al completar Módulo 2 (500 XP)

### Pruebas Requeridas

**1. Query de Validación (Post-Migración):**
```sql
SELECT
    mod.module_code,
    COUNT(ex.id) as total_ejercicios,
    MIN(ex.xp_reward) as min_xp,
    MAX(ex.xp_reward) as max_xp,
    AVG(ex.xp_reward)::INTEGER as avg_xp,
    SUM(ex.xp_reward) as total_xp_disponible,
    CASE
        WHEN MIN(ex.xp_reward) = MAX(ex.xp_reward) AND MIN(ex.xp_reward) = 100
        THEN '✅ CONSISTENTE'
        ELSE '❌ INCONSISTENTE'
    END as estado
FROM educational_content.modules mod
JOIN educational_content.exercises ex ON ex.module_id = mod.id
WHERE mod.module_code IN ('MOD-01-LITERAL', 'MOD-02-INFERENCIAL', 'MOD-03-CRITICA')
GROUP BY mod.module_code
ORDER BY mod.module_code;
```

**Resultado esperado:**
```
module_code        | total_ejercicios | min_xp | max_xp | avg_xp | total_xp | estado
───────────────────┼──────────────────┼────────┼────────┼────────┼──────────┼─────────────
MOD-01-LITERAL     | 5                | 100    | 100    | 100    | 500      | ✅ CONSISTENTE
MOD-02-INFERENCIAL | 5                | 100    | 100    | 100    | 500      | ✅ CONSISTENTE
MOD-03-CRITICA     | 9                | 100    | 100    | 100    | 900      | ✅ CONSISTENTE
```

**2. Test de Progresión de Rangos:**
```typescript
it('should promote to Nacom after completing Module 2', async () => {
  const user = await createTestUser({ current_rank: 'Ajaw', total_xp: 0 });

  // Completar 5 ejercicios del Módulo 2
  for (let i = 1; i <= 5; i++) {
    await completeExercise(user.id, `MOD-02-EX-0${i}`);
  }

  const stats = await getUserStats(user.id);
  expect(stats.total_xp).toBe(500); // 5 × 100 XP
  expect(stats.current_rank).toBe('Nacom'); // Promoción automática
});
```

---

## Métricas de Éxito

### Antes del Fix

**Distribución de XP por Módulo:**
```
Módulo 1: 500 XP (consistente)
Módulo 2: 335 XP (inconsistente)
Módulo 3: 818 XP (inconsistente)
Total: 1,653 XP
```

**Desviación estándar:**
```
Módulo 1: σ = 0 XP (CV = 0%)
Módulo 2: σ = 41.5 XP (CV = 62%)   ← Muy alta
Módulo 3: σ = 27.3 XP (CV = 30%)   ← Alta
```

### Después del Fix (Esperado)

**Distribución de XP por Módulo:**
```
Módulo 1: 500 XP (consistente)
Módulo 2: 500 XP (consistente)  ← +165 XP
Módulo 3: 900 XP (consistente)  ← +82 XP
Total: 1,900 XP (+247 XP = +15%)
```

**Desviación estándar:**
```
Módulo 1: σ = 0 XP (CV = 0%)  ✅
Módulo 2: σ = 0 XP (CV = 0%)  ✅
Módulo 3: σ = 0 XP (CV = 0%)  ✅
```

### Monitorear

**Post-implementación (primeras 48 horas):**
- [ ] Tasa de completación de ejercicios (debería mantenerse o aumentar)
- [ ] Feedback de usuarios (monitorear comentarios sobre recompensas)
- [ ] Distribución de rangos (más usuarios alcanzando Nacom/Ah K'in)
- [ ] Balance de ML Coins (impacto despreciable esperado: <5%)

**Query de monitoreo:**
```sql
-- Distribución de rangos (debería ser más piramidal)
SELECT
    current_rank,
    COUNT(*) as usuarios,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as porcentaje
FROM gamification_system.user_stats
GROUP BY current_rank
ORDER BY
    CASE current_rank
        WHEN 'Ajaw' THEN 1
        WHEN 'Nacom' THEN 2
        WHEN 'Ah K''in' THEN 3
        WHEN 'Halach Uinic' THEN 4
        WHEN 'K''uk''ulkan' THEN 5
    END;
```

---

## Referencias

### Documentación Relacionada

- **ADR-016:** Simplificar Backend XP Acumulación (2025-11-24)
  - `docs/90-adr/ADR-016-simplificar-backend-xp-acumulacion.md`
  - Corrigió bug de resta de XP, estableció arquitectura de triggers

- **ET-GAM-003:** Sistema de Rangos Maya
  - `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`
  - Define umbrales de rangos: 500, 1000, 1500, 2250 XP

- **RF-GAM-003:** Requerimiento Funcional Rangos
  - `docs/01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-003-rangos-maya.md`

### Reporte de Análisis

- **REPORTE-ANALISIS-INCONSISTENCIAS-XP-RECOMPENSAS.md** (800+ líneas)
  - `orchestration/agentes/architecture-analyst/analisis-progreso-ejercicios-modulos-2025-11-24/`
  - Análisis estadístico detallado
  - Comparativa de recompensas por módulo
  - Análisis de causa raíz (3 hipótesis)
  - Plan de implementación completo

### Código DDL

**Triggers:**
- `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion_on_xp_gain.sql`
- `apps/database/ddl/schemas/progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql`

**Funciones:**
- `apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql`
- `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`

**Seeds:**
- `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`
- `apps/database/seeds/dev/educational_content/03-exercises-module2.sql`
- `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`

**Migration:**
- `apps/database/migrations/2025-11-24-estandarizar-xp-rewards-modulos-2-3.sql`

---

## Decisiones Futuras

### 1. Política de Recompensas Variables (si se desea en el futuro)

**SI en el futuro se quiere diferenciar recompensas:**

**Requisitos obligatorios:**
1. **Documentar en ET-GAM-003** la política de diferenciación
2. **Comunicar en UI** claramente:
   - Badge "Bonus" para ejercicios con >100 XP
   - Badge "Repaso" para ejercicios con <100 XP
   - Tooltip explicativo del por qué
3. **Criterios objetivos** de diferenciación (no arbitrario):
   - Tiempo estimado de completación
   - Complejidad pedagógica documentada
   - Requisitos de habilidades previas

**Rangos sugeridos:**
- Mini-repaso: 25-50 XP
- Ejercicio estándar: 100 XP
- Bonus/Desafío: 150-200 XP
- Desafío épico (mensual): 500 XP

### 2. Sistema de Multiplicadores de Rango

**Alternativa a recompensas variables:** Mantener ejercicios a 100 XP base, pero aplicar multiplicadores de rango.

**Ya implementado en ADR-016:**
- Ajaw: 1.0x
- Nacom: 1.10x (+10%)
- Ah K'in: 1.15x (+15%)
- Halach Uinic: 1.20x (+20%)
- K'uk'ulkan: 1.25x (+25%)

**Ventaja:** Recompensa progresión sin inconsistencias percibidas.

---

## Estado Actual (2025-11-28)

**✅ Análisis:** Completado (800+ líneas de documentación)
**✅ Seeds:** Actualizados y validados (Módulos 2 y 3)
**✅ Migration:** Script creado (idempotente y transaccional)
**✅ Documentación:** ADR-017 creado (este archivo)
**✅ Módulo 2:** Actualizado con valores diferenciados (150 XP / 30 ML Coins) para reconocer mayor complejidad cognitiva
**⏳ Validación:** Pendiente de recrear BD o ejecutar migration
**⏳ Testing:** Pendiente de validación funcional post-implementación

**Próximo paso:** Ejecutar migration script O recrear base de datos desde seeds actualizados.

---

**Estado:** Aceptada e Implementada
**Próxima revisión:** Después de validación en staging
**Aprobado por:** Architecture-Analyst
**Fecha de aprobación:** 2025-11-24

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-24 | Creación inicial del ADR - Decisión de estandarización aprobada e implementada |
| 1.1 | 2025-11-28 | Agregada excepción para Módulo 2: 150 XP / 30 ML Coins (mayor complejidad cognitiva). Backend actualizado para usar xp_reward del ejercicio. |
