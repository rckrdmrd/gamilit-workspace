---
tipo: vista-derivada
ssot: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml
fecha: "2026-03-03"
---

# Cross-Reference por Portal

> Vista derivada. SSOT: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml

Mapeo de los 4 portales frontend con sus metricas de componentes y los flujos de proceso que los involucran.

## Portales

| Portal | Paginas | Componentes | Hooks | Rutas | Completitud | Flujos (count) |
|--------|---------|-------------|-------|-------|-------------|----------------|
| **Student** | 19 | 100 | 13 | 21 | ~100% | 21 |
| **Teacher** | 16 | 44 | 23 | 18 | ~95% | 17 |
| **Admin** | 19 | 123 | 31 | 22 | ~92% | 22 |
| **Parents** | 7 | 7 | 0 | 5 | 100% | 7 |
| **Totales** | **61** | **274** | **67** | **66** | — | **67** |

> Nota: Los flujos Shared (FL-AUTH-*, FL-SHR-*) y System (FL-SYS-*) son transversales y no se cuentan por portal.

---

## Portal: Student (~100%)

`apps/frontend/src/apps/student/`

| Flujo | Proceso |
|-------|---------|
| FL-STU-01 | Resolucion de ejercicio autocalificable (M1-M2) |
| FL-STU-02 | Resolucion de ejercicio con revision docente (M3-M5) |
| FL-STU-03 | Compra en tienda + asignacion de item |
| FL-STU-04 | Claim de logros y misiones |
| FL-STU-05 | Perfil y ajustes del estudiante (compuesto) |
| FL-STU-06 | Dashboard y progreso academico (compuesto) |
| FL-STU-07 | Tienda: overview y catalogo |
| FL-STU-08 | Inventario de items |
| FL-STU-09 | Sistema de amigos |
| FL-STU-10 | Gremios |
| FL-STU-11 | Settings dispositivos |
| FL-STU-12 | Settings notificaciones |
| FL-STU-13 | Dashboard y overview de progreso |
| FL-STU-14 | Leaderboards y rankings |
| FL-STU-15 | Pagina de aprendizaje |
| FL-STU-16 | Progreso academico detallado |
| FL-STU-17 | Asignaciones del estudiante |
| FL-STU-18 | Perfil y notificaciones |
| FL-STU-19 | Equipamiento de items cosmeticos |
| FL-STU-20 | Compra + inventario + equipar (compuesto) |
| FL-STU-21 | Consulta de boosts activos |

---

## Portal: Teacher (~95%)

`apps/frontend/src/apps/teacher/`

| Flujo | Proceso |
|-------|---------|
| FL-TCH-01 | Revision manual y cierre de calificacion M3-M5 |
| FL-TCH-02 | Gestion de asignaciones |
| FL-TCH-03 | Monitoreo y alertas docentes (WebSocket) |
| FL-TCH-04 | Analytics y reportes docentes |
| FL-TCH-05 | Gestion de contenido docente |
| FL-TCH-06 | Login con redireccion por rol |
| FL-TCH-07 | Configuracion docente y mensajeria |
| FL-TCH-08 | Dashboard docente |
| FL-TCH-09 | Gestion de clases y estudiantes |
| FL-TCH-10 | Progreso academico docente |
| FL-TCH-11 | Gamificacion vista docente |
| FL-TCH-12 | Respuestas de ejercicios |
| FL-TCH-13 | Panel de revision manual |
| FL-TCH-14 | Configuracion del docente |
| FL-TCH-15 | Notificaciones del docente |
| FL-TCH-16 | Preferencias de notificaciones docente |
| FL-TCH-17 | Configuracion de alertas docente |

---

## Portal: Admin (~92%)

`apps/frontend/src/apps/admin/`

| Flujo | Proceso |
|-------|---------|
| FL-ADM-01 | Gestion de usuarios y roles |
| FL-ADM-02 | Configuracion global del sistema |
| FL-ADM-03 | Aprobacion de contenido |
| FL-ADM-04 | Salud operativa y alertas de plataforma |
| FL-ADM-05 | Integraciones LTI |
| FL-ADM-06 | Audit logs |
| FL-ADM-07 | Constructor de ejercicios |
| FL-ADM-08 | Gestion de gamificacion |
| FL-ADM-09 | Dashboard administrador |
| FL-ADM-10 | Instituciones y roles |
| FL-ADM-11 | Reportes y analytics admin |
| FL-ADM-12 | Configuracion de ajustes del sistema |
| FL-ADM-13 | Centro de notificaciones admin |
| FL-ADM-14 | Preferencias de notificaciones admin |
| FL-ADM-15 | Gestion de alertas del sistema |
| FL-ADM-16 | Analytics avanzado |
| FL-ADM-17 | Seguimiento de progreso de estudiantes |
| FL-ADM-18 | Asignaciones aula-docente |
| FL-ADM-19 | Supervision de asignaciones de ejercicios |
| FL-ADM-20 | Branding e identidad institucional |
| FL-ADM-21 | Administracion avanzada — Feature Flags |
| FL-ADM-22 | Gestion de roles y permisos |

---

## Portal: Parents (100%)

`apps/frontend/src/apps/parent/`

| Flujo | Proceso |
|-------|---------|
| FL-PRN-01 | Vinculacion padre-estudiante |
| FL-PRN-02 | Seguimiento de progreso del estudiante |
| FL-PRN-03 | Notificaciones escuela-familia |
| FL-PRN-04 | Login portal padres |
| FL-PRN-05 | Registro portal padres |
| FL-PRN-06 | Dashboard portal padres |
| FL-PRN-07 | Vista progreso hijo |

---

## Flujos Transversales (Shared + System)

Estos flujos no pertenecen a un portal unico — son compartidos o de sistema.

| Flujo | Portal | Proceso |
|-------|--------|---------|
| FL-AUTH-01 | Shared | Registro + login + inicializacion |
| FL-AUTH-02 | Shared | Recuperacion de password |
| FL-AUTH-03 | Shared | Verificacion de email |
| FL-SHR-01 | Shared | Perfil/configuracion multiportal |
| FL-SHR-02 | Shared | Sesion/seguridad y recuperacion de acceso (compuesto) |
| FL-SHR-03 | Shared | White-label y theming |
| FL-SYS-02 | System | Pipeline de envio de ejercicios (auto-grade + manual + rewards) |
| FL-SYS-03 | System | Cadena de recompensas: XP, ML Coins, achievements, leaderboards |
| FL-SYS-04 | System | Autenticacion en dos factores (2FA) |
| FL-SYS-05 | System | Onboarding de organizaciones multi-tenant |

---

*Generado: 2026-03-03 | SSOT: orchestration/inventarios/CROSS-REFERENCE-MASTER.yml*
