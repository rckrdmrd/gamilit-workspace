# Procedimiento de Creacion y Recreacion de Base de Datos

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Version:** 1.5
**Fecha:** 2025-12-26
**Estado:** Produccion Ready

---

## Resumen Ejecutivo

Este documento describe el procedimiento oficial para crear o recrear la base de datos de GAMILIT.

**IMPORTANTE:** Siempre usar los scripts oficiales. NO ejecutar archivos SQL manualmente.

---

## Scripts Disponibles

| Script | Proposito | Cuando Usar |
|--------|-----------|-------------|
| `init-database.sh` | Crear BD desde cero | Primera instalacion o recreacion |
| `recreate-database.sh` | Eliminar y recrear todo | Reset completo (dev) |
| `reset-database.sh` | Reset BD manteniendo usuario | Limpiar datos sin cambiar credenciales |

**Ubicacion:** `/apps/database/scripts/`

---

## Procedimiento para DEV

### Requisitos Previos

- PostgreSQL 12+ instalado y corriendo
- Acceso sudo (password: `2320` para entorno dev local)
- Usuario con permisos de ejecucion en scripts

### Comando de Ejecucion

```bash
cd /home/isem/workspace/projects/gamilit/apps/database/scripts

# Opcion 1: Con sudo (recomendado para dev)
sudo ./init-database.sh --env dev --password "C5hq7253pdVyVKUC" --force

# Opcion 2: Sin sudo (si ya tienes credenciales sudo en cache)
./init-database.sh --env dev --password "C5hq7253pdVyVKUC" --force
```

### Pasos que Ejecuta el Script (v3.6)

1. Crea usuario `gamilit_user` (si no existe)
2. Genera/actualiza password de BD
3. Crea base de datos `gamilit_platform`
4. Ejecuta prerequisites (ENUMs, funciones base)
5. Crea 16 schemas (incluye communication, lti_integration, notifications)
6. **Carga 19 ENUMs adicionales** (difficulty_level, exercise_mechanic, etc.) - v3.4
7. Crea 114+ tablas (modules, exercises, module_progress incluidas)
8. Ejecuta 162 funciones
9. Configura 93 triggers
10. Crea 14 views
11. Aplica permisos RLS
12. Carga seeds de desarrollo (36 archivos)
13. **Post-seeds: Sincroniza profiles y user_stats** (v3.2)
14. Valida instalacion
15. Actualiza archivos .env

### Verificacion Post-Ejecucion

```bash
export PGPASSWORD="C5hq7253pdVyVKUC"
psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT 'Schemas' as tipo, count(*)::text FROM pg_namespace WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
UNION ALL SELECT 'Tablas', count(*)::text FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
UNION ALL SELECT 'Funciones', count(*)::text FROM pg_proc WHERE pronamespace NOT IN (SELECT oid FROM pg_namespace WHERE nspname IN ('pg_catalog', 'information_schema'))
UNION ALL SELECT 'Users', count(*)::text FROM auth.users
UNION ALL SELECT 'Profiles', count(*)::text FROM auth_management.profiles;
"
```

**Resultado esperado:**
| Tipo | Cantidad |
|------|----------|
| Schemas | ~16 |
| Tablas | 114+ |
| Funciones | 162+ |
| Users | 48+ |
| Profiles | 48+ |
| Modules | 5 |
| Exercises | 23+ |

---

## Procedimiento para PRODUCCION

### Requisitos Previos

- Acceso SSH al servidor de produccion
- Permisos sudo (sin password requerido en prod)
- Backup de datos existentes (si aplica)

### Comando de Ejecucion

```bash
cd /path/to/gamilit/apps/database/scripts

# En produccion, sudo no requiere password
./init-database.sh --env prod --password "<PASSWORD_SEGURO>" --force
```

### Consideraciones de Produccion

1. **Siempre hacer backup antes de recrear**
2. **Coordinar ventana de mantenimiento**
3. **Notificar a usuarios afectados**
4. **Verificar que no hay conexiones activas**

---

## Troubleshooting

### Error: "Permission denied" al leer archivos

**Causa:** El usuario postgres no puede leer archivos del directorio home.

**Solucion:** Este bug fue corregido en v3.1. Si persiste, ejecutar con sudo:
```bash
sudo ./init-database.sh --env dev --password "PASSWORD" --force
```

### Error: "psql: command not found"

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### Error: "No se puede conectar a PostgreSQL"

```bash
# Verificar que PostgreSQL esta corriendo
sudo systemctl status postgresql

# Iniciar si no esta corriendo
sudo systemctl start postgresql
```

### Error: Enum type mismatch

**Causa:** Prerequisites no se ejecutaron correctamente.

**Solucion:** El script init-database.sh v3.1 ejecuta prerequisites automaticamente. Si persiste:
```bash
export PGPASSWORD="PASSWORD"
psql -h localhost -U gamilit_user -d gamilit_platform -f /path/to/ddl/00-prerequisites.sql
```

---

## Estructura de Objetos Creados

### Schemas (16)

| Schema | Proposito | Tablas |
|--------|-----------|--------|
| auth | Autenticacion Supabase | 1 |
| auth_management | Perfiles y roles | 15 |
| admin_dashboard | Vistas administrativas | 2 |
| system_configuration | Configuracion sistema | 9 |
| gamification_system | Sistema de gamificacion | 14 |
| gamilit | Funciones globales | 0 (solo funciones) |
| educational_content | Contenido educativo | 11 |
| content_management | Gestion de contenido | 5 |
| communication | Mensajeria maestro-estudiante | 1 |
| social_features | Funciones sociales | 15 |
| progress_tracking | Seguimiento progreso | 12 |
| audit_logging | Logs de auditoria | 7 |
| storage | Almacenamiento | 0 (solo enums) |
| public | Sistema PostgreSQL | - |
| lti_integration | Integracion LTI | 3 |
| notifications | Notificaciones | 6 |

### Conteo Total de Objetos

| Tipo | Cantidad |
|------|----------|
| Schemas | 16 |
| Tablas | 114+ |
| Funciones | 162 |
| Triggers | 93 |
| Views | 14 |
| Indices | 757 |
| RLS Policies | 162 |

---

## Referencias

- **Documentacion de scripts:** `apps/database/scripts/README.md`
- **DDL completo:** `apps/database/ddl/`
- **Seeds:** `apps/database/seeds/dev/` y `apps/database/seeds/prod/`
- **Inventario de BD:** `docs/90-transversal/inventarios-database/`

---

## Changelog

### v1.5 (2025-12-26)
- Script actualizado a v3.7
- Seeds reorganizados en 10 fases (38 → 56 seeds)
- Agregados seeds críticos: schools-default, gamification completa, educational content
- Permisos corregidos para schemas: notifications, communication, lti_integration

### v1.4 (2025-12-26)
- Sincronizados seeds prod con dev (dev es source of truth)
- Corregidos arrays de schemas en init-database.sh:
  - Tablas: agregado communication, lti_integration, notifications
  - Funciones: agregado communication, lti_integration, notifications
  - Views: agregado auth, gamilit, social_features
  - Indexes: agregado social_features, system_configuration (removido public)
  - Triggers: agregado lti_integration (removido public)
  - RLS Policies: agregado communication, notifications
- Script actualizado a v3.6

### v1.3 (2025-12-26)
- Agregado paso para cargar ENUMs de schemas (difficulty_level, etc.)
- Tablas aumentaron de 91 a 114 (modules, exercises, module_progress)
- Script actualizado a v3.4

### v1.2 (2025-12-26)
- Corregido FK en user_stats: usar profiles.id en lugar de profiles.user_id
- Script actualizado a v3.3

### v1.1 (2025-12-26)
- Agregado paso 12: Post-seeds sincronizacion de profiles y user_stats
- Script actualizado a v3.2

### v1.0 (2025-12-26)
- Documento inicial creado
- Procedimientos para DEV y PROD documentados
- Troubleshooting comun incluido
- Conteos actualizados post-auditoria

---

**Mantenido por:** Requirements-Analyst
**Ultima actualizacion:** 2025-12-26
**Version script:** 3.7
