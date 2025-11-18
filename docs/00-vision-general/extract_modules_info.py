#!/usr/bin/env python3
"""
Script para extraer información de los módulos 3, 4 y 5
"""
import re

modules = {
    '3': '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/dev/educational_content/04-exercises-module3.sql',
    '4': '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/dev/educational_content/05-exercises-module4.sql',
    '5': '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/dev/educational_content/06-exercises-module5.sql'
}

for mod_num, file_path in modules.items():
    print(f"\n{'='*60}")
    print(f"MÓDULO {mod_num}")
    print(f"{'='*60}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Buscar títulos y tipos de ejercicios
    pattern = r"'([^']+)',\s*--.*\n.*\n.*\n.*\n.*exercise_type.*\n.*'([a-z_]+)'"

    # Patrón alternativo
    title_pattern = r"title, subtitle, description.*\n.*\n.*'([^']+)'"
    type_pattern = r"'([a-z_]+)', \d+,"

    # Buscar todos los títulos
    titles = re.findall(r"title, subtitle[^\n]*\n[^\n]*\n[^\n]*'([^']+)'", content)

    # Buscar todos los tipos de ejercicios
    types = re.findall(r"exercise_type, order_index[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*'([a-z_]+)', \d+,", content)

    print(f"\nTotal de ejercicios encontrados: {len(titles)}")
    print(f"\nEjercicios:")
    for i, (title, ex_type) in enumerate(zip(titles, types), 1):
        print(f"  {mod_num}.{i} - {title[:60]}... [{ex_type}]")

    # Resumen de tipos
    unique_types = set(types)
    print(f"\nTipos de ejercicios únicos: {len(unique_types)}")
    for t in sorted(unique_types):
        print(f"  - {t}")
