# PROTOCOLO-HANDOFF-SUBAGENTE.md - Transferencia de Control Subagente a Orquestador

**Version:** 1.0.0
**Creado:** 2026-01-16
**Sistema:** SIMCO v3.8+

---

## Proposito

Definir el protocolo explicito de como un subagente transfiere el control y la informacion al orquestador para que este complete la Fase D (Documentacion) del ciclo CAPVED.

---

## Contexto

En el sistema SIMCO:
- **Orquestador:** Ejecuta ciclo CAPVED completo (C-A-P-V-E-D)
- **Subagente:** Solo ejecuta **Fase E** (Ejecucion) por delegacion

El subagente NO tiene contexto completo del proyecto, por lo tanto NO puede ejecutar Fase D de forma autonoma. Este protocolo define como transferir la informacion necesaria.

---

## Matriz de Responsabilidades

| Fase | Orquestador | Subagente |
|------|-------------|-----------|
| C - Contexto | SI | NO |
| A - Analisis | SI | NO |
| P - Planeacion | SI | NO |
| V - Validacion Pre | SI | NO |
| E - Ejecucion | DELEGA | **SI** |
| D - Documentacion | **SI** | NO (solo reporta) |

---

## Flujo de Handoff

```
┌─────────────────┐
│   ORQUESTADOR   │
│  (Fases C-A-P-V)│
└────────┬────────┘
         │
         │ DELEGA Fase E
         ▼
┌─────────────────┐
│   SUBAGENTE     │
│   (Fase E)      │
│                 │
│ 1. Implementa   │
│ 2. Valida build │
│ 3. Genera reporte│
└────────┬────────┘
         │
         │ HANDOFF: Reporte estructurado
         ▼
┌─────────────────┐
│   ORQUESTADOR   │
│   (Fase D)      │
│                 │
│ 1. Recibe reporte│
│ 2. Actualiza inv│
│ 3. Actualiza trazas│
│ 4. Registra lecciones│
└─────────────────┘
```

---

## Formato de Reporte del Subagente

El subagente DEBE reportar en este formato estructurado:

```yaml
# REPORTE DE SUBAGENTE - FASE E COMPLETADA

## Metadata
tarea_id: "{ID de la tarea}"
fecha: "{YYYY-MM-DD}"
duracion_estimada: "{minutos}"
estado: "COMPLETADO | PARCIAL | BLOQUEADO"

## Archivos Afectados
archivos_creados:
  - path: "{ruta/archivo.ext}"
    tipo: "tabla | entity | dto | service | controller | componente | hook | api"
    lineas: {numero}

archivos_modificados:
  - path: "{ruta/archivo.ext}"
    cambio: "{descripcion breve del cambio}"

archivos_eliminados:
  - path: "{ruta/archivo.ext}"
    razon: "{por que se elimino}"

## Validaciones Ejecutadas
build: "PASSED | FAILED"
lint: "PASSED | FAILED | WARNINGS"
tests: "PASSED | FAILED | SKIPPED | N/A"
errores_encontrados: "{lista si hay}"

## Dependencias Detectadas
objetos_que_importan_lo_creado:
  - "{archivo que importa}"
objetos_importados_por_lo_creado:
  - "{archivo que se importa}"

## Decisiones Tomadas
decisiones:
  - decision: "{que se decidio}"
    razon: "{por que}"
    alternativas_descartadas: "{si las hubo}"

## Siguiente Paso Sugerido
siguiente_accion: "{que deberia hacer el orquestador}"
contexto_adicional: "{notas para continuar}"

## Lecciones Aprendidas (si aplica)
lecciones:
  - aprendizaje: "{que se aprendio}"
    aplicacion_futura: "{cuando aplicar esto}"
```

---

## Responsabilidades del Subagente

### DEBE hacer:
1. **Implementar** la tarea delegada (Fase E)
2. **Validar** build y lint antes de reportar
3. **Documentar inline** (comentarios en codigo, JSDoc, TSDoc)
4. **Generar reporte** en formato estructurado
5. **Reportar dependencias** detectadas durante implementacion

### NO debe hacer:
1. Actualizar inventarios (responsabilidad del orquestador)
2. Actualizar trazas (responsabilidad del orquestador)
3. Crear ADRs (responsabilidad del orquestador)
4. Modificar PROXIMA-ACCION.md (responsabilidad del orquestador)
5. Tomar decisiones arquitectonicas sin consultar

---

## Responsabilidades del Orquestador Post-Handoff

### Al recibir reporte del subagente:

```
[ ] 1. Verificar estado del reporte
      - Si COMPLETADO: continuar con Fase D
      - Si PARCIAL: evaluar si continuar o re-delegar
      - Si BLOQUEADO: resolver bloqueo y re-delegar

[ ] 2. Ejecutar CHECKLIST-FASE-D.md completo
      - Usar informacion del reporte para llenar campos

[ ] 3. Actualizar inventarios correspondientes
      - DATABASE_INVENTORY.yml (si cambios BD)
      - BACKEND_INVENTORY.yml (si cambios BE)
      - FRONTEND_INVENTORY.yml (si cambios FE)

[ ] 4. Documentar relaciones entre objetos
      - Usar "Dependencias Detectadas" del reporte
      - Ver SIMCO-RELACIONES-OBJETOS.md

[ ] 5. Actualizar trazas
      - Agregar entrada con archivos del reporte
      - Incluir estado y notas

[ ] 6. Crear ADR si hay decisiones arquitectonicas
      - Usar "Decisiones Tomadas" del reporte

[ ] 7. Registrar lecciones aprendidas
      - Usar "Lecciones Aprendidas" del reporte
      - Consolidar en orchestration/retrospectivas/

[ ] 8. Actualizar PROXIMA-ACCION.md
      - Usar "Siguiente Paso Sugerido" del reporte
```

---

## Casos Especiales

### Caso 1: Subagente encuentra bloqueo
```yaml
# Reporte con estado BLOQUEADO
estado: "BLOQUEADO"
bloqueo:
  tipo: "DEPENDENCIA | DECISION | ERROR | ACCESO"
  descripcion: "{que bloquea}"
  resolucion_sugerida: "{como resolverlo}"

# Accion del orquestador:
# 1. Evaluar bloqueo
# 2. Resolver o escalar
# 3. Re-delegar con contexto adicional
```

### Caso 2: Subagente completa parcialmente
```yaml
# Reporte con estado PARCIAL
estado: "PARCIAL"
completado:
  - "{lo que si se hizo}"
pendiente:
  - "{lo que falta}"
razon_parcial: "{por que no se completo}"

# Accion del orquestador:
# 1. Evaluar si continuar en nueva delegacion
# 2. O completar directamente
# 3. Documentar lo completado en Fase D
```

### Caso 3: Multiples subagentes en paralelo
```yaml
# Cuando se delega a varios subagentes:
# 1. Esperar todos los reportes
# 2. Consolidar en un solo Fase D
# 3. Verificar no hay conflictos entre cambios
# 4. Resolver conflictos si los hay
# 5. Actualizar inventarios una sola vez con todos los cambios
```

---

## Template de Delegacion (Orquestador → Subagente)

```markdown
## DELEGACION DE TAREA

**Tarea ID:** {id}
**Descripcion:** {que hacer}
**Tipo:** {crear | modificar | eliminar | refactorizar}

### Contexto Necesario
- Proyecto: {nombre}
- Ubicacion: {ruta base}
- Archivos relacionados: {lista}

### Requisitos Especificos
1. {requisito 1}
2. {requisito 2}

### Restricciones
- NO modificar: {archivos protegidos}
- Mantener compatibilidad con: {sistemas}

### Validaciones Requeridas
- [ ] Build debe pasar
- [ ] Lint debe pasar
- [ ] {otras validaciones}

### Al Completar
Reportar usando formato PROTOCOLO-HANDOFF-SUBAGENTE.md
```

---

## Metricas de Calidad del Handoff

| Metrica | Criterio |
|---------|----------|
| Completitud del reporte | 100% campos llenados |
| Precision de archivos | Rutas exactas y existentes |
| Validaciones ejecutadas | Build + Lint minimo |
| Dependencias documentadas | Todas las detectadas |
| Tiempo de handoff | < 5 minutos |

---

## Anti-patrones a Evitar

### Subagente:
- Reportar sin validar build/lint
- Omitir archivos creados/modificados
- No documentar decisiones tomadas
- Asumir que orquestador tiene contexto

### Orquestador:
- Ignorar secciones del reporte
- No actualizar inventarios
- No registrar lecciones aprendidas
- Re-delegar sin resolver bloqueos

---

## Referencias

| Documento | Uso |
|-----------|-----|
| SIMCO-SUBAGENTE.md | Protocolo completo de subagentes |
| CHECKLIST-FASE-D.md | Checklist post-handoff |
| SIMCO-DOCUMENTAR.md | Detalle de documentacion |
| SIMCO-INVENTARIOS.md | Formato de inventarios |

---

**Sistema:** SIMCO v3.8+ con SAAD
**Ultima actualizacion:** 2026-01-16
