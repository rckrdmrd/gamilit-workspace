# SIMCO-IOC-CONTEXTO.md

**Sistema:** NEXUS v4.1
**Version:** 1.0.0
**Fecha:** 2026-01-24

---

## 1. Principio IoC (Inversion de Control)

**Regla Fundamental:**
```
El AGENTE no decide que contexto cargar.
El SISTEMA (CONTEXT-MAP) resuelve automaticamente.
```

---

## 2. Problema que Resuelve

### ANTES (Contexto dirigido por agente)

```
Agente: "Voy a cargar todo lo que creo necesario"
     │
     ├── Carga CLAUDE.md (4000 tokens)
     ├── Carga SIMCO-TAREA.md (1500 tokens)
     ├── Carga SIMCO-DDL.md (1200 tokens)
     ├── Carga SIMCO-BACKEND.md (1200 tokens) ← Innecesario si es tarea DDL
     ├── Carga SIMCO-FRONTEND.md (1200 tokens) ← Innecesario
     ├── Carga inventarios varios (3000 tokens)
     ├── Carga archivos "por si acaso" (2000 tokens)
     │
     └── RESULTADO: 14,100 tokens usados
                    Solo 8,000 eran necesarios
                    → Compactacion forzada
```

### DESPUES (Contexto dirigido por sistema)

```
Sistema: "Detecto keywords, resuelvo contexto minimo"
     │
     ├── Detecta: "crear tabla users"
     ├── Keywords: [crear, tabla]
     ├── Dominio: DDL
     │
     └── Resolucion automatica:
         ├── L0: CLAUDE.md (4000)
         ├── L2: SIMCO-DDL.md (1200)
         ├── L2: DATABASE_INVENTORY.yml (1500)
         ├── L3: tabla_relacionada.sql (300)
         │
         └── RESULTADO: 7,000 tokens usados
                        Dentro de presupuesto
                        Sin compactacion
```

---

## 3. Implementacion

### 3.1 Resolucion por Keywords

```yaml
# CONTEXT-MAP.yml define:
resoluciones:
  crear_tabla:
    dominio: ddl
    keywords: [crear, tabla, column, constraint]
    cargar:
      - SIMCO-DDL.md
      - SIMCO-CREAR.md
      - DATABASE_INVENTORY.yml
```

### 3.2 El Agente NO Debe

```
✗ Decidir arbitrariamente que archivos cargar
✗ Cargar archivos "por si acaso"
✗ Ignorar presupuesto de tokens
✗ Cargar contexto de dominios no relacionados
✗ Mantener contexto obsoleto
```

### 3.3 El Agente SI Debe

```
✓ Seguir resolucion de CONTEXT-MAP
✓ Respetar presupuesto de tokens
✓ Purgar contexto cuando trigger lo indique
✓ Actualizar PROXIMA-ACCION al cambiar de tarea
✓ Solicitar contexto adicional explicitamente si necesario
```

---

## 4. Triggers de Purga

El sistema decide cuando purgar contexto, no el agente.

| Trigger | Evento | Accion |
|---------|--------|--------|
| POST_SUBTAREA | Subtarea completada | Purgar L3 |
| CAMBIO_DOMINIO | Pasar de DDL a Backend | Purgar L2, cargar nuevo |
| CAMBIO_PROYECTO | Pasar de un proyecto a otro | Purgar L1+L2+L3 |
| UMBRAL_TOKENS | >19,500 tokens | Purgar L3, evaluar L2 |
| FIN_SESION | Usuario cierra sesion | Guardar PROXIMA-ACCION |

---

## 5. Flujo de Decision

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO IoC DE CONTEXTO                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Agente recibe tarea                                            │
│          │                                                          │
│          ▼                                                          │
│  2. Sistema extrae keywords de la tarea                            │
│          │                                                          │
│          ▼                                                          │
│  3. CONTEXT-MAP resuelve dominio + archivos                        │
│          │                                                          │
│          ▼                                                          │
│  4. Sistema verifica presupuesto de tokens                         │
│          │                                                          │
│          ├── OK → Cargar contexto resuelto                         │
│          │                                                          │
│          └── Excede → Purgar L3/L2 primero, luego cargar           │
│                                                                     │
│  5. Agente trabaja con contexto minimo                             │
│          │                                                          │
│          ▼                                                          │
│  6. Trigger de evento → Sistema decide purgar o mantener           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Casos Especiales

### 6.1 Agente Necesita Contexto Adicional

```
Agente: "Necesito ver archivo X que no esta en mi contexto"
     │
     ├── Solicita explicitamente: "Leer archivo X"
     ├── Sistema verifica presupuesto
     ├── Si OK: Carga archivo a L3
     └── Si excede: Sugiere purgar algo primero
```

### 6.2 Tarea Multi-Dominio

```
Tarea: "Crear tabla users y entity User"
     │
     ├── Keywords: [tabla, entity]
     ├── Dominios: [DDL, Backend]
     │
     └── Resolucion:
         ├── Cargar SIMCO-DDL.md
         ├── Cargar SIMCO-BACKEND.md
         └── Presupuesto: L2 = 4000 (compartido)
```

### 6.3 Compactacion Detectada

```
Sistema detecta compactacion inminente
     │
     ├── Guardar PROXIMA-ACCION.md automaticamente
     ├── Purgar L3 completamente
     ├── Evaluar purga de L2
     └── Preservar L0 y L1 siempre
```

---

## 7. Para Subagentes

Los subagentes reciben contexto pre-definido, no lo eligen.

```
Orquestador crea TEMPLATE-CONTEXTO-SUBAGENTE:
├── Lista explicita de archivos a cargar
├── Presupuesto asignado
└── Prohibicion de expandir

Subagente:
├── Carga SOLO lo listado
├── NO explora mas alla
└── Reporta si falta algo (no lo carga solo)
```

---

## 8. Metricas de Exito

| Metrica | Antes (sin IoC) | Despues (con IoC) |
|---------|-----------------|-------------------|
| Tokens promedio/sesion | 18,000+ | <15,000 |
| Compactaciones/sesion | 2-3 | <1 |
| Contexto innecesario | 30%+ | <10% |
| Tiempo de carga inicial | Lento | Rapido |

---

## 9. Checklist de Cumplimiento

- [ ] No cargo archivos sin que CONTEXT-MAP lo indique
- [ ] Respeto presupuesto de tokens por nivel
- [ ] Purgo contexto cuando trigger lo indica
- [ ] No mantengo contexto de tareas anteriores
- [ ] Actualizo PROXIMA-ACCION antes de cerrar

---

## 10. Umbrales de Tokens (Detalle)

| Umbral | Tokens | % | Acción |
|--------|--------|---|--------|
| NORMAL | < 160,000 | < 80% | Operación normal |
| ALERTA | 160,000 | 80% | Evaluar purga L3 |
| CRITICO | 180,000 | 90% | Purgar L3, evaluar L2 |
| EMERGENCIA | 190,000 | 95% | Guardar PROXIMA-ACCION, no iniciar operaciones nuevas |

**Ver:** `@MEMORIA-TOKENS` para estrategias detalladas de gestión.

---

## 11. Referencias

- `@NEXUS` - SIMCO-CONTEXT-MANAGEMENT-V2.md
- `@CONTEXT-MAP` - orchestration/CONTEXT-MAP.yml
- `@PROXIMA-ACCION` - Template de checkpoint
- `@BOOTLOADER` - Protocolo de arranque
- `@MEMORIA-TOKENS` - SIMCO-MEMORIA-TOKENS.md (gestión de tokens)

---

*SIMCO-IOC-CONTEXTO.md - Inversion de Control para Contexto*
*Complementa NEXUS v4.1*
