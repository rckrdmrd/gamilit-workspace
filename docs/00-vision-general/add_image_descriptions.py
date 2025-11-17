#!/usr/bin/env python3
"""
Script para agregar descripciones detalladas de imágenes al documento Markdown
"""

# Diccionario con descripciones detalladas de cada imagen
IMAGE_DESCRIPTIONS = {
    'image1.png': '''**Diagrama: Requisitos para Mercenario**
```
┌─────────────────────────────────────────────┐
│ 5/5 Módulos = MERCENARIO (Máximo Rango)     │
└─────────────────────────────────────────────┘
```''',

    'image2.png': '''**Interfaz: Tienda de Comodines y Ejercicio de Timeline**

*Sección Superior - Tienda de Comodines:*
┌──────────────────────────────────────────────────────────┐
│ 🪙 100 ML                    Tienda de Comodines         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐    │
│  │   PISTA     │  │   VISIÓN     │  │  SEGUNDA    │    │
│  │             │  │   LECTORA    │  │ OPORTUNIDAD │    │
│  │  Sugiere    │  │              │  │             │    │
│  │  palabras   │  │  Subraya un  │  │ Le brinda   │    │
│  │  claves que │  │  fragmento   │  │ al jugador  │    │
│  │  pueden ser │  │  del texto   │  │ una 2da     │    │
│  │  esenciales │  │  que contiene│  │ oportunidad │    │
│  │  para la    │  │  la info     │  │ para        │    │
│  │  comprensión│  │  relevante   │  │ seleccionar │    │
│  │  del texto  │  │              │  │ una opción  │    │
│  │             │  │              │  │ en caso de  │    │
│  │   15 ML     │  │   25 ML      │  │ falla 1ra   │    │
│  │             │  │              │  │ vez         │    │
│  │             │  │              │  │   40 ML     │    │
│  └─────────────┘  └──────────────┘  └─────────────┘    │
└──────────────────────────────────────────────────────────┘

*Sección Inferior - Ejercicio Timeline:*
┌──────────────────────────────────────────────────────────┐
│ ⏱ Tiempo estimado: 15 minutos                           │
│                                                          │
│ Ordena cronológicamente los eventos más importantes de  │
│ la vida de Marie Curie.                                 │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         📖                                      │    │
│  │   Contenido del Ejercicio: timeline             │    │
│  │   El contenido específico del ejercicio se      │    │
│  │   implementará aquí.                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Volver al Módulo]            [Completar Ejercicio]    │
└──────────────────────────────────────────────────────────┘
''',

    'image4.png': '''**Tabla: Pistas del Crucigrama Científico**

**Pistas Horizontales:**

| # | Pista | Respuesta | Posición |
|---|-------|-----------|----------|
| 1 | Universidad donde estudió | SORBONA | Fila 4, Col 3 (7 letras) |
| 2 | Premio recibido en 1903 y 1911 | NOBEL | Fila 6, Col 3 (5 letras) |
| 3 | Fenómeno de emisión espontánea de radiación descubierto por Marie | RADIOACTIVIDAD | Fila 8, Col 1 (14 letras) |

**Pistas Verticales:**

| # | Pista | Respuesta | Posición |
|---|-------|-----------|----------|
| 4 | Elemento químico nombrado en honor a Polonia | POLONIO | Fila 3, Col 4 (7 letras) |
| 5 | Elemento químico radiactivo descubierto | RADIO | Fila 8, Col 1 (5 letras) |
| 6 | Apellido de Marie | CURIE | Fila 8, Col 7 (5 letras) |
''',

    'image26.png': '''**[Separador visual - Línea decorativa]**''',

    'image30.png': '''**Diagrama: Flujo del Sistema de Ejercicios**

```
┌─────────────────────────────────┐
│   EJERCICIOS POR MÓDULO         │
├─────────────────────────────────┤
│ Módulos 1-4: Completar 5        │
│              ejercicios         │
│ Módulo 5: Elegir 1 de 3         │
│           opciones              │
│                                 │
│ [Sistema de Comodines           │
│  Disponible]                    │
│  💡 Pistas (15 ML)              │
│  👁 Visión (25 ML)               │
│  🔄 Segunda Oportunidad (40 ML) │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   PROGRESO Y LOGROS             │
├─────────────────────────────────┤
│ Completar Módulo → Nuevo Rango  │
│                     Maya        │
│ Bonus ML → Economía del Sistema │
└─────────────────────────────────┘
```''',

    'image31.png': '''**Interfaz: Crucigrama Científico con Pistas**

*Cuadrícula del Crucigrama (15x15):*
```
Fila 0:  □ □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 1:  □ □ □ □ □ □ □ C □ □ □ □ □ □ □
Fila 2:  □ □ □ □ □ □ □ U □ □ □ □ □ □ □
Fila 3:  □ □ □ □ P □ □ R □ □ □ □ □ □ □
Fila 4:  □ □ □ S O R B O N A □ □ □ □ □
Fila 5:  □ □ □ □ L □ □ I □ □ □ □ □ □ □
Fila 6:  □ □ □ N O B E L □ □ □ □ □ □ □
Fila 7:  □ □ □ □ N □ □ □ □ □ □ □ □ □ □
Fila 8:  R A D I O A C T I V I D A D □
Fila 9:  A □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 10: D □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 11: I □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 12: O □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 13: □ □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 14: □ □ □ □ □ □ □ □ □ □ □ □ □ □ □
```

*Panel de Pistas:*

**HORIZONTALES:**
1. Universidad donde estudió (Fila 4) → SORBONA
2. Premio recibido en 1903 y 1911 (Fila 6) → NOBEL
3. Fenómeno de emisión espontánea de radiación (Fila 8) → RADIOACTIVIDAD

**VERTICALES:**
4. Elemento químico nombrado en honor a Polonia (Col 4) → POLONIO
5. Elemento químico radiactivo descubierto (Col 1) → RADIO
6. Apellido de Marie (Col 7) → CURIE
''',

    'image40.png': '''**Icono: Trofeo**

🏆
[Icono de trofeo dorado sobre base marrón - representa logros y certificación]
''',

    'image41.png': '''**Diagrama: Flujo de Navegación Principal**

```
┌─────────────────────────┐
│       INICIO            │
│   [Login/Registro]      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│    SELECCIÓN DE MÓDULO                  │
├─────────────────────────────────────────┤
│ [✓] Módulo 1 → Desbloqueado → NACOM    │
│ [🔒] Módulo 2 → Requiere NACOM → BATAB │
│ [🔒] Módulo 3 → Requiere BATAB → HOLCATTE │
│ [🔒] Módulo 4 → Requiere HOLCATTE → GUERRERO │
│ [🔒] Módulo 5 → Requiere GUERRERO → MERCENARIO │
└───────────┬─────────────────────────────┘
            │
            ▼
```''',

    'image64.png': '''**[Elemento visual decorativo - Marco redondeado blanco]**''',

    'image74.png': '''**[Elemento gráfico - Símbolo o decoración]**

/|
''',

    'image79.png': '''**[Elemento visual decorativo - Marco redondeado blanco grande]**''',

    'image86.png': '''**[Elemento visual decorativo - Marco redondeado blanco]**''',

    'image93.png': '''**[Elemento visual decorativo - Marco o sombra suave]**''',

    'image109.png': '''**[Elemento visual decorativo - Marco o sombra suave]**'''
}

def replace_image_descriptions(input_file, output_file):
    """Replace generic image descriptions with detailed ones"""

    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace each image description
    for image_name, description in IMAGE_DESCRIPTIONS.items():
        # Pattern: ![[Descripción de image26.png]](word/media/image26.png)
        old_pattern = f'![[Descripción de {image_name}]](word/media/{image_name})'

        # Create new pattern with description
        new_pattern = f'\n{description}\n'

        content = content.replace(old_pattern, new_pattern)

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Descriptions added successfully")
    print(f"✓ Output saved to: {output_file}")

if __name__ == '__main__':
    replace_image_descriptions(
        'DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.md',
        'DocumentoDeDiseño_Mecanicas_GAMILIT_v6.1.md'
    )
