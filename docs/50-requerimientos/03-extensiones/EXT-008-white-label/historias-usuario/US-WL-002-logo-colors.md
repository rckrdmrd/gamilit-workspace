---
id: "US-WL-002"
title: "Logo and Colors Upload"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-008"
story_points: 6
budget: "6 horas"
sprint: "Sprint-25-26"
labels: ["white-label", "branding", "upload", "logo"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-WL-002: Logo and Colors Upload

**Epica:** EXT-008: White-label System
**Prioridad:** P1
**Story Points:** 6
**Esfuerzo:** 6 horas
**Sprint:** 25-26

---

## User Story

```
Como administrador de tenant,
Quiero subir el logo y favicon de mi institucion
Para que aparezcan en toda la plataforma
```

---

## Criterios de Aceptacion

### Backend (3h)
- [ ] Endpoint `POST /api/v1/admin/branding/logo` (multipart upload)
- [ ] Endpoint `POST /api/v1/admin/branding/favicon`
- [ ] Integracion con S3/Cloudinary
- [ ] Validations: formato (PNG/JPG/SVG), tamano (<2MB)
- [ ] Generar thumbnail automatico (logo: 200x200)

### Frontend (3h)
- [ ] Upload component con drag & drop
- [ ] Preview del logo/favicon antes de guardar
- [ ] Crop/resize tool basico
- [ ] Display del logo en navbar
- [ ] Display del favicon en browser tab

---

**Creado:** 2025-11-07
