# ACTUALIZACION DE PRODUCCION - GAMILIT

**LEER ESTE ARCHIVO DESPUES DE HACER `git pull`**

---

## PARA EL AGENTE: USA EL PROMPT CORRECTO

Si eres un agente de IA ejecutando este deployment, usa el prompt definido en:
```
PROMPT-AGENTE-PRODUCCION.md
```

Y sigue la guia completa en:
```
docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md
```

---

## INSTRUCCIONES RAPIDAS (Para humanos)

```bash
# 1. Configurar password de base de datos
export DB_PASSWORD="tu_password"

# 2. Hacer scripts ejecutables
chmod +x scripts/*.sh

# 3. Ejecutar actualizacion completa
./scripts/update-production.sh
```

---

## PROCEDIMIENTO ESTANDAR RESUMIDO

### 1. BACKUP (OBLIGATORIO)
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/gamilit/backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"/{database,config,logs}

# Backup BD
PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U gamilit_user -d gamilit_platform | gzip > "$BACKUP_DIR/database/gamilit_$TIMESTAMP.sql.gz"

# Backup configs
cp apps/backend/.env.production "$BACKUP_DIR/config/"
cp apps/frontend/.env.production "$BACKUP_DIR/config/"
cp ecosystem.config.js "$BACKUP_DIR/config/"
```

### 2. DETENER Y ACTUALIZAR
```bash
pm2 stop all
git reset --hard origin/main
```

### 3. RESTAURAR Y RECREAR
```bash
# Restaurar configs
cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production

# Recrear BD
cd apps/database && ./create-database.sh && cd ../..
```

### 4. BUILD Y DEPLOY
```bash
cd apps/backend && npm install && npm run build && cd ../..
cd apps/frontend && npm install && npm run build && cd ../..
pm2 start ecosystem.config.js --env production
pm2 save
```

### 5. VALIDAR
```bash
./scripts/diagnose-production.sh
```

---

## ESTRUCTURA DE BACKUPS

```
/home/gamilit/backups/
├── YYYYMMDD_HHMMSS/
│   ├── database/gamilit_TIMESTAMP.sql.gz
│   ├── config/
│   │   ├── backend.env.production
│   │   └── frontend.env.production
│   └── logs/
└── latest -> ultimo_backup/
```

---

## SI ALGO FALLA

### Diagnostico rapido
```bash
./scripts/diagnose-production.sh
```

### Rollback desde backup
```bash
pm2 stop all

# Restaurar BD
LATEST="/home/gamilit/backups/latest"
gunzip -c "$LATEST/database/gamilit_*.sql.gz" | PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform

# Restaurar configs
cp "$LATEST/config/"*.env.production apps/backend/
cp "$LATEST/config/"*.env.production apps/frontend/

# Rebuild y reiniciar
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..
pm2 start ecosystem.config.js
```

---

## DOCUMENTACION COMPLETA

| Documento | Proposito |
|-----------|-----------|
| `PROMPT-AGENTE-PRODUCCION.md` | Prompts para usar con agentes de IA |
| `docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md` | Guia completa paso a paso |
| `docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md` | Troubleshooting |

---

## COMANDOS PM2

```bash
pm2 list              # Ver procesos
pm2 logs              # Ver logs
pm2 logs --lines 50   # Ultimas 50 lineas
pm2 restart all       # Reiniciar todo
pm2 monit             # Monitor en tiempo real
```

---

## INFORMACION DEL SERVIDOR

| Aspecto | Valor |
|---------|-------|
| IP | 74.208.126.102 |
| Backend | Puerto 3006 |
| Frontend | Puerto 3005 |
| Database | PostgreSQL :5432, gamilit_platform |
| Backups | /home/gamilit/backups/ |

---

**Fecha:** 2025-12-18
**Version:** 2.0
