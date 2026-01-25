# TASK-007: Ejecución

## Archivos Creados

### 1. backup-production-data.sh

**Ubicación:** `apps/devops/scripts/backup-production-data.sh`
**Líneas:** ~420

**Funcionalidad:**
- Backup de datos críticos antes de deploy
- Restauración desde backup
- Listado de backups existentes

**Datos respaldados:**

| Directorio | Contenido |
|------------|-----------|
| `01-users/` | auth.users, profiles, user_preferences, user_roles |
| `02-progress/` | progress_tracking.* (schema completo) |
| `03-gamification/` | user_stats, user_achievements, user_ranks, ml_coins_transactions |
| `04-teacher-content/` | teacher_content, published_teacher_content |
| `05-social/` | friendships, classroom_members, team_members |

**Uso:**
```bash
./backup-production-data.sh --env prod           # Crear backup
./backup-production-data.sh --list               # Listar backups
./backup-production-data.sh --restore FILE.tar.gz # Restaurar
```

### 2. deploy-production.sh

**Ubicación:** `apps/devops/scripts/deploy-production.sh`
**Líneas:** ~520

**Funcionalidad:**
- Deploy completo a producción
- Backup automático antes de deploy
- Rollback automático en caso de fallo
- Health checks post-deploy

**Proceso de 7 pasos:**
1. Validar prerequisitos (Node, PM2, PostgreSQL)
2. Ejecutar tests (opcional)
3. Crear backup de datos críticos
4. Ejecutar migraciones de BD
5. Build de aplicaciones
6. Deploy con PM2
7. Health checks

**Uso:**
```bash
./deploy-production.sh --env prod           # Deploy completo
./deploy-production.sh --env prod --dry-run # Simular
./deploy-production.sh --rollback FILE      # Rollback manual
```

### 3. SIMCO-DEPLOY-PRODUCTION.md

**Ubicación:** `orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md`
**Líneas:** ~280

**Contenido:**
- Prerequisitos obligatorios
- Procedimiento de deploy paso a paso
- Configuración CORS documentada
- Configuración nginx para producción
- Procedimiento de rollback
- Checklist de deploy

### 4. Directorio de Backups

**Ubicación:** `apps/devops/backups/`

**Archivos:**
- `.gitkeep` - Mantener directorio
- `.gitignore` - Ignorar archivos de backup (*.tar.gz, *.sql)

## Archivos Modificados

### 1. apps/devops/_MAP.md

**Cambios:**
- Actualizada versión a 3.0
- Estado cambiado a "Funcional y completo"
- Agregada estructura de backups/
- Documentados nuevos scripts
- Actualizados issues conocidos (P1-002 completado)

### 2. orchestration/tareas/_INDEX.yml

**Cambios:**
- Agregado TASK-007 al historial
- Actualizado total_tareas: 7
- Commit hash: 0f5cad9c

## Commits Realizados

| Hash | Mensaje | Archivos |
|------|---------|----------|
| `0f5cad9c` | [TASK-007] feat: Add production deployment scripts with data backup | 7 |
| `210a56d0` | chore: Update TASK-007 commit hash in _INDEX.yml | 1 |

## Validaciones

- [x] Scripts creados con sintaxis bash correcta
- [x] Directiva SIMCO con formato estándar
- [x] Documentación CORS completa
- [x] Configuración nginx documentada
- [x] Commit y push exitosos
