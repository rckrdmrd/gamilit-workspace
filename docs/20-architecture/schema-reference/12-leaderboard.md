---
titulo: Schema 12 - leaderboard (conceptual)
tipo: arquitectura
subtipo: schema-reference
schema: gamification_system
ultima_actualizacion: 2026-02-27
---

# Schema 12: leaderboard (4 tablas, 12 RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> **Note:** No `leaderboard` schema exists in DDL. Leaderboard functionality is implemented via materialized views in `gamification_system` (see `gamification_system.leaderboard_metadatas` in `04-gamification.md`).

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Tablas Conceptuales (sin DDL)

> Las siguientes tablas aparecen en el modelo conceptual pero no tienen DDL implementado.
> Son candidatas para futuras iteraciones o estan cubiertas por tablas existentes.

| Tabla | Proposito |
|-------|-----------|
| leaderboard.leaderboard_entries | Entradas de leaderboard |
| leaderboard.leaderboard_seasons | Temporadas de competencia |
| leaderboard.leaderboard_history | Historial de rankings |
| leaderboard.season_rewards | Recompensas por temporada |
