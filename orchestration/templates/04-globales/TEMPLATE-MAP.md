# TEMPLATE: Archivo _MAP.md

**Version:** 1.1.0  
**Sistema:** NEXUS v4.1 + SIMCO v4.0.0  
**Proposito:** Plantilla estandar para mapas de navegacion `_MAP.md`

---

## Instrucciones de Uso

1. Copiar este template al directorio objetivo.
2. Renombrar el archivo a `_MAP.md`.
3. Reemplazar placeholders `{...}` por rutas reales.
4. Mantener solo enlaces existentes.
5. Actualizar fecha en cada cambio relevante.

---

## Estructura Base Recomendada

```markdown
# {NOMBRE_DEL_DIRECTORIO}

> {Descripcion breve del contenido}

## Contenido

| Archivo/Directorio | Descripcion | Estado |
|--------------------|-------------|--------|
| `{archivo}.md` | {Descripcion breve} | Activo |
| `{subdirectorio}/` | {Descripcion del subdirectorio} | Activo |

## Navegacion

- **Padre:** `{ruta-relativa-al-padre}`
- **Relacionados:** `{ruta-relacionada-1}`, `{ruta-relacionada-2}`

---
*Actualizado: {YYYY-MM-DD}*
```

---

## Estados Validos

| Estado | Descripcion | Uso |
|--------|-------------|-----|
| **Activo** | Documento/directorio en uso | Contenido vigente |
| **En Desarrollo** | Trabajo en progreso | No estable |
| **Planificado** | Pendiente de crear | Placeholder |
| **Obsoleto** | Ya no mantenido | Migrar o deprecar |
| **Draft** | Borrador | Requiere revision |

---

## Convenciones

1. Usar rutas relativas.
2. Evitar rutas legacy fuera de SSOT.
3. No enlazar placeholders (`{...}`) como links Markdown.
4. Documentar solo entradas navegables y vigentes.

---

**Template generado:** 2026-01-03  
**Actualizado:** 2026-02-17
