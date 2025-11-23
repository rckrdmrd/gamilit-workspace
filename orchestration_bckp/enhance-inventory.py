#!/usr/bin/env python3
"""
Enriquece el inventario de tipos con análisis por módulo
"""

import json
import re
from collections import defaultdict
from pathlib import Path

def enhance_inventory():
    # Cargar inventario base
    with open('/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/inventarios/backend-types.json', 'r') as f:
        inventory = json.load(f)

    # Analizar distribución por módulo
    module_stats = defaultdict(lambda: {
        "enums": 0,
        "interfaces": 0,
        "types": 0,
        "dtos": 0,
        "total": 0,
        "files": set()
    })

    # Procesar ENUMs
    for enum in inventory['enums']:
        match = re.match(r'modules/(\w+)/', enum['file'])
        if match:
            module = match.group(1)
            module_stats[module]['enums'] += 1
            module_stats[module]['total'] += 1
            module_stats[module]['files'].add(enum['file'])

    # Procesar Interfaces
    for interface in inventory['interfaces']:
        match = re.match(r'modules/(\w+)/', interface['file'])
        if match:
            module = match.group(1)
            module_stats[module]['interfaces'] += 1
            module_stats[module]['total'] += 1
            module_stats[module]['files'].add(interface['file'])

    # Procesar Types
    for type_def in inventory['types']:
        match = re.match(r'modules/(\w+)/', type_def['file'])
        if match:
            module = match.group(1)
            module_stats[module]['types'] += 1
            module_stats[module]['total'] += 1
            module_stats[module]['files'].add(type_def['file'])
        elif re.match(r'shared/', type_def['file']):
            module = "shared"
            module_stats[module]['types'] += 1
            module_stats[module]['total'] += 1
            module_stats[module]['files'].add(type_def['file'])

    # Procesar DTOs
    for dto in inventory['dtos']:
        match = re.match(r'modules/(\w+)/', dto['file'])
        if match:
            module = match.group(1)
            module_stats[module]['dtos'] += 1
            module_stats[module]['total'] += 1
            module_stats[module]['files'].add(dto['file'])

    # Convertir sets a listas
    module_analysis = {}
    for module, stats in sorted(module_stats.items()):
        module_analysis[module] = {
            "enums": stats['enums'],
            "interfaces": stats['interfaces'],
            "types": stats['types'],
            "dtos": stats['dtos'],
            "total_types": stats['total'],
            "files_count": len(stats['files'])
        }

    # Agregar análisis al inventario
    inventory['module_analysis'] = module_analysis

    # Agregar conteo de tipos por categoría
    inventory['summary']['by_category'] = {
        'total_all_types': sum([
            inventory['summary']['total_enums'],
            inventory['summary']['total_const_enums'],
            inventory['summary']['total_interfaces'],
            inventory['summary']['total_types'],
            inventory['summary']['total_dtos']
        ]),
        'by_module': len(module_analysis)
    }

    # Guardar inventario enriquecido
    with open('/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/inventarios/backend-types.json', 'w') as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)

    print("Inventario enriquecido correctamente")
    print(f"\nMódulos analizados: {len(module_analysis)}")
    for module in sorted(module_analysis.keys()):
        stats = module_analysis[module]
        print(f"\n{module}:")
        print(f"  ENUMs: {stats['enums']}")
        print(f"  Interfaces: {stats['interfaces']}")
        print(f"  Types: {stats['types']}")
        print(f"  DTOs: {stats['dtos']}")
        print(f"  Total: {stats['total_types']}")
        print(f"  Archivos: {stats['files_count']}")

if __name__ == "__main__":
    enhance_inventory()
