# PLAN DE IMPLEMENTACIONES Y CORRECCIONES
## Módulos 3, 4 y 5 - Gamilit Platform

**Fecha:** 2025-12-23
**Analista:** Requirements-Analyst
**Versión:** 1.0
**Estado:** LISTO PARA VALIDACIÓN

---

## RESUMEN DEL PLAN

### Hallazgos Clave del Análisis

| Aspecto | Estado | Nota |
|---------|--------|------|
| Implementación de código | ✅ COMPLETO | Frontend, Backend, Database |
| Validador M4-M5 | ✅ IMPLEMENTADO | Función SQL funcional |
| Rangos Maya | ✅ CORRECTO v2.1 | K'uk'ulkan desde 1,900 XP |
| Seeds de ejercicios | ✅ COMPLETOS | M3, M4, M5 con contenido |
| **Documentación** | ⚠️ DESACTUALIZADA | VISION.md dice "BACKLOG" |
| Rúbricas Teacher | ⚠️ VERIFICAR | Posible ajuste para M4-M5 |

### Esfuerzo Estimado

| Prioridad | Correcciones | Horas Estimadas |
|-----------|--------------|-----------------|
| P0 - Crítico | 2 | 2-4 horas |
| P1 - Alto | 3 | 8-12 horas |
| P2 - Medio | 2 | 4-6 horas |
| **TOTAL** | 7 | 14-22 horas |

---

## CORRECCIONES P0 (CRÍTICAS)

### COR-001: Actualizar Documentación de Visión

**Archivo:** `docs/00-vision-general/VISION.md`

**Problema:** La documentación dice que M4 y M5 están en "BACKLOG - NO IMPLEMENTADOS" cuando en realidad están completamente implementados.

**Corrección:**
```markdown
# ANTES:
## 5. SISTEMA MODULAR PROGRESIVO
| Módulo 4 | 5 | Lectura Digital y Multimodal | BACKLOG |
| Módulo 5 | 3 | Producción y Expresión Lectora | BACKLOG |

# DESPUÉS:
## 5. SISTEMA MODULAR PROGRESIVO
| Módulo 4 | 5 | Lectura Digital y Multimodal | ✅ IMPLEMENTADO |
| Módulo 5 | 3 | Producción y Expresión Lectora | ✅ IMPLEMENTADO |
```

**Responsable:** Documentation-Agent
**Esfuerzo:** 1 hora
**Archivos a modificar:**
- `docs/00-vision-general/VISION.md`
- `docs/00-vision-general/RESUMEN-ACTUAL.md` (si existe)

---

### COR-002: Verificar Consistencia de Documentación XP

**Problema:** Algunas guías de prueba mencionan umbrales de XP distintos a los configurados en DB.

**Verificación Requerida:**

| Documento | Valor | DB (v2.1) | Estado |
|-----------|-------|-----------|--------|
| GUIA-PRUEBAS-MODULO5 | "500 XP = K'uk'ulkan" | 1,900 XP | ⚠️ CONFUSO |
| DocumentoDeDiseño v6.1 | ? | 1,900 XP | VERIFICAR |

**Corrección:**
- Revisar todos los documentos que mencionen umbrales de XP
- Estandarizar referencias a:
  - Ajaw: 0-499 XP
  - Nacom: 500-999 XP
  - Ah K'in: 1,000-1,499 XP
  - Halach Uinic: 1,500-1,899 XP
  - K'uk'ulkan: 1,900+ XP

**Responsable:** Documentation-Agent
**Esfuerzo:** 1-2 horas

---

## CORRECCIONES P1 (ALTAS)

### COR-003: Configurar Rúbricas Específicas para M4-M5 en RubricEvaluator

**Archivo:** `apps/frontend/src/apps/teacher/components/grading/RubricEvaluator.tsx`

**Problema:** El RubricEvaluator tiene rúbricas genéricas pero puede necesitar configuraciones específicas para los 8 tipos de ejercicios de M4-M5.

**Tipos que requieren rúbricas:**

**Módulo 4:**
| Tipo | Rúbrica Necesaria | Estado |
|------|-------------------|--------|
| `verificador_fake_news` | Precisión de veredictos, calidad de evidencia | VERIFICAR |
| `infografia_interactiva` | Comprensión de datos, secciones exploradas | VERIFICAR |
| `quiz_tiktok` | N/A (auto-calificable) | ✅ OK |
| `navegacion_hipertextual` | Eficiencia de navegación, información sintetizada | VERIFICAR |
| `analisis_memes` | Interpretación de elementos, análisis cultural | VERIFICAR |

**Módulo 5:**
| Tipo | Rúbrica Necesaria | Estado |
|------|-------------------|--------|
| `diario_multimedia` | Precisión histórica, profundidad emocional, creatividad | VERIFICAR |
| `comic_digital` | Narrativa visual, diálogos, arco dramático | VERIFICAR |
| `video_carta` | Autenticidad de voz, mensaje, estructura | VERIFICAR |

**Implementación:**
1. Verificar si ya existen rúbricas en `RubricEvaluator.tsx`
2. Si no existen, crear configuraciones basadas en las guías de pruebas
3. Cada rúbrica debe incluir:
   - Criterios con pesos (%)
   - Niveles de evaluación (0-25, 26-50, 51-75, 76-100)
   - Templates de feedback

**Responsable:** Frontend-Agent
**Esfuerzo:** 4-6 horas

---

### COR-004: Verificar Integración de Quiz TikTok con Gamificación

**Problema:** Quiz TikTok (4.3) es el único ejercicio auto-calificable de M4. Verificar que:
1. El scoring automático calcula correctamente (0/33/67/100)
2. XP y ML Coins se otorgan en primer acierto
3. El resultado se refleja en portal de teacher

**Archivos a verificar:**
- `apps/backend/src/modules/educational/services/exercises.service.ts`
- `apps/frontend/src/features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx`

**Tests requeridos:**
```typescript
// Test Case 1: 3/3 correctas → 100 puntos, XP otorgado
// Test Case 2: 2/3 correctas → 67 puntos, XP proporcional
// Test Case 3: 0/3 correctas → 0 puntos, sin XP
// Test Case 4: Segundo intento correcto → sin XP (anti-farming)
```

**Responsable:** Backend-Agent / QA-Agent
**Esfuerzo:** 2-3 horas

---

### COR-005: Implementar Pruebas E2E para Flujo Completo

**Flujo a probar:**

```
1. Estudiante abre ejercicio M4/M5
2. Completa ejercicio
3. Envía respuesta
4. Sistema valida estructura (validate_module4_module5_answer)
5. Sistema crea ExerciseAttempt/ExerciseSubmission
6. Triggers actualizan XP, ML Coins, misiones
7. Docente ve respuesta en ReviewPanel
8. Docente califica con rúbrica
9. Sistema otorga puntuación final
10. Estudiante ve feedback
```

**Casos de prueba:**

| ID | Escenario | Ejercicio | Resultado Esperado |
|----|-----------|-----------|-------------------|
| E2E-M4-01 | Verificador FakeNews - Respuesta válida | 4.1 | Guardado, pendiente revisión |
| E2E-M4-02 | Quiz TikTok - 3/3 correctas | 4.3 | 100 pts, XP otorgado inmediato |
| E2E-M4-03 | Análisis Memes - Estructura inválida | 4.5 | Error de validación |
| E2E-M5-01 | Diario Multimedia - 3 entradas | 5.1 | Guardado, 500 XP pendiente |
| E2E-M5-02 | Video Carta - Solo script | 5.3 | Guardado, pendiente revisión |
| E2E-M5-03 | Docente califica M5 | 5.1 | XP y ML Coins otorgados |

**Responsable:** QA-Agent
**Esfuerzo:** 4-6 horas

---

## CORRECCIONES P2 (MEDIAS)

### COR-006: Verificar Multiplicador ML Coins por Rango

**Problema:** El análisis indica que el multiplicador de ML Coins por rango podría no estar implementado. Actualmente solo XP tiene multiplicador.

**Verificar en:**
- `apps/database/ddl/schemas/gamification_system/functions/award_ml_coins.sql`
- `apps/backend/src/modules/gamification/services/ml-coins.service.ts`

**Comportamiento esperado:**
```sql
-- Si usuario tiene rango Nacom (1.10x multiplicador):
-- ML Coins base: 50
-- ML Coins finales: 50 * 1.10 = 55
```

**Si no implementado, agregar:**
```sql
-- En award_ml_coins:
SELECT xp_multiplier INTO v_multiplier
FROM gamification_system.maya_ranks
WHERE rank_name = (
  SELECT current_rank FROM gamification_system.user_stats WHERE user_id = p_user_id
);

v_final_amount := FLOOR(p_amount * v_multiplier);
```

**Responsable:** Database-Agent
**Esfuerzo:** 2-3 horas

---

### COR-007: Configurar Storage para Video Upload (M5)

**Problema:** Video-Carta (5.3) permite subir videos pero requiere configuración de storage.

**Opciones:**
1. **Local Storage** (desarrollo): `/uploads/videos/`
2. **S3/MinIO** (producción): Bucket dedicado
3. **Supabase Storage** (si aplica)

**Configuración requerida:**
```typescript
// En backend:
upload: {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: ['video/mp4', 'video/webm', 'video/mov'],
  destination: process.env.VIDEO_UPLOAD_PATH || './uploads/videos'
}
```

**Responsable:** Infra-Agent / Backend-Agent
**Esfuerzo:** 2-3 horas

---

## MATRIZ DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────┐
│ COR-001 (Docs VISION)                                           │
│    ↓                                                            │
│ COR-002 (Docs XP) ──────────────────────────────────────────→   │
│    ↓                                                            │
│ COR-003 (Rúbricas) ← PUEDE PARALELO CON COR-004/005             │
│                                                                 │
│ COR-004 (Quiz TikTok) ─────→ COR-005 (E2E Tests)               │
│                                                                 │
│ COR-006 (ML Coins Mult) ← INDEPENDIENTE                         │
│                                                                 │
│ COR-007 (Video Storage) ← INDEPENDIENTE                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## ORDEN DE EJECUCIÓN RECOMENDADO

### Sprint 1 (Inmediato)

| Orden | ID | Descripción | Paralelo |
|-------|-----|-------------|----------|
| 1 | COR-001 | Actualizar VISION.md | NO |
| 2 | COR-002 | Verificar docs XP | NO |
| 3a | COR-003 | Rúbricas M4-M5 | SÍ con 3b |
| 3b | COR-004 | Quiz TikTok | SÍ con 3a |

### Sprint 2

| Orden | ID | Descripción | Paralelo |
|-------|-----|-------------|----------|
| 4 | COR-005 | Tests E2E | NO (depende de 3a, 3b) |
| 5a | COR-006 | ML Coins Mult | SÍ con 5b |
| 5b | COR-007 | Video Storage | SÍ con 5a |

---

## ARCHIVOS AFECTADOS (RESUMEN)

### Documentación
- `docs/00-vision-general/VISION.md`
- `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` (verificar)

### Frontend
- `apps/frontend/src/apps/teacher/components/grading/RubricEvaluator.tsx`
- `apps/frontend/src/features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx`

### Backend
- `apps/backend/src/modules/gamification/services/ml-coins.service.ts`
- `apps/backend/src/modules/educational/services/exercises.service.ts`

### Database
- `apps/database/ddl/schemas/gamification_system/functions/award_ml_coins.sql`

### Infraestructura
- `.env` (VIDEO_UPLOAD_PATH)
- Configuración de S3/MinIO (si aplica)

---

## CRITERIOS DE ACEPTACIÓN

### Para cada corrección:

| ID | Criterio | Verificación |
|----|----------|--------------|
| COR-001 | VISION.md actualizado con estado correcto | Revisión manual |
| COR-002 | Todos los docs usan mismos umbrales XP | Grep "K'uk'ulkan" en docs |
| COR-003 | Rúbricas configuradas para 7 tipos M4-M5 | Review de código |
| COR-004 | Quiz TikTok otorga XP correctamente | Test automatizado |
| COR-005 | Tests E2E pasando para 6 escenarios | CI/CD verde |
| COR-006 | ML Coins con multiplicador por rango | Test SQL |
| COR-007 | Videos se pueden subir y almacenar | Test manual |

---

## RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Rúbricas inconsistentes con guías de prueba | Media | Alto | Validar contra GUIA-PRUEBAS antes de implementar |
| Quiz TikTok con cálculo incorrecto | Baja | Alto | Tests unitarios extensivos |
| Storage no configurado en producción | Media | Medio | Documentar requisitos en README |
| Conflictos de merge por cambios en docs | Baja | Bajo | Comunicar cambios al equipo |

---

## NOTAS FINALES

1. **Priorizar COR-001 y COR-002** ya que la documentación incorrecta puede causar confusión en todo el equipo.

2. **COR-003 (Rúbricas)** es crítico para que los docentes puedan evaluar consistentemente los ejercicios de M4-M5.

3. **COR-005 (E2E)** debe ejecutarse DESPUÉS de las correcciones previas para validar el flujo completo.

4. **COR-006 y COR-007** son mejoras opcionales que pueden implementarse en un sprint posterior si el tiempo es limitado.

---

**Documento generado:** 2025-12-23
**Estado:** FASE 3 COMPLETA - Listo para Fase 4 (Validación)
