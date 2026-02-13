# PROMPT: Sprint 0 - Validacion Dead Features (4 agentes paralelos)

**Perfil:** General (Sonnet)
**Fase:** Sprint 0
**Herramientas:** Read, Glob, Grep

### SA-VAL-01 through SA-VAL-04: Feature Validation Pattern
**Tarea (por feature):** Validate whether "{feature}" is truly dead or alive in the codebase:
1. Search DDL: Glob for *{feature}*.sql in apps/database/ddl/
2. Search Backend: Glob for *{feature}*.entity.ts, *.service.ts, *.controller.ts
3. Search Frontend: Grep for "{feature}" in apps/frontend/src/
4. Check TypeORM registration: Grep for "{ClassName}" in *.module.ts
5. Classify: DEAD (no code), PARTIAL (some layers), ALIVE (all layers)

**Features validadas:** boosts, forum, social_interactions, team_vs_team
**Resultado global:** Todas PARTIAL (DDL+Entity exist, Service/Controller missing)
**Impacto:** NO purgar referencias en Sprint 4
