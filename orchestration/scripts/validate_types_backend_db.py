#!/usr/bin/env python3
"""
SA-VAL-008: Validación profunda de tipos TypeScript vs PostgreSQL
Compara las 64 tablas de Database con 223 tipos del Backend
"""

import json
import re
import os
from datetime import datetime
from typing import Dict, List, Any, Set, Optional, Tuple
from collections import defaultdict

# =======================
# CONSTANTES
# =======================

BASE_DDL_PATH = '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas'
DB_INVENTORY_PATH = '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/inventarios/database-ddl.json'
BACKEND_INVENTORY_PATH = '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/inventarios/backend-types.json'
OUTPUT_PATH = '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/validaciones/types-backend-db.json'

# Tablas join conocidas (many-to-many)
JOIN_TABLES = {
    'classroom_members', 'classroom_students', 'assignment_classrooms',
    'assignment_exercises', 'assignment_students', 'team_members',
    'user_roles', 'user_achievements', 'user_sessions', 'memberships'
}

# Tablas de auditoría (solo inserts desde triggers)
AUDIT_TABLES = {
    'audit_logs', 'system_logs', 'user_activity_logs', 'performance_metrics',
    'system_alerts', 'security_events', 'user_activity'
}

# =======================
# FUNCIONES DE MAPEO
# =======================

def snake_to_camel(snake_str: str) -> str:
    """Convierte snake_case a camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def snake_to_pascal(snake_str: str) -> str:
    """Convierte snake_case a PascalCase"""
    components = snake_str.split('_')
    return ''.join(x.title() for x in components)

def table_to_interface_name(table_name: str) -> str:
    """Convierte nombre de tabla a nombre de interface (singular PascalCase)"""
    singular = table_name
    if singular.endswith('ies'):
        singular = singular[:-3] + 'y'
    elif singular.endswith('sses'):
        singular = singular[:-2]
    elif singular.endswith('ches'):
        singular = singular[:-2]
    elif singular.endswith('xes'):
        singular = singular[:-2]
    elif singular.endswith('es') and not singular.endswith('oes'):
        if len(singular) > 3 and singular[-3] not in 'aeiou':
            singular = singular[:-1]
    elif singular.endswith('s') and not singular.endswith('ss') and not singular.endswith('us'):
        singular = singular[:-1]

    return snake_to_pascal(singular)

def pg_type_to_ts_types(pg_type: str, is_array: bool = False) -> Set[str]:
    """Mapea tipo PostgreSQL a tipos TypeScript posibles"""
    pg_type_clean = re.sub(r'\([^)]*\)', '', pg_type).strip().lower()

    type_map = {
        'uuid': {'string'},
        'integer': {'number'},
        'bigint': {'number', 'string'},
        'smallint': {'number'},
        'numeric': {'number'},
        'decimal': {'number'},
        'real': {'number'},
        'double precision': {'number'},
        'text': {'string'},
        'varchar': {'string'},
        'character varying': {'string'},
        'char': {'string'},
        'character': {'string'},
        'boolean': {'boolean'},
        'timestamp': {'Date', 'string'},
        'timestamp with time zone': {'Date', 'string'},
        'timestamp without time zone': {'Date', 'string'},
        'timestamptz': {'Date', 'string'},
        'date': {'Date', 'string'},
        'time': {'string'},
        'jsonb': {'Record<string, any>', 'any', 'object'},
        'json': {'Record<string, any>', 'any', 'object'},
        'inet': {'string'},
    }

    result_types = None
    for pg_key, ts_types in type_map.items():
        if pg_key in pg_type_clean:
            result_types = ts_types
            break

    if result_types is None:
        result_types = {'string', 'any'}

    if is_array:
        return {f"{t}[]" for t in result_types}

    return result_types

def normalize_ts_type(ts_type: str) -> str:
    """Normaliza tipo TypeScript para comparación"""
    if not ts_type:
        return 'any'
    ts_type = ts_type.strip()
    ts_type = re.sub(r'Record<\s*string\s*,\s*any\s*>', 'Record<string, any>', ts_type)
    ts_type = re.sub(r'\s+', '', ts_type)
    return ts_type

def parse_sql_columns(sql_content: str) -> List[Dict[str, Any]]:
    """Parsea las columnas de un archivo SQL CREATE TABLE"""
    columns = []

    match = re.search(r'CREATE TABLE[^(]*\((.*?)\);', sql_content, re.DOTALL | re.IGNORECASE)
    if not match:
        return columns

    table_def = match.group(1)
    lines = table_def.split('\n')

    for line in lines:
        line = line.strip()
        if not line or line.startswith('--') or line.upper().startswith('CONSTRAINT'):
            continue

        if line.endswith(','):
            line = line[:-1].strip()

        parts = line.split(maxsplit=2)
        if len(parts) < 2:
            continue

        col_name = parts[0].strip()
        col_type = parts[1].strip()
        constraints = parts[2] if len(parts) > 2 else ''

        is_array = '[]' in col_type
        col_type_base = col_type.replace('[]', '')

        not_null = 'NOT NULL' in constraints.upper()
        has_default = 'DEFAULT' in constraints.upper()

        default_value = None
        if has_default:
            default_match = re.search(r'DEFAULT\s+([^\s,]+)', constraints, re.IGNORECASE)
            if default_match:
                default_value = default_match.group(1)

        columns.append({
            'name': col_name,
            'type': col_type_base,
            'is_array': is_array,
            'nullable': not not_null,
            'has_default': has_default,
            'default_value': default_value,
            'constraints': constraints
        })

    return columns

def find_matching_types(table_name: str, schema_name: str, backend_data: dict) -> Dict[str, Any]:
    """Encuentra interfaces, DTOs y entities que coincidan con la tabla"""
    expected_interface = table_to_interface_name(table_name)
    expected_dto_create = f"Create{expected_interface}Dto"
    expected_dto_update = f"Update{expected_interface}Dto"
    expected_entity = f"{expected_interface}Entity"
    expected_response = f"{expected_interface}ResponseDto"

    results = {
        'interface': None,
        'entity': None,
        'dto_create': None,
        'dto_update': None,
        'response_dto': None,
        'candidates': []
    }

    # Buscar interfaces (User, Achievement, etc.)
    for iface in backend_data.get('interfaces', []):
        name = iface['name']
        if expected_interface == name or expected_entity == name:
            results['entity'] = iface
        elif expected_interface.lower() in name.lower():
            results['candidates'].append(('interface', name, iface))

    # Buscar DTOs
    for dto in backend_data.get('dtos', []):
        name = dto['name']
        if expected_dto_create == name:
            results['dto_create'] = dto
        elif expected_dto_update == name:
            results['dto_update'] = dto
        elif expected_response == name:
            results['response_dto'] = dto
        elif 'Response' in name and expected_interface in name:
            results['response_dto'] = dto
        elif expected_interface.lower() in name.lower():
            results['candidates'].append(('dto', name, dto))

    # Si no hay entity pero hay ResponseDto, usar ResponseDto como referencia
    if not results['entity'] and results['response_dto']:
        results['entity'] = results['response_dto']

    # Si no hay entity pero hay CreateDto con properties, usar CreateDto como referencia
    if not results['entity'] and results['dto_create'] and results['dto_create'].get('properties'):
        results['entity'] = results['dto_create']

    return results

def compare_types(db_type: str, db_array: bool, ts_type: str) -> Tuple[bool, str]:
    """Compara tipo de DB con tipo TS y retorna (match, expected_type)"""
    expected_ts_types = pg_type_to_ts_types(db_type, db_array)
    normalized_ts = normalize_ts_type(ts_type)

    for expected in expected_ts_types:
        if normalize_ts_type(expected) == normalized_ts:
            return True, None

    # Verificar si es un tipo compatible pero diferente
    for expected in expected_ts_types:
        if 'any' in normalized_ts.lower() or 'object' in normalized_ts.lower():
            if db_type.lower() in ['jsonb', 'json']:
                return True, None  # any/object es aceptable para JSON

    # No coincide
    return False, ' | '.join(sorted(expected_ts_types))

def analyze_table(table_info: dict, backend_data: dict, db_enums: dict) -> Dict[str, Any]:
    """Analiza una tabla completa comparando con tipos backend"""
    schema = table_info['schema']
    table_name = table_info['name']
    full_name = f"{schema}.{table_name}"

    # Leer archivo DDL
    sql_file_path = f"{BASE_DDL_PATH}/{schema}/tables/{table_info['file'].split('/')[-1]}"

    if not os.path.exists(sql_file_path):
        return {
            'table': full_name,
            'error': 'DDL file not found',
            'file_path': sql_file_path
        }

    with open(sql_file_path, 'r') as f:
        sql_content = f.read()

    db_columns = parse_sql_columns(sql_content)

    # Buscar tipos correspondientes
    type_matches = find_matching_types(table_name, schema, backend_data)

    # Preparar resultado
    result = {
        'table': full_name,
        'interface': type_matches['entity']['name'] if type_matches['entity'] else None,
        'dto_create': type_matches['dto_create']['name'] if type_matches['dto_create'] else None,
        'dto_update': type_matches['dto_update']['name'] if type_matches['dto_update'] else None,
        'response_dto': type_matches['response_dto']['name'] if type_matches['response_dto'] else None,
        'total_columns': len(db_columns),
        'missing_columns_in_type': [],
        'extra_properties_in_type': [],
        'type_mismatches': [],
        'dto_issues': []
    }

    # Si no hay entity/interface, marcar como sin tipo
    if not type_matches['entity']:
        return result

    # Analizar columnas vs propiedades
    entity = type_matches['entity']
    entity_props = {prop['name']: prop for prop in entity.get('properties', [])}

    # Columnas que deberían estar en el tipo
    for col in db_columns:
        col_name = col['name']
        prop_name = snake_to_camel(col_name)

        # Columnas auto-gestionadas que pueden no estar en el tipo
        auto_managed = col_name in ['id', 'created_at', 'updated_at', 'deleted_at']

        if prop_name not in entity_props and col_name not in entity_props:
            if not auto_managed:
                result['missing_columns_in_type'].append(col_name)
        else:
            # Verificar tipo
            prop = entity_props.get(prop_name) or entity_props.get(col_name)
            if prop:
                ts_type = prop['type']
                type_match, expected_type = compare_types(col['type'], col['is_array'], ts_type)

                if not type_match:
                    severity = 'high' if col_name in ['id', 'user_id', 'status'] else 'medium'
                    result['type_mismatches'].append({
                        'column': col_name,
                        'db_type': col['type'],
                        'db_array': col['is_array'],
                        'ts_type': ts_type,
                        'expected_ts_type': expected_type,
                        'severity': severity,
                        'recommendation': f"Cambiar tipo a {expected_type}"
                    })

                # Verificar nullability
                db_optional = col['nullable'] or col['has_default']
                ts_optional = prop['optional']

                if db_optional != ts_optional:
                    severity = 'medium' if col['nullable'] else 'low'
                    result['type_mismatches'].append({
                        'column': col_name,
                        'db_type': col['type'],
                        'db_nullable': col['nullable'],
                        'ts_type': ts_type,
                        'ts_optional': ts_optional,
                        'severity': severity,
                        'recommendation': f"Marcar {col_name} como {'optional' if db_optional else 'required'}"
                    })

    # Propiedades extra en el tipo
    db_col_names = {col['name'] for col in db_columns}
    db_col_names_camel = {snake_to_camel(col['name']) for col in db_columns}

    for prop_name, prop in entity_props.items():
        if prop_name not in db_col_names and prop_name not in db_col_names_camel:
            # Puede ser computed property
            if not prop_name.startswith('_') and prop_name not in ['key', 'type']:
                result['extra_properties_in_type'].append(prop_name)

    # Analizar DTOs si existen
    for dto_type in ['dto_create', 'dto_update']:
        dto = type_matches.get(dto_type)
        if dto and dto.get('properties'):
            dto_name = dto['name']
            for prop in dto['properties']:
                prop_name = prop['name']
                decorators = prop.get('decorators', [])

                # Buscar la columna correspondiente
                col_name_snake = None
                for col in db_columns:
                    if snake_to_camel(col['name']) == prop_name or col['name'] == prop_name:
                        col_name_snake = col['name']
                        break

                if col_name_snake:
                    col = next((c for c in db_columns if c['name'] == col_name_snake), None)
                    if col:
                        # Verificar decoradores vs tipo de columna
                        if col['type'] == 'uuid' and '@IsUUID' not in ''.join(decorators):
                            result['dto_issues'].append({
                                'dto': dto_name,
                                'property': prop_name,
                                'column': col_name_snake,
                                'decorators': decorators,
                                'expected_decorators': ["@IsUUID('4')"],
                                'severity': 'high'
                            })
                        elif col['type'] in ['integer', 'smallint', 'bigint'] and '@IsInt' not in ''.join(decorators) and '@IsNumber' not in ''.join(decorators):
                            result['dto_issues'].append({
                                'dto': dto_name,
                                'property': prop_name,
                                'column': col_name_snake,
                                'decorators': decorators,
                                'expected_decorators': ["@IsInt()"],
                                'severity': 'medium'
                            })
                        elif col['type'] == 'boolean' and '@IsBoolean' not in ''.join(decorators):
                            result['dto_issues'].append({
                                'dto': dto_name,
                                'property': prop_name,
                                'column': col_name_snake,
                                'decorators': decorators,
                                'expected_decorators': ["@IsBoolean()"],
                                'severity': 'medium'
                            })

    return result

# =======================
# MAIN
# =======================

def main():
    print("=== SA-VAL-008: Validación de Tipos Backend vs Database ===\n")

    # Cargar inventarios
    print("Cargando inventarios...")
    with open(DB_INVENTORY_PATH, 'r') as f:
        db_data = json.load(f)

    with open(BACKEND_INVENTORY_PATH, 'r') as f:
        backend_data = json.load(f)

    print(f"✓ Tablas en DB: {len(db_data['tables'])}")
    print(f"✓ Tipos Backend: {len(backend_data['interfaces'])} interfaces + {len(backend_data['dtos'])} DTOs")

    # Crear mapeo de enums
    db_enums = {enum['name']: enum for enum in db_data.get('enums', [])}

    # Analizar todas las tablas
    print("\nAnalizando tablas...")

    discrepancies = []
    tables_without_types = []
    tables_analyzed = 0
    tables_with_types = 0
    total_columns = 0

    for table_info in db_data['tables']:
        tables_analyzed += 1
        schema = table_info['schema']
        table_name = table_info['name']

        print(f"  [{tables_analyzed}/64] {schema}.{table_name}", end=' ... ')

        result = analyze_table(table_info, backend_data, db_enums)

        if 'error' in result:
            print(f"ERROR: {result['error']}")
            continue

        total_columns += result['total_columns']

        if result['interface']:
            tables_with_types += 1
            print("✓")

            # Agregar a discrepancies si hay problemas
            if (result['missing_columns_in_type'] or result['extra_properties_in_type'] or
                result['type_mismatches'] or result['dto_issues']):
                discrepancies.append(result)
        else:
            print("✗")
            # Determinar motivo
            is_join = table_name in JOIN_TABLES
            is_audit = table_name in AUDIT_TABLES

            reason = 'join_table' if is_join else ('audit_table' if is_audit else 'missing_type')
            recommendation = (
                'Puede no necesitar interface (join table)' if is_join else
                'Puede no necesitar DTOs (solo inserts desde triggers)' if is_audit else
                'Crear interface y DTOs'
            )

            tables_without_types.append({
                'table': f"{schema}.{table_name}",
                'expected_interface': table_to_interface_name(table_name),
                'reason': reason,
                'recommendation': recommendation
            })

    # Calcular métricas
    critical_count = sum(1 for d in discrepancies for issue in d.get('type_mismatches', []) if issue.get('severity') == 'critical')
    high_count = sum(1 for d in discrepancies for issue in d.get('type_mismatches', []) if issue.get('severity') == 'high')
    high_count += sum(1 for d in discrepancies for issue in d.get('dto_issues', []) if issue.get('severity') == 'high')
    medium_count = sum(1 for d in discrepancies for issue in d.get('type_mismatches', []) if issue.get('severity') == 'medium')
    medium_count += sum(1 for d in discrepancies for issue in d.get('dto_issues', []) if issue.get('severity') == 'medium')
    low_count = sum(1 for d in discrepancies for issue in d.get('type_mismatches', []) if issue.get('severity') == 'low')

    total_discrepancies = critical_count + high_count + medium_count + low_count
    coverage = (tables_with_types / tables_analyzed * 100) if tables_analyzed > 0 else 0

    # Top 5 tablas con más discrepancias
    top_discrepancies = sorted(
        discrepancies,
        key=lambda d: len(d.get('type_mismatches', [])) + len(d.get('dto_issues', [])),
        reverse=True
    )[:5]

    # Generar reporte
    report = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'tables_analyzed': tables_analyzed,
        'tables_with_types': tables_with_types,
        'tables_without_types': len(tables_without_types),
        'total_columns_analyzed': total_columns,
        'discrepancies': discrepancies,
        'tables_without_interface': tables_without_types,
        'summary': {
            'total_discrepancies': total_discrepancies,
            'critical': critical_count,
            'high': high_count,
            'medium': medium_count,
            'low': low_count,
            'coverage': round(coverage, 2)
        },
        'top_5_tables_with_issues': [
            {
                'table': d['table'],
                'issues_count': len(d.get('type_mismatches', [])) + len(d.get('dto_issues', [])),
                'missing_columns': len(d.get('missing_columns_in_type', [])),
                'type_mismatches': len(d.get('type_mismatches', [])),
                'dto_issues': len(d.get('dto_issues', []))
            }
            for d in top_discrepancies
        ]
    }

    # Guardar reporte
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(report, f, indent=2)

    # Resumen en consola
    print("\n" + "="*80)
    print("=== RESUMEN DE VALIDACIÓN ===")
    print("="*80)
    print(f"\nTablas analizadas: {tables_analyzed}")
    print(f"Tablas con tipos: {tables_with_types}")
    print(f"Tablas sin tipos: {len(tables_without_types)}")
    print(f"Cobertura de tipos: {coverage:.1f}%")
    print(f"\nTotal de discrepancias: {total_discrepancies}")
    print(f"  - Critical: {critical_count}")
    print(f"  - High: {high_count}")
    print(f"  - Medium: {medium_count}")
    print(f"  - Low: {low_count}")
    print(f"\nReporte guardado en:")
    print(f"  {OUTPUT_PATH}")

    if top_discrepancies:
        print(f"\n=== TOP 5 TABLAS CON MÁS PROBLEMAS ===")
        for i, item in enumerate(report['top_5_tables_with_issues'], 1):
            print(f"{i}. {item['table']}: {item['issues_count']} problemas")

if __name__ == '__main__':
    main()
