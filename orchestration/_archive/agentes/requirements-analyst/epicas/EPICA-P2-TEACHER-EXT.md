# EPICA: P2-TEACHER-EXT - Teacher Portal Extensiones

**Version:** 1.0.0
**Fecha:** 2025-12-05
**Uso:** Definicion de epica P2 para Teacher Portal

---

## EPICA: P2-TEACHER-EXT - Teacher Portal Extensiones

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | P2-TEACHER-EXT |
| **Nombre** | Teacher Portal - Extensiones y Completitud |
| **Modulo** | teacher |
| **Fase** | Fase P2 - Post-Sprint P1 |
| **Prioridad** | P1 |
| **Estado** | Ready |
| **Story Points** | 22 SP |
| **Sprint(s)** | P2-A, P2-B |

### Descripcion

Habilitar las paginas deshabilitadas por feature flags (Communication, Content), implementar la pagina de Resources pendiente, y eliminar todos los mocks y hardcodes restantes del codigo. Incluye notificaciones funcionales para docentes.

### Objetivo de Negocio

Proporcionar a los docentes un portal 100% funcional con todas las herramientas de comunicacion, gestion de contenido y recursos educativos, mejorando la experiencia de ensenanza y la interaccion con estudiantes.

### Stakeholders

| Rol | Nombre/Equipo | Responsabilidad |
|-----|---------------|-----------------|
| Product Owner | Equipo GAMILIT | Aprobacion de criterios |
| Tech Lead | Frontend-Agent | Validacion tecnica |
| Usuarios | Docentes | Feedback |

---

### Historias de Usuario

| ID | Historia | Prioridad | SP | Estado |
|----|----------|-----------|-----|--------|
| US-TEACHER-P2-001 | Como docente, quiero usar la pagina de Comunicacion para enviar mensajes y anuncios | P1 | 3 | Ready |
| US-TEACHER-P2-002 | Como docente, quiero usar la pagina de Contenido para crear ejercicios personalizados | P1 | 3 | Ready |
| US-TEACHER-P2-003 | Como docente, quiero gestionar recursos educativos para compartir con mis estudiantes | P1 | 8 | Ready |
| US-TEACHER-P2-004 | Como desarrollador, quiero eliminar mocks para garantizar datos reales en produccion | P0 | 5 | Ready |
| US-TEACHER-P2-005 | Como docente, quiero recibir notificaciones cuando mis estudiantes envian ejercicios | P1 | 3 | Ready |

**Total Story Points:** 22 SP

---

### Criterios de Aceptacion de la Epica

**Funcionales:**
- [ ] TeacherCommunicationPage habilitada y funcional
- [ ] Envio de mensajes a estudiantes individuales y grupos
- [ ] Publicacion de anuncios para aulas completas
- [ ] TeacherContentPage habilitada y funcional
- [ ] Creacion de ejercicios personalizados
- [ ] TeacherResourcesPage completamente implementada
- [ ] Subida y comparticion de archivos educativos
- [ ] Cero mocks en codigo de produccion
- [ ] Notificaciones push/email cuando estudiante envia ejercicio M4-M5

**No Funcionales:**
- [ ] Performance: Subida de archivos < 30s para 50MB
- [ ] Seguridad: RLS aplicado a recursos
- [ ] Usabilidad: Consistente con resto del portal

**Tecnicos:**
- [ ] Cobertura de tests > 50%
- [ ] Integracion con storage service
- [ ] Documentacion actualizada

---

### Dependencias

**Esta epica depende de:**
| Epica/Modulo | Estado | Bloqueante |
|--------------|--------|------------|
| Sprint P1 - Settings | Done | No |
| Email Service (NOTIF-001) | Done | No |
| Storage Service | Parcial | Si (para Resources) |

**Esta epica bloquea:**
| Epica/Modulo | Razon |
|--------------|-------|
| P2-QUALITY E2E | Necesita paginas funcionales |

---

### Desglose Tecnico

**Backend:**
- [ ] Verificar endpoints Communication (existentes)
- [ ] Verificar endpoints Content (existentes)
- [ ] Nuevo: StorageService para Resources
- [ ] Nuevo: Endpoint POST /teacher/resources

**Frontend:**
- [ ] Habilitar feature flag SHOW_COMMUNICATION
- [ ] Habilitar feature flag SHOW_CONTENT
- [ ] Implementar TeacherResourcesPage completa
- [ ] Eliminar fallback 'mock-teacher-id' en 10 paginas
- [ ] Eliminar organizationName hardcodeado

---

### Archivos a Modificar

```
apps/frontend/src/features/teacher/constants/featureFlags.ts
  - SHOW_COMMUNICATION: true
  - SHOW_CONTENT: true

apps/frontend/src/features/teacher/pages/
  - TeacherDashboardPage.tsx (eliminar mock)
  - TeacherStudentsPage.tsx (eliminar mock)
  - TeacherProgressPage.tsx (eliminar mock)
  - TeacherActivitiesPage.tsx (eliminar mock)
  - TeacherGamificationPage.tsx (eliminar mock)
  - TeacherNotificationsPage.tsx (eliminar mock)
  - TeacherCalendarPage.tsx (eliminar mock)
  - TeacherAnalyticsPage.tsx (eliminar mock)
  - TeacherMissionsPage.tsx (eliminar mock)
  - TeacherClassroomsPage.tsx (eliminar mock)
  - TeacherResourcesPage.tsx (implementar)
```

---

### Definition of Ready (DoR)

- [x] Historias de usuario definidas
- [x] Criterios de aceptacion claros
- [x] Dependencias identificadas
- [x] Estimacion completada
- [x] Sin bloqueadores activos (excepto Storage)

### Definition of Done (DoD)

- [ ] Codigo implementado y revisado
- [ ] Tests unitarios pasando
- [ ] Feature flags habilitados
- [ ] Cero mocks en produccion
- [ ] Notificaciones funcionando
- [ ] QA aprobado

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Ultima actualizacion:** 2025-12-05
