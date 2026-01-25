# SIMCO-SPRINT-EXECUTION.md

**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0
**Alias:** @SPRINT_EXECUTION
**Tipo:** Directiva de Proceso

---

## 1. PROPOSITO

Esta directiva define el ciclo integrado CAPVED+SCRUM para la ejecucion de Sprints, combinando la trazabilidad y rigor de CAPVED con la agilidad e iteracion de Scrum.

---

## 2. ALCANCE

Aplica a todos los proyectos del workspace que ejecutan trabajo en Sprints de 2 semanas.

---

## 3. CICLO INTEGRADO CAPVED+SCRUM

### 3.1 Estructura del Sprint (2 semanas)

```
SEMANA 1                          SEMANA 2
├── Lun: Sprint Planning          ├── Lun: Daily + Ejecucion
├── Mar-Jue: Daily + Ejecucion    ├── Mar-Jue: Daily + Ejecucion
└── Vie: Daily + Ejecucion        └── Vie: Review + Retrospectiva
```

### 3.2 Ceremonies

| Ceremonia | Dia | Hora | Duracion | Participantes |
|-----------|-----|------|----------|---------------|
| Sprint Planning | Lunes S1 | 9:00 AM | 2h | PO + SM + Dev |
| Daily Standup | Diario | 9:30 AM | 15 min | Dev + SM |
| Sprint Review | Viernes S2 | 3:00 PM | 1h | PO + SM + Dev + Stakeholders |
| Retrospectiva | Viernes S2 | 4:00 PM | 1h | SM + Dev |

---

## 4. SPRINT PLANNING (2 horas)

### 4.1 Parte 1: Seleccion de HUs (1 hora)

1. Leer PROXIMA-ACCION.md
2. Revisar backlog ordenado por prioridad
3. Validar DoR para cada HU candidata
4. Seleccionar HUs hasta llenar capacity (velocity)
5. Crear SPRINT-{N}.yml con HUs seleccionadas

### 4.2 Parte 2: Desglose (1 hora)

Para cada HU seleccionada:

```yaml
Fase C (5 min):
  - Validar contexto proyecto/modulo/epic
  - Cargar SIMCO relevantes
  - GATE-C: Contexto verificado

Fase A (10 min):
  - Identificar objetos impactados
  - Listar dependencias
  - Documentar riesgos
  - GATE-A: Analisis completo

Fase P (10 min):
  - Desglosar en subtareas (max 2 archivos c/u)
  - Asignar agentes
  - Establecer orden de ejecucion
  - GATE-P: Plan ejecutable

Fase V (5 min):
  - Verificar cobertura A->P
  - Confirmar viabilidad
  - GATE-V: Plan aprobado
```

---

## 5. DAILY STANDUP (15 minutos)

### 5.1 Formato

Cada participante responde (max 2 min):
1. Que hice ayer?
2. Que hare hoy?
3. Hay bloqueos?

### 5.2 Registro

Actualizar SESSION-TRACKING.yml:
```yaml
daily:
  fecha: "YYYY-MM-DD"
  participantes: []
  updates:
    - agente: ""
      ayer: ""
      hoy: ""
      bloqueos: []
```

---

## 6. EJECUCION (Fase E)

### 6.1 Por cada Subtarea

```yaml
Pre-ejecucion:
  - Cargar contexto de HU
  - Verificar dependencias resueltas

Ejecucion:
  - Implementar segun plan
  - Validar criterios de subtarea
  - build: PASS
  - lint: PASS

Post-ejecucion:
  - Marcar subtarea completada
  - Actualizar tracking
  - Si errores: documentar y reportar
```

### 6.2 Validacion Continua

- Por cada GATE que falla: FIX IT (no proceder)
- Si scope creep: Crear HU derivada
- Si error repetido: Aplicar SIMCO-ERROR-RECURRENTE.md

---

## 7. DOCUMENTACION (Fase D)

Al completar cada HU:

```yaml
Actualizar:
  - Inventarios (DATABASE, BACKEND, FRONTEND)
  - Trazas en orchestration/trazas/
  - ADRs si decisiones tecnicas
  - TRACEABILITY.yml del modulo

Registrar:
  - Lecciones aprendidas
  - HUs derivadas detectadas

Marcar:
  - HU como COMPLETADA
  - PROXIMA-ACCION.md actualizado
```

---

## 8. SPRINT REVIEW (1 hora)

### 8.1 Agenda

| Tiempo | Actividad |
|--------|-----------|
| 0-5 min | Resumen del Sprint |
| 5-35 min | Demo de HUs completadas |
| 35-45 min | HUs incompletas |
| 45-55 min | HUs derivadas |
| 55-60 min | Calculo velocity |

### 8.2 Validacion DoD

Para cada HU demostrada:
- [ ] Codigo implementado
- [ ] Tests pasando
- [ ] Build sin errores
- [ ] Documentacion actualizada
- [ ] Criterios de aceptacion cumplidos

---

## 9. SPRINT RETROSPECTIVA (1 hora)

### 9.1 Formato Start-Stop-Continue

| Tiempo | Actividad |
|--------|-----------|
| 0-15 min | CONTINUE: Que funciono bien |
| 15-30 min | START: Nuevas practicas |
| 30-45 min | STOP: Que eliminar |
| 45-60 min | Action Items |

### 9.2 Output

Crear RETROSPECTIVA-{YYYY-MM}.yml con:
- Practicas a mantener
- Nuevas practicas a probar
- Practicas a eliminar
- Action items con responsables

---

## 10. TEMPLATES ASOCIADOS

| Template | Alias | Uso |
|----------|-------|-----|
| TEMPLATE-DEFINICION-READY.md | @TPL_DOR | Validar HUs |
| TEMPLATE-SPRINT-BACKLOG.yml | @TPL_SPRINT_BACKLOG | Tracking Sprint |
| TEMPLATE-RETROSPECTIVA.yml | @TPL_RETROSPECTIVA | Retrospectivas |
| TEMPLATE-ACTA-SPRINT-PLANNING.md | @TPL_ACTA_PLANNING | Actas |

---

## 11. METRICAS

### Por Sprint

| Metrica | Descripcion |
|---------|-------------|
| Velocity | Story points completados |
| Burndown | Progreso diario |
| DoR Rate | % HUs que pasan DoR |
| DoD Rate | % HUs que pasan DoD |

### Tendencias

Calcular promedio de ultimos 3 sprints para:
- Velocity promedio
- % completitud
- HUs derivadas por sprint

---

## 12. REFERENCIAS

- @CAPVED_PLUS: Ciclo CAPVED ampliado
- @DOC_PROYECTO: Estructura de documentacion
- @MANTENIMIENTO_DOCS: Mantenimiento post-sprint
- @CHK_MANTENIMIENTO: Checklist de mantenimiento

---

**Directiva:** SIMCO-SPRINT-EXECUTION.md
**Version:** 1.0.0
**Categoria:** Proceso

