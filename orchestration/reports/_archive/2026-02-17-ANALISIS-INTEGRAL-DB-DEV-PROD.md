# Analisis Integral DB + Desarrollo por Ambientes (DEV/PROD)

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Cerrado con plan de remediacion activo

---

## Resumen ejecutivo

Se validó la consistencia entre desarrollo, directivas y operación de base de datos con foco en política **DDL-first**:

- Se corrigió contradicción explícita de migraciones incrementales en deploy prod.
- Se unificó ruta productiva de operación y despliegue.
- Se reforzaron controles de seguridad en recreación de BD para prod.
- Se definió modelo operativo recomendado: script único adaptable + wrappers por ambiente.
- Se formalizó contexto de agentes para DEV WSL y PROD Linux.
- Se aterrizó backlog de remediación en EPIC/US/TASK (`EPIC-WS-007`, `DBOPS-*`).

---

## Fase 1 - Auditoria normativa y coherencia documental

### Hallazgos

1. Contradicción entre política DDL-first y directiva de deploy:
   - `SIMCO-DDL.md` prohíbe migrations/fixes fuera de carga limpia.
   - `SIMCO-DEPLOY-PRODUCTION.md` mencionaba fase de migraciones.
2. Inconsistencia de rutas productivas entre documentos.
3. Brecha de claridad en obtención segura de password de prod para recreación.

### Acciones aplicadas

- Actualizada `orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md`:
  - removida fase de migraciones incrementales,
  - reemplazada por recreación limpia DDL-first con referencias SSOT.
- Actualizada `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md`:
  - ruta productiva unificada a `/home/isem/gamilit-workspace`.

---

## Fase 2 - Auditoria técnica de scripts DB

### Scripts auditados

- `apps/database/scripts/recreate-database.sh`
- `apps/database/scripts/init-database.sh`
- `apps/database/scripts/reset-database.sh`
- `apps/database/create-database.sh`

### Hallazgos

- El pipeline principal es compatible con carga limpia desde DDL.
- Existía riesgo operativo en prod por falta de guardrails estrictos en `recreate-database.sh`.

### Acciones aplicadas

- Se reforzó `recreate-database.sh` con controles prod:
  - exige `--password` o `GAMILIT_DB_PASSWORD`,
  - bloquea si PM2 está online para backend/frontend,
  - advierte backup obligatorio en prod.

---

## Fase 3 - Modelo de ambientes (DEV WSL vs PROD Linux)

### Decisión

Se adopta modelo:

1. **Script único adaptable** (`recreate-database.sh --env ...`) como núcleo.
2. **Wrappers por ambiente** para reducir error humano:
   - `recreate-database-dev.sh`
   - `recreate-database-prod.sh`

### Sustento

- Minimiza divergencia de lógica.
- Mantiene configuración por ambiente en `config/dev.conf` y `config/prod.conf`.
- Mejora usabilidad y seguridad operativa.

### Evidencia

- `docs/20-architecture/DB-OPERACION-AMBIENTES-DECISION.md`

---

## Fase 4 - Contexto de agentes y procedimientos ejecutables

### Acciones aplicadas

1. `SIMCO-RECREAR-BD.md`:
   - lectura segura de `DB_PASSWORD` desde `.env.production`,
   - post-recreación para recarga de funciones si aplica,
   - smoke test alineado a endpoint interno.
2. `PERFIL-ORQUESTADOR.md`:
   - CMV ampliado con `SIMCO-RECREAR-BD` y `PERFIL-DEPLOY-SERVER`.
3. Perfil nuevo:
   - `orchestration/agents/perfiles/PERFIL-DB-DEV-WSL.md`.
4. Registro de tarea operativa:
   - `orchestration/tareas/TASK-2026-02-17-PROCEDIMIENTOS-DB-DEV-PROD-AGENTES/`.

---

## Fase 5 - Planeación de remediación (EPIC/US/TASK)

### Backlog aplicado

- Nueva épica: `EPIC-WS-007` en `orchestration/scrum/BACKLOG.yml`.
- Nuevas historias:
  - `HU-WS-007` (estandarización recreación DB sin migraciones incrementales),
  - `HU-WS-008` (contexto operativo de agentes dev/prod).
- Items de ejecución:
  - `DBOPS-001..DBOPS-006` (4 completados, 2 pendientes).

### Mapeo funcional-operativo

- `orchestration/scrum/BACKLOG-MAPPING.yml` actualizado con `EPIC-WS-007`.

---

## Riesgos residuales

1. `DBOPS-005` pendiente:
   - automatizar detección de referencias prohibidas a migrations en CI.
2. `DBOPS-006` pendiente:
   - sincronizar inventarios SSOT con scripts/perfiles nuevos.

---

## Conclusión

El desarrollo y la operación de BD quedan alineados al enfoque DDL-first con procedimiento claro por ambiente.  
Se cerraron contradicciones críticas y se dejó una ruta de mejora continua priorizada y trazable en backlog.

---

## Referencias

- `orchestration/directivas/simco/SIMCO-DDL.md`
- `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`
- `orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md`
- `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md`
- `orchestration/agents/perfiles/PERFIL-DB-DEV-WSL.md`
- `apps/database/docs/ANALISIS-PIPELINE-RECREATE-DB-2026-02-17.md`
- `docs/20-architecture/DB-OPERACION-AMBIENTES-DECISION.md`
