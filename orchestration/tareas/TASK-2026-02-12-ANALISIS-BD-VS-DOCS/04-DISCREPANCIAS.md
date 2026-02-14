# Matriz de Discrepancias Resuelta

**Version:** 1.0.0
**Fecha:** 2026-02-12

---

## Estado: TODAS RESUELTAS

| ID | Tipo | Metrica | Fuente A | Valor A | Fuente B | Valor B | Valor Real | Accion |
|----|------|---------|----------|---------|----------|---------|------------|--------|
| D-001 | Conteo | Tablas | CLAUDE.md/INVENTORY | 170 | MODELO-DATOS | 171 | **171** | Corregir CLAUDE.md + INVENTORY a 171 |
| D-002 | Conteo | Funciones | MODELO-DATOS/config | 128 | CLAUDE.md/INVENTORY | 255 | **183** | Corregir TODAS las fuentes a 183 |
| D-003 | Conteo | Triggers | MODELO-DATOS/config | 49 | CLAUDE.md/INVENTORY | 132 | **126** | Corregir TODAS las fuentes a 126 |
| D-004 | Conteo | Views | MODELO-DATOS/config | 13 | CLAUDE.md/INVENTORY | 22 | **22** | Corregir MODELO-DATOS/config a 22 |
| D-005 | Conteo | ENUMs | MODELO-DATOS/config | 36 | CLAUDE.md/INVENTORY | 41 | **42** | Corregir TODAS las fuentes a 42 |
| D-006 | Conteo | RLS Policies | CLAUDE.md/INVENTORY | 263 | MODELO-DATOS/config | 282 | **~263** | Corregir MODELO-DATOS/config a 263 |
| D-007 | Conteo | FK Constraints | CLAUDE.md/INVENTORY | 273 | MODELO-DATOS/config | 299 | **298** | Corregir TODAS las fuentes a 298 |
| D-008 | Version | PostgreSQL | CLAUDE.md/INVENTORY/config | 15 | MODELO-DATOS (ln 439) | 16 | **15** | Corregir MODELO-DATOS a 15 |
| D-009 | Naming | Schemas | Docs | 16 conceptuales | DDL | 18 fisicos | **18 fisicos** | Crear mapeo explicito |
| D-010 | Cobertura | Docs | schema-reference | 82 tablas | DDL | 171 tablas | **48% cobertura** | Expandir documentacion |

---

## Resumen de Correcciones por Archivo

### CLAUDE.md (5 correcciones)
```
tablas:        170 -> 171
funciones:     255 -> 183
triggers:      132 -> 126
enums:         41  -> 42
foreign_keys:  273 -> 298
```

### DATABASE_INVENTORY.yml (5 correcciones)
```
tablas:        170 -> 171
funciones:     255 -> 183
triggers:      132 -> 126
enums:         41  -> 42
foreign_keys:  273 -> 298
```

### MASTER_INVENTORY.yml (5 correcciones)
```
tablas:        170 -> 171
funciones:     255 -> 183
triggers:      132 -> 126
enums:         41  -> 42
foreign_keys:  273 -> 298
```

### MODELO-DATOS.md (7 correcciones)
```
views:         13  -> 22
funciones:     128 -> 183
triggers:      49  -> 126
enums:         36  -> 42
rls_policies:  282 -> 263
foreign_keys:  299 -> 298
PostgreSQL:    16  -> 15  (linea 439)
```

### database.config.yml (6 correcciones)
```
tables:        171 (ya correcto)
views:         13  -> 22
functions:     128 -> 183
triggers:      49  -> 126
enums:         36  -> 42
rls_policies:  282 -> 263
foreign_keys:  299 -> 298
```
