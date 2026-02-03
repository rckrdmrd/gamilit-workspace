# ADR-030: Convencion de Nombres de Paginas sin Sufijo "Page"

**Estado:** ACEPTADO
**Fecha:** 2026-01-25
**Contexto:** TASK-2026-01-30-CORRECCION-INTEGRAL (Fase 3.2)

---

## Contexto

Los componentes de pagina en el frontend usaban el patron `{Nombre}Page.tsx`:

- `TeacherDashboardPage.tsx`
- `TeacherAnalyticsPage.tsx`
- `StudentProfilePage.tsx`
- etc.

Este patron presenta problemas:

1. **Redundancia:** El directorio `pages/` ya indica que son paginas
2. **Verbosidad:** Nombres mas largos de lo necesario
3. **Inconsistencia:** Algunos componentes no seguian el patron

## Decision

**Remover el sufijo "Page" de los componentes de pagina.**

### Nueva Convencion

| Antes | Despues |
|-------|---------|
| `TeacherDashboardPage.tsx` | `TeacherDashboard.tsx` |
| `TeacherAnalyticsPage.tsx` | `TeacherAnalytics.tsx` |
| `TeacherAssignmentsPage.tsx` | `TeacherAssignments.tsx` |
| `TeacherClassesPage.tsx` | `TeacherClasses.tsx` |
| `TeacherGamificationPage.tsx` | `TeacherGamification.tsx` |
| `TeacherStudentsPage.tsx` | `TeacherStudents.tsx` |

### Alcance

Esta convencion aplica a **todos los portales**:
- Student Portal
- Teacher Portal
- Admin Portal
- Parent Portal (nuevo)

### Excepciones

Ninguna. Todos los componentes en `pages/` deben seguir esta convencion.

## Consecuencias

### Positivas

- **Nombres mas cortos:** Imports mas limpios
- **Convencion clara:** El directorio indica el tipo
- **Consistencia:** Misma regla para todos los portales

### Negativas

- **Renombre masivo:** Requirio actualizar ~20 archivos
- **Git history:** Archivos aparecen como "eliminados y creados"

### Mitigacion

- Usar `git mv` para preservar historial donde fue posible
- Documentar en CHANGELOG

## Patron de Nombres Final

```
apps/frontend/src/apps/{portal}/
├── components/           # Componentes reutilizables
│   └── {Nombre}.tsx     # Sin sufijo
├── pages/               # Paginas/vistas
│   └── {Nombre}.tsx     # Sin sufijo "Page"
├── hooks/               # Hooks custom
│   └── use{Nombre}.ts   # Prefijo "use"
└── stores/              # Estado global
    └── {nombre}Store.ts # Sufijo "Store"
```

## Referencias

- Teacher Portal: `apps/frontend/src/apps/teacher/pages/`
- FRONTEND_INVENTORY.yml v4.10.0
- TASK-2026-01-30-CORRECCION-INTEGRAL

---

*Sistema SIMCO v4.3.0*
*Fecha documentacion: 2026-01-30*
