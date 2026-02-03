# Mapa de Navegacion - Sistema de Recompensas

## Descripcion

Documentacion del sistema de recompensas y gamificacion del proyecto Gamilit. Este sistema gestiona la asignacion de XP, ML Coins, misiones y rangos Maya tanto para ejercicios auto-evaluables (M1, M2) como para ejercicios con revision manual del profesor (M3, M4, M5).

---

## Contenido

| # | Archivo | Descripcion | Estado |
|---|---------|-------------|--------|
| 0 | [00-INVENTARIO-CAMBIOS.md](./00-INVENTARIO-CAMBIOS.md) | Inventario completo de cambios realizados al sistema (v2.8.0) | Completo |
| 1 | [01-ARQUITECTURA-SISTEMA.md](./01-ARQUITECTURA-SISTEMA.md) | Arquitectura del sistema de recompensas, Dual-Table Pattern | Completo |
| 2 | [02-FLUJO-END-TO-END.md](./02-FLUJO-END-TO-END.md) | Flujo A (autocorregibles) y Flujo B (revision manual) | Completo |
| 3a | [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md) | Documentacion de endpoints API relacionados | Completo |
| 3b | [03-FLUJO-VALIDACION-MAESTRO-M3-M5.md](./03-FLUJO-VALIDACION-MAESTRO-M3-M5.md) | Flujo de validacion manual para ejercicios M3-M5 | Completo |
| 4 | [04-DATABASE-SCHEMA.md](./04-DATABASE-SCHEMA.md) | Esquema de base de datos, triggers y funciones | Completo |
| 5 | [05-TEST-RESULTS.md](./05-TEST-RESULTS.md) | Resultados de pruebas end-to-end | Completo |
| 6 | [06-SEEDS-Y-DATOS-INICIALES.md](./06-SEEDS-Y-DATOS-INICIALES.md) | Seeds y datos iniciales del sistema | Completo |
| 7 | [07-CORRECCION-SISTEMA-MISIONES.md](./07-CORRECCION-SISTEMA-MISIONES.md) | Correccion de sistema de misiones earn_xp | Completo |
| - | [README.md](./README.md) | Indice general y guia de navegacion | Completo |

---

## Flujos de Evaluacion

### Flujo A: Auto-evaluables (M1, M2)

```
Estudiante completa ejercicio
    |
    v
exercise_attempts (INSERT)
    |
    v
TRIGGER: trg_update_user_stats_on_exercise
    |
    v
XP y ML Coins otorgados INMEDIATAMENTE
```

### Flujo B: Revision Manual (M3, M4, M5)

```
Estudiante completa ejercicio
    |
    v
exercise_submissions (INSERT, status='submitted')
    |
    v
Mensaje: "Enviado para revision del maestro"
    |
    v (ESPERA)
    |
Maestro califica en /teacher/reviews
    |
    v
exercise_submissions (UPDATE, status='graded')
    |
    v
TRIGGER: trg_update_user_stats_on_submission
    |
    v
XP y ML Coins otorgados POST-EVALUACION
```

---

## Comparacion M1-M2 vs M3-M5

| Aspecto | M1-M2 (Automatico) | M3-M5 (Manual) |
|---------|-------------------|----------------|
| Tabla principal | exercise_attempts | exercise_submissions |
| Trigger evento | AFTER INSERT | AFTER UPDATE |
| Cuando se otorga XP | Inmediato | Cuando maestro califica |
| Reintentos | Ilimitados | 1 entrega |
| Portal Teacher | No aplica | /teacher/reviews |

---

## Documentacion Relacionada

### Ejercicios por Modulo
- [RF-M3-001](../../02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M3-001-ejercicios-m3.md) - Ejercicios Modulo 3 (5 tipos, todos manuales)
- [RF-M4-001](../../02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M4-001-ejercicios-m4.md) - Ejercicios Modulo 4 (4 manuales + 1 auto)
- [RF-M5-001](../../02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M5-001-ejercicios-m5.md) - Ejercicios Modulo 5 (3 tipos, todos manuales)

### Portal de Maestros
- [EXT-001](../../03-fase-extensiones/EXT-001-portal-maestros/_MAP.md) - Portal de Maestros (epica)
- [RESPONSES-M3-M5](../../03-fase-extensiones/EXT-001-portal-maestros/paginas/RESPONSES-M3-M5.md) - Pagina de respuestas M3-M5
- [US-PM-003b](../../03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/US-PM-003b-grading-interface.md) - Interfaz de calificacion

### Gamificacion
- [EAI-003](../../01-fase-alcance-inicial/EAI-003-gamificacion/_MAP.md) - Sistema de Gamificacion
- [RF-GAM-004](../../01-fase-alcance-inicial/EAI-003-gamificacion/requerimientos/RF-GAM-004-economia-ml-coins.md) - Economia ML Coins

---

## Referencias
- [Directorio padre](../_MAP.md)
- [README del sistema](./README.md)

---

*Ultima actualizacion: 2026-01-07*
*Version: 2.8.0*
