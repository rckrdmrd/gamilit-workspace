# P7: Hallazgos Consolidados -- Auditoria Post-Fix CORR-03/04

**Fecha:** 2026-02-17
**Version:** 1.0.0
**Agentes ejecutados:** 6 (P1-P6)
**Total findings brutos:** 42
**Findings deduplicados:** 28

---

## Resumen Ejecutivo

La auditoria post-fix de 6 agentes (P1: DDL Objects, P2: Duplication/Relationships, P3: Backend Coherence, P4: Frontend Integration, P5: Standards/Skills, P6: Documentation Completeness) revela un sistema en estado **saludable con deuda tecnica concentrada en los archivos RLS monoliticos**. Las correcciones CORR-03 (14 index errors), CORR-04 (16 RLS errors) y CORR-05 (30 seed errors) fueron ejecutadas exitosamente y estan correctamente trazadas en EPIC-WS-005, PROXIMA-ACCION y MEMORY.md. La coherencia DDL-Entity es 100% (169 tablas = 153 entity-backed + 16 DDL-only). El nuevo sistema de equipamiento (user_equipped_items) esta completamente integrado en las 3 capas (DDL, Backend, Frontend).

El riesgo principal identificado reside en la **duplicacion de politicas RLS** entre archivos monoliticos (07-*.sql) y archivos de schema (rls-policies/*.sql). Se detectaron 6 politicas con nombres exactamente duplicados que causarian errores en ejecucion no-idempoente, y ~10 politicas adicionales con duplicacion funcional. Adicionalmente, los archivos monoliticos (228 politicas) carecen de COMMENT ON POLICY, DROP POLICY IF EXISTS, y usan el patron no-canonico `auth.uid()` en lugar de `gamilit.get_current_user_id()`.

A nivel de documentacion, 5 documentos tienen metricas desactualizadas (CLAUDE.md, BACKEND_INVENTORY, COHERENCE-ENTITIES-DDL, ADR-003, SEEDS_INVENTORY) debido a las adiciones recientes del sistema de equipamiento y las correcciones CORR. MASTER_INVENTORY y DATABASE_INVENTORY estan actualizados y son la fuente de verdad.

---

## Hallazgos por Severidad

### CRITICO (Bloquean Deploy)

#### HC-001: Politicas RLS duplicadas por nombre entre 07-enable-rls.sql y 07d-rls-policies-pending-tables.sql
- **Fuentes:** F-P2-001
- **Severidad:** CRITICO
- **Ubicacion:** `apps/database/ddl/07-enable-rls.sql` y `apps/database/ddl/07d-rls-policies-pending-tables.sql`
- **Descripcion:** 6 politicas tienen el mismo nombre exacto aplicado a la misma tabla, pero definidas en archivos diferentes. PostgreSQL rechaza CREATE POLICY si ya existe una con ese nombre en la tabla. Las politicas duplicadas son:
  - `parent_accounts_admin_all` ON auth_management.parent_accounts
  - `parent_accounts_read_own` ON auth_management.parent_accounts
  - `parent_accounts_update_own` ON auth_management.parent_accounts
  - `parent_notifications_admin_all` ON auth_management.parent_notifications
  - `parent_notifications_read_own` ON auth_management.parent_notifications
  - `parent_student_links_admin_all` ON auth_management.parent_student_links
- **Impacto:** El segundo CREATE POLICY falla con ERROR en runtime. Las versiones en 07 usan `auth.uid()` mientras las de 07d usan `gamilit.get_current_user_id()` (patron canonico). La politica mas correcta (07d) no se aplica si 07 se ejecuta primero.
- **Accion Requerida:** Agregar `DROP POLICY IF EXISTS` antes de cada CREATE POLICY en 07d, o eliminar las politicas de 07 en favor de las de 07d (que usan el patron canonico).
- **Esfuerzo Estimado:** S

---

### ALTO (Fix en Proximo Sprint)

#### HA-001: Politicas RLS duplicadas entre schema-level files y global 07b/07c files
- **Fuentes:** F-P2-002
- **Severidad:** ALTO
- **Ubicacion:** Multiples archivos en `schemas/*/rls-policies/`, `schemas/*/tables/`, y `07b-enable-rls-phase2.sql` / `07c-enable-rls-phase3.sql`
- **Descripcion:** ~10+ pares (policy_name, table) aparecen definidos tanto en archivos de schema como en archivos globales. Ejemplos: `achievements_all_admin`, `user_achievements_select_admin`, `ml_transactions_select_admin`, `marie_content_all_admin`, `audit_logs_select_admin`, todos definidos en 2 archivos diferentes.
- **Impacto:** Si ambos se ejecutan como CREATE sin DROP previo, el segundo falla. Depende del orden de ejecucion del init script.
- **Accion Requerida:** Decidir convencion: schema-level o inline. Agregar `DROP POLICY IF EXISTS` en la fuente canonical. Crear documento de convencion para RLS policy management.
- **Esfuerzo Estimado:** M

#### HA-002: 217 columnas TIMESTAMP en lugar de TIMESTAMPTZ en 91 archivos DDL
- **Fuentes:** F-P5-001, F-P5-006
- **Severidad:** ALTO
- **Ubicacion:** 91 archivos DDL en social_features, educational_content, progress_tracking, auth_management, gamification_system, data_warehouse, content_management, notifications, lti_integration. Tambien el template SIMCO-DDL.md lineas 272-273.
- **Descripcion:** 217 ocurrencias de bare `TIMESTAMP` en lugar de `TIMESTAMPTZ`. El estandar ESTANDAR-DATABASE-PROFESIONAL.md seccion 7 prescribe `TIMESTAMPTZ`. El template SIMCO-DDL.md propaga la violacion.
- **Impacto:** En deployment single-timezone no causa problemas funcionales. Riesgo si la plataforma se despliega en multiples zonas horarias. Cada agente que siga el template creara tablas con TIMESTAMP sin timezone.
- **Accion Requerida:** (1) Actualizar SIMCO-DDL.md template a TIMESTAMPTZ (inmediato, 5 min). (2) Migrar gradualmente archivos DDL existentes (2-4 horas, bajo riesgo con DDL-first workflow).
- **Esfuerzo Estimado:** L (migracion completa) / S (solo template)

#### HA-003: Dual patron auth.uid() vs gamilit.get_current_user_id() en politicas RLS
- **Fuentes:** F-P5-002, F-P5-005 (parcial)
- **Severidad:** ALTO
- **Ubicacion:** 07-enable-rls.sql (73 usos), 07b (83 usos), 07c (21 usos), mas 4 archivos inline (user_difficulty_progress, user_current_level, classroom_missions, classroom_modules)
- **Descripcion:** 177+ politicas usan `auth.uid()` (patron Supabase no-canonico) mientras 180+ usan `gamilit.get_current_user_id()` (patron canonico documentado). Funcionalmente equivalentes pero crean confusion y dificultan auditorias.
- **Impacto:** Inconsistencia en ~46% de las politicas RLS. No causa errores funcionales pero viola el estandar interno.
- **Accion Requerida:** Migrar archivos monoliticos a `gamilit.get_current_user_id()`, o documentar ambos como validos en SIMCO-DDL.md.
- **Esfuerzo Estimado:** M

#### HA-004: Zero COMMENT ON POLICY en 228 politicas monoliticas
- **Fuentes:** F-P5-003
- **Severidad:** ALTO
- **Ubicacion:** `07-enable-rls.sql` (63 politicas), `07b` (65), `07c` (29), `07d` (71)
- **Descripcion:** Ninguna de las 228 politicas en archivos monoliticos tiene `COMMENT ON POLICY`, mientras el 100% de las politicas en archivos de schema si lo tienen. Solo 231 de 613 politicas totales (~38%) tienen documentacion.
- **Impacto:** En un sistema con 400+ politicas runtime, la falta de documentacion crea carga significativa para auditorias y mantenimiento.
- **Accion Requerida:** Agregar COMMENT ON POLICY a las 228 politicas monoliticas. Considerar como CORR-06.
- **Esfuerzo Estimado:** L

#### HA-005: ~40 endpoints sociales backend sin integracion frontend
- **Fuentes:** F-P4-005
- **Severidad:** ALTO
- **Ubicacion:** peer-challenges.controller.ts (~16 endpoints), team-challenges.controller.ts (~9 endpoints), challenge-participants.controller.ts (~15 endpoints)
- **Descripcion:** 3 controladores backend del modulo social con ~40 endpoints combinados no tienen ninguna llamada API desde frontend (0 API files, 0 hooks, 0 pages, 0 types). Representa ~4.4% del total de endpoints sin uso.
- **Impacto:** Funcionalidad backend completa que no es accesible para usuarios finales.
- **Accion Requerida:** Ya documentado en BACKLOG como TRZ-006 (EPIC-WS-006, estado: pendiente). Planificar sprint de integracion frontend.
- **Esfuerzo Estimado:** L

#### HA-006: admin_reports y metrics_history sin RLS
- **Fuentes:** F-P2-005
- **Severidad:** ALTO
- **Ubicacion:** `apps/database/ddl/schemas/admin_dashboard/tables/`
- **Descripcion:** Las tablas `admin_dashboard.admin_reports` y `admin_dashboard.metrics_history` no tienen ENABLE ROW LEVEL SECURITY ni politicas. Solo `bulk_operations` tiene RLS.
- **Impacto:** Cualquier usuario autenticado podria leer reportes admin y historial de metricas si conecta directamente a la BD (bypass de NestJS guards). Riesgo de seguridad.
- **Accion Requerida:** Agregar ENABLE RLS + policy admin_only para ambas tablas.
- **Esfuerzo Estimado:** S

---

### MEDIO (Fix Cuando Convenga)

#### HM-001: 9 tablas modificadas sin flujo FL-* en TRACEABILITY-MATRIX
- **Fuentes:** F-P1-004
- **Severidad:** MEDIO
- **Ubicacion:** `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- **Descripcion:** 9 tablas cuyos objetos fueron modificados en CORR-03/04 no aparecen en ningun flujo: marie_curie_contents, comodin_usage_trackings, leaderboard_metadatas, flagged_contents, team_members, user_blocks, user_reports, peer_challenges, certificates.
- **Impacto:** Tablas con RLS policies que no estan trazadas a flujos de usuario. La mayoria son tablas de soporte/moderacion.
- **Accion Requerida:** Crear flujos FL-ADM-12 (moderacion), FL-STU-21 (certificados). Agregar tablas de datos a flujos existentes.
- **Esfuerzo Estimado:** M

#### HM-002: No existe convencion formal para cross-schema references
- **Fuentes:** F-P1-005
- **Severidad:** MEDIO
- **Ubicacion:** `docs/40-standards/`, `docs/20-architecture/schema-reference/`
- **Descripcion:** No hay documento que formalice: (1) que `auth_management.profiles` es el FK target para user_id, (2) que entities cross-schema deben registrarse en el datasource, (3) que helpers gamilit.* son el patron para RLS cross-schema.
- **Impacto:** Riesgo de repetir errores como H-DB-02 y FIX-ECONN-001/002.
- **Accion Requerida:** Crear `docs/40-standards/ESTANDAR-CROSS-SCHEMA-REFERENCES.md`.
- **Esfuerzo Estimado:** S

#### HM-003: Falta traza CORR-04 en archivos DDL modificados
- **Fuentes:** F-P1-001
- **Severidad:** MEDIO
- **Ubicacion:** 17 archivos RLS en `apps/database/ddl/schemas/*/rls-policies/*.sql`
- **Descripcion:** 16 de 17 archivos RLS modificados por CORR-04 no tienen marcador de la correccion. Solo 1 archivo de indices tiene marcador CORR-03.
- **Impacto:** Dificulta auditorias futuras. Un desarrollador no puede saber mirando el DDL que fue modificado como parte de CORR-04.
- **Accion Requerida:** Agregar comments `-- Fixed: CORR-04 (2026-02-17)` o documentar politica de no-markers (preferir git blame).
- **Esfuerzo Estimado:** S

#### HM-004: Monolithic RLS files carecen de DROP POLICY IF EXISTS
- **Fuentes:** F-P5-004
- **Severidad:** MEDIO
- **Ubicacion:** `07-enable-rls.sql`, `07b-enable-rls-phase2.sql`, `07c-enable-rls-phase3.sql`
- **Descripcion:** 157 CREATE POLICY statements sin DROP POLICY IF EXISTS previo. Los 36 archivos de schema SI lo tienen (257 DROP statements).
- **Impacto:** Mitigado por DDL-first clean recreation, pero ejecucion parcial fallaria.
- **Accion Requerida:** Agregar DROP POLICY IF EXISTS a todos los CREATE POLICY en archivos monoliticos.
- **Esfuerzo Estimado:** M

#### HM-005: TO authenticated vs TO public inconsistencia
- **Fuentes:** F-P5-005
- **Severidad:** MEDIO
- **Ubicacion:** Monoliticos usan `TO authenticated` (157 politicas), schema-specific usan `TO public` (211 politicas)
- **Descripcion:** Dos convenciones de role target coexisten. `TO authenticated` es convencion Supabase; `TO public` es PostgreSQL estandar. El proyecto NO usa Supabase (self-hosted PostgreSQL 15).
- **Impacto:** Ambos patrones funcionan en runtime (el role `authenticated` SI se crea via auth/functions/01-uid.sql). Inconsistencia conceptual.
- **Accion Requerida:** Estandarizar en `TO public` para matching con PostgreSQL self-hosted y archivos de schema mas recientes.
- **Esfuerzo Estimado:** M

#### HM-006: Tablas catalogo sin RLS (documentacion pendiente)
- **Fuentes:** F-P2-004
- **Severidad:** MEDIO
- **Ubicacion:** Multiples tablas en gamification_system, educational_content, notifications
- **Descripcion:** ~15+ tablas de catalogo carecen de ENABLE RLS (maya_ranks, shop_categories, shop_items, achievement_categories, mission_templates, notification_templates, notification_queue, roles, etc.). Shop_items contiene precios y notification_queue datos sensibles.
- **Impacto:** Tablas de catalogo son generalmente read-only. Sin embargo, shop_items y notification_queue deberian tener RLS.
- **Accion Requerida:** Crear tabla de excepciones RLS. Agregar RLS a shop_items y notification_queue.
- **Esfuerzo Estimado:** M

#### HM-007: SIMCO-DDL template carece de mejores practicas RLS
- **Fuentes:** F-P5-007
- **Severidad:** MEDIO
- **Ubicacion:** `orchestration/directivas/simco/SIMCO-DDL.md` lineas 326-342
- **Descripcion:** El template RLS omite: DROP POLICY IF EXISTS, COMMENT ON POLICY, FORCE ROW LEVEL SECURITY para tablas sensibles, y guia sobre auth.uid() vs get_current_user_id().
- **Impacto:** Agentes creando nuevas tablas produciran politicas no-idempotentes y sin documentacion.
- **Accion Requerida:** Actualizar seccion RLS del template con mejores practicas.
- **Esfuerzo Estimado:** S

#### HM-008: Dual useInventory hooks en frontend
- **Fuentes:** F-P4-001
- **Severidad:** MEDIO
- **Ubicacion:** `economy/hooks/useInventory.ts` (Zustand, inventario general) y `social/hooks/useInventory.ts` (API, equipamiento cosmetico)
- **Descripcion:** 2 hooks con el mismo nombre en directorios diferentes. Un import incorrecto podria resolver al hook equivocado.
- **Impacto:** Confusion para desarrolladores. TypeScript no advierte ya que ambos exportan el mismo nombre.
- **Accion Requerida:** Renombrar `social/hooks/useInventory` a `useEquipment` o `useEquippedItems`.
- **Esfuerzo Estimado:** S

#### HM-009: CLAUDE.md Backend Metrics Outdated
- **Fuentes:** F-P6-002, F-P3-007 (parcial)
- **Severidad:** MEDIO
- **Ubicacion:** `CLAUDE.md` lineas 447-451 y linea 164
- **Descripcion:** 4 metricas backend desactualizadas: entities=152 (debe ser 154), services=171 (172), controllers=107 (108), endpoints=901 (904).
- **Impacto:** CLAUDE.md es el documento principal de contexto para agentes; metricas incorrectas afectan verificacion de coherencia.
- **Accion Requerida:** Actualizar seccion METRICAS ACTUALES Backend y linea Total.
- **Esfuerzo Estimado:** S

#### HM-010: Multiples fuentes ENABLE RLS para misma tabla
- **Fuentes:** F-P2-003
- **Severidad:** MEDIO
- **Ubicacion:** Global 07*.sql + schema-level rls-policies/*.sql + inline tables/*.sql
- **Descripcion:** ALTER TABLE ENABLE RLS aparece en multiples archivos para la misma tabla (audit_logs, module_progress, classrooms, user_sessions, messages, exercise_submissions, etc.).
- **Impacto:** Idempotente (no causa errores), pero dificulta auditar cobertura RLS.
- **Accion Requerida:** Consolidar ENABLE RLS en un solo lugar por tabla.
- **Esfuerzo Estimado:** M

---

### BAJO (Nice to Have)

#### HB-001: 65% de archivos de indices sin referencia a ticket/task
- **Fuentes:** F-P1-002
- **Severidad:** BAJO
- **Ubicacion:** 11 de 17 archivos en `schemas/*/indexes/*.sql`
- **Descripcion:** Indices creados entre 2025-10-27 y 2025-11-02 solo tienen `Created:` con fecha, sin ticket/task/sprint. Deuda historica pre-gobernanza SIMCO.
- **Accion Requerida:** Aceptar como deuda historica. Aplicar regla solo a archivos nuevos.
- **Esfuerzo Estimado:** S

#### HB-002: 72% de archivos RLS sin referencia a ticket/gap
- **Fuentes:** F-P1-003
- **Severidad:** BAJO
- **Ubicacion:** 31 de 43 archivos en `schemas/*/rls-policies/*.sql`
- **Descripcion:** Archivos historicos (2025-10 a 2025-12) sin referencia formal. Tendencia positiva -- 100% de archivos 2026-02+ tienen referencia.
- **Accion Requerida:** Aplicar regla a archivos nuevos. Retroactive tagging no justificado.
- **Esfuerzo Estimado:** S

#### HB-003: 4 entities con hardcoded schema/table strings en decorador @Entity
- **Fuentes:** F-P3-001, F-P3-002, F-P3-003, F-P3-004
- **Severidad:** BAJO
- **Ubicacion:** user.entity.ts (schema 'auth'), discussion-thread.entity.ts (schema 'social_features'), guild-mission.entity.ts (name 'guild_missions'), user-skill-rating.entity.ts (name 'user_skill_ratings')
- **Descripcion:** 4 entidades usan strings hardcodeados en lugar de constantes DB_SCHEMAS/DB_TABLES. Valores son correctos pero violan el patron de constantes.
- **Impacto:** Riesgo de no-propagacion si schema o tabla se renombra.
- **Accion Requerida:** Cambiar a constantes DB_SCHEMAS/DB_TABLES.
- **Esfuerzo Estimado:** S

#### HB-004: Politicas RLS redundantes con USING(true)
- **Fuentes:** F-P2-006
- **Severidad:** BAJO
- **Ubicacion:** challenge_participants, challenge_results, user_ranks
- **Descripcion:** Tablas con SELECT USING(true) (acceso publico) junto con SELECT policies mas restrictivas que son operacionalmente redundantes (OR semantics en PERMISSIVE).
- **Accion Requerida:** Documentar como decision de diseno intencional.
- **Esfuerzo Estimado:** S

#### HB-005: user_roles ENABLE RLS comentado
- **Fuentes:** F-P2-007
- **Severidad:** BAJO
- **Ubicacion:** `auth_management/rls-policies/02-enable-rls.sql:91`
- **Descripcion:** ENABLE RLS para user_roles esta comentado, pero existe CREATE POLICY user_roles_read_own. Sin RLS habilitado, la politica no se evalua.
- **Impacto:** Cualquier usuario autenticado puede leer todos los roles/permisos de todos los usuarios.
- **Accion Requerida:** Descomentar ENABLE RLS para user_roles.
- **Esfuerzo Estimado:** S

#### HB-006: Missing barrel exports en 4 directorios frontend gamification
- **Fuentes:** F-P4-002
- **Severidad:** BAJO
- **Ubicacion:** social/api/, social/hooks/, social/types/, economy/hooks/
- **Descripcion:** 4 directorios carecen de index.ts barrel export. Otros directorios del mismo nivel SI los tienen.
- **Accion Requerida:** Crear index.ts en los 4 directorios.
- **Esfuerzo Estimado:** S

#### HB-007: social/hooks/useInventory usa useState en lugar de React Query
- **Fuentes:** F-P4-003
- **Severidad:** BAJO
- **Ubicacion:** `features/gamification/social/hooks/useInventory.ts`
- **Descripcion:** Usa useState + useCallback + useEffect para fetch, en lugar del patron React Query establecido en el proyecto.
- **Impacto:** No hay cache compartida, no hay optimistic updates, refetch on focus, ni retry automatico.
- **Accion Requerida:** Migrar a useQuery/useMutation de TanStack Query.
- **Esfuerzo Estimado:** S

#### HB-008: COHERENCE-ENTITIES-DDL missing UserEquippedItem
- **Fuentes:** F-P6-003
- **Severidad:** BAJO
- **Ubicacion:** `docs/20-architecture/COHERENCE-ENTITIES-DDL.md`
- **Descripcion:** Documento no incluye UserEquippedItem. Entity count dice 152/153 en vez de 153/154. Cobertura dice 89.3% en vez de 90.5%.
- **Accion Requerida:** Agregar fila y actualizar metricas.
- **Esfuerzo Estimado:** S

#### HB-009: ADR-003 RLS Count Outdated (207 vs 227/404)
- **Fuentes:** F-P6-001
- **Severidad:** BAJO
- **Ubicacion:** `docs/90-adr/ADR-003-rls-multitenancy.md` lineas 27, 58, 94
- **Descripcion:** ADR-003 cita 207 RLS en 3 ubicaciones. Valor correcto: 227 DDL / 404 runtime.
- **Accion Requerida:** Actualizar las 3 lineas.
- **Esfuerzo Estimado:** S

#### HB-010: COBERTURA-TOTAL-PROCESOS missing 10 flujos
- **Fuentes:** F-P6-006
- **Severidad:** BAJO
- **Ubicacion:** `docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md`
- **Descripcion:** Lista 43 procesos pero README y TRACEABILITY-MATRIX listan 53. Faltan 10 flujos recientes (FL-STU-16..20, FL-TCH-08..09, FL-ADM-09..11).
- **Accion Requerida:** Agregar 10 flujos faltantes.
- **Esfuerzo Estimado:** S

---

### INFO (Conocimiento para Futuro)

#### HI-001: @Entity decorator format inconsistency (positional args)
- **Fuentes:** F-P3-005, F-P3-006
- **Severidad:** INFO
- **Ubicacion:** user-equipped-item.entity.ts, message.entity.ts (2 clases)
- **Descripcion:** 3 clases usan formato posicional `@Entity(name, { schema })` en lugar del formato objeto `@Entity({ schema, name })` usado por las otras 151 clases.
- **Impacto:** Funcional: ninguno. TypeORM soporta ambos.
- **Accion Requerida:** Normalizar cuando se editen estos archivos.
- **Esfuerzo Estimado:** S

#### HI-002: guild_emblems posible tabla fantasma
- **Fuentes:** F-P2-008
- **Severidad:** INFO
- **Ubicacion:** database.constants.ts:181
- **Descripcion:** `GUILD_EMBLEMS: 'guild_emblems'` en constants, referenciada como FK en guilds.sql, pero sin archivo DDL dedicado. Puede estar en prerequisites o definida inline.
- **Accion Requerida:** Verificar existencia de la tabla en DDL.
- **Esfuerzo Estimado:** S

#### HI-003: fact_exercise_completions excede 7-index limit
- **Fuentes:** F-P5-009
- **Severidad:** INFO
- **Ubicacion:** `data_warehouse/indexes/01-warehouse-indexes.sql`
- **Descripcion:** 9 indices en tabla fact table de analytics. Justificado para tabla read-only.
- **Accion Requerida:** Documentar como excepcion aceptada.
- **Esfuerzo Estimado:** S

#### HI-004: SEEDS_INVENTORY severamente desactualizado
- **Fuentes:** F-P6-005
- **Severidad:** INFO
- **Ubicacion:** `orchestration/inventarios/SEEDS_INVENTORY.yml`
- **Descripcion:** v2.0.0 (2026-01-16) cita total_seeds_prod=101, total_seeds_dev=94. DATABASE_INVENTORY (SSOT) dice 76 seed files. Conteo completamente diferente.
- **Accion Requerida:** Actualizar a v3.0.0 o marcar como referencia historica.
- **Esfuerzo Estimado:** M

#### HI-005: FRONTEND_INVENTORY conteos ligeramente desactualizados
- **Fuentes:** F-P4-004, F-P3-007 (parcial)
- **Severidad:** INFO
- **Ubicacion:** `orchestration/inventarios/FRONTEND_INVENTORY.yml` y `BACKEND_INVENTORY.yml`
- **Descripcion:** FRONTEND: api_service_files=52 (deberia ser 53+), hooks=102 (deberia ser 103+). BACKEND: entities=152 (154), services=171 (172), controllers=107 (108), endpoints=901 (904).
- **Accion Requerida:** Sincronizar ambos inventarios con MASTER_INVENTORY.
- **Esfuerzo Estimado:** S

#### HI-006: Skills SKILL.md files no verificados
- **Fuentes:** F-P5-008
- **Severidad:** INFO
- **Ubicacion:** `orchestration/inventarios/SKILLS-REGISTRY.yml`
- **Descripcion:** 9 skills registradas con paths declarados. No se verifico si los SKILL.md existen en los directorios declarados.
- **Accion Requerida:** Ejecutar validacion V1-V10 de ESTANDAR-SKILLS.
- **Esfuerzo Estimado:** S

#### HI-007: US-REP-004 usa dim_date singular en documento de requisitos
- **Fuentes:** F-P6-007
- **Severidad:** INFO
- **Ubicacion:** `docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/user-stories/US-REP-004/`
- **Descripcion:** User story usa `dim_date` (singular) en 3 lineas. Documento de requisitos antiguo, no un flujo operativo.
- **Accion Requerida:** Corregir si se revisa el documento.
- **Esfuerzo Estimado:** S

#### HI-008: Index count marginal discrepancy (978 vs 971)
- **Fuentes:** F-P6-008
- **Severidad:** INFO
- **Ubicacion:** DATABASE_INVENTORY.yml
- **Descripcion:** Inventario dice 978 index statements, grep encontro 971. Diferencia <1%.
- **Accion Requerida:** Ninguna inmediata.
- **Esfuerzo Estimado:** S

---

## Correcciones de Metricas Necesarias

| # | Documento | Campo | Valor Actual | Valor Correcto | Fuente de Verdad |
|---|-----------|-------|-------------|----------------|------------------|
| 1 | CLAUDE.md | Entities | 152 | 154 | MASTER_INVENTORY.yml |
| 2 | CLAUDE.md | Services | 171 | 172 | MASTER_INVENTORY.yml |
| 3 | CLAUDE.md | Controllers | 107 | 108 | MASTER_INVENTORY.yml |
| 4 | CLAUDE.md | Endpoints | 901 | 904 | MASTER_INVENTORY.yml |
| 5 | BACKEND_INVENTORY.yml | entities | 152 | 154 | MASTER_INVENTORY.yml |
| 6 | BACKEND_INVENTORY.yml | services | 171 | 172 | MASTER_INVENTORY.yml |
| 7 | BACKEND_INVENTORY.yml | controllers | 107 | 108 | MASTER_INVENTORY.yml |
| 8 | BACKEND_INVENTORY.yml | endpoints | 901 | 904 | MASTER_INVENTORY.yml |
| 9 | ADR-003 | RLS policies | 207 (x3 locations) | 227 DDL / 404 runtime | DATABASE_INVENTORY.yml |
| 10 | COHERENCE-ENTITIES-DDL | Entity files | 152 | 153 | Filesystem |
| 11 | COHERENCE-ENTITIES-DDL | @Entity classes | 153 | 154 | Filesystem |
| 12 | COHERENCE-ENTITIES-DDL | Tablas con Entity | 151 | 153 | Filesystem |
| 13 | COHERENCE-ENTITIES-DDL | Cobertura | 89.3% | 90.5% | Filesystem |
| 14 | FRONTEND_INVENTORY.yml | api_service_files | 52 | 53+ | Filesystem |
| 15 | FRONTEND_INVENTORY.yml | hooks | 102 | 103+ | Filesystem |
| 16 | SEEDS_INVENTORY.yml | total_seeds_dev | 94 | 76 | DATABASE_INVENTORY.yml |
| 17 | SEEDS_INVENTORY.yml | total_seeds_prod | 101 | needs verification | DATABASE_INVENTORY.yml |
| 18 | COBERTURA-TOTAL-PROCESOS | flow count | 43 | 53 | README.md / TRACEABILITY-MATRIX |

---

## Findings Deduplicados (Mapa de Fusion)

| Consolidated ID | Original IDs | Reason for Merge |
|----------------|-------------|-----------------|
| HA-002 | F-P5-001, F-P5-006 | TIMESTAMP vs TIMESTAMPTZ: F-P5-001 (91 files with bare TIMESTAMP) and F-P5-006 (SIMCO-DDL template propagates violation) are root cause + propagation of same issue |
| HA-003 | F-P5-002, F-P5-005 (partial) | auth.uid() vs get_current_user_id(): F-P5-002 (dual pattern in policies) and F-P5-005 (TO authenticated vs TO public, same monolithic files) are related inconsistencies. TO public/authenticated separated as HM-005 |
| HB-003 | F-P3-001, F-P3-002, F-P3-003, F-P3-004 | All 4 are hardcoded schema/table strings in @Entity decorators -- same class of issue |
| HI-001 | F-P3-005, F-P3-006 | Both are @Entity format inconsistency (positional vs object args) |
| HI-005 | F-P4-004, F-P3-007 (partial), F-P6-004 | All relate to inventory YAML counts being stale -- FRONTEND + BACKEND inventory files |
| HM-009 | F-P6-002, F-P3-007 (partial) | Both flag CLAUDE.md / BACKEND_INVENTORY having outdated backend metrics |
| -- | F-P1-004, F-P6-006 | NOT merged: F-P1-004 is about tables missing from TRACEABILITY-MATRIX (HM-001), F-P6-006 is about flows missing from COBERTURA (HB-010) -- different documents, different gaps |

**Not merged (kept separate):**

| Original ID | Consolidated ID | Reason Kept Separate |
|-------------|----------------|---------------------|
| F-P2-001 | HC-001 | Unique: exact name duplicates between 07 and 07d (CRITICO) |
| F-P2-002 | HA-001 | Unique: schema-level vs global duplicates (different files, different severity) |
| F-P2-003 | HM-010 | Unique: ENABLE RLS duplication (different from policy duplication) |
| F-P2-004 | HM-006 | Unique: catalog tables without RLS |
| F-P2-005 | HA-006 | Unique: admin_dashboard specific security gap |
| F-P5-003 | HA-004 | Unique: COMMENT ON POLICY specifically in monolithic files |
| F-P5-004 | HM-004 | Unique: DROP POLICY IF EXISTS in monolithic files |
| F-P4-005 | HA-005 | Unique: ~40 social endpoints without frontend |
| F-P4-001 | HM-008 | Unique: dual useInventory hooks |

---

## Acciones Propuestas para PROXIMA-ACCION

### Sprint Actual (Urgente)

1. **CORR-06: Resolver duplicacion RLS 07/07d** -- Agregar DROP POLICY IF EXISTS en 07d para las 6 politicas duplicadas (HC-001). Esfuerzo: S. Prioridad: P0.
2. **CORR-07: RLS para admin_reports y metrics_history** -- Agregar ENABLE RLS + admin_only policies (HA-006). Esfuerzo: S. Prioridad: P0.
3. **FIX-DOC-001: Actualizar CLAUDE.md metricas backend** -- entities=154, services=172, controllers=108, endpoints=904 (HM-009). Esfuerzo: S (5 min).
4. **FIX-DOC-002: Actualizar SIMCO-DDL.md template** -- TIMESTAMPTZ en lineas 272-273, agregar DROP POLICY IF EXISTS y COMMENT ON POLICY al template RLS (HA-002, HM-007). Esfuerzo: S (15 min).

### Proximo Sprint

5. **CORR-08: Resolver duplicacion schema-level vs 07b/07c** -- Decidir convencion single-source para RLS policies. Agregar DROP POLICY IF EXISTS en fuente canonical. Crear documento de convencion (HA-001). Esfuerzo: M.
6. **CORR-09: Agregar COMMENT ON POLICY a 228 politicas monoliticas** -- Documentar todas las politicas en 07-*.sql (HA-004). Esfuerzo: L.
7. **CORR-10: Estandarizar auth.uid() -> get_current_user_id()** -- Migrar 177 usos en archivos monoliticos (HA-003). Puede combinarse con CORR-08/09. Esfuerzo: M.
8. **CORR-11: Estandarizar TO public en archivos monoliticos** -- Migrar 157 `TO authenticated` a `TO public` (HM-005). Puede combinarse con CORR-10. Esfuerzo: M.
9. **FIX-DOC-003: Sincronizar inventarios** -- BACKEND_INVENTORY, FRONTEND_INVENTORY, COHERENCE-ENTITIES-DDL, ADR-003, SEEDS_INVENTORY (HI-005, HB-008, HB-009, HI-004). Esfuerzo: S-M.
10. **Crear ESTANDAR-CROSS-SCHEMA-REFERENCES.md** -- Formalizar patron de cross-schema FK y cross-datasource entity registration (HM-002). Esfuerzo: S.
11. **Renombrar social/hooks/useInventory -> useEquipment** -- Evitar conflicto de nombres con economy/hooks/useInventory (HM-008). Esfuerzo: S.

### Backlog

12. **MIGRAR TIMESTAMP -> TIMESTAMPTZ** en 91 archivos DDL (HA-002). Esfuerzo: L. Ejecutar como parte de recreacion de BD.
13. **TRZ-006: Integracion frontend peer/team challenges** -- 40 endpoints backend sin frontend (HA-005). Ya en backlog EPIC-WS-006.
14. **Crear flujos faltantes** (FL-ADM-12 moderacion, FL-STU-21 certificados) y actualizar COBERTURA-TOTAL-PROCESOS (HM-001, HB-010).
15. **Consolidar ENABLE RLS** en un solo lugar por tabla (HM-010).
16. **Agregar RLS a shop_items y notification_queue** (HM-006).
17. **Migrar social/hooks/useInventory a React Query** (HB-007).
18. **Crear barrel exports** en 4 directorios gamification frontend (HB-006).
19. **Descomentar ENABLE RLS para user_roles** (HB-005).
20. **Corregir 4 entities con hardcoded strings** a constantes (HB-003).

---

## Estadisticas de la Auditoria

| Metrica | Valor |
|---------|-------|
| Archivos DDL auditados | 87 (17 index + 43 RLS + 4 global RLS + 23 schema-reference docs) |
| Archivos backend auditados | 153 entities + 11 datasources + barrels + constants |
| Archivos frontend auditados | 53 API files + 102 hooks + 70 pages + 14 stores |
| Documentos verificados | 23 (ADRs, inventarios, CLAUDE.md, flujos, schema-reference, standards, skills) |
| Checks ejecutados (total) | 46 (T:7 + D:10 + BE:9 + FE:10 + STD:15 + DOC:12) |
| Checks PASS | 30 |
| Checks FAIL | 7 |
| Checks PARTIAL / PASS con observaciones | 9 |
| Findings brutos | 42 |
| Findings deduplicados | 28 |
| Findings CRITICO | 1 |
| Findings ALTO | 6 |
| Findings MEDIO | 10 |
| Findings BAJO | 10 |
| Findings INFO | 8 (nota: algunos findings fueron reclasificados durante consolidacion) |
| Schemas afectados | 9 (data_warehouse, content_management, gamification_system, social_features, progress_tracking, audit_logging, educational_content, lti_integration, admin_dashboard) |
| Politicas RLS totales (runtime) | 404 |
| Politicas RLS con duplicacion | ~16+ (6 exactas + 10 funcionales) |
| Politicas RLS sin documentacion | 382 (~62%) |
| Tablas sin RLS (documentadas) | ~59 (35% del total de 169) |

---

## Notas de Consolidacion

### Reclasificaciones de Severidad

Las siguientes reclasificaciones se hicieron durante la consolidacion para normalizar severidades entre agentes:

| Finding Original | Severidad Original | Severidad Consolidada | Razon |
|-----------------|-------------------|----------------------|-------|
| F-P6-001 (ADR-003 RLS count) | MEDIUM | BAJO | Es un documento de referencia, no operativo. No bloquea ni causa errores. |
| F-P6-005 (SEEDS_INVENTORY) | MEDIUM | INFO | DATABASE_INVENTORY es SSOT; SEEDS_INVENTORY es referencia historica. |
| F-P6-004 (BACKEND_INVENTORY) | LOW | INFO | Absorbido en HI-005 junto con FRONTEND_INVENTORY. MASTER es SSOT. |
| F-P2-007 (user_roles ENABLE RLS) | BAJO | BAJO | Mantiene severidad. El riesgo es real pero acotado (solo lectura de roles). |
| F-P5-007 (SIMCO-DDL RLS template) | MENOR | MEDIO | Elevado porque propaga malas practicas a todo DDL futuro generado por agentes. |

### Concentracion del Riesgo

El **72% de los hallazgos ALTO y CRITICO** (5 de 7) se concentran en los archivos monoliticos de RLS (`07-enable-rls.sql`, `07b-enable-rls-phase2.sql`, `07c-enable-rls-phase3.sql`, `07d-rls-policies-pending-tables.sql`). Estos 4 archivos contienen 228 politicas con los siguientes problemas simultaneos:

1. Duplicacion de nombres con schema-level files (HC-001, HA-001)
2. Falta de DROP POLICY IF EXISTS (HM-004)
3. Falta de COMMENT ON POLICY (HA-004)
4. Uso de auth.uid() no-canonico (HA-003)
5. Uso de TO authenticated no-estandar (HM-005)

**Recomendacion estrategica:** Consolidar CORR-08/09/10/11 en un solo esfuerzo "Refactor Monolithic RLS Files" que aborde los 5 problemas simultaneamente, en lugar de 4 pases separados sobre los mismos archivos.

---

*Consolidacion P7 completada por Claude Opus 4.6 | 2026-02-17*
*Sistema SIMCO v4.0.0 | NEXUS v4.1*
