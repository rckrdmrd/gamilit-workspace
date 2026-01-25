# Mapa de Contenidos: directivas

**Carpeta:** orchestration/directivas/
**Archivos:** 11
**Ultima actualizacion:** 2026-01-24

---

## Estructura

```
directivas/
├── _MAP.md                                      # [ESTE ARCHIVO]
├── DIRECTIVA-AUTOMATIZACION-VALIDACION-RUTAS.md # Validacion automatica de rutas API
├── DIRECTIVA-DISENO-BASE-DATOS.md               # Diseno de BD PostgreSQL
├── DIRECTIVA-ESTANDARES-API-ROUTES.md           # Estandares de rutas API
├── DIRECTIVA-ESTANDARES-TESTING-API.md          # Estandares de testing API
├── DIRECTIVA-ESTRUCTURA-REFERENCIAS.md          # Estructura de referencias
├── DIRECTIVA-NOMENCLATURA-COMPLETA.md           # Nomenclatura de archivos
├── DIRECTIVA-PITFALLS-API-ROUTES.md             # Errores comunes en rutas API
├── DIRECTIVA-POLITICA-CARGA-LIMPIA.md           # Politica de carga limpia
├── DIRECTIVA-RECREACION-BD.md                   # Recreacion de base de datos
├── DIRECTIVA-SINCRONIZACION-WORKSPACES.md       # Sincronizacion entre workspaces
└── DIRECTIVA-TRAZABILIDAD-REFERENCIAS.md        # Trazabilidad de referencias
```

---

## Directivas por Categoria

### Base de Datos
| Directiva | Proposito |
|-----------|-----------|
| DIRECTIVA-DISENO-BASE-DATOS.md | Estandares de diseno PostgreSQL |
| DIRECTIVA-RECREACION-BD.md | Procedimiento de recreacion de BD |

### API y Backend
| Directiva | Proposito |
|-----------|-----------|
| DIRECTIVA-ESTANDARES-API-ROUTES.md | Estandares de rutas API |
| DIRECTIVA-ESTANDARES-TESTING-API.md | Estandares de testing |
| DIRECTIVA-AUTOMATIZACION-VALIDACION-RUTAS.md | Validacion automatica |
| DIRECTIVA-PITFALLS-API-ROUTES.md | Errores comunes a evitar |

### Documentacion y Referencias
| Directiva | Proposito |
|-----------|-----------|
| DIRECTIVA-NOMENCLATURA-COMPLETA.md | Nomenclatura de archivos |
| DIRECTIVA-ESTRUCTURA-REFERENCIAS.md | Estructura de referencias |
| DIRECTIVA-TRAZABILIDAD-REFERENCIAS.md | Trazabilidad |

### Operaciones
| Directiva | Proposito |
|-----------|-----------|
| DIRECTIVA-POLITICA-CARGA-LIMPIA.md | Carga limpia de contexto |
| DIRECTIVA-SINCRONIZACION-WORKSPACES.md | Sincronizacion multi-workspace |

---

## Herencia

Las directivas SIMCO del workspace (`workspace-v2/orchestration/directivas/simco/`)
se heredan automaticamente. Estas son directivas **adicionales** especificas de gamilit.

---

*Reestructurado el 2026-01-24*
*Estandar: SIMCO-ESTANDAR-ORCHESTRATION v1.0.0*
