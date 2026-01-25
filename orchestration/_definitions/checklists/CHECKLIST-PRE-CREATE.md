# CHECKLIST: PRE-CREATE

**Versión:** 1.0.0
**Alias:** @DEF_CHK_CREATE
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0

---

## PROPÓSITO

Verificaciones obligatorias ANTES de crear cualquier objeto nuevo (tabla, entity, service, componente, etc.).

---

## CHECKLIST

### 1. Verificación Anti-Duplicación

```markdown
[ ] Buscar en catálogo compartido (shared/catalog/CATALOG-INDEX.yml)
[ ] Buscar en inventario del proyecto (orchestration/inventarios/)
[ ] Buscar archivos similares con nombre parecido
[ ] Buscar funcionalidad similar en módulos existentes
[ ] Confirmar que NO existe funcionalidad equivalente
```

### 2. Verificación de Dependencias

```markdown
[ ] Identificar de qué depende el nuevo objeto
[ ] Verificar que las dependencias existen
[ ] Si depende de DDL: tabla existe en base de datos
[ ] Si depende de entity: entity existe en backend
[ ] Si depende de endpoint: endpoint existe y funciona
```

### 3. Verificación de Ubicación

```markdown
[ ] Identificar módulo/carpeta correcta según estándares
[ ] Verificar que la ruta sigue convenciones del proyecto
[ ] Confirmar que no hay conflicto de nombres
[ ] Verificar permisos de escritura en la ubicación
```

### 4. Verificación de Nomenclatura

```markdown
[ ] Nombre sigue convenciones del proyecto
[ ] Nombre es descriptivo y no ambiguo
[ ] Prefijos/sufijos correctos según tipo de archivo
[ ] Formato de archivo correcto (PascalCase, kebab-case, etc.)
```

### 5. Verificación de Coherencia

```markdown
[ ] Nuevo objeto es coherente con arquitectura existente
[ ] No introduce acoplamiento innecesario
[ ] Sigue patrones establecidos del proyecto
[ ] No duplica responsabilidades de otros objetos
```

---

## DECISIÓN

```yaml
SI_PASA_TODO:
  accion: "Proceder con creación"
  siguiente: "Ejecutar SIMCO-CREAR.md"

SI_FALLA_DUPLICACION:
  accion: "DETENER - Evaluar uso del existente"
  opciones:
    - "Usar objeto existente"
    - "Extender objeto existente"
    - "Justificar creación de nuevo (documentar razón)"

SI_FALLA_DEPENDENCIA:
  accion: "DETENER - Resolver dependencia primero"
  opciones:
    - "Delegar creación de dependencia"
    - "Crear dependencia primero"
    - "Replanificar orden de tareas"

SI_FALLA_NOMENCLATURA:
  accion: "Corregir nombre antes de crear"
  consultar: "@SIMCO/SIMCO-NOMENCLATURA.md"
```

---

## USO

```yaml
# En perfil de agente:
antes_de_crear:
  - Cargar: "@DEF_CHK_CREATE"
  - Ejecutar: "Checklist completo"
  - Documentar: "Resultado en traza"
```

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Checklist
