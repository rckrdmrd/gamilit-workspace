# CHECKLIST-RECOVERY.md

> **Sistema:** NEXUS v4.1
> **Versión:** 1.0.0
> **Fecha:** 2026-01-24
> **Alias:** @DEF_CHK_RECOVERY

---

## PROPÓSITO

Checklist para verificar recuperación exitosa de sesión después de compactación, cambio de sesión, o handoff entre agentes.

---

## PRE-RECOVERY

### Identificación de Fuente
- [ ] Determinar escenario: compactación / nueva sesión / handoff / error
- [ ] Identificar proyecto de trabajo
- [ ] Localizar fuente de recovery:
  - [ ] PROXIMA-ACCION.md (preferido)
  - [ ] Último CHECKPOINT-*.yml
  - [ ] SESSION-STATE.yml
  - [ ] HANDOFF-CONTRACT.md

### Verificación de Fuente
- [ ] Archivo de recovery existe
- [ ] Archivo es legible (no corrupto)
- [ ] Timestamp es reciente (< 24 horas idealmente)

---

## CARGA DE CONTEXTO

### Nivel L0 (Sistema) - OBLIGATORIO
- [ ] CLAUDE.md cargado y leído
- [ ] SIMCO-TAREA.md disponible
- [ ] Aliases del workspace conocidos

### Nivel L1 (Proyecto) - SI APLICA
- [ ] CONTEXTO-PROYECTO.md cargado (si existe)
- [ ] PROXIMA-ACCION.md leído
- [ ] Variables de proyecto conocidas:
  - [ ] Nombre del proyecto
  - [ ] Path del proyecto
  - [ ] Base de datos asociada (si aplica)

### Verificación de Tokens
- [ ] Tokens usados en carga: _______ (objetivo: < 8500)
- [ ] Tokens disponibles: _______ (objetivo: > 11500)

---

## RESTAURACIÓN DE ESTADO

### Estado de Tarea
- [ ] Tarea activa identificada: TASK-_______________
- [ ] Fase CAPVED conocida: [ C | A | P | V | E | D ]
- [ ] Subtarea actual: _______________________________
- [ ] Progreso: ___/___

### Decisiones Previas
- [ ] DECISIONES-SESION.yml localizado (si existe)
- [ ] Decisiones listadas y entendidas:
  - [ ] DEC-001: _________________________________
  - [ ] DEC-002: _________________________________
  - [ ] DEC-003: _________________________________
- [ ] Confirmación: NO re-evaluaré decisiones ya tomadas

### Archivos Relevantes
- [ ] Lista de archivos modificados conocida
- [ ] Último archivo modificado: _______________________
- [ ] Archivos críticos para próxima acción identificados

---

## VALIDACIÓN

### Estado del Repositorio
- [ ] `git status` ejecutado
- [ ] Working tree clean: [ Sí | No - detallar ]
- [ ] No hay conflictos de merge
- [ ] Branch correcto: _______________________________

### Integridad de Archivos
- [ ] Archivos modificados reportados en checkpoint existen
- [ ] No hay archivos truncados o corruptos
- [ ] Permisos de archivos correctos

### Coherencia de Estado
- [ ] Tarea en orchestration/tareas/ tiene carpeta
- [ ] METADATA.yml de tarea existe
- [ ] Estado reportado es consistente con realidad

---

## PREPARACIÓN PARA CONTINUAR

### Contexto L2 (Dominio)
- [ ] Dominio necesario identificado: [ DDL | Backend | Frontend | Docs | Otro ]
- [ ] SIMCO del dominio cargado (si necesario)
- [ ] Inventario del dominio disponible (si necesario)

### Próxima Acción
- [ ] Próxima acción leída y entendida
- [ ] Próxima acción es clara y accionable
- [ ] No hay bloqueos conocidos que impidan continuar:
  - [ ] Sin bloqueos
  - [ ] Bloqueos existentes: ________________________

### Confirmación Final
- [ ] Estoy listo para ejecutar la próxima acción
- [ ] Tengo contexto suficiente para continuar
- [ ] Si necesito más contexto, sé dónde buscarlo

---

## POST-RECOVERY

### Registro
- [ ] Hora de inicio de recovery: _________
- [ ] Hora de finalización: _________
- [ ] Tiempo total: _________ (objetivo: < 3 min)

### Métricas
- [ ] Recovery exitoso: [ Sí | No ]
- [ ] Información perdida estimada: _______% (objetivo: < 10%)
- [ ] Decisiones re-tomadas: _______ (objetivo: 0)

### Acciones Correctivas (si aplica)
- [ ] Si recovery falló, documentar razón: _____________
- [ ] Si información se perdió, documentar qué: ________
- [ ] Mejoras sugeridas para próximo recovery: _________

---

## QUICK CHECKLIST (VERSIÓN RÁPIDA)

Para recovery rápido, verificar solo estos items críticos:

```
□ PROXIMA-ACCION.md o checkpoint localizado
□ CLAUDE.md cargado
□ Tarea y fase CAPVED conocidas
□ Decisiones previas leídas (no re-evaluar)
□ Próxima acción clara
□ git status clean
□ Listo para continuar
```

**Tiempo objetivo versión rápida: < 2 minutos**

---

## REFERENCIAS

- **Protocolo completo:** @DEF_RECOVERY
- **Checkpoint:** @DEF_CHECKPOINT
- **Próxima Acción:** @DEF_SCHEMA_PROXIMA

---

*Checklist NEXUS v4.1 - Recovery de Sesión*
