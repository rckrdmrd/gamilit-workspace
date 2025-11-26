# ANÁLISIS DETALLADO: AdminInstitutionsPage

**Fecha:** 2025-11-26
**Página:** 3 de 12
**Estado:** ANÁLISIS COMPLETADO

---

## RESUMEN EJECUTIVO

### Flujo de Datos
```
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE                                                            │
│  └─ auth_management.tenants (tabla principal)                       │
│     ├─ subscription_tier (FREE, BASIC, PROFESSIONAL, ENTERPRISE)    │
│     ├─ is_active (boolean) ⚠️ NO hay campo "status"                 │
│     └─ settings.features (JSONB)                                    │
├─────────────────────────────────────────────────────────────────────┤
│  BACKEND                                                             │
│  ├─ AdminOrganizationsController (7 endpoints)                      │
│  ├─ AdminOrganizationsService                                       │
│  └─ Tenant Entity → OrganizationDto transform                       │
├─────────────────────────────────────────────────────────────────────┤
│  API FRONTEND                                                        │
│  ├─ getOrganizations() → GET /admin/organizations                   │
│  ├─ createOrganization() → POST /admin/organizations                │
│  ├─ updateOrganization() → PUT /admin/organizations/:id             │
│  ├─ deleteOrganization() → DELETE /admin/organizations/:id          │
│  └─ updateOrganizationFeatures() → PATCH /:id/features              │
├─────────────────────────────────────────────────────────────────────┤
│  HOOK                                                                │
│  └─ useOrganizations.ts                                             │
│     ├─ useEffect línea 462 ✅ Carga inicial                          │
│     ├─ Transformaciones: tier→plan, users→userCount ⚠️              │
│     └─ features ?? [] (validación defensiva)                        │
├─────────────────────────────────────────────────────────────────────┤
│  COMPONENTE                                                          │
│  └─ AdminInstitutionsPage.tsx                                       │
│     ├─ DataTable con columnas                                       │
│     ├─ Modales: Create, Edit, Features                              │
│     └─ ⚠️ Falta input de "slug" en creación                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PROBLEMAS IDENTIFICADOS

### CRÍTICOS (P0) - Bloquean funcionalidad

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 1 | **Falta campo slug en creación** | AdminInstitutionsPage.tsx:47-58 | Backend rechaza sin slug |
| 2 | **Status no existe en backend** | Backend solo tiene is_active | Columna status muestra undefined |
| 3 | **Features hardcodeados** | AdminInstitutionsPage.tsx:223-234 | Backend no valida, inconsistencia |

### ALTOS (P1) - Degradan experiencia

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 4 | **Sin rollback en toggle feature** | AdminInstitutionsPage.tsx:97-111 | UI inconsistente si falla |
| 5 | **Mapeo tier→plan puede fallar** | useOrganizations.ts:126-128 | Plan undefined si falta |
| 6 | **createdAt vs created_at** | Transformación inconsistente | Fechas incorrectas |

### MEDIOS (P2) - Mejoras recomendadas

| # | Problema | Ubicación | Impacto |
|---|----------|-----------|---------|
| 7 | **Error genérico en validación** | AdminInstitutionsPage.tsx:55-56 | Usuario no sabe qué falló |
| 8 | **Botón Guardar sin disable** | Modal edit no deshabilita | Doble submit posible |

---

## PLAN DE CORRECCIONES

### FASE A: Correcciones Frontend (Prioritarias)

1. **Agregar input de slug** - Modal de creación
2. **Auto-generar slug desde nombre** - Si usuario no lo proporciona
3. **Mapear is_active → status** - En hook useOrganizations
4. **Agregar rollback en toggleFeature** - Estado previo

### FASE B: Correcciones Backend (Opcionales)

5. **Agregar campo status computed** - En OrganizationDto
6. **Validar features por plan** - En updateFeatures()

---

## ARCHIVOS A MODIFICAR

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `AdminInstitutionsPage.tsx` | Componente | Input slug, rollback features |
| `useOrganizations.ts` | Hook | Mapeo is_active→status, defensivas |
| `admin-organizations.service.ts` | Service | Campo status (opcional) |

