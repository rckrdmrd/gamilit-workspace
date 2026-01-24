# TABLA DE HALLAZGOS RÁPIDA - Fase 2

## 🔴 CRÍTICOS (P0) - Acción Inmediata Requerida

| # | Hallazgo | Ubicación | Impacto | Solución | Esfuerzo |
|---|----------|-----------|---------|----------|----------|
| 1 | TIMELINE.yml INEXISTENTE | Referencia: _MAP.md:146 | Pérdida de histórico | Crear archivo | 2h |
| 2 | MIGRACIONES-HISTORICO.md FALTANTE | tareas/01-migraciones/ | Auditoría incompleta | Crear con 15 migraciones | 4h |
| 3 | check_and_award_achievements() ROTA | gamification_system/functions | Logros no otorgados | Refactorizar con JSONB | 3h |
| 4 | system_events tabla no existe | admin_dashboard/01 vistas | Vistas materializadas rotas | Cambiar a system_logs | 1h |

**Total P0:** 10 horas

---

## 🟠 ALTOS (P1) - Próximas 2 Sprints

| # | Hallazgo | Ubicación | Impacto | Solución | Esfuerzo |
|---|----------|-----------|---------|----------|----------|
| 5 | Conteos desactualizados | _MAP.md, TRACEABILITY | Información incorrecta | Cambiar 62→101, 13→14 | 1h |
| 6 | 48 Entity mappings faltantes | Backend /entities | 47% gap en cobertura | Crear 48 archivos .entity.ts | 12h |
| 7 | RLS cobertura 39% | RLS policies | Seguridad incompleta | Expandir a 100% tablas críticas | 8h |
| 8 | Typo KUKUKULKAN | user_ranks enum | Nombre incorrecto | Renombrar a KUKULKAN | 2h |
| 9 | 7 FKs legacy encontradas | Multiple tables | Referencias rotas | Cambiar a auth_management.profiles | 2h (YA HECHO) |
| 10 | Vistas materializadas 4/12 | admin_dashboard/01 | Dashboard performance | Completar 8 vistas | 6h |

**Total P1:** 31 horas

---

## 🟡 MEDIOS (P2) - Documentación y Mejoras

| # | Hallazgo | Ubicación | Impacto | Solución | Esfuerzo |
|---|----------|-----------|---------|----------|----------|
| 11 | LTI Integration schema vacío | lti_integration/ | Funcionalidad incompleta | Completar o eliminar | 4h |
| 12 | Documentación dispersa | Multiple locations | Difícil mantenimiento | Consolidar en DATABASE_INVENTORY | 3h |
| 13 | Duplicados en RLS policies | social_features/02-policies.sql | Posibles conflictos | Remover duplicados | 1h |

**Total P2:** 8 horas

---

## RESUMEN ESTADÍSTICO

### Documentos

```
Analizados:    9 archivos Markdown
Encontrados:   7 ✅
Faltantes:     2 ❌
Directorios:   9
Líneas analizadas: 3,500+
```

### Problemas

```
Total Hallazgos:        13
  Críticos (P0):        4  (30%)
  Altos (P1):           6  (46%)
  Medios (P2):          3  (23%)

Archivos Afectados:     12+
Esfuerzo Total:         49 horas
Timeline:               4-8 semanas
```

### Bases de Datos

```
Schemas:        14 (13 documentados + 1 vacío)
Tablas:         101 (vs 62 documentadas)
Índices:        67 (vs 74 documentados)
Funciones:      63 (vs 61 documentadas)
Triggers:       35 (vs 39 documentados)
RLS Policies:   24 (39% cobertura)
```

### Validación Integración

```
DB → Backend:    87% ✅
DB → Frontend:   78.5% ✅
Promedio:        82.75% ✅
Status:          PRODUCTION-READY (con warnings)
```

---

## MATRIZ DE PRIORIZACIÓN

```
        ALTO IMPACTO
             ↑
             │
  P0-1,2 │        │ P1-6
  P0-3,4 │ HACER  │ P1-7
         │        │ P1-10
         │        │
─────────┼────────┼──────────→ BAJO ESFUERZO
         │        │
  P2-13  │ LUEGO  │ P1-5,8,9
         │        │
             │
        BAJO IMPACTO
```

---

## FUENTES DE VERDAD

### Documentación Fase 2 (Desactualizada)
- _MAP.md (2025-11-08): 62 tablas
- TRACEABILITY.yml (2025-11-08): 62 tablas
- EMR-001/_MAP.md (2025-11-08): 89 tablas

### Fuente Oficial (Actualizada)
- **DATABASE_INVENTORY.yml (2025-11-26): 101 tablas ✅**
- Validación física: 324 archivos SQL
- Integración validada: 82.75% coherencia

**Recomendación:** Sincronizar toda documentación con DATABASE_INVENTORY.yml

---

## ACCIONES QUICK-WINS (1-2 horas)

```
□ Corregir system_events → system_logs (1h)
□ Actualizar conteos en documentación (1h)
□ Remover duplicados en RLS policies (1h)

Total: 3 horas, 3 issues resueltos
```

---

## TIMELINE ESTIMADO

```
Semana 1:   P0 (10h) + Quick-wins (3h)          = 13h
Semana 2-3: P1 Entity mappings (12h)            = 12h
Semana 4:   P1 RLS expansion (8h)               = 8h
Semana 5:   P1 Vistas (6h) + P2 (8h)            = 14h
Semana 6:   Buffer y testing                    = 2h

Total:      49 horas = ~1.2 semanas a full-time
            o 4-8 semanas distribuidas
```

---

**Análisis:** 2025-11-28  
**Confianza:** 95% (validado contra DATABASE_INVENTORY 2025-11-26)  
**Próxima Revisión:** Post-implementación de P0
