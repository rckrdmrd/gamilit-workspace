# Análisis de Homologación de Database DDL

**Fecha:** 2025-12-18

**Objetivo:** Comparar archivos DDL entre desarrollo (ORIGEN) y producción (DESTINO) para identificar diferencias y generar plan de homologación.

---

## Archivos Generados

### 1. Scripts de Análisis

#### `analyze_direct.py` (RECOMENDADO)
Script Python completo que:
- Escanea recursivamente todos los archivos SQL en ambos directorios
- Compara usando checksums MD5
- Identifica archivos nuevos, modificados y eliminados
- Genera reporte detallado en Markdown

**Uso:**
```bash
cd /home/isem/workspace/projects/gamilit/orchestration/analisis-homologacion-database-2025-12-18
python3 analyze_direct.py
```

**Output:** Actualiza `REPORTE-DDL-DIFERENCIAS.md` con análisis completo

#### `compare_ddl.py` (ALTERNATIVO)
Versión alternativa del script con funcionalidad similar.

**Uso:**
```bash
python3 compare_ddl.py
```

### 2. Reportes

#### `REPORTE-DDL-DIFERENCIAS.md` (PRINCIPAL)
Reporte ejecutivo con:
- Resumen de diferencias encontradas
- Lista de archivos nuevos por schema
- Lista de archivos modificados con comandos diff
- Recomendaciones de acción priorizadas
- Plan de migración paso a paso
- Scripts de rollback
- Comandos de validación

**Secciones principales:**
1. Resumen Ejecutivo
2. Archivos Nuevos
3. Archivos Eliminados
4. Archivos Modificados
5. Distribución por Schema
6. Recomendaciones de Acción
7. Plan de Migración
8. Scripts de Rollback
9. Próximos Pasos
10. Información Adicional

#### `INSTRUCCIONES-EJECUCION.md`
Guía rápida de ejecución de scripts.

---

## Quick Start

### Paso 1: Ejecutar Análisis Completo

```bash
cd /home/isem/workspace/projects/gamilit/orchestration/analisis-homologacion-database-2025-12-18
python3 analyze_direct.py
```

Esto generará/actualizará el reporte con análisis completo incluyendo checksums MD5.

### Paso 2: Revisar Reporte

```bash
cat REPORTE-DDL-DIFERENCIAS.md
# O abrir en editor de texto
code REPORTE-DDL-DIFERENCIAS.md
```

### Paso 3: Analizar Diferencias Específicas

Para ver diferencias de un archivo modificado:

```bash
diff -u \
  '/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/<archivo>' \
  '/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/<archivo>'
```

### Paso 4: Seguir Plan de Migración

Ver sección 8 del reporte para plan detallado paso a paso.

---

## Directorios Analizados

**ORIGEN (desarrollo actual):**
```
/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas
```

**DESTINO (producción):**
```
/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas
```

**Schemas incluidos (16):**
- admin_dashboard
- audit_logging
- auth
- auth_management
- communication
- content_management
- educational_content
- gamification_system
- gamilit
- lti_integration
- notifications
- progress_tracking
- public
- social_features
- storage
- system_configuration

---

## Resultados Preliminares

Basado en `git status` y análisis manual:

### Archivos Nuevos Identificados
1. `progress_tracking/indexes/03-teacher-portal-indexes.sql`
2. `progress_tracking/rls-policies/03-teacher-notes-policies.sql`
3. `social_features/indexes/` (directorio)

### Archivos Modificados Identificados
1. `progress_tracking/rls-policies/01-enable-rls.sql`

### Impacto
- **CRÍTICO:** RLS policies para teacher_notes (funcionalidad Teacher Portal)
- **ALTO:** Índices de Teacher Portal (performance)
- **MEDIO:** Índices de social_features

---

## Comandos Útiles

### Ver todos los archivos SQL en origen
```bash
find /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas -name "*.sql" | sort
```

### Ver todos los archivos SQL en destino
```bash
find /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas -name "*.sql" | sort
```

### Contar archivos por schema
```bash
for schema in admin_dashboard audit_logging auth auth_management communication content_management educational_content gamification_system gamilit lti_integration notifications progress_tracking public social_features storage system_configuration; do
  echo -n "$schema: "
  find "/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/$schema" -name "*.sql" 2>/dev/null | wc -l
done
```

### Comparar estructura de directorios
```bash
diff -qr \
  /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas \
  /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas
```

---

## Próximos Pasos

1. **Ejecutar `analyze_direct.py`** para obtener análisis completo con MD5
2. **Revisar reporte actualizado** con lista completa de diferencias
3. **Analizar impacto** de cada cambio identificado
4. **Crear plan de migración** detallado
5. **Validar en staging** antes de producción
6. **Aplicar cambios** en producción con backup previo

---

## Estructura de Archivos en este Directorio

```
analisis-homologacion-database-2025-12-18/
├── README.md (este archivo)
├── REPORTE-DDL-DIFERENCIAS.md (reporte principal)
├── INSTRUCCIONES-EJECUCION.md (guía rápida)
├── analyze_direct.py (script recomendado)
├── compare_ddl.py (script alternativo)
├── compare-ddl.sh (script bash - legacy)
└── run_comparison.sh (wrapper bash)
```

---

## Soporte

Para dudas o problemas:
1. Revisar reporte detallado en `REPORTE-DDL-DIFERENCIAS.md`
2. Consultar logs de ejecución de scripts
3. Contactar a Database Administration team

---

**Última actualización:** 2025-12-18

**Generado por:** Database Analyst Agent
