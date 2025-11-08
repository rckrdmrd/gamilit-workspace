# Índice de Análisis de Requerimientos BD - Fase 1

## Épica EAI-002: Actividades Básicas

**Análisis Completado:** 2025-11-03
**Agente:** SA-ANALISIS-DB-002
**Estado:** COMPLETADO 100%

---

## Archivos Generados

### 1. Especificación Completa
- **Archivo:** `req-EAI-002-actividades.json`
- **Tamaño:** 42 KB
- **Formato:** JSON estructurado
- **Contiene:**
  - 4 tablas críticas (37 columnas totales)
  - 2 vistas SQL
  - 9 funciones PL/SQL
  - 3 triggers
  - 14 índices
  - 40+ seed data entries
  - Validación de requerimientos
  - Notas de implementación

---

## Resumen de Requerimientos

### Tablas (4)
1. **activities** - Almacena todas las actividades con contenido JSONB polimórfico
2. **activity_attempts** - Registro de intentos de cada usuario
3. **activity_types** - Referencia de tipos de actividades
4. **module_progress** - Progreso de usuarios en módulos

### Vistas (2)
1. **activity_completion_status** - Estado de completitud por usuario
2. **module_progress_stats** - Estadísticas de progreso

### Funciones (9)
- fn_validate_multiple_choice
- fn_validate_true_false
- fn_validate_fill_blank
- fn_validate_drag_drop
- fn_validate_ordering
- fn_validate_matching
- fn_calculate_activity_score
- fn_get_next_activity
- fn_get_previous_activity

### Triggers (3)
- tr_activity_attempt_update_user_stats
- tr_activity_attempts_timestamp
- tr_module_progress_on_completion

---

## Historias de Usuario Analizadas (8/8)

- **US-ACT-001** - Opción Múltiple (6 SP)
- **US-ACT-002** - Verdadero/Falso (4 SP)
- **US-ACT-003** - Completar Texto (5 SP)
- **US-ACT-004** - Drag & Drop (8 SP)
- **US-ACT-005** - Ordenamiento (7 SP)
- **US-ACT-006** - Asociación (7 SP)
- **US-ACT-007** - Sistema Feedback (5 SP)
- **US-ACT-008** - Navegación (4 SP)

**Total:** 46 Story Points

---

## Características Clave

### 1. Contenido Polimórfico
La tabla `activities` usa JSONB para almacenar 6 tipos diferentes de mecánicas:
- Opción múltiple
- Verdadero/Falso
- Completar texto
- Drag & Drop
- Ordenamiento
- Asociación

### 2. Validación Específica
Cada tipo tiene su propia función de validación:
- Case-insensitive para texto libre
- Soporte de múltiples respuestas correctas
- Validación de secuencias y pares
- Normalización de inputs

### 3. Tracking Exhaustivo
- Cada intento se registra completamente
- Se almacena la respuesta completa del usuario
- Solo se otorgan recompensas en aciertos
- Auditoría completa de progreso

### 4. Navegación Lineal
- Orden secuencial dentro de módulos
- Funciones para navegación anterior/siguiente
- Cálculo dinámico de progreso
- Trigger automático para completar módulo

---

## Datos Iniciales (Seed Data)

### Cantidades por Tipo (Alcance Inicial)
- Opción Múltiple: 10+ actividades
- Verdadero/Falso: 10+ actividades
- Completar Texto: 5+ actividades
- Drag & Drop: 5+ actividades
- Ordenamiento: 5+ actividades
- Asociación: 5+ actividades

**Total:** 40+ actividades hardcodeadas

Cada tipo incluye ejemplo completo con estructura JSONB

---

## Recomendaciones Implementación

### Inmediatas (Alcance)
1. Crear tablas con constraints exactos especificados
2. Implementar funciones de validación en servicio NestJS
3. Crear triggers para auditoría automática
4. Cargar seed data en migraciones

### A Corto Plazo (Mes 2)
1. Añadir índices GIN para búsquedas textuales
2. Implementar materialización de vistas si performance lo requiere
3. Crear backups automáticos de activity_attempts

### A Futuro (Post-MVP)
1. Particionamiento de activity_attempts si crece >100M registros
2. Integración con EXT-017 (Content Management)
3. Índices especiales para analytics

---

## Notas de Diseño

### Decisiones Clave
- **JSONB para contenido:** Flexibilidad para múltiples tipos sin normalización extrema
- **UUID para IDs:** Distribuido y seguro
- **Constraint UNIQUE en (module_id, order):** Garantiza orden secuencial
- **Triggers para integridad:** Algunos datos se actualizan automáticamente

### Ambigüedades Resueltas
- Reintentos: ILIMITADOS, tracked en DB
- Recompensas: SOLO en primer acierto
- user_answer: Flexible JSONB por tipo
- Progreso módulo: 100% actividades correctas

---

## Próximas Fases

### Fase 2: Implementación
- [ ] Crear migraciones TypeORM
- [ ] Implementar ActivitiesService
- [ ] Crear endpoints REST
- [ ] Cargar seed data

### Fase 3: Testing
- [ ] Tests unitarios de validación
- [ ] Tests integración de DB
- [ ] Tests E2E de flujos completos
- [ ] Auditoría de performance

---

## Referencias

- **Documentación de épica:** `/docs/04-planificacion/01-alcance-inicial/EAI-002-actividades/`
- **Roadmap:** `/docs/04-planificacion/roadmap/`
- **Especificación técnica:** Ver req-EAI-002-actividades.json

---

**Generado por:** SA-ANALISIS-DB-002 (ATLAS-DATABASE)
**Fecha:** 2025-11-03
**Estado:** COMPLETADO
