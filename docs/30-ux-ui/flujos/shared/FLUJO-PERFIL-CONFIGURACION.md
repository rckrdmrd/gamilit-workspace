# Flujo Shared - Perfil y Configuracion (Student/Teacher/Admin)

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Resumen

Estandariza el flujo de edicion de perfil, preferencias y avatar, incluyendo sincronizacion de estado en frontend y persistencia backend.

## Diagrama Mermaid

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as SettingsPages
    participant BE as ProfileAuthModules
    participant DB as Database

    U->>FE: Edita perfil o preferencias
    FE->>BE: PATCH /profile o /auth/profile
    BE->>DB: Valida y persiste cambios
    DB-->>BE: Perfil actualizado
    BE-->>FE: DTO actualizado
    FE-->>U: UI sincronizada

    U->>FE: Subir avatar
    FE->>BE: POST /profile/avatar
    BE-->>FE: URL/estado de avatar
```

## Trazabilidad

### Frontend
- `apps/frontend/src/apps/student/pages/SettingsPage.tsx`
- `apps/frontend/src/apps/teacher/pages/TeacherSettingsPage.tsx`
- `apps/frontend/src/apps/admin/components/settings/GeneralSettings.tsx`
- `apps/frontend/src/apps/admin/components/settings/SecuritySettings.tsx`

### Backend
- `apps/backend/src/modules/profile/controllers/profile.controller.ts`
- `apps/backend/src/modules/profile/services/profile.service.ts`
- `apps/backend/src/modules/auth/services/auth.service.ts`

### Datos
- `auth_management.profiles`
- `auth.users`

## Gap funcional a validar

- Confirmar implementacion de almacenamiento real de avatar (no placeholder) y consistencia entre actualizacion de `profiles` y `users`.
