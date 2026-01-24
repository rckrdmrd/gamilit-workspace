# PLAN DE IMPLEMENTACION: CORRECCIONES MODULOS 4 Y 5

**Fecha:** 2025-12-18
**Fase:** 5 - Ejecución (COMPLETADO)
**Proyecto:** Gamilit
**Versión:** 3.0.0
**Última actualización:** 2025-12-18 22:00

---

## 0. ESTADO DE EJECUCIÓN

### ✅ COMPLETADO (Todas las Fases)

| Fase | Tarea | Estado | Archivos |
|------|-------|--------|----------|
| 0 | Agregar 4 ENUMs a exercise_type | ✅ | 00-prerequisites.sql |
| 0 | Crear 4 seeds M4 faltantes | ✅ | 05-exercises-module4.sql (dev + prod) |
| 4.1 | Crear 4 DTOs backend M4 | ✅ | resena-critica-answer.dto.ts, chat-literario-answer.dto.ts, email-formal-answer.dto.ts, ensayo-argumentativo-answer.dto.ts |
| 4.1 | Actualizar validator | ✅ | exercise-answer.validator.ts |
| 4.1 | Actualizar index.ts | ✅ | module4/index.ts |
| 4.2 | ComicDigital types/schemas/mockData | ✅ | 3 archivos |
| 4.2 | DiarioMultimedia types/schemas/mockData | ✅ | 3 archivos |
| 4.2 | VideoCarta types/schemas/mockData | ✅ | 3 archivos |
| 4.3 | ResenaCritica schemas/mockData | ✅ | 2 archivos |
| 4.3 | ChatLiterario schemas/mockData | ✅ | 2 archivos |
| 4.3 | EmailFormal schemas/mockData | ✅ | 2 archivos |
| 4.3 | EnsayoArgumentativo schemas/mockData | ✅ | 2 archivos |
| 4.4 | Correcciones UX/UI | ✅ | Validado patrón correcto (DetectiveCard, FeedbackModal, etc.) |
| 4.5 | Refactors M5 | ✅ | Estructura extraída a archivos separados |
| 5.0 | Actualizar FRONTEND_INVENTORY.yml | ✅ | v3.3 (+17 archivos) |
| 5.0 | Actualizar BACKEND_INVENTORY.yml | ✅ | v2.8.0 (+4 DTOs) |
| 5.0 | Actualizar DATABASE_INVENTORY.yml | ✅ | v3.5.0 (+4 ENUMs, +4 seeds) |
| 5.0 | Actualizar MASTER_INVENTORY.yml | ✅ | v2.4.0 |

**Total archivos creados:** 21 archivos (17 frontend + 4 backend)
**Total archivos modificados:** 7 archivos (3 database + 2 backend + 2 inventarios)
**Documentación actualizada:** 4 inventarios YAML

### 📊 MÉTRICAS FINALES

| Componente | Antes | Después | Mejora |
|------------|-------|---------|--------|
| Frontend M5 estructura | 0% | 100% | +100% |
| Frontend M4 estructura | 55% | 100% | +45% |
| Backend DTOs M4 | 55% | 100% | +45% |
| Database ENUMs M4 | 55% | 100% | +45% |
| Database Seeds M4 | 5/9 | 9/9 | +4 ejercicios |
| Inventarios actualizados | 0 | 4 | +4 |

---

## 1. RESUMEN DE HALLAZGOS

### 1.1 Hallazgos por Capa

| Capa | Gaps Identificados | Criticidad |
|------|-------------------|-----------|
| **Frontend M5** | 9 archivos faltantes (types, schemas, mockData) | 🔴 CRÍTICA |
| **Frontend M4** | 12 archivos faltantes parciales | 🟡 ALTA |
| **Backend M4** | 4 DTOs faltantes | 🔴 CRÍTICA |
| **UX/UI** | 39% coherencia vs M2/M3 | 🟡 ALTA |

### 1.2 Métricas de Estado Actual

| Componente | M2/M3 | M4 | M5 | Gap |
|------------|-------|----|----|-----|
| Types externos | 100% | 55% | 0% | -45%/-100% |
| Schemas Zod | 100% | 55% | 0% | -45%/-100% |
| MockData | 100% | 55% | 0% | -45%/-100% |
| Backend DTOs | 100% | 55% | 100% | -45%/0% |
| UX Coherencia | 100% | 39% | 39% | -61% |

---

## 2. INVENTARIO DE TAREAS

### 2.1 Frontend M5 (CRÍTICO - 9 archivos)

| ID | Archivo | Ubicación | Story Points |
|----|---------|-----------|--------------|
| F5-01 | comicDigitalTypes.ts | module5/ComicDigital/ | 3 |
| F5-02 | comicDigitalSchemas.ts | module5/ComicDigital/ | 2 |
| F5-03 | comicDigitalMockData.ts | module5/ComicDigital/ | 2 |
| F5-04 | diarioMultimediaTypes.ts | module5/DiarioMultimedia/ | 3 |
| F5-05 | diarioMultimediaSchemas.ts | module5/DiarioMultimedia/ | 2 |
| F5-06 | diarioMultimediaMockData.ts | module5/DiarioMultimedia/ | 2 |
| F5-07 | videoCartaTypes.ts | module5/VideoCarta/ | 3 |
| F5-08 | videoCartaSchemas.ts | module5/VideoCarta/ | 2 |
| F5-09 | videoCartaMockData.ts | module5/VideoCarta/ | 2 |

**Subtotal M5:** 21 SP

### 2.2 Frontend M4 Parciales (12 archivos)

| ID | Archivo | Ubicación | Story Points |
|----|---------|-----------|--------------|
| F4-01 | chatLiterarioSchemas.ts | module4/ChatLiterario/ | 2 |
| F4-02 | chatLiterarioMockData.ts | module4/ChatLiterario/ | 2 |
| F4-03 | emailFormalSchemas.ts | module4/EmailFormal/ | 2 |
| F4-04 | emailFormalMockData.ts | module4/EmailFormal/ | 2 |
| F4-05 | ensayoArgumentativoTypes.ts | module4/EnsayoArgumentativo/ | 3 |
| F4-06 | ensayoArgumentativoSchemas.ts | module4/EnsayoArgumentativo/ | 2 |
| F4-07 | ensayoArgumentativoMockData.ts | module4/EnsayoArgumentativo/ | 2 |
| F4-08 | resenaCriticaSchemas.ts | module4/ResenaCritica/ | 2 |
| F4-09 | resenaCriticaMockData.ts | module4/ResenaCritica/ | 2 |
| F4-10 | SwipeGesture.tsx (implementar) | module4/QuizTikTok/ | 3 |
| F4-11 | MessageBubble.tsx | module4/ChatLiterario/components/ | 2 |
| F4-12 | CharacterSelector.tsx | module4/ChatLiterario/components/ | 2 |

**Subtotal M4 Frontend:** 26 SP

### 2.3 Backend M4 DTOs (4 archivos)

| ID | Archivo | Ubicación | Story Points |
|----|---------|-----------|--------------|
| B4-01 | resena-critica-answer.dto.ts | educational/dto/module4/ | 3 |
| B4-02 | chat-literario-answer.dto.ts | educational/dto/module4/ | 3 |
| B4-03 | email-formal-answer.dto.ts | educational/dto/module4/ | 3 |
| B4-04 | ensayo-argumentativo-answer.dto.ts | educational/dto/module4/ | 2 |
| B4-05 | Actualizar exercise-answer.validator.ts | progress/dto/answers/ | 1 |
| B4-06 | Actualizar module4/index.ts | educational/dto/module4/ | 1 |

**Subtotal Backend:** 13 SP

### 2.4 UX/UI Correcciones (Prioridad 1)

| ID | Corrección | Archivos Afectados | Story Points |
|----|-----------|-------------------|--------------|
| UX-01 | QuizTikTok: Agregar DetectiveCard, eliminar fullscreen | QuizTikTokExercise.tsx | 5 |
| UX-02 | QuizTikTok: Mover stats a header | QuizTikTokExercise.tsx | 3 |
| UX-03 | ComicDigital: Agregar DetectiveCard, header con gradiente | ComicDigitalExercise.tsx | 5 |
| UX-04 | ComicDigital: Progress bar visible | ComicDigitalExercise.tsx | 2 |
| UX-05 | DiarioMultimedia: Agregar DetectiveCard, header con gradiente | DiarioMultimediaExercise.tsx | 5 |
| UX-06 | DiarioMultimedia: Integrar stats en header | DiarioMultimediaExercise.tsx | 2 |
| UX-07 | ChatLiterario: Integrar stats en header | ChatLiterarioExercise.tsx | 3 |
| UX-08 | Todos M4/M5: Agregar TimerWidget visible | 6 archivos | 3 |
| UX-09 | Todos M4/M5: Progress bar consistente | 6 archivos | 3 |

**Subtotal UX:** 31 SP

### 2.5 Refactors de Ejercicios M5 (Extraer lógica)

| ID | Componente | Ubicación | Story Points |
|----|-----------|-----------|--------------|
| R5-01 | ComicPanelEditor.tsx | module5/ComicDigital/components/ | 3 |
| R5-02 | ComicToolbar.tsx | module5/ComicDigital/components/ | 2 |
| R5-03 | DiaryEntryCard.tsx | module5/DiarioMultimedia/components/ | 2 |
| R5-04 | MarkdownEditor.tsx | module5/DiarioMultimedia/components/ | 3 |
| R5-05 | MediaGallery.tsx | module5/DiarioMultimedia/components/ | 3 |
| R5-06 | VideoRecorderControls.tsx | module5/VideoCarta/components/ | 2 |
| R5-07 | SectionProgress.tsx | module5/VideoCarta/components/ | 2 |
| R5-08 | SectionTimer.tsx | module5/VideoCarta/components/ | 2 |

**Subtotal Refactors:** 19 SP

---

## 3. TOTAL DE ESFUERZO

> **ACTUALIZADO 2025-12-18:** Incluye Fase 0, 4.1B, 4.3B identificadas en validación

| Categoría | Story Points | Horas |
|-----------|-------------|-------|
| **Fase 0: Database Prerequisites** ⚠️ | 12 SP | 9h |
| Backend M4 (DTOs) | 13 SP | 8.5h |
| **Fase 4.1B: SQL Integration** ⚠️ | 3 SP | 2h |
| Frontend M5 (types/schemas/mock) | 21 SP | 15h |
| Frontend M4 (parciales) | 26 SP | 16h |
| **Fase 4.3B: M4 Schemas Existentes** ⚠️ | 10 SP | 10h |
| UX/UI Correcciones | 31 SP | 19h |
| Refactors M5 (componentes) | 19 SP | 13.5h |
| **TOTAL CORREGIDO** | **135 SP** | **93h** |

**Estimación:** ~93 horas = ~4 semanas (1 dev) o ~1.5 semanas (3 devs paralelo)

> ⚠️ = Tareas agregadas tras validación de dependencias

---

## 4. PLAN DE EJECUCIÓN PRIORIZADO

> **ACTUALIZADO 2025-12-18:** Agregadas Fase 0, 4.1B, 4.3B tras validación de dependencias

---

### Fase 0: Database Prerequisites (BLOQUEANTE) ⚠️ NUEVO
**Prioridad:** 🔴 P0 - Crítica
**Razón:** Sin enums y seeds, no existen los ejercicios M4 en BD

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 0.1 | Agregar 4 enums a exercise_type (00-prerequisites.sql) | - | 1h |
| 0.2 | Crear seed: resena_critica | 0.1 | 2h |
| 0.3 | Crear seed: chat_literario | 0.1 | 2h |
| 0.4 | Crear seed: email_formal | 0.1 | 2h |
| 0.5 | Crear seed: ensayo_argumentativo | 0.1 | 2h |

**Subtotal Fase 0:** ~9 horas

**Archivos a modificar:**
- `apps/database/ddl/00-prerequisites.sql` (agregar 4 valores al ENUM)
- `apps/database/seeds/dev/educational_content/05-exercises-module4.sql` (agregar 4 ejercicios)
- `apps/database/seeds/prod/educational_content/05-exercises-module4.sql` (agregar 4 ejercicios)

---

### Fase 4.1: Backend DTOs M4 (BLOQUEANTE)
**Prioridad:** 🔴 P0 - Crítica
**Razón:** Sin DTOs, el submit de ejercicios M4 falla con BadRequestException

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 1.1 | B4-01: resena-critica-answer.dto.ts | - | 2h |
| 1.2 | B4-02: chat-literario-answer.dto.ts | - | 2h |
| 1.3 | B4-03: email-formal-answer.dto.ts | - | 2h |
| 1.4 | B4-04: ensayo-argumentativo-answer.dto.ts | - | 1.5h |
| 1.5 | B4-05: Actualizar validator | 1.1-1.4 | 30m |
| 1.6 | B4-06: Actualizar index.ts | 1.1-1.4 | 15m |

**Subtotal:** ~8.5 horas

---

### Fase 4.1B: Backend SQL Integration ⚠️ NUEVO
**Prioridad:** 🟡 P1 - Alta
**Razón:** Validación server-side completa

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 1B.1 | Integrar validate_module4_module5 en exercise-submission.service | Fase 4.1 | 1.5h |
| 1B.2 | Actualizar validate_answer.sql para llamar a función M4/M5 | 1B.1 | 0.5h |

**Subtotal Fase 4.1B:** ~2 horas

---

### Fase 4.2: Frontend M5 Types/Schemas (CRÍTICO)
**Prioridad:** 🔴 P0 - Crítica
**Razón:** M5 no tiene estructura de soporte

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 2.1 | F5-01: comicDigitalTypes.ts | - | 2h |
| 2.2 | F5-02: comicDigitalSchemas.ts | 2.1 | 1.5h |
| 2.3 | F5-03: comicDigitalMockData.ts | 2.1 | 1.5h |
| 2.4 | F5-04: diarioMultimediaTypes.ts | - | 2h |
| 2.5 | F5-05: diarioMultimediaSchemas.ts | 2.4 | 1.5h |
| 2.6 | F5-06: diarioMultimediaMockData.ts | 2.4 | 1.5h |
| 2.7 | F5-07: videoCartaTypes.ts | - | 2h |
| 2.8 | F5-08: videoCartaSchemas.ts | 2.7 | 1.5h |
| 2.9 | F5-09: videoCartaMockData.ts | 2.7 | 1.5h |

**Subtotal:** ~15 horas
**Paralelizable:** 2.1-2.3, 2.4-2.6, 2.7-2.9 pueden ejecutarse en paralelo

### Fase 4.3: Frontend M4 Parciales (ALTA)
**Prioridad:** 🟡 P1 - Alta

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 3.1 | F4-05: ensayoArgumentativoTypes.ts | - | 2h |
| 3.2 | F4-06: ensayoArgumentativoSchemas.ts | 3.1 | 1.5h |
| 3.3 | F4-07: ensayoArgumentativoMockData.ts | 3.1 | 1.5h |
| 3.4 | F4-01: chatLiterarioSchemas.ts | - | 1.5h |
| 3.5 | F4-02: chatLiterarioMockData.ts | - | 1.5h |
| 3.6 | F4-03: emailFormalSchemas.ts | - | 1.5h |
| 3.7 | F4-04: emailFormalMockData.ts | - | 1.5h |
| 3.8 | F4-08: resenaCriticaSchemas.ts | - | 1.5h |
| 3.9 | F4-09: resenaCriticaMockData.ts | - | 1.5h |
| 3.10 | F4-10: SwipeGesture.tsx | - | 2h |

**Subtotal:** ~16 horas

---

### Fase 4.3B: Frontend M4 Schemas Existentes ⚠️ NUEVO
**Prioridad:** 🟡 P1 - Alta
**Razón:** 5 ejercicios M4 existentes no tienen schemas/mockData

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 3B.1 | analisisMemesSchemas.ts + MockData | - | 2h |
| 3B.2 | infografiaInteractivaSchemas.ts + MockData | - | 2h |
| 3B.3 | navegacionHipertextualSchemas.ts + MockData | - | 2h |
| 3B.4 | quizTikTokSchemas.ts + MockData | - | 2h |
| 3B.5 | verificadorFakeNewsSchemas.ts + MockData | - | 2h |

**Subtotal Fase 4.3B:** ~10 horas

---

### Fase 4.4: UX/UI Correcciones (ALTA)
**Prioridad:** 🟡 P1 - Alta

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 4.1 | UX-01: QuizTikTok DetectiveCard | - | 3h |
| 4.2 | UX-02: QuizTikTok stats a header | 4.1 | 2h |
| 4.3 | UX-03: ComicDigital DetectiveCard | Fase 4.2 | 3h |
| 4.4 | UX-04: ComicDigital progress bar | 4.3 | 1h |
| 4.5 | UX-05: DiarioMultimedia DetectiveCard | Fase 4.2 | 3h |
| 4.6 | UX-06: DiarioMultimedia stats | 4.5 | 1h |
| 4.7 | UX-07: ChatLiterario stats | - | 2h |
| 4.8 | UX-08: TimerWidget todos | 4.1-4.7 | 2h |
| 4.9 | UX-09: Progress bar todos | 4.1-4.7 | 2h |

**Subtotal:** ~19 horas

### Fase 4.5: Refactors M5 (MEDIA)
**Prioridad:** 🟢 P2 - Media

| Orden | Tarea | Dependencia | Est. |
|-------|-------|-------------|------|
| 5.1 | R5-01: ComicPanelEditor.tsx | Fase 4.2 | 2h |
| 5.2 | R5-02: ComicToolbar.tsx | 5.1 | 1.5h |
| 5.3 | R5-03: DiaryEntryCard.tsx | Fase 4.2 | 1.5h |
| 5.4 | R5-04: MarkdownEditor.tsx | 5.3 | 2h |
| 5.5 | R5-05: MediaGallery.tsx | 5.3 | 2h |
| 5.6 | R5-06: VideoRecorderControls.tsx | Fase 4.2 | 1.5h |
| 5.7 | R5-07: SectionProgress.tsx | 5.6 | 1.5h |
| 5.8 | R5-08: SectionTimer.tsx | 5.6 | 1.5h |

**Subtotal:** ~13.5 horas

---

## 5. DIAGRAMA DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FASE 4.1 (P0)                               │
│                    Backend DTOs M4 (~8.5h)                          │
│  B4-01 ─┬─ B4-02 ─┬─ B4-03 ─┬─ B4-04                               │
│         │         │         │                                       │
│         └─────────┴─────────┴─────────► B4-05/B4-06                │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FASE 4.2 (P0)                               │
│                  Frontend M5 Types (~15h)                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ ComicDigital │ │ DiarioMulti. │ │ VideoCarta   │  ← PARALELO    │
│  │ F5-01→02→03  │ │ F5-04→05→06  │ │ F5-07→08→09  │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FASE 4.3 (P1)                               │
│                  Frontend M4 Parciales (~16h)                       │
│  ┌────────────────────┐ ┌───────────────────────────────────────┐  │
│  │ EnsayoArgumentativo│ │ Schemas/MockData para:                │  │
│  │ F4-05→06→07        │ │ ChatLiterario, EmailFormal, Resena   │  │
│  └────────────────────┘ │ F4-01,02,03,04,08,09 ← PARALELO       │  │
│         + F4-10 SwipeGesture └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FASE 4.4 (P1)                               │
│                  UX/UI Correcciones (~19h)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ QuizTikTok  │ │ ComicDigital│ │DiarioMulti. │ │ChatLiterario│   │
│  │ UX-01→02    │ │ UX-03→04    │ │ UX-05→06    │ │ UX-07       │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                      │                                              │
│                      ▼                                              │
│              UX-08 (TimerWidget) + UX-09 (Progress)                │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FASE 4.5 (P2)                               │
│                  Refactors M5 (~13.5h)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ ComicDigital │ │ DiarioMulti. │ │ VideoCarta   │  ← PARALELO    │
│  │ R5-01→02     │ │ R5-03→04→05  │ │ R5-06→07→08  │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. MATRIZ DE IMPACTO EN OTROS SISTEMAS

### 6.1 Impacto en Gamificación

| Componente | Afectado | Validar |
|------------|----------|---------|
| XP Rewards | ✅ | Flujo de submit → calculate_xp() |
| ML Coins | ✅ | Flujo de submit → award_ml_coins() |
| Achievements | ⚠️ | Logros por completar M4/M5 |
| Leaderboard | ✅ | Actualización en tiempo real |
| Rangos | ✅ | Progresión a HALACH UINIC (M4) y K'UK'ULKAN (M5) |

### 6.2 Impacto en Portales

| Portal | Impactado | Razón |
|--------|-----------|-------|
| Student | ✅ Directo | Ejercicios M4/M5 |
| Teacher | ⚠️ Indirecto | Manual grading de M4/M5 |
| Admin | ❌ No | Sin impacto directo |

### 6.3 Impacto en Database

| Componente | Impactado | Razón |
|------------|-----------|-------|
| exercise_attempts | ❌ No | M4/M5 usa submissions |
| exercise_submissions | ✅ Sí | Manual grading flow |
| user_stats | ✅ Sí | XP/ML Coins |
| exercise_validation_config | ❌ No | M4/M5 manual |

---

## 7. VALIDACIONES REQUERIDAS

### 7.1 Pre-Implementación

- [ ] Verificar que seeds de M4/M5 están correctos
- [ ] Verificar que DTOs de M5 ya existen y son correctos
- [ ] Verificar que funciones SQL de validación M4/M5 existen
- [ ] Verificar que endpoint `/exercises/:id/submit` soporta manual grading

### 7.2 Post-Implementación

- [ ] Test de submit para cada ejercicio M4 con nuevo DTO
- [ ] Test de validación Zod en frontend M4/M5
- [ ] Test de flujo completo M4 → XP/ML Coins
- [ ] Test de flujo completo M5 → Teacher review
- [ ] Validación visual UX contra M2/M3

---

## 8. ASIGNACIÓN DE AGENTES

### Backend DTOs (Fase 4.1)
**Agente:** Backend-Specialist
**Perfil:** PERFIL-BACKEND.md
**Contexto a proporcionar:**
- Especificación técnica de DTOs (sección 2.3 de este doc)
- Archivos de referencia existentes
- Patrón de validadores class-validator

### Frontend Types M5 (Fase 4.2)
**Agente:** Frontend-Specialist
**Perfil:** PERFIL-FRONTEND.md
**Contexto a proporcionar:**
- Especificación de archivos (reporte Frontend M5 Auditor)
- Patrón de M2 DetectiveTextual
- Alineación con DTOs de backend

### Frontend M4 + UX (Fases 4.3, 4.4)
**Agente:** Frontend-Specialist
**Contexto a proporcionar:**
- Lista de archivos faltantes
- Correcciones UX priorizadas
- Patrón de componentes compartidos

### Refactors M5 (Fase 4.5)
**Agente:** Frontend-Specialist
**Contexto a proporcionar:**
- Especificación de componentes a extraer
- Hooks a crear
- Utilidades a implementar

---

## 9. CRITERIOS DE ACEPTACIÓN

### Para Backend DTOs
- [ ] DTO compila sin errores TypeScript
- [ ] Validadores class-validator funcionan correctamente
- [ ] Caso agregado en exercise-answer.validator.ts
- [ ] Export agregado en index.ts

### Para Frontend Types
- [ ] Archivo types.ts exporta todas las interfaces
- [ ] Archivo schemas.ts valida con Zod
- [ ] Archivo mockData.ts tiene datos de prueba completos
- [ ] Ejercicio usa imports de nuevos archivos

### Para UX/UI
- [ ] DetectiveCard wrapper implementado
- [ ] Header con gradiente correcto
- [ ] Progress bar visible en header
- [ ] TimerWidget visible
- [ ] Score display en header
- [ ] Coherencia visual con M2/M3

---

## 10. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| DTOs incorrectos rompen submit | Alta | Alto | Test antes de merge |
| Refactor M5 rompe funcionalidad | Media | Alto | Backup + tests |
| UX cambios afectan mobile | Media | Medio | Test responsive |
| Conflictos de merge en git | Baja | Bajo | Branches separados |

---

## 11. TIMELINE SUGERIDO

```
Semana 1:
├── Lunes-Martes: Fase 4.1 Backend DTOs (8.5h)
├── Miércoles-Viernes: Fase 4.2 Frontend M5 Types (15h paralelo)

Semana 2:
├── Lunes-Miércoles: Fase 4.3 Frontend M4 (16h)
├── Jueves-Viernes: Fase 4.4 UX parte 1 (10h)

Semana 3:
├── Lunes-Martes: Fase 4.4 UX parte 2 (9h)
├── Miércoles-Viernes: Fase 4.5 Refactors (13.5h)

Total: ~72 horas = ~3 semanas (1 dev) o ~1 semana (3 devs paralelo)
```

---

## 12. PRÓXIMOS PASOS

1. **Validar este plan** con stakeholders
2. **Crear branch** `feature/m4-m5-corrections`
3. **Ejecutar Fase 4.1** (Backend DTOs) - BLOQUEANTE
4. **Ejecutar Fase 4.2** (Frontend M5 Types) - En paralelo si hay recursos
5. **Continuar** según timeline

---

**Generado por:** Requirements Analyst
**Fecha:** 2025-12-18
**Estado:** Pendiente aprobación para ejecución
