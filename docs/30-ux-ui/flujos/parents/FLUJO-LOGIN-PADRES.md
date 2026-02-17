# FL-PRN-04 - Login Portal Padres

**Portal:** Parents  
**Prioridad:** Alta  
**Estado:** Documentado

---

## Resumen

Flujo de autenticación para padres mediante email/password.

## Diagrama Mermaid

```mermaid
flowchart TD
    page[ParentLoginPage] --> submit[Enviar credenciales]
    submit --> api[/parent-portal/auth/login]
    api --> service[ParentAuthService]
    service --> db[(auth.users + auth_management.parent_accounts)]
    db --> token[JWT + sesión]
    token --> ui[Redirect dashboard]
```

## Secuencia FE -> BE -> DB

1. Padre ingresa credenciales en portal.
2. FE envía login al backend.
3. Backend valida usuario y estado de cuenta.
4. Se genera token y sesión válida.
5. FE redirige a dashboard.

## Trazabilidad

- Requerimiento: `EPIC-GAM-F3-PARENT-PORTAL`
- Matriz: `../TRACEABILITY-MATRIX.md`
- Cobertura total: `../COBERTURA-TOTAL-PROCESOS.md`
