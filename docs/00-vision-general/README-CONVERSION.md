# Conversión de DOCX a Markdown - GAMILIT

Este directorio contiene la conversión del documento de diseño de GAMILIT de formato DOCX a Markdown.

## Archivos Principales

### Documento Final
- **`DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.md`** - Documento convertido a Markdown con todas las imágenes descritas

### Documento Original
- **`DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.docx`** - Documento original en formato Word

### Scripts de Conversión
- **`convert_docx_to_md.py`** - Script principal de conversión DOCX → Markdown
- **`add_image_descriptions.py`** - Script que agrega descripciones detalladas a las imágenes

### Resumen
- **`CONVERSION_SUMMARY.md`** - Resumen completo del proceso de conversión

## Cómo se Procesaron las Imágenes

### 1. Imágenes Funcionales
Las imágenes que contienen información importante se representaron de manera textual:

**Ejemplo - Diagrama de Flujo:**
```
┌─────────────────────────┐
│       INICIO            │
│   [Login/Registro]      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  SELECCIÓN DE MÓDULO    │
└─────────────────────────┘
```

**Ejemplo - Tabla de Datos:**
| Rango | Nombre Maya | Requisito | ML Bonus |
|-------|-------------|-----------|----------|
| 1 | AJAW | Completar Módulo 1 | +50 ML |
| 2 | NACOM | Completar Módulo 2 | +75 ML |

**Ejemplo - Interfaz de Usuario:**
Se describió cada elemento de la interfaz con su contenido textual completo.

### 2. Imágenes Decorativas
Las imágenes puramente decorativas se marcaron como:
- `**[Separador visual - Línea decorativa]**`
- `**[Elemento visual decorativo - descripción]**`

## Estructura del Documento Convertido

```
DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.md
├── Título y Metadata
├── Índice
├── Sistema de Rangos Mayas
│   ├── Descripción
│   ├── Jerarquía de Rangos
│   └── Bonus ML por Rango
├── Módulo 1: Comprensión Literal
│   ├── Ejercicio 1.1: Crucigrama Científico
│   ├── Ejercicio 1.2: Línea de Tiempo
│   ├── Ejercicio 1.3: Completar Espacios
│   ├── Ejercicio 1.4: Verdadero o Falso
│   └── Ejercicio 1.5: Sopa de Letras
├── Módulo 2: Comprensión Inferencial
│   ├── Ejercicio 2.1: Detective Textual
│   ├── Ejercicio 2.2: Construcción de Hipótesis
│   ├── Ejercicio 2.3: Predicción Narrativa
│   ├── Ejercicio 2.4: Puzzle de Contexto
│   └── Ejercicio 2.5: Rueda de Inferencias
├── Módulo 3: Comprensión Crítica y Valorativa
│   └── [5 ejercicios]
├── Módulo 4: Lectura Digital y Multimodal
│   └── [5 ejercicios]
├── Módulo 5: Producción y Expresión Lectora
│   ├── Opción A: Diario Interactivo
│   ├── Opción B: Resumen Visual (Cómic)
│   └── Opción C: Cápsula del Tiempo
├── Sistema de Comodines ML
│   ├── Tipos de Comodines
│   └── Costos y Penalizaciones
├── Diagrama de Navegación Completo
└── Certificación Final
```

## Uso de los Scripts

### Script 1: Conversión Básica
```bash
python3 convert_docx_to_md.py
```

Este script:
1. Extrae el archivo DOCX (formato ZIP)
2. Parsea el XML del documento
3. Convierte el contenido a Markdown
4. Preserva formato (negrita, cursiva)
5. Convierte tablas
6. Procesa listas y jerarquías

### Script 2: Agregar Descripciones
```bash
python3 add_image_descriptions.py
```

Este script:
1. Lee el Markdown generado
2. Identifica referencias a imágenes
3. Reemplaza con descripciones detalladas
4. Crea representaciones ASCII para diagramas
5. Convierte contenido visual a texto

## Re-ejecutar la Conversión

Si necesitas volver a convertir el documento:

```bash
# 1. Eliminar archivos temporales
rm -rf docx_extracted/
rm DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.md

# 2. Ejecutar conversión
python3 convert_docx_to_md.py

# 3. Agregar descripciones
python3 add_image_descriptions.py
```

## Características Preservadas

✅ **Formato de texto**
- Negrita: `**texto**`
- Cursiva: `*texto*`
- Negrita + Cursiva: `***texto***`

✅ **Jerarquía de títulos**
- H1: `# Título`
- H2: `## Título`
- H3-H6: Niveles adicionales

✅ **Listas**
- Viñetas con niveles anidados
- Numeración preservada

✅ **Tablas**
- Formato Markdown estándar
- Encabezados y datos

✅ **Contenido visual**
- Diagramas como ASCII art
- Tablas de imágenes convertidas
- Interfaces descritas textualmente

## Ventajas del Formato Markdown

1. **Legibilidad** - Texto plano, fácil de leer
2. **Versionable** - Compatible con Git
3. **Portable** - Cualquier editor de texto
4. **Convertible** - A HTML, PDF, etc.
5. **Colaborativo** - Fácil de editar en equipo
6. **Búsqueda** - Indexable y buscable

## Notas Técnicas

- El documento DOCX es un archivo ZIP que contiene XML
- Las imágenes originales están en `docx_extracted/word/media/`
- Los estilos se mapean a equivalentes Markdown
- Las imágenes se analizaron visualmente para crear descripciones precisas

## Mantenimiento

Si se actualiza el documento DOCX original:
1. Reemplazar el archivo `.docx`
2. Ejecutar ambos scripts en orden
3. Revisar las descripciones de nuevas imágenes
4. Actualizar `IMAGE_DESCRIPTIONS` en `add_image_descriptions.py` si es necesario

## Contacto

Para preguntas sobre la conversión, consultar el archivo `CONVERSION_SUMMARY.md`.
