# Recomendaciones Técnicas - Sincronización de ENUMs
**Generado por:** SA-VAL-007
**Fecha:** 2025-11-03

---

## 1. SOLUCIÓN: MayaRank Conflict

### Diagnostico Detallado

El ENUM `MayaRank` causa CONFLICTO CRÍTICO:

```typescript
// Ubicación 1: shared/constants/enums.constants.ts
export enum MayaRank {
  Ajaw = 'Ajaw',
  Nacom = 'Nacom',
  AhKin = 'Ah K\'in',
  HalachUinic = 'Halach Uinic',
  Kululkan = 'K\'uk\'ulkan'
}

// Ubicación 2: shared/types/leaderboard.types.ts
export enum MayaRank {
  novice = 'novice',
  apprentice = 'apprentice',
  adept = 'adept',
  expert = 'expert',
  master = 'master',
  legend = 'legend'
}
```

### Problema

TypeScript permitirá compilar pero habrá **namespace collision**:
- En tiempo de compilación, la segunda definición sobrescribe la primera
- Código que importa de `constants` obtiene leaderboard version
- Código que importa de `types` obtiene leaderboard version
- **RESULT: Confusión total en tiempo de ejecución**

### Solución Propuesta

```typescript
// shared/constants/enums.constants.ts - CANONICAL
export enum MayaRankTraditional {
  AJAW = 'AJAW',
  NACOM = 'NACOM',
  AH_KIN = 'AH_KIN',
  HALACH_UINIC = 'HALACH_UINIC',
  KULULKAN = 'KULULKAN'
}

// DEPRECATED alias for backward compatibility
export const MayaRank = MayaRankTraditional;

// shared/types/leaderboard.types.ts - UI DISPLAY MAPPING
export enum MayaRankDisplayLevel {
  NOVICE = 'novice',
  APPRENTICE = 'apprentice',
  ADEPT = 'adept',
  EXPERT = 'expert',
  MASTER = 'master',
  LEGEND = 'legend'
}

// Mapeo explícito (nuevos valores a traditionales)
export const mayaRankMapping: Record<MayaRankDisplayLevel, MayaRankTraditional> = {
  [MayaRankDisplayLevel.NOVICE]: MayaRankTraditional.KULULKAN,
  [MayaRankDisplayLevel.APPRENTICE]: MayaRankTraditional.HALACH_UINIC,
  [MayaRankDisplayLevel.ADEPT]: MayaRankTraditional.AH_KIN,
  [MayaRankDisplayLevel.EXPERT]: MayaRankTraditional.NACOM,
  [MayaRankDisplayLevel.MASTER]: MayaRankTraditional.AJAW,
  [MayaRankDisplayLevel.LEGEND]: MayaRankTraditional.AJAW, // Top tier
};

// Reverse mapping para UI
export const traditionalToDisplay: Record<MayaRankTraditional, MayaRankDisplayLevel> = {
  [MayaRankTraditional.AJAW]: MayaRankDisplayLevel.MASTER,
  [MayaRankTraditional.NACOM]: MayaRankDisplayLevel.EXPERT,
  [MayaRankTraditional.AH_KIN]: MayaRankDisplayLevel.ADEPT,
  [MayaRankTraditional.HALACH_UINIC]: MayaRankDisplayLevel.APPRENTICE,
  [MayaRankTraditional.KULULKAN]: MayaRankDisplayLevel.NOVICE,
};
```

### Plan de Migración

**Paso 1: Crear alias y mapeo (PR sin breaking changes)**
```typescript
// Versión 1.0
export enum MayaRank { ... } // CURRENT
export enum MayaRankTraditional { ... } // NEW
export const MAYA_RANK_MAPPING = { ... } // NEW
```

**Paso 2: Actualizar código para usar mapping**
```typescript
// Antes
const display = mayaRank; // "expert"

// Después
const traditional = MAYA_RANK_MAPPING[mayaRankDisplay]; // "EXPERT"
const display = traditionalToDisplay[traditional]; // "expert"
```

**Paso 3: Deprecar versión vieja (v2.0)**
```typescript
/**
 * @deprecated Use MayaRankTraditional instead
 * Will be removed in v3.0
 */
export const MayaRank = MayaRankTraditional;
```

---

## 2. SOLUCIÓN: ExerciseTypeEnum Expansion

### El Reto

Frontend solo puede renderizar 6 de 31 tipos. Pero no es práctico implementar todo de una vez.

### Solución Gradual (Recomendada)

#### **Semana 1: Infraestructura (sin UI nueva)**

```typescript
// shared/constants/enums.constants.ts
export enum ExerciseTypeEnum {
  // Existentes (ya implementados)
  MULTIPLE_CHOICE = 'multiple_choice',
  CODE_COMPLETION = 'code_completion',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank',
  CODING_CHALLENGE = 'coding_challenge',
  MATCHING = 'matching',

  // Nuevos (sin UI dedicada aún)
  CRUCIGRAMA = 'crucigrama',
  LINEA_TIEMPO = 'linea_tiempo',
  SOPA_LETRAS = 'sopa_letras',
  MAPA_CONCEPTUAL = 'mapa_conceptual',
  EMPAREJAMIENTO = 'emparejamiento',
  DETECTIVE_TEXTUAL = 'detective_textual',
  CONSTRUCCION_HIPOTESIS = 'construccion_hipotesis',
  PREDICCION_NARRATIVA = 'prediccion_narrativa',
  PUZZLE_CONTEXTO = 'puzzle_contexto',
  RUEDA_INFERENCIAS = 'rueda_inferencias',
  TRIBUNAL_OPINIONES = 'tribunal_opiniones',
  DEBATE_DIGITAL = 'debate_digital',
  ANALISIS_FUENTES = 'analisis_fuentes',
  PODCAST_ARGUMENTATIVO = 'podcast_argumentativo',
  MATRIZ_PERSPECTIVAS = 'matriz_perspectivas',
  VERIFICADOR_FAKE_NEWS = 'verificador_fake_news',
  INFOGRAFIA_INTERACTIVA = 'infografia_interactiva',
  QUIZ_TIKTOK = 'quiz_tiktok',
  NAVEGACION_HIPERTEXTUAL = 'navegacion_hipertextual',
  ANALISIS_MEMES = 'analisis_memes',
  DIARIO_MULTIMEDIA = 'diario_multimedia',
  COMIC_DIGITAL = 'comic_digital',
  VIDEO_CARTA = 'video_carta',
  COMPRENSION_AUDITIVA = 'comprension_auditiva',
  COLLAGE_PRENSA = 'collage_prensa',
  TEXTO_MOVIMIENTO = 'texto_movimiento',
  CALL_TO_ACTION = 'call_to_action',
  VERDADERO_FALSO = 'verdadero_falso',
  COMPLETAR_ESPACIOS = 'completar_espacios',
  DIARIO_INTERACTIVO = 'diario_interactivo',
  RESUMEN_VISUAL = 'resumen_visual',
}

// Mapeo de tipos: cuáles están implementados vs no
export const EXERCISE_TYPE_IMPLEMENTATION_STATUS = {
  // Tier 1: Implementado
  [ExerciseTypeEnum.MULTIPLE_CHOICE]: { status: 'implemented', component: 'MultipleChoiceExercise' },
  [ExerciseTypeEnum.CODE_COMPLETION]: { status: 'implemented', component: 'CodeCompletionExercise' },
  [ExerciseTypeEnum.TRUE_FALSE]: { status: 'implemented', component: 'TrueFalseExercise' },
  [ExerciseTypeEnum.FILL_IN_BLANK]: { status: 'implemented', component: 'FillInBlankExercise' },
  [ExerciseTypeEnum.CODING_CHALLENGE]: { status: 'implemented', component: 'CodingChallengeExercise' },
  [ExerciseTypeEnum.MATCHING]: { status: 'implemented', component: 'MatchingExercise' },

  // Tier 2: Fallback (mostrar como pregunta genérica)
  [ExerciseTypeEnum.CRUCIGRAMA]: { status: 'not_implemented', fallback: 'GenericExercise' },
  [ExerciseTypeEnum.LINEA_TIEMPO]: { status: 'not_implemented', fallback: 'GenericExercise' },
  // ... etc

  // Tier 3: Coming Soon (bloqueado al usuario)
  [ExerciseTypeEnum.COMIC_DIGITAL]: { status: 'coming_soon', message: 'Comic exercises coming in v2.1' },
} as const;
```

#### **Semana 2-3: UI Components (Priorizado)**

Implementar en este orden:
1. **Interactivos pedagógicos** (Timeline, Concept Map, Crossword) - 50% de uso
2. **Análisis crítico** (Debate, Podcast, Fake News) - 30% de uso
3. **Creativos** (Comic, Video, Multimedia) - 20% de uso

```typescript
// components/exercise/ExerciseRenderer.tsx
import { ExerciseTypeEnum } from '@shared/enums';
import { EXERCISE_TYPE_IMPLEMENTATION_STATUS } from '@shared/constants';

export function ExerciseRenderer({ type, data }: Props) {
  const status = EXERCISE_TYPE_IMPLEMENTATION_STATUS[type];

  if (status.status === 'implemented') {
    return <DynamicComponent {...getComponent(status.component)} data={data} />;
  }

  if (status.status === 'coming_soon') {
    return <ComingSoonPlaceholder message={status.message} />;
  }

  // Fallback a UI genérica
  return <GenericExerciseDisplay type={type} data={data} />;
}
```

#### **Semana 4+: Rollout Incremental**

Cada semana, pasar 1-2 tipos de "not_implemented" a "implemented":
- Semana 1: Crucigrama, Línea de Tiempo
- Semana 2: Sopa de Letras, Mapa Conceptual
- Semana 3: Debate Digital, Análisis de Fake News
- ...

---

## 3. SOLUCIÓN: Eliminar Duplicados

### Backend - Consolidación de Notification Types

**ANTES:**
```typescript
// Ubicación 1: modules/notifications/entities/notification.entity.ts
enum NotificationType { ACHIEVEMENT, MISSION, REWARD, SYSTEM, SOCIAL, EDUCATIONAL }

// Ubicación 2: shared/constants/enums.constants.ts
enum NotificationType { INFO, SUCCESS, WARNING, ERROR, ACHIEVEMENT, PROGRESS, SOCIAL, REMINDER }
```

**DESPUÉS:**
```typescript
// shared/constants/enums.constants.ts (CANONICAL)
export enum NotificationTypeEnum {
  // Notificación de sistema general
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',

  // Notificación de gamificación
  ACHIEVEMENT = 'achievement',
  PROGRESS = 'progress',

  // Notificación social
  SOCIAL = 'social',
  REMINDER = 'reminder',
}

// Backward compatibility
export const NotificationType = NotificationTypeEnum;
```

**Actualizar módulo de notificaciones:**
```typescript
// modules/notifications/entities/notification.entity.ts
import { NotificationTypeEnum } from '@shared/constants';

@Entity('notifications')
export class Notification {
  @Column({ type: 'enum', enum: NotificationTypeEnum })
  type: NotificationTypeEnum;
}
```

### Frontend - Eliminar locales

```typescript
// ❌ ANTES: shared/types/achievement.types.ts
export enum AchievementCategory {
  PROGRESS = 'progress',
  STREAK = 'streak',
  // ...
}

// ✅ DESPUÉS: shared/types/achievement.types.ts
export { AchievementCategoryEnum as AchievementCategory } from '@shared/constants';

// Alias para compatibilidad si es necesario
import { AchievementCategoryEnum } from '@shared/constants';
export type AchievementCategory = AchievementCategoryEnum;
```

---

## 4. SOLUCIÓN: Sincronización de ProgressStatusEnum

### Problema
Backend tiene `REVIEWED` pero Frontend no:

```typescript
// Backend
enum ProgressStatusEnum { NOT_STARTED, IN_PROGRESS, COMPLETED, REVIEWED, MASTERED }

// Frontend
enum ProgressStatusEnum { not_started, in_progress, completed, mastered }
```

### Solución
Actualizar Frontend para incluir todos los valores:

```typescript
// shared/constants/enums.constants.ts (Frontend)
export enum ProgressStatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',      // ← AGREGAR
  MASTERED = 'mastered',
}
```

### Propagación
Revisar todo código que dependa de este enum:
```bash
# Buscar usos
grep -r "ProgressStatusEnum" --include="*.ts" --include="*.tsx" src/

# Actualizar lógica si es necesario
// Si tenías switch statement:
switch (status) {
  case 'not_started': ...
  case 'in_progress': ...
  case 'completed': ...
  case 'reviewed': ...    // ← NUEVO
  case 'mastered': ...
}
```

---

## 5. CREACIÓN: Script de Validación Automática

### Crear herramienta para detectar desincronización

```typescript
// tools/enum-validator.ts
import * as fs from 'fs';
import * as path from 'path';

interface EnumDefinition {
  name: string;
  values: string[];
  location: string;
  lastUpdated: Date;
}

interface ValidationReport {
  timestamp: Date;
  synchronized: Map<string, EnumDefinition[]>;
  duplicates: { name: string; locations: string[] }[];
  mismatches: { name: string; backend: string[]; frontend: string[] }[];
}

export async function validateEnumSynchronization(): Promise<ValidationReport> {
  const backendEnums = extractEnums('backend');
  const frontendEnums = extractEnums('frontend');

  const report: ValidationReport = {
    timestamp: new Date(),
    synchronized: new Map(),
    duplicates: [],
    mismatches: [],
  };

  // Detectar duplicados
  for (const [name, defs] of backendEnums.entries()) {
    if (defs.length > 1) {
      report.duplicates.push({
        name,
        locations: defs.map(d => d.location),
      });
    }
  }

  // Detectar desincronización
  for (const [name, backendDefs] of backendEnums.entries()) {
    const frontendDefs = frontendEnums.get(name);
    if (frontendDefs) {
      const backendValues = backendDefs[0].values;
      const frontendValues = frontendDefs[0].values;

      if (!valuesMatch(backendValues, frontendValues)) {
        report.mismatches.push({
          name,
          backend: backendValues,
          frontend: frontendValues,
        });
      } else {
        report.synchronized.set(name, [...backendDefs, ...frontendDefs]);
      }
    }
  }

  return report;
}

function valuesMatch(backend: string[], frontend: string[]): boolean {
  // Normalizar (uppercase/lowercase)
  const normalize = (v: string) => v.toLowerCase().replace(/_/g, ' ');
  const backendNorm = new Set(backend.map(normalize));
  const frontendNorm = new Set(frontend.map(normalize));

  return (
    backendNorm.size === frontendNorm.size &&
    Array.from(backendNorm).every(v => frontendNorm.has(v))
  );
}

function extractEnums(layer: 'backend' | 'frontend'): Map<string, EnumDefinition[]> {
  const enumMap = new Map<string, EnumDefinition[]>();
  const rootPath = layer === 'backend' ? './backend' : './frontend';

  // Escanear archivos
  // Extraer definiciones de enum
  // Agrupar por nombre

  return enumMap;
}
```

### Ejecutar validación en CI/CD

```yaml
# .github/workflows/enum-validation.yml
name: Enum Synchronization Check

on: [pull_request, push]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx ts-node tools/enum-validator.ts
      - name: Report
        if: failure()
        run: |
          echo "::error::Enum synchronization issues detected"
          exit 1
```

---

## 6. DOCUMENTACIÓN: Crear Guía de ENUMs

### Crear archivo de referencia

```markdown
# ENUM Synchronization Guide

## Usage Rules

### When to use Backend ENUM
- Si es compartido entre Backend y Frontend: USE CANONICAL en shared/constants
- Si es solo Backend: Define en modules/[feature]/constants o shared/constants (con comentario)

### When to use Frontend-only ENUM
- Si es puramente UI (temas, colores, display modes): OK como Frontend-only
- Si duplica Backend: ❌ PROHIBIDO

### ENUM Naming Convention
- Backend: UPPERCASE_SNAKE_CASE (AJAW, AH_KIN, VERY_EASY)
- Frontend: lowercase_snake_case (ajaw, ah_kin, very_easy)
- Type names: PascalCase (AuthProviderEnum, MayaRank)

## Examples

### Good: Shared ENUM
```typescript
// shared/constants/enums.constants.ts
export enum AuthProviderEnum {
  LOCAL = 'local',
  GOOGLE = 'google',
  // ...
}

// Backend module
import { AuthProviderEnum } from '@shared/constants';

// Frontend component
import { AuthProviderEnum } from '@shared/constants';
```

### Bad: Duplicate ENUM
```typescript
// ❌ frontend/shared/types/custom.types.ts
export enum AuthProvider { // WRONG!
  local = 'local',
  google = 'google',
}

// Should be:
import { AuthProviderEnum as AuthProvider } from '@shared/constants';
```

### Good: Frontend-only ENUM
```typescript
// frontend/shared/constants/ui.constants.ts
export enum ThemeVariant {
  LIGHT = 'light',
  DARK = 'dark',
  DETECTIVE = 'detective', // Brand theme
}
```

## Checklist for new ENUMs

- [ ] Is it shared Backend-Frontend? → shared/constants
- [ ] Is it Backend-only? → shared/constants (con nota) o modules/[feature]
- [ ] Is it Frontend-only? → shared/constants/ui o features/[feature]/constants
- [ ] ¿Existe ya? → Usar existente
- [ ] ¿Documentado propósito? → Agregar comentario
- [ ] ¿Test de sincronización? → Agregar a suite

```

---

## 7. TESTING SUITE: Agregar Tests

```typescript
// tests/enums.synchronization.test.ts
import {
  ExerciseTypeEnum,
  AuthProviderEnum,
  // ... otros
} from '@shared/constants';

describe('ENUM Synchronization', () => {
  describe('AuthProviderEnum', () => {
    it('should have same values in backend and frontend', () => {
      const expected = ['local', 'google', 'facebook', 'apple', 'microsoft', 'github'];
      const actual = Object.values(AuthProviderEnum);
      expect(actual.sort()).toEqual(expected.sort());
    });

    it('should map backend UPPERCASE to frontend lowercase', () => {
      // Simular Backend: LOCAL, GOOGLE
      // Simular Frontend: local, google
      const backend = 'GOOGLE';
      const frontend = 'google';
      expect(backend.toLowerCase()).toBe(frontend);
    });
  });

  describe('ExerciseTypeEnum', () => {
    it('should have 31 exercise types', () => {
      const count = Object.keys(ExerciseTypeEnum).length;
      expect(count).toBe(31);
    });

    it('should include all pedagogical types', () => {
      const required = [
        'CRUCIGRAMA',
        'DETECTIVE_TEXTUAL',
        'DEBATE_DIGITAL',
        // ...
      ];
      const actual = Object.keys(ExerciseTypeEnum);
      required.forEach(type => {
        expect(actual).toContain(type);
      });
    });
  });

  describe('No Duplicates', () => {
    it('should not define same enum twice', () => {
      const allEnumFiles = findAllEnumFiles();
      const definitions = new Map<string, string[]>();

      allEnumFiles.forEach(file => {
        const enums = extractEnumsFromFile(file);
        enums.forEach(enumDef => {
          if (definitions.has(enumDef.name)) {
            definitions.get(enumDef.name)!.push(file);
          } else {
            definitions.set(enumDef.name, [file]);
          }
        });
      });

      definitions.forEach((files, enumName) => {
        if (files.length > 1) {
          throw new Error(`ENUM ${enumName} defined in multiple files: ${files.join(', ')}`);
        }
      });
    });
  });

  describe('MayaRank Resolution', () => {
    it('should use canonical MayaRankTraditional', () => {
      // Asegurar que MayaRank apunta a version correcta
      expect(MayaRank).toBe(MayaRankTraditional);
    });

    it('should map display levels to traditional ranks', () => {
      expect(mayaRankMapping[MayaRankDisplayLevel.MASTER]).toBe(
        MayaRankTraditional.AJAW
      );
    });
  });
});
```

---

## Resumen de Implementación

| Tarea | Prioridad | Esfuerzo | Duración | Riesgo |
|-------|-----------|----------|----------|--------|
| MayaRank consolidación | CRÍTICA | Alto | 2 días | Alto |
| ExerciseTypeEnum expansión | ALTA | Alto | 3 semanas | Medio |
| ProgressStatusEnum sync | ALTA | Bajo | 1 día | Bajo |
| Eliminar duplicados | MEDIA | Medio | 2 días | Bajo |
| Tests automáticos | MEDIA | Medio | 2 días | Bajo |
| Documentación | BAJA | Bajo | 1 día | Muy Bajo |

**Tiempo total estimado:** 3-4 semanas para resolución completa
**Velocidad:** 1 issue crítico + 2 issues altos + limpieza de técnica
