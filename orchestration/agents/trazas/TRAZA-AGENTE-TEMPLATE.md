# Traza de Agente: {PERFIL-AGENTE}

**Perfil:** {PERFIL-AGENTE}
**Archivo de Perfil:** `agents/perfiles/PERFIL-{NOMBRE}.md`
**Fecha de Creación:** {YYYY-MM-DD}
**Última Actualización:** {YYYY-MM-DD}

---

## Resumen de Actividad

| Métrica | Valor |
|---------|-------|
| Total de Tareas | {N} |
| Tareas Completadas | {N} |
| Tareas en Progreso | {N} |
| Primera Actividad | {YYYY-MM-DD} |
| Última Actividad | {YYYY-MM-DD} |

---

## Historial de Tareas

### 2026-01

#### {TASK-2026-01-XX-NNN}
```yaml
task_id: "TASK-2026-01-XX-NNN"
fecha: "2026-01-XX"
titulo: "{Título de la tarea}"
tipo: "feature|bugfix|refactor|documentation|analysis"
proyecto: "{nombre-proyecto}"
estado: "completada|en_progreso|bloqueada"
duracion: "{N}h"
carpeta: "orchestration/tareas/TASK-2026-01-XX-NNN/"
commits:
  - "{hash1}"
  - "{hash2}"
resumen: |
  {Breve descripción de lo que se hizo}
```

---

*(Agregar más entradas conforme se ejecutan tareas)*

---

## Estadísticas por Tipo de Tarea

| Tipo | Cantidad | Porcentaje |
|------|----------|------------|
| Feature | {N} | {X}% |
| Bugfix | {N} | {X}% |
| Refactor | {N} | {X}% |
| Documentation | {N} | {X}% |
| Analysis | {N} | {X}% |

---

## Estadísticas por Proyecto

| Proyecto | Tareas | Última Actividad |
|----------|--------|------------------|
| {proyecto} | {N} | {fecha} |

---

## Notas del Agente

{Observaciones generales, patrones identificados, áreas de mejora}

---

## Instrucciones de Actualización

1. **Al iniciar tarea:**
   - No es necesario actualizar este archivo

2. **Al completar tarea:**
   - Agregar entrada en "Historial de Tareas" bajo el mes correspondiente
   - Actualizar "Resumen de Actividad"
   - Actualizar estadísticas si aplica

3. **Formato de entrada:**
   ```yaml
   task_id: "TASK-YYYY-MM-DD-NNN"
   fecha: "YYYY-MM-DD"
   titulo: "Título descriptivo"
   tipo: "tipo de tarea"
   proyecto: "nombre del proyecto"
   estado: "estado final"
   duracion: "Xh"
   carpeta: "ruta a carpeta de tarea"
   commits: ["hash1", "hash2"]
   resumen: "Breve descripción"
   ```

---

*Traza mantenida automáticamente por el Sistema de Gobernanza de Documentación*
