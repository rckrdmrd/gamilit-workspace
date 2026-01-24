#!/usr/bin/env python3
"""
Análisis directo de diferencias DDL
Ejecutar este script para generar el reporte
"""
import os
import hashlib
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

ORIGEN = Path("/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas")
DESTINO = Path("/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas")

SCHEMAS = [
    "admin_dashboard",
    "audit_logging",
    "auth",
    "auth_management",
    "communication",
    "content_management",
    "educational_content",
    "gamification_system",
    "gamilit",
    "lti_integration",
    "notifications",
    "progress_tracking",
    "public",
    "social_features",
    "storage",
    "system_configuration"
]

def get_md5(file_path: Path) -> str:
    """Calcula MD5 de un archivo"""
    try:
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except Exception as e:
        return f"ERROR:{e}"

def get_sql_files(base_path: Path) -> Dict[str, Path]:
    """Obtiene todos los archivos SQL recursivamente"""
    files = {}
    if not base_path.exists():
        return files

    for sql_file in base_path.rglob("*.sql"):
        if sql_file.is_file():
            rel_path = str(sql_file.relative_to(base_path))
            files[rel_path] = sql_file
    return files

def main():
    print("="*80)
    print("ANÁLISIS DE DIFERENCIAS DDL - ORIGEN vs DESTINO")
    print("="*80)
    print()
    print(f"ORIGEN: {ORIGEN}")
    print(f"DESTINO: {DESTINO}")
    print()

    # Recopilar todos los archivos
    print("Recopilando archivos SQL...")
    origen_files = get_sql_files(ORIGEN)
    destino_files = get_sql_files(DESTINO)

    print(f"  - Archivos en ORIGEN: {len(origen_files)}")
    print(f"  - Archivos en DESTINO: {len(destino_files)}")
    print()

    # Análisis de diferencias
    nuevos = []
    eliminados = []
    modificados = []
    identicos = []

    print("Analizando diferencias...")

    # Archivos en origen
    for rel_path, origen_file in sorted(origen_files.items()):
        if rel_path not in destino_files:
            nuevos.append((rel_path, origen_file))
        else:
            md5_origen = get_md5(origen_file)
            md5_destino = get_md5(destino_files[rel_path])

            if md5_origen != md5_destino:
                modificados.append((rel_path, origen_file, destino_files[rel_path], md5_origen, md5_destino))
            else:
                identicos.append(rel_path)

    # Archivos en destino pero no en origen
    for rel_path, destino_file in sorted(destino_files.items()):
        if rel_path not in origen_files:
            eliminados.append((rel_path, destino_file))

    # Resumen
    print()
    print("="*80)
    print("RESUMEN")
    print("="*80)
    print(f"Archivos IDÉNTICOS:   {len(identicos)}")
    print(f"Archivos NUEVOS:      {len(nuevos)}")
    print(f"Archivos ELIMINADOS:  {len(eliminados)}")
    print(f"Archivos MODIFICADOS: {len(modificados)}")
    print(f"TOTAL:                {len(identicos) + len(nuevos) + len(eliminados) + len(modificados)}")
    print()

    # Generar reporte Markdown
    output_file = Path(__file__).parent / "REPORTE-DDL-DIFERENCIAS.md"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# REPORTE DE DIFERENCIAS DDL - ORIGEN vs DESTINO\n\n")
        f.write("**Fecha de análisis:** 2025-12-18\n\n")
        f.write("**Proyecto:** Gamilit - Homologación de Base de Datos\n\n")
        f.write("**Analista:** Database Analyst Agent\n\n")

        # Resumen ejecutivo
        f.write("## 1. RESUMEN EJECUTIVO\n\n")
        f.write("### Estadísticas Generales\n\n")
        f.write("| Categoría | Cantidad | Porcentaje |\n")
        f.write("|-----------|----------|------------|\n")
        total = len(identicos) + len(nuevos) + len(eliminados) + len(modificados)
        f.write(f"| Archivos idénticos | {len(identicos)} | {100*len(identicos)/total:.1f}% |\n")
        f.write(f"| Archivos NUEVOS | {len(nuevos)} | {100*len(nuevos)/total:.1f}% |\n")
        f.write(f"| Archivos ELIMINADOS | {len(eliminados)} | {100*len(eliminados)/total:.1f}% |\n")
        f.write(f"| Archivos MODIFICADOS | {len(modificados)} | {100*len(modificados)/total:.1f}% |\n")
        f.write(f"| **TOTAL** | **{total}** | **100%** |\n\n")

        # Directorios
        f.write("### Directorios Analizados\n\n")
        f.write(f"- **ORIGEN (desarrollo actual):** `{ORIGEN}`\n")
        f.write(f"- **DESTINO (producción):** `{DESTINO}`\n\n")

        # Impacto
        f.write("### Impacto de Cambios\n\n")
        if nuevos:
            f.write(f"- **{len(nuevos)} archivos nuevos** requieren ser añadidos al destino\n")
        if eliminados:
            f.write(f"- **{len(eliminados)} archivos eliminados** deben ser revisados\n")
        if modificados:
            f.write(f"- **{len(modificados)} archivos modificados** requieren migración\n")
        if not nuevos and not eliminados and not modificados:
            f.write("- **Sin diferencias detectadas** - Ambos directorios están sincronizados\n")
        f.write("\n")

        # Archivos NUEVOS
        f.write(f"## 2. ARCHIVOS NUEVOS ({len(nuevos)})\n\n")
        if nuevos:
            f.write("**Descripción:** Archivos que existen en ORIGEN (desarrollo) pero NO en DESTINO (producción).\n\n")
            f.write("**Acción requerida:** Estos archivos deben ser evaluados y posiblemente añadidos al destino.\n\n")

            # Agrupar por schema
            grouped = defaultdict(list)
            for rel_path, full_path in nuevos:
                schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
                grouped[schema].append((rel_path, full_path))

            for schema in sorted(grouped.keys()):
                files = grouped[schema]
                f.write(f"### Schema: `{schema}` ({len(files)} archivos)\n\n")

                # Agrupar por tipo (tables, functions, etc.)
                by_type = defaultdict(list)
                for rel_path, full_path in files:
                    parts = rel_path.split('/')
                    tipo = parts[1] if len(parts) > 1 else 'root'
                    by_type[tipo].append(rel_path)

                for tipo in sorted(by_type.keys()):
                    f.write(f"#### {tipo.upper()} ({len(by_type[tipo])})\n\n")
                    for rel_path in sorted(by_type[tipo]):
                        f.write(f"- `{rel_path}`\n")
                    f.write("\n")
        else:
            f.write("**No se encontraron archivos nuevos.**\n\n")

        # Archivos ELIMINADOS
        f.write(f"## 3. ARCHIVOS ELIMINADOS ({len(eliminados)})\n\n")
        if eliminados:
            f.write("**Descripción:** Archivos que existen en DESTINO (producción) pero NO en ORIGEN (desarrollo).\n\n")
            f.write("**Acción requerida:** Determinar si fueron eliminados intencionalmente o si deben ser restaurados.\n\n")

            # Agrupar por schema
            grouped = defaultdict(list)
            for rel_path, full_path in eliminados:
                schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
                grouped[schema].append((rel_path, full_path))

            for schema in sorted(grouped.keys()):
                files = grouped[schema]
                f.write(f"### Schema: `{schema}` ({len(files)} archivos)\n\n")

                # Agrupar por tipo
                by_type = defaultdict(list)
                for rel_path, full_path in files:
                    parts = rel_path.split('/')
                    tipo = parts[1] if len(parts) > 1 else 'root'
                    by_type[tipo].append(rel_path)

                for tipo in sorted(by_type.keys()):
                    f.write(f"#### {tipo.upper()} ({len(by_type[tipo])})\n\n")
                    for rel_path in sorted(by_type[tipo]):
                        f.write(f"- `{rel_path}`\n")
                    f.write("\n")
        else:
            f.write("**No se encontraron archivos eliminados.**\n\n")

        # Archivos MODIFICADOS
        f.write(f"## 4. ARCHIVOS MODIFICADOS ({len(modificados)})\n\n")
        if modificados:
            f.write("**Descripción:** Archivos con contenido diferente entre ORIGEN y DESTINO.\n\n")
            f.write("**Acción requerida:** Revisar cambios específicos usando `diff` y determinar si deben ser migrados.\n\n")

            # Agrupar por schema
            grouped_mod = defaultdict(list)
            for item in modificados:
                rel_path = item[0]
                schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
                grouped_mod[schema].append(item)

            for schema in sorted(grouped_mod.keys()):
                files = grouped_mod[schema]
                f.write(f"### Schema: `{schema}` ({len(files)} archivos)\n\n")

                # Agrupar por tipo
                by_type = defaultdict(list)
                for item in files:
                    rel_path = item[0]
                    parts = rel_path.split('/')
                    tipo = parts[1] if len(parts) > 1 else 'root'
                    by_type[tipo].append(item)

                for tipo in sorted(by_type.keys()):
                    f.write(f"#### {tipo.upper()} ({len(by_type[tipo])})\n\n")
                    for rel_path, origen_file, destino_file, md5_origen, md5_destino in sorted(by_type[tipo]):
                        f.write(f"##### `{rel_path}`\n\n")
                        f.write(f"```bash\n")
                        f.write(f"# Ver diferencias:\n")
                        f.write(f"diff '{origen_file}' '{destino_file}'\n")
                        f.write(f"```\n\n")
                        f.write(f"- **MD5 Origen:** `{md5_origen}`\n")
                        f.write(f"- **MD5 Destino:** `{md5_destino}`\n\n")
        else:
            f.write("**No se encontraron archivos modificados.**\n\n")

        # Distribución por schema
        f.write("## 5. DISTRIBUCIÓN POR SCHEMA\n\n")

        # Recopilar estadísticas
        schema_stats = defaultdict(lambda: {'identicos': 0, 'nuevos': 0, 'eliminados': 0, 'modificados': 0})

        for rel_path in identicos:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schema_stats[schema]['identicos'] += 1

        for rel_path, _ in nuevos:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schema_stats[schema]['nuevos'] += 1

        for rel_path, _ in eliminados:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schema_stats[schema]['eliminados'] += 1

        for rel_path, *_ in modificados:
            schema = rel_path.split('/')[0] if '/' in rel_path else 'root'
            schema_stats[schema]['modificados'] += 1

        f.write("| Schema | Idénticos | Nuevos | Eliminados | Modificados | Total |\n")
        f.write("|--------|-----------|--------|------------|-------------|-------|\n")

        total_ident = 0
        total_new = 0
        total_del = 0
        total_mod = 0

        for schema in sorted(schema_stats.keys()):
            stats = schema_stats[schema]
            total_schema = sum(stats.values())
            f.write(f"| `{schema}` | {stats['identicos']} | {stats['nuevos']} | {stats['eliminados']} | {stats['modificados']} | {total_schema} |\n")
            total_ident += stats['identicos']
            total_new += stats['nuevos']
            total_del += stats['eliminados']
            total_mod += stats['modificados']

        total_all = total_ident + total_new + total_del + total_mod
        f.write(f"| **TOTAL** | **{total_ident}** | **{total_new}** | **{total_del}** | **{total_mod}** | **{total_all}** |\n\n")

        # Recomendaciones
        f.write("## 6. RECOMENDACIONES DE ACCIÓN\n\n")

        if nuevos:
            f.write("### 6.1. Archivos NUEVOS\n\n")
            f.write("**Prioridad:** ALTA\n\n")
            f.write("**Acciones:**\n\n")
            f.write("1. Revisar cada archivo nuevo para validar su necesidad en producción\n")
            f.write("2. Verificar dependencias con otros objetos de base de datos\n")
            f.write("3. Crear plan de ejecución ordenado:\n")
            f.write("   - Schemas (si aplica)\n")
            f.write("   - Enums\n")
            f.write("   - Tables\n")
            f.write("   - Functions\n")
            f.write("   - Triggers\n")
            f.write("   - Views\n")
            f.write("   - Indexes\n")
            f.write("   - RLS Policies\n")
            f.write("4. Probar en ambiente de staging antes de producción\n")
            f.write("5. Generar scripts de rollback por si hay problemas\n\n")

        if eliminados:
            f.write("### 6.2. Archivos ELIMINADOS\n\n")
            f.write("**Prioridad:** MEDIA-ALTA\n\n")
            f.write("**Acciones:**\n\n")
            f.write("1. Investigar por qué fueron eliminados del desarrollo\n")
            f.write("2. Verificar si aún son usados en producción\n")
            f.write("3. Consultar historial de git para entender el cambio\n")
            f.write("4. Decidir si deben:\n")
            f.write("   - Ser removidos de producción (DROP statements)\n")
            f.write("   - Ser restaurados en desarrollo\n")
            f.write("   - Ser marcados como deprecated con plan de eliminación\n\n")

        if modificados:
            f.write("### 6.3. Archivos MODIFICADOS\n\n")
            f.write("**Prioridad:** ALTA\n\n")
            f.write("**Acciones:**\n\n")
            f.write("1. Analizar diferencias específicas usando:\n")
            f.write("   ```bash\n")
            f.write("   diff -u <archivo_destino> <archivo_origen>\n")
            f.write("   ```\n")
            f.write("2. Clasificar cambios por tipo:\n")
            f.write("   - Cambios de estructura (ALTER TABLE)\n")
            f.write("   - Cambios de lógica (funciones, triggers)\n")
            f.write("   - Cambios de seguridad (RLS policies)\n")
            f.write("   - Cambios cosméticos (comentarios, formato)\n")
            f.write("3. Evaluar impacto en datos existentes\n")
            f.write("4. Crear scripts de migración si requieren transformación de datos\n")
            f.write("5. Planificar ventana de mantenimiento si hay cambios críticos\n\n")

        f.write("### 6.4. Plan de Ejecución General\n\n")
        f.write("**Fase 1: Preparación**\n")
        f.write("- [ ] Backup completo de base de datos de producción\n")
        f.write("- [ ] Documentar todos los cambios a aplicar\n")
        f.write("- [ ] Preparar scripts de rollback\n")
        f.write("- [ ] Validar en ambiente de staging\n\n")

        f.write("**Fase 2: Ejecución**\n")
        f.write("- [ ] Aplicar cambios en orden correcto\n")
        f.write("- [ ] Verificar cada cambio antes de continuar\n")
        f.write("- [ ] Monitorear logs de errores\n")
        f.write("- [ ] Ejecutar pruebas de smoke testing\n\n")

        f.write("**Fase 3: Validación**\n")
        f.write("- [ ] Verificar integridad de datos\n")
        f.write("- [ ] Ejecutar suite de pruebas automatizadas\n")
        f.write("- [ ] Revisar performance de queries afectados\n")
        f.write("- [ ] Validar funcionalidad de aplicación\n\n")

        f.write("**Fase 4: Monitoreo Post-Deployment**\n")
        f.write("- [ ] Monitorear logs durante 24-48 horas\n")
        f.write("- [ ] Revisar métricas de performance\n")
        f.write("- [ ] Recopilar feedback de usuarios\n")
        f.write("- [ ] Documentar lecciones aprendidas\n\n")

        # Próximos pasos
        f.write("## 7. PRÓXIMOS PASOS INMEDIATOS\n\n")
        f.write("1. **Análisis detallado de archivos modificados**\n")
        f.write("   - Ejecutar `diff` en cada archivo modificado\n")
        f.write("   - Documentar cada cambio específico\n")
        f.write("   - Clasificar por criticidad\n\n")

        f.write("2. **Validación de archivos nuevos**\n")
        f.write("   - Revisar purpose de cada nuevo archivo\n")
        f.write("   - Verificar que no haya conflictos\n")
        f.write("   - Preparar orden de ejecución\n\n")

        f.write("3. **Investigación de archivos eliminados**\n")
        f.write("   - Revisar git history\n")
        f.write("   - Verificar uso en producción\n")
        f.write("   - Decidir acción apropiada\n\n")

        f.write("4. **Generación de scripts de migración**\n")
        f.write("   - Crear scripts DDL ordenados\n")
        f.write("   - Incluir manejo de errores\n")
        f.write("   - Preparar scripts de rollback\n\n")

        # Información adicional
        f.write("## 8. INFORMACIÓN ADICIONAL\n\n")
        f.write("### Comandos Útiles\n\n")
        f.write("**Ver diferencias de un archivo específico:**\n")
        f.write("```bash\n")
        f.write(f"diff -u '{DESTINO}/<schema>/<archivo>' '{ORIGEN}/<schema>/<archivo>'\n")
        f.write("```\n\n")

        f.write("**Comparar MD5 de archivos:**\n")
        f.write("```bash\n")
        f.write(f"md5sum '{ORIGEN}/<archivo>'\n")
        f.write(f"md5sum '{DESTINO}/<archivo>'\n")
        f.write("```\n\n")

        f.write("**Contar archivos por tipo:**\n")
        f.write("```bash\n")
        f.write(f"find '{ORIGEN}' -name '*.sql' | grep -c '/tables/'\n")
        f.write(f"find '{ORIGEN}' -name '*.sql' | grep -c '/functions/'\n")
        f.write("```\n\n")

        f.write("### Contacto y Soporte\n\n")
        f.write("Para dudas sobre este análisis contactar al equipo de Database Administration.\n\n")

        f.write("---\n\n")
        f.write("**Fin del reporte**\n\n")
        f.write("*Generado automáticamente por Database Analyst Agent - 2025-12-18*\n")

    print(f"Reporte generado exitosamente: {output_file}")
    print()

    # Mostrar resumen en consola
    if nuevos:
        print("ARCHIVOS NUEVOS (top 10):")
        for rel_path, _ in nuevos[:10]:
            print(f"  + {rel_path}")
        if len(nuevos) > 10:
            print(f"  ... y {len(nuevos)-10} más")
        print()

    if eliminados:
        print("ARCHIVOS ELIMINADOS (top 10):")
        for rel_path, _ in eliminados[:10]:
            print(f"  - {rel_path}")
        if len(eliminados) > 10:
            print(f"  ... y {len(eliminados)-10} más")
        print()

    if modificados:
        print("ARCHIVOS MODIFICADOS (top 10):")
        for rel_path, *_ in modificados[:10]:
            print(f"  M {rel_path}")
        if len(modificados) > 10:
            print(f"  ... y {len(modificados)-10} más")
        print()

if __name__ == "__main__":
    main()
