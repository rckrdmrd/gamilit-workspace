# Deprecated Database Files

Este directorio contiene archivos de base de datos que han sido deprecados o reemplazados.

## Estructura

```
_deprecated/
├── docs-recreacion-2025-11-24/  # Documentación de recreación de BD
├── docs-scripts/                 # Scripts de documentación antiguos
└── README.md                     # Este archivo
```

## Directorios _deprecated en schemas

Los siguientes schemas tienen subdirectorios `_deprecated`:

| Schema | Tipo | Contenido |
|--------|------|-----------|
| gamification_system/enums | Enums | maya_rank duplicado |
| educational_content/tables | Tables | exercise_answers (reemplazado) |
| progress_tracking/functions | Functions | check_mechanic_completion |
| content_management/enums | Enums | media_type, processing_status duplicados |

## Seeds deprecados

| Directorio | Contenido |
|------------|-----------|
| prod/system_configuration | feature_flags.sql |
| prod/auth | test-users.sql (movido a nueva ubicación) |
| prod/auth_management | profiles.sql.legacy, profiles-demo.sql |
| prod/educational_content | exercises-demo.sql, exercises-complete.sql |
| dev/gamification_system | achievements.sql, leaderboard_metadata.sql |

## Política de Retención

- Archivos deprecados se mantienen por 3 meses después de deprecación
- Después de 3 meses, pueden ser eliminados si no hay dependencias
- Verificar con `git log` antes de eliminar permanentemente

---

**Actualizado:** 2025-12-28
