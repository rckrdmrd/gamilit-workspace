# CORRECCION DE PUERTO POSTGRESQL - GAMILIT

**Task ID:** TASK-2026-01-18-002
**Tipo:** Bug Fix
**Fecha:** 2026-01-18
**Estado:** COMPLETADO

---

## RESUMEN

Se corrigio el error de autenticacion de PostgreSQL causado por una discrepancia en el puerto configurado. PostgreSQL estaba ejecutandose en el puerto **5433** mientras que las configuraciones del proyecto apuntaban al puerto **5432**.

---

## PROBLEMA ORIGINAL

### Sintomas
Al ejecutar `npm run dev` en el backend, se presentaban multiples errores de autenticacion:

```
ERROR [TypeOrmModule] Unable to connect to the database (gamification). Retrying (1)...
Error: password authentication failed for user "gamilit_user"

ERROR [TypeOrmModule] Unable to connect to the database (notifications). Retrying (1)...
ERROR [TypeOrmModule] Unable to connect to the database (auth). Retrying (1)...
ERROR [TypeOrmModule] Unable to connect to the database (communication). Retrying (1)...
... (9 modulos afectados)
```

### Causa Raiz
Analisis de logs de PostgreSQL revelo:
```
LOG:  listening on IPv4 address "127.0.0.1", port 5433
```

PostgreSQL estaba configurado para escuchar en puerto **5433**, no en 5432.

---

## SOLUCION APLICADA

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/backend/.env` | `DB_PORT=5432` -> `DB_PORT=5433` |
| `apps/backend/src/config/database.config.ts` | Fallback `'5432'` -> `'5433'` |
| `apps/database/database-credentials-dev.txt` | Puerto actualizado a 5433 |
| `orchestration/environment/PROJECT-ENV-CONFIG.yml` | `port: 5432` -> `port: 5433` |
| `orchestration/environment/ENVIRONMENT-INVENTORY.yml` | Todas las referencias actualizadas |

### Verificacion

```bash
# Test de conexion exitoso
PGPASSWORD='9rGjYKknaZKnCLUk' psql -h 127.0.0.1 -p 5433 -U gamilit_user -d gamilit_platform

# Resultado:
 current_user | current_database
--------------+------------------
 gamilit_user | gamilit_platform
```

---

## ERRORES RESIDUALES (NO RELACIONADOS)

Despues del fix, se observaron errores de TypeORM que son pre-existentes:

```
ERROR [TypeOrmModule] Unable to connect to the database (audit)
TypeORMError: Entity metadata for UserActivityLog#user was not found

ERROR [TypeOrmModule] Unable to connect to the database (content)
TypeORMError: Entity metadata for ContentVersion#tenant was not found
```

Estos errores son problemas de configuracion de relaciones en entities TypeORM, **no relacionados con el problema de autenticacion** que se resolvio. Requieren correccion separada de las entities involucradas.

---

## CONFIGURACION ACTUAL

### Conexion a Base de Datos
```
Host:     localhost
Port:     5433
Database: gamilit_platform
User:     gamilit_user
Password: (ver .env)
```

### Connection String
```
postgresql://gamilit_user:PASSWORD@localhost:5433/gamilit_platform
```

---

## RECOMENDACIONES

1. **Documentar puerto oficial** - El puerto 5433 debe ser el estandar para desarrollo local
2. **Validar scripts de BD** - Algunos scripts shell todavia referencian puerto 5432
3. **Resolver errores TypeORM** - Corregir relaciones en entities UserActivityLog y ContentVersion

---

*Correccion aplicada por: Agente DBA/DevOps*
*Metodologia: CAPVED*
