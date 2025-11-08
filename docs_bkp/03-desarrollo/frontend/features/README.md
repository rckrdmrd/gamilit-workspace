# Estructura y Features - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**Arquitectura:** Feature-Sliced Design + Multi-App Architecture

---

## Índice

### [Estructura del Proyecto](./Estructura-Proyecto.md)

**Contenido:**
- Árbol de directorios completo
- Arquitectura general
- Organización de carpetas
- Feature-Sliced Design (FSD)

### [Features de Estudiante](./Features-Student.md)

**Rol:** Student
**Objetivo:** Experiencia de aprendizaje gamificada

**Páginas principales:**
- Dashboard con progreso
- Vista de aprendizaje
- Realización de ejercicios
- Logros y badges
- Tienda ML Coins
- Rankings y gremios

### [Features de Profesor](./Features-Teacher.md)

**Rol:** Admin Teacher
**Objetivo:** Monitoreo y gestión de estudiantes

**Páginas principales:**
- Dashboard con métricas
- Monitoreo en tiempo real
- Detalle de estudiantes
- Gestión de tareas
- Analytics de aprendizaje
- Alertas y acciones

### [Features de Administrador](./Features-Admin.md)

**Rol:** Super Admin
**Objetivo:** Administración del sistema

**Páginas principales:**
- Dashboard del sistema
- Gestión de usuarios
- Gestión de organizaciones
- Monitoreo del sistema
- Gestión de contenido
- Configuración global

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAMILITFRONTEND                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Student  │  │  Teacher   │  │   Admin    │                │
│  │    App     │  │    App     │  │    App     │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │                │                │                        │
│        └────────────────┼────────────────┘                        │
│                         │                                         │
│  ┌──────────────────────▼──────────────────────┐                │
│  │          Shared Features Layer              │                │
│  │  ┌──────┬─────────┬────────┬──────────┐    │                │
│  │  │ Auth │ Gamif.  │ Mechs  │ Notifs   │    │                │
│  │  └──────┴─────────┴────────┴──────────┘    │                │
│  └──────────────────────────────────────────────┘                │
│                         │                                         │
│  ┌──────────────────────▼──────────────────────┐                │
│  │          Shared Infrastructure              │                │
│  │  ┌─────────┬─────────┬──────────────┐      │                │
│  │  │   API   │  Types  │  Components  │      │                │
│  │  └─────────┴─────────┴──────────────┘      │                │
│  └──────────────────────────────────────────────┘                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Características Principales

- **Feature-Sliced Design**: Organización modular por features
- **Multi-App**: 3 aplicaciones con UX especializada
- **Type-Safe**: TypeScript estricto en toda la aplicación
- **State Management**: Zustand con persistencia selectiva
- **Build Tool**: Vite para desarrollo rápido
- **Styling**: Tailwind CSS con tema Detective personalizado

---

## Navegación Rápida

- **Estructura completa del proyecto:** Ver [Estructura-Proyecto.md](./Estructura-Proyecto.md)
- **Features del rol estudiante:** Ver [Features-Student.md](./Features-Student.md)
- **Features del rol profesor:** Ver [Features-Teacher.md](./Features-Teacher.md)
- **Features del rol administrador:** Ver [Features-Admin.md](./Features-Admin.md)

---

## Tecnologías Principales

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.2.0 | Framework UI |
| TypeScript | 5.3.3 | Type safety |
| Vite | 5.0.8 | Build tool |
| Zustand | 4.4.7 | State management |
| React Router | 6.20.0 | Routing |
| Tailwind CSS | 3.4.0 | Styling |
| Axios | 1.6.2 | HTTP client |
| Lucide React | 0.294.0 | Icons |

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
**Mantenedor:** Equipo GAMILIT
