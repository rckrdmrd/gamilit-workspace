# SIMCO-DDL-UNIFIED - Sistema Unificado de Gestión de Bases de Datos

**ID:** SIMCO-DDL-UNIFIED
**Versión:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Opus 4.5
**Sistema:** SIMCO v4.0.0

---

## Propósito

Esta directiva define el sistema unificado para gestionar la creación y recreación de bases de datos en WSL para **todos** los proyectos del workspace. Reemplaza y consolida los procedimientos fragmentados anteriores.

---

## Regla Principal

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   UN COMANDO, TODOS LOS PROYECTOS:                                       ║
║                                                                           ║
║   ./scripts/database/unified-recreate-db.sh <proyecto> --drop            ║
║                                                                           ║
║   NO usar scripts individuales de cada proyecto.                         ║
║   NO usar procedimientos manuales "Opción A/B".                          ║
║   SIEMPRE usar el script unificado.                                      ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SISTEMA DDL UNIFICADO                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  WORKSPACE-V2 (Windows)                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  scripts/database/                                                  │ │
│  │  ├── unified-recreate-db.sh    ← SCRIPT MAESTRO                    │ │
│  │  └── templates/                                                     │ │
│  │      └── database.config.template.yml                               │ │
│  │                                                                      │ │
│  │  projects/{proyecto}/                                                │ │
│  │  └── database/                  ← ESTRUCTURA CANÓNICA               │ │
│  │      ├── config/                                                     │ │
│  │      │   └── database.config.yml  ← CONFIGURACIÓN                  │ │
│  │      ├── ddl/                                                        │ │
│  │      │   ├── 00-prerequisites.sql                                   │ │
│  │      │   ├── 01-*.sql                                                │ │
│  │      │   └── 99-post-ddl.sql                                        │ │
│  │      ├── migrations/                                                 │ │
│  │      └── seeds/                                                      │ │
│  │          ├── dev/                                                    │ │
│  │          └── test/                                                   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              │                                           │
│                              │ wsl -d Ubuntu-24.04                       │
│                              ▼                                           │
│  WSL Ubuntu-24.04                                                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL :5432                                                    │ │
│  │  ├── gamilit_platform                                               │ │
│  │  ├── template_saas_dev                                              │ │
│  │  ├── erp_generic                                                     │ │
│  │  ├── michangarrito_dev                                              │ │
│  │  └── ...                                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura Canónica de Proyecto

Todo proyecto con base de datos DEBE seguir esta estructura:

```
projects/{proyecto}/
├── database/                      # Ubicación canónica (OBLIGATORIA)
│   ├── config/
│   │   └── database.config.yml    # Configuración del proyecto
│   ├── ddl/                       # Archivos DDL ordenados
│   │   ├── 00-prerequisites.sql   # Extensiones, schemas base
│   │   ├── 01-{modulo}.sql        # Tablas del módulo
│   │   ├── 02-{modulo}.sql        # ...
│   │   └── 99-post-ddl.sql        # RLS, permisos finales
│   ├── migrations/                # Migraciones incrementales
│   ├── seeds/
│   │   ├── dev/                   # Datos de desarrollo
│   │   └── test/                  # Datos para tests
│   └── scripts/                   # Scripts legacy (DEPRECAR)
│
└── apps/database/                 # (LEGACY - no usar)
    └── → Mover contenido a database/
```

### Orden de Archivos DDL

Los archivos DDL se ejecutan en orden alfabético. Usar prefijos numéricos:

| Prefijo | Propósito | Ejemplo |
|---------|-----------|---------|
| 00- | Prerequisites | 00-prerequisites.sql |
| 01-09 | Core/Auth | 01-auth.sql, 02-users.sql |
| 10-49 | Módulos principales | 10-products.sql, 20-orders.sql |
| 50-89 | Módulos opcionales | 50-analytics.sql |
| 90-98 | Índices, triggers | 90-indexes.sql |
| 99- | Post-DDL | 99-rls-policies.sql |

---

## Archivo database.config.yml

Cada proyecto DEBE tener un archivo `database/config/database.config.yml`:

```yaml
version: "1.0.0"
proyecto: "gamilit"

database:
  name: "gamilit_platform"
  user: "gamilit_user"
  password_env: "DB_PASSWORD"  # NO hardcodear password
  host: "localhost"
  port: 5432

schemas:
  - auth
  - core
  - gamification

extensions:
  - "uuid-ossp"
  - "pgcrypto"

rls:
  enabled: true
  bypass_user: "gamilit_user"

metadata:
  source_of_truth: "@WORKSPACE-INTEGRATION"
```

### Reglas del Config

1. **NO hardcodear passwords** - Usar `password_env` para referenciar variable de entorno
2. **Sincronizar con WORKSPACE-INTEGRATION.yml** - Los valores deben coincidir
3. **Mantener bajo control de versiones** - El archivo SÍ se commitea

---

## Uso del Script Unificado

### Desde Windows PowerShell

```powershell
# Recrear base de datos completa
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop

# Recrear con seeds
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop --seeds

# Solo validar estructura
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --validate-only

# Modo dry-run (ver qué haría sin ejecutar)
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop --dry-run
```

### Desde WSL

```bash
# Dentro de WSL
cd /mnt/c/Empresas/ISEM/workspace-v2
./scripts/database/unified-recreate-db.sh gamilit --drop
```

### Opciones Disponibles

| Opción | Descripción |
|--------|-------------|
| `--drop`, `-d` | Eliminar y recrear BD completa |
| `--seeds`, `-s` | Cargar seeds de desarrollo |
| `--validate-only` | Solo validar, no ejecutar |
| `--dry-run` | Mostrar comandos sin ejecutar |
| `--verbose`, `-v` | Output detallado |
| `--force`, `-f` | No pedir confirmación |

---

## Flujo de Trabajo

### Al Modificar DDL

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Modificar archivo .sql en projects/{proyecto}/database/ddl/ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Ejecutar script unificado:                                   │
│    ./unified-recreate-db.sh {proyecto} --drop                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Verificar que la carga fue exitosa (ver resumen de tablas)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Commit + Push cambios DDL                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Al Crear Proyecto Nuevo

1. Crear estructura `database/` usando template
2. Crear `database/config/database.config.yml`
3. Agregar credenciales a `WORKSPACE-INTEGRATION.yml`
4. Crear usuario PostgreSQL en WSL
5. Probar con script unificado

---

## Proyectos Soportados

| Proyecto | Database | Usuario | Puerto | Estado |
|----------|----------|---------|--------|--------|
| gamilit | gamilit_platform | gamilit_user | 5432 | ✅ Producción |
| template-saas | template_saas_dev | template_saas_user | 5432 | ✅ Producción |
| erp-core | erp_generic | erp_admin | 5432 | ✅ Producción |
| michangarrito | michangarrito_dev | michangarrito_dev | 5432 | ✅ Pre-prod |
| trading-platform | trading_platform | trading_user | 5432 | ⏳ Desarrollo |
| erp-construccion | erp_construccion | erp_user | 5433* | ⏳ Desarrollo |
| erp-clinicas | clinicas_db | clinicas_user | 5437* | ⏳ Desarrollo |
| erp-retail | erp_retail | erp_user | 5432 | ⏳ Desarrollo |
| erp-mecanicas-diesel | erp_mecanicas_diesel | erp_user | 5432 | ⏳ Desarrollo |
| erp-vidrio-templado | erp_vidrio_templado | erp_user | 5432 | ⏳ Desarrollo |

*Puertos no estándar - pendiente estandarización

---

## Integración con Otros Sistemas

### TRIGGER-DDL-RECREAR-BD-WSL

Este trigger ahora SIEMPRE invoca el script unificado:

```markdown
Al detectar cambios en ddl/*.sql:
→ Ejecutar: ./scripts/database/unified-recreate-db.sh {proyecto} --drop
```

### WORKSPACE-INTEGRATION.yml

Fuente de verdad para credenciales. El script unificado lee de aquí cuando no hay `database.config.yml`.

### Coherencia de Capas

Después de recrear BD, verificar que:
- Entities en backend coinciden con tablas DDL
- Tipos TypeScript son compatibles con PostgreSQL

---

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| `Proyecto no encontrado` | Nombre incorrecto | Verificar nombre exacto en `projects/` |
| `DDL no encontrado` | Estructura incorrecta | Verificar que existe `database/ddl/` |
| `PostgreSQL no running` | Servicio caído | `sudo systemctl start postgresql` |
| `Permission denied` | Falta sudo | Verificar password WSL |
| `User does not exist` | Usuario no creado | Script lo crea automáticamente |

---

## Deprecación

### Estructuras a Deprecar

- `apps/database/` → Mover a `database/`
- Scripts individuales en `database/scripts/` → Usar script unificado
- Procedimientos manuales "Opción A/B" → Usar script unificado

### Timeline

- **Fase 1 (Actual):** Script unificado disponible, estructuras legacy soportadas
- **Fase 2 (Próximo):** Migrar todos los proyectos a estructura canónica
- **Fase 3 (Futuro):** Eliminar soporte para estructuras legacy

---

## Referencias

- `@TRIGGER-DDL-RECREAR-BD-WSL` - Trigger que invoca este sistema
- `@WORKSPACE-INTEGRATION` - Fuente de verdad de credenciales
- `@WSL-OPS` - Operaciones en WSL
- `@SIMCO-DDL` - Flujo DDL-First

---

*SIMCO-DDL-UNIFIED v1.0.0 - Sistema SIMCO v4.0.0*
