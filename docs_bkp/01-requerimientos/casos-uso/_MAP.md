# _MAP: docs/01-requerimientos/casos-uso/

**Última actualización:** 2025-11-07
**Propósito:** Casos de uso detallados y user stories del sistema
**Audiencia:** Product Owners, QA Engineers, Diseñadores UX, Desarrolladores
**Estado:** 🟢 Completo

---

## 📁 Contenido de esta Carpeta

### Documentos Principales

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [README.md](./README.md) | Índice general de casos de uso | ✅ |
| [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) | Resumen ejecutivo de casos de uso principales | ✅ |
| [METRICAS-DETALLADAS.md](./METRICAS-DETALLADAS.md) | Métricas y KPIs para validar casos de uso | ✅ |

### Subdirectorios

| Carpeta | Descripción | Estado |
|---------|-------------|--------|
| [student/](./student/) | Casos de uso del portal de estudiantes | 🟡 Parcial |

**Total documentos:** 4

---

## 🔗 Interdependencias

### Módulos Relacionados

**Complementa a:**
- Todos los módulos de requerimientos - Casos de uso validan RFs
- [interfaces/](../interfaces/) - Wireframes y diseños de UI

**Usado por:**
- QA Engineers - Testing basado en casos de uso
- Diseñadores UX - Diseño centrado en usuario
- Desarrolladores - Implementación guiada por user stories

### Documentación Relacionada

**Requerimientos Funcionales:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/)
- [02-gamificacion](../02-gamificacion/)
- [03-contenido-educativo](../03-contenido-educativo/)
- [Teacher Portal](../teacher-portal/)
- [Admin Portal](../admin-portal/)

**Desarrollo:**
- [Testing](../../03-desarrollo/testing/) - Tests basados en casos de uso

---

## 📊 Métricas

- **Total documentos:** 4
- **Casos de uso documentados:** ~15 (ver METRICAS-DETALLADAS.md)
- **Cobertura de portales:**
  - Portal Estudiante: 40%
  - Portal Maestro: 20%
  - Portal Admin: 10%

---

## 🎯 Casos de Uso Principales

### Portal de Estudiantes

**Casos de uso documentados (student/):**
1. Realizar ejercicio de lectura
2. Ver progreso personal
3. Desbloquear achievement
4. Comprar power-up con ML Coins
5. Subir de rango Maya

**Casos de uso pendientes:**
- [ ] Login y onboarding
- [ ] Navegar biblioteca de lecturas
- [ ] Unirse a aula con código
- [ ] Ver feedback de maestro
- [ ] Compartir logro en redes (social)

### Portal de Maestros

**Casos de uso pendientes:**
- [ ] Crear aula y agregar estudiantes
- [ ] Asignar tarea a estudiantes
- [ ] Calificar ejercicios con texto libre
- [ ] Ver dashboard de progreso del aula
- [ ] Generar reporte de rendimiento

### Portal de Administradores

**Casos de uso pendientes:**
- [ ] Crear organización (tenant)
- [ ] Gestionar feature flags
- [ ] Moderar contenido reportado
- [ ] Ver audit logs
- [ ] Configurar parámetros del sistema

---

## 🚀 Próximos Pasos

### Prioridad Alta
1. [ ] Completar casos de uso de portal de estudiantes (60% pendiente)
2. [ ] Crear casos de uso de portal de maestros
3. [ ] Crear casos de uso de portal de admin

### Prioridad Media
4. [ ] Agregar diagramas de flujo para casos de uso complejos
5. [ ] Incluir criterios de aceptación detallados
6. [ ] Vincular casos de uso con tests automatizados

### Prioridad Baja
7. [ ] Crear user stories en formato Agile (As a... I want... So that...)
8. [ ] Agregar ejemplos visuales (screenshots, mockups)
9. [ ] Documentar excepciones y flujos alternativos

---

## ⚠️ Issues Conocidos

- [ ] Cobertura baja de casos de uso de maestros (20%)
- [ ] Cobertura muy baja de casos de uso de admin (10%)
- [ ] Faltan casos de uso de características sociales (0%)
- [ ] No hay vínculos explícitos entre casos de uso y tests

---

## 📚 Formato de Casos de Uso

### Template Recomendado

```markdown
# UC-XXX: [Título del Caso de Uso]

## Actor Principal
[Estudiante / Maestro / Admin]

## Precondiciones
- Usuario autenticado
- [Otras condiciones necesarias]

## Flujo Principal
1. Actor hace X
2. Sistema responde Y
3. Actor confirma Z
4. Sistema actualiza estado

## Flujos Alternativos
**4a. Error de validación:**
1. Sistema muestra mensaje de error
2. Regresa al paso 3

## Postcondiciones
- [Estado del sistema después de completar]

## Criterios de Aceptación
- [ ] Sistema valida X
- [ ] Usuario ve Y
- [ ] Base de datos actualiza Z

## Referencias
- RF: [Link a requerimiento funcional]
- UI: [Link a wireframe/diseño]
- Tests: [Link a tests automatizados]
```

---

## 📖 Guía de Navegación

**Si buscas...**
- **Resumen de casos de uso:** Ver [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md)
- **Métricas y KPIs:** Ver [METRICAS-DETALLADAS.md](./METRICAS-DETALLADAS.md)
- **Casos de estudiantes:** Ver [student/](./student/)
- **Diseños de UI relacionados:** Ver [interfaces/](../interfaces/)
