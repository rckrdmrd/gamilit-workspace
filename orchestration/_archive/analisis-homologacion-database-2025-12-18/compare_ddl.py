#!/usr/bin/env python3
"""
Script para comparar archivos DDL entre origen y destino
"""
import os
import hashlib
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple, Set

ORIGEN = Path("/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas")
DESTINO = Path("/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas")

def get_md5(file_path: Path) -> str:
    """Calcula el MD5 de un archivo"""
    try:
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except Exception as e:
        return f"ERROR: {e}"

def get_sql_files(base_path: Path) -> Dict[str, Path]:
    """Retorna un diccionario de archivos SQL con ruta relativa como clave"""
    files = {}
    for sql_file in base_path.rglob("*.sql"):
        rel_path = sql_file.relative_to(base_path)
        files[str(rel_path)] = sql_file
    return files

def compare_directories():
    """Compara los directorios y retorna diferencias"""
    print("Recopilando archivos de ORIGEN...")
    origen_files = get_sql_files(ORIGEN)
    print(f"Encontrados {len(origen_files)} archivos en ORIGEN")

    print("Recopilando archivos de DESTINO...")
    destino_files = get_sql_files(DESTINO)
    print(f"Encontrados {len(destino_files)} archivos en DESTINO")

    # Identificar archivos nuevos, eliminados y modificados
    nuevos = []
    eliminados = []
    modificados = []
    identicos = []

    # Archivos en origen
    for rel_path, origen_file in origen_files.items():
        if rel_path not in destino_files:
            nuevos.append((rel_path, origen_file))
        else:
            # Comparar checksums
            origen_md5 = get_md5(origen_file)
            destino_md5 = get_md5(destino_files[rel_path])

            if origen_md5 != destino_md5:
                modificados.append((rel_path, origen_file, destino_files[rel_path], origen_md5, destino_md5))
            else:
                identicos.append(rel_path)

    # Archivos solo en destino
    for rel_path, destino_file in destino_files.items():
        if rel_path not in origen_files:
            eliminados.append((rel_path, destino_file))

    return nuevos, eliminados, modificados, identicos

def group_by_schema(files: List[Tuple]) -> Dict[str, List]:
    """Agrupa archivos por schema"""
    grouped = defaultdict(list)
    for item in files:
        rel_path = item[0]
        schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
        grouped[schema].append(item)
    return dict(grouped)

def generate_report(nuevos, eliminados, modificados, identicos):
    """Genera el reporte en formato Markdown"""
    output_file = "/home/isem/workspace/projects/gamilit/orchestration/analisis-homologacion-database-2025-12-18/REPORTE-DDL-DIFERENCIAS.md"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# REPORTE DE DIFERENCIAS DDL - ORIGEN vs DESTINO\n\n")
        f.write("**Fecha:** 2025-12-18\n\n")
        f.write("**Proyecto:** Gamilit - Homologación de Base de Datos\n\n")

        # Resumen ejecutivo
        f.write("## RESUMEN EJECUTIVO\n\n")
        f.write(f"- **Archivos idénticos:** {len(identicos)}\n")
        f.write(f"- **Archivos NUEVOS (en origen, no en destino):** {len(nuevos)}\n")
        f.write(f"- **Archivos ELIMINADOS (en destino, no en origen):** {len(eliminados)}\n")
        f.write(f"- **Archivos MODIFICADOS:** {len(modificados)}\n")
        f.write(f"- **Total archivos analizados:** {len(identicos) + len(nuevos) + len(eliminados) + len(modificados)}\n\n")

        # Directorios
        f.write("## DIRECTORIOS ANALIZADOS\n\n")
        f.write(f"- **ORIGEN:** `{ORIGEN}`\n")
        f.write(f"- **DESTINO:** `{DESTINO}`\n\n")

        # Archivos NUEVOS
        if nuevos:
            f.write(f"## ARCHIVOS NUEVOS ({len(nuevos)})\n\n")
            f.write("Archivos que existen en ORIGEN pero NO en DESTINO.\n\n")

            grouped = group_by_schema(nuevos)
            for schema in sorted(grouped.keys()):
                files = grouped[schema]
                f.write(f"### Schema: `{schema}` ({len(files)} archivos)\n\n")
                for rel_path, full_path in sorted(files):
                    f.write(f"- `{rel_path}`\n")
                f.write("\n")
        else:
            f.write("## ARCHIVOS NUEVOS\n\n")
            f.write("No se encontraron archivos nuevos.\n\n")

        # Archivos ELIMINADOS
        if eliminados:
            f.write(f"## ARCHIVOS ELIMINADOS ({len(eliminados)})\n\n")
            f.write("Archivos que existen en DESTINO pero NO en ORIGEN.\n\n")

            grouped = group_by_schema(eliminados)
            for schema in sorted(grouped.keys()):
                files = grouped[schema]
                f.write(f"### Schema: `{schema}` ({len(files)} archivos)\n\n")
                for rel_path, full_path in sorted(files):
                    f.write(f"- `{rel_path}`\n")
                f.write("\n")
        else:
            f.write("## ARCHIVOS ELIMINADOS\n\n")
            f.write("No se encontraron archivos eliminados.\n\n")

        # Archivos MODIFICADOS
        if modificados:
            f.write(f"## ARCHIVOS MODIFICADOS ({len(modificados)})\n\n")
            f.write("Archivos con contenido diferente entre ORIGEN y DESTINO.\n\n")

            grouped_mod = defaultdict(list)
            for item in modificados:
                rel_path = item[0]
                schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
                grouped_mod[schema].append(item)

            for schema in sorted(grouped_mod.keys()):
                files = grouped_mod[schema]
                f.write(f"### Schema: `{schema}` ({len(files)} archivos)\n\n")
                for rel_path, origen_file, destino_file, md5_origen, md5_destino in sorted(files):
                    f.write(f"#### `{rel_path}`\n\n")
                    f.write(f"- **MD5 Origen:** `{md5_origen}`\n")
                    f.write(f"- **MD5 Destino:** `{md5_destino}`\n")
                    f.write(f"- **Ruta Origen:** `{origen_file}`\n")
                    f.write(f"- **Ruta Destino:** `{destino_file}`\n\n")
                f.write("\n")
        else:
            f.write("## ARCHIVOS MODIFICADOS\n\n")
            f.write("No se encontraron archivos modificados.\n\n")

        # Distribución por schema
        f.write("## DISTRIBUCIÓN POR SCHEMA\n\n")
        f.write("| Schema | Idénticos | Nuevos | Eliminados | Modificados | Total |\n")
        f.write("|--------|-----------|--------|------------|-------------|-------|\n")

        # Recopilar estadísticas por schema
        schemas_stats = defaultdict(lambda: {'identicos': 0, 'nuevos': 0, 'eliminados': 0, 'modificados': 0})

        for rel_path in identicos:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schemas_stats[schema]['identicos'] += 1

        for rel_path, _ in nuevos:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schemas_stats[schema]['nuevos'] += 1

        for rel_path, _ in eliminados:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schemas_stats[schema]['eliminados'] += 1

        for rel_path, *_ in modificados:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schemas_stats[schema]['modificados'] += 1

        for schema in sorted(schemas_stats.keys()):
            stats = schemas_stats[schema]
            total = stats['identicos'] + stats['nuevos'] + stats['eliminados'] + stats['modificados']
            f.write(f"| `{schema}` | {stats['identicos']} | {stats['nuevos']} | {stats['eliminados']} | {stats['modificados']} | {total} |\n")

        # Totales
        f.write(f"| **TOTAL** | **{len(identicos)}** | **{len(nuevos)}** | **{len(eliminados)}** | **{len(modificados)}** | **{len(identicos) + len(nuevos) + len(eliminados) + len(modificados)}** |\n\n")

        # Recomendaciones
        f.write("## RECOMENDACIONES\n\n")

        if nuevos:
            f.write(f"### Archivos NUEVOS ({len(nuevos)})\n\n")
            f.write("**Acción:** Estos archivos deben ser añadidos al destino si son necesarios para la homologación.\n\n")
            f.write("**Consideraciones:**\n")
            f.write("- Validar que sean cambios intencionales y no archivos de desarrollo/testing\n")
            f.write("- Revisar dependencias con otros esquemas\n")
            f.write("- Ejecutar en orden correcto (schemas, tables, functions, triggers, views, indexes, policies)\n\n")

        if eliminados:
            f.write(f"### Archivos ELIMINADOS ({len(eliminados)})\n\n")
            f.write("**Acción:** Estos archivos existen en destino pero no en origen. Determinar si deben ser eliminados o conservados.\n\n")
            f.write("**Consideraciones:**\n")
            f.write("- Verificar si fueron eliminados intencionalmente en origen\n")
            f.write("- Validar que no sean archivos legacy que aún se usan en producción\n")
            f.write("- Documentar razón de eliminación\n\n")

        if modificados:
            f.write(f"### Archivos MODIFICADOS ({len(modificados)})\n\n")
            f.write("**Acción:** Revisar diferencias específicas para determinar cambios necesarios.\n\n")
            f.write("**Consideraciones:**\n")
            f.write("- Usar `diff` para ver diferencias línea por línea\n")
            f.write("- Validar que los cambios sean compatibles con datos existentes\n")
            f.write("- Crear scripts de migración si es necesario\n")
            f.write("- Probar en ambiente de desarrollo antes de aplicar en producción\n\n")

        f.write("## PRÓXIMOS PASOS\n\n")
        f.write("1. **Análisis detallado:** Revisar cada archivo modificado con `diff` para entender cambios específicos\n")
        f.write("2. **Clasificación:** Categorizar cambios por tipo (schema, tables, functions, etc.)\n")
        f.write("3. **Plan de migración:** Crear secuencia de ejecución ordenada\n")
        f.write("4. **Testing:** Validar cambios en ambiente de desarrollo\n")
        f.write("5. **Documentación:** Documentar cada cambio y su justificación\n")
        f.write("6. **Deployment:** Aplicar cambios en producción con backup previo\n\n")

        f.write("---\n\n")
        f.write("*Reporte generado automáticamente - 2025-12-18*\n")

    print(f"\nReporte generado: {output_file}")
    return output_file

if __name__ == "__main__":
    print("=" * 80)
    print("ANÁLISIS DE DIFERENCIAS DDL - ORIGEN vs DESTINO")
    print("=" * 80)
    print()

    nuevos, eliminados, modificados, identicos = compare_directories()

    print("\n" + "=" * 80)
    print("RESUMEN")
    print("=" * 80)
    print(f"Archivos idénticos: {len(identicos)}")
    print(f"Archivos NUEVOS: {len(nuevos)}")
    print(f"Archivos ELIMINADOS: {len(eliminados)}")
    print(f"Archivos MODIFICADOS: {len(modificados)}")
    print()

    output_file = generate_report(nuevos, eliminados, modificados, identicos)
    print(f"\nReporte completo guardado en: {output_file}")
