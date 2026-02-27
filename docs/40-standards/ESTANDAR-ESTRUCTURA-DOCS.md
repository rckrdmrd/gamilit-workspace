---
titulo: Estandar de Estructura de Documentacion
tipo: estandar-proyecto
version: 1.0.0
fecha_creacion: 2026-01-03
ultima_actualizacion: 2026-02-27
---

# Estandar de Estructura de Documentacion

**Version:** 1.0.0
**Sistema:** NEXUS v3.4 + SIMCO
**Fecha:** 2026-01-03
**EPIC:** EPIC-002 - Documentacion en Todos los Niveles

## 1. Vision General

Este documento define el estandar oficial de estructura de directorios `docs/` para todos los proyectos del workspace NEXUS. El objetivo es garantizar:

- **Navegabilidad:** Cualquier desarrollador puede encontrar informacion rapidamente
- **Consistencia:** Misma estructura en todos los proyectos
- **Escalabilidad:** Estructura que crece con el proyecto
- **Trazabilidad:** Historial de decisiones y cambios documentado

---

## 2. Estructura de Directorios

### 2.1 Estructura Completa

```
{proyecto}/docs/
├── README.md                      # OBLIGATORIO - Punto de entrada
├── _MAP.md                        # OBLIGATORIO - Indice navegable
│
├── 00-vision-general/             # Vision, stack, arquitectura general
│   ├── _MAP.md
│   ├── VISION-PRODUCTO.md
│   ├── ARQUITECTURA-GENERAL.md
│   └── STACK-TECNOLOGICO.md
│
├── 01-arquitectura/               # Diagramas, decisiones tecnicas
│   ├── _MAP.md
│   ├── DIAGRAMA-COMPONENTES.md
│   ├── DIAGRAMA-BASE-DATOS.md
│   └── diagramas/
│
├── 02-definicion-modulos/         # Modulos funcionales del proyecto
│   ├── _MAP.md
│   └── {PREFIJO}-{NNN}-{nombre}/
│       ├── _MAP.md
│       ├── README.md
│       └── especificaciones/
│
├── 03-backlog/                    # Backlog de features pendientes
│   └── _MAP.md
│
├── 04-roadmap/                    # Roadmap y planificacion
│   └── _MAP.md
│
├── 10-herencia-verticales/        # Solo para suite-cores
│   └── _MAP.md
│
├── 90-transversal/                # Inventarios, integraciones
│   ├── _MAP.md
│   ├── inventarios/
│   └── integraciones/
│
├── 95-guias-desarrollo/           # Guias para desarrolladores
│   ├── _MAP.md
│   └── GUIA-CONTRIBUCION.md
│
├── 96-quick-reference/            # Cheatsheets y refs rapidas
│   ├── _MAP.md
│   └── CHEATSHEET-*.md
│
├── 97-adr/                        # Architecture Decision Records
│   ├── _MAP.md
│   └── ADR-{NNN}-{titulo}.md
│
├── 98-analisis/                   # Documentos de analisis
│   ├── _MAP.md
│   └── ANALISIS-*.md
│
└── 99-finiquito/                  # Documentacion de entrega
    ├── _MAP.md
    └── ENTREGA-*.md
```

### 2.2 Directorios por Tipo de Proyecto

| Directorio | Standalone | Suite-Core | Vertical | Descripcion |
|------------|:----------:|:----------:|:--------:|-------------|
| 00-vision-general | REQUERIDO | REQUERIDO | REQUERIDO | Vision y arquitectura |
| 01-arquitectura | REQUERIDO | REQUERIDO | OPCIONAL | Diagramas y decisiones |
| 02-definicion-modulos | REQUERIDO | REQUERIDO | REQUERIDO | Modulos del proyecto |
| 03-backlog | OPCIONAL | OPCIONAL | OPCIONAL | Features pendientes |
| 10-herencia-verticales | N/A | REQUERIDO | N/A | Guia para verticales |
| 90-transversal | REQUERIDO | REQUERIDO | OPCIONAL | Inventarios |
| 95-guias-desarrollo | OPCIONAL | REQUERIDO | OPCIONAL | Guias de desarrollo |
| 96-quick-reference | OPCIONAL | OPCIONAL | OPCIONAL | Cheatsheets |
| 97-adr | RECOMENDADO | REQUERIDO | OPCIONAL | ADRs |
| 98-analisis | OPCIONAL | OPCIONAL | OPCIONAL | Analisis |
| 99-finiquito | OPCIONAL | OPCIONAL | OPCIONAL | Entrega |

---

## 3. Archivos Obligatorios

### 3.1 README.md (Raiz de docs/)

El `README.md` es el **punto de entrada principal**. Debe contener:

1. **Titulo del proyecto**
2. **Descripcion breve** (1-2 parrafos)
3. **Enlaces rapidos** a secciones principales
4. **Estado actual** del proyecto
5. **Como contribuir** (enlace a guias)

**Template:**
```markdown
# Documentacion de {Nombre del Proyecto}

> {Descripcion breve del proyecto en 1-2 lineas}

## Enlaces Rapidos

- Vision General: `00-overview/`
- Arquitectura: `20-architecture/`
- Modulos/Requerimientos: `10-requirements/`
- Guias de Desarrollo: `50-guides/`

## Estado del Proyecto

| Aspecto | Estado |
|---------|--------|
| Backend | En Desarrollo |
| Frontend | En Desarrollo |
| Database | Estable |

## Navegacion

Ver `_MAP.md` para indice completo.

---
*Actualizado: YYYY-MM-DD*
```

### 3.2 _MAP.md (Indice de Navegacion)

Cada directorio con contenido debe tener un `_MAP.md`. Ver [TEMPLATE-MAP.md](../templates/04-globales/TEMPLATE-MAP.md) para el template estandar.

**Contenido minimo:**
- Tabla con archivos/directorios
- Descripcion de cada item
- Estado (Activo, En Desarrollo, Planificado)
- Enlaces de navegacion (Padre, Relacionados)
- Fecha de actualizacion

---

## 4. Reglas de Nomenclatura

### 4.1 Directorios

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Directorio estandar | `{NN}-{nombre-kebab}` | `00-vision-general` |
| Modulo de proyecto | `{PREFIJO}-{NNN}-{nombre}` | `AUTH-001-autenticacion` |
| Subdirectorio | `{nombre-kebab}` | `especificaciones` |

**Prefijos numericos:**
- `00-09`: Vision, arquitectura, fundamentos
- `10-19`: Herencia y extensiones (suite-cores)
- `20-89`: Reservado para expansion
- `90-94`: Transversal, inventarios
- `95-96`: Guias y referencias
- `97`: ADRs
- `98`: Analisis
- `99`: Finiquito

### 4.2 Archivos

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Documento principal | `{NOMBRE-MAYUSCULAS}.md` | `ARQUITECTURA-GENERAL.md` |
| Especificacion tecnica | `ET-{MODULO}-{NNN}-{nombre}.md` | `ET-AUTH-001-login.md` |
| ADR | `ADR-{NNN}-{titulo}.md` | `ADR-001-uso-de-jwt.md` |
| Cheatsheet | `CHEATSHEET-{tema}.md` | `CHEATSHEET-GIT.md` |
| Analisis | `ANALISIS-{tema}.md` | `ANALISIS-PERFORMANCE.md` |
| Indice | `_MAP.md` | `_MAP.md` |

### 4.3 Prefijos de Modulos

Cada proyecto define sus propios prefijos. Ejemplos:

| Proyecto | Prefijos | Descripcion |
|----------|----------|-------------|
| trading-platform | OQI, CORE, ML | Orbiquantia modules |
| gamilit | GAME, EDU, REWARD | Gamificacion, educacion, recompensas |
| erp-suite | AUTH, INV, FIN | Autenticacion, inventario, finanzas |

---

## 5. Estados Validos

| Estado | Descripcion | Uso |
|--------|-------------|-----|
| **Activo** | Contenido vigente y mantenido | Documento en uso |
| **En Desarrollo** | Contenido en construccion | Trabajo en progreso |
| **Planificado** | Pendiente de crear | Placeholder |
| **Obsoleto** | Ya no se mantiene | Marcar para revision |
| **Draft** | Borrador sin aprobar | Requiere revision |

---

## 6. Convenciones de Contenido

### 6.1 Encabezados

- **H1 (#):** Solo uno por archivo, igual al titulo
- **H2 (##):** Secciones principales
- **H3 (###):** Subsecciones
- **H4+ (####):** Usar con moderacion

### 6.2 Tablas

Usar tablas para:
- Listados estructurados
- Comparaciones
- Estados y configuraciones

### 6.3 Enlaces

- **Siempre relativos:** usar formato de ruta relativa (ejemplo: `../ruta/archivo.md`)
- **Evitar absolutos:** No usar `/home/usuario/...`
- **Validar periodicamente:** Con script de validacion

### 6.4 Diagramas

- Preferir **Mermaid** para diagramas inline
- Guardar diagramas complejos en `diagramas/`
- Incluir fuente editable junto con imagen

---

## 7. Validacion

Usar un script de validacion documental del proyecto para verificar cumplimiento:

```bash
# Ejemplo
./scripts/validate-docs.sh /path/to/project
```

El script valida:
1. Existencia de `README.md` y `_MAP.md`
2. Estructura de directorios recomendada
3. Existencia de `_MAP.md` en subdirectorios con contenido
4. Archivos huerfanos (no-markdown)
5. Directorios vacios

---

## 8. Ejemplos por Tipo de Proyecto

### 8.1 Proyecto Standalone (trading-platform)

```
docs/
├── README.md
├── _MAP.md
├── 00-vision-general/
│   ├── _MAP.md
│   └── VISION-ORBIQUANTIA.md
├── 01-arquitectura/
│   └── _MAP.md
├── 02-definicion-modulos/
│   ├── _MAP.md
│   ├── OQI-001-fundamentos-auth/
│   ├── OQI-002-education/
│   └── OQI-003-trading/
├── 90-transversal/
│   └── _MAP.md
└── 97-adr/
    └── _MAP.md
```

### 8.2 Suite-Core (erp-core)

```
docs/
├── README.md
├── _MAP.md
├── 00-vision-general/
├── 01-arquitectura/
├── 02-definicion-modulos/
├── 10-herencia-verticales/       # ESPECIAL: Guia para verticales
│   ├── _MAP.md
│   ├── GUIA-HERENCIA.md
│   └── ESTRUCTURA-VERTICAL.md
├── 90-transversal/
├── 95-guias-desarrollo/
└── 97-adr/
```

### 8.3 Vertical (erp-construccion)

```
docs/
├── README.md                     # Referencia a erp-core
├── _MAP.md
├── 00-vision-general/
│   └── VISION-CONSTRUCCION.md    # Solo contenido especifico
├── 02-definicion-modulos/
│   ├── _MAP.md
│   └── CONST-001-proyectos/      # Modulos especificos
└── 90-transversal/
```

---

## 9. Migracion de Estructuras Existentes

### 9.1 Checklist de Migracion

1. [ ] Crear `docs/README.md` si no existe
2. [ ] Crear `docs/_MAP.md` si no existe
3. [ ] Renombrar directorios al formato `NN-nombre`
4. [ ] Mover contenido a directorios correctos
5. [ ] Crear `_MAP.md` en cada subdirectorio
6. [ ] Validar enlaces internos
7. [ ] Ejecutar script de validacion documental
8. [ ] Resolver warnings y errores

### 9.2 Mapeo de Directorios Comunes

| Estructura Antigua | Estructura Nueva |
|-------------------|------------------|
| `docs/architecture/` | `docs/01-arquitectura/` |
| `docs/modules/` | `docs/02-definicion-modulos/` |
| `docs/guides/` | `docs/95-guias-desarrollo/` |
| `docs/decisions/` | `docs/90-adr/` |
| `docs/specs/` | `docs/02-definicion-modulos/{mod}/especificaciones/` |

---

## 10. Referencias

- [TEMPLATE-MAP.md](../templates/04-globales/TEMPLATE-MAP.md) - Template para indices
- Script de validacion documental del proyecto - Validar estructura y enlaces
- [SIMCO-DOCUMENTAR.md](../directivas/simco/SIMCO-DOCUMENTAR.md) - Directiva de documentacion

---

**Documento creado:** 2026-01-03
**Sistema:** NEXUS v3.4 + SIMCO
**EPIC:** EPIC-002 - Documentacion en Todos los Niveles
