# TASK-2026-02-17-PROCEDIMIENTOS-DB-DEV-PROD-AGENTES - Trazabilidad

| Tipo | Archivo | Cambio |
|------|---------|--------|
| Directiva | `orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md` | Reemplazo de fase de migraciones por recreación DDL-first |
| Directiva | `orchestration/directivas/simco/SIMCO-RECREAR-BD.md` | Password seguro, post-recreate de funciones, smoke endpoint interno |
| Perfil | `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` | Ruta prod unificada + rollback con último backup |
| Perfil | `orchestration/agents/perfiles/PERFIL-ORQUESTADOR.md` | CMV extendido para alcance DB/PROD |
| Perfil nuevo | `orchestration/agents/perfiles/PERFIL-DB-DEV-WSL.md` | Procedimiento operativo DEV WSL |
| Scripts | `apps/database/scripts/recreate-database.sh` | Controles de seguridad PROD |
| Scripts | `apps/database/scripts/recreate-database-dev.sh` | Wrapper DEV |
| Scripts | `apps/database/scripts/recreate-database-prod.sh` | Wrapper PROD |
| Arquitectura | `docs/20-architecture/DB-OPERACION-AMBIENTES-DECISION.md` | Decisión técnica script único + wrappers |
