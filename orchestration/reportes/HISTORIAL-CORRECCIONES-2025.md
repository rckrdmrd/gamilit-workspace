# Historial de Correcciones - GAMILIT 2025

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Tipo:** Registro histórico de correcciones y ajustes
**Última actualización:** 2025-12-18

> **NOTA:** Este archivo contiene el historial de correcciones realizadas durante el desarrollo.
> Los inventarios (`MASTER_INVENTORY.yml`, `DATABASE_INVENTORY.yml`, etc.) contienen solo
> las definiciones actuales/definitivas del sistema.

---

## Índice

1. [Correcciones 2025-12-18](#correcciones-2025-12-18)
2. [Correcciones 2025-12-14](#correcciones-2025-12-14)
3. [Correcciones 2025-11-29](#correcciones-2025-11-29)

---

## Correcciones 2025-12-18

### CORR-M5-BACKEND-001

**Descripción:** Alineación completa de Backend M5 con DocumentoDeDiseño v6.1

**Causa raíz:** DTOs y validator tenían estructuras y tipos que no coincidían con el diseño oficial

**Archivos creados:**
- `apps/backend/src/modules/educational/dto/module5/diario-multimedia-answer.dto.ts`

**Archivos eliminados:**
- `apps/backend/src/modules/educational/dto/module5/diario-reflexivo-answer.dto.ts`
- `apps/backend/src/modules/educational/dto/module5/podcast-answer.dto.ts`

**Archivos modificados:**
- `apps/backend/src/modules/educational/dto/module5/index.ts`
- `apps/backend/src/modules/progress/dto/answers/exercise-answer.validator.ts`

**Cambios realizados:**
1. Creado `DiarioMultimediaAnswerDto` con estructura `entries[]` (compatible con Frontend/Seeds)
2. Eliminado `DiarioReflexivoAnswerDto` (estructura incompatible)
3. Eliminado `PodcastAnswerDto` (no está en DocumentoDeDiseño)
4. Removido case `podcast` del validator
5. Removido alias `diario_reflexivo` del validator
6. Removidos cases M4 no oficiales: resena_critica, chat_literario, email_formal, ensayo_argumentativo

**Ejercicios oficiales M5 (según DocumentoDeDiseño v6.1):**
- 5.1 `diario_multimedia` - Diario Interactivo de Marie
- 5.2 `comic_digital` - Resumen Visual Progresivo (Cómic Digital)
- 5.3 `video_carta` - Cápsula del Tiempo Digital

**Reporte:** `orchestration/reportes/REPORTE-COHERENCIA-M5-2025-12-18.md`

**Status:** ✅ COMPLETADO

---

### CORR-M4-NAVEGACION-HIPERTEXTUAL-001

**Descripción:** Corrección estructura de datos del ejercicio 4.4 (navegacion_hipertextual)

**Causa raíz:** El seed tenía estructura `mainArticle` (con links y paragraphs) pero el componente frontend esperaba `nodes[]` array con id, title, content, links[{targetId, label}]

**Error original:** "No hay contenido de navegación disponible para este ejercicio"

**Archivos modificados:**
- `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
- `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`

**Cambios realizados:**
1. Reemplazada estructura `mainArticle` por `nodes[]` array
2. Agregados 5 nodos: main-article, radiactividad, aislamiento, experimentos, premios
3. Cada nodo incluye: id, title, content, links[{targetId, label}]
4. Agregados campos: startNodeId: "main-article", targetNodeId: "experimentos"
5. Actualizada base de datos directamente con UPDATE para tomar efecto inmediato

**Estructura anterior (incorrecta):**
```json
{
  "mainArticle": { "title": "...", "paragraphs": [...], "links": [...] },
  "optimalPath": [...]
}
```

**Estructura nueva (correcta):**
```json
{
  "nodes": [
    { "id": "main-article", "title": "...", "content": "...", "links": [...] },
    ...
  ],
  "startNodeId": "main-article",
  "targetNodeId": "experimentos"
}
```

**Componentes involucrados:**
- Frontend: `NavegacionHipertextualExercise.tsx` (espera `exercise.nodes`)
- Adapter: `adaptToNavegacionHipertextualData()` (extrae `content.nodes`)
- Types: `HypertextNode` interface con id, title, content, links[]

**Status:** ✅ COMPLETADO

---

### CORR-ROUTING-TEACHER-ASSIGNMENTS-001

**Descripción:** Corrección orden de rutas en AssignmentsController - GET /upcoming antes de GET /:id

**Causa raíz:** En NestJS las rutas se evalúan en orden de declaración; @Get(':id') capturaba 'upcoming' como parámetro

**Error original:** `QueryFailedError: invalid input syntax for type uuid: 'upcoming'`

**Archivos modificados:**
- `apps/backend/src/modules/assignments/controllers/assignments.controller.ts`

**Cambio:** Movido método getUpcoming() de línea 583 a línea 128 (antes de findOne)

**Documentación actualizada:**
- `orchestration/inventarios/BACKEND_INVENTORY.yml` (sección teacher_assignments con orden definitivo)
- `orchestration/reportes/CORRECCION-ROUTING-TEACHER-ASSIGNMENTS-2025-12-18.md`

**Status:** ✅ COMPLETADO

---

### LIMPIEZA-M4-EJERCICIOS-001

**Descripción:** Eliminación de 4 ejercicios no oficiales del Módulo 4 (no están en DocumentoDeDiseño v6.4)

**Ejercicios eliminados:**
- `resena_critica` (4.6)
- `chat_literario` (4.7)
- `email_formal` (4.8)
- `ensayo_argumentativo` (4.9)

**Ejercicios oficiales M4 (según documento de diseño):**
- `verificador_fake_news` (4.1)
- `infografia_interactiva` (4.2)
- `quiz_tiktok` (4.3)
- `navegacion_hipertextual` (4.4)
- `analisis_memes` (4.5)

**Archivos eliminados:**

Frontend:
- `features/mechanics/module4/ResenaCritica/`
- `features/mechanics/module4/ChatLiterario/`
- `features/mechanics/module4/EmailFormal/`
- `features/mechanics/module4/EnsayoArgumentativo/`

Backend:
- `modules/educational/dto/module4/resena-critica-answer.dto.ts`
- `modules/educational/dto/module4/chat-literario-answer.dto.ts`
- `modules/educational/dto/module4/email-formal-answer.dto.ts`
- `modules/educational/dto/module4/ensayo-argumentativo-answer.dto.ts`

**Archivos modificados:**
- `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`
- `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
- `apps/frontend/src/shared/utils/exerciseAdapter.ts`
- `apps/backend/src/modules/educational/dto/module4/index.ts`
- `docs/04-fase-backlog/TIPOS-EJERCICIOS-PENDIENTES.md`

**Referencia:** `DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` líneas 782-965

**Status:** ✅ COMPLETADO

---

### CORR-ERRORES-M4-001

**Descripción:** Bug Fix: 8 adaptadores M4-M5 faltantes en exerciseAdapter.ts

**Archivos modificados:**
- `apps/frontend/src/shared/utils/exerciseAdapter.ts`

**Adaptadores agregados:**

M4:
- `adaptToQuizTikTokData`
- `adaptToInfografiaInteractivaData`
- `adaptToVerificadorFakeNewsData`
- `adaptToNavegacionHipertextualData`
- `adaptToAnalisisMemesData`

M5:
- `adaptToDiarioMultimediaData`
- `adaptToComicDigitalData`
- `adaptToVideoCartaData`

**Errores corregidos:**
- `InfografiaInteractivaExercise: Cannot read properties of undefined (reading 'filter')`
- `QuizTikTokExercise: Cannot read properties of undefined (reading '0')`

**Reporte:** `orchestration/analisis/PLAN-CORRECCION-ERRORES-M4-2025-12-18.md`

**Status:** ✅ COMPLETADO

---

### IMPL-M4M5-CORRECCIONES-001

**Descripción:** Implementación correcciones M5 (estructura + DTOs + seeds)

**Nota:** PARCIALMENTE REVERTIDO - Los archivos M4 (ResenaCritica, ChatLiterario, EmailFormal, EnsayoArgumentativo) fueron eliminados en LIMPIEZA-M4-EJERCICIOS-001 por no estar en DocumentoDeDiseño v6.4

**Archivos creados (M5 - vigentes):**
- `features/mechanics/module5/ComicDigital/comicDigitalTypes.ts`
- `features/mechanics/module5/ComicDigital/comicDigitalSchemas.ts`
- `features/mechanics/module5/ComicDigital/comicDigitalMockData.ts`
- `features/mechanics/module5/DiarioMultimedia/diarioMultimediaTypes.ts`
- `features/mechanics/module5/DiarioMultimedia/diarioMultimediaSchemas.ts`
- `features/mechanics/module5/DiarioMultimedia/diarioMultimediaMockData.ts`
- `features/mechanics/module5/VideoCarta/videoCartaTypes.ts`
- `features/mechanics/module5/VideoCarta/videoCartaSchemas.ts`
- `features/mechanics/module5/VideoCarta/videoCartaMockData.ts`

**Reporte:** `orchestration/analisis/PLAN-IMPLEMENTACION-M4-M5-2025-12-18.md`

**Status:** ⚠️ PARCIALMENTE REVERTIDO (ver LIMPIEZA-M4-EJERCICIOS-001)

---

### P0-TEACHER-001

**Descripción:** Corregir datasources de AssignmentsModule y TeacherModule

**Archivos modificados:**
- `apps/backend/src/modules/assignments/assignments.module.ts`
- `apps/backend/src/modules/assignments/services/assignments.service.ts`
- `apps/backend/src/modules/teacher/teacher.module.ts`
- `apps/backend/src/modules/teacher/services/analytics.service.ts`
- `apps/backend/src/modules/teacher/services/teacher-content.service.ts`
- `apps/backend/src/app.module.ts`

**Cambio:** Datasource 'content' -> 'educational' para Assignment entities

**Reporte:** `orchestration/analisis/ANALISIS-COHERENCIA-DATASOURCES-BD-DOC-2025-12-18.md`

**Status:** ✅ COMPLETADO

---

### P0-TEACHER-002

**Descripción:** Corregir índices TypeORM en entidades Assignment

**Archivos modificados:**
- `apps/backend/src/modules/assignments/entities/assignment.entity.ts`
- `apps/backend/src/modules/assignments/entities/assignment-exercise.entity.ts`
- `apps/backend/src/modules/assignments/entities/assignment-student.entity.ts`
- `apps/backend/src/modules/assignments/entities/assignment-submission.entity.ts`

**Cambio:** Cambiar nombres de columnas a nombres de propiedades en @Index()

**Status:** ✅ COMPLETADO

---

### P0-SQL-001

**Descripción:** Corregir columnas inexistentes en funciones SQL

**Archivos modificados:**
- `apps/database/ddl/schemas/gamification_system/functions/get_user_rank_progress.sql`
- `apps/database/ddl/schemas/gamification_system/functions/update_leaderboard_global.sql`
- `apps/database/ddl/schemas/progress_tracking/functions/05-get_classroom_analytics.sql`
- `apps/database/ddl/schemas/progress_tracking/functions/06-update_mission_progress.sql`

**Cambio:** `missions_completed` -> `modules_completed`, `last_activity_date` -> `last_activity_at`

**Status:** ✅ COMPLETADO

---

### P1-DOC-001

**Descripción:** Actualizar documentación RF-TEACH-002 con schema correcto

**Archivos modificados:**
- `docs/03-fase-extensiones/EXT-001-portal-maestros/requerimientos/RF-TEACH-002-assignment-system.md`

**Cambio:** Schema `public` -> `educational_content` en todas las tablas de assignments

**Status:** ✅ COMPLETADO

---

### CORR-TYPEORM-CROSSSCHEMA-001

**Descripción:** Corrección error TypeORM cross-schema joins en Teacher Dashboard

**Error:** `TypeORMError: "educational_content" alias was not found. Maybe you forgot to join it?`

**Endpoint afectado:** `GET /api/v1/teacher/classrooms/:id/students`

**Causa raíz:** TypeORM QueryBuilder NO soporta `.innerJoin('schema.table', ...)` directamente. El patrón parece SQL válido pero TypeORM interpreta 'schema' como un alias no declarado.

**Archivo modificado:**
- `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Cambios realizados:**
1. Agregado import `InjectDataSource, DataSource` de typeorm
2. Inyectado `@InjectDataSource('progress')` en constructor
3. Reescrita función `getStudentsCurrentActivity()` usando raw SQL en lugar de QueryBuilder

**Código anterior (INCORRECTO):**
```typescript
.innerJoin('educational_content.exercises', 'e', 'e.id = es.exercise_id')
.innerJoin('educational_content.modules', 'm', 'm.id = e.module_id')
```

**Código nuevo (CORRECTO):**
```typescript
const sql = `
  SELECT ...
  FROM progress_tracking.exercise_submissions es
  LEFT JOIN educational_content.exercises e ON e.id = es.exercise_id
  LEFT JOIN educational_content.modules m ON m.id = e.module_id
  WHERE es.user_id = ANY($1)
`;
const results = await this.dataSource.query(sql, [studentIds]);
```

**Documentación creada:**
- `ANALISIS-ROOT-CAUSE-TYPEORM-CROSSSCHEMA-2025-12-18.md`
- `GUIA-ANTI-REGRESION-TYPEORM-CROSSSCHEMA.md`
- `CORRECCION-FINAL-TYPEORM-CROSSSCHEMA-2025-12-18.md`

**Documentación marcada DEPRECATED:**
- `PLAN-CORRECCION-TEACHER-MONITORING-2025-12-18.md` (contiene patrón incorrecto en líneas 119-143)

**Status:** ✅ COMPLETADO Y VERIFICADO EN RUNTIME (2025-12-18 05:20 UTC)

**Verificacion:**
- Endpoint `GET /teacher/classrooms/:id/students`: HTTP 200 OK
- 46 estudiantes devueltos correctamente
- Campos `current_rank`, `total_ml_coins`, `achievements_count` poblados
- Logs confirman queries raw SQL ejecutandose sin errores TypeORM

---

## Correcciones 2025-12-14

### P0-001-v2.1

**Descripción:** Actualizar umbrales XP en funciones SQL a v2.1

**Archivo:** `apps/database/ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql`

**Cambio:** Sincronizar umbrales con seeds (0-499, 500-999, 1000-1499, 1500-1899, 1900+)

**Reporte:** `orchestration/reportes/TECH-LEADER-VALIDATION-REPORT-2025-12-14.md`

**Status:** ✅ COMPLETADO

---

### P0-002

**Descripción:** Corregir isMinRank en useRank.ts

**Archivo:** `apps/frontend/src/features/gamification/ranks/hooks/useRank.ts`

**Cambio:** Cambiar rango mínimo de 'Nacom' a 'Ajaw'

**Status:** ✅ COMPLETADO

---

### P0-003

**Descripción:** Corregir cálculo de progreso para usar XP en lugar de ML Coins

**Archivo:** `apps/frontend/src/features/gamification/ranks/hooks/useRank.ts`

**Cambio:** Progress ahora usa totalXP/currentXP con umbrales v2.1

**Status:** ✅ COMPLETADO

---

### P0-004

**Descripción:** Reemplazar mock data con API real en useRank

**Archivos modificados:**
- `apps/frontend/src/features/gamification/ranks/api/ranksAPI.ts`
- `apps/frontend/src/features/gamification/ranks/hooks/useRank.ts`
- `apps/frontend/src/features/gamification/ranks/hooks/useRanksConfig.ts`

**Acciones completadas:**
- Verificar endpoints backend (GET /gamification/ranks existe)
- Agregar getRanksConfig() a ranksAPI.ts
- Crear hook useRanksConfig() con cache global
- Actualizar useRank.ts para usar useRanksConfig
- Eliminar dependencia directa de mockData en useRank.ts

**Nota:** Otros componentes (PrestigeSystem, ranksStore) aún usan mockData para funcionalidades de prestige

**Status:** ✅ COMPLETADO

---

## Correcciones 2025-11-29

### CORR-CLEAN-002

**Descripción:** Integrar funciones P0-001 al DDL permanente

**Archivo creado:** `apps/database/ddl/schemas/gamification_system/functions/calculate_maya_rank_helpers.sql`

**Funciones integradas:**
- `calculate_maya_rank_from_xp(INTEGER)`
- `calculate_rank_progress_percentage(INTEGER, TEXT)`

**Status:** ✅ COMPLETADO

---

### P0-001-DEPRECATION

**Descripción:** Mover migración P0-001 a _deprecated

**Origen:** `apps/backend/migrations/P0-001-migrate-maya-rank-values.sql`

**Destino:** `apps/backend/_deprecated/migrations-maya-rank-2025-11-29/`

**Status:** ✅ COMPLETADO

---

## Referencias

- Inventarios: `orchestration/inventarios/`
- Trazas: `orchestration/trazas/`
- Análisis: `orchestration/analisis/`
- Reportes de agentes: `orchestration/agentes/*/`
