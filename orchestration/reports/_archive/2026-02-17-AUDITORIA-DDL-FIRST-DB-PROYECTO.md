# Auditoria detallada del modelo y proyecto de base de datos

**Fecha:** 2026-02-17  
**Alcance:** Modelo de datos + proyecto `apps/database` + directivas y flujos DEV/PROD  
**Objetivo:** Validar cumplimiento DDL-first y recreacion limpia unicamente por scripts shell canónicos

---

## Resumen ejecutivo

El proyecto presenta una base sólida para recreacion limpia, pero existian brechas de cumplimiento en 4 frentes:

1. Conflicto normativo (directiva de migraciones vs directiva DDL-first).
2. Inconsistencias documentales (guías legacy que aún promueven `migrations/` y ejecucion manual por archivo).
3. Riesgos de seguridad (passwords hardcodeados en scripts auxiliares/validacion).
4. Control parcial en PROD (backup pre-drop declarado en config, pero no aplicado en el flujo principal).

Se aplicaron remediaciones P0/P1 sobre scripts y directivas para reforzar cumplimiento operativo.

---

## Matriz de cumplimiento por gate

| Gate | Criterio | Estado inicial | Estado actual | Evidencia |
|---|---|---|---|---|
| Gate 1 | Sin flujo operativo por migrations/fixes fuera pipeline | Parcial | Parcial alto | `SIMCO-DDL.md`, `ADR-018`, guia legacy marcada obsoleta |
| Gate 2 | Orden shell completo sin pasos manuales por archivo | Parcial | Parcial alto | `recreate-database.sh` + `init-database.sh` |
| Gate 3 | Sin credenciales hardcodeadas en scripts operativos | No cumple | Parcial alto | `validate-db-ready.sh`, `init-database*.sh`, `pre-deploy-backup.sh`, `rollback-migration.sh` |
| Gate 4 | DEV/PROD controlado por config y diferencias minimas | Parcial | Cumple con observaciones | `dev.conf`, `prod.conf`, `recreate-database.sh` |
| Gate 5 | Documentacion + scripts alineados a ruta canónica | Parcial | Parcial alto | `GUIA-CREAR-BASE-DATOS.md`, `SIMCO-MIGRACIONES-BD.md` |

---

## Hallazgos principales

### Criticos

1. **Conflicto de directivas sobre migraciones**
   - Se detecto contradiccion entre politica DDL-first y documento de migraciones incrementales.
   - Remediacion: `SIMCO-MIGRACIONES-BD.md` convertido a documento deprecado y referenciado a SSOT vigente.

2. **Credenciales hardcodeadas**
   - Existian defaults sensibles en scripts de validacion/backup/rollback y manejo sudo.
   - Remediacion aplicada para requerir `DB_PASSWORD` / `GAMILIT_DB_PASSWORD` y `GAMILIT_SUDO_PASSWORD`.

### Altos

3. **Backup pre-drop en PROD no automatizado por flujo principal**
   - `prod.conf` declaraba backup obligatorio, pero el script principal no lo ejecutaba.
   - Remediacion: `recreate-database.sh` ahora carga config de ambiente y ejecuta backup pre-drop cuando aplica.

4. **Documentacion operativa desalineada**
   - Guías con “metodos manuales” y “migraciones” como flujo activo.
   - Remediacion: marcado explícito de obsolescencia y redirección a directivas canónicas.

### Medios

5. **Coexistencia de scripts legacy**
   - `apps/database/create-database.sh` y `apps/database/drop-and-recreate-database.sh` siguen presentes (legacy).
   - Accion recomendada: mantener solo para trazabilidad o mover a `_deprecated/` en una fase posterior controlada.

---

## Cambios implementados en esta ejecucion

### Scripts

- `apps/database/scripts/recreate-database.sh`
  - Carga config por ambiente (`config/dev.conf` / `config/prod.conf`).
  - Toma `DB_HOST/DB_PORT` desde config.
  - Implementa `create_pre_drop_backup()` en PROD cuando `ENV_CREATE_BACKUP_BEFORE_DROP=true`.
  - Falla si el backup requerido no puede generarse.

- `apps/database/scripts/init-database.sh`
  - Elimina hardcode de sudo password.
  - Usa `GAMILIT_SUDO_PASSWORD` (opcional) para sudo en entornos que lo requieren.
  - Normaliza `printf` seguro para secretos.

- `apps/database/scripts/init-database-v3.sh`
  - Misma remediacion de hardcode sudo (`GAMILIT_SUDO_PASSWORD`).

- `apps/database/scripts/validate-db-ready.sh`
  - Elimina password por defecto hardcodeado.
  - Exige `DB_PASSWORD` o `GAMILIT_DB_PASSWORD`.
  - Elimina recomendaciones de ejecucion manual de SQL fuera de pipeline.

- `apps/database/scripts/pre-deploy-backup.sh`
  - Elimina password hardcodeado.
  - Exige `DB_PASSWORD` / `GAMILIT_DB_PASSWORD`.

- `apps/database/scripts/rollback-migration.sh`
  - Elimina password hardcodeado.
  - Exige `DB_PASSWORD` / `GAMILIT_DB_PASSWORD`.

### Directivas y documentación

- `orchestration/directivas/simco/SIMCO-MIGRACIONES-BD.md`
  - Reemplazado por versión deprecada para eliminar conflicto normativo.

- `docs/50-guides/backend/GUIA-CREAR-BASE-DATOS.md`
  - Marcada como referencia legacy.
  - Redirigida a flujo canónico DDL-first.
  - Secciones manual/migraciones etiquetadas obsoletas.

- `docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md`
  - Añadido aviso de referencia arquitectónica no operativa actual.

- `apps/database/scripts/README.md`
  - Actualizada nota de sudo para usar variable `GAMILIT_SUDO_PASSWORD`.

---

## Proceso operativo recomendado (unico flujo)

1. Modificar DDL/seeds en repositorio.
2. Ejecutar `apps/database/scripts/recreate-database.sh --env dev --force` para validar cambio.
3. Verificar conteos/objetos y pruebas funcionales.
4. Para PROD: backup obligatorio + detener backend + recrear + smoke tests.
5. Prohibido aplicar SQL suelto como mecanismo regular.

---

## Checklist de cumplimiento para cambios DB

- [ ] El cambio está en `ddl/` o `seeds/` (no migration/fix externo).
- [ ] Se validó con `recreate-database.sh` o `reset-database.sh`.
- [ ] Se verificó creación de objetos críticos (schemas, tablas, funciones, triggers, RLS).
- [ ] En PROD se generó backup pre-drop verificable.
- [ ] No se introdujeron credenciales hardcodeadas.
- [ ] Documentación operativa permanece alineada a SSOT.

---

## Pendientes sugeridos (siguiente iteración)

1. Consolidar scripts legacy de raíz `apps/database/` a `_deprecated/` con ventana de transición.
2. Agregar validación automática en CI para detectar patrones prohibidos (`migrations/`, `fix-*`, `patch-*`, secretos hardcodeados).
3. Homologar guías históricas de `docs/` con etiqueta `legacy` para evitar ambigüedad futura.

### Inventario documental pendiente de homologación

Se detectaron referencias históricas a `migrations/` o Expand/Contract en documentos que deben clasificarse como referencia/legacy:

- `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md`
- `docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/traceability/TRACEABILITY.yml`
- `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/tasks/PLAN-CORRECCION-SINCRONIZACION-2026-01-04.md`
- `docs/60-portals/student/specs/traces/TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md`
- ADRs y artefactos históricos que mencionan migraciones como trazabilidad pasada (no operativa).
