# INSTRUCCIONES DE DEPLOYMENT - GAMILIT

**Version:** 1.0
**Fecha:** 2025-12-18

---

Este archivo contiene las instrucciones de deployment que el agente ejecuta DESPUES de hacer backup y pull.

**Prerequisitos:**
- Ya ejecutaste backup de BD y configuraciones
- Ya hiciste pull del repositorio
- Los servicios PM2 estan detenidos
- Tienes las variables DB_PASSWORD y DATABASE_URL configuradas

---

## FASE 1: RESTAURAR CONFIGURACIONES

Restaurar los .env de produccion desde el backup:

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit
BACKUP_DIR="/home/gamilit/backups/latest"

# Restaurar .env.production
cp "$BACKUP_DIR/config/.env.production" apps/backend/.env.production 2>/dev/null || echo "WARN: No habia .env.production de backend"
cp "$BACKUP_DIR/config/.env.production" apps/frontend/.env.production 2>/dev/null || echo "WARN: No habia .env.production de frontend"

# Crear symlinks .env -> .env.production
cd apps/backend && ln -sf .env.production .env && cd ../..
cd apps/frontend && ln -sf .env.production .env && cd ../..

# Verificar
echo "=== Configuraciones restauradas ==="
ls -la apps/backend/.env* 2>/dev/null
ls -la apps/frontend/.env* 2>/dev/null
```

---

## FASE 2: RECREAR BASE DE DATOS

La BD se recrea completamente (politica de CARGA LIMPIA):

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database

# Verificar que el script existe
ls -la drop-and-recreate-database.sh

# Ejecutar recreacion completa
# Este script: DROP BD -> CREATE BD -> DDL (16 fases) -> Seeds (38+ archivos)
./drop-and-recreate-database.sh "$DATABASE_URL"
```

**Si el script falla**, alternativas:

```bash
# Opcion A: Si la BD existe pero esta vacia
./create-database.sh

# Opcion B: Si necesitas crear desde cero (usuario no existe)
cd scripts && ./init-database.sh --env prod --password "$DB_PASSWORD"
```

---

## FASE 3: BUILD

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Backend
echo "=== Building Backend ==="
cd apps/backend
npm install
npm run build
cd ../..

# Frontend
echo "=== Building Frontend ==="
cd apps/frontend
npm install
npm run build
cd ../..

echo "=== Build completado ==="
```

---

## FASE 4: INICIAR SERVICIOS

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Guardar configuracion
pm2 save

# Mostrar estado
pm2 list
```

---

## FASE 5: VALIDAR DEPLOYMENT

```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

echo "=== 5.1 Estado de PM2 ==="
pm2 list

echo "=== 5.2 Health del Backend ==="
curl -s http://localhost:3006/api/health | head -20

echo "=== 5.3 Frontend accesible ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3005)
echo "HTTP Status: $HTTP_CODE"

echo "=== 5.4 Validacion de Base de Datos ==="
psql "$DATABASE_URL" -c "SELECT 'tenants' as tabla, COUNT(*) as total FROM auth_management.tenants
UNION ALL SELECT 'users', COUNT(*) FROM auth.users
UNION ALL SELECT 'modules', COUNT(*) FROM educational_content.modules
UNION ALL SELECT 'maya_ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL SELECT 'feature_flags', COUNT(*) FROM system_configuration.feature_flags;"

echo "=== 5.5 Logs recientes ==="
pm2 logs --lines 10 --nostream
```

**Valores esperados:**
- tenants: 14+
- users: 20+
- modules: 5
- maya_ranks: 5
- feature_flags: 26+

---

## ROLLBACK (Si algo falla)

```bash
BACKUP_DIR="/home/gamilit/backups/latest"

# Restaurar BD
echo "=== Restaurando Base de Datos ==="
gunzip -c "$BACKUP_DIR/database/gamilit_*.sql.gz" | psql "$DATABASE_URL"

# Restaurar configs
echo "=== Restaurando Configuraciones ==="
cp "$BACKUP_DIR/config/.env.production" apps/backend/ 2>/dev/null || true
cp "$BACKUP_DIR/config/.env.production" apps/frontend/ 2>/dev/null || true

# Reiniciar servicios
pm2 restart all
pm2 list
```

---

## REPORTE DE ERRORES

Si algo falla, reporta:
1. Numero de FASE donde fallo (1-5)
2. Comando exacto que fallo
3. Mensaje de error completo
4. Output de: `pm2 list` y `pm2 logs --lines 50 --nostream`

---

## INFORMACION ADICIONAL

### Estructura del proyecto

```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/
├── apps/
│   ├── backend/          # NestJS API (puerto 3006, 2 instancias PM2)
│   ├── frontend/         # React App (puerto 3005, 1 instancia PM2)
│   └── database/         # DDL, Seeds, Scripts
├── scripts/              # Scripts de produccion
├── ecosystem.config.js   # Configuracion PM2
└── logs/                 # Logs de aplicacion
```

### Scripts disponibles

| Script | Ubicacion | Proposito |
|--------|-----------|-----------|
| drop-and-recreate-database.sh | apps/database/ | Recrear BD completa |
| create-database.sh | apps/database/ | Solo DDL + Seeds |
| init-database.sh | apps/database/scripts/ | Crear usuario + BD |
| build-production.sh | scripts/ | Solo build |
| deploy-production.sh | scripts/ | Solo deploy PM2 |
| pre-deploy-check.sh | scripts/ | Validacion pre-deploy |
| diagnose-production.sh | scripts/ | Diagnostico del sistema |

### Documentacion adicional

| Archivo | Proposito |
|---------|-----------|
| docs/50-guides/DIRECTIVA-DEPLOYMENT.md | Checklist |
| docs/50-guides/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md | Guia detallada |
| docs/50-guides/GUIA-VALIDACION-PRODUCCION.md | Troubleshooting |
| apps/database/FLUJO-CARGA-LIMPIA.md | Recreacion de BD |

---

*Ultima actualizacion: 2025-12-18 v1.0*
