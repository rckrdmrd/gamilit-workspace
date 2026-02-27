---
titulo: AdminReportsPage UI Specification
tipo: guia
dominio: frontend
ultima_actualizacion: 2026-02-27
---

# AdminReportsPage - UI Specification

**Componente**: AdminReportsPage
**Ruta**: `/admin/reports`
**Fecha**: 2025-11-24
**Estado**: Implementado

---

## Layout General

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AdminLayout (Header + Sidebar)                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Generación de Reportes                                            │  │
│  │ Genera y gestiona reportes del sistema en diferentes formatos    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ ⚠️  BETA: Almacenamiento en Memoria                              │  │
│  │                                                                   │  │
│  │ IMPORTANTE: Los reportes se generan en memoria temporal y        │  │
│  │ no persisten al reiniciar el servidor backend.                   │  │
│  │                                                                   │  │
│  │ • Los reportes se perderán cuando el servidor se reinicie        │  │
│  │ • Esta es una implementación MVP para demostración               │  │
│  │ • Persistencia en BD será implementada en fase posterior    [X] │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────┬────────────────────────────────────────┐  │
│  │ Generar Nuevo Reporte   │ Reportes Generados (5)     [Actualizar]│  │
│  │                         │                                         │  │
│  │ Tipo de Reporte *       │ ┌──────────────────────────────────────┐│  │
│  │ [Reporte de Usuarios▼]  │ │Tipo│Formato│Estado│Fecha │Acciones  ││  │
│  │ Información de usuarios │ ├────┼───────┼──────┼──────┼──────────┤│  │
│  │                         │ │Usr │[CSV]  │[COM] │Nov24 │[↓] [🗑️] ││  │
│  │ Formato *               │ │Prg │[XLSX] │[GEN] │Nov24 │[⏳] [🗑️]││  │
│  │ [Excel (XLSX)       ▼]  │ │Gam │[PDF]  │[PEN] │Nov24 │[⏳] [🗑️]││  │
│  │                         │ │Sys │[CSV]  │[COM] │Nov23 │[↓] [🗑️] ││  │
│  │ Fecha Inicio (Opcional) │ │Ins │[XLSX] │[FAI] │Nov23 │[❌] [🗑️]││  │
│  │ [2025-01-01        ]    │ └──────────────────────────────────────┘│  │
│  │                         │                                         │  │
│  │ Fecha Fin (Opcional)    │ COM = Completado (verde)                │  │
│  │ [2025-12-31        ]    │ GEN = Generando (azul)                  │  │
│  │                         │ PEN = Pendiente (amarillo)              │  │
│  │ ID de Aula (Opcional)   │ FAI = Fallido (rojo)                    │  │
│  │ [UUID del aula...  ]    │                                         │  │
│  │                         │ Mostrando 5 de 5 reportes               │  │
│  │ [Generar Reporte]       │                                         │  │
│  └─────────────────────────┴────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
[▼]    = Dropdown
[COM]  = Badge (colored)
[↓]    = Download button
[🗑️]   = Delete button
[⏳]   = Loading spinner
[❌]   = Disabled button
[X]    = Dismiss button
```

---

## Componentes Individuales

### 1. BetaBanner

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠️  BETA: Almacenamiento en Memoria                         [X] │
│                                                                  │
│ IMPORTANTE: Los reportes se generan en memoria temporal y       │
│ no persisten al reiniciar el servidor backend.                  │
│                                                                  │
│ • Los reportes generados se perderán cuando el servidor se      │
│   reinicie                                                       │
│ • Esta es una implementación MVP para demostración              │
│ • La persistencia en base de datos será implementada en una     │
│   fase posterior                                                │
└──────────────────────────────────────────────────────────────────┘

Color Scheme:
- Background: Amber-50 (light) / Amber-900/20 (dark)
- Border: Amber-400 (left border 4px)
- Icon: Amber-400
- Text: Amber-800 (light) / Amber-300 (dark)
```

### 2. ReportGenerationForm

```
┌─────────────────────────────────────┐
│ Generar Nuevo Reporte               │
│                                     │
│ Tipo de Reporte *                   │
│ ┌─────────────────────────────────┐ │
│ │ Reporte de Usuarios          ▼ │ │
│ └─────────────────────────────────┘ │
│ Información de usuarios registrados │
│ y actividad                         │
│                                     │
│ Formato *                           │
│ ┌─────────────────────────────────┐ │
│ │ Excel (XLSX)                 ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Fecha Inicio (Opcional)             │
│ ┌─────────────────────────────────┐ │
│ │ 2025-01-01                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Fecha Fin (Opcional)                │
│ ┌─────────────────────────────────┐ │
│ │ 2025-12-31                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ID de Aula (Opcional)               │
│ ┌─────────────────────────────────┐ │
│ │ UUID del aula                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │     Generar Reporte             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

States:
- Normal: Teal button, all fields enabled
- Generating:
  Button: [⏳ Generando...]
  All fields: disabled
```

### 3. ReportsList

```
┌────────────────────────────────────────────────────────────────┐
│ Reportes Generados (5)      ⟳ Auto-refresh activo [Actualizar]│
│                                                                │
│ ┌────┬───────┬──────┬──────────────────────┬──────────────┐  │
│ │Tipo│Formato│Estado│Fecha                 │Acciones      │  │
│ ├────┼───────┼──────┼──────────────────────┼──────────────┤  │
│ │Usr │ CSV   │ COM  │Nov 24, 2025, 10:30 AM│ [↓]  [🗑️]   │  │
│ │Prg │ Excel │ GEN  │Nov 24, 2025, 10:25 AM│ [⏳] [🗑️]   │  │
│ │Gam │ PDF   │ PEN  │Nov 24, 2025, 10:20 AM│ [⏳] [🗑️]   │  │
│ │Sys │ CSV   │ COM  │Nov 23, 2025, 03:15 PM│ [↓]  [🗑️]   │  │
│ │Ins │ Excel │ FAI  │Nov 23, 2025, 02:00 PM│ [❌] [🗑️]   │  │
│ └────┴───────┴──────┴──────────────────────┴──────────────┘  │
│                                                                │
│ Mostrando 5 de 5 reportes                                     │
└────────────────────────────────────────────────────────────────┘

Empty State:
┌────────────────────────────────────────────────────────────────┐
│ Reportes Generados (0)                          [Actualizar]  │
│                                                                │
│                        📄                                      │
│                                                                │
│              No hay reportes generados                        │
│     Genera tu primer reporte usando el formulario de arriba   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Loading State:
┌────────────────────────────────────────────────────────────────┐
│ Reportes Generados (-)                          [⏳]          │
│                                                                │
│                        ⏳                                      │
│                                                                │
│                   Cargando reportes...                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 4. Toast Notifications

```
Success:
┌────────────────────────────────────────────────────────┐
│ ✓ Reporte generado exitosamente. Se está procesando...│ [X]
└────────────────────────────────────────────────────────┘
Color: Green-50 / Green-900/20

Error:
┌────────────────────────────────────────────────────────┐
│ ✗ Error al generar reporte                            │ [X]
└────────────────────────────────────────────────────────┘
Color: Red-50 / Red-900/20

Position: Top of content area, below banner
Duration: 5 seconds (auto-dismiss)
Dismissible: Yes
```

---

## Estados y Transiciones

### Generación de Reporte

```
Estado Inicial
    │
    │ [User clicks "Generar Reporte"]
    ▼
Generando (Loading)
    │
    │ [Backend responds]
    ▼
┌─────────┴─────────┐
│                   │
▼                   ▼
Éxito             Error
│                   │
│                   │
▼                   ▼
Toast Verde      Toast Rojo
│
│ [5 segundos]
▼
Toast desaparece
```

### Auto-refresh de Reportes

```
Lista Inicial
    │
    │ [hasPendingReports = true]
    ▼
Inicia Timer (5s)
    │
    │ [Timer tick]
    ▼
Fetch Reports
    │
    │ [Backend responds]
    ▼
Actualiza Lista
    │
    │ [hasPendingReports?]
    ▼
┌─────────┴─────────┐
│                   │
▼                   ▼
Sí              No
│                   │
Continuar         Detener
Timer             Timer
```

### Descarga de Reporte

```
Estado Inicial
    │
    │ [User clicks Download]
    ▼
Verificar Status
    │
    │ [status === 'completed'?]
    ▼
┌─────────┴─────────┐
│                   │
▼                   ▼
Sí              No
│                   │
│                   └─> Error: "Reporte no disponible"
│
│ [Fetch Blob]
▼
Descargando
    │
    │ [Blob received]
    ▼
Browser Download
    │
    │ [File saved]
    ▼
Toast Verde
```

### Eliminación de Reporte

```
Estado Inicial
    │
    │ [User clicks Delete]
    ▼
Confirmación
    │
    │ [User confirms?]
    ▼
┌─────────┴─────────┐
│                   │
▼                   ▼
Sí              No
│                   │
│                   └─> Cancelar
│
│ [DELETE request]
▼
Eliminando
    │
    │ [Backend responds]
    ▼
┌─────────┴─────────┐
│                   │
▼                   ▼
Éxito             Error
│                   │
│                   │
▼                   ▼
Actualiza Lista  Toast Rojo
+
Toast Verde
```

---

## Responsive Design

### Desktop (≥ 1024px)
- Layout: 3 columnas (1 formulario + 2 lista)
- Tabla: Todas las columnas visibles
- Banner: Full width

### Tablet (768px - 1023px)
- Layout: Stacked (formulario arriba, lista abajo)
- Tabla: Scroll horizontal si necesario
- Banner: Full width

### Mobile (< 768px)
- Layout: Stacked (formulario arriba, lista abajo)
- Tabla: Cards en lugar de tabla
- Banner: Full width, texto condensado

---

## Color Palette

### Status Badges

| Status      | Background               | Text                   | Border   |
|-------------|--------------------------|------------------------|----------|
| PENDING     | yellow-100 / yellow-900  | yellow-800 / yellow-300| -        |
| GENERATING  | blue-100 / blue-900      | blue-800 / blue-300    | -        |
| COMPLETED   | green-100 / green-900    | green-800 / green-300  | -        |
| FAILED      | red-100 / red-900        | red-800 / red-300      | -        |

### Format Badges

| Format  | Background               | Text                   |
|---------|--------------------------|------------------------|
| PDF     | gray-100 / gray-700      | gray-800 / gray-300    |
| CSV     | gray-100 / gray-700      | gray-800 / gray-300    |
| Excel   | gray-100 / gray-700      | gray-800 / gray-300    |

### Type Badges

| Type      | Display Text              | Color               |
|-----------|---------------------------|---------------------|
| users     | Usuarios                  | -                   |
| progress  | Progreso                  | -                   |
| gamification| Gamificación            | -                   |
| system    | Sistema                   | -                   |
| student_insights| Insights Estudiantes | -                   |
| classroom_summary| Resumen Aulas        | -                   |
| risk_analysis| Análisis Riesgo         | -                   |

---

## Accessibility (A11y)

### Keyboard Navigation
- Tab order: Formulario → Lista → Acciones
- Enter: Activar botones
- Esc: Cerrar toasts, cancelar confirmaciones

### Screen Reader Support
- ARIA labels en botones de iconos
- ARIA live regions para toasts
- ARIA describedby para estados de loading
- Alt text en iconos

### Focus Management
- Visible focus indicators (ring-2)
- Focus trap en modales de confirmación
- Auto-focus en campos importantes

---

## Performance

### Optimizations
- Memo de componentes estáticos
- useCallback para handlers
- Cleanup de timers y listeners
- Lazy loading de lista (future)

### Loading States
- Skeleton loaders (future)
- Shimmer effects (future)
- Progressive loading (future)

---

## Testing Checklist

### Functional Tests
- [ ] Generar reporte (cada tipo)
- [ ] Generar reporte (cada formato)
- [ ] Generar con filtros opcionales
- [ ] Generar sin filtros opcionales
- [ ] Lista muestra reportes correctamente
- [ ] Auto-refresh funciona
- [ ] Descargar reporte COMPLETED
- [ ] Botón download deshabilitado para no-COMPLETED
- [ ] Eliminar reporte con confirmación
- [ ] Cancelar eliminación
- [ ] Banner dismissible
- [ ] Banner re-aparece después de limpiar localStorage
- [ ] Toast auto-dismiss
- [ ] Toast manual dismiss

### UI/UX Tests
- [ ] Responsive en mobile
- [ ] Responsive en tablet
- [ ] Dark mode
- [ ] Loading states visibles
- [ ] Error states informativos
- [ ] Empty state amigable
- [ ] Badges coloreados correctamente
- [ ] Fechas formateadas correctamente

### Edge Cases
- [ ] Error de red
- [ ] Error 401 (unauthorized)
- [ ] Error 500 (server error)
- [ ] Lista vacía
- [ ] > 20 reportes (paginación)
- [ ] Múltiples reportes PENDING
- [ ] Reporte FAILED
- [ ] Download mientras está GENERATING

---

## Future Enhancements

### Phase 2
- [ ] Filtros avanzados (dropdown de tipos, status)
- [ ] Búsqueda por nombre/ID
- [ ] Ordenamiento de columnas
- [ ] Paginación completa con controles
- [ ] Vista previa de reporte

### Phase 3
- [ ] Programación de reportes (schedule)
- [ ] Reportes recurrentes
- [ ] Notificaciones push cuando listo
- [ ] Compartir reporte por email
- [ ] Export múltiple (ZIP)

### Phase 4
- [ ] Dashboard de reportes
- [ ] Gráficos de uso
- [ ] Historial de descargas
- [ ] Favoritos
- [ ] Templates de reportes

---

**Document Version**: 1.0
**Last Updated**: 2025-11-24
**Status**: Implemented & Documented
