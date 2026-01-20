---
id: "RF-ADM-002"
title: "Gestion de Estudiantes"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Admin Base"
epic: "EAI-005"
version: "1.0"
labels: ["admin", "students", "classroom-management", "groups"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ADM-002: Gestion de Estudiantes

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ADM-002 |
| **Modulo** | Admin Base |
| **Prioridad** | Alta |
| **Estado** | Implementado |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ADM-002: Gestion de Estudiantes](../especificaciones/ET-ADM-002-gestion-estudiantes.md)

### User Stories Relacionadas
- [US-ADM-002: Gestion de Estudiantes en Aula](../historias-usuario/US-ADM-002-gestion-estudiantes-aula.md) - 10 SP
- [US-ADM-005: Gestion de Grupos Basica](../historias-usuario/US-ADM-005-gestion-grupos.md) - 7 SP

### Implementacion
- **Backend:** `teacher` module - TeacherClassroomController, TeacherStudentController
- **Frontend:** `/teacher/classroom/:id/students`, `/teacher/classroom/:id/groups`
- **Database:** `social_features.classroom_students`, `social_features.groups`, `social_features.group_students`

---

## Descripcion del Requerimiento

### Contexto

Una vez creada el aula, el profesor necesita agregar estudiantes para que puedan acceder al contenido educativo. Ademas, requiere organizar estudiantes en grupos para facilitar actividades colaborativas y asignaciones diferenciadas.

### Necesidad del Negocio

**Problema:**
Sin un sistema de gestion de estudiantes:
- No hay forma de controlar quien accede al aula
- Imposible organizar estudiantes para trabajo en equipo
- Dificil asignar actividades diferenciadas por grupo
- Falta visibilidad de la composicion del aula

**Solucion:**
Implementar gestion completa de estudiantes con:
- Agregar estudiantes existentes o crear nuevos
- Remover estudiantes del aula (sin eliminar cuenta)
- Crear grupos dentro del aula
- Asignar estudiantes a multiples grupos

---

## Requerimiento Funcional

### RF-ADM-002.1: Ver Lista de Estudiantes del Aula

El sistema **DEBE** mostrar todos los estudiantes del aula con:

| Campo | Descripcion |
|-------|-------------|
| Avatar | Foto o placeholder del estudiante |
| Nombre completo | Nombre del estudiante |
| Email | Si esta disponible |
| Fecha de ingreso | Cuando fue agregado al aula |
| Estado | Activo |
| Accion | Remover |

**Funcionalidades:**
- Contador total de estudiantes
- Busqueda simple por nombre
- Mensaje amigable si no hay estudiantes

### RF-ADM-002.2: Agregar Estudiante al Aula

El sistema **DEBE** ofrecer dos opciones:

#### Opcion A: Buscar Estudiante Existente
- Campo de busqueda por nombre o email
- Resultados en tiempo real (debounce 300ms)
- Indicador si estudiante ya esta en el aula
- Boton "Agregar" para cada resultado valido

#### Opcion B: Crear Nuevo Estudiante
| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| name | string | Si | Nombre completo (max 100 chars) |
| email | string | No | Email del estudiante |

**Credenciales Automaticas:**
- Username: generado automaticamente (`primernombre.apellido`)
- Password temporal: `Temp123!{PrimerNombre}`
- Role: `student`

**Post-creacion:**
- Mostrar credenciales al profesor
- Opcion de copiar credenciales
- Agregar automaticamente al aula

### RF-ADM-002.3: Remover Estudiante del Aula

El sistema **DEBE** permitir remover estudiantes con:
- Modal de confirmacion
- Advertencia: "Esto removerá al estudiante del aula pero no eliminará su cuenta"
- Al confirmar, se remueve la relacion aula-estudiante
- El estudiante y su progreso se conservan
- Actualizacion inmediata de la lista

### RF-ADM-002.4: Validaciones de Estudiantes

| Regla | Descripcion |
|-------|-------------|
| No duplicados | No agregar estudiante que ya esta en el aula |
| Email unico | Si se proporciona email, debe ser unico en plataforma |
| Limite por aula | Maximo 100 estudiantes por aula |

### RF-ADM-002.5: Gestion de Grupos

#### Crear Grupo
| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| name | string | Si | Max 50 caracteres, unico en aula |
| color | string | No | Formato hex (#RRGGBB) |

**Colores Predefinidos:**
```
#3b82f6, #ef4444, #10b981, #f59e0b, #8b5cf6, #ec4899, #06b6d4, #84cc16
```

#### Listar Grupos
Para cada grupo mostrar:
- Nombre y color identificador
- Numero de estudiantes asignados
- Avatares de estudiantes (max 5 + contador)
- Acciones: editar, eliminar, asignar estudiantes

#### Asignar Estudiantes a Grupo
- Modal con lista de estudiantes del aula
- Checkbox para seleccion multiple
- Un estudiante puede estar en multiples grupos
- Validar que estudiantes pertenecen al aula

#### Remover Estudiante de Grupo
- Solo remueve del grupo, NO del aula
- Confirmacion simple

#### Eliminar Grupo
- Confirmacion antes de eliminar
- Estudiantes permanecen en el aula (solo se elimina el grupo)

---

## Criterios de Aceptacion

### AC-001: Lista de Estudiantes
- [x] Vista de tabla/lista con todos los estudiantes
- [x] Busqueda por nombre funcional
- [x] Contador de estudiantes total
- [x] Acciones de remover visibles

### AC-002: Agregar Estudiantes
- [x] Busqueda de estudiantes existentes funciona
- [x] Creacion de estudiantes nuevos genera credenciales
- [x] Credenciales se muestran y pueden copiarse
- [x] Estudiante agregado aparece en lista inmediatamente

### AC-003: Remover Estudiantes
- [x] Modal de confirmacion antes de remover
- [x] Estudiante removido, cuenta conservada
- [x] Lista actualizada inmediatamente

### AC-004: Gestion de Grupos
- [x] CRUD completo de grupos
- [x] Asignacion multiple de estudiantes
- [x] Estudiante puede estar en varios grupos
- [x] Eliminar grupo no afecta estudiantes

### AC-005: Limites
- [x] Maximo 100 estudiantes por aula
- [x] Mensaje de error al exceder limite
- [x] Sin limite de grupos por aula

---

## Casos de Uso

### UC-001: Profesor agrega estudiante nuevo

**Actor:** Profesor
**Precondiciones:** Aula existente

**Flujo:**
1. Profesor navega a "Estudiantes" del aula
2. Profesor hace clic en "Agregar Estudiante"
3. Sistema muestra modal con tabs: Buscar / Crear
4. Profesor selecciona "Crear Nuevo"
5. Profesor completa nombre "Maria Lopez"
6. Profesor hace clic en "Crear y Agregar"
7. Sistema genera credenciales:
   - Username: `maria.lopez`
   - Password: `Temp123!Maria`
8. Sistema muestra credenciales con boton de copiar
9. Profesor copia credenciales
10. Profesor cierra modal
11. Sistema actualiza lista con Maria

**Resultado:** Estudiante creado y agregado al aula

### UC-002: Profesor crea grupos para trabajo colaborativo

**Actor:** Profesor
**Precondiciones:** Aula con 25 estudiantes

**Flujo:**
1. Profesor navega a "Grupos" del aula
2. Profesor crea 5 grupos: Equipo A, B, C, D, E
3. Para cada grupo, asigna 5 estudiantes
4. Sistema permite que un estudiante este en multiples grupos
5. Profesor ve vista de grupos con avatares

**Resultado:** Aula organizada en 5 grupos de trabajo

---

## Alcance Basico vs Extensiones

### EAI-005 (Este alcance - Admin Base)
- Ver lista de estudiantes del aula
- Agregar estudiante existente (busqueda manual)
- Crear estudiante nuevo con credenciales auto-generadas
- Remover estudiante del aula
- Busqueda simple por nombre/email
- Limite de 100 estudiantes por aula
- CRUD de grupos basico
- Asignacion manual de estudiantes a grupos
- Estudiante puede estar en multiples grupos

### EXT-001 (Extension futura - Portal Maestros Completo)
- Importacion masiva desde CSV
- Invitaciones por email con link de auto-registro
- Codigo de clase para auto-registro de estudiantes
- Transferencia de estudiantes entre aulas
- Edicion de datos de estudiante desde el profesor
- Historial de pertenencia a aulas
- Exportacion de lista de estudiantes
- Asignacion automatica de grupos (aleatoria, por nivel)
- Grupos dinamicos (basados en progreso)
- Rotacion automatica de grupos
- Analytics por grupo
- Asignar actividades especificas a grupos

---

## Testing

### Pruebas Unitarias
- [ ] Validacion de limite de 100 estudiantes
- [ ] Validacion de email unico
- [ ] Generacion de username automatico
- [ ] Nombre de grupo unico en aula

### Pruebas de Integracion
- [ ] Agregar estudiante existente funciona
- [ ] Crear estudiante genera credenciales correctas
- [ ] Remover estudiante conserva cuenta
- [ ] Asignar estudiante a grupo valida pertenencia al aula

### Pruebas E2E
- [ ] Profesor agrega estudiante existente
- [ ] Profesor crea estudiante nuevo
- [ ] Profesor remueve estudiante
- [ ] Busqueda encuentra estudiantes
- [ ] CRUD completo de grupos funciona

---

## Estimacion de Esfuerzo

| Componente | Story Points |
|------------|-------------|
| Gestion Estudiantes (US-ADM-002) | 10 SP |
| Gestion Grupos (US-ADM-005) | 7 SP |
| **Total** | **17 SP** |

**Presupuesto:** $6,800 MXN

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Analyst | Creacion inicial del requerimiento |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-002-gestion-estudiantes.md`
**Ruta relativa desde docs/:** `01-fase-alcance-inicial/EAI-005-admin-base/requerimientos/RF-ADM-002-gestion-estudiantes.md`
