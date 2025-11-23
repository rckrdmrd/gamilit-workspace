#!/usr/bin/env python3
"""
TypeScript Types Inventory Extractor - SA-VAL-002
Extrae ENUMs, interfaces, types y DTOs de backend NestJS
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

class TypeScriptExtractor:
    def __init__(self, base_path: str):
        self.base_path = base_path
        self.enums = []
        self.const_enums = []
        self.interfaces = []
        self.types = []
        self.dtos = []
        self.problematic_files = []
        self.files_analyzed = 0
        self.type_files_analyzed = 0

    def read_file(self, filepath: str) -> Optional[str]:
        """Lee archivo de forma segura"""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception as e:
            self.problematic_files.append({
                "file": filepath,
                "error": str(e),
                "type": "read_error"
            })
            return None

    def extract_enum_values(self, enum_body: str, enum_type: str = 'enum') -> Tuple[List[str], Dict[str, str]]:
        """Extrae valores de un enum"""
        values = []
        value_mapping = {}

        if enum_type == 'const_object':
            # Para constantes: { KEY: 'value', ... }
            pattern = r'(\w+)\s*:\s*[\'"]([^\'"]+)[\'"]'
        else:
            # Para enums: { KEY = 'value', ... } o { KEY = valor, ... }
            pattern = r'(\w+)\s*=\s*[\'"]?([^\'"}\n,]+)[\'"]?'

        matches = re.finditer(pattern, enum_body)
        for match in matches:
            key = match.group(1).strip()
            val = match.group(2).strip().strip("'\"")
            values.append(key)
            value_mapping[key] = val

        return values, value_mapping

    def extract_enums(self):
        """Busca enums en archivos TypeScript"""
        pattern = r'export\s+enum\s+(\w+)\s*\{([^}]+)\}'

        for root, dirs, files in os.walk(self.base_path):
            # Excluir directorios no necesarios
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]

            for file in files:
                if file.endswith('.ts'):
                    filepath = os.path.join(root, file)
                    content = self.read_file(filepath)
                    if not content:
                        continue

                    self.files_analyzed += 1

                    matches = re.finditer(pattern, content, re.DOTALL)
                    for match in matches:
                        self.type_files_analyzed += 1
                        enum_name = match.group(1)
                        enum_body = match.group(2)
                        values, value_mapping = self.extract_enum_values(enum_body)

                        relative_path = filepath.replace(self.base_path + '/', '')
                        self.enums.append({
                            "name": enum_name,
                            "type": "enum",
                            "values": values,
                            "value_mapping": value_mapping,
                            "file": relative_path
                        })

    def extract_const_enums(self):
        """Busca constantes tipo enum"""
        # Busca: export const NAME = { ... } as const;
        pattern = r'export\s+const\s+(\w+)\s*=\s*\{([^}]+)\}\s*as\s+const'

        for root, dirs, files in os.walk(self.base_path):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]

            for file in files:
                if file.endswith('.ts'):
                    filepath = os.path.join(root, file)
                    content = self.read_file(filepath)
                    if not content:
                        continue

                    matches = re.finditer(pattern, content, re.DOTALL)
                    for match in matches:
                        self.type_files_analyzed += 1
                        const_name = match.group(1)
                        const_body = match.group(2)
                        values, value_mapping = self.extract_enum_values(const_body, enum_type='const_object')

                        relative_path = filepath.replace(self.base_path + '/', '')
                        self.const_enums.append({
                            "name": const_name,
                            "type": "const_object",
                            "values": values,
                            "value_mapping": value_mapping,
                            "file": relative_path
                        })

    def extract_interface_properties(self, interface_body: str) -> List[Dict]:
        """Extrae propiedades de una interfaz"""
        properties = []
        # Patrón: nombre?: tipo o nombre: tipo
        pattern = r'(\w+)(\?)?:\s*([^;\n]+);'

        matches = re.finditer(pattern, interface_body)
        for match in matches:
            prop_name = match.group(1)
            is_optional = match.group(2) is not None
            prop_type = match.group(3).strip()

            # Limpiar el tipo
            prop_type = re.sub(r'//.*$', '', prop_type).strip()

            properties.append({
                "name": prop_name,
                "type": prop_type,
                "optional": is_optional
            })

        return properties

    def extract_interfaces(self):
        """Busca interfaces en archivos TypeScript"""
        pattern = r'export\s+interface\s+(\w+)\s*(?:extends\s+[^{]*)?\{([^}]*)\}'

        for root, dirs, files in os.walk(self.base_path):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]

            for file in files:
                if file.endswith('.ts'):
                    filepath = os.path.join(root, file)
                    content = self.read_file(filepath)
                    if not content:
                        continue

                    matches = re.finditer(pattern, content, re.DOTALL)
                    for match in matches:
                        self.type_files_analyzed += 1
                        interface_name = match.group(1)
                        interface_body = match.group(2)
                        properties = self.extract_interface_properties(interface_body)

                        relative_path = filepath.replace(self.base_path + '/', '')
                        self.interfaces.append({
                            "name": interface_name,
                            "properties": properties,
                            "file": relative_path
                        })

    def extract_types(self):
        """Busca type definitions en archivos TypeScript"""
        pattern = r'export\s+type\s+(\w+)\s*=\s*([^;]+);'

        for root, dirs, files in os.walk(self.base_path):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]

            for file in files:
                if file.endswith('.ts'):
                    filepath = os.path.join(root, file)
                    content = self.read_file(filepath)
                    if not content:
                        continue

                    matches = re.finditer(pattern, content, re.DOTALL)
                    for match in matches:
                        self.type_files_analyzed += 1
                        type_name = match.group(1)
                        type_def = match.group(2).strip()

                        # Limpiar la definición
                        type_def = re.sub(r'\s+', ' ', type_def)
                        if len(type_def) > 200:
                            type_def = type_def[:200] + "..."

                        relative_path = filepath.replace(self.base_path + '/', '')
                        self.types.append({
                            "name": type_name,
                            "definition": type_def,
                            "file": relative_path
                        })

    def extract_dtos(self):
        """Busca DTO files y clases"""
        for root, dirs, files in os.walk(self.base_path):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]

            for file in files:
                if file.endswith('.dto.ts'):
                    filepath = os.path.join(root, file)
                    content = self.read_file(filepath)
                    if not content:
                        continue

                    self.type_files_analyzed += 1

                    # Buscar clases DTO
                    pattern = r'export\s+class\s+(\w+(?:Dto))\s*(?:implements|extends)?[^{]*\{([^}]*)\}'

                    matches = re.finditer(pattern, content, re.DOTALL)
                    for match in matches:
                        class_name = match.group(1)
                        class_body = match.group(2)
                        properties = self.extract_dto_properties(class_body)

                        relative_path = filepath.replace(self.base_path + '/', '')
                        self.dtos.append({
                            "name": class_name,
                            "properties": properties,
                            "file": relative_path,
                            "parsed": len(properties) > 0
                        })

    def extract_dto_properties(self, class_body: str) -> List[Dict]:
        """Extrae propiedades de una clase DTO"""
        properties = []
        lines = class_body.split('\n')

        i = 0
        while i < len(lines):
            line = lines[i].strip()

            # Buscar decoradores (@...)
            decorators = []
            while i < len(lines) and lines[i].strip().startswith('@'):
                decorator = lines[i].strip()
                decorators.append(decorator)
                i += 1

            # Buscar propiedad (nombre?: tipo)
            pattern = r'(\w+)(\?)?:\s*([^;=\n]+)'
            line = lines[i].strip() if i < len(lines) else ""
            match = re.match(pattern, line)

            if match:
                prop_name = match.group(1)
                is_optional = match.group(2) is not None
                prop_type = match.group(3).strip()

                properties.append({
                    "name": prop_name,
                    "type": prop_type,
                    "decorators": decorators,
                    "optional": is_optional
                })

            i += 1

        return properties

    def extract_all(self):
        """Ejecuta todas las extracciones"""
        print("Extrayendo ENUMs...")
        self.extract_enums()
        print(f"  Encontrados: {len(self.enums)}")

        print("Extrayendo constantes tipo ENUM...")
        self.extract_const_enums()
        print(f"  Encontradas: {len(self.const_enums)}")

        print("Extrayendo Interfaces...")
        self.extract_interfaces()
        print(f"  Encontradas: {len(self.interfaces)}")

        print("Extrayendo Types...")
        self.extract_types()
        print(f"  Encontrados: {len(self.types)}")

        print("Extrayendo DTOs...")
        self.extract_dtos()
        print(f"  Encontrados: {len(self.dtos)}")

    def generate_inventory(self) -> Dict[str, Any]:
        """Genera el JSON de inventario"""
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "files_analyzed": self.files_analyzed,
            "type_files_analyzed": self.type_files_analyzed,
            "enums": self.enums,
            "const_enums": self.const_enums,
            "interfaces": self.interfaces,
            "types": self.types,
            "dtos": self.dtos,
            "summary": {
                "total_enums": len(self.enums),
                "total_const_enums": len(self.const_enums),
                "total_interfaces": len(self.interfaces),
                "total_types": len(self.types),
                "total_dtos": len(self.dtos),
                "problematic_files": len(self.problematic_files)
            },
            "problematic_files": self.problematic_files
        }

def main():
    backend_path = "/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/backend/src"

    print("=== TypeScript Types Inventory Extractor ===")
    print(f"Analizando: {backend_path}\n")

    extractor = TypeScriptExtractor(backend_path)
    extractor.extract_all()

    inventory = extractor.generate_inventory()

    # Guardar JSON
    output_dir = "/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/inventarios"
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(output_dir, "backend-types.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)

    print(f"\nInventario guardado en: {output_file}")
    print(f"\nResumen final:")
    print(f"  - Archivos analizados: {inventory['files_analyzed']}")
    print(f"  - Archivos con tipos: {inventory['type_files_analyzed']}")
    print(f"  - ENUMs encontrados: {inventory['summary']['total_enums']}")
    print(f"  - Constantes ENUM: {inventory['summary']['total_const_enums']}")
    print(f"  - Interfaces: {inventory['summary']['total_interfaces']}")
    print(f"  - Types: {inventory['summary']['total_types']}")
    print(f"  - DTOs: {inventory['summary']['total_dtos']}")
    print(f"  - Archivos problemáticos: {inventory['summary']['problematic_files']}")

if __name__ == "__main__":
    main()
