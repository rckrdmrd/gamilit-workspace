# SIMCO-ESTRUCTURA-DOCS
**Version:** 1.0.0
**Tipo:** Directiva Operacional
**Prioridad:** P0
**Alias:** @ESTRUCTURA_DOCS
**Creado:** 2026-01-10
**Depende de:** SIMCO-DOCUMENTACION-PROYECTO.md, SIMCO-NOMENCLATURA.md

---

## 1. Proposito

Definir la estructura interna estandar de documentos Markdown en el workspace, incluyendo frontmatter YAML, secciones obligatorias y formato de contenido.

---

## 2. Frontmatter YAML Obligatorio

### 2.1 Estructura Base

```yaml
---
id: "{PREFIJO}-{MODULO}-{NUM}"
title: "{Titulo descriptivo}"
type: "{Requirement|Specification|UserStory|ADR|Epic|Module}"
status: "{Draft|InReview|Approved|Published|Deprecated}"
priority: "{P0|P1|P2|P3}"
module: "{modulo_afectado}"
epic: "{EPICA-ID}"
version: "{SEMVER}"
labels: ["{tag1}", "{tag2}"]
created_date: "{YYYY-MM-DD}"
updated_date: "{YYYY-MM-DD}"
---
```

### 2.2 Campos por Tipo de Documento

| Campo | RF | ET | US | ADR | Epic | Module |
|-------|----|----|----|----|------|--------|
| id | SI | SI | SI | SI | SI | SI |
| title | SI | SI | SI | SI | SI | SI |
| type | SI | SI | SI | SI | SI | SI |
| status | SI | SI | SI | SI | SI | SI |
| priority | SI | SI | SI | NO | SI | SI |
| module | SI | SI | OPC | NO | NO | SI |
| epic | OPC | OPC | SI | NO | NO | NO |
| version | SI | SI | OPC | SI | SI | SI |
| labels | OPC | OPC | OPC | OPC | OPC | OPC |
| created_date | SI | SI | SI | SI | SI | SI |
| updated_date | SI | SI | SI | SI | SI | SI |
| decision | NO | NO | NO | SI | NO | NO |
| alternatives | NO | NO | NO | SI | NO | NO |

---

## 3. Estructura por Tipo de Documento

### 3.1 Requerimientos (RF-*)

```markdown
# {ID}: {Titulo}

## Metadata
| Campo | Valor |
|-------|-------|
| ID | {ID} |
| Prioridad | {P0-P3} |
| Estado | {Estado} |
| Modulo | {modulo} |

---

## Descripcion
{Parrafo descriptivo del requerimiento}

## Objetivos
1. {Objetivo 1}
2. {Objetivo 2}

## Reglas de Negocio
| ID | Descripcion |
|----|-------------|
| RN-001 | {Regla 1} |

## Criterios de Aceptacion
- [ ] {Criterio 1}
- [ ] {Criterio 2}

## Dependencias
- {Dependencia 1}
- {Dependencia 2}

## Notas
{Notas adicionales}

---

**Ultima actualizacion:** {YYYY-MM-DD}
**Version:** {SEMVER}
```

### 3.2 Especificaciones Tecnicas (ET-*)

```markdown
# {ID}: {Titulo}

## Metadata
| Campo | Valor |
|-------|-------|
| ID | {ID} |
| Tipo | {Backend|Frontend|Database} |
| RF Asociado | {RF-XXX-NNN} |
| Estado | {Estado} |

---

## Descripcion
{Como se implementa el requerimiento asociado}

## Arquitectura

### Componentes
{Diagrama o descripcion de componentes}

### Modelo de Datos (si aplica)

**{nombre_tabla}**
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| {campo} | {tipo} | {descripcion} |

## Endpoints API (si aplica)

| Metodo | Endpoint | Descripcion | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | /api/{recurso} | {desc} | {dto} | {response} |

## Implementacion

### Servicios
{Descripcion de servicios}

### Validaciones
{Validaciones requeridas}

## Testing

| Tipo | Cobertura | Archivo |
|------|-----------|---------|
| Unit | {N}% | {archivo.spec.ts} |

## Referencias
- {Link a documento relacionado}

---

**Ultima actualizacion:** {YYYY-MM-DD}
```

### 3.3 User Stories (US-*)

```markdown
# {ID}: {Titulo}

## Metadata
| Campo | Valor |
|-------|-------|
| ID | {ID} |
| Epica | {EPICA-ID} |
| Story Points | {N} |
| Estado | {Estado} |

---

## Historia

**Como** {rol/persona},
**Quiero** {accion/funcionalidad},
**Para** {beneficio/valor}.

## Criterios de Aceptacion (BDD)

### Escenario 1: {nombre}
```gherkin
Given {contexto}
When {accion}
Then {resultado esperado}
```

### Escenario 2: {nombre}
```gherkin
Given {contexto}
When {accion}
Then {resultado esperado}
```

## Tareas Tecnicas

| # | Tarea | Estimacion | Asignado |
|---|-------|------------|----------|
| 1 | {Tarea 1} | {horas} | {quien} |

## Definition of Done
- [ ] Codigo implementado
- [ ] Tests escritos
- [ ] Code review aprobado
- [ ] Documentacion actualizada
- [ ] Desplegado en staging

## Notas
{Notas adicionales}

---

**Ultima actualizacion:** {YYYY-MM-DD}
```

### 3.4 Epicas/Modulos

```markdown
# {ID}: {Nombre}

## Metadata
| Campo | Valor |
|-------|-------|
| Codigo | {ID} |
| Fase | {N} - {Nombre Fase} |
| Prioridad | {P0-P3} |
| Estado | {Estado} |
| Story Points | {N} |

---

## Descripcion
{Parrafo descriptivo del proposito}

## Objetivos
1. {Objetivo 1}
2. {Objetivo 2}

## Alcance

### Incluido
- {Feature incluida}

### Excluido
- {Feature excluida}

## Arquitectura
{Diagrama ASCII o descripcion}

## Entregables

| Entregable | Ubicacion | Estado |
|------------|-----------|--------|
| {Entregable} | {ruta} | {estado} |

## Dependencias

### Depende de
- {Epica/Modulo del que depende}

### Bloquea a
- {Epica/Modulo que bloquea}

## User Stories Relacionadas
- [US-{ID}](ruta/al/archivo.md)

---

**Ultima actualizacion:** {YYYY-MM-DD}
```

### 3.5 ADRs

```markdown
# ADR-{NNNN}: {Titulo Decision}

## Metadata
| Campo | Valor |
|-------|-------|
| ID | ADR-{NNNN} |
| Estado | {Proposed|Accepted|Deprecated|Superseded} |
| Fecha | {YYYY-MM-DD} |
| Supersede | {ADR-XXXX si aplica} |

---

## Contexto
{Descripcion del problema o situacion que requiere decision}

## Decision
{La decision tomada}

## Alternativas Consideradas

### Opcion 1: {nombre}
- **Pros:** {beneficios}
- **Cons:** {desventajas}

### Opcion 2: {nombre}
- **Pros:** {beneficios}
- **Cons:** {desventajas}

## Consecuencias

### Positivas
- {Consecuencia positiva}

### Negativas
- {Consecuencia negativa}

### Neutrales
- {Consecuencia neutral}

## Referencias
- {Link a documento relacionado}

---

**Fecha decision:** {YYYY-MM-DD}
**Autores:** {nombres}
```

### 3.6 _MAP.md (Indices)

```markdown
# _MAP: {Nombre Seccion}

**Carpeta:** {ruta/relativa}/
**Proposito:** {Descripcion}
**Estado:** {Actualizado|En construccion}
**Ultima actualizacion:** {YYYY-MM-DD}

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Total archivos | {N} |
| Documentos completados | {N} |
| Documentos pendientes | {N} |
| Progreso | {N}% |

---

## Contenido

| Archivo | Tipo | Estado | Descripcion |
|---------|------|--------|-------------|
| [{archivo.md}](./{archivo.md}) | {tipo} | {estado} | {descripcion} |

---

## Navegacion por Caso de Uso

### Para {caso de uso 1}:
1. Leer [{archivo}](./{archivo})
2. Revisar [{archivo}](./{archivo})

---

## Subdirectorios

| Directorio | Descripcion | Archivos |
|------------|-------------|----------|
| [{dir}/](./{dir}/) | {descripcion} | {N} |

---

## Referencias Externas
- [{Referencia}](../ruta/archivo.md)

---

**Mantenido por:** {Rol}
**Version:** {SEMVER}
```

---

## 4. Formato de Tablas

### 4.1 Tabla Estandar

```markdown
| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| valor 1   | valor 2   | valor 3   |
```

### 4.2 Tabla de Metadata (Alternativa a Frontmatter)

```markdown
## Metadata

| Campo | Valor |
|-------|-------|
| ID | {ID} |
| Estado | {estado} |
| Prioridad | {prioridad} |
```

---

## 5. Diagramas ASCII

### 5.1 Flujo Simple

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Paso 1  │ --> │ Paso 2  │ --> │ Paso 3  │
└─────────┘     └─────────┘     └─────────┘
```

### 5.2 Arbol de Dependencias

```
Componente A
├── Subcomponente A.1
│   └── Detalle A.1.1
├── Subcomponente A.2
└── Subcomponente A.3
```

### 5.3 Caja con Contenido

```
╔════════════════════════════════════════╗
║           TITULO IMPORTANTE            ║
╠════════════════════════════════════════╣
║ Contenido de la caja                   ║
║ Puede tener multiples lineas           ║
╚════════════════════════════════════════╝
```

---

## 6. Referencias Cruzadas

### 6.1 Link Relativo

```markdown
Ver: [Nombre del documento](./ruta/al/documento.md)
```

### 6.2 Link con Anchor

```markdown
Ver: [Seccion especifica](./documento.md#seccion)
```

### 6.3 Referencia a Directiva

```markdown
Siguiendo @SIMCO-NOMENCLATURA, los archivos deben...
```

---

## 7. Footer de Documentos

### 7.1 Footer Estandar

```markdown
---

**Ultima actualizacion:** {YYYY-MM-DD}
**Version:** {SEMVER}
```

### 7.2 Footer Completo

```markdown
---

**Creado:** {YYYY-MM-DD}
**Ultima actualizacion:** {YYYY-MM-DD}
**Version:** {SEMVER}
**Autor:** {Rol/Nombre}
**Mantenido por:** {Equipo}
```

---

## 8. Referencias

| Directiva | Proposito |
|-----------|-----------|
| SIMCO-DOCUMENTACION-PROYECTO.md | Estructura de proyecto |
| SIMCO-NOMENCLATURA.md | Nombres de archivos |
| TEMPLATE-EPICA-ESTANDAR.md | Template de epica |
| TEMPLATE-MODULO-ESTANDAR.md | Template de modulo |

---

**Ultima actualizacion:** 2026-01-10
**Mantenido por:** Orchestration Team
