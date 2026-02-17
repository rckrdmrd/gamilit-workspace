# Guia del Portal Parents

**Version:** 1.1.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## 1. Vision General

El portal parents permite seguimiento academico del estudiante por parte de tutores, con foco en:

- Registro y login del portal.
- Vinculacion padre-estudiante.
- Consulta de progreso academico.
- Recepcion de notificaciones escuela-familia.

---

## 2. Flujos End-to-End Asociados

- `FL-PRN-01`: `docs/30-ux-ui/flujos/parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md`
- `FL-PRN-02`: `docs/30-ux-ui/flujos/parents/FLUJO-SEGUIMIENTO-PROGRESO.md`
- `FL-PRN-03`: `docs/30-ux-ui/flujos/parents/FLUJO-NOTIFICACIONES-PADRES.md`
- `FL-PRN-04`: `docs/30-ux-ui/flujos/parents/FLUJO-LOGIN-PADRES.md`
- `FL-PRN-05`: `docs/30-ux-ui/flujos/parents/FLUJO-REGISTRO-PADRES.md`
- `FL-PRN-06`: `docs/30-ux-ui/flujos/parents/FLUJO-DASHBOARD-PADRES.md`
- `FL-PRN-07`: `docs/30-ux-ui/flujos/parents/FLUJO-PROGRESO-HIJO.md`

---

## 3. Integracion FE -> BE -> DB (Referencia)

| Componente | Endpoint | Datos |
|------------|----------|-------|
| Registro/Login | `/parent-portal/auth/register`, `/parent-portal/auth/login` | `auth.users`, `auth_management.parent_accounts` |
| Vinculacion familiar | `/parent-portal/students/link` | `auth_management.parent_student_links`, `auth_management.profiles` |
| Dashboard progreso | `/parent-portal/dashboard`, `/parent-portal/students/:id/progress` | `progress_tracking.*`, `analytics.*` |
| Notificaciones | `/parent-portal/notifications` | `notifications.*`, `communication.*` |

---

## 4. Validaciones clave

1. Solo usuarios con relacion padre-estudiante activa pueden consultar progreso del estudiante.
2. Todas las consultas deben filtrar por alcance del estudiante vinculado.
3. Lectura/confirmacion de notificaciones debe quedar auditada.

---

## 5. Referencias

- `docs/30-ux-ui/flujos/README.md`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- `docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md`
