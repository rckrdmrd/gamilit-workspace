# SIMCO-MEMORIA-TOKENS.md

**Sistema:** SIMCO v4.3.0 + NEXUS v4.0
**Version:** 1.1.0
**Fecha:** 2026-01-24
**Actualizado:** 2026-01-24
**Extiende:** PRESUPUESTO-DINAMICO.yml (para cálculo adaptativo)

---

## 1. Propósito

Esta directiva define la estrategia de gestión de memoria y tokens para todos los agentes del sistema, optimizando el uso de contexto y previniendo compactaciones innecesarias.

---

## 2. Presupuesto de Tokens por Agente

> **NOTA:** Para presupuesto adaptativo por complejidad de tarea, ver `@PRESUPUESTO-DINAMICO`
> (orchestration/directivas/simco/PRESUPUESTO-DINAMICO.yml)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                      PRESUPUESTO DE TOKENS (BASE)                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   CLAUDE CODE (Opus 4.5)                                                  ║
║   ├── Límite sesión: 200,000 tokens                                      ║
║   ├── Alerta: 160,000 (80%)                                              ║
║   ├── Crítico: 180,000 (90%)                                             ║
║   └── Reserva compactación: 20,000 (10%)                                 ║
║                                                                           ║
║   GEMINI CLI / TRAE                                                       ║
║   ├── Sin límite de tokens Claude                                        ║
║   ├── Límite contexto: ~1M tokens (Gemini)                               ║
║   └── Recomendación: Mantener < 100K por tarea                           ║
║                                                                           ║
║   WINDSURF SWE                                                            ║
║   ├── Contexto limitado                                                   ║
║   ├── Prompt máximo: 50 líneas de código                                 ║
║   └── Sin persistencia entre tareas                                      ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Distribución de Tokens por Nivel NEXUS

### Presupuesto por Nivel (Claude Code)

| Nivel | Descripción | Tokens Máx | % del Total |
|-------|-------------|------------|-------------|
| L0 | Sistema (CLAUDE.md, BOOTLOADER) | 8,000 | 4% |
| L1 | Proyecto activo | 4,000 | 2% |
| L2 | Dominio (DDL/Backend/Frontend) | 6,000 | 3% |
| L3 | Tarea actual (dinámico) | 2,000 | 1% |
| **Subtotal Contexto** | | **20,000** | **10%** |
| **Disponible Trabajo** | | **180,000** | **90%** |

### Tokens Fijos vs Dinámicos

```yaml
tokens_fijos:
  CLAUDE.md: 4000          # Siempre cargado
  BOOTLOADER: 1000         # Al inicio de sesión
  CONTEXT-MAP.yml: 500     # Referencia rápida

tokens_dinamicos:
  directivas_simco: 800-1500   # Según dominio
  inventarios: 500-2000        # Según proyecto
  archivos_codigo: variable    # Según tarea

tokens_efimeros:
  resultados_busqueda: 0       # Purgar inmediatamente
  output_comandos: 500 max     # Resumir si excede
  errores_resueltos: 0         # Purgar al resolver
```

---

## 4. Estrategias de Optimización

### 4.1 Carga Diferida (Lazy Loading)

```
REGLA: No cargar hasta que se necesite

ANTES (eager loading):
├── Lee todos los inventarios al inicio
├── Carga todas las directivas SIMCO
└── Resultado: 15,000 tokens gastados sin usar

DESPUÉS (lazy loading):
├── Solo carga CLAUDE.md + BOOTLOADER
├── Resuelve contexto según keywords de tarea
└── Resultado: 5,000 tokens iniciales
```

### 4.2 Purga Proactiva

```
TRIGGERS DE PURGA AUTOMÁTICA:

Al completar subtarea:
├── Purgar L3 (archivos específicos de subtarea)
├── Mantener L2 si próxima subtarea es mismo dominio
└── Ejecutar: actualizar PROXIMA-ACCION.md

Al cambiar dominio:
├── Purgar L2 completo
├── Cargar nuevo dominio
└── Mantener L1 (mismo proyecto)

Al cambiar proyecto:
├── Purgar L1 + L2 + L3
├── Cargar BOOTLOADER de nuevo proyecto
└── Mantener solo L0
```

### 4.3 Compresión de Contexto

```
TÉCNICAS DE COMPRESIÓN:

1. Resumir resultados de comandos largos:
   ✗ Incluir 500 líneas de npm install output
   ✓ Resumir: "npm install completado, 0 vulnerabilidades"

2. Referencias en lugar de contenido completo:
   ✗ Copiar archivo entero de 200 líneas
   ✓ "Ver archivo X, función Y en líneas 45-60"

3. Eliminar contexto resuelto:
   ✗ Mantener error después de corregirlo
   ✓ Solo mantener: "Error corregido en línea X"
```

---

## 5. Gestión de Compactaciones

### 5.1 Prevención

```
UMBRALES DE ACCIÓN:

160,000 tokens (80%):
├── Alerta amarilla
├── Evaluar purga de L3
└── No cargar archivos grandes innecesarios

180,000 tokens (90%):
├── Alerta roja
├── Purgar L3 obligatorio
├── Evaluar purga de L2
└── Considerar delegar a agente externo

190,000 tokens (95%):
├── CRÍTICO
├── Guardar PROXIMA-ACCION.md inmediatamente
├── Completar operación actual
└── NO iniciar nuevas operaciones complejas
```

### 5.2 Preparación para Compactación

```
ANTES de compactación detectada:

1. GUARDAR estado actual:
   ├── Actualizar PROXIMA-ACCION.md
   ├── Commit y push cambios pendientes
   └── Documentar decisiones tomadas

2. PURGAR contexto prescindible:
   ├── Resultados de búsquedas
   ├── Outputs de comandos
   └── Errores ya resueltos

3. PRESERVAR información crítica:
   ├── Archivos en edición activa
   ├── Dependencias pendientes
   └── Bloqueos conocidos
```

### 5.3 Recuperación Post-Compactación

```
PROTOCOLO DE RECUPERACIÓN:

1. Leer PROXIMA-ACCION.md primero
2. Ejecutar BOOTLOADER del proyecto
3. Cargar solo contexto necesario para continuar
4. Verificar estado de git
5. Retomar desde punto guardado
```

---

## 6. Estrategias por Tipo de Tarea

### 6.1 Tareas de Análisis

```yaml
tokens_recomendados: 30,000 max
estrategia:
  - Cargar solo archivos relevantes
  - Usar subagentes para exploración
  - Resumir hallazgos progresivamente
  - Purgar archivos leídos después de analizar
```

### 6.2 Tareas de Implementación

```yaml
tokens_recomendados: 50,000 max
estrategia:
  - Mantener archivos en edición en contexto
  - Purgar dependencias después de verificar
  - Usar referencias para archivos grandes
  - Delegar subtareas atómicas a Windsurf
```

### 6.3 Tareas de Validación

```yaml
tokens_recomendados: 20,000 max
estrategia:
  - Solo cargar archivos modificados
  - Resumir resultados de build/lint
  - Purgar inmediatamente al aprobar/rechazar
```

### 6.4 Tareas Multi-Proyecto

```yaml
tokens_recomendados: 40,000 max por proyecto
estrategia:
  - Procesar un proyecto a la vez
  - Purgar contexto de proyecto anterior antes de siguiente
  - Usar mirrors para propagación (no cargar fuentes)
  - Documentar cambios en PROPAGATION-STATUS.yml
```

---

## 7. Reglas para Subagentes

```
╔══════════════════════════════════════════════════════════════════════════╗
║                 CONTEXTO DE SUBAGENTES                                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   RECIBEN:                                                               ║
║   ├── Contexto pre-definido por orquestador                              ║
║   ├── Presupuesto asignado (típico: 10,000-30,000)                       ║
║   └── Lista explícita de archivos permitidos                             ║
║                                                                           ║
║   NO PUEDEN:                                                             ║
║   ├── Expandir contexto sin aprobación                                   ║
║   ├── Cargar archivos fuera de la lista                                  ║
║   └── Exceder presupuesto asignado                                       ║
║                                                                           ║
║   DEBEN:                                                                 ║
║   ├── Reportar si falta contexto (no cargarlo)                           ║
║   ├── Purgar contexto propio al terminar                                 ║
║   └── Devolver resultado compacto al orquestador                         ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 8. Métricas y Monitoreo

### 8.1 KPIs de Eficiencia

| Métrica | Objetivo | Alerta |
|---------|----------|--------|
| Tokens promedio/sesión | < 150,000 | > 180,000 |
| Compactaciones/sesión | < 1 | > 2 |
| % contexto utilizado | > 80% | < 50% |
| Tiempo carga inicial | < 5s | > 15s |

### 8.2 Logging Recomendado

```yaml
# Al inicio de tarea
log_entry:
  tipo: "INICIO_TAREA"
  tokens_actuales: {numero}
  contexto_cargado:
    - {archivo_1}: {tokens}
    - {archivo_2}: {tokens}

# Al purgar
log_entry:
  tipo: "PURGA"
  trigger: "{evento}"
  tokens_liberados: {numero}
  archivos_purgados:
    - {archivo_1}

# Al finalizar sesión
log_entry:
  tipo: "FIN_SESION"
  tokens_totales: {numero}
  compactaciones: {numero}
  proxima_accion_guardada: true/false
```

---

## 9. Integración con Flujo de 4 Fases

```
FASE 1: Claude Code (10% tokens = 20,000)
├── Cargar: CLAUDE.md + BOOTLOADER
├── Analizar tarea (lazy loading)
├── Generar plan de alto nivel
└── Purgar al delegar a Fase 2

FASE 2: Trae/Gemini (0% tokens Claude)
├── Recibe contexto del orquestador
├── Usa tokens propios (Gemini)
└── Devuelve plan atómico compacto

FASE 3: Windsurf (0% tokens Claude)
├── Recibe una tarea atómica
├── Ejecuta literalmente
└── Reporta resultado mínimo

FASE 4: Claude Code (15% tokens = 30,000)
├── Cargar solo archivos modificados
├── Validar cambios
├── Documentar y cerrar
└── Purgar contexto de tarea
```

---

## 10. Checklist de Cumplimiento

### Al Inicio de Sesión
- [ ] Verificar tokens disponibles
- [ ] Cargar solo L0 inicialmente
- [ ] Leer PROXIMA-ACCION.md si existe

### Durante Ejecución
- [ ] Monitorear uso de tokens
- [ ] Purgar contexto después de cada subtarea
- [ ] No cargar archivos "por si acaso"

### Al Finalizar
- [ ] Actualizar PROXIMA-ACCION.md
- [ ] Verificar todos los cambios commiteados
- [ ] Purgar contexto no persistente

### Antes de Compactación
- [ ] Guardar estado en PROXIMA-ACCION.md
- [ ] Commit y push pendientes
- [ ] Documentar punto de continuación

---

## 11. Referencias

- `@PRESUPUESTO-DINAMICO` - Cálculo adaptativo de tokens por complejidad (NUEVO)
- `@NEXUS` - Sistema de gestión de contexto
- `@IOC-CONTEXTO` - Inversión de control
- `@CONTEXT-MAP` - Mapa de resolución de contexto
- `@PROXIMA-ACCION` - Template de checkpoint
- `@AGENT-MATRIX` - Capacidades por agente
- `@ACTIVE-FILES` - Locks de archivos con tokens estimados
- `@BLOCKED-TASKS` - Escalada por presupuesto insuficiente

---

*SIMCO-MEMORIA-TOKENS.md - Gestión Optimizada de Memoria y Tokens*
*Parte del Sistema NEXUS v4.0*
