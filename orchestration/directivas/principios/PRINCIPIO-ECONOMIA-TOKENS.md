# PRINCIPIO: ECONOMÍA DE TOKENS

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** Todos los agentes
**Prioridad:** OBLIGATORIA para evitar errores de context overflow

---

## RESUMEN EJECUTIVO

> **Los agentes tienen límites de tokens. Excederlos = fallo de tarea.**
> Planificar con economía de tokens = tareas exitosas.
> Tareas grandes sin desglose = error garantizado.

---

## LÍMITES CRÍTICOS

```yaml
CONTEXTO_MAXIMO:
  entrada: ~200,000 tokens  # Lo que el agente puede "ver"
  salida: ~8,000 tokens     # Lo que puede generar por respuesta
  recomendado_carga: <50,000 tokens  # Para dejar espacio de trabajo

ARCHIVO_INDIVIDUAL:
  maximo_recomendado: 500 líneas (~2,000 tokens)
  ideal: 200-300 líneas (~1,000 tokens)
  alerta: >400 líneas → considerar división

PROMPT_DELEGACION:
  maximo: 3,000 tokens (~750 líneas de prompt)
  recomendado: 1,500 tokens (~375 líneas)
  minimo_efectivo: 500 tokens (~125 líneas)
```

---

## REGLAS DE ECONOMÍA

### Regla 1: Cargar Solo Lo Necesario

```yaml
MAL:
  - Cargar TODOS los archivos del proyecto
  - Leer archivos completos cuando solo necesitas una sección
  - Incluir documentación extendida en prompts de delegación

BIEN:
  - Cargar SOLO archivos relevantes para la tarea actual
  - Usar SIMCO-QUICK-REFERENCE.md en lugar de _INDEX.md completo
  - Referencias a archivos en vez de copiar contenido
```

### Regla 2: Desglosar Tareas Grandes

```yaml
TAREA_GRANDE (>2000 tokens de output esperado):
  - Dividir en subtareas independientes
  - Cada subtarea = máximo 1 archivo o 1 función
  - Secuenciar: crear → validar → siguiente

EJEMPLO_MALO:
  "Crear el módulo completo de usuarios con entity, service,
   controller, DTOs, tests, y documentación"
  # Esto generará >8000 tokens de salida = ERROR

EJEMPLO_BUENO:
  ST-001: Crear UserEntity alineada con DDL
  ST-002: Crear CreateUserDto y UpdateUserDto
  ST-003: Crear UserService con CRUD básico
  ST-004: Crear UserController con endpoints
  ST-005: Ejecutar build + lint
  # Cada una <2000 tokens = ÉXITO
```

### Regla 3: Prompts de Delegación Concisos

```yaml
INCLUIR:
  - Contexto mínimo necesario (nivel, variables críticas)
  - Tarea específica (1 cosa)
  - Criterios de aceptación (checklist corto)
  - 1-2 archivos de referencia máximo

NO INCLUIR:
  - Historia completa del proyecto
  - Documentación extendida
  - Múltiples opciones/alternativas
  - Código de ejemplo extenso (>50 líneas)
```

---

## ESTRATEGIAS DE DESGLOSE

### Por Capa (Vertical)

```yaml
# En lugar de: "Crear feature de notificaciones"
# Desglosar en:

ST-001_DATABASE:
  tarea: "Crear tabla notifications.notifications"
  output_esperado: ~300 tokens (1 archivo DDL)

ST-002_BACKEND_ENTITY:
  tarea: "Crear NotificationEntity"
  output_esperado: ~200 tokens (1 archivo)

ST-003_BACKEND_DTO:
  tarea: "Crear DTOs de Notification"
  output_esperado: ~300 tokens (2 archivos pequeños)

ST-004_BACKEND_SERVICE:
  tarea: "Crear NotificationService con CRUD"
  output_esperado: ~400 tokens (1 archivo)

ST-005_BACKEND_CONTROLLER:
  tarea: "Crear NotificationController con endpoints"
  output_esperado: ~350 tokens (1 archivo)

ST-006_VALIDACION:
  tarea: "Ejecutar build + lint backend"
  output_esperado: ~100 tokens (comandos)
```

### Por Funcionalidad (Horizontal)

```yaml
# En lugar de: "Implementar autenticación"
# Desglosar en:

ST-001: Verificar @CATALOG (¿existe auth?)
ST-002: Si existe → usar SIMCO-REUTILIZAR
ST-003: Si no existe → crear esquema auth (DDL)
ST-004: Crear AuthModule básico (register/login)
ST-005: Crear JWT strategy
ST-006: Crear guards
ST-007: Integrar en app.module
ST-008: Validar build + lint
```

---

## ESTIMACIÓN DE TOKENS

### Fórmula Rápida

```
tokens ≈ caracteres / 4
tokens ≈ palabras * 1.3
tokens ≈ líneas * 10 (código promedio)
```

### Tabla de Referencia

| Tipo de Archivo | Líneas Típicas | Tokens Estimados |
|-----------------|----------------|------------------|
| Entity simple | 30-50 | 300-500 |
| Entity con relaciones | 80-120 | 800-1200 |
| DTO | 20-40 | 200-400 |
| Service CRUD | 100-150 | 1000-1500 |
| Controller REST | 80-120 | 800-1200 |
| Tabla DDL | 30-60 | 300-600 |
| Componente React simple | 50-80 | 500-800 |
| Componente React complejo | 150-250 | 1500-2500 |
| Hook | 30-60 | 300-600 |

---

## DETECCIÓN DE PROBLEMAS

### Señales de Alerta

```yaml
ANTES_DE_EJECUTAR:
  - [ ] ¿La tarea pide crear >3 archivos? → Desglosar
  - [ ] ¿El prompt de delegación >1500 tokens? → Reducir
  - [ ] ¿Se pide "módulo completo"? → Desglosar por componente
  - [ ] ¿Se incluye código de referencia >50 líneas? → Usar referencia a archivo

DURANTE_EJECUCION:
  - [ ] ¿Respuesta truncada? → Tarea muy grande
  - [ ] ¿Error de context? → Demasiados archivos cargados
  - [ ] ¿Alucinaciones? → Contexto insuficiente o confuso
```

### Acciones Correctivas

```yaml
SI_RESPUESTA_TRUNCADA:
  1. Dividir tarea en 2-3 subtareas
  2. Re-ejecutar cada subtarea por separado
  3. Validar entre subtareas

SI_ERROR_CONTEXT:
  1. Descargar archivos no esenciales
  2. Usar SIMCO-QUICK-REFERENCE en lugar de _INDEX completo
  3. Referencias en lugar de contenido inline

SI_ALUCINACIONES:
  1. Verificar que archivos de referencia se cargaron
  2. Incluir más contexto específico (menos genérico)
  3. Ser más explícito en criterios de aceptación
```

---

## TEMPLATE DE DELEGACIÓN OPTIMIZADO

```yaml
# PROMPT OPTIMIZADO (~800 tokens)

## SUBAGENTE: {Tipo}
Nivel: {nivel} | Proyecto: {proyecto} | Ruta: {orchestration_path}

## TAREA ÚNICA
{Descripción en 1-2 oraciones}

## ESPECIFICACIÓN
{Solo lo necesario, máximo 10 líneas}

## REFERENCIA
- Archivo: `{ruta exacta}` (copiar patrón de líneas X-Y)

## CRITERIOS (máximo 5)
- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] {criterio 3}

## VALIDACIÓN
```bash
{1-2 comandos}
```

## ENTREGABLES
1. {archivo a crear/modificar}
```

---

## INTEGRACIÓN CON CAPVED

### Fase P (Planeación) - Verificar Tokens

```yaml
ANTES_DE_APROBAR_PLAN:
  - [ ] Cada subtarea genera <2000 tokens de output
  - [ ] Cada prompt de delegación <1500 tokens
  - [ ] No hay subtareas que pidan "módulo completo"
  - [ ] Subtareas son independientes (pueden fallar sin afectar otras)
```

### Fase E (Ejecución) - Monitorear

```yaml
DURANTE_EJECUCION:
  - Si subtarea falla por tokens → subdividir más
  - Si contexto insuficiente → cargar archivo específico
  - Si respuesta truncada → dividir y reintentar
```

---

## MÉTRICAS DE ÉXITO

```yaml
TAREA_BIEN_DESGLOSADA:
  - 0 errores de token overflow
  - 0 respuestas truncadas
  - Cada subtarea completa en 1 iteración
  - Build pasa después de cada subtarea

DELEGACION_OPTIMA:
  - Prompt <1500 tokens
  - Respuesta completa sin truncar
  - Criterios verificables cumplidos
  - Sin re-trabajo por malentendidos
```

---

## REFERENCIAS

- **Referencia rápida:** `SIMCO-QUICK-REFERENCE.md`
- **Delegación:** `SIMCO-DELEGACION.md`
- **Desglose de tareas:** `SIMCO-TAREA.md`

## Ver tambien

- [ESTANDAR-MEMORIA-TOKENS](../../../docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md) - Estandar de gestion de memoria y tokens para sesiones de agentes IA

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Principio Fundamental
