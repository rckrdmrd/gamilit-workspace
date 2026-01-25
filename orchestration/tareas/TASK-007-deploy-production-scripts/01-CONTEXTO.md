# TASK-007: Contexto

## Solicitud Original

El usuario solicitó:

1. **Perfil de deploy para producción** en orchestration
2. **Validar configuración CORS** para evitar conflictos en producción
3. **Certificado HTTPS** para producción
4. **Backup de usuarios y progreso de estudiantes**
5. **Migración de datos** a nuevas definiciones de BD
6. **Commit y push** de cambios de BD

## Análisis del Estado Actual

### Perfil de Producción Existente

Se encontró `PERFIL-PRODUCTION-MANAGER.md` en:
- `orchestration/agents/perfiles/PERFIL-PRODUCTION-MANAGER.md`

El perfil incluye:
- Gestión PM2 (start, stop, restart, reload)
- Gestión nginx (reverse proxy, SSL)
- Gestión SSL (certbot, renovación)
- Comandos de backup PostgreSQL

### Configuración CORS

Ubicación: `apps/backend/src/main.ts`

```typescript
const corsOrigin = configService.get<string>('app.corsOrigin') || 'http://localhost:3005,http://localhost:3006';
const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
});
```

**Estado:** Ya configurado correctamente para múltiples orígenes.

### Configuración HTTPS

Ubicación: `k8s/backend/ingress.yaml`

```yaml
annotations:
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
  nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - api.gamilit.com
      secretName: gamilit-backend-tls
```

**Estado:** Configurado para Kubernetes con Let's Encrypt.

### Scripts de Deploy Existentes

- `apps/devops/scripts/deploy.sh` - Deploy desarrollo/staging
- `.github/workflows/deploy-production.yml` - CI/CD pipeline
- `apps/devops/deployment/deploy-k8s.sh` - Kubernetes deployment

### Gaps Identificados

1. **Sin script de backup de datos críticos**
2. **Sin script de deploy con rollback automático**
3. **Sin directiva SIMCO de procedimiento de producción**
4. **Sin documentación de nginx para producción standalone**

## Decisión

Crear scripts especializados para:
1. Backup de datos críticos (usuarios, progreso, gamificación)
2. Deploy a producción con backup automático y rollback
3. Directiva SIMCO documentando el procedimiento completo
