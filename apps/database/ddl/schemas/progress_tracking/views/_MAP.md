# Progress Tracking Views Map

## Overview
This directory contains SQL views for the progress_tracking schema, providing user progress analytics and gamification statistics.

## Files

### user_progress_summary.sql
- **View**: `progress_tracking.user_progress_summary`
- **Description**: Vista resumen del progreso del usuario, consolidando estadísticas de gamificación
- **Type**: Normal View (with DROP IF EXISTS CASCADE)
- **Purpose**: Proporciona un resumen completo de las métricas de progreso de cada usuario
- **Columns**:
  - `user_id` - User ID
  - `level` - Current level
  - `total_xp` - Total XP earned
  - `ml_coins` - ML Coins balance
  - `streak_days` - Current streak (alias for current_streak)
  - `current_streak` - Current streak count
  - `max_streak` - Maximum streak reached
  - `exercises_completed` - Number of completed exercises
  - `modules_completed` - Number of completed modules
  - `achievements_earned` - Number of achievements earned
  - `total_time_spent` - Total learning time
  - `last_activity_at` - Last activity timestamp
  - `created_at` - Account creation date
  - `updated_at` - Last update timestamp
- **Source**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/views/01-user_progress_summary.sql`
- **Based On**: gamification_system.user_stats table
- **Dependencies**: gamification_system schema

## Migration Summary
- **Date Migrated**: 2025-11-02
- **Source Base**: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/`
- **Destination Base**: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/`
- **Total Views**: 1
- **Status**: COMPLETED
