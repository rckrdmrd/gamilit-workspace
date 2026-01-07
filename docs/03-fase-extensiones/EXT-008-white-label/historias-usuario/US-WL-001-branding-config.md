---
id: "US-WL-001"
title: "Tenant Branding Configuration"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-008"
story_points: 8
budget: "8 horas"
sprint: "Sprint-25"
labels: ["white-label", "branding", "admin-portal"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-WL-001: Tenant Branding Configuration

**Epica:** EXT-008: White-label System
**Prioridad:** P1
**Story Points:** 8
**Esfuerzo:** 8 horas
**Sprint:** 25

---

## User Story

```
Como administrador de tenant,
Quiero configurar el branding de mi institucion desde el Admin Portal
Para que la plataforma refleje nuestra identidad corporativa
```

---

## Criterios de Aceptacion

### Backend (5h)
- [ ] CRUD endpoints `/api/v1/admin/branding`:
  - GET - Obtener configuracion actual
  - PUT - Actualizar configuracion
- [ ] Endpoint publico `/api/v1/branding` (para frontend login antes de auth)
- [ ] Validations: hex colors, URL formats
- [ ] Default values si no configurado

### Frontend (3h)
- [ ] Pagina `/admin/branding`
- [ ] Form con preview en tiempo real
- [ ] Campos: platform_name, primary_color, secondary_color
- [ ] Color pickers (react-colorful)

---

**Creado:** 2025-11-07
