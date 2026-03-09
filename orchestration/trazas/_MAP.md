# Mapa de Contenidos: trazas

**Carpeta:** orchestration/trazas/
**Ultima actualizacion:** 2026-03-09

---

## Estructura

```
trazas/
├── _MAP.md                                      # [ESTE ARCHIVO]
├── _INDEX.yml                                   # Indice de todas las trazas
├── LESSONS-LEARNED.yml                          # Lecciones aprendidas del proyecto
├── TRAZA-BUGS.md                                # Registro de bugs encontrados
├── TRAZA-REQUERIMIENTOS.md                      # Trazabilidad de requerimientos
├── TRAZA-TAREAS-BACKEND.md                      # Trazas de tareas backend
├── TRAZA-TAREAS-DATABASE.md                     # Trazas de tareas database
├── TRAZA-TAREAS-FRONTEND.md                     # Trazas de tareas frontend
├── ANALISIS-2026-02-17-CONSOLIDADO.md           # 4 analisis transversales fusionados
├── PLAN-DESARROLLO-ACTUALIZADO.md               # Plan de desarrollo actualizado
├── REPORTE-INTEGRAL-2026-01-20.md               # Reporte integral del proyecto
├── auditoria-ux/                                # Auditorias de UX y consistencia (4 archivos)
│   ├── AUDITORIA-CONSISTENCIA-FE-BE-DB.md
│   ├── AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md
│   ├── AUDITORIA-P0-RESULTADOS.md
│   └── AUDITORIA-RESIDUAL-FULL.md
└── correcciones-historicas/                     # Analisis de errores e issues criticos (3 archivos)
    ├── _MAP.md
    ├── ANALISIS-ERROR-404-PROGRESS-MODULES.md
    └── BACKEND-CRITICAL-ISSUES-PENDING.md
```

---

## Archivos por Categoria

### Indices y Referencias
| Archivo | Proposito |
|---------|-----------|
| _INDEX.yml | Indice maestro de trazas |
| LESSONS-LEARNED.yml | Lecciones aprendidas consolidadas |

### Trazas por Dominio (Activas)
| Archivo | Dominio |
|---------|---------|
| TRAZA-TAREAS-DATABASE.md | Database/DDL |
| TRAZA-TAREAS-FRONTEND.md | Frontend/React |
| TRAZA-TAREAS-BACKEND.md | Backend/NestJS |

### Trazas de Referencia
| Archivo | Proposito |
|---------|-----------|
| TRAZA-BUGS.md | Registro historico de bugs |
| TRAZA-REQUERIMIENTOS.md | Trazabilidad de requerimientos |
| ANALISIS-2026-02-17-CONSOLIDADO.md | Analisis transversal agentes (inventario, IoC, matriz, validacion) |
| PLAN-DESARROLLO-ACTUALIZADO.md | Plan de desarrollo actualizado |
| REPORTE-INTEGRAL-2026-01-20.md | Reporte integral del proyecto |

### Subdirectorio: auditoria-ux/
| Archivo | Proposito |
|---------|-----------|
| AUDITORIA-CONSISTENCIA-FE-BE-DB.md | Auditoria de consistencia entre capas |
| AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md | Auditoria fase 1 de calidad de flujos |
| AUDITORIA-P0-RESULTADOS.md | Resultados de auditoria P0 |
| AUDITORIA-RESIDUAL-FULL.md | Auditoria residual completa |

### Subdirectorio: correcciones-historicas/
| Archivo | Proposito |
|---------|-----------|
| _MAP.md | Mapa del subdirectorio |
| ANALISIS-ERROR-404-PROGRESS-MODULES.md | Analisis de error 404 en modulos de progreso |
| BACKEND-CRITICAL-ISSUES-PENDING.md | Issues criticos pendientes del backend |

---

## Historial

| Fecha | Cambio |
|-------|--------|
| 2026-03-09 | Cleanup: actualizado para reflejar archivos reales en disco (agregados PLAN-DESARROLLO, REPORTE-INTEGRAL, subdirectorios auditoria-ux/ y correcciones-historicas/) |
| 2026-02-26 | Consolidado 4 analisis 2026-02-17 en 1 archivo. Eliminado _archive/ (3 archivos historicos, recuperables via git) |
| 2026-01-24 | Limpieza: 12 archivos movidos a _archive/trazas/ |

---

*Estandar: SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
