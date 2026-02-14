# PRINCIPIO: DOCUMENTACIÓN PRIMERO

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Tipo:** Principio Fundamental - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los agentes sin excepción

---

## DECLARACIÓN DEL PRINCIPIO

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║         DOCUMENTACIÓN PRIMERO, IMPLEMENTACIÓN DESPUÉS                 ║
║                                                                       ║
║  "Si no está documentado, no existe."                                 ║
║  "Si contradice la documentación, está mal."                          ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## REGLA EN 3 PASOS

```
PASO 1: ANTES DE IMPLEMENTAR
─────────────────────────────
Consultar docs/ para entender:
- ¿Qué dice la documentación sobre esto?
- ¿Hay especificaciones o diseños?
- ¿Hay ADRs relacionados?

PASO 2: SI HAY CAMBIO DE DISEÑO
─────────────────────────────
Actualizar docs/ PRIMERO:
- Documentar el nuevo diseño
- Crear ADR si es decisión arquitectónica
- Actualizar especificaciones

PASO 3: IMPLEMENTAR
─────────────────────────────
Solo entonces escribir código:
- Seguir lo documentado
- Referenciar docs/ en comentarios si aplica
```

---

## FLUJO VISUAL

```
┌─────────────────────┐
│    TAREA NUEVA      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ¿Consulté docs/?   │──── NO ────► CONSULTAR DOCS/ PRIMERO
└──────────┬──────────┘
           │ SÍ
           ▼
┌─────────────────────┐
│ ¿Hay contradicción? │──── SÍ ────► ACTUALIZAR DOCS/ PRIMERO
└──────────┬──────────┘
           │ NO
           ▼
┌─────────────────────┐
│ ¿Falta documentar?  │──── SÍ ────► DOCUMENTAR PRIMERO
└──────────┬──────────┘
           │ NO
           ▼
┌─────────────────────┐
│    IMPLEMENTAR      │
└─────────────────────┘
```

---

## DOCUMENTACIÓN A CONSULTAR

### Antes de CUALQUIER tarea:
```yaml
Obligatorio:
  - docs/00-vision-general/          # Visión y alcance
  - docs/95-guias-desarrollo/        # Estándares y convenciones
  - docs/90-adr/                     # Decisiones arquitectónicas

Si aplica:
  - docs/01-fase-*/                  # Especificaciones por fase
  - docs/modulos/{modulo}/           # Especificaciones del módulo
  - orchestration/inventarios/       # Estado actual del proyecto
```

### Para cada tipo de tarea:
```yaml
Database:
  - @GUIAS/database/ (si existe)
  - @ADR (decisiones de BD)

Backend:
  - @GUIAS_BE/DTO-CONVENTIONS.md
  - @GUIAS_BE/API-CONVENTIONS.md
  - @ADR

Frontend:
  - @GUIAS_FE/TYPES-CONVENTIONS.md
  - @GUIAS_FE/COMPONENT-PATTERNS.md
  - @ADR
```

---

## CUÁNDO ACTUALIZAR DOCS/ PRIMERO

| Situación | Acción |
|-----------|--------|
| Nueva feature no documentada | Documentar diseño antes de implementar |
| Cambio de arquitectura | Crear ADR antes de implementar |
| Contradicción docs/ vs realidad | Actualizar docs/ (si realidad es correcta) |
| Nueva convención | Documentar en guías antes de usar |
| Nuevo módulo/schema | Documentar estructura antes de crear |

---

## CUÁNDO NO APLICA

```yaml
Excepciones (no requiere actualizar docs/ primero):
  - Bug fixes menores (solo corrección, no cambio de diseño)
  - Refactors internos (misma funcionalidad)
  - Actualizaciones de dependencias
  - Corrección de typos en código

PERO siempre aplica:
  - Consultar docs/ para entender el contexto
  - Documentar en traza lo realizado
  - Actualizar inventarios si hay cambios estructurales
```

---

## CONSECUENCIAS DE IGNORAR ESTE PRINCIPIO

```
❌ Código que contradice documentación
   → Confusión, bugs, deuda técnica

❌ Features no documentadas
   → Nadie sabe qué hace ni por qué

❌ Implementar sin consultar docs/
   → Duplicados, inconsistencias, trabajo rehecho

❌ Cambiar arquitectura sin ADR
   → Decisiones perdidas, errores repetidos
```

---

## CHECKLIST RÁPIDO

```
Antes de escribir código:
[ ] Consulté docs/ relevantes
[ ] No hay contradicción con lo documentado
[ ] Si hay cambio de diseño, actualicé docs/ primero

Al terminar:
[ ] Código sigue lo documentado
[ ] Actualicé inventarios
[ ] Documenté en traza
```

---

## REFERENCIAS SIMCO

- **@DOCUMENTAR** - Cómo documentar correctamente
- **@VALIDAR** - Validación de coherencia docs/código
- **@BUSCAR** - Cómo encontrar documentación

---

**Este principio es OBLIGATORIO y NO puede ser ignorado por ningún agente.**

---

## Ver tambien

- [ESTANDAR-DOCUMENTACION](../../../docs/40-standards/ESTANDAR-DOCUMENTACION.md) - Estandar de formato y estructura para documentos del proyecto

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Principio Fundamental
