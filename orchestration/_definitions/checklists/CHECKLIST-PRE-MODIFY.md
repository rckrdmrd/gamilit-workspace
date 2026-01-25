# CHECKLIST: PRE-MODIFY

**Versión:** 1.0.0
**Alias:** @DEF_CHK_MODIFY
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0

---

## PROPÓSITO

Verificaciones obligatorias ANTES de modificar cualquier archivo existente.

---

## CHECKLIST

### 1. Análisis de Dependientes

```markdown
[ ] Identificar archivos que IMPORTAN el archivo a modificar
[ ] Listar todos los dependientes encontrados
[ ] Evaluar impacto del cambio en cada dependiente
[ ] Clasificar cambio como: aditivo | modificación | breaking
```

### 2. Análisis de Dependencias

```markdown
[ ] Identificar archivos que el archivo IMPORTA
[ ] Verificar que las dependencias siguen siendo válidas post-cambio
[ ] Identificar si el cambio requiere actualizar dependencias
```

### 3. Evaluación de Impacto

```markdown
[ ] Determinar alcance: local | módulo | proyecto | workspace
[ ] Identificar capas afectadas: DDL | BE | FE
[ ] Evaluar si cambio requiere migración de datos
[ ] Evaluar si cambio rompe compatibilidad hacia atrás
```

### 4. Plan de Actualización

```markdown
[ ] Si hay dependientes afectados: incluir en plan de subtareas
[ ] Ordenar actualizaciones por dependencia (de más interno a más externo)
[ ] Identificar tests que deben actualizarse
[ ] Identificar documentación que debe actualizarse
```

### 5. Verificación de Seguridad

```markdown
[ ] Cambio no introduce vulnerabilidades de seguridad
[ ] Cambio no expone datos sensibles
[ ] Cambio mantiene validaciones existentes
[ ] Si es API: cambio no rompe contratos existentes
```

### 6. Estrategia de Rollback

```markdown
[ ] Identificar cómo revertir el cambio si falla
[ ] Confirmar que existe backup o commit previo
[ ] Documentar pasos de rollback si son complejos
```

---

## CLASIFICACIÓN DE CAMBIOS

### Cambio Aditivo (BAJO RIESGO)
```yaml
caracteristicas:
  - Agregar campo/método nuevo
  - Agregar endpoint nuevo
  - No modifica comportamiento existente
acciones:
  - Actualizar dependientes que usarán lo nuevo
  - Validación estándar
```

### Cambio de Modificación (MEDIO RIESGO)
```yaml
caracteristicas:
  - Cambiar implementación interna
  - Cambiar tipos de datos
  - Renombrar elementos
acciones:
  - Actualizar TODOS los dependientes
  - Validación exhaustiva
  - Pruebas de regresión
```

### Cambio Breaking (ALTO RIESGO)
```yaml
caracteristicas:
  - Eliminar campo/método
  - Cambiar firma de función/endpoint
  - Cambiar comportamiento de API
acciones:
  - DETENER y evaluar con Tech-Leader
  - Plan de migración obligatorio
  - Comunicar a equipos afectados
```

---

## DECISIÓN

```yaml
SI_PASA_TODO:
  accion: "Proceder con modificación"
  siguiente: "Ejecutar SIMCO-MODIFICAR.md"
  incluir: "Actualización de dependientes en plan"

SI_CAMBIO_BREAKING:
  accion: "ESCALAR a Tech-Leader"
  documentar:
    - Razón del cambio breaking
    - Alternativas evaluadas
    - Plan de migración propuesto

SI_IMPACTO_ALTO:
  accion: "Solicitar revisión antes de proceder"
  documentar:
    - Alcance del impacto
    - Dependientes afectados
    - Plan de actualización
```

---

## USO

```yaml
# En perfil de agente:
antes_de_modificar:
  - Cargar: "@DEF_CHK_MODIFY"
  - Ejecutar: "Checklist completo"
  - Documentar: "Resultado en traza"
  - Si breaking: "Escalar antes de continuar"
```

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Checklist
