# MAPA DE DEPENDENCIAS

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fecha:** 2026-02-05

---

## 1. GRAFO DE DEPENDENCIAS ENTRE FASES

```
FASE-1: Reconciliacion ──────────────────────┐
   │                                          │
   ├──► FASE-2: Validacion por Schema ────────┤
   │                                          │
   ├──► FASE-3: Validacion por Proceso ───────┤
   │                                          │
   │    FASE-4: Definiciones Faltantes ───────┤ (depende de F2+F3)
   │                                          │
   │    FASE-5: Purga Documentacion ──────────┤ (independiente de F2-F4)
   │                                          │
   └──► FASE-6: Consolidacion y Cierre ───────┘ (depende de F1-F5)
```

### Reglas de Dependencia

| Fase | Depende De | Puede Paralelizarse Con |
|------|------------|-------------------------|
| FASE-1 | Nada | - |
| FASE-2 | FASE-1 | FASE-3 (parcial), FASE-5 |
| FASE-3 | FASE-2 (schemas criticos) | FASE-4 (parcial), FASE-5 |
| FASE-4 | FASE-2, FASE-3 | FASE-5 |
| FASE-5 | FASE-1 (solo para indices) | FASE-2, FASE-3, FASE-4 |
| FASE-6 | FASE-1 a FASE-5 | - |

---

## 2. DEPENDENCIAS INTERNAS POR FASE

### FASE-1: Reconciliacion

```
1.1.1 Catalogar Tablas ──┐
1.1.2 Catalogar Funciones ├──► 1.3.1 Cross-Reference ──► 1.4.1 Actualizar DB_INV
1.1.3 Catalogar Objetos ──┤                            ├──► 1.4.2 Actualizar BE_INV
1.2.1 Catalogar Entities ─┘                            └──► 1.4.3 Actualizar MASTER
```

**Paralelos posibles:**
- Bloque A: 1.1.1 + 1.1.2 + 1.1.3 (en paralelo)
- Bloque B: 1.2.1 (en paralelo con Bloque A)
- Bloque C: 1.3.1 (secuencial, necesita A+B)
- Bloque D: 1.4.1 + 1.4.2 + 1.4.3 (secuencial, necesita C)

### FASE-2: Validacion por Schema

```
2.1.1 auth_management ──┐
2.1.2 gamification_sys ──┤
2.1.3 educational_cont ──┼──► (todos independientes, PARALELO TOTAL)
2.1.4 progress_tracking──┤
2.2.1 social_features ───┤
2.2.2 content_mgmt ──────┤
2.2.3 notifications ─────┤
2.2.4 admin_dashboard ───┤
2.2.5 audit_logging ─────┤
2.3.1 schemas_menores ───┘
```

**Paralelos:** TODOS los schemas pueden validarse en paralelo (hasta 10 agentes simultaneos)

### FASE-3: Validacion por Proceso

```
3.1.1 Auth E2E ─────────┐
3.1.2 Educativo E2E ────┤
3.1.3 Gamificacion E2E──┼──► (todos independientes, PARALELO TOTAL)
3.1.4 Social E2E ───────┤
3.2.1 Admin E2E ────────┤
3.2.2 Notificaciones E2E┤
3.2.3 Padres E2E ───────┤
3.2.4 LTI E2E ──────────┘
```

**Paralelos:** TODOS los procesos pueden validarse en paralelo (hasta 8 agentes)

### FASE-4: Definiciones Faltantes

```
4.1.1 Diagrama ER ──────┐
4.1.2 Trazabilidad ─────┤ (todos independientes)
4.1.3 Specs Tecnicas ───┤
4.2.1 User Stories ──────┘
```

**Paralelos:** Todos en paralelo (4 agentes)

### FASE-5: Purga

```
5.1.1 Purgar _archive ──┐
5.1.2 Evaluar activas ──┤ (todos independientes)
5.2.1 Consolidar guias──┤
5.2.2 Limpiar deprecated┤
5.2.3 Actualizar indices┘ (secuencial, despues de purgas)
```

**Paralelos:** 5.1.1 + 5.1.2 + 5.2.1 + 5.2.2 en paralelo, luego 5.2.3

---

## 3. ORDEN OPTIMO DE EJECUCION

### Bloque 1 (Semana 1): FASE-1 + FASE-5 parcial

```
Dia 1-2:
  Paralelo:
    - Agente 1-3: TAREA 1.1.1 (catalogar tablas, 3 agentes x 6 schemas)
    - Agente 4: TAREA 1.1.2 (catalogar funciones)
    - Agente 5: TAREA 1.1.3 (catalogar triggers/enums/etc)
    - Agente 6: TAREA 1.2.1 (catalogar entities)

  Secuencial (despues de paralelo):
    - TAREA 1.3.1 (cross-reference)
    - TAREA 1.4.1-3 (actualizar inventarios)

Dia 2-3:
  Paralelo (independiente):
    - Agente 1: TAREA 5.1.1 (purgar _archive)
    - Agente 2: TAREA 5.1.2 (evaluar tareas activas)
    - Agente 3: TAREA 5.2.1 (consolidar guias)
    - Agente 4: TAREA 5.2.2 (limpiar deprecated)
```

### Bloque 2 (Semana 1-2): FASE-2

```
Dia 3-5:
  Paralelo (hasta 10 agentes):
    - Agente 1: TAREA 2.1.1 (auth_management)
    - Agente 2: TAREA 2.1.2 (gamification_system)
    - Agente 3: TAREA 2.1.3 (educational_content)
    - Agente 4: TAREA 2.1.4 (progress_tracking)
    - Agente 5: TAREA 2.2.1 (social_features)
    - Agente 6: TAREA 2.2.2 (content_management)
    - Agente 7: TAREA 2.2.3 (notifications)
    - Agente 8: TAREA 2.2.4 + 2.2.5 (admin + audit)
    - Agente 9: TAREA 2.3.1 (schemas menores)
```

### Bloque 3 (Semana 2): FASE-3

```
Dia 5-7:
  Paralelo (hasta 8 agentes):
    - Agente 1: TAREA 3.1.1 (Auth E2E)
    - Agente 2: TAREA 3.1.2 (Educativo E2E)
    - Agente 3: TAREA 3.1.3 (Gamificacion E2E)
    - Agente 4: TAREA 3.1.4 (Social E2E)
    - Agente 5: TAREA 3.2.1 (Admin E2E)
    - Agente 6: TAREA 3.2.2 (Notificaciones E2E)
    - Agente 7: TAREA 3.2.3 + 3.2.4 (Padres + LTI)
```

### Bloque 4 (Semana 2-3): FASE-4

```
Dia 7-9:
  Paralelo (4 agentes):
    - Agente 1: TAREA 4.1.1 (Diagrama ER)
    - Agente 2: TAREA 4.1.2 (Trazabilidad)
    - Agente 3: TAREA 4.1.3 (Specs tecnicas)
    - Agente 4: TAREA 4.2.1 (User Stories)
```

### Bloque 5 (Semana 3): FASE-5 restante + FASE-6

```
Dia 9-10:
  Secuencial:
    - TAREA 5.2.3 (actualizar indices)
    - TAREA 6.1.1 (informe final)
    - TAREA 6.2.1 (actualizar estado)
```

---

## 4. ESTIMACION DE ESFUERZO

| Fase | Tareas | Agentes Paralelos | Tiempo Estimado |
|------|--------|-------------------|-----------------|
| FASE-1 | 7 | 6 | 1-2 dias |
| FASE-2 | 10 | 10 | 2-3 dias |
| FASE-3 | 8 | 8 | 2 dias |
| FASE-4 | 4 | 4 | 2 dias |
| FASE-5 | 5 | 4 | 1 dia |
| FASE-6 | 2 | 1 | 1 dia |
| **TOTAL** | **36** | **Max 10** | **~7-10 dias** |

**Con ejecucion secuencial:** ~20-25 dias
**Con ejecucion paralela:** ~7-10 dias (ahorro ~60%)

---

## 5. PUNTOS DE SINCRONIZACION (GATES)

| Gate | Despues De | Antes De | Criterio |
|------|------------|----------|----------|
| GATE-1 | FASE-1 | FASE-2, FASE-3 | Inventarios reconciliados, 0 discrepancias |
| GATE-2 | FASE-2 | FASE-4 | Todos los schemas validados |
| GATE-3 | FASE-3 | FASE-4 | Todos los procesos validados |
| GATE-4 | FASE-4, FASE-5 | FASE-6 | Definiciones creadas, docs purgados |
| GATE-5 | FASE-6 | CIERRE | Informe final aprobado |

---

*Mapa de Dependencias v1.0.0 - 2026-02-05*
