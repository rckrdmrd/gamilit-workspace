# ADR-031: Introduccion del Portal de Padres (Parent Portal)

**Estado:** ACEPTADO
**Fecha:** 2026-01-27
**Contexto:** TASK-2026-01-30-CORRECCION-INTEGRAL (Fase 3.3)

---

## Contexto

GAMILIT es una plataforma educativa con gamificacion que originalmente contemplaba tres portales:

1. **Student Portal** - Para estudiantes
2. **Teacher Portal** - Para profesores
3. **Admin Portal** - Para administradores

La epica **EXT-011: Portal de Padres** establece la necesidad de un cuarto portal para que los padres/tutores puedan:

- Monitorear el progreso de sus hijos
- Recibir notificaciones sobre logros y areas de mejora
- Comunicarse con profesores
- Ver reportes de desempeno

## Decision

**Crear un nuevo Portal de Padres (Parent Portal) como aplicacion independiente dentro del frontend.**

### Estructura Implementada

```
apps/frontend/src/apps/parent/
├── components/
│   └── ParentLayout.tsx
├── pages/
│   ├── ParentDashboard.tsx
│   ├── ParentProgress.tsx
│   └── ParentNotifications.tsx
├── hooks/
│   └── useParentData.ts
└── index.tsx
```

### Alcance Inicial (35%)

| Funcionalidad | Estado | Descripcion |
|---------------|--------|-------------|
| Dashboard basico | Implementado | Vista general del progreso |
| Ver progreso | Implementado | Metricas del estudiante |
| Notificaciones | Parcial | Recibir alertas |
| Comunicacion | Pendiente | Mensajes con profesores |
| Reportes | Pendiente | Reportes detallados |

### Backend Support

- Modulo `parent-portal` creado
- Modulo `parent-notifications` para alertas
- Endpoints especificos para datos de padres
- Guards de autenticacion para rol PARENT

## Consecuencias

### Positivas

- **Involucramiento familiar:** Padres pueden participar en el proceso educativo
- **Transparencia:** Visibilidad del progreso del estudiante
- **Comunicacion:** Canal directo con profesores
- **Gamificacion extendida:** Padres pueden celebrar logros

### Negativas

- **Complejidad adicional:** Nuevo portal a mantener
- **Permisos:** Logica de permisos mas compleja (padre-hijo)
- **Notificaciones:** Sistema de notificaciones debe soportar otro canal

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Privacidad datos estudiante | Media | Alto | RLS policies estrictas |
| Sobrecarga de notificaciones | Media | Medio | Configuracion de preferencias |
| Adopcion baja | Baja | Medio | UX intuitiva |

## Roadmap

| Fase | Completitud | ETA |
|------|-------------|-----|
| Fase 1: Estructura base | 35% | 2026-01 (actual) |
| Fase 2: Dashboard completo | 50% | Q1 2026 |
| Fase 3: Comunicacion | 75% | Q2 2026 |
| Fase 4: Reportes avanzados | 100% | Q2 2026 |

## Referencias

- Epica: EXT-011 (Portal de Padres)
- Backend: `apps/backend/src/modules/parent-portal/`
- Frontend: `apps/frontend/src/apps/parent/`
- MASTER_INVENTORY.yml v5.1.0
- TASK-2026-01-30-CORRECCION-INTEGRAL

---

*Sistema SIMCO v4.3.0*
*Fecha documentacion: 2026-01-30*
