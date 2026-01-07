---
id: "US-WL-003"
title: "Platform Name Customization"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-008"
story_points: 6
budget: "6 horas"
sprint: "Sprint-26"
labels: ["white-label", "branding", "customization"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-WL-003: Platform Name Customization

**Epica:** EXT-008: White-label System
**Prioridad:** P2
**Story Points:** 6
**Esfuerzo:** 6 horas
**Sprint:** 26

---

## User Story

```
Como estudiante de una institucion con white-label,
Quiero ver el nombre de mi institucion en la plataforma (no "GAMILIT Platform")
Para sentir que es una herramienta de mi universidad
```

---

## Criterios de Aceptacion

### Backend (2h)
- [ ] Campo `platform_name` en tenant_branding
- [ ] Incluir en response de `/api/v1/branding`
- [ ] Validation: max 100 caracteres

### Frontend (4h)
- [ ] Dynamic `<title>` tag segun platform_name
- [ ] Display en:
  - Navbar (en lugar de "GLIT")
  - Login page header
  - Email footers
  - Meta tags (og:title)
- [ ] WhiteLabelProvider context actualizado
- [ ] Fallback a "GAMILIT Platform" si no configurado

---

**Creado:** 2025-11-07
