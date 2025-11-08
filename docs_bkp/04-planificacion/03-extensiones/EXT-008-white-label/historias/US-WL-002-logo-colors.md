# US-WL-002: Logo and Colors Upload

**Épica:** EXT-008: White-label System
**Prioridad:** P1
**Story Points:** 6
**Esfuerzo:** 6 horas
**Sprint:** 25-26

---

## 📋 User Story

```
Como administrador de tenant,
Quiero subir el logo y favicon de mi institución
Para que aparezcan en toda la plataforma
```

---

## ✅ Criterios de Aceptación

### Backend (3h)
- [ ] Endpoint `POST /api/v1/admin/branding/logo` (multipart upload)
- [ ] Endpoint `POST /api/v1/admin/branding/favicon`
- [ ] Integración con S3/Cloudinary
- [ ] Validations: formato (PNG/JPG/SVG), tamaño (<2MB)
- [ ] Generar thumbnail automático (logo: 200x200)

### Frontend (3h)
- [ ] Upload component con drag & drop
- [ ] Preview del logo/favicon antes de guardar
- [ ] Crop/resize tool básico
- [ ] Display del logo en navbar
- [ ] Display del favicon en browser tab

---

**Creado:** 2025-11-07
