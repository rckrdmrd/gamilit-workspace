# US-WL-001: Tenant Branding Configuration

**Épica:** EXT-008: White-label System
**Prioridad:** P1
**Story Points:** 8
**Esfuerzo:** 8 horas
**Sprint:** 25

---

## 📋 User Story

```
Como administrador de tenant,
Quiero configurar el branding de mi institución desde el Admin Portal
Para que la plataforma refleje nuestra identidad corporativa
```

---

## ✅ Criterios de Aceptación

### Backend (5h)
- [ ] CRUD endpoints `/api/v1/admin/branding`:
  - GET - Obtener configuración actual
  - PUT - Actualizar configuración
- [ ] Endpoint público `/api/v1/branding` (para frontend login antes de auth)
- [ ] Validations: hex colors, URL formats
- [ ] Default values si no configurado

### Frontend (3h)
- [ ] Página `/admin/branding`
- [ ] Form con preview en tiempo real
- [ ] Campos: platform_name, primary_color, secondary_color
- [ ] Color pickers (react-colorful)

---

**Creado:** 2025-11-07
