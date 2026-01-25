# ESTÁNDAR: Estructura de Archivos de Referencia

**Version:** 1.0
**Fecha:** 2026-01-16
**Estado:** ACTIVO
**Aplica a:** Archivos en `orchestration/referencias/` y `orchestration/inventarios/`

---

## PROPÓSITO

Definir la estructura estándar que deben seguir los archivos de referencia para mantener consistencia, facilitar el mantenimiento y permitir procesamiento automatizado.

---

## ESTRUCTURA BASE DE ARCHIVOS YML

### Header Obligatorio

Todo archivo YML de referencia DEBE iniciar con:

```yaml
# NOMBRE-DEL-ARCHIVO.yml
# ============================================================================
# Descripción breve del propósito (1 línea)
# ============================================================================

version: "X.Y.Z"
updated: "YYYY-MM-DD"
purpose: "Descripción del propósito del archivo"
```

### Secciones Estándar

```yaml
# ============================================================================
# NOMBRE DE SECCIÓN EN MAYÚSCULAS
# ============================================================================

seccion_nombre:
  # Contenido de la sección
```

### Footer Obligatorio

Todo archivo DEBE terminar con:

```yaml
# Creado por: [Autor]
# Sistema: SIMCO v4.0.0
# Fecha: YYYY-MM-DD
```

---

## TIPOS DE ARCHIVOS DE REFERENCIA

### Tipo 1: Índice (_INDEX.yml)

**Propósito:** Listar y describir archivos en una carpeta.

**Estructura:**

```yaml
# _INDEX.yml
version: "1.0.0"
updated: "2026-01-16"
description: "Descripción de la carpeta"

archivos:
  NOMBRE-ARCHIVO.yml:
    proposito: "Qué hace este archivo"
    tamaño_aproximado: "XKB"
    caso_uso: "Cuándo usar este archivo"
    contiene:
      - "Elemento 1"
      - "Elemento 2"
    ejemplo_consulta: "¿Pregunta que responde?"

uso_recomendado:
  # Instrucciones de uso

referencias_relacionadas:
  # Enlaces a otros archivos
```

### Tipo 2: Mapeo Bidireccional (*-MAP.yml)

**Propósito:** Relacionar dos tipos de objetos en ambas direcciones.

**Estructura:**

```yaml
# OBJETO-A-OBJETO-B-MAP.yml
version: "1.0.0"
updated: "2026-01-16"
purpose: "Mapeo bidireccional A ↔ B"

# Estadísticas de coherencia
coherencia:
  total_a: N
  total_b: M
  mapeados: X
  sin_mapear: Y
  porcentaje: "Z%"

# Dirección 1: A → B
categoria_a:
  elemento_a_1:
    elemento_b: "nombre"
    path: "ubicación"
    nota: "información adicional"

# Dirección 2: B → A (índice inverso)
b_to_a:
  "elemento_b_1": "categoria_a.elemento_a_1"

# Excepciones documentadas
sin_mapeo:
  intencionales:
    - "elemento sin mapeo"
    motivo: "razón"
```

### Tipo 3: Índice Funcional (*-INDEX.yml)

**Propósito:** Mapear conceptos funcionales a implementaciones.

**Estructura:**

```yaml
# CONCEPTO-INDEX.yml
version: "1.0.0"
updated: "2026-01-16"
purpose: "Índice de [concepto] → implementación"

# Entradas principales
concepto:
  entrada_1:
    nombre: "Nombre legible"
    definicion: "path/a/documentacion"

    capa_1:
      atributo: "valor"
      items: ["item1", "item2"]

    capa_2:
      atributo: "valor"
      items: ["item1", "item2"]

# Búsqueda rápida por objeto
busqueda_por_objeto:
  objeto_1: "entrada_1"
  objeto_2: "entrada_2"

# Referencias
referencias:
  documento_principal: "path"
  relacionados:
    - "path/1"
    - "path/2"
```

### Tipo 4: Inventario (*_INVENTORY.yml)

**Propósito:** Catalogar todos los objetos de una capa.

**Estructura:**

```yaml
# CAPA_INVENTORY.yml
version: "X.Y.Z"
proyecto: "NOMBRE"
fecha_actualizacion: "YYYY-MM-DD"
actualizado_por: "Agente/Tarea"

# Resumen ejecutivo
resumen:
  total_objetos: N
  categorias: M
  estado: "DESCRIPCION"
  ultima_verificacion: "YYYY-MM-DD"

# Detalle por categoría
categoria_1:
  total: N
  items:
    - nombre: "item1"
      path: "ubicación"
      estado: "activo|deprecated"

# Métricas
metricas:
  cobertura: "X%"
  coherencia: "Y%"

# Referencias
referencias:
  - "path/a/detalle"
```

---

## CONVENCIONES DE NOMENCLATURA

### Nombres de Archivos

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Índice | `_INDEX.yml` | `_INDEX.yml` |
| Mapeo | `OBJETO-OBJETO-MAP.yml` | `TABLE-ENTITY-MAP.yml` |
| Índice funcional | `CONCEPTO-INDEX.yml` | `FUNCTIONALITY-INDEX.yml` |
| Referencias | `CONCEPTO-REFERENCES.yml` | `SCHEMA-REFERENCES.yml` |
| Inventario | `CAPA_INVENTORY.yml` | `DATABASE_INVENTORY.yml` |
| Schema | `CONCEPTO-SCHEMA.yml` | `FRONTMATTER-SCHEMA.yml` |

### Nombres de Claves YAML

```yaml
# Usar snake_case para claves
total_items: 10
fecha_actualizacion: "2026-01-16"

# Usar arrays para listas
items:
  - "item1"
  - "item2"

# Usar objetos para estructuras complejas
detalle:
  nombre: "valor"
  descripcion: "texto"
```

---

## TAMAÑO MÁXIMO RECOMENDADO

| Tipo de Archivo | Tamaño Máximo | Líneas Máximas |
|-----------------|---------------|----------------|
| _INDEX.yml | 5KB | 150 |
| *-MAP.yml | 10KB | 300 |
| *-INDEX.yml | 15KB | 400 |
| *_INVENTORY.yml | 20KB | 500 |
| *-REFERENCES.yml | 10KB | 300 |

**Si un archivo excede el límite:**
1. Segmentar por categoría
2. Crear sub-archivos con _INDEX.yml
3. Mantener archivo principal como resumen

---

## VALIDACIÓN DE ESTRUCTURA

### Checklist de Archivo Válido

```markdown
- [ ] Tiene header con version, updated, purpose
- [ ] Secciones separadas con comentarios
- [ ] Tiene footer con autor y fecha
- [ ] Nombres de claves en snake_case
- [ ] Tamaño dentro del límite
- [ ] YAML válido (sin errores de sintaxis)
```

### Comando de Validación

```bash
# Validar sintaxis YAML
python -c "import yaml; yaml.safe_load(open('archivo.yml'))"

# Verificar tamaño
ls -la orchestration/referencias/*.yml | awk '{print $5, $9}'
```

---

## EJEMPLOS COMPLETOS

### Ejemplo: _INDEX.yml

```yaml
# _INDEX.yml - Índice de Archivos de Referencias
# ============================================================================
# Propósito: Acceso rápido a trazabilidad sin cargar documentación completa
# ============================================================================

version: "1.0.0"
updated: "2026-01-16"
description: "Archivos de referencia pequeños (<10KB) para trazabilidad"

archivos:
  SCHEMA-REFERENCES.yml:
    proposito: "Mapeo Schema → Épica → Objetos"
    tamaño_aproximado: "5KB"
    caso_uso: "Encontrar épica de un schema"
    ejemplo_consulta: "¿Qué épica tiene gamification_system?"

  TABLE-ENTITY-MAP.yml:
    proposito: "Mapeo bidireccional Tabla ↔ Entity"
    tamaño_aproximado: "6KB"
    caso_uso: "Verificar coherencia DDL-Backend"
    ejemplo_consulta: "¿Qué entity tiene la tabla profiles?"

uso_recomendado:
  paso_1: "Cargar _INDEX.yml para ver opciones"
  paso_2: "Cargar archivo específico según necesidad"
  paso_3: "Seguir enlaces a documentación si se requiere detalle"

# Creado por: Claude Opus 4.5
# Sistema: SIMCO v4.0.0
# Fecha: 2026-01-16
```

### Ejemplo: Sección de Mapeo

```yaml
# Mapeo por schema
auth_management:
  profiles:
    entity: "profile.entity.ts"
    path: "modules/auth/entities/"
    pk: "id (uuid)"
  user_roles:
    entity: "user-role.entity.ts"
    path: "modules/auth/entities/"

# Índice inverso
entity_to_table:
  "profile.entity.ts": "auth_management.profiles"
  "user-role.entity.ts": "auth_management.user_roles"
```

---

## MANTENIMIENTO

### Cuándo Actualizar

| Evento | Acción |
|--------|--------|
| Nuevo objeto creado | Agregar entrada, actualizar totales |
| Objeto eliminado | Remover entrada, actualizar totales |
| Objeto renombrado | Actualizar nombre en todas las referencias |
| Nueva categoría | Agregar sección, actualizar _INDEX.yml |

### Versionado

```yaml
# Incrementar versión según tipo de cambio
version: "1.0.0"  # MAJOR.MINOR.PATCH

# MAJOR: Cambio de estructura incompatible
# MINOR: Nueva funcionalidad compatible
# PATCH: Corrección o actualización de datos
```

---

## REFERENCIAS

- `orchestration/directivas/DIRECTIVA-TRAZABILIDAD-REFERENCIAS.md` - Directiva principal
- `orchestration/referencias/FRONTMATTER-SCHEMA.yml` - Schema para documentación
- `orchestration/analisis/MODELO-TRAZABILIDAD-COMPLEMENTARIO-2026-01-16.md` - Modelo

---

*Estándar creado por Claude Opus 4.5*
*Sistema SIMCO v4.0.0*
*Proyecto GAMILIT*
