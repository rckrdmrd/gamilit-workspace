# Decision Operativa DB por Ambiente

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Aprobado para ejecución

---

## Decision

Se adopta estrategia de **script único adaptable** (`recreate-database.sh` con `--env`) complementada por **wrappers de seguridad operativa**:

- `apps/database/scripts/recreate-database-dev.sh`
- `apps/database/scripts/recreate-database-prod.sh`

---

## Justificacion

### Base técnica

- Mantiene una sola lógica de recreación (menor divergencia).
- Conserva parametrización por ambiente en `config/dev.conf` y `config/prod.conf`.
- Permite estandarizar el pipeline DDL-first.

### Control operativo agregado

- Wrapper explícito por ambiente reduce error humano en flag `--env`.
- En PROD, `recreate-database.sh` exige password explícito (`--password` o `GAMILIT_DB_PASSWORD`).
- En PROD, falla si PM2 detecta backend/frontend online.

---

## Prechecks/Postchecks mínimos

### DEV (WSL)

- Precheck: PostgreSQL activo en WSL.
- Ejecución: `recreate-database-dev.sh --force`.
- Postcheck: conteo de schemas/tablas básico.

### PROD (Servidor Linux)

- Precheck: backup completo + PM2 detenido + password disponible en `.env.production`.
- Ejecución: `recreate-database-prod.sh --password "$DB_PASSWORD" --force`.
- Postcheck: validación tablas/RLS + health endpoint backend.

---

## Referencias

- `apps/database/scripts/recreate-database.sh`
- `apps/database/scripts/recreate-database-dev.sh`
- `apps/database/scripts/recreate-database-prod.sh`
- `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`
- `orchestration/directivas/simco/SIMCO-DDL.md`
