# TASK-VAL-001-F0-INFRA: Verificar WSL + PostgreSQL + Redis

**US:** US-VAL-001 | **Tipo:** Infra | **Estado:** Pendiente | **SP:** 1

## Descripcion
Iniciar WSL Ubuntu-24.04, verificar que PostgreSQL responde en puerto 5432 y Redis en puerto 6379.

## Acciones
1. `wsl -d Ubuntu-24.04` — verificar shell accesible
2. `sudo service postgresql start` — iniciar PostgreSQL
3. `sudo service redis-server start` — iniciar Redis
4. `pg_isready -p 5432` — verificar PostgreSQL
5. `redis-cli ping` — verificar Redis responde PONG

## Criterio Pass
- PostgreSQL activo en 5432
- Redis activo en 6379, responde PONG
