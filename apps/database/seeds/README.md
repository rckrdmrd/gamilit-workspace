# Seeds - Base de Datos GAMILIT

**Ultima actualizacion:** 2026-01-13

---

## Estructura de Ambientes

```
seeds/
├── dev/          # Desarrollo local (84 archivos)
├── prod/         # Produccion (88 archivos)
├── staging/      # Staging/QA (6 archivos) - INTENCIONALMENTE MINIMO
└── scripts/      # Scripts de carga auxiliares
```

## Estadisticas por Ambiente

| Ambiente | Archivos | Schemas | Proposito |
|----------|----------|---------|-----------|
| dev | 84 | 14 | Desarrollo local con datos de prueba extensos |
| prod | 88 | 14 | Datos iniciales de produccion |
| staging | 6 | 2 | Datos minimos para validacion de pipeline |

---

## Staging: Cobertura Intencional

El ambiente `staging/` contiene **intencionalmente** solo datos minimos:

### Seeds Incluidos (6 archivos)

| Schema | Archivo | Razon |
|--------|---------|-------|
| auth_management | 01-tenants.sql | Tenant de prueba requerido |
| auth_management | 02-auth_providers.sql | Proveedores de autenticacion |
| gamification_system | 01-achievement_categories.sql | Categorias base |
| gamification_system | 02-achievements.sql | Logros de prueba |
| gamification_system | 03-leaderboard_metadata.sql | Config de leaderboards |
| gamification_system | 04-maya_ranks.sql | 7 rangos Maya |

### Seeds Omitidos Intencionalmente

Los siguientes schemas NO tienen seeds en staging por diseno:

| Schema | Razon de Omision |
|--------|------------------|
| educational_content | Contenido educativo se carga dinamicamente en staging |
| progress_tracking | No requiere datos pre-existentes |
| social_features | Generados por actividad de usuarios |
| notifications | Generadas por eventos del sistema |
| admin_dashboard | Configuraciones por defecto suficientes |
| audit_logging | Logs se generan automaticamente |
| communication | Sin mensajes pre-existentes necesarios |
| content_management | CMS vacio por defecto |
| lti_integration | Configurado manualmente en staging |
| system_configuration | Usa defaults de DDL |

### Justificacion Arquitectonica

1. **Pipeline de Validacion**: Staging solo necesita verificar que el pipeline DDL + seeds ejecuta sin errores
2. **Datos Reales**: En staging se prefieren datos generados por pruebas reales vs datos sinteticos
3. **Rendimiento**: Menos seeds = despliegue mas rapido para CI/CD
4. **Aislamiento**: Cada tester genera sus propios datos de prueba

---

## Seeds de Produccion

### Schemas con Seeds (14 carpetas)

```
prod/
├── _testing/               # Utilidades de testing
├── admin_dashboard/        # Configuracion de dashboard
├── audit_logging/          # Categorias de auditoria
├── auth/                   # Datos de auth (Supabase)
├── auth_management/        # Tenants, roles, providers
├── communication/          # Templates de mensajes
├── content_management/     # CMS inicial
├── educational_content/    # 5 modulos, ejercicios, rubricas
├── gamification_system/    # Logros, rangos, shop items
├── lti_integration/        # Configuracion LTI
├── notifications/          # Templates de notificaciones
├── progress_tracking/      # Configuracion inicial
├── social_features/        # Configuracion social
└── system_configuration/   # Feature flags, settings
```

### Seeds Criticos de Produccion

Estos seeds son **requeridos** para funcionamiento basico:

| Prioridad | Schema | Archivo | Descripcion |
|-----------|--------|---------|-------------|
| P0 | auth_management | 01-tenants.sql | Tenant principal |
| P0 | auth_management | 02-auth_providers.sql | Proveedores auth |
| P0 | gamification_system | 04-maya_ranks.sql | 7 rangos Maya |
| P0 | educational_content | 01-modules.sql | 5 modulos educativos |
| P1 | gamification_system | 01-achievement_categories.sql | Categorias de logros |
| P1 | educational_content | difficulty_criteria.sql | Niveles CEFR |

---

## Orden de Ejecucion

El script `create-database.sh` ejecuta seeds en orden especifico para respetar dependencias FK:

### FASE 3: Seeds (orden actual)

1. **auth_management/** - Tenants, providers, roles
2. **system_configuration/** - Feature flags, settings
3. **gamification_system/** - Rangos, logros, shop
4. **educational_content/** - Modulos, ejercicios
5. **progress_tracking/** - Configuracion tracking
6. **notifications/** - Templates
7. **communication/** - Templates mensajes
8. **social_features/** - Configuracion social
9. **admin_dashboard/** - Dashboard config
10. **audit_logging/** - Categorias auditoria

---

## Seeds con Dependencias Criticas

### UUIDs Referenciados

Algunos seeds usan UUIDs especificos que deben existir:

| Seed | Depende de | UUID/Referencia |
|------|------------|-----------------|
| exercises | modules | module_id (5 modulos) |
| user_stats | profiles | user_id (FK cascade) |
| missions | profiles | user_id (FK cascade) |
| achievements | achievement_categories | category_id |

### Tablas Autocontenidas (sin dependencias)

- `maya_ranks` - Definiciones estaticas
- `achievement_categories` - Categorias independientes
- `leaderboard_metadata` - Config independiente
- `difficulty_criteria` - Niveles CEFR

---

## Archivos _deprecated y _backlog

### _deprecated/
Seeds que fueron reemplazados o ya no se usan:

- `prod/auth_management/_deprecated/` - Seeds de auth anterior
- `prod/educational_content/_deprecated/` - Ejercicios antiguos

### _backlog/
Seeds pendientes de revision o activacion:

- `dev/educational_content/_backlog/` - Ejercicios en desarrollo
- `prod/educational_content/_backlog/` - Contenido pendiente QA

---

## Scripts Auxiliares

| Script | Proposito |
|--------|-----------|
| `LOAD-SEEDS-auth_management.sh` | Carga manual de auth seeds |
| `LOAD-SEEDS-gamification_system.sh` | Carga manual de gamification seeds |
| `load-users-and-profiles.sh` | Crea usuarios de prueba |

---

## Notas de Mantenimiento

1. **Agregar nuevo seed**: Crear en `prod/` primero, luego copiar a `dev/` si es necesario
2. **Staging**: Solo agregar seeds si son absolutamente necesarios para CI/CD
3. **Dependencias**: Verificar FKs antes de agregar seeds con referencias
4. **Testing**: Los seeds en `_testing/` son para tests automatizados

---

**Referencias:**
- AUDITORIA-DATABASE-2026-01-13.md (ALTO-002)
- create-database.sh (FASE 3)
