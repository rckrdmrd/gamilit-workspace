# ANALISIS FASE 1: PLANEACION Y DIAGNOSTICO DE SINCRONIZACION

**Fecha:** 2025-12-18
**Agente:** Requirements-Analyst
**Proyecto:** GAMILIT
**Estado:** COMPLETADO

---

## RESUMEN EJECUTIVO

Se ha realizado un analisis exhaustivo de los dos workspaces de GAMILIT para identificar las diferencias criticas que causan problemas entre desarrollo y produccion, especialmente en la carga de base de datos.

### Workspaces Analizados

| Workspace | Ruta | Proposito | Remote |
|-----------|------|-----------|--------|
| **NUEVO** | `/home/isem/workspace/projects/gamilit/` | Desarrollo activo | Gitea local |
| **VIEJO** | `/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/` | Produccion (74.208.126.102) | GitHub |

---

## 1. HALLAZGOS CRITICOS

### 1.1 Scripts de Base de Datos FALTANTES en Workspace Nuevo

| Script | Tamano | Criticidad | Funcion |
|--------|--------|------------|---------|
| `init-database.sh` | 37 KB | **CRITICA** | Inicializacion completa con seeds ordenados |
| `init-database-v3.sh` | 36 KB | **CRITICA** | Version con dotenv-vault |
| `recreate-database.sh` | 9 KB | **CRITICA** | Drop usuario + BD + recrear |
| `reset-database.sh` | 15 KB | **CRITICA** | Drop BD manteniendo usuario |
| `cleanup-duplicados.sh` | 12 KB | ALTA | Eliminar archivos duplicados |
| `fix-duplicate-triggers.sh` | 4 KB | ALTA | Corregir triggers duplicados |
| `load-users-and-profiles.sh` | 6 KB | ALTA | Cargar usuarios especificos |
| `verify-users.sh` | 4 KB | MEDIA | Validar usuarios creados |
| `verify-missions-status.sh` | 4 KB | MEDIA | Validar estado misiones |

**IMPACTO:** Sin estos scripts, el workspace nuevo NO puede recrear la base de datos automaticamente desde cero.

### 1.2 Configuracion por Ambiente FALTANTE

**Workspace Viejo tiene:**
```
apps/database/scripts/config/
├── dev.conf      # Config desarrollo
├── prod.conf     # Config produccion
└── staging.conf  # Config staging
```

**Workspace Nuevo:** NO EXISTE este directorio

**IMPACTO:** No hay forma de variar configuracion de BD por ambiente automaticamente.

### 1.3 Diferencias en .env de Base de Datos

| Aspecto | Workspace Viejo | Workspace Nuevo |
|---------|-----------------|-----------------|
| `.env.database` | Existe (config global BD) | NO EXISTE |
| `.env.dev` | Existe (passwords dev) | NO EXISTE |
| Separacion por ambiente | Si (4 archivos .env) | No (solo .env) |
| dotenv-vault | Implementado | NO implementado |

### 1.4 Scripts de Produccion FALTANTES en Root

**Workspace Nuevo tiene (en `/scripts/`):**
- `update-production.sh` (existe)
- `diagnose-production.sh` (existe)

**Workspace Viejo tiene ADICIONAL:**
- `repair-missing-data.sh`
- `build-production.sh`
- `deploy-production.sh`
- `pre-deploy-check.sh`
- `migrate-missing-objects.sh`

---

## 2. ARQUITECTURA DE DESPLIEGUE

### 2.1 Servidor de Produccion

| Componente | Configuracion |
|------------|---------------|
| IP | 74.208.126.102 |
| Backend | Puerto 3006 (2 instancias cluster PM2) |
| Frontend | Puerto 3005 (1 instancia PM2) |
| PostgreSQL | Puerto 5432, BD `gamilit_platform` |
| Usuario BD | `gamilit_user` |
| Gestor Procesos | PM2 |
| Reverse Proxy | Nginx (puertos 80/443) |
| SSL | Let's Encrypt (certbot) |

### 2.2 Flujo de Deployment Actual

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DEPLOYMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WORKSPACE NUEVO                    WORKSPACE VIEJO             │
│  (Desarrollo)                       (Produccion)                │
│                                                                 │
│  ┌─────────────┐                   ┌─────────────┐              │
│  │ Desarrollo  │ ──── Sync ────▶   │   Commit    │              │
│  │ de Features │                   │   + Push    │              │
│  └─────────────┘                   └──────┬──────┘              │
│                                           │                     │
│                                           ▼                     │
│                                    ┌─────────────┐              │
│                                    │   GitHub    │              │
│                                    │   Remote    │              │
│                                    └──────┬──────┘              │
│                                           │                     │
│                    SERVIDOR PRODUCCION    │                     │
│                    (74.208.126.102)       │                     │
│                           ┌───────────────┘                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AGENTE PRODUCCION:                                       │   │
│  │ 1. Backup configs (.env)                                 │   │
│  │ 2. pm2 stop all                                          │   │
│  │ 3. git pull (fuente de verdad)                           │   │
│  │ 4. Cargar directivas del repo                            │   │
│  │ 5. Restaurar configs                                     │   │
│  │ 6. Recrear BD desde DDL+Seeds                            │   │
│  │ 7. npm install && npm run build                          │   │
│  │ 8. pm2 start ecosystem.config.js                         │   │
│  │ 9. Validar deployment                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Directivas del Agente de Produccion

El agente de produccion sigue estas directivas (archivo `PROMPT-AGENTE-PRODUCCION.md`):

1. **Backup solo configuraciones** - La BD se recrea desde el repo
2. **Repo es fuente de verdad** - Todo viene del remoto
3. **Directivas en el repo** - Despues del pull, leer docs/
4. **Backups en `../backups/`** - Rutas relativas

---

## 3. PROBLEMA PRINCIPAL IDENTIFICADO

### 3.1 El Problema de Carga de Base de Datos

**Sintoma:** La base de datos funciona en dev pero falla en produccion.

**Causa Raiz:** El workspace nuevo (que se sincroniza a produccion) carece de los scripts de inicializacion de BD.

**Evidencia:**
- Workspace viejo: 13 scripts de BD
- Workspace nuevo: 3 scripts de BD
- Script principal `init-database.sh` NO EXISTE en nuevo

### 3.2 Flujo de Inicializacion Requerido

```bash
# Workspace VIEJO (FUNCIONA):
./apps/database/scripts/init-database.sh --env prod
# - Lee config de scripts/config/prod.conf
# - Ejecuta 38 seeds en orden especifico
# - Valida integridad post-carga

# Workspace NUEVO (FALLA):
./apps/database/scripts/drop-and-recreate-database.sh
# - No tiene config por ambiente
# - Llama a create-database.sh que NO EXISTE
# - No tiene orden de seeds garantizado
```

---

## 4. COMPONENTES A SINCRONIZAR

### 4.1 Archivos CRITICOS (Deben copiarse del viejo al nuevo)

```
apps/database/scripts/
├── init-database.sh              # 37 KB - CRITICO
├── init-database-v3.sh           # 36 KB - CRITICO
├── recreate-database.sh          # 9 KB - CRITICO
├── reset-database.sh             # 15 KB - CRITICO
├── config/
│   ├── dev.conf                  # CRITICO
│   ├── prod.conf                 # CRITICO
│   └── staging.conf              # CRITICO
├── cleanup-duplicados.sh         # 12 KB - IMPORTANTE
├── fix-duplicate-triggers.sh     # 4 KB - IMPORTANTE
├── load-users-and-profiles.sh    # 6 KB - IMPORTANTE
├── verify-users.sh               # 4 KB - IMPORTANTE
└── verify-missions-status.sh     # 4 KB - IMPORTANTE
```

### 4.2 Scripts de Produccion a Sincronizar

```
scripts/
├── repair-missing-data.sh        # IMPORTANTE
├── build-production.sh           # IMPORTANTE
├── deploy-production.sh          # IMPORTANTE
├── pre-deploy-check.sh           # IMPORTANTE
└── migrate-missing-objects.sh    # IMPORTANTE
```

### 4.3 Documentacion a Sincronizar

```
docs/95-guias-desarrollo/
├── DIRECTIVA-DEPLOYMENT.md       # CRITICO (referenciado por agente)
├── GUIA-SSL-AUTOFIRMADO.md       # CRITICO (referenciado por agente)
├── GUIA-CREAR-BASE-DATOS.md      # CRITICO (referenciado por agente)
├── GUIA-CORS-PRODUCCION.md       # IMPORTANTE
├── GUIA-VALIDACION-PRODUCCION.md # IMPORTANTE
└── GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md # IMPORTANTE
```

### 4.4 Archivos de Configuracion

```
PROMPT-AGENTE-PRODUCCION.md       # Solo en viejo - COPIAR al nuevo
apps/database/.env.database       # Solo en viejo - CREAR en nuevo
apps/database/.env.dev            # Solo en viejo - CREAR en nuevo
```

---

## 5. CONFIGURACION SSL/HTTPS Y CORS

### 5.1 Arquitectura SSL

```
                    INTERNET
                        │
                        ▼
              ┌─────────────────┐
              │   Nginx :443    │  ← SSL/HTTPS (Let's Encrypt)
              │ (Reverse Proxy) │
              └────────┬────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
Backend :3006 (HTTP)        Frontend :3005 (HTTP)
   (interno)                   (interno)
```

### 5.2 Configuracion CORS Actual

**Backend `.env.production`:**
```bash
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102
ENABLE_CORS=true
```

**Frontend `.env.production`:**
```bash
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=https
VITE_WS_PROTOCOL=wss
```

### 5.3 Regla Critica CORS

- NestJS maneja CORS internamente (en `main.ts`)
- Nginx NO debe agregar headers CORS
- Evitar duplicacion de headers Access-Control-*

---

## 6. PLAN DE ACCION PROPUESTO

### FASE 2: Ejecucion del Analisis

1. Comparar archivo por archivo los scripts de BD
2. Verificar diferencias en seeds entre workspaces
3. Validar configuraciones .env
4. Identificar dependencias faltantes

### FASE 3: Planeacion de Implementaciones

1. Crear lista de archivos a copiar
2. Definir orden de sincronizacion
3. Establecer checklist de validacion
4. Documentar rollback si falla

### FASE 4: Validacion de Planeacion

1. Verificar que no falten objetos dependientes
2. Validar que todos los imports/referencias existan
3. Confirmar compatibilidad de versiones
4. Revisar impacto en otros componentes

### FASE 5: Ejecucion

1. Sincronizar scripts de BD
2. Sincronizar configuraciones
3. Sincronizar documentacion
4. Probar en dev antes de push a produccion
5. Commit y push al repositorio
6. Validar deployment en servidor

---

## 7. RIESGOS IDENTIFICADOS

| Riesgo | Severidad | Probabilidad | Mitigacion |
|--------|-----------|--------------|------------|
| Scripts de BD incompatibles | ALTA | MEDIA | Probar en dev primero |
| Passwords diferentes por ambiente | ALTA | ALTA | No sincronizar .env, solo .env.example |
| Seeds desactualizados | MEDIA | MEDIA | Comparar checksums |
| Conflictos de merge en git | MEDIA | BAJA | Sync manual, no merge |
| Documentacion desactualizada | BAJA | ALTA | Actualizar referencias |

---

## 8. PROXIMOS PASOS INMEDIATOS

1. **Obtener aprobacion** de este plan de analisis
2. **Proceder con FASE 2** - Analisis detallado archivo por archivo
3. **Generar lista exacta** de archivos a sincronizar
4. **Crear scripts de sincronizacion** automatizados
5. **Probar en ambiente dev** antes de tocar produccion

---

## 9. DEPENDENCIAS IDENTIFICADAS

### Dependencias de Codigo

```yaml
Scripts BD:
  init-database.sh:
    - depends_on: config/*.conf
    - depends_on: ddl/*.sql
    - depends_on: seeds/prod/*.sql

  recreate-database.sh:
    - depends_on: init-database.sh
    - depends_on: reset-database.sh

  update-production.sh:
    - depends_on: diagnose-production.sh
    - depends_on: repair-missing-data.sh
```

### Dependencias de Documentacion

```yaml
PROMPT-AGENTE-PRODUCCION.md:
  - references: docs/95-guias-desarrollo/DIRECTIVA-DEPLOYMENT.md
  - references: docs/95-guias-desarrollo/GUIA-SSL-AUTOFIRMADO.md
  - references: docs/95-guias-desarrollo/GUIA-CREAR-BASE-DATOS.md

DIRECTIVA-SINCRONIZACION-WORKSPACES.md:
  - references: scripts/update-production.sh
  - references: apps/database/scripts/
```

---

**Estado:** FASE 1 COMPLETADA
**Siguiente:** Aprobacion para continuar con FASE 2
**Mantenedor:** Requirements-Analyst
