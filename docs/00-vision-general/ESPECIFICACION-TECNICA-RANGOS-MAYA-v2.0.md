# Especificación Técnica - Sistema de Rangos Maya v2.0

**Fecha:** 2025-11-16
**Versión:** 2.0
**Estado:** APROBADO
**Autores:** Equipo GAMILIT
**Basado en:** DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.docx

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Cambios vs Versión 1.0](#cambios-vs-versión-10)
3. [Definición de Rangos](#definición-de-rangos)
4. [Mecánicas de Progresión](#mecánicas-de-progresión)
5. [Recompensas por Rango](#recompensas-por-rango)
6. [Implementación Técnica](#implementación-técnica)
7. [Ejemplos de Progresión](#ejemplos-de-progresión)
8. [Sincronización con Documento de Diseño](#sincronización-con-documento-de-diseño)

---

## 🎯 Resumen Ejecutivo

El sistema de rangos Maya v2.0 ajusta los umbrales de XP para alinearse con el contenido educativo disponible en la fase inicial de GAMILIT (5 módulos de comprensión lectora).

### Objetivos del Sistema

- ✅ **Progresión justa**: Todos los rangos son alcanzables con el contenido disponible
- ✅ **Motivación continua**: Rangos espaciados para mantener engagement
- ✅ **Coherencia cultural**: Mantiene jerarquía maya histórica
- ✅ **Escalabilidad**: Preparado para expansión futura de contenido

### XP Máximo Alcanzable (Fase Inicial)

```
5 módulos × 500 XP/módulo = 2,500 XP máximo
```

---

## 🔄 Cambios vs Versión 1.0

### Versión 1.0 (OBSOLETA - 2025-11-03)

| Rango | XP Min | XP Max | Problema |
|-------|--------|--------|----------|
| Ajaw | 0 | 999 | ✅ OK |
| Nacom | 1,000 | 2,999 | ✅ OK |
| Ah K'in | 3,000 | 5,999 | ❌ Inalcanzable (solo 2,500 XP disponible) |
| Halach Uinic | 6,000 | 9,999 | ❌ Inalcanzable |
| K'uk'ulkan | 10,000+ | ∞ | ❌ Inalcanzable |

**Resultado:** Solo 2 de 5 rangos eran alcanzables con el contenido existente.

### Versión 2.0 (ACTUAL - 2025-11-16)

| Rango | XP Min | XP Max | Estado |
|-------|--------|--------|--------|
| Ajaw | 0 | 499 | ✅ Alcanzable (< 1 módulo) |
| Nacom | 500 | 999 | ✅ Alcanzable (1 módulo) |
| Ah K'in | 1,000 | 1,499 | ✅ Alcanzable (2 módulos) |
| Halach Uinic | 1,500 | 2,249 | ✅ Alcanzable (3+ módulos) |
| K'uk'ulkan | 2,250+ | ∞ | ✅ Alcanzable (casi todos con alta perfección) |

**Resultado:** Los 5 rangos son alcanzables.

---

## 🏛️ Definición de Rangos

### Rango 1: Ajaw (Señor)

**Significado Cultural:** Líder supremo, inicio del camino del conocimiento

**Requisitos:**
- **XP Mínimo:** 0 XP
- **XP Máximo:** 499 XP
- **Equivalente en Módulos:** Menos de 1 módulo completo

**Características:**
- Rango inicial de todos los usuarios
- Representa los primeros pasos en el aprendizaje
- Sin requisitos previos

---

### Rango 2: Nacom (Capitán de Guerra)

**Significado Cultural:** Comandante militar, guerrero en entrenamiento

**Requisitos:**
- **XP Mínimo:** 500 XP
- **XP Máximo:** 999 XP
- **Equivalente en Módulos:** 1 módulo completo

**Características:**
- Primer ascenso de rango
- Demuestra compromiso con el aprendizaje
- Bono de ML Coins al alcanzar

**Recompensas al Alcanzar:**
- 🪙 **+100 ML Coins** (bonus único)
- 📊 **+10% XP Multiplier** en futuros ejercicios
- 🎖️ **Badge "Primer Guerrero"**

---

### Rango 3: Ah K'in (Sacerdote del Sol)

**Significado Cultural:** Guía espiritual y del conocimiento

**Requisitos:**
- **XP Mínimo:** 1,000 XP
- **XP Máximo:** 1,499 XP
- **Equivalente en Módulos:** 2 módulos completos

**Características:**
- Nivel intermedio de maestría
- Dominio de comprensión literal e inferencial
- Acceso a contenido exclusivo

**Recompensas al Alcanzar:**
- 🪙 **+250 ML Coins** (bonus único)
- 📊 **+15% XP Multiplier**
- 🎨 **Avatar personalizado**
- 🔓 **Acceso a misiones especiales**

---

### Rango 4: Halach Uinic (Hombre Verdadero)

**Significado Cultural:** Líder político y comunitario

**Requisitos:**
- **XP Mínimo:** 1,500 XP
- **XP Máximo:** 2,249 XP
- **Equivalente en Módulos:** 3+ módulos completos

**Características:**
- Nivel avanzado de maestría
- Dominio de comprensión crítica y digital
- Reconocimiento en leaderboard

**Recompensas al Alcanzar:**
- 🪙 **+500 ML Coins** (bonus único)
- 📊 **+20% XP Multiplier**
- 👑 **Badge especial en leaderboard**
- 🎤 **Privilegios de mentor**
- 🔓 **Contenido exclusivo premium**

---

### Rango 5: K'uk'ulkan (Serpiente Emplumada)

**Significado Cultural:** Deidad, nivel legendario de maestría

**Requisitos:**
- **XP Mínimo:** 2,250 XP
- **XP Máximo:** ∞ (sin límite)
- **Equivalente en Módulos:** 4.5+ módulos con alta perfección

**Características:**
- **Rango máximo** del sistema
- Requiere excelencia en todos los módulos
- Reconocimiento permanente como maestro

**Recompensas al Alcanzar:**
- 🪙 **+1,000 ML Coins** (bonus único)
- 📊 **+25% XP Multiplier**
- 🐉 **Insignia legendaria permanente**
- 🏆 **Título "Maestro Maya"**
- 🎁 **Certificado digital descargable**
- 🌟 **Aparición destacada en Hall of Fame**

---

## 🎮 Mecánicas de Progresión

### Cálculo de XP por Actividad

| Actividad | XP Base | Notas |
|-----------|---------|-------|
| Ejercicio completado (correcto) | 100 XP | Por ejercicio |
| Ejercicio con errores | 50-80 XP | Proporcional a aciertos |
| Módulo completado | +50 XP | Bonus de completitud |
| Racha de 3 días | +25 XP | Bonus de consistencia |
| Racha de 7 días | +100 XP | Bonus semanal |
| Perfección en ejercicio | +20 XP | 100% sin pistas |

### Distribución XP por Módulo

Cada módulo otorga aproximadamente **500 XP** distribuidos así:

```
5 ejercicios × 100 XP base = 500 XP base
+ 50 XP bonus completitud
+ Bonos por perfección/rachas (variables)
─────────────────────────────
≈ 550-600 XP por módulo completo
```

### Progresión Esperada de Usuario

**Usuario Promedio (sin bonos):**
```
Módulo 1 completo → 500 XP → Rango Nacom ✅
Módulo 2 completo → 1,000 XP → Rango Ah K'in ✅
Módulo 3 completo → 1,500 XP → Rango Halach Uinic ✅
Módulos 4-5 completos → 2,500 XP → Rango K'uk'ulkan ✅
```

**Usuario Excelente (con bonos):**
```
Módulo 1 perfecto → 600 XP → Rango Nacom ✅
Módulo 2 perfecto → 1,200 XP → Rango Ah K'in ✅
Módulo 3 perfecto → 1,800 XP → Rango Halach Uinic ✅
Módulo 4 perfecto → 2,400 XP → Rango K'uk'ulkan ✅
```

---

## 💰 Recompensas por Rango

### Tabla Completa de Recompensas

| Rango | ML Coins Bonus | XP Multiplier | Beneficios Especiales |
|-------|----------------|---------------|----------------------|
| **Ajaw** | +0 ML | 1.00x (100%) | Acceso básico |
| **Nacom** | +100 ML | 1.10x (110%) | Badge + Foro |
| **Ah K'in** | +250 ML | 1.15x (115%) | Avatar + Misiones |
| **Halach Uinic** | +500 ML | 1.20x (120%) | Mentor + Premium |
| **K'uk'ulkan** | +1,000 ML | 1.25x (125%) | Legendario + Hall of Fame |

### Acumulación Total de ML Coins

Un usuario que alcance K'uk'ulkan recibe:

```
100 (Nacom) + 250 (Ah K'in) + 500 (Halach Uinic) + 1,000 (K'uk'ulkan)
= 1,850 ML Coins en bonos de rango

+ ML Coins ganados por ejercicios
+ ML Coins por rachas
+ ML Coins por logros
─────────────────────────────
≈ 3,000-4,000 ML Coins totales
```

---

## 🔧 Implementación Técnica

### 1. Base de Datos (PostgreSQL)

**Ubicación:** `apps/database/seeds/prod/gamification_system/03-maya_ranks.sql`

**Valores a actualizar:**

```sql
INSERT INTO gamification_system.maya_ranks (
    rank_name, min_xp_required, max_xp_threshold, ml_coins_bonus, xp_multiplier
) VALUES
    ('Ajaw',         0,    499,  0,    1.00),
    ('Nacom',        500,  999,  100,  1.10),
    ('Ah K''in',     1000, 1499, 250,  1.15),
    ('Halach Uinic', 1500, 2249, 500,  1.20),
    ('K''uk''ulkan', 2250, NULL, 1000, 1.25);
```

### 2. Backend (NestJS/TypeScript)

**Ubicación:** `apps/backend/src/modules/gamification/services/ranks.service.ts`

**Constantes a actualizar:**

```typescript
private readonly RANK_CONFIG: Record<MayaRank, RankConfig> = {
  [MayaRank.AJAW]: {
    xp_min: 0,
    xp_max: 499,
    ml_coins_bonus: 0,
    xp_multiplier: 1.00,
    next_rank: MayaRank.NACOM,
  },
  [MayaRank.NACOM]: {
    xp_min: 500,
    xp_max: 999,
    ml_coins_bonus: 100,
    xp_multiplier: 1.10,
    next_rank: MayaRank.AH_KIN,
  },
  [MayaRank.AH_KIN]: {
    xp_min: 1000,
    xp_max: 1499,
    ml_coins_bonus: 250,
    xp_multiplier: 1.15,
    next_rank: MayaRank.HALACH_UINIC,
  },
  [MayaRank.HALACH_UINIC]: {
    xp_min: 1500,
    xp_max: 2249,
    ml_coins_bonus: 500,
    xp_multiplier: 1.20,
    next_rank: MayaRank.KUKUKULKAN,
  },
  [MayaRank.KUKUKULKAN]: {
    xp_min: 2250,
    xp_max: Infinity,
    ml_coins_bonus: 1000,
    xp_multiplier: 1.25,
    next_rank: null,
  },
};
```

### 3. Frontend (React/TypeScript)

**Ubicación:** `apps/frontend/src/shared/constants/ranks.constants.ts`

**⚠️ NOTA IMPORTANTE:** Frontend actualmente usa ML Coins en lugar de XP. Esto debe corregirse para usar XP como fuente de verdad.

**Valores a actualizar:**

```typescript
export const MAYA_RANKS_XP: Record<MayaRank, RankConfigXP> = {
  [MayaRank.AJAW]: {
    id: MayaRank.AJAW,
    name: 'Ajaw',
    level: 1,
    xpMin: 0,
    xpMax: 499,
    mlCoinsBonus: 0,
    xpMultiplier: 1.00,
  },
  [MayaRank.NACOM]: {
    id: MayaRank.NACOM,
    name: 'Nacom',
    level: 2,
    xpMin: 500,
    xpMax: 999,
    mlCoinsBonus: 100,
    xpMultiplier: 1.10,
  },
  // ... continuar para todos los rangos
};
```

---

## 📊 Ejemplos de Progresión

### Ejemplo 1: Estudiante Regular

**Perfil:**
- Completa ejercicios con 70-80% de aciertos
- No usa pistas frecuentemente
- Mantiene racha ocasional

**Progresión:**

| Actividad | XP Ganado | XP Acumulado | Rango |
|-----------|-----------|--------------|-------|
| Inicio | 0 | 0 | Ajaw |
| Módulo 1 completo (4/5 ejercicios perfectos) | 500 | 500 | **Nacom** ⬆️ |
| Módulo 2 completo (3/5 ejercicios perfectos) | 500 | 1,000 | **Ah K'in** ⬆️ |
| Módulo 3 completo (con algunas pistas) | 480 | 1,480 | Ah K'in |
| Módulo 4 completo | 500 | 1,980 | Ah K'in |
| Módulo 5 completo | 500 | 2,480 | **K'uk'ulkan** ⬆️ |

**Resultado:** ✅ Alcanza rango máximo

---

### Ejemplo 2: Estudiante Excelente

**Perfil:**
- Completa ejercicios con 95-100% de aciertos
- Nunca usa pistas
- Mantiene racha de 7 días

**Progresión:**

| Actividad | XP Ganado | XP Acumulado | Rango |
|-----------|-----------|--------------|-------|
| Inicio | 0 | 0 | Ajaw |
| Módulo 1 perfecto + racha 3 días | 570 | 570 | **Nacom** ⬆️ |
| Módulo 2 perfecto + racha 7 días | 650 | 1,220 | **Ah K'in** ⬆️ |
| Módulo 3 perfecto | 550 | 1,770 | **Halach Uinic** ⬆️ |
| Módulo 4 perfecto | 550 | 2,320 | **K'uk'ulkan** ⬆️ |

**Resultado:** ✅ Alcanza rango máximo en módulo 4

---

### Ejemplo 3: Estudiante con Dificultades

**Perfil:**
- Completa ejercicios con 50-60% de aciertos
- Usa pistas frecuentemente (penalización -20% XP)
- Sin rachas

**Progresión:**

| Actividad | XP Ganado | XP Acumulado | Rango |
|-----------|-----------|--------------|-------|
| Inicio | 0 | 0 | Ajaw |
| Módulo 1 completo (con pistas) | 400 | 400 | Ajaw |
| Módulo 2 completo (mejorando) | 450 | 850 | **Nacom** ⬆️ |
| Módulo 3 completo | 500 | 1,350 | **Ah K'in** ⬆️ |
| Módulo 4 completo | 500 | 1,850 | **Halach Uinic** ⬆️ |
| Módulo 5 completo | 500 | 2,350 | **K'uk'ulkan** ⬆️ |

**Resultado:** ✅ Alcanza rango máximo (requiere todos los módulos)

---

## 🔗 Sincronización con Documento de Diseño

### Módulos y Rangos

| Módulo | Tema | XP Total | Rango Esperado |
|--------|------|----------|----------------|
| **Módulo 1** | Comprensión Literal | 500 XP | Nacom |
| **Módulo 2** | Comprensión Inferencial | 1,000 XP | Ah K'in |
| **Módulo 3** | Comprensión Crítica | 1,500 XP | Halach Uinic |
| **Módulo 4** | Lectura Digital | 2,000 XP | Halach Uinic |
| **Módulo 5** | Producción Lectora | 2,500 XP | K'uk'ulkan |

### Distribución XP por Ejercicio (según documento v6.1)

Cada módulo tiene **5 ejercicios** × **100 XP base** = **500 XP base**

**Módulo 1: Comprensión Literal**
1. Crucigrama Científico: 100 XP
2. Línea de Tiempo: 100 XP
3. Completar Espacios: 100 XP
4. Verdadero o Falso: 100 XP
5. Sopa de Letras (bonus): 100 XP

**Módulo 2: Comprensión Inferencial**
1. Detective Textual: 100 XP
2. Construcción de Hipótesis: 100 XP
3. Predicción Narrativa: 100 XP
4. Puzzle de Contexto: 100 XP
5. Rueda de Inferencias: 100 XP

*(y así sucesivamente para módulos 3-5)*

---

## 📅 Plan de Migración

### Fase 1: Actualización de Base de Datos (Prioridad P0)

**Archivos a modificar:**
1. ✅ `apps/database/seeds/prod/gamification_system/03-maya_ranks.sql`
2. ✅ `apps/database/seeds/dev/gamification_system/05-maya_ranks.sql`
3. ✅ `apps/database/seeds/staging/gamification_system/04-maya_ranks.sql`

**Script de migración:**
```sql
-- Ver archivo: apps/database/scripts/migrations/2025-11-16_ajustar-umbrales-xp-rangos.sql
```

### Fase 2: Actualización de Backend (Prioridad P0)

**Archivos a modificar:**
1. ✅ `apps/backend/src/modules/gamification/services/ranks.service.ts`
2. ✅ `apps/backend/src/modules/gamification/services/ranks.service.spec.ts` (tests)

### Fase 3: Actualización de Frontend (Prioridad P0)

**Archivos a modificar:**
1. ✅ `apps/frontend/src/shared/constants/ranks.constants.ts`
2. ✅ `apps/frontend/src/features/gamification/ranks/types/ranksTypes.ts`
3. ✅ `apps/frontend/src/features/gamification/ranks/schemas/ranksSchemas.ts`

### Fase 4: Actualización de Documentación (Prioridad P1)

**Archivos a crear/modificar:**
1. ✅ Este documento (ESPECIFICACION-TECNICA-RANGOS-MAYA-v2.0.md)
2. ✅ Documento de diseño en Markdown
3. ✅ Actualizar ADRs si existen

### Fase 5: Testing y Validación (Prioridad P0)

1. ✅ Tests unitarios backend
2. ✅ Tests integración frontend-backend
3. ✅ Validación manual en staging
4. ✅ Deploy a producción

---

## 🐛 Bugs Conocidos a Resolver

### Bug #1: Frontend usa ML Coins en lugar de XP

**Ubicación:** `apps/frontend/src/shared/constants/ranks.constants.ts`

**Problema:**
- Frontend calcula rangos basándose en ML Coins acumulados
- Backend y DB usan XP como fuente de verdad
- Esto causa desincronización

**Solución:**
- Refactorizar frontend para usar XP
- Mantener ML Coins solo como recompensa, no como criterio de rango

### Bug #2: Inconsistencia en nombres de constantes

**Problema:**
- Backend usa `KUKUKULKAN`
- Frontend usa `KUKKULKAN` (con doble K)
- Base de datos usa `K'uk'ulkan`

**Solución:**
- Estandarizar a `KUKUKULKAN` en código TypeScript
- Mantener `K'uk'ulkan` en base de datos (correcto históricamente)

---

## ✅ Checklist de Implementación

- [ ] Actualizar seeds de base de datos (prod, dev, staging)
- [ ] Crear script de migración para usuarios existentes
- [ ] Actualizar `ranks.service.ts` en backend
- [ ] Actualizar tests de backend
- [ ] Refactorizar `ranks.constants.ts` en frontend (XP en lugar de ML Coins)
- [ ] Actualizar componentes UI que muestran progreso de rangos
- [ ] Validar cálculos de progreso en dashboard de estudiante
- [ ] Ejecutar tests end-to-end
- [ ] Actualizar documentación de API (Swagger)
- [ ] Crear/actualizar documento de diseño v6.1 en Markdown
- [ ] Comunicar cambios al equipo
- [ ] Deploy a staging
- [ ] Validación QA
- [ ] Deploy a producción
- [ ] Monitorear métricas post-deploy

---

## 📚 Referencias

- **Documento de Diseño:** DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.docx
- **Migración Original:** `apps/database/scripts/migrations/2025-11-03_homologar-rangos-maya.sql`
- **Enum Maya Rank:** `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql`
- **Tabla Maya Ranks:** `apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql`

---

## 📝 Changelog

### v2.0 (2025-11-16)
- ✅ Ajustados umbrales XP para alinearse con 2,500 XP máximo
- ✅ Ajustados ML Coins bonus (reducidos proporcionalmente)
- ✅ Ajustados XP multipliers (más conservadores)
- ✅ Todos los 5 rangos ahora son alcanzables
- ✅ Documentación técnica completa

### v1.0 (2025-11-03)
- ✅ Creación inicial del sistema
- ✅ Migración de rangos legacy a rangos maya correctos
- ❌ Umbrales XP demasiado altos (10,000+ XP requerido)

---

**FIN DEL DOCUMENTO**
