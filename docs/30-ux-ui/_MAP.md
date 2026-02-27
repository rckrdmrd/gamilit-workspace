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

- **flujos/** — Flujos de usuario por portal (admin, auth, parents, student, teacher, system)
  - **admin/** — Flujos del portal administrador (11 flujos: aprobacion, audit, configuracion, constructor, dashboard, gamificacion, gestion usuarios/instituciones, integraciones, monitoreo, reportes)
  - **auth/** — Flujos de autenticacion (registro, login, recuperacion password, verificacion email)
  - **parents/** — Flujos del portal padres (dashboard, vinculacion, progreso)
  - **system/** — Flujos del sistema (notificaciones, mensajeria)
