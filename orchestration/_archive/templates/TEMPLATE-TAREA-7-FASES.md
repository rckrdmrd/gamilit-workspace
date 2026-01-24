# TEMPLATE: TAREA CON CICLO DE 7 FASES

## Metadata

| Campo | Valor |
|-------|-------|
| **ID Tarea** | TAREA-{NNN} |
| **Nombre** | {NOMBRE_DESCRIPTIVO} |
| **Modulo** | {MODULO_OBJETIVO} |
| **Capas** | BD / Backend / Frontend |
| **Estado** | PENDIENTE / EN_PROGRESO / COMPLETADA |
| **Fecha Inicio** | {FECHA} |
| **Fecha Fin** | - |

---

## FASE 1: ANALISIS INICIAL

### 1.1 Objetivo
Comprender el alcance del modulo antes del analisis profundo.

### 1.2 Contexto del Modulo
- **Schema/Tabla principal:** {NOMBRE}
- **Backend Module:** {NOMBRE}
- **Frontend Feature:** {NOMBRE}

### 1.3 Archivos Identificados (Preliminar)

| Capa | Tipo | Archivo | Estado |
|------|------|---------|--------|
| BD | DDL | | Pendiente |
| Backend | Entity | | Pendiente |
| Frontend | Type | | Pendiente |

### 1.4 Dependencias Conocidas
- **Depende de:** {LISTA_DEPENDENCIAS}
- **Es dependido por:** {LISTA_DEPENDIENTES}

### 1.5 Criterios de Exito para Analisis
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio N

### 1.6 Resultado F1
- **Estado:** PENDIENTE / COMPLETADO
- **Fecha:** -
- **Observaciones:** -

---

## FASE 2: ANALISIS DETALLADO

### 2.1 Objetivo
Mapear exhaustivamente todos los objetos, relaciones y dependencias.

### 2.2 Inventario DDL (Base de Datos)

#### Tablas
| Tabla | Columnas | PKs | FKs | Indices | RLS |
|-------|----------|-----|-----|---------|-----|
| | | | | | |

#### Funciones
| Funcion | Tipo | Parametros | Retorno | Usado por |
|---------|------|------------|---------|-----------|
| | | | | |

#### Triggers
| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| | | | |

### 2.3 Inventario Backend

#### Entity
| Entity | Tabla DDL | Columnas | Relaciones | Decoradores |
|--------|-----------|----------|------------|-------------|
| | | | | |

#### Service
| Service | Metodos | Dependencias | Repository |
|---------|---------|--------------|------------|
| | | | |

#### Controller
| Controller | Endpoints | Guards | DTOs |
|------------|-----------|--------|------|
| | | | |

#### DTOs
| DTO | Campos | Validadores | Uso |
|-----|--------|-------------|-----|
| | | | |

### 2.4 Inventario Frontend

#### Types
| Type | Campos | Origen DTO | Archivo |
|------|--------|------------|---------|
| | | | |

#### Hooks
| Hook | Tipo | Endpoint | Retorno |
|------|------|----------|---------|
| | | | |

#### Components
| Component | Props | Hook usado | Ubicacion |
|-----------|-------|------------|-----------|
| | | | |

### 2.5 Matriz de Dependencias

```
[Diagrama de dependencias entre archivos]
```

### 2.6 Inconsistencias Detectadas

| # | Tipo | Descripcion | Severidad | Capa |
|---|------|-------------|-----------|------|
| 1 | | | ALTA/MEDIA/BAJA | |

### 2.7 Brechas Doc vs Codigo

| # | Documento | Codigo Real | Brecha |
|---|-----------|-------------|--------|
| 1 | | | |

### 2.8 Resultado F2
- **Estado:** PENDIENTE / COMPLETADO
- **Fecha:** -
- **Inconsistencias encontradas:** 0
- **Brechas documentacion:** 0

---

## FASE 3: PLANEACION BASADA EN ANALISIS

### 3.1 Objetivo
Disenar plan de accion para resolver inconsistencias.

### 3.2 Acciones Correctivas

| # | Accion | Capa | Impacto | Prioridad | Dependencias |
|---|--------|------|---------|-----------|--------------|
| 1 | | | | | |

### 3.3 Secuencia de Ejecucion

```
Accion 1 → Accion 2 → ... → Accion N
```

### 3.4 Recursos Requeridos

| Recurso | Tipo | Justificacion |
|---------|------|---------------|
| @PERFIL_X | Agente | |

### 3.5 Criterios de Aceptacion

| # | Criterio | Metrica | Verificacion |
|---|----------|---------|--------------|
| 1 | | | |

### 3.6 Resultado F3
- **Estado:** PENDIENTE / COMPLETADO
- **Total acciones:** 0
- **Estimacion complejidad:** BAJA/MEDIA/ALTA

---

## FASE 4: VALIDACION DE PLANEACION

### 4.1 Objetivo
Verificar que el plan cubre todos los requisitos.

### 4.2 Checklist de Cobertura

| Item Analisis (F2) | Cubierto en Plan (F3) | Estado |
|--------------------|----------------------|--------|
| | | [ ] |

### 4.3 Validacion de Dependencias

| Archivo a Modificar | Archivos Dependientes | Impacto Validado |
|--------------------|----------------------|------------------|
| | | [ ] |

### 4.4 Riesgos Identificados

| # | Riesgo | Probabilidad | Impacto | Mitigacion |
|---|--------|--------------|---------|------------|
| 1 | | | | |

### 4.5 Resultado F4
- **Estado:** PENDIENTE / COMPLETADO
- **Cobertura:** 0%
- **Riesgos:** 0

---

## FASE 5: REFINAMIENTO DEL PLAN

### 5.1 Objetivo
Ajustar plan basado en validacion F4.

### 5.2 Changelog de Ajustes

| # | Item Original | Ajuste | Justificacion |
|---|---------------|--------|---------------|
| 1 | | | |

### 5.3 Plan Refinado Final

[Resumen del plan final con todos los ajustes incorporados]

### 5.4 Aprobacion
- **Aprobado por:** {AGENTE/USUARIO}
- **Fecha:** -
- **Observaciones:** -

### 5.5 Resultado F5
- **Estado:** PENDIENTE / COMPLETADO
- **Ajustes realizados:** 0

---

## FASE 6: EJECUCION DEL PLAN

### 6.1 Objetivo
Implementar las acciones definidas.

### 6.2 Bitacora de Ejecucion

| # | Accion | Inicio | Fin | Agente | Resultado |
|---|--------|--------|-----|--------|-----------|
| 1 | | | | | |

### 6.3 Archivos Modificados

| Archivo | Tipo Cambio | Commit | Verificado |
|---------|-------------|--------|------------|
| | | | [ ] |

### 6.4 Tests Ejecutados

| Test | Tipo | Resultado | Coverage |
|------|------|-----------|----------|
| | | | |

### 6.5 Documentacion Actualizada

| Documento | Cambio | Estado |
|-----------|--------|--------|
| | | [ ] |

### 6.6 Resultado F6
- **Estado:** PENDIENTE / COMPLETADO
- **Acciones ejecutadas:** 0/0
- **Tests pasados:** 0/0

---

## FASE 7: VALIDACION DE EJECUCION

### 7.1 Objetivo
Verificar que la ejecucion cumplio criterios de aceptacion.

### 7.2 Checklist de Criterios de Aceptacion

| # | Criterio | Cumplido | Evidencia |
|---|----------|----------|-----------|
| 1 | | [ ] | |

### 7.3 Comparacion ANTES vs DESPUES

| Aspecto | ANTES | DESPUES | Mejora |
|---------|-------|---------|--------|
| | | | |

### 7.4 Validacion de Integridad entre Capas

| Integracion | Estado | Notas |
|-------------|--------|-------|
| DDL ↔ Entity | [ ] | |
| Entity ↔ DTO | [ ] | |
| DTO ↔ Type | [ ] | |
| Route ↔ API Client | [ ] | |

### 7.5 Tests de Regresion

| Suite | Total | Pasados | Fallidos |
|-------|-------|---------|----------|
| | | | |

### 7.6 Aprobacion Final
- **Aprobado por:** {AGENTE/USUARIO}
- **Fecha:** -
- **Estado final:** APROBADO / RECHAZADO / CON_OBSERVACIONES

### 7.7 Resultado F7
- **Estado:** PENDIENTE / COMPLETADO
- **Criterios cumplidos:** 0/0
- **Tarea cerrada:** [ ]

---

## RESUMEN DE TAREA

| Fase | Estado | Fecha | Duracion |
|------|--------|-------|----------|
| F1 | - | - | - |
| F2 | - | - | - |
| F3 | - | - | - |
| F4 | - | - | - |
| F5 | - | - | - |
| F6 | - | - | - |
| F7 | - | - | - |

**Estado Global:** PENDIENTE
**Observaciones finales:** -

---

## ANEXOS

### A1. Archivos Relacionados
- F1: `F1-ANALISIS-INICIAL-{MODULO}-{FECHA}.md`
- F2: `F2-ANALISIS-DETALLADO-{MODULO}-{FECHA}.md`
- F3: `F3-PLAN-DETALLADO-{MODULO}-{FECHA}.md`
- F4: `F4-VALIDACION-PLAN-{MODULO}-{FECHA}.md`
- F5: `F5-REFINAMIENTO-PLAN-{MODULO}-{FECHA}.md`
- F6: `F6-REPORTE-EJECUCION-{MODULO}-{FECHA}.md`
- F7: `F7-VALIDACION-EJECUCION-{MODULO}-{FECHA}.md`

### A2. Directivas SIMCO Aplicadas
- @TAREA
- @CAPVED
- @SYNC_BD
- @ALINEACION

---

**Template version:** 1.0.0
**Creado:** 2026-01-10
**Basado en:** PLAN-MAESTRO-ANALISIS-INTEGRACIONES-GAMILIT.md
