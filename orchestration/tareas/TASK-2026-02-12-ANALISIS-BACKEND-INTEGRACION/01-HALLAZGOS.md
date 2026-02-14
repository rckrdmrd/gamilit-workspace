# HALLAZGOS: Analisis Integral Backend vs BD vs Modelo de Datos

**Tarea:** TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION
**Fecha:** 2026-02-12
**Version:** 1.0.0

---

## Resumen Ejecutivo

Auditoria completa del backend NestJS verificando codigo real contra documentacion (BACKEND_INVENTORY.yml, MODELO-DATOS.md, COHERENCE-ENTITIES-DDL.md, MASTER_INVENTORY.yml, CLAUDE.md).

### Metricas Verificadas vs Documentadas

| Metrica | INVENTORY | Actual | Delta | Estado |
|---------|-----------|--------|-------|--------|
| Modulos (directorios) | 22 | 22 | 0 | OK |
| Entities (archivos) | 152 | 152 | 0 | OK |
| Entities (@Entity classes) | 152 | 153 | +1 | MINOR |
| Services | 170 | 170 | 0 | OK |
| Controllers | 107 | 107 | 0 | OK |
| Endpoints | 850 | 899 | **+49** | DESACTUALIZADO |
| DTOs | 412 | 399 (modules) | -13 | VERIFICAR shared/ |
| Guards | 14 | 15 | **+1** | DESACTUALIZADO |
| Decorators | 18 | 18 symbols (9 files) | 0 | OK |
| Interceptors | 8 | 5 | **-3** | INCORRECTO |
| Pipes | 6 | 6 classes (2 files) | 0 | OK |
| Filters | 4 | 2 classes (1 file) | **-2** | INCORRECTO |
| Tests (archivos .spec.ts) | 833* | 57 files | N/A | *833 = test cases |

---

## Hallazgo H-01: BACKEND_INVENTORY Per-Module Completamente Incorrecto

**Severidad:** CRITICA
**Detalle:** El INVENTORY usa nombres conceptuales (modules, exercises, classrooms, students, achievements, store, missions, leaderboard) que NO corresponden a directorios fisicos. Los conteos per-module suman 68 entities vs 152 reales.

**Modulos en INVENTORY sin directorio fisico (8):**
- modules, exercises, classrooms, students, achievements, store, missions, leaderboard

**Directorios fisicos NO listados en INVENTORY (9):**
- admin, audit, assignments, lti, communication, progress, educational, etl, ml, mail, profile, visualization, websocket, tasks

---

## Hallazgo H-02: Endpoints 899 vs 850 Documentados

**Severidad:** MEDIA
**Detalle:** Se encontraron 49 endpoints adicionales no reflejados en documentacion. Los mayores contribuyentes:

| Modulo | Endpoints |
|--------|-----------|
| admin | 158 |
| social | 135 |
| teacher | 110 |
| content | 102 |
| gamification | 69 |
| progress | 59 |
| educational | 51 |
| notifications | 46 |
| lti | 42 |
| auth | 29 |
| visualization | 21 |
| ml | 21 |
| assignments | 19 |
| parents | 17 |
| etl | 16 |
| profile | 3 |
| health | 1 |
| **TOTAL** | **899** |

---

## Hallazgo H-03: Communication Entities Existen (COHERENCE dice "Pendiente")

**Severidad:** MEDIA
**Detalle:** COHERENCE-ENTITIES-DDL.md seccion "Categoria 4: Communication" dice entities estan "Pendiente evaluacion (R3-07)". En realidad:

- `communication/entities/conversation.entity.ts` - EXISTE (@Entity con DB_SCHEMAS.COMMUNICATION)
- `communication/entities/conversation-participant.entity.ts` - EXISTE

Ademas, `teacher/entities/message.entity.ts` contiene 2 @Entity classes:
1. Message (communication.messages)
2. MessageParticipant (communication.message_participants)

**Las 4 tablas communication tienen entity.** La seccion debe actualizarse a RESUELTO.

---

## Hallazgo H-04: Communication Entities Huerfanas (No en Datasource)

**Severidad:** ALTA
**Detalle:** El datasource 'communication' en app.module.ts solo incluye:
```
modules/teacher/entities/message*.entity{.ts,.js}
```
Las entities en `modules/communication/entities/` (Conversation, ConversationParticipant) NO estan incluidas en ningun datasource. Son **entidades huerfanas**.

**Accion requerida:** Agregar al datasource communication:
```
modules/communication/entities/**/*.entity{.ts,.js}
```

---

## Hallazgo H-05: 5 Modulos No Importados en app.module.ts

**Severidad:** BAJA (intencional para algunos)
**Detalle:** De los 21 modulos con .module.ts, solo 16 estan importados:

| Modulo | En app.module.ts | Justificacion |
|--------|-----------------|---------------|
| etl | NO | Utility module, loaded on-demand |
| lti | NO | LTI integration placeholder |
| mail | NO | Used as provider by NotificationsModule |
| ml | NO | ML predictions, loaded on-demand |
| visualization | NO | Data viz utilities |

---

## Hallazgo H-06: Guards 15 vs 14 Documentados

**Severidad:** BAJA
**Detalle:** Guard no documentado: `ModelReadyGuard` en `modules/ml/guards/model-ready.guard.ts`.

Guards reales (15):
1. AdminGuard
2. JwtAuthGuard
3. RolesGuard (modules/auth)
4. ModelReadyGuard (**nuevo, no documentado**)
5. NotificationRateLimitGuard
6. ParentAuthGuard
7. ClassroomOwnershipGuard
8. TeacherGuard
9. WsJwtGuard
10. AccountStatusGuard (shared)
11. AuthGuard (shared)
12. EmailVerifiedGuard (shared)
13. PermissionsGuard (shared)
14. ResourceOwnershipGuard (shared)
15. RolesGuard (shared)

---

## Hallazgo H-07: Interceptors 5 vs 8, Filters 2 vs 4

**Severidad:** BAJA
**Detalle:** Las cifras del INVENTORY son incorrectas.

**Interceptors reales (5):**
1. AuditInterceptor
2. LoggingInterceptor
3. PerformanceInterceptor
4. RlsInterceptor
5. TransformResponseInterceptor

**Filters reales (2 classes, 1 file):**
1. AllExceptionsFilter
2. HttpExceptionFilter

---

## Hallazgo H-08: MODELO-DATOS.md Usa Ontologia 100% Conceptual

**Severidad:** ALTA
**Detalle:** MODELO-DATOS.md describe 18 schemas conceptuales que NO mapean directamente a los 18 schemas fisicos del DDL. Las tablas listadas usan nombres conceptuales, muchos sin correspondencia directa.

**Mapeo Schema Conceptual -> Fisico:**

| # | Schema Conceptual | Schema Fisico | Nota |
|---|-------------------|---------------|------|
| 1 | auth | auth (users) + auth_management (profiles+) | Split en 2 schemas fisicos |
| 2 | tenants | auth_management (tenants table) | Absorbido en auth_management |
| 3 | education | educational_content + progress_tracking | Split en 2 schemas fisicos |
| 4 | gamification | gamification_system | Incluye store + missions + leaderboard |
| 5 | social | social_features | Incluye classrooms, teams, guilds |
| 6 | classrooms | social_features | Absorbido en social_features |
| 7 | analytics | data_warehouse + materialized views | No existe como schema separado |
| 8 | reports | social_features + admin_dashboard | No existe como schema separado |
| 9 | notifications | notifications | MATCH directo |
| 10 | store | gamification_system | Absorbido en gamification_system |
| 11 | missions | gamification_system | Absorbido en gamification_system |
| 12 | leaderboard | gamification_system | Absorbido en gamification_system |
| 13 | content | content_management | MATCH directo |
| 14 | parents | auth_management | Absorbido en auth_management |
| 15 | settings | system_configuration | MATCH directo |
| 16 | audit | audit_logging | MATCH directo |
| 17 | integrations (placeholder) | lti_integration | Parcial |
| 18 | billing (placeholder) | data_warehouse / admin_dashboard | Diferente proposito |

**~40+ tablas conceptuales sin DDL directo** (son naming aliases, futuras, o diseño diferente). Ver 02-DISCREPANCIAS.md para detalle completo.

---

## Hallazgo H-09: Gamification tiene 21 Entities (no 19 en COHERENCE)

**Severidad:** BAJA
**Detalle:** COHERENCE lista 19 entities para gamification. Los 2 adicionales son:
- `comodin-use.entity.ts` (comodin_uses table)
- `user-skill-rating.entity.ts` (user_skill_ratings table)

Estos fueron agregados despues de la ultima actualizacion de COHERENCE.

---

## Hallazgo H-10: Social tiene 26 Entities (no 17 en COHERENCE)

**Severidad:** MEDIA
**Detalle:** COHERENCE lista 17 entities para social. Los 9 adicionales son:
- guild.entity.ts
- guild-emblem.entity.ts
- guild-join-request.entity.ts
- guild-member.entity.ts
- guild-mission.entity.ts
- guild-mission-contribution.entity.ts
- team-vs-team-challenge.entity.ts
- user-block.entity.ts
- user-report.entity.ts

Nota: COHERENCE listaba user_blocks, user_reports, guild_mission_contributions, guild_emblems como "tablas sin entity" - pero ahora SI tienen entity.

---

## Hallazgo H-11: Progress tiene 20 Entities (no 18 en COHERENCE)

**Severidad:** BAJA
**Detalle:** Los 2 adicionales son:
- `learning-path-module.entity.ts`
- No listado previamente en COHERENCE

---

## Hallazgo H-12: Auth tiene 18 Entities (COHERENCE dice 17)

**Severidad:** BAJA
**Detalle:** COHERENCE mostraba 17 entities. El entity adicional es:
- `user-suspension.entity.ts` ya estaba listado, pero el conteo total era 17 no 18.

Verificacion: 18 entity files encontrados en auth/entities/.

---

## Conclusiones

1. **BACKEND_INVENTORY.yml necesita reestructuracion completa** de la seccion modulos (Sprint B1)
2. **Endpoints reales son 899 no 850** (Sprint B1)
3. **Communication entities existen pero estan huerfanas** del datasource (Sprint B2)
4. **MODELO-DATOS.md necesita mapeo conceptual-fisico** (Sprint B3)
5. **COHERENCE-ENTITIES-DDL.md desactualizado** en conteos por modulo y communication (Sprint B2)
6. **Guards/Interceptors/Filters counts incorrectos** en INVENTORY (Sprint B1)

---

*Generado por: Claude Code - TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION*
