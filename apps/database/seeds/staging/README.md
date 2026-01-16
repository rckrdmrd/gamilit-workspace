# Seeds de Staging - GAMILIT

**Fecha:** 2026-01-16
**Task:** TASK-2026-01-16-005
**Cobertura:** 55% vs Producción (intencional)

---

## Propósito del Ambiente Staging

El ambiente de staging está diseñado para:

1. **Pruebas de integración** - Validar flujos completos sin datos de producción
2. **QA manual** - Ambiente limpio para testers
3. **Demostraciones** - Datos consistentes y predecibles
4. **CI/CD** - Base de datos reproducible para pipelines

---

## Decisión de Cobertura al 55%

### Por qué NO es 100%

| Categoría Excluida | Razón |
|--------------------|-------|
| `_testing/` | Solo para desarrollo local, no relevante en staging |
| `admin_dashboard/` | Datos de admin se crean dinámicamente en staging |
| Seeds de demo extendidos | Staging usa conjunto mínimo para pruebas rápidas |
| Datos históricos | No necesarios para validación de flujos |

### Beneficios del Enfoque Minimalista

1. **Recreación rápida** - Base de datos se puede recrear en segundos
2. **Datos predecibles** - Conjunto fijo facilita assertions en tests
3. **Aislamiento** - Sin contaminación de datos de desarrollo
4. **Reproducibilidad** - Mismo estado inicial garantizado

---

## Contenido Incluido

### Datos Esenciales (siempre presentes)

| Schema | Seeds | Propósito |
|--------|-------|-----------|
| `system_configuration` | 5 | Feature flags, parámetros base |
| `auth_management` | 8 | Tenants, providers, perfiles base |
| `auth` | 2 | Usuarios demo (student, teacher, admin) |
| `educational_content` | 12 | Módulos 1-5, ejercicios, rúbricas |
| `gamification_system` | 10 | Logros, rangos, shop básico |
| `social_features` | 5 | Escuelas demo, classrooms |
| `notifications` | 2 | Templates base |
| `progress_tracking` | 3 | Progreso inicial demo |

### Datos Excluidos (intencional)

| Schema | Razón de Exclusión |
|--------|-------------------|
| `_testing/` | Datos de validación solo para dev |
| `admin_dashboard/` | Se generan en runtime |
| Seeds históricos | No necesarios para tests |

---

## Cómo Cargar Seeds de Staging

```bash
# Opción 1: Script dedicado
./load-staging-seeds.sh "postgresql://user:pass@localhost:5432/gamilit_staging"

# Opción 2: Manual (15 fases en orden)
# Ver load-staging-seeds.sh para orden de ejecución
```

---

## Comparativa de Ambientes

| Ambiente | Seeds | Propósito | Script |
|----------|-------|-----------|--------|
| **Prod** | 101 | Datos iniciales completos | `create-database.sh` (FASE 16) |
| **Staging** | 56 | Pruebas e integración | `load-staging-seeds.sh` |
| **Dev** | 94 | Desarrollo local + testing | `load-dev-seeds.sh` |

---

## Mantenimiento

Al agregar nuevos seeds:

1. **Prod** - Agregar siempre (baseline)
2. **Dev** - Agregar si es útil para desarrollo
3. **Staging** - Agregar SOLO si es esencial para pruebas de integración

**Principio:** Staging debe permanecer ligero y predecible.

---

## Referencias

- `load-staging-seeds.sh` - Script de carga (15 fases)
- `../prod/` - Seeds de producción (baseline)
- `../dev/` - Seeds de desarrollo (extendido)
- `orchestration/tareas/TASK-2026-01-16-005/` - Documentación de validación
