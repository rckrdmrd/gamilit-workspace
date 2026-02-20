# FASE 3: Auditoria de Scripts y Pipeline DDL

**Tarea:** TASK-2026-02-19-ANALISIS-DEPLOY-PROD
**Fecha:** 2026-02-19
**Alcance:** Shell scripts de base de datos, deployment y operaciones
**Metodologia:** Lectura exhaustiva de codigo fuente, analisis estatico de seguridad y robustez

---

## 1. INVENTARIO DE SCRIPTS AUDITADOS

| # | Script | Lineas | Proposito |
|---|--------|--------|-----------|
| 1 | `apps/database/scripts/init-database.sh` | 1863 | Pipeline DDL completo (9 fases) |
| 2 | `apps/database/database-master.sh` | 731 | Orquestador de recreacion BD |
| 3 | `apps/devops/scripts/deploy-production.sh` | 611 | Deploy a produccion |
| 4 | `apps/devops/scripts/deploy.sh` | 516 | Deploy generico (dev/prod) |
| 5 | `apps/devops/scripts/backup-production-data.sh` | 482 | Backup de datos criticos |
| 6 | `apps/database/scripts/pre-deploy-backup.sh` | 68 | Backup pre-deploy con pg_dump |
| 7 | `apps/database/scripts/force-recreate-all.sh` | 386 | Recreacion forzada (DROP ALL) |
| 8 | `apps/database/scripts/recreate-database.sh` | 435 | Recreacion con confirmacion |
| 9 | `apps/database/scripts/recreate-database-prod.sh` | 7 | Wrapper prod para recreacion |
| 10 | `apps/database/scripts/config/dev.conf` | 114 | Configuracion ambiente dev |
| 11 | `apps/database/scripts/config/prod.conf` | 141 | Configuracion ambiente prod |

**Scripts auxiliares no auditados en profundidad:** `temp-init.sh`, `temp-seeds.sh`, `temp-phase2.sh`, `temp-phase3.sh` (scripts temporales de debug), `manage-secrets.sh`, `update-env-files.sh`, y 5 scripts de monitoreo SQL.

---

## 2. ANALISIS DE `init-database.sh` (Pipeline DDL Principal)

### 2.1 Las 9 Fases de Ejecucion (+ Post-Fases)

| Fase | Funcion | Descripcion | Como Superuser |
|------|---------|-------------|----------------|
| 1/9 | `create_user_and_database()` | Crea/actualiza usuario, DROP+CREATE BD | Si (postgres) |
| 2/9 | `execute_ddl_tables()` | Prerequisites, schemas, ENUMs, tablas, cross-schema, FKs, permisos | Si (postgres) |
| 3/9 | `execute_functions()` | Funciones SQL de 15 schemas | Si (superuser) |
| 4/9 | `execute_views()` | Vistas de 11 schemas (con deferred view) | Si (superuser) |
| 5/9 | `execute_mviews()` | Vistas materializadas de 3 schemas | Si (superuser) |
| 6/9 | `execute_indexes()` | Indices de 10 schemas | Si (superuser) |
| 7/9 | `execute_triggers()` | Triggers de 12 schemas | Si (superuser) |
| 8/9 | `execute_rls_policies()` | RLS de 13 schemas + 4 archivos globales | Si (superuser) |
| 9/9 | `load_seeds()` | 81+ seeds con scope y categoria | No (gamilit_user) |
| Post | `grant_all_permissions()` | GRANT ALL en todos los schemas | Si |
| Post | `fix_profiles_and_gamification()` | Sincroniza profiles, user_stats, user_ranks | Si |
| Post | `validate_business_invariants()` | Valida tenant, escuela, classroom, roles | Si/No |
| Post | `post_seeds_security()` | NOBYPASSRLS (DESHABILITADO) | N/A |
| Post | `validate_installation()` | Conteo de objetos vs umbrales minimos | Si/No |
| Post | `show_summary()` / `sync_password_to_env_files()` | Escribe credenciales a archivos | N/A |

### 2.2 Error Handling

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| `set -e` | ACTIVO | Linea 64 -- aborta en primer error de comando |
| `ON_ERROR_STOP=1` | PARCIAL | Solo en `execute_sql_file_as_superuser()` (funciones, vistas, MVs, triggers, RLS, indexes). NO en `execute_sql_file()` (seeds) |
| Error grep en seeds | ACTIVO | `grep -E "^psql:.*ERROR:\|^ERROR:"` -- detecta errores SQL en output |
| `ENV_FAIL_ON_SEED_ERROR` | CONFIGURABLE | `true` en dev.conf y prod.conf |
| `ENV_FAIL_ON_MISSING_SEED` | CONFIGURABLE | `true` en ambos ambientes |

### 2.3 Escenarios de Errores Silenciosos

| # | Escenario | Severidad | Explicacion |
|---|-----------|-----------|-------------|
| S1 | Batch mode tablas: `> /dev/null 2>&1` | **ALTA** | Lineas 602-606: Si el batch de tablas falla parcialmente, solo imprime warning y continua. Las tablas faltantes causan errores en cascada en fases posteriores pero NO se sabe cuales fallaron |
| S2 | ENUMs batch: `> /dev/null 2>&1` | MEDIA | Lineas 554-558: Output suprimido. Warning generico "Algunos ENUMs pueden haber fallado" |
| S3 | Cross-schema tables: `> /dev/null 2>&1` | MEDIA | Lineas 642-644: Output completamente suprimido. Errores invisibles |
| S4 | FK constraints: `> /dev/null 2>&1` | MEDIA | Lineas 659-666: Cada FK tiene `if` pero errores individuales no se reportan |
| S5 | Permisos post-DDL: `> /dev/null 2>&1` | MEDIA | Lineas 685-688: `99-post-ddl-permissions.sql` output suprimido |
| S6 | Prerequisites: `> /dev/null 2>&1` | **ALTA** | Lineas 476-484: El archivo mas critico (ENUMs base, extensiones) -- output completamente suprimido |
| S7 | `grant_all_permissions()`: `> /dev/null 2>&1` | MEDIA | Linea 1771: Permisos fallidos serian invisibles |
| S8 | Seeds sin `ON_ERROR_STOP` | MEDIA | `execute_sql_file()` (linea 397) NO usa `ON_ERROR_STOP=1`. Un seed puede tener errores parciales que el grep no detecta (ej: WARNING convertido a error por trigger) |
| S9 | `set -e` + piped commands | BAJA | Bash solo evalua exit code del ultimo comando en pipe. `execute_sql_file "$seed_file" 2>&1 \| grep` -- si psql falla pero grep encuentra algo, el exit code es 0 |

### 2.4 Password Management

| Aspecto | Evaluacion |
|---------|------------|
| Prioridad de password | 1) Exportado env var, 2) Vault (.env.{ENV}), 3) Manual, 4) Generado |
| Sudo password | Lee de `$GAMILIT_SUDO_PASSWORD` env var (NO hardcoded) |
| Password parcialmente visible en logs | SI -- `${DB_PASSWORD:0:8}...${DB_PASSWORD: -4}` en lineas 229 y 302 |
| Credenciales escritas a disco | SI -- `database-credentials-{env}.txt` con `chmod 600` |
| Connection string en stdout | SI -- linea 1696 imprime connection string completa con password |
| Password en `PGPASSWORD` env var | SI -- necesario para psql, es el mecanismo estandar |
| `export PGPASSWORD` scope | CORRECTAMENTE limitado con `unset PGPASSWORD` (lineas 1036/1253) |

### 2.5 `post_seeds_security()` -- Status

La funcion esta **DESHABILITADA** (lineas 1494-1513). El cuerpo activo solo imprime warnings.
El bloque `ALTER ROLE gamilit_user NOBYPASSRLS` esta comentado.

**Prerequisitos documentados para re-habilitar:**
1. RlsInterceptor debe ejecutar `SET LOCAL app.current_user_id` en cada conexion
2. Endpoints publicos necesitan policies sin user context
3. INSERT...RETURNING* necesita SELECT policies
4. Validacion end-to-end con app corriendo

**Impacto:** `gamilit_user` tiene `BYPASSRLS=true` en runtime, lo que significa que las 467 RLS policies son inoperantes para la aplicacion. Esto es un **riesgo de seguridad significativo** en produccion.

---

## 3. ANALISIS DE `database-master.sh` -- HALLAZGOS CRITICOS

### 3.1 Credenciales Hardcodeadas (CRITICO)

```bash
# Linea 40:
DB_PORT="5433"  # PostgreSQL 16 en este sistema usa puerto 5433

# Linea 41:
SUDO_PASS_DEV="2320"
```

**Hallazgos:**

| # | Hallazgo | Severidad | Linea(s) | Impacto |
|---|----------|-----------|----------|---------|
| C1 | **Password sudo `2320` hardcodeado** | **CRITICA** | 41, 139, 241, 264, 510 | Password de sistema operativo del desarrollador expuesto en git. Permite `sudo` completo en la maquina dev. El archivo esta tracked en git (confirmado: `git ls-files -- apps/database/database-master.sh` muestra el archivo) |
| C2 | **Puerto `5433` hardcodeado** | **ALTA** | 40 | Prod usa 5432 (confirmado en prod.conf). Si se ejecuta `database-master.sh --env prod`, usara puerto 5433 que es INCORRECTO. El script NO carga `prod.conf` |
| C3 | **No carga config/{env}.conf** | **ALTA** | Ausente | A diferencia de `init-database.sh`, este script NO tiene `load_environment_config()`. Las constantes de conexion estan fijas en el header |
| C4 | **Sudo password visible en help text** | MEDIA | 24, 139 | `"usa sudo con password automatico (2320)"` expuesto en comentarios y help output |
| C5 | **Sudo password usado en error message** | MEDIA | 241 | `"Verifica que el password sudo sea correcto (configurado: 2320)"` |

### 3.2 Arquitectura de Autenticacion

```
DEV:  echo "$SUDO_PASS_DEV" | sudo -S -u postgres psql  (hardcoded password)
PROD: PGPASSWORD="$POSTGRES_SUPERUSER_PASS" psql -h -p -U postgres  (env var -- OK)
```

**Problema:** El flujo dev usa `sudo -S` con password piped por stdin. Esto expone el password en:
- Process listing (`ps aux` mostraria `echo 2320`)
- Shell history si se invoca interactivamente
- El propio archivo fuente en git

### 3.3 Comparacion con `init-database.sh` (Contraste)

| Aspecto | `init-database.sh` | `database-master.sh` |
|---------|---------------------|----------------------|
| Sudo password | `$GAMILIT_SUDO_PASSWORD` env var | `"2320"` hardcoded |
| Puerto DB | `${DB_PORT:-5432}` + config/*.conf | `"5433"` hardcoded |
| Carga config | `load_environment_config()` | NO |
| Password DB | 4-level priority chain | 5-level priority chain |
| ON_ERROR_STOP | Si (superuser func) | N/A (delega a create-database.sh) |
| SQL Injection | Potencial (ver seccion 7) | Potencial (ver seccion 7) |

---

## 4. ANALISIS DE `deploy-production.sh`

### 4.1 Flujo de Deploy

```
validate_prerequisites --> run_tests --> create_backup --> run_migrations
    --> build_applications --> deploy_application --> health_checks --> show_summary
```

### 4.2 Hallazgos

| # | Hallazgo | Severidad | Detalle |
|---|----------|-----------|---------|
| D1 | **Test failures NO bloquean deploy** | **ALTA** | Lineas 228-229 y 235-239: `print_warning "Tests fallaron (continuando con advertencia)"`. Los tests son informativos, no gate. Un deploy con tests rotos continua sin impedimento |
| D2 | **Health check de Swagger en prod** | MEDIA | Linea 451: `curl "http://localhost:${backend_port}/api/v1/docs"`. Swagger esta deshabilitado en prod (`ENABLE_SWAGGER=false` en .env.production.example). El check siempre fallara silenciosamente pero no bloquea porque es un `if` sin `else` que cause rollback |
| D3 | **Rollback limitado** | **ALTA** | `do_rollback()` (lineas 465-496) solo restaura datos SQL de backup, NO restaura codigo anterior. No hace `git checkout` a version previa. `pm2 restart all` reinicia con el codigo nuevo (potencialmente roto) |
| D4 | **Rollback sin codigo previo** | **ALTA** | No hay mecanismo para guardar/restaurar dist/ anterior. Si el build se completo pero la app falla, rollback reinicia con el build roto |
| D5 | **No hay version tagging** | MEDIA | No se crea tag de git ni se registra la version deployada. Imposible saber que commit esta en produccion despues del deploy |
| D6 | **Sleep 15s como health check timeout** | BAJA | Linea 424: Espera fija de 15 segundos antes de health check. Si la app tarda mas, los retries (5x5s) cubren hasta ~40s total |
| D7 | **Health check usa HTTP, no HTTPS** | MEDIA | Linea 434: `curl "http://localhost:${backend_port}/api/health"`. En prod el backend escucha en HTTP (Nginx termina SSL), asi que esto funciona para checks locales. Sin embargo, no valida que Nginx+SSL funcionen |
| D8 | **`load_env` exporta TODO** | MEDIA | Linea 124: `export $(cat "$env_file" \| grep -v '^#' \| grep -v '^$' \| xargs)`. Esto exporta TODAS las variables del .env.production al shell, incluyendo las que no necesita. Podria sobreescribir variables de entorno existentes |
| D9 | **Migrations sin transaccion** | MEDIA | Lineas 316-333: Cada migracion se ejecuta individualmente con `psql -f`. Si falla a medio camino, la BD queda en estado parcial (no hay `BEGIN/COMMIT` wrapper) |
| D10 | **DATABASE_URL en connection string** | MEDIA | Linea 125: Password en URL. Si algun proceso hijo hace `env` o si hay logging de env vars, el password se expone |

### 4.3 Flujo de Rollback (Evaluacion Detallada)

```
do_rollback():
  1. Verifica que hay backup disponible
  2. Llama a backup-production-data.sh --restore (restaura datos SQL por tabla)
  3. Verifica git status (pero NO hace rollback de git)
  4. pm2 restart all (reinicia con codigo actual, posiblemente roto)
```

**Gaps del rollback:**
- No restaura `node_modules/` ni `dist/` a version anterior
- No tiene blue-green deployment
- No puede volver a un build anterior
- El rollback de BD es por tablas individuales, no por pg_restore completo

---

## 5. ARCHIVOS DE CONFIGURACION

### 5.1 `dev.conf`

| Aspecto | Valor | Evaluacion |
|---------|-------|------------|
| DB_PORT | 5432 | Correcto |
| Seeds dir | `seeds/dev` | OK |
| FAIL_ON_SEED_ERROR | true | Buena practica |
| FAIL_ON_MISSING_SEED | true | Buena practica |
| MIN_PASSWORD_LENGTH | 16 | Aceptable para dev |
| ENV_VERBOSE | true | OK para dev |

### 5.2 `prod.conf`

| Aspecto | Valor | Evaluacion |
|---------|-------|------------|
| DB_PORT | 5432 | Correcto |
| Seeds dir | `seeds/prod` | OK |
| FAIL_ON_SEED_ERROR | true | Buena practica |
| STRICT_VALIDATION | true | Buena practica |
| MIN_PASSWORD_LENGTH | 32 | Buena practica |
| MIN_RLS_POLICIES | 200 | Correcto (actual: 467) |
| CREATE_BACKUP_BEFORE_DROP | true | Buena practica |
| ENV_VERBOSE | false | OK para prod |

**Problema:** `prod.conf` declara `ENV_SAVE_CREDENTIALS_ENCRYPTED="true"` y `ENV_REQUIRE_PASSWORD_CONFIRMATION="true"` pero ninguna funcion en `init-database.sh` lee estas variables. Son **dead config** -- declaradas pero no implementadas.

---

## 6. ARCHIVOS CON CREDENCIALES TRACKED EN GIT

| Archivo | En Git | Password Visible | Riesgo |
|---------|--------|------------------|--------|
| `apps/database/database-master.sh` | **SI** | `SUDO_PASS_DEV="2320"` | **CRITICO** |
| `apps/database/.env.database` | **SI** | `DB_PASSWORD=gamilit_dev_2026` | **ALTO** |
| `apps/database/.env.dev` | **SI** | `DB_PASSWORD=gamilit_dev_2026` | **ALTO** |
| `apps/backend/.env.vault` | **SI** | Contenido no auditado | MEDIO |
| `apps/database/database-credentials-dev.txt` | NO (.gitignore) | N/A (correcto) | OK |
| `apps/database/credentials-backups/` | NO (.gitignore) | N/A (correcto) | OK |
| `apps/backend/.env` | NO (.gitignore) | N/A (correcto) | OK |
| `apps/backend/.env.production` | NO (.gitignore) | N/A (correcto) | OK |
| `apps/backend/.env.production.example` | SI | Placeholders `<...>` | OK |

### 6.1 Detalle de Archivos Problematicos

**`apps/database/.env.database` (tracked):**
```
DB_PASSWORD=gamilit_dev_2026
DATABASE_URL=postgresql://gamilit_user:gamilit_dev_2026@localhost:5432/gamilit_platform
```

**`apps/database/.env.dev` (tracked):**
```
DB_PASSWORD=gamilit_dev_2026
DATABASE_URL=postgresql://gamilit_user:gamilit_dev_2026@localhost:5432/gamilit_platform
```

**`apps/database/database-master.sh` (tracked):**
```
SUDO_PASS_DEV="2320"
DB_PORT="5433"
```

Estos archivos estan en el historial de git. Incluso si se agregan a `.gitignore` ahora, las credenciales permanecen en el historial indefinidamente a menos que se haga `git filter-branch` o `git filter-repo`.

---

## 7. SQL INJECTION VECTORS

Multiples scripts construyen SQL con interpolacion directa de variables:

```bash
# init-database.sh:422
execute_as_postgres "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD' CREATEDB;"

# database-master.sh:494
run_as_postgres "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB LOGIN;"

# force-recreate-all.sh:320
run_psql_sudo "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB LOGIN;"
```

**Riesgo:** Si `$DB_PASSWORD` contiene comillas simples (`'`), el SQL se rompe o permite inyeccion.
Ejemplo: password `a'; DROP DATABASE gamilit_platform; --` se expandiria a:
```sql
CREATE USER gamilit_user WITH PASSWORD 'a'; DROP DATABASE gamilit_platform; --' CREATEDB;
```

**Mitigacion parcial:** Los passwords se generan con `openssl rand -base64 32 | tr -d "=+/"` que no produce comillas. Pero el flujo de password manual (`--password`) NO sanitiza la entrada.

**Probabilidad:** BAJA (passwords tipicamente no contienen `'`), pero el impacto seria catastrofico.

---

## 8. PRE-DEPLOY BACKUP (`pre-deploy-backup.sh`)

Script bien escrito con `set -euo pipefail` (el unico script con `pipefail`).

| Aspecto | Evaluacion |
|---------|------------|
| Error handling | Excelente -- `set -euo pipefail` |
| Password management | Correcto -- requiere `DB_PASSWORD` o `GAMILIT_DB_PASSWORD` env var |
| Backup validation | SI -- verifica tamano > 1024 bytes |
| Retention policy | 7 dias automatico |
| No credenciales hardcoded | Correcto |

**Problema menor:** Linea 46 usa `pg_dump --format=custom` piped a `gzip`. Pero `--format=custom` ya comprime internamente. El doble-compress con gzip agrega overhead sin beneficio significativo.

---

## 9. SCRIPTS DE MONITOREO (`apps/database/scripts/monitoring/`)

5 archivos `.sql` que son queries de monitoreo (no scripts ejecutables):

| Script | Proposito | Evaluacion |
|--------|-----------|------------|
| `check-connections.sql` | Conexiones activas y long-running queries | OK |
| `check-slow-queries.sql` | Queries lentas | OK |
| `check-locks.sql` | Lock contention | OK |
| `check-bloat.sql` | Table/index bloat | OK |
| `check-vacuum.sql` | Vacuum status | OK |

**Observacion:** Son scripts standalone sin wrapper. No hay cron job configurado ni script de monitoring automatizado.

---

## 10. TABLA DE RIESGOS CONSOLIDADA

### 10.1 Por Script

| Script | Riesgo Global | Justificacion |
|--------|---------------|---------------|
| `database-master.sh` | **CRITICO** | Credenciales OS hardcodeadas en git, puerto incorrecto para prod |
| `init-database.sh` | **ALTO** | Errores silenciosos en batch mode, password visible en stdout |
| `deploy-production.sh` | **ALTO** | Tests no bloquean, rollback incompleto, no hay version tagging |
| `.env.database` / `.env.dev` | **ALTO** | Credenciales DB tracked en git |
| `force-recreate-all.sh` | MEDIO | SQL injection potencial, pero buena estructura general |
| `deploy.sh` | MEDIO | Tests no bloquean deploy |
| `backup-production-data.sh` | BAJO | Bien estructurado |
| `pre-deploy-backup.sh` | BAJO | El mejor script del lote |
| `recreate-database.sh` | BAJO | Buena confirmacion, delegacion a init-database.sh |
| Config files | BAJO | Bien configurados, some dead config |

### 10.2 Por Hallazgo (Ordenado por Severidad)

| ID | Hallazgo | Severidad | Impacto | Probabilidad | Script |
|----|----------|-----------|---------|--------------|--------|
| C1 | Sudo password `2320` hardcodeado y tracked en git | **CRITICA** | Compromiso total del sistema dev | ALTA (esta en git publico) | `database-master.sh` |
| C2 | Puerto `5433` hardcodeado (prod usa 5432) | **ALTA** | Fallo de conexion en prod | ALTA (si se usa este script para prod) | `database-master.sh` |
| F1 | DB password `gamilit_dev_2026` tracked en git | **ALTA** | Acceso a BD dev | ALTA (esta en git) | `.env.database`, `.env.dev` |
| S1 | Tablas batch mode suprime errors | **ALTA** | DDL incompleto sin diagnostico | MEDIA | `init-database.sh` |
| S6 | Prerequisites output suprimido | **ALTA** | Extensions/ENUMs fallidos invisibles | BAJA (raro que fallen) | `init-database.sh` |
| D1 | Test failures NO bloquean deploy | **ALTA** | Deploy de codigo roto a prod | MEDIA | `deploy-production.sh` |
| D3 | Rollback no restaura codigo | **ALTA** | Rollback parcial, app rota | MEDIA (si rollback es necesario) | `deploy-production.sh` |
| SEC1 | BYPASSRLS activo en runtime | **ALTA** | RLS policies inoperantes | ALTA (es el estado actual) | `init-database.sh` |
| C3 | No carga config por ambiente | ALTA | Configuracion incorrecta en prod | MEDIA | `database-master.sh` |
| D9 | Migrations sin transaccion | MEDIA | BD en estado parcial | BAJA (migraciones son simples) | `deploy-production.sh` |
| D2 | Health check de Swagger en prod | MEDIA | Falsa alarma (silent failure) | ALTA | `deploy-production.sh` |
| SQL1 | SQL injection via --password | MEDIA | Destruccion de BD | MUY BAJA | Multiples scripts |
| SUM1 | Connection string con password en stdout | MEDIA | Exposicion en logs | MEDIA | `init-database.sh` |
| CFG1 | Dead config en prod.conf | BAJA | No hay funcionalidad de cifrado | BAJA | `prod.conf` |

---

## 11. RECOMENDACIONES

### 11.1 Acciones CRITICAS (Hacer Inmediatamente)

1. **R-CRIT-01: Eliminar credenciales de `database-master.sh`**
   - Reemplazar `SUDO_PASS_DEV="2320"` con `SUDO_PASS_DEV="${GAMILIT_SUDO_PASSWORD:-}"` (patron de `init-database.sh`)
   - Reemplazar `DB_PORT="5433"` con `DB_PORT="${DB_PORT:-5432}"` y cargar desde config/*.conf
   - Agregar `load_environment_config()` al flujo del script
   - **IMPORTANTE:** Despues de commitear, ejecutar `git filter-repo` o `BFG Repo-Cleaner` para purgar el password `2320` del historial de git

2. **R-CRIT-02: Eliminar credenciales tracked**
   - `git rm --cached apps/database/.env.database apps/database/.env.dev`
   - Agregar a `.gitignore`:
     ```
     apps/database/.env.database
     apps/database/.env.dev
     apps/database/.env.*
     !apps/database/.env.*.example
     ```
   - Crear `apps/database/.env.database.example` y `apps/database/.env.dev.example` con placeholders

3. **R-CRIT-03: Cambiar el sudo password `2320`** en la maquina de desarrollo, ya que esta expuesto en el historial de git

### 11.2 Acciones de ALTA Prioridad

4. **R-HIGH-01: Tests DEBEN bloquear deploy**
   - En `deploy-production.sh`, cambiar lineas 228-229 y 235-239 de `print_warning` + continue a `print_error` + `exit 1`
   - O al minimo, agregar `--strict` flag que haga tests obligatorios

5. **R-HIGH-02: Mejorar rollback de deploy**
   - Antes de deploy, guardar backup de `dist/` de backend y frontend
   - En rollback, restaurar `dist/` anterior + `pm2 restart`
   - Considerar blue-green deployment con 2 directorios

6. **R-HIGH-03: Eliminar supresion de errores en batch DDL**
   - En `execute_ddl_tables()`, reemplazar `> /dev/null 2>&1` con captura de output a variable
   - Loguear errores a archivo y mostrar resumen
   - Al minimo, no suprimir stderr: usar `> /dev/null` (solo stdout) en lugar de `> /dev/null 2>&1`

7. **R-HIGH-04: Plan para habilitar NOBYPASSRLS**
   - Implementar `SET LOCAL app.current_user_id` en RlsInterceptor
   - Crear ticket/epic dedicado

### 11.3 Acciones de MEDIA Prioridad

8. **R-MED-01: Sanitizar password input**
   - En todas las funciones que construyen SQL con `PASSWORD '$var'`, escapar comillas simples:
     ```bash
     local safe_pass="${DB_PASSWORD//\'/\'\'}"
     execute_as_postgres "CREATE USER $DB_USER WITH PASSWORD '$safe_pass' CREATEDB;"
     ```

9. **R-MED-02: Eliminar Swagger health check en prod**
   - En `deploy-production.sh` linea 451, eliminar o condicionar el check de `/api/v1/docs`

10. **R-MED-03: Agregar version tagging al deploy**
    - Despues de deploy exitoso: `git tag -a "deploy-$(date +%Y%m%d-%H%M%S)" -m "Production deploy"`

11. **R-MED-04: Wrappear migraciones en transaccion**
    - Ejecutar cada migracion dentro de `BEGIN; ... COMMIT;` o agregar `ON_ERROR_STOP=1`

12. **R-MED-05: No imprimir connection string en stdout**
    - Linea 1696 de `init-database.sh`: Eliminar o redactar el password

13. **R-MED-06: Implementar las variables dead de prod.conf**
    - `ENV_SAVE_CREDENTIALS_ENCRYPTED` y `ENV_REQUIRE_PASSWORD_CONFIRMATION` se declaran pero no se usan. O implementar o eliminar para evitar falsa confianza

### 11.4 Acciones de BAJA Prioridad

14. **R-LOW-01: Eliminar scripts temp-*.sh**
    - `temp-init.sh`, `temp-seeds.sh`, `temp-phase2.sh`, `temp-phase3.sh` son scripts de debug que no deberian estar en el repositorio

15. **R-LOW-02: Automatizar monitoreo**
    - Crear wrapper script para los 5 scripts de monitoreo SQL
    - Configurar cron job en produccion

16. **R-LOW-03: Agregar `pipefail` a todos los scripts**
    - Solo `pre-deploy-backup.sh` usa `set -euo pipefail`. Los demas usan solo `set -e`

---

## 12. RESUMEN EJECUTIVO

### Estado General

La infraestructura de scripts tiene una **base solida** (`init-database.sh` es completo y bien estructurado con 9 fases, config por ambiente, y validaciones post-seed). Sin embargo, hay **3 problemas criticos** que requieren atencion inmediata:

1. **Credenciales en git:** El password sudo del sistema operativo (`2320`) y el password de BD dev (`gamilit_dev_2026`) estan en archivos tracked. Esto es una violacion de seguridad basica que requiere limpieza del historial de git.

2. **`database-master.sh` roto para prod:** Puerto hardcodeado incorrecto (5433 vs 5432) y no carga configuracion por ambiente. Si alguien lo usa con `--env prod`, fallara o conectara al servicio equivocado.

3. **Deploy sin gates de calidad:** Tests fallidos no bloquean el deploy a produccion, y el mecanismo de rollback no restaura el codigo a la version anterior.

### Metricas de Calidad

| Metrica | Valor |
|---------|-------|
| Scripts auditados | 11 principales + 5 SQL monitoring |
| Hallazgos CRITICOS | 3 (C1, C2, F1) |
| Hallazgos ALTOS | 7 (S1, S6, D1, D3, SEC1, C3, R-HIGH-*) |
| Hallazgos MEDIOS | 6 |
| Hallazgos BAJOS | 3 |
| Credenciales hardcodeadas en git | 3 archivos |
| Scripts con error supression | 1 principal (init-database.sh, multiple locations) |
| Scripts sin `pipefail` | 10 de 11 |

---

*Analisis completado: 2026-02-19*
*Auditor: Claude Opus 4.6 (research-only mode)*
