# SIMCO: FRONTMATTER SCHEMA

**Version:** 1.0.0
**Fecha:** 2026-02-13
**Sistema:** SIMCO v4.0.0
**Alias:** @FRONTMATTER_SCHEMA

---

## RESUMEN EJECUTIVO

Define el schema YAML estandar para metadata (frontmatter) en documentos del proyecto gamilit. Establece campos obligatorios, opcionales, y validaciones por tipo de documento.

**PRINCIPIO:** "Todo documento debe tener metadata estructurada que permita su clasificacion, busqueda y validacion automatizada."

---

## SCHEMA BASE (Todos los documentos)

```yaml
# Campos OBLIGATORIOS para todo documento
frontmatter_base:
  campos_obligatorios:
    titulo:
      tipo: string
      formato: "# {Titulo} en primera linea"
      ejemplo: "# SIMCO: FRONTMATTER SCHEMA"

    version:
      tipo: semver
      formato: "X.Y.Z"
      ejemplo: "1.0.0"
      regla: "Major: breaking, Minor: feature, Patch: fix"

    fecha:
      tipo: date
      formato: "YYYY-MM-DD"
      ejemplo: "2026-02-13"
      nota: "Fecha de ultima modificacion sustantiva"

  campos_recomendados:
    alias:
      tipo: string
      formato: "@{NOMBRE_MAYUSCULAS}"
      ejemplo: "@FRONTMATTER_SCHEMA"

    sistema:
      tipo: string
      ejemplo: "SIMCO v4.0.0"

    estado:
      tipo: enum
      valores: ["Activo", "Draft", "Deprecated", "Archived"]
      default: "Activo"
```

---

## SCHEMAS POR TIPO DE DOCUMENTO

### Directivas SIMCO

```yaml
# orchestration/directivas/simco/SIMCO-*.md
frontmatter_simco:
  obligatorio:
    - titulo           # "# SIMCO: {NOMBRE}"
    - version          # semver
    - fecha            # YYYY-MM-DD
    - sistema          # "SIMCO v4.0.0"
    - alias            # "@{ALIAS}"
  recomendado:
    - complementa      # Directiva complementaria
    - proposito        # 1 linea de proposito
  formato: |
    # SIMCO: {NOMBRE}

    **Version:** {semver}
    **Fecha:** {YYYY-MM-DD}
    **Sistema:** SIMCO v4.0.0
    **Alias:** @{ALIAS}
```

### Triggers

```yaml
# orchestration/directivas/triggers/TRIGGER-*.md
frontmatter_trigger:
  obligatorio:
    - titulo           # "# TRIGGER: {NOMBRE}"
    - version          # semver
    - fecha            # YYYY-MM-DD
    - sistema          # "SIMCO v4.0.0"
    - alias            # "@TRIGGER_{NOMBRE}"
  formato: |
    # TRIGGER: {NOMBRE}

    **Version:** {semver}
    **Fecha:** {YYYY-MM-DD}
    **Sistema:** SIMCO v4.0.0
    **Alias:** @TRIGGER_{NOMBRE}
```

### Perfiles de Agente

```yaml
# orchestration/agents/perfiles/PERFIL-*.md
frontmatter_perfil:
  obligatorio:
    - titulo           # "# PERFIL: {NOMBRE}"
    - version          # semver
    - fecha            # YYYY-MM-DD
    - alias            # "@PERFIL_{NOMBRE}"
    - dominio          # Dominio de especializacion
  recomendado:
    - stack            # Tecnologias principales
    - proyecto         # Proyecto(s) donde aplica
  formato: |
    # PERFIL: {NOMBRE}

    **Version:** {semver}
    **Fecha:** {YYYY-MM-DD}
    **Alias:** @PERFIL_{NOMBRE}
    **Dominio:** {dominio}
```

### Estandares

```yaml
# docs/40-standards/ESTANDAR-*.md
frontmatter_estandar:
  obligatorio:
    - titulo           # "# ESTANDAR: {NOMBRE}"
    - version          # semver
    - fecha            # YYYY-MM-DD
    - estado           # Activo/Draft/Deprecated
  recomendado:
    - aplica_a         # Dominios donde aplica
    - prioridad        # Obligatorio/Recomendado/Opcional
  formato: |
    # ESTANDAR: {NOMBRE}

    **Version:** {semver}
    **Fecha:** {YYYY-MM-DD}
    **Estado:** {estado}
    **Aplica a:** {dominios}
```

### ADRs

```yaml
# docs/90-adr/ADR-*.md
frontmatter_adr:
  obligatorio:
    - titulo           # "# ADR-{NNN}: {Titulo}"
    - estado           # Aceptado/Propuesto/Rechazado/Superseded
    - fecha            # YYYY-MM-DD
  recomendado:
    - autor            # Quien propuso
    - supersede        # ADR que reemplaza (si aplica)
    - superseded_by    # ADR que lo reemplaza (si aplica)
  formato: |
    # ADR-{NNN}: {Titulo}

    **Estado:** {estado}
    **Fecha:** {YYYY-MM-DD}
    **Autor:** {autor}
```

### Inventarios YAML

```yaml
# orchestration/inventarios/*.yml
frontmatter_inventario:
  obligatorio:
    - version          # semver (en campo metadata.version)
    - fecha_actualizacion  # YYYY-MM-DD
    - proyecto         # nombre del proyecto
  recomendado:
    - proposito        # 1 linea de proposito
  formato: |
    metadata:
      version: "{semver}"
      fecha_actualizacion: "{YYYY-MM-DD}"
      proyecto: "{nombre}"
      proposito: "{descripcion}"
```

### _MAP.md (Mapas de Navegacion)

```yaml
# **/_MAP.md
frontmatter_map:
  obligatorio:
    - titulo           # "# _MAP: {Directorio/Seccion}"
    - proposito        # Para que sirve este directorio
    - estado           # Activo/Deprecated
    - ultima_actualizacion  # YYYY-MM-DD
  recomendado:
    - version          # semver
    - carpeta          # Path relativo
  formato: |
    # _MAP: {Nombre}

    **Carpeta:** {path}
    **Proposito:** {descripcion}
    **Estado:** {estado}
    **Ultima actualizacion:** {YYYY-MM-DD}
```

### _INDEX.md / _INDEX.yml

```yaml
# **/_INDEX.md o _INDEX.yml
frontmatter_index:
  obligatorio:
    - titulo           # "# INDICE: {Seccion}"
    - version          # semver
    - fecha            # YYYY-MM-DD
  recomendado:
    - sistema          # Sistema que gobierna
    - ubicacion        # Path relativo
  formato: |
    # INDICE: {Nombre}

    **Version:** {semver}
    **Fecha:** {YYYY-MM-DD}
    **Sistema:** {sistema}
    **Ubicacion:** {path}
```

---

## VALIDACION

### Reglas de Validacion

```yaml
validaciones:
  version:
    - "Debe ser semver valido (X.Y.Z)"
    - "X >= 0, Y >= 0, Z >= 0"
    - "No usar prefijo 'v' (1.0.0, no v1.0.0)"

  fecha:
    - "Formato YYYY-MM-DD estricto"
    - "No usar formatos locales (DD/MM/YYYY)"
    - "Debe ser fecha valida (no 2026-02-30)"

  alias:
    - "Prefijo @ obligatorio"
    - "Solo MAYUSCULAS y GUIONES_BAJOS"
    - "No usar guiones medios en alias (@PERFIL_BACKEND, no @PERFIL-BACKEND)"

  estado:
    - "Solo valores del enum definido"
    - "No inventar estados nuevos"

  titulo:
    - "Debe ser la primera linea del documento (# Titulo)"
    - "No usar **negrita** en el titulo H1"
```

### Excepciones

```yaml
excepciones:
  - tipo: "Archivos legacy pre-2025"
    regla: "No requieren frontmatter completo, agregar en siguiente modificacion"

  - tipo: "Archivos generados automaticamente"
    regla: "Solo requieren version y fecha"

  - tipo: "README.md"
    regla: "Formato libre, solo titulo obligatorio"
```

---

## MIGRACION

Para documentos existentes sin frontmatter estandar:

```yaml
estrategia: "Gradual — agregar frontmatter al modificar documento"

no_hacer:
  - "NO migrar todos los documentos de golpe"
  - "NO romper formato existente que funciona"

hacer:
  - "Al crear documento nuevo: usar schema completo"
  - "Al modificar documento existente: agregar campos faltantes"
  - "Priorizar directivas SIMCO y inventarios (documentos criticos)"
```

---

## REFERENCIAS

| Alias | Descripcion |
|-------|-------------|
| @FRONTMATTER_SCHEMA | Esta directiva |
| @NOMENCLATURA | Convenciones de nomenclatura |
| @ESTRUCTURA_DOCS | Estructura interna de documentos |
| @NORMALIZACION_DOC | Normalizacion documental |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Directiva Estandar
