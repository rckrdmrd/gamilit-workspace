# TEMPLATE: Deprecación de Documento

**Versión:** 1.0.0
**Alias:** @TPL_DEPRECACION
**Referencia:** SIMCO-MANTENIMIENTO-DOCUMENTACION.md
**Fecha:** 2026-01-10

---

## Instrucciones de Uso

1. Copiar el bloque de deprecación al INICIO del documento obsoleto
2. Completar todos los campos del bloque
3. Actualizar el _MAP.md correspondiente con estado DEPRECATED
4. Registrar en el changelog del proyecto
5. Notificar a equipos afectados

---

## Bloque de Deprecación

Agregar este bloque **AL INICIO** del documento, justo después del título:

```markdown
---
## ⚠️ DOCUMENTO DEPRECADO

| Campo | Valor |
|-------|-------|
| **Estado** | DEPRECATED |
| **Fecha de deprecación** | {YYYY-MM-DD} |
| **Deprecado por** | {Motivo o referencia al cambio que lo hace obsoleto} |
| **Reemplazo** | `{ruta relativa al documento canonico}` |
| **Eliminar después de** | {YYYY-MM-DD} |
| **Responsable** | {Equipo o persona responsable de la eliminación} |

> **Nota:** Este documento será archivado/eliminado en la fecha indicada.
> Migrar cualquier referencia al documento de reemplazo.

---
```

---

## Ejemplo Completo

### Documento Original (antes)

```markdown
# ET-API-AUTH-001: Especificación de Autenticación v1

## 1. Descripción
Sistema de autenticación basado en sesiones...

## 2. Endpoints
...
```

### Documento Deprecado (después)

```markdown
# ET-API-AUTH-001: Especificación de Autenticación v1

---
## ⚠️ DOCUMENTO DEPRECADO

| Campo | Valor |
|-------|-------|
| **Estado** | DEPRECATED |
| **Fecha de deprecación** | 2026-01-10 |
| **Deprecado por** | Migración a autenticación JWT (ver MCH-E05-auth) |
| **Reemplazo** | `./ET-API-AUTH-002.md` |
| **Eliminar después de** | 2026-02-10 |
| **Responsable** | backend-team |

> **Nota:** Este documento será archivado/eliminado en la fecha indicada.
> Migrar cualquier referencia al documento de reemplazo.

---

## 1. Descripción
Sistema de autenticación basado en sesiones...

## 2. Endpoints
...
```

---

## Períodos de Gracia Recomendados

| Tipo de Documento | Período Mínimo | Acción Final |
|-------------------|----------------|--------------|
| Especificaciones técnicas (ET-*) | 30 días | Eliminar |
| Requerimientos (RF-*) | 30 días | Eliminar |
| User Stories (US-*) | 30 días | Eliminar |
| Guías de usuario | 60 días | Eliminar |
| ADRs | 90 días | Archivar (nunca eliminar) |
| Históricos de proyecto | 90 días | Archivar |
| Documentación de API | 60 días | Eliminar |

---

## Actualización de _MAP.md

Actualizar el _MAP.md del directorio con el estado:

```markdown
| Archivo | Estado | Notas |
|---------|--------|-------|
| ET-API-AUTH-001.md | ~~DEPRECATED~~ | Reemplazado por ET-API-AUTH-002, eliminar 2026-02-10 |
| ET-API-AUTH-002.md | Activo | Versión actual |
```

---

## Registro en Changelog

Agregar entrada en el changelog del proyecto:

```markdown
## [2026-01-10] Deprecaciones

### Documentación
- **DEPRECATED:** `docs/02-especificaciones/ET-API-AUTH-001.md`
  - Motivo: Migración a autenticación JWT
  - Reemplazo: `ET-API-AUTH-002.md`
  - Fecha de eliminación: 2026-02-10
```

---

## Proceso de Archivado

Cuando el período de gracia termina:

### Para documentos que se archivan (ADRs, históricos):

1. Crear carpeta `99-archivo/` si no existe
2. Mover documento a `99-archivo/`
3. Actualizar _MAP.md:
   ```markdown
   | Archivo | Estado | Notas |
   |---------|--------|-------|
   | 99-archivo/ET-API-AUTH-001.md | Archivado | Movido 2026-02-10 |
   ```
4. Registrar en changelog:
   ```markdown
   - **ARCHIVED:** `ET-API-AUTH-001.md` → `99-archivo/`
   ```

### Para documentos que se eliminan:

1. Verificar que no hay referencias activas al documento
2. Eliminar el archivo
3. Actualizar _MAP.md (remover entrada o marcar como eliminado)
4. Registrar en changelog:
   ```markdown
   - **DELETED:** `ET-API-AUTH-001.md` - Período de gracia completado
   ```

---

## Checklist de Deprecación

```markdown
- [ ] Bloque de deprecación agregado al documento
- [ ] Fecha de deprecación correcta
- [ ] Documento de reemplazo indicado
- [ ] Fecha de eliminación establecida (mínimo según tipo)
- [ ] _MAP.md actualizado
- [ ] Changelog actualizado
- [ ] Equipos afectados notificados
- [ ] Referencias en otros documentos identificadas para migrar
```

---

## Notas Importantes

1. **NUNCA eliminar sin deprecar primero** - Siempre dar período de gracia
2. **NUNCA eliminar ADRs** - Solo archivar, las decisiones son historia
3. **Verificar referencias** - Antes de eliminar, buscar quién referencia el documento
4. **Notificar** - Los equipos que usan el documento deben saber del cambio
5. **Documentar el reemplazo** - Siempre indicar qué documento lo reemplaza

---

**Referencia:** @MANTENIMIENTO_DOCS
