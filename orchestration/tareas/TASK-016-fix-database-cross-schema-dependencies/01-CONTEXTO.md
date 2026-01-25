# TASK-016: Contexto

## Problema Detectado

Durante la investigación de TASK-014 (bugs en student monitoring), se identificó que el **student portal no mostraba módulos**. El análisis reveló que la tabla `educational_content.classroom_modules` no existía en la base de datos.

## Síntomas

1. **Student Portal**: Dashboard no muestra módulos disponibles
2. **Queries fallando**: `SELECT * FROM educational_content.classroom_modules` retornaba error "table does not exist"
3. **Datos vacíos**: Después de ejecutar `create-database.sh`, la tabla no se creaba

## Descubrimiento

Al ejecutar `create-database.sh` manualmente, se observó que:
- FASE 6 (educational_content tables) se ejecutaba correctamente
- FASE 9 (social_features) se ejecutaba después
- La tabla `classroom_modules` no se creaba a pesar de existir el DDL

## Causa Raíz

El archivo DDL `23-classroom_modules.sql` contiene:
```sql
FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id)
```

Esta FK referencia a `social_features.classrooms`, que se crea en FASE 9. Sin embargo, el DDL estaba en:
```
apps/database/ddl/schemas/educational_content/tables/23-classroom_modules.sql
```

Por lo tanto, se intentaba ejecutar en FASE 6, antes de que existiera la tabla referenciada.

## Impacto

- **Severidad**: P0 - Crítico
- **Módulo afectado**: Student Portal (dashboard completo)
- **Usuarios afectados**: Todos los estudiantes

## Trigger de la Tarea

Investigación de impacto de TASK-014 reveló que los bugs de student portal NO eran causados por los cambios de TASK-014, sino por un bug pre-existente en la estructura de creación de base de datos.
