# REPORTE: Corrección de Triggers Duplicados

**Fecha:** 2025-11-24
**Ejecutado por:** Architecture-Analyst
**Estado:** COMPLETADO

---

## Resumen Ejecutivo

Se identificaron y corrigieron **29+ triggers duplicados** que estaban definidos tanto en archivos de tabla (`tables/*.sql`) como en archivos de trigger separados (`triggers/*.sql`), causando errores de PostgreSQL:

```
ERROR: trigger "xxx" for relation "yyy" already exists
```

## Archivos Modificados

### auth_management (4 archivos)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `01-tenants.sql` | `trg_tenants_updated_at` | triggers/06-trg_tenants_updated_at.sql |
| `03-profiles.sql` | 3 triggers | triggers/03, 04, 05 |
| `04-roles.sql` | `trg_user_roles_updated_at` | triggers/07-trg_user_roles_updated_at.sql |
| `10-memberships.sql` | `trg_memberships_updated_at` | triggers/02-trg_memberships_updated_at.sql |

### progress_tracking (3 archivos)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `01-module_progress.sql` | `trg_module_progress_updated_at` | triggers/23-trg_module_progress_updated_at.sql |
| `03-exercise_attempts.sql` | `trg_update_user_stats_on_exercise` | triggers/21-trg_update_user_stats.sql |
| `04-exercise_submissions.sql` | `exercise_submissions_updated_at` | triggers/22-exercise_submissions_updated_at.sql |

### gamification_system (6 archivos)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `01-user_stats.sql` | `trg_user_stats_updated_at` | triggers/20-trg_user_stats_updated_at.sql |
| `02-user_ranks.sql` | `trg_user_ranks_updated_at` | triggers/19-trg_user_ranks_updated_at.sql |
| `03-achievements.sql` | `trg_achievements_updated_at` | triggers/15-trg_achievements_updated_at.sql |
| `06-missions.sql` | `missions_updated_at` | triggers/17-missions_updated_at.sql |
| `07-comodines_inventory.sql` | `trg_comodines_inventory_updated_at` | triggers/16-trg_comodines_inventory_updated_at.sql |
| `08-notifications.sql` | `notifications_updated_at` | triggers/18-notifications_updated_at.sql |

### social_features (5 archivos)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `02-schools.sql` | `trg_schools_updated_at` | triggers/27-trg_schools_updated_at.sql |
| `03-classrooms.sql` | `trg_classrooms_updated_at` | triggers/26-trg_classrooms_updated_at.sql |
| `04-classroom_members.sql` | 2 triggers | triggers/24, 25 |
| `05-teams.sql` | `trg_teams_updated_at` | triggers/28-trg_teams_updated_at.sql |

### educational_content (4 archivos)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `01-modules.sql` | `trg_modules_updated_at` | triggers/14-trg_modules_updated_at.sql |
| `02-exercises.sql` | `trg_exercises_updated_at` | triggers/12-trg_exercises_updated_at.sql |
| `03-assessment_rubrics.sql` | `trg_assessment_rubrics_updated_at` | triggers/11-trg_assessment_rubrics_updated_at.sql |
| `04-media_resources.sql` | `trg_media_resources_updated_at` | triggers/13-trg_media_resources_updated_at.sql |

### content_management (3 archivos)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `01-content_templates.sql` | `trg_content_templates_updated_at` | triggers/08-trg_content_templates_updated_at.sql |
| `02-marie_curie_content.sql` | `trg_marie_curie_content_updated_at` | triggers/09-trg_marie_curie_content_updated_at.sql |
| `03-media_files.sql` | `trg_media_files_updated_at` | triggers/10-trg_media_files_updated_at.sql |

### system_configuration (2 archivos)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `01-system_settings.sql` | `trg_system_settings_updated_at` | triggers/30-trg_system_settings_updated_at.sql |
| `01-feature_flags.sql` | `trigger_update_feature_flags_timestamp` | triggers/29-trg_feature_flags_updated_at.sql |

### audit_logging (1 archivo)
| Archivo | Trigger Removido | Referencia |
|---------|------------------|------------|
| `03-system_alerts.sql` | `trg_system_alerts_updated_at` | triggers/01-trg_system_alerts_updated_at.sql |

## Patrón de Corrección Aplicado

En cada archivo de tabla, se reemplazó:

```sql
-- ANTES:
CREATE TRIGGER trg_xxx_updated_at BEFORE UPDATE ON schema.table
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();

-- DESPUÉS:
-- NOTE: Trigger trg_xxx_updated_at movido a archivo separado
-- Ver: schema/triggers/XX-trg_xxx_updated_at.sql
```

## Validación

```bash
# Comando ejecutado:
DATABASE_URL="..." ./drop-and-recreate-database.sh

# Resultado:
✅ BASE DE DATOS CREADA EXITOSAMENTE
   - Schemas: 18
   - Tablas: 124
   - ENUMs: 37
   - Funciones: 181
   - Triggers: 76
```

## Archivos con Triggers Únicos (No Duplicados)

Los siguientes 43 archivos de tabla tienen triggers que NO tienen archivo separado correspondiente. Estos NO causan errores porque son únicos:

- `communication/tables/01-messages.sql`
- `social_features/tables/11-peer_challenges.sql`
- `social_features/tables/12-challenge_participants.sql`
- `educational_content/tables/05-assignments.sql`
- ... (y 39 más)

Estos triggers son válidos y se mantienen en sus archivos de tabla.

## Recomendaciones Futuras

1. **Convención establecida:** Triggers de `updated_at` deben estar en archivos separados (`triggers/*.sql`)
2. **Triggers de negocio:** Mantener en archivos separados para mejor mantenibilidad
3. **Triggers simples inline:** Solo triggers muy simples y únicos pueden permanecer en tablas

---

**Próximo paso:** Las correcciones P0-2 (FK sin ON DELETE) y P0-3 (documentar initialize_user_missions) pueden abordarse según prioridad.
