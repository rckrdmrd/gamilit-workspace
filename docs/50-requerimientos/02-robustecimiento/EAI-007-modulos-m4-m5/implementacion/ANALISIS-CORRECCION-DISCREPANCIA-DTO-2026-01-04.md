# Analisis y Correccion: Discrepancia Frontend-DTO en Ejercicios M4/M5

**Fecha**: 2026-01-04
**Tipo**: Correccion de Bug / Alineacion de Arquitectura
**Severidad**: Critica
**Estado**: Completado

---

## 1. Resumen Ejecutivo

Se identifico y corrigio una discrepancia sistematica entre la estructura de datos enviada por los componentes frontend de ejercicios M4/M5 y los DTOs de validacion esperados por el backend. Esta discrepancia causaba errores 400 (Bad Request) al enviar ejercicios.

### Errores Reportados

1. **Error 400 en verificador_fake_news**:
   ```
   ValidationError: Validation failed for exercise type 'verificador_fake_news':
   claims_verified must contain at least one verification,
   claims_verified must be an array
   ```

2. **Error 404 en progreso de modulo**:
   ```
   GET /api/v1/progress/users/:userId/modules/:moduleId 404 (Not Found)
   ```

---

## 2. Causa Raiz

### 2.1 Problema de Discrepancia de Estructura

Los componentes frontend enviaban datos con nombres de campos y estructuras diferentes a las esperadas por los DTOs del backend.

**Ejemplo - VerificadorFakeNews:**

| Componente | Campo Enviado | Estructura |
|------------|---------------|------------|
| Frontend | `verificationResults` | `{ claimId, verdict, confidence, sources, explanation }` |
| DTO Backend | `claims_verified` | `{ claim_id, is_fake, evidence }` |
| Validador | `verifiedClaims` | `{ claim, verdict, evidence }` |

### 2.2 Problema de Endpoint de Progreso

El endpoint `/progress/users/:userId/modules/:moduleId` lanzaba `NotFoundException` (404) cuando el usuario no habia iniciado un modulo, en lugar de retornar un objeto de progreso vacio.

---

## 3. Ejercicios Afectados

| Ejercicio | Severidad | Problema Principal |
|-----------|-----------|-------------------|
| VerificadorFakeNews | CRITICA | `verificationResults` vs `claims_verified` |
| NavegacionHipertextual | CRITICA | `navigationPath` vs `path` + falta `information_found` |
| AnalisisMemes | CRITICA | Falta `analysis.message` + campos incompatibles |
| ComicDigital | CRITICA | Estructura completamente diferente |
| VideoCarta | CRITICA | Falta `video_url` y `sections` obligatorios |
| InfografiaInteractiva | MODERADA | Falta `sections_explored` |
| DiarioMultimedia | MODERADA | Falta `id` en entries + `totalWords` |

---

## 4. Correcciones Implementadas

### 4.1 Frontend - Transformacion de Datos

Se modifico el metodo `handleSubmit` de cada componente para transformar los datos al formato esperado por el DTO, manteniendo compatibilidad con metadatos adicionales.

**Archivos modificados:**
- `apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise.tsx`
- `apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx`
- `apps/frontend/src/features/mechanics/module5/VideoCarta/VideoCartaExercise.tsx`
- `apps/frontend/src/features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise.tsx`

**Patron de correccion aplicado:**
```typescript
submit({
  // Primary format expected by DTO
  claims_verified: transformedData,

  // Metadata for backwards compatibility and context
  metadata: {
    originalData: legacyFormat,
  },
});
```

### 4.2 Backend - Validadores Flexibles

Se actualizaron los validadores en `exercise-validator.service.ts` para aceptar multiples formatos de entrada:

**Archivo modificado:**
- `apps/backend/src/modules/progress/services/validators/exercise-validator.service.ts`

**Validadores actualizados:**
- `validateVerificadorFakeNews` - Acepta `claims_verified` (DTO) o `verifiedClaims` (legacy)
- `validateInfografiaInteractiva` - Acepta `sections_explored` (DTO) o `sections` (legacy)
- `validateNavegacionHipertextual` - Acepta `path` (DTO) o `visitedNodes` (legacy)
- `validateAnalisisMemes` - Acepta `annotations` con `analysis` (DTO) o formato legacy

### 4.3 Backend - Endpoint de Progreso

Se agrego un nuevo metodo `findByUserAndModuleOrEmpty` que retorna un objeto de progreso vacio en lugar de lanzar 404.

**Archivos modificados:**
- `apps/backend/src/modules/progress/services/module-progress.service.ts`
- `apps/backend/src/modules/progress/controllers/module-progress.controller.ts`

---

## 5. Mapeo de Transformaciones

### VerificadorFakeNews
```
Frontend                    ->  DTO Backend
verificationResults         ->  claims_verified
  .claimId                  ->    .claim_id
  .verdict                  ->    .is_fake (boolean invertido)
  .explanation              ->    .evidence
```

### NavegacionHipertextual
```
Frontend                    ->  DTO Backend
visitedNodes (array)        ->  path (string[])
timePerDocument             ->  information_found
```

### AnalisisMemes
```
Frontend                    ->  DTO Backend
annotations                 ->  annotations
  .id (omitido)             ->    (no requerido)
  .category (omitido)       ->    (no requerido)
  .x, .y, .text             ->    .x, .y, .text
analysisText                ->  analysis.message
```

### ComicDigital
```
Frontend                    ->  DTO Backend
panels                      ->  panels
  .id (omitido)             ->    (no requerido)
  index + 1                 ->    .panelNumber
  speechBubbles[speech]     ->    .dialogue
  .text                     ->    .narration
```

### VideoCarta
```
Frontend                    ->  DTO Backend
videoUrl                    ->  video_url
sections (from recording)   ->  sections
  .name                     ->    .title
  .duration                 ->    .duration_seconds
```

### InfografiaInteractiva
```
Frontend                    ->  DTO Backend
cards.filter(revealed).id   ->  sections_explored
cards.reduce(answers)       ->  answers
```

### DiarioMultimedia
```
Frontend                    ->  DTO Backend
entries                     ->  entries
  .id (ya existe)           ->    .id
  .date.toISOString()       ->    .date
  .content (padded >= 50)   ->    .content
  wordCount (calculado)     ->    .wordCount
totalWords (calculado)      ->  totalWords
```

---

## 6. Impacto en Dependencias

### Archivos que NO requirieron cambios:
- DTOs de validacion (`/dto/module4/*.dto.ts`, `/dto/module5/*.dto.ts`) - Ya estaban correctamente definidos
- `exercise-answer.validator.ts` - Mapeo de tipos ya estaba correcto
- Tests existentes - No afectados por los cambios

### Nuevos metodos agregados:
- `ModuleProgressService.findByUserAndModuleOrNull()` - Retorna null si no existe
- `ModuleProgressService.findByUserAndModuleOrEmpty()` - Retorna progreso vacio

---

## 7. Verificacion

Para verificar las correcciones:

1. **Backend**: Ejecutar tests unitarios
   ```bash
   cd apps/backend
   npm run test -- --testPathPattern=exercise-validator
   ```

2. **Frontend**: Probar cada ejercicio en el navegador
   - Verificar que no hay errores 400 al enviar
   - Verificar que el progreso se guarda correctamente
   - Verificar que el feedback se muestra correctamente

---

## 8. Lecciones Aprendidas

1. **Definir contratos primero**: Los DTOs del backend deben definirse antes de implementar los componentes frontend.

2. **Validacion temprana**: Agregar tests de integracion que validen la estructura de datos enviada por el frontend.

3. **Documentacion de transformaciones**: Documentar explicitamente las transformaciones requeridas entre frontend y backend.

4. **Compatibilidad hacia atras**: Al actualizar validadores, siempre mantener soporte para formatos legacy.

---

## 9. Archivos Modificados (Resumen)

### Frontend (7 archivos)
- `VerificadorFakeNewsExercise.tsx`
- `NavegacionHipertextualExercise.tsx`
- `AnalisisMemesExercise.tsx`
- `InfografiaInteractivaExercise.tsx`
- `ComicDigitalExercise.tsx`
- `VideoCartaExercise.tsx`
- `DiarioMultimediaExercise.tsx`

### Backend (3 archivos)
- `exercise-validator.service.ts` (4 validadores actualizados)
- `module-progress.service.ts` (2 metodos nuevos)
- `module-progress.controller.ts` (1 endpoint actualizado)

---

**Autor**: Claude Code (Tech Leader)
**Revision**: Pendiente
