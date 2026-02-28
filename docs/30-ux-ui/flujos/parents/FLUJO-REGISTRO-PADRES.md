---
titulo: FL-PRN-05 - Registro Portal Padres
tipo: flujo
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# FL-PRN-05 - Registro Portal Padres

**Portal:** Parents  
**Prioridad:** Alta  
**Estado:** Documentado

---

## Resumen

Flujo de registro de cuenta para padres con datos de contacto y relación.

## Diagrama Mermaid

```mermaid
flowchart TD
    page[ParentRegisterPage] --> submit[Enviar registro]
    submit --> api[/parent-portal/auth/register]
    api --> service[ParentAuthService]
    service --> db[(auth.users + auth_management.parent_accounts)]
    db --> token[JWT + sesión]
    token --> ui[Redirect dashboard]
```

## Secuencia FE -> BE -> DB

1. Padre completa formulario de registro.
2. FE envía datos a registro.
3. Backend valida duplicados y crea cuenta.
4. Se genera token y sesión.
5. FE redirige a dashboard.

## Trazabilidad

- Requerimiento: `EPIC-GAM-F3-PARENT-PORTAL`
- Matriz: `../TRACEABILITY-MATRIX.md`
- Cobertura total: `../COBERTURA-TOTAL-PROCESOS.md`
