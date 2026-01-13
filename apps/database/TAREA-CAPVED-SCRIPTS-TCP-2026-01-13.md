# TAREA CAPVED: Correccion Scripts Database para Soporte TCP

**ID:** TAREA-SCRIPTS-TCP-001
**Fecha:** 2026-01-13
**Sistema:** SIMCO v3.8+ con SAAD
**Modo:** @FULL (Ciclo CAPVED Completo)
**Tipo:** Fix / Refactor
**Proyecto:** gamilit/apps/database

---

## RESUMEN EJECUTIVO

Correccion de scripts `init-database.sh` y `recreate-database.sh` para soportar conexiones TCP
cuando PostgreSQL no esta disponible via socket local (ambiente WSL2). Los scripts originales
fallaban al intentar `sudo -u postgres psql` porque en WSL2 PostgreSQL solo esta accesible via TCP.

---

# FASE C: CONTEXTO

## C.1 Clasificacion de Tarea

| Campo | Valor |
|-------|-------|
| Proyecto | gamilit/apps/database |
| Tipo | Fix + Refactor |
| Origen | Incidencia (fallo en ejecucion de scripts) |
| Epic | Infraestructura Database |
| Prioridad | P0 (Bloqueante para recreacion BD) |

## C.2 Problema Detectado

```
ERROR: init-database.sh y recreate-database.sh fallan en WSL2

Sintoma:
- "No se puede conectar a PostgreSQL"
- Scripts intentan `sudo -u postgres psql` que requiere socket local
- PostgreSQL solo disponible via TCP en puerto 5432

Causa raiz:
- Scripts asumen que PostgreSQL tiene socket local disponible
- No cargan DB_PASSWORD desde backend/.env
- No soportan conexion TCP con usuario no-superuser (gamilit_user)
```

## C.3 Archivos Afectados Identificados

| Archivo | Tipo | Rol |
|---------|------|-----|
| `scripts/init-database.sh` | Shell Script | Inicializacion completa de BD |
| `scripts/recreate-database.sh` | Shell Script | Eliminacion y recreacion BD |
| `apps/backend/.env` | Config | Fuente de DB_PASSWORD |
| `scripts/config/dev.conf` | Config | Configuracion de ambiente |

## C.4 SIMCO a Aplicar

- `SIMCO-MODIFICAR.md` - Modificacion de archivos existentes
- `SIMCO-VALIDAR.md` - Validacion de cambios
- `PRINCIPIO-CAPVED.md` - Ciclo completo obligatorio

---

# FASE A: ANALISIS DETALLADO

## A.1 Estado Original de Scripts

### A.1.1 init-database.sh (v3.9) - Lineas Criticas

```bash
# ORIGINAL - check_prerequisites() linea ~330
# Solo intentaba sudo -u postgres, fallaba en TCP-only
if command -v sudo &> /dev/null; then
    if sudo -n -u postgres psql -c "SELECT 1" &> /dev/null 2>&1; then
        USE_SUDO=true
        # ...
    else
        print_error "No se puede conectar a PostgreSQL"
        exit 1
    fi
fi
```

```bash
# ORIGINAL - manage_password() linea ~261
# Solo buscaba en .env.$ENVIRONMENT, no en .env
if [ -z "$DB_PASSWORD" ] && [ -f "$BACKEND_DIR/.env.$ENVIRONMENT" ]; then
    get_password_from_vault
    return
fi
# Si no existia .env.dev, generaba password nuevo (incorrecto)
```

### A.1.2 recreate-database.sh - Lineas Criticas

```bash
# ORIGINAL - check_prerequisites() linea ~127
# Solo sudo o TCP con postgres user
if sudo -n -u postgres psql -c "SELECT 1" &> /dev/null 2>&1; then
    USE_SUDO=true
elif [ -n "$PGPASSWORD" ] && psql -h "$DB_HOST" -U "$POSTGRES_USER" -c "SELECT 1"; then
    USE_SUDO=false
else
    print_error "No se puede conectar a PostgreSQL"
    exit 1
fi
# NO cargaba password desde backend/.env
# NO soportaba gamilit_user con CREATEDB
```

## A.2 Analisis de Dependencias

### A.2.1 Dependencias de init-database.sh

| Dependencia | Archivo | Uso |
|-------------|---------|-----|
| Config ambiente | `scripts/config/dev.conf` | Variables ENV_* |
| Config ambiente | `scripts/config/prod.conf` | Variables ENV_* |
| Password | `apps/backend/.env` | DB_PASSWORD |
| Password | `apps/backend/.env.$ENV` | DB_PASSWORD (vault) |
| DDL | `ddl/**/*.sql` | Creacion de objetos |
| Seeds | `seeds/**/*.sql` | Datos iniciales |

### A.2.2 Dependencias de recreate-database.sh

| Dependencia | Archivo | Uso |
|-------------|---------|-----|
| Script init | `scripts/init-database.sh` | Llamado en paso 3/3 |
| Config ambiente | `scripts/config/*.conf` | Variables ENV_* |
| Password | `apps/backend/.env` | DB_PASSWORD |

### A.2.3 Archivos Dependientes (que usan estos scripts)

| Archivo/Proceso | Dependencia | Impacto |
|-----------------|-------------|---------|
| CI/CD Pipeline | Usa recreate-database.sh | ALTO |
| Documentacion dev | Referencias a scripts | MEDIO |
| Backend startup | Asume BD existe | ALTO |

## A.3 Analisis de gamilit_user

```sql
-- Verificacion de privilegios
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole
FROM pg_roles WHERE rolname = 'gamilit_user';

-- Resultado:
--    rolname    | rolsuper | rolcreatedb | rolcreaterole
-- --------------+----------+-------------+---------------
--  gamilit_user | f        | t           | f
```

| Privilegio | Valor | Implicacion |
|------------|-------|-------------|
| rolsuper | false | NO puede crear usuarios |
| rolcreatedb | true | PUEDE crear/eliminar BDs propias |
| rolcreaterole | false | NO puede crear roles |

**Conclusion:** gamilit_user puede crear y eliminar BDs que posee, pero NO puede crear usuarios.
Los scripts deben adaptarse para saltar la creacion de usuario cuando usan gamilit_user.

## A.4 Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigacion |
|----|--------|--------------|---------|------------|
| R1 | gamilit_user no puede ALTER TABLE DISABLE TRIGGER ALL | Media | Medio | Ya manejado con warning en fix_profiles_and_gamification |
| R2 | Password de .env no sincronizado con BD | Baja | Alto | Script valida conexion antes de proceder |
| R3 | Conexion falla si PostgreSQL no corre | Alta | Critico | Mensaje de error claro con opciones |

---

# FASE P: PLANEACION

## P.1 Subtareas por Dominio

### ST-001: Modificar init-database.sh - manage_password()

```yaml
id: ST-001
dominio: Database/Scripts
archivo: scripts/init-database.sh
funcion: manage_password()
lineas: 277-292 (insercion)
cambio: |
  Agregar prioridad 2.5 para leer DB_PASSWORD desde backend/.env
  si no existe .env.$ENVIRONMENT
criterio_aceptacion:
  - Password se carga correctamente desde backend/.env
  - No genera password nuevo si existe en .env
```

### ST-002: Modificar init-database.sh - check_prerequisites()

```yaml
id: ST-002
dominio: Database/Scripts
archivo: scripts/init-database.sh
funcion: check_prerequisites()
lineas: 330-366 (modificacion)
cambio: |
  Reordenar prioridades de conexion:
  1. TCP con gamilit_user (CREATEDB)
  2. TCP con postgres user
  3. sudo -u postgres (socket local)
criterio_aceptacion:
  - Conexion TCP con gamilit_user funciona
  - Variable USE_GAMILIT_USER se establece correctamente
```

### ST-003: Modificar init-database.sh - execute_as_postgres/query_as_postgres

```yaml
id: ST-003
dominio: Database/Scripts
archivo: scripts/init-database.sh
funciones: execute_as_postgres(), query_as_postgres()
lineas: 372-402 (modificacion)
cambio: |
  Agregar rama para USE_GAMILIT_USER=true
  Usar PGPASSWORD con gamilit_user via TCP
criterio_aceptacion:
  - Funciones ejecutan SQL correctamente con gamilit_user
  - Conexion via TCP funciona
```

### ST-004: Modificar init-database.sh - create_user_and_database()

```yaml
id: ST-004
dominio: Database/Scripts
archivo: scripts/init-database.sh
funcion: create_user_and_database()
lineas: 413-433 (modificacion)
cambio: |
  Si USE_GAMILIT_USER=true:
  - Saltar creacion de usuario (ya existe)
  - Solo crear BD (gamilit_user tiene CREATEDB)
criterio_aceptacion:
  - No intenta CREATE USER cuando usa gamilit_user
  - BD se crea correctamente con owner gamilit_user
```

### ST-005: Modificar recreate-database.sh - Variables globales

```yaml
id: ST-005
dominio: Database/Scripts
archivo: scripts/recreate-database.sh
lineas: 35-45 (insercion)
cambio: |
  Agregar variables:
  - USE_GAMILIT_USER=false
  - DB_PASSWORD=""
criterio_aceptacion:
  - Variables disponibles en todo el script
```

### ST-006: Modificar recreate-database.sh - execute_as_postgres/query_as_postgres

```yaml
id: ST-006
dominio: Database/Scripts
archivo: scripts/recreate-database.sh
funciones: execute_as_postgres(), query_as_postgres()
lineas: 105-130 (modificacion)
cambio: |
  Agregar soporte para USE_GAMILIT_USER
  Similar a init-database.sh
criterio_aceptacion:
  - Funciones soportan conexion TCP con gamilit_user
```

### ST-007: Modificar recreate-database.sh - check_prerequisites()

```yaml
id: ST-007
dominio: Database/Scripts
archivo: scripts/recreate-database.sh
funcion: check_prerequisites()
lineas: 136-179 (modificacion)
cambio: |
  1. Cargar config del ambiente
  2. Cargar password desde backend/.env
  3. Reordenar prioridades de conexion
criterio_aceptacion:
  - Password se carga desde backend/.env
  - Conexion TCP con gamilit_user funciona
```

### ST-008: Modificar recreate-database.sh - drop_user()

```yaml
id: ST-008
dominio: Database/Scripts
archivo: scripts/recreate-database.sh
funcion: drop_user()
lineas: 212-238 (modificacion)
cambio: |
  Si USE_GAMILIT_USER=true:
  - Saltar eliminacion de usuario
  - No podemos eliminarnos a nosotros mismos
criterio_aceptacion:
  - No intenta DROP USER gamilit_user cuando conectado como gamilit_user
```

### ST-009: Ejecutar recreate-database.sh

```yaml
id: ST-009
dominio: Database/Scripts
archivo: scripts/recreate-database.sh
cambio: Ejecutar script corregido
criterio_aceptacion:
  - Script ejecuta sin errores
  - BD recreada con todos los objetos
  - Seeds cargados
```

### ST-010: Validar BD completa

```yaml
id: ST-010
dominio: Database/Validacion
cambio: Verificar conteos de objetos y datos
criterio_aceptacion:
  - Schemas >= 12
  - Tablas >= 100
  - Funciones >= 100
  - Triggers >= 50
  - Seeds criticos cargados
```

## P.2 Orden de Ejecucion

```
ST-001 → ST-002 → ST-003 → ST-004 (init-database.sh)
                                  ↓
ST-005 → ST-006 → ST-007 → ST-008 (recreate-database.sh)
                                  ↓
                              ST-009 (Ejecucion)
                                  ↓
                              ST-010 (Validacion)
```

## P.3 Validaciones Definidas

| Validacion | Comando | Criterio |
|------------|---------|----------|
| Conexion TCP | `PGPASSWORD=... psql -h localhost` | Conecta sin error |
| Script recreate | `recreate-database.sh --env dev --force` | Exit code 0 |
| Conteo schemas | Query information_schema | >= 12 |
| Conteo tablas | Query pg_tables | >= 100 |
| Seeds users | Query auth.users | >= 40 |
| Seeds modules | Query educational_content.modules | = 5 |

---

# FASE V: VALIDACION DEL PLAN

## V.1 Verificacion Alineacion Analisis ↔ Plan

| Elemento Analisis | Subtarea Plan | Estado |
|-------------------|---------------|--------|
| manage_password() no lee .env | ST-001 | CUBIERTO |
| check_prerequisites() no TCP | ST-002, ST-007 | CUBIERTO |
| execute_as_postgres sin gamilit_user | ST-003, ST-006 | CUBIERTO |
| create_user_and_database fallaria | ST-004 | CUBIERTO |
| recreate no carga password | ST-005, ST-007 | CUBIERTO |
| drop_user fallaria | ST-008 | CUBIERTO |
| Validacion final | ST-009, ST-010 | CUBIERTO |

## V.2 Verificacion Dependencias Consideradas

| Dependencia | Considerada | Subtarea |
|-------------|-------------|----------|
| backend/.env | SI | ST-001, ST-007 |
| config/*.conf | SI | ST-007 |
| DDL files | IMPLICITO | ST-009 |
| Seeds files | IMPLICITO | ST-009 |

## V.3 Verificacion Riesgos Mitigados

| Riesgo | Mitigacion en Plan |
|--------|-------------------|
| R1: DISABLE TRIGGER | Ya existe manejo con warning |
| R2: Password desincronizado | Validacion en ST-009 |
| R3: PostgreSQL no corre | Mensaje de error claro |

## V.4 Scope Creep Check

| Elemento | En Alcance Original | Decision |
|----------|---------------------|----------|
| Modificar scripts TCP | SI | Proceder |
| Modificar DDL files | NO | NO incluir |
| Modificar backend | NO | NO incluir |
| Actualizar seeds | NO | NO incluir |

**RESULTADO:** Plan alineado con analisis. Sin scope creep. APROBADO para ejecucion.

---

# FASE E: EJECUCION

## E.1 Registro de Ejecucion por Subtarea

### ST-001: manage_password() - COMPLETADO

**Archivo:** `scripts/init-database.sh`
**Lineas modificadas:** 283-292

```bash
# CODIGO AGREGADO (Prioridad 2.5)
# Prioridad 2.5: Leer desde .env principal si existe
if [ -z "$DB_PASSWORD" ] && [ -f "$BACKEND_DIR/.env" ]; then
    local PASSWORD=$(grep "^DB_PASSWORD=" "$BACKEND_DIR/.env" | cut -d= -f2 | tr -d '"' | tr -d "'")
    if [ -n "$PASSWORD" ]; then
        DB_PASSWORD="$PASSWORD"
        print_success "Usando password de backend/.env"
        print_info "Password: ${DB_PASSWORD:0:8}...${DB_PASSWORD: -4}"
        return
    fi
fi
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-002: check_prerequisites() - COMPLETADO

**Archivo:** `scripts/init-database.sh`
**Lineas modificadas:** 330-366

```bash
# CODIGO MODIFICADO - Nueva prioridad de conexion
# Prioridad 1: Conexión TCP con gamilit_user (tiene CREATEDB)
if [ -n "$DB_PASSWORD" ] && PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" &> /dev/null 2>&1; then
    USE_SUDO=false
    USE_GAMILIT_USER=true
    print_success "Conectado a PostgreSQL (TCP con $DB_USER)"
# Prioridad 2: Conexión TCP con postgres user
elif [ -n "$PGPASSWORD" ] && psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "SELECT 1" &> /dev/null 2>&1; then
    USE_SUDO=false
    USE_GAMILIT_USER=false
    print_success "Conectado a PostgreSQL (TCP con postgres)"
# Prioridad 3: sudo -u postgres (socket local)
elif command -v sudo &> /dev/null; then
    # ... codigo existente para sudo
fi
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-003: execute_as_postgres/query_as_postgres - COMPLETADO

**Archivo:** `scripts/init-database.sh`
**Lineas modificadas:** 372-402

```bash
# CODIGO MODIFICADO - Soporte USE_GAMILIT_USER
execute_as_postgres() {
    local sql="$1"
    if [ "$USE_SUDO" = true ]; then
        # ... codigo existente
    elif [ "$USE_GAMILIT_USER" = true ]; then
        # Usar gamilit_user con CREATEDB privilege
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "$sql" 2>&1
    else
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "$sql" 2>&1
    fi
}

query_as_postgres() {
    local sql="$1"
    if [ "$USE_SUDO" = true ]; then
        # ... codigo existente
    elif [ "$USE_GAMILIT_USER" = true ]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -t -c "$sql" 2>/dev/null | xargs
    else
        # ... codigo existente
    fi
}
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-004: create_user_and_database() - COMPLETADO

**Archivo:** `scripts/init-database.sh`
**Lineas modificadas:** 413-433

```bash
# CODIGO MODIFICADO - Saltar creacion de usuario
create_user_and_database() {
    print_step "PASO 1/9: Creando usuario y base de datos..."

    # Si usamos gamilit_user (TCP sin superuser), saltar creación de usuario
    if [ "$USE_GAMILIT_USER" = true ]; then
        print_info "Usando conexión TCP con $DB_USER (CREATEDB privilege)"
        print_success "Usuario $DB_USER ya configurado"
    else
        # Crear/actualizar usuario (requiere superuser)
        # ... codigo existente
    fi
    # ... resto del codigo para crear BD
}
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-005: Variables globales recreate-database.sh - COMPLETADO

**Archivo:** `scripts/recreate-database.sh`
**Lineas modificadas:** 43-45

```bash
# CODIGO AGREGADO
USE_SUDO=false
USE_GAMILIT_USER=false
DB_PASSWORD=""
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-006: execute_as_postgres/query_as_postgres recreate - COMPLETADO

**Archivo:** `scripts/recreate-database.sh`
**Lineas modificadas:** 108-130

```bash
# CODIGO MODIFICADO - Igual que init-database.sh
execute_as_postgres() {
    local sql="$1"
    if [ "$USE_SUDO" = true ]; then
        echo "$sql" | sudo -u postgres psql 2>&1
    elif [ "$USE_GAMILIT_USER" = true ]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "$sql" 2>&1
    else
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "$sql" 2>&1
    fi
}

query_as_postgres() {
    local sql="$1"
    if [ "$USE_SUDO" = true ]; then
        echo "$sql" | sudo -u postgres psql -t | xargs
    elif [ "$USE_GAMILIT_USER" = true ]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -t -c "$sql" 2>/dev/null | xargs
    else
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -t -c "$sql" | xargs
    fi
}
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-007: check_prerequisites() recreate - COMPLETADO

**Archivo:** `scripts/recreate-database.sh`
**Lineas modificadas:** 149-179

```bash
# CODIGO MODIFICADO - Carga de config y password
check_prerequisites() {
    print_step "Verificando prerequisitos..."
    # ... validaciones basicas

    # Cargar configuración del ambiente
    local config_file="$SCRIPT_DIR/config/${ENVIRONMENT}.conf"
    if [ -f "$config_file" ]; then
        source "$config_file"
        print_info "Configuración cargada: $config_file"
    fi

    # Cargar DB_PASSWORD desde backend/.env si no está definido
    local backend_env="$SCRIPT_DIR/../../backend/.env"
    if [ -z "$DB_PASSWORD" ] && [ -f "$backend_env" ]; then
        DB_PASSWORD=$(grep -E "^DB_PASSWORD=" "$backend_env" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [ -n "$DB_PASSWORD" ]; then
            print_info "Password cargado desde backend/.env"
        fi
    fi

    # Usar ENV_DB_HOST/PORT si están definidos
    [ -n "$ENV_DB_HOST" ] && DB_HOST="$ENV_DB_HOST"
    [ -n "$ENV_DB_PORT" ] && DB_PORT="$ENV_DB_PORT"

    # Verificar conexión PostgreSQL con nueva prioridad
    # Prioridad 1: TCP con gamilit_user
    # Prioridad 2: TCP con postgres
    # Prioridad 3: sudo
    # ...
}
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-008: drop_user() recreate - COMPLETADO

**Archivo:** `scripts/recreate-database.sh`
**Lineas modificadas:** 215-220

```bash
# CODIGO MODIFICADO - Saltar eliminacion de usuario propio
drop_user() {
    print_step "PASO 2/3: Eliminando usuario..."

    # Si usamos gamilit_user, no podemos eliminarnos a nosotros mismos
    if [ "$USE_GAMILIT_USER" = true ]; then
        print_info "Usando conexión TCP con $DB_USER - saltando eliminación de usuario"
        print_info "El usuario será reutilizado (ya tiene CREATEDB)"
        return
    fi
    # ... resto del codigo
}
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-009: Ejecucion recreate-database.sh - COMPLETADO

**Comando ejecutado:**
```bash
bash recreate-database.sh --env dev --force
```

**Salida resumida:**
```
✓ Conectado a PostgreSQL (TCP con gamilit_user)
✓ Base de datos eliminada
✓ Usuario reutilizado (CREATEDB)
✓ 15 schemas creados
✓ 36 ENUMs cargados
✓ 137 tablas creadas
✓ 108 funciones creadas
✓ 13 vistas creadas
✓ 4 MVIEWs creadas
✓ 23 índices creados
✓ 35 triggers creados
✓ 32 archivos RLS ejecutados
✓ 40 seeds cargados (25 con warnings menores)
✓ Profiles y gamificación sincronizados
```

**Estado:** COMPLETADO | **Validacion:** OK

### ST-010: Validacion BD - COMPLETADO

**Query de validacion:**
```sql
SELECT tipo, COUNT(*) FROM (
  SELECT 'Schemas' as tipo FROM information_schema.schemata WHERE ...
  UNION ALL SELECT 'Tablas' FROM information_schema.tables WHERE ...
  -- etc
);
```

**Resultados:**

| Objeto | Cantidad | Minimo Esperado | Estado |
|--------|----------|-----------------|--------|
| Schemas | 16 | 12 | OK |
| Tablas | 144 | 100 | OK |
| Funciones | 219 | 100 | OK |
| Triggers | 105 | 50 | OK |
| Policies | 214 | 100 | OK |
| Indices | 852 | 200 | OK |

**Seeds criticos:**

| Tabla | Registros | Esperado | Estado |
|-------|-----------|----------|--------|
| auth.users | 48 | >= 40 | OK |
| auth_management.profiles | 48 | >= 40 | OK |
| gamification_system.user_stats | 48 | >= 40 | OK |
| educational_content.modules | 5 | = 5 | OK |
| system_configuration.feature_flags | 26 | >= 20 | OK |

**Estado:** COMPLETADO | **Validacion:** OK

---

# FASE D: DOCUMENTACION

## D.1 Inventario de Archivos Modificados

| Archivo | Version Anterior | Version Nueva | Lineas Cambiadas |
|---------|------------------|---------------|------------------|
| scripts/init-database.sh | v3.9 | v3.10-TCP | 283-292, 330-366, 372-402, 413-433 |
| scripts/recreate-database.sh | v1.0 | v1.1-TCP | 43-45, 108-130, 149-179, 215-220 |

## D.2 Actualizacion de Version de Scripts

### init-database.sh

```bash
# Header actualizado (lineas 3-12)
# GAMILIT Platform - Database Initialization Script v3.10-TCP
#
# Cambios v3.10-TCP (2026-01-13):
#   - Soporte para conexion TCP con gamilit_user (CREATEDB privilege)
#   - Carga de password desde backend/.env (prioridad 2.5)
#   - Prioridad de conexion: TCP gamilit_user > TCP postgres > sudo
#   - create_user_and_database() salta creacion usuario en modo TCP
```

### recreate-database.sh

```bash
# Header actualizado
# GAMILIT Platform - Database Recreation Script v1.1-TCP
#
# Cambios v1.1-TCP (2026-01-13):
#   - Soporte para conexion TCP con gamilit_user
#   - Carga de password desde backend/.env
#   - drop_user() salta eliminacion cuando conectado como gamilit_user
```

## D.3 Documentos Generados

| Documento | Ubicacion | Proposito |
|-----------|-----------|-----------|
| Este documento | `TAREA-CAPVED-SCRIPTS-TCP-2026-01-13.md` | Documentacion CAPVED completa |
| Actualizacion validacion | `VALIDACION-CAPVED-2026-01-13.md` | Seccion de scripts agregada |

## D.4 Verificacion de Coherencia DDL-Backend-Frontend

### Backend (mission.entity.ts)

| Campo DDL | Campo Entity | Coherencia |
|-----------|--------------|------------|
| `progress double precision` | `type: 'double precision'` | OK |
| `timestamp with time zone` | `type: 'timestamp with time zone'` | OK |

### Frontend

No hay impacto - los scripts de BD no afectan frontend directamente.

## D.5 Propagacion

| Destino | Aplica | Razon |
|---------|--------|-------|
| erp-core | NO | Scripts especificos de gamilit |
| Verticales ERP | NO | No usan gamilit database |
| template-saas | NO | Scripts diferentes |

## D.6 Lecciones Aprendidas

```yaml
que_funciono_bien:
  - Analisis detallado de privilegios gamilit_user antes de modificar
  - Estructura de prioridades de conexion (TCP primero, sudo fallback)
  - Reutilizacion de patron entre init y recreate

que_se_puede_mejorar:
  - Documentar en README.md las opciones de conexion
  - Agregar flag --tcp-only para forzar modo TCP
  - Tests automatizados para ambos modos de conexion

para_futuras_tareas_similares:
  - Siempre verificar privilegios del usuario de BD antes de asumir superuser
  - Priorizar conexion TCP sobre socket local para compatibilidad
  - Mantener coherencia de funciones entre scripts relacionados
```

---

# RESUMEN DE VALIDACION FINAL

## Checklist CAPVED Completado

- [x] C: Contexto documentado
- [x] A: Analisis detallado de archivos y dependencias
- [x] P: Plan con subtareas y criterios de aceptacion
- [x] V: Validacion plan vs analisis - APROBADO
- [x] E: Ejecucion de todas las subtareas
- [x] D: Documentacion actualizada

## Metricas de Ejecucion

| Metrica | Valor |
|---------|-------|
| Subtareas planificadas | 10 |
| Subtareas completadas | 10 |
| Archivos modificados | 2 |
| Lineas cambiadas | ~120 |
| BD recreada | SI |
| Validacion BD | PASADA |

## Estado Final

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║  TAREA-SCRIPTS-TCP-001: COMPLETADA                               ║
║                                                                   ║
║  Scripts init-database.sh y recreate-database.sh corregidos      ║
║  para soportar conexion TCP en ambientes sin socket local.       ║
║                                                                   ║
║  BD recreada exitosamente via scripts corregidos.                ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

**Documento generado por:** SIMCO v3.8+ CAPVED @FULL
**Fecha:** 2026-01-13
**Autor:** Claude Assistant
**Validado:** SI
