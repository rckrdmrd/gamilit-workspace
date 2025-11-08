# Seeds de Desarrollo - GLIT Database

**Actualizado:** 2025-11-02
**Estado:** ✅ 100% Completo (32 archivos, 10,525 líneas, 9/9 schemas)

Este directorio contiene todos los seeds para el entorno de desarrollo de GLIT.

---

## 📁 Estructura

```
/apps/database/seeds/dev/
├── auth/                        (1 archivo,    107 líneas)
├── auth_management/             (7 archivos,   ~800 líneas)
├── gamification_system/         (4 archivos, ~1,030 líneas)
├── educational_content/         (7 archivos,  3,189 líneas)
├── content_management/          (3 archivos,  1,734 líneas)
├── social_features/             (4 archivos,  1,321 líneas)
├── progress_tracking/           (2 archivos,    958 líneas)
├── audit_logging/               (2 archivos,  1,198 líneas)
└── system_configuration/        (2 archivos,    469 líneas)
```

**Total:** 32 archivos | 10,525 líneas SQL | 544 KB

---

## 🔄 Orden de Ejecución

Los seeds deben ejecutarse respetando las dependencias de Foreign Keys:

### 1. **auth/** - Usuarios base
```bash
psql -d glit_dev -f auth/01-demo-users.sql
```
**Contenido:** 5 usuarios demo (admin, instructor, 3 estudiantes)

### 2. **auth_management/** - Configuración de autenticación
```bash
for file in auth_management/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** Tenants, providers, perfiles, roles, preferencias

### 3. **system_configuration/** - Configuración del sistema
```bash
for file in system_configuration/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** 21 system settings, 5 feature flags (ML Coins, comodines)

### 4. **gamification_system/** - Gamificación
```bash
for file in gamification_system/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** 45 achievements, leaderboards, categorías

### 5. **educational_content/** - Módulos y ejercicios
```bash
for file in educational_content/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** 8 módulos Marie Curie, 27 ejercicios interactivos

### 6. **content_management/** - Contenido enriquecido
```bash
for file in content_management/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** 4 biografías, 13 media files, 49 tags

### 7. **social_features/** - Features sociales
```bash
for file in social_features/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** 3 escuelas, 7 aulas, 4 equipos

### 8. **progress_tracking/** - Tracking de progreso _(Opcional)_
```bash
for file in progress_tracking/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** Module progress, learning sessions, exercise attempts

### 9. **audit_logging/** - Logs y métricas _(Opcional)_
```bash
for file in audit_logging/*.sql; do psql -d glit_dev -f "$file"; done
```
**Contenido:** Audit logs, system logs, performance metrics, alerts

---

## ⚡ Ejecución Rápida (Script Completo)

```bash
#!/bin/bash
# Script de ejecución completa de seeds
cd /apps/database/seeds/dev

# Definir orden de schemas
SCHEMAS=(
  "auth"
  "auth_management"
  "system_configuration"
  "gamification_system"
  "educational_content"
  "content_management"
  "social_features"
  "progress_tracking"
  "audit_logging"
)

# Ejecutar seeds en orden
for schema in "${SCHEMAS[@]}"; do
  echo "⏳ Ejecutando seeds de $schema..."
  for file in "$schema"/*.sql; do
    if [ -f "$file" ]; then
      psql -U postgres -d glit_dev -f "$file" > /dev/null 2>&1
      if [ $? -eq 0 ]; then
        echo "   ✅ $(basename $file)"
      else
        echo "   ❌ ERROR en $(basename $file)"
        exit 1
      fi
    fi
  done
done

echo ""
echo "🎉 Seeds ejecutados exitosamente!"
```

---

## ✨ Características

### Idempotencia
- **Todos los archivos pueden re-ejecutarse sin errores**
- Uso de `ON CONFLICT DO UPDATE SET` o `ON CONFLICT DO NOTHING`
- Seguros para desarrollo iterativo

### Referencias Dinámicas
- **No hay UUIDs hardcoded**
- Variables `DO $$` para obtener IDs
- Referencias por email, código, o título

### Datos Realistas
- **Marie Curie:** Fechas históricas precisas (1867-1934)
- **Escuelas mexicanas:** Direcciones reales, CCT válidos
- **Passwords:** Bcrypt con cost factor 10
- **JSON structures:** Validados y bien formateados

### Documentación
- **Headers descriptivos** con dependencias
- **Comentarios** explicativos en secciones complejas
- **Metadata JSONB** rica para analytics

---

## 📊 Contenido por Schema

### auth (1 archivo)
- **01-demo-users.sql:** 5 usuarios con roles diferenciados
  - Super Admin: `admin@glit.edu.mx`
  - Instructor: `instructor@demo.glit.edu.mx`
  - Estudiantes: `estudiante1-3@demo.glit.edu.mx`

### educational_content (7 archivos)
- **01-modules.sql:** 8 módulos sobre Marie Curie
  - Metodología Daniel Cassany
  - 5 pedagógicos + 3 narrativos
- **02-06*.sql:** 27 ejercicios distribuidos
  - Módulo 1 (Literal): 5 ejercicios
  - Módulo 2 (Inferencial): 5 ejercicios
  - Módulo 3 (Crítica): 5 ejercicios
  - Módulo 4 (Digital): 9 ejercicios
  - Módulo 5 (Creativo): 3 ejercicios
- **07-assessment-rubrics.sql:** Rúbricas integradas

### system_configuration (2 archivos)
- **01-system_settings.sql:** 21 configuraciones
  - General (4): platform_name, timezone, language, version
  - Gamification (8): ML Coins costs, bonos
  - Security (7): login attempts, timeouts, password rules
  - Email (3): SMTP, contacts
- **02-feature_flags.sql:** 5 flags
  - Enabled (100%): missions_system, global_leaderboards, collaborative_teams
  - Disabled: live_chat, competitive_mode (A/B 10%)

### content_management (3 archivos)
- **01-marie-curie-bio.sql:** 4 biografías históricas (~7,500 palabras)
- **02-media-files.sql:** 13 multimedia (imágenes, videos, audio, diagramas)
- **03-tags.sql:** 49 tags organizacionales (9 categorías)

### social_features (4 archivos)
- **01-schools.sql:** 3 escuelas (CDMX, Monterrey, Guadalajara)
- **02-classrooms.sql:** 7 aulas distribuidas por grado y materia
- **03-classroom-members.sql:** 7 membresías (multi-enrollment)
- **04-teams.sql:** 4 equipos colaborativos con proyectos

### progress_tracking (2 archivos)
- **01-demo-progress.sql:** Module progress y learning sessions
- **02-exercise-attempts.sql:** Exercise attempts y submissions

### audit_logging (2 archivos)
- **01-audit-logs.sql:** Audit logs y system logs
- **02-system-metrics.sql:** Performance metrics y system alerts

---

## 🎯 Casos de Uso

### Desarrollo Local
```bash
# Iniciar base de datos limpia
psql -d postgres -c "DROP DATABASE IF EXISTS glit_dev;"
psql -d postgres -c "CREATE DATABASE glit_dev;"

# Ejecutar DDL
psql -d glit_dev -f /apps/database/ddl/setup.sql

# Ejecutar seeds
./execute_seeds.sh
```

### Testing
- Datos demo completos para testing E2E
- Usuarios con diferentes roles
- Progreso realista para analytics
- Logs y métricas para monitoring

### Demos
- Contenido educativo completo (Marie Curie)
- Features sociales funcionales
- Gamificación activa
- Sistema configurado

---

## 📝 Reportes Detallados

Para más información sobre la creación y validación de estos seeds:

- **FASE 5A (Críticos):** `/docs-analysis/.../REPORTE-FASE-5A-COMPLETADO.md`
- **FASE 5B (Importantes):** `/docs-analysis/.../REPORTE-FASE-5B-COMPLETADO.md`
- **FASE 5C (Opcionales):** `/docs-analysis/.../REPORTE-FASE-5C-COMPLETADO.md`
- **Validación:** `/docs-analysis/.../REPORTE-VALIDACION-SEEDS-FASE-5A.md`

---

## ⚠️ Notas Importantes

### Para Producción
- **NO usar estos seeds en producción**
- Passwords demo son conocidos
- Datos son de prueba solamente
- Crear seeds de producción separados

### Mantenimiento
- Actualizar seeds cuando DDL cambie
- Validar idempotencia después de cambios
- Mantener coherencia de datos

### Troubleshooting
- Si un seed falla, verificar dependencias (orden de ejecución)
- Revisar que DDL esté aplicado primero
- Verificar que PostgreSQL sea v14+

---

**Generado:** 2025-11-02
**Migración:** FASE 5A + 5B + 5C completadas
**Estado:** ✅ Producción Ready (para desarrollo y testing)
