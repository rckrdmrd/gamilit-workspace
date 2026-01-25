# Checklist de Migracion v2 - [PROYECTO]

**Version:** 1.0.0
**Prefijo:** [PREFIJO]
**Fecha Inicio:** YYYY-MM-DD
**Fecha Completado:** 

---

## 1. Estructura de Carpetas

### Directorios Obligatorios
- [ ] docs/ existe
- [ ] docs/00-vision-general/ creado
- [ ] docs/90-transversal/ creado
- [ ] docs/90-transversal/inventarios/ creado
- [ ] docs/97-adr/ creado
- [ ] docs/archivados/ creado

### Directorios Opcionales
- [ ] docs/04-modelado/trazabilidad/ (si aplica)
- [ ] docs/95-guias-desarrollo/ (si aplica)
- [ ] docs/96-quick-reference/ (si aplica)

### Archivos Indice
- [ ] docs/_MAP.md actualizado
- [ ] docs/90-transversal/_MAP.md creado
- [ ] docs/97-adr/_MAP.md creado
- [ ] docs/archivados/_MAP.md creado

---

## 2. Trazabilidad

### Por cada Modulo/Epic
- [ ] TRACEABILITY.yml existe en implementacion/
- [ ] Formato actualizado a v2
- [ ] bidirectional_links agregados
- [ ] dependencies definidas

### Consolidacion
- [ ] TRACEABILITY-MASTER.yml creado
- [ ] Referencias a todos los modulos
- [ ] Grafo de dependencias entre epics

---

## 3. Inventarios

### Consolidacion
- [ ] Inventarios movidos a 90-transversal/inventarios/
- [ ] MASTER-INVENTORY.yml creado
- [ ] DATABASE-INVENTORY.yml creado (si aplica)
- [ ] BACKEND-INVENTORY.yml creado (si aplica)
- [ ] FRONTEND-INVENTORY.yml creado (si aplica)

---

## 4. Nomenclatura

### Mapeo de IDs
| ID v1 | ID v2 | Estado |
|-------|-------|--------|
| | | [ ] |

### Actualizacion de Referencias
- [ ] Todos los RF actualizados a [PREFIJO]-RF-XXX
- [ ] Todos los ET actualizados a [PREFIJO]-ET-XXX
- [ ] Todos los US actualizados a [PREFIJO]-US-XXX
- [ ] Todos los EP actualizados a [PREFIJO]-EP-XXX
- [ ] Referencias internas actualizadas
- [ ] _MAP.md files actualizados

---

## 5. Especificaciones

### Reorganizacion por Layer
- [ ] especificaciones/backend/ creado
- [ ] especificaciones/frontend/ creado
- [ ] especificaciones/database/ creado
- [ ] ET-* movidos a carpeta correspondiente

---

## 6. Git

### Repositorio
- [ ] Repositorio v2 creado en remote
- [ ] Branch main configurado
- [ ] .gitignore actualizado

### Commits
- [ ] Commit inicial de estructura
- [ ] Commit de migracion completado
- [ ] Push a remote exitoso

---

## 7. Validacion

### Scripts
- [ ] validate-structure.sh ejecutado
- [ ] validate-nomenclature.sh ejecutado
- [ ] validate-references.sh ejecutado

### Resultado
| Validacion | Resultado | Notas |
|------------|-----------|-------|
| Estructura | [ ] PASS | |
| Nomenclatura | [ ] PASS | |
| Referencias | [ ] PASS | |

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Fecha inicio | |
| Fecha fin | |
| Errores encontrados | |
| Errores resueltos | |
| Estado | [ ] COMPLETADO |

---

**Migrado por:** 
**Validado por:** 
