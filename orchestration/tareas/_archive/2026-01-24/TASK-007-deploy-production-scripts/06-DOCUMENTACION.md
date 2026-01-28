# TASK-007: Documentación

## Resumen de Cambios

### Scripts de DevOps

| Script | Propósito | Ubicación |
|--------|-----------|-----------|
| `backup-production-data.sh` | Backup de datos críticos | `apps/devops/scripts/` |
| `deploy-production.sh` | Deploy a producción con rollback | `apps/devops/scripts/` |

### Directivas SIMCO

| Directiva | Propósito | Ubicación |
|-----------|-----------|-----------|
| `SIMCO-DEPLOY-PRODUCTION.md` | Procedimiento de deploy | `orchestration/directivas/simco/` |

### Documentación Actualizada

| Documento | Cambios |
|-----------|---------|
| `apps/devops/_MAP.md` | Agregados nuevos scripts |
| `orchestration/tareas/_INDEX.yml` | Agregado TASK-007 |

## Uso de Scripts

### Backup de Datos

```bash
# Crear backup antes de deploy
./backup-production-data.sh --env prod

# Listar backups existentes
./backup-production-data.sh --list

# Restaurar desde backup
./backup-production-data.sh --restore backup_20260125_120000.tar.gz
```

### Deploy a Producción

```bash
# Deploy completo (incluye backup automático)
./deploy-production.sh --env prod

# Simular deploy sin ejecutar
./deploy-production.sh --env prod --dry-run

# Deploy sin backup (NO RECOMENDADO)
./deploy-production.sh --env prod --skip-backup

# Rollback manual
./deploy-production.sh --rollback backup_20260125_120000.tar.gz
```

## Configuración CORS

### Estado Actual

CORS ya está configurado en `apps/backend/src/main.ts`:

```typescript
app.enableCors({
  origin: (origin, callback) => {
    // Soporta múltiples orígenes via CORS_ORIGIN
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
});
```

### Producción

En `.env.production`:
```
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com,https://api.gamilit.com
```

### Importante

**nginx NO debe agregar headers CORS** - NestJS los maneja internamente.
Headers duplicados causan errores en el navegador.

## Configuración HTTPS

### Let's Encrypt con Certbot

```bash
# Generar certificado
sudo certbot --nginx -d gamilit.com -d www.gamilit.com -d api.gamilit.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Ubicación de Certificados

```
/etc/letsencrypt/live/gamilit.com/
├── fullchain.pem
├── privkey.pem
└── cert.pem
```

## Configuración nginx

Ver configuración completa en `SIMCO-DEPLOY-PRODUCTION.md`:

- SSL/TLS con Let's Encrypt
- Reverse proxy al backend (puerto 3006)
- Archivos estáticos del frontend
- WebSocket support para /socket.io
- Security headers (HSTS, X-Frame-Options, etc.)

## Referencias

- `orchestration/agents/perfiles/PERFIL-PRODUCTION-MANAGER.md` - Perfil del agente
- `orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md` - Procedimiento completo
- `.github/workflows/deploy-production.yml` - CI/CD Pipeline
- `k8s/` - Configuraciones Kubernetes

## Próximos Pasos Sugeridos

1. **Integrar con CI/CD** - Agregar paso de backup en GitHub Actions
2. **Notificaciones** - Agregar Slack/email al finalizar deploy
3. **Métricas** - Registrar tiempos de deploy
4. **Blue-Green** - Implementar deployment sin downtime

---

**Tarea completada:** 2026-01-25
**Agente:** CLAUDE-CODE
**Commits:** 0f5cad9c, 210a56d0
