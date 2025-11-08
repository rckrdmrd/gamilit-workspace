# US-WL-003: Platform Name Customization

**Épica:** EXT-008: White-label System
**Prioridad:** P2
**Story Points:** 6
**Esfuerzo:** 6 horas
**Sprint:** 26

---

## 📋 User Story

```
Como estudiante de una institución con white-label,
Quiero ver el nombre de mi institución en la plataforma (no "GAMILIT Platform")
Para sentir que es una herramienta de mi universidad
```

---

## ✅ Criterios de Aceptación

### Backend (2h)
- [ ] Campo `platform_name` en tenant_branding
- [ ] Incluir en response de `/api/v1/branding`
- [ ] Validation: max 100 caracteres

### Frontend (4h)
- [ ] Dynamic `<title>` tag según platform_name
- [ ] Display en:
  - Navbar (en lugar de "GLIT")
  - Login page header
  - Email footers
  - Meta tags (og:title)
- [ ] WhiteLabelProvider context actualizado
- [ ] Fallback a "GAMILIT Platform" si no configurado

---

**Creado:** 2025-11-07
