# 01-CONTEXTO.md - TASK-011: Teacher Portal Validation Fixes

## Solicitud del Usuario

**Fecha:** 2026-01-25
**Solicitante:** adredsi
**Canal:** Claude Code CLI

### Mensaje Original

> "Hola, se esta trabajando en el proyecto de gamilit puedes tomar el perfil que mas se acomode para la tarea que se te asignara y puedas orquestar subagentes con perfiles adecuados a su tarea, vas a trabajar sobre el portal de teacher hay que validar el funcionamiento de todas las paginas ya que alerts entre otras no funcionan correctamente, necesito un analisis detallado y un plan de correcciones"

### Interpretacion

1. **Proyecto:** GAMILIT (Plataforma EdTech con gamificacion)
2. **Modulo:** Portal Teacher
3. **Problema:** Multiples funcionalidades no operan correctamente, especificamente mencionado el sistema de alertas
4. **Requerimiento:** Analisis detallado + Plan de correcciones organizado

## Contexto Tecnico

### Stack Tecnologico
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** NestJS + TypeScript + TypeORM
- **Base de Datos:** PostgreSQL 15 con RLS (Row Level Security)
- **Estado:** TanStack Query (React Query)

### Estructura del Portal Teacher
```
apps/frontend/src/apps/teacher/
├── pages/           (18 paginas)
├── components/      (45 componentes)
├── hooks/           (22 hooks)
├── services/        (13 servicios API)
├── types/           (definiciones de tipos)
├── layouts/         (TeacherLayout)
└── constants/       (constantes y configuraciones)
```

### Endpoints Backend
- **Total:** 62 endpoints para el modulo Teacher
- **Modulos principales:**
  - `teacher/reviews` - Evaluaciones manuales
  - `teacher/classrooms` - Gestion de aulas
  - `teacher/students` - Gestion de estudiantes
  - `teacher/responses` - Respuestas de ejercicios
  - `teacher/alerts` - Sistema de alertas de intervencion

## Problema Principal Identificado

El sistema de **InterventionAlerts** no funcionaba debido a un **mismatch de tipos** entre frontend y backend:

| Campo Frontend | Campo Backend | Impacto |
|---------------|---------------|---------|
| `priority` | `severity` | Alertas no se categorizaban correctamente |
| `message` | `title` | Texto de alerta no aparecia |
| `resolved` (boolean) | `status` (enum) | Estado de resolucion incorrecto |
| `created_at` | `generated_at` | Fechas no se mostraban |

Este error causaba que las alertas aparecieran en blanco o con informacion incorrecta en el panel del docente.

## Restricciones

1. **Build debe pasar** despues de cada fase de correccion
2. **Lint debe pasar** sin nuevos errores
3. **No romper funcionalidad existente**
4. **Seguir estandares SIMCO** para documentacion
5. **Commit + Push** obligatorio segun RC2

## Criterios de Exito

1. Alertas de intervencion funcionando correctamente
2. Todos los tipos sincronizados con backend
3. Sin datos mock en produccion
4. Manejo de errores con feedback visual al usuario
5. Codigo limpio sin console.log de debug
6. Documentacion completa segun CAPVED
