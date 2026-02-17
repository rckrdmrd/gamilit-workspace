# Flujos End-to-End - GAMILIT

**Version:** 1.4.2
**Fecha:** 2026-02-17
**Estado:** Activo

---

## Objetivo

Centralizar la documentacion de flujos funcionales de toda la plataforma y su trazabilidad entre:

- Definiciones funcionales (requerimientos/guias/ADR)
- Base de datos (tablas, entidades, estados)
- Backend (controllers/services/endpoints)
- Frontend (paginas, componentes de accion, hooks/stores)

---

## Catalogo Maestro de Flujos (Cobertura Total)

| ID | Dominio | Flujo | Estado inicial | Documento |
|----|---------|-------|----------------|-----------|
| FL-AUTH-01 | Auth | Registro + Login + Inicializacion | Documentado parcial | [FLUJO-REGISTRO-LOGIN.md](./auth/FLUJO-REGISTRO-LOGIN.md) |
| FL-AUTH-02 | Auth | Recuperacion de password | Ausente | [FLUJO-RECUPERACION-PASSWORD.md](./auth/FLUJO-RECUPERACION-PASSWORD.md) |
| FL-AUTH-03 | Auth | Verificacion de email | Ausente | [FLUJO-VERIFICACION-EMAIL.md](./auth/FLUJO-VERIFICACION-EMAIL.md) |
| FL-STU-01 | Student | Ejercicio completo (auto-grade M1-M2) | Parcial | [FLUJO-EJERCICIO-COMPLETO.md](./student/FLUJO-EJERCICIO-COMPLETO.md) |
| FL-STU-02 | Student | Ejercicio con revision manual (M3-M5) | Parcial | [FLUJO-EJERCICIO-M3-M5.md](./student/FLUJO-EJERCICIO-M3-M5.md) |
| FL-STU-03 | Student | Tienda: compra + asignacion | Parcial | [FLUJO-TIENDA-COMPRA.md](./student/FLUJO-TIENDA-COMPRA.md) |
| FL-STU-04 | Student | Logros/Misiones: claim rewards | Parcial | [FLUJO-LOGROS-MISIONES-CLAIM.md](./student/FLUJO-LOGROS-MISIONES-CLAIM.md) |
| FL-STU-05 | Student | Perfil y ajustes del estudiante (compuesto) | Documentado | [FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md](./student/FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md) |
| FL-STU-06 | Student | Dashboard y progreso academico (compuesto) | Documentado | [FLUJO-DASHBOARD-ACADEMICO.md](./student/FLUJO-DASHBOARD-ACADEMICO.md) |
| FL-STU-07 | Student | Tienda: overview y catalogo | Documentado | [FLUJO-TIENDA-OVERVIEW.md](./student/FLUJO-TIENDA-OVERVIEW.md) |
| FL-STU-08 | Student | Inventario de items | Documentado | [FLUJO-INVENTARIO-ITEMS.md](./student/FLUJO-INVENTARIO-ITEMS.md) |
| FL-STU-09 | Student | Sistema de amigos | Documentado | [FLUJO-AMIGOS.md](./student/FLUJO-AMIGOS.md) |
| FL-STU-10 | Student | Gremios | Documentado | [FLUJO-GREMIOS.md](./student/FLUJO-GREMIOS.md) |
| FL-STU-11 | Student | Settings dispositivos | Documentado | [FLUJO-SETTINGS-DISPOSITIVOS.md](./student/FLUJO-SETTINGS-DISPOSITIVOS.md) |
| FL-STU-12 | Student | Settings notificaciones | Documentado | [FLUJO-SETTINGS-NOTIFICACIONES.md](./student/FLUJO-SETTINGS-NOTIFICACIONES.md) |
| FL-STU-13 | Student | Dashboard y overview de progreso | Documentado | [FLUJO-DASHBOARD-PROGRESO.md](./student/FLUJO-DASHBOARD-PROGRESO.md) |
| FL-STU-14 | Student | Leaderboards y rankings | Documentado | [FLUJO-LEADERBOARDS.md](./student/FLUJO-LEADERBOARDS.md) |
| FL-STU-15 | Student | Pagina de aprendizaje | Documentado (planificado) | [FLUJO-PAGINA-APRENDIZAJE.md](./student/FLUJO-PAGINA-APRENDIZAJE.md) |
| FL-SHR-01 | Shared | Perfil y configuracion mult-portal | Parcial | [FLUJO-PERFIL-CONFIGURACION.md](./shared/FLUJO-PERFIL-CONFIGURACION.md) |
| FL-SHR-02 | Shared | Sesion/seguridad y recuperacion de acceso (compuesto) | Documentado | [FLUJO-SESION-SEGURIDAD.md](./shared/FLUJO-SESION-SEGURIDAD.md) |
| FL-TCH-01 | Teacher | Revision manual y calificacion M3-M5 | Parcial | [FLUJO-REVISION-MANUAL-M3-M5.md](./teacher/FLUJO-REVISION-MANUAL-M3-M5.md) |
| FL-TCH-02 | Teacher | Gestion de asignaciones | Documentado | [FLUJO-ASIGNACIONES-CLASE.md](./teacher/FLUJO-ASIGNACIONES-CLASE.md) |
| FL-TCH-03 | Teacher | Monitoreo y alertas docentes | Documentado | [FLUJO-MONITOREO-ALERTAS.md](./teacher/FLUJO-MONITOREO-ALERTAS.md) |
| FL-TCH-04 | Teacher | Analytics y reportes docentes | Documentado | [FLUJO-ANALYTICS-REPORTES.md](./teacher/FLUJO-ANALYTICS-REPORTES.md) |
| FL-TCH-05 | Teacher | Gestion de contenido docente | Documentado | [FLUJO-GESTION-CONTENIDO.md](./teacher/FLUJO-GESTION-CONTENIDO.md) |
| FL-TCH-06 | Teacher | Login con redireccion por rol | Documentado | [FLUJO-LOGIN-DOCENTE.md](./teacher/FLUJO-LOGIN-DOCENTE.md) |
| FL-TCH-07 | Teacher | Configuracion docente y mensajeria | Documentado | [FLUJO-PERFIL-CONFIGURACION.md](./shared/FLUJO-PERFIL-CONFIGURACION.md) |
| FL-ADM-01 | Admin | Gestion de usuarios y roles | Documentado | [FLUJO-GESTION-USUARIOS-ROLES.md](./admin/FLUJO-GESTION-USUARIOS-ROLES.md) |
| FL-ADM-02 | Admin | Configuracion global del sistema | Documentado | [FLUJO-CONFIGURACION-SISTEMA.md](./admin/FLUJO-CONFIGURACION-SISTEMA.md) |
| FL-ADM-03 | Admin | Aprobacion de contenido educativo | Documentado | [FLUJO-APROBACION-CONTENIDO.md](./admin/FLUJO-APROBACION-CONTENIDO.md) |
| FL-ADM-04 | Admin | Monitoreo y salud del sistema | Documentado | [FLUJO-MONITOREO-SISTEMA.md](./admin/FLUJO-MONITOREO-SISTEMA.md) |
| FL-ADM-05 | Admin | Integraciones LTI | Documentado | [FLUJO-INTEGRACIONES-LTI.md](./admin/FLUJO-INTEGRACIONES-LTI.md) |
| FL-ADM-06 | Admin | Audit logs | Documentado | [FLUJO-AUDIT-LOGS.md](./admin/FLUJO-AUDIT-LOGS.md) |
| FL-ADM-07 | Admin | Constructor de ejercicios | Documentado | [FLUJO-CONSTRUCTOR-EJERCICIOS.md](./admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md) |
| FL-ADM-08 | Admin | Gestion de gamificacion | Documentado | [FLUJO-GESTION-GAMIFICACION.md](./admin/FLUJO-GESTION-GAMIFICACION.md) |
| FL-PRN-01 | Parents | Vinculacion padre-estudiante | Documentado (planificado) | [FLUJO-VINCULACION-PADRE-ESTUDIANTE.md](./parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md) |
| FL-PRN-02 | Parents | Seguimiento de progreso academico | Documentado (planificado) | [FLUJO-SEGUIMIENTO-PROGRESO.md](./parents/FLUJO-SEGUIMIENTO-PROGRESO.md) |
| FL-PRN-03 | Parents | Notificaciones escuela-familia | Documentado (planificado) | [FLUJO-NOTIFICACIONES-PADRES.md](./parents/FLUJO-NOTIFICACIONES-PADRES.md) |
| FL-PRN-04 | Parents | Login portal padres | Documentado | [FLUJO-LOGIN-PADRES.md](./parents/FLUJO-LOGIN-PADRES.md) |
| FL-PRN-05 | Parents | Registro portal padres | Documentado | [FLUJO-REGISTRO-PADRES.md](./parents/FLUJO-REGISTRO-PADRES.md) |
| FL-PRN-06 | Parents | Dashboard portal padres | Documentado | [FLUJO-DASHBOARD-PADRES.md](./parents/FLUJO-DASHBOARD-PADRES.md) |
| FL-PRN-07 | Parents | Vista progreso hijo | Documentado | [FLUJO-PROGRESO-HIJO.md](./parents/FLUJO-PROGRESO-HIJO.md) |
| FL-SHR-03 | Shared | White-label y theming | Documentado (planificado) | [FLUJO-WHITE-LABEL-THEMING.md](./shared/FLUJO-WHITE-LABEL-THEMING.md) |

---

## Matriz y Validacion

- Matriz de trazabilidad cruzada: [TRACEABILITY-MATRIX.md](./TRACEABILITY-MATRIX.md)
- Plantilla estandar de flujo: [_TEMPLATE-FLUJO.md](./_TEMPLATE-FLUJO.md)
- Fase 2 auditoria FE-BE-DB: [AUDITORIA-CONSISTENCIA-FE-BE-DB.md](./AUDITORIA-CONSISTENCIA-FE-BE-DB.md)
- Resultados Oleada 1 P0: [AUDITORIA-P0-RESULTADOS.md](./AUDITORIA-P0-RESULTADOS.md)
- Resultados Oleada Full: [AUDITORIA-RESIDUAL-FULL.md](./AUDITORIA-RESIDUAL-FULL.md)
- Cobertura total de procesos: [COBERTURA-TOTAL-PROCESOS.md](./COBERTURA-TOTAL-PROCESOS.md)
- Validacion analisis vs integracion: [VALIDACION-ANALISIS-VS-INTEGRACION.md](./VALIDACION-ANALISIS-VS-INTEGRACION.md)
- Reporte final de conformidad: [REPORTE-FINAL-CONFORMIDAD-FULL.md](./REPORTE-FINAL-CONFORMIDAD-FULL.md)

---

## Tipos de flujo

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| **Simple** | Flujo que cubre un solo proceso end-to-end con secuencia FE->BE->DB propia | FL-STU-03 (Compra en tienda) |
| **Compuesto** | Flujo que agrupa multiples sub-flujos en un proceso de mayor alcance. Incluye seccion `## Tipo de Flujo` con lista de sub-flujos referenciados. Delega secuencia detallada a cada sub-flujo. | FL-STU-06 (Dashboard y progreso academico) |

Los flujos compuestos se identifican con la etiqueta "(compuesto)" en el catalogo maestro. Cada flujo compuesto debe:
1. Incluir seccion `## Tipo de Flujo` con tipo "Compuesto" y lista de sub-flujos
2. Tener diagrama Mermaid que muestre la relacion entre sub-flujos
3. Delegar secuencia detallada (FE->BE->DB) a los documentos de cada sub-flujo
4. Agregar trazabilidad cruzada con links a cada sub-flujo

---

## Criterios de calidad documental

Cada flujo debe incluir como minimo:

1. Diagrama Mermaid
2. Secuencia FE -> BE -> DB
3. Componentes/archivos por capa
4. Validaciones y reglas de negocio
5. Manejo de errores esperados
6. Evidencia de trazabilidad cruzada

---

## Cobertura objetivo

- 100% de flujos criticos con diagrama Mermaid
- 100% de flujos catalogados con estado explicito
- 0 flujos criticos sin referencia cruzada a documentacion de portal/API
