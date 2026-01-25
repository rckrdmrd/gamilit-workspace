# TEMPLATE: Archivo _MAP.md

**Version:** 1.0.0
**Sistema:** NEXUS v3.4 + SIMCO
**Proposito:** Template estandar para archivos de indice _MAP.md

---

## Instrucciones de Uso

1. Copiar este template al directorio que requiere indice
2. Renombrar a `_MAP.md`
3. Reemplazar los placeholders `{...}` con valores reales
4. Actualizar la fecha en cada modificacion
5. Mantener enlaces relativos para portabilidad

---

## Template

```markdown
# {NOMBRE_DEL_DIRECTORIO}

> {Descripcion breve del contenido de este directorio}

## Contenido

| Archivo/Directorio | Descripcion | Estado |
|--------------------|-------------|--------|
| [{nombre.md}]({nombre.md}) | {Descripcion breve} | Activo |
| [{subdirectorio}/]({subdirectorio}/) | {Descripcion del subdirectorio} | Activo |

## Navegacion

- **Padre:** [../](..)
- **Relacionados:** [{nombre-relacionado}]({ruta-relacionado})

---
*Actualizado: {YYYY-MM-DD}*
```

---

## Ejemplo: Directorio de Modulos

```markdown
# Definicion de Modulos

> Modulos funcionales del proyecto, organizados por dominio

## Contenido

| Archivo/Directorio | Descripcion | Estado |
|--------------------|-------------|--------|
| [AUTH-001-autenticacion/](AUTH-001-autenticacion/) | Sistema de autenticacion y autorizacion | Activo |
| [CORE-002-usuarios/](CORE-002-usuarios/) | Gestion de usuarios y perfiles | Activo |
| [PAY-003-pagos/](PAY-003-pagos/) | Integracion de pagos con Stripe | En Desarrollo |
| [REPORT-004-reportes/](REPORT-004-reportes/) | Sistema de reportes y analytics | Planificado |

## Navegacion

- **Padre:** [../docs/](..)
- **Relacionados:** [arquitectura/](../01-arquitectura/)

---
*Actualizado: 2026-01-03*
```

---

## Ejemplo: Directorio de Arquitectura

```markdown
# Arquitectura

> Documentacion de arquitectura, diagramas y decisiones tecnicas

## Contenido

| Archivo/Directorio | Descripcion | Estado |
|--------------------|-------------|--------|
| [ARQUITECTURA-GENERAL.md](ARQUITECTURA-GENERAL.md) | Vision general de la arquitectura | Activo |
| [DIAGRAMA-COMPONENTES.md](DIAGRAMA-COMPONENTES.md) | Diagrama de componentes del sistema | Activo |
| [STACK-TECNOLOGICO.md](STACK-TECNOLOGICO.md) | Stack y tecnologias utilizadas | Activo |
| [diagramas/](diagramas/) | Diagramas en formato Mermaid/PlantUML | Activo |

## Navegacion

- **Padre:** [../docs/](..)
- **Relacionados:** [vision-general/](../00-vision-general/)

---
*Actualizado: 2026-01-03*
```

---

## Ejemplo: Raiz de docs/

```markdown
# Documentacion del Proyecto

> Punto de entrada para toda la documentacion del proyecto {NOMBRE_PROYECTO}

## Contenido

| Directorio | Descripcion | Estado |
|------------|-------------|--------|
| [00-vision-general/](00-vision-general/) | Vision, arquitectura general, stack | Activo |
| [01-arquitectura/](01-arquitectura/) | Diagramas, decisiones tecnicas, ADRs | Activo |
| [02-definicion-modulos/](02-definicion-modulos/) | Modulos funcionales del proyecto | Activo |
| [90-transversal/](90-transversal/) | Inventarios, integraciones, temas transversales | Activo |
| [95-guias-desarrollo/](95-guias-desarrollo/) | Guias para desarrolladores | Activo |
| [96-quick-reference/](96-quick-reference/) | Cheatsheets y referencias rapidas | Activo |
| [97-adr/](97-adr/) | Architecture Decision Records | Activo |
| [98-analisis/](98-analisis/) | Documentos de analisis | Activo |
| [99-finiquito/](99-finiquito/) | Documentacion de entrega | Planificado |

## Navegacion

- **Padre:** [../](..) (raiz del proyecto)
- **Relacionados:** [README.md](README.md)

---
*Actualizado: 2026-01-03*
```

---

## Estados Validos

| Estado | Descripcion | Uso |
|--------|-------------|-----|
| **Activo** | Documento/directorio en uso activo | Contenido vigente y mantenido |
| **En Desarrollo** | Contenido en construccion | Trabajo en progreso |
| **Planificado** | Pendiente de crear | Placeholder para futuro contenido |
| **Obsoleto** | Ya no se mantiene | Marcar para revision/eliminacion |
| **Draft** | Borrador sin aprobar | Requiere revision |

---

## Convenciones

1. **Nombres de archivo:** Usar MAYUSCULAS con guiones (ej: `ARQUITECTURA-GENERAL.md`)
2. **Nombres de directorio:** Usar minusculas con guiones (ej: `01-arquitectura/`)
3. **Prefijos numericos:** Para ordenar directorios (00-99)
4. **Enlaces relativos:** Siempre usar rutas relativas para portabilidad
5. **Fecha de actualizacion:** Actualizar en cada modificacion significativa

---

## Validacion

Usar el script `validate-docs-structure.sh` para verificar:
- Existencia de _MAP.md en directorios con contenido
- Coherencia de enlaces
- Archivos huerfanos (no referenciados)

---

---

## Frontmatter Recomendado (ISS-004)

Agregar al inicio de cada _MAP.md:

```yaml
---
tipo: mapa-navegacion
scope: [workspace|proyecto]
actualizado: YYYY-MM-DD
---
```

---

**Template generado:** 2026-01-03
**Actualizado:** 2026-01-16
**Sistema:** NEXUS v3.4 + SIMCO v4.0.0
**Ref:** ISS-004 Plan de correcciones
