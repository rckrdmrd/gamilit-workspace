# ÉPICA: EAI-007 - Módulos 4 y 5: Lectura Digital y Producción

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | EAI-007 |
| **Nombre** | Módulos Lectura Digital y Producción |
| **Módulo** | educational_content |
| **Fase** | Fase 2 - Robustecimiento |
| **Prioridad** | P0 |
| **Estado** | In Progress |
| **Story Points** | 35 |
| **Sprint(s)** | Sprint 7-8 |

### Descripción

Completar la implementación de los módulos educativos 4 (Lectura Digital y Multimodal) y 5 (Producción y Expresión Lectora), que comprenden 8 tipos de ejercicios que requieren revisión manual por docentes. Estos módulos son críticos para completar el journey completo del estudiante hasta el rango K'uk'ulkan.

### Objetivo de Negocio

- Permitir que estudiantes alcancen el rango máximo (K'uk'ulkan) completando todos los módulos
- Habilitar evaluación de competencias de producción creativa
- Cerrar el ciclo educativo completo sobre Marie Curie

### Stakeholders

| Rol | Nombre/Equipo | Responsabilidad |
|-----|---------------|-----------------|
| Product Owner | Isem | Aprobación de criterios |
| Tech Lead | Backend-Agent | Validación técnica |
| Usuarios | Estudiantes 10-14 años | Completar ejercicios |
| Usuarios | Docentes | Calificar ejercicios |

---

### Historias de Usuario

| ID | Historia | Prioridad | SP | Estado |
|----|----------|-----------|-----|--------|
| US-M4-001 | Como desarrollador, quiero crear DTOs para M4 para validar respuestas | P0 | 5 | Backlog |
| US-M4-002 | Como estudiante, quiero recibir XP/ML al completar M4 | P0 | 3 | Backlog |
| US-M5-001 | Como desarrollador, quiero crear DTOs para M5 para soportar multimedia | P0 | 5 | Backlog |
| US-M5-002 | Como docente, quiero calificar ejercicios M4-M5 con rúbricas | P0 | 8 | Backlog |
| US-M4M5-001 | Como QA, quiero seeds de prueba para validar flujos | P1 | 5 | Backlog |
| US-M4M5-002 | Como estudiante, quiero ver mi progreso hacia K'uk'ulkan | P1 | 3 | Backlog |
| US-M4M5-003 | Como docente, quiero notificaciones de nuevos envíos | P1 | 5 | Backlog |

**Total Story Points:** 34

---

### Criterios de Aceptación de la Épica

**Funcionales:**
- [ ] Los 5 ejercicios de M4 permiten envío de respuestas
- [ ] Las 3 opciones de M5 soportan contenido multimedia
- [ ] El sistema identifica ejercicios pendientes de revisión
- [ ] Docentes pueden calificar con puntuación 0-100
- [ ] Estudiantes reciben XP/ML tras calificación

**No Funcionales:**
- [ ] Performance: Carga de multimedia < 30s para archivos de 50MB
- [ ] Seguridad: Validación de tipos de archivo permitidos
- [ ] Usabilidad: Interfaz de calificación clara y eficiente

**Técnicos:**
- [ ] Cobertura de tests > 60%
- [ ] Documentación de endpoints completa
- [ ] Seeds de prueba en ambiente dev

---

### Dependencias

**Esta épica depende de:**
| Épica/Módulo | Estado | Bloqueante |
|--------------|--------|------------|
| EAI-003 Gamificación | Done | Sí |
| EAI-002 Actividades | Done | Sí |
| MediaStorageService | Done | Sí |
| ManualReviewService | Done | Sí |

**Esta épica bloquea:**
| Épica/Módulo | Razón |
|--------------|-------|
| Certificación K'uk'ulkan | Requiere completar M5 |
| EAI-003-EXT Gamificación Social | Mejor con módulos completos |

---

### Desglose Técnico

**Database:**
- [ ] Schema: educational_content
- [ ] Tablas: media_attachments (existente), ejercicios M4-M5 (seeds)
- [ ] Funciones: validate_module4_module5_answer (existente)
- [ ] RLS Policies: Existentes

**Backend:**
- [ ] Módulo: educational, teacher
- [ ] DTOs: 8 nuevos (1 por tipo de ejercicio)
- [ ] Endpoints: 4 nuevos
- [ ] Tests: 12 esperados

**Frontend:**
- [ ] Páginas: TeacherManualReviewsPage (nueva)
- [ ] Componentes: MediaViewer mejorado
- [ ] Stores: Integración con existentes

---

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad de multimedia | Media | Alto | Límites de tamaño, formatos |
| Carga de trabajo docente | Alta | Medio | Notificaciones, priorización |
| Storage costs | Baja | Bajo | Compresión, cleanup policies |

---

### Definition of Ready (DoR)

- [x] Historias de usuario definidas
- [x] Criterios de aceptación claros
- [x] Dependencias identificadas
- [x] Estimación completada
- [x] Diseño técnico aprobado
- [x] Sin bloqueadores activos

### Definition of Done (DoD)

- [ ] Código implementado y revisado
- [ ] Tests pasando (unit, integration)
- [ ] Documentación actualizada
- [ ] Inventarios actualizados
- [ ] Trazas registradas
- [ ] Demo realizada
- [ ] Product Owner aprobó

---

### Documentación Relacionada

- Diseño: `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` (líneas 782-1119)
- Validador: `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`
- Frontend M4: `apps/frontend/src/features/mechanics/module4/`
- Frontend M5: `apps/frontend/src/features/mechanics/module5/`

---

### Historial

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creación de épica | Requirements-Analyst |

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Última actualización:** 2025-12-05
