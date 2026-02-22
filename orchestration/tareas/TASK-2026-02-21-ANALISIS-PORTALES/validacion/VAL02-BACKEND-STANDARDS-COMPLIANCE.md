# VAL02 - Backend Standards Compliance Audit

**Archivo auditado:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Fecha:** 2026-02-21
**Auditor:** SIMCO Analysis Agent
**Estándares aplicados:** docs/40-standards/backend-profesional/ (01–07) + ESTANDAR-CODIGO.md + ESTANDAR-SEGURIDAD.md

---

## Standards Applied

| # | Estándar | Archivo de referencia |
|---|----------|-----------------------|
| 1 | Principios SOLID en NestJS | `01-principios-solid.md` |
| 2 | Clean Architecture (capas + hexagonal) | `02-clean-architecture.md` |
| 3 | Repository Pattern | `03-repository-pattern.md` |
| 4 | Domain-Driven Design básico | `04-domain-driven-design.md` |
| 5 | Manejo de Errores (jerarquía, filtros) | `05-manejo-errores.md` |
| 6 | Validación de Datos (DTOs, pipes) | `06-validacion-datos.md` |
| 7 | Testing Patterns | `07-testing-patterns.md` |
| 8 | Estándar de Código (ESLint, naming, Prettier) | `ESTANDAR-CODIGO.md` |
| 9 | Estándar de Seguridad (OWASP, injection, auth) | `ESTANDAR-SEGURIDAD.md` |

---

## File: exercise-submission.service.ts

**Tamaño:** 1963 líneas | **Métodos públicos:** 11 | **Métodos privados:** 7
**Dependencias inyectadas:** 10 (3 repos + 1 EntityManager + 6 servicios)

---

### SOLID Compliance

#### S — Single Responsibility Principle

**Resultado: WARN**

La clase `ExerciseSubmissionService` agrupa un número excesivo de responsabilidades bajo un solo servicio:

1. CRUD de submissions (`create`, `findByUserId`, `findByExerciseId`, `findByUserAndExercise`, `updateStatus`)
2. Workflow de envío con validaciones de negocio específicas por tipo de ejercicio (`submitExercise`)
3. Auto-grading mediante llamada SQL (`autoGrade`) y validación personalizada de Rueda de Inferencias (`validateRuedaInferencias`)
4. Distribución de rewards: XP, ML Coins, rank-up, bonificaciones (`claimRewards`)
5. Actualización de progreso de módulo en dos momentos distintos (`updateModuleProgressOnSubmission`, `updateModuleProgressAfterCompletion`)
6. Actualización de misiones (`updateMissionsProgressAfterCompletion`)
7. Notificaciones al docente con envío de email (`notifyTeacherOfSubmission`)
8. Auto-guardado de progreso parcial (`autoSaveProgress`, `getAutoSavedProgress`, `convertDraftToFinalSubmission`)
9. Queries de estadísticas agregadas (`getSubmissionStats`)
10. Lookup de multiplicadores de rango desde BD (`getRankXpMultiplier`, `getRankConfigFromDB`)
11. Conversión de IDs auth→profile (`getProfileId`, `getProfileIdFromAuthUser`)

**Evidencia concreta:** El constructor inyecta 10 dependencias (líneas 86–103), lo cual es una señal directa de múltiples responsabilidades. El estándar indica que una clase debe tener UNA única razón para cambiar; esta clase cambia por razones de: lógica de BD, reglas de negocio por tipo de ejercicio, sistema de rewards, sistema de misiones, sistema de notificaciones, y gestión de progreso.

**Impacto:** Alta dificultad de mantenimiento. Un cambio en la lógica de rewards afecta el mismo archivo que un cambio en validaciones de respuesta de ejercicio.

**Nota de contexto:** El estándar `02-clean-architecture.md` sección 2.6 mapea explícitamente `progress` → `ProgressTrackingService` + `SubmissionService` como entidades separadas. Actualmente ambas están fusionadas.

---

#### O — Open/Closed Principle

**Resultado: WARN**

El método `submitExercise` (líneas 214–407) y `autoGrade` (líneas 571–709) contienen `if/else` encadenados que discriminan por `exercise.exercise_type` con strings literales:

```typescript
if (exercise.exercise_type === 'diario_multimedia') { ... }
if (exercise.exercise_type === 'comic_digital') { ... }
if (exercise.exercise_type === 'video_carta') { ... }
if (exercise.exercise_type === 'completar_espacios') { ... }
if (exercise.exercise_type === 'rueda_inferencias') { ... }
```

Para agregar soporte a un nuevo tipo de ejercicio es necesario **modificar** este archivo en lugar de **extender** con una nueva clase. El patrón OCP requeriría una estrategia de validadores por tipo (Strategy Pattern), como ilustra el estándar `01-principios-solid.md` sección 1.2.

---

#### L — Liskov Substitution Principle

**Resultado: PASS**

No hay jerarquía de herencia en este servicio. El servicio implementa el contrato esperado de un `@Injectable()` de NestJS sin subclasificación. No hay violaciones de LSP.

---

#### I — Interface Segregation Principle

**Resultado: WARN**

El servicio no define ni consume interfaces de repositorio (`ISubmissionRepository`). Consume directamente `Repository<ExerciseSubmission>` de TypeORM (línea 87). Esto viola ISP indirectamente: los consumidores del servicio (controllers) dependen de un servicio con 18 métodos públicos/privados cuando normalmente solo necesitan un subconjunto. No hay segregación por capacidad (lectura vs. escritura vs. grading vs. rewards).

---

#### D — Dependency Inversion Principle

**Resultado: FAIL**

El servicio depende directamente de implementaciones concretas, no de abstracciones:

- `Repository<ExerciseSubmission>` de TypeORM (línea 87) — implementación concreta
- `Repository<Exercise>` de TypeORM (línea 89)
- `Repository<Profile>` de TypeORM (línea 91)
- `EntityManager` de TypeORM (línea 93) — acceso de bajo nivel
- `UserStatsService`, `MLCoinsService`, `MissionsService`, `AchievementsService`, `NotificationService`, `MailService`, `WebSocketService` — referencias directas a clases concretas

El estándar `01-principios-solid.md` sección 1.5 y el `03-repository-pattern.md` especifican que los servicios deben depender de interfaces (`ISubmissionRepository`, `IExerciseRepository`) inyectadas via tokens, no de implementaciones. En el módulo `progress`, no existe ningún archivo de interfaz de repositorio.

**Impacto crítico en testing:** Sin interfaces, los tests unitarios no pueden hacer mock de las dependencias de forma tipada; requieren `jest.spyOn` sobre implementaciones concretas o el uso de `@nestjs/testing` con stubs, lo cual es más frágil.

---

### Clean Architecture

**Resultado: WARN**

**Conformidades:**
- El servicio está correctamente ubicado en la capa Application (módulo `progress/services/`)
- Las importaciones siguen la dirección correcta (servicio → entidades, servicios de otros módulos)
- No hay lógica de presentación (HTTP, controller concerns) dentro del servicio

**Violaciones:**

1. **Infrastructure en Application layer:** El servicio usa `EntityManager.query()` con SQL raw directamente (líneas 668–685, 1107–1111, 1262–1266, 1292–1296, 1352–1355, 1368–1375, 1396–1427, 1874–1881, 1914–1935). Esto rompe la regla de Clean Architecture: la capa Application no debe depender de detalles de infraestructura (SQL, schema names, TypeORM internals).

   Evidencia concreta: El SQL hardcodea nombres de schemas (`progress_tracking.module_progress`, `gamification_system.user_stats`, `gamification_system.maya_ranks`, `educational_content.exercises`, `social_features.classroom_members`, `auth_management.profiles`). Un cambio de schema requiere modificar el servicio de aplicación.

2. **Ausencia de Use Cases separados:** El estándar `02-clean-architecture.md` sección 2.3 especifica una carpeta `application/use-cases/` con un use case por operación. Actualmente toda la lógica reside en un único servicio monolítico.

3. **Ausencia de Domain Entities puras:** No existe una `ExerciseSubmission` de dominio separada de la ORM entity. El servicio opera directamente sobre la TypeORM entity como objeto de dominio.

4. **Cross-module raw queries:** El método `notifyTeacherOfSubmission` ejecuta una query SQL que cruza 4 schemas distintos (`social_features`, `auth_management`, `social_features.classrooms`) directamente desde el servicio de `progress`. Esto acopla el módulo `progress` a los detalles de implementación de `social` y `auth`.

---

### Error Handling

**Resultado: PASS (con observaciones)**

**Conformidades:**
- Uso apropiado de excepciones NestJS tipadas: `NotFoundException` (líneas 126, 226, 421, 589, 724, 1023), `BadRequestException` (líneas 234, 246, 263, 274, 289, 296, 320, 435, 759), `InternalServerErrorException` (líneas 688, 707)
- Los bloques try/catch en operaciones no críticas (notificaciones, WebSocket, misiones, logros) capturan errores y los loguean sin bloquear el flujo principal — patrón correcto
- Los mensajes de error son descriptivos y en español para errores de negocio que llegan al usuario
- Uso consistente del patrón `error instanceof Error ? error.message : String(error)` para captura segura

**Observaciones:**

1. **Sin jerarquía de excepciones de dominio:** El estándar `05-manejo-errores.md` especifica crear clases como `ExerciseNotFoundError extends NotFoundError` con códigos únicos (`EXERCISE_NOT_FOUND`). El servicio usa directamente `NotFoundException` de NestJS con strings ad-hoc, sin codificación de error estructurada.

2. **Mensajes de error en inglés para errores técnicos:** Líneas 422 (`Exercise submission with ID ${id} not found`), 426 (`Submission already graded`), 759 (`Invalid status transition from ${currentStatus} to ${status}`) — mezcla de inglés y español en mensajes de error.

3. **Captura genérica en `autoGrade`:** El `catch (error)` en línea 704 captura cualquier error incluyendo errores de programación (null pointer, type errors) y los convierte en `InternalServerErrorException`. Idealmente se debería discriminar entre errores de infraestructura vs. errores de lógica.

4. **Ausencia de Exception Filter específico:** No hay un `DomainExceptionFilter` configurado para este módulo según indica el estándar.

---

### Data Validation

**Resultado: WARN**

**Conformidades:**
- El método `submitExercise` valida la existencia del ejercicio antes de procesar
- Validación del rango de score manual (líneas 434–437)
- Validación de transiciones de estado (línea 750–763) mediante mapa explícito
- Uso de `ExerciseAnswerValidator.validate()` (línea 305) como capa de validación de estructura de respuestas

**Violaciones:**

1. **Validaciones de negocio embebidas con type coercion inseguro:** En líneas 243–301, las validaciones de tipo de ejercicio (`diario_multimedia`, `comic_digital`, `video_carta`) usan castings sin validación de DTO:
   ```typescript
   const content = String(answers.content || answers.text || '');
   const panels = (answers.panels || []) as Array<{ text?: string; image?: string; imageUrl?: string }>;
   const metadata = (answers.metadata || {}) as { duration?: number };
   ```
   El parámetro `answers: Record<string, unknown>` se castea con `as` sin validación real. El estándar exige DTOs con class-validator decorators.

2. **`autoSaveProgress` usa `as any`:** Línea 1578:
   ```typescript
   } as any) as unknown as ExerciseSubmission;
   ```
   Doble cast que suprime el sistema de tipos. Esto puede ocultar incompatibilidades de schema.

3. **`gradeSubmission` usa `(submission as any).grader_id`:** Líneas 449, 471, 518, 519, 523 — propiedades dinámicas añadidas a la entidad TypeORM via `as any`. Sugiere que el schema de la entidad no está actualizado con todos los campos necesarios, o que se están añadiendo propiedades de respuesta a la misma entidad de persistencia.

4. **`claimRewards` usa `(submission as any).rankUp`:** Línea 403. Mismo patrón de mutación dinámica de la entidad.

5. **Ausencia de validación de `userId` como UUID:** Los métodos públicos que reciben `userId: string` y `exerciseId: string` no validan que sean UUIDs válidos antes de usarlos en queries. Esto debería ocurrir en el nivel del controller con `ParseUUIDPipe`, pero no hay evidencia de eso en este servicio.

---

### Security

**Resultado: WARN**

**Conformidades:**
- Las queries SQL parametrizadas usan `$1`, `$2`, etc. (TypeORM y `entityManager.query`) — sin concatenación de strings, sin riesgo de SQL injection
- La verificación de existencia del perfil (`getProfileId`) antes de operar previene operaciones con IDs fantasma
- Verificación de `requires_manual_grading` para separar flujos y prevenir bypass del sistema de grading
- Prevención de double-reward (líneas 1041–1049): check de `xp_earned > 0` antes de reclamar

**Observaciones:**

1. **Validación de `videoUrl` sin sanitización:** Línea 284:
   ```typescript
   const videoUrl = answers.videoUrl || answers.url || answers.video;
   ```
   La URL del video se acepta directamente del input del usuario sin validar que sea una URL HTTPS válida (SSRF risk). El estándar `ESTANDAR-SEGURIDAD.md` sección 1B.7 exige `UrlValidationService` para toda URL externa.

2. **HTML no sanitizado en email:** Líneas 1783–1789, el email al docente incluye `exercise.title` y `studentName` provenientes de la BD, insertados directamente en HTML. Si un estudiante pudiera controlar su nombre de display o el título del ejercicio con contenido HTML, habría riesgo de HTML injection en el email.

3. **Ausencia de autorización en operaciones internas:** Los métodos `gradeSubmission`, `claimRewards`, `provideFeedback` y `updateStatus` no verifican que el llamante tenga permiso para actuar sobre la submission específica. Se asume que el controller aplica guards, pero a nivel de servicio no hay validación de ownership. El estándar OWASP API1 (BOLA) recomienda validación en el servicio también.

4. **Exposición de IDs internos en mensajes de error:** Líneas 126, 226, 588:
   ```typescript
   throw new NotFoundException(`Profile not found: ${profileId}`);
   throw new NotFoundException(`Exercise ${exerciseId} not found`);
   ```
   Los IDs de entidades internas se exponen en mensajes de error que llegan al cliente. En producción, esto puede facilitar enumeración de recursos.

5. **`setImmediate` como workaround de cache (línea 1104):** El uso de `await new Promise(resolve => setImmediate(resolve))` para "bypass cache de TypeORM" es un antipatrón de timing que puede ser no determinista en producción bajo carga. Es una solución de emergencia que debería reemplazarse con un query explícito de recarga de entidad.

---

### Code Quality

**Resultado: WARN**

**Conformidades:**
- Nomenclatura descriptiva de métodos en camelCase consistente
- JSDoc presente en todos los métodos públicos y la mayoría de privados
- Logger (`private readonly logger = new Logger(...)`) usado apropiadamente con prefijos de identificación de issue (e.g., `[BUG-001 FIX]`, `[FE-059]`)
- Constantes no mágicas en su mayoría (aunque hay algunos números literales sin nombre)

**Violaciones:**

1. **Longitud excesiva del archivo:** 1963 líneas es significativamente más largo que cualquier servicio comparable en el proyecto. Viola el principio KISS y hace difícil la revisión y el mantenimiento.

2. **Métodos de larga extensión:**
   - `submitExercise`: líneas 214–407 (193 líneas) — por encima del límite recomendado
   - `claimRewards`: líneas 1009–1242 (233 líneas) — significativamente larga
   - `updateModuleProgressAfterCompletion`: líneas 1324–1437 (113 líneas)
   - `autoGrade`: líneas 571–709 (138 líneas)
   - `notifyTeacherOfSubmission`: líneas 1682–1814 (132 líneas)

3. **Números mágicos sin constantes:**
   - Línea 442: `0.6` (passing threshold 60%) — sin nombre
   - Línea 1053: `100` (fallback XP reward), `20` (fallback ML coins)
   - Línea 1064–1065: fórmula de rewards inline sin documentar la política
   - Línea 1071: `50` (bonus XP perfect score), `10` (bonus coins)
   - Línea 1076: `5` (hint penalty per hint)
   - Líneas 258, 984, 963: `4`, `75`, `50`, `80` — thresholds sin nombre

4. **Comentarios con emojis:** Líneas como `'[IMPL-004] ✅ Granted'`, `'[BUG-002 FIX] ✅ Module progress updated'`, `'[BE-P2-008] ❌ Failed'` mezclan emojis en logs de producción. El estándar `ESTANDAR-CODIGO.md` indica no usar emojis en código (aunque son en strings de log, sigue siendo inconsistente).

5. **Tags de fix/bug embebidos en producción:** Los prefijos `[BUG-001 FIX]`, `[CORR-010]`, `[GAM-001 FIX]`, `[GAP-LOW-003]`, etc. son útiles durante desarrollo pero deberían limpiarse antes de producción estable o reemplazarse con nombres semánticos de operación.

6. **Duplicación de lógica de UPSERT:** Los métodos `updateModuleProgressAfterCompletion` y `updateModuleProgressOnSubmission` ejecutan queries UPSERT sobre la misma tabla (`progress_tracking.module_progress`) con lógica similar pero diferente (líneas 1396–1427 y 1914–1935). Viola DRY.

7. **Import style:** La línea 7 (`@shared/constants/enums.constants`) y la línea 8 (`@/modules/educational/entities`) mezclan dos patrones de alias (`@shared/` vs `@/`). El estándar de imports especifica un orden y consistencia.

---

### Service Patterns

**Resultado: WARN**

**Conformidades:**
- Decorador `@Injectable()` correctamente aplicado
- Uso de `@InjectRepository` con datasource explícito (`'progress'`, `'educational'`, `'auth'`) — correcto para arquitectura multi-datasource
- `@InjectEntityManager('progress')` para transacciones — correcto

**Violaciones:**

1. **Ausencia de transacciones explícitas en operaciones compuestas:**

   El método `claimRewards` realiza múltiples operaciones de escritura de forma secuencial sin envolver en una transacción:
   - `userStatsService.addXp()` (línea 1089)
   - `mlCoinsService.addCoins()` (línea 1090–1097)
   - `mlCoinsService.addCoins()` para rank bonus (línea 1136–1143) — si aplica
   - `submissionRepo.save()` (línea 1186)

   Si `mlCoinsService.addCoins()` falla después de `addXp()`, el usuario recibe XP pero no ML Coins, y la submission no queda marcada como reclamada. Esto es una inconsistencia de datos real.

   El `entityManager` inyectado está disponible pero no se usa para wrapping transaccional de estas operaciones multi-repo. El estándar implica usar `entityManager.transaction()` para operaciones atómicas.

2. **Mezcla de datasources en operaciones:** `claimRewards` llama a `userStatsService` (datasource `gamification`), `mlCoinsService` (datasource `gamification`), y escribe en `submissionRepo` (datasource `progress`). TypeORM no puede englobar operaciones de múltiples datasources en una sola transacción — esto es una limitación arquitectónica que debería estar documentada y tratada con patrones de saga o compensating transactions.

3. **`findPendingReview` sin paginación:** Línea 820–825 retorna `find()` sin `take`/`skip`. En producción con muchas submissions pendientes, esto puede causar problemas de rendimiento.

4. **`getSubmissionStats` carga todos los submissions en memoria:** Líneas 786–788, usa `this.submissionRepo.find({ where: { user_id: userId } })` para calcular estadísticas en TypeScript. Debería usarse una query `SELECT COUNT, AVG, SUM` en SQL para eficiencia.

5. **`autoGrade` consulta el ejercicio dos veces:** El método es llamado desde `gradeSubmission` que no pasa el ejercicio ya cargado; `autoGrade` lo carga nuevamente (línea 587). Y `submitExercise` ya lo cargó (línea 224). Total: 3 queries al mismo ejercicio en el flujo normal.

6. **Uso de `Object.assign` para retorno:** Línea 386:
   ```typescript
   return Object.assign(submission, {
     requiresManualReview: true,
     message: '...',
   });
   ```
   Muta la entidad TypeORM y añade propiedades que no forman parte del esquema. El patrón correcto es retornar un DTO de respuesta separado.

---

### Repository Pattern Compliance

**Resultado: FAIL**

Según `03-repository-pattern.md`:

- No existe ningún archivo de interfaz de repositorio en el módulo `progress` (`IExerciseSubmissionRepository`)
- No existe un mapper `SubmissionPersistenceMapper` — la entidad TypeORM es usada directamente como dominio
- Los queries complejos no están encapsulados en métodos de repositorio — están distribuidos entre el servicio y llamadas directas a `EntityManager.query()`
- Las queries de `updateModuleProgressAfterCompletion` y `updateModuleProgressOnSubmission` hacen 4–6 queries SQL directas que deberían estar en un repositorio de `ModuleProgress`

---

### Logger Usage

**Resultado: PASS (con observaciones)**

- `Logger` de NestJS correctamente instanciado con nombre de clase (línea 84)
- Uso apropiado de `logger.log`, `logger.warn`, `logger.error` según severidad
- Operaciones no críticas usan `warn` cuando fallan (notificaciones, WebSocket)
- Operaciones críticas usan `error`

**Observaciones:**
- Los prefijos de issue (`[BUG-001 FIX]`, `[CORR-010]`) son valiosos en desarrollo pero en producción estable deberían ser nombres de operación semánticos
- El logger no registra información de correlación (tenant, request ID) que facilitaría debugging en producción multi-tenant

---

### Transaction Handling

**Resultado: FAIL**

Las operaciones compuestas en `claimRewards` y `submitExercise` no usan transacciones. Riesgos de inconsistencia:

1. `submitExercise` → puede crear submission y fallar en `gradeSubmission` o `claimRewards`, dejando submission en estado inconsistente
2. `claimRewards` → puede añadir XP y fallar antes de registrar ML Coins o actualizar la submission con `xp_earned`/`ml_coins_earned`

El `entityManager` está inyectado (línea 93–94) pero solo se usa para queries raw, nunca para `entityManager.transaction(async (manager) => {...})`.

**Nota:** La distribución multi-datasource hace imposible transacciones ACID completas entre `progress`, `gamification`, y `auth`. Esto requiere una decisión arquitectónica documentada (saga pattern, eventual consistency, o compensating transactions).

---

### TypeORM Patterns

**Resultado: WARN**

**Conformidades:**
- `@InjectRepository` con datasource explícito
- Uso de `findOne({ where: ... })` con tipado
- `submissionRepo.create()` + `submissionRepo.save()` (patrón correcto)

**Violaciones:**

1. **Consultas SQL raw en lugar de QueryBuilder:** Múltiples `entityManager.query()` con SQL manual podrían reemplazarse con QueryBuilder para mejor mantenibilidad y portabilidad.

2. **Cast de tipos peligroso:** `this.submissionRepo.create({...} as any)` en línea 1578 desactiva el type-checking de TypeORM.

3. **Propiedad `order` en `findOne`:** Líneas 200–203 y 1618–1625 usan `{ order: { submitted_at: 'DESC' } }` en `findOne`. En TypeORM 0.3.x, `findOne` con `order` no garantiza que devuelva el primero ordenado; lo correcto es usar `findOne` con `order` combinado con un subquery o usar `find({ take: 1, order: ... })`.

4. **Schema names hardcodeados en raw SQL:** Los schemas `progress_tracking`, `gamification_system`, `educational_content`, `social_features`, `auth_management` están embebidos en strings SQL (8+ ocurrencias). Un cambio de naming en los schemas requiere editar manualmente todas las referencias.

---

## Summary

| Categoría | Resultado | Descripción breve |
|-----------|-----------|-------------------|
| SRP (Single Responsibility) | WARN | 10+ responsabilidades distintas en una clase |
| OCP (Open/Closed) | WARN | Condicionales por tipo de ejercicio — difícil de extender |
| LSP (Liskov) | PASS | Sin jerarquías de herencia problemáticas |
| ISP (Interface Segregation) | WARN | Servicio monolítico sin interfaces segregadas |
| DIP (Dependency Inversion) | FAIL | Dependencias directas a implementaciones concretas |
| Clean Architecture | WARN | SQL raw en capa de aplicación; queries cross-schema |
| Repository Pattern | FAIL | Sin interfaces, sin mappers, queries SQL inline |
| DDD básico | WARN | Sin entidades de dominio puras; TypeORM entity = domain entity |
| Error Handling | PASS | Excepciones NestJS correctas; try/catch apropiados en secundarios |
| Data Validation | WARN | Type casting sin DTO validation; `as any` en puntos críticos |
| Security | WARN | URL sin sanitizar; IDs expuestos en errores; sin auth check en servicio |
| Code Quality | WARN | 1963 líneas; métodos de 100–230 líneas; números mágicos; DRY violations |
| Service Patterns | WARN | Sin paginación; N+1 queries; `Object.assign` en entidad |
| Transaction Handling | FAIL | Operaciones multi-step sin transacciones |
| TypeORM Patterns | WARN | `as any`; schemas hardcodeados; `findOne` con `order` ambiguo |
| Logger Usage | PASS | Logger correcto; levels apropiados |

---

## Critical Violations

### CV-01 — SIN TRANSACCIONES en operaciones multi-step [SEVERITY: HIGH]

**Líneas afectadas:** 1089–1186 (`claimRewards`), 214–407 (`submitExercise`)

`claimRewards` ejecuta: addXp → addCoins → addCoins(bonus) → save(submission). Sin transacción. Si el paso 3 falla, el usuario tiene XP pero la submission no queda marcada como reclamada. Doble-gasto o pérdida de rewards son consecuencias reales.

**Fix mínimo:** Envolver las operaciones dentro del mismo datasource en `entityManager.transaction()`. Documentar que las operaciones cross-datasource son eventually consistent.

---

### CV-02 — DEPENDENCY INVERSION VIOLATION: sin interfaces de repositorio [SEVERITY: HIGH]

**Impacto:** Imposibilidad de unit testing real sin base de datos. Acoplamiento directo a TypeORM impide cambios de infraestructura. El estándar lo clasifica como violación explícita.

**Fix mínimo:** Crear `IExerciseSubmissionRepository` en `progress/interfaces/` con los métodos usados. Inyectar via token. Los tests podrán entonces usar mocks tipados.

---

### CV-03 — SQL RAW con schema names hardcodeados en capa de aplicación [SEVERITY: HIGH]

**Líneas afectadas:** 668–685, 1107–1111, 1262–1266, 1292–1296, 1352–1355, 1368–1375, 1396–1427, 1704–1720, 1874–1881, 1914–1935

El servicio de aplicación contiene SQL con `gamification_system.user_stats`, `progress_tracking.module_progress`, `social_features.classroom_members`, etc. Viola Clean Architecture. Las queries deberían estar en repositorios de la capa de infraestructura.

---

### CV-04 — URL DE VIDEO SIN VALIDACIÓN (riesgo SSRF) [SEVERITY: MEDIUM]

**Línea 284:**
```typescript
const videoUrl = answers.videoUrl || answers.url || answers.video;
if (!videoUrl) { throw ... }
```
La URL del video carta es aceptada del input del usuario sin validar protocolo, host, o si es una IP interna. El estándar OWASP API7 / ESTANDAR-SEGURIDAD sección 1B.7 requiere `UrlValidationService`.

---

### CV-05 — `Object.assign` muta entidad TypeORM con propiedades transient [SEVERITY: MEDIUM]

**Línea 386:**
```typescript
return Object.assign(submission, {
  requiresManualReview: true,
  message: '...',
});
```
Añade propiedades no definidas en la entidad. Si TypeORM persiste esta entidad en otro punto del flujo, puede fallar o ignorar silenciosamente los campos. El patrón correcto es un DTO de respuesta separado.

---

### CV-06 — IDs internos expuestos en mensajes de error [SEVERITY: MEDIUM]

**Líneas 126, 226, 588:** Los mensajes de error incluyen el `profileId`, `exerciseId` reales. En producción facilita enumeración de recursos. El estándar indica mensajes genéricos sin datos internos en producción.

---

### CV-07 — `getSubmissionStats` sin agregación en BD [SEVERITY: LOW-MEDIUM]

**Líneas 786–813:** Carga todas las submissions del usuario en memoria para calcular COUNT, AVG, SUM en TypeScript. Con usuarios activos con cientos de submissions, esto es un hotspot de rendimiento.

---

## Recommendations

### Prioridad ALTA (bloquean calidad de producción)

**REC-01 — Atomicidad en claimRewards**
Envolver las operaciones de `userStatsService.addXp()`, `mlCoinsService.addCoins()`, y `submissionRepo.save()` que pertenecen al mismo datasource en una transacción TypeORM. Para operaciones cross-datasource, documentar la estrategia de consistencia eventual y agregar rollback/compensación en caso de error parcial.

**REC-02 — Extraer interfaces de repositorio**
Crear `apps/backend/src/modules/progress/interfaces/exercise-submission.repository.interface.ts` con métodos `findById`, `findByUserId`, `findByExerciseId`, `findByUserAndExercise`, `save`, `create`. Refactorizar el servicio para depender de la interfaz. Esto habilita unit tests reales.

**REC-03 — Mover SQL raw a repositorios de infraestructura**
Crear `ModuleProgressRepository` que encapsule las queries UPSERT de `updateModuleProgressAfterCompletion` y `updateModuleProgressOnSubmission`. Los dos métodos actuales comparten lógica duplicada que puede unificarse en el repositorio.

**REC-04 — Validar URL de video_carta con UrlValidationService**
Antes de aceptar `videoUrl`, llamar a `UrlValidationService.validateExternalUrl()` para prevenir SSRF. Si la URL es interna al sistema (upload propio), validar que siga el patrón de URLs internas esperado.

### Prioridad MEDIA (deuda técnica significativa)

**REC-05 — Separar responsabilidades en servicios especializados**
Extraer de `ExerciseSubmissionService`:
- `SubmissionRewardService` → `claimRewards`, `getRankXpMultiplier`, `getRankConfigFromDB`
- `ModuleProgressService` → `updateModuleProgressAfterCompletion`, `updateModuleProgressOnSubmission`
- `ExerciseGradingService` → `gradeSubmission`, `autoGrade`, `validateRuedaInferencias`
- `SubmissionNotificationService` → `notifyTeacherOfSubmission`

**REC-06 — Strategy Pattern para validadores por tipo de ejercicio**
Crear interface `IExerciseValidator` con método `validate(answers: unknown): Promise<void>`. Implementaciones: `DiarioMultimediaValidator`, `ComicDigitalValidator`, `VideoCartaValidator`. Registrar en un mapa por `exercise_type`. Esto elimina los 5 `if (exercise.exercise_type === '...')` en `submitExercise`.

**REC-07 — Reemplazar números mágicos por constantes nombradas**
Definir en un archivo de constantes del módulo:
```typescript
const MANUAL_GRADING_PASS_THRESHOLD = 0.6;
const DEFAULT_XP_REWARD_FALLBACK = 100;
const PERFECT_SCORE_BONUS_XP = 50;
const PERFECT_SCORE_BONUS_COINS = 10;
const HINT_PENALTY_XP_PER_HINT = 5;
```

**REC-08 — Usar DTO de respuesta en lugar de `Object.assign` sobre entidad**
Crear `ExerciseSubmissionResponseDto` con los campos normales de `ExerciseSubmission` más campos opcionales `requiresManualReview?: boolean`, `message?: string`, `rankUp?: RankUpDto`, `rewards?: RewardsDto`. Retornar DTO en lugar de mutar la entidad.

**REC-09 — Agregar paginación a `findPendingReview` y `findByUserId`**
```typescript
async findPendingReview(page = 1, limit = 20): Promise<[ExerciseSubmission[], number]> {
  return this.submissionRepo.findAndCount({
    where: { status: 'submitted' },
    order: { submitted_at: 'ASC' },
    skip: (page - 1) * limit,
    take: Math.min(limit, 100),
  });
}
```

**REC-10 — Reemplazar `getSubmissionStats` con query SQL agregada**
```sql
SELECT
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE status = 'graded') as graded_submissions,
  AVG(score) as average_score,
  COUNT(*) FILTER (WHERE score = max_score AND hint_used = false) as perfect_scores_count,
  SUM(time_spent_seconds) as total_time_spent
FROM progress_tracking.exercise_submissions
WHERE user_id = $1
```

### Prioridad BAJA (mejoras de calidad)

**REC-11 — Jerarquía de excepciones de dominio**
Crear `apps/backend/src/modules/progress/errors/submission.errors.ts` con clases como `SubmissionNotFoundError`, `SubmissionAlreadyGradedError`, `InvalidSubmissionTransitionError`. Asignar códigos únicos (`SUBMISSION_NOT_FOUND`, etc.) para estandarizar respuestas de error.

**REC-12 — Limpiar tags de fix/bug en logs de producción**
Reemplazar prefijos como `[BUG-001 FIX]` → `[claimRewards]`, `[CORR-010]` → `[submitExercise:resubmit]`. Mantener referencias a issues en comentarios de código, no en strings de log de producción.

**REC-13 — Añadir query count de tests unitarios**
El módulo `progress` necesita tests de: `submitExercise` happy path, `submitExercise` para ejercicio ya calificado, `claimRewards` con double-claim prevention, transiciones de estado inválidas en `updateStatus`. El estándar `07-testing-patterns.md` requiere cobertura mínima del 80% en lógica de negocio.

---

*Fin de VAL02 — Backend Standards Compliance Audit*
*Generado: 2026-02-21 | Estándares versión: ESTANDAR-BACKEND-PROFESIONAL v1.0.0*
