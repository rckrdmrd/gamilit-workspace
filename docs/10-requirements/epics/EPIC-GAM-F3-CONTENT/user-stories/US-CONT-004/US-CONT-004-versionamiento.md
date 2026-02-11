---
id: "US-CONT-004"
title: "Versionamiento de Contenido"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-006"
story_points: 5
budget: "$2,900 MXN"
sprint: "Sprint-3"
labels: ["ext-006", "versionamiento", "audit-trail", "rollback", "historial", "diff", "git-like", "mes-3"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-CONT-004: Versionamiento de Contenido

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-CONT-004 |
| **Épica** | EXT-006 - Gestión de Contenido |
| **Título** | Sistema de Control de Versiones y Audit Trail |
| **Prioridad** | Media (P2) |
| **Story Points** | 5 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $2,900 MXN |

---

## Historia de Usuario

**Como** profesor o administrador
**Quiero** historial completo de cambios en módulos y actividades con rollback, comparación y audit trail
**Para** recuperar contenido eliminado, rastrear cambios y cumplir con auditorías

---

## Valor de Negocio

### Impacto
- **Seguridad**: Recuperar contenido eliminado accidentalmente
- **Transparencia**: Auditoría completa de cambios
- **Colaboración**: Ver quién cambió qué y cuándo
- **Compliance**: Cumplir requisitos regulatorios

### Métricas de Éxito
- >90% recuperaciones exitosas de versiones
- 0 pérdidas de contenido irreversibles
- Tiempo de rollback <2 minutos
- >85% satisfacción con trazabilidad

---

## Criterios de Aceptación

### CA-01: Historial de Cambios
- Registrar cada guardado como nueva versión
- Metadata de versión:
  - Timestamp exacto
  - Usuario que modificó
  - Descripción del cambio (opcional)
  - Diff summary (caracteres cambiados)
- Límite de versiones: últimas 50 (configurable)
- Compresión de versiones antiguas
- Auto-purge de versiones >1 año (opcional)

### CA-02: Versionamiento Automático
- Cada guardado crea versión automáticamente
- Versionamiento granular: por módulo, por actividad
- No requiere acción manual del usuario
- Snapshot completo del contenido
- Referencia a archivos multimedia (no duplicar)

### CA-03: Rollback a Versiones Anteriores
- Lista de versiones en sidebar
- Preview de versión antes de restaurar
- Botón "Restaurar esta versión"
- Confirmación antes de rollback
- Crear nueva versión al restaurar (no sobrescribir)
- Rollback parcial (solo secciones específicas)

### CA-04: Comparación de Versiones (Diff View)
- Vista side-by-side de dos versiones
- Highlighting de cambios:
  - Texto agregado (verde)
  - Texto eliminado (rojo)
  - Texto modificado (amarillo)
- Comparación línea por línea
- Jump to next/previous change
- Exportar diff como PDF
- Aceptar/rechazar cambios individuales (merge)

### CA-05: Etiquetado de Versiones
- Etiquetar versiones importantes (v1.0, v2.0)
- Nombres descriptivos ("Antes de revisión", "Versión final")
- Filtrar por tags
- Versiones etiquetadas no se purgan automáticamente
- Comparar con versión etiquetada

### CA-06: Audit Trail
**Registrar todos los eventos:**
- Creación de contenido
- Modificaciones (con diff)
- Eliminaciones
- Restauraciones
- Cambios de permisos
- Publicación/despublicación

**Información capturada:**
- Usuario (nombre, email, rol)
- IP address
- Timestamp exacto
- Acción realizada
- Before/after values
- User agent (browser)

### CA-07: Papelera de Reciclaje
- Contenido eliminado va a papelera (no se borra)
- Retención: 30 días en papelera
- Restaurar desde papelera con un click
- Eliminar permanentemente (requiere confirmación)
- Vaciar papelera automáticamente después de 30 días
- Admin puede ver papelera de todos los usuarios

### CA-08: Merge de Cambios
- Detectar conflictos si dos usuarios editan simultáneamente
- Vista de conflictos con opciones:
  - Mantener mi versión
  - Aceptar su versión
  - Merge manual (editar)
- Estrategias de merge:
  - Last write wins (default)
  - Manual resolution
  - Auto-merge si no hay conflictos
- Notificar a usuarios sobre conflictos

### CA-09: Versionamiento de Archivos Multimedia
- Versionar archivos en biblioteca (US-CONT-003)
- Reemplazar imagen mantiene historial
- Rollback a versión anterior de archivo
- Comparación visual de imágenes (side-by-side)
- Metadata de versión (tamaño, dimensiones)

### CA-10: Exportación de Historial
- Exportar audit log como CSV/Excel
- Filtrar por usuario, fecha, tipo de acción
- Reportes de actividad:
  - "Cambios en último mes"
  - "Modificaciones por usuario"
- Estadísticas:
  - Total de versiones
  - Frecuencia de cambios
  - Usuarios más activos

### CA-11: Notificaciones de Cambios
- Notificar a stakeholders cuando contenido cambia
- Suscribirse a módulos específicos
- Digest diario/semanal de cambios
- RSS feed de cambios (opcional)
- Webhooks para integraciones externas

### CA-12: Performance y Storage
- Almacenar solo diffs (no snapshots completos)
- Compresión de versiones antiguas
- Lazy loading de historial (últimas 10 primero)
- Índices en tablas de versiones
- Particionamiento por fecha
- Archive a cold storage después de 6 meses

### CA-13: Permisos y Seguridad
**Control de acceso:**
- Solo autor puede ver historial de sus borradores
- Admin puede ver todo el historial
- Profesores ven historial de su contenido
- Estudiantes NO ven historial (solo versión publicada)

**Audit de auditoría:**
- Log de quién accede al audit trail
- Prevenir modificación de logs
- Inmutabilidad de registros históricos
- Encriptación de datos sensibles

### CA-14: Interfaz de Usuario
- Timeline visual de versiones (gráfico)
- Filtros: Por usuario, por fecha, por tipo
- Búsqueda en historial
- Badges de versiones importantes
- Indicador de "Sin guardar" en editor
- Última modificación mostrada (ej: "Editado hace 5 min por Juan")

### CA-15: Integración con Sistema
- Versionamiento transparente (no afecta flujo normal)
- API para versiones:
  ```typescript
  GET /api/content/:id/versions
  GET /api/content/:id/versions/:versionId
  POST /api/content/:id/restore/:versionId
  GET /api/content/:id/diff?from=v1&to=v2
  ```
- Hooks en sistema de guardado
- Compatible con US-CONT-001 (editor)

---

## Especificaciones Técnicas

### Database Schema
```sql
CREATE TABLE content_versions (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES content(id),
  version_number INTEGER,
  content_snapshot JSONB, -- full snapshot or diff
  changes_summary TEXT,
  user_id UUID REFERENCES users(id),
  tag VARCHAR(100),
  created_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_versions_content ON content_versions(content_id);
CREATE INDEX idx_versions_created ON content_versions(created_at);

CREATE TABLE audit_trail (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50), -- 'module', 'activity', etc.
  entity_id UUID,
  action VARCHAR(50), -- 'create', 'update', 'delete', 'restore'
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  before_state JSONB,
  after_state JSONB,
  timestamp TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp);
CREATE INDEX idx_audit_user ON audit_trail(user_id);
```

### Frontend Components
```
src/features/versioning/
├── components/
│   ├── VersionHistory.tsx
│   ├── VersionTimeline.tsx
│   ├── DiffViewer.tsx
│   ├── RestoreModal.tsx
│   ├── AuditLog.tsx
│   └── RecycleBin.tsx
└── hooks/
    ├── useVersions.ts
    └── useAuditTrail.ts
```

### Technology Stack
```
Backend:
- PostgreSQL JSONB para snapshots
- diff-match-patch para generar diffs
- compression (zlib) para versiones antiguas

Frontend:
- react-diff-viewer para comparación
- react-timeline para visualización
- moment.js para timestamps
```

---

## Diferenciación con Alcance Inicial

### Alcance Inicial (EAI)
- Sin versionamiento
- Guardado sobrescribe
- Sin recuperación de contenido eliminado
- Sin audit trail

### Esta Historia (EXT-006)
- **Historial completo** de cambios
- **Rollback** a cualquier versión
- **Comparación** visual de versiones
- **Papelera** de reciclaje
- **Audit trail** completo
- **Merge** de conflictos
- **Etiquetado** de versiones
- Esto es **control de versiones tipo Git**

---

## Dependencias

### Depende de
- **US-CONT-001**: Editor (integración)
- **US-CONT-002**: Ejercicios (versionamiento)
- **US-CONT-003**: Multimedia (versionamiento de archivos)

---

## Definición de Terminado (DoD)

- [ ] Sistema de versionamiento automático
- [ ] Historial de versiones UI
- [ ] Rollback funcional
- [ ] Diff viewer side-by-side
- [ ] Etiquetado de versiones
- [ ] Audit trail completo
- [ ] Papelera de reciclaje
- [ ] Merge de conflictos
- [ ] Exportación de historial
- [ ] Notificaciones de cambios
- [ ] API de versiones
- [ ] Performance optimizada (diffs)
- [ ] Tests >80% coverage
- [ ] Documentación
- [ ] Video tutorial

---

## Estimación Detallada (5 SP)

| Tarea | Horas |
|-------|-------|
| Diseño de schema | 4h |
| Sistema de versionamiento | 10h |
| Historial UI | 8h |
| Rollback | 6h |
| Diff viewer | 10h |
| Papelera | 6h |
| Audit trail | 8h |
| Merge conflicts | 8h |
| Backend API | 8h |
| Testing | 8h |
| Documentación | 4h |
| **TOTAL** | **80h** |

**Presupuesto**: $2,900 MXN
**Duración**: 2 días

---

## Tags

#ext-006 #versionamiento #audit-trail #rollback #historial #diff #git-like #mes-3

---

**Creado**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Origen**: EP010/HU-EP010-03-content-management.md
**Compliance**: PF-001 (XXX líneas)
