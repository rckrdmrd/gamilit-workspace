# INSTRUCCIONES DE EJECUCIÓN - ANÁLISIS COMPLETO DDL

## PASO 1: Ejecutar Análisis Completo

Para obtener el análisis completo con checksums MD5 de todos los archivos DDL, ejecuta:

```bash
cd /home/isem/workspace/projects/gamilit/orchestration/analisis-homologacion-database-2025-12-18
python3 analyze_direct.py
```

Este comando:
- Escanea TODOS los archivos SQL en origen y destino
- Compara usando MD5 checksums
- Identifica archivos nuevos, modificados y eliminados
- Genera reporte completo en `REPORTE-DDL-DIFERENCIAS.md`
- Muestra resumen en consola

## PASO 2: Ver Resumen Rápido (Opcional)

Si solo quieres un resumen rápido sin análisis completo:

```bash
chmod +x quick-summary.sh
./quick-summary.sh
```

## PASO 3: Revisar Reporte

```bash
cat REPORTE-DDL-DIFERENCIAS.md
# O abrir en tu editor favorito
code REPORTE-DDL-DIFERENCIAS.md
vim REPORTE-DDL-DIFERENCIAS.md
```

## PASO 4: Ver Diferencias Específicas

Para archivos modificados, ver diferencias línea por línea:

```bash
# Ejemplo con archivo modificado conocido
diff -u \
  '/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policies/01-enable-rls.sql' \
  '/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policies/01-enable-rls.sql'
```

## Resultado Esperado

El script `analyze_direct.py` mostrará en consola:

```
================================================================================
ANÁLISIS DE DIFERENCIAS DDL - ORIGEN vs DESTINO
================================================================================

ORIGEN: /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas
DESTINO: /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas

Recopilando archivos SQL...
  - Archivos en ORIGEN: XXX
  - Archivos en DESTINO: XXX

Analizando diferencias...

================================================================================
RESUMEN
================================================================================
Archivos IDÉNTICOS:   XXX
Archivos NUEVOS:      XXX
Archivos ELIMINADOS:  XXX
Archivos MODIFICADOS: XXX
TOTAL:                XXX

Reporte generado exitosamente: /home/isem/workspace/.../REPORTE-DDL-DIFERENCIAS.md
```

## Troubleshooting

### Error: python3 not found
```bash
# Instalar python3
sudo apt-get update
sudo apt-get install python3
```

### Error: Permission denied
```bash
# Dar permisos de ejecución
chmod +x analyze_direct.py
chmod +x quick-summary.sh
```

### El script no encuentra los directorios
Verifica que existan:
```bash
ls -ld /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas
ls -ld /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas
```

## Archivos Importantes

- `analyze_direct.py` - Script de análisis completo (PRINCIPAL)
- `REPORTE-DDL-DIFERENCIAS.md` - Reporte detallado (OUTPUT)
- `README.md` - Documentación general
- `INDEX.md` - Índice de todos los archivos
- `quick-summary.sh` - Resumen rápido sin análisis completo

## Siguiente Paso

Después de ejecutar el análisis, revisar el archivo `REPORTE-DDL-DIFERENCIAS.md` que contiene:

1. Resumen ejecutivo completo
2. Lista de TODOS los archivos nuevos con detalles
3. Lista de TODOS los archivos eliminados
4. Lista de TODOS los archivos modificados con MD5
5. Plan de migración paso a paso
6. Scripts de rollback
7. Recomendaciones de acción

---

**EJECUTA AHORA:**

```bash
cd /home/isem/workspace/projects/gamilit/orchestration/analisis-homologacion-database-2025-12-18 && python3 analyze_direct.py
```
