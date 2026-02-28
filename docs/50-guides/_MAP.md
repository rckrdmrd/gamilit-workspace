---
titulo: 50-guides - Mapa de Navegacion
tipo: mapa-navegacion
fecha_creacion: 2025-10-01
ultima_actualizacion: 2026-02-28
estado: activo
---

# 50-guides — Mapa de Navegacion

## Estructura

```
50-guides/
├── _INDEX.md
├── _MAP.md
├── README.md
├── backend/
│   ├── _INDEX.md
│   ├── _MAP.md (crear)
│   ├── DOMAIN-ERROR-MIGRATION.md
│   ├── GUIA-DEPENDENCY-RULES.md
│   ├── GUIA-DESIGN-PATTERNS-NESTJS.md
│   ├── GUIA-EXPAND-CONTRACT-MIGRATIONS.md
│   ├── GUIA-OPENTELEMETRY-NESTJS.md
│   ├── GUIA-ROTACION-SECRETOS.md
│   ├── GUIA-RUNBOOK-POSTGRESQL.md
│   ├── _archived/
│   └── impl/
├── deployment/
│   ├── _INDEX.md
│   ├── _archived/
│   └── ...
├── documentation-master/
│   ├── _INDEX.md
│   └── GAMILIT-DOCUMENTATION-MASTER/
│       └── GAMILIT-DOCUMENTATION-MASTER.md
├── frontend/
│   ├── _INDEX.md
│   ├── impl/
│   └── ...
├── integration/
│   ├── _INDEX.md
│   ├── websocket/
│   └── ...
├── testing/
│   ├── _INDEX.md
│   ├── GUIA-COVERAGE-TESTING.md
│   ├── exercise-guides/
│   ├── impl/
│   └── ...
└── troubleshooting/
    ├── _INDEX.md
    ├── errores-comunes/
    └── ...
```

## Archivos

- **README.md** — Indice general de guias de implementacion

## Subdirectorios

- **backend/** — Guias de desarrollo backend (patrones, migraciones, dependency rules, OpenTelemetry, rotacion secretos, runbook PostgreSQL)
- **deployment/** — Guias de deployment (scripts, configuracion PM2, CI/CD)
- **documentation-master/** — **[RELOCATED 2026-01-22]** Documentacion maestra → `orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/`
- **frontend/** — Guias de desarrollo frontend (componentes, hooks, estados, patrones)
- **integration/** — Guias de integraciones (WebSocket, APIs externas)
- **testing/** — Guias de testing (cobertura, unit tests, e2e, guias por ejercicio)
- **troubleshooting/** — Solucion de problemas comunes
