---
id: "RF-ADM-001"
title: "Gestion de Aulas"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Admin Base"
epic: "EAI-005"
version: "1.0"
labels: ["admin", "classrooms", "crud", "teacher-platform", "configuration"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ADM-001: Gestion de Aulas

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ADM-001 |
| **Modulo** | Admin Base |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ADM-001: Gestion de Aulas](../especificaciones/ET-ADM-001-gestion-aulas.md)

### User Stories Relacionadas
- [US-ADM-001: Gestion de Aulas (CRUD Basico)](../historias-usuario/US-ADM-001-gestion-aulas-crud.md) - 8 SP
- [US-ADM-006: Configuracion Basica de Aula](../historias-usuario/US-ADM-006-configuracion-basica-aula.md) - 6 SP

### Implementacion
- **Backend:** `teacher` module - TeacherClassroomController, ClassroomService
- **Frontend:** `/teacher/classrooms/*` - ClassroomListView, ClassroomForm
- **Database:** `social_features.classrooms`, `social_features.classroom_settings`

---

## Descripcion del Requerimiento

### Contexto

El sistema Gamilit necesita que los profesores puedan crear y gestionar aulas virtuales para organizar a sus estudiantes. Las aulas son el contenedor principal donde se agrupan estudiantes, se asignan modulos educativos y se configura la experiencia de aprendizaje.

### Necesidad del Negocio

**Problema:**
Sin un sistema de gestion de aulas:
- Profesores no pueden organizar estudiantes por grupos/clases
- No hay forma de asignar contenido especifico a un grupo
- Imposible configurar experiencia personalizada por clase
- Falta estructura para analytics y seguimiento

**Solucion:**
Implementar CRUD completo de aulas con:
- Creacion de aulas con informacion basica (nombre, nivel, grado, ciclo escolar)
- Configuracion de visibilidad y gamificacion por aula
- Gestion del ciclo de vida del aula (fechas de inicio/fin)
- Limites de aulas por profesor (20 max en alcance inicial)

---

## Requerimiento Funcional

### RF-ADM-001.1: Crear Aula

El sistema **DEBE** permitir a un profesor crear aulas con los siguientes campos:

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| name | string | Si | Max 100 caracteres |
| description | string | No | Max 500 caracteres |
| level | enum | Si | primaria, secundaria, preparatoria |
| grade | integer | Si | 1-6 (primaria), 1-3 (secundaria/preparatoria) |
| schoolYear | string | Si | Formato libre (ej: "2024-2025") |

**Reglas de Negocio:**
- El aula se asocia automaticamente al profesor autenticado
- Un profesor puede crear hasta 20 aulas (limite hardcodeado)
- Nombres de aula pueden repetirse (no es unique)
- Al crear aula, se inicializa con configuracion por defecto

### RF-ADM-001.2: Listar Aulas

El sistema **DEBE** mostrar todas las aulas del profesor con:
- Nombre del aula
- Nivel y grado
- Numero de estudiantes
- Numero de modulos asignados
- Fecha de creacion
- Acciones rapidas (ver, editar, eliminar)

**Ordenamiento:** Por fecha de creacion (mas recientes primero)

### RF-ADM-001.3: Editar Aula

El sistema **DEBE** permitir editar todos los campos excepto:
- ID del aula
- Profesor propietario
- Fecha de creacion

### RF-ADM-001.4: Eliminar Aula

El sistema **DEBE** permitir eliminar aulas con:
- Modal de confirmacion antes de eliminar
- Advertencia si el aula tiene estudiantes
- Eliminacion permanente (hard delete en alcance inicial)
- Eliminacion en cascada de relaciones (estudiantes, modulos)
- Los estudiantes NO se eliminan (solo la relacion)

### RF-ADM-001.5: Configuracion de Aula

El sistema **DEBE** permitir configurar:

#### Fechas
| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| startDate | date | No | Fecha de inicio del aula |
| endDate | date | No | Fecha de fin del aula |

**Validacion:** `endDate > startDate`

#### Visibilidad de Modulos
| Opcion | Efecto |
|--------|--------|
| Todos visibles | Estudiantes ven todos los modulos asignados |
| Ocultos | Estudiantes no ven modulos |

**Default:** Todos visibles

#### Gamificacion
| Opcion | Efecto |
|--------|--------|
| Activa | Estudiantes ganan XP, suben niveles, desbloquean logros |
| Inactiva | Solo progreso en porcentaje |

**Default:** Activa

---

## Criterios de Aceptacion

### AC-001: CRUD Completo
- [x] Formulario de creacion con validacion de campos
- [x] Vista de lista con cards de aulas
- [x] Formulario de edicion pre-poblado
- [x] Modal de confirmacion al eliminar
- [x] Mensajes de feedback al usuario

### AC-002: Limites
- [x] Maximo 20 aulas por profesor
- [x] Mensaje de error al intentar crear aula #21
- [x] Contador visible cuando se acerca al limite

### AC-003: Configuracion
- [x] Validacion de fechas (fin > inicio)
- [x] Toggle de visibilidad funcional
- [x] Toggle de gamificacion funcional
- [x] Cambios reflejados en experiencia del estudiante

### AC-004: Eliminacion Segura
- [x] Confirma accion antes de eliminar
- [x] Muestra advertencia si hay estudiantes
- [x] Relaciones eliminadas en cascada
- [x] Estudiantes conservan sus cuentas

---

## Casos de Uso

### UC-001: Profesor crea su primera aula

**Actor:** Profesor
**Precondiciones:** Profesor autenticado, sin aulas creadas

**Flujo:**
1. Profesor navega a "Mis Aulas"
2. Sistema muestra empty state con CTA "Crear Aula"
3. Profesor hace clic en "Crear Aula"
4. Sistema muestra formulario de creacion
5. Profesor completa campos requeridos
6. Profesor hace clic en "Crear"
7. Sistema valida datos
8. Sistema crea aula en base de datos
9. Sistema redirige al dashboard del aula
10. Sistema muestra mensaje de exito

**Resultado:** Aula creada y profesor en el dashboard

### UC-002: Profesor configura gamificacion de aula

**Actor:** Profesor
**Precondiciones:** Aula existente con estudiantes

**Flujo:**
1. Profesor navega a Configuracion del aula
2. Sistema muestra opciones de configuracion
3. Profesor desactiva toggle de gamificacion
4. Sistema muestra advertencia sobre impacto
5. Profesor confirma
6. Sistema guarda configuracion
7. **Efecto:** Estudiantes ya no ven XP, niveles ni logros

**Resultado:** Gamificacion desactivada para el aula

---

## Alcance Basico vs Extensiones

### EAI-005 (Este alcance - Admin Base)
- CRUD basico completo
- Campos basicos de aula
- Hard delete (eliminacion permanente)
- Limite de 20 aulas por profesor
- Configuracion: fechas, visibilidad, gamificacion

### EXT-001 (Extension futura - Portal Maestros Completo)
- Soft delete y archivado de aulas
- Templates de aula (crear desde plantilla)
- Clonacion de aulas (duplicar configuracion)
- Campos adicionales (horario, aula fisica, color)
- Co-profesores (multiples profesores por aula)
- Importacion masiva desde CSV
- Configuracion avanzada por modulo individual
- Reglas de acceso condicional

---

## Testing

### Pruebas Unitarias
- [ ] Validacion de limite de 20 aulas
- [ ] Validacion de campos requeridos
- [ ] Validacion de fecha fin > fecha inicio
- [ ] Settings se crean si no existen

### Pruebas de Integracion
- [ ] Crear aula asocia correctamente al profesor
- [ ] Listar solo retorna aulas del profesor autenticado
- [ ] Eliminar aula remueve relaciones en cascada
- [ ] Toggle de gamificacion afecta experiencia estudiante

### Pruebas E2E
- [ ] Profesor puede crear aula completa
- [ ] Profesor ve solo sus aulas
- [ ] Profesor puede editar y eliminar su aula
- [ ] Validacion de limite funciona

---

## Estimacion de Esfuerzo

| Componente | Story Points |
|------------|-------------|
| CRUD Aulas (US-ADM-001) | 8 SP |
| Configuracion (US-ADM-006) | 6 SP |
| **Total** | **14 SP** |

**Presupuesto:** $5,600 MXN

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial del requerimiento |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-001-gestion-aulas.md`
**Ruta relativa desde docs/:** `01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-001-gestion-aulas.md`
