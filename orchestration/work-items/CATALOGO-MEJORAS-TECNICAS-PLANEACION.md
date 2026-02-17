# Catalogo de Mejoras Tecnicas para Planeacion

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Objetivo

Definir mejoras tecnicas estandarizables y su nivel correcto de aterrizaje (`EPIC`, `US`, `TASK`) para asegurar trazabilidad y ejecucion consistente.

---

## 1) Catalogo de mejoras

| Codigo | Mejora | Categoria | Nivel por defecto | Evidencia esperada |
|--------|--------|-----------|-------------------|--------------------|
| IMP-DP-001 | Repository pattern en dominios con persistencia compleja | Patron de diseño | EPIC + TASK | ADR + task backend |
| IMP-DP-002 | Value Objects para reglas de dominio criticas | Patron de diseño | US + TASK | criterio AC + unit tests |
| IMP-DP-003 | Jerarquia de errores de dominio | Calidad backend | EPIC + TASK | convencion de errores + mapping HTTP |
| IMP-ARCH-001 | Clean Architecture pragmatica por modulo | Arquitectura | EPIC | ADR + plan por capas |
| IMP-STD-001 | Aplicacion obligatoria de estandares de codigo | Estandar | TASK | checklist y referencias |
| IMP-STD-002 | Quality gates build/lint/test por tarea | Calidad | TASK | evidencia en validacion |
| IMP-SKILL-001 | Uso de skills SIMCO por tipo de trabajo | Operacion | US + TASK | `skills_applied` documentado |
| IMP-SYNC-001 | Coherencia DDL -> BE -> FE -> Docs | Integracion | US + TASK | trazabilidad completa |
| IMP-OBS-001 | Observabilidad minima en servicios criticos | Buenas practicas | US + TASK | logs/metrics/alerts |

---

## 2) Regla de aplicacion por nivel

### EPIC (macro)

Usar cuando la mejora:

- afecta multiples modulos o multiples flujos,
- requiere decision de arquitectura o ADR,
- implica cambio de estandar transversal.

Campos obligatorios:

- `related_adrs`
- `standards_applied`
- `design_patterns`
- `quality_gates`

### US (valor funcional)

Usar cuando la mejora:

- afecta una capacidad funcional delimitada,
- cambia comportamiento observable o criterio de aceptacion,
- requiere skill especializado para su implementacion.

Campos obligatorios:

- `acceptance_criteria` vinculados a mejora
- `skills_applied`
- `traceability.requirements`

### TASK/SUBTASK (ejecucion tecnica)

Usar cuando la mejora:

- es concreta por capa (DB/Backend/Frontend/Test),
- tiene validacion tecnica verificable,
- se puede completar en una unidad de trabajo acotada.

Campos obligatorios:

- `standards_applied`
- `related_adrs`
- `skills_applied`
- `quality_gates`

---

## 3) Matriz de decision de complejidad

| Complejidad | Criterio | Item recomendado |
|-------------|----------|------------------|
| Alta | Cambia arquitectura o varios modulos | EPIC |
| Media | Cambia flujo funcional principal | US |
| Baja | Cambio tecnico puntual por capa | TASK/SUBTASK |

---

## 4) Integracion con backlog

Las brechas detectadas en `MATRIZ-BRECHAS-TRAZABILIDAD-2026-02-17.md` se aterrizan como items `TRZ-*` en:

- `orchestration/scrum/BACKLOG.yml`
- `orchestration/scrum/BACKLOG-MAPPING.yml`

---

## 5) Referencias

- `docs/40-standards/`
- `orchestration/inventarios/SKILLS-REGISTRY.yml`
- `docs/30-ux-ui/flujos/MATRIZ-BRECHAS-TRAZABILIDAD-2026-02-17.md`
