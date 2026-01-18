# ANALISIS DE SINCRONIZACION DE CREDENCIALES - GAMILIT

**Task ID:** TASK-2026-01-18-003
**Tipo:** Analysis + Improvement
**Fecha:** 2026-01-18
**Estado:** EN PROGRESO

---

## RESUMEN EJECUTIVO

Se identificaron **10 gaps criticos** en el flujo de recreacion de base de datos y gestion de credenciales. El sistema actual tiene herramientas sofisticadas (dotenv-vault, manage-secrets.sh) pero estan **parcialmente implementadas** con varios puntos de falla.

### Problemas Principales

| Severidad | Problema | Impacto |
|-----------|----------|---------|
| **CRITICA** | Passwords hardcodeados en force-recreate-all.sh | Exposicion de credenciales |
| **CRITICA** | Password sudo hardcodeado | Riesgo de seguridad del sistema |
| **ALTA** | Puerto incorrecto en scripts (5432 vs 5433) | Fallas de conexion |
| **ALTA** | Multiples passwords en archivos .env | Desincronizacion |
| **ALTA** | Sin respaldo centralizado de credenciales | Perdida de acceso |
| **MEDIA** | Flujo dotenv-vault incompleto | Pasos manuales propensos a error |

---

## ESTADO ACTUAL DEL SISTEMA

### Scripts de Recreacion de BD

| Script | Version | Estado | Problemas |
|--------|---------|--------|-----------|
| `init-database-v3.sh` | 3.0 | Completo | Puerto hardcodeado 5432 |
| `init-database.sh` | 2.x | Legacy | No usa dotenv-vault |
| `manage-secrets.sh` | 1.0 | Funcional | No actualiza todos los .env |
| `force-recreate-all.sh` | - | **CRITICO** | Passwords en cleartext |
| `reset-database.sh` | - | OK | Solo resetea BD, no usuario |
| `recreate-database.sh` | - | OK | Llama a init-database.sh |

### Archivos de Credenciales

| Archivo | Password Actual | Puerto | Sincronizado |
|---------|-----------------|--------|--------------|
| `database-credentials-dev.txt` | 9rGjYKknaZKnCLUk | 5433 | Parcial |
| `apps/database/.env.dev` | (antiguo) | 5432 | NO |
| `apps/database/.env.database` | GO0jAOgw8Yzankwt | 5432 | NO |
| `apps/backend/.env` | 9rGjYKknaZKnCLUk | 5433 | SI |
| `force-recreate-all.sh` | ULwSaMu5uTN... | 5432 | NO |

---

## GAPS IDENTIFICADOS

### GAP-001: Passwords Hardcodeados en Repositorio [CRITICO]

**Archivo:** `apps/database/scripts/force-recreate-all.sh`

```bash
# Linea 7-8 - EXPOSICION DE CREDENCIALES
DB_PASS="ULwSaMu5uTNQYTaJTelPY3gGFMTKNOqo"
SUDO_PASS="2320"
```

**Riesgo:** Cualquiera con acceso al repo tiene acceso a BD y sudo.

**Solucion Propuesta:**
```bash
# Leer de variable de entorno o archivo seguro
DB_PASS="${GAMILIT_DB_PASSWORD:-}"
if [ -z "$DB_PASS" ]; then
    source "$SCRIPT_DIR/../.env.database" 2>/dev/null || true
    DB_PASS="${DB_PASSWORD:-}"
fi
if [ -z "$DB_PASS" ]; then
    echo "ERROR: DB_PASSWORD no configurado"
    exit 1
fi
```

### GAP-002: Puerto Incorrecto en Scripts

**Archivos Afectados:**
- `init-database-v3.sh` linea 50: `DB_PORT="5432"`
- `force-recreate-all.sh` linea 49: `localhost:5432`
- Multiples scripts en `apps/database/scripts/`

**Estado Actual:** PostgreSQL corre en 5433, scripts apuntan a 5432.

**Solucion Propuesta:**
1. Actualizar `DB_PORT="5433"` en todos los scripts
2. O mejor: Leer puerto de archivo de configuracion centralizado

### GAP-003: Sincronizacion Incompleta de manage-secrets.sh

**Problema:** `manage-secrets.sh sync` actualiza:
- `apps/backend/.env.{env}`

**NO actualiza:**
- `apps/database/.env.{env}`
- `apps/database/.env.database`
- `apps/database/database-credentials-{env}.txt`

**Solucion Propuesta:** Extender funcion `sync_to_backend()` para incluir todos los archivos.

### GAP-004: Sin Respaldo Centralizado de Credenciales

**Estado Actual:**
- Backups locales: `.env.dev.backup.timestamp`
- Si se elimina `apps/database/`, se pierden backups
- No hay respaldo en ubicacion segura diferente

**Solucion Propuesta:**
1. Crear directorio de respaldo: `orchestration/secrets-backups/`
2. Agregar a `.gitignore` para seguridad
3. Modificar scripts para copiar credenciales ahi

### GAP-005: Falta Validacion Post-Recreacion

**Problema:** Los scripts crean usuario/BD pero no verifican:
- Que la conexion funcione con las nuevas credenciales
- Que los archivos .env esten sincronizados
- Que el backend pueda conectarse

**Solucion Propuesta:** Agregar paso de validacion al final de recreacion.

### GAP-006: Inventarios DevEnv Desactualizados

**Archivo:** `orchestration/environment/ENVIRONMENT-INVENTORY.yml`

**Problemas:**
- Puerto documentado: 5432 (incorrecto)
- No hay referencia a manage-secrets.sh
- Falta documentacion de flujo de recreacion

### GAP-007: Sin Protocolo de Rotacion de Credenciales

**Estado:** `manage-secrets.sh rotate` existe pero:
- No hay protocolo documentado de cuando rotar
- No hay notificacion a agentes/perfiles
- No hay registro de rotaciones

### GAP-008: Agente SECRETS-MANAGER sin Integracion

**Perfil:** `PERFIL-SECRETS-MANAGER.md` existe pero:
- No tiene inventario de auditorias (SECRETS-AUDIT.yml no existe)
- No hay integracion con scripts de BD
- No hay trigger automatico

### GAP-009: Directiva de Recreacion Inexistente

**Estado:** No existe `SIMCO-RECREACION-BD.md` o similar que documente:
- Proceso oficial de recreacion
- Checklist pre/post recreacion
- Coordinacion con otros agentes

### GAP-010: Sin Trigger de Sincronizacion de Credenciales

**Estado:** No existe trigger que:
- Detecte cambios en credenciales
- Propague a archivos dependientes
- Notifique a inventarios

---

## IMPACTO EN WORKSPACE

### Directivas Afectadas

| Directiva | Accion Requerida |
|-----------|------------------|
| `SIMCO-DDL.md` | Agregar referencia a manejo de credenciales |
| `SIMCO-BACKEND.md` | Documentar dependencia de .env |
| `SIMCO-VALIDAR.md` | Agregar validacion de credenciales sincronizadas |

### Perfiles de Agente Afectados

| Perfil | Accion Requerida |
|--------|------------------|
| `PERFIL-DEVENV.md` | Agregar responsabilidad de sincronizacion de credenciales |
| `PERFIL-SECRETS-MANAGER.md` | Crear SECRETS-AUDIT.yml, integrar con BD scripts |
| `PERFIL-DBA.md` | Documentar uso de manage-secrets.sh |

### Inventarios a Actualizar

| Inventario | Accion Requerida |
|------------|------------------|
| `ENVIRONMENT-INVENTORY.yml` | Corregir puerto 5433, agregar flujo de credenciales |
| `DEVENV-MASTER-INVENTORY.yml` | Agregar manage-secrets.sh como herramienta |
| `ENV-VARS-INVENTORY.yml` | Documentar proceso de rotacion |

### Triggers a Crear

| Trigger | Proposito |
|---------|-----------|
| `TRIGGER-CREDENCIALES-SINCRONIZADAS.md` | Validar sincronizacion post-recreacion |
| `TRIGGER-ROTACION-CREDENCIALES.md` | Proceso de rotacion segura |

---

## PLAN DE CORRECCION

### Fase 1: Seguridad Inmediata [P0]

1. **Eliminar passwords hardcodeados** de `force-recreate-all.sh`
2. **Corregir puerto** 5432 -> 5433 en scripts
3. **Sincronizar** todos los archivos .env con password actual

### Fase 2: Automatizacion [P1]

1. **Extender** `manage-secrets.sh sync` para actualizar todos los archivos
2. **Crear** script de validacion post-recreacion
3. **Agregar** respaldo centralizado de credenciales

### Fase 3: Gobernanza [P2]

1. **Crear** `SIMCO-RECREACION-BD.md`
2. **Crear** `TRIGGER-CREDENCIALES-SINCRONIZADAS.md`
3. **Actualizar** perfiles de agentes afectados
4. **Crear** `SECRETS-AUDIT.yml`

### Fase 4: Documentacion [P3]

1. **Actualizar** inventarios de entorno
2. **Documentar** flujo oficial de recreacion
3. **Crear** checklist de recreacion de BD

---

## ARCHIVOS A MODIFICAR/CREAR

### Modificar

| Archivo | Cambios |
|---------|---------|
| `apps/database/scripts/force-recreate-all.sh` | Eliminar passwords hardcodeados |
| `apps/database/scripts/init-database-v3.sh` | Puerto 5432 -> 5433 |
| `apps/database/scripts/manage-secrets.sh` | Extender sync para todos los .env |
| `orchestration/environment/ENVIRONMENT-INVENTORY.yml` | Puerto correcto, flujo credenciales |

### Crear

| Archivo | Proposito |
|---------|-----------|
| `orchestration/directivas/simco/SIMCO-RECREACION-BD.md` | Directiva oficial |
| `orchestration/directivas/triggers/TRIGGER-CREDENCIALES.md` | Trigger de sincronizacion |
| `orchestration/secrets-backups/.gitkeep` | Directorio de respaldos |
| `apps/database/scripts/validate-credentials.sh` | Validacion post-recreacion |

---

## SIGUIENTE ACCION

Proceder con Fase 1: Correccion de seguridad inmediata.

---

*Analisis realizado por: Agente DBA/Arquitecto*
*Metodologia: CAPVED*
*Fecha: 2026-01-18*
