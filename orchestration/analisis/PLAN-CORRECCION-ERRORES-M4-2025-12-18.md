# PLAN DE CORRECCIÓN: ERRORES MÓDULO 4

**Fecha:** 2025-12-18
**Fase:** 5 - Ejecución (COMPLETADO)
**Proyecto:** Gamilit
**Versión:** 2.0.0
**Última actualización:** 2025-12-18 23:30

---

## 0. ESTADO DE EJECUCIÓN

### ✅ TODAS LAS FASES COMPLETADAS

| Fase | Tarea | Estado |
|------|-------|--------|
| 1 | Planeación de análisis | ✅ Completado |
| 2 | Ejecución de análisis | ✅ Completado |
| 3 | Planeación de implementaciones | ✅ Completado |
| 4 | Validación de dependencias | ✅ Completado |
| 5 | Ejecución de implementaciones | ✅ Completado |

### 📦 CAMBIOS REALIZADOS

**Archivo modificado:** `apps/frontend/src/shared/utils/exerciseAdapter.ts`

**Funciones agregadas (12 adaptadores nuevos):**

| Módulo | Adaptador | Líneas |
|--------|-----------|--------|
| M4 | `adaptToQuizTikTokData()` | 609-632 |
| M4 | `adaptToInfografiaInteractivaData()` | 641-697 |
| M4 | `adaptToVerificadorFakeNewsData()` | 703-721 |
| M4 | `adaptToNavegacionHipertextualData()` | 727-739 |
| M4 | `adaptToAnalisisMemesData()` | 745-756 |
| M4 | `adaptToEmailFormalData()` | 762-780 |
| M4 | `adaptToChatLiterarioData()` | 786-802 |
| M4 | `adaptToEnsayoArgumentativoData()` | 808-827 |
| M4 | `adaptToResenaCriticaData()` | 833-852 |
| M5 | `adaptToDiarioMultimediaData()` | 862-874 |
| M5 | `adaptToComicDigitalData()` | 880-893 |
| M5 | `adaptToVideoCartaData()` | 899-912 |

**Casos agregados en `adaptExerciseData()`:** líneas 962-994

---

## 1. RESUMEN DEL PROBLEMA

### 1.1 Errores Reportados

| Ejercicio | Error | Línea | Causa Raíz |
|-----------|-------|-------|------------|
| Infografía Interactiva (4.5) | `Cannot read properties of undefined (reading 'filter')` | 418 | `cards` es undefined |
| Quiz TikTok (4.2) | `Cannot read properties of undefined (reading '0')` | 425 | `questions` es undefined |

### 1.2 Diagnóstico

**Causa Raíz Identificada:**
- El archivo `exerciseAdapter.ts` NO tiene adaptadores específicos para los tipos de ejercicios del Módulo 4
- Cuando un tipo no tiene adaptador, se usa `adaptToBaseExercise()` que solo retorna: `id`, `title`, `difficulty`, `estimatedTime`, `topic`
- Los componentes esperan propiedades específicas (`cards`, `questions`) que no son mapeadas

**Flujo del Error:**
```
ExercisePage.tsx → adaptExerciseData(exercise) → adaptToBaseExercise() → MechanicComponent
                                                  ↑
                                                  NO mapea: cards, questions, etc.
```

---

## 2. ANÁLISIS DE IMPACTO

### 2.1 Ejercicios Módulo 4 Afectados

| Tipo | Adaptador | Propiedades Faltantes | Estado |
|------|-----------|----------------------|--------|
| `quiz_tiktok` | ❌ Falta | `questions[]` | 🔴 ERROR |
| `infografia_interactiva` | ❌ Falta | `cards[]` | 🔴 ERROR |
| `analisis_memes` | ❌ Falta | `memes[]`, `analysisQuestions[]` | ⚠️ Por validar |
| `navegacion_hipertextual` | ❌ Falta | `nodes[]`, `links[]` | ⚠️ Por validar |
| `verificador_fake_news` | ❌ Falta | `articles[]` | ⚠️ Por validar |
| `email_formal` | ❌ Falta | `templates[]` | ⚠️ Por validar |
| `chat_literario` | ❌ Falta | `characters[]`, `initialMessages[]` | ⚠️ Por validar |
| `ensayo_argumentativo` | ❌ Falta | `topics[]`, `structure` | ⚠️ Por validar |
| `resena_critica` | ❌ Falta | `works[]`, `criteria[]` | ⚠️ Por validar |

### 2.2 Archivos a Modificar

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `exerciseAdapter.ts` | Agregar 9 adaptadores M4 | 🔴 P0 |
| `InfografiaInteractivaExercise.tsx` | Agregar fallback defensivo | 🟡 P1 |
| `QuizTikTokExercise.tsx` | Agregar fallback defensivo | 🟡 P1 |
| Otros 7 componentes M4 | Agregar fallback defensivo | 🟢 P2 |

---

## 3. PLAN DE IMPLEMENTACIÓN

### FASE 2: Ejecución de Análisis

- [ ] Validar estructura de datos esperada por cada componente M4
- [ ] Revisar seeds de BD para entender formato de `mechanicData`
- [ ] Documentar propiedades requeridas por cada adaptador

### FASE 3: Planeación de Implementaciones

- [ ] Diseñar 9 funciones adaptadoras para M4
- [ ] Definir fallbacks defensivos para componentes
- [ ] Crear checklist de validación

### FASE 4: Validación de Dependencias

- [ ] Verificar que seeds DB tengan formato correcto
- [ ] Verificar que tipos TypeScript sean consistentes
- [ ] Verificar que no haya imports circulares

### FASE 5: Ejecución

- [ ] Implementar adaptadores en `exerciseAdapter.ts`
- [ ] Agregar casos al switch en `adaptExerciseData()`
- [ ] Agregar fallbacks defensivos en componentes
- [ ] Probar cada ejercicio

---

## 4. MAPEO DE TRANSFORMACIONES REQUERIDAS

### 4.1 Quiz TikTok Adapter

**DB Content:**
```json
{
  "questions": [
    { "id": "q1", "text": "...", "options": [...], "correct": 1, "timeLimit": 10, "visual": "..." }
  ]
}
```

**Componente Espera:**
```typescript
{
  questions: [
    { id: "q1", question: "...", options: [...], correctAnswer: 1, backgroundColor: "#..." }
  ]
}
```

**Transformación:**
- `text` → `question`
- `correct` → `correctAnswer`
- Agregar `backgroundColor` default

### 4.2 Infografía Interactiva Adapter

**DB Content:**
```json
{
  "infographic": {
    "title": "...",
    "sections": [ { "id": "...", "type": "...", "data": "..." } ]
  }
}
```

**Componente Espera:**
```typescript
{
  cards: [
    { id: "...", title: "...", content: "...", position: { x, y }, icon: "...", revealed: false }
  ]
}
```

**Transformación:**
- Mapear `sections` → `cards`
- Generar posiciones grid automáticamente
- Agregar `revealed: false`

### 4.3 Otros Adaptadores M4 (Simplificados)

| Tipo | Fuente DB | Destino Componente |
|------|-----------|-------------------|
| `verificador_fake_news` | `content.articles` | `articles` (pass-through) |
| `navegacion_hipertextual` | `content.mainArticle`, `content.links` | Mapear estructura |
| `analisis_memes` | `content.memes`, `content.questions` | `memes`, `analysisQuestions` |
| `email_formal` | `content.templates` | `templates` (pass-through) |
| `chat_literario` | `content.characters` | `characters` (pass-through) |
| `ensayo_argumentativo` | `content.topics`, `content.structure` | `topics`, `essayStructure` |
| `resena_critica` | `content.works`, `content.evaluationCriteria` | `works`, `criteria` |

---

## 5. ESTRUCTURA DE DATOS ESPERADA

### 4.1 QuizTikTokData (inferido del componente)

```typescript
interface QuizTikTokData {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  topic: string;
  hints: string[];
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    backgroundColor?: string;
  }>;
}
```

### 4.2 InfografiaInteractivaData (inferido del componente)

```typescript
interface InfografiaInteractivaData {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  topic: string;
  hints: string[];
  cards: Array<{
    id: string;
    title: string;
    content: string;
    position: { x: number; y: number };
    icon: string;
    revealed: boolean;
  }>;
  backgroundImage?: string;
}
```

---

## 5. REFERENCIAS

- `apps/frontend/src/shared/utils/exerciseAdapter.ts`
- `apps/frontend/src/features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise.tsx`
- `apps/frontend/src/apps/student/pages/ExercisePage.tsx`
- Seeds: `apps/database/seeds/*/educational_content/05-exercises-module4.sql`
