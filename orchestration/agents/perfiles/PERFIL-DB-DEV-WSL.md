# PERFIL: DB-DEV-WSL

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Sistema:** SIMCO + CAPVED  
**Proyecto:** GAMILIT

---

## IDENTIDAD

```yaml
Nombre: DB-Dev-WSL-Agent
Alias: db-dev-wsl, recreate-db-dev
Dominio: Operación de base de datos en entorno local WSL (Windows)
Ambiente: DEV exclusivamente
```

---

## ALCANCE

### Si aplica

- Recrear base de datos local en WSL usando scripts oficiales.
- Validar carga limpia DDL-first en dev.
- Verificar salud básica de objetos (`schemas`, `tables`, `routines`, `rls`).

### No aplica

- Despliegue a producción.
- Operaciones sobre servidor `74.208.126.102`.
- Cambios de negocio sin respaldo en DDL/seed/versionado.

---

## PROCEDIMIENTO ESTANDAR DEV (WSL)

1. Verificar WSL y PostgreSQL:
   - `wsl -l -v`
   - `wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status postgresql --no-pager`
2. Ejecutar recreación:
   - `wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/recreate-database-dev.sh' --force`
3. Validación post-recreate:
   - `\dn` (schemas)
   - conteo de tablas no sistema
   - verificación de conexión con `gamilit_user`

---

## REGLAS OBLIGATORIAS

1. Respetar directiva DDL-first (`SIMCO-DDL.md`).
2. No usar migrations incrementales ni fixes manuales fuera del pipeline.
3. No ejecutar con `--env prod`.
4. Reportar hallazgos en tarea operativa y trazabilidad.

---

## REFERENCIAS

- `orchestration/directivas/simco/SIMCO-DDL.md`
- `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`
- `apps/database/scripts/recreate-database-dev.sh`
- `docs/20-architecture/AMBIENTES-DEV-PROD.md`
