# Analisis detallado DB vs directivas y flujos

**Fecha:** 2026-02-17  
**Tipo:** Analisis estatico (sin ejecucion de recreate)  
**Objetivo:** Validar cumplimiento de directivas nuevas y estandares sobre modelo/proyecto DB, con foco en flujo DDL-first, uso obligatorio de shell, separacion DEV/PROD y prohibicion de migrations/fixes fuera del pipeline limpio.

---

## 1. Alcance y fuentes auditadas

### Directivas y estandares (fuente normativa)
- `orchestration/directivas/simco/SIMCO-DDL.md`
- `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`
- `orchestration/directivas/triggers/TRIGGER-DDL-RECREAR-BD-WSL.md`
- `docs/40-standards/ESTANDAR-DATABASE-PROFESIONAL.md`
- `docs/20-architecture/AMBIENTES-DEV-PROD.md`

### Implementacion real (fuente tecnica)
- `apps/database/scripts/recreate-database.sh`
- `apps/database/scripts/init-database.sh`
- `apps/database/scripts/validate-db-ready.sh`
- `apps/database/create-database.sh`
- `apps/database/drop-and-recreate-database.sh`
- `apps/database/scripts/config/dev.conf`
- `apps/database/scripts/config/prod.conf`
- `apps/backend/src/config/database.config.ts`

### Documentacion operativa relacionada
- `docs/50-guides/backend/GUIA-CREAR-BASE-DATOS.md`
- `docs/50-guides/backend/impl/SETUP-DEVELOPMENT.md`
- `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md`

---

## 2. Matriz normativa de cumplimiento

| Criterio normativo | Evidencia | Estado |
|---|---|---|
| DDL-first: cambios DB solo en DDL/seeds + recreate limpio | Directiva explicita en `SIMCO-DDL.md` y flujo en `SIMCO-RECREAR-BD.md`; pipeline principal en `init-database.sh` | **Parcialmente cumple** |
| Prohibido migrations/fixes incrementales como mecanismo operativo | Prohibiciones en `SIMCO-DDL.md` | **No cumple** (hay guias y scripts legacy que lo fomentan) |
| Shell canonico para crear/recrear DB | `recreate-database.sh` delega a `init-database.sh` con orden definido | **Cumple** (tecnicamente), pero hay rutas alternas legacy |
| No ejecutar SQL individuales fuera del flujo shell | Directivas lo prohiben; documentacion vieja muestra `psql -f ...` manual | **No cumple** (a nivel documental/proceso) |
| DEV/PROD bien separado | `dev.conf` y `prod.conf`, y directivas por ambiente | **Cumple con brechas** (inconsistencias en docs/config) |
| Validacion completa post-recreate | `init-database.sh` valida conteos; `validate-db-ready.sh` existe | **Parcialmente cumple** (no integrado como gate obligatorio) |

---

## 3. Hallazgos priorizados (brechas)

## Bloqueantes

1) **Password sudo hardcodeado en script principal de init**  
   - Evidencia: `apps/database/scripts/init-database.sh` contiene `printf '2320\n' | sudo -S ...`.  
   - Riesgo: seguridad critica, fuga de credencial, incumplimiento de hardening operativo.

2) **Directivas nuevas contradichas por guia vigente de migraciones incrementales**  
   - Evidencia: `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md` describe Apply SQL incremental, Expand/Contract y ejecucion directa `psql -f`.  
   - Riesgo: rompe regla "sin migrations/fixes", deriva en drift DB vs DDL.

## Alta

3) **`validate-db-ready.sh` contiene password por defecto y recomienda fix manual**  
   - Evidencia: `apps/database/scripts/validate-db-ready.sh` usa `DB_PASSWORD` hardcodeado y sugiere ejecutar `psql -f .../04-initialize_user_stats.sql`.  
   - Riesgo: seguridad + normaliza flujo fuera del shell canonico.

4) **Guia de creacion DB promueve migrations y ejecucion manual por archivo**  
   - Evidencia: `docs/50-guides/backend/GUIA-CREAR-BASE-DATOS.md` incluye `migrations/`, "Metodo 2 manual", "Metodo 3 aplicar migraciones".  
   - Riesgo: ambiguedad operacional y alto riesgo de desincronizacion.

5) **Script legacy `create-database.sh` incorpora fix post-seed externo**  
   - Evidencia: `apps/database/create-database.sh` fase 17 ejecuta `scripts/fix-missing-module-progress.sql`.  
   - Riesgo: contradice politica de evitar fixes fuera de DDL/seeds base.

## Media

6) **Ambiguedad de shell canonico por coexistencia de rutas legacy**  
   - Evidencia: existen `apps/database/create-database.sh` y `apps/database/drop-and-recreate-database.sh` ademas de scripts en `apps/database/scripts/`.  
   - Riesgo: uso de pipeline no canonico en cambios futuros.

7) **Inconsistencia de setup DEV con DB objetivo del proyecto**  
   - Evidencia: `SETUP-DEVELOPMENT.md` usa `gamilit_dev` y flujo viejo; directivas usan `gamilit_platform`.  
   - Riesgo: onboarding incorrecto y falsos positivos de pruebas.

8) **Validacion minima laxa para conteo de objetos**  
   - Evidencia: `dev.conf/prod.conf` tienen minimos bajos (`ENV_MIN_TABLES=60/64`) vs inventario esperado mucho mayor.  
   - Riesgo: recreate "exitoso" aun con carga parcial.

## Baja

9) **Carpeta `apps/backend/migrations/` presente (README)**  
   - Evidencia: existe `apps/backend/migrations/README.md`.  
   - Riesgo: señal contradictoria frente a directiva anti-migrations.

10) **Inconsistencias menores de naming y defaults entre docs/config**  
   - Evidencia: `DB_NAME` vs `DB_DATABASE`; default `DB_HOST` fallback en config backend vs narrativa de `DB_HOST_MODE`.  
   - Riesgo: confusion operativa, no ruptura directa.

---

## 4. Analisis del modelo de datos (enfoque estatico)

1) **Modelo fisico orientado a recreacion completa**  
   El pipeline principal (`init-database.sh`) respeta un orden tecnico robusto: schemas/tablas -> funciones -> vistas/mviews -> indices -> triggers -> RLS -> seeds -> validacion. Esto esta alineado con DDL-first.

2) **Dependencias cruzadas explicitamente gestionadas**  
   Se observan mecanismos para dependencias complejas (cross-schema tables, FK diferidas, vista diferida y post-seed de sincronizacion profiles/gamification). El modelo contempla coupling real entre dominios.

3) **Riesgo de deuda estructural por "fixes de pipeline"**  
   La existencia de pasos de reparacion (`fix_profiles_and_gamification`, `fix-missing-module-progress.sql`) indica que parte de la consistencia depende de correcciones posteriores a la carga base. Esto debilita el principio "todo sale limpio solo de DDL + seeds correctos".

4) **Cobertura de estandares de diseno no totalmente verificable en esta fase**  
   Este analisis no ejecuta auditoria semantica tabla por tabla (1NF/2NF/3NF, comentarios por columna, indices por FK) sobre los 169 objetos. Se recomienda una fase 2 automatizada de lint DDL estructural.

---

## 5. Plan de endurecimiento (priorizado)

### P0 (inmediato)
1. Remover password hardcodeado de `init-database.sh`; usar solo sudo no interactivo o variable segura de sesion.
2. Declarar oficialmente shell canonico:  
   - `apps/database/scripts/recreate-database.sh`  
   - `apps/database/scripts/reset-database.sh`  
   - `apps/database/scripts/init-database.sh`
3. Marcar como **legacy/no operativo** los scripts raiz:  
   - `apps/database/create-database.sh`  
   - `apps/database/drop-and-recreate-database.sh`
4. Corregir o archivar guias que promueven migrations y `psql -f` manual (`GUIA-CREAR-BASE-DATOS.md`, `GUIA-PIPELINE-MIGRACIONES.md`).

### P1 (corto plazo)
5. Integrar `validate-db-ready.sh` (o su reemplazo) como paso obligatorio post-recreate en el shell canonico, eliminando password hardcodeado y referencias a fixes manuales.
6. Endurecer umbrales de validacion (`ENV_MIN_*`) a valores alineados con inventario real.
7. Crear un validador CI anti-patrones:
   - bloquear nuevos `migration-*.sql`, `fix-*.sql`, `patch-*.sql` en rutas operativas.
   - bloquear docs nuevas que indiquen ejecucion individual de SQL fuera del shell canonico.

### P2 (mediano plazo)
8. Auditoria automatizada de calidad DDL por estandar:
   - FK con indice,
   - convenciones de naming,
   - comentarios minimos en tablas/columnas criticas,
   - cobertura RLS esperada.
9. Consolidar una sola guia SSOT de operacion DB (DEV/PROD) y referenciarla desde todas las demas.

---

## 6. Checklist operativo propuesto (canonico)

### DEV (WSL)
1. Validar ambiente win32 + wrapper WSL correcto.
2. Ejecutar solo: `apps/database/scripts/recreate-database.sh --env dev --force`.
3. Ejecutar validacion obligatoria post-recreate.
4. Verificar conteos minimos estrictos (tablas, funciones, triggers, RLS).
5. Prohibido aplicar SQL individual con `psql -f`.

### PROD (servidor Ubuntu)
1. Confirmar backup obligatorio.
2. Confirmar backend detenido (`pm2 stop ecosystem.config.js`).
3. Obtener password desde `.env.production` o variable segura (sin hardcode).
4. Ejecutar solo: `apps/database/scripts/recreate-database.sh --env prod --password ... --force`.
5. Ejecutar validacion post-recreate + smoke backend + logs PM2.
6. Prohibido fixes ad-hoc por consola fuera de shell canonico.

---

## 7. Conclusion

El proyecto tiene base tecnica suficiente para operar en modo DDL-first limpio, pero hoy persisten **brechas criticas de gobernanza y seguridad** por coexistencia de scripts/guias legacy y practicas incrementales documentadas.  
La prioridad es cerrar contradicciones (docs + scripts), endurecer el shell canonico y convertir la validacion post-recreate en un gate obligatorio para DEV y PROD.

