# _MAP: apps/devops/

**Última actualización:** 2026-01-25
**Estado:** 🟢 Funcional y completo
**Versión:** 3.0

---

## 📋 Propósito

Scripts de DevOps, deployment, backup y automatización para GAMILIT.
Sistema Constants SSOT (Single Source of Truth) + Production Deployment.

**Audiencia:** DevOps Engineers, Backend Developers, Tech Leads, Production Managers

---

## 🗂️ Estructura

```
devops/
├── backups/                    # Backups de produccion (git-ignored)
├── deployment/                 # Configs de deployment
│   └── deploy-k8s.sh          # Deployment Kubernetes
└── scripts/                    # Scripts de automatización
    ├── deploy.sh                       # Deploy desarrollo/staging
    ├── deploy-production.sh            # Deploy produccion con backup
    ├── backup-production-data.sh       # Backup datos criticos
    ├── sync-enums.ts                   # Sincronizar ENUMs Backend → Frontend
    ├── validate-constants-usage.ts     # Detectar hardcoding (33 patrones)
    └── validate-api-contract.ts        # Validar Backend ↔ Frontend sync
```

---

## 🚀 Scripts Disponibles

### deploy-production.sh (NUEVO)
Deploy seguro a produccion con backup automatico y rollback.

**Uso:**
```bash
./deploy-production.sh --env prod           # Deploy completo
./deploy-production.sh --env prod --dry-run # Simular
./deploy-production.sh --rollback backup.tar.gz  # Rollback
```

**Proceso:**
1. Validar prerequisitos (Node, PM2, PostgreSQL)
2. Ejecutar tests
3. Crear backup de datos criticos
4. Ejecutar migraciones de BD
5. Build de aplicaciones
6. Deploy con PM2
7. Health checks
8. Rollback automatico si falla

---

### backup-production-data.sh (NUEVO)
Backup de datos criticos antes de deploy.

**Uso:**
```bash
./backup-production-data.sh --env prod       # Crear backup
./backup-production-data.sh --list           # Listar backups
./backup-production-data.sh --restore FILE   # Restaurar
```

**Datos respaldados:**
- `auth.users` + `auth_management.profiles`
- `progress_tracking.*` (progreso estudiantes)
- `gamification_system.*` (estadisticas, logros)
- `educational_content.teacher_content`
- `social_features.*` (relaciones)

---

### deploy.sh
Deploy para desarrollo y staging.

**Uso:**
```bash
./deploy.sh --env dev              # Desarrollo
./deploy.sh --env prod --skip-db   # Sin BD
./deploy.sh --env dev --dry-run    # Simular
```

---

### sync-enums.ts
Sincroniza ENUMs de Backend → Frontend automáticamente.

**Uso:**
```bash
npm run sync:enums
```

**Qué hace:**
1. Lee ENUMs de `apps/backend/src/shared/constants/enums.constants.ts`
2. Genera `apps/frontend/src/shared/constants/enums.constants.ts`
3. Mantiene sincronización automática

---

### validate-constants-usage.ts
Detecta hardcoding de constantes (33 patrones).

**Uso:**
```bash
npm run validate:constants
```

**Detecta:**
- Strings hardcodeados de schemas/tablas
- URLs hardcodeadas
- ENUMs no importados
- Magic numbers

**Output:** Reporte de violaciones con ubicación exacta

---

### validate-api-contract.ts
Valida que Backend y Frontend routes coincidan.

**Uso:**
```bash
npm run validate:api-contract
```

**Valida:**
- Endpoints Backend existen en Frontend
- Endpoints Frontend están implementados en Backend
- Contracts API consistentes

---

## 📊 Constants SSOT System

**Implementado:** Fase 0 - Ciclo 5 (2025-11-02)

### Reglas de Oro

1. ❌ NO hardcodear nombres de schemas, tablas, rutas API, ENUMs
2. ✅ SIEMPRE importar desde archivos de constantes
3. ✅ ACTUALIZAR constantes al agregar nuevas entidades
4. ✅ SINCRONIZAR ENUMs Backend ↔ Frontend con script
5. ✅ VALIDAR en CI/CD antes de merge

### Cobertura Actual

| Categoría | Estado | Elementos |
|-----------|--------|-----------|
| **Database Schemas** | ✅ 100% | 8 schemas |
| **Database Tables** | ✅ 100% | 40 tablas |
| **API Routes** | ✅ 100% | 75+ rutas |
| **ENUMs** | ✅ 100% | 25 ENUMs |

---

## 🚨 Issues Conocidos

### P0 (Crítico)

- **P0-001:** ~~Sin Docker configs~~ **PENDIENTE**
  - Faltan Dockerfiles para backend, frontend, database
  - **Esfuerzo:** 4-6 horas

- **P0-002:** ~~Sin CI/CD workflows~~ **COMPLETADO**
  - ✅ GitHub Actions configurado en `.github/workflows/deploy-production.yml`

### P1 (Alto)

- **P1-001:** ~~Sin Kubernetes manifests~~ **COMPLETADO**
  - ✅ Manifests en `k8s/backend/` y `k8s/frontend/`

- **P1-002:** ~~Sin scripts de deployment~~ **COMPLETADO**
  - ✅ `deploy.sh` - Desarrollo/staging
  - ✅ `deploy-production.sh` - Produccion con backup
  - ✅ `backup-production-data.sh` - Backup de datos

---

## 🎯 Próximos Pasos

### Fase 1 - Urgente (Esta Semana)

1. ✅ _MAP.md creado
2. ⬜ Crear Dockerfiles (backend, frontend, database)
3. ⬜ docker-compose.yml para desarrollo
4. ⬜ GitHub Actions básico (lint + test)

**Esfuerzo:** 8-10 horas

### Fase 2 - Alta Prioridad (Próximas 2 Semanas)

5. ⬜ CI/CD completo (build + deploy)
6. ⬜ Scripts de deployment
7. ⬜ Kubernetes manifests básicos
8. ⬜ Configurar PM2

**Esfuerzo:** 12-15 horas

---

## 📚 Documentación

- [README.md (root)](../../README.md#constants-ssot)
- [POLITICA-CONSTANTS-SSOT.md](../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/POLITICA-CONSTANTS-SSOT.md)
- [CONSTANTS-ARCHITECTURE.md](../../docs-analysis/miniworkspace-migration/06-agents/migracion-desarrollo/CONSTANTS-ARCHITECTURE.md)

---

**Generado:** 2025-11-07
**Método:** Sistema SIMCO - Fase 3
**Versión:** 1.0.0
