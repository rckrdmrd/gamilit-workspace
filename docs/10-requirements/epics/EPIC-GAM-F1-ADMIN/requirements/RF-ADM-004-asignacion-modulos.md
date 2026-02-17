---
id: "RF-ADM-004"
title: "Asignacion de Modulos"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Admin Base"
epic: "EAI-005"
version: "1.0"
labels: ["admin", "modules", "content-management", "catalog"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ADM-004: Asignacion de Modulos

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ADM-004 |
| **Modulo** | Admin Base |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ADM-004: Asignacion de Modulos](../specifications/ET-ADM-004-asignacion-modulos.md)

### User Stories Relacionadas
- [US-ADM-004: Asignacion Basica de Modulos](../user-stories/US-ADM-004/US-ADM-004-asignacion-modulos.md) - 10 SP

### Dependencias
- EAI-002: Modulos y actividades deben existir como contenido

### Implementacion
- **Backend:** `teacher` module - TeacherModuleController, ModuleService
- **Frontend:** `/teacher/classroom/:id/modules`, `/teacher/classroom/:id/modules/catalog`
- **Database:** `educational_content.modules`, `social_features.classroom_modules`

---

## Descripcion del Requerimiento

### Contexto

Una vez que el profesor tiene aulas con estudiantes, necesita asignar contenido educativo (modulos) para que los estudiantes puedan aprender. En el alcance inicial, los modulos son contenido pre-cargado (hardcodeado) que el profesor selecciona de un catalogo.

### Necesidad del Negocio

**Problema:**
Sin un sistema de asignacion de modulos:
- Estudiantes no tienen acceso a contenido educativo
- Imposible controlar que contenido ve cada aula
- No hay forma de rastrear progreso por modulo
- Falta estructura para diferenciar contenido entre clases

**Solucion:**
Implementar asignacion de modulos con:
- Catalogo de modulos disponibles filtrable
- Asignacion de modulos desde catalogo a aula
- Vista de modulos asignados con estadisticas
- Capacidad de remover modulos del aula

---

## Requerimiento Funcional

### RF-ADM-004.1: Catalogo de Modulos Disponibles

El sistema **DEBE** mostrar un catalogo con todos los modulos disponibles:

| Campo | Descripcion |
|-------|-------------|
| Nombre | Nombre del modulo |
| Descripcion | Descripcion breve |
| Materia | Matematicas, Espanol, Ciencias, etc. |
| Nivel recomendado | Primaria, Secundaria, Preparatoria |
| Grados recomendados | Array de grados (ej: [4, 5, 6]) |
| Actividades | Numero de actividades incluidas |
| Duracion estimada | Ej: "4 horas" |
| Estado | Indicador si ya esta asignado al aula |

#### Filtros Basicos
| Filtro | Valores |
|--------|---------|
| Materia | matematicas, espanol, ciencias, historia, etc. |
| Nivel | primaria, secundaria, preparatoria |

### RF-ADM-004.2: Asignar Modulo al Aula

El sistema **DEBE** permitir asignar modulos con:
- Boton "Asignar" visible en cada modulo no asignado
- Confirmacion de asignacion
- El modulo queda disponible para todos los estudiantes del aula
- Actualizacion inmediata de la vista (indicador "Ya asignado")

**Validaciones:**
- No asignar modulo duplicado
- Sin limite de modulos por aula en alcance inicial

### RF-ADM-004.3: Ver Modulos Asignados

El sistema **DEBE** mostrar los modulos asignados al aula con:

| Campo | Descripcion |
|-------|-------------|
| Nombre | Nombre del modulo |
| Descripcion | Descripcion breve |
| Actividades | Numero de actividades |
| Fecha asignacion | Cuando fue asignado |
| Stats | Estadisticas de uso |
| Accion | Remover |

#### Estadisticas por Modulo
| Metrica | Descripcion |
|---------|-------------|
| Estudiantes iniciaron | # que han comenzado el modulo |
| Estudiantes completaron | # que han completado al 100% |
| Total estudiantes | # total en el aula |
| Progreso promedio | % promedio del aula en el modulo |

### RF-ADM-004.4: Remover Modulo del Aula

El sistema **DEBE** permitir remover modulos con:
- Boton "Remover" en cada modulo asignado
- Modal de confirmacion con advertencia
- Advertencia: "El progreso de los estudiantes en este modulo se conservara pero el modulo dejara de estar visible"
- Al confirmar, se remueve la asignacion
- Progreso de estudiantes se mantiene (no se elimina)

### RF-ADM-004.5: Contenido Read-Only

**Importante:** En el alcance inicial, los modulos son contenido hardcodeado:
- Profesor NO puede crear modulos custom
- Profesor NO puede editar contenido de modulos
- Profesor solo puede asignar/remover modulos existentes

---

## Criterios de Aceptacion

### AC-001: Catalogo
- [x] Vista de catalogo con todos los modulos
- [x] Filtros por materia y nivel funcionan
- [x] Indicador visual de modulos ya asignados
- [x] Informacion completa de cada modulo

### AC-002: Asignacion
- [x] Boton "Asignar" visible en modulos no asignados
- [x] Confirmacion al asignar
- [x] Vista actualizada inmediatamente
- [x] Modulo disponible para estudiantes del aula

### AC-003: Vista de Asignados
- [x] Lista de modulos asignados
- [x] Estadisticas de uso por modulo
- [x] Fecha de asignacion visible

### AC-004: Remover
- [x] Modal de confirmacion
- [x] Advertencia sobre progreso
- [x] Progreso de estudiantes conservado
- [x] Modulo ya no visible para estudiantes

### AC-005: Validaciones
- [x] No permite asignar modulo duplicado
- [x] Modulos son read-only (sin edicion)

---

## Casos de Uso

### UC-001: Profesor asigna modulo desde catalogo

**Actor:** Profesor
**Precondiciones:** Aula existente con estudiantes

**Flujo:**
1. Profesor navega a "Modulos" del aula
2. Profesor hace clic en "Asignar Modulo"
3. Sistema muestra catalogo con filtros
4. Profesor filtra por: Materia = Matematicas, Nivel = Primaria
5. Sistema muestra modulos que coinciden
6. Profesor selecciona "Fracciones Basicas"
7. Sistema muestra detalles: 20 actividades, 4 horas estimadas
8. Profesor hace clic en "Asignar al Aula"
9. Sistema confirma asignacion
10. Sistema redirige a lista de modulos asignados
11. Modulo aparece con stats iniciales: 0/25 iniciaron

**Resultado:** Modulo asignado y disponible para estudiantes

### UC-002: Profesor revisa progreso en modulo

**Actor:** Profesor
**Precondiciones:** Modulo asignado hace 1 semana

**Flujo:**
1. Profesor navega a "Modulos" del aula
2. Profesor ve modulo "Fracciones Basicas"
3. Sistema muestra stats:
   - 18/25 iniciaron (72%)
   - 12/25 completaron (48%)
   - Progreso promedio: 72.5%
4. Profesor identifica que 7 estudiantes no han iniciado
5. Profesor decide tomar accion con esos estudiantes

**Resultado:** Profesor tiene visibilidad de progreso por modulo

---

## Endpoints Backend

### Catalogo de Modulos
```
GET /api/teacher/modules/catalog?subject=matematicas&level=primaria

Response:
{
  "modules": [
    {
      "id": "module-uuid",
      "name": "Fracciones Basicas",
      "description": "Introduccion a fracciones, suma y resta",
      "subject": "matematicas",
      "level": "primaria",
      "recommendedGrades": [4, 5, 6],
      "activityCount": 20,
      "estimatedDuration": "4 horas",
      "isAssignedToClassroom": false
    }
  ],
  "total": 15
}
```

### Modulos Asignados
```
GET /api/teacher/classrooms/{classroomId}/modules

Response:
{
  "classroomId": "uuid",
  "modules": [
    {
      "id": "module-uuid",
      "name": "Fracciones Basicas",
      "description": "Introduccion a fracciones",
      "activityCount": 20,
      "assignedAt": "2025-10-01T10:00:00Z",
      "stats": {
        "studentsStarted": 18,
        "studentsCompleted": 12,
        "totalStudents": 25,
        "averageProgress": 72.5
      }
    }
  ],
  "total": 5
}
```

### Asignar Modulo
```
POST /api/teacher/classrooms/{classroomId}/modules
Body: { "moduleId": "uuid" }

Response:
{ "message": "Modulo asignado exitosamente" }
```

### Remover Modulo
```
DELETE /api/teacher/classrooms/{classroomId}/modules/{moduleId}

Response:
{ "message": "Modulo removido del aula" }
```

---

## Modelo de Datos

### Tabla: modules (contenido hardcodeado)
```sql
CREATE TABLE educational_content.modules (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    recommended_grades INTEGER[],
    estimated_duration VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: classroom_modules (relacion M:N)
```sql
CREATE TABLE social_features.classroom_modules (
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (classroom_id, module_id)
);
```

---

## Alcance Basico vs Extensiones

### EAI-005 (Este alcance - Admin Base)
- Asignar modulos pre-cargados desde catalogo
- Remover modulos del aula
- Ver modulos asignados con stats basicas
- Filtros simples (materia, nivel)
- Contenido hardcodeado (no editable)

### EXT-001 (Extension futura - Portal Maestros Completo)
- Crear modulos custom
- Editar contenido de modulos
- Clonar/duplicar modulos
- Organizar modulos en secuencias/unidades
- Configurar orden de modulos
- Programar fechas de disponibilidad
- Modulos adaptativos (dificultad dinamica)

---

## Testing

### Pruebas Unitarias
- [ ] Filtros de catalogo funcionan correctamente
- [ ] Estadisticas calculadas correctamente
- [ ] Validacion de modulo duplicado

### Pruebas de Integracion
- [ ] Asignar modulo lo hace disponible para estudiantes
- [ ] Remover modulo conserva progreso
- [ ] Stats reflejan datos reales de estudiantes

### Pruebas E2E
- [ ] Profesor navega catalogo con filtros
- [ ] Profesor asigna modulo exitosamente
- [ ] Profesor ve estadisticas de modulo
- [ ] Profesor remueve modulo con confirmacion

---

## Estimacion de Esfuerzo

| Componente | Story Points |
|------------|-------------|
| Asignacion de Modulos (US-ADM-004) | 10 SP |
| **Total** | **10 SP** |

**Presupuesto:** $4,000 MXN

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial del requerimiento |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-004-asignacion-modulos.md`
**Ruta relativa desde docs/:** `01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-004-asignacion-modulos.md`
