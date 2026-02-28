---
titulo: "schema-reference — Mapa de Navegacion"
tipo: mapa-navegacion
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# schema-reference — Mapa de Navegacion

## Estructura

```
schema-reference/
├── _INDEX.md
├── _MAP.md
├── 01-auth.md
├── 02-tenants.md
├── 03-education.md
├── 04-gamification.md
├── 05-social.md
├── 06-classrooms.md
├── 06b-progress.md
├── 07-analytics.md
├── 08-reports.md
├── 09-notifications.md
├── 10-store.md
├── 11-missions.md
├── 12-leaderboard.md
├── 13-content.md
├── 14-parents.md
├── 15-settings.md
├── 16-audit.md
├── 17-data-warehouse.md
├── 17-18-placeholder.md
├── 18-admin-dashboard.md
├── 19-communication.md
├── 20-gamilit-utility.md
├── 21-lti-integration.md
└── 99-utilities.md
```

## Archivos (por Esquema)

### Core Infrastructure (Schemas 1-2)
- **01-auth.md** — Esquema auth_management (usuarios, roles, sesiones, 2FA, recuperacion)
- **02-tenants.md** — Esquema multi_tenancy (instituciones, espacios, contextos)

### Educational Content (Schema 3)
- **03-education.md** — Esquema educational_content (modulos, ejercicios, preguntas, respuestas, mecanicas)

### Gamification (Schema 4)
- **04-gamification.md** — Esquema gamification_system (XP, logros, rangos maya, misiones, leaderboard, store)

### Social & Community (Schema 5)
- **05-social.md** — Esquema social_features (guilds, competencias, interacciones, equipos)

### Learning Management (Schema 6)
- **06-classrooms.md** — Esquema classroom_management (aulas, inscripciones, asignaciones)
- **06b-progress.md** — Esquema progress_tracking (progreso estudiante, dificultad, alertas de intervencion, certificados)

### Analytics & Reporting (Schemas 7-8)
- **07-analytics.md** — Esquema learning_analytics (analisis de aprendizaje, predicciones, reportes)
- **08-reports.md** — Esquema reporting_system (reportes generados, exportaciones, auditoria)

### Communication & Notifications (Schema 9)
- **09-notifications.md** — Esquema notifications (plantillas, colas, logs, rate limiting, preferencias)

### Gamification Features (Schemas 10-12)
- **10-store.md** — Esquema virtual_store (items, categorias, compras, transacciones)
- **11-missions.md** — Esquema missions_system (plantillas de mision, instancias, recompensas)
- **12-leaderboard.md** — Esquema leaderboard_rankings (rankings globales, competencias entre equipos)

### Content Management (Schema 13)
- **13-content.md** — Esquema content_management (libros, capitulos, articulos, moderacion, tags)

### Parent Portal (Schema 14)
- **14-parents.md** — Esquema parent_portal (vinculaciones padre-estudiante, preferencias, comunicacion)

### Settings & Configuration (Schema 15)
- **15-settings.md** — Esquema system_settings (configuracion global, preferencias, parametros)

### Audit & Compliance (Schema 16)
- **16-audit.md** — Esquema audit_logging (logs de acceso, cambios, eventos, trazas de compliance)

### Placeholder (Schema 17-18)
- **17-18-placeholder.md** — Esquema placeholder original para futuras expansiones (reservado para expansion futura)

### Admin Dashboard (Schema 18)
- **18-admin-dashboard.md** — Esquema admin_dashboard (widgets, metricas, configuracion admin)

### Communication (Schema 19)
- **19-communication.md** — Esquema communication (mensajeria entre usuarios, notificaciones de comunicacion)

### Utility (Schemas 20, 99)
- **20-gamilit-utility.md** — Esquema gamilit (funciones utilidad, vistas compartidas, utilerías)
- **99-utilities.md** — Esquema utilities (funciones de soporte, helpers, tipos customizados)

### Integration (Schema 21)
- **21-lti-integration.md** — Esquema lti_integration (configuracion LTI, launches, consumidor, herramientas externas)

## Notas

- Total: ~170-173 tablas documentadas (98% cobertura)
- 18 esquemas activos + 2 placeholders
- Todas las tablas incluyen: definicion, columnas, relaciones, constrains, comentarios
- Schema 17 (data_warehouse) incluye documentacion de columnas a nivel detallado (FULL docs)
- Ver _INDEX.md para navegacion completa y topicos transversales
