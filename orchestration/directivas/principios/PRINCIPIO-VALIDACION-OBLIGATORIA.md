# PRINCIPIO: VALIDACIÓN OBLIGATORIA

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Tipo:** Principio Fundamental - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los agentes sin excepción

---

## DECLARACIÓN DEL PRINCIPIO

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║       BUILD PASA + LINT PASA = REQUISITO MÍNIMO                      ║
║                                                                       ║
║  "Código que no compila NO está terminado."                          ║
║  "Tarea con errores NO está completada."                             ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## REGLA INQUEBRANTABLE

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   NINGUNA tarea se marca como COMPLETADA si:                        │
│                                                                      │
│   • Build falla                                                      │
│   • Lint tiene errores críticos                                      │
│   • Carga limpia falla (para DDL)                                   │
│   • Tests fallan (si existen)                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## VALIDACIONES POR CAPA

### Database (DDL)
```bash
# OBLIGATORIO
cd @DB_SCRIPTS
./{RECREATE_CMD}           # Carga limpia DEBE pasar

# Verificación
psql -d {DB_NAME} -c "\dt {schema}.*"   # Tablas creadas
psql -d {DB_NAME} -c "\di {schema}.*"   # Índices creados
```

### Backend (NestJS)
```bash
# OBLIGATORIO
cd @BACKEND_ROOT
npm run build              # DEBE pasar
npm run lint               # DEBE pasar

# Adicional
npm run test               # Si hay tests, DEBEN pasar
npm run start:dev          # DEBE iniciar sin errores
```

### Frontend (React)
```bash
# OBLIGATORIO
cd @FRONTEND_ROOT
npm run build              # DEBE pasar
npm run lint               # DEBE pasar

# Adicional
npm run typecheck          # DEBE pasar
npm run dev                # DEBE iniciar sin errores
```

---

## FLUJO DE VALIDACIÓN

```
TERMINAR IMPLEMENTACIÓN
         │
         ▼
┌─────────────────────┐
│    EJECUTAR BUILD   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐       ┌─────────────────────┐
│   ¿BUILD PASA?      │──NO──►│ CORREGIR ERRORES    │
└──────────┬──────────┘       └──────────┬──────────┘
           │ SÍ                          │
           │◄────────────────────────────┘
           ▼
┌─────────────────────┐       ┌─────────────────────┐
│   EJECUTAR LINT     │──NO──►│ CORREGIR ERRORES    │
│   ¿LINT PASA?       │       └──────────┬──────────┘
└──────────┬──────────┘                  │
           │ SÍ                          │
           │◄────────────────────────────┘
           ▼
┌─────────────────────┐       ┌─────────────────────┐
│   EJECUTAR TESTS    │──NO──►│ CORREGIR TESTS      │
│   ¿TESTS PASAN?     │       └──────────┬──────────┘
└──────────┬──────────┘                  │
           │ SÍ                          │
           │◄────────────────────────────┘
           ▼
┌─────────────────────┐
│  ✅ TAREA COMPLETA  │
└─────────────────────┘
```

---

## QUÉ HACER CUANDO FALLA

### Build Falla
```markdown
1. NO marcar tarea como completada
2. Leer el error completo
3. Identificar archivo y línea
4. Corregir el error
5. Volver a ejecutar build
6. Repetir hasta que pase
```

### Lint Falla (Errores)
```markdown
1. NO marcar tarea como completada
2. Distinguir errores de warnings
   - Errores (error): DEBEN corregirse
   - Warnings (warn): Pueden ignorarse (pero mejor corregir)
3. Corregir todos los errores
4. Volver a ejecutar lint
5. Repetir hasta que pase
```

### Carga Limpia Falla (DDL)
```markdown
1. NO marcar tarea como completada
2. NO ejecutar fix manual en BD
3. Leer el error de PostgreSQL
4. Corregir archivo DDL
5. Volver a ejecutar carga limpia completa
6. Repetir hasta que pase
```

### Tests Fallan
```markdown
1. NO marcar tarea como completada
2. Identificar test que falla
3. Determinar si:
   a. El código tiene bug → Corregir código
   b. El test está desactualizado → Actualizar test
4. Volver a ejecutar tests
5. Repetir hasta que pasen
```

---

## EXCEPCIONES (MUY LIMITADAS)

```yaml
Puede marcarse completa SIN tests:
  - Si no existen tests para el módulo (pero build y lint DEBEN pasar)
  - Se documenta: "Tests pendientes de crear"

Puede tener warnings de lint:
  - Si son warnings menores (no errores)
  - Se documenta: "N warnings de lint pendientes"

NUNCA puede marcarse completa:
  - Con build fallando
  - Con errores de lint
  - Con carga limpia fallando
```

---

## REPORTE DE VALIDACIÓN

En toda entrega incluir:

```markdown
## Validaciones

| Validación | Comando | Resultado |
|------------|---------|-----------|
| Build | `npm run build` | ✅ Pasa / ❌ Falla |
| Lint | `npm run lint` | ✅ Pasa / ⚠️ Warnings / ❌ Errores |
| Tests | `npm run test` | ✅ Pasa / ❌ Falla / ⏭️ N/A |
| Carga Limpia | `./{RECREATE_CMD}` | ✅ Pasa / ❌ Falla / ⏭️ N/A |

**Estado:** ✅ Validaciones completas / ❌ Pendiente corrección
```

---

## CONSECUENCIAS DE IGNORAR

```
❌ Código que no compila entregado
   → Bloquea a otros agentes/desarrolladores

❌ Errores de lint ignorados
   → Código inconsistente, bugs potenciales

❌ Tests fallando ignorados
   → Regresiones, bugs en producción

❌ DDL con errores
   → BD inconsistente, datos corruptos
```

---

## CHECKLIST RÁPIDO

```
Antes de marcar CUALQUIER tarea como completada:

[ ] Build pasa sin errores
[ ] Lint pasa sin errores (warnings OK)
[ ] Tests pasan (si existen)
[ ] Carga limpia pasa (si es DDL)
[ ] Aplicación inicia correctamente
```

---

## REFERENCIAS SIMCO

- **@VALIDAR** - Proceso completo de validación
- **@OP_DDL** - Validación específica de database
- **@OP_BACKEND** - Validación específica de backend
- **@OP_FRONTEND** - Validación específica de frontend

---

**Este principio es OBLIGATORIO y NO puede ser ignorado por ningún agente.**

---

## Ver tambien

- [ESTANDAR-TESTING](../../../docs/40-standards/ESTANDAR-TESTING.md) - Estandar de testing (unit, integration, e2e con Jest y Playwright)

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Principio Fundamental
