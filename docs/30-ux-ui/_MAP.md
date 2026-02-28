---
titulo: 30-ux-ui — Mapa de Navegacion
tipo: mapa-navegacion
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# 30-ux-ui — Mapa de Navegacion

## Estructura

```
30-ux-ui/
├── _MAP.md
├── flujos/
│   ├── _INDEX.md
│   ├── _MAP.md
│   ├── COBERTURA-TOTAL-PROCESOS.md
│   ├── MATRIZ-BRECHAS-TRAZABILIDAD-2026-02-17.md
│   ├── admin/
│   │   ├── _INDEX.md
│   │   ├── _MAP.md
│   │   ├── FLUJO-APROBACION-CONTENIDO.md
│   │   ├── FLUJO-AUDIT-LOGS.md
│   │   ├── FLUJO-CONFIGURACION-SISTEMA.md
│   │   ├── FLUJO-CONSTRUCTOR-EJERCICIOS.md
│   │   ├── FLUJO-DASHBOARD-ADMIN.md
│   │   ├── FLUJO-GESTION-GAMIFICACION.md
│   │   ├── FLUJO-GESTION-USUARIOS-ROLES.md
│   │   ├── FLUJO-INSTITUCIONES-ROLES.md
│   │   ├── FLUJO-INTEGRACIONES-LTI.md
│   │   ├── FLUJO-MONITOREO-SISTEMA.md
│   │   └── FLUJO-REPORTES-ANALYTICS-ADMIN.md
│   ├── auth/
│   │   ├── _INDEX.md
│   │   ├── FLUJO-RECUPERACION-PASSWORD.md
│   │   ├── FLUJO-REGISTRO-LOGIN.md
│   │   └── FLUJO-VERIFICACION-EMAIL.md
│   ├── parents/
│   │   └── FLUJO-DASHBOARD-PADRES.md
│   ├── system/
│   │   └── ...
│   └── ...
└── ...
```

## Archivos

- **COBERTURA-TOTAL-PROCESOS.md** — Matriz de cobertura de todos los procesos del sistema
- **MATRIZ-BRECHAS-TRAZABILIDAD-2026-02-17.md** — Analisis de brechas entre requerimientos y flujos

## Subdirectorios

- **flujos/** — Flujos de usuario por portal (admin, auth, parents, student, teacher, system, shared)
  - **admin/** — Flujos del portal administrador (22 flujos: originales 11 + nuevos 11 2026-02-27)
  - **auth/** — Flujos de autenticacion (3 flujos: registro, login, recuperacion password)
  - **parents/** — Flujos del portal padres (7 flujos: login, registro, dashboard, seguimiento, notificaciones, vinculacion, progreso hijo)
  - **shared/** — Flujos transversales (2 flujos: sesion-seguridad, perfil-configuracion, white-label theming)
  - **student/** — Flujos del portal estudiante (25+ flujos por dominio funcional)
  - **system/** — Flujos del sistema (6 flujos: exercise-submission-pipeline, gamification-reward-chain, two-factor-auth, multi-tenant-onboarding, multi-tenant-isolation)
  - **teacher/** — Flujos del portal docente (17 flujos: access, management, evaluation, monitoring, notifications, config)
