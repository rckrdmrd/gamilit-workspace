# PLAN DE CORRECCIONES - MÓDULOS 4, 5 Y GAMIFICACIÓN

**Fecha:** 2025-12-15
**Tech Leader:** Claude Code
**Proyecto:** GAMILIT
**Versión:** 1.0

---

## 1. RESUMEN EJECUTIVO

Este plan documenta las correcciones necesarias para que los ejercicios de Módulos 4 y 5 funcionen al 100% con todas las integraciones de gamificación.

### Estado Actual
- **Database:** 85% implementado
- **Backend:** 75% implementado
- **Frontend:** 67% implementado
- **Gamificación:** 90% implementado

### Objetivo
Llevar todas las capas al **100% de funcionalidad** para M4 y M5 con gamificación completa.

---

## 2. ISSUES CRÍTICOS (P0) - REQUIEREN CORRECCIÓN INMEDIATA

### P0-DB-001: Sincronizar Seeds M5 PROD con DEV

**Problema:** Seeds de producción tienen placeholders, DEV tiene contenido completo expandido.

**Archivos afectados:**
- `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`

**Acción requerida:**
- Reemplazar contenido placeholder con contenido completo de DEV
- Sincronizar: config, content, solution, rubric, hints

**Dependencias:**
- Ninguna

**Impacto si no se corrige:**
- Ejercicios M5 en producción mostrarán "En desarrollo"
- Estudiantes no podrán completar Módulo 5

---

### P0-DB-002: Establecer requires_manual_grading en Seeds M4/M5

**Problema:** Campo `requires_manual_grading` no está configurado como `true` para ejercicios que requieren evaluación manual.

**Archivos afectados:**
- `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`
- `apps/database/seeds/dev/educational_content/06-exercises-module5.sql`
- `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
- `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`

**Acción requerida:**
- Agregar `requires_manual_grading = true` a todos los INSERT de M4 y M5

**Dependencias:**
- P0-DB-001 debe completarse primero para M5 PROD

**Impacto si no se corrige:**
- Sistema puede intentar auto-evaluar ejercicios creativos
- Comportamiento inconsistente

---

### P0-BE-001: Registrar DTOs Existentes en ExerciseAnswerValidator

**Problema:** 5 DTOs de M4 existen pero NO están registrados en el switch/case del validator.

**Archivo afectado:**
- `apps/backend/src/modules/progress/dto/answers/exercise-answer.validator.ts`

**DTOs a registrar:**
1. `verificador_fake_news` → VerificadorFakeNewsAnswerDto
2. `infografia_interactiva` → InfografiaInteractivaAnswerDto
3. `quiz_tiktok` → QuizTikTokAnswerDto
4. `navegacion_hipertextual` → NavegacionHipertextualAnswerDto
5. `analisis_memes` → AnalisisMemesAnswerDto

**Acción requerida:**
- Agregar 5 casos al método `getDtoForType()`
- Importar los DTOs correspondientes

**Dependencias:**
- Ninguna

**Impacto si no se corrige:**
- Cualquier submission de M4 fallará con `BadRequestException: Unknown exercise type`

---

### P0-BE-002: Crear DTOs Faltantes para M4

**Problema:** 4 exercise_types de M4 no tienen DTO de validación.

**DTOs a crear:**
1. `apps/backend/src/modules/educational/dto/module4/resena-critica-answer.dto.ts`
2. `apps/backend/src/modules/educational/dto/module4/chat-literario-answer.dto.ts`
3. `apps/backend/src/modules/educational/dto/module4/email-formal-answer.dto.ts`
4. `apps/backend/src/modules/educational/dto/module4/ensayo-argumentativo-answer.dto.ts`

**Estructura esperada por tipo:**

```typescript
// resena-critica-answer.dto.ts
export class ResenaCriticaAnswerDto {
  @IsNumber()
  rating: number;  // 1-5 estrellas

  @IsString()
  @MinLength(100)
  reviewText: string;

  @IsObject()
  criteria: {
    clarity: number;
    argumentation: number;
    evidence: number;
  };
}

// chat-literario-answer.dto.ts
export class ChatLiterarioAnswerDto {
  @IsArray()
  messages: ChatMessageDto[];

  @IsNumber()
  conversationScore: number;
}

// email-formal-answer.dto.ts
export class EmailFormalAnswerDto {
  @IsString()
  subject: string;

  @IsString()
  @MinLength(50)
  body: string;

  @IsString()
  tone: 'formal' | 'semi-formal';

  @IsArray()
  structureChecklist: string[];
}

// ensayo-argumentativo-answer.dto.ts
export class EnsayoArgumentativoAnswerDto {
  @IsString()
  @MinLength(300)
  content: string;

  @IsArray()
  arguments: ArgumentDto[];

  @IsObject()
  structure: {
    hasIntroduction: boolean;
    hasDevelopment: boolean;
    hasConclusion: boolean;
  };
}
```

**Dependencias:**
- Debe registrarse en validator después de creación (P0-BE-001-EXT)

**Impacto si no se corrige:**
- 4 tipos de ejercicio M4 no pueden recibir submissions

---

### P0-BE-003: Crear DTO para ComicDigital (M5)

**Problema:** comic_digital no tiene DTO de validación.

**Archivo a crear:**
- `apps/backend/src/modules/educational/dto/module5/comic-digital-answer.dto.ts`

**Estructura esperada:**

```typescript
export class ComicDigitalAnswerDto {
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(6)
  panels: ComicPanelDto[];
}

export class ComicPanelDto {
  @IsNumber()
  panelNumber: number;

  @IsString()
  dialogue: string;

  @IsString()
  narration: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
```

**Dependencias:**
- Debe registrarse en validator después de creación

**Impacto si no se corrige:**
- ComicDigital submissions fallarán

---

### P0-FE-001: Integrar useExerciseSubmission en 4 Mecánicas M4

**Problema:** 4 componentes de ejercicio no tienen integración con el hook de submission.

**Archivos afectados:**
1. `apps/frontend/src/features/mechanics/module4/EmailFormal/EmailFormalExercise.tsx`
2. `apps/frontend/src/features/mechanics/module4/EnsayoArgumentativo/EnsayoArgumentativoExercise.tsx`
3. `apps/frontend/src/features/mechanics/module4/ChatLiterario/ChatLiterarioExercise.tsx`
4. `apps/frontend/src/features/mechanics/module4/ResenaCritica/ResenaCriticaExercise.tsx`

**Acción requerida:**
Para cada componente:
1. Importar `useExerciseSubmission` hook
2. Implementar handler de submit que llame al hook
3. Mostrar FeedbackModal con rewards (XP, ML Coins)
4. Invalidar queries después de success

**Patrón de implementación:**
```typescript
import { useExerciseSubmission } from '../../shared/hooks/useExerciseSubmission';

// Dentro del componente:
const { submit, isSubmitting } = useExerciseSubmission(exerciseId, {
  onSuccess: (result) => {
    setFeedback({
      type: 'success',
      score: result.score,
      xpEarned: result.rewards?.xp || 0,
      mlCoinsEarned: result.rewards?.mlCoins || 0,
    });
  }
});

// En el botón de enviar:
<button onClick={() => submit(answers)} disabled={isSubmitting}>
  {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
</button>
```

**Dependencias:**
- P0-BE-001 y P0-BE-002 deben completarse primero (backend debe poder recibir)

**Impacto si no se corrige:**
- Estudiantes completan ejercicios pero NO ganan recompensas
- Progress no se persiste

---

### P0-GAM-001: Garantizar Ejecución de detectAndGrantEarned

**Problema:** `detectAndGrantEarned()` no se ejecuta consistentemente en todos los flujos.

**Archivos afectados:**
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
- `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`

**Acción requerida:**
1. Verificar que la llamada existe en ambos servicios
2. Agregar logging para auditar ejecución
3. Asegurar que errores NO bloquean el flujo principal

**Código de corrección:**
```typescript
// En submitExercise() y submitAttempt()
try {
  const earnedAchievements = await this.achievementsService.detectAndGrantEarned(userId);
  this.logger.log(`[detectAndGrantEarned] User ${userId}: ${earnedAchievements.length} achievements detected`);
} catch (error) {
  // Log pero NO propagar - achievements es secundario
  this.logger.error(`[detectAndGrantEarned] Error for user ${userId}: ${error.message}`);
}
```

**Dependencias:**
- Ninguna

**Impacto si no se corrige:**
- Achievements no se otorgan automáticamente

---

## 3. ISSUES ALTOS (P1) - CORRECCIÓN RECOMENDADA

### P1-FE-001: Mostrar Achievements en FeedbackModal

**Problema:** Achievements desbloqueados no se muestran en UI después de completar ejercicio.

**Archivo afectado:**
- `apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`

**Acción requerida:**
- Agregar sección de achievements desbloqueados
- Mostrar icon, name, rarity de cada achievement

---

### P1-FE-002: Implementar Invalidación de Queries

**Problema:** Frontend no refetch automáticamente después de submissions.

**Archivos afectados:**
- `apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts`
- `apps/frontend/src/apps/student/hooks/useDashboardData.ts`

**Acción requerida:**
- En onSuccess de mutation, invalidar: dashboard, ranks, achievements, coins

---

### P1-BE-001: Implementar Validación de Achievement en Shop

**Problema:** `required_achievement_id` no se valida en compras.

**Archivo afectado:**
- `apps/backend/src/modules/gamification/services/shop.service.ts`

**Acción requerida:**
- Inyectar AchievementsService
- Validar que usuario tiene achievement requerido antes de permitir compra

---

### P1-DB-001: Normalizar Estructura de Rúbricas

**Problema:** M4 tiene solution sin rubric, M5 tiene rubric anidada en solution.

**Acción requerida:**
- Estandarizar: usar campo `rubric` separado en tabla exercises
- Actualizar seeds para consistencia

---

## 4. ISSUES MEDIOS (P2) - MEJORAS FUTURAS

### P2-FE-001: Notificación de Rank-Up
### P2-FE-002: Sincronizar AchievementsStore con Backend
### P2-BE-001: Implementar Skill Mastery Completo
### P2-DB-001: Crear Trigger XP para Manual Reviews

---

## 5. ORDEN DE EJECUCIÓN RECOMENDADO

### SPRINT 1 - P0 (BLOQUEADORES)

```
DÍA 1:
├─ P0-DB-001: Sincronizar Seeds M5 PROD
├─ P0-DB-002: Establecer requires_manual_grading
└─ Verificar: Recrear BD y probar seeds

DÍA 2:
├─ P0-BE-001: Registrar DTOs existentes en validator
├─ P0-BE-002: Crear 4 DTOs faltantes M4
├─ P0-BE-003: Crear DTO ComicDigital M5
└─ Verificar: npm run build && npm run test

DÍA 3:
├─ P0-FE-001: Integrar submission en 4 mecánicas
├─ P0-GAM-001: Garantizar detectAndGrantEarned
└─ Verificar: E2E test ejercicio completo M4/M5
```

### SPRINT 2 - P1 (MEJORAS CRÍTICAS)

```
DÍA 4:
├─ P1-FE-001: Mostrar Achievements en FeedbackModal
├─ P1-FE-002: Invalidación de queries
└─ Verificar: UX de rewards visible

DÍA 5:
├─ P1-BE-001: Validación achievement en Shop
├─ P1-DB-001: Normalizar rúbricas
└─ Verificar: Flujo completo shop
```

---

## 6. MATRIZ DE DEPENDENCIAS

```
P0-DB-001 ─────────────────────────────────┐
                                           │
P0-DB-002 ←── (depende de P0-DB-001 para M5)│
                                           │
P0-BE-001 ─────────────────────────────────┤
           ↓                               │
P0-BE-002 ←── (debe registrarse después)   │
           ↓                               │
P0-BE-003 ←── (debe registrarse después)   │
           ↓                               │
P0-FE-001 ←── (requiere backend funcional) │
                                           │
P0-GAM-001 ────────────────────────────────┘
           ↓
P1-FE-001 ←── (requiere P0-GAM-001)
           ↓
P1-FE-002 ←── (mejora de P0-FE-001)
```

---

## 7. CHECKLIST DE VALIDACIÓN POST-CORRECCIÓN

### Database
- [ ] Seeds M5 PROD tienen contenido completo (no placeholders)
- [ ] requires_manual_grading = true para todos M4/M5
- [ ] BD recreada sin errores
- [ ] Seeds cargan correctamente

### Backend
- [ ] npm run build pasa sin errores
- [ ] npm run lint pasa
- [ ] 9 DTOs M4 registrados en validator
- [ ] 3 DTOs M5 registrados en validator
- [ ] POST /exercises/:id/submit funciona para M4
- [ ] POST /exercises/:id/submit funciona para M5

### Frontend
- [ ] npm run build pasa sin errores
- [ ] 9 mecánicas M4 tienen useExerciseSubmission
- [ ] 3 mecánicas M5 tienen useExerciseSubmission
- [ ] FeedbackModal muestra XP y ML Coins
- [ ] Achievements se muestran al desbloquear

### Gamificación
- [ ] XP se otorga al completar ejercicio
- [ ] ML Coins se otorgan al completar ejercicio
- [ ] Achievements se detectan automáticamente
- [ ] Rank-up funciona cuando se alcanza threshold
- [ ] Misiones se actualizan

### E2E
- [ ] Estudiante completa ejercicio M4 → gana rewards
- [ ] Estudiante completa ejercicio M5 → gana rewards
- [ ] Progress se refleja en dashboard
- [ ] Rank sube cuando corresponde

---

## 8. ESTIMACIÓN DE ESFUERZO

| Issue | Complejidad | Tiempo Estimado |
|-------|-------------|-----------------|
| P0-DB-001 | Media | 1-2 horas |
| P0-DB-002 | Baja | 30 min |
| P0-BE-001 | Baja | 30 min |
| P0-BE-002 | Media | 2-3 horas |
| P0-BE-003 | Baja | 30 min |
| P0-FE-001 | Media | 2-3 horas |
| P0-GAM-001 | Baja | 1 hora |
| **TOTAL P0** | - | **~8-10 horas** |

---

## 9. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| DTOs no validan correctamente | Media | Alto | Crear tests unitarios para cada DTO |
| Seeds rompen BD existente | Baja | Alto | Usar transacciones, backup antes de aplicar |
| Frontend no conecta con backend | Media | Alto | Probar endpoints con curl antes de integrar |
| Gamificación falla silenciosamente | Media | Medio | Agregar logging extensivo |

---

## 10. NOTAS FINALES

Este plan fue generado por análisis de 4 subagentes especializados:
- Database Analyst
- Backend Analyst
- Frontend Analyst
- Gamification Analyst

**Próximo paso:** Validación del plan (FASE 4) y aprobación para ejecución.

---

**Generado:** 2025-12-15
**Tech Leader:** Claude Code
**Proyecto:** GAMILIT
