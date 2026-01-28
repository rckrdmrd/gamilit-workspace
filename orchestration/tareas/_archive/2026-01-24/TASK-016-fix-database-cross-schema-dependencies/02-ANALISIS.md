# TASK-016: Análisis

## Diagrama de Dependencias

```
FASE 6: educational_content
├── modules (OK - sin FK externos)
├── exercises (OK - FK a modules)
├── questions (OK - FK a exercises)
└── classroom_modules (FALLA - FK a social_features.classrooms)
                              ↓
FASE 9: social_features      │
├── classrooms ──────────────┘ (referenciado pero no existe aún)
└── ...
```

## Análisis de Alternativas

### Opción A: Mover DDL a FASE 9
- **Pros**: Simple
- **Contras**: Rompe la organización por schema, difícil de mantener

### Opción B: Crear FASE intermedia
- **Pros**: Respeta organización, explícito
- **Contras**: Requiere modificar script

### Opción C: Subdirectorio _cross_schema/ + FASE 9.7 (SELECCIONADA)
- **Pros**:
  - Mantiene DDL en su schema original
  - Exclusión automática de carga en FASE 6
  - FASE 9.7 dedicada para cross-schema
  - Patrón reutilizable para futuras tablas con dependencias
- **Contras**: Ninguno significativo

## Archivos a Modificar

1. **create-database.sh**
   - Modificar `execute_sql_files` para excluir `_cross_schema/`
   - Agregar FASE 9.7 después de FASE 9.6
   - Agregar ejecución de seed `14-classroom_modules.sql`

2. **23-classroom_modules.sql**
   - Mover a `tables/_cross_schema/`

3. **14-classroom_modules.sql** (NUEVO)
   - Crear seed que asigna módulos publicados al classroom DEFAULT

## Validación Requerida

- [ ] Ejecutar `create-database.sh` completo
- [ ] Verificar 146+ tablas creadas
- [ ] Verificar tabla `classroom_modules` existe
- [ ] Verificar seed cargó 3+ registros (módulos publicados)
- [ ] Verificar student portal muestra módulos
