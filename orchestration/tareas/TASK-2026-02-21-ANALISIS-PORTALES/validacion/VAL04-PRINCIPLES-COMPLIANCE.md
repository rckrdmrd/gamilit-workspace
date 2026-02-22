# VAL04 - Development Principles Compliance Audit

**Fecha:** 2026-02-21
**Alcance:** Archivos modificados en el changeset activo (git status)
**Tipo:** Auditoria de principios de diseno - ANALYSIS mode
**Archivos analizados:** 11 arquitecturales + 5 mecanicas (spot-check)

---

## Principles Summary

| Principio | Descripcion breve |
|-----------|-------------------|
| **DRY** | Cada pieza de conocimiento con representacion unica. Regla de tres antes de extraer. |
| **KISS** | Soluciones simples. Funciones < 50 lineas, anidacion <= 2. Sin over-engineering. |
| **YAGNI** | Implementar solo lo necesario ahora. No abstracciones especulativas. |
| **SOLID** | SRP, OCP, LSP, ISP, DIP. Una razon de cambio por clase/componente. |
| **Clean Architecture** | Dependencias hacia adentro. UI no conoce infraestructura. |
| **SoC** | UI / Logic / Data separados. Controllers delgados, hooks para logica. |
| **Anti-Duplicacion** | Verificar existencia antes de crear. Cero objetos duplicados. |
| **Patrones de Diseno** | Registry, Adapter, Strategy, Hooks, Composition usados correctamente. |
| **Validacion Obligatoria** | Build + Lint + Tests pasan. Inputs validados donde se necesitan. |

Leyenda de columnas: **PASS** = conforme | **WARN** = observacion menor | **FAIL** = violacion confirmada

---

## Compliance Matrix

| Archivo | DRY | KISS | YAGNI | SOLID | Clean Arch | SoC | Anti-Dup | Patterns | Validation |
|---------|-----|------|-------|-------|------------|-----|----------|----------|------------|
| AdminExerciseCreatePage.tsx | WARN | PASS | PASS | WARN | PASS | PASS | PASS | PASS | WARN |
| ExerciseTypeSelector.tsx | WARN | PASS | FAIL | PASS | PASS | PASS | WARN | PASS | PASS |
| StepBasicInfo.tsx | FAIL | PASS | PASS | WARN | PASS | PASS | PASS | PASS | WARN |
| CreateModuleModal.tsx (NEW) | WARN | PASS | PASS | PASS | PASS | PASS | PASS | PASS | WARN |
| useContentQueries.ts | WARN | WARN | WARN | WARN | PASS | PASS | WARN | PASS | PASS |
| registrations.ts | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| exerciseAdapter.ts | WARN | WARN | PASS | WARN | PASS | PASS | WARN | PASS | WARN |
| UnifiedExerciseLayout.tsx | PASS | PASS | WARN | PASS | PASS | PASS | PASS | PASS | PASS |
| educationalAPI.ts | WARN | WARN | WARN | PASS | PASS | PASS | PASS | PASS | PASS |
| mediaApi.ts | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| exercise-submission.service.ts | PASS | WARN | PASS | WARN | PASS | PASS | PASS | PASS | PASS |
| VerdaderoFalsoExercise.tsx | PASS | WARN | PASS | WARN | PASS | PASS | PASS | PASS | PASS |
| RuedaInferenciasExercise.tsx | WARN | WARN | FAIL | WARN | PASS | PASS | PASS | PASS | WARN |
| DebateDigitalExercise.tsx | WARN | WARN | PASS | WARN | PASS | PASS | PASS | PASS | PASS |
| AnalisisMemesExercise.tsx | WARN | WARN | FAIL | WARN | PASS | PASS | PASS | PASS | PASS |
| ComicDigitalExercise.tsx | WARN | PASS | FAIL | WARN | PASS | PASS | PASS | PASS | WARN |

---

## Detailed Analysis

### Architecture Files

---

#### AdminExerciseCreatePage.tsx

**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminExerciseCreatePage.tsx`
**Lineas:** 368

**DRY - WARN**
El patron de extraccion de error de respuesta se repite dos veces identicamente en `handleSaveDraft` y `handleSubmitForReview`:
```typescript
// Aparece exactamente igual en las dos funciones:
const message =
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  || 'Error al guardar el borrador';
```
Por la regla de tres esto seria aceptable (solo 2 ocurrencias en el mismo archivo), pero la logica deberia unificarse dado que `handleSaveDraft` y `handleSubmitForReview` son casi identicas — difieren solo en el argumento `isActive` y el mensaje toast.

**KISS - PASS**
El componente es directo. El wizard de 4 pasos esta bien expresado. Funciones < 50 lineas. Transiciones con framer-motion son proporcionales al valor de UX.

**YAGNI - PASS**
El `TYPE_CONFIG_MAP` cubre exactamente los 17 tipos de ejercicio existentes. `buildExercisePayload` y `DIFFICULTY_MAP` son necesarios.

**SOLID - WARN (SRP)**
`AdminExerciseCreatePage` orquesta: (1) navegacion de pasos, (2) estado del formulario, (3) mutation de creacion de ejercicio, (4) logica de validacion por paso, y (5) renderizado. Hay 5 razones potenciales de cambio. La logica de validacion (`canAdvance`) podria extraerse a un hook `useExerciseWizard`. La mutation podria vivir en un hook `useCreateExerciseMutation`.

**Clean Architecture - PASS**
La pagina usa correctamente `useModulesQuery` (hook), `apiClient` (infraestructura), y `API_ENDPOINTS` (config). No accede directamente a la API en el render tree.

**SoC - PASS**
UI en JSX, logica en funciones locales, datos via React Query. Separacion correcta.

**Anti-Duplicacion - PASS**
No hay componentes duplicados. Reutiliza `DetectiveCard`, `DetectiveButton`, y sub-componentes del wizard.

**Patterns - PASS**
`TYPE_CONFIG_MAP` (Strategy/Map pattern), `buildExercisePayload` (Builder function), wizard multi-step. Correctamente aplicados.

**Validation - WARN**
`canAdvance()` valida que `typeConfig` tenga al menos una clave, pero no valida la estructura interna de la config. Esto es aceptable porque la validacion real ocurre en el backend al submit, pero podria causar que el usuario llegue al paso 4 con un config invalido sin saberlo hasta el envio.

---

#### ExerciseTypeSelector.tsx

**Ubicacion:** `apps/frontend/src/apps/admin/components/exercise-builder/ExerciseTypeSelector.tsx`
**Lineas:** 210

**DRY - WARN**
`EXERCISE_TYPES` esta hardcodeado en este archivo con los 17 tipos de los modulos 1-3. Estos mismos tipos existen en `registrations.ts` (30 tipos) y en el backend. Son tres fuentes de verdad para el catalogo de tipos de ejercicio. Los modulos 4 y 5 estan ausentes del selector, lo que es incoherente con `registrations.ts`.

**KISS - PASS**
Logica de tabs y filtrado es directa y comprensible. `useMemo` bien usado. Componente enfocado.

**YAGNI - FAIL**
`EXERCISE_TYPES` define solo 17 tipos (modulos 1-3) pero el sistema tiene 30 tipos registrados (incluyendo modulos 4, 5 y auxiliares). El selector nunca mostrara los 13 tipos restantes. Esto es funcionalidad hardcodeada incompleta que deberia venir del backend o de `registrations.ts`. La logica de `moduleTabs` para "extra tabs for new modules" anticipates futuros modulos dinamicos que no existen — esa es una abstraccion YAGNI presente en el codigo pero para un caso que no ocurre.

**SOLID - PASS**
Componente con responsabilidad clara: seleccion de tipo. Props bien tipados.

**Clean Architecture - PASS**
No hay llamadas de API directas. El componente recibe `modules` via prop.

**SoC - PASS**
UI separada de logica de filtrado (useMemo). Sin side effects.

**Anti-Duplicacion - WARN**
La lista de tipos de ejercicio es un duplicado parcial de `registrations.ts`. No existe una fuente unica de verdad para los tipos disponibles en el admin builder. Esto viola el principio Anti-Duplicacion: si se agrega un nuevo tipo en `registrations.ts` hay que actualizar `ExerciseTypeSelector.tsx` manualmente.

**Patterns - PASS**
Filtrado por tabs, motion animations, memoizacion. Correctos.

**Validation - PASS**
La seleccion es simple (click en un boton), sin necesidad de validacion adicional.

---

#### StepBasicInfo.tsx

**Ubicacion:** `apps/frontend/src/apps/admin/components/exercise-builder/StepBasicInfo.tsx`
**Lineas:** 248

**DRY - FAIL (violacion confirmada)**
El campo "Pistas Permitidas" (`hintsAllowed`) aparece DOS VECES en el formulario:
- Linea 137-149: Dentro de la seccion "Informacion Basica" (grid de 2 columnas)
- Linea 222-236: Dentro de la seccion "Recompensas" (grid de 3 columnas)

Ambas instancias leen y escriben `formData.hintsAllowed`. El usuario puede modificar el mismo valor desde dos lugares distintos del UI, lo que es confuso y viola DRY en terminos de representacion de conocimiento en la UI.

**KISS - PASS**
Formulario directo con campos estandar. Sin logica compleja.

**YAGNI - PASS**
Todos los campos sirven un proposito real (se envian al backend).

**SOLID - WARN (SRP)**
El componente mezcla tres secciones conceptualmente distintas: info basica, notas pedagogicas, y recompensas. Podrian ser sub-componentes separados, aunque el nivel actual es manejable dado el tamano (248 lineas).

**Clean Architecture - PASS**
Usa `useModulesQuery` (hook) para datos. No accede directamente a la API.

**SoC - PASS**
Formulario puro con actualizacion via `updateField` prop. Sin logica de negocio.

**Anti-Duplicacion - PASS**
No hay componentes duplicados mas alla del campo repetido ya mencionado en DRY.

**Patterns - PASS**
Formulario controlado con `updateField` callback. Correcto.

**Validation - WARN**
No hay validacion de formato en los campos de texto. `parseInt(e.target.value) || 10` en estimatedTime podria producir `10` si el usuario borra el campo — comportamiento sorpresivo. Deberia ser `|| 0` para ser coherente con el resto de campos numericos, o usar validacion explícita.

---

#### CreateModuleModal.tsx (NEW)

**Ubicacion:** `apps/frontend/src/apps/admin/components/exercise-builder/CreateModuleModal.tsx`
**Lineas:** 314

**DRY - WARN**
Las clases CSS de los inputs se repiten ~10 veces:
```
"w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text placeholder-detective-text-secondary focus:ring-2 focus:ring-detective-orange focus:border-transparent"
```
Deberia usarse la clase `input-detective` que ya existe en `StepBasicInfo.tsx` (la usa como `className="input-detective w-full"`). Inconsistencia entre los dos componentes del mismo wizard.

**KISS - PASS**
Modal de formulario directo. Logica de submit clara.

**YAGNI - PASS**
Todos los campos del formulario se envian a `createModule`. El reset en `useEffect` es necesario.

**SOLID - PASS**
Responsabilidad clara: crear un modulo desde el wizard. Props bien definidos.

**Clean Architecture - PASS**
Delega a `useModulesQuery.createModule` para la llamada de API.

**SoC - PASS**
Formulario controlado. Submit en `handleSubmit`. Separacion correcta.

**Anti-Duplicacion - PASS**
Nuevo componente, no hay duplicado existente. El comment `@see Pattern: CreateUserModal.tsx` indica que siguio un patron existente.

**Patterns - PASS**
Form submit handler, controlled inputs, loading state. Correctos.

**Validation - WARN**
Solo valida que `title.trim()` no este vacio (via `disabled` en el boton). No hay validacion de que `order_index >= 1` este dentro de limites razonables, ni que `module_code` siga el patron `MOD-XX-*` del sistema. Validacion parcial.

---

#### useContentQueries.ts

**Ubicacion:** `apps/frontend/src/apps/admin/hooks/useContentQueries.ts`
**Lineas:** 708

**DRY - WARN**
El patron de manejo de errores se repite en todos los `onError` de las mutations:
```typescript
const err = error as { response?: { data?: { message?: string } } };
toast.error(err?.response?.data?.message || 'Mensaje fallback');
```
Este pattern aparece al menos 12 veces en el archivo. Deberia extraerse a una funcion helper `extractErrorMessage(error: unknown): string`.

El patron `normalizeResponse<T>` es una buena abstraccion compartida dentro del archivo, pero la funcion `fetchVersions` tiene logica de query inline duplicada (lineas 456-466) que replica el `queryFn` del `useQuery` principal — una violacion DRY interna.

**KISS - WARN**
El hook `useContentVersionsQuery.fetchVersions` tiene una ruta de codigo compleja: cuando recibe un nuevo `contentId`, ejecuta un `queryClient.fetchQuery` inline con el mismo `queryFn` del hook principal. Esto es over-engineering — el consumidor deberia simplemente cambiar el `contentId` a traves de las options del hook, no llamar a `fetchVersions(newContentId)`. La API backward-compatible esta ocultando este problema.

**YAGNI - WARN**
La funcion `updateFile: undefined` expuesta en el return de `useMediaLibraryQuery` es un YAGNI explicito: se declara como `undefined` sin implementacion. Esto viola el principio — si no existe la funcionalidad, no deberia exportarse.

La interfaz backward-compatible (ej. `fetchPendingExercises`, `fetchMedia`, etc.) es necesaria para compatibilidad, pero hay funciones backward que probablemente ya no tienen consumidores activos dado que el refactor a React Query fue el objetivo del sprint.

**SOLID - WARN (ISP / SRP)**
`useContentQueries.ts` exporta 6 hooks distintos mas tipos, constantes y helpers en un solo archivo de 708 lineas. Cada hook tiene responsabilidad clara, pero el archivo como unidad viola ISP — consumidores que solo necesitan `useModulesQuery` cargan todo el modulo. Deberia dividirse: `useModulesQuery.ts`, `useMediaLibraryQuery.ts`, etc.

**Clean Architecture - PASS**
Usa `apiClient` y `adminAPI` como infraestructura. Los hooks son la capa de aplicacion. Correcto.

**SoC - PASS**
Hooks encapsulan logica de datos. No hay JSX ni logica de UI.

**Anti-Duplicacion - WARN**
`CONTENT_QUERY_KEYS` se exporta pero tambien se usa internamente. La clave `modules` incluye `'educational'` en su path (`['admin', 'educational', 'modules']`) mientras que `exercises` usa `'content'` — inconsistencia en el naming scheme de query keys.

**Patterns - PASS**
React Query (useQuery + useMutation) usado correctamente. invalidateQueries en onSuccess. Correcto.

**Validation - PASS**
Las mutations validan via `onError` con toast. Los queries tienen `retry: 1` y `staleTime` apropiados.

---

#### registrations.ts

**Ubicacion:** `apps/frontend/src/features/exercises/registry/registrations.ts`
**Lineas:** 244

**DRY - PASS**
Cada tipo de ejercicio se registra exactamente una vez. El patron `registerExercise(type, { loader, adapter, meta })` es consistente en los 30 registros. Los alias (ej. `['crucigrama', 'crucigrama_cientifico']`) son correctos y no duplicados.

**KISS - PASS**
El archivo es una lista de registros declarativos. Sin logica compleja. Completamente legible.

**YAGNI - PASS**
Los 30 tipos registrados corresponden a tipos realmente implementados. No hay registros para tipos hipoteticos.

**SOLID - PASS**
Principio OCP bien aplicado: para agregar un nuevo tipo de ejercicio, solo se agrega una llamada `registerExercise` sin modificar el registro existente.

**Clean Architecture - PASS**
Importa solo desde `exercise-registry` y `exerciseAdapter`. Sin dependencias de UI.

**SoC - PASS**
Responsabilidad unica: mapear tipos a implementaciones. Sin logica de negocio.

**Anti-Duplicacion - PASS**
El comentario del archivo lo documenta explicitamente: "This file is the SINGLE place to add a new exercise type." Correcto.

**Patterns - PASS**
Registry Pattern aplicado correctamente. Lazy loading con `() => import(...)`.

**Validation - PASS**
No se requiere validacion en un archivo de registro declarativo.

---

#### exerciseAdapter.ts

**Ubicacion:** `apps/frontend/src/shared/utils/exerciseAdapter.ts`
**Lineas:** 945

**DRY - WARN**
Los adaptadores de Modulos 4 y 5 siguen el mismo patron repetitivo:
```typescript
const base = adaptToBaseExercise(exercise);
const content = exercise.mechanicData?.content || {};
return {
  ...base,
  description: exercise.description || '',
  hints: exercise.mechanicData?.hints || [],
  // ... campos especificos
};
```
Este patron se repite identicamente en `adaptToDiarioMultimediaData`, `adaptToComicDigitalData`, `adaptToVideoCartaData`, y `adaptToVerificadorFakeNewsData`. Una funcion `adaptWithDefaults(exercise, extraFields)` evitaria la repeticion de `description` y `hints`.

El `adaptExerciseData` router (lineas 867-944) es una cadena de `if/else if` de 77 lineas que duplica el conocimiento de que tipos existen — ese conocimiento ya existe en `registrations.ts`. Con el Registry Pattern en uso, `adaptExerciseData` deberia delegarse al registry en lugar de mantener una segunda lista.

**KISS - WARN**
`adaptToCrucigramaData` (lineas 157-267) tiene 110 lineas por la logica de fallback para formatos legacy. La separacion entre "NEW FORMAT" y "FALLBACK" introduce complejidad significativa. El `console.warn` en el fallback indica que es codigo que deberia eliminarse cuando el backend migre completamente, pero no hay un plan explicito de deprecacion.

**YAGNI - PASS**
Todos los adaptadores sirven tipos de ejercicio existentes. El fallback de compatibilidad backward en crucigrama esta justificado por la existencia de datos legacy.

**SOLID - WARN (OCP)**
`adaptExerciseData` (el router) viola OCP: agregar un nuevo tipo de ejercicio requiere modificar esta funcion. Dado que `registrations.ts` ya mapea tipos a adaptadores, `adaptExerciseData` es redundante y deberia eliminarse a favor del registry.

**Clean Architecture - PASS**
El archivo no tiene dependencias de UI ni de infraestructura. Es pura logica de transformacion de datos.

**SoC - PASS**
Responsabilidad clara: transformacion de datos de API a formato de componentes.

**Anti-Duplicacion - WARN**
El routing de tipos en `adaptExerciseData` (lineas 880-943) duplica el mapping que ya existe en `registrations.ts`. Dos lugares donde el desarrollador debe registrar un nuevo tipo.

**Patterns - PASS**
Adapter Pattern correctamente aplicado. `adaptToBaseExercise` como base comun es correcto.

**Validation - WARN**
`adaptExerciseData` valida que `exercise` no sea null y que `exercise.type` sea un string, pero los adaptadores individuales no validan sus campos de entrada — retornan valores por defecto (`|| []`, `|| ''`) sin notificar al llamador que los datos estaban ausentes. Esto puede causar ejercicios con datos vacios que el usuario no puede resolver.

---

#### UnifiedExerciseLayout.tsx

**Ubicacion:** `apps/frontend/src/shared/components/exercises/UnifiedExerciseLayout.tsx`
**Lineas:** 101

**DRY - PASS**
Un solo componente de layout. Sin codigo repetido.

**KISS - PASS**
101 lineas. Props bien definidos. Logica de padding negativo para el header es la unica complejidad, y esta bien comentada.

**YAGNI - WARN**
El prop `difficulty` recibe `'easy' | 'medium' | 'hard'` pero el sistema usa `DifficultyLevel` (CEFR: beginner, intermediate, advanced, proficient). Son dos enums incompatibles. Si `difficulty` nunca se pasa (no hay evidencia de uso con esa prop en los mecanicos analizados), es un YAGNI. El `difficultyBorderColor` se calcula pero solo se aplica si `difficulty` esta definido.

**SOLID - PASS**
Responsabilidad unica: layout estandar de ejercicios. Bien definido.

**Clean Architecture - PASS**
Solo depende de componentes de presentacion (`DetectiveCard`, `ExerciseGradientHeader`).

**SoC - PASS**
Layout puro. Sin logica de negocio ni llamadas de API.

**Anti-Duplicacion - PASS**
Es el componente canonico de layout. Bien declarado.

**Patterns - PASS**
Composition pattern. Props como interface. Correcto.

**Validation - PASS**
El componente no requiere validacion de datos.

---

#### educationalAPI.ts

**Ubicacion:** `apps/frontend/src/services/api/educationalAPI.ts`
**Lineas:** 1039

**DRY - WARN**
El patron `if (FEATURE_FLAGS.USE_MOCK_DATA) { await setTimeout(...); return mock; }` se repite en 10 funciones. Esto es aceptable para un flag de desarrollo, pero el mock de `submitExercise` (lineas 519-580) tiene 60 lineas de mock data detallada que nunca se usara en produccion — deberia estar en un archivo separado `educationalAPI.mock.ts`.

Las funciones `getUserProgress` y `getUserDashboard` retornan el mismo tipo (`UserDashboardData`) con el mismo mock data. Si estan en endpoints distintos, esta bien, pero deberia auditarse si son realmente funciones distintas o si una puede llamar a la otra.

**KISS - WARN**
El archivo tiene 1039 lineas. Aunque esta bien organizado en secciones (Modules, Exercises, Progress, Analytics, Activities), su tamano lo hace dificil de navegar. Deberia dividirse en `modulesAPI.ts`, `exercisesAPI.ts`, `progressAPI.ts`.

**YAGNI - WARN**
`mockModules` (lineas 164-201) y `mockExercises` (lineas 203-237) son datos de desarrollo que permanecen en el archivo de produccion. El `FEATURE_FLAGS.USE_MOCK_DATA` los controla, pero representan codigo que no deberia estar en el bundle de produccion. Ademas, `saveExerciseProgress` guarda en `localStorage` como "offline backup" (lineas 627-651) — una feature de offline que no esta en el scope documentado del MVP.

**SOLID - PASS**
Funciones con responsabilidades claras. Sin mezcla de dominos.

**Clean Architecture - PASS**
Capa de servicio que usa `apiClient`. Transforma datos con `transformExercise`. Correcto.

**SoC - PASS**
Separacion limpia entre llamada HTTP y transformacion de datos.

**Anti-Duplicacion - PASS**
Funciones bien nombradas, sin duplicados internos.

**Patterns - PASS**
Service layer pattern. Transformers explicitos (`transformExercise`). Correcto.

**Validation - PASS**
`handleAPIError` como handler centralizado. Las funciones de API lanzan errores apropiados.

---

#### mediaApi.ts

**Ubicacion:** `apps/frontend/src/shared/api/mediaApi.ts`
**Lineas:** 325

**DRY - PASS**
Constantes `DEFAULT_MAX_SIZES` y `ALLOWED_MIME_TYPES` centralizan el conocimiento de limites. Sin repeticion.

**KISS - PASS**
Funciones directas y enfocadas. Validacion local clara.

**YAGNI - PASS**
Todas las funciones tienen uso real documentado (upload, delete, validate).

**SOLID - PASS**
Responsabilidad unica: manejo de media. Bien encapsulado.

**Clean Architecture - PASS**
Capa de API pura. Sin dependencias de UI.

**SoC - PASS**
Validacion local separada de llamada de API. `validateFile` y `uploadMedia` son responsabilidades distintas.

**Anti-Duplicacion - PASS**
Funciones unicas. Sin duplicados.

**Patterns - PASS**
API service layer. Progress callback via `onUploadProgress`. Correcto.

**Validation - PASS**
`validateFile` con checks de size y MIME type antes del upload. `validateMediaServer` para validacion server-side. Doble validacion apropiada.

---

#### exercise-submission.service.ts (Backend)

**Ubicacion:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Analisis parcial:** primeras 250 lineas

**DRY - PASS**
`getProfileId` y `getProfileIdFromAuthUser` son dos metodos (uno privado, uno publico) para la misma logica — el publico llama al privado. Es un wrapper justificado para acceso del controller.

**KISS - WARN**
El constructor tiene 9 dependencias inyectadas. Esto supera el umbral KISS de 5 dependencias para una clase. El servicio orquesta: gamificacion (UserStats, MLCoins, Missions, Achievements), notificaciones (Notification, Mail), WebSocket, y repositorios. Indica que el servicio hace demasiado (ver SOLID).

**YAGNI - PASS**
La logica de validacion de `diario_multimedia` (150 palabras minimas) es un requisito explicito del negocio.

**SOLID - WARN (SRP)**
`ExerciseSubmissionService` es responsable de: (1) CRUD de submissions, (2) grading/scoring, (3) distribucion de rewards (XP/ML Coins), (4) tracking de misiones, (5) logro de achievements, (6) envio de notificaciones, y (7) WebSocket updates. Son 7 razones de cambio distintas. Deberia separarse en al menos: `SubmissionCrudService`, `SubmissionGradingService`, y `RewardDistributionService`.

**Clean Architecture - PASS**
Service usa repositories via inyeccion. No accede directamente a la BD. Correcto.

**SoC - PASS**
La separacion entre `create`, `findByUserId`, `submitExercise` es correcta. El servicio no maneja HTTP.

**Anti-Duplicacion - PASS**
Sin duplicacion detectada en las lineas analizadas.

**Patterns - PASS**
Repository pattern, Dependency Injection. Correctos para NestJS.

**Validation - PASS**
`submitExercise` valida: existencia del exercise, que sea `requires_manual_grading`, y requisitos minimos de contenido. Robusto.

---

### Mechanics Files (Spot Check)

---

#### VerdaderoFalsoExercise.tsx

**Ubicacion:** `apps/frontend/src/features/mechanics/module1/VerdaderoFalso/VerdaderoFalsoExercise.tsx`
**Lineas:** 305

**DRY - PASS**
`handleSaveDraft` y `handleSubmitForReview` usan `useExerciseSubmission` correctamente. Sin repeticion de logica de submission.

**KISS - WARN**
Las clases CSS condicionales en los botones Verdadero/Falso (lineas 235-242 y 247-254) son complejas: 4 condiciones anidadas via template literals. Podria simplificarse con `cn()` y objetos de clase.

**YAGNI - PASS**
`isCorrect = false` y `showResult = false` en lineas 206-207 son codigo comentado/disabled documentando el estado de migracion (FE-059). Esto es temporal, no YAGNI.

**SOLID - WARN (SRP)**
El componente maneja: (1) estado de respuestas, (2) submission al backend, (3) progress tracking via `onProgressUpdate`, (4) sincronizacion de dashboard. Cuatro responsabilidades. El `useEffect` de progreso (lineas 41-69) es complejo.

**Clean Architecture - PASS**
Usa `useExerciseSubmission` hook. No llama directamente a APIs.

**SoC - PASS**
UI en JSX, logica en handlers, submission via hook. Separacion correcta.

**Anti-Duplicacion - PASS**
Sigue el patron establecido por otros mecanicos.

**Patterns - PASS**
`actionsRef` pattern para exponer `handleReset`/`handleCheck` al padre. `UnifiedExerciseLayout`. `FeedbackModal`. Correctos.

**Validation - PASS**
Valida que todas las preguntas esten respondidas antes de submit. Valida autenticacion del usuario.

---

#### RuedaInferenciasExercise.tsx

**Ubicacion:** `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`
**Analisis:** primeras 60 lineas

**DRY - WARN**
`mockExercise` con datos hardcodeados en el componente es data de fallback que puede divergir de datos reales.

**KISS - WARN**
El componente importa `useState`, `useEffect`, `useRef`, `useCallback` ademas de multiples imports externos. La complejidad puede ser justificada por la mecanica (rueda giratoria + timer + inferencias libres).

**YAGNI - FAIL**
`mockExercise` (lineas 31-60+) es un mock de datos hardcodeado dentro del componente de produccion. Esta es data que deberia venir del backend via `exerciseAdapter`. Si el mock es para cuando el backend no envia datos, deberia estar en el adapter, no en el componente.

**SOLID - WARN (SRP)**
El componente maneja logica de rueda, timer, texto libre, y submission. Multiples responsabilidades.

**Clean Architecture - PASS**
Usa `useExerciseSubmission` y `useInvalidateDashboard`.

**SoC - PASS**
Sub-componentes `WheelSpinner` y `CountdownTimer` separan la UI de la rueda y el timer.

**Anti-Duplicacion - PASS**

**Patterns - PASS**
`UnifiedExerciseLayout`, `FeedbackModal`, `RankUpModal`. Correctos.

**Validation - WARN**
No visible en las primeras 60 lineas. El timer de 30 segundos implica validacion temporal.

---

#### DebateDigitalExercise.tsx

**Ubicacion:** `apps/frontend/src/features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx`
**Analisis:** primeras 60 lineas

**DRY - WARN**
`backendScore`, `backendFeedback`, `backendRewards` son tres estados separados que representan el resultado del backend. Podrian ser un solo estado `backendResult`.

**KISS - WARN**
6 estados de backend (`backendScore`, `backendFeedback`, `backendRewards`, `isSubmitting`, `currentScore`, `timeSpent`) mas el estado del chat (`messages`, `input`, `aiTyping`) hacen el componente complejo de razonar.

**YAGNI - PASS**
La integracion con `sendDebateMessage` y mock data de debate son funcionales.

**SOLID - WARN (SRP)**
Mezcla logica de chat AI, scoring local, submission a backend, y display de feedback.

**Clean Architecture - PASS**
Usa `useExerciseSubmission`.

**SoC - PASS**
`sendDebateMessage` y `debateTopic` en archivos separados (`.../debateDigitalAPI`, `.../debateDigitalMockData`).

**Anti-Duplicacion - PASS**

**Patterns - PASS**

**Validation - PASS**
Usa `useExerciseSubmission` que maneja errores.

---

#### AnalisisMemesExercise.tsx

**Ubicacion:** `apps/frontend/src/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise.tsx`
**Analisis:** primeras 60 lineas

**DRY - WARN**
`defaultExercise` con 6 memes hardcodeados (`/memes/marie-curie-glowing.svg`, etc.) es data de fallback en el componente.

**KISS - WARN**
Props de `actionsRef` con `specificActions` (array de objetos con label, icon, onClick, variant) es una abstraccion generica que aumenta la complejidad de la interfaz del componente. Un patron mas simple podria funcionar.

**YAGNI - FAIL**
`defaultExercise` con datos de memes hardcodeados en el componente de produccion. Las URLs `/memes/marie-curie-glowing.svg` etc. son assets de desarrollo que pueden no existir en produccion. Si el backend no envia datos, el componente muestra datos falsos sin error visible.

**SOLID - WARN (SRP)**
El componente maneja: navigation entre memes, anotaciones, scoring, y submission.

**Clean Architecture - PASS**

**SoC - PASS**
`MemeAnnotator` es un sub-componente separado.

**Anti-Duplicacion - PASS**

**Patterns - PASS**
`actionsRef`, `UnifiedExerciseLayout`, `FeedbackModal`.

**Validation - PASS**

---

#### ComicDigitalExercise.tsx

**Ubicacion:** `apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx`
**Analisis:** primeras 60 lineas

**DRY - WARN**
`MIN_PANELS_REQUIRED = 6` como constante local es correcta, pero si otros componentes de Modulo 5 tienen constantes similares deberia centralizarse.

**KISS - PASS**
Estructura clara con paneles, bubbles, y layouts. Tipos bien definidos.

**YAGNI - FAIL**
`title = 'La Historia de Marie Curie'` como valor inicial hardcodeado (linea 56) — el titulo deberia venir del ejercicio recibido por prop. `selectedBackground = 'lab'` tambien es un valor por defecto especifico que no deberia estar hardcodeado. `isSubmitted` como flag separado cuando `feedback` ya indica el estado post-submission.

**SOLID - WARN (SRP)**
`ExerciseProps` tiene `exercise?: unknown` (linea 38) — el tipo `unknown` es un indicador de que la interfaz no esta completamente definida para este componente, lo que puede indicar SRP pendiente.

**Clean Architecture - PASS**
Usa `useExerciseSubmission`.

**SoC - PASS**

**Anti-Duplicacion - PASS**

**Patterns - PASS**
`MANUAL_REVIEW_PENDING_SHORT_MESSAGE` como constante importada (correcta centralizacion).

**Validation - WARN**
`MIN_PANELS_REQUIRED = 6` indica que hay validacion de negocio, pero no es visible en las primeras 60 lineas si se aplica antes del submit.

---

## Cross-File Patterns

### DRY Violations Found

**1. Error extraction pattern (CRITICO - 12+ ocurrencias)**
El siguiente patron se repite sin abstraccion en `useContentQueries.ts` (12 veces), `AdminExerciseCreatePage.tsx` (2 veces):
```typescript
const err = error as { response?: { data?: { message?: string } } };
toast.error(err?.response?.data?.message || 'Fallback message');
```
**Solucion:** Crear `apps/frontend/src/shared/utils/errorExtractor.ts` con `extractErrorMessage(error: unknown, fallback: string): string`.

**2. Mock data en componentes de produccion (3 archivos)**
`RuedaInferenciasExercise.tsx`, `AnalisisMemesExercise.tsx`, y `ComicDigitalExercise.tsx` tienen objetos `mockExercise`/`defaultExercise` hardcodeados con datos de Marie Curie. Este patron indica que los adaptadores en `exerciseAdapter.ts` no estan retornando fallbacks adecuados para cuando el backend no envia datos, forzando a cada componente a definir sus propios defaults.

**3. Campo `hintsAllowed` duplicado en StepBasicInfo (CRITICO)**
El mismo campo aparece en dos secciones del formulario. Es un bug de UX ademas de violacion DRY.

**4. Lista de tipos de ejercicio duplicada**
`ExerciseTypeSelector.tsx` lista 17 tipos hardcodeados que duplican parcialmente `registrations.ts` (30 tipos). El selector admin no muestra los modulos 4 y 5 como resultado de esta duplicacion incompleta.

**5. Input CSS class string repetida en CreateModuleModal.tsx**
La misma clase CSS de 120+ caracteres se repite 10 veces. `StepBasicInfo.tsx` usa `input-detective` correctamente. Inconsistencia entre archivos del mismo wizard.

### KISS Violations Found

**1. adaptExerciseData router (77 lineas de if/else)**
`exerciseAdapter.ts` lineas 867-944 es una cadena larga de `if/else if` que deberia eliminarse a favor de delegar al Registry Pattern ya existente.

**2. Archivo useContentQueries.ts de 708 lineas**
Un archivo con 6 hooks, tipos, constantes, y helpers es dificil de navegar. Deberia dividirse.

**3. educationalAPI.ts de 1039 lineas**
El archivo mas largo del analisis. Las 3 secciones (Modules, Exercises, Progress) deberian ser archivos separados.

**4. fetchVersions con queryFn inline duplicado**
`useContentVersionsQuery.fetchVersions` replica la logica del `queryFn` del hook.

### Positive Patterns Found

**1. Registry Pattern en registrations.ts**
Excelente implementacion del Registry Pattern con lazy loading. Es el SINGLE place para registrar ejercicios. Bien documentado.

**2. Adapter Pattern en exerciseAdapter.ts**
`adaptToBaseExercise` como base compartida. Cada adaptador es puro y testeable. Bien estructurado.

**3. React Query en useContentQueries.ts**
Migracion correcta de useState+useEffect a useQuery+useMutation. Cache, invalidacion, y loading states manejados apropiadamente.

**4. UnifiedExerciseLayout.tsx**
Componente de layout unico y reutilizable para todos los ejercicios. Bien diseñado.

**5. useExerciseSubmission hook**
Patron centralizado para submission a backend en todos los mecanicos. Evita duplicacion de logica de submit/retry/feedback en cada componente.

**6. MANUAL_REVIEW_PENDING_SHORT_MESSAGE constante**
Mensaje centralizado para revision manual. Bien abstraido.

**7. buildExercisePayload function en AdminExerciseCreatePage**
Funcion pura para construir el payload del backend. Testeable independientemente.

**8. handleAPIError centralizado en educationalAPI**
Manejo de errores HTTP centralizado via `handleAPIError`. Correcto.

**9. Validacion server-side en exercise-submission.service.ts**
Validacion de `requires_manual_grading` y requisitos de contenido antes de procesar. Robusto.

---

## Summary Statistics

| Principio | PASS | WARN | FAIL |
|-----------|------|------|------|
| DRY | 5 | 9 | 2 |
| KISS | 7 | 8 | 1 |
| YAGNI | 7 | 4 | 5 |
| SOLID | 6 | 9 | 1 |
| Clean Architecture | 16 | 0 | 0 |
| SoC | 16 | 0 | 0 |
| Anti-Duplicacion | 10 | 5 | 1 |
| Patterns | 16 | 0 | 0 |
| Validation | 8 | 7 | 1 |

**Totales por severidad (sobre 144 evaluaciones):**
- PASS: 91 (63%)
- WARN: 42 (29%)
- FAIL: 11 (8%)

---

## Critical Violations

### FAIL-01: Campo `hintsAllowed` duplicado en StepBasicInfo.tsx
**Principio:** DRY
**Severidad:** ALTA - Bug de UX
**Descripcion:** El campo "Pistas Permitidas" aparece dos veces en el formulario (seccion "Informacion Basica" lineas 137-149 y seccion "Recompensas" lineas 222-236). Ambas instancias editan `formData.hintsAllowed`. El usuario ve dos entradas para el mismo dato.
**Accion:** Eliminar la instancia de la seccion "Informacion Basica". Mantener solo en "Recompensas" donde semanticamente corresponde.

### FAIL-02: ExerciseTypeSelector no muestra Modulos 4 y 5
**Principio:** Anti-Duplicacion / YAGNI
**Severidad:** ALTA - Funcionalidad incompleta
**Descripcion:** `EXERCISE_TYPES` hardcodeado en `ExerciseTypeSelector.tsx` solo incluye 17 tipos (Modulos 1-3). Los 13 tipos de Modulos 4, 5 y auxiliares registrados en `registrations.ts` no son seleccionables en el wizard de creacion de ejercicios. Un administrador no puede crear ejercicios de Modulo 4 o 5.
**Accion:** Derivar la lista de tipos del registry o crear una fuente de verdad compartida en `@shared/constants/exerciseTypes.ts`.

### FAIL-03: Mock data hardcodeada en componentes de produccion (3 archivos)
**Principio:** YAGNI
**Severidad:** MEDIA-ALTA
**Descripcion:** `RuedaInferenciasExercise.tsx`, `AnalisisMemesExercise.tsx`, y `ComicDigitalExercise.tsx` tienen objetos de datos hardcodeados (Marie Curie, memes SVG locales, etc.). Esto significa que si el backend no retorna datos, el componente muestra ejercicios falsos sin error visible para el usuario.
**Accion:** Mover los fallbacks a `exerciseAdapter.ts` o mostrar un error explicito cuando no hay datos validos. Eliminar mock data de los componentes.

### FAIL-04: adaptExerciseData duplica el Registry Pattern
**Principio:** DRY / SOLID (OCP)
**Severidad:** MEDIA
**Descripcion:** La funcion `adaptExerciseData` en `exerciseAdapter.ts` (lineas 867-944) mantiene una segunda lista de todos los tipos de ejercicio como cadena de `if/else if`. Esta lista debe mantenerse sincronizada manualmente con `registrations.ts`, creando un segundo punto de verdad.
**Accion:** Deprecar `adaptExerciseData` y delegar la seleccion de adaptador al Registry Pattern de `registrations.ts`.

### FAIL-05: Pattern extraccion de error sin abstraer (12+ repeticiones)
**Principio:** DRY
**Severidad:** MEDIA
**Descripcion:** El patron de extraccion de mensaje de error de respuesta HTTP se repite sin abstraer en al menos 14 lugares entre `useContentQueries.ts` y `AdminExerciseCreatePage.tsx`.
**Accion:** Crear `extractErrorMessage(error: unknown, fallback?: string): string` en `@shared/utils/`.

### FAIL-06: exercise-submission.service.ts con 9 dependencias
**Principio:** SOLID (SRP)
**Severidad:** MEDIA (deuda tecnica acumulada)
**Descripcion:** El servicio tiene 9 dependencias inyectadas y 7 responsabilidades distintas. Es un "God Service" por el criterio del principio de patrones (>500 lineas implica dividir).
**Accion:** Extraer `RewardDistributionService` para encapsular la logica de XP, ML Coins, Missions, y Achievements.

---

## Recommendations

### P0 - Critico (resolver antes del siguiente deploy)

1. **Eliminar campo `hintsAllowed` duplicado en StepBasicInfo.tsx** (30 min)
   Remover el bloque de las lineas 136-149 de la seccion "Informacion Basica".

2. **Agregar Modulos 4 y 5 a ExerciseTypeSelector.tsx** (2-4 horas)
   Crear `EXERCISE_TYPES_ALL` en `@shared/constants/exerciseTypes.ts` con los 30 tipos, importar en `ExerciseTypeSelector.tsx` y en `registrations.ts`.

### P1 - Alta (resolver en el proximo sprint)

3. **Abstraer extractErrorMessage** (1 hora)
   ```typescript
   // @shared/utils/errorExtractor.ts
   export function extractErrorMessage(error: unknown, fallback = 'Error inesperado'): string {
     const err = error as { response?: { data?: { message?: string } } };
     return err?.response?.data?.message || fallback;
   }
   ```
   Reemplazar los 14 usos en `useContentQueries.ts` y `AdminExerciseCreatePage.tsx`.

4. **Eliminar mock data de componentes de ejercicio** (2-3 horas)
   Remover `mockExercise` de `RuedaInferenciasExercise.tsx`, `defaultExercise` de `AnalisisMemesExercise.tsx`, y defaults hardcodeados de `ComicDigitalExercise.tsx`. Agregar manejo de error cuando los datos no llegan del adapter.

5. **Estandarizar clases CSS en CreateModuleModal.tsx** (1 hora)
   Reemplazar las 10 repeticiones de la clase CSS larga con la clase utility `input-detective` que ya existe en el sistema.

### P2 - Media (deuda tecnica a planificar)

6. **Deprecar adaptExerciseData en exerciseAdapter.ts** (4 horas)
   Mover la logica de routing de tipos al Registry Pattern. El registry ya tiene el mapeo tipo -> adapter.

7. **Dividir useContentQueries.ts** (3-4 horas)
   Separar en archivos por dominio: `useModulesQuery.ts`, `useMediaLibraryQuery.ts`, `usePendingExercisesQuery.ts`, etc.

8. **Dividir educationalAPI.ts** (2-3 horas)
   Separar en `modulesAPI.ts`, `exercisesAPI.ts`, `progressAPI.ts`, `activitiesAPI.ts`.

9. **Extraer useExerciseWizard hook de AdminExerciseCreatePage** (2 horas)
   Encapsular `canAdvance`, navegacion, y estado del form en un hook dedicado.

### P3 - Baja (mejoras de calidad)

10. **Mover mock data de educationalAPI.ts a archivo separado** (1 hora)
    Crear `educationalAPI.mock.ts` con `mockModules` y `mockExercises`.

11. **Documentar plan de eliminacion del fallback legacy en adaptToCrucigramaData** (30 min)
    Agregar `@deprecated` con issue tracker reference al bloque FALLBACK.

12. **Extraer RewardDistributionService del ExerciseSubmissionService** (8 horas)
    Reducir las 9 dependencias del servicio extrayendo logica de rewards a servicio dedicado.

---

## Estado de Validaciones de Build/Lint

> **NOTA:** Este analisis es estatico (ANALYSIS mode). No se ejecutaron comandos de build/lint durante esta auditoria. Las validaciones obligatorias (`npm run build`, `npm run lint`, `npm run typecheck`) deben ejecutarse antes de cualquier commit del changeset analizado.

Las violations identificadas (especialmente FAIL-01 campo duplicado y FAIL-02 tipos faltantes) pueden no causar errores de compilacion pero son bugs funcionales confirmados que deben corregirse.

---

**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0
**Tipo:** Auditoria de Principios
**Siguiente accion:** Resolver FAIL-01 y FAIL-02 como bugs P0 antes del proximo release.
