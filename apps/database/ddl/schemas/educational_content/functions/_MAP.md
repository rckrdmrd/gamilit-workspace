# Educational Content Functions Map

## Overview
This directory contains SQL functions for the educational_content schema, providing personalized learning recommendations and path calculations.

## Files

### calculate_learning_path.sql
- **Function**: `educational_content.calculate_learning_path(p_user_id UUID, p_max_items INTEGER DEFAULT 5)`
- **Description**: Calcula ruta de aprendizaje personalizada basada en progreso del usuario
- **Parameters**:
  - `p_user_id UUID` - User ID
  - `p_max_items INTEGER` - Maximum items to return (default: 5)
- **Returns**: TABLE with columns:
  - `item_type VARCHAR(20)` - Type of item (MODULE or MISSION)
  - `item_id UUID` - ID of the item
  - `item_name VARCHAR(255)` - Name/title of the item
  - `difficulty_level INTEGER` - Difficulty rating
  - `estimated_time_minutes INTEGER` - Time estimate
  - `xp_reward INTEGER` - XP reward
  - `priority_score NUMERIC(5,2)` - Priority for recommendation
- **Source**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/functions/01-calculate_learning_path.sql`
- **Dependencies**: gamification_system.user_stats, user_ranks, educational_content.modules, missions, progress_tracking.module_progress, mission_progress
- **Permissions**: Executed by `authenticated` role

### get_recommended_missions.sql
- **Function**: `educational_content.get_recommended_missions(p_user_id UUID, p_limit INTEGER DEFAULT 3)`
- **Description**: Obtiene misiones recomendadas basadas en nivel y progreso del usuario
- **Parameters**:
  - `p_user_id UUID` - User ID
  - `p_limit INTEGER` - Number of missions to return (default: 3)
- **Returns**: TABLE with columns:
  - `mission_id UUID` - Mission ID
  - `mission_title VARCHAR(255)` - Mission title
  - `difficulty_level INTEGER` - Difficulty rating
  - `xp_reward INTEGER` - XP reward
  - `ml_coins_reward INTEGER` - ML Coins reward
  - `estimated_time_minutes INTEGER` - Time estimate
  - `recommendation_reason TEXT` - Why this mission is recommended
- **Source**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/functions/02-get_recommended_missions.sql`
- **Dependencies**: gamification_system.user_stats, user_ranks, educational_content.missions, progress_tracking.mission_progress
- **Permissions**: Executed by `authenticated` role

## Migration Summary
- **Date Migrated**: 2025-11-02
- **Source Base**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/`
- **Destination Base**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/`
- **Total Functions**: 2
- **Status**: COMPLETED
