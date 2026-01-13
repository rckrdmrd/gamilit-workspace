# PLAN DE CORRECCIONES - BASE DE DATOS GAMILIT

**Fecha:** 2026-01-13
**Version:** 1.1.0 (Validado)
**Basado en:** AUDITORIA-DATABASE-2026-01-13.md
**Sistema:** SIMCO v3.8+ con SAAD - MODE:FULL
**Estado:** VALIDADO - Listo para aprobacion

---

## RESUMEN DE VALIDACION

La FASE 4 de validacion ha refinado el plan original:

| Correccion Original | Estado Validacion | Accion Final |
|---------------------|-------------------|--------------|
| CRIT-001: auth.users | FALSO POSITIVO | NO REQUIERE CORRECCION |
| CRIT-002: is_feature_enabled | CONFIRMADO (diferente) | REQUIERE ANALISIS |
| CRIT-003: validate_rueda_inferencias | CONFIRMADO | ELIMINAR ARCHIVO DUPLICADO |
| CRIT-004: timestamps missions | CONFIRMADO | ALINEAR DDL |
| CRIT-005: progress missions | CONFIRMADO | CORREGIR TYPEORM |

---

## OBJETIVO

Corregir los problemas identificados en la auditoria exhaustiva de la base de datos GAMILIT, priorizando por impacto y riesgo.

---

## FASE 1: CORRECCIONES CRITICAS (Prioridad P0)

### ~~CORR-001: Referencias a auth.users~~ FALSO POSITIVO

**Resultado de Validacion:** La tabla `auth.users` SI EXISTE en DDL.
- Ubicacion: `/ddl/schemas/auth/tables/01-users.sql`
- Es una tabla completa con estructura tipo Supabase (60+ columnas)
- Las referencias a `auth.users` son CORRECTAS
- `auth_management.profiles` es una EXTENSION de `auth.users`, no un reemplazo

**Accion:** NINGUNA REQUERIDA. Documentado para referencia futura.

---

### CORR-001-REVISED: Revisar funcion `is_feature_enabled` (REQUIERE DECISION)

**Problema:** Existen DOS funciones `is_feature_enabled` con FIRMAS DIFERENTES:

**Archivo 1:** `functions/is_feature_enabled.sql`
- Firma: `is_feature_enabled(p_feature_key TEXT, p_user_id UUID)`
- Schema: `public` (error - deberia ser system_configuration)
- Proposito: Feature flags por usuario/rol
- Campos: feature_key, target_users, target_roles, rollout_percentage

**Archivo 2:** `tables/06-feature_flags.sql` (inline)
- Firma: `is_feature_enabled(p_flag_key VARCHAR, p_tenant_id UUID, p_classroom_id UUID)`
- Schema: `system_configuration`
- Proposito: Feature flags por tenant/classroom
- Campos: flag_key, tenant_overrides, classroom_overrides

**Problema real:** Son funciones con PROPOSITOS DIFERENTES pero MISMO NOMBRE.

**Opciones:**
1. **MANTENER AMBAS**: Renombrar una (ej: `is_tenant_feature_enabled`)
2. **UNIFICAR**: Crear una funcion que soporte ambos casos
3. **ELIMINAR UNA**: Si una no se usa, eliminarla

**ACCION REQUERIDA:** Verificar uso en backend y decidir. MARCADO PARA REVISION.

**Validacion:**
- [ ] Decidir cual funcion mantener/renombrar
- [ ] Verificar uso en backend
- [ ] Actualizar llamadas si se renombra

---

### CORR-002: Eliminar funcion duplicada `validate_rueda_inferencias_text`

**Problema CONFIRMADO:** La funcion `validate_rueda_inferencias_text` existe en DOS archivos.

**Archivos:**
1. `14-validate_rueda_inferencias_text.sql` - **VERSION ANTIGUA** (DB-071, 2025-11-20)
2. `14-validate_rueda_inferencias.sql` - **VERSION NUEVA** (FIX 2025-12-15)

**Comparacion:**
| Aspecto | Version Antigua | Version Nueva |
|---------|-----------------|---------------|
| Funcion auxiliar | NO | SI (_validate_single_fragment) |
| Soporte categoryExpectations | NO | SI |
| Fecha | 2025-11-20 | 2025-12-15 |
| Estado | OBSOLETA | ACTUAL |

**Acciones:**
1. Mover `14-validate_rueda_inferencias_text.sql` a `_deprecated/`
2. Verificar que version nueva tiene todas las funcionalidades
3. Validar que no hay llamadas a la firma antigua

**Dependencias afectadas:** Ninguna (la firma es identica)

**Validacion:**
- [ ] Archivo movido a _deprecated/
- [ ] Funcion sigue siendo invocable
- [ ] Sin errores en create-database.sh

---

### CORR-003: Alinear timestamps en tabla `missions`

**Problema:** DDL usa `timestamp without time zone`, TypeORM usa `timestamp with time zone`.

**Archivos involucrados:**
1. `/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/06-missions.sql` (DDL)
2. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/entities/mission.entity.ts` (TypeORM)

**Decision:** Estandarizar a `timestamp with time zone` (mejor practica para aplicaciones multi-zona).

**Acciones en DDL:**
1. Cambiar `start_date timestamp without time zone` -> `start_date timestamp with time zone`
2. Cambiar `end_date timestamp without time zone` -> `end_date timestamp with time zone`
3. Cambiar `completed_at timestamp without time zone` -> `completed_at timestamp with time zone`
4. Cambiar `claimed_at timestamp without time zone` -> `claimed_at timestamp with time zone`
5. Cambiar `created_at timestamp without time zone` -> `created_at timestamp with time zone`
6. Cambiar `updated_at timestamp without time zone` -> `updated_at timestamp with time zone`

**Acciones en Backend:** Ninguna (ya usa timestamp with time zone)

**Dependencias afectadas:**
- Triggers que usan estos campos
- Queries que comparan fechas

**Validacion:**
- [ ] DDL ejecuta sin errores
- [ ] Backend compila sin errores
- [ ] Timestamps se guardan correctamente

---

### CORR-004: Alinear tipo `progress` en tabla `missions`

**Problema:** DDL usa `double precision`, TypeORM usa `float` (mapea a `real`).

**Archivos involucrados:**
1. `/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/gamification_system/tables/06-missions.sql` (DDL)
2. `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/modules/gamification/entities/mission.entity.ts` (TypeORM)

**Decision:** Mantener `double precision` en DDL, corregir TypeORM.

**Acciones en DDL:** Ninguna

**Acciones en Backend:**
1. Cambiar `@Column({ type: 'float', default: 0 })` -> `@Column({ type: 'double precision', default: 0 })`

**Dependencias afectadas:** Ninguna

**Validacion:**
- [ ] Backend compila sin errores
- [ ] Valores de progress se guardan con precision correcta

---

### CORR-005: Verificar referencias a `auth.users`

**Problema:** 16 archivos referencian `auth.users` - necesita verificacion.

**Contexto:** La tabla `auth.users` existe como parte de la estructura Supabase/Auth. Las referencias PUEDEN ser correctas si:
1. auth.users es la tabla real de usuarios (Supabase pattern)
2. auth_management.profiles es extension de auth.users

**Acciones:**
1. Verificar estructura actual de auth.users en DDL
2. Verificar que FK user_id -> auth.users(id) es intencional
3. Si es correcto: documentar patron
4. Si no es correcto: crear lista de cambios

**Archivos a verificar:**
- `ddl/schemas/auth/tables/` (estructura de auth.users)
- Los 16 archivos listados en auditoria

**Validacion:**
- [ ] Script create-database.sh ejecuta sin errores de FK
- [ ] Relaciones auth.users <-> profiles estan claras

---

## FASE 2: CORRECCIONES ALTAS (Prioridad P1)

### CORR-006: Actualizar _MAP.md de educational_content

**Problema:** _MAP.md reporta 14 tablas pero hay 24 reales (+10 sin documentar).

**Archivos involucrados:**
- `/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/educational_content/_MAP.md`

**Acciones:**
1. Listar todas las tablas en `educational_content/tables/`
2. Actualizar _MAP.md con lista completa
3. Agregar descripcion breve de tablas faltantes

**Validacion:**
- [ ] Numero de tablas en _MAP.md = numero de archivos .sql

---

### CORR-007: Actualizar _MAP.md de gamification_system

**Problema:** _MAP.md reporta 15 tablas pero hay 20 reales (+5 sin documentar).

**Archivos involucrados:**
- `/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/gamification_system/_MAP.md`

**Acciones:**
1. Listar todas las tablas en `gamification_system/tables/`
2. Actualizar _MAP.md con lista completa
3. Agregar descripcion breve de tablas faltantes

**Validacion:**
- [ ] Numero de tablas en _MAP.md = numero de archivos .sql

---

### CORR-008: Actualizar _MAP.md de progress_tracking

**Problema:** _MAP.md reporta 17 tablas pero hay 19 reales (+2 sin documentar).

**Archivos involucrados:**
- `/home/isem/workspace-v2/projects/gamilit/apps/database/ddl/schemas/progress_tracking/_MAP.md`

**Acciones:**
1. Listar todas las tablas en `progress_tracking/tables/`
2. Actualizar _MAP.md con lista completa
3. Agregar descripcion breve de tablas faltantes

**Validacion:**
- [ ] Numero de tablas en _MAP.md = numero de archivos .sql

---

### CORR-009: Verificar ENUMs en Backend

**Problema:** DDL tiene AchievementCategory con valores nuevos (collection, hidden) v1.1.

**Archivos involucrados:**
- `/home/isem/workspace-v2/projects/gamilit/apps/backend/src/shared/constants/enums.constants.ts`

**Acciones:**
1. Leer archivo de ENUMs en backend
2. Verificar que AchievementCategoryEnum tiene COLLECTION y HIDDEN
3. Si faltan: agregarlos
4. Verificar ExerciseType tiene los 28+ tipos

**Validacion:**
- [ ] ENUMs en backend coinciden con DDL

---

## FASE 3: CORRECCIONES MEDIAS (Prioridad P2)

### CORR-010: Documentar seeds omitidos

**Problema:** 15 seeds no se ejecutan, mayoria intencional pero no documentado.

**Acciones:**
1. Agregar seccion en README.md listando seeds omitidos
2. Para cada uno: explicar razon de omision

---

### CORR-011: Clarificar communication/_MAP.md

**Problema:** Estructura enganosa (reporta inline como archivos separados).

**Acciones:**
1. Actualizar _MAP.md indicando que funciones/triggers son inline

---

### CORR-012: Evaluar seed M4-M5 validation

**Problema:** `11-exercise_validation_config_m4_m5.sql` no se ejecuta.

**Acciones:**
1. Verificar si modulos 4-5 estan en uso
2. Si si: agregar a create-database.sh
3. Si no: documentar como backlog

---

## ORDEN DE EJECUCION RECOMENDADO

```
1. CORR-005 (verificar auth.users - puede cambiar alcance de otras correcciones)
2. CORR-001 (is_feature_enabled - cambio aislado)
3. CORR-002 (validate_rueda_inferencias - cambio aislado)
4. CORR-003 (timestamps missions - DDL change)
5. CORR-004 (progress missions - Backend change)
6. CORR-006 (educational_content _MAP.md)
7. CORR-007 (gamification_system _MAP.md)
8. CORR-008 (progress_tracking _MAP.md)
9. CORR-009 (verificar ENUMs backend)
10. CORR-010 (documentar seeds)
11. CORR-011 (communication _MAP.md)
12. CORR-012 (evaluar M4-M5)
```

---

## MATRIZ DE DEPENDENCIAS DE CORRECCIONES

| Correccion | Depende de | Afecta a |
|------------|------------|----------|
| CORR-001 | - | create-database.sh |
| CORR-002 | - | create-database.sh |
| CORR-003 | - | Backend entities, Triggers |
| CORR-004 | - | Backend entities |
| CORR-005 | - | Puede afectar 16 archivos DDL |
| CORR-006 | - | Solo documentacion |
| CORR-007 | - | Solo documentacion |
| CORR-008 | - | Solo documentacion |
| CORR-009 | - | Backend constants |
| CORR-010 | - | Solo documentacion |
| CORR-011 | - | Solo documentacion |
| CORR-012 | - | create-database.sh |

---

## VALIDACION FINAL

Despues de aplicar todas las correcciones:

1. **Validar DDL:**
```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/database
./drop-and-recreate-database.sh
```

2. **Validar Backend:**
```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/backend
npm run build
npm run lint
npm run typecheck
```

3. **Validar Integridad:**
```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/database
python3 scripts/validations/validate_integrity.py
```

---

## ROLLBACK PLAN

Si alguna correccion causa problemas:

1. **DDL:** Restaurar desde Git
```bash
git checkout -- apps/database/ddl/
```

2. **Backend:** Restaurar desde Git
```bash
git checkout -- apps/backend/src/
```

3. **Base de datos:** Recrear desde ultimo backup o DDL limpio
```bash
./drop-and-recreate-database.sh
```

---

## ESTIMACION DE TIEMPO

| Fase | Correcciones | Tiempo Estimado |
|------|--------------|-----------------|
| P0 (Criticas) | CORR-001 a CORR-005 | 2-3 horas |
| P1 (Altas) | CORR-006 a CORR-009 | 1-2 horas |
| P2 (Medias) | CORR-010 a CORR-012 | 1 hora |
| Validacion | - | 30 minutos |
| **TOTAL** | 12 correcciones | **4-6 horas** |

---

**Plan creado:** 2026-01-13
**Aprobacion requerida:** Si, antes de ejecutar FASE 1
